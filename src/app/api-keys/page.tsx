"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { ApiKey } from "@/lib/types";

export default function ApiKeysPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [name, setName] = useState("");
  const [perms, setPerms] = useState("read");
  const [newKey, setNewKey] = useState("");

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    api.getApiKeys().then(d => setKeys(d.apiKeys || [])).catch(() => {});
  }, [user]);

  const create = async () => {
    if (!name) return;
    try {
      const res = await api.createApiKey(name, perms);
      setNewKey(res.key);
      setKeys(k => [...k, { id: res.id, name, permissions: perms, lastUsed: null, createdAt: new Date().toISOString() }]);
      setName("");
    } catch (e: any) {
      alert(e.message || "Failed to create key");
    }
  };

  const del = async (id: string) => {
    await api.deleteApiKey(id);
    setKeys(k => k.filter(x => x.id !== id));
  };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>API Keys</h1>

      {newKey && (
        <div style={{
          background: "#1a2e1a", border: "1px solid var(--green)",
          borderRadius: 8, padding: 16, marginBottom: 20,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--green)" }}>
            Save this key now — it will not be shown again
          </div>
          <div style={{
            background: "var(--bg-primary)", padding: 12, borderRadius: 4,
            fontSize: 12, wordBreak: "break-all", fontFamily: "monospace",
          }}>
            {newKey}
          </div>
        </div>
      )}

      <div style={{
        background: "var(--bg-secondary)", borderRadius: 8,
        border: "1px solid var(--border)", padding: 20, marginBottom: 24,
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Create API Key</h2>
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="Key name" style={{ flex: 1 }} />
          <select value={perms} onChange={e => setPerms(e.target.value)}
            style={{ width: 140 }}>
            <option value="read">Read Only</option>
            <option value="trade">Trade</option>
            <option value="withdraw">Withdraw</option>
            <option value="all">Full Access</option>
          </select>
        </div>
        <button onClick={create} className="btn-primary">Create Key</button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}>
            <th style={{ textAlign: "left", padding: "8px 12px" }}>Name</th>
            <th style={{ textAlign: "left", padding: "8px 12px" }}>Permissions</th>
            <th style={{ textAlign: "left", padding: "8px 12px" }}>Last Used</th>
            <th style={{ textAlign: "left", padding: "8px 12px" }}>Created</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {keys.map(k => (
            <tr key={k.id} style={{ borderBottom: "1px solid var(--border)" }}>
              <td style={{ padding: "10px 12px", fontWeight: 500 }}>{k.name}</td>
              <td style={{ padding: "10px 12px", textTransform: "capitalize" }}>{k.permissions}</td>
              <td style={{ padding: "10px 12px", color: "var(--text-muted)" }}>
                {k.lastUsed ? new Date(k.lastUsed).toLocaleDateString() : "Never"}
              </td>
              <td style={{ padding: "10px 12px", color: "var(--text-muted)" }}>
                {new Date(k.createdAt).toLocaleDateString()}
              </td>
              <td style={{ padding: "10px 12px" }}>
                <button onClick={() => del(k.id)}
                  style={{ background: "transparent", color: "var(--red)", padding: "2px 8px", fontSize: 12 }}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
