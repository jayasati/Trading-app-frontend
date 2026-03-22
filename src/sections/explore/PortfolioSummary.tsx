"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

function fmt(n: number) {
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

interface Wallet {
  balance:        string | number;
  lockedBalance:  string | number;
}

const TOOLS = [
  { icon: "📈", label: "IPO",         badge: "2 open"  },
  { icon: "🏦", label: "Bonds",       badge: "12 open" },
  { icon: "💰", label: "Tax Saver",   badge: null      },
  { icon: "📊", label: "ETF Screener",badge: null      },
];

export default function PortfolioSummary() {
  const [wallet, setWallet] = useState<Wallet | null>(null);

  useEffect(() => {
    api.get("/wallet")
      .then((r) => setWallet(r.data))
      .catch(() => {});
  }, []);

  const balance = wallet ? Number(wallet.balance)       : 0;
  const locked  = wallet ? Number(wallet.lockedBalance) : 0;

  return (
    <>
      {/* Wallet card */}
      <div className="card" style={{ padding: "22px", marginBottom: "16px" }}>
        <div
          style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <span style={{ fontWeight: 700, fontSize: "15px" }}>
            Your Investments
          </span>
          <button
            style={{
              background: "var(--color-primary)",
              color: "white",
              border: "none",
              borderRadius: "var(--radius-md)",
              padding: "6px 14px",
              fontSize: "12.5px", fontWeight: 600,
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              boxShadow: "var(--shadow-blue)",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                "var(--color-primary-hover)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                "var(--color-primary)")
            }
          >
            + Add Funds
          </button>
        </div>

        {/* Balance card */}
        <div
          style={{
            background: "linear-gradient(135deg, var(--blue-600), var(--blue-700))",
            borderRadius: "var(--radius-md)",
            padding: "18px",
            marginBottom: "16px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute", top: "-20px", right: "-20px",
              width: "100px", height: "100px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
            }}
          />
          <p
            style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.65)",
              fontWeight: 500,
              letterSpacing: "0.5px",
              marginBottom: "6px",
            }}
          >
            AVAILABLE BALANCE
          </p>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 700, fontSize: "24px",
              color: "white", letterSpacing: "-0.5px",
            }}
          >
            ₹{fmt(balance)}
          </p>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
          }}
        >
          {[
            { label: "Locked Funds", value: `₹${fmt(locked)}` },
            { label: "Total Orders", value: "—"                },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "var(--color-surface-2)",
                borderRadius: "var(--radius-md)",
                padding: "12px 14px",
              }}
            >
              <p
                style={{
                  fontSize: "11px",
                  color: "var(--color-text-muted)",
                  fontWeight: 500, marginBottom: "4px",
                }}
              >
                {s.label}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700, fontSize: "16px",
                  color: "var(--color-text-primary)",
                }}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Products & Tools */}
      <div className="card" style={{ padding: "18px" }}>
        <p style={{ fontWeight: 700, fontSize: "14px", marginBottom: "12px" }}>
          Products & Tools
        </p>
        {TOOLS.map((tool, i) => (
          <div
            key={tool.label}
            style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom:
                i < TOOLS.length - 1
                  ? "1px solid var(--color-border-soft)"
                  : "none",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "16px" }}>{tool.icon}</span>
              <span
                style={{
                  fontSize: "13px", fontWeight: 500,
                  color: "var(--color-text-primary)",
                }}
              >
                {tool.label}
              </span>
            </div>
            {tool.badge && (
              <span
                style={{
                  fontSize: "11px", fontWeight: 600,
                  color: "var(--color-primary)",
                  background: "var(--color-primary-mid)",
                  padding: "2px 8px", borderRadius: "99px",
                }}
              >
                {tool.badge}
              </span>
            )}
          </div>
        ))}
      </div>
    </>
  );
}