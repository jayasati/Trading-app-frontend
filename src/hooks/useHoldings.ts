"use client";

import { useState, useCallback, useMemo } from "react";
import { api } from "@/lib/api";

export interface Holding {
  id:       string;
  stockId:  string;
  avgPrice: string | number;
  quantity: string | number;
  stock?: {
    id?:    string;
    symbol: string;
    name:   string;
  };
}

export interface HoldingRow {
  id:         string;
  stockId:    string;
  livePrice:  number | null;
  avgPrice:   number;
  qty:        number;
  invested:   number;
  current:    number;
  returns:    number;
  returnsPct: number;
  isStale?:   boolean;   // ← true when price is from DB (market closed / weekend)
  stock?: {
    id?:    string;
    symbol: string;
    name:   string;
  };
}

// useHoldings is now a thin hook — HoldingsSection handles all fetching.
// Kept for backwards compatibility (HoldingsTable imports HoldingRow from here).
interface UseHoldingsReturn {
  rows:            HoldingRow[];
  loading:         boolean;
  totalCurrent:    number;
  totalInvested:   number;
  totalReturns:    number;
  totalReturnsPct: number;
  refetch:         () => Promise<void>;
}

export function useHoldings(
  livePrices: Record<string, number>
): UseHoldingsReturn {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading,  setLoading]  = useState(true);

  const refetch = useCallback(async () => {
    try {
      const res = await api.get("/portfolio");
      setHoldings(Array.isArray(res.data) ? res.data : []);
    } catch {
      setHoldings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const rows = useMemo<HoldingRow[]>(() => {
    return holdings.map((h) => {
      const livePrice  = livePrices[h.stockId] ?? null;
      const avgPrice   = Number(h.avgPrice  ?? 0);
      const qty        = Number(h.quantity  ?? 0);
      const invested   = avgPrice * qty;
      const current    = livePrice !== null ? livePrice * qty : invested;
      const returns    = current - invested;
      const returnsPct = invested > 0 ? (returns / invested) * 100 : 0;
      return { ...h, livePrice, avgPrice, qty, invested, current, returns, returnsPct };
    });
  }, [holdings, livePrices]);

  const { totalCurrent, totalInvested } = useMemo(() => {
    let totalCurrent = 0, totalInvested = 0;
    rows.forEach((r) => { totalCurrent += r.current; totalInvested += r.invested; });
    return { totalCurrent, totalInvested };
  }, [rows]);

  const totalReturns    = totalCurrent - totalInvested;
  const totalReturnsPct = totalInvested > 0
    ? (totalReturns / totalInvested) * 100 : 0;

  return { rows, loading, totalCurrent, totalInvested, totalReturns, totalReturnsPct, refetch };
}