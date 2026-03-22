"use client";

import { useEffect, useState, useMemo } from "react";
import { api }            from "@/lib/api";
import { useLivePrices }  from "@/hooks/useLivePrices";
import HoldingsSummaryBar from "./HoldingsSummaryBar";
import HoldingsTable      from "./HoldingsTable";
import type { HoldingRow } from "@/hooks/useHoldings";

interface RawHolding {
  id:         string;
  stockId:    string;
  avgPrice:   string | number;
  quantity:   string | number;
  lockedQty?: number;
  stock?: { id?: string; symbol: string; name: string };
}

export default function HoldingsSection() {
  const [holdings,   setHoldings]   = useState<RawHolding[]>([]);
  const [restPrices, setRestPrices] = useState<Record<string, number>>({});
  const [staleIds,   setStaleIds]   = useState<Set<string>>(new Set());
  const [loading,    setLoading]    = useState(true);
  const [version,    setVersion]    = useState(0);

  // ── 1. Fetch portfolio ───────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    api.get("/portfolio")
      .then((r) => setHoldings(Array.isArray(r.data) ? r.data : []))
      .catch(() => setHoldings([]))
      .finally(() => setLoading(false));
  }, [version]);

  // ── 2. Fetch each quote via REST and read price from response directly ────
  //
  // WHY: WebSocket only fires when the backend broadcasts. On weekends the
  // Redis OFFLINE_TTL (12h) may have expired, Yahoo Finance returns null for
  // closed markets, and the cron skips uncached stocks. So the WebSocket
  // never broadcasts and livePrices stays {}.
  //
  // The backend (market.service.ts) now falls back to priceHistory DB when
  // Yahoo returns null, so /market/quote/:id ALWAYS returns a price.
  // We read it here directly from the REST response — no WebSocket needed
  // for initial load. WebSocket then handles real-time ticks during market hours.
  useEffect(() => {
    if (holdings.length === 0) return;

    setRestPrices({});   // reset on refetch
    setStaleIds(new Set());

    holdings.forEach(async (h) => {
      try {
        const res   = await api.get(`/market/quote/${h.stockId}`);
        const data  = res.data;

        // Backend can return two shapes:
        //   LiveQuote:  { price, open, high, ... }          ← direct quote
        //   Wrapped:    { quote: { price, ... }, symbol }   ← when stock found but quote nested
        const price: number | null =
          data?.price                         // LiveQuote shape (cache hit / Yahoo success)
          ?? data?.quote?.price               // wrapped shape
          ?? null;

        const isStale: boolean = data?.isStale ?? data?.quote?.isStale ?? false;

        if (price && Number(price) > 0) {
          setRestPrices((prev) => ({ ...prev, [h.stockId]: Number(price) }));
          if (isStale) {
            setStaleIds((prev) => new Set(prev).add(h.stockId));
          }
        }
      } catch {
        // non-critical — row will show avgPrice as fallback
      }
    });
  }, [holdings]);

  // ── 3. WebSocket live prices (real-time ticks during market hours) ────────
  const stockIds  = useMemo(() => holdings.map((h) => h.stockId), [holdings]);
  const wsPrices  = useLivePrices(stockIds);

  // ── 4. Merge: WebSocket wins over REST (more recent during market hours) ──
  const livePrices = useMemo<Record<string, number>>(() => ({
    ...restPrices,
    ...wsPrices,   // WebSocket overrides REST when available
  }), [restPrices, wsPrices]);

  // ── 5. Compute rows ───────────────────────────────────────────────────────
  const rows = useMemo<HoldingRow[]>(() => {
    return holdings.map((h) => {
      const livePrice  = livePrices[h.stockId] ?? null;
      const avgPrice   = Number(h.avgPrice  ?? 0);
      const qty        = Number(h.quantity  ?? 0);
      const invested   = avgPrice * qty;
      const current    = livePrice !== null ? livePrice * qty : invested;
      const returns    = current - invested;
      const returnsPct = invested > 0 ? (returns / invested) * 100 : 0;
      const isStale    = staleIds.has(h.stockId) && !wsPrices[h.stockId];
      return {
        ...h,
        livePrice,
        avgPrice,
        qty,
        invested,
        current,
        returns,
        returnsPct,
        isStale,   // used by HoldingsTable to show "Closed" instead of "Live"
      };
    });
  }, [holdings, livePrices, staleIds, wsPrices]);

  // ── 6. Totals ─────────────────────────────────────────────────────────────
  const { totalCurrent, totalInvested } = useMemo(() => {
    let totalCurrent = 0, totalInvested = 0;
    rows.forEach((r) => { totalCurrent += r.current; totalInvested += r.invested; });
    return { totalCurrent, totalInvested };
  }, [rows]);

  const totalReturns    = totalCurrent - totalInvested;
  const totalReturnsPct = totalInvested > 0
    ? (totalReturns / totalInvested) * 100
    : 0;

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "80px", color: "var(--color-text-muted)" }}>
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
      <HoldingsTable
        rows={rows}
        onOrderDone={() => setVersion((v) => v + 1)}
      />
    </div>
  );
}