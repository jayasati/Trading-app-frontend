"use client";

import { useEffect, useRef, useCallback } from "react";
import type { HistoricalBar, Period } from "@/types/stock";

interface Props {
  bars:         HistoricalBar[];
  period:       Period;
  positive:     boolean;
  loading:      boolean;
  livePrice?:   number;
  stockId?:     string;   // needed for the polling fallback
}

const IST_OFFSET_S = 5.5 * 60 * 60; // 19800 s

export default function PriceChart({
  bars, period, positive, loading, livePrice, stockId,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef     = useRef<any>(null);
  const seriesRef    = useRef<any>(null);

  // ── Build / rebuild chart when bars or visual config changes ─────────────
  useEffect(() => {
    if (!containerRef.current || loading || !bars.length) return;

    import("lightweight-charts").then(({ createChart, ColorType, AreaSeries }) => {
      if (!containerRef.current) return;

      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current  = null;
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

      const seen = new Set<string | number>();

      const data = bars
        .map((b) => {
          if (period === "1D" || period === "1W") {
            const utcTs = Math.floor(new Date(b.date).getTime() / 1000);
            const istTs = utcTs + IST_OFFSET_S;
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

  // ── Helper: push a price tick to the series ──────────────────────────────
  const pushTick = useCallback((price: number) => {
    if (!seriesRef.current || price <= 0) return;
    const nowIstTs = Math.floor(Date.now() / 1000) + IST_OFFSET_S;
    try {
      seriesRef.current.update({ time: nowIstTs, value: price });
    } catch {
      // lightweight-charts throws if time goes backwards — safe to ignore
    }
  }, []);

  // ── Real-time update: WebSocket tick → chart ──────────────────────────────
  // Runs every time livePrice changes (after useLivePrices joins the room).
  // Only relevant for 1D / 1W — longer periods use daily bars.
  useEffect(() => {
    if (!livePrice || livePrice <= 0) return;
    if (period !== "1D" && period !== "1W") return;
    pushTick(livePrice);
  }, [livePrice, period, pushTick]);

  // ── Polling fallback: fetch latest quote every 10 s for 1D chart ──────────
  //
  // Bug fix: even after joining the WebSocket room (useLivePrices fix),
  // the first tick only arrives when the backend cron fires (every 10 s).
  // This interval ensures the chart moves even if the parent hasn't yet
  // received a WebSocket event — it fetches the price directly from REST
  // and appends it as a new tick, giving the chart continuous movement.
  useEffect(() => {
    if (period !== "1D" || !stockId) return;

    const tick = async () => {
      try {
        const res  = await fetch(`/api/market/price/${stockId}`);
        if (!res.ok) return;
        const data = await res.json();
        // Backend returns a plain number from getLatestPrice()
        const price = typeof data === "number" ? data : null;
        if (price && price > 0) pushTick(price);
      } catch {
        // non-critical — chart already has WebSocket data
      }
    };

    // Fire immediately so the chart shows the current price on mount,
    // then keep ticking every 10 s
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, [period, stockId, pushTick]);

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          height: 340,
          borderRadius: "var(--radius-md)",
          background:
            "linear-gradient(90deg, var(--color-surface-2) 0%, var(--color-border-soft) 50%, var(--color-surface-2) 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
        <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
          Loading chart…
        </span>
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
        <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
          No chart data available
        </p>
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