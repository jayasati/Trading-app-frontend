"use client";

import { useEffect, useState } from "react";
import { useOrders }        from "@/hooks/useOrders";
import OrdersSummaryChips   from "./OrdersSummaryChips";
import OrdersTable          from "./OrdersTable";
import EmptyState           from "@/components/ui/EmptyState";

type FilterType = "ALL" | "BUY" | "SELL";

export default function OrdersSection() {
  const { orders, loading, cancelling, fetchOrders, cancelOrder } = useOrders();
  const [filter, setFilter] = useState<FilterType>("ALL");

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex", justifyContent: "center",
          padding: "80px", color: "var(--color-text-muted)",
        }}
      >
        Loading orders…
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <OrdersSummaryChips orders={orders} />
        <EmptyState
          icon={
            <div style={{ fontSize: 48 }}>📋</div>
          }
          title="No orders yet"
          description="Orders you place from any stock page will appear here."
          hint="Go to Explore → search a stock → place an order"
        />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <OrdersSummaryChips orders={orders} />
      <OrdersTable
        orders={orders}
        filter={filter}
        cancelling={cancelling}
        onFilterChange={setFilter}
        onCancel={cancelOrder}
      />
    </div>
  );
}
