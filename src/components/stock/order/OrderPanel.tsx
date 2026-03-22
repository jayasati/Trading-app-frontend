"use client";

import { useState, useEffect, useRef } from "react";
import { api }          from "@/lib/api";
import { isMarketOpen } from "@/lib/time";
import OrderForm        from "./OrderForm";
import OrderSummary     from "./OrderSummary";
import type { OrderSide, OrderType } from "@/types/stock";

type OrderCategory = "DELIVERY" | "INTRADAY";

interface Wallet {
  balance:       string | number;
  lockedBalance: string | number;
}

interface OrderPanelProps {
  stockId:     string;
  stockName:   string;
  livePrice:   number;
  onOrderDone: () => void;
}

function fmt(n: number) {
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function OrderPanel({
  stockId, stockName, livePrice, onOrderDone,
}: OrderPanelProps) {
  const [side,          setSide]          = useState<OrderSide>("BUY");
  const [oType,         setOType]         = useState<OrderType>("LIMIT");
  const [category,      setCategory]      = useState<OrderCategory>("DELIVERY");
  const [qty,           setQty]           = useState("");
  const [price,         setPrice]         = useState(
    livePrice > 0 ? livePrice.toFixed(2) : ""
  );
  const [wallet,        setWallet]        = useState<Wallet | null>(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [loading,       setLoading]       = useState(false);
  const [msg,           setMsg]           = useState<{ ok: boolean; text: string } | null>(null);

  const marketOpen   = isMarketOpen();

  // Sync price to live price only on first mount / order type change
  const hasSyncedRef = useRef(false);
  useEffect(() => {
    if (oType === "LIMIT" && livePrice > 0 && !hasSyncedRef.current) {
      setPrice(livePrice.toFixed(2));
      hasSyncedRef.current = true;
    }
    if (oType === "MARKET") hasSyncedRef.current = false;
  }, [oType, livePrice]);

  // Fetch wallet with one retry
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const r = await api.get("/wallet");
        setWallet(r.data);
      } catch {
        setTimeout(async () => {
          try {
            const r = await api.get("/wallet");
            setWallet(r.data);
          } catch {
            // non-critical — wallet stays null
          } finally {
            setWalletLoading(false);
          }
        }, 1000);
        return;
      }
      setWalletLoading(false);
    };
    fetchWallet();
  }, []);

  // Reset to delivery if market closes mid-session
  useEffect(() => {
    if (!marketOpen && category === "INTRADAY") setCategory("DELIVERY");
  }, [marketOpen, category]);

  // Clear messages on any input change
  useEffect(() => { setMsg(null); }, [side, oType, category, qty, price]);

  // Derived values
  const balance    = wallet ? Number(wallet.balance) : 0;
  const orderPrice = oType === "MARKET" ? livePrice : Number(price || 0);
  const approxReq  = Number(qty || 0) * orderPrice;
  const marginReq  = category === "INTRADAY" ? approxReq / 5 : approxReq;
  const canAfford  = walletLoading || side === "SELL" || balance >= marginReq;

  const placeOrder = async () => {
    setMsg(null);
    if (!qty || Number(qty) <= 0) {
      setMsg({ ok: false, text: "Enter a valid quantity" });
      return;
    }
    if (oType === "LIMIT" && (!price || Number(price) <= 0)) {
      setMsg({ ok: false, text: "Enter a valid price" });
      return;
    }

    setLoading(true);
    try {
      await api.post("/orders", {
        stockId,
        side,
        type:     oType,
        category,
        price:    oType === "MARKET" ? livePrice : Number(price),
        quantity: Number(qty),
      });

      setMsg({
        ok:   true,
        text: `${category === "INTRADAY" ? "Intraday" : "Delivery"} ${side} order placed!`,
      });
      setQty("");

      const w = await api.get("/wallet");
      setWallet(w.data);
      onOrderDone();
    } catch (err: unknown) {
      setMsg({
        ok:   false,
        text: (err as any)?.response?.data?.message ?? "Order failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="card"
      style={{ padding: 0, overflow: "hidden", position: "sticky", top: 100 }}
    >
      {/* ── Stock name + live price ── */}
      <div
        style={{
          padding: "16px 20px 12px",
          borderBottom: "1px solid var(--color-border-soft)",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>
          {stockName}
        </div>
        <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
          NSE · Live ₹{fmt(livePrice)}
        </div>
      </div>

      {/* ── Form: side / category / type / inputs ── */}
      <OrderForm
        side={side}
        oType={oType}
        category={category}
        qty={qty}
        price={price}
        marketOpen={marketOpen}
        livePrice={livePrice}
        onSideChange={(s) => { setSide(s); setMsg(null); }}
        onTypeChange={(t) => { setOType(t); setMsg(null); }}
        onCategoryChange={(c) => { setCategory(c); setMsg(null); }}
        onQtyChange={(v) => { setQty(v); setMsg(null); }}
        onPriceChange={(v) => { setPrice(v); setMsg(null); }}
      />

      {/* ── Summary: balance / margin / submit ── */}
      <OrderSummary
        side={side}
        category={category}
        qty={qty}
        orderPrice={orderPrice}
        balance={balance}
        walletLoading={walletLoading}
        loading={loading}
        canAfford={canAfford}
        msg={msg}
        onSubmit={placeOrder}
      />
    </div>
  );
}