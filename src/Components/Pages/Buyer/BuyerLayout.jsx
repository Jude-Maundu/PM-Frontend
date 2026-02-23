import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const BuyerLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState({ name: "Buyer" });
  const [walletBalance, setWalletBalance] = useState("5000");
  const [cartCount, setCartCount] = useState(0);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Load user data safely on component mount
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        setUser(JSON.parse(userStr));
      }
      
      const wallet = localStorage.getItem("wallet");
      if (wallet) {
        setWalletBalance(wallet);
      }

      // Get cart count from localStorage or API (you can implement this later)
      const cart = localStorage.getItem("cart");
      if (cart) {
        const cartData = JSON.parse(cart);
        setCartCount(cartData.length || 0);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Navigation items
  const navItems = [
    { path: "/buyer/dashboard", icon: "fa-home", label: "Dashboard" },
    { path: "/buyer/explore", icon: "fa-compass", label: "Explore" },
    { path: "/buyer/cart", icon: "fa-shopping-cart", label: "Cart", badge: cartCount },
    { path: "/buyer/transactions", icon: "fa-history", label: "Transactions" },
    { path: "/buyer/downloads", icon: "fa-download", label: "My Downloads" },
    { path: "/buyer/favorites", icon: "fa-heart", label: "Favorites" },
    { path: "/buyer/wallet", icon: "fa-wallet", label: "Wallet" },
    { path: "/buyer/profile", icon: "fa-user", label: "Profile" },
  ];

  // Check if a nav item is active
  const isActive = (path) => location.pathname === path;

  // Don't render layout on login page
  if (location.pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-vh-100 bg-dark text-white">
      {/* Background Image */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2070&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: "0.1",
          zIndex: 0,
        }}
      ></div>

      {/* Content */}
      <div className="position-relative" style={{ zIndex: 1 }}>
        {/* Navbar */}
        <nav className="navbar navbar-dark px-4 py-3 sticky-top w-100"
             style={{
               background: "rgba(0, 0, 0, 0.8)",
               backdropFilter: "blur(10px)",
               borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
             }}>
          <div className="container-fluid px-0">
            <div className="d-flex align-items-center">
              <button
                className="btn btn-link text-warning d-md-none p-0 me-3"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <i className="fas fa-bars fa-xl"></i>
              </button>
              <Link to="/buyer/dashboard" className="text-decoration-none">
                <span className="fw-bold fs-4">
                  <i className="fas fa-camera text-warning me-2"></i>
                  <span className="text-white">Photo</span>
                  <span className="text-warning">Market</span>
                </span>
              </Link>
              <span className="badge bg-warning text-dark ms-3 d-none d-md-inline">
                Buyer
              </span>
            </div>

            <div className="d-flex align-items-center gap-3">
              {/* Cart Icon */}
              <Link to="/buyer/cart" className="text-white position-relative text-decoration-none">
                <i className="fas fa-shopping-cart fa-lg"></i>
                {cartCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark"
                        style={{ fontSize: "0.6rem" }}>
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Wallet */}
              <div className="d-none d-md-block">
                <span className="badge bg-warning bg-opacity-25 text-warning p-2">
                  <i className="fas fa-wallet me-2"></i>
                  KES {parseInt(walletBalance).toLocaleString()}
                </span>
              </div>

              {/* User Menu */}
              <div className="dropdown">
                <button
                  className="btn btn-link text-white text-decoration-none dropdown-toggle p-0"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="fas fa-user-circle fa-lg me-1"></i>
                  <span className="d-none d-md-inline">
                    {user?.name || "Buyer"}
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end bg-dark border-secondary">
                  <li>
                    <Link className="dropdown-item text-white" to="/buyer/profile">
                      <i className="fas fa-user me-2 text-warning"></i>Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item text-white" to="/buyer/wallet">
                      <i className="fas fa-wallet me-2 text-warning"></i>Wallet
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item text-white" to="/buyer/settings">
                      <i className="fas fa-cog me-2 text-warning"></i>Settings
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider bg-secondary" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt me-2"></i>Logout
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </nav>

        <div className="container-fluid">
          <div className="row">
            {/* Sidebar */}
            <div className={`col-md-2 p-0 ${sidebarOpen ? 'd-block' : 'd-none d-md-block'}`}
                 style={{
                   background: "rgba(0, 0, 0, 0.7)",
                   backdropFilter: "blur(10px)",
                   borderRight: "1px solid rgba(255, 255, 255, 0.1)",
                   minHeight: "calc(100vh - 70px)",
                   position: "relative",
                 }}>
              
              <div className="p-4 border-bottom border-secondary border-opacity-25">
                <h6 className="text-white-50 small mb-0">
                  <i className="fas fa-shopping-bag me-2"></i>
                  BUYER MENU
                </h6>
              </div>

              <ul className="nav flex-column p-3">
                {navItems.map((item, idx) => (
                  <li className="nav-item mb-2" key={idx}>
                    <Link
                      to={item.path}
                      className="nav-link d-flex align-items-center justify-content-between rounded-3 py-2 px-3"
                      style={{
                        background: isActive(item.path) ? "rgba(255, 193, 7, 0.15)" : "transparent",
                        border: isActive(item.path) ? "1px solid rgba(255, 193, 7, 0.3)" : "none",
                        color: isActive(item.path) ? "#ffc107" : "rgba(255,255,255,0.7)",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive(item.path)) {
                          e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive(item.path)) {
                          e.currentTarget.style.background = "transparent";
                        }
                      }}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span>
                        <i className={`fas ${item.icon} me-3`} style={{ width: "20px" }}></i>
                        {item.label}
                      </span>
                      {item.badge > 0 && (
                        <span className="badge bg-warning text-dark rounded-pill">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="p-3 position-absolute bottom-0 w-100">
                <div className="p-3 rounded-3"
                     style={{ background: "rgba(255,255,255,0.03)" }}>
                  <small className="text-white-50 d-block text-center">
                    Wallet Balance: <span className="text-warning">KES {parseInt(walletBalance).toLocaleString()}</span>
                  </small>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className={`col-md-10 p-4 ${sidebarOpen ? 'd-none d-md-block' : ''}`}>
              {children}
            </div>
          </div>
        </div>

        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-md-none"
            style={{
              background: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(3px)",
              zIndex: 1035,
              cursor: "pointer",
            }}
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
      </div>
    </div>
  );
};

export default BuyerLayout;