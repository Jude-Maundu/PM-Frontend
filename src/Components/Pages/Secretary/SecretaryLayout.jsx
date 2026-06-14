import React, { useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import ThemeToggle from "../../ThemeToggle";
import NotificationBell from "../../NotificationBell";
import { getStoredUser, getDisplayName } from "../../../utils/auth";

const SecretaryLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("mc-sidebar-collapsed") === "true"
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const location    = useLocation();
  const storedUser  = getStoredUser();
  const displayName = getDisplayName(storedUser) || "Secretary";
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
    { path: "/secretary/dashboard",     icon: "fa-th-large",         label: "Dashboard"       },
    { path: "/secretary/tickets",       icon: "fa-headset",          label: "Support Tickets" },
    { path: "/secretary/schedule",      icon: "fa-calendar-alt",     label: "Schedule"        },
    { path: "/secretary/announcements", icon: "fa-bullhorn",         label: "Announcements"   },
    { path: "/secretary/reports",       icon: "fa-file-alt",         label: "Reports"         },
    { path: "/secretary/applications",  icon: "fa-user-clock",       label: "Applications"    },
    { path: "/secretary/communications",icon: "fa-envelope",         label: "Communications"  },
    { path: "/secretary/records",       icon: "fa-folder-open",      label: "Records"         },
    { path: "/secretary/tasks",         icon: "fa-tasks",            label: "Task Manager"    },
    { path: "/secretary/notifications", icon: "fa-bell",             label: "Notifications"   },
    { path: "/secretary/profile",       icon: "fa-user",             label: "My Profile"      },
  ];

  if (location.pathname === "/login") return <>{children}</>;

  const activeItem = navItems.find(n =>
    location.pathname === n.path || location.pathname.startsWith(n.path + "/")
  );

  const accentColor = "#8B5CF6";

  return (
    <div className={`mc-shell${collapsed ? " mc-collapsed" : ""}`} data-role="secretary">
      {mobileOpen && <div className="mc-mobile-backdrop" onClick={closeMobile} />}

      <aside
        className={`mc-sidebar${mobileOpen ? " mc-sidebar-open" : ""}`}
        style={{ "--mc-accent": accentColor, "--role-accent": accentColor }}
      >
        <div className="mc-sidebar-brand">
          <Link to="/secretary/dashboard" className="mc-brand-logo-wrap" onClick={closeMobile}>
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

        <div style={{ padding: collapsed ? "0.5rem 0" : "0.5rem 1rem 0.75rem", borderBottom: "1px solid rgba(139,92,246,0.15)", transition: "padding 0.3s" }}>
          {!collapsed && (
            <div style={{ fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.1em", color: accentColor, fontWeight: 700 }}>
              Secretary Portal
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
                {storedUser?.profilePicture
                  ? <img src={storedUser.profilePicture} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : avatarLetter}
              </div>
              <div className="mc-topbar-profile-info d-none d-sm-flex" style={{ flexDirection: "column" }}>
                <span className="mc-topbar-profile-name">{displayName}</span>
                <span className="mc-topbar-profile-status" style={{ color: accentColor }}>Secretary</span>
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
            { path: "/secretary/dashboard", icon: "fa-th-large",     label: "Home"    },
            { path: "/secretary/tickets",   icon: "fa-headset",      label: "Tickets" },
            { path: "/secretary/schedule",  icon: "fa-calendar-alt", label: "Schedule"},
            { path: "/secretary/tasks",     icon: "fa-tasks",        label: "Tasks"   },
            { path: "/secretary/profile",   icon: "fa-user",         label: "Profile" },
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

export default SecretaryLayout;
