"use client";

import { useState } from "react";

type MoverTab = "Gainers" | "Losers" | "Volume";

interface Mover {
  symbol:  string;
  name:    string;
  price:   number;
  change:  number;
  pct:     number;
  volume:  string;
}

const MOCK_MOVERS: Record<MoverTab, Mover[]> = {
  Gainers: [
    { symbol: "JINDAL STEEL",  name: "Jindal Steel & Power", price: 1186.50, change: 48.40,  pct: 4.25,  volume: "1.99 Cr" },
    { symbol: "JSW STEEL",     name: "JSW Steel Ltd",         price: 1169.60, change: 38.70,  pct: 3.42,  volume: "—"       },
    { symbol: "TECH MAHINDRA", name: "Tech Mahindra Ltd",     price: 1384.80, change: 44.20,  pct: 3.30,  volume: "33.97 L" },
    { symbol: "TATA STEEL",    name: "Tata Steel Ltd",        price: 196.77,  change: 6.26,   pct: 3.29,  volume: "4.69 Cr" },
    { symbol: "COAL INDIA",    name: "Coal India Ltd",        price: 468.15,  change: 13.95,  pct: 3.07,  volume: "2.39 Cr" },
  ],
  Losers: [
    { symbol: "HDFC BANK",     name: "HDFC Bank Ltd",         price: 1780.45, change: -17.75, pct: -2.22, volume: "1.20 Cr" },
    { symbol: "BAJAJ FINANCE", name: "Bajaj Finance Ltd",     price: 6540.00, change: -98.30, pct: -1.48, volume: "45.2 L"  },
    { symbol: "TITAN CO",      name: "Titan Company Ltd",     price: 3320.10, change: -39.50, pct: -1.18, volume: "18.3 L"  },
  ],
  Volume: [
    { symbol: "TATA STEEL",    name: "Tata Steel Ltd",        price: 196.77,  change: 6.26,   pct: 3.29,  volume: "4.69 Cr" },
    { symbol: "COAL INDIA",    name: "Coal India Ltd",        price: 468.15,  change: 13.95,  pct: 3.07,  volume: "2.39 Cr" },
    { symbol: "SBI",           name: "State Bank of India",   price: 812.60,  change: 5.40,   pct: 0.67,  volume: "3.84 Cr" },
  ],
};

export default function TopMovers() {
  const [tab, setTab] = useState<MoverTab>("Gainers");
  const movers        = MOCK_MOVERS[tab];

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      {/* Header + tab switcher */}
      <div
        style={{
          padding: "18px 20px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontWeight: 700, fontSize: "15px" }}>
          Top movers today
        </span>
        <div
          style={{
            display: "flex", gap: "4px",
            background: "var(--color-surface-2)",
            padding: "3px", borderRadius: "var(--radius-md)",
          }}
        >
          {(["Gainers", "Losers", "Volume"] as MoverTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "4px 12px",
                borderRadius: "7px",
                border: "none",
                background:  tab === t ? "var(--color-surface)" : "transparent",
                color:       tab === t ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                fontWeight:  tab === t ? 600 : 400,
                fontSize:    "12.5px",
                cursor:      "pointer",
                fontFamily:  "var(--font-sans)",
                boxShadow:   tab === t ? "var(--shadow-sm)" : "none",
                transition:  "all 0.15s",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "8px" }}>
          <thead>
            <tr style={{ background: "var(--color-surface-2)" }}>
              {["Company", "Market price", "Change", "Volume"].map((h, i) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 20px",
                    textAlign: i === 0 ? "left" : "right",
                    fontSize: "11.5px", fontWeight: 600,
                    color: "var(--color-text-muted)",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {movers.map((m, i) => {
              const pos = m.pct >= 0;
              return (
                <tr
                  key={i}
                  style={{
                    borderTop: "1px solid var(--color-border-soft)",
                    cursor: "pointer",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background =
                      "var(--color-surface-2)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background =
                      "transparent")
                  }
                  onClick={() => {
                    const input = document.querySelector(
                      'input[placeholder="Search stocks…"]'
                    ) as HTMLInputElement | null;
                    input?.focus();
                  }}
                >
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: 34, height: 34,
                          borderRadius: "8px",
                          background: pos ? "var(--color-gain-bg)" : "var(--color-loss-bg)",
                          color:      pos ? "var(--color-gain)"    : "var(--color-loss)",
                          fontWeight: 700, fontSize: "11px",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {m.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "13px" }}>{m.symbol}</div>
                        <div style={{ fontSize: "11.5px", color: "var(--color-text-muted)" }}>
                          {m.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td
                    style={{
                      textAlign: "right", padding: "14px 20px",
                      fontFamily: "var(--font-mono)",
                      fontWeight: 600, fontSize: "13px",
                    }}
                  >
                    ₹{m.price.toLocaleString("en-IN")}
                  </td>

                  <td style={{ textAlign: "right", padding: "14px 20px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: "1px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "12.5px", fontWeight: 600,
                          color: pos ? "var(--color-gain)" : "var(--color-loss)",
                        }}
                      >
                        {pos ? "+" : ""}{m.change.toFixed(2)}
                      </span>
                      <span
                        style={{
                          fontSize: "11px", fontWeight: 600,
                          color:      pos ? "var(--color-gain)"    : "var(--color-loss)",
                          background: pos ? "var(--color-gain-bg)" : "var(--color-loss-bg)",
                          padding: "1px 6px", borderRadius: "99px",
                        }}
                      >
                        {pos ? "+" : ""}{m.pct.toFixed(2)}%
                      </span>
                    </span>
                  </td>

                  <td
                    style={{
                      textAlign: "right", padding: "14px 20px",
                      fontSize: "12.5px",
                      color: "var(--color-text-secondary)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {m.volume}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}