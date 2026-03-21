"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function OrderForm({ stockId }: { stockId: string }) {
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
 


  const placeOrder = async () => {
    try {
      await api.post("/orders", {
        stockId,
        side: "BUY",
        type: "LIMIT",
        price: Number(price),
        quantity: Number(quantity),
      });

      alert("✅ Order placed!");
    } catch (err) {
      console.error(err);
      alert("❌ Order failed");
    }
  };

  return (
    <div className="mt-2 flex gap-2">
      <input
        className="border p-1 w-20"
        placeholder="Price"
        onChange={(e) => setPrice(e.target.value)}
      />
      <input
        className="border p-1 w-20"
        placeholder="Qty"
        onChange={(e) => setQuantity(e.target.value)}
      />
      <button
        className="bg-green-500 text-white px-2"
        onClick={placeOrder}
      >
        Buy
      </button>
    </div>
  );
}