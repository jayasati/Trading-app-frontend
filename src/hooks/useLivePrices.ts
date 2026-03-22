"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";

export interface PriceMap {
  [stockId: string]: number;
}

let socket: Socket | null = null;

function getSocket(): Socket {
  if (!socket) {
    socket = io("http://localhost:3000", {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
  }
  return socket;
}

export function useLivePrices(stockIds: string[]): PriceMap {
  const [prices, setPrices]   = useState<PriceMap>({});
  const stockIdsRef           = useRef<string[]>(stockIds);

  // Keep ref in sync without triggering re-renders
  useEffect(() => {
    stockIdsRef.current = stockIds;
  }, [stockIds]);

  // Stable handler — never recreated, always reads latest IDs via ref
  const handlePriceUpdate = useCallback(
    (data: { stockId: string; price: number }) => {
      if (stockIdsRef.current.includes(data.stockId)) {
        setPrices((prev) => ({ ...prev, [data.stockId]: data.price }));
      }
    },
    [] // intentionally empty — stability is the goal
  );

  useEffect(() => {
    if (stockIds.length === 0) return;
    const s = getSocket();
    s.on("price-update", handlePriceUpdate);
    return () => {
      s.off("price-update", handlePriceUpdate);
    };
  }, [handlePriceUpdate]);

  return prices;
}