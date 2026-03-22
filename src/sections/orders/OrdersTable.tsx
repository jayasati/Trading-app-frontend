"use client";

import StatusBadge        from "@/components/ui/StatusBadge";
import CancelOrderButton  from "./CancelOrderButton";
import type { Order }     from "@/hooks/useOrders";

type FilterType = "ALL" | "BUY" | "SELL";

interface OrdersTableProps {
  orders:       Order[];
  filter:       FilterType;
  cancelling:   string | null;
  onFilterChange: (f: FilterType) => void;
  onCancel:       (orderId: string) => Promise<void>;
}

function fmt(n: number) {
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const FILTERS: FilterType[] = ["ALL", "BUY", "SELL"];

// Columns — cancel column only shown for today's orders
const TODAY_COLS  = ["Company", "Buy / Sell", "Qty", "Avg Price", "Type", "Status", ""];
const HISTORY_COLS = ["Company", "Date", "Buy / Sell", "Qty", "Price", "Status"];

export default function OrdersTable({
  orders, filter, cancelling,
  onFilterChange, onCancel,
}: OrdersTableProps) {
  const filtered = orders.filter(
    (o) => filter === "ALL" || o.side === filter
  );

  const today = new Date().toDateString();

  const todayOrders  = filtered.filter(
    (o) => new Date(o.createdAt).toDateString() === today
  );
  const olderOrders  = filtered.filter(
    (o) => new Date(o.createdAt).toDateString() !== today
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Today's orders ── */}
      <div className="card animate-fade-up" style={{ overflow: "hidden" }}>

        {/* Header + filter */}
        <div
          style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            borderBottom: "1px solid var(--color-border-soft)",
          }}
        >
          <span style={{ fontWeight: 700, fontSize: "15px" }}>
            Today's orders ({todayOrders.length})
          </span>
          <div
            style={{
              display: "flex", gap: "4px",
              background: "var(--color-surface-2)",
              padding: "3px", borderRadius: "var(--radius-md)",
            }}
          >
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => onFilterChange(f)}
                style={{
                  padding: "4px 12px",
                  borderRadius: "7px", border: "none",
                  background: filter === f ? "var(--color-surface)" : "transparent",
                  color: filter === f
                    ? f === "BUY"  ? "var(--color-gain)"
                    : f === "SELL" ? "var(--color-loss)"
                    : "var(--color-text-primary)"
                    : "var(--color-text-secondary)",
                  fontWeight: filter === f ? 600 : 400,
                  fontSize: "12.5px", cursor: "pointer",
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

        {/* Empty state */}
        {todayOrders.length === 0 ? (
          <div
            style={{
              padding: "48px", textAlign: "center",
              color: "var(--color-text-muted)",
            }}
          >
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>📋</div>
            <p style={{ fontWeight: 600, fontSize: "14px", marginBottom: "6px" }}>
              No orders today
            </p>
            <p style={{ fontSize: "13px" }}>Orders you place will appear here</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--color-surface-2)" }}>
                {TODAY_COLS.map((h, i) => (
                  <th
                    key={`${h}-${i}`}
                    style={{
                      padding: "10px 24px",
                      textAlign: i === 0 ? "left" : "center",
                      fontSize: "11px", fontWeight: 600,
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
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background =
                      "var(--color-surface-2)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background =
                      "transparent")
                  }
                >
                  {/* Company */}
                  <td style={{ padding: "14px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: 34, height: 34, borderRadius: "8px",
                          background: order.side === "BUY"
                            ? "var(--color-gain-bg)" : "var(--color-loss-bg)",
                          color: order.side === "BUY"
                            ? "var(--color-gain)" : "var(--color-loss)",
                          fontWeight: 700, fontSize: "11px",
                          display: "flex", alignItems: "center",
                          justifyContent: "center", flexShrink: 0,
                        }}
                      >
                        {order.stock?.symbol?.slice(0, 2) ?? "—"}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "13px" }}>
                          {order.stock?.symbol ?? order.stockId?.slice(0, 8)}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                          {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Side */}
                  <td style={{ textAlign: "center", padding: "14px 24px" }}>
                    <span
                      style={{
                        fontWeight: 700, fontSize: "13px",
                        color: order.side === "BUY"
                          ? "var(--color-gain)" : "var(--color-loss)",
                      }}
                    >
                      {order.side}
                    </span>
                  </td>

                  {/* Qty */}
                  <td
                    style={{
                      textAlign: "center", padding: "14px 24px",
                      fontFamily: "var(--font-mono)",
                      fontSize: "13px", fontWeight: 600,
                    }}
                  >
                    {order.quantity}
                    {order.filledQty > 0 && order.filledQty < order.quantity && (
                      <span
                        style={{
                          fontSize: "11px",
                          color: "var(--color-text-muted)",
                          display: "block",
                        }}
                      >
                        {order.filledQty} filled
                      </span>
                    )}
                  </td>

                  {/* Price */}
                  <td
                    style={{
                      textAlign: "center", padding: "14px 24px",
                      fontFamily: "var(--font-mono)",
                      fontSize: "13px", fontWeight: 600,
                    }}
                  >
                    ₹{fmt(Number(order.price))}
                  </td>

                  {/* Type */}
                  <td style={{ textAlign: "center", padding: "14px 24px" }}>
                    <span
                      style={{
                        fontSize: "11.5px", fontWeight: 500,
                        color: "var(--color-text-secondary)",
                        background: "var(--color-surface-2)",
                        padding: "2px 8px", borderRadius: "99px",
                      }}
                    >
                      {order.type}
                    </span>
                  </td>

                  {/* Status */}
                  <td style={{ textAlign: "center", padding: "14px 24px" }}>
                    <StatusBadge status={order.status} />
                  </td>

                  {/* Cancel */}
                  <td style={{ textAlign: "center", padding: "14px 24px" }}>
                    {order.status === "OPEN" && (
                      <CancelOrderButton
                        orderId={order.id}
                        isCancelling={cancelling === order.id}
                        onCancel={onCancel}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

        // ── Order history ──
        {olderOrders.length > 0 && (
        <div className="card animate-fade-up" style={{ overflow: "hidden" }}>
            <div
            style={{
                padding: "18px 24px",
                borderBottom: "1px solid var(--color-border-soft)",
            }}
            >
            <span style={{ fontWeight: 700, fontSize: "15px" }}>
                Order History
            </span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
                <tr style={{ background: "var(--color-surface-2)" }}>
                {/*  Add empty string for cancel column */}
                {["Company", "Date", "Buy / Sell", "Qty", "Price", "Status", ""].map((h, i) => (
                    <th
                    key={`${h}-${i}`}
                    style={{
                        padding: "10px 24px",
                        textAlign: i === 0 ? "left" : "center",
                        fontSize: "11px", fontWeight: 600,
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
                {olderOrders.map((order, i) => (
                <tr
                    key={order.id ?? i}
                    style={{
                    borderTop: "1px solid var(--color-border-soft)",
                    transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background =
                        "var(--color-surface-2)")
                    }
                    onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background =
                        "transparent")
                    }
                >
                    <td style={{ padding: "13px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                        style={{
                            width: 32, height: 32, borderRadius: "8px",
                            background: order.side === "BUY"
                            ? "var(--color-gain-bg)" : "var(--color-loss-bg)",
                            color: order.side === "BUY"
                            ? "var(--color-gain)" : "var(--color-loss)",
                            fontWeight: 700, fontSize: "11px",
                            display: "flex", alignItems: "center",
                            justifyContent: "center", flexShrink: 0,
                        }}
                        >
                        {order.stock?.symbol?.slice(0, 2) ?? "—"}
                        </div>
                        <div style={{ fontWeight: 600, fontSize: "13px" }}>
                        {order.stock?.symbol ?? order.stockId?.slice(0, 8)}
                        </div>
                    </div>
                    </td>
                    <td
                    style={{
                        textAlign: "center", padding: "13px 24px",
                        fontSize: "12px", color: "var(--color-text-muted)",
                    }}
                    >
                    {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td style={{ textAlign: "center", padding: "13px 24px" }}>
                    <span
                        style={{
                        fontWeight: 700, fontSize: "12.5px",
                        color: order.side === "BUY"
                            ? "var(--color-gain)" : "var(--color-loss)",
                        }}
                    >
                        {order.side}
                    </span>
                    </td>
                    <td
                    style={{
                        textAlign: "center", padding: "13px 24px",
                        fontFamily: "var(--font-mono)", fontSize: "13px",
                    }}
                    >
                    {order.quantity}
                    </td>
                    <td
                    style={{
                        textAlign: "center", padding: "13px 24px",
                        fontFamily: "var(--font-mono)", fontSize: "13px",
                    }}
                    >
                    ₹{fmt(Number(order.price))}
                    </td>
                    <td style={{ textAlign: "center", padding: "13px 24px" }}>
                    <StatusBadge status={order.status} />
                    </td>

                    {/*  Cancel column for history open orders too */}
                    <td style={{ textAlign: "center", padding: "13px 24px" }}>
                    {(order.status === "OPEN" || order.status === "PARTIALLY_FILLED") && (
                        <CancelOrderButton
                        orderId={order.id}
                        isCancelling={cancelling === order.id}
                        onCancel={onCancel}
                        />
                    )}
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