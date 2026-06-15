import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../../../api/apiConfig";
import { getAuthHeaders, getStoredUser, getDisplayName } from "../../../utils/auth";

const API = API_BASE_URL;

export default function AdminDash() {
  const storedUser   = getStoredUser();
  const adminName    = getDisplayName(storedUser) || "Admin";
  const avatarLetter = adminName.charAt(0).toUpperCase();
  const headers      = getAuthHeaders();

  const [health,     setHealth]     = useState(null);
  const [recentTxns, setRecentTxns] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading,    setLoading]    = useState(true);

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [healthRes, receiptsRes, logsRes] = await Promise.all([
        axios.get(`${API}/admin/health`,            { headers }).catch(() => ({ data: {} })),
        axios.get(`${API}/payments/admin/receipts`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API}/admin/logs?limit=6`,      { headers }).catch(() => ({ data: { data: [] } })),
      ]);
      setHealth(healthRes.data || {});
      setRecentTxns((receiptsRes.data || []).slice(0, 6));
      setRecentLogs((logsRes.data?.data || []).slice(0, 6));
    } catch (e) {
      console.error("AdminDash fetch error:", e);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalUsers          = health?.totalUsers         ?? 0;
  const pendingMedia        = health?.pendingMedia        ?? 0;
  const salesToday          = health?.salesToday          ?? 0;
  const pendingWithdrawals  = health?.pendingWithdrawals  ?? 0;
  const pendingApplications = health?.pendingApplications ?? 0;
  const totalUrgent         = pendingWithdrawals + pendingApplications + pendingMedia;

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "1rem" }}>
          <div className="spinner-border" style={{ color: "var(--mc-accent)", width: 48, height: 48 }}></div>
          <p style={{ color: "var(--mc-text-muted)", fontSize: "1rem", margin: 0 }}>Loading dashboard…</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="dash-outer">

        {/* ── WELCOME HERO ── */}
        <div className="dash-hero" style={{
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
              {greeting}, {adminName}!
            </h2>
            <p style={{ margin: "0 0 1.5rem", color: "rgba(255,255,255,0.82)", fontSize: "1rem" }}>
              {totalUrgent > 0
                ? `You have ${totalUrgent} item${totalUrgent !== 1 ? "s" : ""} that need${totalUrgent === 1 ? "s" : ""} your attention.`
                : "Everything looks great — no pending actions right now!"}
            </p>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <Link to="/admin/media-approval" style={{
                background: "#fff", color: "var(--mc-hero-from)", fontWeight: 700,
                padding: "0.7rem 1.5rem", borderRadius: 12, textDecoration: "none",
                fontSize: "0.95rem", display: "inline-flex", alignItems: "center", gap: "0.5rem",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}>
                <i className="fas fa-camera-retro"></i>Photo Approval
                {pendingMedia > 0 && (
                  <span style={{ background: "#F06B8D", color: "#fff", borderRadius: 99, padding: "1px 7px", fontSize: "0.75rem", fontWeight: 700 }}>
                    {pendingMedia}
                  </span>
                )}
              </Link>
              <Link to="/admin/users" style={{
                background: "rgba(255,255,255,0.18)", color: "#fff", fontWeight: 600,
                padding: "0.7rem 1.5rem", borderRadius: 12, textDecoration: "none",
                fontSize: "0.95rem", display: "inline-flex", alignItems: "center", gap: "0.5rem",
                border: "1px solid rgba(255,255,255,0.3)",
              }}>
                <i className="fas fa-users"></i>Manage Users
              </Link>
            </div>
          </div>
          <div className="dash-hero-avatar" style={{ flexShrink: 0 }}>
            <div style={{
              width: 96, height: 96, borderRadius: "50%",
              border: "4px solid rgba(255,255,255,0.4)", overflow: "hidden",
              background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "2.2rem", fontWeight: 700, color: "#fff",
            }}>
              {storedUser?.profilePicture
                ? <img src={storedUser.profilePicture} alt={adminName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : avatarLetter}
            </div>
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div className="dash-stats" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { icon: "fa-users",         label: "Total Users",          value: totalUsers,                                      color: "#6BBDD0", bg: "rgba(107,189,208,0.12)", to: "/admin/users" },
            { icon: "fa-camera",        label: "Pending Approval",     value: pendingMedia,                                    color: "#F5A623", bg: "rgba(245,166,35,0.12)",  to: "/admin/media-approval" },
            { icon: "fa-coins",         label: "Revenue Today",        value: `KES ${Number(salesToday).toLocaleString()}`,   color: "#4CC9A6", bg: "rgba(76,201,166,0.12)",  to: "/admin/transactions" },
            { icon: "fa-money-bill-alt",label: "Pending Withdrawals",  value: pendingWithdrawals,                              color: "#9D7FEB", bg: "rgba(157,127,235,0.12)", to: "/admin/withdrawals" },
          ].map(stat => (
            <Link key={stat.label} to={stat.to} style={{ textDecoration: "none" }}>
              <div style={{
                background: "var(--mc-card-bg)", borderRadius: 16, padding: "1.4rem 1.25rem",
                border: "1px solid var(--mc-border)", boxShadow: "var(--mc-card-shadow)",
                display: "flex", alignItems: "center", gap: "1rem",
                cursor: "pointer",
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
            </Link>
          ))}
        </div>

        {/* ── URGENT ACTIONS (show only if there are pending items) ── */}
        {(pendingMedia > 0 || pendingApplications > 0 || pendingWithdrawals > 0) && (
          <div style={{ marginBottom: "2rem" }}>
            <h6 style={{ margin: "0 0 0.75rem", fontSize: "0.78rem", fontWeight: 700, color: "var(--mc-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Needs Your Attention
            </h6>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              {pendingMedia > 0 && (
                <Link to="/admin/media-approval" style={{
                  display: "flex", alignItems: "center", gap: "1rem",
                  padding: "1rem 1.25rem", borderRadius: 12, textDecoration: "none",
                  background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.28)",
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(245,166,35,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className="fas fa-camera-retro" style={{ color: "#F5A623", fontSize: "1.1rem" }}></i>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "var(--mc-text)", fontSize: "0.95rem" }}>
                      {pendingMedia} photo{pendingMedia !== 1 ? "s" : ""} waiting for approval
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "var(--mc-text-muted)" }}>Photographers submitted new photos — review before they go live</div>
                  </div>
                  <i className="fas fa-chevron-right" style={{ color: "var(--mc-text-muted)" }}></i>
                </Link>
              )}
              {pendingApplications > 0 && (
                <Link to="/admin/applications" style={{
                  display: "flex", alignItems: "center", gap: "1rem",
                  padding: "1rem 1.25rem", borderRadius: 12, textDecoration: "none",
                  background: "rgba(107,189,208,0.08)", border: "1px solid rgba(107,189,208,0.22)",
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(107,189,208,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className="fas fa-user-clock" style={{ color: "var(--mc-accent)", fontSize: "1.1rem" }}></i>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "var(--mc-text)", fontSize: "0.95rem" }}>
                      {pendingApplications} photographer application{pendingApplications !== 1 ? "s" : ""}
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "var(--mc-text-muted)" }}>New users applied to become photographers</div>
                  </div>
                  <i className="fas fa-chevron-right" style={{ color: "var(--mc-text-muted)" }}></i>
                </Link>
              )}
              {pendingWithdrawals > 0 && (
                <Link to="/admin/withdrawals" style={{
                  display: "flex", alignItems: "center", gap: "1rem",
                  padding: "1rem 1.25rem", borderRadius: 12, textDecoration: "none",
                  background: "rgba(157,127,235,0.08)", border: "1px solid rgba(157,127,235,0.22)",
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(157,127,235,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className="fas fa-money-bill-wave" style={{ color: "#9D7FEB", fontSize: "1.1rem" }}></i>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "var(--mc-text)", fontSize: "0.95rem" }}>
                      {pendingWithdrawals} pending withdrawal{pendingWithdrawals !== 1 ? "s" : ""}
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "var(--mc-text-muted)" }}>Photographers are waiting for their payments</div>
                  </div>
                  <i className="fas fa-chevron-right" style={{ color: "var(--mc-text-muted)" }}></i>
                </Link>
              )}
            </div>
          </div>
        )}

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
              { to: "/admin/media-approval", icon: "fa-camera-retro",  label: "Approvals",   color: "#F5A623" },
              { to: "/admin/users",          icon: "fa-users",          label: "Users",       color: "#6BBDD0" },
              { to: "/admin/media",          icon: "fa-photo-video",    label: "All Media",   color: "#4CC9A6" },
              { to: "/admin/analytics",      icon: "fa-chart-bar",      label: "Analytics",   color: "#9D7FEB" },
              { to: "/admin/withdrawals",    icon: "fa-money-bill-wave",label: "Withdrawals", color: "#F06B8D" },
              { to: "/admin/moderation",     icon: "fa-shield-alt",     label: "Moderation",  color: "#1A2E3B" },
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

        {/* ── BOTTOM GRID: Recent Transactions + Recent Activity ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>

          {/* Recent Transactions */}
          <div style={{
            background: "var(--mc-card-bg)", borderRadius: 16, padding: "1.5rem",
            border: "1px solid var(--mc-border)", boxShadow: "var(--mc-card-shadow)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.1rem" }}>
              <h6 style={{ margin: 0, fontWeight: 700, color: "var(--mc-text)", fontSize: "1rem" }}>
                <i className="fas fa-exchange-alt me-2" style={{ color: "var(--mc-accent)" }}></i>Recent Transactions
              </h6>
              <Link to="/admin/transactions" style={{ fontSize: "0.8rem", color: "var(--mc-accent)", textDecoration: "none", fontWeight: 600 }}>
                View all
              </Link>
            </div>

            {recentTxns.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
                <i className="fas fa-receipt fa-2x" style={{ color: "var(--mc-accent)", display: "block", marginBottom: "0.75rem", opacity: 0.45 }}></i>
                <p style={{ color: "var(--mc-text-muted)", margin: 0, fontSize: "0.9rem" }}>No transactions yet</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                {recentTxns.map((t, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: "0.85rem",
                    padding: "0.65rem 0.85rem", borderRadius: 10,
                    background: "var(--mc-bg)", border: "1px solid var(--mc-border)",
                  }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: "rgba(76,201,166,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className="fas fa-coins" style={{ color: "#4CC9A6", fontSize: "0.9rem" }}></i>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--mc-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {t.user?.username || t.user?.email?.split("@")[0] || "User"}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--mc-text-muted)" }}>
                        {t.type || "purchase"} · {new Date(t.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#4CC9A6", flexShrink: 0 }}>
                      KES {Number(t.amount || 0).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity / Audit Logs */}
          <div style={{
            background: "var(--mc-card-bg)", borderRadius: 16, padding: "1.5rem",
            border: "1px solid var(--mc-border)", boxShadow: "var(--mc-card-shadow)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.1rem" }}>
              <h6 style={{ margin: 0, fontWeight: 700, color: "var(--mc-text)", fontSize: "1rem" }}>
                <i className="fas fa-clipboard-list me-2" style={{ color: "#9D7FEB" }}></i>Recent Activity
              </h6>
              <Link to="/admin/logs" style={{ fontSize: "0.8rem", color: "var(--mc-accent)", textDecoration: "none", fontWeight: 600 }}>
                View all
              </Link>
            </div>

            {recentLogs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
                <i className="fas fa-clipboard-list fa-2x" style={{ color: "var(--mc-accent)", display: "block", marginBottom: "0.75rem", opacity: 0.45 }}></i>
                <p style={{ color: "var(--mc-text-muted)", margin: 0, fontSize: "0.9rem" }}>No activity logs yet</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                {recentLogs.map((log, i) => {
                  const isNegative = log.action?.includes("reject") || log.action?.includes("ban");
                  const color = isNegative ? "#F06B8D" : "#4CC9A6";
                  const icon  = isNegative ? "fa-times-circle" : "fa-check-circle";
                  return (
                    <div key={i} style={{
                      display: "flex", alignItems: "flex-start", gap: "0.75rem",
                      padding: "0.65rem 0.85rem", borderRadius: 10,
                      background: "var(--mc-bg)", border: "1px solid var(--mc-border)",
                    }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
                        <i className={`fas ${icon}`} style={{ color, fontSize: "0.85rem" }}></i>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: "0.82rem", color: "var(--mc-text)" }}>
                          {log.adminName || "Admin"} — {(log.action || "action").replace(/_/g, " ")}
                        </div>
                        <div style={{ fontSize: "0.73rem", color: "var(--mc-text-muted)" }}>
                          {new Date(log.createdAt).toLocaleString("en-KE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}
