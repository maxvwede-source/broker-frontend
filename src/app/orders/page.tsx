"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Order } from "@/lib/types";

function OrdersSkeleton() {
  return (
    <div className="p-6 max-w-[1000px] mx-auto">
      <div className="skeleton h-6 w-20 mb-6" />
      <div className="flex gap-2 mb-5"><div className="skeleton h-8 w-20" /><div className="skeleton h-8 w-20" /></div>
      <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => (<div key={i} className="grid grid-cols-7 gap-3">{Array.from({ length: 7 }).map((_, j) => (<div key={j} className="skeleton h-4 w-full" />))}</div>))}</div>
    </div>
  );
}

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [openOrders, setOpenOrders] = useState<Order[]>([]);
  const [history, setHistory] = useState<Order[]>([]);
  const [tab, setTab] = useState<"open" | "history">("open");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    Promise.all([api.getOpenOrders().then(setOpenOrders).catch(() => {}), api.getOrderHistory().then(setHistory).catch(() => {})])
      .finally(() => setLoading(false));
  }, [user]);

  const cancel = async (id: string) => { await api.cancelOrder(id); setOpenOrders((o) => o.filter((x) => x.id !== id)); };
  const orders = tab === "open" ? openOrders : history;

  if (loading) return <OrdersSkeleton />;

  return (
    <div className="p-6 max-w-[1000px] mx-auto overflow-auto">
      <h1 className="text-xl font-bold mb-6 text-broker-text-primary">Orders</h1>
      <div className="flex gap-1 mb-5">
        {(["open", "history"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`text-sm capitalize ${tab === t ? "bg-broker-surface text-broker-text-primary" : "bg-transparent text-broker-text-muted"}`}>
            {t} {t === "open" && `(${openOrders.length})`}
          </button>
        ))}
      </div>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-broker-border text-broker-text-muted">
            <th className="text-left px-3 py-2 font-medium">Pair</th>
            <th className="text-left px-3 py-2 font-medium">Side</th>
            <th className="text-left px-3 py-2 font-medium">Type</th>
            <th className="text-right px-3 py-2 font-medium">Price</th>
            <th className="text-right px-3 py-2 font-medium">Qty</th>
            <th className="text-right px-3 py-2 font-medium">Filled</th>
            <th className="text-left px-3 py-2 font-medium">Status</th>
            <th className="text-left px-3 py-2 font-medium">Date</th>
            {tab === "open" && <th className="text-left px-3 py-2 font-medium"></th>}
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-broker-border">
              <td className="px-3 py-2.5">{o.pair}</td>
              <td className="px-3 py-2.5"><span className={o.side === "buy" ? "text-broker-green" : "text-broker-red"}>{o.side.toUpperCase()}</span></td>
              <td className="px-3 py-2.5 capitalize">{o.type.replace("_", " ")}</td>
              <td className="px-3 py-2.5 text-right font-mono">{o.price ? (Number(o.price) / 100).toFixed(2) : "-"}</td>
              <td className="px-3 py-2.5 text-right font-mono">{(Number(o.quantity) / 1e8).toFixed(5)}</td>
              <td className="px-3 py-2.5 text-right font-mono">{((Number(o.filled) / Number(o.quantity)) * 100).toFixed(1)}%</td>
              <td className="px-3 py-2.5"><span className={o.status === "filled" ? "text-broker-green" : o.status === "cancelled" ? "text-broker-text-muted" : "text-broker-yellow"}>{o.status}</span></td>
              <td className="px-3 py-2.5 text-broker-text-muted text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
              {tab === "open" && <td className="px-3 py-2.5"><button onClick={() => cancel(o.id)} className="bg-transparent text-broker-red px-2 py-0.5 text-xs hover:bg-transparent">Cancel</button></td>}
            </tr>
          ))}
          {orders.length === 0 && <tr><td colSpan={tab === "open" ? 10 : 9} className="p-8 text-center text-broker-text-muted">No {tab} orders</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
