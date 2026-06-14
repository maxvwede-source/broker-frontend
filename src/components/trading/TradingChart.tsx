"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { connectPrices } from "@/lib/ws";
import type { Candle } from "@/lib/types";

interface TooltipData {
  x: number;
  y: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  time: string;
}

function ChartSkeleton() {
  return (
    <div className="h-full flex flex-col bg-broker-bg">
      <div className="flex justify-between items-center px-3 h-8 border-b border-broker-border">
        <div className="flex gap-1">
          {["1m", "5m", "15m", "1h", "4h", "1d"].map((i) => (
            <div key={i} className="skeleton h-[22px] w-[30px]" />
          ))}
        </div>
      </div>
      <div className="flex-1 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-broker-yellow mx-auto mb-2" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-broker-text-secondary text-xs">Loading chart data...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TradingChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [price, setPrice] = useState(0);
  const [interval_, setInterval_] = useState("1d");
  const prevPrice = useRef(price);
  const [hoveredCandle, setHoveredCandle] = useState<TooltipData | null>(null);
  const [loading, setLoading] = useState(true);
  const priceRef = useRef(price);
  const candlesRef = useRef(candles);

  priceRef.current = price;
  candlesRef.current = candles;

  useEffect(() => {
    setLoading(true);
    api
      .candles("BTC-USD", interval_, 100)
      .then((d) => setCandles(d.candles || d))
      .catch(() => {})
      .finally(() => setLoading(false));

    const int = setInterval(() => {
      api
        .candles("BTC-USD", interval_, 100)
        .then((d) => setCandles(d.candles || d))
        .catch(() => {});
    }, 30000);

    return () => clearInterval(int);
  }, [interval_]);

  useEffect(() => {
    const cleanup = connectPrices((p) => {
      prevPrice.current = priceRef.current;
      priceRef.current = p.price;
      setPrice(p.price);
    });
    return () => cleanup();
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width = canvas.clientWidth * dpr;
    const H = canvas.height = canvas.clientHeight * dpr;
    const dw = canvas.clientWidth;
    const dh = canvas.clientHeight;

    ctx.scale(dpr, dpr);
    ctx.fillStyle = "#131722";
    ctx.fillRect(0, 0, dw, dh);

    // Grid
    ctx.strokeStyle = "rgba(42,46,57,0.6)";
    ctx.lineWidth = 1;
    for (let x = 0; x < dw; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, dh);
      ctx.stroke();
    }
    for (let y = 0; y < dh; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(dw, y);
      ctx.stroke();
    }

    if (candles.length === 0) {
      ctx.fillStyle = "#787b86";
      ctx.font = "12px -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No data", dw / 2, dh / 2);
      return;
    }

    const data = candles.slice(-80).map((c) => ({
      open: Number(c.open) / 100,
      high: Number(c.high) / 100,
      low: Number(c.low) / 100,
      close: Number(c.close) / 100,
      volume: Number(c.volume),
      time: Number(c.openTime),
      raw: c,
    }));

    const high = Math.max(...data.map((c) => c.high), 1);
    const low = Math.min(...data.map((c) => c.low));
    const range = high - low || 1;
    const maxVol = Math.max(...data.map((c) => c.volume), 1);

    const pad = { left: 50, right: 60, top: 16, bottom: 24 };
    const volHeight = dh * 0.12;
    const chartH = dh - pad.top - pad.bottom - volHeight;
    const chartW = dw - pad.left - pad.right;
    const candleW = Math.min(Math.max(2, chartW / data.length - 1), 24);

    // Price axis
    ctx.fillStyle = "#787b86";
    ctx.font = "10px \"JetBrains Mono\", monospace";
    ctx.textAlign = "right";
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const val = high - (range * i) / steps;
      const y = pad.top + (chartH * i) / steps;
      ctx.fillText(`$${val.toFixed(2)}`, pad.left - 4, y + 3);
    }

    // Volume bars
    for (let i = 0; i < data.length; i++) {
      const c = data[i];
      const x = pad.left + i * (candleW + 1);
      const volBarW = Math.max(1, candleW * 0.8);
      const volBarH = (c.volume / maxVol) * volHeight;
      const isGreen = c.close >= c.open;
      ctx.fillStyle = isGreen ? "rgba(8,153,129,0.3)" : "rgba(242,54,69,0.3)";
      ctx.fillRect(x + (candleW - volBarW) / 2, pad.top + chartH + volHeight - volBarH, volBarW, volBarH);
    }

    // Candles
    for (let i = 0; i < data.length; i++) {
      const c = data[i];
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
    }

    // Time axis labels
    ctx.fillStyle = "#787b86";
    ctx.font = "10px -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif";
    ctx.textAlign = "center";
    const labelStep = Math.max(1, Math.floor(data.length / 6));
    for (let i = 0; i < data.length; i += labelStep) {
      const x = pad.left + i * (candleW + 1) + candleW / 2;
      const d = new Date(data[i].time);
      const label = interval_ === "1d"
        ? d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
        : d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
      ctx.fillText(label, x, pad.top + chartH + volHeight + 16);
    }

    // Current price line
    const currentPrice = priceRef.current;
    if (currentPrice) {
      const priceY = pad.top + chartH - ((currentPrice - low) / range) * chartH;
      ctx.strokeStyle = "rgba(209,212,220,0.4)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(pad.left, priceY);
      ctx.lineTo(dw, priceY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#d1d4dc";
      ctx.font = "10px \"JetBrains Mono\", monospace";
      ctx.textAlign = "right";
      ctx.fillText(`$${currentPrice.toFixed(2)}`, dw - 4, priceY - 4);
    }
  }, [candles, price, interval_]);

  useEffect(() => { draw(); }, [draw]);

  useEffect(() => {
    const handleResize = () => draw();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [draw]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const data = candles.slice(-80).map((c) => ({
      open: Number(c.open) / 100,
      high: Number(c.high) / 100,
      low: Number(c.low) / 100,
      close: Number(c.close) / 100,
      volume: Number(c.volume),
      time: Number(c.openTime),
      raw: c,
    }));

    const pad = { left: 50, right: 60, top: 16, bottom: 24 };
    const chartW = rect.width - pad.left - pad.right;
    const candleW = Math.min(Math.max(2, chartW / data.length - 1), 24);

    const idx = Math.round((mx - pad.left) / (candleW + 1));
    if (idx < 0 || idx >= data.length) { setHoveredCandle(null); return; }

    const c = data[idx];
    setHoveredCandle({
      x: Math.min(mx + 10, rect.width - 10),
      y: Math.min(Math.max(my, 30), rect.height - 100),
      open: c.open.toFixed(2),
      high: c.high.toFixed(2),
      low: c.low.toFixed(2),
      close: c.close.toFixed(2),
      volume: (c.volume / 1e8).toFixed(4),
      time: new Date(c.time).toLocaleString(),
    });
  };

  const handleMouseLeave = () => setHoveredCandle(null);

  if (loading) return <ChartSkeleton />;

  return (
    <div className="h-full flex flex-col bg-broker-bg">
      <div className="flex justify-between items-center px-3 h-8 border-b border-broker-border shrink-0">
        <div className="flex gap-0.5">
          {["1m", "5m", "15m", "1h", "4h", "1d"].map((i) => (
            <button
              key={i}
              onClick={() => setInterval_(i)}
              className={`px-2 py-0.5 text-2xs font-medium h-[22px] rounded-sm ${
                interval_ === i
                  ? "bg-broker-surface text-broker-text-primary"
                  : "bg-transparent text-broker-text-secondary"
              }`}
              aria-pressed={interval_ === i}
              aria-label={`${i} interval`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 relative min-h-0">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          role="img"
          aria-label="BTC/USD candlestick chart"
        />
        {hoveredCandle && (
          <div
            className="absolute bg-broker-card border border-broker-border rounded px-3 py-2 text-xs shadow-lg pointer-events-none z-10"
            style={{
              left: Math.max(10, Math.min(hoveredCandle.x - 80, window.innerWidth - 200)),
              top: Math.max(10, hoveredCandle.y - 50),
            }}
            role="tooltip"
          >
            <div className="text-broker-text-secondary mb-1 font-medium">{hoveredCandle.time}</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
              <span className="text-broker-text-secondary">Open</span>
              <span className="text-right font-mono text-broker-text-primary">${hoveredCandle.open}</span>
              <span className="text-broker-text-secondary">High</span>
              <span className="text-right font-mono text-broker-green">${hoveredCandle.high}</span>
              <span className="text-broker-text-secondary">Low</span>
              <span className="text-right font-mono text-broker-red">${hoveredCandle.low}</span>
              <span className="text-broker-text-secondary">Close</span>
              <span className="text-right font-mono text-broker-text-primary">${hoveredCandle.close}</span>
              <span className="text-broker-text-secondary">Volume</span>
              <span className="text-right font-mono text-broker-text-primary">{hoveredCandle.volume}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
