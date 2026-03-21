"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Home() {
  const [data, setData] = useState("");

  useEffect(() => {
    api.get("/health")
      .then((res) => {
        setData(JSON.stringify(res.data));
      })
      .catch((err) => {
        console.error(err);
        setData("Error connecting to backend");
      });
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">Backend Connection Test</h1>
      <p className="mt-4">{data}</p>
    </div>
  );
}