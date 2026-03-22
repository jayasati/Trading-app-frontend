"use client";

import { useEffect, useState, useCallback } from "react";
import { api }                  from "@/lib/api";
import { useLivePrices }        from "@/hooks/useLivePrices";
import { POSITION_REFRESH_MS, isMarketOpen } from "@/lib/time";
import PositionsSummaryBar      from "./PositionsSummaryBar";
import OpenPositionsTable       from "./OpenPositionsTable";
import ClosedPositionsTable     from "./ClosedPositionsTable";

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

export default function PositionsSection() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading,   setLoading]   = useState(true);

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

  // Poll only during market hours and only when tab is visible
  useEffect(() => {
    const interval = setInterval(() => {
      if (isMarketOpen() && !document.hidden) fetchPositions();
    }, POSITION_REFRESH_MS);
    return () => clearInterval(interval);
  }, [fetchPositions]);

  const stockIds   = positions.map((p) => p.stockId);
  const livePrices = useLivePrices(stockIds);

  const openPositions   = positions.filter((p) => p.status === "OPEN");
  const closedPositions = positions.filter((p) => p.status !== "OPEN");

  if (loading) {
    return (
      <div
        style={{
          display: "flex", justifyContent: "center",
          padding: "80px", color: "var(--color-text-muted)",
        }}
      >
        Loading positions…
      </div>
    );
  }

  if (!positions.length) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          className="card animate-fade-up"
          style={{
            padding: "64px 32px", textAlign: "center",
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 14,
            border: "1.5px dashed var(--color-border)",
            boxShadow: "none",
          }}
        >
          <div
            style={{
              width: 64, height: 64, borderRadius: 18,
              background: "#fffbeb",
              display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 28,
            }}
          >
            ⚡
          </div>
          <p style={{ fontWeight: 700, fontSize: 17 }}>
            No intraday positions today
          </p>
          <p
            style={{
              color: "var(--color-text-muted)", fontSize: 13.5,
              maxWidth: 320, lineHeight: 1.6,
            }}
          >
            Place an intraday order from any stock page. Positions
            auto square-off at 3:20 PM.
          </p>
          <div
            style={{
              padding: "8px 16px", borderRadius: "var(--radius-md)",
              background: "#fffbeb", border: "1px solid #fde68a",
              fontSize: 12, color: "#92400e", fontWeight: 600,
            }}
          >
            ⏰ Auto square-off at 3:20 PM IST
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PositionsSummaryBar positions={positions} livePrices={livePrices} />
      {openPositions.length > 0 && (
        <OpenPositionsTable positions={openPositions} livePrices={livePrices} />
      )}
      {closedPositions.length > 0 && (
        <ClosedPositionsTable positions={closedPositions} />
      )}
    </div>
  );
}