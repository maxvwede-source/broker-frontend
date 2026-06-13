"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { connectPrices } from "@/lib/ws";
import type { Candle } from "@/lib/types";

export default function TradingChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [price, setPrice] = useState(0);
  const [interval, setInterval] = useState("1m");

  useEffect(() => {
    api.candles("BTC-USD", interval).then(d => setCandles(d.candles || d)).catch(() => {});
  }, [interval]);

  useEffect(() => {
    const cleanup = connectPrices((p) => setPrice(p.price));
    return () => cleanup();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width = canvas.clientWidth;
    const H = canvas.height = canvas.clientHeight;

    ctx.fillStyle = "#0b0e11";
    ctx.fillRect(0, 0, W, H);

    // Convert candle prices from cents to USD
    const data = candles.slice(-80).map(c => ({
      open: Number(c.open) / 100,
      high: Number(c.high) / 100,
      low: Number(c.low) / 100,
      close: Number(c.close) / 100,
    }));
    const high = Math.max(...data.map(c => c.high), 1);
    const low = Math.min(...data.map(c => c.low));
    const range = high - low || 1;
    const pad = 8;
    const candleW = Math.max(2, (W - pad * 2) / data.length - 1);

    data.forEach((c, i) => {
      const x = pad + i * (candleW + 1);
      const openY = H - ((c.open - low) / range) * (H - 40) - 20;
      const closeY = H - ((c.close - low) / range) * (H - 40) - 20;
      const highY = H - ((c.high - low) / range) * (H - 40) - 20;
      const lowY = H - ((c.low - low) / range) * (H - 40) - 20;
      const isGreen = c.close >= c.open;

      ctx.strokeStyle = isGreen ? "#0ecb81" : "#f6465d";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + candleW / 2, highY);
      ctx.lineTo(x + candleW / 2, lowY);
      ctx.stroke();

      ctx.fillStyle = isGreen ? "#0ecb81" : "#f6465d";
      const y = Math.min(openY, closeY);
      const h = Math.max(Math.abs(closeY - openY), 1);
      ctx.fillRect(x, y, candleW, h);
    });

    if (price) {
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      const y = H - ((price - low) / range) * (H - 40) - 20;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#fff";
      ctx.font = "11px monospace";
      ctx.fillText(`$${price.toFixed(2)}`, W - 80, y - 4);
    }
  }, [candles, price]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "8px 12px", borderBottom: "1px solid var(--border)",
      }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>BTC/USDT</span>
        <div style={{ display: "flex", gap: 4 }}>
          {["1m", "5m", "15m", "1h", "4h", "1d"].map(i => (
            <button key={i} onClick={() => setInterval(i)}
              style={{
                padding: "3px 8px", fontSize: 11, fontWeight: 500,
                background: interval === i ? "var(--bg-card)" : "transparent",
                color: interval === i ? "var(--text-primary)" : "var(--text-muted)",
                borderRadius: 3,
              }}>{i}</button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}
