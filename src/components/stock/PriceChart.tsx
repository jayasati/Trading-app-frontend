"use client";
// src/components/stock/PriceChart.tsx

import { useEffect, useRef } from "react";
import type { HistoricalBar, Period } from "@/types/stock";

interface Props {
  bars:     HistoricalBar[];
  period:   Period;
  positive: boolean;
  loading:  boolean;
}

export default function PriceChart({ bars, period, positive, loading }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef     = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (loading) return;
    if (!bars.length) return;

    import("lightweight-charts").then(({ createChart, ColorType ,AreaSeries  }) => {
      if (!containerRef.current) return;

      // Destroy old instance
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }

      const chart = createChart(containerRef.current, {
        width:  containerRef.current.clientWidth,
        height: 340,
        layout: {
          background: { type: ColorType.Solid, color: "#ffffff" },
          textColor: "#94a3b8",
          fontSize: 11,
          fontFamily: "'DM Mono', monospace",
        },
        grid: {
          vertLines: { color: "#f1f5f9" },
          horzLines: { color: "#f1f5f9" },
        },
        crosshair: { mode: 1 },
        rightPriceScale: {
          borderColor: "#e2e8f0",
          scaleMargins: { top: 0.12, bottom: 0.08 },
        },
        timeScale: {
          borderColor: "#e2e8f0",
          timeVisible: period === "1D" || period === "1W",
          secondsVisible: false,
          fixLeftEdge: true,
          fixRightEdge: true,
        },
        handleScroll: true,
        handleScale: true,
      });

      const lineColor  = positive ? "#16a34a" : "#dc2626";
      const topColor   = positive ? "rgba(22,163,74,0.1)" : "rgba(220,38,38,0.1)";

      const series = chart.addSeries(AreaSeries,{
        lineColor,
        topColor,
        bottomColor: "rgba(255,255,255,0)",
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 5,
        crosshairMarkerBackgroundColor: lineColor,
        crosshairMarkerBorderColor: "#ffffff",
      });

      // Format and sort data
        const seen = new Set<string>();
        const data = bars
        .map(b => ({
            time: (period === "1D"
            ? Math.floor(new Date(b.date).getTime() / 1000)
            : new Date(b.date).toISOString().split("T")[0]
            ) as any,
            value: b.close,
        }))
        .sort((a: any, b: any) => (a.time > b.time ? 1 : a.time < b.time ? -1 : 0))
        .filter((item: any) => {
            const key = String(item.time);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

      series.setData(data);
      chart.timeScale().fitContent();
      chartRef.current = chart;

      // Responsive resize
      const obs = new ResizeObserver(() => {
        if (containerRef.current && chartRef.current) {
          chartRef.current.applyOptions({
            width: containerRef.current.clientWidth,
          });
        }
      });
      obs.observe(containerRef.current);

      return () => obs.disconnect();
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [bars, period, positive, loading]);

  // Loading skeleton
  if (loading) {
    return (
      <div
        style={{
          height: 340,
          borderRadius: "var(--radius-md)",
          background: "linear-gradient(90deg, var(--color-surface-2) 0%, var(--color-border-soft) 50%, var(--color-surface-2) 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
        <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Loading chart…</span>
      </div>
    );
  }

  // Empty state
  if (!bars.length) {
    return (
      <div
        style={{
          height: 340,
          borderRadius: "var(--radius-md)",
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

  return <div ref={containerRef} style={{ width: "100%", borderRadius: "var(--radius-md)", overflow: "hidden" }} />;
}