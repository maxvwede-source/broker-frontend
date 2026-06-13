"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { AdminUser, AdminStats, AuditLog } from "@/lib/types";

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  useEffect(() => {
    if (!user || user.role !== "admin") { router.push("/"); return; }
    Promise.all([
      api.adminUsers().then(setUsers).catch(() => {}),
      api.adminStats().then(setStats).catch(() => {}),
      api.adminAuditLog().then(setLogs).catch(() => {}),
      api.adminWithdrawals().then(setWithdrawals).catch(() => {}),
    ]);
  }, [user]);

  const setRole = async (id: string, role: string) => {
    await api.adminSetRole(id, role);
    setUsers(u => u.map(x => x.id === id ? { ...x, role } : x));
  };

  const approve = async (id: string) => {
    await api.approveWithdrawal(id);
    setWithdrawals(w => w.filter(x => x.id !== id));
  };

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Admin Panel</h1>

      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            ["Users", stats.users],
            ["Orders", stats.orders],
            ["Trades", stats.trades],
            ["Pairs", stats.pairs],
          ].map(([label, val]) => (
            <div key={label} style={{
              background: "var(--bg-secondary)", borderRadius: 8,
              border: "1px solid var(--border)", padding: 16, textAlign: "center",
            }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{val}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {(["users", "withdrawals", "audit"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="btn-secondary"
            style={{
              background: tab === t ? "var(--bg-card)" : "transparent",
              color: tab === t ? "var(--text-primary)" : "var(--text-muted)",
              textTransform: "capitalize",
            }}>
            {t}
          </button>
        ))}
      </div>

      {tab === "users" && (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}>
              <th style={{ textAlign: "left", padding: "8px 12px" }}>Email</th>
              <th style={{ textAlign: "left", padding: "8px 12px" }}>Role</th>
              <th style={{ textAlign: "left", padding: "8px 12px" }}>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "10px 12px" }}>{u.email}</td>
                <td style={{ padding: "10px 12px", textTransform: "capitalize" }}>{u.role}</td>
                <td style={{ padding: "10px 12px", color: "var(--text-muted)", fontSize: 12 }}>
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <select value={u.role} onChange={e => setRole(u.id, e.target.value)}
                    style={{ fontSize: 12, padding: "4px 8px" }}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === "withdrawals" && (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}>
              <th style={{ textAlign: "left", padding: "8px 12px" }}>User</th>
              <th style={{ textAlign: "left", padding: "8px 12px" }}>Address</th>
              <th style={{ textAlign: "right", padding: "8px 12px" }}>Amount</th>
              <th style={{ textAlign: "left", padding: "8px 12px" }}>Status</th>
              <th style={{ textAlign: "left", padding: "8px 12px" }}>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map(w => (
              <tr key={w.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "10px 12px" }}>{w.userEmail}</td>
                <td style={{ padding: "10px 12px", fontSize: 11, wordBreak: "break-all" }}>{w.address}</td>
                <td style={{ padding: "10px 12px", textAlign: "right" }}>
                  {(Number(w.amount) / 1e8).toFixed(5)} BTC
                </td>
                <td style={{ padding: "10px 12px" }}>{w.status}</td>
                <td style={{ padding: "10px 12px", color: "var(--text-muted)", fontSize: 12 }}>
                  {new Date(w.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: "10px 12px" }}>
                  {w.status === "pending" && (
                    <button onClick={() => approve(w.id)} className="btn-primary"
                      style={{ padding: "4px 12px", fontSize: 12 }}>
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === "audit" && (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}>
              <th style={{ textAlign: "left", padding: "8px 12px" }}>Action</th>
              <th style={{ textAlign: "left", padding: "8px 12px" }}>Resource</th>
              <th style={{ textAlign: "left", padding: "8px 12px" }}>User</th>
              <th style={{ textAlign: "left", padding: "8px 12px" }}>IP</th>
              <th style={{ textAlign: "left", padding: "8px 12px" }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(l => (
              <tr key={l.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "8px 12px" }}>{l.action}</td>
                <td style={{ padding: "8px 12px" }}>{l.resource}</td>
                <td style={{ padding: "8px 12px", color: "var(--text-muted)" }}>
                  {l.user?.email || l.userId?.slice(0, 8) || "-"}
                </td>
                <td style={{ padding: "8px 12px", color: "var(--text-muted)" }}>{l.ip || "-"}</td>
                <td style={{ padding: "8px 12px", color: "var(--text-muted)" }}>
                  {new Date(l.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
