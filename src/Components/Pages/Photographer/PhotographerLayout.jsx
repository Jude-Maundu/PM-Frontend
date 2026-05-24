import React, { useState } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import ThemeToggle from "../../ThemeToggle";
import NotificationBell from "../../NotificationBell";
import { getStoredUser, getDisplayName } from "../../../utils/auth";

const PhotographerLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("mc-sidebar-collapsed") === "true"
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate  = useNavigate();
  const location  = useLocation();
  const storedUser   = getStoredUser();
  const displayName  = getDisplayName(storedUser) || "Photographer";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  const toggleSidebar = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem("mc-sidebar-collapsed", next);
      return next;
    });
  };

  const closeMobile = () => setMobileOpen(false);

  const navItems = [
    { path: "/photographer/dashboard",   icon: "fa-chart-pie",        label: "Dashboard"      },
    { path: "/photographer/analytics",   icon: "fa-chart-line",       label: "Analytics"      },
    { path: "/photographer/media",       icon: "fa-photo-video",      label: "My Media"       },
    { path: "/photographer/upload",      icon: "fa-cloud-upload-alt", label: "Upload"         },
    { path: "/photographer/earnings",    icon: "fa-dollar-sign",      label: "Earnings"       },
    { path: "/photographer/sales",       icon: "fa-history",          label: "Sales History"  },
    { path: "/photographer/follow",      icon: "fa-user-friends",     label: "Followers"      },
    { path: "/messages",                 icon: "fa-comments",         label: "Messages"       },
    { path: "/photographer/withdrawals", icon: "fa-money-bill-wave",  label: "Withdrawals"    },
    { path: "/photographer/profile",     icon: "fa-user",             label: "Profile"        },
    { path: "/photographer/portfolio",   icon: "fa-globe",            label: "My Portfolio"   },
    { path: "/photographer/referral",    icon: "fa-gift",             label: "Referral"       },
    { path: "/photographer/proofing",    icon: "fa-clipboard-check",  label: "Proofing"       },
    { path: "/photographer/settings",    icon: "fa-cog",              label: "Settings"       },
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
          <Link to="/photographer/dashboard" className="mc-brand-logo-wrap" onClick={closeMobile}>
            <img src="/Pasted%20image.png" alt="PM" className="mc-sidebar-logo" />
            <span className="mc-brand-name">PhotoMarket</span>
          </Link>
          {/* Desktop collapse toggle */}
          <button className="mc-toggle-btn d-none d-md-flex" onClick={toggleSidebar} title={collapsed ? "Expand" : "Collapse"}>
            <i className={`fas fa-chevron-${collapsed ? "right" : "left"}`}></i>
          </button>
          {/* Mobile close button */}
          <button className="mc-toggle-btn d-md-none" onClick={closeMobile}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <nav className="mc-nav">
          {navItems.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.path}
              className={({ isActive }) => `mc-nav-item${isActive ? " active" : ""}`}
              title={collapsed ? item.label : ""}
              onClick={closeMobile}
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

      {/* ── Main ── */}
      <main className="mc-main">
        {/* Topbar */}
        <div className="mc-topbar">
          {/* Hamburger — mobile only */}
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
            <NavLink to="/photographer/upload" className="mc-topbar-action-btn d-none d-sm-flex">
              <i className="fas fa-plus"></i>Create
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

export default PhotographerLayout;
