"use client";

import { useEffect, useState, useCallback } from "react";
import { api }            from "@/lib/api";
import { useLivePrices }  from "@/hooks/useLivePrices";
import { onStockViewed }  from "@/lib/stockEvents";
import { PRICE_REFRESH_MS } from "@/lib/time";

import RecentlyViewed  from "./RecentlyViewed";
import TopMovers       from "./TopMovers";
import PortfolioSummary from "./PortfolioSummary";

interface StockQuote {
  price:     number;
  open:      number;
  high:      number;
  low:       number;
  close:     number;
  volume:    number;
  updatedAt: string;
}

interface RecentStock {
  id:        string;
  symbol:    string;
  name:      string;
  exchange:  string;
  sector?:   string;
  quote:     StockQuote | null;
}

export default function ExploreSection() {
  const [stocks,  setStocks]  = useState<RecentStock[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecent = useCallback(async () => {
    try {
      const res = await api.get("/market/recent");
      setStocks(Array.isArray(res.data) ? res.data : []);
    } catch {
      setStocks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  // Re-fetch when Searchbar records a new view
  useEffect(() => {
    return onStockViewed(fetchRecent);
  }, [fetchRecent]);

  // Refresh every 30s but only when tab is visible
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) fetchRecent();
    }, PRICE_REFRESH_MS);
    return () => clearInterval(interval);
  }, [fetchRecent]);

  const stockIds   = stocks.map((s) => s.id);
  const livePrices = useLivePrices(stockIds);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 320px",
        gap: "24px",
        alignItems: "start",
      }}
    >
      {/* Left column */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <RecentlyViewed
          stocks={stocks}
          loading={loading}
          livePrices={livePrices}
        />
        <TopMovers />
      </div>

      {/* Right sidebar */}
      <div style={{ position: "sticky", top: "80px" }}>
        <PortfolioSummary />
      </div>
    </div>
  );
}