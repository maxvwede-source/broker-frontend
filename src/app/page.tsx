"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import TickerTape from "@/components/trading/TickerTape";
import OrderBook from "@/components/trading/OrderBook";
import OrderForm from "@/components/trading/OrderForm";
import TradingChart from "@/components/trading/TradingChart";

export default function TradePage() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div style={{ height: "calc(100vh - 56px)", display: "flex", flexDirection: "column" }}>
      <TickerTape />
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div style={{ flex: 1, minHeight: 0 }}>
            <TradingChart />
          </div>
          <div style={{
            height: 200, borderTop: "1px solid var(--border)",
            display: "flex", flexDirection: "column",
          }}>
            <RecentTrades />
          </div>
        </div>
        <div style={{
          width: 280, borderLeft: "1px solid var(--border)",
          display: "flex", flexDirection: "column",
        }}>
          <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
            <OrderBook />
          </div>
        </div>
        <div style={{
          width: 320, borderLeft: "1px solid var(--border)",
          display: "flex", flexDirection: "column",
        }}>
          <OrderForm />
        </div>
      </div>
    </div>
  );
}

function RecentTrades() {
  const [trades, setTrades] = useState<any[]>([]);

  useEffect(() => {
    api.adminTrades().then(d => setTrades((d || []).slice?.(-20)?.reverse() || [])).catch(() => {});
  }, []);

  return (
    <div style={{ fontSize: 12, display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <div style={{
        padding: "6px 12px", borderBottom: "1px solid var(--border)",
        fontWeight: 600, fontSize: 13,
      }}>
        Recent Trades
      </div>
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
        padding: "4px 12px", color: "var(--text-muted)", fontSize: 11,
      }}>
        <span>Price (USD)</span>
        <span style={{ textAlign: "right" }}>Qty (BTC)</span>
        <span style={{ textAlign: "right" }}>Time</span>
      </div>
      <div style={{ flex: 1, overflow: "auto" }}>
        {trades.map((t, i) => (
          <div key={t.id || i} style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
            padding: "2px 12px",
          }}>
            <span style={{ color: "var(--green)" }}>
              {(Number(t.price) / 100).toFixed(2)}
            </span>
            <span style={{ textAlign: "right" }}>
              {(Number(t.quantity) / 1e8).toFixed(5)}
            </span>
            <span style={{ textAlign: "right", color: "var(--text-muted)" }}>
              {new Date(t.createdAt).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
