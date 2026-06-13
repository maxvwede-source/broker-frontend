"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { connectDepth } from "@/lib/ws";
import type { OrderBook as OB } from "@/lib/types";

const PAIR = "BTC-USD";

export default function OrderBook() {
  const [book, setBook] = useState<OB | null>(null);

  useEffect(() => {
    api.depth(PAIR).then(setBook).catch(() => {});
    const cleanup = connectDepth(PAIR, (data) => {
      if (data.type === "depth_snapshot" || data.type === "depth_update")
        setBook(data);
    });
    return () => cleanup();
  }, []);

  const asks = book?.asks?.slice(-15).reverse() || [];
  const bids = book?.bids?.slice(0, 15) || [];
  const maxAskVol = Math.max(...asks.map(a => Number(a.quantity)), 1);
  const maxBidVol = Math.max(...bids.map(b => Number(b.quantity)), 1);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", fontSize: 12 }}>
      <div style={{
        padding: "8px 12px", borderBottom: "1px solid var(--border)",
        fontWeight: 600, fontSize: 14, color: "var(--text-primary)",
      }}>
        Order Book
      </div>
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
        padding: "6px 12px", color: "var(--text-muted)", fontSize: 11,
        borderBottom: "1px solid var(--border)",
      }}>
        <span>Price (USD)</span>
        <span style={{ textAlign: "right" }}>Qty (BTC)</span>
        <span style={{ textAlign: "right" }}>Total</span>
      </div>
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, overflow: "hidden" }}>
          {asks.map((a, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
              padding: "2px 12px", position: "relative",
              cursor: "pointer",
            }}>
              <div style={{
                position: "absolute", right: 0, top: 0, height: "100%",
                width: `${(Number(a.quantity) / maxAskVol) * 100}%`,
                background: "rgba(246,70,93,0.12)",
              }} />
              <span style={{ color: "var(--red)", zIndex: 1 }}>
                {(Number(a.price) / 100).toFixed(2)}
              </span>
              <span style={{ textAlign: "right", zIndex: 1 }}>
                {(Number(a.quantity) / 1e8).toFixed(5)}
              </span>
              <span style={{ textAlign: "right", color: "var(--text-muted)", zIndex: 1 }}>
                {(Number(a.price) * Number(a.quantity) / 1e10).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div style={{
          padding: "6px 12px", borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", fontSize: 14,
        }}>
          <span style={{ fontWeight: 700 }}>{(Number(book?.bids?.[0]?.price || 0) / 100).toFixed(2)}</span>
          <span style={{ color: "var(--text-muted)", fontSize: 12 }}>~{PAIR.replace("-", "/")}</span>
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          {bids.map((b, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
              padding: "2px 12px", position: "relative",
              cursor: "pointer",
            }}>
              <div style={{
                position: "absolute", right: 0, top: 0, height: "100%",
                width: `${(Number(b.quantity) / maxBidVol) * 100}%`,
                background: "rgba(14,203,129,0.12)",
              }} />
              <span style={{ color: "var(--green)", zIndex: 1 }}>
                {(Number(b.price) / 100).toFixed(2)}
              </span>
              <span style={{ textAlign: "right", zIndex: 1 }}>
                {(Number(b.quantity) / 1e8).toFixed(5)}
              </span>
              <span style={{ textAlign: "right", color: "var(--text-muted)", zIndex: 1 }}>
                {(Number(b.price) * Number(b.quantity) / 1e10).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
