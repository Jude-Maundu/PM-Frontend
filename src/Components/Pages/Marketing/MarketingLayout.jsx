import React, { useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import ThemeToggle from "../../ThemeToggle";
import NotificationBell from "../../NotificationBell";
import { getStoredUser, getDisplayName } from "../../../utils/auth";

const MarketingLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("mc-sidebar-collapsed") === "true"
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const location    = useLocation();
  const storedUser  = getStoredUser();
  const displayName = getDisplayName(storedUser) || "Marketing Lead";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const handleLogout = () => { localStorage.clear(); window.location.href = "/login"; };

  const toggleSidebar = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem("mc-sidebar-collapsed", next);
      return next;
    });
  };

  const closeMobile = () => setMobileOpen(false);

  const navItems = [
    { path: "/marketing/dashboard",  icon: "fa-chart-line",     label: "Dashboard"       },
    { path: "/marketing/campaigns",  icon: "fa-bullseye",       label: "Campaigns"       },
    { path: "/marketing/analytics",  icon: "fa-chart-bar",      label: "Analytics"       },
    { path: "/marketing/push",       icon: "fa-paper-plane",    label: "Push & Email"    },
    { path: "/marketing/ads",        icon: "fa-ad",             label: "Advertisements"  },
    { path: "/marketing/referrals",  icon: "fa-gift",           label: "Referrals"       },
    { path: "/marketing/revenue",    icon: "fa-dollar-sign",    label: "Revenue"         },
    { path: "/marketing/insights",   icon: "fa-users",          label: "Customer Insights"},
    { path: "/marketing/trends",     icon: "fa-fire",           label: "Trends"          },
    { path: "/marketing/content",    icon: "fa-paint-brush",    label: "Content & Banners"},
    { path: "/marketing/profile",    icon: "fa-user",           label: "My Profile"      },
  ];

  if (location.pathname === "/login") return <>{children}</>;

  const activeItem = navItems.find(n =>
    location.pathname === n.path || location.pathname.startsWith(n.path + "/")
  );

  const accentColor = "#F59E0B";

  return (
    <div className={`mc-shell${collapsed ? " mc-collapsed" : ""}`} data-role="marketing">
      {mobileOpen && <div className="mc-mobile-backdrop" onClick={closeMobile} />}

      <aside className={`mc-sidebar${mobileOpen ? " mc-sidebar-open" : ""}`}>
        <div className="mc-sidebar-brand">
          <Link to="/marketing/dashboard" className="mc-brand-logo-wrap" onClick={closeMobile}>
            <img src="/Pasted%20image.png" alt="RS" className="mc-sidebar-logo" />
            <span className="mc-brand-name">Relic Snap</span>
          </Link>
          <button className="mc-toggle-btn d-none d-md-flex" onClick={toggleSidebar}>
            <i className={`fas fa-chevron-${collapsed ? "right" : "left"}`}></i>
          </button>
          <button className="mc-toggle-btn d-md-none" onClick={closeMobile}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div style={{ padding: collapsed ? "0.5rem 0" : "0.5rem 1rem 0.75rem", borderBottom: "1px solid rgba(245,158,11,0.15)", transition: "padding 0.3s" }}>
          {!collapsed && (
            <div style={{ fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.1em", color: accentColor, fontWeight: 700 }}>
              Marketing Portal
            </div>
          )}
        </div>

        <nav className="mc-nav">
          {navItems.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.path}
              className={({ isActive }) => `mc-nav-item${isActive ? " active" : ""}`}
              title={collapsed ? item.label : ""}
              onClick={closeMobile}
              style={({ isActive }) => isActive ? { background: accentColor, color: "#1a1a1a" } : {}}
            >
              <i className={`fas ${item.icon} mc-nav-icon`}></i>
              <span className="mc-nav-label">{item.label}</span>
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

      <main className="mc-main">
        <div className="mc-topbar">
          <button className="mc-hamburger d-md-none" onClick={() => setMobileOpen(true)}>
            <i className="fas fa-bars"></i>
          </button>

          <div className="mc-topbar-title">
            {activeItem ? (
              <>
                <i className={`fas ${activeItem.icon} mc-topbar-page-icon`} style={{ color: accentColor }}></i>
                <span className="mc-topbar-page-name">{activeItem.label}</span>
              </>
            ) : <span className="mc-topbar-page-name">Dashboard</span>}
          </div>

          <div className="mc-topbar-actions">
            <div className="mc-topbar-profile">
              <div
                className="mc-topbar-avatar"
                style={{ width: 32, height: 32, fontSize: "0.78rem", background: accentColor, color: "#1a1a1a", overflow: "hidden" }}
                title={displayName}
              >
                {storedUser?.profilePicture
                  ? <img src={storedUser.profilePicture} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : avatarLetter}
              </div>
              <div className="mc-topbar-profile-info d-none d-sm-flex" style={{ flexDirection: "column" }}>
                <span className="mc-topbar-profile-name">{displayName}</span>
                <span className="mc-topbar-profile-status" style={{ color: accentColor }}>Marketing Lead</span>
              </div>
            </div>
            <div className="mc-icon-btn"><ThemeToggle /></div>
            <NotificationBell />
          </div>
        </div>

        <div className="mc-page">{children}</div>
      </main>

      <nav className={`mc-bottom-nav${mobileOpen ? " mc-bottom-nav-hidden" : ""}`}>
        <div className="mc-bottom-nav-inner">
          {[
            { path: "/marketing/dashboard", icon: "fa-chart-line", label: "Home"      },
            { path: "/marketing/campaigns", icon: "fa-bullseye",   label: "Campaigns" },
            { path: "/marketing/analytics", icon: "fa-chart-bar",  label: "Analytics" },
            { path: "/marketing/revenue",   icon: "fa-dollar-sign",label: "Revenue"   },
            { path: "/marketing/content",   icon: "fa-paint-brush",label: "Content"   },
          ].map((item, idx) => (
            <NavLink
              key={idx}
              to={item.path}
              className={({ isActive }) => `mc-bottom-nav-link${isActive ? " active" : ""}`}
            >
              <i className={`fas ${item.icon}`}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default MarketingLayout;
