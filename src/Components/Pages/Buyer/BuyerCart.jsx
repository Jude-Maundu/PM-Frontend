import React, { useState, useEffect } from "react";
import BuyerLayout from "./BuyerLayout";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../../api/apiConfig";

const API = API_BASE_URL;

const BuyerCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [mpesaProcessing, setMpesaProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [mpesaPhone, setMpesaPhone] = useState("");
  
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id || user._id;
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const getImageUrl = (item) => {
    if (!item) return "https://via.placeholder.com/300";
    if (item.imageUrl) return item.imageUrl;
    if (item.fileUrl) {
      const filename = item.fileUrl.split('/').pop();
      if (filename) {
        return `${API.replace('/api', '')}/uploads/photos/${filename}`;
      }
    }
    return "https://via.placeholder.com/300";
  };

  useEffect(() => {
    if (!token || !userId) {
      navigate("/login");
      return;
    }
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/payments/cart/${userId}`, { 
        headers,
        timeout: 10000 
      });
      setCartItems(res.data.items || []);
      
      try {
        const walletRes = await axios.get(`${API}/payments/wallet/${userId}`, { 
          headers,
          timeout: 5000 
        });
        setWalletBalance(walletRes.data.balance || 0);
      } catch (walletErr) {
        console.log("Wallet fetch failed, using default");
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      } else {
        setError("Failed to load cart items");
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (mediaId) => {
    try {
      setUpdating(true);
      await axios.post(`${API}/payments/cart/remove`, {
        userId,
        mediaId
      }, { headers });
      await fetchCart();
    } catch (err) {
      setError("Failed to remove item");
    } finally {
      setUpdating(false);
    }
  };

  const clearCart = async () => {
    if (!window.confirm("Clear your cart?")) return;
    try {
      setUpdating(true);
      await axios.delete(`${API}/payments/cart/${userId}`, { headers });
      setCartItems([]);
    } catch (err) {
      setError("Failed to clear cart");
    } finally {
      setUpdating(false);
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    const total = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
    
    if (total > walletBalance) {
      alert("Insufficient wallet balance");
      navigate("/buyer/wallet");
      return;
    }

    try {
      setUpdating(true);
      for (const item of cartItems) {
        await axios.post(`${API}/payments/buy`, {
          userId,
          mediaId: item.mediaId
        }, { headers });
      }
      await clearCart();
      alert("Purchase successful!");
      navigate("/buyer/downloads");
    } catch (err) {
      setError(err.response?.data?.message || "Checkout failed");
    } finally {
      setUpdating(false);
    }
  };

  const handleMpesaCheckout = async () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    if (!mpesaPhone || !/^254\d{9}$/.test(mpesaPhone)) {
      alert("Please enter a valid mobile phone number (254XXXXXXXXX)");
      return;
    }

    try {
      setMpesaProcessing(true);
      const requests = cartItems.map(item =>
        axios.post(`${API}/payments/mpesa`, {
          buyerId: userId,
          mediaId: item.mediaId,
          buyerPhone: mpesaPhone,
          walletTopup: false
        }, { headers })
      );

      const responses = await Promise.allSettled(requests);

      const failed = responses.filter(r => r.status === "rejected");
      if (failed.length > 0) {
        console.warn("Some MPesa checkout requests failed", failed);
        alert(`${failed.length} item(s) failed to initiate MPesa payment. Check console.`);
      } else {
        alert("STK Push initiated for all items. Please approve payment on your phone.");
      }

      setMpesaPhone("");
      fetchCart();
    } catch (err) {
      console.error("MPesa checkout failed", err);
      setError("Failed to initiate MPesa checkout");
    } finally {
      setMpesaProcessing(false);
    }
  };

  if (!token || !userId) return null;

  return (
    <BuyerLayout>
      <div className="text-white">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">
            <i className="fas fa-shopping-cart me-2 text-warning"></i>
            Shopping Cart
          </h2>
          {cartItems.length > 0 && (
            <button 
              className="btn btn-outline-danger"
              onClick={clearCart}
              disabled={updating}
            >
              <i className="fas fa-trash me-2"></i>
              Clear Cart
            </button>
          )}
        </div>

        {error && (
          <div className="alert alert-danger">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning"></div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-5">
            <i className="fas fa-shopping-cart fa-4x text-white-50 mb-3"></i>
            <h5 className="mb-3">Your cart is empty</h5>
            <Link to="/buyer/explore" className="btn btn-warning">
              Explore Photos
            </Link>
          </div>
        ) : (
          <div className="row">
            <div className="col-lg-8 mb-4">
              {cartItems.map((item) => (
                <div key={item._id} className="card bg-dark border-secondary mb-3">
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-3">
                        <img
                          src={getImageUrl(item)}
                          className="img-fluid rounded"
                          style={{ height: "60px", objectFit: "cover" }}
                          alt={item.title}
                        />
                      </div>
                      <div className="col-5">
                        <h6 className="fw-bold mb-1">{item.title}</h6>
                        <small className="text-white-50">{item.photographerName}</small>
                      </div>
                      <div className="col-2">
                        <span className="text-warning">KES {item.price}</span>
                      </div>
                      <div className="col-2 text-end">
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeFromCart(item.mediaId)}
                          disabled={updating}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="col-lg-4">
              <div className="card bg-dark border-warning">
                <div className="card-body">
                  <h5 className="fw-bold mb-4">Summary</h5>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Items:</span>
                    <span>{cartItems.length}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span>Total:</span>
                    <span className="text-warning fw-bold">
                      KES {cartItems.reduce((sum, i) => sum + (i.price || 0), 0)}
                    </span>
                  </div>
                  <div className="mb-3">
                    <input
                      type="tel"
                      className="form-control bg-dark border-secondary text-white mb-2"
                      placeholder="M-Pesa Phone Number (254...)"
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                    />
                    <button
                      className="btn btn-success w-100 mb-2"
                      onClick={handleMpesaCheckout}
                      disabled={mpesaProcessing}
                    >
                      {mpesaProcessing ? "Sending STK Push..." : "Checkout with M-Pesa"}
                    </button>
                  </div>
                  <button
                    className="btn btn-warning w-100"
                    onClick={handleCheckout}
                    disabled={updating}
                  >
                    {updating ? "Processing..." : "Checkout"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </BuyerLayout>
  );
};

export default BuyerCart;