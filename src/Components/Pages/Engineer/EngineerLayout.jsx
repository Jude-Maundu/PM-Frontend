import React, { useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import ThemeToggle from "../../ThemeToggle";
import NotificationBell from "../../NotificationBell";
import { getStoredUser, getDisplayName, getProfilePhoto } from "../../../utils/auth";

const EngineerLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("mc-sidebar-collapsed") === "true"
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const location    = useLocation();
  const storedUser  = getStoredUser();
  const displayName = getDisplayName(storedUser) || "Engineer";
  const profilePhoto = getProfilePhoto(storedUser);
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
    { path: "/engineer/dashboard",   icon: "fa-server",          label: "Dashboard"       },
    { path: "/engineer/status",      icon: "fa-heartbeat",       label: "System Status"   },
    { path: "/engineer/logs",        icon: "fa-terminal",        label: "API Logs"        },
    { path: "/engineer/errors",      icon: "fa-bug",             label: "Error Reports"   },
    { path: "/engineer/database",    icon: "fa-database",        label: "Database"        },
    { path: "/engineer/backups",     icon: "fa-cloud-upload-alt",label: "Backups"         },
    { path: "/engineer/deployments", icon: "fa-rocket",          label: "Deployments"     },
    { path: "/engineer/security",    icon: "fa-shield-alt",      label: "Security"        },
    { path: "/engineer/performance", icon: "fa-tachometer-alt",  label: "Performance"     },
    { path: "/engineer/cdn",         icon: "fa-globe",           label: "CDN & Assets"    },
    { path: "/engineer/profile",     icon: "fa-user-cog",        label: "My Profile"      },
  ];

  if (location.pathname === "/login") return <>{children}</>;

  const activeItem = navItems.find(n =>
    location.pathname === n.path || location.pathname.startsWith(n.path + "/")
  );

  const accentColor = "#06B6D4";

  return (
    <div className={`mc-shell${collapsed ? " mc-collapsed" : ""}`} data-role="engineer">
      {mobileOpen && <div className="mc-mobile-backdrop" onClick={closeMobile} />}

      <aside className={`mc-sidebar${mobileOpen ? " mc-sidebar-open" : ""}`}>
        <div className="mc-sidebar-brand">
          <Link to="/engineer/dashboard" className="mc-brand-logo-wrap" onClick={closeMobile}>
            <img src="/rs-logo.png" alt="RS" className="mc-sidebar-logo" />
            <span className="mc-brand-name">Relic Snap</span>
          </Link>
          <button className="mc-toggle-btn d-none d-md-flex" onClick={toggleSidebar}>
            <i className={`fas fa-chevron-${collapsed ? "right" : "left"}`}></i>
          </button>
          <button className="mc-toggle-btn d-md-none" onClick={closeMobile}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div style={{ padding: collapsed ? "0.5rem 0" : "0.5rem 1rem 0.75rem", borderBottom: "1px solid rgba(6,182,212,0.15)", transition: "padding 0.3s" }}>
          {!collapsed && (
            <div style={{ fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.1em", color: accentColor, fontWeight: 700 }}>
              Engineering Portal
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
              style={({ isActive }) => isActive ? { background: accentColor } : {}}
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
                style={{ width: 32, height: 32, fontSize: "0.78rem", background: accentColor, overflow: "hidden" }}
                title={displayName}
              >
                {profilePhoto
                  ? <img src={profilePhoto} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : avatarLetter}
              </div>
              <div className="mc-topbar-profile-info d-none d-sm-flex" style={{ flexDirection: "column" }}>
                <span className="mc-topbar-profile-name">{displayName}</span>
                <span className="mc-topbar-profile-status" style={{ color: accentColor }}>Engineer</span>
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
            { path: "/engineer/dashboard",   icon: "fa-server",         label: "Home"     },
            { path: "/engineer/status",      icon: "fa-heartbeat",      label: "Status"   },
            { path: "/engineer/logs",        icon: "fa-terminal",       label: "Logs"     },
            { path: "/engineer/errors",      icon: "fa-bug",            label: "Errors"   },
            { path: "/engineer/performance", icon: "fa-tachometer-alt", label: "Perf"     },
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

export default EngineerLayout;
