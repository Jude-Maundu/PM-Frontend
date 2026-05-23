import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../../../api/apiConfig";
import { getAuthHeaders } from "../../../utils/auth";

const API = API_BASE_URL;

const AdminDash = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalUsers: 0,
    totalMedia: 0,
    totalTransactions: 0,
    pendingRefunds: 0,
    photographerEarnings: 0,
    platformFees: 0,
  });
  const [health, setHealth] = useState(null);
  const [recentReceipts, setRecentReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    const headers = getAuthHeaders();
    try {
      setLoading(true);

      const [healthRes, dashboardRes, receiptsRes] = await Promise.all([
        axios.get(`${API}/admin/health`, { headers }).catch(() => ({ data: {} })),
        axios.get(`${API}/payments/admin/dashboard`, { headers }).catch(() => ({ data: {} })),
        axios.get(`${API}/payments/admin/receipts`, { headers }).catch(() => ({ data: [] })),
      ]);

      const h = healthRes.data || {};
      setHealth(h);

      const receipts = receiptsRes.data || [];
      setRecentReceipts(receipts.slice(0, 5));

      const dashboardStats = dashboardRes.data?.stats || {};
      const totalRevenue = dashboardStats.totalRevenue ?? receipts.reduce((sum, r) => sum + (r.amount || 0), 0);
      const totalTransactions = dashboardStats.totalSales ?? receipts.length;
      const totalUsers = h.totalUsers ?? (dashboardStats.totalBuyers + dashboardStats.totalPhotographers + dashboardStats.totalAdmins) ?? 0;
      const pendingRefunds = dashboardStats.pendingRefunds ?? 0;
      const photographerEarnings = dashboardStats.totalPhotographerEarnings ?? totalRevenue * 0.7;
      const platformFees = totalRevenue - photographerEarnings;

      setStats({
        totalRevenue,
        totalUsers,
        totalMedia: h.pendingMedia ?? dashboardStats.totalMedia ?? 0,
        totalTransactions,
        pendingRefunds,
        photographerEarnings,
        platformFees,
      });

    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatKES = (amount) => {
    return `KES ${amount?.toLocaleString() || 0}`;
  };

  // ── Shared helper components ──────────────────────────────────────────────

  const Sparkline = ({ values = [], color = "#5B7FE5" }) => {
    if (!values.length) return null;
    const max = Math.max(...values, 1);
    const min = Math.min(...values);
    const range = max - min || 1;
    const W = 80, H = 32;
    const pts = values.map((v, i) => ({
      x: (i / Math.max(values.length - 1, 1)) * W,
      y: H - ((v - min) / range) * H * 0.85 + 2,
    }));
    const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
        <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  const MiniCalendar = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push({ day: "", other: true });
    for (let d = 1; d <= daysInMonth; d++) days.push({ day: d, isToday: d === today });
    const dayNames = ["Su","Mo","Tu","We","Th","Fr","Sa"];
    const monthName = now.toLocaleString("default", { month: "long" });
    return (
      <div>
        <div className="mc-cal-header">
          <span className="mc-cal-month">{monthName}</span>
          <span style={{ fontSize: "0.72rem", color: "var(--mc-text-muted)" }}>{year}</span>
        </div>
        <div className="mc-cal-grid">
          {dayNames.map(d => <div key={d} className="mc-cal-dayname">{d}</div>)}
          {days.map((item, idx) => (
            <div
              key={idx}
              className={`mc-cal-day${item.isToday ? " mc-today" : ""}${item.other ? " mc-other" : ""}`}
            >
              {item.day || ""}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── Derived values ────────────────────────────────────────────────────────

  const sparkValues = [3, 5, 2, 8, 6, 9, 4];
  const activityPct = Math.min(99, Math.round(stats.totalTransactions / Math.max(stats.totalMedia, 1) * 10)) || 75;
  const revenueTargetPct = Math.min(99, Math.round(stats.totalRevenue / 50000 * 100));
  const userGrowthPct = Math.min(99, Math.round(stats.totalUsers / 100 * 100));
  const contentApprovedPct = Math.min(99, Math.round(stats.totalMedia / 200 * 100));

  const adminUserStr = localStorage.getItem("user");
  const adminUser = adminUserStr ? JSON.parse(adminUserStr) : {};
  const adminName = adminUser?.name || adminUser?.username || adminUser?.email || "Administrator";
  const adminAvatarLetter = adminName.charAt(0).toUpperCase();

  const eventList = [
    { count: stats.totalTransactions, label: "Transactions", color: "#F06B8D" },
    { count: stats.pendingRefunds, label: "Refunds (pending)", color: "#4CC9A6" },
    { count: stats.totalUsers, label: "Users", color: "#9D7FEB" },
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
      {/* Hero Banner */}
      <div className="mc-hero">
        <div>
          <div className="mc-hero-date">
            <i className="fas fa-calendar-alt"></i>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long", month: "long", day: "numeric", year: "numeric",
            })}
          </div>
          <h2>Good Day, {adminName}!</h2>
          <p>Have a productive {new Date().toLocaleDateString("en-US", { weekday: "long" })}.</p>
        </div>
        <div className="mc-hero-art">🛡️</div>
      </div>

      {/* Health Alert Badges */}
      {health && (health.pendingWithdrawals > 0 || health.pendingApplications > 0 || health.pendingMedia > 0) && (
        <div className="d-flex gap-2 flex-wrap mb-3">
          {health.pendingWithdrawals > 0 && (
            <Link to="/admin/withdrawals" className="badge bg-warning text-dark text-decoration-none" style={{ fontSize: "0.78rem", padding: "0.45em 0.9em" }}>
              <i className="fas fa-money-bill-wave me-1"></i>{health.pendingWithdrawals} withdrawal{health.pendingWithdrawals !== 1 ? "s" : ""} pending
            </Link>
          )}
          {health.pendingApplications > 0 && (
            <Link to="/admin/applications" className="badge bg-info text-dark text-decoration-none" style={{ fontSize: "0.78rem", padding: "0.45em 0.9em" }}>
              <i className="fas fa-user-clock me-1"></i>{health.pendingApplications} application{health.pendingApplications !== 1 ? "s" : ""} pending
            </Link>
          )}
          {health.pendingMedia > 0 && (
            <Link to="/admin/media" className="badge bg-secondary text-decoration-none" style={{ fontSize: "0.78rem", padding: "0.45em 0.9em" }}>
              <i className="fas fa-image me-1"></i>{health.pendingMedia} media awaiting approval
            </Link>
          )}
        </div>
      )}

      {/* Stat Cards */}
      <div className="mc-stats-row">
        {/* Card 1: Total Users */}
        <div className="mc-stat-card">
          <div className="mc-stat-header">
            <span className="mc-stat-label">Total Users</span>
            <span className="mc-stat-dots">···</span>
          </div>
          <div className="mc-stat-value">{(health?.totalUsers ?? stats.totalUsers).toLocaleString()}</div>
          <div className="mc-stat-sub">registered users</div>
          <div className="mc-stat-trend up">
            <Sparkline values={sparkValues} color="#F06B8D" />
          </div>
        </div>

        {/* Card 2: Sales Today */}
        <div className="mc-stat-card">
          <div className="mc-stat-header">
            <span className="mc-stat-label">Sales Today</span>
            <span className="mc-stat-dots">···</span>
          </div>
          <div className="mc-stat-value">{"KES " + (health?.salesToday ?? 0).toLocaleString()}</div>
          <div className="mc-stat-sub">this week: KES {(health?.salesThisWeek ?? 0).toLocaleString()}</div>
          <div className="mc-stat-trend up">
            <Sparkline values={sparkValues} color="#4CC9A6" />
          </div>
        </div>

        {/* Card 3: Pending Withdrawals */}
        <div className="mc-stat-card">
          <div className="mc-stat-header">
            <span className="mc-stat-label">Pending Withdrawals</span>
            <span className="mc-stat-dots">···</span>
          </div>
          <div className="mc-stat-value">{health?.pendingWithdrawals ?? 0}</div>
          <div className="mc-stat-sub">KES {(health?.pendingWithdrawalsAmount ?? 0).toLocaleString()} total</div>
          <div className="mc-stat-trend neu">
            <Sparkline values={sparkValues} color="#9D7FEB" />
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="mc-bottom-grid">
        {/* Left: Donut + event list */}
        <div className="mc-card">
          <div className="mc-card-header">
            <span className="mc-card-title">PLATFORM ACTIVITY</span>
          </div>
          <div className="mc-donut-wrap">
            <div
              className="mc-donut"
              style={{
                background: `conic-gradient(var(--mc-accent) 0% ${activityPct}%, var(--mc-border) ${activityPct}% 100%)`,
              }}
            >
              <span className="mc-donut-pct">{activityPct}%</span>
            </div>
            <div className="mc-donut-info">
              <h4>Activity</h4>
              <p>transactions / media</p>
            </div>
          </div>
          <div className="mc-event-list">
            {eventList.map((ev) => (
              <div className="mc-event-item" key={ev.label}>
                <span className="mc-event-dot" style={{ background: ev.color }}></span>
                <span className="mc-event-count">{ev.count}</span>
                <span className="mc-event-label">{ev.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Middle: Progress bars */}
        <div className="mc-card">
          <div className="mc-card-header">
            <span className="mc-card-title">PLATFORM GOALS</span>
            <span className="mc-card-badge">Today</span>
          </div>

          <div className="mc-prog-row">
            <span className="mc-prog-label">Revenue Target</span>
            <span className="mc-prog-pct">{revenueTargetPct}%</span>
            <div className="mc-prog-track">
              <div className="mc-prog-fill" style={{ width: `${revenueTargetPct}%`, background: "#5B7FE5" }}></div>
            </div>
          </div>

          <div className="mc-prog-row">
            <span className="mc-prog-label">User Growth</span>
            <span className="mc-prog-pct">{userGrowthPct}%</span>
            <div className="mc-prog-track">
              <div className="mc-prog-fill" style={{ width: `${userGrowthPct}%`, background: "#4CC9A6" }}></div>
            </div>
          </div>

          <div className="mc-prog-row">
            <span className="mc-prog-label">Content Approved</span>
            <span className="mc-prog-pct">{contentApprovedPct}%</span>
            <div className="mc-prog-track">
              <div className="mc-prog-fill" style={{ width: `${contentApprovedPct}%`, background: "#F06B8D" }}></div>
            </div>
          </div>

          <span style={{ color: "var(--mc-accent)", fontSize: "0.8rem", cursor: "pointer" }}>+ Add goal</span>
        </div>

        {/* Right panel */}
        <div className="mc-right-panel">
          {/* Profile mini */}
          <div className="mc-card">
            <div className="mc-profile-mini">
              <div className="mc-profile-avatar">
                {adminUser?.profileImage ? (
                  <img src={adminUser.profileImage} alt="avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  <div className="mc-avatar-placeholder">{adminAvatarLetter}</div>
                )}
              </div>
              <div className="mc-profile-name">{adminName}</div>
              <div className="mc-profile-role">Administrator</div>
            </div>
            <div className="mc-profile-stats">
              <div className="mc-pstat">
                <div className="mc-pstat-val">{stats.totalUsers}</div>
                <div className="mc-pstat-lbl">Users</div>
              </div>
              <div className="mc-pstat">
                <div className="mc-pstat-val">{stats.totalMedia}</div>
                <div className="mc-pstat-lbl">Media</div>
              </div>
              <div className="mc-pstat">
                <div className="mc-pstat-val">{stats.totalTransactions}</div>
                <div className="mc-pstat-lbl">Txns</div>
              </div>
            </div>
          </div>

          {/* Mini calendar */}
          <div className="mc-card">
            <MiniCalendar />
          </div>

          {/* Recent transactions schedule */}
          <div className="mc-card">
            <div className="mc-card-header">
              <span className="mc-card-title">RECENT TRANSACTIONS</span>
            </div>
            <div className="mc-schedule">
              {recentReceipts.slice(0, 4).map((r, idx) => (
                <div className="mc-sched-item" key={idx}>
                  <span className="mc-sched-dot" style={{ background: "#4CC9A6" }}></span>
                  <div className="mc-sched-body">
                    <div className="mc-sched-time">{new Date(r.createdAt).toLocaleDateString()}</div>
                    <div className="mc-sched-text">{r.user?.email || r.description || "Transaction"}</div>
                  </div>
                </div>
              ))}
              {recentReceipts.length === 0 && (
                <div style={{ color: "var(--mc-text-muted)", fontSize: "0.8rem", textAlign: "center", padding: "0.75rem 0" }}>
                  No recent transactions
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDash;