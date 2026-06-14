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
    setLoading(true);
    setMsg("");
    try {
      const body: Record<string, unknown> = { pair, side, type };
      if (type === "limit" || type === "stop_loss_limit")
        body.price = Number(price);
      if (type.startsWith("stop_loss")) body.stopPrice = Number(stopPrice);
      body.quantity = Number(quantity);
      const res = await api.createOrder(body);
      setMsg(
        `\u2713 ${res.status === "filled" ? "Filled" : "Open"} \u2014 ${res.id.slice(0, 8)}...`,
      );
    } catch (e: any) {
      setMsg(`\u2717 ${e?.message || "Failed"}`);
    }
    setLoading(false);
  };

  const isBuy = side === "buy";

  return (
    <div className="p-3 bg-broker-bg">
      {/* Buy/Sell toggle */}
      <div className="flex gap-0 mb-2.5">
        <button
          onClick={() => setSide("buy")}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-l border ${
            isBuy
              ? "bg-broker-green text-white border-broker-green"
              : "bg-transparent text-broker-text-secondary border-broker-border"
          }`}
          aria-pressed={isBuy}
        >
          Buy
        </button>
        <button
          onClick={() => setSide("sell")}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-r border ${
            !isBuy
              ? "bg-broker-red text-white border-broker-red"
              : "bg-transparent text-broker-text-secondary border-broker-border"
          }`}
          aria-pressed={!isBuy}
        >
          Sell
        </button>
      </div>

      {/* Order type */}
      <div className="flex gap-0.5 mb-2">
        {["limit", "market"].map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`flex-1 py-0.5 text-2xs font-medium rounded text-center capitalize ${
              type === t
                ? "bg-broker-surface text-broker-text-primary"
                : "bg-transparent text-broker-text-secondary"
            }`}
            aria-pressed={type === t}
          >
            {t}
          </button>
        ))}
      </div>

      {type !== "market" && (
        <div className="mb-1.5">
          <label className="text-2xs text-broker-text-secondary block mb-0.5">
            Price (USD)
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            className="w-full px-2 py-1 text-xs"
            aria-label="Price in USD"
          />
        </div>
      )}

      <div className="mb-1.5">
        <label className="text-2xs text-broker-text-secondary block mb-0.5">
          Quantity (BTC)
        </label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => {
            setQuantity(e.target.value);
            if (type === "limit" && price && e.target.value)
              setTotal((Number(price) * Number(e.target.value)).toFixed(2));
          }}
          placeholder="0.00"
          className="w-full px-2 py-1 text-xs"
          aria-label="Quantity in BTC"
        />
      </div>

      {type === "limit" && (
        <div className="mb-2">
          <label className="text-2xs text-broker-text-secondary block mb-0.5">
            Total (USD)
          </label>
          <input
            type="number"
            value={total}
            onChange={(e) => {
              setTotal(e.target.value);
              if (Number(e.target.value) > 0 && Number(quantity) > 0)
                setPrice(
                  (Number(e.target.value) / Number(quantity)).toFixed(2),
                );
            }}
            placeholder="0.00"
            className="w-full px-2 py-1 text-xs"
            aria-label="Total in USD"
          />
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`w-full py-2 text-xs font-semibold text-white rounded mb-1 ${
          isBuy ? "bg-broker-green hover:bg-[#07a08a]" : "bg-broker-red hover:bg-[#da2c3b]"
        } disabled:opacity-35 disabled:cursor-not-allowed`}
        aria-label={`${isBuy ? "Buy" : "Sell"} ${pair.split("-")[0]}`}
      >
        {loading
          ? "..."
          : `${isBuy ? "Buy" : "Sell"} ${pair.split("-")[0]}`}
      </button>

      {msg && (
        <div
          className={`text-2xs text-center ${
            msg.includes("\u2713")
              ? "text-broker-green"
              : "text-broker-red"
          }`}
          role="alert"
        >
          {msg}
        </div>
      )}

      <div className="flex justify-between text-2xs text-broker-text-secondary mt-1.5">
        <span>Bal: 0.00</span>
        <span>Eq: $0.00</span>
      </div>
    </div>
  );
}
