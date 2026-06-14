"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Wallet, Deposit, Withdrawal } from "@/lib/types";

function WalletsSkeleton() {
  return (
    <div className="p-6 max-w-[1000px] mx-auto">
      <div className="skeleton h-6 w-24 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {[1, 2].map((i) => (
          <div key={i} className="bg-broker-card rounded-lg border border-broker-border p-4 space-y-3">
            <div className="skeleton h-3 w-20" />
            <div className="skeleton h-7 w-40" />
            <div className="skeleton h-3 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

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
      api.wallets().then((d) => setWallets(d.wallets || [])),
      api.transactions().then((d) => { setDeposits(d.deposits || []); setWithdrawals(d.withdrawals || []); }),
    ]).finally(() => setLoading(false));
  }, [user]);

  const genAddress = async () => { const res = await api.depositAddress(); setNewAddr(res.address); };
  const withdraw = async () => {
    if (!wdAddr || !wdAmt) return;
    try { const res = await api.withdraw(wdAddr, Number(wdAmt)); alert(`Withdrawal requested \u2014 ${res.id.slice(0, 8)}...`); setWdAddr(""); setWdAmt(""); }
    catch (e: any) { alert(e.message || "Withdrawal failed"); }
  };

  if (loading) return <WalletsSkeleton />;

  return (
    <div className="p-6 max-w-[1000px] mx-auto overflow-auto">
      <h1 className="text-xl font-bold mb-6 text-broker-text-primary">Wallets</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {wallets.map((w) => (
          <div key={w.id} className="bg-broker-card rounded-lg border border-broker-border p-4">
            <div className="text-sm text-broker-text-muted mb-1">BTC Wallet</div>
            <div className="text-2xl font-bold text-broker-text-primary font-mono">{(Number(w.balance) / 1e8).toFixed(8)}</div>
            <div className="text-xs text-broker-text-muted mt-2 break-all font-mono">{w.address}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-broker-card rounded-lg border border-broker-border p-4">
          <h2 className="text-base font-semibold mb-3 text-broker-text-primary">Deposit</h2>
          <button onClick={genAddress} className="btn-primary w-full mb-2">Generate Deposit Address</button>
          {newAddr && <div className="bg-broker-bg p-3 rounded text-xs break-all mt-2 font-mono text-broker-text-primary">{newAddr}</div>}
        </div>
        <div className="bg-broker-card rounded-lg border border-broker-border p-4">
          <h2 className="text-base font-semibold mb-3 text-broker-text-primary">Withdraw</h2>
          <div className="mb-2.5"><input type="text" value={wdAddr} onChange={(e) => setWdAddr(e.target.value)} placeholder="BTC Address" className="w-full" aria-label="BTC withdrawal address" /></div>
          <div className="mb-2.5"><input type="number" value={wdAmt} onChange={(e) => setWdAmt(e.target.value)} placeholder="Amount (BTC)" className="w-full" aria-label="Withdrawal amount in BTC" /></div>
          <button onClick={withdraw} className="btn-sell w-full">Withdraw</button>
        </div>
      </div>
      <h2 className="text-base font-semibold mb-3 text-broker-text-primary">Transaction History</h2>
      <div className="text-sm text-broker-text-muted mb-4">{deposits.length + withdrawals.length} transactions</div>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-broker-border text-broker-text-muted">
            <th className="text-left px-3 py-2 font-medium">Type</th>
            <th className="text-left px-3 py-2 font-medium">Amount</th>
            <th className="text-left px-3 py-2 font-medium">Address</th>
            <th className="text-left px-3 py-2 font-medium">Status</th>
            <th className="text-left px-3 py-2 font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {deposits.map((d) => (
            <tr key={d.txid} className="border-b border-broker-border">
              <td className="px-3 py-2.5"><span className="text-broker-green font-medium">Deposit</span></td>
              <td className="px-3 py-2.5 font-mono">{(Number(d.amount) / 1e8).toFixed(8)} BTC</td>
              <td className="px-3 py-2.5 text-xs break-all font-mono text-broker-text-secondary">{d.address}</td>
              <td className="px-3 py-2.5">{d.status}</td>
              <td className="px-3 py-2.5 text-broker-text-muted">{new Date(d.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
          {withdrawals.map((w) => (
            <tr key={w.id} className="border-b border-broker-border">
              <td className="px-3 py-2.5"><span className="text-broker-red font-medium">Withdrawal</span></td>
              <td className="px-3 py-2.5 font-mono">{(Number(w.amount) / 1e8).toFixed(8)} BTC</td>
              <td className="px-3 py-2.5 text-xs break-all font-mono text-broker-text-secondary">{w.address}</td>
              <td className="px-3 py-2.5">{w.status}</td>
              <td className="px-3 py-2.5 text-broker-text-muted">{new Date(w.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
