"use client";
// src/components/stock/NewsTab.tsx

import type { NewsItem } from "@/types/stock";

interface Props {
  news:    NewsItem[];
  loading: boolean;
}

export default function NewsTab({ news, loading }: Props) {
  if (loading) {
    return (
      <div className="card" style={{ overflow: "hidden" }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            style={{
              padding: "18px 20px",
              borderBottom: "1px solid var(--color-border-soft)",
            }}
          >
            <div style={{
              height: 10, width: "25%", marginBottom: 10, borderRadius: 4,
              background: "linear-gradient(90deg, var(--color-surface-2) 0%, var(--color-border-soft) 50%, var(--color-surface-2) 100%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite",
            }} />
            <div style={{
              height: 14, width: "85%", marginBottom: 6, borderRadius: 4,
              background: "linear-gradient(90deg, var(--color-surface-2) 0%, var(--color-border-soft) 50%, var(--color-surface-2) 100%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite",
            }} />
            <div style={{
              height: 14, width: "60%", borderRadius: 4,
              background: "linear-gradient(90deg, var(--color-surface-2) 0%, var(--color-border-soft) 50%, var(--color-surface-2) 100%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite",
            }} />
            <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
          </div>
        ))}
      </div>
    );
  }

  if (!news.length) {
    return (
      <div className="card" style={{ padding: "56px 32px", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📰</div>
        <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>No recent news</p>
        <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
          News for this stock isn't available right now
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      {news.map((item, i) => (
        <a
          key={i}
          href={item.link ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            padding: "16px 20px",
            borderBottom: i < news.length - 1 ? "1px solid var(--color-border-soft)" : "none",
            textDecoration: "none",
            transition: "background 0.1s",
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = "var(--color-surface-2)")}
          onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = "transparent")}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{
              fontSize: 11, fontWeight: 600,
              color: "var(--color-primary)",
              background: "var(--color-primary-light)",
              padding: "2px 8px", borderRadius: 99,
            }}>
              {item.publisher}
            </span>
            <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
              {item.timeAgo}
            </span>
          </div>
          <div style={{
            fontWeight: 600, fontSize: 14, lineHeight: 1.55,
            color: "var(--color-text-primary)",
          }}>
            {item.title}
          </div>
          {/* External link indicator */}
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 4, color: "var(--color-text-muted)" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            <span style={{ fontSize: 11 }}>Read full article</span>
          </div>
        </a>
      ))}
    </div>
  );
}