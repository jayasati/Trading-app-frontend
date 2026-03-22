"use client";

import { useEffect, useState } from "react";
import { api }                 from "@/lib/api";
import OrdersSummaryChips      from "./OrdersSummaryChips";
import OrdersTable             from "./OrdersTable";

type FilterType = "ALL" | "BUY" | "SELL";

interface Order {
  id?:        string;
  stockId?:   string;
  side:       string;
  type:       string;
  status:     string;
  quantity:   number;
  filledQty?: number;
  price:      string | number;
  createdAt:  string;
  stock?: {
    symbol: string;
  };
}

export default function OrdersSection() {
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<FilterType>("ALL");

  useEffect(() => {
    api.get("/orders")
      .then((r) => setOrders(Array.isArray(r.data) ? r.data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <OrdersSummaryChips orders={orders} />
      <OrdersTable
        orders={orders}
        filter={filter}
        onFilterChange={setFilter}
      />
    </div>
  );
}