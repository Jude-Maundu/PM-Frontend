import React from "react";

const S = ({ w = "100%", h = 16, r = 8, style = {} }) => (
  <div style={{
    width: w, height: h, borderRadius: r,
    background: "linear-gradient(90deg, var(--sk-base) 25%, var(--sk-shine) 50%, var(--sk-base) 75%)",
    backgroundSize: "200% 100%",
    animation: "sk-shimmer 1.4s ease-in-out infinite",
    flexShrink: 0,
    ...style,
  }} />
);

const DashboardSkeleton = () => {
  const isDark = document.documentElement.getAttribute("data-theme") !== "light";

  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      background: isDark ? "#0f1923" : "#f4f6f9",
      "--sk-base":  isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
      "--sk-shine": isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
    }}>
      <style>{`
        @keyframes sk-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 220, flexShrink: 0,
        background: isDark ? "#111c28" : "#1a2e3b",
        padding: "1.25rem 1rem",
        display: "flex", flexDirection: "column", gap: "0.6rem",
      }} className="d-none d-md-flex">
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem", padding: "0 0.25rem" }}>
          <S w={36} h={36} r={10} />
          <S w={90} h={16} r={6} />
        </div>
        {/* Nav items */}
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0.6rem" }}>
            <S w={18} h={18} r={5} />
            <S w={`${55 + Math.sin(i) * 30}%`} h={13} r={5} />
          </div>
        ))}
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Topbar */}
        <div style={{
          height: 56, background: isDark ? "#152030" : "#fff",
          borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}`,
          display: "flex", alignItems: "center", padding: "0 1.5rem", gap: "1rem",
        }}>
          <S w={120} h={16} r={6} />
          <div style={{ flex: 1 }} />
          <S w={32} h={32} r={16} />
          <S w={80} h={13} r={5} />
          <S w={32} h={32} r={8} />
          <S w={32} h={32} r={8} />
        </div>

        {/* Page content */}
        <div style={{ flex: 1, padding: "1.5rem", overflowY: "auto" }}>

          {/* Page title */}
          <S w={180} h={22} r={7} style={{ marginBottom: "1.5rem" }} />

          {/* Stat cards row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{
                background: isDark ? "rgba(255,255,255,0.04)" : "#fff",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}`,
                borderRadius: 14, padding: "1.1rem",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <S w={90} h={13} r={5} />
                  <S w={28} h={28} r={8} />
                </div>
                <S w={70} h={28} r={7} style={{ marginBottom: "0.5rem" }} />
                <S w={110} h={12} r={5} />
              </div>
            ))}
          </div>

          {/* Two column section */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }} className="sk-two-col">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} style={{
                background: isDark ? "rgba(255,255,255,0.04)" : "#fff",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}`,
                borderRadius: 14, padding: "1.1rem",
              }}>
                <S w={130} h={16} r={6} style={{ marginBottom: "1rem" }} />
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                    <S w={40} h={40} r={8} />
                    <div style={{ flex: 1 }}>
                      <S w="70%" h={13} r={5} style={{ marginBottom: "0.35rem" }} />
                      <S w="50%" h={11} r={4} />
                    </div>
                    <S w={50} h={13} r={5} />
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Image grid */}
          <div style={{
            background: isDark ? "rgba(255,255,255,0.04)" : "#fff",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}`,
            borderRadius: 14, padding: "1.1rem",
          }}>
            <S w={160} h={16} r={6} style={{ marginBottom: "1rem" }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "0.75rem" }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <S key={i} w="100%" h={120} r={10} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
