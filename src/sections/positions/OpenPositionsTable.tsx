"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/ui/StatusBadge";
import ClosePositionModal from "./ClosePositionModal";

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
  onRefetch:  () => void;
}

function fmt(n: number) {
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Compute MTM P&L correctly for both long and short positions.
 *
 * Long (buyQty > sellQty):
 *   unrealised = (livePrice - avgBuyPrice) × netQty
 *   realised   = (avgSellPrice - avgBuyPrice) × matchedQty  [partial exits]
 *
 * Short (sellQty > buyQty, avgBuyPrice = 0):
 *   unrealised = (avgSellPrice - livePrice) × netShortQty
 *   realised   = (avgSellPrice - avgBuyPrice) × matchedQty  [partial covers]
 *
 * Mixed (buyQty === sellQty, position closed):
 *   unrealised = 0
 *   realised   = (avgSellPrice - avgBuyPrice) × buyQty
 */
function computeMTM(pos: Position, live: number) {
  const matchedQty = Math.min(pos.buyQty, pos.sellQty);

  // Realised P&L — applies whenever some buys and sells have matched
  const realisedPnl =
    matchedQty > 0 && pos.avgBuyPrice > 0
      ? (pos.avgSellPrice - pos.avgBuyPrice) * matchedQty
      : 0;

  let unrealisedPnl = 0;

  if (pos.buyQty > pos.sellQty) {
    // Net LONG position
    unrealisedPnl = (live - pos.avgBuyPrice) * pos.netQty;
  } else if (pos.sellQty > pos.buyQty) {
    // Net SHORT position (short sell)
    const netShortQty = pos.sellQty - pos.buyQty;
    unrealisedPnl = (pos.avgSellPrice - live) * netShortQty;
  }
  // If buyQty === sellQty → netQty = 0 → unrealised = 0 (position closed)

  const totalPnl = realisedPnl + unrealisedPnl;
  const invested = pos.avgBuyPrice > 0
    ? pos.avgBuyPrice * pos.buyQty
    : pos.avgSellPrice * pos.sellQty; // short: use sell value as "invested"
  const pnlPct = invested > 0 ? (totalPnl / invested) * 100 : 0;

  return { realisedPnl, unrealisedPnl, pnlPct, live };
}

/**
 * Determine the "side" of this position so ClosePositionModal knows
 * which direction order to place when closing.
 *
 *  Long  → close by SELL
 *  Short → close by BUY
 */
function positionSide(pos: Position): "BUY" | "SELL" {
  return pos.buyQty >= pos.sellQty ? "BUY" : "SELL";
}

export default function OpenPositionsTable({
  positions, livePrices, onRefetch,
}: OpenPositionsTableProps) {
  const [closingPos, setClosingPos] = useState<Position | null>(null);
  const router = useRouter();

  return (
    <>
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
              {[
                "Stock",
                "Qty / Side",
                "Avg Buy",
                "Avg Sell",
                "LTP",
                "Unrealised P&L",
                "Realised P&L",
                "Status",
                "",
              ].map((h, i) => (
                <th
                  key={`${h}-${i}`}
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
              ))}
            </tr>
          </thead>
          <tbody>
            {positions.map((pos) => {
              const live = livePrices[pos.stockId] ?? pos.livePrice ?? pos.avgBuyPrice;
              const mtm  = computeMTM(pos, live);
              const posU = mtm.unrealisedPnl >= 0;
              const posR = mtm.realisedPnl  >= 0;
              const side = positionSide(pos);
              const isShort = side === "SELL"; // net short position

              // Net quantity to display
              const netShortQty = pos.sellQty - pos.buyQty;
              const displayQty  = isShort ? netShortQty : pos.netQty;

              return (
                <tr
                  key={pos.id}
                  style={{
                    borderTop: "1px solid var(--color-border-soft)",
                    transition: "background 0.1s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background =
                      "var(--color-surface-2)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background =
                      "transparent")
                  }
                  onClick={() => router.push(`/stock/${pos.stockId}`)}
                >
                  {/* Stock */}
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 36, height: 36, borderRadius: "9px",
                          background: isShort ? "var(--color-loss-bg)" : "#fffbeb",
                          color: isShort ? "var(--color-loss)" : "#d97706",
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

                  {/* Qty / Side */}
                  <td style={{ textAlign: "right", padding: "14px 20px" }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13.5 }}>
                      {displayQty}
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 2 }}>
                      <span
                        style={{
                          fontSize: 10.5, fontWeight: 700,
                          color: isShort ? "var(--color-loss)" : "var(--color-gain)",
                          background: isShort ? "var(--color-loss-bg)" : "var(--color-gain-bg)",
                          padding: "1px 7px", borderRadius: 99,
                        }}
                      >
                        {isShort ? "SHORT" : "LONG"}
                      </span>
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
                    {pos.avgBuyPrice > 0 ? `₹${fmt(pos.avgBuyPrice)}` : "—"}
                  </td>

                  {/* Avg Sell */}
                  <td
                    style={{
                      textAlign: "right", padding: "14px 20px",
                      fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 13,
                    }}
                  >
                    {pos.avgSellPrice > 0 ? `₹${fmt(pos.avgSellPrice)}` : "—"}
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
                      {mtm.live >= (pos.avgBuyPrice || pos.avgSellPrice) ? "▲" : "▼"}
                      {Math.abs(
                        (((mtm.live - (pos.avgBuyPrice || pos.avgSellPrice)) /
                          (pos.avgBuyPrice || pos.avgSellPrice)) * 100)
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

                  {/* Close button — works for both LONG and SHORT */}
                  <td
                    style={{ textAlign: "right", padding: "14px 20px" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {displayQty > 0 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setClosingPos(pos); }}
                        style={{
                          padding: "5px 14px",
                          borderRadius: "var(--radius-sm)",
                          border: `1px solid ${isShort ? "rgba(37,99,235,0.35)" : "rgba(220,38,38,0.35)"}`,
                          background: "transparent",
                          color: isShort ? "var(--color-primary)" : "var(--color-loss)",
                          fontSize: 12, fontWeight: 600,
                          cursor: "pointer", fontFamily: "var(--font-sans)",
                          transition: "all 0.15s", whiteSpace: "nowrap",
                        }}
                        onMouseEnter={(e) => {
                          const b = e.currentTarget as HTMLButtonElement;
                          b.style.background  = isShort ? "var(--color-primary-light)" : "var(--color-loss-bg)";
                          b.style.borderColor = isShort ? "var(--color-primary)" : "var(--color-loss)";
                        }}
                        onMouseLeave={(e) => {
                          const b = e.currentTarget as HTMLButtonElement;
                          b.style.background  = "transparent";
                          b.style.borderColor = isShort ? "rgba(37,99,235,0.35)" : "rgba(220,38,38,0.35)";
                        }}
                      >
                        {isShort ? "Cover" : "Close"}
                      </button>
                    )}
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

      {/* Close / Cover Position Modal */}
      {closingPos && (
        <ClosePositionModal
          position={{
            stockId:     closingPos.stockId,
            symbol:      closingPos.symbol,
            name:        closingPos.name,
            // For shorts, netQty is 0 (buyQty=0,sellQty>0), pass the actual open qty
            netQty:      positionSide(closingPos) === "SELL"
              ? closingPos.sellQty - closingPos.buyQty
              : closingPos.netQty,
            avgBuyPrice: closingPos.avgBuyPrice,
            livePrice:   livePrices[closingPos.stockId] ?? closingPos.livePrice ?? closingPos.avgBuyPrice,
            // Pass the actual position side so modal picks the correct close direction
            side:        positionSide(closingPos),
          }}
          onClose={() => setClosingPos(null)}
          onOrderDone={() => {
            setClosingPos(null);
            onRefetch();
          }}
        />
      )}
    </>
  );
}