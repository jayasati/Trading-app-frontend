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
  const [prices, setPrices] = useState<PriceMap>({});
  const stockIdsRef         = useRef<string[]>(stockIds);

  // Keep ref in sync without triggering re-renders
  useEffect(() => {
    stockIdsRef.current = stockIds;
  }, [stockIds]);

  // Stable handler — reads latest IDs via ref
  const handlePriceUpdate = useCallback(
    (data: { stockId: string; price: number }) => {
      // Accept update if stockId is in our current list
      // (stockIdsRef.current is always up to date even when empty initially)
      if (stockIdsRef.current.includes(data.stockId)) {
        setPrices((prev) => ({ ...prev, [data.stockId]: data.price }));
      }
    },
    [] // stable — never recreated
  );

  useEffect(() => {
    // ── KEY FIX ──────────────────────────────────────────────────────────────
    // DO NOT guard with `if (stockIds.length === 0) return` here.
    // The original code bailed out when stockIds was empty on first render,
    // meaning the socket listener was NEVER registered even after stockIds
    // populated (because handlePriceUpdate is stable so the effect never re-ran).
    // Now we always subscribe; the ref-based filter handles what to accept.
    // ─────────────────────────────────────────────────────────────────────────
    const s = getSocket();
    s.on("price-update", handlePriceUpdate);
    return () => {
      s.off("price-update", handlePriceUpdate);
    };
  }, [handlePriceUpdate]); // runs once on mount, stays subscribed forever

  return prices;
}