import React, { useState, useEffect } from "react";
import BuyerLayout from "./BuyerLayout";
import { Link } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:4000/api";

const BuyerFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id || user._id;
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch favorites (you'll need to create this endpoint)
  const fetchFavorites = async () => {
    try {
      setLoading(true);
      // Using cart as placeholder - replace with actual favorites endpoint when available
      const res = await axios.get(`${API}/payments/cart/${userId}`, { headers });
      setFavorites(res.data.items || []);
    } catch (err) {
      console.error("Error fetching favorites:", err);
      setError("Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  // Add to cart from favorites
  const addToCart = async (mediaId) => {
    try {
      setUpdating(true);
      await axios.post(`${API}/payments/cart/add`, {
        userId,
        mediaId
      }, { headers });
      alert("Added to cart!");
    } catch (err) {
      console.error("Error adding to cart:", err);
      setError("Failed to add to cart");
    } finally {
      setUpdating(false);
    }
  };

  // Remove from favorites
  const removeFromFavorites = async (mediaId) => {
    try {
      setUpdating(true);
      // Using cart remove as placeholder - replace with actual favorites endpoint
      await axios.post(`${API}/payments/cart/remove`, {
        userId,
        mediaId
      }, { headers });
      setFavorites(favorites.filter(item => item.mediaId !== mediaId));
    } catch (err) {
      console.error("Error removing from favorites:", err);
      setError("Failed to remove item");
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (!token || !userId) {
      setError("Please login to view favorites");
      return;
    }
    fetchFavorites();
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
        <h2 className="fw-bold mb-4">
          <i className="fas fa-heart me-2 text-warning"></i>
          My Favorites
        </h2>

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
        ) : favorites.length === 0 ? (
          <div className="text-center py-5">
            <i className="fas fa-heart-broken fa-4x text-white-50 mb-3"></i>
            <h5 className="mb-3">No favorites yet</h5>
            <p className="text-white-50 mb-4">Save your favorite photos for later!</p>
            <Link to="/buyer/explore" className="btn btn-warning">
              <i className="fas fa-compass me-2"></i>
              Explore Photos
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {favorites.map((item, idx) => (
              <div className="col-lg-3 col-md-4 col-6" key={item._id || idx}>
                <div className="card bg-dark border-secondary h-100">
                  <div className="position-relative">
                    <img
                      src={getImageUrl(item)}
                      className="card-img-top"
                      style={{ height: "150px", objectFit: "cover" }}
                      alt={item.title}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300";
                      }}
                    />
                    <button
                      className="position-absolute top-0 end-0 m-2 btn btn-sm btn-danger"
                      onClick={() => removeFromFavorites(item.mediaId)}
                      disabled={updating}
                    >
                      <i className="fas fa-heart"></i>
                    </button>
                  </div>
                  <div className="card-body">
                    <h6 className="fw-bold text-truncate">{item.title}</h6>
                    <small className="text-white-50 d-block mb-2">
                      By {item.photographerName || "Anonymous"}
                    </small>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-warning fw-bold">KES {item.price}</span>
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => addToCart(item.mediaId)}
                        disabled={updating}
                      >
                        <i className="fas fa-cart-plus"></i>
                      </button>
                    </div>
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

export default BuyerFavorites;