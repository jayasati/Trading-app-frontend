"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Field         from "@/components/ui/Field";
import PasswordField from "@/components/ui/PasswordField";
import Spinner       from "@/components/ui/Spinner";

type Mode = "login" | "signup";

export default function LoginForm() {
  const [mode,     setMode]     = useState<Mode>("login");
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const router = useRouter();

  const switchMode = (m: Mode) => {
    setMode(m);
    setError("");
  };

  const submit = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/signup";
      const body: Record<string, string> = { email, password };
      if (mode === "signup" && name) body.name = name;

      const res = await api.post(endpoint, body);
      localStorage.setItem("accessToken",  res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        (err as any)?.response?.data?.message ?? "Something went wrong. Please try again.";
      setError(message);
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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px",
        background: "var(--color-bg)",
      }}
    >
      <div style={{ width: "100%", maxWidth: "380px" }}>

        {/* Mode switcher */}
        <div
          style={{
            display: "flex",
            background: "var(--color-surface-2)",
            borderRadius: "var(--radius-lg)",
            padding: "4px",
            marginBottom: "32px",
          }}
        >
          {(["login", "signup"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
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

        {/* Heading */}
        <h2
          style={{
            fontWeight: 800,
            fontSize: "24px",
            marginBottom: "6px",
            letterSpacing: "-0.5px",
          }}
        >
          {mode === "login" ? "Welcome back" : "Get started free"}
        </h2>
        <p
          style={{
            color: "var(--color-text-muted)",
            fontSize: "14px",
            marginBottom: "28px",
          }}
        >
          {mode === "login"
            ? "Enter your credentials to access your portfolio"
            : "Create your account and start paper trading today"}
        </p>

        {/* Error banner */}
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            {error}
          </div>
        )}

        {/* Fields */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            marginBottom: "22px",
          }}
        >
          {mode === "signup" && (
            <Field
              label="Full name"
              type="text"
              value={name}
              onChange={setName}
              placeholder="Jayraj Patel"
              onKeyDown={handleKey}
            />
          )}
          <Field
            label="Email address"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            onKeyDown={handleKey}
          />
          <PasswordField
            label="Password"
            value={password}
            onChange={setPassword}
            show={showPass}
            onToggle={() => setShowPass((p) => !p)}
            onKeyDown={handleKey}
          />
        </div>

        {/* Forgot password */}
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
              <Spinner size={16} />
              {mode === "login" ? "Signing in…" : "Creating account…"}
            </>
          ) : (
            mode === "login" ? "Sign in →" : "Create account →"
          )}
        </button>

        {/* Switch mode link */}
        <p
          style={{
            textAlign: "center",
            marginTop: "24px",
            fontSize: "13px",
            color: "var(--color-text-muted)",
          }}
        >
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => switchMode(mode === "login" ? "signup" : "login")}
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
  );
}