import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import PhotographerLayout from "./PhotographerLayout";
import { Link } from "react-router-dom";
import { API_BASE_URL, API_ENDPOINTS } from "../../../api/apiConfig";
import { placeholderSmall } from "../../../utils/placeholders";
import { getImageUrl, fetchProtectedUrl } from "../../../utils/imageUrl";
import { getAuthHeaders, getCurrentUserId, getDisplayName, getStoredUser } from "../../../utils/auth";

const API = API_BASE_URL;

const PhotographerDashboard = () => {
  const [stats, setStats]             = useState({ totalMedia: 0, totalSales: 0, totalEarnings: 0, pendingEarnings: 0 });
  const [recentSales, setRecentSales] = useState([]);
  const [myMedia, setMyMedia]         = useState([]);
  const [imageUrls, setImageUrls]     = useState({});
  const [loading, setLoading]         = useState(true);

  const photographerId = getCurrentUserId();
  const storedUser     = getStoredUser();
  const displayName    = getDisplayName(storedUser) || "Photographer";
  const headers        = getAuthHeaders();
  const avatarLetter   = displayName.charAt(0).toUpperCase();

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const fetchDashboardData = useCallback(async () => {
    if (!photographerId) { setLoading(false); return; }
    try {
      setLoading(true);
      const [mediaRes, earningsRes, salesRes] = await Promise.allSettled([
        axios.get(`${API}/media/mine`, { headers }),
        axios.get(API_ENDPOINTS.PAYMENTS.EARNINGS_SUMMARY(photographerId), { headers }),
        axios.get(API_ENDPOINTS.PAYMENTS.TRANSACTIONS(photographerId), { headers }),
      ]);

      const media = mediaRes.status === "fulfilled"
        ? (Array.isArray(mediaRes.value.data) ? mediaRes.value.data : mediaRes.value.data?.media || [])
        : [];
      const earnings = earningsRes.status === "fulfilled" ? earningsRes.value.data : {};
      const sales    = salesRes.status === "fulfilled"
        ? (Array.isArray(salesRes.value.data) ? salesRes.value.data : [])
        : [];

      setMyMedia(media);
      setStats({
        totalMedia:      media.length,
        totalSales:      sales.length,
        totalEarnings:   earnings?.total || 0,
        pendingEarnings: earnings?.pending || 0,
      });
      setRecentSales(sales.slice(0, 5));

      const urls = {};
      await Promise.all(media.slice(0, 12).map(async (item) => {
        const raw = getImageUrl(item, null);
        if (!raw || raw.includes("/opt/")) {
          const id = item._id;
          if (id) { const u = await fetchProtectedUrl(id).catch(() => null); if (u) urls[id] = u; }
        }
      }));
      setImageUrls(urls);
    } catch (e) {
      console.error("Dashboard error", e);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photographerId]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  if (loading) {
    return (
      <PhotographerLayout>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "1rem" }}>
          <div className="spinner-border" style={{ color: "var(--mc-accent)", width: 48, height: 48 }}></div>
          <p style={{ color: "var(--mc-text-muted)", fontSize: "1rem", margin: 0 }}>Loading your dashboard…</p>
        </div>
      </PhotographerLayout>
    );
  }

  return (
    <PhotographerLayout>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1.5rem 1rem 3rem" }}>

        {/* ── WELCOME HERO ── */}
        <div style={{
          background: "linear-gradient(135deg, var(--mc-hero-from) 0%, var(--mc-hero-to) 100%)",
          borderRadius: 20, padding: "2rem 2.5rem", marginBottom: "2rem",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: "1.5rem",
          boxShadow: "0 8px 32px rgba(26,46,59,0.18)",
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: "0 0 0.25rem", fontSize: "0.9rem", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>
              {new Date().toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
            <h2 style={{
              margin: "0 0 0.5rem", color: "#fff",
              fontFamily: "var(--font-serif)", fontWeight: 700,
              fontSize: "clamp(1.4rem, 4vw, 2.1rem)",
            }}>
              {greeting}, {displayName}!
            </h2>
            <p style={{ margin: "0 0 1.5rem", color: "rgba(255,255,255,0.82)", fontSize: "1rem" }}>
              {stats.totalMedia === 0
                ? "Welcome! Upload your first photo to get started on the marketplace."
                : `You have ${stats.totalMedia} photo${stats.totalMedia !== 1 ? "s" : ""} on the marketplace.`}
            </p>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <Link to="/photographer/upload" style={{
                background: "#fff", color: "var(--mc-hero-from)", fontWeight: 700,
                padding: "0.7rem 1.5rem", borderRadius: 12, textDecoration: "none",
                fontSize: "0.95rem", display: "inline-flex", alignItems: "center", gap: "0.5rem",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}>
                <i className="fas fa-cloud-upload-alt"></i>Upload Photo
              </Link>
              <Link to="/photographer/media" style={{
                background: "rgba(255,255,255,0.18)", color: "#fff", fontWeight: 600,
                padding: "0.7rem 1.5rem", borderRadius: 12, textDecoration: "none",
                fontSize: "0.95rem", display: "inline-flex", alignItems: "center", gap: "0.5rem",
                border: "1px solid rgba(255,255,255,0.3)",
              }}>
                <i className="fas fa-images"></i>My Photos
              </Link>
            </div>
          </div>
          <div style={{ flexShrink: 0 }}>
            <div style={{
              width: 96, height: 96, borderRadius: "50%",
              border: "4px solid rgba(255,255,255,0.4)", overflow: "hidden",
              background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "2.2rem", fontWeight: 700, color: "#fff",
            }}>
              {storedUser?.profilePicture
                ? <img src={storedUser.profilePicture} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : avatarLetter}
            </div>
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { icon: "fa-images",       label: "Total Photos",     value: stats.totalMedia,                                        color: "#6BBDD0", bg: "rgba(107,189,208,0.12)" },
            { icon: "fa-shopping-bag", label: "Photos Sold",      value: stats.totalSales,                                        color: "#4CC9A6", bg: "rgba(76,201,166,0.12)"  },
            { icon: "fa-coins",        label: "Total Earnings",   value: `KES ${Number(stats.totalEarnings).toLocaleString()}`,   color: "#F5A623", bg: "rgba(245,166,35,0.12)"  },
            { icon: "fa-wallet",       label: "Available Balance",value: `KES ${Number(stats.pendingEarnings).toLocaleString()}`, color: "#9D7FEB", bg: "rgba(157,127,235,0.12)" },
          ].map(stat => (
            <div key={stat.label} style={{
              background: "var(--mc-card-bg)", borderRadius: 16, padding: "1.4rem 1.25rem",
              border: "1px solid var(--mc-border)", boxShadow: "var(--mc-card-shadow)",
              display: "flex", alignItems: "center", gap: "1rem",
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, background: stat.bg, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <i className={`fas ${stat.icon}`} style={{ fontSize: "1.25rem", color: stat.color }}></i>
              </div>
              <div>
                <div style={{ fontSize: "0.78rem", color: "var(--mc-text-muted)", fontWeight: 500, marginBottom: "0.25rem" }}>{stat.label}</div>
                <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--mc-text)", lineHeight: 1 }}>{stat.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div style={{
          background: "var(--mc-card-bg)", borderRadius: 16, padding: "1.5rem",
          marginBottom: "2rem", border: "1px solid var(--mc-border)", boxShadow: "var(--mc-card-shadow)",
        }}>
          <h6 style={{ margin: "0 0 1.1rem", fontSize: "0.78rem", fontWeight: 700, color: "var(--mc-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Quick Actions
          </h6>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {[
              { to: "/photographer/upload",    icon: "fa-cloud-upload-alt", label: "Upload",    color: "#6BBDD0" },
              { to: "/photographer/media",     icon: "fa-photo-video",      label: "My Media",  color: "#4CC9A6" },
              { to: "/photographer/earnings",  icon: "fa-coins",            label: "Earnings",  color: "#F5A623" },
              { to: "/photographer/analytics", icon: "fa-chart-line",       label: "Analytics", color: "#9D7FEB" },
              { to: "/photographer/profile",   icon: "fa-user",             label: "Profile",   color: "#F06B8D" },
              { to: "/photographer/portfolio", icon: "fa-globe",            label: "Portfolio", color: "#1A2E3B" },
            ].map(action => (
              <Link key={action.to} to={action.to} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "0.45rem",
                padding: "1rem 1.1rem", borderRadius: 12, textDecoration: "none",
                background: "var(--mc-bg)", border: "1px solid var(--mc-border)", minWidth: 76,
              }}>
                <i className={`fas ${action.icon}`} style={{ fontSize: "1.35rem", color: action.color }}></i>
                <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--mc-text)" }}>{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── BOTTOM GRID: Recent Photos + Recent Sales ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>

          {/* Recent Photos */}
          <div style={{
            background: "var(--mc-card-bg)", borderRadius: 16, padding: "1.5rem",
            border: "1px solid var(--mc-border)", boxShadow: "var(--mc-card-shadow)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.1rem" }}>
              <h6 style={{ margin: 0, fontWeight: 700, color: "var(--mc-text)", fontSize: "1rem" }}>
                <i className="fas fa-images me-2" style={{ color: "var(--mc-accent)" }}></i>Recent Photos
              </h6>
              <Link to="/photographer/media" style={{ fontSize: "0.8rem", color: "var(--mc-accent)", textDecoration: "none", fontWeight: 600 }}>
                View all
              </Link>
            </div>

            {myMedia.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
                <i className="fas fa-camera fa-2x" style={{ color: "var(--mc-accent)", display: "block", marginBottom: "0.75rem", opacity: 0.45 }}></i>
                <p style={{ color: "var(--mc-text-muted)", margin: "0 0 0.5rem", fontSize: "0.9rem" }}>No photos yet</p>
                <Link to="/photographer/upload" style={{ color: "var(--mc-accent)", fontSize: "0.85rem", fontWeight: 600 }}>
                  Upload your first photo →
                </Link>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
                {myMedia.slice(0, 9).map((m, i) => {
                  const url        = imageUrls[m._id] || getImageUrl(m, placeholderSmall);
                  const isRejected = !!m.rejectionReason;
                  const isApproved = m.isApproved === true && !isRejected;
                  return (
                    <div key={i} style={{ position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: "1", background: "var(--mc-bg)" }}>
                      <img
                        src={url || placeholderSmall}
                        alt={m.title || ""}
                        onError={e => { e.target.src = placeholderSmall; }}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                      <div style={{
                        position: "absolute", top: 4, right: 4,
                        background: isRejected ? "rgba(220,53,69,0.92)" : isApproved ? "rgba(76,201,166,0.92)" : "rgba(245,166,35,0.92)",
                        color: "#fff", fontSize: "0.6rem", fontWeight: 700,
                        padding: "2px 6px", borderRadius: 4,
                      }}>
                        {isRejected ? "Rejected" : isApproved ? "Live" : "Pending"}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Sales */}
          <div style={{
            background: "var(--mc-card-bg)", borderRadius: 16, padding: "1.5rem",
            border: "1px solid var(--mc-border)", boxShadow: "var(--mc-card-shadow)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.1rem" }}>
              <h6 style={{ margin: 0, fontWeight: 700, color: "var(--mc-text)", fontSize: "1rem" }}>
                <i className="fas fa-shopping-bag me-2" style={{ color: "#4CC9A6" }}></i>Recent Sales
              </h6>
              <Link to="/photographer/sales" style={{ fontSize: "0.8rem", color: "var(--mc-accent)", textDecoration: "none", fontWeight: 600 }}>
                View all
              </Link>
            </div>

            {recentSales.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
                <i className="fas fa-shopping-bag fa-2x" style={{ color: "var(--mc-accent)", display: "block", marginBottom: "0.75rem", opacity: 0.45 }}></i>
                <p style={{ color: "var(--mc-text-muted)", margin: "0 0 0.25rem", fontSize: "0.9rem" }}>No sales yet</p>
                <p style={{ color: "var(--mc-text-muted)", fontSize: "0.82rem", margin: 0 }}>Keep uploading great photos!</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                {recentSales.map((sale, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: "0.85rem",
                    padding: "0.65rem 0.85rem", borderRadius: 10,
                    background: "var(--mc-bg)", border: "1px solid var(--mc-border)",
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                      background: "rgba(107,189,208,0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <i className="fas fa-image" style={{ color: "var(--mc-accent)" }}></i>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--mc-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {sale.mediaTitle || sale.description || "Photo Sale"}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--mc-text-muted)" }}>
                        {new Date(sale.createdAt || sale.date || Date.now()).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#4CC9A6", flexShrink: 0 }}>
                      +KES {Number(sale.amount || 0).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </PhotographerLayout>
  );
};

export default PhotographerDashboard;
