import React, { useEffect, useState, useCallback } from "react";
import BuyerLayout from "./BuyerLayout";
import { Link, useNavigate } from "react-router-dom";
import {
  getAllMedia,
  getPurchaseHistory,
  getUserFavorites,
  getWalletBalance,
  getLikedMedia,
  getUserFollowing,
} from "../../../api/API";
import { placeholderMedium, placeholderSmall } from "../../../utils/placeholders";
import { getImageUrl, fetchProtectedUrl } from "../../../utils/imageUrl";
import { getDisplayName } from "../../../utils/auth";
import ThemeToggle from "../../ThemeToggle";
import NotificationBell from "../../NotificationBell";

const BuyerDashboard = () => {
  const [featuredMedia, setFeaturedMedia] = useState([]);
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    purchases: 0,
    downloads: 0,
    favorites: 0,
    wallet: 0,
    totalSpent: 0
  });
  const [, setLikedItems] = useState(new Set());
  const [, setFollowingUsers] = useState(new Set());
  const [imageUrls, setImageUrls] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : {};
  const displayName = getDisplayName(user) || "Buyer";

  const userId = user?.id || user?._id || user?.userId || user?.uid;

  const loadLikedItems = useCallback(async () => {
    if (!token) return;
    try {
      const res = await getLikedMedia();
      const likedIds = new Set((res.data || []).map(item => item._id));
      setLikedItems(likedIds);
    } catch (err) {
      console.warn("Unable to load liked items", err);
    }
  }, [token]);

  const loadFollowingStatus = useCallback(async () => {
    if (!token || !userId) return;
    try {
      const res = await getUserFollowing(userId);
      const followingList = res.data?.following || [];
      const followingIds = new Set(followingList.map(u => u._id));
      setFollowingUsers(followingIds);
    } catch (err) {
      console.warn("Unable to load following status", err);
    }
  }, [token, userId]);

  // 🔧 FIXED: Better image resolution for any item
  const resolveImage = useCallback((item) => {
    if (!item) return placeholderMedium;
    
    // Try to get from imageUrls first
    const mediaId = item._id || item.mediaId || item.media?._id;
    if (mediaId && imageUrls[mediaId]) {
      return imageUrls[mediaId];
    }
    
    // Try direct getImageUrl
    return getImageUrl(item, placeholderMedium);
  }, [imageUrls]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get all media
        const mediaRes = await getAllMedia();
        let allMedia = [];
        if (Array.isArray(mediaRes.data?.media)) {
          allMedia = mediaRes.data.media;
        } else if (Array.isArray(mediaRes.data)) {
          allMedia = mediaRes.data;
        }
        console.log(`✅ Loaded ${allMedia.length} media items`);

        let purchases = [];
        let favorites = [];
        let walletAmount = 0;
        let totalSpent = 0;

        if (userId) {
          try {
            const purchasesRes = await getPurchaseHistory(userId);
            console.log("📦 Purchase history response:", purchasesRes.data);
            
            // Handle different response structures
            if (Array.isArray(purchasesRes.data)) {
              purchases = purchasesRes.data;
            } else if (purchasesRes.data?.purchases) {
              purchases = purchasesRes.data.purchases;
            } else if (purchasesRes.data?.purchaseHistory) {
              purchases = purchasesRes.data.purchaseHistory;
            } else if (purchasesRes.data?.data && Array.isArray(purchasesRes.data.data)) {
              purchases = purchasesRes.data.data;
            }
            
            // Calculate total spent
            totalSpent = purchases.reduce((sum, p) => sum + (p.amount || p.price || 0), 0);
            console.log(`✅ Found ${purchases.length} purchases, total spent: ${totalSpent}`);
          } catch (err) {
            console.log("ℹ️ No purchase history yet", err?.message || err);
          }

          try {
            const favRes = await getUserFavorites(userId);
            favorites = Array.isArray(favRes.data)
              ? favRes.data
              : Array.isArray(favRes.data?.favorites)
                ? favRes.data.favorites
                : [];
          } catch (err) {
            console.log("ℹ️ Favorites not available", err?.message || err);
          }

          try {
            const walletRes = await getWalletBalance(userId);
            const walletData = walletRes.data || {};
            walletAmount = Number(
              walletData.balance ??
              walletData.netBalance ??
              walletData.amount ??
              walletData.wallet ??
              0
            ) || 0;
          } catch (err) {
            console.log("ℹ️ Wallet balance unavailable", err?.message || err);
          }
        }

        // Fallback to localStorage wallet
        if (!walletAmount) {
          const rawWallet = localStorage.getItem("pm_wallet") || localStorage.getItem("wallet");
          if (rawWallet) {
            try {
              const parsedWallet = JSON.parse(rawWallet);
              walletAmount = Number(parsedWallet?.balance ?? parsedWallet?.amount ?? parsedWallet?.wallet ?? parsedWallet) || walletAmount;
            } catch {
              walletAmount = Number(rawWallet) || walletAmount;
            }
          }
        }

        const featured = allMedia.slice(0, 8);
        const rec = allMedia.slice(8, 14);

        setFeaturedMedia(featured);
        setRecommended(rec);
        setRecentPurchases(purchases.slice(0, 5));

        setStats({
          purchases: purchases.length || 0,
          downloads: purchases.filter(p => p.downloaded).length || purchases.length || 0,
          favorites: favorites.length || 0,
          wallet: walletAmount || 0,
          totalSpent: totalSpent || 0,
        });

        // Preload protected URLs for purchased/free items
        const purchasedMediaIds = new Set((purchases || []).map(p => p.media?._id || p.mediaId || p.media?._id || p._id));
        const itemsToResolve = [...featured, ...rec, ...purchases.slice(0, 5)];
        const urls = {};
        await Promise.all(
          itemsToResolve.map(async (item) => {
            // Get media ID from multiple possible locations
            const mediaId = item._id || item.mediaId || item.media?._id || item.id;
            if (!mediaId) return;

            const isFree = !item.price || item.price <= 0;
            const isPurchased = purchasedMediaIds.has(mediaId);

            if (!isFree && !isPurchased) return;

            const raw = getImageUrl(item, null);
            if (raw && !raw.includes("/opt/") && !raw.startsWith("file://") && raw.startsWith("http")) {
              urls[mediaId] = raw;
              return;
            }

            try {
              const protectedUrl = await fetchProtectedUrl(mediaId);
              if (protectedUrl && protectedUrl !== placeholderMedium) {
                urls[mediaId] = protectedUrl;
              }
            } catch (err) {
              console.debug("Could not resolve protected URL for", mediaId);
            }
          })
        );
        setImageUrls(urls);

        await loadLikedItems();
        await loadFollowingStatus();

      } catch (err) {
        console.error("❌ Error fetching data:", err);
        setError(err.response?.data?.message || "Failed to load content. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, loadLikedItems, loadFollowingStatus]);


  // 🔧 Helper to get image for purchase item
  const getPurchaseImageUrl = (purchase) => {
    // Try multiple locations where the image URL might be
    const media = purchase.media || purchase;
    
    // Get media ID
    const mediaId = purchase._id || purchase.mediaId || purchase.media?._id || media._id;
    
    // Check if we have a pre-fetched URL
    if (mediaId && imageUrls[mediaId]) {
      return imageUrls[mediaId];
    }
    
    // Check for direct URL in media
    if (media.fileUrl) {
      const filename = media.fileUrl.split('/').pop();
      if (filename) {
        return `${process.env.REACT_APP_API_URL?.replace('/api', '') || 'https://pm-backend-f3b6.onrender.com'}/uploads/photos/${filename}`;
      }
    }
    
    // Check for thumbnail or image field
    if (media.thumbnail) return media.thumbnail;
    if (media.image) return media.image;
    if (media.imageUrl) return media.imageUrl;
    
    // Try getImageUrl utility
    return getImageUrl(media, placeholderSmall);
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
  const busynessPct = Math.min(99, Math.round((stats.purchases / Math.max(stats.favorites + 1, 1)) * 100)) || 35;
  const budgetUsedPct = Math.min(99, Math.round(stats.totalSpent / 5000 * 100));
  const downloadsPct = Math.min(99, Math.round(stats.downloads * 10));
  const collectionPct = Math.min(99, Math.round(stats.favorites * 5));
  const avatarLetter = (displayName || "B").charAt(0).toUpperCase();

  const eventList = [
    { count: stats.purchases, label: "Purchases", color: "#F06B8D" },
    { count: stats.downloads, label: "Downloads", color: "#4CC9A6" },
    { count: stats.favorites, label: "Favorites", color: "#9D7FEB" },
  ];

  if (loading) {
    return (
      <BuyerLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
          <div className="spinner-border" style={{ color: "var(--mc-accent)" }}></div>
        </div>
      </BuyerLayout>
    );
  }

  if (error) {
    return (
      <BuyerLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
          <div className="spinner-border" style={{ color: "var(--mc-accent)" }}></div>
        </div>
      </BuyerLayout>
    );
  }

  return (
    <BuyerLayout>
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
        <div className="mc-hero-art">🛒</div>
      </div>

      {/* Stat Cards */}
      <div className="mc-stats-row">
        {/* Card 1: My Purchases */}
        <div className="mc-stat-card">
          <div className="mc-stat-header">
            <span className="mc-stat-label">My Purchases</span>
            <span className="mc-stat-dots">···</span>
          </div>
          <div className="mc-stat-value">{stats.purchases}</div>
          <div className="mc-stat-sub">images bought</div>
          <div className="mc-stat-trend up">
            <Sparkline values={sparkValues} color="#F06B8D" />
          </div>
        </div>

        {/* Card 2: Downloads */}
        <div className="mc-stat-card">
          <div className="mc-stat-header">
            <span className="mc-stat-label">Downloads</span>
            <span className="mc-stat-dots">···</span>
          </div>
          <div className="mc-stat-value">{stats.downloads}</div>
          <div className="mc-stat-sub">files downloaded</div>
          <div className="mc-stat-trend up">
            <Sparkline values={sparkValues} color="#4CC9A6" />
          </div>
        </div>

        {/* Card 3: Wallet */}
        <div className="mc-stat-card">
          <div className="mc-stat-header">
            <span className="mc-stat-label">Wallet</span>
            <span className="mc-stat-dots">···</span>
          </div>
          <div className="mc-stat-value">{"KES " + stats.wallet.toLocaleString()}</div>
          <div className="mc-stat-sub">current balance</div>
          <div className="mc-stat-trend neu">
            <Sparkline values={sparkValues} color="#5B7FE5" />
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="mc-bottom-grid">
        {/* Left: Donut + event list */}
        <div className="mc-card">
          <div className="mc-card-header">
            <span className="mc-card-title">MY ACTIVITY</span>
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
              <h4>Activity</h4>
              <p>purchases / collection</p>
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
            <span className="mc-card-title">MY GOALS</span>
            <span className="mc-card-badge">Today</span>
          </div>

          <div className="mc-prog-row">
            <span className="mc-prog-label">Budget Used</span>
            <span className="mc-prog-pct">{budgetUsedPct}%</span>
            <div className="mc-prog-track">
              <div className="mc-prog-fill" style={{ width: `${budgetUsedPct}%`, background: "#5B7FE5" }}></div>
            </div>
          </div>

          <div className="mc-prog-row">
            <span className="mc-prog-label">Downloads</span>
            <span className="mc-prog-pct">{downloadsPct}%</span>
            <div className="mc-prog-track">
              <div className="mc-prog-fill" style={{ width: `${downloadsPct}%`, background: "#F06B8D" }}></div>
            </div>
          </div>

          <div className="mc-prog-row">
            <span className="mc-prog-label">Collection</span>
            <span className="mc-prog-pct">{collectionPct}%</span>
            <div className="mc-prog-track">
              <div className="mc-prog-fill" style={{ width: `${collectionPct}%`, background: "#4CC9A6" }}></div>
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
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  <div className="mc-avatar-placeholder">{avatarLetter}</div>
                )}
              </div>
              <div className="mc-profile-name">{displayName}</div>
              <div className="mc-profile-role">Buyer</div>
              {user?.location && (
                <div className="mc-profile-loc">
                  <i className="fas fa-map-marker-alt" style={{ marginRight: 4 }}></i>
                  {user.location}
                </div>
              )}
            </div>
            <div className="mc-profile-stats">
              <div className="mc-pstat">
                <div className="mc-pstat-val">{stats.purchases}</div>
                <div className="mc-pstat-lbl">Bought</div>
              </div>
              <div className="mc-pstat">
                <div className="mc-pstat-val">{stats.downloads}</div>
                <div className="mc-pstat-lbl">DL</div>
              </div>
              <div className="mc-pstat">
                <div className="mc-pstat-val">{stats.favorites}</div>
                <div className="mc-pstat-lbl">Favs</div>
              </div>
            </div>
          </div>

          {/* Mini calendar */}
          <div className="mc-card">
            <MiniCalendar />
          </div>

          {/* Recent purchases schedule */}
          <div className="mc-card">
            <div className="mc-card-header">
              <span className="mc-card-title">RECENT PURCHASES</span>
            </div>
            <div className="mc-schedule">
              {recentPurchases.slice(0, 4).map((purchase, idx) => {
                const mediaItem = purchase.media || purchase;
                const title = mediaItem.title || purchase.title || "Photo";
                const date = purchase.date || purchase.createdAt || Date.now();
                return (
                  <div className="mc-sched-item" key={idx}>
                    <span className="mc-sched-dot" style={{ background: "#F06B8D" }}></span>
                    <div className="mc-sched-body">
                      <div className="mc-sched-time">{new Date(date).toLocaleDateString()}</div>
                      <div className="mc-sched-text">{title}</div>
                    </div>
                  </div>
                );
              })}
              {recentPurchases.length === 0 && (
                <div style={{ color: "var(--mc-text-muted)", fontSize: "0.8rem", textAlign: "center", padding: "0.75rem 0" }}>
                  No recent purchases
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </BuyerLayout>
  );
};

export default BuyerDashboard;