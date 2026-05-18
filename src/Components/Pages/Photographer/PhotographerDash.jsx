import React, { useEffect, useState } from "react";
import axios from "axios";
import PhotographerLayout from "./PhotographerLayout";
import { Link } from "react-router-dom";
import { API_BASE_URL, API_ENDPOINTS } from "../../../api/apiConfig";
import { placeholderSmall } from "../../../utils/placeholders";
import { getImageUrl, fetchProtectedUrl } from "../../../utils/imageUrl";
import { getAuthHeaders, getCurrentUserId, getDisplayName, getStoredUser } from "../../../utils/auth";
import ThemeToggle from "../../ThemeToggle";
import NotificationBell from "../../NotificationBell";

const API = API_BASE_URL;

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const buildChartIntervals = (range) => {
  const now = new Date();
  const intervals = [];
  const labels = [];

  if (range === "week") {
    for (let offset = 6; offset >= 0; offset -= 1) {
      const target = new Date(now);
      target.setDate(now.getDate() - offset);
      labels.push(target.toLocaleDateString("en-US", { weekday: "short" }));
      intervals.push({
        start: startOfDay(target),
        end: endOfDay(target),
      });
    }
  } else if (range === "month") {
    for (let offset = 6; offset >= 0; offset -= 1) {
      const end = new Date(now);
      end.setDate(now.getDate() - offset * 7);
      const start = new Date(end);
      start.setDate(end.getDate() - 6);
      labels.push(`W${7 - offset}`);
      intervals.push({
        start: startOfDay(start),
        end: endOfDay(end),
      });
    }
  } else {
    for (let offset = 6; offset >= 0; offset -= 1) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const monthLabel = monthStart.toLocaleString("default", { month: "short" });
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59, 999);
      labels.push(monthLabel);
      intervals.push({
        start: startOfDay(monthStart),
        end: monthEnd,
      });
    }
  }

  return { labels, intervals };
};

const buildChartData = (transactions, range) => {
  const { labels, intervals } = buildChartIntervals(range);
  const values = intervals.map(() => 0);

  transactions.forEach((tx) => {
    const dateValue = tx.date || tx.createdAt || tx.transactionDate;
    const txDate = new Date(dateValue);
    if (Number.isNaN(txDate.getTime())) return;

    intervals.forEach((interval, idx) => {
      if (txDate >= interval.start && txDate <= interval.end) {
        values[idx] += Number(tx.amount || 0);
      }
    });
  });

  return { labels, values };
};

const PhotographerDashboard = () => {
  const [stats, setStats] = useState({
    totalMedia: 0,
    totalSales: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    totalViews: 0,
    totalLikes: 0,
  });
  const [recentSales, setRecentSales] = useState([]);
  const [popularMedia, setPopularMedia] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("week");
  const [, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [chartLabels, setChartLabels] = useState([]);
  const [chartSeries, setChartSeries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const photographerId = getCurrentUserId();
  const user = getStoredUser();
  const displayName = getDisplayName(user) || "Photographer";
  const headers = getAuthHeaders();

  console.log("PhotographerDash Debug:", { photographerId, user, headers, token: localStorage.getItem('token') });

  const fetchDashboardData = async () => {
    if (!photographerId) {
      console.error("❌ Photographer ID missing; cannot load dashboard data.");
      setError("Could not identify photographer. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const mediaRes = await axios.get(`${API}/media/mine`, { headers });
      console.log("✅ Media fetched:", mediaRes.data);
      const myMedia = Array.isArray(mediaRes.data)
        ? mediaRes.data
        : Array.isArray(mediaRes.data?.media)
          ? mediaRes.data.media
          : Array.isArray(mediaRes.data?.data)
            ? mediaRes.data.data
            : [];

      const earningsRes = await axios.get(API_ENDPOINTS.PAYMENTS.EARNINGS_SUMMARY(photographerId), { headers })
        .catch((err) => {
          console.warn("⚠️ Earnings fetch failed:", err.message);
          return { data: { total: 0, pending: 0, available: 0 } };
        });
      console.log("✅ Earnings fetched:", earningsRes.data);

      const salesRes = await axios.get(API_ENDPOINTS.PAYMENTS.TRANSACTIONS(photographerId), { headers })
        .catch((err) => {
          console.warn("⚠️ Sales fetch failed:", err.message);
          return { data: [] };
        });
      console.log("✅ Sales fetched:", salesRes.data);

      const totalViews = myMedia.reduce((sum, m) => sum + (m.views || 0), 0);
      const totalLikes = myMedia.reduce((sum, m) => sum + (m.likes || 0), 0);

      const photographerSales = Array.isArray(salesRes.data) ? salesRes.data : [];

      const popular = [...myMedia].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 5);

      setStats({
        totalMedia: myMedia.length,
        totalSales: photographerSales.length,
        totalEarnings: earningsRes.data?.total || 0,
        pendingEarnings: earningsRes.data?.pending || 0,
        totalViews,
        totalLikes,
      });

      setRecentSales(photographerSales.slice(0, 5));
      setPopularMedia(popular);
      setTransactions(photographerSales);
      const chartData = buildChartData(photographerSales, timeRange);
      setChartLabels(chartData.labels);
      setChartSeries(chartData.values);

      // Prefetch protected URLs for any items that may have non-public paths
      const urls = {};
      await Promise.all(
        popular.map(async (item) => {
          const raw = getImageUrl(item, null);
          const needsProtected =
            !raw ||
            raw.includes("/opt/") ||
            raw.startsWith("file://");

          if (needsProtected) {
            const mediaId = item._id || item.mediaId;
            if (!mediaId) return;
            const protectedUrl = await fetchProtectedUrl(mediaId);
            if (protectedUrl) {
              urls[mediaId] = protectedUrl;
            }
          }
        })
      );
      setImageUrls(urls);

    } catch (error) {
      console.error("❌ Dashboard error:", error.response?.data || error.message);
      setError(`Error loading dashboard: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!photographerId) return;
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photographerId, timeRange]);

  useEffect(() => {
    const chartData = buildChartData(transactions, timeRange);
    setChartLabels(chartData.labels);
    setChartSeries(chartData.values);
  }, [transactions, timeRange]);

  const chartData = buildChartData(transactions, timeRange);

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

  const sparkValues = chartData?.values?.length ? chartData.values : [3, 5, 2, 8, 6, 9, 4];
  const busynessPct = Math.min(99, Math.round((stats.totalSales / Math.max(stats.totalMedia, 1)) * 100)) || 42;
  const salesRatioPct = Math.min(99, Math.round(stats.totalSales / Math.max(stats.totalMedia, 1) * 100));
  const mediaUploadedPct = Math.min(99, Math.min(stats.totalMedia * 5, 99));
  const earningsGoalPct = Math.min(99, Math.round(Math.min(stats.totalEarnings / 10000, 1) * 100));
  const storedUser = getStoredUser();
  const avatarLetter = (displayName || "P").charAt(0).toUpperCase();

  const eventList = [
    { count: stats.totalSales, label: "Sales", color: "#F06B8D" },
    { count: stats.totalMedia, label: "Media", color: "#4CC9A6" },
    { count: stats.totalViews || 0, label: "Views", color: "#9D7FEB" },
  ];

  if (loading) {
    return (
      <PhotographerLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
          <div className="spinner-border" style={{ color: "var(--mc-accent)" }}></div>
        </div>
      </PhotographerLayout>
    );
  }

  return (
    <PhotographerLayout>
      {/* Top Bar */}
      <div className="mc-topbar">
        <div className="mc-search-wrap">
          <i className="fas fa-search mc-search-icon"></i>
          <input
            className="mc-search"
            placeholder="Search..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="mc-topbar-actions">
          <div className="mc-icon-btn"><ThemeToggle /></div>
          <NotificationBell />
        </div>
      </div>

      {/* Hero Banner */}
      <div className="mc-hero">
        <div>
          <div className="mc-hero-date">
            <i className="fas fa-calendar-alt"></i>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long", month: "long", day: "numeric", year: "numeric",
            })}
          </div>
          <h2>Good Day, {displayName}!</h2>
          <p>Have a productive {new Date().toLocaleDateString("en-US", { weekday: "long" })}.</p>
        </div>
        <div className="mc-hero-art" style={{ background: "none", fontSize: "unset" }}>
          {storedUser?.profilePicture || storedUser?.profileImage ? (
            <img
              src={storedUser.profilePicture || storedUser.profileImage}
              alt={displayName}
              style={{ width: 90, height: 90, borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(255,255,255,0.25)", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}
            />
          ) : (
            <div style={{ width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", fontWeight: 700, color: "#fff", border: "3px solid rgba(255,255,255,0.25)" }}>
              {avatarLetter}
            </div>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="mc-stats-row">
        {/* Card 1: My Media */}
        <div className="mc-stat-card">
          <div className="mc-stat-header">
            <span className="mc-stat-label">My Media</span>
            <span className="mc-stat-dots">···</span>
          </div>
          <div className="mc-stat-value">{stats.totalMedia}</div>
          <div className="mc-stat-sub">photos uploaded</div>
          <div className="mc-stat-trend up">
            <Sparkline values={sparkValues} color="#F06B8D" />
          </div>
        </div>

        {/* Card 2: Total Sales */}
        <div className="mc-stat-card">
          <div className="mc-stat-header">
            <span className="mc-stat-label">Total Sales</span>
            <span className="mc-stat-dots">···</span>
          </div>
          <div className="mc-stat-value">{stats.totalSales}</div>
          <div className="mc-stat-sub">images sold</div>
          <div className="mc-stat-trend up">
            <Sparkline values={sparkValues} color="#4CC9A6" />
          </div>
        </div>

        {/* Card 3: Earnings */}
        <div className="mc-stat-card">
          <div className="mc-stat-header">
            <span className="mc-stat-label">Earnings</span>
            <span className="mc-stat-dots">···</span>
          </div>
          <div className="mc-stat-value">{"KES " + stats.totalEarnings.toLocaleString()}</div>
          <div className="mc-stat-sub">total earned</div>
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
            <span className="mc-card-title">MY SCHEDULED EVENTS</span>
          </div>
          <div className="mc-donut-wrap">
            <div
              className="mc-donut"
              style={{
                background: `conic-gradient(var(--mc-accent) 0% ${busynessPct}%, var(--mc-border) ${busynessPct}% 100%)`,
              }}
            >
              <span className="mc-donut-pct">{busynessPct}%</span>
            </div>
            <div className="mc-donut-info">
              <h4>Busyness</h4>
              <p>sales / media ratio</p>
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
            <span className="mc-card-title">MY PERFORMANCE</span>
            <span className="mc-card-badge">Today</span>
          </div>

          <div className="mc-prog-row">
            <span className="mc-prog-label">Sales Ratio</span>
            <span className="mc-prog-pct">{salesRatioPct}%</span>
            <div className="mc-prog-track">
              <div className="mc-prog-fill" style={{ width: `${salesRatioPct}%`, background: "#5B7FE5" }}></div>
            </div>
          </div>

          <div className="mc-prog-row">
            <span className="mc-prog-label">Media Uploaded</span>
            <span className="mc-prog-pct">{mediaUploadedPct}%</span>
            <div className="mc-prog-track">
              <div className="mc-prog-fill" style={{ width: `${mediaUploadedPct}%`, background: "#F06B8D" }}></div>
            </div>
          </div>

          <div className="mc-prog-row">
            <span className="mc-prog-label">Earnings Goal</span>
            <span className="mc-prog-pct">{earningsGoalPct}%</span>
            <div className="mc-prog-track">
              <div className="mc-prog-fill" style={{ width: `${earningsGoalPct}%`, background: "#4CC9A6" }}></div>
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
                {storedUser?.profileImage ? (
                  <img src={storedUser.profileImage} alt="avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  <div className="mc-avatar-placeholder">{avatarLetter}</div>
                )}
              </div>
              <div className="mc-profile-name">{displayName}</div>
              <div className="mc-profile-role">Photographer</div>
              {storedUser?.location && (
                <div className="mc-profile-loc">
                  <i className="fas fa-map-marker-alt" style={{ marginRight: 4 }}></i>
                  {storedUser.location}
                </div>
              )}
            </div>
            <div className="mc-profile-stats">
              <div className="mc-pstat">
                <div className="mc-pstat-val">{stats.totalMedia}</div>
                <div className="mc-pstat-lbl">Media</div>
              </div>
              <div className="mc-pstat">
                <div className="mc-pstat-val">{stats.totalSales}</div>
                <div className="mc-pstat-lbl">Sales</div>
              </div>
              <div className="mc-pstat">
                <div className="mc-pstat-val">{stats.totalViews || 0}</div>
                <div className="mc-pstat-lbl">Views</div>
              </div>
            </div>
          </div>

          {/* Mini calendar */}
          <div className="mc-card">
            <MiniCalendar />
          </div>

          {/* Recent sales schedule */}
          <div className="mc-card">
            <div className="mc-card-header">
              <span className="mc-card-title">RECENT SALES</span>
            </div>
            <div className="mc-schedule">
              {recentSales.slice(0, 4).map((sale, idx) => (
                <div className="mc-sched-item" key={idx}>
                  <span className="mc-sched-dot" style={{ background: "#4CC9A6" }}></span>
                  <div className="mc-sched-body">
                    <div className="mc-sched-time">
                      {new Date(sale.date || sale.createdAt || sale.transactionDate).toLocaleDateString()}
                    </div>
                    <div className="mc-sched-text">{sale.mediaTitle || sale.description || "Media sale"}</div>
                  </div>
                </div>
              ))}
              {recentSales.length === 0 && (
                <div style={{ color: "var(--mc-text-muted)", fontSize: "0.8rem", textAlign: "center", padding: "0.75rem 0" }}>
                  No recent sales
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PhotographerLayout>
  );
};

export default PhotographerDashboard;