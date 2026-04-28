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
  const joinedRoomsRef        = useRef<Set<string>>(new Set());

  // Keep ref in sync so the stable handler always reads the latest IDs
  useEffect(() => {
    stockIdsRef.current = stockIds;
  }, [stockIds]);

  // ── Stable price handler ─────────────────────────────────────────────────
  const handlePriceUpdate = useCallback(
    (data: { stockId: string; price: number }) => {
      if (stockIdsRef.current.includes(data.stockId)) {
        setPrices((prev) => ({ ...prev, [data.stockId]: data.price }));
      }
    },
    []
  );

  // ── Subscribe to price-update events once on mount ───────────────────────
  useEffect(() => {
    const s = getSocket();
    s.on("price-update", handlePriceUpdate);
    return () => {
      s.off("price-update", handlePriceUpdate);
    };
  }, [handlePriceUpdate]);

  // ── Join / leave stock rooms when the list of IDs changes ────────────────
  //
  // Bug fix: the original hook NEVER emitted 'join-stock'.
  // The backend broadcasts via  this.server.to(stockId).emit(...)
  // which is room-scoped — clients outside the room receive nothing.
  // Without joining, livePrice stayed {} forever and the chart never updated.
  useEffect(() => {
    if (!stockIds.length) return;

    const s = getSocket();

    // Join any rooms we haven't joined yet
    const toJoin = stockIds.filter((id) => !joinedRoomsRef.current.has(id));
    toJoin.forEach((id) => {
      s.emit("join-stock", id);
      joinedRoomsRef.current.add(id);
    });

    // Leave rooms that are no longer in the list
    const currentSet = new Set(stockIds);
    joinedRoomsRef.current.forEach((id) => {
      if (!currentSet.has(id)) {
        s.emit("leave-stock", id);
        joinedRoomsRef.current.delete(id);
      }
    });

    // On unmount, leave all rooms this hook joined
    return () => {
      stockIds.forEach((id) => {
        if (joinedRoomsRef.current.has(id)) {
          s.emit("leave-stock", id);
          joinedRoomsRef.current.delete(id);
        }
      });
    };
  }, [stockIds.join(",")]); // stable key — avoids array identity re-runs

  return prices;
}