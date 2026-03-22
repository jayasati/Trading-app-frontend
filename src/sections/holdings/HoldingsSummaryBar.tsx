"use client";

interface SummaryBarProps {
  totalCurrent:   number;
  totalInvested:  number;
  totalReturns:   number;
  totalReturnsPct: number;
}

function fmt(n: number) {
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function HoldingsSummaryBar({
  totalCurrent,
  totalInvested,
  totalReturns,
  totalReturnsPct,
}: SummaryBarProps) {
  const stats = [
    {
      label:    "Current Value",
      value:    `₹${fmt(totalCurrent)}`,
      sub:      null,
      accent:   false,
      positive: true,
    },
    {
      label:    "Invested Value",
      value:    `₹${fmt(totalInvested)}`,
      sub:      null,
      accent:   false,
      positive: true,
    },
    {
      label:    "1D Returns",
      value:    `₹${fmt(Math.abs(totalReturns * 0.1))}`,
      sub:      "+0.96%",
      accent:   true,
      positive: true,
    },
    {
      label:    "Total Returns",
      value:    `${totalReturns >= 0 ? "+" : "-"}₹${fmt(Math.abs(totalReturns))}`,
      sub:      `${totalReturnsPct >= 0 ? "+" : ""}${totalReturnsPct.toFixed(2)}%`,
      accent:   true,
      positive: totalReturns >= 0,
    },
  ];

  return (
    <div
      className="card animate-fade-up"
      style={{
        padding: "24px 28px",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "20px",
      }}
    >
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          style={{
            borderLeft: i > 0 ? "1px solid var(--color-border-soft)" : "none",
            paddingLeft: i > 0 ? "20px" : 0,
          }}
        >
          <p
            style={{
              fontSize: "11.5px",
              color: "var(--color-text-muted)",
              fontWeight: 500,
              marginBottom: "6px",
              letterSpacing: "0.3px",
            }}
          >
            {stat.label.toUpperCase()}
          </p>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              fontSize: "20px",
              color: stat.accent
                ? stat.positive ? "var(--color-gain)" : "var(--color-loss)"
                : "var(--color-text-primary)",
              letterSpacing: "-0.5px",
            }}
          >
            {stat.value}
          </p>
          {stat.sub && (
            <p
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: stat.positive ? "var(--color-gain)" : "var(--color-loss)",
                marginTop: "2px",
              }}
            >
              {stat.sub}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}