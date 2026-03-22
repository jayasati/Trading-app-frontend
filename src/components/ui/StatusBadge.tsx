type BadgeStatus = "OPEN" | "FILLED" | "PARTIALLY_FILLED" | "CANCELLED" | "CLOSED" | "SQUARED_OFF";

const STATUS_MAP: Record<BadgeStatus, { color: string; bg: string; label: string }> = {
  OPEN:             { color: "var(--color-primary)",    bg: "var(--color-primary-mid)",  label: "Open"      },
  FILLED:           { color: "var(--color-gain)",       bg: "var(--color-gain-bg)",      label: "Filled"    },
  PARTIALLY_FILLED: { color: "var(--color-warning)",    bg: "#fef3c7",                   label: "Partial"   },
  CANCELLED:        { color: "var(--color-text-muted)", bg: "var(--color-surface-2)",    label: "Cancelled" },
  CLOSED:           { color: "var(--color-gain)",       bg: "var(--color-gain-bg)",      label: "Closed"    },
  SQUARED_OFF:      { color: "var(--color-text-muted)", bg: "var(--color-surface-2)",    label: "Sq. Off"   },
};

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const s = STATUS_MAP[status as BadgeStatus] ?? STATUS_MAP.OPEN;

  return (
    <span
      style={{
        fontSize: "11.5px",
        fontWeight: 600,
        color: s.color,
        background: s.bg,
        padding: "3px 9px",
        borderRadius: "99px",
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
}