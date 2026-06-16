import React from "react";

export const DashboardHeader = ({ title, subtitle, accent, lastUpdated, refreshing, onRefresh }) => (
  <div
    className="mc-card"
    style={{
      background: `linear-gradient(135deg, ${accent}22 0%, rgba(7,12,22,0.98) 75%)`,
      border: `1px solid ${accent}44`,
    }}
  >
    <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
      <div>
        <div style={{ fontSize: "1.65rem", fontWeight: 800, color: "var(--mc-text)" }}>{title}</div>
        <div style={{ color: "var(--mc-text-muted)", maxWidth: 760 }}>{subtitle}</div>
      </div>
      <div className="d-flex align-items-center gap-2 flex-wrap">
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.45rem",
            background: `${accent}22`,
            color: accent,
            border: `1px solid ${accent}55`,
            padding: "0.45rem 0.75rem",
            borderRadius: 999,
            fontSize: "0.76rem",
            fontWeight: 700,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: refreshing ? "#F59E0B" : "#4CC9A6",
              boxShadow: `0 0 0 4px ${refreshing ? "rgba(245,158,11,0.15)" : "rgba(76,201,166,0.12)"}`,
            }}
          ></span>
          {refreshing ? "Refreshing live data" : "Live data connected"}
        </span>
        <button className="btn btn-sm" onClick={() => onRefresh("refresh")} style={{ background: accent, color: "#08121f", fontWeight: 700 }}>
          <i className={`fas fa-rotate-right me-2${refreshing ? " fa-spin" : ""}`}></i>
          Refresh
        </button>
      </div>
    </div>
    <div style={{ marginTop: "0.8rem", fontSize: "0.78rem", color: "var(--mc-text-muted)" }}>
      Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : "Loading..."}
    </div>
  </div>
);

export const MetricGrid = ({ items = [] }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
    {items.map((item) => (
      <div key={item.label} className="mc-card" style={{ borderTop: `3px solid ${item.color}` }}>
        <div className="d-flex justify-content-between align-items-start gap-2">
          <div>
            <div style={{ fontSize: "0.72rem", color: "var(--mc-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {item.label}
            </div>
            <div style={{ fontSize: "1.95rem", fontWeight: 800, color: "var(--mc-text)" }}>{item.value}</div>
          </div>
          <span style={{ width: 36, height: 36, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: `${item.color}22`, color: item.color }}>
            <i className={`fas ${item.icon}`}></i>
          </span>
        </div>
        {item.note ? <div style={{ marginTop: "0.45rem", color: "var(--mc-text-muted)", fontSize: "0.8rem" }}>{item.note}</div> : null}
      </div>
    ))}
  </div>
);

export const Panel = ({ title, badge, badgeColor, children }) => (
  <div className="mc-card" style={{ height: "100%" }}>
    <div className="mc-card-header mb-3">
      <span className="mc-card-title">{title}</span>
      {badge ? (
        <span className="mc-card-badge" style={{ background: `${badgeColor || "#6BBDD0"}22`, color: badgeColor || "#6BBDD0" }}>
          {badge}
        </span>
      ) : null}
    </div>
    {children}
  </div>
);

export const EmptyState = ({ icon = "fa-inbox", title = "No data yet", text = "This section will populate as soon as matching records exist." }) => (
  <div style={{ textAlign: "center", padding: "1.4rem 0.5rem", color: "var(--mc-text-muted)" }}>
    <i className={`fas ${icon}`} style={{ fontSize: "1.6rem", opacity: 0.35, display: "block", marginBottom: "0.6rem" }}></i>
    <div style={{ fontWeight: 700, color: "var(--mc-text)" }}>{title}</div>
    <div style={{ fontSize: "0.84rem", marginTop: "0.25rem" }}>{text}</div>
  </div>
);

export const ActivityList = ({ items = [], empty }) => {
  if (!items.length) return empty || <EmptyState />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
      {items.map((item, index) => (
        <div key={item.id || item._id || `${item.action || item.title}-${index}`} style={{ display: "flex", gap: "0.7rem", alignItems: "flex-start", paddingBottom: "0.65rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <span style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(107,189,208,0.16)", color: "#6BBDD0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <i className={`fas fa-${item.icon || "wave-square"}`} style={{ fontSize: "0.75rem" }}></i>
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ color: "var(--mc-text)", fontWeight: 700, fontSize: "0.88rem" }}>
              {item.title || item.action || "Activity"}
            </div>
            <div style={{ color: "var(--mc-text-muted)", fontSize: "0.8rem", lineHeight: 1.5 }}>
              {item.message || item.actor || item.entityType || item.detail || "Operational event"}
            </div>
            <div style={{ color: "var(--mc-text-muted)", fontSize: "0.72rem", marginTop: "0.18rem" }}>
              {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const MiniBars = ({ data = [], color = "#6BBDD0", suffix = "" }) => {
  if (!data.length) return <EmptyState icon="fa-chart-column" title="No trend data" text="Trend points will appear once records exist." />;
  const max = Math.max(...data.map((item) => Number(item.value) || 0), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "0.45rem", minHeight: 150 }}>
      {data.map((item) => (
        <div key={item.key || item.label} style={{ flex: 1, minWidth: 0 }}>
          <div style={{ height: 110, display: "flex", alignItems: "flex-end" }}>
            <div
              title={`${item.label}: ${item.value}${suffix}`}
              style={{
                width: "100%",
                height: `${Math.max(10, ((Number(item.value) || 0) / max) * 100)}%`,
                background: `linear-gradient(180deg, ${color} 0%, ${color}88 100%)`,
                borderRadius: "10px 10px 4px 4px",
              }}
            ></div>
          </div>
          <div style={{ marginTop: "0.4rem", fontSize: "0.7rem", color: "var(--mc-text-muted)", textAlign: "center" }}>{item.label}</div>
          <div style={{ fontSize: "0.78rem", color: "var(--mc-text)", textAlign: "center", fontWeight: 700 }}>{item.value}{suffix}</div>
        </div>
      ))}
    </div>
  );
};

export const KeyValueList = ({ items = [] }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
    {items.map((item) => (
      <div key={item.label} className="d-flex justify-content-between align-items-center gap-3" style={{ paddingBottom: "0.55rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <span style={{ color: "var(--mc-text-muted)", fontSize: "0.84rem" }}>{item.label}</span>
        <span style={{ color: item.color || "var(--mc-text)", fontWeight: 800 }}>{item.value}</span>
      </div>
    ))}
  </div>
);

export const TableLite = ({ columns = [], rows = [], emptyText = "No records available." }) => {
  if (!rows.length) return <EmptyState icon="fa-table" title="Nothing to show" text={emptyText} />;
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="table table-dark table-hover mb-0 align-middle">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} style={{ fontSize: "0.72rem", color: "var(--mc-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.id || row._id || rowIndex}>
              {columns.map((column) => (
                <td key={column.key} style={{ fontSize: "0.84rem" }}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const DashboardSkeleton = ({ accent = "#6BBDD0" }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
    <div className="mc-card" style={{ minHeight: 130, border: `1px solid ${accent}33` }}>
      <div className="placeholder-glow">
        <span className="placeholder col-4 mb-3" style={{ height: 22 }}></span>
        <span className="placeholder col-8" style={{ height: 12 }}></span>
      </div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "1rem" }}>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="mc-card">
          <div className="placeholder-glow">
            <span className="placeholder col-5 mb-3"></span>
            <span className="placeholder col-7" style={{ height: 30 }}></span>
          </div>
        </div>
      ))}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: "1rem" }}>
      <div className="mc-card" style={{ minHeight: 300 }}></div>
      <div className="mc-card" style={{ minHeight: 300 }}></div>
    </div>
  </div>
);
