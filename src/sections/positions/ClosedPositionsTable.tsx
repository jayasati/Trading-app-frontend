"use client";

import StatusBadge from "@/components/ui/StatusBadge";

interface Position {
  id:           string;
  symbol:       string;
  name:         string;
  buyQty:       number;
  sellQty:      number;
  avgBuyPrice:  number;
  avgSellPrice: number;
  status:       string;
}

function fmt(n: number) {
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

interface ClosedPositionsTableProps {
  positions: Position[];
}

export default function ClosedPositionsTable({ positions }: ClosedPositionsTableProps) {
  return (
    <div className="card animate-fade-up" style={{ overflow: "hidden" }}>
      <div
        style={{
          padding: "18px 24px",
          borderBottom: "1px solid var(--color-border-soft)",
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 15 }}>
          Closed Positions ({positions.length})
        </span>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "var(--color-surface-2)" }}>
            {["Stock", "Buy Qty", "Sell Qty", "Avg Buy", "Avg Sell", "Realised P&L", "Status"].map(
              (h, i) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 20px",
                    textAlign: i === 0 ? "left" : "right",
                    fontSize: 11, fontWeight: 600,
                    color: "var(--color-text-muted)",
                    letterSpacing: "0.5px", textTransform: "uppercase",
                  }}
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {positions.map((pos) => {
            const realised =
              (pos.avgSellPrice - pos.avgBuyPrice) *
              Math.min(pos.buyQty, pos.sellQty);
            const posR = realised >= 0;

            return (
              <tr
                key={pos.id}
                style={{
                  borderTop: "1px solid var(--color-border-soft)",
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
                <td style={{ padding: "13px 20px" }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{pos.symbol}</div>
                  <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>
                    {pos.name}
                  </div>
                </td>
                <td style={{ textAlign: "right", padding: "13px 20px", fontFamily: "var(--font-mono)", fontSize: 13 }}>
                  {pos.buyQty}
                </td>
                <td style={{ textAlign: "right", padding: "13px 20px", fontFamily: "var(--font-mono)", fontSize: 13 }}>
                  {pos.sellQty}
                </td>
                <td style={{ textAlign: "right", padding: "13px 20px", fontFamily: "var(--font-mono)", fontSize: 13 }}>
                  ₹{fmt(pos.avgBuyPrice)}
                </td>
                <td style={{ textAlign: "right", padding: "13px 20px", fontFamily: "var(--font-mono)", fontSize: 13 }}>
                  {pos.avgSellPrice > 0 ? `₹${fmt(pos.avgSellPrice)}` : "—"}
                </td>
                <td style={{ textAlign: "right", padding: "13px 20px" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13,
                      color: posR ? "var(--color-gain)" : "var(--color-loss)",
                    }}
                  >
                    {posR ? "+" : "-"}₹{fmt(Math.abs(realised))}
                  </div>
                </td>
                <td style={{ textAlign: "right", padding: "13px 20px" }}>
                  <StatusBadge status={pos.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}