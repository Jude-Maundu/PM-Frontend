import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import PhotographerLayout from "./PhotographerLayout";
import PageHeader from "../../PageHeader";
import { API_ENDPOINTS } from "../../../api/apiConfig";
import { getAuthHeaders, getCurrentUserId } from "../../../utils/auth";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getLast6Months() {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth(), label: MONTH_NAMES[d.getMonth()] });
  }
  return months;
}

const SalesAnalytics = () => {
  const [summary, setSummary] = useState({ total: 0, pending: 0, withdrawn: 0, available: 0 });
  const [transactions, setTransactions] = useState([]);
  const [ownMedia, setOwnMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  const photographerId = getCurrentUserId();
  const headers = getAuthHeaders();

  const fetchAll = useCallback(async () => {
    if (!photographerId) { setLoading(false); return; }
    try {
      setLoading(true);
      const [summaryRes, txRes, mediaRes] = await Promise.allSettled([
        axios.get(API_ENDPOINTS.PAYMENTS.EARNINGS_SUMMARY(photographerId), { headers }),
        axios.get(API_ENDPOINTS.PAYMENTS.EARNINGS(photographerId), { headers }),
        axios.get(API_ENDPOINTS.MEDIA.GET_MY, { headers }),
      ]);

      if (summaryRes.status === "fulfilled") {
        const d = summaryRes.value.data || {};
        setSummary({
          total: d.total || 0,
          pending: d.pending || 0,
          withdrawn: d.withdrawn || 0,
          available: d.available || 0,
        });
      }
      if (txRes.status === "fulfilled") {
        const raw = txRes.value.data;
        setTransactions(Array.isArray(raw) ? raw : (raw?.transactions || raw?.data || []));
      }
      if (mediaRes.status === "fulfilled") {
        const raw = mediaRes.value.data;
        setOwnMedia(Array.isArray(raw) ? raw : (raw?.media || raw?.data || []));
      }
    } catch (err) {
      console.error("SalesAnalytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [photographerId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Derived analytics ──────────────────────────────────────────────────

  const totalSales = transactions.length;
  const avgPrice = totalSales > 0 ? Math.round(summary.total / totalSales) : 0;

  // Earnings per month for last 6 months
  const last6 = getLast6Months();
  const monthlyEarnings = last6.map(({ year, month, label }) => {
    const earned = transactions
      .filter(t => {
        const d = new Date(t.createdAt || t.date || 0);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    return { label, earned };
  });
  const maxMonthly = Math.max(...monthlyEarnings.map(m => m.earned), 1);

  // ── Current month earnings ─────────────────────────────────────────────
  const now = new Date();
  const thisMonthEarnings = transactions
    .filter(t => {
      const d = new Date(t.createdAt || t.date || 0);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    })
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  // ── Top selling photos ─────────────────────────────────────────────────
  const mediaSalesMap = {};
  transactions.forEach(t => {
    const id = t.mediaId || t.media?._id || t.media;
    if (!id) return;
    if (!mediaSalesMap[id]) mediaSalesMap[id] = { count: 0, revenue: 0 };
    mediaSalesMap[id].count += 1;
    mediaSalesMap[id].revenue += Number(t.amount) || 0;
  });

  const topPhotos = ownMedia
    .map(m => ({
      ...m,
      sold: mediaSalesMap[m._id]?.count || 0,
      revenue: mediaSalesMap[m._id]?.revenue || 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // ── Category breakdown ─────────────────────────────────────────────────
  const catMap = {};
  ownMedia.forEach(m => {
    const cat = m.category || "Uncategorized";
    if (!catMap[cat]) catMap[cat] = 0;
    catMap[cat] += mediaSalesMap[m._id]?.revenue || 0;
  });
  const categories = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
  const maxCat = Math.max(...categories.map(c => c[1]), 1);

  if (loading) {
    return (
      <PhotographerLayout>
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <div className="spinner-border" style={{ color: "var(--mc-accent)" }}></div>
        </div>
      </PhotographerLayout>
    );
  }

  return (
    <PhotographerLayout>
      <PageHeader title="Sales Analytics" subtitle="Deep dive into your performance" />
      <div className="mc-page">
        {/* Top Stats */}
        <div className="mc-stats-row-sm" style={{ marginBottom: "1.25rem" }}>
          <div className="mc-stat-card">
            <div className="mc-stat-label">TOTAL EARNINGS</div>
            <div className="mc-stat-value">KES {summary.total.toLocaleString()}</div>
            <div className="mc-stat-trend up"><i className="fas fa-coins"></i> All time</div>
          </div>
          <div className="mc-stat-card">
            <div className="mc-stat-label">THIS MONTH</div>
            <div className="mc-stat-value">KES {thisMonthEarnings.toLocaleString()}</div>
            <div className="mc-stat-trend up"><i className="fas fa-calendar-check"></i> Current</div>
          </div>
          <div className="mc-stat-card">
            <div className="mc-stat-label">PHOTOS SOLD</div>
            <div className="mc-stat-value">{totalSales}</div>
            <div className="mc-stat-trend up"><i className="fas fa-shopping-bag"></i> Transactions</div>
          </div>
          <div className="mc-stat-card">
            <div className="mc-stat-label">AVG. PRICE / SALE</div>
            <div className="mc-stat-value">KES {avgPrice.toLocaleString()}</div>
            <div className="mc-stat-trend"><i className="fas fa-tag"></i> Average</div>
          </div>
        </div>

        {/* Bar Chart: Last 6 Months */}
        <div className="mc-card" style={{ marginBottom: "1.25rem" }}>
          <div className="mc-card-header">
            <span className="mc-card-title">EARNINGS — LAST 6 MONTHS</span>
          </div>
          {monthlyEarnings.every(m => m.earned === 0) ? (
            <div className="mc-empty">
              <i className="fas fa-chart-bar"></i>
              <p>No earnings data yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", height: "180px", padding: "8px 0" }}>
              {monthlyEarnings.map(({ label, earned }) => {
                const heightPct = maxMonthly > 0 ? Math.max((earned / maxMonthly) * 100, earned > 0 ? 4 : 0) : 0;
                return (
                  <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", height: "100%" }}>
                    <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.55)", textAlign: "center" }}>
                      {earned > 0 ? `KES ${(earned / 1000).toFixed(1)}k` : ""}
                    </div>
                    <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
                      <div
                        title={`${label}: KES ${earned.toLocaleString()}`}
                        style={{
                          width: "100%",
                          height: `${heightPct}%`,
                          background: earned > 0
                            ? "linear-gradient(180deg, var(--mc-accent) 0%, var(--mc-accent-teal) 100%)"
                            : "rgba(255,255,255,0.06)",
                          borderRadius: "6px 6px 0 0",
                          transition: "height 0.4s ease",
                          minHeight: "4px",
                        }}
                      />
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>{label}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="row g-4 mb-4">
          {/* Top Selling Photos */}
          <div className="col-lg-8">
            <div className="mc-table-card h-100">
              <div className="mc-card-header" style={{ padding: "1rem 1.25rem 0" }}>
                <span className="mc-card-title">TOP SELLING PHOTOS</span>
                <i className="fas fa-trophy" style={{ color: "var(--mc-accent-gold)" }}></i>
              </div>
              {topPhotos.length === 0 ? (
                <div className="mc-empty">
                  <i className="fas fa-image"></i>
                  <p>No sales data yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark table-hover mb-0">
                    <thead>
                      <tr>
                        <th className="ps-3" style={{ width: "50px" }}>#</th>
                        <th style={{ width: "60px" }}>Thumb</th>
                        <th>Title</th>
                        <th>Price (KES)</th>
                        <th>Times Sold</th>
                        <th className="pe-3">Revenue (KES)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topPhotos.map((photo, idx) => (
                        <tr key={photo._id || idx}>
                          <td className="ps-3 text-white-50">{idx + 1}</td>
                          <td>
                            {photo.fileUrl || photo.thumbnail ? (
                              <img
                                src={photo.fileUrl || photo.thumbnail}
                                alt={photo.title}
                                style={{ width: "42px", height: "42px", objectFit: "cover", borderRadius: "6px" }}
                                onError={e => { e.target.style.display = "none"; }}
                              />
                            ) : (
                              <div style={{ width: "42px", height: "42px", background: "rgba(91,127,229,0.1)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <i className="fas fa-image text-white-50" style={{ fontSize: "0.9rem" }}></i>
                              </div>
                            )}
                          </td>
                          <td className="fw-semibold text-truncate" style={{ maxWidth: "160px" }} title={photo.title}>
                            {photo.title || "Untitled"}
                          </td>
                          <td>
                            <span className="badge bg-warning text-dark">
                              {Number(photo.price || 0).toLocaleString()}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-info text-dark">{photo.sold}</span>
                          </td>
                          <td className="pe-3 text-success fw-semibold">
                            {photo.revenue.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="col-lg-4">
            <div className="mc-card h-100">
              <div className="mc-card-header">
                <span className="mc-card-title">EARNINGS BY CATEGORY</span>
              </div>
              {categories.length === 0 ? (
                <div className="mc-empty">
                  <i className="fas fa-layer-group"></i>
                  <p>No category data yet.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {categories.map(([cat, revenue]) => (
                    <div key={cat}>
                      <div className="d-flex justify-content-between mb-1">
                        <small className="text-white fw-semibold text-truncate" style={{ maxWidth: "130px" }} title={cat}>{cat}</small>
                        <small className="text-white-50">KES {revenue.toLocaleString()}</small>
                      </div>
                      <div className="mc-prog-track">
                        <div
                          className="mc-prog-fill"
                          style={{ width: `${(revenue / maxCat) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PhotographerLayout>
  );
};

export default SalesAnalytics;
