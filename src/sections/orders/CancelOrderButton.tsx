"use client";

/**
 * Cancel button shown on OPEN orders only.
 * Handles its own confirmation state to avoid
 * accidental cancellations.
 */

import { useState } from "react";
import Spinner from "@/components/ui/Spinner";

interface CancelOrderButtonProps {
  orderId:     string;
  isCancelling: boolean;
  onCancel:    (orderId: string) => Promise<void>;
}

export default function CancelOrderButton({
  orderId,
  isCancelling,
  onCancel,
}: CancelOrderButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const handleFirstClick = () => {
    setConfirming(true);
    setError(null);
  };

  const handleConfirm = async () => {
    try {
      await onCancel(orderId);
      setConfirming(false);
    } catch (err: unknown) {
      setError((err as Error).message ?? "Cancel failed");
      setConfirming(false);
    }
  };

  const handleAbort = () => {
    setConfirming(false);
    setError(null);
  };

  // ── Cancelling in progress ──
  if (isCancelling) {
    return (
      <div
        style={{
          display: "flex", alignItems: "center", gap: 6,
          fontSize: 12, color: "var(--color-text-muted)",
        }}
      >
        <Spinner size={12} />
        Cancelling…
      </div>
    );
  }

  // ── Confirm step ──
  if (confirming) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <p
          style={{
            fontSize: 11, color: "var(--color-text-secondary)",
            marginBottom: 2, whiteSpace: "nowrap",
          }}
        >
          Cancel this order?
        </p>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={handleConfirm}
            style={{
              padding: "3px 10px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: "var(--color-loss)",
              color: "white",
              fontSize: 11, fontWeight: 700,
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.opacity = "0.85")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.opacity = "1")
            }
          >
            Yes, cancel
          </button>
          <button
            onClick={handleAbort}
            style={{
              padding: "3px 10px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-border)",
              background: "transparent",
              color: "var(--color-text-secondary)",
              fontSize: 11, fontWeight: 500,
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
            }}
          >
            Keep
          </button>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span
          style={{
            fontSize: 11,
            color: "var(--color-loss)",
            whiteSpace: "nowrap",
          }}
        >
          {error}
        </span>
        <button
          onClick={handleFirstClick}
          style={{
            padding: "3px 10px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--color-border)",
            background: "transparent",
            color: "var(--color-text-secondary)",
            fontSize: 11, fontWeight: 500,
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Default ──
  return (
    <button
      onClick={handleFirstClick}
      style={{
        padding: "4px 12px",
        borderRadius: "var(--radius-sm)",
        border: "1px solid rgba(220,38,38,0.35)",
        background: "transparent",
        color: "var(--color-loss)",
        fontSize: 11.5, fontWeight: 600,
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        const b = e.currentTarget as HTMLButtonElement;
        b.style.background = "var(--color-loss-bg)";
        b.style.borderColor = "var(--color-loss)";
      }}
      onMouseLeave={(e) => {
        const b = e.currentTarget as HTMLButtonElement;
        b.style.background = "transparent";
        b.style.borderColor = "rgba(220,38,38,0.35)";
      }}
    >
      Cancel
    </button>
  );
}