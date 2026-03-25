"use client";


import { useEffect, useRef } from "react";
import type { HistoricalBar, Period } from "@/types/stock";

interface Props {
  bars:       HistoricalBar[];
  period:     Period;
  positive:   boolean;
  loading:    boolean;
  livePrice?: number;   // ← WebSocket live price fed in from parent
}

const IST_OFFSET_S = 5.5 * 60 * 60; // 19800 seconds

export default function PriceChart({ bars, period, positive, loading, livePrice }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef     = useRef<any>(null);
  const seriesRef    = useRef<any>(null); // keep series ref for live updates

  // ── Build or rebuild chart when bars/period/positive changes ─────────────
  useEffect(() => {
    if (!containerRef.current || loading || !bars.length) return;

    import("lightweight-charts").then(({ createChart, ColorType, AreaSeries }) => {
      if (!containerRef.current) return;

      // Destroy previous instance
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = null;
      }

      const chart = createChart(containerRef.current, {
        width:  containerRef.current.clientWidth,
        height: 340,
        layout: {
          background: { type: ColorType.Solid, color: "#ffffff" },
          textColor:  "#94a3b8",
          fontSize:   11,
          fontFamily: "'DM Mono', monospace",
        },
        grid: {
          vertLines: { color: "#f1f5f9" },
          horzLines: { color: "#f1f5f9" },
        },
        crosshair: { mode: 1 },
        rightPriceScale: {
          borderColor:  "#e2e8f0",
          scaleMargins: { top: 0.12, bottom: 0.08 },
        },
        timeScale: {
          borderColor:    "#e2e8f0",
          timeVisible:    period === "1D" || period === "1W",
          secondsVisible: false,
          fixLeftEdge:    true,
          fixRightEdge:   true,
        },
        handleScroll: true,
        handleScale:  true,
      });

      const lineColor = positive ? "#16a34a" : "#dc2626";
      const topColor  = positive ? "rgba(22,163,74,0.1)" : "rgba(220,38,38,0.1)";

      const series = chart.addSeries(AreaSeries, {
        lineColor,
        topColor,
        bottomColor:                    "rgba(255,255,255,0)",
        lineWidth:                      2,
        crosshairMarkerVisible:         true,
        crosshairMarkerRadius:          5,
        crosshairMarkerBackgroundColor: lineColor,
        crosshairMarkerBorderColor:     "#ffffff",
      });

      // ── Build initial data ──────────────────────────────────────────────
      const seen = new Set<string | number>();

      const data = bars
        .map((b) => {
          if (period === "1D" || period === "1W") {
            const utcTs = Math.floor(new Date(b.date).getTime() / 1000);
            const istTs = utcTs + IST_OFFSET_S; // shift to IST for correct axis labels
            return { time: istTs as any, value: b.close };
          }
          return {
            time:  new Date(b.date).toISOString().split("T")[0] as any,
            value: b.close,
          };
        })
        .sort((a: any, b: any) => (a.time > b.time ? 1 : a.time < b.time ? -1 : 0))
        .filter((item: any) => {
          const key = String(item.time);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

      series.setData(data);
      chart.timeScale().fitContent();

      chartRef.current  = chart;
      seriesRef.current = series;

      // Responsive resize
      const obs = new ResizeObserver(() => {
        if (containerRef.current && chartRef.current) {
          chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
        }
      });
      obs.observe(containerRef.current);
      return () => obs.disconnect();
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current  = null;
        seriesRef.current = null;
      }
    };
  }, [bars, period, positive, loading]);

  // ── Real-time update: append live price tick to chart ────────────────────
  // Runs every time livePrice changes (WebSocket tick).
  // Only updates in 1D/1W mode — longer periods use daily candles, no need.
  useEffect(() => {
    if (!seriesRef.current)          return;
    if (!livePrice || livePrice <= 0) return;
    if (period !== "1D" && period !== "1W") return;

    // Use current IST time as the timestamp for this tick
    const nowIstTs = Math.floor(Date.now() / 1000) + IST_OFFSET_S;

    try {
      // update() will append a new point or update the last point if same second
      seriesRef.current.update({ time: nowIstTs, value: livePrice });
    } catch {
      // lightweight-charts throws if time goes backwards — safe to ignore
    }
  }, [livePrice, period]);

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          height: 340,
          borderRadius: "var(--radius-md)",
          background: "linear-gradient(90deg, var(--color-surface-2) 0%, var(--color-border-soft) 50%, var(--color-surface-2) 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
        <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Loading chart…</span>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!bars.length) {
    return (
      <div
        style={{
          height: 340, borderRadius: "var(--radius-md)",
          background: "var(--color-surface-2)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 10,
        }}
      >
        <div style={{ fontSize: 40 }}>📈</div>
        <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>No chart data available</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", borderRadius: "var(--radius-md)", overflow: "hidden" }}
    />
  );
}