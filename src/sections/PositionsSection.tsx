"use client";
// src/sections/PositionsSection.tsx

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useLivePrices } from "@/hooks/useLivePrices";

function fmt(n: number) {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

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
  realisedPnl:  number;
  unrealisedPnl:number;
  totalPnl:     number;
  pnlPct:       number;
  status:       string;
}

/* ─── MTM P&L computed from live price ─── */
function computeMTM(pos: Position, livePrice: number) {
  const live           = livePrice || pos.avgBuyPrice;
  const matchedQty     = Math.min(pos.buyQty, pos.sellQty);
  const realisedPnl    = matchedQty > 0
    ? (pos.avgSellPrice - pos.avgBuyPrice) * matchedQty
    : 0;
  const unrealisedPnl  = pos.netQty > 0
    ? (live - pos.avgBuyPrice) * pos.netQty
    : 0;
  const totalPnl       = realisedPnl + unrealisedPnl;
  const invested       = pos.avgBuyPrice * pos.buyQty;
  const pnlPct         = invested > 0 ? (totalPnl / invested) * 100 : 0;
  return { realisedPnl, unrealisedPnl, totalPnl, pnlPct, live };
}

/* ─── Status badge ─── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string; label: string }> = {
    OPEN:         { color: "#d97706",              bg: "#fffbeb",               label: "Open" },
    CLOSED:       { color: "var(--color-gain)",    bg: "var(--color-gain-bg)",  label: "Closed" },
    SQUARED_OFF:  { color: "var(--color-text-muted)", bg: "var(--color-surface-2)", label: "Sq. Off" },
  };
  const s = map[status] ?? map.OPEN;
  return (
    <span style={{
      fontSize: 11, fontWeight: 700,
      color: s.color, background: s.bg,
      padding: "2px 8px", borderRadius: 99,
    }}>
      {s.label}
    </span>
  );
}

/* ─── Summary bar ─── */
function SummaryBar({ positions, livePrices }: { positions: Position[]; livePrices: Record<string, number> }) {
  let totalRealised   = 0;
  let totalUnrealised = 0;

  positions.forEach(pos => {
    const live = livePrices[pos.stockId] ?? pos.livePrice;
    const mtm  = computeMTM(pos, live);
    totalRealised   += mtm.realisedPnl;
    totalUnrealised += mtm.unrealisedPnl;
  });

  const totalPnl = totalRealised + totalUnrealised;
  const posTotal = totalPnl >= 0;

  return (
    <div className="card animate-fade-up" style={{
      padding: "22px 28px",
      display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20,
    }}>
      {[
        { label: "Total P&L",       value: totalPnl,     isPositive: posTotal },
        { label: "Realised P&L",    value: totalRealised, isPositive: totalRealised >= 0 },
        { label: "Unrealised P&L",  value: totalUnrealised, isPositive: totalUnrealised >= 0 },
      ].map((stat, i) => (
        <div key={i} style={{
          borderLeft: i > 0 ? "1px solid var(--color-border-soft)" : "none",
          paddingLeft: i > 0 ? 20 : 0,
        }}>
          <p style={{ fontSize: 11, color: "var(--color-text-muted)", fontWeight: 500, marginBottom: 6, letterSpacing: "0.3px" }}>
            {stat.label.toUpperCase()}
          </p>
          <p style={{
            fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: 22,
            color: stat.isPositive ? "var(--color-gain)" : "var(--color-loss)",
            letterSpacing: "-0.5px",
          }}>
            {stat.isPositive ? "+" : "-"}₹{fmt(Math.abs(stat.value))}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ─── Main ─── */
export default function PositionsSection() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [squaring,  setSquaring]  = useState<string | null>(null);

  const fetchPositions = useCallback(async () => {
    try {
      const res = await api.get("/positions");
      setPositions(Array.isArray(res.data) ? res.data : []);
    } catch {
      setPositions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPositions(); }, [fetchPositions]);

  // Refresh every 10s during market hours for live MTM
  useEffect(() => {
    const interval = setInterval(fetchPositions, 10_000);
    return () => clearInterval(interval);
  }, [fetchPositions]);

  const stockIds   = positions.map(p => p.stockId);
  const livePrices = useLivePrices(stockIds);

  const openPositions   = positions.filter(p => p.status === "OPEN");
  const closedPositions = positions.filter(p => p.status !== "OPEN");

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "80px", color: "var(--color-text-muted)" }}>
        Loading positions…
      </div>
    );
  }

  if (!positions.length) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="card animate-fade-up" style={{
          padding: "64px 32px", textAlign: "center",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
          border: "1.5px dashed var(--color-border)", boxShadow: "none",
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: "#fffbeb",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
          }}>⚡</div>
          <p style={{ fontWeight: 700, fontSize: 17 }}>No intraday positions today</p>
          <p style={{ color: "var(--color-text-muted)", fontSize: 13.5, maxWidth: 320, lineHeight: 1.6 }}>
            Place an intraday order from any stock page. Positions auto square-off at 3:20 PM.
          </p>
          <div style={{
            padding: "8px 16px", borderRadius: "var(--radius-md)",
            background: "#fffbeb", border: "1px solid #fde68a",
            fontSize: 12, color: "#92400e", fontWeight: 600,
          }}>
            ⏰ Auto square-off at 3:20 PM IST
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Summary */}
      <SummaryBar positions={positions} livePrices={livePrices} />

      {/* Open positions */}
      {openPositions.length > 0 && (
        <div className="card animate-fade-up" style={{ overflow: "hidden" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "18px 24px",
            borderBottom: "1px solid var(--color-border-soft)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>Open Positions</span>
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: "#d97706", background: "#fffbeb",
                padding: "2px 8px", borderRadius: 99,
              }}>
                {openPositions.length} active
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--color-gain)", fontWeight: 600 }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "var(--color-gain)", display: "inline-block",
                animation: "pulse 2s infinite",
              }} />
              <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
              Live MTM
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--color-surface-2)" }}>
                {["Stock", "Qty", "Avg Buy", "LTP", "Unrealised P&L", "Realised P&L", "Status"].map((h, i) => (
                  <th key={h} style={{
                    padding: "10px 20px",
                    textAlign: i === 0 ? "left" : "right",
                    fontSize: 11, fontWeight: 600,
                    color: "var(--color-text-muted)",
                    letterSpacing: "0.5px", textTransform: "uppercase",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {openPositions.map((pos, i) => {
                const live = livePrices[pos.stockId] ?? pos.livePrice ?? pos.avgBuyPrice;
                const mtm  = computeMTM(pos, live);
                const posU = mtm.unrealisedPnl >= 0;
                const posR = mtm.realisedPnl >= 0;

                return (
                  <tr
                    key={pos.id}
                    style={{
                      borderTop: "1px solid var(--color-border-soft)",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLTableRowElement).style.background = "var(--color-surface-2)")}
                    onMouseLeave={e => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}
                  >
                    {/* Stock */}
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: "9px",
                          background: "#fffbeb", color: "#d97706",
                          fontWeight: 700, fontSize: 12,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                        }}>
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
                    <td style={{ textAlign: "right", padding: "14px 20px", fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 13 }}>
                      ₹{fmt(pos.avgBuyPrice)}
                    </td>

                    {/* LTP */}
                    <td style={{ textAlign: "right", padding: "14px 20px" }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13.5 }}>
                        ₹{fmt(mtm.live)}
                      </div>
                      <div style={{
                        fontSize: 11, fontWeight: 600, marginTop: 2,
                        color: mtm.live >= pos.avgBuyPrice ? "var(--color-gain)" : "var(--color-loss)",
                      }}>
                        {mtm.live >= pos.avgBuyPrice ? "▲" : "▼"}
                        {Math.abs(((mtm.live - pos.avgBuyPrice) / pos.avgBuyPrice) * 100).toFixed(2)}%
                      </div>
                    </td>

                    {/* Unrealised P&L */}
                    <td style={{ textAlign: "right", padding: "14px 20px" }}>
                      <div style={{
                        fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13.5,
                        color: posU ? "var(--color-gain)" : "var(--color-loss)",
                      }}>
                        {posU ? "+" : "-"}₹{fmt(Math.abs(mtm.unrealisedPnl))}
                      </div>
                      <span style={{
                        fontSize: 11, fontWeight: 600,
                        color: posU ? "var(--color-gain)" : "var(--color-loss)",
                        background: posU ? "var(--color-gain-bg)" : "var(--color-loss-bg)",
                        padding: "1px 6px", borderRadius: 99,
                      }}>
                        {posU ? "+" : ""}{mtm.pnlPct.toFixed(2)}%
                      </span>
                    </td>

                    {/* Realised P&L */}
                    <td style={{ textAlign: "right", padding: "14px 20px" }}>
                      {mtm.realisedPnl !== 0 ? (
                        <div style={{
                          fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13,
                          color: posR ? "var(--color-gain)" : "var(--color-loss)",
                        }}>
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
          <div style={{
            padding: "12px 24px",
            background: "#fffbeb",
            borderTop: "1px solid #fde68a",
            display: "flex", alignItems: "center", gap: 8,
            fontSize: 12, color: "#92400e",
          }}>
            <span>⏰</span>
            <span>All open intraday positions will be <strong>auto squared-off at 3:20 PM IST</strong>. Make sure to close them before market closes.</span>
          </div>
        </div>
      )}

      {/* Closed / Squared off positions */}
      {closedPositions.length > 0 && (
        <div className="card animate-fade-up" style={{ overflow: "hidden" }}>
          <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--color-border-soft)" }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>
              Closed Positions ({closedPositions.length})
            </span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--color-surface-2)" }}>
                {["Stock", "Buy Qty", "Sell Qty", "Avg Buy", "Avg Sell", "Realised P&L", "Status"].map((h, i) => (
                  <th key={h} style={{
                    padding: "10px 20px",
                    textAlign: i === 0 ? "left" : "right",
                    fontSize: 11, fontWeight: 600,
                    color: "var(--color-text-muted)",
                    letterSpacing: "0.5px", textTransform: "uppercase",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {closedPositions.map((pos, i) => {
                const realised = (pos.avgSellPrice - pos.avgBuyPrice) * Math.min(pos.buyQty, pos.sellQty);
                const posR     = realised >= 0;
                return (
                  <tr
                    key={pos.id}
                    style={{ borderTop: "1px solid var(--color-border-soft)", transition: "background 0.1s" }}
                    onMouseEnter={e => ((e.currentTarget as HTMLTableRowElement).style.background = "var(--color-surface-2)")}
                    onMouseLeave={e => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}
                  >
                    <td style={{ padding: "13px 20px" }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{pos.symbol}</div>
                      <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>{pos.name}</div>
                    </td>
                    <td style={{ textAlign: "right", padding: "13px 20px", fontFamily: "var(--font-mono)", fontSize: 13 }}>{pos.buyQty}</td>
                    <td style={{ textAlign: "right", padding: "13px 20px", fontFamily: "var(--font-mono)", fontSize: 13 }}>{pos.sellQty}</td>
                    <td style={{ textAlign: "right", padding: "13px 20px", fontFamily: "var(--font-mono)", fontSize: 13 }}>₹{fmt(pos.avgBuyPrice)}</td>
                    <td style={{ textAlign: "right", padding: "13px 20px", fontFamily: "var(--font-mono)", fontSize: 13 }}>
                      {pos.avgSellPrice > 0 ? `₹${fmt(pos.avgSellPrice)}` : "—"}
                    </td>
                    <td style={{ textAlign: "right", padding: "13px 20px" }}>
                      <div style={{
                        fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13,
                        color: posR ? "var(--color-gain)" : "var(--color-loss)",
                      }}>
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
      )}
    </div>
  );
}