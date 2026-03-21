"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

function fmt(n: number) {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string; label: string }> = {
    OPEN:             { color: "var(--color-primary)",  bg: "var(--color-primary-mid)",  label: "Open" },
    FILLED:           { color: "var(--color-gain)",     bg: "var(--color-gain-bg)",      label: "Filled" },
    PARTIALLY_FILLED: { color: "var(--color-warning)",  bg: "#fef3c7",                   label: "Partial" },
    CANCELLED:        { color: "var(--color-text-muted)",bg: "var(--color-surface-2)",   label: "Cancelled" },
  };
  const s = map[status] ?? map.OPEN;
  return (
    <span
      style={{
        fontSize: "11.5px",
        fontWeight: 600,
        color: s.color,
        background: s.bg,
        padding: "3px 9px",
        borderRadius: "99px",
      }}
    >
      {s.label}
    </span>
  );
}

export default function OrdersSection() {
  const [orders, setOrders]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<"ALL" | "BUY" | "SELL">("ALL");

  useEffect(() => {
    // Fetch all orders — your backend exposes /orders if you add a GET endpoint
    // For now gracefully handle missing endpoint
    api.get("/orders")
      .then((r) => setOrders(Array.isArray(r.data) ? r.data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter((o) => filter === "ALL" || o.side === filter);
  const todayOrders = filtered.filter((o) => {
    const d = new Date(o.createdAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  const FILTERS = ["ALL", "BUY", "SELL"] as const;

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "80px", color: "var(--color-text-muted)" }}>
        Loading orders…
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Summary chips */}
      <div
        className="animate-fade-up"
        style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}
      >
        {[
          { label: "Total Orders",  value: orders.length,                                    color: "var(--color-primary)" },
          { label: "Filled",        value: orders.filter((o) => o.status === "FILLED").length,   color: "var(--color-gain)" },
          { label: "Open",          value: orders.filter((o) => o.status === "OPEN").length,     color: "var(--color-warning)" },
          { label: "Partial",       value: orders.filter((o) => o.status === "PARTIALLY_FILLED").length, color: "#d97706" },
        ].map((chip) => (
          <div
            key={chip.label}
            className="card"
            style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: "12px", minWidth: "140px" }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "9px",
                background: chip.color + "18",
                color: chip.color,
                fontWeight: 700,
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {chip.value}
            </div>
            <span style={{ fontSize: "12.5px", color: "var(--color-text-secondary)", fontWeight: 500 }}>
              {chip.label}
            </span>
          </div>
        ))}
      </div>

      {/* Today's orders */}
      <div className="card animate-fade-up" style={{ overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            borderBottom: "1px solid var(--color-border-soft)",
          }}
        >
          <span style={{ fontWeight: 700, fontSize: "15px" }}>
            Today's orders ({todayOrders.length})
          </span>
          <div style={{ display: "flex", gap: "4px", background: "var(--color-surface-2)", padding: "3px", borderRadius: "var(--radius-md)" }}>
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "4px 12px",
                  borderRadius: "7px",
                  border: "none",
                  background: filter === f ? "var(--color-surface)" : "transparent",
                  color: filter === f
                    ? f === "BUY" ? "var(--color-gain)" : f === "SELL" ? "var(--color-loss)" : "var(--color-text-primary)"
                    : "var(--color-text-secondary)",
                  fontWeight: filter === f ? 600 : 400,
                  fontSize: "12.5px",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  boxShadow: filter === f ? "var(--shadow-sm)" : "none",
                  transition: "all 0.15s",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {todayOrders.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--color-text-muted)" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>📋</div>
            <p style={{ fontWeight: 600, fontSize: "14px", marginBottom: "6px" }}>No orders today</p>
            <p style={{ fontSize: "13px" }}>Orders you place will appear here</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--color-surface-2)" }}>
                {["Company", "Buy / Sell", "Qty", "Avg Price", "Type", "Status"].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 24px",
                      textAlign: i === 0 ? "left" : "center",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "var(--color-text-muted)",
                      letterSpacing: "0.6px",
                      textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {todayOrders.map((order, i) => (
                <tr
                  key={order.id ?? i}
                  style={{
                    borderTop: "1px solid var(--color-border-soft)",
                    cursor: "pointer",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background = "var(--color-surface-2)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")
                  }
                >
                  <td style={{ padding: "14px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "8px",
                          background: order.side === "BUY" ? "var(--color-gain-bg)" : "var(--color-loss-bg)",
                          color: order.side === "BUY" ? "var(--color-gain)" : "var(--color-loss)",
                          fontWeight: 700,
                          fontSize: "11px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {order.stock?.symbol?.slice(0, 2) ?? "—"}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "13px" }}>
                          {order.stock?.symbol ?? order.stockId?.slice(0, 8)}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                          {new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: "center", padding: "14px 24px" }}>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: "13px",
                        color: order.side === "BUY" ? "var(--color-gain)" : "var(--color-loss)",
                      }}
                    >
                      {order.side}
                    </span>
                  </td>
                  <td style={{ textAlign: "center", padding: "14px 24px", fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 600 }}>
                    {order.quantity}
                    {order.filledQty > 0 && order.filledQty < order.quantity && (
                      <span style={{ fontSize: "11px", color: "var(--color-text-muted)", display: "block" }}>
                        {order.filledQty} filled
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: "center", padding: "14px 24px", fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 600 }}>
                    ₹{fmt(Number(order.price))}
                  </td>
                  <td style={{ textAlign: "center", padding: "14px 24px" }}>
                    <span
                      style={{
                        fontSize: "11.5px",
                        fontWeight: 500,
                        color: "var(--color-text-secondary)",
                        background: "var(--color-surface-2)",
                        padding: "2px 8px",
                        borderRadius: "99px",
                      }}
                    >
                      {order.type}
                    </span>
                  </td>
                  <td style={{ textAlign: "center", padding: "14px 24px" }}>
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* All orders (older) */}
      {filtered.length > todayOrders.length && (
        <div className="card animate-fade-up" style={{ overflow: "hidden" }}>
          <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--color-border-soft)" }}>
            <span style={{ fontWeight: 700, fontSize: "15px" }}>All orders</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--color-surface-2)" }}>
                {["Company", "Date", "Buy / Sell", "Qty", "Price", "Status"].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 24px",
                      textAlign: i === 0 ? "left" : "center",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "var(--color-text-muted)",
                      letterSpacing: "0.6px",
                      textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered
                .filter((o) => {
                  const d = new Date(o.createdAt);
                  return d.toDateString() !== new Date().toDateString();
                })
                .map((order, i) => (
                  <tr
                    key={order.id ?? i}
                    style={{ borderTop: "1px solid var(--color-border-soft)", transition: "background 0.1s" }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLTableRowElement).style.background = "var(--color-surface-2)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")
                    }
                  >
                    <td style={{ padding: "13px 24px" }}>
                      <div style={{ fontWeight: 600, fontSize: "13px" }}>
                        {order.stock?.symbol ?? order.stockId?.slice(0, 8)}
                      </div>
                    </td>
                    <td style={{ textAlign: "center", padding: "13px 24px", fontSize: "12px", color: "var(--color-text-muted)" }}>
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td style={{ textAlign: "center", padding: "13px 24px" }}>
                      <span style={{ fontWeight: 700, fontSize: "12.5px", color: order.side === "BUY" ? "var(--color-gain)" : "var(--color-loss)" }}>
                        {order.side}
                      </span>
                    </td>
                    <td style={{ textAlign: "center", padding: "13px 24px", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
                      {order.quantity}
                    </td>
                    <td style={{ textAlign: "center", padding: "13px 24px", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
                      ₹{fmt(Number(order.price))}
                    </td>
                    <td style={{ textAlign: "center", padding: "13px 24px" }}>
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}