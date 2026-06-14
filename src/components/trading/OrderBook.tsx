"use client";
import type { OrderBook as OB } from "@/lib/types";

function OrderBookSkeleton() {
  return (
    <div className="h-full flex flex-col bg-broker-bg">
      <div className="px-2.5 py-1.5 border-b border-broker-border text-2xs text-broker-text-secondary font-medium tracking-wide uppercase">
        Order Book
      </div>
      <div className="grid grid-cols-3 px-2.5 py-1 text-broker-text-secondary text-2xs border-b border-broker-border">
        <span>Price</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Total</span>
      </div>
      <div className="flex-1 p-3 space-y-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="grid grid-cols-3 gap-2">
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OrderBook({ book, pair }: { book: OB | null; pair: string }) {
  if (!book) return <OrderBookSkeleton />;

  const asks = book?.asks?.slice(-15).reverse() || [];
  const bids = book?.bids?.slice(0, 15) || [];
  const maxAskVol = Math.max(...asks.map((a) => Number(a.quantity)), 1);
  const maxBidVol = Math.max(...bids.map((b) => Number(b.quantity)), 1);
  const bestBid = bids[0]?.price || "0";
  const bestAsk = asks[0]?.price || "0";

  return (
    <div className="h-full flex flex-col text-xs bg-broker-bg">
      <div className="px-2.5 py-1.5 border-b border-broker-border text-2xs text-broker-text-secondary font-medium tracking-wide uppercase">
        Order Book
      </div>
      <div className="grid grid-cols-3 px-2.5 py-1 text-broker-text-secondary text-2xs border-b border-broker-border">
        <span>Price</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Total</span>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Asks */}
        <div className="flex-1 overflow-hidden">
          {asks.map((a, i) => (
            <div
              key={i}
              className="grid grid-cols-3 px-2.5 py-0.5 relative hover:bg-broker-surface/30"
            >
              <div
                className="absolute right-0 top-0 h-full transition-all duration-200"
                style={{
                  width: `${(Number(a.quantity) / maxAskVol) * 100}%`,
                  background: "rgba(242,54,69,0.1)",
                }}
              />
              <span className="font-mono text-broker-red z-[1] text-xs">
                {(Number(a.price) / 100).toFixed(2)}
              </span>
              <span className="font-mono text-right z-[1] text-2xs">
                {(Number(a.quantity) / 1e8).toFixed(5)}
              </span>
              <span className="font-mono text-right text-broker-text-secondary z-[1] text-2xs">
                {((Number(a.price) * Number(a.quantity)) / 1e10).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Spread */}
        <div className="px-2.5 py-1 border-y border-broker-border flex justify-between bg-broker-card">
          <span className="font-mono text-sm font-semibold text-broker-text-primary">
            {(Number(bestBid) / 100).toFixed(2)}
          </span>
          <span className="text-broker-text-secondary text-2xs">
            Spread: {((Number(bestAsk) - Number(bestBid)) / 100).toFixed(2)}
          </span>
        </div>

        {/* Bids */}
        <div className="flex-1 overflow-hidden">
          {bids.map((b, i) => (
            <div
              key={i}
              className="grid grid-cols-3 px-2.5 py-0.5 relative hover:bg-broker-surface/30"
            >
              <div
                className="absolute right-0 top-0 h-full transition-all duration-200"
                style={{
                  width: `${(Number(b.quantity) / maxBidVol) * 100}%`,
                  background: "rgba(8,153,129,0.1)",
                }}
              />
              <span className="font-mono text-broker-green z-[1] text-xs">
                {(Number(b.price) / 100).toFixed(2)}
              </span>
              <span className="font-mono text-right z-[1] text-2xs">
                {(Number(b.quantity) / 1e8).toFixed(5)}
              </span>
              <span className="font-mono text-right text-broker-text-secondary z-[1] text-2xs">
                {((Number(b.price) * Number(b.quantity)) / 1e10).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
