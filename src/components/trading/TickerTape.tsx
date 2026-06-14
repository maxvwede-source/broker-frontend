"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Ticker } from "@/lib/types";

export default function TickerTape() {
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [btcPrice, setBtcPrice] = useState<number>(0);

  useEffect(() => {
    api.tickers().then(setTickers).catch(() => {});
    api.btcUsd().then((d) => setBtcPrice(d.price)).catch(() => {});
    const i = setInterval(() => {
      api.tickers().then(setTickers).catch(() => {});
      api.btcUsd().then((d) => setBtcPrice(d.price)).catch(() => {});
    }, 10000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="h-12 bg-[#181a20] border-b border-broker-border flex items-center px-4 gap-6 overflow-x-auto text-sm whitespace-nowrap shrink-0">
      <div className="flex gap-2 items-center">
        <span className="font-semibold text-broker-text-primary">BTC/USD</span>
        <span className="text-broker-green font-medium">
          {btcPrice ? `$${btcPrice.toLocaleString()}` : "\u2014"}
        </span>
      </div>
      {tickers
        .filter((t) => t.pair !== "BTC-USD")
        .map((t) => (
          <div key={t.pair} className="flex gap-2 items-center">
            <span className="font-semibold text-broker-text-primary">
              {t.pair.replace("-", "/")}
            </span>
            <span className="text-broker-text-secondary font-medium">
              {t.lastPrice
                ? `$${(Number(t.lastPrice) / 100).toFixed(2)}`
                : "\u2014"}
            </span>
          </div>
        ))}
    </div>
  );
}
