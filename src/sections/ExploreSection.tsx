"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useLivePrices } from "@/hooks/useLivePrices";
import { onStockViewed } from "@/lib/stockEvents";

/* ─── helpers ─── */
function fmt(n: number) {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function calcChange(price: number, prevClose: number) {
  if (!prevClose) return { change: 0, pct: 0 };
  const change = price - prevClose;
  const pct    = (change / prevClose) * 100;
  return { change, pct };
}

/* ─── Types ─── */
interface RecentStock {
  id: string;
  symbol: string;
  name: string;
  exchange: string;
  sector?: string;
  quote: {
    price: number;
    open: number;
    high: number;
    low: number;
    close: number; // previous close
    volume: number;
    updatedAt: string;
  } | null;
}

/* ─── Stock Card ─── */
function StockCard({ stock, livePrice }: { stock: RecentStock; livePrice?: number }) {
  const basePrice  = livePrice ?? stock.quote?.price ?? null;
  const prevClose  = stock.quote?.close ?? 0;
  const { change, pct } = basePrice ? calcChange(basePrice, prevClose) : { change: 0, pct: 0 };
  const positive   = pct >= 0;

  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const [prevLive, setPrevLive] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (livePrice !== undefined && prevLive !== undefined && livePrice !== prevLive) {
      setFlash(livePrice > prevLive ? "up" : "down");
      const t = setTimeout(() => setFlash(null), 600);
      return () => clearTimeout(t);
    }
    setPrevLive(livePrice);
  }, [livePrice]);

  return (
    <div
      className="card card-hover animate-fade-up"
      style={{
        padding: "18px",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        background: flash === "up"
          ? "rgba(22,163,74,0.04)"
          : flash === "down"
          ? "rgba(220,38,38,0.04)"
          : "var(--color-surface)",
        transition: "background 0.4s ease, box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease",
      }}
    >
      {/* Colored top stripe */}
      <div
        style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "3px",
          background: positive ? "var(--color-gain)" : "var(--color-loss)",
          opacity: basePrice ? 1 : 0,
          transition: "opacity 0.3s",
        }}
      />

      {/* Logo + exchange */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div
          style={{
            width: 40, height: 40, borderRadius: "10px",
            background: "var(--color-primary-light)",
            color: "var(--color-primary)",
            fontWeight: 700, fontSize: "13px",
            display: "flex", alignItems: "center", justifyContent: "center",
            letterSpacing: "0.5px",
          }}
        >
          {stock.symbol.slice(0, 2)}
        </div>
        <span
          style={{
            fontSize: "10px", fontWeight: 600,
            color: "var(--color-text-muted)",
            background: "var(--color-surface-2)",
            padding: "2px 7px", borderRadius: "99px",
          }}
        >
          {stock.exchange || "NSE"}
        </span>
      </div>

      {/* Name */}
      <div style={{ fontWeight: 700, fontSize: "13.5px", color: "var(--color-text-primary)", marginBottom: "2px" }}>
        {stock.symbol}
      </div>
      <div style={{ fontSize: "11.5px", color: "var(--color-text-muted)", marginBottom: "12px", lineHeight: 1.3 }}>
        {stock.name}
      </div>

      {/* Price */}
      <div
        style={{
          fontFamily: "var(--font-mono)", fontWeight: 700,
          fontSize: "17px", color: "var(--color-text-primary)", marginBottom: "6px",
        }}
      >
        {basePrice !== null ? `₹${fmt(basePrice)}` : "—"}
      </div>

      {/* Change badge */}
      {basePrice !== null && (
        <span
          style={{
            display: "inline-flex", alignItems: "center", gap: "3px",
            fontSize: "11.5px", fontWeight: 600,
            color: positive ? "var(--color-gain)" : "var(--color-loss)",
            background: positive ? "var(--color-gain-bg)" : "var(--color-loss-bg)",
            padding: "2px 8px", borderRadius: "99px",
          }}
        >
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d={positive ? "M12 19V5M5 12l7-7 7 7" : "M12 5v14M5 12l7 7 7-7"} />
          </svg>
          {positive ? "+" : ""}{pct.toFixed(2)}%
        </span>
      )}
    </div>
  );
}

/* ─── Empty State ─── */
function EmptyState() {
  return (
    <div
      className="card animate-fade-up"
      style={{
        padding: "56px 32px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        gridColumn: "1 / -1", // span full grid
        border: "1.5px dashed var(--color-border)",
        background: "var(--color-surface)",
        boxShadow: "none",
      }}
    >
      {/* Animated search illustration */}
      <div
        style={{
          width: 64, height: 64, borderRadius: "18px",
          background: "var(--color-primary-light)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>

      <div>
        <p style={{ fontWeight: 700, fontSize: "16px", color: "var(--color-text-primary)", marginBottom: "6px" }}>
          No recently viewed stocks
        </p>
        <p style={{ color: "var(--color-text-muted)", fontSize: "13.5px", maxWidth: "300px", lineHeight: 1.6 }}>
          Search for a stock in the navbar to load its live price — it'll appear here automatically.
        </p>
      </div>

      <div
        style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "10px 18px",
          borderRadius: "var(--radius-md)",
          background: "var(--color-primary-mid)",
          fontSize: "12.5px", fontWeight: 600, color: "var(--color-primary)",
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        Try searching: RELIANCE, TCS, HDFC…
      </div>
    </div>
  );
}

/* ─── Skeleton loaders ─── */
function SkeletonCards() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="card animate-fade-up"
          style={{
            padding: "18px",
            height: "158px",
            background: "linear-gradient(90deg, var(--color-surface-2) 0%, var(--color-border-soft) 50%, var(--color-surface-2) 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
          }}
        />
      ))}
    </>
  );
}

/* ─── Top Movers (mock, unchanged) ─── */
type MoverTab = "Gainers" | "Losers" | "Volume";

const MOCK_MOVERS = {
  Gainers: [
    { symbol: "JINDAL STEEL",  name: "Jindal Steel & Power",  price: 1186.50, change: 48.40,  pct: 4.25,  volume: "1.99 Cr" },
    { symbol: "JSW STEEL",     name: "JSW Steel Ltd",          price: 1169.60, change: 38.70,  pct: 3.42,  volume: "—" },
    { symbol: "TECH MAHINDRA", name: "Tech Mahindra Ltd",      price: 1384.80, change: 44.20,  pct: 3.30,  volume: "33.97 L" },
    { symbol: "TATA STEEL",    name: "Tata Steel Ltd",         price: 196.77,  change: 6.26,   pct: 3.29,  volume: "4.69 Cr" },
    { symbol: "COAL INDIA",    name: "Coal India Ltd",         price: 468.15,  change: 13.95,  pct: 3.07,  volume: "2.39 Cr" },
  ],
  Losers: [
    { symbol: "HDFC BANK",     name: "HDFC Bank Ltd",          price: 1780.45, change: -17.75, pct: -2.22, volume: "1.20 Cr" },
    { symbol: "BAJAJ FINANCE", name: "Bajaj Finance Ltd",      price: 6540.00, change: -98.30, pct: -1.48, volume: "45.2 L" },
    { symbol: "TITAN CO",      name: "Titan Company Ltd",      price: 3320.10, change: -39.50, pct: -1.18, volume: "18.3 L" },
  ],
  Volume: [
    { symbol: "TATA STEEL",    name: "Tata Steel Ltd",         price: 196.77,  change: 6.26,   pct: 3.29,  volume: "4.69 Cr" },
    { symbol: "COAL INDIA",    name: "Coal India Ltd",         price: 468.15,  change: 13.95,  pct: 3.07,  volume: "2.39 Cr" },
    { symbol: "SBI",           name: "State Bank of India",    price: 812.60,  change: 5.40,   pct: 0.67,  volume: "3.84 Cr" },
  ],
};

function TopMovers() {
  const [tab, setTab] = useState<MoverTab>("Gainers");
  const movers = MOCK_MOVERS[tab];

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div style={{ padding: "18px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 700, fontSize: "15px" }}>Top movers today</span>
        <div
          style={{
            display: "flex", gap: "4px",
            background: "var(--color-surface-2)",
            padding: "3px", borderRadius: "var(--radius-md)",
          }}
        >
          {(["Gainers", "Losers", "Volume"] as MoverTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "4px 12px", borderRadius: "7px", border: "none",
                background: tab === t ? "var(--color-surface)" : "transparent",
                color: tab === t ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                fontWeight: tab === t ? 600 : 400,
                fontSize: "12.5px", cursor: "pointer",
                fontFamily: "var(--font-sans)",
                boxShadow: tab === t ? "var(--shadow-sm)" : "none",
                transition: "all 0.15s",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "8px" }}>
          <thead>
            <tr style={{ background: "var(--color-surface-2)" }}>
              {["Company", "Market price", "Change", "Volume"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 20px",
                    textAlign: h === "Company" ? "left" : "right",
                    fontSize: "11.5px", fontWeight: 600,
                    color: "var(--color-text-muted)",
                    letterSpacing: "0.5px", textTransform: "uppercase",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {movers.map((m, i) => {
              const pos = m.pct >= 0;
              return (
                <tr
                  key={i}
                  style={{ borderTop: "1px solid var(--color-border-soft)", cursor: "pointer", transition: "background 0.1s" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "var(--color-surface-2)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}
                >
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: 34, height: 34, borderRadius: "8px",
                          background: pos ? "var(--color-gain-bg)" : "var(--color-loss-bg)",
                          color: pos ? "var(--color-gain)" : "var(--color-loss)",
                          fontWeight: 700, fontSize: "11px",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {m.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "13px" }}>{m.symbol}</div>
                        <div style={{ fontSize: "11.5px", color: "var(--color-text-muted)" }}>{m.name}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: "right", padding: "14px 20px", fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: "13px" }}>
                    ₹{m.price.toLocaleString("en-IN")}
                  </td>
                  <td style={{ textAlign: "right", padding: "14px 20px" }}>
                    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-end", gap: "1px" }}>
                      <span style={{ fontSize: "12.5px", fontWeight: 600, color: pos ? "var(--color-gain)" : "var(--color-loss)" }}>
                        {pos ? "+" : ""}{m.change.toFixed(2)}
                      </span>
                      <span
                        style={{
                          fontSize: "11px", fontWeight: 600,
                          color: pos ? "var(--color-gain)" : "var(--color-loss)",
                          background: pos ? "var(--color-gain-bg)" : "var(--color-loss-bg)",
                          padding: "1px 6px", borderRadius: "99px",
                        }}
                      >
                        {pos ? "+" : ""}{m.pct.toFixed(2)}%
                      </span>
                    </span>
                  </td>
                  <td style={{ textAlign: "right", padding: "14px 20px", fontSize: "12.5px", color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}>
                    {m.volume}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Portfolio Summary ─── */
function PortfolioSummary() {
  const [wallet, setWallet] = useState<any>(null);

  useEffect(() => {
    api.get("/wallet")
      .then((r) => setWallet(r.data))
      .catch(() => {});
  }, []);

  const balance = wallet ? Number(wallet.balance) : 0;
  const locked  = wallet ? Number(wallet.lockedBalance) : 0;

  return (
    <div className="card" style={{ padding: "22px", marginBottom: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <span style={{ fontWeight: 700, fontSize: "15px" }}>Your Investments</span>
        <button
          style={{
            background: "var(--color-primary)", color: "white",
            border: "none", borderRadius: "var(--radius-md)",
            padding: "6px 14px", fontSize: "12.5px", fontWeight: 600,
            cursor: "pointer", fontFamily: "var(--font-sans)",
            boxShadow: "var(--shadow-blue)", transition: "background 0.15s",
          }}
          onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.background = "var(--color-primary-hover)")}
          onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.background = "var(--color-primary)")}
        >
          + Add Funds
        </button>
      </div>

      {/* Balance card */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--blue-600), var(--blue-700))",
          borderRadius: "var(--radius-md)", padding: "18px",
          marginBottom: "16px", position: "relative", overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute", top: "-20px", right: "-20px",
            width: "100px", height: "100px", borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          }}
        />
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.65)", fontWeight: 500, letterSpacing: "0.5px", marginBottom: "6px" }}>
          AVAILABLE BALANCE
        </p>
        <p style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "24px", color: "white", letterSpacing: "-0.5px" }}>
          ₹{fmt(balance)}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        {[
          { label: "Locked Funds", value: `₹${fmt(locked)}` },
          { label: "Total Orders", value: "—" },
        ].map((s) => (
          <div
            key={s.label}
            style={{ background: "var(--color-surface-2)", borderRadius: "var(--radius-md)", padding: "12px 14px" }}
          >
            <p style={{ fontSize: "11px", color: "var(--color-text-muted)", fontWeight: 500, marginBottom: "4px" }}>
              {s.label}
            </p>
            <p style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "16px", color: "var(--color-text-primary)" }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Export ─── */
export default function ExploreSection() {
  const [stocks,  setStocks]  = useState<RecentStock[]>([]);
  const [loading, setLoading] = useState(true);

  // ─── Fetch recently viewed from backend ───
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

  // Re-fetch whenever Searchbar records a new view
  useEffect(() => {
    return onStockViewed(fetchRecent);
  }, [fetchRecent]);

  // Also refresh every 30s to pick up cron-updated prices
  useEffect(() => {
    const interval = setInterval(fetchRecent, 30_000);
    return () => clearInterval(interval);
  }, [fetchRecent]);

  // Live WebSocket prices overlay (only for stocks currently shown)
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
      {/* ─── LEFT ─── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Recently viewed section */}
        <div>
          {/* Header */}
          <div
            style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between", marginBottom: "14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h2 style={{ fontWeight: 700, fontSize: "17px", color: "var(--color-text-primary)" }}>
                Recently viewed
              </h2>
              {stocks.length > 0 && (
                <span
                  style={{
                    fontSize: "11px", fontWeight: 600,
                    color: "var(--color-text-muted)",
                    background: "var(--color-surface-2)",
                    padding: "2px 8px", borderRadius: "99px",
                  }}
                >
                  {stocks.length} stock{stocks.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Live indicator */}
            {stocks.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span
                  style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: "var(--color-gain)",
                    boxShadow: "0 0 0 2px var(--color-gain-bg)",
                    display: "inline-block",
                    animation: "pulse 2s infinite",
                  }}
                />
                <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
                <span style={{ fontSize: "11.5px", color: "var(--color-gain)", fontWeight: 600 }}>
                  Live
                </span>
              </div>
            )}
          </div>

          {/* Cards grid */}
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}
            className="stagger"
          >
            {loading ? (
              <SkeletonCards />
            ) : stocks.length === 0 ? (
              <EmptyState />
            ) : (
              stocks.map((stock) => (
                <StockCard
                  key={stock.id}
                  stock={stock}
                  livePrice={livePrices[stock.id]}
                />
              ))
            )}
          </div>

          {/* Hint below cards if there are stocks */}
          {!loading && stocks.length > 0 && stocks.length < 10 && (
            <p
              style={{
                marginTop: "12px", fontSize: "12px",
                color: "var(--color-text-muted)", textAlign: "center",
              }}
            >
              Search more stocks to add them here
            </p>
          )}
        </div>

        {/* Top movers */}
        <TopMovers />
      </div>

      {/* ─── RIGHT sidebar ─── */}
      <div style={{ position: "sticky", top: "80px" }}>
        <PortfolioSummary />

        {/* Products & Tools */}
        <div className="card" style={{ padding: "18px" }}>
          <p style={{ fontWeight: 700, fontSize: "14px", marginBottom: "12px" }}>Products & Tools</p>
          {[
            { icon: "📈", label: "IPO",          badge: "2 open" },
            { icon: "🏦", label: "Bonds",         badge: "12 open" },
            { icon: "💰", label: "Tax Saver",     badge: null },
            { icon: "📊", label: "ETF Screener",  badge: null },
          ].map((tool) => (
            <div
              key={tool.label}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid var(--color-border-soft)",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "16px" }}>{tool.icon}</span>
                <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)" }}>
                  {tool.label}
                </span>
              </div>
              {tool.badge && (
                <span
                  style={{
                    fontSize: "11px", fontWeight: 600,
                    color: "var(--color-primary)",
                    background: "var(--color-primary-mid)",
                    padding: "2px 8px", borderRadius: "99px",
                  }}
                >
                  {tool.badge}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}