"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar, { NavTab } from "@/components/Navbar";
import MarketTicker from "@/components/MarketTicker";
import ExploreSection from "@/sections/ExploreSection";
import HoldingsSection from "@/sections/HoldingsSection";
import OrdersSection from "@/sections/OrdersSection";

const SECTION_MAP: Partial<Record<NavTab, React.ReactNode>> = {};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<NavTab>("Explore");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) router.push("/login");
  }, []);

  function renderSection() {
    switch (activeTab) {
      case "Explore":
        return <ExploreSection />;
      case "Holdings":
        return <HoldingsSection />;
      case "Orders":
        return <OrdersSection />;
      case "Positions":
        return <PlaceholderSection title="Positions" icon="📊" desc="Your open intraday positions will appear here." />;
      case "Watchlist":
        return <PlaceholderSection title="Watchlist" icon="👁️" desc="Add stocks to your watchlist to track them." />;
      default:
        return <ExploreSection />;
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", fontFamily: "var(--font-sans)" }}>
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <MarketTicker />

      <main
        className="animate-fade-in"
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "28px 24px 60px",
        }}
        key={activeTab} // Re-mount on tab switch for clean animation
      >
        {renderSection()}
      </main>
    </div>
  );
}

/* Placeholder for sections not yet built */
function PlaceholderSection({ title, icon, desc }: { title: string; icon: string; desc: string }) {
  return (
    <div
      className="card animate-fade-up"
      style={{
        padding: "80px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "14px",
      }}
    >
      <div style={{ fontSize: "56px", lineHeight: 1 }}>{icon}</div>
      <p style={{ fontWeight: 800, fontSize: "20px", letterSpacing: "-0.3px" }}>{title}</p>
      <p style={{ color: "var(--color-text-muted)", fontSize: "14px", maxWidth: "320px" }}>{desc}</p>
    </div>
  );
}