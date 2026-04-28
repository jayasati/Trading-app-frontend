"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import Spinner from "@/components/ui/Spinner";
import type { OrderType } from "@/types/stock";

interface ClosePositionModalProps {
  position: {
    stockId:     string;
    symbol:      string;
    name:        string;
    netQty:      number;
    avgBuyPrice: number;
    livePrice:   number;
    side: "BUY" | "SELL"; // BUY = user wants to sell to close, SELL = buy to close
  };
  onClose:     () => void;
  onOrderDone: () => void;
}

function fmt(n: number) {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ClosePositionModal({
  position, onClose, onOrderDone,
}: ClosePositionModalProps) {
  const [oType,   setOType]   = useState<OrderType>("MARKET");
  const [qty,     setQty]     = useState(String(position.netQty));
  const [price,   setPrice]   = useState(position.livePrice.toFixed(2));
  const [loading, setLoading] = useState(false);
  const [msg,     setMsg]     = useState<{ ok: boolean; text: string } | null>(null);

  // Close side is opposite of position side
  const closeSide = position.side === "BUY" ? "SELL" : "BUY";
  const isClosingSell = closeSide === "SELL";

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const orderPrice = oType === "MARKET" ? position.livePrice : Number(price || 0);
  const qtyNum     = Number(qty || 0);
  const qtyValid   = qtyNum > 0 && qtyNum <= position.netQty;
  const priceValid = oType === "MARKET" || Number(price) > 0;

  const placeOrder = async () => {
    setMsg(null);
    if (!qtyValid)  { setMsg({ ok: false, text: `Max quantity is ${position.netQty}` }); return; }
    if (!priceValid){ setMsg({ ok: false, text: "Enter a valid price" }); return; }

    setLoading(true);
    try {
      await api.post("/orders", {
        stockId:  position.stockId,
        side:     closeSide,
        type:     oType,
        category: "INTRADAY",
        price:    orderPrice,
        quantity: qtyNum,
      });
      setMsg({ ok: true, text: "Position closed successfully!" });
      onOrderDone();
      setTimeout(onClose, 1200);
    } catch (err: unknown) {
      setMsg({
        ok: false,
        text: (err as any)?.response?.data?.message ?? "Order failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  const accentColor = isClosingSell ? "#dc2626" : "#16a34a";
  const accentBg    = isClosingSell ? "#fef2f2"  : "#f0fdf4";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(15,23,42,0.45)",
          backdropFilter: "blur(2px)",
          zIndex: 100, animation: "fadeIn 0.15s ease",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 101,
          width: "100%", maxWidth: "420px",
          background: "var(--color-surface)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-lg)",
          overflow: "hidden",
          animation: "fadeUp 0.2s ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid var(--color-border-soft)",
            background: accentBg,
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, color: accentColor, letterSpacing: "-0.3px" }}>
              {closeSide} {position.symbol} · Intraday
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>
              {position.name} · Net qty: {position.netQty}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: 4,
              color: "var(--color-text-muted)", display: "flex", alignItems: "center",
              borderRadius: "var(--radius-sm)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Summary */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Avg Buy Price", value: `₹${fmt(position.avgBuyPrice)}` },
              { label: "LTP",           value: `₹${fmt(position.livePrice)}` },
            ].map((s) => (
              <div key={s.label} style={{
                background: "var(--color-surface-2)",
                borderRadius: "var(--radius-md)", padding: "10px 12px",
              }}>
                <div style={{ fontSize: 10.5, color: "var(--color-text-muted)", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 14 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Order type */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600,
              color: "var(--color-text-secondary)", marginBottom: 8 }}>
              Order Type
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["MARKET", "LIMIT"] as OrderType[]).map((t) => (
                <button key={t} onClick={() => { setOType(t); setMsg(null); }}
                  style={{
                    padding: "6px 16px", borderRadius: "var(--radius-md)",
                    border: `1.5px solid ${oType === t ? accentColor : "var(--color-border)"}`,
                    background: oType === t ? accentBg : "transparent",
                    color: oType === t ? accentColor : "var(--color-text-secondary)",
                    fontWeight: oType === t ? 700 : 500,
                    fontSize: 13, cursor: "pointer", fontFamily: "var(--font-sans)",
                    transition: "all 0.15s",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)" }}>
                Quantity
              </label>
              <button
                onClick={() => { setQty(String(position.netQty)); setMsg(null); }}
                style={{
                  background: "none", border: "none", fontSize: 11,
                  fontWeight: 600, color: accentColor, cursor: "pointer", fontFamily: "var(--font-sans)",
                }}
              >
                Full ({position.netQty})
              </button>
            </div>
            <input
              type="number" min="1" max={position.netQty}
              value={qty}
              onChange={(e) => { setQty(e.target.value); setMsg(null); }}
              style={{
                width: "100%", padding: "10px 12px",
                border: `1.5px solid ${qty && Number(qty) > position.netQty ? accentColor : "var(--color-border)"}`,
                borderRadius: "var(--radius-md)",
                fontSize: 14, fontFamily: "var(--font-mono)",
                color: "var(--color-text-primary)",
                background: "var(--color-surface)", outline: "none",
              }}
              onFocus={(e) => (e.target.style.borderColor = accentColor)}
              onBlur={(e)  => (e.target.style.borderColor = "var(--color-border)")}
            />
          </div>

          {/* Price (LIMIT only) */}
          {oType === "LIMIT" && (
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600,
                color: "var(--color-text-secondary)", marginBottom: 6 }}>
                Limit Price (₹)
              </label>
              <input
                type="number" min="0.01" step="0.05"
                value={price}
                onChange={(e) => { setPrice(e.target.value); setMsg(null); }}
                style={{
                  width: "100%", padding: "10px 12px",
                  border: "1.5px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  fontSize: 14, fontFamily: "var(--font-mono)",
                  color: "var(--color-text-primary)",
                  background: "var(--color-surface)", outline: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = accentColor)}
                onBlur={(e)  => (e.target.style.borderColor = "var(--color-border)")}
              />
            </div>
          )}

          {/* Market hint */}
          {oType === "MARKET" && (
            <div style={{
              padding: "10px 12px", background: "var(--color-surface-2)",
              borderRadius: "var(--radius-md)", fontSize: 13, color: "var(--color-text-secondary)",
            }}>
              Executes at best available price (~₹{fmt(position.livePrice)})
            </div>
          )}

          {/* Message */}
          {msg && (
            <div style={{
              padding: "10px 14px", borderRadius: "var(--radius-md)",
              background: msg.ok ? "var(--color-gain-bg)" : "var(--color-loss-bg)",
              border: `1px solid ${msg.ok ? "rgba(22,163,74,0.25)" : "rgba(220,38,38,0.25)"}`,
              color: msg.ok ? "var(--color-gain)" : "var(--color-loss)",
              fontSize: 13, fontWeight: 500,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              {msg.ok ? "✓" : "⚠"} {msg.text}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={placeOrder}
            disabled={loading || !qtyValid || !priceValid}
            style={{
              padding: "13px", borderRadius: "var(--radius-md)", border: "none",
              background: loading || !qtyValid || !priceValid ? "#94a3b8" : accentColor,
              color: "white", fontWeight: 700, fontSize: 15,
              cursor: loading || !qtyValid || !priceValid ? "not-allowed" : "pointer",
              fontFamily: "var(--font-sans)", transition: "background 0.15s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {loading ? (
              <><Spinner size={16} /> Placing…</>
            ) : (
              `${closeSide} · Intraday →`
            )}
          </button>
        </div>
      </div>
    </>
  );
}