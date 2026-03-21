"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";
import { emitStockViewed } from "@/lib/stockEvents";

export default function SearchBar() {
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewing, setViewing] = useState<string | null>(null); // stockId being fetched
  const ref = useRef<HTMLDivElement>(null);

  const search = async (q: string) => {
    setQuery(q);
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await api.get(`/stocks/search?q=${q}`);
      setResults(res.data.slice(0, 8));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // ─── Called when user clicks a stock in results ───
  // Hits GET /market/quote/:id which:
  //   1. Fetches live price from Yahoo Finance (if not cached)
  //   2. Calls redis.recordView(stockId) on the backend
  //   3. ExploreSection re-fetches /market/recent and shows it
  const handleSelectStock = async (stock: any) => {
    console.log('Clicking stock:', stock);
    // Close dropdown immediately for snappy feel
    setFocused(false);
    setQuery("");
    setResults([]);

    setViewing(stock.id);
    try {
      await api.get(`/market/quote/${stock.id}`);
      // Tell ExploreSection to refresh its recently-viewed list
      emitStockViewed();
    } catch {
      // Quote fetch failed — still emit so the stock appears if DB had a cached price
      emitStockViewed();
    } finally {
      setViewing(null);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setFocused(false);
        setResults([]);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const showDropdown = focused && (results.length > 0 || (query.length > 0 && loading));

  return (
    <div ref={ref} style={{ position: "relative", width: "280px" }}>
      {/* Input */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: focused ? "var(--color-surface)" : "var(--color-surface-2)",
          border: `1px solid ${focused ? "var(--color-primary)" : "var(--color-border)"}`,
          borderRadius: "var(--radius-md)",
          padding: "7px 12px",
          transition: "all 0.15s ease",
          boxShadow: focused ? "0 0 0 3px rgba(37,99,235,0.12)" : "none",
        }}
      >
        {/* Search or spinner icon */}
        {viewing ? (
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="var(--color-primary)" strokeWidth="2.5"
            style={{ flexShrink: 0, animation: "spin 0.7s linear infinite" }}
          >
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        ) : (
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke={focused ? "var(--color-primary)" : "var(--color-text-muted)"}
            strokeWidth="2.5"
            style={{ flexShrink: 0, transition: "stroke 0.15s" }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        )}

        <input
          style={{
            border: "none",
            background: "transparent",
            outline: "none",
            fontSize: "13.5px",
            fontFamily: "var(--font-sans)",
            color: "var(--color-text-primary)",
            width: "100%",
            caretColor: "var(--color-primary)",
          }}
          placeholder="Search stocks…"
          value={query}
          onChange={(e) => search(e.target.value)}
          onFocus={() => setFocused(true)}
        />

        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); }}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--color-text-muted)", display: "flex",
              padding: 0, flexShrink: 0,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}

        <kbd
          style={{
            fontSize: "10px",
            fontFamily: "var(--font-mono)",
            color: "var(--color-text-muted)",
            background: "var(--color-border-soft)",
            border: "1px solid var(--color-border)",
            borderRadius: "4px",
            padding: "1px 5px",
            flexShrink: 0,
            display: focused ? "none" : "inline",
          }}
        >
          ⌘K
        </kbd>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          className="animate-slide-down"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-lg)",
            overflow: "hidden",
            zIndex: 100,
          }}
        >
          {/* Search tip */}
          <div
            style={{
              padding: "8px 14px 6px",
              fontSize: "11px",
              color: "var(--color-text-muted)",
              borderBottom: "1px solid var(--color-border-soft)",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
            </svg>
            Click a stock to load its live price
          </div>

          {loading && (
            <div style={{ padding: "16px", textAlign: "center", color: "var(--color-text-muted)", fontSize: "13px" }}>
              Searching…
            </div>
          )}

          {!loading && results.map((stock, i) => (
            <div
              key={stock.id}
              onClick={() => handleSelectStock(stock)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                cursor: "pointer",
                borderBottom: i < results.length - 1 ? "1px solid var(--color-border-soft)" : "none",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLDivElement).style.background = "var(--color-surface-2)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLDivElement).style.background = "transparent")
              }
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {/* Stock avatar */}
                <div
                  style={{
                    width: 32, height: 32, borderRadius: "8px",
                    background: "var(--color-primary-light)",
                    color: "var(--color-primary)",
                    fontWeight: 700, fontSize: "12px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {stock.symbol.slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "13px", color: "var(--color-text-primary)" }}>
                    {stock.symbol}
                  </div>
                  <div style={{ fontSize: "11.5px", color: "var(--color-text-muted)" }}>
                    {stock.name}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span
                  style={{
                    fontSize: "10.5px", fontWeight: 500,
                    color: "var(--color-text-muted)",
                    background: "var(--color-surface-2)",
                    padding: "2px 7px", borderRadius: "99px",
                  }}
                >
                  {stock.exchange || "NSE"}
                </span>
                {/* Arrow hint */}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}

          {!loading && results.length === 0 && query.length > 0 && (
            <div style={{ padding: "20px", textAlign: "center", color: "var(--color-text-muted)", fontSize: "13px" }}>
              No stocks found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}