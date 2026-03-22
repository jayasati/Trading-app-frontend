"use client";

import { useState, useEffect } from "react";
import { useRouter }       from "next/navigation";
import Navbar              from "@/components/Navbar";
import MarketTicker        from "@/components/MarketTicker";
import ExploreSection      from "@/sections/explore/ExploreSection";
import HoldingsSection     from "@/sections/holdings/HoldingsSection";
import OrdersSection       from "@/sections/orders/OrdersSection";
import PositionsSection    from "@/sections/positions/PositionsSection";
import type { NavTab }     from "@/components/Navbar";
import { useAuthStore } from "@/store/useAuthStore";


export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<NavTab>("Explore");
  const router = useRouter();
  const { accessToken, isHydrated } = useAuthStore();
  
  useEffect(() => {
    if (isHydrated && !accessToken) router.push("/login");
  }, [isHydrated, accessToken]);

  function renderSection() {
    switch (activeTab) {
      case "Explore":   return <ExploreSection />;
      case "Holdings":  return <HoldingsSection />;
      case "Orders":    return <OrdersSection />;
      case "Positions": return <PositionsSection />;
      case "Watchlist": return (
        <PlaceholderSection
          title="Watchlist"
          icon="👁️"
          desc="Add stocks to your watchlist to track them."
        />
      );
      default: return <ExploreSection />;
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg)",
        fontFamily: "var(--font-sans)",
      }}
    >
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <MarketTicker />
      <main
        className="animate-fade-in"
        key={activeTab}
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "28px 24px 60px",
        }}
      >
        {renderSection()}
      </main>
    </div>
  );
}

function PlaceholderSection({
  title, icon, desc,
}: {
  title: string;
  icon:  string;
  desc:  string;
}) {
  return (
    <div
      className="card animate-fade-up"
      style={{
        padding: "80px", textAlign: "center",
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: "14px",
      }}
    >
      <div style={{ fontSize: "56px", lineHeight: 1 }}>{icon}</div>
      <p style={{ fontWeight: 800, fontSize: "20px", letterSpacing: "-0.3px" }}>
        {title}
      </p>
      <p style={{ color: "var(--color-text-muted)", fontSize: "14px", maxWidth: "320px" }}>
        {desc}
      </p>
    </div>
  );
}
