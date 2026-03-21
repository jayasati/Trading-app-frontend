"use client";
// src/components/stock/OverviewTab.tsx

import { useState } from "react";
import type { StockDetail } from "@/types/stock";

interface Props { detail: StockDetail; livePrice: number; }

function fmt(n: number) {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtCr(n?: number): string {
  if (!n) return "—";
  if (n >= 1e12) return `₹${(n / 1e12).toFixed(2)}L Cr`;
  if (n >= 1e7)  return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5)  return `₹${(n / 1e5).toFixed(2)} L`;
  return `₹${fmt(n)}`;
}
function fmtVal(v?: number, prefix = "", suffix = ""): string {
  if (v === undefined || v === null) return "—";
  return `${prefix}${fmt(v)}${suffix}`;
}

/* ─── Performance range bar ─── */
function RangeBar({ label, low, high, current }: { label: string; low: number; high: number; current: number }) {
  const pct = high > low
    ? Math.min(Math.max(((current - low) / (high - low)) * 100, 0), 100)
    : 50;

  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 2 }}>{label} Low</div>
          <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 14, color: "var(--color-loss)" }}>
            ₹{fmt(low)}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 2 }}>{label} High</div>
          <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 14, color: "var(--color-gain)" }}>
            ₹{fmt(high)}
          </div>
        </div>
      </div>
      <div style={{ position: "relative", height: 5, background: "linear-gradient(to right, #fca5a5 0%, #f1f5f9 50%, #86efac 100%)", borderRadius: 99 }}>
        <div style={{
          position: "absolute", left: `${pct}%`,
          top: "50%", transform: "translate(-50%,-50%)",
          width: 14, height: 14, borderRadius: "50%",
          background: "var(--color-text-primary)",
          border: "2.5px solid white",
          boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
        }} />
      </div>
    </div>
  );
}

/* ─── Stat row inside fundamentals grid ─── */
function FundRow({ label, value, accent }: { label: string; value: string; accent?: "gain" | "loss" }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "12px 0",
      borderBottom: "1px solid var(--color-border-soft)",
    }}>
      <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{label}</span>
      <span style={{
        fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13.5,
        color: accent === "gain" ? "var(--color-gain)" : accent === "loss" ? "var(--color-loss)" : "var(--color-text-primary)",
      }}>
        {value}
      </span>
    </div>
  );
}

/* ─── About section with expand ─── */
function AboutSection({ detail }: { detail: StockDetail }) {
  const [expanded, setExpanded] = useState(false);
  const f = detail.fundamentals;
  const desc = f?.description ?? `${detail.name} is a ${detail.sector ?? "listed"} company on ${detail.exchange}.`;

  return (
    <div className="card" style={{ padding: "22px 24px" }}>
      <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>About</h3>
      <p style={{ fontSize: 13.5, color: "var(--color-text-secondary)", lineHeight: 1.75, marginBottom: 16 }}>
        {expanded ? desc : desc.slice(0, 240) + (desc.length > 240 ? "…" : "")}
        {desc.length > 240 && (
          <button
            onClick={() => setExpanded(!expanded)}
            style={{ background: "none", border: "none", color: "var(--color-primary)", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 13, marginLeft: 4 }}
          >
            {expanded ? "Read less" : "Read more"}
          </button>
        )}
      </p>

      {/* Key info grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px 32px", marginTop: 8 }}>
        {[
          { label: "NSE Symbol",  value: detail.symbol },
          { label: "Sector",      value: detail.sector    ?? "—" },
          { label: "Industry",    value: detail.industry  ?? "—" },
          { label: "Exchange",    value: detail.exchange },
          f?.founded && { label: "Founded",    value: f.founded },
          f?.employees && { label: "Employees", value: f.employees.toLocaleString("en-IN") },
        ].filter(Boolean).map((item: any) => (
          <div key={item.label}>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 3 }}>{item.label}</div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main ─── */
export default function OverviewTab({ detail, livePrice }: Props) {
  const q = detail.quote;
  const f = detail.fundamentals;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Performance */}
      <div className="card" style={{ padding: "22px 24px" }}>
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Performance</h3>
        <RangeBar
          label="Today's"
          low={q?.low ?? livePrice * 0.97}
          high={q?.high ?? livePrice * 1.03}
          current={livePrice}
        />
        {f?.fiftyTwoWeekLow && f?.fiftyTwoWeekHigh && (
          <RangeBar
            label="52 Week"
            low={f.fiftyTwoWeekLow}
            high={f.fiftyTwoWeekHigh}
            current={livePrice}
          />
        )}

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px 0", marginTop: 8 }}>
          {[
            { label: "Open price",     value: q ? `₹${fmt(q.open)}` : "—" },
            { label: "Previous close", value: q ? `₹${fmt(q.close)}` : "—" },
            { label: "Volume",         value: q ? q.volume.toLocaleString("en-IN") : "—" },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 14 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Fundamentals */}
      {f && (
        <div className="card" style={{ padding: "22px 24px" }}>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Fundamentals</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 40px" }}>
            <div>
              <FundRow label="Market Cap"    value={fmtCr(f.marketCap ?? q?.marketCap)} />
              <FundRow label="P/E Ratio (TTM)" value={fmtVal(f.peRatio, "", "x")} />
              <FundRow label="P/B Ratio"     value={fmtVal(f.pbRatio, "", "x")} />
              <FundRow label="Dividend Yield" value={f.dividendYield ? `${f.dividendYield.toFixed(2)}%` : "—"} accent={f.dividendYield && f.dividendYield > 1 ? "gain" : undefined} />
              <FundRow label="Beta"          value={f.beta ? f.beta.toFixed(2) : "—"} />
            </div>
            <div>
              <FundRow label="EPS (TTM)"     value={fmtVal(f.eps, "₹")} />
              <FundRow label="Book Value"    value={fmtVal(f.bookValue, "₹")} />
              <FundRow label="ROE"           value={f.roe ? `${f.roe.toFixed(2)}%` : "—"} accent={f.roe && f.roe > 15 ? "gain" : undefined} />
              <FundRow label="Debt to Equity" value={f.debtToEquity ? f.debtToEquity.toFixed(2) : "—"} accent={f.debtToEquity && f.debtToEquity > 2 ? "loss" : undefined} />
              <FundRow label="Face Value"    value={fmtVal(f.faceValue, "₹")} />
            </div>
          </div>
        </div>
      )}

      {/* About */}
      <AboutSection detail={detail} />
    </div>
  );
}