"use client";

interface HoldingRow {
  id:          string;
  stockId:     string;
  livePrice:   number | null;
  avgPrice:    number;
  qty:         number;
  invested:    number;
  current:     number;
  returns:     number;
  returnsPct:  number;
  stock?: {
    symbol: string;
    name:   string;
  };
}

function fmt(n: number) {
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

interface HoldingsTableProps {
  rows: HoldingRow[];
}

export default function HoldingsTable({ rows }: HoldingsTableProps) {
  if (rows.length === 0) {
    return (
      <div
        className="card"
        style={{
          padding: "60px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div style={{ fontSize: "48px" }}>🔭</div>
        <p style={{ fontWeight: 700, fontSize: "16px" }}>No holdings yet</p>
        <p style={{ color: "var(--color-text-muted)", fontSize: "13.5px" }}>
          Start investing by placing a buy order from the Explore tab
        </p>
      </div>
    );
  }

  return (
    <div className="card animate-fade-up" style={{ overflow: "hidden" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 24px",
          borderBottom: "1px solid var(--color-border-soft)",
        }}
      >
        <span style={{ fontWeight: 700, fontSize: "15px" }}>
          Holdings ({rows.length})
        </span>
        <button
          style={{
            padding: "6px 14px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
            background: "var(--color-surface)",
            fontSize: "12.5px",
            fontWeight: 500,
            color: "var(--color-text-secondary)",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Hide amounts
        </button>
      </div>

      {/* Table */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "var(--color-surface-2)" }}>
            {["Company", "Market price", "Returns (%)", "Current / Invested"].map((h, i) => (
              <th
                key={h}
                style={{
                  padding: "10px 24px",
                  textAlign: i === 0 ? "left" : "right",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--color-text-muted)",
                  letterSpacing: "0.6px",
                  textTransform: "uppercase",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const pos = row.returnsPct >= 0;
            return (
              <tr
                key={row.id || i}
                style={{
                  borderTop: "1px solid var(--color-border-soft)",
                  cursor: "pointer",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLTableRowElement).style.background =
                    "var(--color-surface-2)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLTableRowElement).style.background =
                    "transparent")
                }
              >
                {/* Company */}
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: 38, height: 38,
                        borderRadius: "9px",
                        background: "var(--color-primary-light)",
                        color: "var(--color-primary)",
                        fontWeight: 700, fontSize: "12px",
                        display: "flex", alignItems: "center",
                        justifyContent: "center", flexShrink: 0,
                      }}
                    >
                      {row.stock?.symbol?.slice(0, 2) ?? "??"}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "13.5px" }}>
                        {row.stock?.symbol ?? "—"}
                      </div>
                      <div style={{ fontSize: "11.5px", color: "var(--color-text-muted)" }}>
                        {row.qty} shares · Avg ₹{fmt(row.avgPrice)}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Market price */}
                <td style={{ textAlign: "right", padding: "16px 24px" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontWeight: 600, fontSize: "13.5px",
                    }}
                  >
                    {row.livePrice !== null ? `₹${fmt(row.livePrice)}` : "—"}
                  </div>
                  <div style={{ fontSize: "11.5px", color: "var(--color-gain)", marginTop: "2px" }}>
                    Live
                  </div>
                </td>

                {/* Returns */}
                <td style={{ textAlign: "right", padding: "16px 24px" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700, fontSize: "13.5px",
                      color: pos ? "var(--color-gain)" : "var(--color-loss)",
                    }}
                  >
                    {row.returns >= 0 ? "+" : "-"}₹{fmt(Math.abs(row.returns))}
                  </div>
                  <span
                    style={{
                      fontSize: "11.5px", fontWeight: 600,
                      color:      pos ? "var(--color-gain)"    : "var(--color-loss)",
                      background: pos ? "var(--color-gain-bg)" : "var(--color-loss-bg)",
                      padding: "1px 7px", borderRadius: "99px",
                    }}
                  >
                    {row.returnsPct >= 0 ? "+" : ""}{row.returnsPct.toFixed(2)}%
                  </span>
                </td>

                {/* Current / Invested */}
                <td style={{ textAlign: "right", padding: "16px 24px" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontWeight: 600, fontSize: "13.5px",
                    }}
                  >
                    ₹{fmt(row.current)}
                  </div>
                  <div
                    style={{
                      fontSize: "11.5px",
                      color: "var(--color-text-muted)",
                      marginTop: "2px",
                    }}
                  >
                    ₹{fmt(row.invested)}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}