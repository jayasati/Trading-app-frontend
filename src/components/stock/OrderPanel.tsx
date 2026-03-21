"use client";
// src/components/stock/OrderPanel.tsx

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { OrderSide, OrderType } from "@/types/stock";

interface Props {
  stockId:    string;
  stockName:  string;
  livePrice:  number;
  onOrderDone: () => void; // called after success to refresh wallet
}

function fmt(n: number) {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function OrderPanel({ stockId, stockName, livePrice, onOrderDone }: Props) {
  const [side,    setSide]    = useState<OrderSide>("BUY");
  const [oType,   setOType]   = useState<OrderType>("LIMIT");
  const [qty,     setQty]     = useState("");
  const [price,   setPrice]   = useState(livePrice > 0 ? livePrice.toFixed(2) : "");
  const [wallet,  setWallet]  = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [msg,     setMsg]     = useState<{ ok: boolean; text: string } | null>(null);

  // Sync price field with live price when type is LIMIT
  useEffect(() => {
    if (oType === "LIMIT" && livePrice > 0) {
      setPrice(livePrice.toFixed(2));
    }
  }, [livePrice, oType]);

  // Fetch wallet on mount
  useEffect(() => {
    api.get("/wallet")
      .then(r => setWallet(r.data))
      .catch(() => {});
  }, []);

  const balance   = wallet ? Number(wallet.balance) : 0;
  const orderPrice = oType === "MARKET" ? livePrice : Number(price || 0);
  const approxReq  = Number(qty || 0) * orderPrice;
  const canAfford  = side === "SELL" || balance >= approxReq;

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
    if (side === "BUY" && !canAfford) {
      setMsg({ ok: false, text: "Insufficient balance" });
      return;
    }

    setLoading(true);
    try {
      await api.post("/orders", {
        stockId,
        side,
        type:     oType,
        price:    oType === "MARKET" ? livePrice : Number(price),
        quantity: Number(qty),
      });
      setMsg({ ok: true, text: `${side} order placed successfully!` });
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

  const buyActive  = side === "BUY";
  const btnColor   = buyActive ? "#16a34a" : "#dc2626";
  const btnHover   = buyActive ? "#15803d" : "#b91c1c";

  return (
    <div
      className="card"
      style={{
        padding: 0,
        overflow: "hidden",
        position: "sticky",
        top: 100,
      }}
    >
      {/* Header: stock name + live price */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border-soft)" }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{stockName}</div>
        <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
          NSE · Live ₹{fmt(livePrice)}
        </div>
      </div>

      {/* BUY / SELL toggle */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--color-border-soft)" }}>
        {(["BUY", "SELL"] as OrderSide[]).map(s => (
          <button
            key={s}
            onClick={() => { setSide(s); setMsg(null); }}
            style={{
              flex: 1,
              padding: "12px 0",
              border: "none",
              background: side === s
                ? s === "BUY" ? "#f0fdf4" : "#fef2f2"
                : "transparent",
              color: side === s
                ? s === "BUY" ? "#16a34a" : "#dc2626"
                : "var(--color-text-muted)",
              fontWeight: side === s ? 700 : 500,
              fontSize: 14,
              cursor: "pointer",
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

      {/* Order type: LIMIT / MARKET */}
      <div style={{ padding: "14px 20px 0", display: "flex", gap: 8 }}>
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
              fontSize: 12.5,
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              transition: "all 0.15s",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Form fields */}
      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Quantity */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 6 }}>
            Quantity
          </label>
          <input
            type="number"
            min="1"
            value={qty}
            onChange={e => { setQty(e.target.value); setMsg(null); }}
            placeholder="0"
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1.5px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              fontSize: 14,
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-primary)",
              background: "var(--color-surface)",
              outline: "none",
              transition: "border 0.15s",
            }}
            onFocus={e => (e.target.style.borderColor = "var(--color-primary)")}
            onBlur={e => (e.target.style.borderColor = "var(--color-border)")}
          />
        </div>

        {/* Price (LIMIT only) */}
        {oType === "LIMIT" && (
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 6 }}>
              Price (₹)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.05"
              value={price}
              onChange={e => { setPrice(e.target.value); setMsg(null); }}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1.5px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                fontSize: 14,
                fontFamily: "var(--font-mono)",
                color: "var(--color-text-primary)",
                background: "var(--color-surface)",
                outline: "none",
                transition: "border 0.15s",
              }}
              onFocus={e => (e.target.style.borderColor = "var(--color-primary)")}
              onBlur={e => (e.target.style.borderColor = "var(--color-border)")}
            />
          </div>
        )}

        {oType === "MARKET" && (
          <div style={{ padding: "10px 12px", background: "var(--color-surface-2)", borderRadius: "var(--radius-md)", fontSize: 13, color: "var(--color-text-secondary)" }}>
            Market order — executes at best available price (~₹{fmt(livePrice)})
          </div>
        )}

        {/* Approx req + balance */}
        <div style={{ padding: "10px 14px", background: "var(--color-surface-2)", borderRadius: "var(--radius-md)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Approx. required</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: canAfford ? "var(--color-text-primary)" : "var(--color-loss)" }}>
              ₹{approxReq > 0 ? fmt(approxReq) : "0.00"}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Available balance</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--color-gain)" }}>
              ₹{fmt(balance)}
            </span>
          </div>
        </div>

        {/* Message */}
        {msg && (
          <div
            className="animate-slide-down"
            style={{
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              background: msg.ok ? "var(--color-gain-bg)" : "var(--color-loss-bg)",
              border: `1px solid ${msg.ok ? "rgba(22,163,74,0.25)" : "rgba(220,38,38,0.25)"}`,
              color: msg.ok ? "var(--color-gain)" : "var(--color-loss)",
              fontSize: 13,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {msg.ok ? "✓" : "⚠"} {msg.text}
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={placeOrder}
          disabled={loading || !canAfford}
          style={{
            padding: "13px",
            borderRadius: "var(--radius-md)",
            border: "none",
            background: loading || !canAfford ? "#94a3b8" : btnColor,
            color: "white",
            fontWeight: 700,
            fontSize: 15,
            cursor: loading || !canAfford ? "not-allowed" : "pointer",
            fontFamily: "var(--font-sans)",
            transition: "background 0.15s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.7s linear infinite" }}>
                <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Placing…
            </>
          ) : (
            `${side} ${stockName.split(" ")[0]}`
          )}
        </button>
      </div>
    </div>
  );
}