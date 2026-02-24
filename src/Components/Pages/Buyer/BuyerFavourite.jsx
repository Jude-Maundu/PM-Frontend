import React, { useState, useEffect } from "react";
import BuyerLayout from "./BuyerLayout";
import { Link } from "react-router-dom";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "https://pm-backend-1-0s8f.onrender.com/api";

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

  // Production-ready image URL constructor
  const getImageUrl = (item) => {
    if (!item) return "https://via.placeholder.com/300";
    
    // Check different possible locations for the file URL
    const fileUrl = item.mediaDetails?.fileUrl || item.fileUrl;
    
    if (fileUrl) {
      const filename = fileUrl.split('/').pop();
      if (filename) {
        return `${API.replace('/api', '')}/uploads/photos/${filename}`;
      }
    }
    
    return "https://via.placeholder.com/300";
  };

  // Fetch favorites from backend
  const fetchFavorites = async () => {
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
      const res = await axios.get(`${API}/users/favorites/${userId}`, { 
        headers,
        timeout: 10000
      });
      
      console.log("✅ Favorites response:", res.data);
      
      // Handle different response formats
      let favoritesData = [];
      if (Array.isArray(res.data)) {
        favoritesData = res.data;
      } else if (res.data.favorites) {
        favoritesData = res.data.favorites;
      } else if (res.data.items) {
        favoritesData = res.data.items;
      }
      
      setFavorites(favoritesData);
      
    } catch (err) {
      console.error("❌ Error fetching favorites:", err);
      
      if (err.response?.status === 404) {
        // Endpoint doesn't exist - show sample data for development
        console.log("ℹ️ Favorites endpoint not found - using sample data");
        setFavorites([
          {
            _id: "sample1",
            mediaId: "sample1",
            title: "Mountain Sunset",
            photographerName: "John Doe",
            price: 29,
            fileUrl: "sample.jpg",
            mediaDetails: {
              title: "Mountain Sunset",
              photographerName: "John Doe",
              fileUrl: "sample.jpg"
            }
          },
          {
            _id: "sample2",
            mediaId: "sample2",
            title: "Ocean Waves",
            photographerName: "Jane Smith",
            price: 39,
            fileUrl: "sample2.jpg",
            mediaDetails: {
              title: "Ocean Waves",
              photographerName: "Jane Smith",
              fileUrl: "sample2.jpg"
            }
          }
        ]);
        setError("Using sample data - favorites endpoint not configured");
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
  };

  // Add to cart from favorites
  const addToCart = async (mediaId, item) => {
    if (!mediaId) {
      alert("Cannot add to cart: Media ID not found");
      return;
    }

    try {
      setUpdating(true);
      setSuccess(null);
      
      console.log("🛒 Adding to cart:", mediaId);
      
      await axios.post(`${API}/payments/cart/add`, {
        userId,
        mediaId
      }, { headers });
      
      setSuccess(`${item.title || 'Item'} added to cart!`);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error("❌ Error adding to cart:", err);
      
      if (err.response?.status === 401) {
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

    try {
      setUpdating(true);
      setError(null);
      
      console.log("🗑️ Removing from favorites:", mediaId);
      
      // Try dedicated favorites endpoint first
      try {
        await axios.delete(`${API}/users/favorites/${userId}/${mediaId}`, { headers });
      } catch (deleteErr) {
        if (deleteErr.response?.status === 404) {
          // Fallback to cart remove if endpoint doesn't exist
          console.log("ℹ️ Favorites delete endpoint not found, using cart remove");
          await axios.post(`${API}/payments/cart/remove`, {
            userId,
            mediaId
          }, { headers });
        } else {
          throw deleteErr;
        }
      }
      
      // Update local state
      setFavorites(prev => prev.filter(item => 
        (item.mediaId || item._id) !== mediaId
      ));
      
    } catch (err) {
      console.error("❌ Error removing from favorites:", err);
      setError(err.response?.data?.message || "Failed to remove item");
    } finally {
      setUpdating(false);
    }
  };

  // Toggle favorite status (add/remove)
  const toggleFavorite = async (mediaId, isFavorite, item) => {
    if (isFavorite) {
      await removeFromFavorites(mediaId, item.title);
    } else {
      // Add to favorites (if you have this endpoint)
      try {
        setUpdating(true);
        await axios.post(`${API}/users/favorites/add`, {
          userId,
          mediaId
        }, { headers });
        
        // Refetch to get updated list
        await fetchFavorites();
        
      } catch (err) {
        console.error("Error adding to favorites:", err);
        setError("Failed to add to favorites");
      } finally {
        setUpdating(false);
      }
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
  }, []);

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
                        src={getImageUrl({ fileUrl })}
                        className="card-img-top"
                        style={{ height: "150px", objectFit: "cover" }}
                        alt={title}
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/300?text=Error";
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