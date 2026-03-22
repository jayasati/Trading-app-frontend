"use client";

import type { OrderSide, OrderType } from "@/types/stock";

type OrderCategory = "DELIVERY" | "INTRADAY";

interface OrderFormProps {
  side:          OrderSide;
  oType:         OrderType;
  category:      OrderCategory;
  qty:           string;
  price:         string;
  marketOpen:    boolean;
  livePrice:     number;
  onSideChange:     (s: OrderSide)     => void;
  onTypeChange:     (t: OrderType)     => void;
  onCategoryChange: (c: OrderCategory) => void;
  onQtyChange:      (v: string)        => void;
  onPriceChange:    (v: string)        => void;
}

function fmt(n: number) {
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function OrderForm({
  side, oType, category, qty, price,
  marketOpen, livePrice,
  onSideChange, onTypeChange, onCategoryChange,
  onQtyChange, onPriceChange,
}: OrderFormProps) {
  return (
    <>
      {/* ── BUY / SELL toggle ── */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--color-border-soft)" }}>
        {(["BUY", "SELL"] as OrderSide[]).map((s) => (
          <button
            key={s}
            onClick={() => onSideChange(s)}
            style={{
              flex: 1, padding: "12px 0",
              border: "none",
              background: side === s
                ? s === "BUY" ? "#f0fdf4" : "#fef2f2"
                : "transparent",
              color: side === s
                ? s === "BUY" ? "#16a34a" : "#dc2626"
                : "var(--color-text-muted)",
              fontWeight:   side === s ? 700 : 500,
              fontSize:     14,
              cursor:       "pointer",
              fontFamily:   "var(--font-sans)",
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
          {(["DELIVERY", "INTRADAY"] as OrderCategory[]).map((cat) => {
            const disabled = cat === "INTRADAY" && !marketOpen;
            return (
              <button
                key={cat}
                onClick={() => { if (!disabled) onCategoryChange(cat); }}
                disabled={disabled}
                title={
                  disabled
                    ? "Available Mon–Fri 9:00 AM – 3:30 PM IST"
                    : undefined
                }
                style={{
                  flex: 1, padding: "7px 0",
                  borderRadius: "var(--radius-md)",
                  border: `1.5px solid ${
                    disabled          ? "var(--color-border)" :
                    category === cat  ?
                      cat === "INTRADAY" ? "#d97706" : "var(--color-primary)"
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
                  fontSize:   12.5,
                  cursor:     disabled ? "not-allowed" : "pointer",
                  fontFamily: "var(--font-sans)",
                  transition: "all 0.15s",
                  opacity:    disabled ? 0.5 : 1,
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
          <div
            style={{
              padding: "8px 12px", borderRadius: "var(--radius-md)",
              background: "#fffbeb", border: "1px solid #fde68a",
              fontSize: 11.5, color: "#92400e",
              display: "flex", alignItems: "flex-start", gap: 6,
            }}
          >
            <span style={{ fontSize: 13 }}>⚡</span>
            <span>
              5x leverage · Auto square-off at <strong>3:20 PM</strong>.
              Only 20% margin required.
            </span>
          </div>
        )}

        {/* ── LIMIT / MARKET toggle ── */}
        <div style={{ display: "flex", gap: 8 }}>
          {(["LIMIT", "MARKET"] as OrderType[]).map((t) => (
            <button
              key={t}
              onClick={() => onTypeChange(t)}
              style={{
                padding: "5px 14px",
                borderRadius: "var(--radius-md)",
                border: `1.5px solid ${oType === t ? "var(--color-primary)" : "var(--color-border)"}`,
                background: oType === t ? "var(--color-primary-light)" : "transparent",
                color:      oType === t ? "var(--color-primary)" : "var(--color-text-secondary)",
                fontWeight: oType === t ? 700 : 500,
                fontSize:   12.5,
                cursor:     "pointer",
                fontFamily: "var(--font-sans)",
                transition: "all 0.15s",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Quantity ── */}
        <div>
          <label
            style={{
              display: "block", fontSize: 12, fontWeight: 600,
              color: "var(--color-text-secondary)", marginBottom: 6,
            }}
          >
            Quantity
          </label>
          <input
            type="number"
            min="1"
            value={qty}
            onChange={(e) => onQtyChange(e.target.value)}
            placeholder="0"
            style={{
              width: "100%", padding: "10px 12px",
              border: "1.5px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              fontSize: 14, fontFamily: "var(--font-mono)",
              color: "var(--color-text-primary)",
              background: "var(--color-surface)",
              outline: "none", transition: "border 0.15s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
            onBlur={(e)  => (e.target.style.borderColor = "var(--color-border)")}
          />
        </div>

        {/* ── Price (LIMIT only) ── */}
        {oType === "LIMIT" && (
          <div>
            <label
              style={{
                display: "block", fontSize: 12, fontWeight: 600,
                color: "var(--color-text-secondary)", marginBottom: 6,
              }}
            >
              Price (₹)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.05"
              value={price}
              onChange={(e) => onPriceChange(e.target.value)}
              style={{
                width: "100%", padding: "10px 12px",
                border: "1.5px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                fontSize: 14, fontFamily: "var(--font-mono)",
                color: "var(--color-text-primary)",
                background: "var(--color-surface)",
                outline: "none", transition: "border 0.15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
              onBlur={(e)  => (e.target.style.borderColor = "var(--color-border)")}
            />
          </div>
        )}

        {/* Market order hint */}
        {oType === "MARKET" && (
          <div
            style={{
              padding: "10px 12px",
              background: "var(--color-surface-2)",
              borderRadius: "var(--radius-md)",
              fontSize: 13,
              color: "var(--color-text-secondary)",
            }}
          >
            Executes at best available price (~₹{fmt(livePrice)})
          </div>
        )}
      </div>
    </>
  );
}