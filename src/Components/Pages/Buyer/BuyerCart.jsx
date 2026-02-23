import React, { useState, useEffect } from "react";
import BuyerLayout from "./BuyerLayout";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:4000/api";

const BuyerCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [authChecked, setAuthChecked] = useState(false);
  
  const navigate = useNavigate();

  // Get auth data inside useEffect to avoid hydration issues
  const [auth, setAuth] = useState({
    token: null,
    userId: null,
    user: {},
    headers: {}
  });

  // Load auth data on component mount
  useEffect(() => {
    console.log("========== LOADING AUTH DATA ==========");
    
    const token = localStorage.getItem("token");
    console.log("Token:", token ? "Present" : "Missing");
    
    let user = {};
    try {
      const userStr = localStorage.getItem("user");
      user = userStr ? JSON.parse(userStr) : {};
      console.log("User object:", user);
    } catch (e) {
      console.error("Failed to parse user:", e);
    }
    
    // Find user ID from multiple possible fields
    const userId = user.id || user._id || user.userId || user.uid || user.user_id;
    console.log("Selected userId:", userId);
    
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    setAuth({
      token,
      userId,
      user,
      headers
    });
    
    setAuthChecked(true);
    console.log("=====================================");
  }, []);

  // Check authentication after auth data is loaded
  useEffect(() => {
    if (!authChecked) return;
    
    if (!auth.token) {
      console.log("❌ No token found - redirecting to login");
      navigate("/login");
      return;
    }
    
    if (!auth.userId) {
      console.log("❌ No user ID found - redirecting to login");
      console.log("User object received:", auth.user);
      navigate("/login");
      return;
    }
    
    console.log("✅ Authentication passed - fetching cart");
    fetchCart();
    
  }, [authChecked, auth.token, auth.userId, auth.user]);

  // Fetch cart items
  const fetchCart = async () => {
    try {
      setLoading(true);
      console.log("📦 Fetching cart for user:", auth.userId);
      console.log("🔗 URL:", `${API}/payments/cart/${auth.userId}`);
      
      const res = await axios.get(`${API}/payments/cart/${auth.userId}`, { headers: auth.headers });
      console.log("✅ Cart response:", res.data);
      setCartItems(res.data.items || []);
      
      // Also fetch wallet balance
      try {
        console.log("💰 Fetching wallet for user:", auth.userId);
        const walletRes = await axios.get(`${API}/payments/wallet/${auth.userId}`, { headers: auth.headers });
        console.log("✅ Wallet response:", walletRes.data);
        setWalletBalance(walletRes.data.balance || 0);
      } catch (walletErr) {
        console.error("❌ Wallet fetch error:", walletErr.message);
        // Don't set error for wallet, just use default 0
      }
      
    } catch (err) {
      console.error("❌ Cart fetch error:", err.message);
      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Data:", err.response.data);
        
        if (err.response.status === 401) {
          console.log("🔄 Token expired - clearing storage and redirecting");
          localStorage.clear();
          navigate("/login");
          return;
        }
      }
      setError(err.response?.data?.message || "Failed to load cart items");
    } finally {
      setLoading(false);
    }
  };

  // Remove from cart
  const removeFromCart = async (mediaId) => {
    try {
      setUpdating(true);
      await axios.post(`${API}/payments/cart/remove`, {
        userId: auth.userId,
        mediaId
      }, { headers: auth.headers });
      await fetchCart();
    } catch (err) {
      console.error("Error removing from cart:", err);
      setError("Failed to remove item");
    } finally {
      setUpdating(false);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your cart?")) return;
    
    try {
      setUpdating(true);
      await axios.delete(`${API}/payments/cart/${auth.userId}`, { headers: auth.headers });
      setCartItems([]);
    } catch (err) {
      console.error("Error clearing cart:", err);
      setError("Failed to clear cart");
    } finally {
      setUpdating(false);
    }
  };

  // Direct purchase with mock payment
  const handleDirectPurchase = async (mediaId) => {
    try {
      setUpdating(true);
      const res = await axios.post(`${API}/payments/buy`, {
        userId: auth.userId,
        mediaId
      }, { headers: auth.headers });
      
      if (res.data.success) {
        alert("Purchase successful! Check your downloads.");
        await removeFromCart(mediaId);
      }
    } catch (err) {
      console.error("Purchase error:", err);
      setError(err.response?.data?.message || "Purchase failed");
    } finally {
      setUpdating(false);
    }
  };

  // Process checkout
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    const total = calculateTotal();
    
    if (total > walletBalance) {
      alert("Insufficient wallet balance. Please add funds.");
      navigate("/buyer/wallet");
      return;
    }

    try {
      setUpdating(true);
      
      for (const item of cartItems) {
        await axios.post(`${API}/payments/buy`, {
          userId: auth.userId,
          mediaId: item.mediaId
        }, { headers: auth.headers });
      }
      
      await clearCart();
      alert("All items purchased successfully!");
      navigate("/buyer/downloads");
      
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err.response?.data?.message || "Checkout failed");
    } finally {
      setUpdating(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
  };

  const getImageUrl = (item) => {
    if (!item?.fileUrl) return "https://via.placeholder.com/300";
    const filename = item.fileUrl.split('/').pop();
    return `http://localhost:4000/uploads/photos/${filename}`;
  };

  // Show loading while checking auth
  if (!authChecked) {
    return (
      <div className="min-vh-100 bg-dark text-white d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-warning mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading authentication...</p>
        </div>
      </div>
    );
  }

  if (!auth.token || !auth.userId) {
    return (
      <div className="min-vh-100 bg-dark text-white d-flex align-items-center justify-content-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-warning fa-4x mb-3"></i>
          <h5>Authentication Required</h5>
          <p className="text-white-50 mb-4">Please log in to view your cart</p>
          <button 
            className="btn btn-warning"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <BuyerLayout>
      <div className="text-white">
        {/* Header */}
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
        ) : cartItems.length === 0 ? (
          <div className="text-center py-5">
            <i className="fas fa-shopping-cart fa-4x text-white-50 mb-3"></i>
            <h5 className="mb-3">Your cart is empty</h5>
            <p className="text-white-50 mb-4">Start exploring and add some amazing photos to your cart!</p>
            <Link to="/buyer/explore" className="btn btn-warning btn-lg">
              <i className="fas fa-compass me-2"></i>
              Explore Photos
            </Link>
          </div>
        ) : (
          <div className="row">
            {/* Cart Items */}
            <div className="col-lg-8 mb-4 mb-lg-0">
              <div className="card bg-dark border-secondary">
                <div className="card-body">
                  {cartItems.map((item, index) => (
                    <div key={item._id || index} className="mb-3 pb-3 border-bottom border-secondary">
                      <div className="row align-items-center">
                        <div className="col-md-3 col-4">
                          <img
                            src={getImageUrl(item)}
                            alt={item.title}
                            className="img-fluid rounded"
                            style={{ height: "80px", objectFit: "cover", width: "100%" }}
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/300";
                            }}
                          />
                        </div>

                        <div className="col-md-5 col-8">
                          <h6 className="fw-bold mb-1">{item.title}</h6>
                          <small className="text-white-50">
                            By {item.photographerName || "Anonymous"}
                          </small>
                        </div>

                        <div className="col-md-2 col-6 mt-2 mt-md-0">
                          <div className="text-warning fw-bold">
                            KES {item.price}
                          </div>
                        </div>

                        <div className="col-md-2 col-6 mt-2 mt-md-0 text-end">
                          <button
                            className="btn btn-sm btn-outline-danger me-2"
                            onClick={() => removeFromCart(item.mediaId)}
                            disabled={updating}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleDirectPurchase(item.mediaId)}
                            disabled={updating}
                          >
                            <i className="fas fa-bolt"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="col-lg-4">
              <div className="card bg-dark border-warning sticky-top" style={{ top: "100px" }}>
                <div className="card-body">
                  <h5 className="fw-bold mb-4">Order Summary</h5>
                  
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Subtotal ({cartItems.length} items):</span>
                      <span>KES {calculateTotal()}</span>
                    </div>
                    <hr className="border-secondary" />
                    <div className="d-flex justify-content-between fw-bold mb-3">
                      <span>Total:</span>
                      <span className="text-warning fs-5">KES {calculateTotal()}</span>
                    </div>
                  </div>

                  <div className="mb-4 p-3 rounded" style={{ background: "rgba(255,193,7,0.1)" }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <small className="text-white-50 d-block">Wallet Balance</small>
                        <span className="fw-bold">KES {walletBalance.toLocaleString()}</span>
                      </div>
                      <Link to="/buyer/wallet" className="btn btn-sm btn-outline-warning">
                        <i className="fas fa-plus"></i>
                      </Link>
                    </div>
                    {calculateTotal() > walletBalance && (
                      <div className="mt-2 text-danger small">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        Insufficient balance. Please add funds.
                      </div>
                    )}
                  </div>

                  <button
                    className="btn btn-warning w-100 py-3 fw-bold mb-3"
                    onClick={handleCheckout}
                    disabled={updating || cartItems.length === 0 || calculateTotal() > walletBalance}
                  >
                    {updating ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-credit-card me-2"></i>
                        Checkout All ({cartItems.length} items)
                      </>
                    )}
                  </button>

                  <Link to="/buyer/explore" className="btn btn-outline-warning w-100">
                    <i className="fas fa-arrow-left me-2"></i>
                    Continue Shopping
                  </Link>
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