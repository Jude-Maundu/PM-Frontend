import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import { API_ENDPOINTS } from "../../../api/apiConfig";
import PageHeader from "../../PageHeader";

const AdminAnalytics = () => {
  const [overview, setOverview] = useState({
    totalUsers: 0,
    totalPhotographers: 0,
    totalBuyers: 0,
    totalMedia: 0,
  });
  const [revenue, setRevenue] = useState([]);
  const [signups, setSignups] = useState([]);
  const [topPhotographers, setTopPhotographers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    const headers = getHeaders();
    try {
      const [overviewRes, revenueRes, signupsRes, topRes] = await Promise.all([
        axios.get(API_ENDPOINTS.ADMIN.ANALYTICS_OVERVIEW, { headers }).catch(() => ({ data: {} })),
        axios.get(API_ENDPOINTS.ADMIN.ANALYTICS_REVENUE, { headers }).catch(() => ({ data: [] })),
        axios.get(API_ENDPOINTS.ADMIN.ANALYTICS_SIGNUPS, { headers }).catch(() => ({ data: [] })),
        axios.get(API_ENDPOINTS.ADMIN.ANALYTICS_TOP_PHOTOGRAPHERS, { headers }).catch(() => ({ data: [] })),
      ]);

      const ov = overviewRes.data || {};
      setOverview({
        totalUsers: ov.totalUsers ?? 0,
        totalPhotographers: ov.totalPhotographers ?? 0,
        totalBuyers: ov.totalBuyers ?? 0,
        totalMedia: ov.totalMedia ?? 0,
      });

      const rev = Array.isArray(revenueRes.data) ? revenueRes.data : (revenueRes.data?.data || []);
      setRevenue(rev);

      const sig = Array.isArray(signupsRes.data) ? signupsRes.data : (signupsRes.data?.data || []);
      setSignups(sig);

      const top = Array.isArray(topRes.data) ? topRes.data : (topRes.data?.data || []);
      setTopPhotographers(top);
    } catch (err) {
      setError("Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const exportCSV = async (url, filename) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
    } catch (err) {
      alert("Export failed. Please try again.");
    }
  };

  // Bar chart helpers
  const maxRevenue = revenue.length > 0 ? Math.max(...revenue.map((d) => d.revenue || 0), 1) : 1;
  const maxSignups = signups.length > 0 ? Math.max(...signups.map((d) => (d.total || d.buyers + d.photographers) || 0), 1) : 1;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const formatKES = (n) => `KES ${Number(n || 0).toLocaleString()}`;

  const overviewCards = [
    { label: "Total Users", value: overview.totalUsers, icon: "fa-users", color: "rgba(107,189,208,0.15)", iconColor: "var(--pm-teal)" },
    { label: "Total Photographers", value: overview.totalPhotographers, icon: "fa-camera", color: "rgba(255,193,7,0.12)", iconColor: "#ffc107" },
    { label: "Total Buyers", value: overview.totalBuyers, icon: "fa-shopping-bag", color: "rgba(40,167,69,0.12)", iconColor: "#28a745" },
    { label: "Total Media", value: overview.totalMedia, icon: "fa-photo-video", color: "rgba(108,117,125,0.15)", iconColor: "#adb5bd" },
  ];

  const getInitials = (username) =>
    username ? username.slice(0, 2).toUpperCase() : "??";

  return (
    <AdminLayout>
      <div className="mc-page">
        {/* Page Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-2 gap-3">
          <PageHeader title="Analytics" subtitle="Platform revenue and growth insights" />

          {/* Export Buttons */}
          <div className="d-flex gap-2 flex-wrap">
            <button
              className="btn btn-sm"
              style={{
                background: "rgba(107,189,208,0.15)",
                border: "1px solid rgba(107,189,208,0.3)",
                color: "var(--pm-teal)",
              }}
              onClick={() => exportCSV(API_ENDPOINTS.ADMIN.EXPORT_USERS, "users-export.csv")}
            >
              <i className="fas fa-download me-2"></i>Export Users CSV
            </button>
            <button
              className="btn btn-sm"
              style={{
                background: "rgba(255,193,7,0.12)",
                border: "1px solid rgba(255,193,7,0.3)",
                color: "#ffc107",
              }}
              onClick={() => exportCSV(API_ENDPOINTS.ADMIN.EXPORT_TRANSACTIONS, "transactions-export.csv")}
            >
              <i className="fas fa-download me-2"></i>Export Transactions CSV
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-5">
            <div
              className="spinner-border mb-3"
              style={{ width: "3rem", height: "3rem", color: "var(--pm-teal)" }}
            ></div>
            <p className="text-white-50">Loading analytics...</p>
          </div>
        )}

        {error && (
          <div
            className="alert border-0 mb-4"
            style={{ background: "rgba(220,53,69,0.15)", color: "#f88", border: "1px solid rgba(220,53,69,0.3)" }}
          >
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
            <button className="btn btn-sm ms-3" style={{ color: "#f88", border: "1px solid rgba(220,53,69,0.3)" }} onClick={fetchAll}>
              Retry
            </button>
          </div>
        )}

        {!loading && (
          <>
            {/* Overview Stat Cards */}
            <div className="mc-stats-row-sm mb-4">
              {overviewCards.map((card, idx) => (
                <div className="mc-card" key={idx} style={{ background: card.color }}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-white-50 small mb-1">{card.label}</p>
                      <h2 className="fw-bold mb-0 text-white">{Number(card.value).toLocaleString()}</h2>
                    </div>
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: "44px",
                        height: "44px",
                        background: "rgba(255,255,255,0.07)",
                        border: `1px solid ${card.iconColor}40`,
                        flexShrink: 0,
                      }}
                    >
                      <i className={`fas ${card.icon}`} style={{ color: card.iconColor }}></i>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Revenue Bar Chart */}
            <div className="mc-card mb-4">
              <div
                className="pb-3 mb-3"
                style={{ borderBottom: "1px solid rgba(107,189,208,0.12)" }}
              >
                <h6 className="fw-bold mb-0 text-white">
                  <i className="fas fa-chart-bar me-2" style={{ color: "var(--pm-teal)" }}></i>
                  Daily Revenue — Last 30 Days
                </h6>
              </div>
              <div>
                {revenue.length === 0 ? (
                  <div className="text-center text-white-50 py-4">
                    <i className="fas fa-chart-bar fa-2x mb-2 d-block opacity-25"></i>
                    No revenue data available
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-end",
                        height: "160px",
                        minWidth: "600px",
                        gap: "0",
                        paddingBottom: "24px",
                        position: "relative",
                      }}
                    >
                      {revenue.map((day, idx) => {
                        const barH = Math.max(4, Math.round(((day.revenue || 0) / maxRevenue) * 120));
                        const showLabel = idx % 5 === 0;
                        return (
                          <div
                            key={idx}
                            style={{
                              width: `calc(100% / ${revenue.length})`,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "flex-end",
                              height: "100%",
                              position: "relative",
                            }}
                            title={`${day.date ? formatDate(day.date) : idx + 1}: ${formatKES(day.revenue)}`}
                            className="analytics-bar-wrap"
                          >
                            <div
                              style={{
                                width: "calc(100% - 4px)",
                                height: `${barH}px`,
                                background: "linear-gradient(to top, var(--pm-teal, #6bbdd0), rgba(107,189,208,0.4))",
                                borderRadius: "3px 3px 0 0",
                                transition: "opacity 0.2s",
                                cursor: "pointer",
                              }}
                            ></div>
                            {showLabel && (
                              <span
                                style={{
                                  position: "absolute",
                                  bottom: "0",
                                  fontSize: "0.6rem",
                                  color: "rgba(255,255,255,0.4)",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {day.date ? formatDate(day.date) : `D${idx + 1}`}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="d-flex justify-content-between mt-1">
                      <small className="text-white-50" style={{ fontSize: "0.65rem" }}>← Earlier</small>
                      <small className="text-white-50" style={{ fontSize: "0.65rem" }}>Recent →</small>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Signups Stacked Bar Chart */}
            <div className="mc-card mb-4">
              <div
                className="pb-3 mb-3"
                style={{ borderBottom: "1px solid rgba(107,189,208,0.12)" }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="fw-bold mb-0 text-white">
                    <i className="fas fa-user-plus me-2" style={{ color: "#ffc107" }}></i>
                    Daily Signups — Last 30 Days
                  </h6>
                  <div className="d-flex gap-3">
                    <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)" }}>
                      <span
                        style={{
                          display: "inline-block",
                          width: "10px",
                          height: "10px",
                          borderRadius: "2px",
                          background: "var(--pm-teal, #6bbdd0)",
                          marginRight: "4px",
                        }}
                      ></span>
                      Buyers
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)" }}>
                      <span
                        style={{
                          display: "inline-block",
                          width: "10px",
                          height: "10px",
                          borderRadius: "2px",
                          background: "#ffc107",
                          marginRight: "4px",
                        }}
                      ></span>
                      Photographers
                    </span>
                  </div>
                </div>
              </div>
              <div>
                {signups.length === 0 ? (
                  <div className="text-center text-white-50 py-4">
                    <i className="fas fa-user-plus fa-2x mb-2 d-block opacity-25"></i>
                    No signup data available
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-end",
                        height: "160px",
                        minWidth: "600px",
                        gap: "0",
                        paddingBottom: "24px",
                      }}
                    >
                      {signups.map((day, idx) => {
                        const buyers = day.buyers || 0;
                        const photographers = day.photographers || 0;
                        const total = buyers + photographers || day.total || 0;
                        const totalH = Math.max(total > 0 ? 4 : 0, Math.round((total / maxSignups) * 120));
                        const buyerH = total > 0 ? Math.round((buyers / total) * totalH) : 0;
                        const photogH = totalH - buyerH;
                        const showLabel = idx % 5 === 0;
                        return (
                          <div
                            key={idx}
                            style={{
                              width: `calc(100% / ${signups.length})`,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "flex-end",
                              height: "100%",
                              position: "relative",
                            }}
                            title={`${day.date ? formatDate(day.date) : idx + 1}: ${buyers} buyers, ${photographers} photographers`}
                          >
                            <div style={{ width: "calc(100% - 4px)", display: "flex", flexDirection: "column" }}>
                              {photogH > 0 && (
                                <div
                                  style={{
                                    height: `${photogH}px`,
                                    background: "#ffc107",
                                    borderRadius: "3px 3px 0 0",
                                  }}
                                ></div>
                              )}
                              {buyerH > 0 && (
                                <div
                                  style={{
                                    height: `${buyerH}px`,
                                    background: "var(--pm-teal, #6bbdd0)",
                                    borderRadius: photogH > 0 ? "0" : "3px 3px 0 0",
                                  }}
                                ></div>
                              )}
                            </div>
                            {showLabel && (
                              <span
                                style={{
                                  position: "absolute",
                                  bottom: "0",
                                  fontSize: "0.6rem",
                                  color: "rgba(255,255,255,0.4)",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {day.date ? formatDate(day.date) : `D${idx + 1}`}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="d-flex justify-content-between mt-1">
                      <small className="text-white-50" style={{ fontSize: "0.65rem" }}>← Earlier</small>
                      <small className="text-white-50" style={{ fontSize: "0.65rem" }}>Recent →</small>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Top Photographers Table */}
            <div className="mc-table-card mb-4">
              <div
                className="pb-3 mb-3"
                style={{ borderBottom: "1px solid rgba(107,189,208,0.12)" }}
              >
                <h6 className="fw-bold mb-0 text-white">
                  <i className="fas fa-trophy me-2" style={{ color: "#ffc107" }}></i>
                  Top Photographers by Wallet Balance
                </h6>
              </div>
              <div className="p-0">
                {topPhotographers.length === 0 ? (
                  <div className="text-center text-white-50 py-5">
                    <i className="fas fa-camera fa-2x mb-2 d-block opacity-25"></i>
                    No photographer data available
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-borderless mb-0">
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(107,189,208,0.1)" }}>
                          <th style={{ color: "rgba(255,255,255,0.4)", fontWeight: 500, fontSize: "0.78rem", paddingLeft: "1.5rem" }}>Rank</th>
                          <th style={{ color: "rgba(255,255,255,0.4)", fontWeight: 500, fontSize: "0.78rem" }}>Photographer</th>
                          <th style={{ color: "rgba(255,255,255,0.4)", fontWeight: 500, fontSize: "0.78rem", textAlign: "right", paddingRight: "1.5rem" }}>Wallet Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topPhotographers.map((item, idx) => {
                          const username = item.user?.username || item.username || "Unknown";
                          const profilePic = item.user?.profilePicture || item.profilePicture || null;
                          const balance = item.balance ?? 0;
                          const isFirst = idx === 0;
                          return (
                            <tr
                              key={idx}
                              style={{
                                borderBottom: "1px solid rgba(255,255,255,0.04)",
                                background: isFirst ? "rgba(255,193,7,0.04)" : "transparent",
                              }}
                            >
                              <td style={{ paddingLeft: "1.5rem", verticalAlign: "middle" }}>
                                {isFirst ? (
                                  <span style={{ color: "#ffc107", fontWeight: 700, fontSize: "1rem" }}>
                                    <i className="fas fa-star me-1"></i>#1
                                  </span>
                                ) : (
                                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.88rem" }}>#{idx + 1}</span>
                                )}
                              </td>
                              <td style={{ verticalAlign: "middle" }}>
                                <div className="d-flex align-items-center gap-3">
                                  {profilePic ? (
                                    <img
                                      src={profilePic}
                                      alt={username}
                                      style={{
                                        width: "36px",
                                        height: "36px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                        border: isFirst ? "2px solid #ffc107" : "2px solid rgba(107,189,208,0.2)",
                                      }}
                                      onError={(e) => { e.target.style.display = "none"; }}
                                    />
                                  ) : (
                                    <div
                                      style={{
                                        width: "36px",
                                        height: "36px",
                                        borderRadius: "50%",
                                        background: isFirst ? "rgba(255,193,7,0.2)" : "rgba(107,189,208,0.15)",
                                        border: isFirst ? "2px solid #ffc107" : "2px solid rgba(107,189,208,0.25)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "0.72rem",
                                        fontWeight: 700,
                                        color: isFirst ? "#ffc107" : "var(--pm-teal, #6bbdd0)",
                                        flexShrink: 0,
                                      }}
                                    >
                                      {getInitials(username)}
                                    </div>
                                  )}
                                  <span style={{ fontWeight: isFirst ? 600 : 400, color: isFirst ? "#fff" : "rgba(255,255,255,0.75)" }}>
                                    {username}
                                  </span>
                                </div>
                              </td>
                              <td style={{ textAlign: "right", paddingRight: "1.5rem", verticalAlign: "middle" }}>
                                <span
                                  style={{
                                    fontWeight: 600,
                                    color: isFirst ? "#ffc107" : "var(--pm-teal, #6bbdd0)",
                                    fontSize: "0.9rem",
                                  }}
                                >
                                  {formatKES(balance)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
