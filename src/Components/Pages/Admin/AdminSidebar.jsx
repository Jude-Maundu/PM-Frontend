import React from "react";
import { NavLink, useLocation } from "react-router-dom";

const AdminSidebar = ({ isOpen, onToggle, onNav }) => {
  const location = useLocation();

  const glassStyle = {
    background: "linear-gradient(180deg, rgba(15,30,40,0.96) 0%, rgba(10,20,28,0.98) 100%)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRight: "1px solid rgba(107,189,208,0.15)",
  };

  const menuItems = [
    {
      path: "/admin/dashboard",
      icon: "fa-chart-pie",
      label: "Dashboard",
      badge: null,
    },
    {
      path: "/admin/media",
      icon: "fa-photo-video",
      label: "Media",
      badge: "24",
    },
    {
      path: "/admin/users",
      icon: "fa-users",
      label: "Users",
      badge: "12",
    },
    {
      path: "/admin/analytics",
      icon: "fa-chart-bar",
      label: "Analytics",
      badge: null,
    },
    {
      path: "/admin/moderation",
      icon: "fa-shield-alt",
      label: "Moderation",
      badge: null,
    },
    {
      path: "/admin/shares",
      icon: "fa-link",
      label: "Shares",
      badge: null,
    },
    {
      path: "/admin/withdrawals",
      icon: "fa-money-check-alt",
      label: "Withdrawals",
      badge: null,
    },
    {
      path: "/admin/albums",
      icon: "fa-folder-open",
      label: "Albums",
      badge: null,
    },
    {
      path: "/admin/portfolios",
      icon: "fa-globe",
      label: "Portfolios",
      badge: null,
    },
    {
      path: "/admin/wallets",
      icon: "fa-wallet",
      label: "Wallets",
      badge: null,
    },
    {
      path: "/admin/receipts",
      icon: "fa-receipt",
      label: "Receipts",
      badge: "8",
    },
    {
      path: "/admin/refunds",
      icon: "fa-undo",
      label: "Refunds",
      badge: "3",
    },
    {
      path: "/admin/audit",
      icon: "fa-search-dollar",
      label: "Purchase Audit",
      badge: null,
    },
    {
      path: "/admin/settings",
      icon: "fa-cog",
      label: "Settings",
      badge: null,
    },
    {
      path: "/admin/profile",
      icon: "fa-user-circle",
      label: "My Profile",
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="btn position-fixed d-md-none"
        style={{
          bottom: "20px", right: "20px", zIndex: 1050,
          borderRadius: "50%", width: "50px", height: "50px",
          background: "var(--pm-teal)", color: "#fff", border: "none",
          boxShadow: "0 4px 20px rgba(107,189,208,0.4)",
        }}
        onClick={onToggle}
      >
        <i className={`fas ${isOpen ? "fa-times" : "fa-bars"}`}></i>
      </button>

      {/* Sidebar - Wider */}
      <div
        className={`
          ${isOpen ? "d-block" : "d-none d-md-block"}
          position-fixed position-md-static
          top-0 start-0
          h-100
          col-10 col-md-3 col-lg-2
          p-0
          overflow-auto
        `}
        style={{
          ...glassStyle,
          zIndex: 1040,
          width: isOpen ? "320px" : "auto",
        }}
      >
        {/* Header with Logo */}
        <div className="p-4" style={{ borderBottom: "1px solid rgba(107,189,208,0.15)" }}>
          <div className="d-flex align-items-center gap-3 mb-3">
            <div className="d-flex align-items-center justify-content-center"
              style={{ background: "rgba(107,189,208,0.15)", borderRadius: "12px", padding: "10px", border: "1px solid rgba(107,189,208,0.3)" }}>
              <i className="fas fa-camera fa-lg" style={{ color: "var(--pm-teal)" }}></i>
            </div>
            <div>
              <span className="fw-bold fs-5 text-white" style={{ fontFamily: "var(--font-serif)" }}>Photo</span>
              <span className="fw-bold fs-5" style={{ color: "var(--pm-teal)", fontFamily: "var(--font-serif)" }}>Market</span>
              <div style={{ fontSize: "0.65rem", color: "rgba(107,189,208,0.6)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "2px" }}>Admin Panel</div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <ul className="nav flex-column px-3 mt-3">
          {menuItems.map((item) => (
            <li className="nav-item mb-2" key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `sidebar-link d-flex align-items-center justify-content-between ${isActive ? "active" : ""}`}
                onClick={() => { if (onNav) onNav(); }}
              >
                <span className="d-flex align-items-center">
                  <i className={`fas ${item.icon} me-3 nav-icon`}
                    style={{ color: location.pathname === item.path ? "var(--pm-teal)" : "inherit" }}
                  ></i>
                  <span style={{ fontSize: "0.9rem" }}>{item.label}</span>
                </span>
                {item.badge && (
                  <span className="badge-teal" style={{ fontSize: "0.68rem", padding: "0.15rem 0.5rem" }}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Storage Info */}
        <div className="px-3 mt-4">
          <div className="glass-stat p-3 rounded-3 text-center">
            <i className="fas fa-cloud-upload-alt fa-lg mb-2" style={{ color: "var(--pm-teal)" }}></i>
            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#fff", marginBottom: "0.5rem" }}>Storage Usage</div>
            <div className="progress" style={{ height: "5px", background: "rgba(255,255,255,0.08)", borderRadius: "3px" }}>
              <div className="progress-bar" style={{ width: "65%", background: "linear-gradient(90deg,var(--pm-teal),var(--pm-teal-light))", borderRadius: "3px" }}></div>
            </div>
            <div className="d-flex justify-content-between mt-2">
              <small style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.65rem" }}>45.2 GB used</small>
              <small style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.65rem" }}>78.3 GB total</small>
            </div>
          </div>
        </div>

        {/* System status */}
        <div className="px-3 mt-3 mb-4">
          <div className="p-3 rounded-3" style={{ background: "rgba(107,189,208,0.05)", border: "1px solid rgba(107,189,208,0.12)" }}>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <small style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.65rem" }}>
                <i className="fas fa-circle me-1" style={{ color: "var(--pm-success)", fontSize: "0.45rem" }}></i>
                System Status
              </small>
              <span style={{ background: "rgba(46,204,154,0.15)", color: "var(--pm-success)", fontSize: "0.65rem", padding: "0.1rem 0.45rem", borderRadius: "999px", border: "1px solid rgba(46,204,154,0.3)" }}>Online</span>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <small style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.65rem" }}>Version</small>
              <small style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.65rem" }}>2.1.4</small>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 mt-auto" style={{ borderTop: "1px solid rgba(107,189,208,0.12)" }}>
          <small style={{ color: "rgba(255,255,255,0.3)", display: "block", textAlign: "center", fontSize: "0.6rem" }}>
            © {new Date().getFullYear()} PhotoMarket Admin
          </small>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-md-none mobile-backdrop"
          style={{ zIndex: 1035 }}
          onClick={() => { if (onToggle) onToggle(); }}
        ></div>
      )}
    </>
  );
};

export default AdminSidebar;