"use client";

/**
 * Runs once on app boot.
 * Reads tokens from localStorage into Zustand store.
 * Keeps store in sync without prop drilling.
 */

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export default function AuthHydrator() {
  const hydrate = useAuthStore((s) => s.hydrate);
  useEffect(() => { hydrate(); }, [hydrate]);
  return null;
}