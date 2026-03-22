"use client";

import { useEffect, useState } from "react";
import { api }                 from "@/lib/api";
import { useLivePrices }       from "@/hooks/useLivePrices";
import HoldingsSummaryBar      from "./HoldingsSummaryBar";
import HoldingsTable           from "./HoldingsTable";

interface RawHolding {
  id:        string;
  stockId:   string;
  avgPrice:  string | number;
  quantity:  string | number;
  stock?: {
    symbol: string;
    name:   string;
  };
}

interface Wallet {
  balance:       string | number;
  lockedBalance: string | number;
}

export default function HoldingsSection() {
  const [holdings, setHoldings] = useState<RawHolding[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([api.get("/portfolio"), api.get("/wallet")])
      .then(([ph]) => setHoldings(ph.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stockIds   = holdings.map((h) => h.stockId);
  const livePrices = useLivePrices(stockIds);

  // Compute rows + aggregates
  let totalCurrent  = 0;
  let totalInvested = 0;

  const rows = holdings.map((h) => {
    const livePrice  = livePrices[h.stockId] ?? null;
    const avgPrice   = Number(h.avgPrice  ?? 0);
    const qty        = Number(h.quantity  ?? 0);
    const invested   = avgPrice * qty;
    const current    = livePrice !== null ? livePrice * qty : invested;
    const returns    = current - invested;
    const returnsPct = invested > 0 ? (returns / invested) * 100 : 0;
    totalCurrent  += current;
    totalInvested += invested;
    return { ...h, livePrice, avgPrice, qty, invested, current, returns, returnsPct };
  });

  const totalReturns    = totalCurrent - totalInvested;
  const totalReturnsPct = totalInvested > 0
    ? (totalReturns / totalInvested) * 100
    : 0;

  if (loading) {
    return (
      <div
        style={{
          display: "flex", justifyContent: "center",
          padding: "80px", color: "var(--color-text-muted)",
        }}
      >
        Loading holdings…
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <HoldingsSummaryBar
        totalCurrent={totalCurrent}
        totalInvested={totalInvested}
        totalReturns={totalReturns}
        totalReturnsPct={totalReturnsPct}
      />
      <HoldingsTable rows={rows} />
    </div>
  );
}