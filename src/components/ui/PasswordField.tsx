"use client";

import { useState } from "react";

interface PasswordFieldProps {
  label:     string;
  value:     string;
  onChange:  (v: string) => void;
  show:      boolean;
  onToggle:  () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export default function PasswordField({
  label, value, onChange, show, onToggle, onKeyDown,
}: PasswordFieldProps) {
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          border: `1.5px solid ${focused ? "var(--color-primary)" : "var(--color-border)"}`,
          borderRadius: "var(--radius-md)",
          background: "var(--color-surface)",
          boxShadow: focused ? "0 0 0 3px rgba(37,99,235,0.12)" : "none",
          transition: "all 0.15s",
        }}
      >
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Min. 6 characters"
          style={{
            flex: 1,
            padding: "11px 14px",
            border: "none",
            background: "transparent",
            fontSize: "14px",
            fontFamily: "var(--font-sans)",
            color: "var(--color-text-primary)",
            outline: "none",
          }}
        />
        <button
          onClick={onToggle}
          type="button"
          style={{
            background: "none",
            border: "none",
            padding: "0 12px",
            cursor: "pointer",
            color: "var(--color-text-muted)",
            display: "flex",
            alignItems: "center",
          }}
        >
          {show ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}