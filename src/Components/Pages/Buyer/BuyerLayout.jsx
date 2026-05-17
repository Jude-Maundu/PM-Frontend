import React, { useState, useEffect } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import NotificationDropdown from "../../NotificationDropdown";
import { getLocalCart } from "../../../utils/localStore";
import ThemeToggle from "../../ThemeToggle";

const BuyerLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState({ name: "Buyer" });
  const [walletBalance, setWalletBalance] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-close sidebar on resize to desktop
      if (!mobile) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Load user data safely on component mount
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        setUser(JSON.parse(userStr));
      }

      const walletData = localStorage.getItem("pm_wallet");
      if (walletData) {
        const parsed = JSON.parse(walletData);
        setWalletBalance(Number(parsed.balance || 0));
      } else {
        const oldWallet = localStorage.getItem("wallet");
        if (oldWallet !== null) {
          setWalletBalance(Number(oldWallet) || 0);
        }
      }

      setCartCount(getLocalCart().length);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }, []);

  // Keep cart badge in sync
  useEffect(() => {
    const handleCartUpdate = () => setCartCount(getLocalCart().length);
    window.addEventListener("pm:cart-updated", handleCartUpdate);
    return () => window.removeEventListener("pm:cart-updated", handleCartUpdate);
  }, []);

  // Keep wallet balance in sync
  useEffect(() => {
    const handleWalletUpdate = () => {
      try {
        const walletData = localStorage.getItem("pm_wallet");
        if (walletData) {
          const parsed = JSON.parse(walletData);
          setWalletBalance(parsed.balance || 0);
        }
      } catch (error) {
        console.error("Error updating wallet balance:", error);
      }
    };
    window.addEventListener("pm:wallet-updated", handleWalletUpdate);
    return () => window.removeEventListener("pm:wallet-updated", handleWalletUpdate);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const navItems = [
    { path: "/buyer/dashboard", icon: "fa-home", label: "Dashboard", mobileLabel: "Home" },
    { path: "/buyer/explore", icon: "fa-compass", label: "Explore", mobileLabel: "Explore" },
    { path: "/buyer/follow", icon: "fa-user-friends", label: "Followers", mobileLabel: "Followers" },
    { path: "/buyer/cart", icon: "fa-shopping-cart", label: "Cart", mobileLabel: "Cart", badge: cartCount },
    { path: "/buyer/transactions", icon: "fa-history", label: "Transactions", mobileLabel: "History" },
    { path: "/buyer/downloads", icon: "fa-download", label: "My Downloads", mobileLabel: "Downloads" },
    { path: "/buyer/favorites", icon: "fa-heart", label: "Favorites", mobileLabel: "Likes" },
    { path: "/messages", icon: "fa-comments", label: "Messages", mobileLabel: "Messages" },
    { path: "/buyer/wallet", icon: "fa-wallet", label: "Wallet", mobileLabel: "Wallet" },
    { path: "/buyer/profile", icon: "fa-user", label: "Profile", mobileLabel: "Profile" },
    { path: "/buyer/settings", icon: "fa-cog", label: "Settings", mobileLabel: "Settings" },
  ];

  // Don't render layout on login page
  if (location.pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="dash-shell">
      {/* Content */}
      <div className="position-relative app-content-wrapper">
        {/* Navbar */}
        <nav className="navbar navbar-dark px-3 px-md-4 py-2 py-md-3 sticky-top w-100 glass-navbar">
          <div className="container-fluid px-0">
            <div className="d-flex align-items-center gap-2 gap-md-3">
              {/* Hamburger menu - only visible on mobile */}
              <button
                className="btn btn-link text-warning d-md-none p-0 icon-btn"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <i className={`fas ${sidebarOpen ? "fa-times" : "fa-bars"}`}></i>
              </button>
              <Link to="/buyer/dashboard" className="d-flex align-items-center text-decoration-none">
                <img
                  src="/Pasted%20image.png"
                  alt="PhotoMarket Logo"
                  className="brand-logo me-2"
                />
                <span className="fw-bold brand-title">
                  <span className="text-white d-none d-sm-inline">Photo</span>
                  <span className="text-warning d-none d-sm-inline">Market</span>
                  <span className="text-white d-inline d-sm-none">PM</span>
                </span>
              </Link>
              <span className="badge-teal d-none d-md-inline">
                Buyer
              </span>
            </div>

            <div className="d-flex align-items-center gap-2 gap-md-3">
              <Link to="/buyer/cart" className="text-white position-relative text-decoration-none">
                <i className="fas fa-shopping-cart icon-btn-sm"></i>
                {cartCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark cart-count-badge">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              <ThemeToggle />

              {/* Notification Dropdown - NOW VISIBLE ON ALL SCREENS */}
              <div className="notification-wrapper">
                <NotificationDropdown userRole="buyer" />
              </div>

              {/* Wallet Balance - Hidden on very small screens, visible on tablet+ */}
              <div className="d-none d-md-block">
                <span className="badge-teal p-2">
                  <i className="fas fa-wallet me-2"></i>
                  KES {Number(walletBalance).toLocaleString()}
                </span>
              </div>

              <div className="dropdown">
                <button
                  className="btn btn-link text-white text-decoration-none dropdown-toggle p-0 d-flex align-items-center text-sm"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="fas fa-user-circle icon-btn"></i>
                  <span className="d-none d-md-inline ms-1 ms-md-2">
                    {user?.name?.split(' ')[0] || "Buyer"}
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end" style={{ background: "rgba(15,30,40,0.96)", backdropFilter: "blur(20px)", border: "1px solid rgba(107,189,208,0.2)", borderRadius: "var(--radius-lg)" }}>
                  <li><Link className="dropdown-item text-white" to="/buyer/profile"><i className="fas fa-user me-2" style={{color:"var(--pm-teal)"}}></i>Profile</Link></li>
                  <li><Link className="dropdown-item text-white" to="/buyer/wallet"><i className="fas fa-wallet me-2" style={{color:"var(--pm-teal)"}}></i>Wallet</Link></li>
                  <li><Link className="dropdown-item text-white" to="/buyer/settings"><i className="fas fa-cog me-2" style={{color:"var(--pm-teal)"}}></i>Settings</Link></li>
                  <li><hr className="dropdown-divider" style={{borderColor:"rgba(107,189,208,0.2)"}} /></li>
                  <li><button className="dropdown-item text-danger" onClick={handleLogout}><i className="fas fa-sign-out-alt me-2"></i>Logout</button></li>
                </ul>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Wallet Banner */}
        {isMobile && (
          <div className="d-md-none px-3 py-2 sticky-top mobile-balance-strip" style={{ background: "rgba(10,20,28,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(107,189,208,0.12)" }}>
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-white-50 small">
                <i className="fas fa-wallet me-1 text-warning"></i>Wallet Balance
              </span>
              <span className="text-warning fw-bold">
                KES {Number(walletBalance).toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Main Layout Container */}
        <div className="d-flex app-layout-container">
          {/* Sidebar - Always visible on desktop, conditionally on mobile */}
          <div
            className={`app-sidebar glass-sidebar ${isMobile ? 'position-fixed top-0 start-0 h-100' : 'position-relative d-block'} ${isMobile && !sidebarOpen ? 'd-none' : 'd-block'} ${isMobile ? (sidebarOpen ? 'sidebar-open' : 'sidebar-closed') : 'sidebar-open'}`}
          >
            {/* Mobile Sidebar Header */}
            {isMobile && (
              <div className="d-flex d-md-none justify-content-between align-items-center p-3 border-bottom border-secondary">
                <div>
                  <div className="d-flex align-items-center gap-2">
                    <img
                      src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=90&q=80"
                      alt="PhotoMarket Logo"
                      className="brand-logo-sm"
                    />
                    <span className="fw-bold text-white small">
                      PhotoMarket
                    </span>
                  </div>
                  <div className="small text-white-50 mt-1">
                    <i className="fas fa-user me-1"></i>
                    {user?.name || "Buyer"}
                  </div>
                </div>
                <button
                  className="btn btn-link text-warning p-0"
                  onClick={() => setSidebarOpen(false)}
                >
                  <i className="fas fa-times fa-lg"></i>
                </button>
              </div>
            )}

            <div className="p-3 p-md-4 sidebar-header">
              <h6 style={{ color: "rgba(107,189,208,0.7)", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 0 }}>
                <i className="fas fa-shopping-bag me-2"></i>
                Buyer Menu
              </h6>
            </div>

            <ul className="nav flex-column p-2 p-md-3">
              {navItems.map((item, idx) => (
                <li className="nav-item mb-1 mb-md-2" key={idx}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `sidebar-link d-flex align-items-center justify-content-between ${isActive ? 'active' : ''}`
                    }
                    onClick={() => isMobile && setSidebarOpen(false)}
                  >
                    <span className="d-flex align-items-center">
                      <i className={`fas ${item.icon} me-2 me-md-3 nav-icon`}></i>
                      <span className="d-none d-md-inline">{item.label}</span>
                      <span className="d-inline d-md-none">{item.mobileLabel}</span>
                    </span>
                    {item.badge > 0 && (
                      <span className="badge-teal" style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem" }}>
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Wallet Info in Sidebar for mobile */}
            {isMobile && sidebarOpen && (
              <div className="p-3 mt-auto" style={{ borderTop: "1px solid rgba(107,189,208,0.15)" }}>
                <div className="glass-stat p-3 text-center">
                  <small style={{ color: "rgba(255,255,255,0.5)" }}>Wallet Balance</small>
                  <div style={{ color: "var(--pm-teal)", fontWeight: 700, fontSize: "1rem" }}>
                    KES {Number(walletBalance).toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex-grow-1 app-main-content">
            <div className="p-3 p-md-4">
              {children}
            </div>
          </div>
        </div>

        {/* Mobile Backdrop */}
        {isMobile && sidebarOpen && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 mobile-backdrop"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
      </div>

      {/* Mobile Bottom Navigation Bar */}
      {isMobile && !sidebarOpen && (
        <div className="d-md-none position-fixed bottom-0 start-0 w-100 floating-bottom-nav">
          <div className="d-flex justify-content-around align-items-center py-2">
            {navItems.slice(0, 5).map((item, idx) => (
              <NavLink
                key={idx}
                to={item.path}
                className={({ isActive }) => 
                  `mobile-nav-link d-flex flex-column align-items-center text-decoration-none py-1 px-2 rounded ${
                    isActive ? 'active' : ''
                  }`
                }
              >
                <i className={`fas ${item.icon} mb-1 mobile-nav-icon`}></i>
                <span className="small">{item.mobileLabel}</span>
                {item.badge > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark mobile-badge">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </NavLink>
            ))}
            <NavLink
              to="/buyer/profile"
              className={({ isActive }) => 
                `mobile-nav-link d-flex flex-column align-items-center text-decoration-none py-1 px-2 rounded ${
                  isActive ? 'active' : ''
                }`
              }
            >
              <i className="fas fa-user mb-1 mobile-nav-icon"></i>
              <span className="small">Profile</span>
            </NavLink>
          </div>
        </div>
      )}

      {/* Add padding bottom on mobile for bottom nav */}
      {isMobile && !sidebarOpen && (
        <div className="mobile-bottom-spacer"></div>
      )}

      <style>{`
        .notification-wrapper {
          display: block;
        }
        
        /* Ensure notification dropdown is properly positioned on mobile */
        @media (max-width: 768px) {
          .notification-wrapper {
            margin-right: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default BuyerLayout;