"use client";

import Spinner from "@/components/ui/Spinner";
import type { OrderSide } from "@/types/stock";

type OrderCategory = "DELIVERY" | "INTRADAY";

interface OrderSummaryProps {
  side:          OrderSide;
  category:      OrderCategory;
  qty:           string;
  orderPrice:    number;
  balance:       number;
  walletLoading: boolean;
  loading:       boolean;
  canAfford:     boolean;
  netShortQty:   number;
  msg:           { ok: boolean; text: string } | null;
  onSubmit:      () => void;
}

function fmt(n: number) {
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function OrderSummary({
  side, category, qty, orderPrice,
  balance, walletLoading, loading,
  canAfford, netShortQty, msg, onSubmit,
}: OrderSummaryProps) {
  const qtyNum    = Number(qty || 0);
  const approxReq = qtyNum * orderPrice;

  // Match the affordability split in OrderPanel: the cover portion of an
  // INTRADAY BUY needs no new margin.
  const coverQty    = side === "BUY" && category === "INTRADAY"
    ? Math.min(qtyNum, netShortQty)
    : 0;
  const openLongQty = qtyNum - coverQty;
  const marginReq   = category === "INTRADAY"
    ? (openLongQty * orderPrice) / 5
    : approxReq;
  const isCoveringShort = coverQty > 0;

  const isDeliverySell = side === "SELL" && category === "DELIVERY";
  const isIntradaySell = side === "SELL" && category === "INTRADAY";

  // Button is disabled when loading OR when balance is insufficient
  // NOTE: delivery sell is NEVER disabled for balance reasons (user receives money)
  const insufficientFunds = !walletLoading && !canAfford && qtyNum > 0 && orderPrice > 0;
  const disabled = loading || insufficientFunds;

  const btnColor = side === "BUY" ? "#16a34a" : "#dc2626";
  const btnHover = side === "BUY" ? "#15803d" : "#b91c1c";

  return (
    <div style={{ padding: "0 20px 14px", display: "flex", flexDirection: "column", gap: 12 }}>

      {/* Balance info card */}
      <div style={{
        padding: "10px 14px",
        background: "var(--color-surface-2)",
        borderRadius: "var(--radius-md)",
      }}>
        {/* Required funds row */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            {isDeliverySell
              ? "You will receive (approx.)"
              : isIntradaySell
                ? "Margin required (20%) — short"
                : category === "INTRADAY"
                  ? isCoveringShort && openLongQty === 0
                    ? "Covering short — no new margin"
                    : isCoveringShort
                      ? `Margin required (20%) — ${openLongQty} new long`
                      : "Margin required (20%)"
                  : "Approx. required"}
          </span>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700,
            color: isDeliverySell ? "var(--color-gain)" : "var(--color-text-primary)",
          }}>
            {walletLoading
              ? "…"
              : isDeliverySell
                ? `+₹${approxReq > 0 ? fmt(approxReq) : "0.00"}`
                : `₹${approxReq > 0 ? fmt(marginReq) : "0.00"}`}
          </span>
        </div>

        {/* Total leveraged value (intraday only) */}
        {category === "INTRADAY" && approxReq > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
              Total order value (5×)
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-text-muted)" }}>
              ₹{fmt(approxReq)}
            </span>
          </div>
        )}

        {/* Available balance */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Available balance</span>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 12,
            fontWeight: 700, color: "var(--color-gain)",
          }}>
            {walletLoading ? "…" : `₹${fmt(balance)}`}
          </span>
        </div>
      </div>

      {/* Insufficient balance warning — shown for BUY and INTRADAY SELL */}
      {insufficientFunds && !isDeliverySell && (
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

      {/* Order result message */}
      {msg && (
        <div className="animate-slide-down" style={{
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

      {/* Submit button */}
      <button
        onClick={onSubmit}
        disabled={disabled}
        style={{
          padding: "13px",
          borderRadius: "var(--radius-md)",
          border: "none",
          background: disabled ? "#94a3b8" : btnColor,
          color: "white", fontWeight: 700, fontSize: 15,
          cursor:     disabled ? "not-allowed" : "pointer",
          fontFamily: "var(--font-sans)",
          transition: "background 0.15s",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
        onMouseEnter={(e) => {
          if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = btnHover;
        }}
        onMouseLeave={(e) => {
          if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = btnColor;
        }}
      >
        {loading ? (
          <><Spinner size={16} />Placing…</>
        ) : disabled && insufficientFunds ? (
          `Insufficient balance`
        ) : (
          `${side} · ${category === "INTRADAY" ? "Intraday" : "Delivery"}`
        )}
      </button>
    </div>
  );
}