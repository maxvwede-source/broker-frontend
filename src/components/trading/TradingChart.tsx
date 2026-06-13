"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { connectPrices } from "@/lib/ws";
import type { Candle } from "@/lib/types";

export default function TradingChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [price, setPrice] = useState(0);
  const [interval_, setInterval_] = useState("15m");
  const prevPrice = useRef(price);

  useEffect(() => {
    api.candles("BTC-USD", interval_, 100).then(d => setCandles(d.candles || d)).catch(() => {});
    const int = setInterval(() => {
      api.candles("BTC-USD", interval_, 100).then(d => setCandles(d.candles || d)).catch(() => {});
    }, 30000);
    return () => clearInterval(int);
  }, [interval_]);

  useEffect(() => {
    const cleanup = connectPrices((p) => { prevPrice.current = price; setPrice(p.price); });
    return () => cleanup();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width = canvas.clientWidth;
    const H = canvas.height = canvas.clientHeight;

    ctx.fillStyle = "#131722";
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = "rgba(42,46,57,0.6)";
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    if (candles.length === 0) {
      ctx.fillStyle = "#787b86";
      ctx.font = "12px -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No data", W / 2, H / 2);
      return;
    }

    const data = candles.slice(-80).map(c => ({
      open: Number(c.open) / 100,
      high: Number(c.high) / 100,
      low: Number(c.low) / 100,
      close: Number(c.close) / 100,
      time: Number(c.openTime),
    }));
    const high = Math.max(...data.map(c => c.high), 1);
    const low = Math.min(...data.map(c => c.low));
    const range = high - low || 1;
    const pad = { left: 50, right: 60, top: 16, bottom: 20 };
    const chartW = W - pad.left - pad.right;
    const chartH = H - pad.top - pad.bottom;
    const candleW = Math.min(Math.max(2, chartW / data.length - 1), 24);

    // Price axis
    ctx.fillStyle = "#787b86";
    ctx.font = "10px monospace";
    ctx.textAlign = "right";
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const val = high - (range * i / steps);
      const y = pad.top + (chartH * i / steps);
      ctx.fillText(`$${val.toFixed(2)}`, pad.left - 4, y + 3);
    }

    // Candles
    data.forEach((c, i) => {
      const x = pad.left + i * (candleW + 1);
      const openY = pad.top + chartH - ((c.open - low) / range) * chartH;
      const closeY = pad.top + chartH - ((c.close - low) / range) * chartH;
      const highY = pad.top + chartH - ((c.high - low) / range) * chartH;
      const lowY = pad.top + chartH - ((c.low - low) / range) * chartH;
      const isGreen = c.close >= c.open;

      ctx.strokeStyle = isGreen ? "#089981" : "#f23645";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + candleW / 2, highY);
      ctx.lineTo(x + candleW / 2, lowY);
      ctx.stroke();

      ctx.fillStyle = isGreen ? "#089981" : "#f23645";
      const y = Math.min(openY, closeY);
      const h = Math.max(Math.abs(closeY - openY), 1);
      ctx.fillRect(x, y, candleW, h);
    });

    // Current price line
    if (price) {
      const priceY = pad.top + chartH - ((price - low) / range) * chartH;
      ctx.strokeStyle = "rgba(209,212,220,0.4)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(pad.left, priceY); ctx.lineTo(W, priceY); ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#d1d4dc";
      ctx.font = "10px monospace";
      ctx.textAlign = "right";
      ctx.fillText(`$${price.toFixed(2)}`, W - 4, priceY - 4);
    }

    // Crosshair at last candle
    const last = data[data.length - 1];
    if (last) {
      ctx.fillStyle = "#787b86";
      ctx.font = "10px -apple-system, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(new Date(last.time).toLocaleDateString(), pad.left, H - 4);
    }
  }, [candles, price]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#131722" }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0 12px", height: 32, borderBottom: "1px solid #2a2e39",
      }}>
        <div style={{ display: "flex", gap: 2 }}>
          {["1m", "5m", "15m", "1h", "4h", "1d"].map(i => (
            <button key={i} onClick={() => setInterval_(i)}
              style={{
                padding: "2px 8px", fontSize: 10, fontWeight: 500, height: 22,
                background: interval_ === i ? "#2a2e39" : "transparent",
                color: interval_ === i ? "#d1d4dc" : "#787b86",
                borderRadius: 2,
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
