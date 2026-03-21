

import { useRouter } from "next/navigation";
import type { StockDetail, Period, HistoricalBar } from "@/types/stock";

interface Props {
  detail:    StockDetail;
  livePrice: number;
  change:    number;
  changePct: number;
  period:    Period;
  onPeriod:  (p: Period) => void;
  history:   HistoricalBar[]; // ← add this
}

const PERIODS: Period[] = ["1D", "1W", "1M", "3M", "1Y", "5Y"];

function fmt(n: number) {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function StockHeader({
  detail, livePrice, change, changePct, period, onPeriod, history,
}: Props) {
  const router = useRouter();

  // ── Period-relative change ──
  // For 1D use live change from quote, for other periods use first→last bar
  const periodChange = (() => {
    if (period === "1D" || history.length < 2) {
      return { change, changePct };
    }
    const first = history[0].close;
    const last  = livePrice || history[history.length - 1].close;
    const ch    = last - first;
    const pct   = first > 0 ? (ch / first) * 100 : 0;
    return { change: ch, changePct: pct };
  })();

  const positive = periodChange.change >= 0;

  return (
    <div style={{
      background: "var(--color-surface)",
      borderBottom: "1px solid var(--color-border)",
      position: "sticky", top: 0, zIndex: 40,
    }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px" }}>

        {/* ── Row 1: Back | Avatar + Name | User Avatar ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, height: 64 }}>

          {/* Back */}
          <button
            onClick={() => router.back()}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 12px",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              background: "none", cursor: "pointer",
              color: "var(--color-text-secondary)",
              fontSize: 13, fontFamily: "var(--font-sans)",
              flexShrink: 0, transition: "all 0.15s",
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = "var(--color-surface-2)")}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = "none")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back
          </button>

          {/* Stock avatar */}
          <div style={{
            width: 40, height: 40, borderRadius: "11px",
            background: "var(--color-primary-light)",
            color: "var(--color-primary)",
            fontWeight: 800, fontSize: 13,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, letterSpacing: "0.5px",
          }}>
            {detail.symbol.slice(0, 2)}
          </div>

          {/* Name + meta */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: "var(--color-text-primary)", lineHeight: 1.2 }}>
              {detail.name}
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontWeight: 600 }}>{detail.symbol}</span>
              <span>·</span>
              <span>{detail.exchange}</span>
              {detail.sector && (
                <>
                  <span>·</span>
                  <span style={{
                    background: "var(--color-primary-light)",
                    color: "var(--color-primary)",
                    padding: "1px 7px", borderRadius: 99,
                    fontSize: 11, fontWeight: 600,
                  }}>
                    {detail.sector}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* ── App logo / User avatar (top right) ── */}
          <div style={{
            width: 38, height: 38, borderRadius: "50%",
            background: "var(--color-primary)",
            color: "white", fontWeight: 700, fontSize: 15,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "var(--shadow-blue)", flexShrink: 0, cursor: "pointer",
          }}>
            T
          </div>
        </div>

        {/* ── Row 2: Live price + period change ── */}
        <div style={{ paddingBottom: 10, display: "flex", alignItems: "flex-end", gap: 12 }}>
          <div>
            <div style={{
              fontFamily: "var(--font-mono)", fontWeight: 800,
              fontSize: 28,
              color: positive ? "var(--color-gain)" : "var(--color-loss)",
              letterSpacing: "-0.5px", lineHeight: 1.1,
            }}>
              ₹{fmt(livePrice)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600,
                color: positive ? "var(--color-gain)" : "var(--color-loss)",
              }}>
                {positive ? "+" : ""}{fmt(periodChange.change)}
              </span>
              <span style={{
                fontSize: 12, fontWeight: 700,
                color: positive ? "var(--color-gain)" : "var(--color-loss)",
                background: positive ? "var(--color-gain-bg)" : "var(--color-loss-bg)",
                padding: "2px 8px", borderRadius: 99,
                display: "flex", alignItems: "center", gap: 3,
              }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d={positive ? "M12 19V5M5 12l7-7 7 7" : "M12 5v14M5 12l7 7 7-7"} />
                </svg>
                {positive ? "+" : ""}{periodChange.changePct.toFixed(2)}%
              </span>
              {/* Period label — updates with selected period */}
              <span style={{ fontSize: 11, color: "var(--color-text-muted)", fontWeight: 500 }}>
                {period}
              </span>
            </div>
          </div>
        </div>

        {/* ── Row 3: Period selector ── */}
        <div style={{ display: "flex", gap: 4, paddingBottom: 12 }}>
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => onPeriod(p)}
              style={{
                padding: "5px 14px", borderRadius: "var(--radius-md)",
                border: "none",
                background: period === p ? "var(--color-primary)" : "transparent",
                color: period === p ? "white" : "var(--color-text-secondary)",
                fontWeight: period === p ? 700 : 500,
                fontSize: 12.5, cursor: "pointer",
                fontFamily: "var(--font-sans)", transition: "all 0.15s",
              }}
              onMouseEnter={e => { if (period !== p) (e.currentTarget as HTMLButtonElement).style.background = "var(--color-surface-2)"; }}
              onMouseLeave={e => { if (period !== p) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}