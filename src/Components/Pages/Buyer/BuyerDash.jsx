import React, { useEffect, useState } from "react";
import axios from "axios";
import BuyerLayout from "./BuyerLayout";
import { Link } from "react-router-dom";

const API = "http://localhost:4000/api";

const BuyerDashboard = () => {
  const [featuredMedia, setFeaturedMedia] = useState([]);
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    purchases: 0,
    downloads: 0,
    favorites: 0,
    wallet: 0
  });

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // Function to get image URL
  const getImageUrl = (item) => {
    if (item?.fileUrl) {
      const filename = item.fileUrl.split('/').pop();
      return `http://localhost:4000/uploads/photos/${filename}`;
    }
    if (item?.thumbnail) return item.thumbnail;
    if (item?.image) return item.image;
    return "https://via.placeholder.com/300?text=No+Image";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get all media
        const mediaRes = await axios.get(`${API}/media`, { headers });
        const allMedia = mediaRes.data || [];
        
        // Get user's purchase history if user has id
        let purchases = [];
        if (user?.id || user?._id) {
          try {
            const purchasesRes = await axios.get(
              `${API}/payments/purchase-history/${user.id || user._id}`, 
              { headers }
            );
            purchases = purchasesRes.data || [];
          } catch (err) {
            console.log("No purchase history yet");
          }
        }

        // Get user's favorites (if you have this endpoint)
        let favorites = [];
        try {
          const favRes = await axios.get(`${API}/users/favorites`, { headers });
          favorites = favRes.data || [];
        } catch (err) {
          console.log("Favorites not available");
        }

        setFeaturedMedia(allMedia.slice(0, 8));
        setRecentPurchases(purchases.slice(0, 5));
        setRecommended(allMedia.slice(8, 14));
        
        // Update stats
        setStats({
          purchases: purchases.length || 24,
          downloads: purchases.length || 18,
          favorites: favorites.length || 12,
          wallet: 5000
        });
        
        // Categories with counts
        const categoryCounts = {};
        allMedia.forEach(item => {
          if (item.category) {
            categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
          }
        });
        
        setCategories([
          { name: "Nature", icon: "fa-leaf", count: categoryCounts.nature || 124 },
          { name: "Travel", icon: "fa-plane", count: categoryCounts.travel || 98 },
          { name: "Lifestyle", icon: "fa-camera-retro", count: categoryCounts.lifestyle || 156 },
          { name: "Food", icon: "fa-utensils", count: categoryCounts.food || 67 },
          { name: "Technology", icon: "fa-microchip", count: categoryCounts.tech || 89 },
          { name: "Architecture", icon: "fa-building", count: categoryCounts.architecture || 45 },
        ]);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <BuyerLayout>
      {/* Welcome Banner */}
      <div className="card bg-warning bg-opacity-10 border-warning border-opacity-25 mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h4 className="fw-bold text-white mb-2">
                Welcome back, {user?.name || "Buyer"}! 👋
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
            <div className="spinner-border text-warning"></div>
          </div>
        ) : (
          <div className="row g-3">
            {featuredMedia.map((item, idx) => (
              <div className="col-lg-3 col-md-4 col-6" key={item._id || idx}>
                <div className="card bg-dark border-secondary h-100">
                  <div className="position-relative">
                    <img
                      src={getImageUrl(item)}
                      alt={item.title}
                      className="card-img-top"
                      style={{ height: "150px", objectFit: "cover" }}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300?text=Image+Not+Found";
                      }}
                    />
                    <button className="position-absolute top-0 end-0 m-2 btn btn-sm btn-link text-danger">
                      <i className="far fa-heart"></i>
                    </button>
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
                  {recentPurchases.map((purchase, idx) => (
                    <div key={idx} className="list-group-item bg-transparent text-white border-secondary">
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
                {recommended.slice(0, 4).map((item, idx) => (
                  <div className="col-6" key={item._id || idx}>
                    <div className="card bg-dark border-secondary">
                      <img
                        src={getImageUrl(item)}
                        alt=""
                        className="card-img-top"
                        style={{ height: "100px", objectFit: "cover" }}
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