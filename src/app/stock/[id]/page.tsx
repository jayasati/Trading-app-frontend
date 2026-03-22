"use client";

import { useState }       from "react";
import { useParams }      from "next/navigation";
import { useLivePrices }  from "@/hooks/useLivePrices";
import { useStockDetail } from "@/hooks/useStockDetail";

import StockHeader   from "@/components/stock/StockHeader";
import PriceChart    from "@/components/stock/PriceChart";
import OrderPanel    from "@/components/stock/order/OrderPanel";
import OverviewTab   from "@/components/stock/OverviewTab";
import TechnicalsTab from "@/components/stock/TechnicalsTab";
import NewsTab       from "@/components/stock/NewsTab";

import type { Period, StockTab } from "@/types/stock";

const TABS: StockTab[] = ["Overview", "Technicals", "News"];

export default function StockDetailPage() {
  const params  = useParams();
  const stockId = params.id as string;

  const [period, setPeriod] = useState<Period>("1M");
  const [tab,    setTab]    = useState<StockTab>("Overview");

  const {
    detail, history, news, loading,
    histLoading, newsLoading,
    refetchWallet, fetchHistory,
  } = useStockDetail(stockId);

  const livePrices = useLivePrices([stockId]);
  const livePrice  = livePrices[stockId] ?? detail?.quote?.price ?? 0;
  const prevClose  = detail?.quote?.close ?? 0;
  const change     = prevClose
    ? livePrice - prevClose
    : (detail?.quote?.change ?? 0);
  const changePct  = prevClose
    ? (change / prevClose) * 100
    : (detail?.quote?.changePct ?? 0);

  const positive = (() => {
    if (period === "1D" || history.length < 2) return change >= 0;
    const first = history[0].close;
    const last  = livePrice || history[history.length - 1].close;
    return last >= first;
  })();

  const handlePeriod = (p: Period) => {
    setPeriod(p);
    fetchHistory(p);
  };

  // ── Loading ──
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh", background: "var(--color-bg)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-sans)",
        }}
      >
        <div style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
          <div
            style={{
              width: 40, height: 40,
              border: "3px solid var(--color-primary)",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <p style={{ fontSize: 14 }}>Loading stock data…</p>
        </div>
      </div>
    );
  }

  // ── Not found ──
  if (!detail) {
    return (
      <div
        style={{
          minHeight: "100vh", background: "var(--color-bg)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-sans)",
        }}
      >
        <div className="card" style={{ padding: "48px 64px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
            Stock not found
          </p>
          <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
            This stock may not exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg)",
        fontFamily: "var(--font-sans)",
      }}
    >
      <StockHeader
        detail={detail}
        livePrice={livePrice}
        change={change}
        changePct={changePct}
        period={period}
        onPeriod={handlePeriod}
        history={history}
      />

      <div
        style={{
          maxWidth: 1400, margin: "0 auto",
          padding: "28px 24px 80px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 360px",
            gap: 24, alignItems: "start",
          }}
        >
          {/* ── Left column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Chart */}
            <div className="card" style={{ padding: "20px 20px 16px" }}>
              <PriceChart
                bars={history}
                period={period}
                positive={positive}
                loading={histLoading}
              />
            </div>

            {/* Tab nav */}
            <div
              style={{
                display: "flex", gap: 0,
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    padding: "10px 20px",
                    border: "none",
                    borderBottom: tab === t
                      ? "2px solid var(--color-primary)"
                      : "2px solid transparent",
                    background: "transparent",
                    color: tab === t
                      ? "var(--color-primary)"
                      : "var(--color-text-secondary)",
                    fontWeight:  tab === t ? 700 : 500,
                    fontSize:    14,
                    cursor:      "pointer",
                    fontFamily:  "var(--font-sans)",
                    transition:  "all 0.15s",
                    marginBottom: -1,
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="animate-fade-in">
              {tab === "Overview"   && <OverviewTab   detail={detail}  livePrice={livePrice} />}
              {tab === "Technicals" && <TechnicalsTab history={history} />}
              {tab === "News"       && <NewsTab       news={news}       loading={newsLoading} />}
            </div>
          </div>

          {/* ── Right column ── */}
          <OrderPanel
            stockId={stockId}
            stockName={detail.name}
            livePrice={livePrice}
            onOrderDone={refetchWallet}
          />
        </div>
      </div>
    </div>
  );
}
