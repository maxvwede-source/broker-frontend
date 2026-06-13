"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { connectPrices } from "@/lib/ws";
import { connectDepth } from "@/lib/ws";
import TradingChart from "@/components/trading/TradingChart";
import OrderBook from "@/components/trading/OrderBook";
import OrderForm from "@/components/trading/OrderForm";
import type { OrderBook as OB, Ticker } from "@/lib/types";

const PAIR = "BTC-USD";

export default function TradePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [btcPrice, setBtcPrice] = useState(0);
  const [book, setBook] = useState<OB | null>(null);
  const [bottomTab, setBottomTab] = useState<"orders" | "history">("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);

  useEffect(() => {
    api.tickers().then(setTickers).catch(() => {});
    api.btcUsd().then(d => setBtcPrice(d.price)).catch(() => {});
    api.depth(PAIR).then(setBook).catch(() => {});

    const priceCleanup = connectPrices((p) => setBtcPrice(p.price));
    const depthCleanup = connectDepth(PAIR, (data) => {
      if (data.type === "depth_snapshot" || data.type === "depth_update")
        setBook(data);
    });

    const int = setInterval(() => {
      api.tickers().then(setTickers).catch(() => {});
    }, 15000);

    return () => { priceCleanup(); depthCleanup(); clearInterval(int); };
  }, []);

  useEffect(() => {
    if (!user) return;
    api.getOpenOrders().then(setOrders).catch(() => {});
    api.getOrderHistory().then(setHistory).catch(() => {});
    api.adminTrades().then(d => setTrades((d || []).slice(-30).reverse() || [])).catch(() => {});
  }, [user]);

  const btcTicker = tickers.find(t => t.pair === PAIR);
  const btcVol = btcTicker?.volume24h;

  const bestBid = book?.bids?.[0]?.price || "0";
  const bestAsk = book?.asks?.[0]?.price || "0";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      {/* Main area */}
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {/* Market Watch Sidebar */}
        <div style={{ width: 190, background: "#1e222d", borderRight: "1px solid #2a2e39", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ padding: "8px 10px", borderBottom: "1px solid #2a2e39", fontSize: 11, color: "#787b86", fontWeight: 500, letterSpacing: "0.5px", textTransform: "uppercase" }}>
            Market Watch
          </div>
          <div style={{ flex: 1, overflow: "auto" }}>
            {[{ symbol: PAIR, price: btcPrice, change: null, vol: null },
              ...tickers.filter(t => t.pair !== PAIR).map(t => ({
                symbol: t.pair, price: t.lastPrice ? Number(t.lastPrice) / 100 : null,
                change: t.change24h ? ((Number(t.lastPrice || 0) - Number(t.change24h)) / Number(t.change24h) * 100) : null,
                vol: t.volume24h || null,
              })),
            ].map((item, i) => (
              <div key={item.symbol} style={{
                display: "grid", gridTemplateColumns: "1fr auto",
                padding: "6px 10px", cursor: "pointer",
                borderBottom: "1px solid rgba(42,46,57,0.5)",
                background: i === 0 ? "rgba(240,185,11,0.06)" : "transparent",
              }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: i === 0 ? "#f0b90b" : "#d1d4dc" }}>{item.symbol.replace("-", "/")}</div>
                  <div style={{ fontSize: 10, color: "#787b86" }}>{item.change !== null ? `${item.change >= 0 ? "+" : ""}${item.change.toFixed(2)}%` : "—"}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="mono" style={{ fontSize: 12, color: i === 0 ? "#f0b90b" : "#d1d4dc" }}>
                    {item.price !== null ? `$${item.price.toFixed(2)}` : "—"}
                  </div>
                  <div style={{ fontSize: 10, color: "#787b86" }}>{item.vol ? `${(Number(item.vol) / 1e8).toFixed(3)}` : ""}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Chart */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Price bar */}
          <div style={{
            height: 44, borderBottom: "1px solid #2a2e39", display: "flex", alignItems: "center",
            padding: "0 12px", gap: 16, flexShrink: 0,
          }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>BTC/USD</span>
            <span className="mono" style={{ fontSize: 18, fontWeight: 600, color: btcPrice >= 64482 ? "var(--green)" : "var(--red)" }}>
              ${btcPrice ? btcPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : "—"}
            </span>
            <span className="mono" style={{ fontSize: 11, color: "#787b86" }}>24h Vol: {btcVol ? `${(Number(btcVol) / 1e8).toFixed(3)}` : "—"}</span>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 11, color: "#787b86" }}>
              Bid: <span className="mono" style={{ color: "var(--green)" }}>${(Number(bestBid) / 100).toFixed(2)}</span>
            </span>
            <span style={{ fontSize: 11, color: "#787b86" }}>
              Ask: <span className="mono" style={{ color: "var(--red)" }}>${(Number(bestAsk) / 100).toFixed(2)}</span>
            </span>
          </div>
          {/* Chart */}
          <div style={{ flex: 1, minHeight: 0 }}>
            <TradingChart />
          </div>
          {/* Bottom Toolbox */}
          <div style={{ height: 180, borderTop: "1px solid #2a2e39", display: "flex", flexDirection: "column", flexShrink: 0 }}>
            <div style={{ display: "flex", borderBottom: "1px solid #2a2e39", background: "#1e222d" }}>
              {[
                ["Orders", "orders"],
                ["History", "history"],
              ].map(([label, key]) => (
                <button key={key} onClick={() => setBottomTab(key as any)}
                  style={{
                    background: "transparent",
                    color: bottomTab === key ? "#d1d4dc" : "#787b86",
                    padding: "6px 14px", fontSize: 11, fontWeight: 500,
                    borderBottom: bottomTab === key ? "2px solid #f0b90b" : "2px solid transparent",
                    borderRadius: 0,
                  }}>{label}</button>
              ))}
            </div>
            <div style={{ flex: 1, overflow: "auto", fontSize: 12 }}>
              {(bottomTab === "orders" ? orders : history).length === 0 ? (
                <div style={{ padding: 20, textAlign: "center", color: "#787b86", fontSize: 11 }}>No {bottomTab}</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                  <thead>
                    <tr style={{ color: "#787b86", fontSize: 10 }}>
                      <th style={{ textAlign: "left", padding: "4px 10px", fontWeight: 500 }}>Time</th>
                      <th style={{ textAlign: "left", padding: "4px 10px", fontWeight: 500 }}>Pair</th>
                      <th style={{ textAlign: "left", padding: "4px 10px", fontWeight: 500 }}>Side</th>
                      <th style={{ textAlign: "right", padding: "4px 10px", fontWeight: 500 }}>Price</th>
                      <th style={{ textAlign: "right", padding: "4px 10px", fontWeight: 500 }}>Qty</th>
                      <th style={{ textAlign: "right", padding: "4px 10px", fontWeight: 500 }}>Filled</th>
                      <th style={{ textAlign: "left", padding: "4px 10px", fontWeight: 500 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(bottomTab === "orders" ? orders : history).map((o: any) => (
                      <tr key={o.id} style={{ borderBottom: "1px solid rgba(42,46,57,0.5)" }}>
                        <td style={{ padding: "4px 10px", color: "#787b86" }}>{new Date(o.createdAt).toLocaleTimeString()}</td>
                        <td style={{ padding: "4px 10px" }}>{o.pair}</td>
                        <td style={{ padding: "4px 10px", color: o.side === "buy" ? "var(--green)" : "var(--red)" }}>{o.side.toUpperCase()}</td>
                        <td style={{ padding: "4px 10px", textAlign: "right" }} className="mono">{o.price ? (Number(o.price) / 100).toFixed(2) : "—"}</td>
                        <td style={{ padding: "4px 10px", textAlign: "right" }} className="mono">{(Number(o.quantity) / 1e8).toFixed(5)}</td>
                        <td style={{ padding: "4px 10px", textAlign: "right" }} className="mono">{((Number(o.filled) / Number(o.quantity)) * 100).toFixed(0)}%</td>
                        <td style={{ padding: "4px 10px", color: o.status === "filled" ? "var(--green)" : o.status === "cancelled" ? "#787b86" : "var(--yellow)" }}>{o.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right: Order Book + Order Form */}
        <div style={{ width: 280, borderLeft: "1px solid #2a2e39", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ flex: 1, minHeight: 0 }}>
            <OrderBook book={book} pair={PAIR} />
          </div>
          <div style={{ borderTop: "1px solid #2a2e39" }}>
            <OrderForm pair={PAIR} />
          </div>
        </div>
      </div>
    </div>
  );
}
