"use client";
// src/components/stock/OrderPanel.tsx

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { OrderSide, OrderType } from "@/types/stock";

type OrderCategory = "DELIVERY" | "INTRADAY";

interface Props {
  stockId:     string;
  stockName:   string;
  livePrice:   number;
  onOrderDone: () => void;
}

function fmt(n: number) {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const isMarketOpen = (): boolean => {
  const now = new Date();
  const ist  = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  const day  = ist.getUTCDay();
  const mins = ist.getUTCHours() * 60 + ist.getUTCMinutes();
  return day >= 1 && day <= 5 && mins >= 540 && mins <= 930;
};

export default function OrderPanel({ stockId, stockName, livePrice, onOrderDone }: Props) {
  const [side,          setSide]          = useState<OrderSide>("BUY");
  const [oType,         setOType]         = useState<OrderType>("LIMIT");
  const [category,      setCategory]      = useState<OrderCategory>("DELIVERY");
  const [qty,           setQty]           = useState("");
  const [price,         setPrice]         = useState(livePrice > 0 ? livePrice.toFixed(2) : "");
  const [wallet,        setWallet]        = useState<any>(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [loading,       setLoading]       = useState(false);
  const [msg,           setMsg]           = useState<{ ok: boolean; text: string } | null>(null);

  const marketOpen = isMarketOpen();

  // ── Fetch wallet with retry ──
  useEffect(() => {
    const fetchWallet = () => {
      api.get("/wallet")
        .then(r => { setWallet(r.data); setWalletLoading(false); })
        .catch(() => {
          setTimeout(() => {
            api.get("/wallet")
              .then(r => { setWallet(r.data); setWalletLoading(false); })
              .catch(() => setWalletLoading(false));
          }, 1000);
        });
    };
    fetchWallet();
  }, []);

  // ── Sync price with live price ──
  useEffect(() => {
    if (oType === "LIMIT" && livePrice > 0) setPrice(livePrice.toFixed(2));
  }, [livePrice, oType]);

  // ── Clear stale messages on any input change ──
  useEffect(() => {
    setMsg(null);
  }, [category, side, qty, price, oType]);

  // ── Reset to delivery if market closed ──
  useEffect(() => {
    if (!marketOpen && category === "INTRADAY") setCategory("DELIVERY");
    setMsg(null);
  }, [category]);

  // ── Derived values ──
  const balance    = wallet ? Number(wallet.balance) : 0;
  const orderPrice = oType === "MARKET" ? livePrice : Number(price || 0);
  const approxReq  = Number(qty || 0) * orderPrice;
  const marginReq  = category === "INTRADAY" ? approxReq / 5 : approxReq;

  // true while loading to avoid false negatives before wallet loads
  const canAfford  = walletLoading || side === "SELL" || balance >= marginReq;

  const buyActive = side === "BUY";
  const btnColor  = buyActive ? "#16a34a" : "#dc2626";
  const btnHover  = buyActive ? "#15803d" : "#b91c1c";

  // ── Place order ──
  const placeOrder = async () => {
    setMsg(null);
    if (!qty || Number(qty) <= 0) {
      setMsg({ ok: false, text: "Enter a valid quantity" });
      return;
    }
    if (oType === "LIMIT" && (!price || Number(price) <= 0)) {
      setMsg({ ok: false, text: "Enter a valid price" });
      return;
    }

    setLoading(true);
    try {
      await api.post("/orders", {
        stockId,
        side,
        type:     oType,
        category,
        price:    oType === "MARKET" ? livePrice : Number(price),
        quantity: Number(qty),
      });
      setMsg({ ok: true, text: `${category === "INTRADAY" ? "Intraday" : "Delivery"} ${side} order placed!` });
      setQty("");
      const w = await api.get("/wallet");
      setWallet(w.data);
      onOrderDone();
    } catch (err: any) {
      setMsg({ ok: false, text: err?.response?.data?.message ?? "Order failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden", position: "sticky", top: 100 }}>

      {/* ── Stock name + live price ── */}
      <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--color-border-soft)" }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{stockName}</div>
        <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
          NSE · Live ₹{fmt(livePrice)}
        </div>
      </div>

      {/* ── BUY / SELL toggle ── */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--color-border-soft)" }}>
        {(["BUY", "SELL"] as OrderSide[]).map(s => (
          <button
            key={s}
            onClick={() => { setSide(s); setMsg(null); }}
            style={{
              flex: 1, padding: "12px 0", border: "none",
              background: side === s
                ? s === "BUY" ? "#f0fdf4" : "#fef2f2"
                : "transparent",
              color: side === s
                ? s === "BUY" ? "#16a34a" : "#dc2626"
                : "var(--color-text-muted)",
              fontWeight: side === s ? 700 : 500,
              fontSize: 14, cursor: "pointer",
              fontFamily: "var(--font-sans)",
              borderBottom: side === s
                ? `2px solid ${s === "BUY" ? "#16a34a" : "#dc2626"}`
                : "2px solid transparent",
              transition: "all 0.15s",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* ── DELIVERY / INTRADAY toggle ── */}
        <div style={{ display: "flex", gap: 6 }}>
          {(["DELIVERY", "INTRADAY"] as OrderCategory[]).map(cat => {
            const disabled = cat === "INTRADAY" && !marketOpen;
            return (
              <button
                key={cat}
                onClick={() => { if (!disabled) { setCategory(cat); setMsg(null); } }}
                disabled={disabled}
                title={disabled ? "Available Mon–Fri 9:00 AM – 3:30 PM IST" : undefined}
                style={{
                  flex: 1, padding: "7px 0",
                  borderRadius: "var(--radius-md)",
                  border: `1.5px solid ${
                    disabled ? "var(--color-border)" :
                    category === cat
                      ? cat === "INTRADAY" ? "#d97706" : "var(--color-primary)"
                      : "var(--color-border)"
                  }`,
                  background: disabled ? "var(--color-surface-2)" :
                    category === cat
                      ? cat === "INTRADAY" ? "#fffbeb" : "var(--color-primary-light)"
                      : "transparent",
                  color: disabled ? "var(--color-text-muted)" :
                    category === cat
                      ? cat === "INTRADAY" ? "#d97706" : "var(--color-primary)"
                      : "var(--color-text-secondary)",
                  fontWeight: !disabled && category === cat ? 700 : 500,
                  fontSize: 12.5,
                  cursor: disabled ? "not-allowed" : "pointer",
                  fontFamily: "var(--font-sans)",
                  transition: "all 0.15s",
                  opacity: disabled ? 0.5 : 1,
                }}
              >
                {cat === "DELIVERY" ? "Delivery" : `Intraday${disabled ? " 🔒" : ""}`}
              </button>
            );
          })}
        </div>

        {/* Market closed hint */}
        {!marketOpen && (
          <p style={{ fontSize: 11, color: "var(--color-text-muted)", textAlign: "center", marginTop: -4 }}>
            Intraday available Mon–Fri 9:00 AM – 3:30 PM IST
          </p>
        )}

        {/* Intraday warning banner */}
        {category === "INTRADAY" && (
          <div style={{
            padding: "8px 12px", borderRadius: "var(--radius-md)",
            background: "#fffbeb", border: "1px solid #fde68a",
            fontSize: 11.5, color: "#92400e",
            display: "flex", alignItems: "flex-start", gap: 6,
          }}>
            <span style={{ fontSize: 13 }}>⚡</span>
            <span>
              5x leverage · Auto square-off at <strong>3:20 PM</strong>.
              Only 20% margin required.
            </span>
          </div>
        )}

        {/* ── LIMIT / MARKET toggle ── */}
        <div style={{ display: "flex", gap: 8 }}>
          {(["LIMIT", "MARKET"] as OrderType[]).map(t => (
            <button
              key={t}
              onClick={() => { setOType(t); setMsg(null); }}
              style={{
                padding: "5px 14px",
                borderRadius: "var(--radius-md)",
                border: `1.5px solid ${oType === t ? "var(--color-primary)" : "var(--color-border)"}`,
                background: oType === t ? "var(--color-primary-light)" : "transparent",
                color: oType === t ? "var(--color-primary)" : "var(--color-text-secondary)",
                fontWeight: oType === t ? 700 : 500,
                fontSize: 12.5, cursor: "pointer",
                fontFamily: "var(--font-sans)", transition: "all 0.15s",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Quantity ── */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 6 }}>
            Quantity
          </label>
          <input
            type="number" min="1" value={qty}
            onChange={e => { setQty(e.target.value); setMsg(null); }}
            placeholder="0"
            style={{
              width: "100%", padding: "10px 12px",
              border: "1.5px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              fontSize: 14, fontFamily: "var(--font-mono)",
              color: "var(--color-text-primary)",
              background: "var(--color-surface)", outline: "none",
              transition: "border 0.15s",
            }}
            onFocus={e => (e.target.style.borderColor = "var(--color-primary)")}
            onBlur={e  => (e.target.style.borderColor = "var(--color-border)")}
          />
        </div>

        {/* ── Price (LIMIT only) ── */}
        {oType === "LIMIT" && (
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 6 }}>
              Price (₹)
            </label>
            <input
              type="number" min="0.01" step="0.05" value={price}
              onChange={e => { setPrice(e.target.value); setMsg(null); }}
              style={{
                width: "100%", padding: "10px 12px",
                border: "1.5px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                fontSize: 14, fontFamily: "var(--font-mono)",
                color: "var(--color-text-primary)",
                background: "var(--color-surface)", outline: "none",
                transition: "border 0.15s",
              }}
              onFocus={e => (e.target.style.borderColor = "var(--color-primary)")}
              onBlur={e  => (e.target.style.borderColor = "var(--color-border)")}
            />
          </div>
        )}

        {oType === "MARKET" && (
          <div style={{ padding: "10px 12px", background: "var(--color-surface-2)", borderRadius: "var(--radius-md)", fontSize: 13, color: "var(--color-text-secondary)" }}>
            Executes at best available price (~₹{fmt(livePrice)})
          </div>
        )}

        {/* ── Balance info ── */}
        <div style={{ padding: "10px 14px", background: "var(--color-surface-2)", borderRadius: "var(--radius-md)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
              {category === "INTRADAY" ? "Margin required (20%)" : "Approx. required"}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--color-text-primary)" }}>
              {walletLoading ? "…" : `₹${approxReq > 0 ? fmt(marginReq) : "0.00"}`}
            </span>
          </div>
          {category === "INTRADAY" && approxReq > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Total order value (5x)</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-text-muted)" }}>
                ₹{fmt(approxReq)}
              </span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Available balance</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--color-gain)" }}>
              {walletLoading ? "…" : `₹${fmt(balance)}`}
            </span>
          </div>
        </div>

        {/* ── Reactive insufficient balance (never stale) ── */}
        {side === "BUY" && !walletLoading && qty && Number(qty) > 0 && !canAfford && (
          <div style={{
            padding: "10px 14px", borderRadius: "var(--radius-md)",
            background: "var(--color-loss-bg)",
            border: "1px solid rgba(220,38,38,0.25)",
            color: "var(--color-loss)", fontSize: 13, fontWeight: 500,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            ⚠ Insufficient balance. Need ₹{fmt(marginReq - balance)} more.
          </div>
        )}

        {/* ── Order result message ── */}
        {msg && (
          <div
            className="animate-slide-down"
            style={{
              padding: "10px 14px", borderRadius: "var(--radius-md)",
              background: msg.ok ? "var(--color-gain-bg)" : "var(--color-loss-bg)",
              border: `1px solid ${msg.ok ? "rgba(22,163,74,0.25)" : "rgba(220,38,38,0.25)"}`,
              color: msg.ok ? "var(--color-gain)" : "var(--color-loss)",
              fontSize: 13, fontWeight: 500,
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            {msg.ok ? "✓" : "⚠"} {msg.text}
          </div>
        )}

        {/* ── Submit button ── */}
        <button
          onClick={placeOrder}
          disabled={loading || (!walletLoading && !canAfford)}
          style={{
            padding: "13px", borderRadius: "var(--radius-md)", border: "none",
            background: loading || (!walletLoading && !canAfford) ? "#94a3b8" : btnColor,
            color: "white", fontWeight: 700, fontSize: 15,
            cursor: loading || (!walletLoading && !canAfford) ? "not-allowed" : "pointer",
            fontFamily: "var(--font-sans)", transition: "background 0.15s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
          onMouseEnter={e => {
            if (!loading && canAfford)
              (e.currentTarget as HTMLButtonElement).style.background = btnHover;
          }}
          onMouseLeave={e => {
            if (!loading && canAfford)
              (e.currentTarget as HTMLButtonElement).style.background = btnColor;
          }}
        >
          {loading ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                style={{ animation: "spin 0.7s linear infinite" }}>
                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Placing…
            </>
          ) : (
            `${side} · ${category === "INTRADAY" ? "Intraday" : "Delivery"}`
          )}
        </button>
      </div>
    </div>
  );
}