import React, { useEffect, useState } from "react";
import axios from "axios";
import PhotographerLayout from "./PhotographerLayout";
import { Link } from "react-router-dom";
import { API_BASE_URL, API_ENDPOINTS } from "../../../api/apiConfig";
import { placeholderSmall } from "../../../utils/placeholders";
import { getImageUrl, fetchProtectedUrl } from "../../../utils/imageUrl";
import { getAuthHeaders, getCurrentUserId, getDisplayName, getStoredUser } from "../../../utils/auth";

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
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [chartLabels, setChartLabels] = useState([]);
  const [chartSeries, setChartSeries] = useState([]);

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

  const statsCards = [
    {
      title: "Total Media",
      value: stats.totalMedia,
      icon: "fa-photo-video",
      color: "warning",
      link: "/photographer/media",
    },
    {
      title: "Total Sales",
      value: stats.totalSales,
      icon: "fa-shopping-cart",
      color: "success",
      link: "/photographer/sales",
    },
    {
      title: "Total Earnings",
      value: `KES ${stats.totalEarnings.toLocaleString()}`,
      icon: "fa-dollar-sign",
      color: "info",
      link: "/photographer/earnings",
    },
    {
      title: "Pending",
      value: `KES ${stats.pendingEarnings.toLocaleString()}`,
      icon: "fa-clock",
      color: "warning",
      link: "/photographer/withdrawals",
    },
    {
      title: "Total Views",
      value: stats.totalViews,
      icon: "fa-eye",
      color: "primary",
      link: "#",
    },
    {
      title: "Total Likes",
      value: stats.totalLikes,
      icon: "fa-heart",
      color: "danger",
      link: "#",
    },
  ];

  const chartPoints = chartSeries.length === 7 ? chartSeries : [0, 0, 0, 0, 0, 0, 0];
  const chartLabelsToShow = chartLabels.length === 7
    ? chartLabels
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const chartMaxValue = Math.max(...chartPoints, 1);

  return (
    <PhotographerLayout>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <h4 className="fw-bold mb-1" style={{ fontFamily: "var(--font-serif)", color: "#fff" }}>
            <i className="fas fa-camera me-2" style={{ color: "var(--pm-teal)" }}></i>
            Photographer Dashboard
          </h4>
          <p className="small mb-0" style={{ color: "rgba(255,255,255,0.5)" }}>
            Welcome back, {displayName}!
          </p>
        </div>

        {/* Time Range */}
        <div className="btn-group mt-3 mt-md-0">
          {["week", "month", "year"].map((range) => (
            <button
              key={range}
              className="btn btn-sm"
              onClick={() => setTimeRange(range)}
              style={{
                background: timeRange === range ? "var(--pm-teal)" : "rgba(107,189,208,0.1)",
                color: timeRange === range ? "#fff" : "var(--pm-teal)",
                border: "1px solid rgba(107,189,208,0.3)",
                transition: "var(--ease)",
              }}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border mb-3" style={{ color: "var(--pm-teal)" }}></div>
          <p style={{ color: "rgba(255,255,255,0.5)" }}>Loading dashboard...</p>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          <strong>Error:</strong> {error}
          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Stats Cards */}
          <div className="row g-3 mb-4">
            {statsCards.map((stat, idx) => (
              <div className="col-xl-2 col-lg-4 col-md-6" key={idx}>
                <Link to={stat.link} className="text-decoration-none">
                  <div className="glass-stat h-100 p-3" style={{ borderRadius: "var(--radius-lg)", cursor: "pointer" }}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <p className="small mb-1" style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{stat.title}</p>
                        <h5 className="fw-bold mb-0 text-white" style={{ fontFamily: "var(--font-serif)" }}>{stat.value}</h5>
                      </div>
                      <div className="rounded-circle d-flex align-items-center justify-content-center"
                           style={{ width: 40, height: 40, background: "rgba(107,189,208,0.15)", border: "1px solid rgba(107,189,208,0.25)", flexShrink: 0 }}>
                        <i className={`fas ${stat.icon}`} style={{ color: "var(--pm-teal)", fontSize: "1rem" }}></i>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Charts and Popular Media */}
          <div className="row g-3 mb-4">
            {/* Earnings Chart */}
            <div className="col-lg-8">
              <div className="glass-card p-0 overflow-hidden">
                <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(107,189,208,0.15)" }}>
                  <h6 className="mb-0" style={{ color: "var(--pm-teal)", fontFamily: "var(--font-sans)", fontSize: "0.88rem", fontWeight: 600 }}>
                    <i className="fas fa-chart-line me-2"></i>
                    Earnings Overview — {timeRange}
                  </h6>
                </div>
                <div className="p-4">
                  <div className="d-flex justify-content-between align-items-end" style={{ height: "200px" }}>
                    {chartPoints.map((value, idx) => {
                      const barHeight = chartMaxValue > 0 ? Math.max(8, (value / chartMaxValue) * 160) : 8;
                      return (
                        <div key={idx} className="text-center d-flex flex-column align-items-center justify-content-end" style={{ width: "12%", height: "100%" }}>
                          <div
                            style={{
                              height: `${barHeight}px`,
                              width: "100%",
                              background: value > 0
                                ? "linear-gradient(180deg, var(--pm-teal) 0%, rgba(107,189,208,0.4) 100%)"
                                : "rgba(255,255,255,0.06)",
                              borderRadius: "6px 6px 0 0",
                              marginBottom: "6px",
                              transition: "height 0.4s ease",
                              boxShadow: value > 0 ? "0 0 12px rgba(107,189,208,0.3)" : "none",
                            }}
                          ></div>
                          <small style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.58rem", display: "block" }}>
                            {chartLabelsToShow[idx]}
                          </small>
                          <small style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.55rem", display: "block" }}>
                            {value > 0 ? `${value.toLocaleString()}` : "—"}
                          </small>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Popular Media */}
            <div className="col-lg-4">
              <div className="glass-card h-100 p-0 overflow-hidden">
                <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(107,189,208,0.15)" }}>
                  <h6 className="mb-0" style={{ color: "var(--pm-teal)", fontFamily: "var(--font-sans)", fontSize: "0.88rem", fontWeight: 600 }}>
                    <i className="fas fa-fire me-2"></i>
                    Popular Media
                  </h6>
                </div>
                <div className="p-3">
                  {popularMedia.length === 0 && (
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.82rem", textAlign: "center", padding: "1.5rem 0" }}>No media yet</p>
                  )}
                  {popularMedia.map((item, idx) => (
                    <div key={idx} className="d-flex align-items-center gap-3 mb-3">
                      <img
                        src={
                          imageUrls[item._id] ||
                          imageUrls[item.mediaId] ||
                          getImageUrl(item, placeholderSmall) ||
                          getImageUrl({ fileUrl: item.thumbnail }, placeholderSmall) ||
                          placeholderSmall
                        }
                        alt=""
                        width="44"
                        height="44"
                        style={{ objectFit: "cover", borderRadius: "var(--radius-sm)", border: "1px solid rgba(107,189,208,0.2)", flexShrink: 0 }}
                        onError={async (e) => {
                          e.target.onerror = null;
                          const mediaId = item._id || item.mediaId;
                          const protectedUrl = await fetchProtectedUrl(mediaId);
                          if (protectedUrl) e.target.src = protectedUrl;
                        }}
                      />
                      <div className="flex-grow-1 min-w-0">
                        <small className="fw-semibold d-block text-truncate text-white" style={{ fontSize: "0.82rem" }}>{item.title}</small>
                        <small style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem" }}>
                          <i className="fas fa-heart me-1" style={{ color: "#E85555" }}></i>
                          {item.likes || 0} likes
                        </small>
                      </div>
                      <small style={{ color: "var(--pm-teal)", fontWeight: 600, flexShrink: 0, fontSize: "0.8rem" }}>KES {item.price}</small>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Sales */}
          <div className="glass-card p-0 overflow-hidden">
            <div className="px-4 py-3 d-flex justify-content-between align-items-center" style={{ borderBottom: "1px solid rgba(107,189,208,0.15)" }}>
              <h6 className="mb-0" style={{ color: "var(--pm-teal)", fontFamily: "var(--font-sans)", fontSize: "0.88rem", fontWeight: 600 }}>
                <i className="fas fa-shopping-cart me-2"></i>
                Recent Sales
              </h6>
              <Link to="/photographer/sales">
                <button className="btn btn-sm" style={{ background: "rgba(107,189,208,0.12)", color: "var(--pm-teal)", border: "1px solid rgba(107,189,208,0.25)", borderRadius: "var(--radius-pill)", fontSize: "0.78rem", padding: "0.25rem 0.85rem" }}>
                  View All
                </button>
              </Link>
            </div>
            <div className="table-responsive">
              <table className="table mb-0" style={{ color: "rgba(255,255,255,0.8)" }}>
                <thead>
                  <tr style={{ borderColor: "rgba(107,189,208,0.12)" }}>
                    {["Buyer","Item","Amount","Date","Status"].map(h => (
                      <th key={h} style={{ color: "rgba(107,189,208,0.7)", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0.75rem 1rem", borderColor: "rgba(107,189,208,0.12)", background: "transparent" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((sale, idx) => (
                    <tr key={idx} style={{ borderColor: "rgba(107,189,208,0.08)" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(107,189,208,0.05)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.84rem", borderColor: "rgba(107,189,208,0.08)" }}>
                        <i className="fas fa-user-circle me-2" style={{ color: "var(--pm-teal)" }}></i>
                        {sale.buyer?.email || sale.description || "Anonymous"}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.84rem", borderColor: "rgba(107,189,208,0.08)" }}>{sale.mediaTitle || sale.description || "Media"}</td>
                      <td style={{ padding: "0.75rem 1rem", borderColor: "rgba(107,189,208,0.08)" }}>
                        <span style={{ background: "rgba(46,204,154,0.15)", color: "var(--pm-success)", border: "1px solid rgba(46,204,154,0.25)", borderRadius: "var(--radius-pill)", fontSize: "0.75rem", padding: "0.2rem 0.6rem" }}>
                          KES {Number(sale.amount || 0).toLocaleString()}
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", borderColor: "rgba(107,189,208,0.08)" }}>
                        {new Date(sale.date || sale.createdAt || sale.transactionDate).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", borderColor: "rgba(107,189,208,0.08)" }}>
                        <span style={{ background: "rgba(46,204,154,0.15)", color: "var(--pm-success)", border: "1px solid rgba(46,204,154,0.25)", borderRadius: "var(--radius-pill)", fontSize: "0.72rem", padding: "0.18rem 0.55rem" }}>
                          Completed
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentSales.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", padding: "2rem", fontSize: "0.88rem", borderColor: "transparent" }}>
                        No sales yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </PhotographerLayout>
  );
};

export default PhotographerDashboard;