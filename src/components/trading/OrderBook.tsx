"use client";
import type { OrderBook as OB } from "@/lib/types";

export default function OrderBook({ book, pair }: { book: OB | null; pair: string }) {
  const asks = book?.asks?.slice(-15).reverse() || [];
  const bids = book?.bids?.slice(0, 15) || [];
  const maxAskVol = Math.max(...asks.map(a => Number(a.quantity)), 1);
  const maxBidVol = Math.max(...bids.map(b => Number(b.quantity)), 1);
  const bestBid = bids[0]?.price || "0";
  const bestAsk = asks[0]?.price || "0";

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", fontSize: 11, background: "#131722" }}>
      <div style={{
        padding: "6px 10px", borderBottom: "1px solid #2a2e39",
        fontSize: 10, color: "#787b86", fontWeight: 500,
        letterSpacing: "0.5px", textTransform: "uppercase",
      }}>
        Order Book
      </div>
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
        padding: "4px 10px", color: "#787b86", fontSize: 10,
        borderBottom: "1px solid #2a2e39",
      }}>
        <span>Price</span>
        <span style={{ textAlign: "right" }}>Qty</span>
        <span style={{ textAlign: "right" }}>Total</span>
      </div>
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {/* Asks */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          {asks.map((a, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
              padding: "1px 10px", position: "relative",
            }}>
              <div style={{
                position: "absolute", right: 0, top: 0, height: "100%",
                width: `${(Number(a.quantity) / maxAskVol) * 100}%`,
                background: "rgba(242,54,69,0.1)",
                transition: "width 0.2s",
              }} />
              <span className="mono" style={{ color: "#f23645", zIndex: 1, fontSize: 11 }}>
                {(Number(a.price) / 100).toFixed(2)}
              </span>
              <span className="mono" style={{ textAlign: "right", zIndex: 1, fontSize: 10 }}>
                {(Number(a.quantity) / 1e8).toFixed(5)}
              </span>
              <span className="mono" style={{ textAlign: "right", color: "#787b86", zIndex: 1, fontSize: 10 }}>
                {(Number(a.price) * Number(a.quantity) / 1e10).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Spread */}
        <div style={{
          padding: "4px 10px", borderTop: "1px solid #2a2e39",
          borderBottom: "1px solid #2a2e39",
          display: "flex", justifyContent: "space-between",
          background: "#1e222d",
        }}>
          <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: "#d1d4dc" }}>
            {(Number(bestBid) / 100).toFixed(2)}
          </span>
          <span style={{ color: "#787b86", fontSize: 10 }}>
            Spread: {((Number(bestAsk) - Number(bestBid)) / 100).toFixed(2)}
          </span>
        </div>

        {/* Bids */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          {bids.map((b, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
              padding: "1px 10px", position: "relative",
            }}>
              <div style={{
                position: "absolute", right: 0, top: 0, height: "100%",
                width: `${(Number(b.quantity) / maxBidVol) * 100}%`,
                background: "rgba(8,153,129,0.1)",
                transition: "width 0.2s",
              }} />
              <span className="mono" style={{ color: "#089981", zIndex: 1, fontSize: 11 }}>
                {(Number(b.price) / 100).toFixed(2)}
              </span>
              <span className="mono" style={{ textAlign: "right", zIndex: 1, fontSize: 10 }}>
                {(Number(b.quantity) / 1e8).toFixed(5)}
              </span>
              <span className="mono" style={{ textAlign: "right", color: "#787b86", zIndex: 1, fontSize: 10 }}>
                {(Number(b.price) * Number(b.quantity) / 1e10).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
