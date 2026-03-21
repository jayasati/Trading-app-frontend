"use client";

import { useState } from "react";
import { api } from "../../lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [showPass, setShowPass] = useState(false);
  const [mode, setMode]         = useState<"login" | "signup">("login");
  const [name, setName]         = useState("");
  const router = useRouter();

  const submit = async () => {
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setLoading(true);
    setError("");

    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/signup";
      const body: any = { email, password };
      if (mode === "signup" && name) body.name = name;

      const res = await api.post(endpoint, body);
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") submit();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* LEFT — Brand panel */}
      <div
        style={{
          background: "linear-gradient(145deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        {[
          { w: 300, h: 300, top: "-80px", right: "-80px", opacity: 0.08 },
          { w: 200, h: 200, bottom: "60px", left: "-60px", opacity: 0.06 },
          { w: 150, h: 150, top: "45%", left: "30%", opacity: 0.05 },
        ].map((c, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: c.w,
              height: c.h,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.3)",
              top: (c as any).top,
              right: (c as any).right,
              bottom: (c as any).bottom,
              left: (c as any).left,
              opacity: c.opacity * 10,
              pointerEvents: "none",
            }}
          />
        ))}

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "11px",
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 17l5-5 4 4 9-9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{ color: "white", fontWeight: 700, fontSize: "18px", letterSpacing: "-0.3px" }}>
            TradeDesk
          </span>
        </div>

        {/* Headline */}
        <div>
          <h1
            style={{
              color: "white",
              fontSize: "38px",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-1px",
              marginBottom: "16px",
            }}
          >
            Practice trading.
            <br />
            <span style={{ opacity: 0.75 }}>No real money.</span>
            <br />
            Real skills.
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "15px", lineHeight: 1.7, maxWidth: "340px" }}>
            Trade stocks, place limit orders, and build a portfolio — all in a risk-free paper trading environment.
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: "32px" }}>
          {[
            { label: "Paper Traders", value: "10K+" },
            { label: "Stocks Listed", value: "500+" },
            { label: "Trades / Day", value: "50K+" },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ color: "white", fontWeight: 800, fontSize: "22px", fontFamily: "var(--font-mono)" }}>
                {s.value}
              </div>
              <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "12px", marginTop: "2px" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — Auth form */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px",
          background: "var(--color-bg)",
        }}
      >
        <div style={{ width: "100%", maxWidth: "380px" }}>
          {/* Tab switcher */}
          <div
            style={{
              display: "flex",
              background: "var(--color-surface-2)",
              borderRadius: "var(--radius-lg)",
              padding: "4px",
              marginBottom: "32px",
            }}
          >
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "10px",
                  border: "none",
                  background: mode === m ? "var(--color-surface)" : "transparent",
                  color: mode === m ? "var(--color-text-primary)" : "var(--color-text-muted)",
                  fontWeight: mode === m ? 700 : 500,
                  fontSize: "14px",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  boxShadow: mode === m ? "var(--shadow-sm)" : "none",
                  transition: "all 0.2s",
                }}
              >
                {m === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <h2 style={{ fontWeight: 800, fontSize: "24px", marginBottom: "6px", letterSpacing: "-0.5px" }}>
            {mode === "login" ? "Welcome back" : "Get started free"}
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "14px", marginBottom: "28px" }}>
            {mode === "login"
              ? "Enter your credentials to access your portfolio"
              : "Create your account and start paper trading today"}
          </p>

          {/* Error */}
          {error && (
            <div
              className="animate-slide-down"
              style={{
                padding: "12px 14px",
                borderRadius: "var(--radius-md)",
                background: "var(--color-loss-bg)",
                border: "1px solid rgba(220,38,38,0.2)",
                color: "var(--color-loss)",
                fontSize: "13px",
                fontWeight: 500,
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              {error}
            </div>
          )}

          {/* Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "22px" }}>
            {mode === "signup" && (
              <Field label="Full name" type="text" value={name} onChange={setName} placeholder="Jayraj Patel" onKeyDown={handleKey} />
            )}
            <Field label="Email address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" onKeyDown={handleKey} />
            <PasswordField
              label="Password"
              value={password}
              onChange={setPassword}
              show={showPass}
              onToggle={() => setShowPass((p) => !p)}
              onKeyDown={handleKey}
            />
          </div>

          {mode === "login" && (
            <div style={{ textAlign: "right", marginBottom: "22px" }}>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-primary)",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={submit}
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: "var(--radius-md)",
              border: "none",
              background: loading ? "var(--blue-400)" : "var(--color-primary)",
              color: "white",
              fontWeight: 700,
              fontSize: "15px",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "var(--font-sans)",
              boxShadow: loading ? "none" : "var(--shadow-blue)",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {loading ? (
              <>
                <Spinner />
                {mode === "login" ? "Signing in…" : "Creating account…"}
              </>
            ) : (
              mode === "login" ? "Sign in →" : "Create account →"
            )}
          </button>

          <p style={{ textAlign: "center", marginTop: "24px", fontSize: "13px", color: "var(--color-text-muted)" }}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
              style={{
                background: "none",
                border: "none",
                color: "var(--color-primary)",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                fontSize: "13px",
              }}
            >
              {mode === "login" ? "Create account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub components ─── */
function Field({
  label, type, value, onChange, placeholder, onKeyDown,
}: {
  label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  onKeyDown: (e: React.KeyboardEvent) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "6px" }}>
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

function PasswordField({
  label, value, onChange, show, onToggle, onKeyDown,
}: {
  label: string; value: string;
  onChange: (v: string) => void; show: boolean;
  onToggle: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "6px" }}>
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.7s linear infinite" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}