import React, { useState, useEffect, useCallback } from "react";
import BuyerLayout from "./BuyerLayout";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "../../../api/apiConfig";
import { placeholderMedium } from "../../../utils/placeholders";
import { getImageUrl, fetchProtectedUrl } from "../../../utils/imageUrl";
import {
  getLocalFavorites,
  setLocalFavorites,
  removeFromLocalFavorites,
  addToLocalCart,
  isApiAvailable,
  disableApi,
} from "../../../utils/localStore";

const API = API_BASE_URL; // ← ADD THIS LINE - defines the API base URL

const BuyerFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : {};
  const userId = user.id || user._id;
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // Use shared image URL resolver for better compatibility across backend formats
  const resolveImage = (item) => getImageUrl(item, placeholderMedium);

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
      
      // Try to get favorites from dedicated endpoint
      const res = await axios.get(API_ENDPOINTS.USERS.FAVORITES.GET(userId), {
        headers,
        timeout: 10000
      });
      
      console.log("✅ Favorites response:", res.data);
      
      // Handle different response formats
      let favoritesData = [];
      if (Array.isArray(res.data)) {
        favoritesData = res.data;
      } else if (res.data?.favorites && Array.isArray(res.data.favorites)) {
        favoritesData = res.data.favorites;
      } else if (res.data?.items && Array.isArray(res.data.items)) {
        favoritesData = res.data.items;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        favoritesData = res.data.data;
      } else {
        favoritesData = [];
      }
      
      setFavorites(Array.isArray(favoritesData) ? favoritesData : []);
      // Cache favorites locally so the UI can work even if this endpoint becomes unavailable.
      setLocalFavorites(favoritesData);
      
    } catch (err) {
      console.error("❌ Error fetching favorites:", err);
      
      if (err.response?.status === 404 || err.response?.status === 400) {
        // Endpoint doesn't exist - fall back to local favorites
        console.log("ℹ️ Favorites endpoint not found - using local favorites");
        disableApi("favorites");
        setFavorites(getLocalFavorites());
        setError("Using local favorites (backend endpoint unavailable)");
      } else if (err.code === 'ECONNABORTED') {
        setError("Request timeout. Please check your connection.");
      } else if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        localStorage.clear();
      } else {
        setError(err.response?.data?.message || "Failed to load favorites");
      }
    } finally {
      setLoading(false);
    }
  }, [token, userId, headers]);

  // Add to cart from favorites
  const addToCart = async (mediaId, item) => {
    if (!mediaId) {
      alert("Cannot add to cart: Media ID not found");
      return;
    }

    const feature = "cart";
    const apiAvailable = isApiAvailable(feature);

    try {
      setUpdating(true);
      setSuccess(null);

      console.log("🛒 Adding to cart:", mediaId);

      if (!apiAvailable) {
        addToLocalCart(mediaId, { title: item?.title, price: item?.price });
        setSuccess(`${item.title || "Item"} added to cart (local fallback)!`);
        setTimeout(() => setSuccess(null), 3000);
        return;
      }

      // ✅ FIXED: Use the defined API variable
      await axios.post(`${API}/payments/cart/add`, {
        userId,
        mediaId,
      }, { headers });

      setSuccess(`${item.title || "Item"} added to cart!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("❌ Error adding to cart:", err);

      const status = err.response?.status;
      if (status === 404 || status === 400) {
        disableApi(feature);
        addToLocalCart(mediaId, { title: item?.title, price: item?.price });
        setSuccess(`${item.title || "Item"} added to cart (local fallback)!`);
        setTimeout(() => setSuccess(null), 3000);
      } else if (status === 401) {
        setError("Session expired. Please login again.");
        localStorage.clear();
      } else {
        setError(err.response?.data?.message || "Failed to add to cart");
      }
    } finally {
      setUpdating(false);
    }
  };

  // Remove from favorites
  const removeFromFavorites = async (mediaId, title) => {
    if (!mediaId) {
      alert("Cannot remove: Media ID not found");
      return;
    }

    if (!window.confirm(`Remove "${title || 'this item'}" from favorites?`)) {
      return;
    }

    const feature = "favorites";
    const apiAvailable = isApiAvailable(feature);

    try {
      setUpdating(true);
      setError(null);

      console.log("🗑️ Removing from favorites:", mediaId);

      if (!apiAvailable) {
        removeFromLocalFavorites(mediaId);
        setFavorites(prev => prev.filter(item => (item.mediaId || item._id) !== mediaId));
        return;
      }

      try {
        await axios.delete(API_ENDPOINTS.USERS.FAVORITES.DELETE(userId, mediaId), { headers });
      } catch (deleteErr) {
        const status = deleteErr.response?.status;
        if (status === 404 || status === 400) {
          disableApi(feature);
          removeFromLocalFavorites(mediaId);
        } else {
          throw deleteErr;
        }
      }

      setFavorites(prev => prev.filter(item => (item.mediaId || item._id) !== mediaId));

    } catch (err) {
      console.error("❌ Error removing from favorites:", err);
      setError(err.response?.data?.message || "Failed to remove item");
    } finally {
      setUpdating(false);
    }
  };

  // Check authentication on mount
  useEffect(() => {
    if (!token || !userId) {
      setError("Please login to view your favorites");
      setLoading(false);
    } else {
      fetchFavorites();
    }
  }, [fetchFavorites]);

  // If not authenticated, show login prompt
  if (!token || !userId) {
    return (
      <BuyerLayout>
        <div className="text-center py-5">
          <i className="fas fa-heart text-warning fa-4x mb-3"></i>
          <h4 className="text-white mb-3">Authentication Required</h4>
          <p className="text-white-50 mb-4">Please login to view your favorites</p>
          <Link to="/login" className="btn btn-warning">
            <i className="fas fa-sign-in-alt me-2"></i>
            Go to Login
          </Link>
        </div>
      </BuyerLayout>
    );
  }

  return (
    <BuyerLayout>
      <div className="text-white">
        {/* Header with Refresh Button */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">
            <i className="fas fa-heart me-2 text-warning"></i>
            My Favorites
          </h2>
          <button 
            className="btn btn-outline-warning btn-sm"
            onClick={fetchFavorites}
            disabled={loading}
          >
            <i className="fas fa-sync-alt me-2"></i>
            Refresh
          </button>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <i className="fas fa-check-circle me-2"></i>
            {success}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setSuccess(null)}
            ></button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setError(null)}
            ></button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-white-50">Loading your favorites...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-5">
            <i className="fas fa-heart-broken fa-4x text-white-50 mb-3"></i>
            <h5 className="mb-3">No favorites yet</h5>
            <p className="text-white-50 mb-4">Save your favorite photos for later!</p>
            <Link to="/buyer/explore" className="btn btn-warning btn-lg">
              <i className="fas fa-compass me-2"></i>
              Explore Photos
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {favorites.map((item, idx) => {
              // Extract media details safely
              const mediaId = item.mediaId || item._id;
              const title = item.mediaDetails?.title || item.title || "Untitled";
              const photographer = item.mediaDetails?.photographerName || item.photographerName || "Anonymous";
              const price = item.mediaDetails?.price || item.price || 0;
              const fileUrl = item.mediaDetails?.fileUrl || item.fileUrl;
              
              return (
                <div className="col-lg-3 col-md-4 col-6" key={mediaId || idx}>
                  <div className="card bg-dark border-secondary h-100">
                    <div className="position-relative">
                      <img
                        src={resolveImage({ fileUrl })}
                        className="card-img-top"
                        style={{ height: "150px", objectFit: "contain", backgroundColor: "#1a1a1a" }}
                        alt={title}
                        loading="lazy"
                        onError={async (e) => {
                          e.target.onerror = null;
                          const mediaId = item.mediaId || item._id;
                          const protectedUrl = await fetchProtectedUrl(mediaId);
                          if (protectedUrl) {
                            e.target.src = protectedUrl;
                          } else {
                            e.target.src = placeholderMedium;
                          }
                        }}
                      />
                      <button
                        className="position-absolute top-0 end-0 m-2 btn btn-sm btn-danger"
                        onClick={() => removeFromFavorites(mediaId, title)}
                        disabled={updating}
                        title="Remove from favorites"
                      >
                        <i className="fas fa-heart"></i>
                      </button>
                      {price > 0 && (
                        <span className="position-absolute bottom-0 start-0 m-2 badge bg-warning text-dark">
                          KES {price}
                        </span>
                      )}
                    </div>
                    <div className="card-body d-flex flex-column">
                      <h6 className="fw-bold text-truncate mb-1" title={title}>
                        {title}
                      </h6>
                      <small className="text-white-50 d-block mb-2 text-truncate">
                        <i className="fas fa-camera me-1"></i>
                        {photographer}
                      </small>
                      <div className="d-flex justify-content-between align-items-center mt-auto">
                        <span className="text-warning fw-bold">KES {price}</span>
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => addToCart(mediaId, { title })}
                          disabled={updating}
                          title="Add to cart"
                        >
                          {updating ? (
                            <span className="spinner-border spinner-border-sm"></span>
                          ) : (
                            <i className="fas fa-cart-plus"></i>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </BuyerLayout>
  );
};

export default BuyerFavorites;