"use client";
import { useState } from "react";
import { api } from "@/lib/api";

export default function OrderForm({ pair }: { pair: string }) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [type, setType] = useState("limit");
  const [price, setPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [total, setTotal] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSubmit = async () => {
    setLoading(true); setMsg("");
    try {
      const body: Record<string, unknown> = { pair, side, type };
      if (type === "limit" || type === "stop_loss_limit") body.price = Number(price);
      if (type.startsWith("stop_loss")) body.stopPrice = Number(stopPrice);
      body.quantity = Number(quantity);
      const res = await api.createOrder(body);
      setMsg(`✓ ${res.status === "filled" ? "Filled" : "Open"} — ${res.id.slice(0, 8)}...`);
    } catch (e: any) {
      setMsg(`✗ ${e?.message || "Failed"}`);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 12, background: "#131722" }}>
      {/* Buy/Sell toggle */}
      <div style={{ display: "flex", gap: 0, marginBottom: 10 }}>
        <button onClick={() => setSide("buy")}
          style={{
            flex: 1, padding: "6px 0", fontSize: 12, fontWeight: 600,
            background: side === "buy" ? "#089981" : "transparent",
            color: side === "buy" ? "#fff" : "#787b86",
            borderRadius: "3px 0 0 3px",
            border: "1px solid",
            borderColor: side === "buy" ? "#089981" : "#2a2e39",
          }}>
          Buy
        </button>
        <button onClick={() => setSide("sell")}
          style={{
            flex: 1, padding: "6px 0", fontSize: 12, fontWeight: 600,
            background: side === "sell" ? "#f23645" : "transparent",
            color: side === "sell" ? "#fff" : "#787b86",
            borderRadius: "0 3px 3px 0",
            border: "1px solid",
            borderColor: side === "sell" ? "#f23645" : "#2a2e39",
          }}>
          Sell
        </button>
      </div>

      {/* Order type */}
      <div style={{ display: "flex", gap: 2, marginBottom: 8 }}>
        {["limit", "market"].map(t => (
          <button key={t} onClick={() => setType(t)}
            style={{
              flex: 1, padding: "3px 0", fontSize: 10, fontWeight: 500,
              background: type === t ? "#2a2e39" : "transparent",
              color: type === t ? "#d1d4dc" : "#787b86",
              borderRadius: 2, textTransform: "capitalize",
            }}>
            {t}
          </button>
        ))}
      </div>

      {type !== "market" && (
        <div style={{ marginBottom: 6 }}>
          <label style={{ fontSize: 10, color: "#787b86", display: "block", marginBottom: 2 }}>
            Price (USD)
          </label>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)}
            placeholder="0.00" style={{ width: "100%", padding: "5px 8px", fontSize: 12 }} />
        </div>
      )}

      <div style={{ marginBottom: 6 }}>
        <label style={{ fontSize: 10, color: "#787b86", display: "block", marginBottom: 2 }}>
          Quantity (BTC)
        </label>
        <input type="number" value={quantity} onChange={e => {
          setQuantity(e.target.value);
          if (type === "limit" && price && e.target.value)
            setTotal((Number(price) * Number(e.target.value)).toFixed(2));
        }} placeholder="0.00" style={{ width: "100%", padding: "5px 8px", fontSize: 12 }} />
      </div>

      {type === "limit" && (
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontSize: 10, color: "#787b86", display: "block", marginBottom: 2 }}>
            Total (USD)
          </label>
          <input type="number" value={total} onChange={e => {
            setTotal(e.target.value);
            if (Number(e.target.value) > 0 && Number(quantity) > 0)
              setPrice((Number(e.target.value) / Number(quantity)).toFixed(2));
          }} placeholder="0.00" style={{ width: "100%", padding: "5px 8px", fontSize: 12 }} />
        </div>
      )}

      <button onClick={handleSubmit} disabled={loading}
        style={{
          width: "100%", padding: "8px 0", fontSize: 13, fontWeight: 600,
          background: side === "buy" ? "#089981" : "#f23645",
          color: "#fff", borderRadius: 3, marginBottom: 4,
        }}>
        {loading ? "..." : `${side === "buy" ? "Buy" : "Sell"} ${pair.split("-")[0]}`}
      </button>

      {msg && (
        <div style={{ fontSize: 10, color: msg.includes("✓") ? "#089981" : "#f23645", textAlign: "center" }}>
          {msg}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#787b86", marginTop: 6 }}>
        <span>Bal: 0.00</span>
        <span>Eq: $0.00</span>
      </div>
    </div>
  );
}
