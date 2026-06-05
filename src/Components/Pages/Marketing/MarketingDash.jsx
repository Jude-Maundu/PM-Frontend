import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import MarketingLayout from "./MarketingLayout";
import { getStoredUser, getDisplayName, getAuthHeaders } from "../../../utils/auth";
import { API_BASE_URL } from "../../../api/apiConfig";

const API = API_BASE_URL;
const accent = "#F59E0B";
const accentSoft = "rgba(245,158,11,0.12)";

// ── Sparkline ─────────────────────────────────────────────────────────────
const Sparkline = ({ values = [], color = "#F59E0B", width = 150, height = 36 }) => {
  if (!values.length) return null;
  const max = Math.max(...values, 1), min = Math.min(...values, 0), range = max - min || 1;
  const pts = values.map((v, i) => ({ x: (i / Math.max(values.length - 1, 1)) * width, y: height - ((v - min) / range) * height * 0.82 + 2 }));
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const area = `${d} L ${width} ${height} L 0 ${height} Z`;
  const gId = `mkt${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gId})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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

// ── Bar Chart ────────────────────────────────────────────────────────────
const BarChart = ({ data, color }) => {
  if (!data || data.length === 0) return (
    <div style={{ textAlign: "center", padding: "1rem 0", color: "var(--mc-text-muted)", fontSize: "0.72rem" }}>
      No chart data
    </div>
  );
  const max = Math.max(...data.map(d => d.val), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: 70 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <div style={{ width: "100%", background: `${color}20`, borderRadius: "3px 3px 0 0", height: 70, display: "flex", alignItems: "flex-end" }}>
            <div style={{ width: "100%", borderRadius: "3px 3px 0 0", height: `${(d.val / max) * 100}%`, background: i === data.length - 1 ? color : `${color}70` }} />
          </div>
          <span style={{ fontSize: "0.52rem", color: "var(--mc-text-muted)" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

const Empty = ({ icon, text }) => (
  <div style={{ textAlign: "center", padding: "1.5rem 0", color: "var(--mc-text-muted)" }}>
    <i className={`fas ${icon}`} style={{ fontSize: "1.5rem", opacity: 0.3, display: "block", marginBottom: "0.5rem" }}></i>
    <span style={{ fontSize: "0.72rem" }}>{text}</span>
  </div>
);

export default function MarketingDash() {
  const storedUser = getStoredUser();
  const name = getDisplayName(storedUser) || "Marketing Lead";
  const [time, setTime] = useState(new Date());

  const [overview,    setOverview]    = useState(null);
  const [revenue,     setRevenue]     = useState([]);
  const [signups,     setSignups]     = useState([]);
  const [topPhotos,   setTopPhotos]   = useState([]);
  const [transactions,setTransactions]= useState([]);
  const [referral,    setReferral]    = useState(null);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchData = useCallback(async () => {
    const headers = getAuthHeaders();
    try {
      setLoading(true);
      const [ovRes, revRes, sigRes, topRes, txRes, refRes] = await Promise.all([
        axios.get(`${API}/admin/analytics/overview`,          { headers }).catch(() => ({ data: {} })),
        axios.get(`${API}/admin/analytics/revenue`,           { headers }).catch(() => ({ data: [] })),
        axios.get(`${API}/admin/analytics/signups`,           { headers }).catch(() => ({ data: [] })),
        axios.get(`${API}/admin/analytics/top-photographers`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API}/payments/admin/receipts`,           { headers }).catch(() => ({ data: [] })),
        axios.get(`${API}/referral/stats`,                    { headers }).catch(() => ({ data: null })),
      ]);
      setOverview(ovRes.data || {});
      setRevenue(Array.isArray(revRes.data) ? revRes.data.slice(-7) : []);
      setSignups(Array.isArray(sigRes.data) ? sigRes.data.slice(-7) : []);
      setTopPhotos(Array.isArray(topRes.data) ? topRes.data.slice(0, 5) : []);
      setTransactions((Array.isArray(txRes.data) ? txRes.data : []).slice(0, 8));
      setReferral(refRes.data || null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalUsers   = overview?.totalUsers   ?? 0;
  const totalRevenue = overview?.totalRevenue ?? 0;
  const totalMedia   = overview?.totalMedia   ?? 0;
  const newUsersMonth = signups.reduce((a, s) => a + (s.count || s.value || 0), 0);

  // Build bar chart data from signups
  const signupChartData = signups.map((s, i) => ({
    label: s.label || s._id || `W${i + 1}`,
    val: s.count || s.value || 0,
  }));

  // Build revenue sparkline from revenue data
  const revenueSparkValues = revenue.map(r => r.total || r.amount || r.value || 0);

  // Revenue total from transactions
  const txRevenue = transactions.reduce((a, t) => a + (t.amount || 0), 0);

  if (loading) {
    return (
      <MarketingLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
          <div className="spinner-border" style={{ color: accent }}></div>
        </div>
      </MarketingLayout>
    );
  }

  return (
    <MarketingLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

        {/* ── Hero Row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.5fr 0.9fr", gap: "1rem" }}>

          {/* Welcome */}
          <div className="mc-card" style={{ background: "linear-gradient(135deg,#3d2500 0%,#1a1000 100%)", border: "1px solid rgba(245,158,11,0.25)" }}>
            <div style={{ fontSize: "0.62rem", color: "rgba(255,220,120,0.5)", marginBottom: "0.4rem" }}>
              <i className="fas fa-clock me-1"></i>
              {time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
            <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "1.15rem", marginBottom: "0.15rem" }}>Hello, {name}!</h3>
            <p style={{ color: "rgba(255,220,120,0.6)", fontSize: "0.74rem", marginBottom: "1rem" }}>
              Platform has <strong style={{ color: "#FCD34D" }}>{totalUsers.toLocaleString()} users</strong> and <strong style={{ color: "#FCD34D" }}>{totalMedia.toLocaleString()} media items</strong>
            </p>
            <div style={{ display: "flex", gap: "1.2rem" }}>
              {[
                { label: "Users",   value: totalUsers,                          color: "#4CC9A6" },
                { label: "Revenue", value: `KES ${totalRevenue.toLocaleString()}`, color: accent    },
                { label: "Media",   value: totalMedia,                          color: "#5B7FE5" },
              ].map(m => (
                <div key={m.label}>
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: "0.56rem", color: "rgba(255,220,120,0.4)" }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* User Signups Bar Chart */}
          <div className="mc-card">
            <div className="mc-card-header mb-2">
              <span className="mc-card-title">USER GROWTH (SIGNUPS)</span>
              <span className="mc-card-badge" style={{ background: accentSoft, color: accent }}>
                {newUsersMonth > 0 ? `+${newUsersMonth} this period` : "Live"}
              </span>
            </div>
            <BarChart data={signupChartData} color={accent} />
            {signupChartData.length === 0 && <Empty icon="fa-chart-bar" text="No signup data yet" />}
            {newUsersMonth > 0 && (
              <div style={{ marginTop: "0.6rem" }}>
                <div style={{ fontSize: "1.4rem", fontWeight: 700, color: accent }}>+{newUsersMonth}</div>
                <div style={{ fontSize: "0.62rem", color: "var(--mc-text-muted)" }}>new signups in this period</div>
              </div>
            )}
          </div>

          {/* Revenue Donut */}
          <div className="mc-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            <div className="mc-card-header mb-1" style={{ width: "100%" }}>
              <span className="mc-card-title">PLATFORM REVENUE</span>
            </div>
            <Donut pct={Math.min(99, totalRevenue > 0 ? 80 : 0)} size={80} color={accent} label={totalRevenue > 0 ? `KES\n${(totalRevenue / 1000).toFixed(0)}K` : "—"} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>KES {totalRevenue.toLocaleString()}</div>
              <div style={{ fontSize: "0.6rem", color: "var(--mc-text-muted)" }}>total platform revenue</div>
            </div>
          </div>
        </div>

        {/* ── Key Metrics ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem" }}>
          {[
            { icon: "fa-users",        label: "Total Users",      value: totalUsers.toLocaleString(),          sub: "registered accounts",      spark: null,                  color: "#4CC9A6" },
            { icon: "fa-dollar-sign",  label: "Total Revenue",    value: `KES ${totalRevenue.toLocaleString()}`,sub: "platform earnings",        spark: revenueSparkValues,    color: accent    },
            { icon: "fa-photo-video",  label: "Media Items",      value: totalMedia.toLocaleString(),           sub: "photos & albums",          spark: null,                  color: "#5B7FE5" },
            { icon: "fa-gift",         label: "Referral Code",    value: referral?.myCode || "—",               sub: referral ? `${referral.referralCount || 0} referrals` : "No referral data", spark: null, color: "#F06B8D" },
          ].map((c, i) => (
            <div key={i} className="mc-card" style={{ borderTop: `3px solid ${c.color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.2rem" }}>
                <span style={{ fontSize: "0.67rem", color: "var(--mc-text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{c.label}</span>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: `${c.color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className={`fas ${c.icon}`} style={{ fontSize: "0.72rem", color: c.color }}></i>
                </span>
              </div>
              <div style={{ fontSize: c.value.length > 8 ? "1.4rem" : "2rem", fontWeight: 700 }}>{c.value}</div>
              <div style={{ fontSize: "0.63rem", color: "var(--mc-text-muted)", marginTop: "0.1rem", marginBottom: c.spark ? "0.45rem" : 0 }}>{c.sub}</div>
              {c.spark && c.spark.length > 0 && <Sparkline values={c.spark} color={c.color} />}
            </div>
          ))}
        </div>

        {/* ── Recent Transactions · Top Photographers ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "1rem" }}>

          {/* Recent Transactions */}
          <div className="mc-card" style={{ overflow: "hidden" }}>
            <div className="mc-card-header mb-2">
              <span className="mc-card-title">RECENT TRANSACTIONS (REVENUE)</span>
              <span className="mc-card-badge" style={{ background: "rgba(76,201,166,0.12)", color: "#4CC9A6" }}>
                KES {txRevenue.toLocaleString()}
              </span>
            </div>
            {transactions.length === 0 ? (
              <Empty icon="fa-exchange-alt" text="No transaction data available" />
            ) : (
              <div style={{ fontSize: "0.67rem", overflowX: "auto" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 0.8fr 0.8fr 0.9fr", gap: "4px", padding: "3px 0 6px", borderBottom: "1px solid rgba(255,255,255,0.08)", color: "var(--mc-text-muted)", fontWeight: 700, textTransform: "uppercase", fontSize: "0.57rem", letterSpacing: "0.04em" }}>
                  <span>User</span><span>Email</span><span>Amount</span><span>Type</span><span>Date</span>
                </div>
                {transactions.map((t, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 0.8fr 0.8fr 0.9fr", gap: "4px", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center" }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.user?.username || t.userId?.username || "—"}
                    </span>
                    <span style={{ color: "var(--mc-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.user?.email || t.userId?.email || "—"}
                    </span>
                    <span style={{ color: "#4CC9A6", fontWeight: 600 }}>KES {(t.amount || 0).toLocaleString()}</span>
                    <span style={{ color: "var(--mc-text-muted)" }}>{t.type || "—"}</span>
                    <span style={{ color: "var(--mc-text-muted)" }}>
                      {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "—"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Photographers */}
          <div className="mc-card">
            <div className="mc-card-header mb-2">
              <span className="mc-card-title">TOP PHOTOGRAPHERS</span>
              <span className="mc-card-badge" style={{ background: accentSoft, color: accent }}>
                by sales
              </span>
            </div>
            {topPhotos.length === 0 ? (
              <Empty icon="fa-camera" text="No photographer data yet" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                {topPhotos.map((p, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.35rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                      background: i === 0 ? `${accent}30` : accentSoft,
                      display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.7rem", color: accent,
                    }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.72rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.photographer?.username || p.username || p.name || "Photographer"}
                      </div>
                      <div style={{ fontSize: "0.6rem", color: "var(--mc-text-muted)" }}>
                        {p.totalSales > 0 ? `KES ${p.totalSales.toLocaleString()}` : `${p.count || 0} sales`}
                      </div>
                    </div>
                    {i === 0 && <i className="fas fa-crown" style={{ color: accent, fontSize: "0.7rem" }}></i>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Revenue Analytics · Referral ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "1rem" }}>

          {/* Revenue by Period */}
          <div className="mc-card">
            <div className="mc-card-header mb-2">
              <span className="mc-card-title">REVENUE ANALYTICS</span>
            </div>
            {revenue.length === 0 ? (
              <Empty icon="fa-chart-line" text="No revenue analytics data yet" />
            ) : (
              <>
                <div style={{ marginBottom: "0.75rem" }}>
                  <BarChart
                    data={revenue.map((r, i) => ({ label: r.label || r._id || `P${i + 1}`, val: r.total || r.amount || 0 }))}
                    color={accent}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  {revenue.slice(-4).map((r, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "0.25rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: "0.68rem" }}>
                      <span style={{ color: "var(--mc-text-muted)" }}>{r.label || r._id || `Period ${i + 1}`}</span>
                      <span style={{ fontWeight: 700, color: accent }}>KES {(r.total || r.amount || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Referral Stats */}
          <div className="mc-card">
            <div className="mc-card-header mb-2">
              <span className="mc-card-title">REFERRAL STATS</span>
            </div>
            {!referral ? (
              <Empty icon="fa-gift" text="No referral data available" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ padding: "0.75rem", borderRadius: 10, background: accentSoft, border: `1px solid ${accent}25`, textAlign: "center" }}>
                  <div style={{ fontSize: "0.65rem", color: "var(--mc-text-muted)", marginBottom: "0.2rem" }}>Your Referral Code</div>
                  <div style={{ fontSize: "1.3rem", fontWeight: 700, fontFamily: "monospace", color: accent }}>
                    {referral.myCode || "—"}
                  </div>
                </div>
                {[
                  { label: "Total Referrals",  value: referral.referralCount ?? 0,         color: "#4CC9A6" },
                  { label: "Referral Earnings", value: `KES ${(referral.totalEarnings ?? 0).toLocaleString()}`, color: accent },
                  { label: "Pending Payout",   value: `KES ${(referral.pendingEarnings ?? 0).toLocaleString()}`, color: "#F06B8D" },
                ].map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "0.35rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize: "0.68rem", color: "var(--mc-text-muted)" }}>{r.label}</span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: r.color }}>{r.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="mc-card">
          <div className="mc-card-header mb-3">
            <span className="mc-card-title">MARKETING QUICK ACTIONS</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "0.75rem" }}>
            {[
              { icon: "fa-chart-bar",      label: "Analytics",         color: accent,    href: "/admin/analytics"   },
              { icon: "fa-exchange-alt",   label: "Transactions",      color: "#4CC9A6", href: "/admin/transactions" },
              { icon: "fa-users",          label: "Users",             color: "#5B7FE5", href: "/admin/users"        },
              { icon: "fa-camera",         label: "Photographers",     color: "#F06B8D", href: "/admin/photographers"},
              { icon: "fa-globe",          label: "Portfolios",        color: "#9D7FEB", href: "/admin/portfolios"   },
              { icon: "fa-wallet",         label: "Wallets",           color: "#F59E0B", href: "/admin/wallets"      },
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
    </MarketingLayout>
  );
}
