"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Ticker } from "@/lib/types";

export default function TickerTape() {
  const [tickers, setTickers] = useState<Ticker[]>([]);

  useEffect(() => {
    api.tickers().then(setTickers).catch(() => {});
    const i = setInterval(() => api.tickers().then(setTickers).catch(() => {}), 10000);
    return () => clearInterval(i);
  }, []);

  return (
    <div style={{
      height: 48, background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)",
      display: "flex", alignItems: "center", padding: "0 16px", gap: 24, overflowX: "auto",
      fontSize: 13, whiteSpace: "nowrap",
    }}>
      {tickers.map(t => (
        <div key={t.pair} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontWeight: 600 }}>{t.pair.replace("-", "/")}</span>
          <span style={{
            color: Number(t.lastPrice) >= Number(t.change24h) ? "var(--green)" : "var(--red)",
            fontWeight: 500,
          }}>
            {formatPrice(t.lastPrice, t.pair)}
          </span>
          <span style={{
            color: Number(t.lastPrice) >= Number(t.change24h) ? "var(--green)" : "var(--red)",
            fontSize: 12,
          }}>
            {((Number(t.lastPrice) - Number(t.change24h)) / Number(t.change24h) * 100).toFixed(2)}%
          </span>
        </div>
      ))}
    </div>
  );
}

function formatPrice(price: string, pair: string) {
  const p = Number(price) / 100;
  return pair.includes("USD") ? p.toFixed(2) : p.toPrecision(6);
}
