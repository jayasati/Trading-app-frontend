"use client";

/**
 * Owns all order data fetching and mutations.
 * OrdersSection becomes a pure layout shell.
 */

import { useState, useCallback } from "react";
import { api } from "@/lib/api";

export interface Order {
  id:         string;
  stockId:    string;
  side:       string;
  type:       string;
  status:     string;
  category:   string;
  quantity:   number;
  filledQty:  number;
  price:      string | number;
  createdAt:  string;
  stock?: {
    symbol: string;
    name:   string;
  };
}

interface UseOrdersReturn {
  orders:       Order[];
  loading:      boolean;
  cancelling:   string | null;  // orderId currently being cancelled
  fetchOrders:  () => Promise<void>;
  cancelOrder:  (orderId: string) => Promise<void>;
}

export function useOrders(): UseOrdersReturn {
  const [orders,     setOrders]     = useState<Order[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get("/orders");
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelOrder = useCallback(async (orderId: string) => {
    setCancelling(orderId);
    try {
      await api.delete(`/orders/${orderId}`);
      // Optimistically update status in local state
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: "CANCELLED" } : o
        )
      );
    } catch (err: unknown) {
      const message =
        (err as any)?.response?.data?.message ?? "Failed to cancel order";
      throw new Error(message);
    } finally {
      setCancelling(null);
    }
  }, []);

  return { orders, loading, cancelling, fetchOrders, cancelOrder };
}