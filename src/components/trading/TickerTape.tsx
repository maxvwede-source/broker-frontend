"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Ticker } from "@/lib/types";

export default function TickerTape() {
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [btcPrice, setBtcPrice] = useState<number>(0);

  useEffect(() => {
    api.tickers().then(setTickers).catch(() => {});
    api.btcUsd().then(d => setBtcPrice(d.price)).catch(() => {});
    const i = setInterval(() => {
      api.tickers().then(setTickers).catch(() => {});
      api.btcUsd().then(d => setBtcPrice(d.price)).catch(() => {});
    }, 10000);
    return () => clearInterval(i);
  }, []);

  return (
    <div style={{
      height: 48, background: "#181a20", borderBottom: "1px solid var(--border)",
      display: "flex", alignItems: "center", padding: "0 16px", gap: 24, overflowX: "auto",
      fontSize: 13, whiteSpace: "nowrap",
    }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ fontWeight: 600 }}>BTC/USD</span>
        <span style={{ color: "var(--green)", fontWeight: 500 }}>
          {btcPrice ? `$${btcPrice.toLocaleString()}` : "—"}
        </span>
      </div>
      {tickers.filter(t => t.pair !== "BTC-USD").map(t => (
        <div key={t.pair} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontWeight: 600 }}>{t.pair.replace("-", "/")}</span>
          <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
            {t.lastPrice ? `$${(Number(t.lastPrice) / 100).toFixed(2)}` : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}
