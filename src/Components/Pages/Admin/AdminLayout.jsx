import React, { useState } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import ThemeToggle from "../../ThemeToggle";
import NotificationBell from "../../NotificationBell";
import { getStoredUser, getDisplayName } from "../../../utils/auth";

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("mc-sidebar-collapsed") === "true"
  );

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

  const navItems = [
    { path: "/admin/dashboard",     icon: "fa-tachometer-alt",  label: "Dashboard"     },
    { path: "/admin/users",         icon: "fa-users",           label: "Users"         },
    { path: "/admin/photographers", icon: "fa-camera",          label: "Photographers" },
    { path: "/admin/media",         icon: "fa-photo-video",     label: "Media"         },
    { path: "/admin/analytics",     icon: "fa-chart-bar",       label: "Analytics"     },
    { path: "/admin/moderation",    icon: "fa-shield-alt",      label: "Moderation"    },
    { path: "/admin/transactions",  icon: "fa-exchange-alt",    label: "Transactions"  },
    { path: "/admin/withdrawals",   icon: "fa-money-bill-wave", label: "Withdrawals"   },
    { path: "/admin/shares",        icon: "fa-share-alt",       label: "Share Links"   },
    { path: "/admin/wallets",       icon: "fa-wallet",          label: "Wallets"       },
    { path: "/admin/albums",        icon: "fa-images",          label: "Albums"        },
    { path: "/admin/portfolios",    icon: "fa-globe",           label: "Portfolios"    },
    { path: "/admin/profile",       icon: "fa-user-shield",     label: "Admin Profile" },
    { path: "/admin/settings",      icon: "fa-cog",             label: "Settings"      },
  ];


  if (location.pathname === "/login") return <>{children}</>;

  return (
    <div className={`mc-shell${collapsed ? " mc-collapsed" : ""}`}>
      {/* ── Sidebar ── */}
      <aside className="mc-sidebar d-none d-md-flex">
        <div className="mc-sidebar-brand">
          <Link to="/admin/dashboard" className="mc-brand-logo-wrap">
            <img src="/Pasted%20image.png" alt="PM" className="mc-sidebar-logo" />
            <span className="mc-brand-name">Admin Panel</span>
          </Link>
          <button className="mc-toggle-btn" onClick={toggleSidebar} title={collapsed ? "Expand" : "Collapse"}>
            <i className={`fas fa-chevron-${collapsed ? "right" : "left"}`}></i>
          </button>
        </div>

        <nav className="mc-nav">
          {navItems.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.path}
              className={({ isActive }) => `mc-nav-item${isActive ? " active" : ""}`}
              title={collapsed ? item.label : ""}
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
        {/* Navbar */}
        <div className="mc-topbar">
          <div className="mc-search-wrap">
            <i className="fas fa-search mc-search-icon"></i>
            <input className="mc-search" placeholder="Search..." readOnly />
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

      </main>
    </div>
  );
};

export default AdminLayout;
