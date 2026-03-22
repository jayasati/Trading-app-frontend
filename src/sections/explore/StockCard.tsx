"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isMarketOpen } from "@/lib/time";

interface StockQuote {
  price: number;
  close: number;
}

interface Stock {
  id:       string;
  symbol:   string;
  name:     string;
  exchange: string;
  quote:    StockQuote | null;
}

interface StockCardProps {
  stock:      Stock;
  livePrice?: number;
}

function fmt(n: number) {
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function calcChange(price: number, prevClose: number) {
  if (!prevClose) return { change: 0, pct: 0 };
  const change = price - prevClose;
  const pct    = (change / prevClose) * 100;
  return { change, pct };
}

export default function StockCard({ stock, livePrice }: StockCardProps) {
  const router    = useRouter();
  const marketOpen = isMarketOpen();

  const basePrice = livePrice ?? stock.quote?.price ?? null;
  const prevClose = stock.quote?.close ?? 0;
  const { pct }   = basePrice ? calcChange(basePrice, prevClose) : { pct: 0 };
  const positive  = pct >= 0;

  const [flash,    setFlash]    = useState<"up" | "down" | null>(null);
  const [prevLive, setPrevLive] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (
      livePrice !== undefined &&
      prevLive  !== undefined &&
      livePrice !== prevLive
    ) {
      setFlash(livePrice > prevLive ? "up" : "down");
      const t = setTimeout(() => setFlash(null), 600);
      return () => clearTimeout(t);
    }
    setPrevLive(livePrice);
  }, [livePrice]);

  return (
    <div
      className="card card-hover animate-fade-up"
      onClick={() => router.push(`/stock/${stock.id}`)}
      style={{
        padding: "18px",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        background:
          flash === "up"   ? "rgba(22,163,74,0.04)"  :
          flash === "down" ? "rgba(220,38,38,0.04)"  :
          "var(--color-surface)",
        transition:
          "background 0.4s ease, box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease",
      }}
    >
      {/* Colored top stripe */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "3px",
          background: positive ? "var(--color-gain)" : "var(--color-loss)",
          opacity: basePrice ? 1 : 0,
          transition: "opacity 0.3s",
        }}
      />

      {/* Logo + exchange */}
      <div
        style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            width: 40, height: 40, borderRadius: "10px",
            background: "var(--color-primary-light)",
            color: "var(--color-primary)",
            fontWeight: 700, fontSize: "13px",
            display: "flex", alignItems: "center", justifyContent: "center",
            letterSpacing: "0.5px",
          }}
        >
          {stock.symbol.slice(0, 2)}
        </div>
        <span
          style={{
            fontSize: "10px", fontWeight: 600,
            color: "var(--color-text-muted)",
            background: "var(--color-surface-2)",
            padding: "2px 7px", borderRadius: "99px",
          }}
        >
          {stock.exchange || "NSE"}
        </span>
      </div>

      {/* Name */}
      <div style={{ fontWeight: 700, fontSize: "13.5px", color: "var(--color-text-primary)", marginBottom: "2px" }}>
        {stock.symbol}
      </div>
      <div style={{ fontSize: "11.5px", color: "var(--color-text-muted)", marginBottom: "12px", lineHeight: 1.3 }}>
        {stock.name}
      </div>

      {/* Price */}
      <div
        style={{
          fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "17px",
          color: "var(--color-text-primary)", marginBottom: "6px",
        }}
      >
        {basePrice !== null ? `₹${fmt(basePrice)}` : "—"}
      </div>

      {/* Change badge */}
      {basePrice !== null && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            style={{
              display: "inline-flex", alignItems: "center", gap: "3px",
              fontSize: "11.5px", fontWeight: 600,
              color:      positive ? "var(--color-gain)"    : "var(--color-loss)",
              background: positive ? "var(--color-gain-bg)" : "var(--color-loss-bg)",
              padding: "2px 8px", borderRadius: "99px",
            }}
          >
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="3">
              <path d={positive ? "M12 19V5M5 12l7-7 7 7" : "M12 5v14M5 12l7 7 7-7"} />
            </svg>
            {positive ? "+" : ""}{pct.toFixed(2)}%
          </span>

          {/* ── Market status badge ── */}
          {marketOpen ? (
            <span
              style={{
                display: "inline-flex", alignItems: "center", gap: 3,
                fontSize: "10.5px", fontWeight: 600,
                color: "var(--color-gain)",
              }}
            >
              <span
                style={{
                  width: 5, height: 5, borderRadius: "50%",
                  background: "var(--color-gain)", display: "inline-block",
                  animation: "pulse 2s infinite",
                }}
              />
              <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
              Live
            </span>
          ) : (
            <span
              style={{
                display: "inline-flex", alignItems: "center", gap: 3,
                fontSize: "10.5px", fontWeight: 600,
                color: "var(--color-text-muted)",
              }}
            >
              <span
                style={{
                  width: 5, height: 5, borderRadius: "50%",
                  background: "var(--color-text-muted)", display: "inline-block",
                }}
              />
              Closed
            </span>
          )}
        </div>
      )}
    </div>
  );
}