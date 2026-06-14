"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { AdminUser, AdminStats, AuditLog } from "@/lib/types";

function AdminSkeleton() {
  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <div className="skeleton h-6 w-28 mb-6" />
      <div className="grid grid-cols-4 gap-3 mb-6">{Array.from({ length: 4 }).map((_, i) => (<div key={i} className="skeleton h-24 rounded-lg" />))}</div>
      <div className="flex gap-2 mb-5"><div className="skeleton h-8 w-20" /><div className="skeleton h-8 w-24" /><div className="skeleton h-8 w-16" /></div>
      <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => (<div key={i} className="grid grid-cols-4 gap-3">{Array.from({ length: 4 }).map((_, j) => (<div key={j} className="skeleton h-4 w-full" />))}</div>))}</div>
    </div>
  );
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "admin") { router.push("/trade"); return; }
    Promise.all([api.adminUsers().then(setUsers).catch(() => {}), api.adminStats().then(setStats).catch(() => {}), api.adminAuditLog().then(setLogs).catch(() => {}), api.adminWithdrawals().then(setWithdrawals).catch(() => {})])
      .finally(() => setLoading(false));
  }, [user]);

  const setRole = async (id: string, role: string) => { await api.adminSetRole(id, role); setUsers((u) => u.map((x) => (x.id === id ? { ...x, role } : x))); };
  const approve = async (id: string) => { await api.approveWithdrawal(id); setWithdrawals((w) => w.filter((x) => x.id !== id)); };

  if (loading) return <AdminSkeleton />;

  return (
    <div className="p-6 max-w-[1100px] mx-auto overflow-auto">
      <h1 className="text-xl font-bold mb-6 text-broker-text-primary">Admin Panel</h1>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[["Users", stats.users], ["Orders", stats.orders], ["Trades", stats.trades], ["Pairs", stats.pairs]].map(([label, val]) => (
            <div key={label} className="bg-broker-card rounded-lg border border-broker-border p-4 text-center">
              <div className="text-xs text-broker-text-muted mb-1">{label}</div>
              <div className="text-2xl font-bold text-broker-text-primary">{val}</div>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-1 mb-5">
        {(["users", "withdrawals", "audit"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`text-sm capitalize ${tab === t ? "bg-broker-surface text-broker-text-primary" : "bg-transparent text-broker-text-muted"}`}>{t}</button>
        ))}
      </div>
      {tab === "users" && (
        <table className="w-full border-collapse text-sm">
          <thead><tr className="border-b border-broker-border text-broker-text-muted"><th className="text-left px-3 py-2 font-medium">Email</th><th className="text-left px-3 py-2 font-medium">Role</th><th className="text-left px-3 py-2 font-medium">Created</th><th></th></tr></thead>
          <tbody>{users.map((u) => (
            <tr key={u.id} className="border-b border-broker-border">
              <td className="px-3 py-2.5">{u.email}</td>
              <td className="px-3 py-2.5 capitalize">{u.role}</td>
              <td className="px-3 py-2.5 text-broker-text-muted text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
              <td className="px-3 py-2.5"><select value={u.role} onChange={(e) => setRole(u.id, e.target.value)} className="text-xs px-2 py-1" aria-label={`Change role for ${u.email}`}><option value="user">User</option><option value="admin">Admin</option></select></td>
            </tr>
          ))}</tbody>
        </table>
      )}
      {tab === "withdrawals" && (
        <table className="w-full border-collapse text-sm">
          <thead><tr className="border-b border-broker-border text-broker-text-muted"><th className="text-left px-3 py-2 font-medium">User</th><th className="text-left px-3 py-2 font-medium">Address</th><th className="text-right px-3 py-2 font-medium">Amount</th><th className="text-left px-3 py-2 font-medium">Status</th><th className="text-left px-3 py-2 font-medium">Date</th><th></th></tr></thead>
          <tbody>{withdrawals.map((w) => (
            <tr key={w.id} className="border-b border-broker-border">
              <td className="px-3 py-2.5">{w.userEmail}</td>
              <td className="px-3 py-2.5 text-xs break-all font-mono text-broker-text-secondary">{w.address}</td>
              <td className="px-3 py-2.5 text-right font-mono">{(Number(w.amount) / 1e8).toFixed(5)} BTC</td>
              <td className="px-3 py-2.5">{w.status}</td>
              <td className="px-3 py-2.5 text-broker-text-muted text-xs">{new Date(w.createdAt).toLocaleDateString()}</td>
              <td className="px-3 py-2.5">{w.status === "pending" && <button onClick={() => approve(w.id)} className="btn-primary px-3 py-1 text-xs">Approve</button>}</td>
            </tr>
          ))}</tbody>
        </table>
      )}
      {tab === "audit" && (
        <table className="w-full border-collapse text-xs">
          <thead><tr className="border-b border-broker-border text-broker-text-muted"><th className="text-left px-3 py-2 font-medium">Action</th><th className="text-left px-3 py-2 font-medium">Resource</th><th className="text-left px-3 py-2 font-medium">User</th><th className="text-left px-3 py-2 font-medium">IP</th><th className="text-left px-3 py-2 font-medium">Date</th></tr></thead>
          <tbody>{logs.map((l) => (
            <tr key={l.id} className="border-b border-broker-border">
              <td className="px-3 py-2">{l.action}</td>
              <td className="px-3 py-2">{l.resource}</td>
              <td className="px-3 py-2 text-broker-text-muted">{l.user?.email || l.userId?.slice(0, 8) || "-"}</td>
              <td className="px-3 py-2 text-broker-text-muted">{l.ip || "-"}</td>
              <td className="px-3 py-2 text-broker-text-muted">{new Date(l.createdAt).toLocaleString()}</td>
            </tr>
          ))}</tbody>
        </table>
      )}
    </div>
  );
}
