import React, { useState, useEffect } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";

const AdminLayout = ({ children }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("mc-sidebar-collapsed") === "true"
  );

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const toggleSidebar = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem("mc-sidebar-collapsed", next);
      return next;
    });
  };

  const navItems = [
    { path: "/admin/dashboard",    icon: "fa-tachometer-alt", label: "Dashboard",        mobileLabel: "Home" },
    { path: "/admin/users",        icon: "fa-users",          label: "Users",             mobileLabel: "Users" },
    { path: "/admin/photographers",icon: "fa-camera",         label: "Photographers",     mobileLabel: "Photogs" },
    { path: "/admin/media",        icon: "fa-photo-video",    label: "Media",             mobileLabel: "Media" },
    { path: "/admin/analytics",    icon: "fa-chart-bar",      label: "Analytics",         mobileLabel: "Stats" },
    { path: "/admin/moderation",   icon: "fa-shield-alt",     label: "Moderation",        mobileLabel: "Mod" },
    { path: "/admin/transactions", icon: "fa-exchange-alt",   label: "Transactions",      mobileLabel: "History" },
    { path: "/admin/withdrawals",  icon: "fa-money-bill-wave",label: "Withdrawals",       mobileLabel: "Payouts" },
    { path: "/admin/shares",       icon: "fa-share-alt",      label: "Share Links",       mobileLabel: "Shares" },
    { path: "/admin/wallets",      icon: "fa-wallet",         label: "Wallets",           mobileLabel: "Wallets" },
    { path: "/admin/albums",       icon: "fa-images",         label: "Albums",            mobileLabel: "Albums" },
    { path: "/admin/portfolios",   icon: "fa-globe",          label: "Portfolios",        mobileLabel: "Portf." },
    { path: "/admin/profile",      icon: "fa-user-shield",    label: "Admin Profile",     mobileLabel: "Profile" },
    { path: "/admin/settings",     icon: "fa-cog",            label: "Settings",          mobileLabel: "Settings" },
  ];

  if (location.pathname === "/login") return <>{children}</>;

  return (
    <div className={`mc-shell${collapsed ? " mc-collapsed" : ""}`}>
      {/* Desktop sidebar */}
      <aside className="mc-sidebar d-none d-md-flex">
        {/* Brand header */}
        <div className="mc-sidebar-brand">
          <Link to="/admin/dashboard" className="mc-brand-logo-wrap">
            <img src="/Pasted%20image.png" alt="PM" className="mc-sidebar-logo" />
            <span className="mc-brand-name">Admin Panel</span>
          </Link>
          <button className="mc-toggle-btn" onClick={toggleSidebar} title={collapsed ? "Expand" : "Collapse"}>
            <i className={`fas fa-chevron-${collapsed ? "right" : "left"}`}></i>
          </button>
        </div>

        {/* Navigation */}
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

        {/* Footer */}
        <div className="mc-sidebar-footer">
          <button className="mc-logout-btn" onClick={handleLogout} title={collapsed ? "Logout" : ""}>
            <i className="fas fa-sign-out-alt mc-nav-icon"></i>
            <span className="mc-logout-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="mc-main">
        {children}
        <div className="d-md-none" style={{ height: "72px" }}></div>
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="d-md-none position-fixed bottom-0 start-0 w-100" style={{
          background: "var(--mc-sidebar-bg)",
          borderTop: "1px solid var(--mc-border)",
          zIndex: 1030,
          paddingBottom: "env(safe-area-inset-bottom)",
        }}>
          <div className="d-flex justify-content-around align-items-center py-2">
            {navItems.slice(0, 5).map((item, idx) => (
              <NavLink key={idx} to={item.path}
                style={({ isActive }) => ({
                  color: isActive ? "var(--mc-accent)" : "var(--mc-sidebar-icon)",
                  fontSize: "0.65rem",
                })}
                className="d-flex flex-column align-items-center text-decoration-none py-1 px-2 rounded"
              >
                {({ isActive }) => (
                  <>
                    <i className={`fas ${item.icon} mb-1`} style={{ fontSize: "1.05rem" }}></i>
                    <span>{item.mobileLabel}</span>
                  </>
                )}
              </NavLink>
            ))}
            <NavLink to="/admin/profile"
              style={({ isActive }) => ({ color: isActive ? "var(--mc-accent)" : "var(--mc-sidebar-icon)", fontSize: "0.65rem" })}
              className="d-flex flex-column align-items-center text-decoration-none py-1 px-2 rounded"
            >
              <i className="fas fa-user-shield mb-1" style={{ fontSize: "1.05rem" }}></i>
              <span>Admin</span>
            </NavLink>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
