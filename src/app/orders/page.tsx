"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Order } from "@/lib/types";

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [openOrders, setOpenOrders] = useState<Order[]>([]);
  const [history, setHistory] = useState<Order[]>([]);
  const [tab, setTab] = useState<"open" | "history">("open");

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    api.getOpenOrders().then(setOpenOrders).catch(() => {});
    api.getOrderHistory().then(setHistory).catch(() => {});
  }, [user]);

  const cancel = async (id: string) => {
    await api.cancelOrder(id);
    setOpenOrders(o => o.filter(x => x.id !== id));
  };

  const orders = tab === "open" ? openOrders : history;

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Orders</h1>
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {(["open", "history"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="btn-secondary"
            style={{
              background: tab === t ? "var(--bg-card)" : "transparent",
              color: tab === t ? "var(--text-primary)" : "var(--text-muted)",
              textTransform: "capitalize",
            }}>
            {t} {t === "open" && `(${openOrders.length})`}
          </button>
        ))}
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}>
            <th style={{ textAlign: "left", padding: "8px 12px" }}>Pair</th>
            <th style={{ textAlign: "left", padding: "8px 12px" }}>Side</th>
            <th style={{ textAlign: "left", padding: "8px 12px" }}>Type</th>
            <th style={{ textAlign: "right", padding: "8px 12px" }}>Price</th>
            <th style={{ textAlign: "right", padding: "8px 12px" }}>Qty</th>
            <th style={{ textAlign: "right", padding: "8px 12px" }}>Filled</th>
            <th style={{ textAlign: "left", padding: "8px 12px" }}>Status</th>
            <th style={{ textAlign: "left", padding: "8px 12px" }}>Date</th>
            {tab === "open" && <th style={{ textAlign: "left", padding: "8px 12px" }}></th>}
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id} style={{ borderBottom: "1px solid var(--border)" }}>
              <td style={{ padding: "10px 12px" }}>{o.pair}</td>
              <td style={{ padding: "10px 12px" }}>
                <span style={{ color: o.side === "buy" ? "var(--green)" : "var(--red)" }}>
                  {o.side.toUpperCase()}
                </span>
              </td>
              <td style={{ padding: "10px 12px", textTransform: "capitalize" }}>{o.type.replace("_", " ")}</td>
              <td style={{ padding: "10px 12px", textAlign: "right" }}>
                {o.price ? (Number(o.price) / 100).toFixed(2) : "-"}
              </td>
              <td style={{ padding: "10px 12px", textAlign: "right" }}>
                {(Number(o.quantity) / 1e8).toFixed(5)}
              </td>
              <td style={{ padding: "10px 12px", textAlign: "right" }}>
                {((Number(o.filled) / Number(o.quantity)) * 100).toFixed(1)}%
              </td>
              <td style={{ padding: "10px 12px" }}>
                <span style={{
                  color: o.status === "filled" ? "var(--green)" :
                         o.status === "cancelled" ? "var(--text-muted)" : "var(--yellow)",
                }}>{o.status}</span>
              </td>
              <td style={{ padding: "10px 12px", color: "var(--text-muted)", fontSize: 12 }}>
                {new Date(o.createdAt).toLocaleDateString()}
              </td>
              {tab === "open" && (
                <td style={{ padding: "10px 12px" }}>
                  <button onClick={() => cancel(o.id)}
                    style={{ background: "transparent", color: "var(--red)", padding: "2px 8px", fontSize: 12 }}>
                    Cancel
                  </button>
                </td>
              )}
            </tr>
          ))}
          {orders.length === 0 && (
            <tr><td colSpan={9} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
              No {tab} orders
            </td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
