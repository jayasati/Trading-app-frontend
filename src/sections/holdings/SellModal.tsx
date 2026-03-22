"use client";

/**
 * Modal that lets the user place a SELL order directly
 * from the Holdings table without navigating to the stock page.
 *
 * Pre-fills:
 *  - Side: SELL (locked)
 *  - Qty:  user's held quantity (editable, capped at held qty)
 *  - Price: live price (editable for LIMIT orders)
 */

import { useState, useEffect, useRef } from "react";
import { api }     from "@/lib/api";
import Spinner     from "@/components/ui/Spinner";
import type { OrderType } from "@/types/stock";

interface SellModalProps {
  holding: {
    stockId:   string;
    symbol:    string;
    name:      string;
    qty:       number;
    avgPrice:  number;
    livePrice: number | null;
  };
  onClose:     () => void;
  onOrderDone: () => void;
}

function fmt(n: number) {
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function SellModal({
  holding, onClose, onOrderDone,
}: SellModalProps) {
  const [oType,   setOType]   = useState<OrderType>("LIMIT");
  const [qty,     setQty]     = useState(String(holding.qty));
  const [price,   setPrice]   = useState(
    holding.livePrice ? holding.livePrice.toFixed(2) : holding.avgPrice.toFixed(2)
  );
  const [loading, setLoading] = useState(false);
  const [msg,     setMsg]     = useState<{ ok: boolean; text: string } | null>(null);

  // Sync price when type switches to LIMIT
  const hasSynced = useRef(false);
  useEffect(() => {
    if (oType === "LIMIT" && holding.livePrice && !hasSynced.current) {
      setPrice(holding.livePrice.toFixed(2));
      hasSynced.current = true;
    }
    if (oType === "MARKET") hasSynced.current = false;
  }, [oType, holding.livePrice]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const orderPrice  = oType === "MARKET"
    ? (holding.livePrice ?? holding.avgPrice)
    : Number(price || 0);
  const proceeds    = Number(qty || 0) * orderPrice;
  const qtyNum      = Number(qty || 0);
  const qtyValid    = qtyNum > 0 && qtyNum <= holding.qty;
  const priceValid  = oType === "MARKET" || Number(price) > 0;

  const placeOrder = async () => {
    setMsg(null);
    if (!qtyValid) {
      setMsg({ ok: false, text: `Quantity must be between 1 and ${holding.qty}` });
      return;
    }
    if (!priceValid) {
      setMsg({ ok: false, text: "Enter a valid price" });
      return;
    }

    setLoading(true);
    try {
      await api.post("/orders", {
        stockId:  holding.stockId,
        side:     "SELL",
        type:     oType,
        category: "DELIVERY",
        price:    orderPrice,
        quantity: qtyNum,
      });
      setMsg({ ok: true, text: "Sell order placed successfully!" });
      onOrderDone();
      // Auto-close after short delay so user sees success
      setTimeout(onClose, 1200);
    } catch (err: unknown) {
      setMsg({
        ok:   false,
        text: (err as any)?.response?.data?.message ?? "Order failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(15,23,42,0.45)",
          backdropFilter: "blur(2px)",
          zIndex: 100,
          animation: "fadeIn 0.15s ease",
        }}
      />

      {/* ── Modal ── */}
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
            background: "var(--color-loss-bg)",
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 800, fontSize: 17,
                color: "var(--color-loss)",
                letterSpacing: "-0.3px",
              }}
            >
              Sell {holding.symbol}
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>
              {holding.name} · You hold {holding.qty} shares
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none",
              cursor: "pointer", padding: 4,
              color: "var(--color-text-muted)",
              display: "flex", alignItems: "center",
              borderRadius: "var(--radius-sm)",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                "var(--color-surface-2)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background = "none")
            }
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div
          style={{
            padding: "20px 24px",
            display: "flex", flexDirection: "column", gap: 16,
          }}
        >
          {/* ── Holding summary ── */}
          <div
            style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
              gap: 10,
            }}
          >
            {[
              { label: "Avg Buy Price", value: `₹${fmt(holding.avgPrice)}` },
              { label: "Current Price", value: holding.livePrice ? `₹${fmt(holding.livePrice)}` : "—" },
              {
                label: "Unrealised P&L",
                value: holding.livePrice
                  ? `${holding.livePrice >= holding.avgPrice ? "+" : "-"}₹${fmt(
                      Math.abs((holding.livePrice - holding.avgPrice) * holding.qty)
                    )}`
                  : "—",
                accent: holding.livePrice
                  ? holding.livePrice >= holding.avgPrice ? "gain" : "loss"
                  : undefined,
              },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: "var(--color-surface-2)",
                  borderRadius: "var(--radius-md)",
                  padding: "10px 12px",
                }}
              >
                <div style={{ fontSize: 10.5, color: "var(--color-text-muted)", marginBottom: 4 }}>
                  {s.label}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700, fontSize: 13,
                    color: s.accent === "gain"
                      ? "var(--color-gain)"
                      : s.accent === "loss"
                      ? "var(--color-loss)"
                      : "var(--color-text-primary)",
                  }}
                >
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* ── Order type toggle ── */}
          <div>
            <label
              style={{
                display: "block", fontSize: 12, fontWeight: 600,
                color: "var(--color-text-secondary)", marginBottom: 8,
              }}
            >
              Order Type
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["LIMIT", "MARKET"] as OrderType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => { setOType(t); setMsg(null); }}
                  style={{
                    padding: "6px 16px",
                    borderRadius: "var(--radius-md)",
                    border: `1.5px solid ${
                      oType === t ? "var(--color-loss)" : "var(--color-border)"
                    }`,
                    background: oType === t ? "var(--color-loss-bg)" : "transparent",
                    color:      oType === t ? "var(--color-loss)" : "var(--color-text-secondary)",
                    fontWeight: oType === t ? 700 : 500,
                    fontSize: 13, cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                    transition: "all 0.15s",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* ── Quantity ── */}
          <div>
            <div
              style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: 6,
              }}
            >
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)" }}>
                Quantity
              </label>
              <button
                onClick={() => { setQty(String(holding.qty)); setMsg(null); }}
                style={{
                  background: "none", border: "none",
                  fontSize: 11, fontWeight: 600,
                  color: "var(--color-loss)", cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Sell all ({holding.qty})
              </button>
            </div>
            <input
              type="number"
              min="1"
              max={holding.qty}
              value={qty}
              onChange={(e) => { setQty(e.target.value); setMsg(null); }}
              style={{
                width: "100%", padding: "10px 12px",
                border: `1.5px solid ${
                  qty && (Number(qty) <= 0 || Number(qty) > holding.qty)
                    ? "var(--color-loss)"
                    : "var(--color-border)"
                }`,
                borderRadius: "var(--radius-md)",
                fontSize: 14, fontFamily: "var(--font-mono)",
                color: "var(--color-text-primary)",
                background: "var(--color-surface)",
                outline: "none", transition: "border 0.15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--color-loss)")}
              onBlur={(e)  => {
                e.target.style.borderColor =
                  qty && (Number(qty) <= 0 || Number(qty) > holding.qty)
                    ? "var(--color-loss)"
                    : "var(--color-border)";
              }}
            />
            {qty && Number(qty) > holding.qty && (
              <p style={{ fontSize: 11, color: "var(--color-loss)", marginTop: 4 }}>
                You only hold {holding.qty} shares
              </p>
            )}
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
                Limit Price (₹)
              </label>
              <input
                type="number"
                min="0.01"
                step="0.05"
                value={price}
                onChange={(e) => { setPrice(e.target.value); setMsg(null); }}
                style={{
                  width: "100%", padding: "10px 12px",
                  border: "1.5px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  fontSize: 14, fontFamily: "var(--font-mono)",
                  color: "var(--color-text-primary)",
                  background: "var(--color-surface)",
                  outline: "none", transition: "border 0.15s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--color-loss)")}
                onBlur={(e)  => (e.target.style.borderColor = "var(--color-border)")}
              />
            </div>
          )}

          {/* Market hint */}
          {oType === "MARKET" && (
            <div
              style={{
                padding: "10px 12px",
                background: "var(--color-surface-2)",
                borderRadius: "var(--radius-md)",
                fontSize: 13, color: "var(--color-text-secondary)",
              }}
            >
              Executes at best available price
              {holding.livePrice ? ` (~₹${fmt(holding.livePrice)})` : ""}
            </div>
          )}

          {/* ── Estimated proceeds ── */}
          <div
            style={{
              padding: "12px 14px",
              background: "var(--color-surface-2)",
              borderRadius: "var(--radius-md)",
              display: "flex", justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
              Estimated proceeds
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontWeight: 700, fontSize: 15,
                color: "var(--color-gain)",
              }}
            >
              {qtyNum > 0 && orderPrice > 0 ? `₹${fmt(proceeds)}` : "—"}
            </span>
          </div>

          {/* ── Message ── */}
          {msg && (
            <div
              className="animate-slide-down"
              style={{
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                background: msg.ok ? "var(--color-gain-bg)" : "var(--color-loss-bg)",
                border: `1px solid ${
                  msg.ok ? "rgba(22,163,74,0.25)" : "rgba(220,38,38,0.25)"
                }`,
                color:    msg.ok ? "var(--color-gain)" : "var(--color-loss)",
                fontSize: 13, fontWeight: 500,
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              {msg.ok ? "✓" : "⚠"} {msg.text}
            </div>
          )}

          {/* ── Submit ── */}
          <button
            onClick={placeOrder}
            disabled={loading || !qtyValid || !priceValid}
            style={{
              padding: "13px",
              borderRadius: "var(--radius-md)",
              border: "none",
              background:
                loading || !qtyValid || !priceValid
                  ? "#94a3b8"
                  : "var(--color-loss)",
              color: "white",
              fontWeight: 700, fontSize: 15,
              cursor:
                loading || !qtyValid || !priceValid
                  ? "not-allowed" : "pointer",
              fontFamily: "var(--font-sans)",
              transition: "background 0.15s",
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: 8,
            }}
            onMouseEnter={(e) => {
              if (!loading && qtyValid && priceValid)
                (e.currentTarget as HTMLButtonElement).style.background = "#b91c1c";
            }}
            onMouseLeave={(e) => {
              if (!loading && qtyValid && priceValid)
                (e.currentTarget as HTMLButtonElement).style.background =
                  "var(--color-loss)";
            }}
          >
            {loading ? (
              <>
                <Spinner size={16} />
                Placing order…
              </>
            ) : (
              `Sell ${qtyNum > 0 ? qtyNum : ""} ${holding.symbol} →`
            )}
          </button>
        </div>
      </div>
    </>
  );
}