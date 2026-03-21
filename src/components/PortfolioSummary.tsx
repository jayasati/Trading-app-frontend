"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function PortfolioSummary() {
  const [wallet, setWallet] = useState<any>(null);

  useEffect(() => {
    api.get("/wallet").then((res) => {
      setWallet(res.data);
    });
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">

    <h3 className="text-lg font-semibold mb-4">
        Your Investments
    </h3>

    {wallet && (
        <>
        <p className="text-gray-700">
            Balance: ₹{Number(wallet.balance)}
        </p>
        <p className="text-gray-500">
            Locked: ₹{Number(wallet.lockedBalance)}
        </p>
        </>
    )}

    </div>
  );
}