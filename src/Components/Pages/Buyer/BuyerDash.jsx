import React, { useEffect, useState } from "react";
import axios from "axios";
import BuyerLayout from "./BuyerLayout";
import { Link } from "react-router-dom";

// Production API URL
const API = process.env.REACT_APP_API_URL || "https://pm-backend-1-0s8f.onrender.com/api";

const BuyerDashboard = () => {
  const [featuredMedia, setFeaturedMedia] = useState([]);
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    purchases: 0,
    downloads: 0,
    favorites: 0,
    wallet: 5000
  });

  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : {};
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // Production-ready image URL constructor
  const getImageUrl = (item) => {
    if (!item) return "https://via.placeholder.com/300?text=No+Image";
    
    // If imageUrl is already provided
    if (item.imageUrl) return item.imageUrl;
    
    // Extract filename from fileUrl
    if (item.fileUrl) {
      const filename = item.fileUrl.split('/').pop();
      if (filename) {
        return `${API.replace('/api', '')}/uploads/photos/${filename}`;
      }
    }
    
    // Fallback
    return "https://via.placeholder.com/300?text=No+Image";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get all media
        const mediaRes = await axios.get(`${API}/media`, { 
          headers,
          timeout: 10000 
        });
        
        const allMedia = mediaRes.data || [];
        console.log(`✅ Loaded ${allMedia.length} media items`);

        // Get user's purchase history
        let purchases = [];
        if (user?.id || user?._id) {
          try {
            const purchasesRes = await axios.get(
              `${API}/payments/purchase-history/${user.id || user._id}`, 
              { headers, timeout: 5000 }
            );
            purchases = purchasesRes.data || [];
          } catch (err) {
            console.log("ℹ️ No purchase history yet");
          }
        }

        // Get user's favorites
        let favorites = [];
        try {
          const favRes = await axios.get(`${API}/users/favorites`, { 
            headers, 
            timeout: 5000 
          });
          favorites = favRes.data || [];
        } catch (err) {
          console.log("ℹ️ Favorites not available");
        }

        // Update state
        setFeaturedMedia(allMedia.slice(0, 8));
        setRecentPurchases(purchases.slice(0, 5));
        setRecommended(allMedia.slice(8, 14));
        
        setStats({
          purchases: purchases.length || 0,
          downloads: purchases.length || 0,
          favorites: favorites.length || 0,
          wallet: 5000
        });
        
        // Categories
        setCategories([
          { name: "Nature", icon: "fa-leaf", count: 124 },
          { name: "Travel", icon: "fa-plane", count: 98 },
          { name: "Lifestyle", icon: "fa-camera-retro", count: 156 },
          { name: "Food", icon: "fa-utensils", count: 67 },
          { name: "Technology", icon: "fa-microchip", count: 89 },
          { name: "Architecture", icon: "fa-building", count: 45 },
        ]);

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
  }, []);

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
                Welcome back, {user?.name || user?.username || "Buyer"}! 👋
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

      {/* Categories */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold">
            <i className="fas fa-tags me-2 text-warning"></i>
            Browse Categories
          </h5>
          <Link to="/buyer/explore" className="text-warning text-decoration-none small">
            View All <i className="fas fa-arrow-right ms-1"></i>
          </Link>
        </div>
        <div className="row g-2">
          {categories.map((cat, idx) => (
            <div className="col-md-2 col-4" key={idx}>
              <Link to={`/buyer/explore?category=${cat.name}`} className="text-decoration-none">
                <div className="card bg-dark border-secondary text-center p-3">
                  <i className={`fas ${cat.icon} text-warning mb-2`}></i>
                  <h6 className="small fw-bold mb-0">{cat.name}</h6>
                  <small className="text-white-50">{cat.count} photos</small>
                </div>
              </Link>
            </div>
          ))}
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
                      src={getImageUrl(item)}
                      alt={item.title}
                      className="card-img-top"
                      style={{ height: "150px", objectFit: "cover" }}
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/300?text=Error";
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
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-white-50">
                        <i className="fas fa-camera me-1"></i>
                        {item.photographer?.username || "Anonymous"}
                      </small>
                      <small className="text-white-50">
                        <i className="fas fa-heart me-1"></i>
                        {item.likes || 0}
                      </small>
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
                          src={getImageUrl(purchase)}
                          alt=""
                          width="50"
                          height="50"
                          className="rounded"
                          style={{ objectFit: "cover" }}
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/50";
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
                        src={getImageUrl(item)}
                        alt=""
                        className="card-img-top"
                        style={{ height: "100px", objectFit: "cover" }}
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/150";
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