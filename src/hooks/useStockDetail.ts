"use client";
// src/hooks/useStockDetail.ts

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { StockDetail, HistoricalBar, NewsItem, Period } from "@/types/stock";

interface UseStockDetailReturn {
  detail:       StockDetail | null;
  history:      HistoricalBar[];
  news:         NewsItem[];
  wallet:       any;
  loading:      boolean;
  histLoading:  boolean;
  newsLoading:  boolean;
  error:        string | null;
  refetchWallet: () => Promise<void>;
  fetchHistory:  (period: Period) => Promise<void>;
}

export function useStockDetail(stockId: string): UseStockDetailReturn {
  const [detail,      setDetail]      = useState<StockDetail | null>(null);
  const [history,     setHistory]     = useState<HistoricalBar[]>([]);
  const [news,        setNews]        = useState<NewsItem[]>([]);
  const [wallet,      setWallet]      = useState<any>(null);
  const [loading,     setLoading]     = useState(true);
  const [histLoading, setHistLoading] = useState(false);
  const [newsLoading, setNewsLoading] = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  // ─── Fetch wallet ───
  const refetchWallet = useCallback(async () => {
    try {
      const res = await api.get("/wallet");
      setWallet(res.data);
    } catch {
      // wallet fetch failure is non-critical
    }
  }, []);

  // ─── Fetch history on demand ───
  const fetchHistory = useCallback(async (period: Period) => {
    if (!stockId) return;
    setHistLoading(true);
    try {
      const res = await api.get(`/market/history/${stockId}?period=${period}`);
      setHistory(Array.isArray(res.data) ? res.data : []);
    } catch {
      setHistory([]);
    } finally {
      setHistLoading(false);
    }
  }, [stockId]);

  // ─── Initial load: detail + wallet + history (1M default) ───
  // Replace Promise.all with sequential fetches:
  useEffect(() => {
    if (!stockId) return;
    setLoading(true);
    setError(null);

    // Fetch detail first — critical
    api.get(`/market/detail/${stockId}`)
      .then(d => setDetail(d.data))
      .catch(err => setError(err?.response?.data?.message ?? "Failed to load"))
      .finally(() => setLoading(false));

    // Fetch wallet separately — non-critical
    api.get("/wallet")
      .then(w => setWallet(w.data))
      .catch(() => {});

    fetchHistory("1M");
  }, [stockId, fetchHistory]);

  // ─── Lazy-load news ───
  const fetchNews = useCallback(async () => {
    if (!stockId) return;
    setNewsLoading(true);
    try {
      const res = await api.get(`/market/news/${stockId}`);
      setNews(Array.isArray(res.data) ? res.data : []);
    } catch {
      setNews([]);
    } finally {
      setNewsLoading(false);
    }
  }, [stockId]);

  // Fetch news once on mount
  useEffect(() => { fetchNews(); }, [fetchNews]);

  return {
    detail, history, news, wallet,
    loading, histLoading, newsLoading, error,
    refetchWallet, fetchHistory,
  };
}