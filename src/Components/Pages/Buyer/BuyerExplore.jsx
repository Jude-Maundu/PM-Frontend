import React, { useState, useEffect } from "react";
import BuyerLayout from "./BuyerLayout";
import { Link } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:4000/api";

const BuyerExplore = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [addingToCart, setAddingToCart] = useState(null);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id || user._id;
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // Categories
  const categories = [
    "All", "Nature", "Travel", "Lifestyle", "Food", "Technology", "Architecture"
  ];

  // Fetch media
  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/media`, { headers });
      setMedia(res.data || []);
    } catch (err) {
      console.error("Error fetching media:", err);
      setError("Failed to load photos");
    } finally {
      setLoading(false);
    }
  };

  // Add to cart
  const addToCart = async (mediaId) => {
    if (!token) {
      alert("Please login to add items to cart");
      return;
    }

    try {
      setAddingToCart(mediaId);
      await axios.post(`${API}/payments/cart/add`, {
        userId,
        mediaId
      }, { headers });
      alert("Added to cart!");
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("Failed to add to cart");
    } finally {
      setAddingToCart(null);
    }
  };

  // Filter and sort media
  const filteredMedia = media.filter(item => {
    const matchesCategory = selectedCategory === "all" || 
      (item.category || "").toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = (item.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    switch(sortBy) {
      case "price_low":
        return (a.price || 0) - (b.price || 0);
      case "price_high":
        return (b.price || 0) - (a.price || 0);
      case "popular":
        return (b.likes || 0) - (a.likes || 0);
      default: // newest
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
  });

  useEffect(() => {
    fetchMedia();
  }, []);

  // Helper for image URL
  const getImageUrl = (item) => {
    if (!item?.fileUrl) return "https://via.placeholder.com/300";
    const filename = item.fileUrl.split('/').pop();
    return `http://localhost:4000/uploads/photos/${filename}`;
  };

  return (
    <BuyerLayout>
      <div className="text-white">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <h2 className="fw-bold mb-3 mb-md-0">
            <i className="fas fa-compass me-2 text-warning"></i>
            Explore Photos
          </h2>
          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control bg-dark border-secondary text-white"
              placeholder="Search photos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ minWidth: "250px" }}
            />
            <select
              className="form-select bg-dark border-secondary text-white"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: "150px" }}
            >
              <option value="newest">Newest</option>
              <option value="popular">Most Popular</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-4">
          <div className="d-flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                className={`btn ${
                  selectedCategory === cat.toLowerCase() 
                    ? 'btn-warning' 
                    : 'btn-outline-warning'
                }`}
                onClick={() => setSelectedCategory(cat.toLowerCase())}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
            <button type="button" className="btn-close" onClick={() => setError(null)}></button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center py-5">
            <i className="fas fa-search fa-4x text-white-50 mb-3"></i>
            <h5 className="mb-3">No photos found</h5>
            <p className="text-white-50 mb-4">Try adjusting your search or category</p>
            <button 
              className="btn btn-warning"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {filteredMedia.map(item => (
              <div className="col-lg-3 col-md-4 col-6" key={item._id}>
                <div className="card bg-dark border-secondary h-100">
                  <div className="position-relative">
                    <img
                      src={getImageUrl(item)}
                      className="card-img-top"
                      style={{ height: "180px", objectFit: "cover" }}
                      alt={item.title}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300";
                      }}
                    />
                    <span className="position-absolute top-0 start-0 m-2 badge bg-warning text-dark">
                      KES {item.price}
                    </span>
                    <span className="position-absolute top-0 end-0 m-2 badge bg-info">
                      <i className="fas fa-heart me-1"></i>
                      {item.likes || 0}
                    </span>
                  </div>
                  <div className="card-body">
                    <h6 className="fw-bold text-truncate mb-1">{item.title}</h6>
                    <small className="text-white-50 d-block mb-2">
                      By {item.photographer?.username || "Anonymous"}
                    </small>
                    <p className="small text-white-50 mb-3 text-truncate">
                      {item.description || "No description"}
                    </p>
                    <button
                      className="btn btn-warning w-100"
                      onClick={() => addToCart(item._id)}
                      disabled={addingToCart === item._id}
                    >
                      {addingToCart === item._id ? (
                        <span className="spinner-border spinner-border-sm"></span>
                      ) : (
                        <>
                          <i className="fas fa-cart-plus me-2"></i>
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </BuyerLayout>
  );
};

export default BuyerExplore;