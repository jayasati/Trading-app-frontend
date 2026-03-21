"use client";

import { useEffect, useState, useCallback } from "react";
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
  const [prices, setPrices] = useState<PriceMap>({});

  const handlePriceUpdate = useCallback(
    (data: { stockId: string; price: number }) => {
      if (stockIds.includes(data.stockId)) {
        setPrices((prev) => ({ ...prev, [data.stockId]: data.price }));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stockIds.join(",")]
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