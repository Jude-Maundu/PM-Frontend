import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import SecretaryLayout from "./SecretaryLayout";
import { getStoredUser, getDisplayName, getAuthHeaders } from "../../../utils/auth";
import { API_BASE_URL } from "../../../api/apiConfig";

const API = API_BASE_URL;
const accent = "#8B5CF6";
const accentSoft = "rgba(139,92,246,0.12)";

// ── Mini-calendar ─────────────────────────────────────────────────────────
const MiniCalendar = () => {
  const now = new Date(), year = now.getFullYear(), month = now.getMonth(), today = now.getDate();
  const firstDay = new Date(year, month, 1).getDay(), daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
        <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>
          {now.toLocaleString("default", { month: "long" })}
        </span>
        <span style={{ fontSize: "0.7rem", color: "var(--mc-text-muted)" }}>{year}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "2px", textAlign: "center" }}>
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
          <div key={d} style={{ fontSize: "0.55rem", color: "var(--mc-text-muted)", fontWeight: 600, padding: "2px 0" }}>{d}</div>
        ))}
        {cells.map((day, i) => (
          <div key={i} style={{
            fontSize: "0.65rem", padding: "3px 2px", borderRadius: "50%",
            background: day === today ? accent : "transparent",
            color: day === today ? "#fff" : day ? "var(--mc-text)" : "transparent",
            fontWeight: day === today ? 700 : 400,
          }}>{day || ""}</div>
        ))}
      </div>
    </div>
  );
};

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

const Empty = ({ icon, text }) => (
  <div style={{ textAlign: "center", padding: "1.5rem 0", color: "var(--mc-text-muted)" }}>
    <i className={`fas ${icon}`} style={{ fontSize: "1.5rem", opacity: 0.3, display: "block", marginBottom: "0.5rem" }}></i>
    <span style={{ fontSize: "0.72rem" }}>{text}</span>
  </div>
);

export default function SecretaryDash() {
  const storedUser = getStoredUser();
  const name = getDisplayName(storedUser) || "Secretary";
  const [time, setTime] = useState(new Date());

  const [health, setHealth]   = useState(null);
  const [apps, setApps]       = useState([]);
  const [logs, setLogs]       = useState([]);
  const [notifs, setNotifs]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchData = useCallback(async () => {
    const headers = getAuthHeaders();
    try {
      setLoading(true);
      const [healthRes, appsRes, logsRes, notifsRes] = await Promise.all([
        axios.get(`${API}/admin/health`,                { headers }).catch(() => ({ data: {} })),
        axios.get(`${API}/admin/applications`,          { headers }).catch(() => ({ data: [] })),
        axios.get(`${API}/admin/logs?limit=8`,          { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`${API}/notifications`,               { headers }).catch(() => ({ data: [] })),
      ]);
      setHealth(healthRes.data || {});
      setApps((appsRes.data || []).slice(0, 6));
      setLogs((logsRes.data?.data || []).slice(0, 8));
      setNotifs((Array.isArray(notifsRes.data) ? notifsRes.data : notifsRes.data?.data || []).slice(0, 5));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalUsers     = health?.totalUsers          ?? 0;
  const pendingApps    = health?.pendingApplications ?? 0;
  const pendingWdl     = health?.pendingWithdrawals  ?? 0;
  const pendingMedia   = health?.pendingMedia        ?? 0;
  const unreadNotifs   = notifs.filter(n => !n.read).length;

  const tasksDone = apps.filter(a => a.status === "approved" || a.status === "rejected").length;
  const tasksTotal = apps.length;
  const donePct = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0;

  if (loading) {
    return (
      <SecretaryLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
          <div className="spinner-border" style={{ color: accent }}></div>
        </div>
      </SecretaryLayout>
    );
  }

  return (
    <SecretaryLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

        {/* ── Hero Row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.5fr 0.85fr", gap: "1rem" }}>

          {/* Welcome */}
          <div className="mc-card" style={{ background: "linear-gradient(135deg,#2d1b69 0%,#1a0e40 100%)", border: "1px solid rgba(139,92,246,0.25)" }}>
            <div style={{ fontSize: "0.65rem", color: "rgba(220,210,255,0.5)", marginBottom: "0.35rem" }}>
              <i className="fas fa-clock me-1"></i>
              {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              &nbsp;·&nbsp;
              {time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
            <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "1.15rem", marginBottom: "0.15rem" }}>Good Day, {name}!</h3>
            <p style={{ color: "rgba(220,210,255,0.6)", fontSize: "0.74rem", marginBottom: "1rem" }}>
              {pendingApps > 0
                ? <><strong style={{ color: "#C4B5FD" }}>{pendingApps} application{pendingApps !== 1 ? "s" : ""}</strong> awaiting review</>
                : "All applications are up to date."}
            </p>
            <div style={{ display: "flex", gap: "1.25rem" }}>
              {[
                { label: "Users",    value: totalUsers,   color: "#C4B5FD"  },
                { label: "Pending",  value: pendingApps,  color: "#F06B8D"  },
                { label: "Withdrawals", value: pendingWdl, color: "#4CC9A6" },
              ].map(m => (
                <div key={m.label}>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: "0.58rem", color: "rgba(220,210,255,0.45)" }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="mc-card">
            <div className="mc-card-header mb-2">
              <span className="mc-card-title">RECENT PLATFORM ACTIVITY</span>
              <span className="mc-card-badge" style={{ background: accentSoft, color: accent }}>Live</span>
            </div>
            {logs.length === 0 ? (
              <Empty icon="fa-stream" text="No recent activity logs" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {logs.map((log, i) => {
                  const isNeg = log.action?.includes("reject") || log.action?.includes("ban") || log.action?.includes("delete");
                  const col = isNeg ? "#F06B8D" : "#4CC9A6";
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.3rem 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ width: 22, height: 22, borderRadius: "50%", background: `${col}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <i className={`fas ${isNeg ? "fa-times-circle" : "fa-check-circle"}`} style={{ fontSize: "0.58rem", color: col }}></i>
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.7rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {log.adminName || "Staff"} — {(log.action || "").replace(/_/g, " ")}
                        </div>
                        <div style={{ fontSize: "0.58rem", color: "var(--mc-text-muted)" }}>
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: col, flexShrink: 0 }}></span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Calendar */}
          <div className="mc-card"><MiniCalendar /></div>
        </div>

        {/* ── Stat Cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem" }}>
          {[
            { icon: "fa-users",       label: "Total Users",     value: totalUsers,   sub: "registered on platform",   color: accent    },
            { icon: "fa-user-clock",  label: "Pending Apps",    value: pendingApps,  sub: "photographer applications", color: "#F06B8D" },
            { icon: "fa-photo-video", label: "Media Pending",   value: pendingMedia, sub: "awaiting moderation",       color: "#F59E0B" },
            { icon: "fa-bell",        label: "Notifications",   value: unreadNotifs, sub: "unread",                    color: "#5B7FE5" },
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

        {/* ── Applications · Notifications ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "1rem" }}>

          {/* Pending Applications */}
          <div className="mc-card" style={{ overflow: "hidden" }}>
            <div className="mc-card-header mb-2">
              <span className="mc-card-title">PHOTOGRAPHER APPLICATIONS</span>
              <span className="mc-card-badge" style={{ background: accentSoft, color: accent }}>
                {pendingApps} pending
              </span>
            </div>
            {apps.length === 0 ? (
              <Empty icon="fa-user-clock" text="No applications on record" />
            ) : (
              <div style={{ fontSize: "0.67rem", overflowX: "auto" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 0.9fr 0.8fr 0.9fr", gap: "4px", padding: "3px 0 6px", borderBottom: "1px solid rgba(255,255,255,0.08)", color: "var(--mc-text-muted)", fontWeight: 700, textTransform: "uppercase", fontSize: "0.57em", letterSpacing: "0.04em" }}>
                  <span>Applicant</span><span>Email</span><span>Role</span><span>Submitted</span><span>Status</span>
                </div>
                {apps.map((a, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 0.9fr 0.8fr 0.9fr", gap: "4px", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center" }}>
                    <span style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {a.username || a.name || "—"}
                    </span>
                    <span style={{ color: "var(--mc-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {a.email || "—"}
                    </span>
                    <span style={{ color: "var(--mc-text-muted)" }}>{a.role || "Photographer"}</span>
                    <span style={{ color: "var(--mc-text-muted)" }}>
                      {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "—"}
                    </span>
                    <span style={{
                      fontSize: "0.58rem", padding: "2px 7px", borderRadius: 20, fontWeight: 700, width: "fit-content",
                      background: a.status === "approved" ? "rgba(76,201,166,0.12)" : a.status === "rejected" ? "rgba(240,107,141,0.12)" : "rgba(245,158,11,0.12)",
                      color: a.status === "approved" ? "#4CC9A6" : a.status === "rejected" ? "#F06B8D" : "#F59E0B",
                    }}>
                      {(a.status || "pending").charAt(0).toUpperCase() + (a.status || "pending").slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notifications / Communications */}
          <div className="mc-card">
            <div className="mc-card-header mb-2">
              <span className="mc-card-title">NOTIFICATIONS</span>
              {unreadNotifs > 0 && (
                <span className="mc-card-badge" style={{ background: "rgba(240,107,141,0.12)", color: "#F06B8D" }}>
                  {unreadNotifs} unread
                </span>
              )}
            </div>
            {notifs.length === 0 ? (
              <Empty icon="fa-bell-slash" text="No notifications yet" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {notifs.map((n, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: "0.5rem",
                    padding: "0.35rem 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
                    opacity: n.read ? 0.6 : 1,
                  }}>
                    <span style={{ width: 24, height: 24, borderRadius: "50%", background: accentSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      <i className="fas fa-bell" style={{ fontSize: "0.55rem", color: accent }}></i>
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.7rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {n.message || n.title || "Notification"}
                      </div>
                      <div style={{ fontSize: "0.58rem", color: "var(--mc-text-muted)" }}>
                        {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                      </div>
                    </div>
                    {!n.read && <span style={{ width: 6, height: 6, borderRadius: "50%", background: accent, flexShrink: 0, marginTop: 6 }}></span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Workload + Audit Trail ── */}
        <div style={{ display: "grid", gridTemplateColumns: "0.7fr 1.6fr", gap: "1rem" }}>

          {/* Workload Donut */}
          <div className="mc-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
            <Donut pct={donePct} size={90} color={accent} label={`${donePct}%`} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 700 }}>Application Review Rate</div>
              <div style={{ fontSize: "0.62rem", color: "var(--mc-text-muted)" }}>
                {tasksDone} of {tasksTotal} processed
              </div>
            </div>
            {[
              { label: "Approved",  val: apps.filter(a => a.status === "approved").length,  color: "#4CC9A6" },
              { label: "Rejected",  val: apps.filter(a => a.status === "rejected").length,  color: "#F06B8D" },
              { label: "Pending",   val: apps.filter(a => !a.status || a.status === "pending").length, color: "#F59E0B" },
            ].map(r => (
              <div key={r.label} style={{ display: "flex", justifyContent: "space-between", width: "100%", padding: "3px 0" }}>
                <span style={{ fontSize: "0.65rem", color: "var(--mc-text-muted)" }}>{r.label}</span>
                <span style={{ fontSize: "0.65rem", fontWeight: 700, color: r.color }}>{r.val}</span>
              </div>
            ))}
          </div>

          {/* Full Audit Log */}
          <div className="mc-card">
            <div className="mc-card-header mb-2">
              <span className="mc-card-title">FULL AUDIT LOG</span>
            </div>
            {logs.length === 0 ? (
              <Empty icon="fa-clipboard-list" text="No audit entries found" />
            ) : (
              logs.map((log, i) => {
                const isNeg = log.action?.includes("reject") || log.action?.includes("ban") || log.action?.includes("delete");
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.35rem 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: "0.7rem", flexWrap: "wrap" }}>
                    <span style={{ color: "var(--mc-text-muted)", minWidth: 100, fontSize: "0.62rem" }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                    <span style={{ fontWeight: 600 }}>{log.adminName || "Staff"}</span>
                    <span className={`badge bg-${isNeg ? "danger" : "success"}`} style={{ fontSize: "0.6rem" }}>
                      {(log.action || "").replace(/_/g, " ")}
                    </span>
                    {log.entityType && (
                      <span style={{ color: "var(--mc-text-muted)" }}>
                        {log.entityType}{log.entityId ? ` · ${log.entityId.slice(0, 8)}` : ""}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="mc-card">
          <div className="mc-card-header mb-3">
            <span className="mc-card-title">QUICK ACTIONS</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "0.75rem" }}>
            {[
              { icon: "fa-user-check",    label: "Review Applications", color: accent,    href: "/admin/applications"  },
              { icon: "fa-money-bill-wave",label: "Withdrawals",        color: "#4CC9A6", href: "/admin/withdrawals"   },
              { icon: "fa-photo-video",   label: "Media Moderation",   color: "#F06B8D", href: "/admin/moderation"    },
              { icon: "fa-users",         label: "User Management",    color: "#5B7FE5", href: "/admin/users"         },
              { icon: "fa-clipboard-list",label: "Audit Logs",         color: "#F59E0B", href: "/admin/logs"          },
              { icon: "fa-cog",           label: "System Settings",    color: "#9D7FEB", href: "/admin/settings"      },
            ].map((a, i) => (
              <a key={i} href={a.href} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: "0.45rem", padding: "0.9rem 0.5rem", borderRadius: 10, border: `1px solid ${a.color}28`,
                  background: `${a.color}0d`, cursor: "pointer", transition: "all 0.2s",
                }}>
                  <i className={`fas ${a.icon}`} style={{ fontSize: "1.1rem", color: a.color }}></i>
                  <span style={{ fontSize: "0.62rem", color: "var(--mc-text)", fontWeight: 600, textAlign: "center" }}>{a.label}</span>
                </div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </SecretaryLayout>
  );
}
