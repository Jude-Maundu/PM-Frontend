import React, { useState } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import ThemeToggle from "../../ThemeToggle";
import NotificationBell from "../../NotificationBell";
import { getStoredUser, getDisplayName } from "../../../utils/auth";

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("mc-sidebar-collapsed") === "true"
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate    = useNavigate();
  const location    = useLocation();
  const storedUser   = getStoredUser();
  const displayName  = getDisplayName(storedUser) || "Admin";
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
    { path: "/admin/dashboard",     icon: "fa-tachometer-alt",  label: "Dashboard"     },
    { path: "/admin/users",         icon: "fa-users",           label: "Users"         },
    { path: "/admin/photographers", icon: "fa-camera",          label: "Photographers" },
    { path: "/admin/applications",  icon: "fa-user-clock",      label: "Applications"  },
    { path: "/admin/staff",         icon: "fa-user-tie",        label: "Staff"         },
    { path: "/admin/media",         icon: "fa-photo-video",     label: "Media"         },
    { path: "/admin/analytics",     icon: "fa-chart-bar",       label: "Analytics"     },
    { path: "/admin/moderation",    icon: "fa-shield-alt",      label: "Moderation"    },
    { path: "/admin/transactions",  icon: "fa-exchange-alt",    label: "Transactions"  },
    { path: "/admin/withdrawals",   icon: "fa-money-bill-wave", label: "Withdrawals"   },
    { path: "/admin/wallets",       icon: "fa-wallet",          label: "Wallets"       },
    { path: "/admin/albums",        icon: "fa-images",          label: "Albums"        },
    { path: "/admin/portfolios",    icon: "fa-globe",           label: "Portfolios"    },
    { path: "/admin/logs",          icon: "fa-clipboard-list",  label: "Audit Logs"    },
    { path: "/admin/config",        icon: "fa-sliders-h",       label: "Config"        },
    { path: "/admin/profile",       icon: "fa-user-shield",     label: "Admin Profile" },
    { path: "/admin/settings",      icon: "fa-cog",             label: "Settings"      },
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
          <Link to="/admin/dashboard" className="mc-brand-logo-wrap" onClick={closeMobile}>
            <img src="/Pasted%20image.png" alt="PM" className="mc-sidebar-logo" />
            <span className="mc-brand-name">Admin Panel</span>
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
                <span className="mc-topbar-profile-status">Admin</span>
              </div>
            </div>
            <div className="mc-icon-btn"><ThemeToggle /></div>
            <NotificationBell />
            <NavLink to="/admin/settings" className="mc-topbar-action-btn d-none d-sm-flex">
              <i className="fas fa-plus"></i>Manage
            </NavLink>
          </div>
        </div>

        {/* Page content */}
        <div className="mc-page">
          {children}
        </div>
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className={`mc-bottom-nav${mobileOpen ? " mc-bottom-nav-hidden" : ""}`}>
        <div className="mc-bottom-nav-inner">
          {[
            { path: "/admin/dashboard",    icon: "fa-tachometer-alt", label: "Home"       },
            { path: "/admin/users",        icon: "fa-users",          label: "Users"      },
            { path: "/admin/media",        icon: "fa-photo-video",    label: "Media"      },
            { path: "/admin/analytics",    icon: "fa-chart-bar",      label: "Analytics"  },
            { path: "/admin/settings",     icon: "fa-cog",            label: "Settings"   },
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

export default AdminLayout;
