"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Wallet, Deposit, Withdrawal } from "@/lib/types";

export default function WalletsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [newAddr, setNewAddr] = useState("");
  const [wdAddr, setWdAddr] = useState("");
  const [wdAmt, setWdAmt] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    Promise.all([
      api.wallets().then(d => setWallets(d.wallets || [])),
      api.transactions().then(d => {
        setDeposits(d.deposits || []);
        setWithdrawals(d.withdrawals || []);
      }),
    ]).finally(() => setLoading(false));
  }, [user]);

  const genAddress = async () => {
    const res = await api.depositAddress();
    setNewAddr(res.address);
  };

  const withdraw = async () => {
    if (!wdAddr || !wdAmt) return;
    try {
      const res = await api.withdraw(wdAddr, Number(wdAmt));
      alert(`Withdrawal requested — ${res.id.slice(0, 8)}...`);
      setWdAddr(""); setWdAmt("");
    } catch (e: any) {
      alert(e.message || "Withdrawal failed");
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>;

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Wallets</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
        {wallets.map(w => (
          <div key={w.id} style={{
            background: "var(--bg-secondary)", borderRadius: 8,
            border: "1px solid var(--border)", padding: 16,
          }}>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>BTC Wallet</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{(Number(w.balance) / 1e8).toFixed(8)}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8, wordBreak: "break-all" }}>
              {w.address}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
        <div style={{ background: "var(--bg-secondary)", borderRadius: 8, border: "1px solid var(--border)", padding: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Deposit</h2>
          <button onClick={genAddress} className="btn-primary" style={{ width: "100%", marginBottom: 8 }}>
            Generate Deposit Address
          </button>
          {newAddr && (
            <div style={{
              background: "var(--bg-primary)", padding: 12, borderRadius: 4,
              fontSize: 12, wordBreak: "break-all", marginTop: 8,
            }}>
              {newAddr}
            </div>
          )}
        </div>

        <div style={{ background: "var(--bg-secondary)", borderRadius: 8, border: "1px solid var(--border)", padding: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Withdraw</h2>
          <div style={{ marginBottom: 10 }}>
            <input type="text" value={wdAddr} onChange={e => setWdAddr(e.target.value)}
              placeholder="BTC Address" style={{ width: "100%" }} />
          </div>
          <div style={{ marginBottom: 10 }}>
            <input type="number" value={wdAmt} onChange={e => setWdAmt(e.target.value)}
              placeholder="Amount (BTC)" style={{ width: "100%" }} />
          </div>
          <button onClick={withdraw} className="btn-sell" style={{ width: "100%" }}>
            Withdraw
          </button>
        </div>
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Transaction History</h2>
      <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
        {deposits.length + withdrawals.length} transactions
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}>
            <th style={{ textAlign: "left", padding: "8px 12px" }}>Type</th>
            <th style={{ textAlign: "left", padding: "8px 12px" }}>Amount</th>
            <th style={{ textAlign: "left", padding: "8px 12px" }}>Address</th>
            <th style={{ textAlign: "left", padding: "8px 12px" }}>Status</th>
            <th style={{ textAlign: "left", padding: "8px 12px" }}>Date</th>
          </tr>
        </thead>
        <tbody>
          {deposits.map(d => (
            <tr key={d.txid} style={{ borderBottom: "1px solid var(--border)" }}>
              <td style={{ padding: "10px 12px" }}><span style={{ color: "var(--green)" }}>Deposit</span></td>
              <td style={{ padding: "10px 12px" }}>{(Number(d.amount) / 1e8).toFixed(8)} BTC</td>
              <td style={{ padding: "10px 12px", fontSize: 11, wordBreak: "break-all" }}>{d.address}</td>
              <td style={{ padding: "10px 12px" }}>{d.status}</td>
              <td style={{ padding: "10px 12px", color: "var(--text-muted)" }}>{new Date(d.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
          {withdrawals.map(w => (
            <tr key={w.id} style={{ borderBottom: "1px solid var(--border)" }}>
              <td style={{ padding: "10px 12px" }}><span style={{ color: "var(--red)" }}>Withdrawal</span></td>
              <td style={{ padding: "10px 12px" }}>{(Number(w.amount) / 1e8).toFixed(8)} BTC</td>
              <td style={{ padding: "10px 12px", fontSize: 11, wordBreak: "break-all" }}>{w.address}</td>
              <td style={{ padding: "10px 12px" }}>{w.status}</td>
              <td style={{ padding: "10px 12px", color: "var(--text-muted)" }}>{new Date(w.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
