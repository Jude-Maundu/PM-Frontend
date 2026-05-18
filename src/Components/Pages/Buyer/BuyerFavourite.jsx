import React, { useState, useEffect, useCallback, useMemo } from "react";
import BuyerLayout from "./BuyerLayout";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "../../../api/apiConfig";
import { toast } from "../../../utils/toast";
import { showConfirm } from "../../../utils/confirm";
import { placeholderMedium } from "../../../utils/placeholders";
import {
  getLocalFavorites,
  setLocalFavorites,
  removeFromLocalFavorites,
  addToLocalCart,
  isApiAvailable,
  disableApi,
} from "../../../utils/localStore";
import PageHeader from "../../PageHeader";

const API = API_BASE_URL;

const BuyerFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const user = useMemo(() => userStr ? JSON.parse(userStr) : {}, [userStr]);
  const userId = user.id || user._id;
  const headers = useMemo(() => token ? { Authorization: `Bearer ${token}` } : {}, [token]);

  // Extract image URL from favorite item
  const extractImageUrl = useCallback((item) => {
    if (!item) return placeholderMedium;

    const possibleUrlFields = [
      item.media?.fileUrl,
      item.media?.imageUrl,
      item.media?.url,
      item.media?.thumbnail,
      item.fileUrl,
      item.imageUrl,
      item.url,
      item.thumbnail,
      item.mediaDetails?.fileUrl,
      item.mediaDetails?.imageUrl,
    ];

    for (const url of possibleUrlFields) {
      if (url && typeof url === 'string' && url.startsWith('http')) {
        return url;
      }
    }

    for (const url of possibleUrlFields) {
      if (url && typeof url === 'string') {
        const filename = url.split('/').pop();
        if (filename && (filename.includes('.jpg') || filename.includes('.png') || filename.includes('.jpeg'))) {
          return `${API.replace('/api', '')}/uploads/photos/${filename}`;
        }
      }
    }

    return placeholderMedium;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const extractTitle = useCallback((item) => {
    if (!item) return "Untitled";
    return item.media?.title || item.title || item.mediaDetails?.title || "Untitled";
  }, []);

  const extractPhotographer = useCallback((item) => {
    if (!item) return "Anonymous";
    const photographer = item.media?.photographer || item.photographer || item.mediaDetails?.photographer;
    if (photographer) {
      if (typeof photographer === 'object') {
        return photographer.username || photographer.name || photographer.email || "Anonymous";
      }
      return photographer;
    }
    return "Anonymous";
  }, []);

  const extractPrice = useCallback((item) => {
    if (!item) return 0;
    return item.media?.price || item.price || item.mediaDetails?.price || 0;
  }, []);

  const extractMediaId = useCallback((item) => {
    if (!item) return null;
    return item.mediaId || item.media?._id || item._id || item.id;
  }, []);

  // Fetch favorites from backend
  const fetchFavorites = useCallback(async () => {
    if (!token || !userId) {
      setError("Please login to view your favorites");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("❤️ Fetching favorites for user:", userId);

      const res = await axios.get(API_ENDPOINTS.USERS.FAVORITES.GET(userId), {
        headers,
        timeout: 10000
      });

      console.log("✅ Favorites response:", res.data);

      let favoritesData = [];
      if (Array.isArray(res.data)) {
        favoritesData = res.data;
      } else if (res.data?.favorites && Array.isArray(res.data.favorites)) {
        favoritesData = res.data.favorites;
      } else if (res.data?.items && Array.isArray(res.data.items)) {
        favoritesData = res.data.items;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        favoritesData = res.data.data;
      }

      if (favoritesData.length > 0) {
        console.log("🔍 First favorite item structure:", JSON.stringify(favoritesData[0], null, 2));
      }

      setFavorites(favoritesData);
      setLocalFavorites(favoritesData);

    } catch (err) {
      console.error("❌ Error fetching favorites:", err);

      const localFavs = getLocalFavorites();
      if (localFavs && localFavs.length > 0) {
        setFavorites(localFavs);
        setError("Using locally saved favorites (server error)");
      } else {
        setError(err.response?.data?.message || "Failed to load favorites");
      }
    } finally {
      setLoading(false);
    }
  }, [token, userId, headers]);

  // Add to cart
  const addToCart = useCallback(async (mediaId, item) => {
    if (!mediaId) {
      toast.error("Cannot add to cart: Media ID not found");
      return;
    }

    const feature = "cart";
    const apiAvailable = isApiAvailable(feature);

    try {
      setUpdating(true);
      setSuccess(null);

      console.log("🛒 Adding to cart:", mediaId);

      if (!apiAvailable) {
        const title = extractTitle(item);
        addToLocalCart(mediaId, { title, price: extractPrice(item) });
        setSuccess(`${title} added to cart (local fallback)!`);
        setTimeout(() => setSuccess(null), 3000);
        return;
      }

      await axios.post(`${API}/payments/cart/add`, { userId, mediaId }, { headers });

      setSuccess(`${extractTitle(item)} added to cart!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("❌ Error adding to cart:", err);
      const status = err.response?.status;
      if (status === 404 || status === 400) {
        disableApi(feature);
        const title = extractTitle(item);
        addToLocalCart(mediaId, { title, price: extractPrice(item) });
        setSuccess(`${title} added to cart (local fallback)!`);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(err.response?.data?.message || "Failed to add to cart");
      }
    } finally {
      setUpdating(false);
    }
  }, [userId, headers, extractTitle, extractPrice]);

  // Remove from favorites
  const removeFromFavorites = useCallback(async (mediaId, title) => {
    if (!mediaId) {
      toast.error("Cannot remove: Media ID not found");
      return;
    }

    const ok = await showConfirm(`Remove "${title || 'this item'}" from your favorites?`, { title: "Remove Favorite", confirmText: "Remove" });
    if (!ok) return;

    const feature = "favorites";
    const apiAvailable = isApiAvailable(feature);

    try {
      setUpdating(true);
      setError(null);

      console.log("🗑️ Removing from favorites:", mediaId);

      if (!apiAvailable) {
        removeFromLocalFavorites(mediaId);
        setFavorites(prev => prev.filter(item => extractMediaId(item) !== mediaId));
        return;
      }

      try {
        await axios.delete(API_ENDPOINTS.USERS.FAVORITES.DELETE(userId, mediaId), { headers });
        setFavorites(prev => prev.filter(item => extractMediaId(item) !== mediaId));
      } catch (deleteErr) {
        const status = deleteErr.response?.status;
        if (status === 404 || status === 400) {
          disableApi(feature);
          removeFromLocalFavorites(mediaId);
          setFavorites(prev => prev.filter(item => extractMediaId(item) !== mediaId));
        } else {
          throw deleteErr;
        }
      }

    } catch (err) {
      console.error("❌ Error removing from favorites:", err);
      setError(err.response?.data?.message || "Failed to remove item");
    } finally {
      setUpdating(false);
    }
  }, [userId, headers, extractMediaId]);

  useEffect(() => {
    if (!token || !userId) {
      setError("Please login to view your favorites");
      setLoading(false);
      return;
    }
    fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If not authenticated, show login prompt
  if (!token || !userId) {
    return (
      <BuyerLayout>
        <div className="text-center py-5">
          <i className="fas fa-heart text-warning fa-4x mb-3"></i>
          <h4 className="text-white mb-3">Authentication Required</h4>
          <p className="text-white-50 mb-4">Please login to view your favorites</p>
          <Link to="/login" className="mc-btn mc-btn-primary">
            <i className="fas fa-sign-in-alt me-2"></i>Go to Login
          </Link>
        </div>
      </BuyerLayout>
    );
  }

  return (
    <BuyerLayout>
      <PageHeader
        title="My Favorites"
        subtitle="Photos you've saved"
        actions={
          <button
            className="mc-btn mc-btn-ghost"
            onClick={fetchFavorites}
            disabled={loading}
          >
            <i className={`fas fa-sync-alt me-2 ${loading ? 'fa-spin' : ''}`}></i>Refresh
          </button>
        }
      />
      <div className="mc-page">
        {/* Success Alert */}
        {success && (
          <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
            <i className="fas fa-check-circle me-2"></i>
            {success}
            <button type="button" className="btn-close" onClick={() => setSuccess(null)}></button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="alert alert-warning alert-dismissible fade show mb-4" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
            <button type="button" className="btn-close" onClick={() => setError(null)}></button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <div className="spinner-border" style={{ color: "var(--mc-accent)" }}></div>
            <p className="text-white-50 mt-3">Loading your favorites...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="mc-empty">
            <i className="fas fa-heart-broken"></i>
            <p>No favorites yet</p>
            <Link to="/buyer/explore" className="mc-btn mc-btn-primary mt-3">
              <i className="fas fa-compass me-2"></i>Explore Photos
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {favorites.map((item, index) => {
              const mediaId = extractMediaId(item);
              const title = extractTitle(item);
              const photographer = extractPhotographer(item);
              const price = extractPrice(item);
              const imageUrl = extractImageUrl(item);

              console.log(`🎨 Rendering: ${title}, imageUrl: ${imageUrl?.substring(0, 60)}...`);

              return (
                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6" key={mediaId || index}>
                  <div className="mc-card h-100 position-relative overflow-hidden" style={{ padding: 0 }}>
                    <div className="position-relative">
                      <img
                        src={imageUrl}
                        style={{ height: "180px", objectFit: "cover", width: "100%", backgroundColor: "#1a1a1a" }}
                        alt={title}
                        loading="lazy"
                        onError={(e) => {
                          console.log(`❌ Image failed: ${title}, URL: ${imageUrl}`);
                          e.target.onerror = null;
                          e.target.src = placeholderMedium;
                        }}
                      />

                      {/* Price Badge */}
                      {price > 0 && (
                        <span className="position-absolute top-0 start-0 m-2 badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold">
                          KES {price.toLocaleString()}
                        </span>
                      )}

                      {/* Remove Favorite Button */}
                      <button
                        className="position-absolute top-0 end-0 m-2 mc-btn mc-btn-danger rounded-circle p-2"
                        onClick={() => removeFromFavorites(mediaId, title)}
                        disabled={updating}
                        title="Remove from favorites"
                        style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <i className="fas fa-heart-broken"></i>
                      </button>
                    </div>

                    <div style={{ padding: "1rem" }} className="d-flex flex-column flex-grow-1">
                      <h6 className="fw-bold text-truncate mb-1" title={title}>{title}</h6>
                      <small className="text-white-50 d-block mb-2 text-truncate">
                        <i className="fas fa-camera me-1"></i>{photographer}
                      </small>

                      <div className="mt-auto pt-2">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-warning fw-bold fs-6">
                            {price > 0 ? `KES ${price.toLocaleString()}` : <span className="text-white-50">Free</span>}
                          </span>
                        </div>
                        <div className="d-flex gap-2">
                          <button
                            className="mc-btn mc-btn-primary flex-grow-1"
                            onClick={() => addToCart(mediaId, item)}
                            disabled={updating}
                            title="Add to cart"
                          >
                            {updating ? (
                              <span className="spinner-border spinner-border-sm"></span>
                            ) : (
                              <>
                                <i className="fas fa-cart-plus me-1"></i>Add to Cart
                              </>
                            )}
                          </button>
                          <Link
                            to="/buyer/cart"
                            className="mc-btn mc-btn-ghost"
                            title="Buy Now"
                            onClick={() => addToCart(mediaId, item)}
                          >
                            <i className="fas fa-bolt me-1"></i>Buy Now
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Stats Footer */}
        {favorites.length > 0 && (
          <div className="mc-card mt-4 text-center" style={{ padding: "0.75rem 1rem" }}>
            <small className="text-white-50">
              <i className="fas fa-info-circle me-2" style={{ color: "var(--mc-accent)" }}></i>
              Your wishlist has <strong style={{ color: "var(--mc-accent)" }}>{favorites.length}</strong> item
              {favorites.length !== 1 ? 's' : ''}. Click the heart icon to remove.
            </small>
          </div>
        )}
      </div>
    </BuyerLayout>
  );
};

export default BuyerFavorites;
