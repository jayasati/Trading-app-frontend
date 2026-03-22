"use client";

import { useState } from "react";

interface FieldProps {
  label:       string;
  type:        string;
  value:       string;
  onChange:    (v: string) => void;
  placeholder: string;
  onKeyDown?:  (e: React.KeyboardEvent) => void;
}

export default function Field({
  label, type, value, onChange, placeholder, onKeyDown,
}: FieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "12.5px",
          fontWeight: 600,
          color: "var(--color-text-secondary)",
          marginBottom: "6px",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "11px 14px",
          borderRadius: "var(--radius-md)",
          border: `1.5px solid ${focused ? "var(--color-primary)" : "var(--color-border)"}`,
          background: "var(--color-surface)",
          fontSize: "14px",
          fontFamily: "var(--font-sans)",
          color: "var(--color-text-primary)",
          outline: "none",
          boxShadow: focused ? "0 0 0 3px rgba(37,99,235,0.12)" : "none",
          transition: "all 0.15s",
        }}
      />
    </div>
  );
}