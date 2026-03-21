"use client";

import { useState } from "react";
import SearchBar from "./Searchbar";

const NAV_TABS = ["Explore", "Holdings", "Positions", "Orders", "Watchlist"] as const;
export type NavTab = (typeof NAV_TABS)[number];

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export default function Navbar({ activeTab, onTabChange }: NavbarProps) {
  return (
    <header
      style={{
        background: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          height: "60px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "10px",
              background: "var(--color-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "var(--shadow-blue)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 17l5-5 4 4 9-9"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span
            style={{
              fontWeight: 700,
              fontSize: "17px",
              color: "var(--color-text-primary)",
              letterSpacing: "-0.3px",
            }}
          >
            TradeDesk
          </span>
        </div>

        {/* Nav tabs */}
        <nav style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          {NAV_TABS.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  background: isActive ? "var(--color-primary-light)" : "transparent",
                  color: isActive ? "var(--color-primary)" : "var(--color-text-secondary)",
                  fontWeight: isActive ? 600 : 500,
                  fontSize: "13.5px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  fontFamily: "var(--font-sans)",
                  letterSpacing: "0.1px",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.target as HTMLButtonElement).style.background =
                      "var(--color-surface-2)";
                    (e.target as HTMLButtonElement).style.color =
                      "var(--color-text-primary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.target as HTMLButtonElement).style.background = "transparent";
                    (e.target as HTMLButtonElement).style.color =
                      "var(--color-text-secondary)";
                  }
                }}
              >
                {tab}
              </button>
            );
          })}
        </nav>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <SearchBar />

          {/* Notification */}
          <button
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-text-secondary)",
              position: "relative",
              transition: "all 0.15s",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span
              style={{
                position: "absolute",
                top: "6px",
                right: "6px",
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--color-loss)",
                border: "1.5px solid white",
              }}
            />
          </button>

          {/* Avatar */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "var(--color-primary)",
              color: "white",
              fontWeight: 700,
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "var(--shadow-blue)",
            }}
          >
            J
          </div>
        </div>
      </div>
    </header>
  );
}