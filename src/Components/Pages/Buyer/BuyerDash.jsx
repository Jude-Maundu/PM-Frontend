import React, { useEffect, useState, useCallback } from "react";
import BuyerLayout from "./BuyerLayout";
import { Link } from "react-router-dom";
import {
  getAllMedia,
  getPurchaseHistory,
  getUserFavorites,
  getWalletBalance,
} from "../../../api/API";
import { placeholderMedium, placeholderSmall } from "../../../utils/placeholders";
import { getImageUrl } from "../../../utils/imageUrl";
import { getDisplayName } from "../../../utils/auth";

const BuyerDashboard = () => {
  const [featuredMedia, setFeaturedMedia] = useState([]);
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ purchases: 0, downloads: 0, favorites: 0, wallet: 0 });

  const token   = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const user    = userStr ? JSON.parse(userStr) : {};
  const displayName  = getDisplayName(user) || "Explorer";
  const avatarLetter = (displayName || "B").charAt(0).toUpperCase();
  const userId  = user?.id || user?._id;

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const mediaRes = await getAllMedia();
        let allMedia = [];
        if (Array.isArray(mediaRes.data?.media)) allMedia = mediaRes.data.media;
        else if (Array.isArray(mediaRes.data))    allMedia = mediaRes.data;

        let purchases = [], favorites = [], walletAmount = 0;

        if (userId) {
          try {
            const purchasesRes = await getPurchaseHistory(userId);
            const d = purchasesRes.data;
            purchases = Array.isArray(d) ? d
              : Array.isArray(d?.purchases) ? d.purchases
              : Array.isArray(d?.data) ? d.data : [];
          } catch {}

          try {
            const favRes = await getUserFavorites(userId);
            favorites = Array.isArray(favRes.data) ? favRes.data
              : Array.isArray(favRes.data?.favorites) ? favRes.data.favorites : [];
          } catch {}

          try {
            const walletRes = await getWalletBalance(userId);
            const wd = walletRes.data || {};
            walletAmount = Number(wd.balance ?? wd.netBalance ?? wd.amount ?? 0) || 0;
          } catch {}
        }

        if (!walletAmount) {
          const raw = localStorage.getItem("pm_wallet") || localStorage.getItem("wallet");
          if (raw) { try { walletAmount = Number(JSON.parse(raw)?.balance ?? raw) || 0; } catch {} }
        }

        setFeaturedMedia(allMedia.slice(0, 6));
        setRecentPurchases(purchases.slice(0, 5));
        setStats({
          purchases: purchases.length,
          downloads: purchases.filter(p => p.downloaded).length || purchases.length,
          favorites: favorites.length,
          wallet: walletAmount,
        });
      } catch (err) {
        console.error("BuyerDash fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <BuyerLayout>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "1rem" }}>
          <div className="spinner-border" style={{ color: "var(--mc-accent)", width: 48, height: 48 }}></div>
          <p style={{ color: "var(--mc-text-muted)", fontSize: "1rem", margin: 0 }}>Loading your dashboard…</p>
        </div>
      </BuyerLayout>
    );
  }

  return (
    <BuyerLayout>
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
              {greeting}, {displayName}!
            </h2>
            <p style={{ margin: "0 0 1.5rem", color: "rgba(255,255,255,0.82)", fontSize: "1rem" }}>
              {stats.purchases === 0
                ? "Welcome to Relic Snap! Discover beautiful Kenyan photography."
                : `You've purchased ${stats.purchases} photo${stats.purchases !== 1 ? "s" : ""}. Keep exploring!`}
            </p>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <Link to="/buyer/explore" style={{
                background: "#fff", color: "var(--mc-hero-from)", fontWeight: 700,
                padding: "0.7rem 1.5rem", borderRadius: 12, textDecoration: "none",
                fontSize: "0.95rem", display: "inline-flex", alignItems: "center", gap: "0.5rem",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}>
                <i className="fas fa-images"></i>Browse Albums
              </Link>
              <Link to="/buyer/downloads" style={{
                background: "rgba(255,255,255,0.18)", color: "#fff", fontWeight: 600,
                padding: "0.7rem 1.5rem", borderRadius: 12, textDecoration: "none",
                fontSize: "0.95rem", display: "inline-flex", alignItems: "center", gap: "0.5rem",
                border: "1px solid rgba(255,255,255,0.3)",
              }}>
                <i className="fas fa-download"></i>My Downloads
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
              {user?.profileImage
                ? <img src={user.profileImage} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : avatarLetter}
            </div>
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div className="dash-stats" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { icon: "fa-shopping-bag", label: "Photos Purchased", value: stats.purchases,                                    color: "#6BBDD0", bg: "rgba(107,189,208,0.12)" },
            { icon: "fa-download",     label: "Downloads",        value: stats.downloads,                                    color: "#4CC9A6", bg: "rgba(76,201,166,0.12)"  },
            { icon: "fa-heart",        label: "Favorites",        value: stats.favorites,                                    color: "#F06B8D", bg: "rgba(240,107,141,0.12)" },
            { icon: "fa-wallet",       label: "Wallet Balance",   value: `KES ${Number(stats.wallet).toLocaleString()}`,    color: "#F5A623", bg: "rgba(245,166,35,0.12)"  },
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
              { to: "/explore",           icon: "fa-search",          label: "Browse",     color: "#6BBDD0" },
              { to: "/buyer/downloads",   icon: "fa-download",        label: "Downloads",  color: "#4CC9A6" },
              { to: "/buyer/favorites",   icon: "fa-heart",           label: "Favorites",  color: "#F06B8D" },
              { to: "/buyer/cart",        icon: "fa-shopping-cart",   label: "My Cart",    color: "#F5A623" },
              { to: "/buyer/wallet",      icon: "fa-wallet",          label: "Wallet",     color: "#9D7FEB" },
              { to: "/buyer/profile",     icon: "fa-user",            label: "Profile",    color: "#1A2E3B" },
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

        {/* ── BOTTOM GRID: Featured Photos + Recent Purchases ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>

          {/* Featured Photos */}
          <div style={{
            background: "var(--mc-card-bg)", borderRadius: 16, padding: "1.5rem",
            border: "1px solid var(--mc-border)", boxShadow: "var(--mc-card-shadow)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.1rem" }}>
              <h6 style={{ margin: 0, fontWeight: 700, color: "var(--mc-text)", fontSize: "1rem" }}>
                <i className="fas fa-layer-group me-2" style={{ color: "var(--mc-accent)" }}></i>Discover Albums
              </h6>
              <Link to="/buyer/explore" style={{ fontSize: "0.8rem", color: "var(--mc-accent)", textDecoration: "none", fontWeight: 600 }}>
                Browse all
              </Link>
            </div>

            {featuredMedia.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
                <i className="fas fa-images fa-2x" style={{ color: "var(--mc-accent)", display: "block", marginBottom: "0.75rem", opacity: 0.45 }}></i>
                <p style={{ color: "var(--mc-text-muted)", margin: "0 0 0.5rem", fontSize: "0.9rem" }}>No photos yet</p>
                <Link to="/buyer/explore" style={{ color: "var(--mc-accent)", fontSize: "0.85rem", fontWeight: 600 }}>
                  Start exploring →
                </Link>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
                {featuredMedia.slice(0, 6).map((m, i) => {
                  const url = getImageUrl(m, placeholderMedium);
                  return (
                    <Link key={i} to="/buyer/explore" style={{ display: "block", borderRadius: 10, overflow: "hidden", aspectRatio: "1", background: "var(--mc-bg)", textDecoration: "none" }}>
                      <img
                        src={url || placeholderMedium}
                        alt={m.title || ""}
                        onError={e => { e.target.src = placeholderMedium; }}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Purchases */}
          <div style={{
            background: "var(--mc-card-bg)", borderRadius: 16, padding: "1.5rem",
            border: "1px solid var(--mc-border)", boxShadow: "var(--mc-card-shadow)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.1rem" }}>
              <h6 style={{ margin: 0, fontWeight: 700, color: "var(--mc-text)", fontSize: "1rem" }}>
                <i className="fas fa-receipt me-2" style={{ color: "#4CC9A6" }}></i>Recent Purchases
              </h6>
              <Link to="/buyer/transactions" style={{ fontSize: "0.8rem", color: "var(--mc-accent)", textDecoration: "none", fontWeight: 600 }}>
                View all
              </Link>
            </div>

            {recentPurchases.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
                <i className="fas fa-shopping-bag fa-2x" style={{ color: "var(--mc-accent)", display: "block", marginBottom: "0.75rem", opacity: 0.45 }}></i>
                <p style={{ color: "var(--mc-text-muted)", margin: "0 0 0.5rem", fontSize: "0.9rem" }}>No purchases yet</p>
                <Link to="/buyer/explore" style={{ color: "var(--mc-accent)", fontSize: "0.85rem", fontWeight: 600 }}>
                  Browse albums →
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                {recentPurchases.map((purchase, i) => {
                  const media = purchase.media || purchase;
                  const title = media.title || purchase.title || "Photo";
                  const amount = purchase.amount || purchase.price || 0;
                  const date = purchase.date || purchase.createdAt;
                  const imgUrl = getImageUrl(media, placeholderSmall);
                  return (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: "0.85rem",
                      padding: "0.65rem 0.85rem", borderRadius: 10,
                      background: "var(--mc-bg)", border: "1px solid var(--mc-border)",
                    }}>
                      <img
                        src={imgUrl || placeholderSmall}
                        alt={title}
                        onError={e => { e.target.src = placeholderSmall; }}
                        style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--mc-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {title}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--mc-text-muted)" }}>
                          {date ? new Date(date).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#4CC9A6", flexShrink: 0 }}>
                        KES {Number(amount).toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </BuyerLayout>
  );
};

export default BuyerDashboard;
