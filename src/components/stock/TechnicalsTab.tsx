"use client";
// src/components/stock/TechnicalsTab.tsx

import { useMemo } from "react";
import type { HistoricalBar } from "@/types/stock";
import { calcSummary, rsiLabel } from "@/lib/technicals";

interface Props { history: HistoricalBar[]; }

function fmt(n: number) {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ─── Signal meter bars (Bearish → Bullish) ─── */
function SignalMeter({ bull, bear, neut }: { bull: number; bear: number; neut: number }) {
  const total = bull + bear + neut || 1;
  const score = bull / total; // 0→1
  const label =
    score > 0.75 ? "Strongly Bullish" :
    score > 0.5  ? "Bullish"          :
    score < 0.25 ? "Strongly Bearish" :
    score < 0.5  ? "Bearish"          : "Neutral";
  const color =
    score > 0.5 ? "var(--color-gain)" : score < 0.5 ? "var(--color-loss)" : "var(--color-text-secondary)";

  return (
    <div className="card" style={{ padding: "22px 24px", marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Summary</h3>
          <p style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Based on price data</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 4 }}>Based on technicals, this stock is</div>
          <div style={{ fontWeight: 800, fontSize: 16, color }}>{label}</div>
        </div>
      </div>

      {/* Colour bar */}
      <div style={{ display: "flex", gap: 3, marginBottom: 12 }}>
        {Array.from({ length: 13 }).map((_, i) => {
          const pos = i / 12;
          const active = Math.abs(pos - score) < 0.12;
          const barColor =
            i < 4   ? `rgba(220,38,38,${0.4 + i * 0.1})` :
            i < 7   ? `rgba(148,163,184,0.5)`             :
                      `rgba(22,163,74,${0.3 + (i - 7) * 0.1})`;
          return (
            <div
              key={i}
              style={{
                flex: 1, height: active ? 28 : 20,
                borderRadius: 4,
                background: barColor,
                transition: "height 0.3s",
                position: "relative",
              }}
            >
              {active && (
                <div style={{
                  position: "absolute", bottom: -16, left: "50%",
                  transform: "translateX(-50%)",
                  width: 0, height: 0,
                  borderLeft: "5px solid transparent",
                  borderRight: "5px solid transparent",
                  borderBottom: `5px solid ${color}`,
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
        {[
          { dot: "var(--color-loss)", label: "Bearish", count: bear },
          { dot: "var(--color-text-muted)", label: "Neutral", count: neut },
          { dot: "var(--color-gain)", label: "Bullish", count: bull },
        ].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.dot }} />
            <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{l.label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-primary)" }}>{l.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Pivot levels ─── */
function PivotLevels({ pivots, currentPrice }: { pivots: any; currentPrice: number }) {
  const levels = [
    { label: "R3", value: pivots.r3, type: "resistance" },
    { label: "R2", value: pivots.r2, type: "resistance" },
    { label: "R1", value: pivots.r1, type: "resistance" },
    { label: "PIVOT", value: pivots.pivot, type: "pivot" },
    { label: "S1", value: pivots.s1, type: "support" },
    { label: "S2", value: pivots.s2, type: "support" },
    { label: "S3", value: pivots.s3, type: "support" },
  ];

  return (
    <div className="card" style={{ padding: "22px 24px", marginBottom: 16 }}>
      <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Support & Resistance</h3>
      <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 16 }}>Classic pivot points based on last session</p>
      <div>
        {/* Current price marker */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "8px 12px", borderRadius: "var(--radius-md)",
          background: "var(--color-primary)", marginBottom: 8,
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "white", letterSpacing: "0.5px" }}>CURRENT</span>
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: 14, color: "white", marginLeft: "auto" }}>
            ₹{fmt(currentPrice)}
          </span>
        </div>

        {levels.map(l => (
          <div
            key={l.label}
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 12px",
              borderRadius: "var(--radius-md)",
              background: l.type === "pivot" ? "var(--color-surface-2)" : "transparent",
              marginBottom: 2,
            }}
          >
            <span style={{
              fontSize: 12, fontWeight: 700,
              color: l.type === "resistance" ? "var(--color-gain)" : l.type === "support" ? "var(--color-loss)" : "var(--color-text-secondary)",
              minWidth: 40,
            }}>
              {l.label}
            </span>
            <span style={{
              fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 14,
              color: "var(--color-text-primary)",
            }}>
              ₹{l.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Indicator row ─── */
function IndicatorRow({ name, value, verdict, color }: { name: string; value: string; verdict: string; color: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center",
      padding: "14px 0",
      borderBottom: "1px solid var(--color-border-soft)",
    }}>
      <span style={{ flex: 1, fontSize: 13, color: "var(--color-text-secondary)" }}>{name}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13, color: "var(--color-text-primary)", minWidth: 80, textAlign: "right" }}>{value}</span>
      <span style={{
        minWidth: 100, textAlign: "right",
        fontSize: 12.5, fontWeight: 700, color,
      }}>{verdict}</span>
    </div>
  );
}

/* ─── Main ─── */
export default function TechnicalsTab({ history }: Props) {
  const closes  = history.map(b => b.close).filter(Boolean);
  const lastBar = history[history.length - 1];

  const summary = useMemo(
    () => calcSummary(closes, lastBar),
    [closes.length, lastBar?.close]
  );

  const { rsi, macd, pivots, bullCount, bearCount, neutCount } = summary;
  const rsiInfo  = rsiLabel(rsi);
  const macdInfo = {
    text: !macd ? "—" : macd.macd > 0 ? "Bullish" : "Bearish",
    color: !macd ? "var(--color-text-muted)" : macd.macd > 0 ? "var(--color-gain)" : "var(--color-loss)",
  };

  const currentPrice = lastBar?.close ?? 0;

  if (!closes.length) {
    return (
      <div className="card" style={{ padding: 48, textAlign: "center", color: "var(--color-text-muted)" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>📉</div>
        <p>Not enough data to compute technicals</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Signal summary */}
      <SignalMeter bull={bullCount} bear={bearCount} neut={neutCount} />

      {/* Indicators table */}
      <div className="card" style={{ padding: "22px 24px", marginBottom: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Indicators</h3>
        <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 4 }}>Computed from historical price data</p>
        <div>
          <div style={{ display: "flex", padding: "8px 0", borderBottom: "1px solid var(--color-border-soft)" }}>
            <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: "var(--color-text-muted)", letterSpacing: "0.5px", textTransform: "uppercase" }}>INDICATOR</span>
            <span style={{ minWidth: 80, textAlign: "right", fontSize: 11, fontWeight: 600, color: "var(--color-text-muted)", letterSpacing: "0.5px", textTransform: "uppercase" }}>VALUE</span>
            <span style={{ minWidth: 100, textAlign: "right", fontSize: 11, fontWeight: 600, color: "var(--color-text-muted)", letterSpacing: "0.5px", textTransform: "uppercase" }}>VERDICT</span>
          </div>
          <IndicatorRow
            name="RSI (14)"
            value={rsi !== null ? `+${rsi.toFixed(2)}` : "—"}
            verdict={rsiInfo.text}
            color={rsiInfo.color}
          />
          <IndicatorRow
            name="MACD (12, 26, 9)"
            value={macd ? `${macd.macd > 0 ? "+" : ""}${macd.macd.toFixed(2)}` : "—"}
            verdict={macdInfo.text}
            color={macdInfo.color}
          />
          <IndicatorRow
            name="MACD Signal"
            value={macd ? macd.signal.toFixed(2) : "—"}
            verdict={macd ? (macd.macd > macd.signal ? "Bullish crossover" : "Bearish crossover") : "—"}
            color={macd ? (macd.macd > macd.signal ? "var(--color-gain)" : "var(--color-loss)") : "var(--color-text-muted)"}
          />
        </div>
      </div>

      {/* Pivot levels */}
      {pivots && (
        <PivotLevels pivots={pivots} currentPrice={currentPrice} />
      )}
    </div>
  );
}