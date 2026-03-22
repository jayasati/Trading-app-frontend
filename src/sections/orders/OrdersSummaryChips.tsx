"use client";

interface Order {
  status: string;
}

interface OrdersSummaryChipsProps {
  orders: Order[];
}

export default function OrdersSummaryChips({ orders }: OrdersSummaryChipsProps) {
  const chips = [
    {
      label: "Total Orders",
      value: orders.length,
      color: "var(--color-primary)",
    },
    {
      label: "Filled",
      value: orders.filter((o) => o.status === "FILLED").length,
      color: "var(--color-gain)",
    },
    {
      label: "Open",
      value: orders.filter((o) => o.status === "OPEN").length,
      color: "var(--color-warning)",
    },
    {
      label: "Partial",
      value: orders.filter((o) => o.status === "PARTIALLY_FILLED").length,
      color: "#d97706",
    },
  ];

  return (
    <div
      className="animate-fade-up"
      style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}
    >
      {chips.map((chip) => (
        <div
          key={chip.label}
          className="card"
          style={{
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            minWidth: "140px",
          }}
        >
          <div
            style={{
              width: 36, height: 36,
              borderRadius: "9px",
              background: chip.color + "18",
              color: chip.color,
              fontWeight: 700, fontSize: "16px",
              display: "flex", alignItems: "center",
              justifyContent: "center",
            }}
          >
            {chip.value}
          </div>
          <span
            style={{
              fontSize: "12.5px",
              color: "var(--color-text-secondary)",
              fontWeight: 500,
            }}
          >
            {chip.label}
          </span>
        </div>
      ))}
    </div>
  );
}