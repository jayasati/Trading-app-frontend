export default function LoginBrandPanel() {
  return (
    <div
      style={{
        background: "linear-gradient(145deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "48px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative circles */}
      {[
        { w: 300, h: 300, top: "-80px",  right: "-80px", opacity: 0.08 },
        { w: 200, h: 200, bottom: "60px", left: "-60px",  opacity: 0.06 },
        { w: 150, h: 150, top: "45%",    left: "30%",    opacity: 0.05 },
      ].map((c, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: c.w,
            height: c.h,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.3)",
            top:    (c as any).top,
            right:  (c as any).right,
            bottom: (c as any).bottom,
            left:   (c as any).left,
            opacity: c.opacity * 10,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "11px",
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
            color: "white",
            fontWeight: 700,
            fontSize: "18px",
            letterSpacing: "-0.3px",
          }}
        >
          TradeDesk
        </span>
      </div>

      {/* Headline */}
      <div>
        <h1
          style={{
            color: "white",
            fontSize: "38px",
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: "-1px",
            marginBottom: "16px",
          }}
        >
          Practice trading.
          <br />
          <span style={{ opacity: 0.75 }}>No real money.</span>
          <br />
          Real skills.
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.65)",
            fontSize: "15px",
            lineHeight: 1.7,
            maxWidth: "340px",
          }}
        >
          Trade stocks, place limit orders, and build a portfolio — all in a
          risk-free paper trading environment.
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: "32px" }}>
        {[
          { label: "Paper Traders", value: "10K+" },
          { label: "Stocks Listed", value: "500+" },
          { label: "Trades / Day",  value: "50K+" },
        ].map((s) => (
          <div key={s.label}>
            <div
              style={{
                color: "white",
                fontWeight: 800,
                fontSize: "22px",
                fontFamily: "var(--font-mono)",
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.55)",
                fontSize: "12px",
                marginTop: "2px",
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}