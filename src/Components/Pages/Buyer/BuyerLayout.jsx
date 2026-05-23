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

  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  const toggleSidebar = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem("mc-sidebar-collapsed", next);
      return next;
    });
  };

  const navItems = [
    { path: "/buyer/dashboard",    icon: "fa-home",          label: "Dashboard"    },
    { path: "/buyer/explore",      icon: "fa-compass",       label: "Explore"      },
    { path: "/buyer/follow",       icon: "fa-user-friends",  label: "Following"    },
    { path: "/buyer/cart",         icon: "fa-shopping-cart", label: "Cart",         badge: cartCount },
    { path: "/buyer/transactions", icon: "fa-history",       label: "Transactions" },
    { path: "/buyer/downloads",    icon: "fa-download",      label: "My Downloads" },
    { path: "/buyer/favorites",    icon: "fa-heart",         label: "Favorites"    },
    { path: "/messages",           icon: "fa-comments",      label: "Messages"     },
    { path: "/buyer/wallet",       icon: "fa-wallet",        label: "Wallet"       },
    { path: "/buyer/referral",     icon: "fa-gift",          label: "Referral"     },
    { path: "/buyer/profile",      icon: "fa-user",          label: "Profile"      },
    { path: "/buyer/settings",     icon: "fa-cog",           label: "Settings"     },
  ];

  if (location.pathname === "/login") return <>{children}</>;

  return (
    <div className={`mc-shell${collapsed ? " mc-collapsed" : ""}`}>
      {/* ── Sidebar ── */}
      <aside className="mc-sidebar d-none d-md-flex">
        <div className="mc-sidebar-brand">
          <Link to="/buyer/dashboard" className="mc-brand-logo-wrap">
            <img src="/Pasted%20image.png" alt="PM" className="mc-sidebar-logo" />
            <span className="mc-brand-name">PhotoMarket</span>
          </Link>
          <button className="mc-toggle-btn" onClick={toggleSidebar} title={collapsed ? "Expand" : "Collapse"}>
            <i className={`fas fa-chevron-${collapsed ? "right" : "left"}`}></i>
          </button>
        </div>

        <nav className="mc-nav">
          {navItems.map((item, idx) => (
            <NavLink key={idx} to={item.path}
              className={({ isActive }) => `mc-nav-item${isActive ? " active" : ""}`}
              title={collapsed ? item.label : ""}
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
        {/* Navbar */}
        <div className="mc-topbar">
          <div className="mc-search-wrap">
            <i className="fas fa-search mc-search-icon"></i>
            <input className="mc-search" placeholder="Search photos..." readOnly />
          </div>
          <div className="mc-topbar-actions">
            <div className="mc-topbar-profile">
              <div className="mc-topbar-avatar" title={displayName} style={{ width: 32, height: 32, fontSize: "0.78rem" }}>
                {storedUser?.profilePicture ? (
                  <img src={storedUser.profilePicture} alt={displayName} />
                ) : avatarLetter}
              </div>
              <div className="mc-topbar-profile-info">
                <span className="mc-topbar-profile-name">{displayName}</span>
                <span className="mc-topbar-profile-status">Active</span>
              </div>
            </div>
            <div className="mc-icon-btn"><ThemeToggle /></div>
            <NotificationBell />
            <NavLink to="/buyer/explore" className="mc-topbar-action-btn">
              <i className="fas fa-compass"></i>Explore
            </NavLink>
          </div>
        </div>

        {/* Page content */}
        <div className="mc-page">
          {children}
        </div>

      </main>
    </div>
  );
};

export default BuyerLayout;
