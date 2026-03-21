"use client";

const TICKER_DATA = [
  { symbol: "NIFTY 50",    price: "23,114.50", change: "+112.35", pct: "+0.49%", positive: true },
  { symbol: "SENSEX",      price: "74,532.96", change: "+325.72", pct: "+0.44%", positive: true },
  { symbol: "BANKNIFTY",   price: "53,427.05", change: "-23.95",  pct: "-0.04%", positive: false },
  { symbol: "MIDCPNIFTY",  price: "12,625.90", change: "+108.90", pct: "+0.87%", positive: true },
  { symbol: "FINNIFTY",    price: "24,781.15", change: "+58.20",  pct: "+0.24%", positive: true },
  { symbol: "NIFTYNXT50",  price: "64,320.10", change: "+210.55", pct: "+0.33%", positive: true },
];

// Duplicate for seamless loop
const ITEMS = [...TICKER_DATA, ...TICKER_DATA];

export default function MarketTicker() {
  return (
    <div
      style={{
        background: "var(--color-ticker-bg)",
        overflow: "hidden",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        height: "38px",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div className="ticker-track" style={{ gap: 0 }}>
        {ITEMS.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "0 28px",
              borderRight: "1px solid rgba(255,255,255,0.08)",
              whiteSpace: "nowrap",
              cursor: "default",
            }}
          >
            <span
              style={{
                fontSize: "11.5px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.55)",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              {item.symbol}
            </span>
            <span
              style={{
                fontSize: "12.5px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.9)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {item.price}
            </span>
            <span
              style={{
                fontSize: "11.5px",
                fontWeight: 600,
                color: item.positive ? "#4ade80" : "#f87171",
              }}
            >
              {item.change} ({item.pct})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}