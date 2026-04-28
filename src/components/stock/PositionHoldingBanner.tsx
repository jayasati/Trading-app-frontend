"use client";

/**
 * PositionHoldingBanner
 * ─────────────────────
 * Shown on the StockDetailPage under the chart/order panel.
 * Fetches the user's holding (delivery) AND today's intraday position
 * for this stock and renders a compact info strip.
 *
 * Similar to the Groww "X Shares · Avg Price ₹Y" panel.
 */

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { isMarketOpen } from "@/lib/time";

interface HoldingInfo {
  quantity:  number;
  avgPrice:  number;
  lockedQty: number;
}

interface PositionInfo {
  netQty:       number;
  buyQty:       number;
  sellQty:      number;
  avgBuyPrice:  number;
  avgSellPrice: number;
  status:       string;
}

interface Props {
  stockId:   string;
  livePrice: number;
}

function fmt(n: number) {
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function PnlChip({ value, pct }: { value: number; pct: number }) {
  const pos = value >= 0;
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 3,
        fontSize: 12, fontWeight: 700,
        color:      pos ? "var(--color-gain)"    : "var(--color-loss)",
        background: pos ? "var(--color-gain-bg)" : "var(--color-loss-bg)",
        padding: "2px 8px", borderRadius: 99,
        fontFamily: "var(--font-mono)",
      }}
    >
      {pos ? "+" : ""}₹{fmt(Math.abs(value))}
      &nbsp;({pos ? "+" : ""}{pct.toFixed(2)}%)
    </span>
  );
}

export default function PositionHoldingBanner({ stockId, livePrice }: Props) {
  const [holding,  setHolding]  = useState<HoldingInfo | null>(null);
  const [position, setPosition] = useState<PositionInfo | null>(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        // Fetch portfolio (holdings)
        const [portfolioRes, positionsRes] = await Promise.allSettled([
          api.get("/portfolio"),
          api.get("/positions"),
        ]);

        if (cancelled) return;

        // ── Holdings ──
        if (portfolioRes.status === "fulfilled") {
          const holdings: any[] = Array.isArray(portfolioRes.value.data)
            ? portfolioRes.value.data : [];
          const match = holdings.find((h: any) => h.stockId === stockId);
          if (match) {
            setHolding({
              quantity:  Number(match.quantity  ?? 0),
              avgPrice:  Number(match.avgPrice  ?? 0),
              lockedQty: Number(match.lockedQty ?? 0),
            });
          }
        }

        // ── Intraday positions ──
        if (positionsRes.status === "fulfilled") {
          const positions: any[] = Array.isArray(positionsRes.value.data)
            ? positionsRes.value.data : [];
          const match = positions.find((p: any) => p.stockId === stockId);
          if (match) {
            setPosition({
              netQty:       Number(match.netQty       ?? 0),
              buyQty:       Number(match.buyQty       ?? 0),
              sellQty:      Number(match.sellQty      ?? 0),
              avgBuyPrice:  Number(match.avgBuyPrice  ?? 0),
              avgSellPrice: Number(match.avgSellPrice ?? 0),
              status:       match.status,
            });
          }
        }
      } catch {
        // non-critical
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [stockId]);

  // Nothing to show
  if (loading) return null;
  if (!holding && !position) return null;

  const hasHolding  = holding  && holding.quantity  > 0;
  const hasPosition = position && (position.buyQty > 0 || position.sellQty > 0);

  return (
    <div
      style={{
        display: "flex", flexDirection: "column", gap: 10,
        marginBottom: 4,
      }}
    >

      {/* ── DELIVERY HOLDING CARD ── */}
      {hasHolding && (
        <div
          className="card"
          style={{
            padding: "16px 20px",
            background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
            border: "1.5px solid var(--color-primary-mid)",
          }}
        >
          {/* Header row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: "var(--color-primary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <span style={{ fontWeight: 700, fontSize: 13.5, color: "var(--color-primary)" }}>
                Your Holding
              </span>
              <span
                style={{
                  fontSize: 10.5, fontWeight: 600,
                  color: "var(--color-primary)",
                  background: "var(--color-primary-mid)",
                  padding: "1px 7px", borderRadius: 99,
                }}
              >
                DELIVERY
              </span>
            </div>
            {/* Live/Closed badge */}
            {isMarketOpen() ? (
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{
                  width: 5, height: 5, borderRadius: "50%",
                  background: "var(--color-gain)", display: "inline-block",
                  animation: "pulse 2s infinite",
                }} />
                <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-gain)" }}>Live</span>
              </div>
            ) : (
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-muted)" }}>Closed</span>
            )}
          </div>

          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px 16px" }}>
            {/* Shares held */}
            <div>
              <div style={{ fontSize: 10.5, color: "var(--color-text-muted)", marginBottom: 3 }}>
                Shares held
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: 16, color: "var(--color-text-primary)" }}>
                {holding!.quantity}
              </div>
              {holding!.lockedQty > 0 && (
                <div style={{ fontSize: 10.5, color: "var(--color-text-muted)", marginTop: 2 }}>
                  {holding!.lockedQty} locked
                </div>
              )}
            </div>

            {/* Avg buy price */}
            <div>
              <div style={{ fontSize: 10.5, color: "var(--color-text-muted)", marginBottom: 3 }}>
                Avg buy price
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 14 }}>
                ₹{fmt(holding!.avgPrice)}
              </div>
            </div>

            {/* Current value */}
            <div>
              <div style={{ fontSize: 10.5, color: "var(--color-text-muted)", marginBottom: 3 }}>
                Current value
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 14 }}>
                {livePrice > 0
                  ? `₹${fmt(livePrice * holding!.quantity)}`
                  : "—"}
              </div>
            </div>

            {/* P&L */}
            <div>
              <div style={{ fontSize: 10.5, color: "var(--color-text-muted)", marginBottom: 3 }}>
                Unrealised P&L
              </div>
              {livePrice > 0 ? (() => {
                const pnl    = (livePrice - holding!.avgPrice) * holding!.quantity;
                const invest = holding!.avgPrice * holding!.quantity;
                const pct    = invest > 0 ? (pnl / invest) * 100 : 0;
                return <PnlChip value={pnl} pct={pct} />;
              })() : (
                <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>—</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── INTRADAY POSITION CARD ── */}
      {hasPosition && (
        <div
          className="card"
          style={{
            padding: "16px 20px",
            background: "linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)",
            border: "1.5px solid #fde68a",
          }}
        >
          {/* Header row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: "#d97706",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <span style={{ fontSize: 13 }}>⚡</span>
              </div>
              <span style={{ fontWeight: 700, fontSize: 13.5, color: "#92400e" }}>
                Intraday Position
              </span>
              {/* Long/Short badge */}
              {(() => {
                const isShort = position!.sellQty > position!.buyQty;
                return (
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
                );
              })()}
              <span
                style={{
                  fontSize: 10.5, fontWeight: 600,
                  color: "#92400e", background: "#fef3c7",
                  padding: "1px 7px", borderRadius: 99,
                }}
              >
                {position!.status}
              </span>
            </div>
            <span style={{ fontSize: 11, color: "var(--color-text-muted)", fontWeight: 600 }}>
              Auto sq-off @ 3:20 PM
            </span>
          </div>

          {/* Stats grid */}
          {(() => {
            const pos     = position!;
            const isShort = pos.sellQty > pos.buyQty;
            const netQty  = isShort ? pos.sellQty - pos.buyQty : pos.netQty;
            const refPrice= isShort ? pos.avgSellPrice : pos.avgBuyPrice;

            // Unrealised P&L
            let unrealised = 0;
            if (!isShort && netQty > 0 && pos.avgBuyPrice > 0) {
              unrealised = (livePrice - pos.avgBuyPrice) * netQty;
            } else if (isShort && netQty > 0 && pos.avgSellPrice > 0) {
              unrealised = (pos.avgSellPrice - livePrice) * netQty;
            }
            const invested = refPrice * Math.max(pos.buyQty, pos.sellQty);
            const pct      = invested > 0 ? (unrealised / invested) * 100 : 0;

            // Realised P&L
            const matchedQty    = Math.min(pos.buyQty, pos.sellQty);
            const realisedPnl   = matchedQty > 0 && pos.avgBuyPrice > 0
              ? (pos.avgSellPrice - pos.avgBuyPrice) * matchedQty : 0;

            return (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px 16px" }}>
                {/* Net qty */}
                <div>
                  <div style={{ fontSize: 10.5, color: "var(--color-text-muted)", marginBottom: 3 }}>
                    Net qty
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: 16, color: "var(--color-text-primary)" }}>
                    {netQty}
                  </div>
                  <div style={{ fontSize: 10.5, color: "var(--color-text-muted)", marginTop: 2 }}>
                    B:{pos.buyQty} / S:{pos.sellQty}
                  </div>
                </div>

                {/* Avg buy/sell */}
                <div>
                  <div style={{ fontSize: 10.5, color: "var(--color-text-muted)", marginBottom: 3 }}>
                    {isShort ? "Avg sell price" : "Avg buy price"}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 14 }}>
                    {refPrice > 0 ? `₹${fmt(refPrice)}` : "—"}
                  </div>
                  {!isShort && pos.avgSellPrice > 0 && (
                    <div style={{ fontSize: 10.5, color: "var(--color-text-muted)", marginTop: 2 }}>
                      Avg sell: ₹{fmt(pos.avgSellPrice)}
                    </div>
                  )}
                </div>

                {/* Unrealised P&L */}
                <div>
                  <div style={{ fontSize: 10.5, color: "var(--color-text-muted)", marginBottom: 3 }}>
                    Unrealised P&L
                  </div>
                  {livePrice > 0 && netQty > 0
                    ? <PnlChip value={unrealised} pct={pct} />
                    : <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>—</span>
                  }
                </div>

                {/* Realised P&L */}
                <div>
                  <div style={{ fontSize: 10.5, color: "var(--color-text-muted)", marginBottom: 3 }}>
                    Realised P&L
                  </div>
                  {realisedPnl !== 0
                    ? <PnlChip value={realisedPnl} pct={0} />
                    : <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>—</span>
                  }
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}