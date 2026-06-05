import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import EngineerLayout from "./EngineerLayout";
import { getStoredUser, getDisplayName, getAuthHeaders } from "../../../utils/auth";
import { API_BASE_URL } from "../../../api/apiConfig";

const API = API_BASE_URL;
const accent = "#06B6D4";
const accentSoft = "rgba(6,182,212,0.12)";

// ── Donut ─────────────────────────────────────────────────────────────────
const Donut = ({ pct = 0, size = 72, strokeWidth = 9, color = accent, label }) => {
  const r = (size - strokeWidth) / 2, circ = 2 * Math.PI * r;
  const offset = circ - (Math.max(0, Math.min(100, pct)) / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      {label && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 700, color }}>
          {label}
        </div>
      )}
    </div>
  );
};

const Gauge = ({ label, pct, color, note }) => (
  <div className="mc-prog-row">
    <span className="mc-prog-label">{label}{note && <span style={{ fontSize: "0.58rem", color: "var(--mc-text-muted)", marginLeft: 4 }}>({note})</span>}</span>
    <span className="mc-prog-pct" style={{ color }}>{pct}%</span>
    <div className="mc-prog-track">
      <div className="mc-prog-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  </div>
);

const Empty = ({ icon, text }) => (
  <div style={{ textAlign: "center", padding: "1.5rem 0", color: "var(--mc-text-muted)" }}>
    <i className={`fas ${icon}`} style={{ fontSize: "1.5rem", opacity: 0.3, display: "block", marginBottom: "0.5rem" }}></i>
    <span style={{ fontSize: "0.72rem" }}>{text}</span>
  </div>
);

export default function EngineerDash() {
  const storedUser = getStoredUser();
  const name = getDisplayName(storedUser) || "Engineer";
  const [time, setTime] = useState(new Date());

  const [health,    setHealth]    = useState(null);
  const [logs,      setLogs]      = useState([]);
  const [settings,  setSettings]  = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchData = useCallback(async () => {
    const headers = getAuthHeaders();
    try {
      setLoading(true);
      const [healthRes, logsRes, settingsRes] = await Promise.all([
        axios.get(`${API}/admin/health`,          { headers }).catch(() => ({ data: {} })),
        axios.get(`${API}/admin/logs?limit=10`,   { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`${API}/admin/settings`,        { headers }).catch(() => ({ data: {} })),
      ]);
      setHealth(healthRes.data || {});
      setLogs((logsRes.data?.data || logsRes.data || []).slice(0, 10));
      setSettings(settingsRes.data || {});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalUsers     = health?.totalUsers          ?? 0;
  const pendingMedia   = health?.pendingMedia        ?? 0;
  const pendingApps    = health?.pendingApplications ?? 0;
  const salesToday     = health?.salesToday          ?? 0;
  const maintenanceMode = settings?.maintenanceMode ?? false;

  // Derive "error" vs "info" logs from the audit trail
  const errorLogs = logs.filter(l =>
    l.action?.includes("delete") || l.action?.includes("ban") || l.action?.includes("reject")
  );

  if (loading) {
    return (
      <EngineerLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
          <div className="spinner-border" style={{ color: accent }}></div>
        </div>
      </EngineerLayout>
    );
  }

  return (
    <EngineerLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

        {/* ── Hero Row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.4fr 0.9fr", gap: "1rem" }}>

          {/* Welcome */}
          <div className="mc-card" style={{ background: "linear-gradient(135deg,#0a3040 0%,#051a26 100%)", border: "1px solid rgba(6,182,212,0.25)" }}>
            <div style={{ fontSize: "0.62rem", color: "rgba(186,230,255,0.5)", marginBottom: "0.4rem" }}>
              <i className="fas fa-clock me-1"></i>
              {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
            <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "1.15rem", marginBottom: "0.15rem" }}>Hello, {name}</h3>
            <p style={{ color: "rgba(186,230,255,0.6)", fontSize: "0.74rem", marginBottom: "1rem" }}>
              {maintenanceMode
                ? <strong style={{ color: "#F59E0B" }}>Maintenance mode is ON</strong>
                : <strong style={{ color: "#67E8F9" }}>System is operational</strong>}
            </p>
            <div style={{ display: "flex", gap: "1.2rem" }}>
              {[
                { label: "Total Users",  value: totalUsers,  color: "#4CC9A6" },
                { label: "Pending Media",value: pendingMedia, color: "#F59E0B" },
                { label: "Revenue Today",value: `KES ${salesToday.toLocaleString()}`, color: accent },
              ].map(m => (
                <div key={m.label}>
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: "0.56rem", color: "rgba(186,230,255,0.4)" }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Health Summary */}
          <div className="mc-card">
            <div className="mc-card-header mb-2">
              <span className="mc-card-title">PLATFORM HEALTH</span>
              <span className="mc-card-badge" style={{ background: "rgba(76,201,166,0.12)", color: "#4CC9A6" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4CC9A6", display: "inline-block", marginRight: 4 }}></span>
                API Online
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              {[
                { name: "User Service",     ok: totalUsers >= 0,      detail: `${totalUsers} users`              },
                { name: "Media Service",    ok: pendingMedia >= 0,    detail: `${pendingMedia} items pending`    },
                { name: "Payment Gateway",  ok: salesToday >= 0,      detail: `KES ${salesToday.toLocaleString()} today` },
                { name: "Applications",     ok: pendingApps >= 0,     detail: `${pendingApps} pending review`    },
              ].map((s, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.35rem 0.6rem",
                  borderRadius: 8, background: "rgba(76,201,166,0.06)", border: "1px solid rgba(76,201,166,0.15)",
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.ok ? "#4CC9A6" : "#F06B8D", flexShrink: 0 }}></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.67rem", fontWeight: 600 }}>{s.name}</div>
                    <div style={{ fontSize: "0.58rem", color: "var(--mc-text-muted)" }}>{s.detail}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "0.75rem", padding: "0.5rem 0.75rem", borderRadius: 8, background: maintenanceMode ? "rgba(245,158,11,0.08)" : "rgba(76,201,166,0.07)", border: `1px solid ${maintenanceMode ? "rgba(245,158,11,0.2)" : "rgba(76,201,166,0.15)"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <i className={`fas ${maintenanceMode ? "fa-wrench" : "fa-check-circle"} me-2`} style={{ color: maintenanceMode ? "#F59E0B" : "#4CC9A6" }}></i>
                  <span style={{ fontSize: "0.72rem", fontWeight: 600, color: maintenanceMode ? "#F59E0B" : "#4CC9A6" }}>
                    Maintenance Mode: {maintenanceMode ? "ON" : "OFF"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* System Stats */}
          <div className="mc-card">
            <div className="mc-card-header mb-2">
              <span className="mc-card-title">PLATFORM STATS</span>
            </div>
            {[
              { label: "Total Users",       value: totalUsers,                       color: accent    },
              { label: "Pending Media",     value: pendingMedia,                     color: "#F59E0B" },
              { label: "Pending Apps",      value: pendingApps,                      color: "#F06B8D" },
              { label: "Revenue Today",     value: `KES ${salesToday.toLocaleString()}`, color: "#4CC9A6"},
              { label: "Audit Log Entries", value: logs.length,                      color: "#9D7FEB" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.3rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize: "0.67rem", color: "var(--mc-text-muted)" }}>{s.label}</span>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem" }}>
          {[
            { icon: "fa-users",        label: "Total Users",      value: totalUsers,   sub: "registered accounts",        color: accent    },
            { icon: "fa-photo-video",  label: "Media Pending",    value: pendingMedia, sub: "awaiting approval",           color: "#F59E0B" },
            { icon: "fa-user-clock",   label: "Applications",     value: pendingApps,  sub: "photographer applications",   color: "#F06B8D" },
            { icon: "fa-clipboard-list",label:"Audit Log Events",  value: logs.length,  sub: "recorded in this session",   color: "#9D7FEB" },
          ].map((c, i) => (
            <div key={i} className="mc-card" style={{ borderTop: `3px solid ${c.color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.2rem" }}>
                <span style={{ fontSize: "0.67rem", color: "var(--mc-text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{c.label}</span>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: `${c.color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className={`fas ${c.icon}`} style={{ fontSize: "0.72rem", color: c.color }}></i>
                </span>
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 700 }}>{c.value}</div>
              <div style={{ fontSize: "0.63rem", color: "var(--mc-text-muted)", marginTop: "0.1rem" }}>{c.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Audit Logs · Settings Overview ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "1rem" }}>

          {/* Audit Log as system log */}
          <div className="mc-card" style={{ overflow: "hidden" }}>
            <div className="mc-card-header mb-2">
              <span className="mc-card-title">SYSTEM AUDIT TRAIL</span>
              {errorLogs.length > 0 && (
                <span className="mc-card-badge" style={{ background: "rgba(240,107,141,0.12)", color: "#F06B8D" }}>
                  {errorLogs.length} critical
                </span>
              )}
            </div>
            {logs.length === 0 ? (
              <Empty icon="fa-terminal" text="No system logs found" />
            ) : (
              <div style={{ fontFamily: "monospace", fontSize: "0.66rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.9fr 1fr 1.4fr", gap: "4px", padding: "3px 0 6px", borderBottom: "1px solid rgba(255,255,255,0.08)", color: "var(--mc-text-muted)", fontWeight: 700, textTransform: "uppercase", fontSize: "0.57rem" }}>
                  <span>Timestamp</span><span>Staff</span><span>Action</span><span>Entity</span>
                </div>
                {logs.map((l, i) => {
                  const isWarn = l.action?.includes("delete") || l.action?.includes("ban") || l.action?.includes("reject");
                  const col = isWarn ? "#F06B8D" : "#4CC9A6";
                  return (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1.2fr 0.9fr 1fr 1.4fr", gap: "4px", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center" }}>
                      <span style={{ color: "var(--mc-text-muted)" }}>{new Date(l.createdAt).toLocaleString()}</span>
                      <span style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.adminName || "System"}</span>
                      <span style={{ color: col, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {(l.action || "").replace(/_/g, " ")}
                      </span>
                      <span style={{ color: "var(--mc-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {l.entityType || "—"}{l.entityId ? ` · ${l.entityId.slice(0, 8)}` : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Platform Config */}
          <div className="mc-card">
            <div className="mc-card-header mb-2">
              <span className="mc-card-title">SYSTEM CONFIGURATION</span>
            </div>
            {!settings || Object.keys(settings).length === 0 ? (
              <Empty icon="fa-sliders-h" text="No configuration loaded" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {Object.entries(settings)
                  .filter(([k]) => !["_id", "__v", "createdAt", "updatedAt"].includes(k))
                  .slice(0, 10)
                  .map(([key, val], i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.3rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ fontSize: "0.67rem", color: "var(--mc-text-muted)", fontFamily: "monospace" }}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span style={{
                        fontSize: "0.65rem", fontWeight: 700, fontFamily: "monospace",
                        color: val === true ? "#4CC9A6" : val === false ? "#F06B8D" : accent,
                      }}>
                        {typeof val === "boolean" ? (val ? "true" : "false") : String(val).slice(0, 20)}
                      </span>
                    </div>
                  ))}
              </div>
            )}
            <a href="/admin/config" style={{ display: "inline-block", marginTop: "0.75rem", fontSize: "0.7rem", color: accent, textDecoration: "none" }}>
              Edit configuration →
            </a>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="mc-card">
          <div className="mc-card-header mb-3">
            <span className="mc-card-title">ENGINEERING QUICK ACTIONS</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "0.75rem" }}>
            {[
              { icon: "fa-clipboard-list",  label: "Audit Logs",        color: accent,    href: "/admin/logs"         },
              { icon: "fa-sliders-h",       label: "System Config",     color: "#5B7FE5", href: "/admin/config"       },
              { icon: "fa-shield-alt",      label: "Moderation",        color: "#F06B8D", href: "/admin/moderation"   },
              { icon: "fa-users",           label: "User Management",   color: "#4CC9A6", href: "/admin/users"        },
              { icon: "fa-chart-bar",       label: "Analytics",         color: "#9D7FEB", href: "/admin/analytics"    },
              { icon: "fa-cog",             label: "Settings",          color: "#F59E0B", href: "/admin/settings"     },
            ].map((a, i) => (
              <a key={i} href={a.href} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: "0.45rem", padding: "0.9rem 0.5rem", borderRadius: 10,
                  border: `1px solid ${a.color}28`, background: `${a.color}0d`, cursor: "pointer",
                }}>
                  <i className={`fas ${a.icon}`} style={{ fontSize: "1.1rem", color: a.color }}></i>
                  <span style={{ fontSize: "0.62rem", color: "var(--mc-text)", fontWeight: 600, textAlign: "center" }}>{a.label}</span>
                </div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </EngineerLayout>
  );
}
