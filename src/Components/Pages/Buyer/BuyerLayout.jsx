import React, { useState, useEffect } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { getLocalCart } from "../../../utils/localStore";
import ThemeToggle from "../../ThemeToggle";
import NotificationBell from "../../NotificationBell";
import { getStoredUser, getDisplayName } from "../../../utils/auth";

const BuyerLayout = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("mc-sidebar-collapsed") === "true"
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate    = useNavigate();
  const location    = useLocation();
  const storedUser   = getStoredUser();
  const displayName  = getDisplayName(storedUser) || "Buyer";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    try { setCartCount(getLocalCart().length); } catch {}
  }, []);

  useEffect(() => {
    const handleCartUpdate = () => setCartCount(getLocalCart().length);
    window.addEventListener("pm:cart-updated", handleCartUpdate);
    return () => window.removeEventListener("pm:cart-updated", handleCartUpdate);
  }, []);

  const handleLogout = () => { localStorage.clear(); window.location.href = '/login'; };

  const toggleSidebar = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem("mc-sidebar-collapsed", next);
      return next;
    });
  };

  const closeMobile = () => setMobileOpen(false);

  const navItems = [
    { path: "/buyer/dashboard",    icon: "fa-home",          label: "Dashboard"    },
    { path: "/buyer/explore",      icon: "fa-compass",       label: "Explore"      },
    { path: "/buyer/cart",         icon: "fa-shopping-cart", label: "Cart",         badge: cartCount },
    { path: "/buyer/transactions", icon: "fa-history",       label: "Transactions" },
    { path: "/buyer/downloads",    icon: "fa-download",      label: "My Downloads" },
    { path: "/buyer/favorites",    icon: "fa-heart",         label: "Favorites"    },
    { path: "/buyer/wallet",       icon: "fa-wallet",        label: "Wallet"       },
    { path: "/buyer/referral",     icon: "fa-gift",          label: "Referral"     },
    { path: "/buyer/profile",      icon: "fa-user",          label: "Profile"      },
    { path: "/buyer/settings",     icon: "fa-cog",           label: "Settings"     },
  ];

  if (location.pathname === "/login") return <>{children}</>;

  const activeItem = navItems.find(n => location.pathname === n.path || location.pathname.startsWith(n.path + "/"));

  return (
    <div className={`mc-shell${collapsed ? " mc-collapsed" : ""}`}>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="mc-mobile-backdrop" onClick={closeMobile} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`mc-sidebar${mobileOpen ? " mc-sidebar-open" : ""}`}>
        <div className="mc-sidebar-brand">
          <Link to="/buyer/dashboard" className="mc-brand-logo-wrap" onClick={closeMobile}>
            <img src="/Pasted%20image.png" alt="PM" className="mc-sidebar-logo" />
            <span className="mc-brand-name">Relic Snap</span>
          </Link>
          <button className="mc-toggle-btn d-none d-md-flex" onClick={toggleSidebar} title={collapsed ? "Expand" : "Collapse"}>
            <i className={`fas fa-chevron-${collapsed ? "right" : "left"}`}></i>
          </button>
          <button className="mc-toggle-btn d-md-none" onClick={closeMobile}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <nav className="mc-nav">
          {navItems.map((item, idx) => (
            <NavLink key={idx} to={item.path}
              className={({ isActive }) => `mc-nav-item${isActive ? " active" : ""}`}
              title={collapsed ? item.label : ""}
              onClick={closeMobile}
            >
              <i className={`fas ${item.icon} mc-nav-icon`}></i>
              <span className="mc-nav-label">{item.label}</span>
              {item.badge > 0 && <span className="mc-nav-badge">{item.badge}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="mc-sidebar-footer">
          <button className="mc-logout-btn" onClick={handleLogout} title={collapsed ? "Logout" : ""}>
            <i className="fas fa-sign-out-alt mc-nav-icon"></i>
            <span className="mc-logout-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="mc-main">
        {/* Topbar */}
        <div className="mc-topbar">
          <button className="mc-hamburger d-md-none" onClick={() => setMobileOpen(true)}>
            <i className="fas fa-bars"></i>
          </button>

          <div className="mc-topbar-title">
            {activeItem ? (
              <>
                <i className={`fas ${activeItem.icon} mc-topbar-page-icon`}></i>
                <span className="mc-topbar-page-name">{activeItem.label}</span>
              </>
            ) : <span className="mc-topbar-page-name">Dashboard</span>}
          </div>

          <div className="mc-topbar-actions">
            <div className="mc-topbar-profile">
              <div className="mc-topbar-avatar" title={displayName} style={{ width: 32, height: 32, fontSize: "0.78rem" }}>
                {storedUser?.profilePicture ? (
                  <img src={storedUser.profilePicture} alt={displayName} />
                ) : avatarLetter}
              </div>
              <div className="mc-topbar-profile-info d-none d-sm-flex" style={{ flexDirection: "column" }}>
                <span className="mc-topbar-profile-name">{displayName}</span>
                <span className="mc-topbar-profile-status">Active</span>
              </div>
            </div>
            <div className="mc-icon-btn"><ThemeToggle /></div>
            <NotificationBell />
            <NavLink to="/buyer/explore" className="mc-topbar-action-btn d-none d-sm-flex">
              <i className="fas fa-compass"></i>Explore
            </NavLink>
          </div>
        </div>

        {/* Page content */}
        <div className="mc-content">
          {children}
        </div>
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className={`mc-bottom-nav${mobileOpen ? " mc-bottom-nav-hidden" : ""}`}>
        <div className="mc-bottom-nav-inner">
          {[
            { path: "/buyer/dashboard",    icon: "fa-home",          label: "Home"      },
            { path: "/buyer/explore",      icon: "fa-compass",       label: "Explore"   },
            { path: "/buyer/cart",         icon: "fa-shopping-cart", label: "Cart",      badge: cartCount },
            { path: "/buyer/favorites",    icon: "fa-heart",         label: "Favorites" },
            { path: "/buyer/profile",      icon: "fa-user",          label: "Profile"   },
          ].map((item, idx) => (
            <NavLink
              key={idx}
              to={item.path}
              className={({ isActive }) => `mc-bottom-nav-link${isActive ? " active" : ""}`}
            >
              <i className={`fas ${item.icon}`}></i>
              {item.badge > 0 && <span className="mc-bottom-nav-badge">{item.badge}</span>}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default BuyerLayout;
