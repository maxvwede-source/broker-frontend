"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { ApiKey } from "@/lib/types";

function ApiKeysSkeleton() {
  return (
    <div className="p-6 max-w-[800px] mx-auto">
      <div className="skeleton h-6 w-24 mb-6" />
      <div className="skeleton h-32 w-full mb-6 rounded-lg" />
      <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => (<div key={i} className="grid grid-cols-4 gap-3">{Array.from({ length: 4 }).map((_, j) => (<div key={j} className="skeleton h-4 w-full" />))}</div>))}</div>
    </div>
  );
}

export default function ApiKeysPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [name, setName] = useState("");
  const [perms, setPerms] = useState("read");
  const [newKey, setNewKey] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    api.getApiKeys().then((d) => setKeys(d.apiKeys || [])).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const create = async () => {
    if (!name) return;
    try { const res = await api.createApiKey(name, perms); setNewKey(res.key); setKeys((k) => [...k, { id: res.id, name, permissions: perms, lastUsed: null, createdAt: new Date().toISOString() }]); setName(""); }
    catch (e: any) { alert(e.message || "Failed to create key"); }
  };

  const del = async (id: string) => { await api.deleteApiKey(id); setKeys((k) => k.filter((x) => x.id !== id)); };

  if (loading) return <ApiKeysSkeleton />;

  return (
    <div className="p-6 max-w-[800px] mx-auto overflow-auto">
      <h1 className="text-xl font-bold mb-6 text-broker-text-primary">API Keys</h1>
      {newKey && (
        <div className="bg-[#1a2e1a] border border-broker-green rounded-lg p-4 mb-5">
          <div className="text-sm font-semibold mb-2 text-broker-green">Save this key now - it will not be shown again</div>
          <div className="bg-broker-bg p-3 rounded text-xs break-all font-mono text-broker-text-primary">{newKey}</div>
        </div>
      )}
      <div className="bg-broker-card rounded-lg border border-broker-border p-5 mb-6">
        <h2 className="text-base font-semibold mb-3 text-broker-text-primary">Create API Key</h2>
        <div className="flex gap-2.5 mb-2.5">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Key name" className="flex-1" aria-label="API key name" />
          <select value={perms} onChange={(e) => setPerms(e.target.value)} className="w-[140px]" aria-label="Key permissions">
            <option value="read">Read Only</option><option value="trade">Trade</option><option value="withdraw">Withdraw</option><option value="all">Full Access</option>
          </select>
        </div>
        <button onClick={create} className="btn-primary">Create Key</button>
      </div>
      <table className="w-full border-collapse text-sm">
        <thead><tr className="border-b border-broker-border text-broker-text-muted"><th className="text-left px-3 py-2 font-medium">Name</th><th className="text-left px-3 py-2 font-medium">Permissions</th><th className="text-left px-3 py-2 font-medium">Last Used</th><th className="text-left px-3 py-2 font-medium">Created</th><th></th></tr></thead>
        <tbody>{keys.map((k) => (
          <tr key={k.id} className="border-b border-broker-border">
            <td className="px-3 py-2.5 font-medium text-broker-text-primary">{k.name}</td>
            <td className="px-3 py-2.5 capitalize">{k.permissions}</td>
            <td className="px-3 py-2.5 text-broker-text-muted">{k.lastUsed ? new Date(k.lastUsed).toLocaleDateString() : "Never"}</td>
            <td className="px-3 py-2.5 text-broker-text-muted">{new Date(k.createdAt).toLocaleDateString()}</td>
            <td className="px-3 py-2.5"><button onClick={() => del(k.id)} className="bg-transparent text-broker-red px-2 py-0.5 text-xs hover:bg-transparent">Delete</button></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}
