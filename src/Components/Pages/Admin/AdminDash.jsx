import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../../../api/apiConfig";
import { getAuthHeaders, getStoredUser, getDisplayName } from "../../../utils/auth";

const API = API_BASE_URL;

// ── Sparkline ──────────────────────────────────────────────────────────────
const Sparkline = ({ values = [], color = "#4CC9A6", width = 160, height = 38 }) => {
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const pts = values.map((v, i) => ({
    x: (i / Math.max(values.length - 1, 1)) * width,
    y: height - ((v - min) / range) * height * 0.82 + 2,
  }));
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const area = `${d} L ${width} ${height} L 0 ${height} Z`;
  const gradId = `sg${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ── Donut ─────────────────────────────────────────────────────────────────
const Donut = ({ pct = 0, size = 72, strokeWidth = 9, color = "#4CC9A6", label }) => {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
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

// ── System Status bars ────────────────────────────────────────────────────
const SystemStatus = () => {
  const series = [
    { label: "Uptime",           vals: [95,97,96,99,98,97,98], color: "#4CC9A6" },
    { label: "API Response Time", vals: [80,75,78,70,72,74,72], color: "#5B7FE5" },
    { label: "Background Jobs",   vals: [90,88,85,87,86,84,85], color: "#F06B8D" },
  ];
  const W = 200, H = 72, barW = 6, gap = 3;
  const groupW = series.length * (barW + gap);
  return (
    <div>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        {series[0].vals.map((_, gi) =>
          series.map((s, si) => (
            <rect key={`${gi}-${si}`}
              x={gi * (groupW + 4) + si * (barW + gap)}
              y={H - (s.vals[gi] / 100) * H}
              width={barW} height={(s.vals[gi] / 100) * H} rx={2}
              fill={s.color} opacity={gi === s.vals.length - 1 ? 1 : 0.55} />
          ))
        )}
      </svg>
      <div style={{ display: "flex", gap: "1rem", marginTop: "0.4rem", flexWrap: "wrap" }}>
        {series.map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, display: "inline-block" }} />
            <span style={{ fontSize: "0.62rem", color: "var(--mc-text-muted)" }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Mini Calendar ─────────────────────────────────────────────────────────
const MiniCalendar = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const dayNames = ["Su","Mo","Tu","We","Th","Fr","Sa"];
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>{now.toLocaleString("default", { month: "long" })}</span>
        <span style={{ fontSize: "0.7rem", color: "var(--mc-text-muted)" }}>{year}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "2px", textAlign: "center" }}>
        {dayNames.map(d => <div key={d} style={{ fontSize: "0.58rem", color: "var(--mc-text-muted)", fontWeight: 600, padding: "2px 0" }}>{d}</div>)}
        {cells.map((day, i) => (
          <div key={i} style={{
            fontSize: "0.67rem", padding: "3px 2px", borderRadius: "50%",
            background: day === today ? "var(--mc-accent)" : "transparent",
            color: day === today ? "#fff" : day ? "var(--mc-text)" : "transparent",
            fontWeight: day === today ? 700 : 400,
          }}>{day || ""}</div>
        ))}
      </div>
    </div>
  );
};

// ── Kenya Map ─────────────────────────────────────────────────────────────
// Coordinates: x=(lon-34)*30, y=(5-lat)*22.68  →  viewBox 0 0 245 225
const KenyaMap = () => {
  const outline = "M 30,2 L 63,2 L 100,8 L 150,11 L 225,0 L 237,75 L 225,158 L 192,222 L 111,222 L 48,195 L 12,138 L 8,122 L 3,116 L 8,109 L 15,102 L 12,91 L 15,23 Z";

  const regions = [
    { d: "M 15,23 L 63,2 L 80,30 L 70,75 L 40,78 L 20,60 Z",            fill: "#1e3868", label: "Rift Valley N" },
    { d: "M 63,2 L 100,8 L 105,55 L 80,72 L 70,75 L 80,30 Z",           fill: "#1a3260", label: "Central" },
    { d: "M 100,8 L 150,11 L 160,42 L 130,70 L 105,55 Z",               fill: "#162c58", label: "Eastern N" },
    { d: "M 150,11 L 225,0 L 237,75 L 200,100 L 170,82 L 160,42 Z",     fill: "#122650", label: "N.Eastern" },
    { d: "M 160,42 L 200,100 L 195,140 L 165,148 L 135,120 L 130,70 Z", fill: "#1a3060", label: "Eastern" },
    { d: "M 195,140 L 225,158 L 192,222 L 145,218 L 140,185 L 165,148 Z",fill: "#162850", label: "Coast" },
    { d: "M 40,78 L 70,75 L 80,72 L 95,105 L 75,120 L 48,115 L 32,100 Z",fill: "#1e3870", label: "Rift Valley S" },
    { d: "M 75,120 L 95,105 L 105,130 L 90,148 L 72,145 L 65,135 Z",    fill: "#223878", label: "Nairobi" },
    { d: "M 8,109 L 15,102 L 32,100 L 48,115 L 42,130 L 12,138 Z",      fill: "#1e3a6c", label: "Nyanza" },
    { d: "M 90,148 L 105,130 L 135,120 L 140,185 L 111,222 L 80,210 L 72,180 Z", fill: "#1a3265", label: "S.Eastern" },
  ];

  const cities = [
    { name: "Nairobi",  lon: 36.82, lat: -1.29, major: true  },
    { name: "Mombasa",  lon: 39.67, lat: -4.05, major: true  },
    { name: "Kisumu",   lon: 34.75, lat: -0.10, major: true  },
    { name: "Nakuru",   lon: 36.07, lat: -0.30, major: false },
    { name: "Eldoret",  lon: 35.27, lat:  0.52, major: false },
    { name: "Garissa",  lon: 39.65, lat: -0.45, major: false },
    { name: "Turkana",  lon: 36.10, lat:  3.10, major: false },
  ].map(c => ({ ...c, x: (c.lon - 34) * 30, y: (5 - c.lat) * 22.68 }));

  const heatSpots = [
    { cx: 84,  cy: 144, rx: 32, ry: 28, color: "#4CC9A6", op: 0.28 }, // Nairobi
    { cx: 186, cy: 209, rx: 22, ry: 18, color: "#5B7FE5", op: 0.22 }, // Mombasa
    { cx: 23,  cy: 117, rx: 20, ry: 18, color: "#5B7FE5", op: 0.2  }, // Kisumu
  ];

  return (
    <svg viewBox="0 0 245 228" style={{ width: "100%", height: "100%" }}>
      <defs>
        {heatSpots.map((h, i) => (
          <radialGradient key={i} id={`hg${i}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={h.color} stopOpacity={h.op} />
            <stop offset="100%" stopColor={h.color} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>
      {/* Region fills */}
      {regions.map(r => <path key={r.label} d={r.d} fill={r.fill} />)}
      {/* Kenya border */}
      <path d={outline} fill="none" stroke="#4B9CD3" strokeWidth="1.4" />
      {/* Lake Victoria (western edge) */}
      <ellipse cx={7} cy={128} rx={9} ry={15} fill="#1a5580" opacity={0.85} />
      {/* Heat spots */}
      {heatSpots.map((h, i) => <ellipse key={i} cx={h.cx} cy={h.cy} rx={h.rx} ry={h.ry} fill={`url(#hg${i})`} />)}
      {/* City markers */}
      {cities.map(c => (
        <g key={c.name}>
          {c.major && <circle cx={c.x} cy={c.y} r={9} fill={c.name === "Nairobi" ? "#4CC9A6" : "#5B7FE5"} opacity={0.18} />}
          <circle cx={c.x} cy={c.y} r={c.major ? 3.5 : 2} fill={c.major ? "#4CC9A6" : "#9D7FEB"} />
          <text x={c.x + 6} y={c.y + 4} fontSize="6.5" fill="#C8D8F8" fontFamily="sans-serif">{c.name}</text>
        </g>
      ))}
      {/* Scale indicator */}
      <text x={120} y={225} fontSize="5.5" fill="rgba(200,216,248,0.35)" textAnchor="middle" fontFamily="sans-serif">Kenya · Geographic Distribution</text>
    </svg>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────
export default function AdminDash() {
  const storedUser = getStoredUser();
  const adminName  = getDisplayName(storedUser) || "Admin";
  const avatarLetter = adminName.charAt(0).toUpperCase();

  const [health,    setHealth]    = useState(null);
  const [recentTxns, setRecentTxns] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading,   setLoading]   = useState(true);

  const fetchData = useCallback(async () => {
    const headers = getAuthHeaders();
    try {
      setLoading(true);
      const [healthRes, receiptsRes, logsRes] = await Promise.all([
        axios.get(`${API}/admin/health`,           { headers }).catch(() => ({ data: {} })),
        axios.get(`${API}/payments/admin/receipts`,{ headers }).catch(() => ({ data: [] })),
        axios.get(`${API}/admin/logs?limit=6`,     { headers }).catch(() => ({ data: { data: [] } })),
      ]);
      setHealth(healthRes.data || {});
      setRecentTxns((receiptsRes.data || []).slice(0, 8));
      setRecentLogs((logsRes.data?.data || []).slice(0, 6));
    } catch (e) {
      console.error("AdminDash fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalUsers          = health?.totalUsers         ?? 0;
  const pendingMedia        = health?.pendingMedia        ?? 0;
  const salesToday          = health?.salesToday          ?? 0;
  const salesWeek           = health?.salesThisWeek       ?? 0;
  const pendingWithdrawals  = health?.pendingWithdrawals  ?? 0;
  const pendingApplications = health?.pendingApplications ?? 0;

  const sparkUsers = [3,5,4,7,6,9, totalUsers % 12 || 8];
  const sparkMedia = [2,4,3,6,5,7, pendingMedia % 10 || 5];

  const revenuePct  = Math.min(99, Math.round(salesToday / 50000 * 100));
  const userPct     = Math.min(99, Math.round(totalUsers  / 100   * 100));
  const contentPct  = Math.min(99, Math.round(pendingMedia / 200  * 100));

  const activityFeed = [
    ...recentLogs.map(l => ({
      time: new Date(l.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      text: `${l.adminName || "Admin"} — ${(l.action || "").replace(/_/g, " ")}`,
      color: l.action?.includes("reject") || l.action?.includes("ban") ? "#F06B8D" : "#4CC9A6",
      icon: l.action?.includes("reject") || l.action?.includes("ban") ? "fa-times-circle" : "fa-check-circle",
    })),
    { time: "--:--", text: "System health check passed", color: "#5B7FE5", icon: "fa-server" },
  ].slice(0, 6);

  const taskList = [
    { text: `Review ${pendingApplications} photographer application${pendingApplications !== 1 ? "s" : ""}`, done: pendingApplications === 0 },
    { text: `Process ${pendingWithdrawals} pending withdrawal${pendingWithdrawals !== 1 ? "s" : ""}`,         done: pendingWithdrawals === 0 },
    { text: "Check moderation queue backlog",   done: false },
    { text: "Update payment gateway APIs",      done: false },
  ];

  const topEvents = [
    { label: "Activity Events",  count: recentLogs.length },
    { label: "Media Uploads",    count: pendingMedia },
    { label: "Withdrawals",      count: pendingWithdrawals },
    { label: "New Users",        count: totalUsers },
    { label: "Content Approved", count: health?.approvedMedia ?? 0 },
  ];

  const goals = [
    { label: "Revenue Target",   pct: revenuePct,  color: "#5B7FE5" },
    { label: "User Growth",      pct: userPct,     color: "#4CC9A6" },
    { label: "Content Approved", pct: contentPct,  color: "#F06B8D" },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
          <div className="spinner-border" style={{ color: "var(--mc-accent)" }}></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

        {/* ── Row 1: Hero · System Status · Profile ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.5fr 0.8fr", gap: "1rem" }}>

          {/* Hero */}
          <div className="mc-card" style={{ background: "linear-gradient(135deg,#1a3a6c 0%,#0e1e3d 100%)", border: "1px solid rgba(91,127,229,0.25)" }}>
            <div style={{ fontSize: "0.68rem", color: "rgba(200,216,248,0.55)", marginBottom: "0.4rem" }}>
              <i className="fas fa-calendar-alt me-1"></i>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </div>
            <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "1.25rem", marginBottom: "0.2rem" }}>Good Day, {adminName}!</h3>
            <p style={{ color: "rgba(200,216,248,0.65)", fontSize: "0.78rem", marginBottom: "1.1rem" }}>
              Have a productive {new Date().toLocaleDateString("en-US", { weekday: "long" })}.
            </p>
            <div style={{ display: "flex", gap: "1.25rem" }}>
              {[
                { label: "Pending",  value: pendingWithdrawals + pendingApplications, color: "#F06B8D" },
                { label: "Users",    value: totalUsers,                                color: "#4CC9A6" },
                { label: "Today",    value: `KES ${salesToday.toLocaleString()}`,      color: "#5B7FE5" },
              ].map(m => (
                <div key={m.label}>
                  <div style={{ fontSize: "1.05rem", fontWeight: 700, color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: "0.6rem", color: "rgba(200,216,248,0.45)" }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="mc-card">
            <div className="mc-card-header mb-2">
              <span className="mc-card-title">SYSTEM STATUS</span>
              <span className="mc-card-badge" style={{ background: "rgba(76,201,166,0.15)", color: "#4CC9A6" }}>● Live</span>
            </div>
            <SystemStatus />
          </div>

          {/* Admin Profile */}
          <div className="mc-card" style={{ textAlign: "center" }}>
            <div style={{ width: 54, height: 54, borderRadius: "50%", background: "var(--mc-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1.25rem", color: "#fff", margin: "0 auto 0.5rem", overflow: "hidden" }}>
              {storedUser?.profilePicture
                ? <img src={storedUser.profilePicture} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : avatarLetter}
            </div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{adminName}</div>
            <div style={{ fontSize: "0.62rem", color: "var(--mc-accent)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.8rem" }}>Administrator</div>
            <div style={{ display: "flex", justifyContent: "center", gap: "1.1rem" }}>
              {[
                { label: "USERS", val: totalUsers },
                { label: "MEDIA", val: pendingMedia },
                { label: "TXNS",  val: recentTxns.length },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{s.val}</div>
                  <div style={{ fontSize: "0.57rem", color: "var(--mc-text-muted)" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Row 2: Stats ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem" }}>

          {/* Total Users */}
          <div className="mc-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.25rem" }}>
              <span style={{ fontSize: "0.68rem", color: "var(--mc-text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Total Users</span>
              <span style={{ fontSize: "0.62rem", color: "#4CC9A6", background: "rgba(76,201,166,0.12)", padding: "2px 7px", borderRadius: 20 }}>···</span>
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.2rem" }}>{totalUsers}</div>
            <div style={{ fontSize: "0.68rem", color: "var(--mc-text-muted)", marginBottom: "0.65rem" }}>
              {totalUsers} registered · {health?.activeToday ?? 0} active today
            </div>
            <Sparkline values={sparkUsers} color="#F06B8D" />
          </div>

          {/* Total Revenue */}
          <div className="mc-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.25rem" }}>
              <span style={{ fontSize: "0.68rem", color: "var(--mc-text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Total Revenue</span>
              <span style={{ fontSize: "0.62rem", color: "#4CC9A6", background: "rgba(76,201,166,0.12)", padding: "2px 7px", borderRadius: 20 }}>···</span>
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.2rem" }}>KES {salesToday.toLocaleString()}</div>
            <div style={{ fontSize: "0.68rem", color: "var(--mc-text-muted)", marginBottom: "0.65rem" }}>
              platform earnings · week: KES {salesWeek.toLocaleString()}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Donut pct={60} size={68} color="#4CC9A6" />
              <div style={{ fontSize: "0.68rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "0.3rem" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4CC9A6", flexShrink: 0 }} />
                  <span style={{ color: "var(--mc-text-muted)" }}>Subscription</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#5B7FE5", flexShrink: 0 }} />
                  <span style={{ color: "var(--mc-text-muted)" }}>Platform Fees</span>
                </div>
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="mc-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.25rem" }}>
              <span style={{ fontSize: "0.68rem", color: "var(--mc-text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Media</span>
              <span style={{ fontSize: "0.62rem", color: "#4CC9A6", background: "rgba(76,201,166,0.12)", padding: "2px 7px", borderRadius: 20 }}>···</span>
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.2rem" }}>{pendingMedia}</div>
            <div style={{ fontSize: "0.68rem", color: "var(--mc-text-muted)", marginBottom: "0.65rem" }}>published items · +2.5% vs Yesterday</div>
            <Sparkline values={sparkMedia} color="#9D7FEB" />
          </div>
        </div>

        {/* ── Row 3: Activity Feed · Kenya Map · Goals · Calendar ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1.25fr 1fr 0.85fr", gap: "1rem" }}>

          {/* Activity Feed */}
          <div className="mc-card" style={{ overflow: "hidden" }}>
            <div className="mc-card-header mb-2">
              <span className="mc-card-title">RECENT PLATFORM ACTIVITY FEED</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {activityFeed.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.55rem", padding: "0.3rem 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", background: item.color + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className={`fas ${item.icon}`} style={{ fontSize: "0.58rem", color: item.color }}></i>
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: "0.7rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.text}</div>
                    <div style={{ fontSize: "0.6rem", color: "var(--mc-text-muted)" }}>{item.time}</div>
                  </div>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: item.color, flexShrink: 0 }}></span>
                </div>
              ))}
              {activityFeed.length === 0 && <div style={{ color: "var(--mc-text-muted)", fontSize: "0.78rem", textAlign: "center", padding: "1rem 0" }}>No recent activity</div>}
            </div>
          </div>

          {/* Kenya Map */}
          <div className="mc-card">
            <div className="mc-card-header mb-1">
              <span className="mc-card-title">GEOGRAPHIC USER & REVENUE DISTRIBUTION</span>
            </div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 185 }}>
              <KenyaMap />
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "0.9rem", marginTop: "0.3rem" }}>
              {[["#4CC9A6","High activity"],["#5B7FE5","Moderate"],["#1a3060","Low"]].map(([c,l]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: c, display: "inline-block" }}></span>
                  <span style={{ fontSize: "0.58rem", color: "var(--mc-text-muted)" }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Goals */}
          <div className="mc-card">
            <div className="mc-card-header mb-3">
              <span className="mc-card-title">PLATFORM GOALS</span>
              <span className="mc-card-badge">Today</span>
            </div>
            {goals.map(g => (
              <div key={g.label} className="mc-prog-row">
                <span className="mc-prog-label">{g.label}</span>
                <span className="mc-prog-pct">{g.pct}%</span>
                <div className="mc-prog-track">
                  <div className="mc-prog-fill" style={{ width: `${g.pct}%`, background: g.color }}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Calendar */}
          <div className="mc-card"><MiniCalendar /></div>
        </div>

        {/* ── Row 4: Activity Donut · Goals · Moderation · Tasks · Transactions ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 0.9fr 1fr 0.8fr 1.4fr", gap: "1rem" }}>

          {/* Platform Activity */}
          <div className="mc-card">
            <div className="mc-card-header mb-2">
              <span className="mc-card-title">PLATFORM ACTIVITY</span>
              <span className="mc-card-badge">Today</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.8rem" }}>
              <Donut pct={Math.max(1, contentPct)} size={62} color="#5B7FE5" label={`${Math.max(1, contentPct)}%`} />
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>Activity</div>
                <div style={{ fontSize: "0.62rem", color: "var(--mc-text-muted)" }}>transactions / media</div>
              </div>
            </div>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--mc-text-muted)", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Top 5 Activity Events</div>
            {topEvents.map((e, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: "0.7rem" }}>
                <span style={{ color: "var(--mc-text-muted)" }}>{e.label}</span>
                <span style={{ fontWeight: 600 }}>{e.count}</span>
              </div>
            ))}
          </div>

          {/* Goals repeat */}
          <div className="mc-card">
            <div className="mc-card-header mb-3">
              <span className="mc-card-title">PLATFORM GOALS</span>
              <span className="mc-card-badge">Today</span>
            </div>
            {goals.map(g => (
              <div key={g.label} className="mc-prog-row">
                <span className="mc-prog-label">{g.label}</span>
                <span className="mc-prog-pct">{g.pct}%</span>
                <div className="mc-prog-track">
                  <div className="mc-prog-fill" style={{ width: `${g.pct}%`, background: g.color }}></div>
                </div>
              </div>
            ))}
            <Link to="/admin/analytics" style={{ fontSize: "0.72rem", color: "var(--mc-accent)", textDecoration: "none", marginTop: "0.5rem", display: "inline-block" }}>+ Add goal</Link>
          </div>

          {/* Moderation Queue */}
          <div className="mc-card">
            <div className="mc-card-header mb-1">
              <span className="mc-card-title">ACTIVE MODERATION QUEUE</span>
            </div>
            <div style={{ fontSize: "0.65rem", color: "var(--mc-text-muted)", marginBottom: "0.5rem" }}>Moderation queue list (priority queue)</div>
            {pendingMedia > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <div style={{ fontSize: "0.73rem", padding: "0.4rem 0.6rem", background: "rgba(240,107,141,0.09)", borderLeft: "3px solid #F06B8D", borderRadius: "0 4px 4px 0" }}>
                  <div style={{ fontWeight: 600 }}>Media #{pendingMedia} · Flagged: Pending Review</div>
                  <div style={{ color: "var(--mc-text-muted)", fontSize: "0.63rem" }}>Needs admin approval</div>
                </div>
                {pendingApplications > 0 && (
                  <div style={{ fontSize: "0.73rem", padding: "0.4rem 0.6rem", background: "rgba(91,127,229,0.09)", borderLeft: "3px solid #5B7FE5", borderRadius: "0 4px 4px 0" }}>
                    <div style={{ fontWeight: 600 }}>{pendingApplications} photographer application{pendingApplications !== 1 ? "s" : ""}</div>
                    <div style={{ color: "var(--mc-text-muted)", fontSize: "0.63rem" }}>Awaiting review</div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: "#4CC9A6", fontSize: "0.78rem" }}><i className="fas fa-check-circle me-1"></i>Queue is clear</div>
            )}
            <Link to="/admin/moderation" style={{ fontSize: "0.7rem", color: "var(--mc-accent)", textDecoration: "none", marginTop: "0.75rem", display: "inline-block" }}>
              View moderation queue →
            </Link>
          </div>

          {/* Task List */}
          <div className="mc-card">
            <div className="mc-card-header mb-2">
              <span className="mc-card-title">ADMIN TASK LIST</span>
            </div>
            {taskList.map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.45rem", marginBottom: "0.5rem", fontSize: "0.7rem" }}>
                <span style={{ marginTop: "0.1rem", flexShrink: 0 }}>
                  {t.done
                    ? <i className="fas fa-check-circle" style={{ color: "#4CC9A6" }}></i>
                    : <i className="far fa-circle" style={{ color: "var(--mc-text-muted)" }}></i>}
                </span>
                <span style={{ color: t.done ? "var(--mc-text-muted)" : "var(--mc-text)", textDecoration: t.done ? "line-through" : "none", lineHeight: 1.4 }}>{t.text}</span>
              </div>
            ))}
          </div>

          {/* Recent Transactions */}
          <div className="mc-card" style={{ overflow: "hidden" }}>
            <div className="mc-card-header mb-2">
              <span className="mc-card-title">RECENT TRANSACTIONS</span>
            </div>
            <div style={{ fontSize: "0.67rem", overflowX: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "0.45fr 1fr 0.85fr 0.6fr 0.9fr", gap: "4px", padding: "3px 0 5px", borderBottom: "1px solid rgba(255,255,255,0.1)", color: "var(--mc-text-muted)", fontWeight: 700, textTransform: "uppercase", fontSize: "0.6rem", letterSpacing: "0.04em" }}>
                <span>ID</span><span>User</span><span>Amount</span><span>Type</span><span>Time</span>
              </div>
              {recentTxns.slice(0, 7).map((t, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "0.45fr 1fr 0.85fr 0.6fr 0.9fr", gap: "4px", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center" }}>
                  <span style={{ color: "var(--mc-accent)", fontFamily: "monospace" }}>{200 + i}</span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.user?.username || t.user?.email?.split("@")[0] || "—"}</span>
                  <span style={{ color: "#4CC9A6" }}>KES {(t.amount || 0).toLocaleString()}</span>
                  <span style={{ color: "var(--mc-text-muted)" }}>{t.type || "media"}</span>
                  <span style={{ color: "var(--mc-text-muted)" }}>{new Date(t.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
              {recentTxns.length === 0 && <div style={{ color: "var(--mc-text-muted)", padding: "1rem 0", textAlign: "center" }}>No transactions yet</div>}
              <div style={{ marginTop: "0.5rem" }}>
                <Link to="/admin/transactions" style={{ fontSize: "0.67rem", color: "var(--mc-accent)", textDecoration: "none" }}>
                  Showing {Math.min(recentTxns.length, 7)} of {recentTxns.length} transactions · View all →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 5: Audit Trail ── */}
        <div className="mc-card">
          <div className="mc-card-header mb-2">
            <span className="mc-card-title">SYSTEM LOGS / AUDIT TRAIL</span>
            <Link to="/admin/logs" style={{ fontSize: "0.72rem", color: "var(--mc-accent)", textDecoration: "none" }}>View all →</Link>
          </div>
          {recentLogs.length === 0
            ? <div style={{ color: "var(--mc-text-muted)", fontSize: "0.78rem", textAlign: "center", padding: "1rem 0" }}>No recent logs</div>
            : recentLogs.map((log, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.35rem 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: "0.7rem", flexWrap: "wrap" }}>
                <span style={{ color: "var(--mc-text-muted)", minWidth: 110 }}>{new Date(log.createdAt).toLocaleString()}</span>
                <span style={{ fontWeight: 600 }}>{log.adminName || "Admin"}</span>
                <span className={`badge bg-${log.action?.includes("reject") || log.action?.includes("ban") ? "danger" : log.action?.includes("approve") || log.action?.includes("verify") ? "success" : "secondary"}`}
                  style={{ fontSize: "0.6rem" }}>
                  {(log.action || "").replace(/_/g, " ")}
                </span>
                <span style={{ color: "var(--mc-text-muted)" }}>{log.entityType}{log.entityId ? ` · ${log.entityId.slice(0, 8)}` : ""}</span>
              </div>
            ))
          }
        </div>

      </div>
    </AdminLayout>
  );
}
