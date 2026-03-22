"use client";

import StockCard  from "./StockCard";
import EmptyState from "@/components/ui/EmptyState";
import { isMarketOpen } from "@/lib/time";

interface StockQuote {
  price:    number;
  open:     number;
  high:     number;
  low:      number;
  close:    number;
  volume:   number;
  updatedAt: string;
}

interface RecentStock {
  id:        string;
  symbol:    string;
  name:      string;
  exchange:  string;
  sector?:   string;
  quote:     StockQuote | null;
}

interface RecentlyViewedProps {
  stocks:     RecentStock[];
  loading:    boolean;
  livePrices: Record<string, number>;
}

function SkeletonCards() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="card animate-fade-up"
          style={{
            padding: "18px", height: "158px",
            background: "linear-gradient(90deg, var(--color-surface-2) 0%, var(--color-border-soft) 50%, var(--color-surface-2) 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
          }}
        />
      ))}
    </>
  );
}

export default function RecentlyViewed({ stocks, loading, livePrices }: RecentlyViewedProps) {
  const marketOpen = isMarketOpen();

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h2 style={{ fontWeight: 700, fontSize: "17px", color: "var(--color-text-primary)" }}>
            Recently viewed
          </h2>
          {stocks.length > 0 && (
            <span
              style={{
                fontSize: "11px", fontWeight: 600,
                color: "var(--color-text-muted)",
                background: "var(--color-surface-2)",
                padding: "2px 8px", borderRadius: "99px",
              }}
            >
              {stocks.length} stock{stocks.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* ── Market status indicator in header ── */}
        {stocks.length > 0 && (
          marketOpen ? (
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span
                style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: "var(--color-gain)",
                  boxShadow: "0 0 0 2px var(--color-gain-bg)",
                  display: "inline-block",
                  animation: "pulse 2s infinite",
                }}
              />
              <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
              <span style={{ fontSize: "11.5px", color: "var(--color-gain)", fontWeight: 600 }}>
                Live
              </span>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span
                style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: "var(--color-text-muted)",
                  display: "inline-block",
                }}
              />
              <span style={{ fontSize: "11.5px", color: "var(--color-text-muted)", fontWeight: 600 }}>
                Closed · Last traded prices
              </span>
            </div>
          )
        )}
      </div>

      {/* Cards grid */}
      <div
        className="stagger"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "14px",
        }}
      >
        {loading ? (
          <SkeletonCards />
        ) : stocks.length === 0 ? (
          <EmptyState
            title="No recently viewed stocks"
            description="Search for a stock in the navbar to load its live price — it'll appear here automatically."
            hint="Try searching: RELIANCE, TCS, HDFC…"
          />
        ) : (
          stocks.map((stock) => (
            <StockCard
              key={stock.id}
              stock={stock}
              livePrice={livePrices[stock.id]}
            />
          ))
        )}
      </div>

      {!loading && stocks.length > 0 && stocks.length < 10 && (
        <p style={{ marginTop: "12px", fontSize: "12px", color: "var(--color-text-muted)", textAlign: "center" }}>
          Search more stocks to add them here
        </p>
      )}
    </div>
  );
}