"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { connectPrices, connectDepth } from "@/lib/ws";
import TradingChart from "@/components/trading/TradingChart";
import OrderBook from "@/components/trading/OrderBook";
import OrderForm from "@/components/trading/OrderForm";
import type { OrderBook as OB, Ticker } from "@/lib/types";

const PAIR = "BTC-USD";

function MarketWatchSkeleton() {
  return (
    <div className="space-y-2 p-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="grid grid-cols-[1fr_auto] gap-2">
          <div className="space-y-1">
            <div className="skeleton h-3 w-16" />
            <div className="skeleton h-2.5 w-12" />
          </div>
          <div className="text-right space-y-1">
            <div className="skeleton h-3 w-14 ml-auto" />
            <div className="skeleton h-2.5 w-10 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, j) => (
            <div key={j} className="skeleton h-3 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function TradePage() {
  const { user } = useAuth();
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [btcPrice, setBtcPrice] = useState(0);
  const [book, setBook] = useState<OB | null>(null);
  const [bottomTab, setBottomTab] = useState<"orders" | "history">("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.tickers().then(setTickers).catch(() => {}),
      api.btcUsd().then((d) => setBtcPrice(d.price)).catch(() => {}),
      api.depth(PAIR).then(setBook).catch(() => {}),
    ]).finally(() => setLoading(false));

    const priceCleanup = connectPrices((p) => setBtcPrice(p.price));
    const depthCleanup = connectDepth(PAIR, (data) => {
      if (data.type === "depth_snapshot" || data.type === "depth_update")
        setBook(data);
    });

    const int = setInterval(() => {
      api.tickers().then(setTickers).catch(() => {});
    }, 15000);

    return () => {
      priceCleanup();
      depthCleanup();
      clearInterval(int);
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    api.getOpenOrders().then(setOrders).catch(() => {});
    api.getOrderHistory().then(setHistory).catch(() => {});
    api
      .adminTrades()
      .then((d) => setTrades((d || []).slice(-30).reverse() || []))
      .catch(() => {});
  }, [user]);

  const btcTicker = tickers.find((t) => t.pair === PAIR);
  const btcVol = btcTicker?.volume24h;

  const bestBid = book?.bids?.[0]?.price || "0";
  const bestAsk = book?.asks?.[0]?.price || "0";

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Main area */}
      <div className="flex-1 flex min-h-0">
        {/* Market Watch Sidebar */}
        <aside className="w-sidebar bg-broker-card border-r border-broker-border flex flex-col shrink-0">
          <div className="px-2.5 py-2 border-b border-broker-border text-2xs text-broker-text-secondary font-medium tracking-wide uppercase">
            Market Watch
          </div>
          <div className="flex-1 overflow-auto">
            {loading ? (
              <MarketWatchSkeleton />
            ) : (
              <>
                {[
                  {
                    symbol: PAIR,
                    price: btcPrice,
                    change: null,
                    vol: null,
                  },
                  ...tickers
                    .filter((t) => t.pair !== PAIR)
                    .map((t) => ({
                      symbol: t.pair,
                      price: t.lastPrice
                        ? Number(t.lastPrice) / 100
                        : null,
                      change: t.change24h
                        ? ((Number(t.lastPrice || 0) -
                            Number(t.change24h)) /
                            Number(t.change24h)) *
                          100
                        : null,
                      vol: t.volume24h || null,
                    })),
                ].map((item, i) => (
                  <div
                    key={item.symbol}
                    role="button"
                    tabIndex={0}
                    aria-label={`${item.symbol.replace("-", "/")} ${
                      item.price ? `$${item.price.toFixed(2)}` : "no price"
                    }`}
                    className={`grid grid-cols-[1fr_auto] px-2.5 py-1.5 cursor-pointer border-b border-broker-border/50 ${
                      i === 0 ? "bg-broker-yellow/5" : ""
                    }`}
                  >
                    <div>
                      <div
                        className={`text-xs font-medium ${
                          i === 0
                            ? "text-broker-yellow"
                            : "text-broker-text-primary"
                        }`}
                      >
                        {item.symbol.replace("-", "/")}
                      </div>
                      <div className="text-2xs text-broker-text-secondary">
                        {item.change !== null
                          ? `${item.change >= 0 ? "+" : ""}${item.change.toFixed(2)}%`
                          : "\u2014"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-xs font-mono ${
                          i === 0
                            ? "text-broker-yellow"
                            : "text-broker-text-primary"
                        }`}
                      >
                        {item.price !== null
                          ? `$${item.price.toFixed(2)}`
                          : "\u2014"}
                      </div>
                      <div className="text-2xs text-broker-text-secondary">
                        {item.vol
                          ? `${(Number(item.vol) / 1e8).toFixed(3)}`
                          : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </aside>

        {/* Center: Chart */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Price bar */}
          <div className="h-header border-b border-broker-border flex items-center px-3 gap-4 shrink-0">
            <span className="text-sm font-semibold text-broker-text-primary">
              BTC/USD
            </span>
            {btcPrice > 0 ? (
              <span
                className={`text-lg font-semibold font-mono ${
                  btcPrice >= 64482
                    ? "text-broker-green"
                    : "text-broker-red"
                }`}
              >
                $
                {btcPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            ) : (
              <span className="text-lg font-semibold font-mono text-broker-text-muted">
                \u2014
              </span>
            )}
            <span className="text-xs font-mono text-broker-text-secondary">
              24h Vol:{" "}
              {btcVol
                ? `${(Number(btcVol) / 1e8).toFixed(3)}`
                : "\u2014"}
            </span>
            <div className="flex-1" />
            <span className="text-xs text-broker-text-secondary">
              Bid:{" "}
              <span className="font-mono text-broker-green">
                ${(Number(bestBid) / 100).toFixed(2)}
              </span>
            </span>
            <span className="text-xs text-broker-text-secondary">
              Ask:{" "}
              <span className="font-mono text-broker-red">
                ${(Number(bestAsk) / 100).toFixed(2)}
              </span>
            </span>
          </div>
          {/* Chart */}
          <div className="flex-1 min-h-0">
            <TradingChart />
          </div>
          {/* Bottom Toolbox */}
          <div className="h-[180px] border-t border-broker-border flex flex-col shrink-0">
            <div className="flex border-b border-broker-border bg-broker-card">
              {[
                ["Orders", "orders" as const],
                ["History", "history" as const],
              ].map(([label, key]) => (
                <button
                  key={key}
                  onClick={() => setBottomTab(key as "orders" | "history")}
                  className={`bg-transparent px-3.5 py-1.5 text-xs font-medium rounded-none border-b-2 ${
                    bottomTab === key
                      ? "text-broker-text-primary border-broker-yellow"
                      : "text-broker-text-secondary border-transparent"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-auto text-xs">
              {loading ? (
                <TableSkeleton />
              ) : (bottomTab === "orders" ? orders : history).length ===
                0 ? (
                <div className="p-5 text-center text-broker-text-secondary text-xs">
                  No {bottomTab}
                </div>
              ) : (
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="text-broker-text-secondary text-2xs">
                      <th className="text-left px-2.5 py-1 font-medium">
                        Time
                      </th>
                      <th className="text-left px-2.5 py-1 font-medium">
                        Pair
                      </th>
                      <th className="text-left px-2.5 py-1 font-medium">
                        Side
                      </th>
                      <th className="text-right px-2.5 py-1 font-medium">
                        Price
                      </th>
                      <th className="text-right px-2.5 py-1 font-medium">
                        Qty
                      </th>
                      <th className="text-right px-2.5 py-1 font-medium">
                        Filled
                      </th>
                      <th className="text-left px-2.5 py-1 font-medium">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(bottomTab === "orders" ? orders : history).map(
                      (o: any) => (
                        <tr
                          key={o.id}
                          className="border-b border-broker-border/50"
                        >
                          <td className="px-2.5 py-1 text-broker-text-secondary">
                            {new Date(o.createdAt).toLocaleTimeString()}
                          </td>
                          <td className="px-2.5 py-1">{o.pair}</td>
                          <td
                            className={`px-2.5 py-1 ${o.side === "buy" ? "text-broker-green" : "text-broker-red"}`}
                          >
                            {o.side.toUpperCase()}
                          </td>
                          <td className="px-2.5 py-1 text-right font-mono">
                            {o.price
                              ? (Number(o.price) / 100).toFixed(2)
                              : "\u2014"}
                          </td>
                          <td className="px-2.5 py-1 text-right font-mono">
                            {(Number(o.quantity) / 1e8).toFixed(5)}
                          </td>
                          <td className="px-2.5 py-1 text-right font-mono">
                            {(
                              (Number(o.filled) / Number(o.quantity)) *
                              100
                            ).toFixed(0)}
                            %
                          </td>
                          <td
                            className={`px-2.5 py-1 ${
                              o.status === "filled"
                                ? "text-broker-green"
                                : o.status === "cancelled"
                                  ? "text-broker-text-secondary"
                                  : "text-broker-yellow"
                            }`}
                          >
                            {o.status}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right: Order Book + Order Form */}
        <aside className="w-orderbook border-l border-broker-border flex flex-col shrink-0">
          <div className="flex-1 min-h-0">
            <OrderBook book={book} pair={PAIR} />
          </div>
          <div className="border-t border-broker-border">
            <OrderForm pair={PAIR} />
          </div>
        </aside>
      </div>
    </div>
  );
}
