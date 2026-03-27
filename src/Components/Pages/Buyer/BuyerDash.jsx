
import React, { useEffect, useState, useCallback } from "react";
import BuyerLayout from "./BuyerLayout";
import { Link } from "react-router-dom";
import {
  getAllMedia,
  getPurchaseHistory,
  getUserFavorites,
  getWalletBalance,
  getLikedMedia,
  addFavorite,
  removeFavorite,
  likeMedia,
  unlikeMedia,
  followUser,
  unfollowUser,
  getUserFollowing,
} from "../../../api/API";
import { placeholderMedium, placeholderSmall } from "../../../utils/placeholders";
import { getImageUrl, fetchProtectedUrl } from "../../../utils/imageUrl";
import { getDisplayName } from "../../../utils/auth";

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
    wallet: 0
  });
  const [likedItems, setLikedItems] = useState(new Set());
  const [likingItem, setLikingItem] = useState(null);
  const [followingUsers, setFollowingUsers] = useState(new Set());
  const [followingUser, setFollowingUser] = useState(null);
  const [imageUrls, setImageUrls] = useState({});

  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : {};
  const displayName = getDisplayName(user) || "Buyer";

  const userId =
    user?.id ||
    user?._id ||
    user?.userId ||
    user?.uid ||
    user?.user?.id ||
    user?.user?._id;

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
    if (!token || !(user.id || user._id)) return;
    try {
      const res = await getUserFollowing(user.id || user._id);
      const followingList = res.data?.following || [];
      const followingIds = new Set(followingList.map(u => u._id));
      setFollowingUsers(followingIds);
    } catch (err) {
      console.warn("Unable to load following status", err);
    }
  }, [token, user.id, user._id]);


  const resolveImage = (item) => getImageUrl(item, placeholderMedium);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get all media
        const mediaRes = await getAllMedia();
        // Extract array from response - handle structure {success: true, media: [...]}
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

        if (userId) {
          try {
            const purchasesRes = await getPurchaseHistory(userId);
            purchases = Array.isArray(purchasesRes.data)
              ? purchasesRes.data
              : Array.isArray(purchasesRes.data?.purchaseHistory)
                ? purchasesRes.data.purchaseHistory
                : [];
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
        const recent = purchases.slice(0, 5);
        const rec = allMedia.slice(8, 14);

        setFeaturedMedia(featured);
        setRecentPurchases(recent);
        setRecommended(rec);

        setStats({
          purchases: purchases.length || 0,
          downloads: purchases.length || 0,
          favorites: favorites.length || 0,
          wallet: walletAmount || 0,
        });

        // Preload protected URLs only for purchased/free items; avoid 403 for locked content.
        const purchasedMediaIds = new Set((purchases || []).map(p => p.media?._id || p.mediaId || p.media));
        const itemsToResolve = [...featured, ...recent, ...rec];
        const urls = {};
        await Promise.all(
          itemsToResolve.map(async (item) => {
            const mediaId = item._id || item.mediaId;
            if (!mediaId) return;

            const isFree = !item.price || item.price <= 0;
            const isPurchased = purchasedMediaIds.has(mediaId);

            if (!isFree && !isPurchased) {
              // Don't request protected urls for media user has not bought.
              return;
            }

            const raw = getImageUrl(item, null);
            if (raw && !raw.includes("/opt/") && !raw.startsWith("file://")) {
              // Already usable URL, no need for protected fetch.
              return;
            }

            try {
              const protectedUrl = await fetchProtectedUrl(mediaId);
              if (protectedUrl) {
                urls[mediaId] = protectedUrl;
              }
            } catch (err) {
              console.debug("Could not resolve protected URL", mediaId, err?.message);
            }
          })
        );
        setImageUrls(urls);


        await loadLikedItems();
        await loadFollowingStatus();

      } catch (err) {
        console.error("❌ Error fetching data:", err);
        setError(
          err.response?.data?.message || 
          "Failed to load content. Please refresh the page."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, loadLikedItems, loadFollowingStatus]);

  const handleLike = async (mediaId) => {
    if (!token) {
      alert("Please login to like photos");
      return;
    }

    const isLiked = likedItems.has(mediaId);
    try {
      setLikingItem(mediaId);
      if (isLiked) {
        await unlikeMedia(mediaId);

        if (user.id || user._id) {
          try {
            await removeFavorite(user.id || user._id, mediaId);
          } catch (favErr) {
            console.warn('Warning: unable to remove from favorites after unlike', favErr);
          }
        }

        setLikedItems(prev => {
          const next = new Set(prev);
          next.delete(mediaId);
          return next;
        });
      } else {
        await likeMedia(mediaId);

        if (user.id || user._id) {
          try {
            await addFavorite({ userId: user.id || user._id, mediaId });
          } catch (favErr) {
            console.warn('Warning: unable to add to favorites after like', favErr);
          }
        }

        setLikedItems(prev => new Set(prev).add(mediaId));
      }

      setFeaturedMedia(prev => prev.map(item =>
        item._id === mediaId ? { ...item, likes: (item.likes || 0) + (isLiked ? -1 : 1) } : item
      ));
      setRecommended(prev => prev.map(item =>
        item._id === mediaId ? { ...item, likes: (item.likes || 0) + (isLiked ? -1 : 1) } : item
      ));
    } catch (err) {
      console.error("Error toggling like:", err);
      alert("Failed to update like. Please try again.");
    } finally {
      setLikingItem(null);
    }
  };

  const handleFollow = async (photographerId) => {
    if (!token) {
      alert("Please login to follow photographers");
      return;
    }

    if (!photographerId) return;

    const isFollowing = followingUsers.has(photographerId);
    try {
      setFollowingUser(photographerId);
      if (isFollowing) {
        await unfollowUser(photographerId);
        setFollowingUsers(prev => {
          const next = new Set(prev);
          next.delete(photographerId);
          return next;
        });
      } else {
        await followUser(photographerId);
        setFollowingUsers(prev => new Set(prev).add(photographerId));
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
      alert("Failed to update following status. Please try again.");
    } finally {
      setFollowingUser(null);
    }
  };

  // Show error state
  if (error) {
    return (
      <BuyerLayout>
        <div className="text-center py-5">
          <i className="fas fa-exclamation-triangle text-warning fa-4x mb-3"></i>
          <h4 className="text-white mb-3">Oops! Something went wrong</h4>
          <p className="text-white-50 mb-4">{error}</p>
          <button 
            className="btn btn-warning"
            onClick={() => window.location.reload()}
          >
            <i className="fas fa-sync-alt me-2"></i>
            Refresh Page
          </button>
        </div>
      </BuyerLayout>
    );
  }

  return (
    <BuyerLayout>
      {/* Welcome Banner */}
      <div className="card bg-warning bg-opacity-10 border-warning border-opacity-25 mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h4 className="fw-bold text-white mb-2">
                Welcome back, {displayName}! 👋
              </h4>
              <p className="text-white-50 mb-md-0">
                Discover stunning photos from talented photographers worldwide.
              </p>
            </div>
            <div className="col-md-4 text-md-end">
              <Link to="/buyer/explore" className="btn btn-warning">
                <i className="fas fa-compass me-2"></i>
                Explore Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6">
          <div className="card bg-dark border-secondary">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle p-3" style={{ background: "rgba(255,193,7,0.1)" }}>
                  <i className="fas fa-shopping-cart text-warning"></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-0">{stats.purchases}</h5>
                  <small className="text-white-50">Purchases</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card bg-dark border-secondary">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle p-3" style={{ background: "rgba(40,167,69,0.1)" }}>
                  <i className="fas fa-download text-success"></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-0">{stats.downloads}</h5>
                  <small className="text-white-50">Downloads</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card bg-dark border-secondary">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle p-3" style={{ background: "rgba(23,162,184,0.1)" }}>
                  <i className="fas fa-heart text-info"></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-0">{stats.favorites}</h5>
                  <small className="text-white-50">Favorites</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card bg-dark border-secondary">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle p-3" style={{ background: "rgba(255,193,7,0.1)" }}>
                  <i className="fas fa-wallet text-warning"></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-0">KES {stats.wallet.toLocaleString()}</h5>
                  <small className="text-white-50">Wallet</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    

      {/* Featured Media */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold">
            <i className="fas fa-star me-2 text-warning"></i>
            Featured Photos
          </h5>
          <Link to="/buyer/explore" className="text-warning text-decoration-none small">
            View All <i className="fas fa-arrow-right ms-1"></i>
          </Link>

        </div>

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : featuredMedia.length === 0 ? (
          <div className="text-center py-4">
            <i className="fas fa-images fa-3x text-white-50 mb-3"></i>
            <p className="text-white-50">No photos available yet</p>
          </div>
        ) : (
          <div className="row g-3">
            {featuredMedia.map((item) => (
              <div className="col-lg-3 col-md-4 col-6" key={item._id}>
                <div className="card bg-dark border-secondary h-100">
                  <div className="position-relative">
                    <img
                      src={
                        imageUrls[item._id || item.mediaId] ||
                        resolveImage(item) ||
                        placeholderMedium
                      }
                      alt={item.title}
                      className="card-img-top"
                      style={{ height: "150px", objectFit: "contain", backgroundColor: "#1a1a1a" }}
                      loading="lazy"
                      onError={async (e) => {
                        e.target.onerror = null;
                        const mediaId = item._id || item.mediaId;
                        const protectedUrl = await fetchProtectedUrl(mediaId);
                        if (protectedUrl) {
                          e.target.src = protectedUrl;
                        } else {
                          e.target.src = placeholderMedium;
                        }
                      }}
                    />
                    <span className="position-absolute bottom-0 start-0 m-2 badge bg-warning text-dark">
                      KES {item.price || 0}
                    </span>
                  </div>
                  <div className="card-body p-2">
                    <h6 className="card-title small fw-bold text-truncate mb-1">
                      {item.title || "Untitled"}
                    </h6>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <small className="text-white-50">
                        <i className="fas fa-camera me-1"></i>
                        {item.photographer?.username || "Anonymous"}
                      </small>
                      <small className="text-white-50">
                        <i className="fas fa-heart me-1"></i>
                        {item.likes || 0}
                      </small>
                    </div>
                    <div className="d-flex justify-content-between flex-wrap gap-2">
                      <button
                        className={`btn btn-sm ${likedItems.has(item._id) ? 'btn-danger' : 'btn-outline-danger'}`}
                        onClick={(e) => { e.stopPropagation(); handleLike(item._id); }}
                        disabled={likingItem === item._id}
                        title="Like this photo"
                      >
                        {likingItem === item._id ? (
                          <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                          <i className="fas fa-heart"></i>
                        )}
                      </button>
                      <button
                        className={`btn btn-sm ${followingUsers.has(item.photographer?._id) ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={(e) => { e.stopPropagation(); handleFollow(item.photographer?._id); }}
                        disabled={followingUser === item.photographer?._id || !item.photographer?._id}
                        title={`Follow ${item.photographer?.username || 'photographer'}`}
                      >
                        {followingUser === item.photographer?._id ? (
                          <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                          <i className="fas fa-user-plus"></i>
                        )}
                      </button>
                    </div>
                    <button className="btn btn-sm btn-warning w-100 mt-2">
                      <i className="fas fa-shopping-cart me-2"></i>
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Purchases & Recommended */}
      <div className="row g-4">
        {/* Recent Purchases */}
        <div className="col-md-6">
          <div className="card bg-dark border-secondary">
            <div className="card-header bg-transparent border-secondary">
              <h6 className="mb-0 text-warning">
                <i className="fas fa-history me-2"></i>
                Recent Purchases
              </h6>
            </div>
            <div className="card-body p-0">
              {recentPurchases.length > 0 ? (
                <div className="list-group list-group-flush bg-dark">
                  {recentPurchases.map((purchase) => (
                    <div key={purchase._id} className="list-group-item bg-transparent text-white border-secondary">
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={
                            imageUrls[purchase._id || purchase.mediaId] ||
                            resolveImage(purchase) ||
                            placeholderSmall
                          }
                          alt=""
                          width="50"
                          height="50"
                          className="rounded"
                          style={{ objectFit: "contain", backgroundColor: "#1a1a1a" }}
                          onError={async (e) => {
                            e.target.onerror = null;
                            const mediaId = purchase._id || purchase.mediaId;
                            const protectedUrl = await fetchProtectedUrl(mediaId);
                            if (protectedUrl) {
                              e.target.src = protectedUrl;
                            } else {
                              e.target.src = placeholderSmall;
                            }
                          }}
                        />
                        <div className="flex-grow-1">
                          <h6 className="small fw-bold mb-0">{purchase.title}</h6>
                          <small className="text-white-50">
                            Purchased on {new Date(purchase.date || Date.now()).toLocaleDateString()}
                          </small>
                        </div>
                        <button className="btn btn-sm btn-outline-warning">
                          <i className="fas fa-download"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-white-50 py-4">No purchases yet</p>
              )}
              <div className="card-footer bg-transparent border-secondary text-center">
                <Link to="/buyer/transactions" className="text-warning text-decoration-none small">
                  View All Transactions
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended for You */}
        <div className="col-md-6">
          <div className="card bg-dark border-secondary">
            <div className="card-header bg-transparent border-secondary">
              <h6 className="mb-0 text-warning">
                <i className="fas fa-thumbs-up me-2"></i>
                Recommended for You
              </h6>
            </div>
            <div className="card-body">
              <div className="row g-2">
                {recommended.slice(0, 4).map((item) => (
                  <div className="col-6" key={item._id}>
                    <div className="card bg-dark border-secondary">
                      <img
                        src={
                          imageUrls[item._id || item.mediaId] ||
                          resolveImage(item) ||
                          placeholderMedium
                        }
                        alt=""
                        className="card-img-top"
                        style={{ height: "100px", objectFit: "contain", backgroundColor: "#1a1a1a" }}
                        loading="lazy"
                        onError={async (e) => {
                          e.target.onerror = null;
                          const mediaId = item._id || item.mediaId;
                          const protectedUrl = await fetchProtectedUrl(mediaId);
                          if (protectedUrl) {
                            e.target.src = protectedUrl;
                          } else {
                            e.target.src = placeholderMedium;
                          }
                        }}
                      />
                      <div className="card-body p-2">
                        <small className="fw-bold d-block text-truncate">
                          {item.title || "Untitled"}
                        </small>
                        <small className="text-warning">KES {item.price || 0}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-3">
                <Link to="/buyer/explore" className="btn btn-outline-warning btn-sm">
                  Explore More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BuyerLayout>
  );
};

export default BuyerDashboard;