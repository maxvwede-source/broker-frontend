"use client";
import { useState } from "react";
import { api } from "@/lib/api";

export default function OrderForm() {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [type, setType] = useState("limit");
  const [price, setPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [total, setTotal] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const priceFromTotal = (total: string, qty: string) => {
    if (Number(qty) > 0) return (Number(total) / Number(qty)).toFixed(2);
    return "";
  };

  const handleSubmit = async () => {
    setLoading(true); setMsg("");
    try {
      const body: Record<string, unknown> = { pair: "BTC-USD", side, type };
      if (type === "limit" || type === "stop_loss_limit") body.price = Number(price);
      if (type.startsWith("stop_loss")) body.stopPrice = Number(stopPrice);
      body.quantity = Number(quantity);
      const res = await api.createOrder(body);
      setMsg(`${res.status === "filled" ? "Filled" : "Order placed"} — ${res.id.slice(0, 8)}...`);
    } catch (e: any) {
      setMsg(e?.message || "Order failed");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        <button onClick={() => setSide("buy")} className="btn-buy"
          style={{ flex: 1, opacity: side === "buy" ? 1 : 0.5, borderRadius: "4px 0 0 4px" }}>
          Buy
        </button>
        <button onClick={() => setSide("sell")} className="btn-sell"
          style={{ flex: 1, opacity: side === "sell" ? 1 : 0.5, borderRadius: "0 4px 4px 0" }}>
          Sell
        </button>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
        {["limit", "market", "stop_loss_limit", "stop_loss_market"].map(t => (
          <button key={t} onClick={() => setType(t)}
            style={{
              flex: 1, padding: "6px 4px", fontSize: 11, fontWeight: 500,
              background: type === t ? "var(--bg-card)" : "transparent",
              color: type === t ? "var(--text-primary)" : "var(--text-muted)",
              borderRadius: 4,
            }}>
            {t === "stop_loss_limit" ? "SLL" : t === "stop_loss_market" ? "SLM" :
             t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {type !== "market" && (
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
            Price (USD)
          </label>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)}
            placeholder="0.00" style={{ width: "100%" }} />
        </div>
      )}

      {type.startsWith("stop_loss") && (
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
            Stop Price (USD)
          </label>
          <input type="number" value={stopPrice} onChange={e => setStopPrice(e.target.value)}
            placeholder="0.00" style={{ width: "100%" }} />
        </div>
      )}

      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
          Quantity (BTC)
        </label>
        <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)}
          placeholder="0.00" style={{ width: "100%" }} />
      </div>

      {type === "limit" && (
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
            Total (USD)
          </label>
          <input type="number" value={total} onChange={e => {
            setTotal(e.target.value);
            setPrice(priceFromTotal(e.target.value, quantity));
          }} placeholder="0.00" style={{ width: "100%" }} />
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
        <span>Available: <span style={{ color: "var(--text-primary)" }}>0.00 BTC</span></span>
        <span>Total: <span style={{ color: "var(--text-primary)" }}>$0.00</span></span>
      </div>

      <button onClick={handleSubmit} disabled={loading}
        className={side === "buy" ? "btn-buy" : "btn-sell"}
        style={{ width: "100%", padding: 12, fontSize: 15 }}>
        {loading ? "Processing..." : `${side === "buy" ? "Buy" : "Sell"} BTC`}
      </button>

      {msg && (
        <div style={{ marginTop: 8, fontSize: 12, color: msg.includes("failed") ? "var(--red)" : "var(--green)", textAlign: "center" }}>
          {msg}
        </div>
      )}
    </div>
  );
}
