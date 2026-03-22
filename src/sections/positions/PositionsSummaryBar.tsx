"use client";

interface Position {
  stockId:      string;
  buyQty:       number;
  sellQty:      number;
  avgBuyPrice:  number;
  avgSellPrice: number;
  netQty:       number;
  livePrice:    number;
}

interface PositionsSummaryBarProps {
  positions:   Position[];
  livePrices:  Record<string, number>;
}

function fmt(n: number) {
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function computeMTM(pos: Position, live: number) {
  const matchedQty    = Math.min(pos.buyQty, pos.sellQty);
  const realisedPnl   = matchedQty > 0
    ? (pos.avgSellPrice - pos.avgBuyPrice) * matchedQty : 0;
  const unrealisedPnl = pos.netQty > 0
    ? (live - pos.avgBuyPrice) * pos.netQty : 0;
  return { realisedPnl, unrealisedPnl };
}

export default function PositionsSummaryBar({
  positions, livePrices,
}: PositionsSummaryBarProps) {
  let totalRealised   = 0;
  let totalUnrealised = 0;

  positions.forEach((pos) => {
    const live = livePrices[pos.stockId] ?? pos.livePrice;
    const mtm  = computeMTM(pos, live);
    totalRealised   += mtm.realisedPnl;
    totalUnrealised += mtm.unrealisedPnl;
  });

  const totalPnl = totalRealised + totalUnrealised;

  const stats = [
    { label: "Total P&L",      value: totalPnl,        isPositive: totalPnl >= 0 },
    { label: "Realised P&L",   value: totalRealised,   isPositive: totalRealised >= 0 },
    { label: "Unrealised P&L", value: totalUnrealised, isPositive: totalUnrealised >= 0 },
  ];

  return (
    <div
      className="card animate-fade-up"
      style={{
        padding: "22px 28px",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 20,
      }}
    >
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          style={{
            borderLeft: i > 0 ? "1px solid var(--color-border-soft)" : "none",
            paddingLeft: i > 0 ? 20 : 0,
          }}
        >
          <p
            style={{
              fontSize: 11, color: "var(--color-text-muted)",
              fontWeight: 500, marginBottom: 6, letterSpacing: "0.3px",
            }}
          >
            {stat.label.toUpperCase()}
          </p>
          <p
            style={{
              fontFamily: "var(--font-mono)", fontWeight: 800,
              fontSize: 22, letterSpacing: "-0.5px",
              color: stat.isPositive ? "var(--color-gain)" : "var(--color-loss)",
            }}
          >
            {stat.isPositive ? "+" : "-"}₹{fmt(Math.abs(stat.value))}
          </p>
        </div>
      ))}
    </div>
  );
}