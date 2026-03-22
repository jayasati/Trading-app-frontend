interface EmptyStateProps {
  icon?:        React.ReactNode;
  title:        string;
  description:  string;
  hint?:        string;
}

export default function EmptyState({ icon, title, description, hint }: EmptyStateProps) {
  return (
    <div
      className="card animate-fade-up"
      style={{
        padding: "56px 32px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        gridColumn: "1 / -1",
        border: "1.5px dashed var(--color-border)",
        background: "var(--color-surface)",
        boxShadow: "none",
      }}
    >
      {icon ?? (
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "18px",
            background: "var(--color-primary-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
            stroke="var(--color-primary)" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
      )}

      <div>
        <p style={{
          fontWeight: 700,
          fontSize: "16px",
          color: "var(--color-text-primary)",
          marginBottom: "6px",
        }}>
          {title}
        </p>
        <p style={{
          color: "var(--color-text-muted)",
          fontSize: "13.5px",
          maxWidth: "300px",
          lineHeight: 1.6,
        }}>
          {description}
        </p>
      </div>

      {hint && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 18px",
            borderRadius: "var(--radius-md)",
            background: "var(--color-primary-mid)",
            fontSize: "12.5px",
            fontWeight: 600,
            color: "var(--color-primary)",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          {hint}
        </div>
      )}
    </div>
  );
}
