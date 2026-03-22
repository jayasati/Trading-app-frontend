"use client";

import StatusBadge from "@/components/ui/StatusBadge";

interface Position {
  id:           string;
  stockId:      string;
  symbol:       string;
  name:         string;
  exchange:     string;
  netQty:       number;
  buyQty:       number;
  sellQty:      number;
  avgBuyPrice:  number;
  avgSellPrice: number;
  livePrice:    number;
  status:       string;
}

interface OpenPositionsTableProps {
  positions:  Position[];
  livePrices: Record<string, number>;
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
  const totalPnl      = realisedPnl + unrealisedPnl;
  const invested      = pos.avgBuyPrice * pos.buyQty;
  const pnlPct        = invested > 0 ? (totalPnl / invested) * 100 : 0;
  return { realisedPnl, unrealisedPnl, pnlPct, live };
}

export default function OpenPositionsTable({
  positions, livePrices,
}: OpenPositionsTableProps) {
  return (
    <div className="card animate-fade-up" style={{ overflow: "hidden" }}>
      {/* Header */}
      <div
        style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 24px",
          borderBottom: "1px solid var(--color-border-soft)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Open Positions</span>
          <span
            style={{
              fontSize: 11, fontWeight: 700,
              color: "#d97706", background: "#fffbeb",
              padding: "2px 8px", borderRadius: 99,
            }}
          >
            {positions.length} active
          </span>
        </div>
        <div
          style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 12, color: "var(--color-gain)", fontWeight: 600,
          }}
        >
          <span
            style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "var(--color-gain)", display: "inline-block",
              animation: "pulse 2s infinite",
            }}
          />
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
          Live MTM
        </div>
      </div>

      {/* Table */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "var(--color-surface-2)" }}>
            {["Stock", "Qty", "Avg Buy", "LTP", "Unrealised P&L", "Realised P&L", "Status"].map(
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
            const live = livePrices[pos.stockId] ?? pos.livePrice ?? pos.avgBuyPrice;
            const mtm  = computeMTM(pos, live);
            const posU = mtm.unrealisedPnl >= 0;
            const posR = mtm.realisedPnl  >= 0;

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
                {/* Stock */}
                <td style={{ padding: "14px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 36, height: 36, borderRadius: "9px",
                        background: "#fffbeb", color: "#d97706",
                        fontWeight: 700, fontSize: 12,
                        display: "flex", alignItems: "center",
                        justifyContent: "center", flexShrink: 0,
                      }}
                    >
                      {pos.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13.5 }}>{pos.symbol}</div>
                      <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>
                        {pos.name} · {pos.exchange}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Qty */}
                <td style={{ textAlign: "right", padding: "14px 20px" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13.5 }}>
                    {pos.netQty}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>
                    B:{pos.buyQty} / S:{pos.sellQty}
                  </div>
                </td>

                {/* Avg Buy */}
                <td
                  style={{
                    textAlign: "right", padding: "14px 20px",
                    fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 13,
                  }}
                >
                  ₹{fmt(pos.avgBuyPrice)}
                </td>

                {/* LTP */}
                <td style={{ textAlign: "right", padding: "14px 20px" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13.5 }}>
                    ₹{fmt(mtm.live)}
                  </div>
                  <div
                    style={{
                      fontSize: 11, fontWeight: 600, marginTop: 2,
                      color: mtm.live >= pos.avgBuyPrice
                        ? "var(--color-gain)" : "var(--color-loss)",
                    }}
                  >
                    {mtm.live >= pos.avgBuyPrice ? "▲" : "▼"}
                    {Math.abs(
                      ((mtm.live - pos.avgBuyPrice) / pos.avgBuyPrice) * 100
                    ).toFixed(2)}%
                  </div>
                </td>

                {/* Unrealised P&L */}
                <td style={{ textAlign: "right", padding: "14px 20px" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13.5,
                      color: posU ? "var(--color-gain)" : "var(--color-loss)",
                    }}
                  >
                    {posU ? "+" : "-"}₹{fmt(Math.abs(mtm.unrealisedPnl))}
                  </div>
                  <span
                    style={{
                      fontSize: 11, fontWeight: 600,
                      color:      posU ? "var(--color-gain)"    : "var(--color-loss)",
                      background: posU ? "var(--color-gain-bg)" : "var(--color-loss-bg)",
                      padding: "1px 6px", borderRadius: 99,
                    }}
                  >
                    {posU ? "+" : ""}{mtm.pnlPct.toFixed(2)}%
                  </span>
                </td>

                {/* Realised P&L */}
                <td style={{ textAlign: "right", padding: "14px 20px" }}>
                  {mtm.realisedPnl !== 0 ? (
                    <div
                      style={{
                        fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13,
                        color: posR ? "var(--color-gain)" : "var(--color-loss)",
                      }}
                    >
                      {posR ? "+" : "-"}₹{fmt(Math.abs(mtm.realisedPnl))}
                    </div>
                  ) : (
                    <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>—</span>
                  )}
                </td>

                {/* Status */}
                <td style={{ textAlign: "right", padding: "14px 20px" }}>
                  <StatusBadge status={pos.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Square-off warning */}
      <div
        style={{
          padding: "12px 24px",
          background: "#fffbeb",
          borderTop: "1px solid #fde68a",
          display: "flex", alignItems: "center", gap: 8,
          fontSize: 12, color: "#92400e",
        }}
      >
        <span>⏰</span>
        <span>
          All open intraday positions will be{" "}
          <strong>auto squared-off at 3:20 PM IST</strong>. Make sure to
          close them before market closes.
        </span>
      </div>
    </div>
  );
}