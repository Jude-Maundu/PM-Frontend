import React, { useState, useEffect } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { getLocalCart } from "../../../utils/localStore";
import ThemeToggle from "../../ThemeToggle";
import NotificationBell from "../../NotificationBell";
import { getStoredUser, getDisplayName } from "../../../utils/auth";

const BuyerLayout = ({ children }) => {
  const [isMobile, setIsMobile]   = useState(window.innerWidth < 768);
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
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const mobileItems = navItems.slice(0, 5);

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
            <div className="mc-icon-btn"><ThemeToggle /></div>
            <NotificationBell />
            <div className="mc-topbar-avatar" title={displayName}>
              {storedUser?.profilePicture ? (
                <img src={storedUser.profilePicture} alt={displayName} />
              ) : avatarLetter}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="mc-page">
          {children}
        </div>

        <div className="d-md-none" style={{ height: "72px" }}></div>
      </main>

      {/* ── Mobile bottom nav ── */}
      {isMobile && (
        <div className="d-md-none position-fixed bottom-0 start-0 w-100" style={{
          background: "var(--mc-sidebar-bg)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          zIndex: 1030,
          paddingBottom: "env(safe-area-inset-bottom)",
        }}>
          <div className="d-flex justify-content-around align-items-center py-2">
            {mobileItems.map((item, idx) => (
              <NavLink key={idx} to={item.path}
                style={({ isActive }) => ({
                  color: isActive ? "var(--mc-accent)" : "#5A7AAA",
                  fontSize: "0.62rem",
                })}
                className="d-flex flex-column align-items-center text-decoration-none py-1 px-2 rounded position-relative"
              >
                {({ isActive }) => (
                  <>
                    <i className={`fas ${item.icon} mb-1`} style={{ fontSize: "1rem" }}></i>
                    <span>{item.label.split(" ")[0]}</span>
                    {item.badge > 0 && (
                      <span style={{ position:"absolute",top:"2px",right:"4px",width:"14px",height:"14px",borderRadius:"50%",background:"#F06B8D",color:"#fff",fontSize:"0.55rem",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700 }}>{item.badge}</span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerLayout;
