import React, { useState, useEffect } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import NotificationDropdown from "../../NotificationDropdown";

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState({ name: "Admin" });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Load user data
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        setUser(JSON.parse(userStr));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const navItems = [
    { path: "/admin/dashboard", icon: "fa-tachometer-alt", label: "Dashboard", mobileLabel: "Home" },
    { path: "/admin/users", icon: "fa-users", label: "Users Management", mobileLabel: "Users" },
    { path: "/admin/photographers", icon: "fa-camera", label: "Photographers", mobileLabel: "Photogs" },
    { path: "/admin/media", icon: "fa-photo-video", label: "Media Management", mobileLabel: "Media" },
    { path: "/admin/transactions", icon: "fa-exchange-alt", label: "Transactions", mobileLabel: "History" },
    { path: "/admin/reports", icon: "fa-chart-bar", label: "Reports", mobileLabel: "Reports" },
    { path: "/admin/settings", icon: "fa-cog", label: "Settings", mobileLabel: "Settings" },
  ];

  // Don't render layout on login page
  if (location.pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="dash-shell">
      {/* Content */}
      <div className="position-relative app-content-wrapper">
        {/* Navbar */}
        <nav className="navbar navbar-dark px-3 px-md-4 py-2 py-md-3 sticky-top w-100 glass-navbar"
             style={{ zIndex: 1030 }}>
          <div className="container-fluid px-0">
            <div className="d-flex align-items-center gap-2 gap-md-3">
              {/* Hamburger menu - only visible on mobile */}
              <button
                className="btn btn-link text-warning d-md-none p-0"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{ fontSize: "1.25rem" }}
              >
                <i className={`fas ${sidebarOpen ? "fa-times" : "fa-bars"}`}></i>
              </button>
              <Link to="/admin/dashboard" className="d-flex align-items-center text-decoration-none">
                <img
                  src="/Pasted%20image.png"
                  alt="PhotoMarket Logo"
                  style={{
                    width: "36px",
                    height: "36px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid rgba(107, 189, 208, 0.8)",
                    marginRight: "0.5rem",
                  }}
                />
                <span className="fw-bold" style={{ fontSize: "clamp(1rem, 5vw, 1.5rem)" }}>
                  <span className="text-white d-none d-sm-inline">Admin</span>
                  <span className="text-warning d-none d-sm-inline">Panel</span>
                  <span className="text-white d-inline d-sm-none">AP</span>
                </span>
              </Link>
              <span className="badge-teal d-none d-md-inline">Admin</span>
            </div>

            <div className="d-flex align-items-center gap-2 gap-md-3">
              {/* Notifications - NOW VISIBLE ON ALL SCREENS */}
              <div className="notification-wrapper">
                <NotificationDropdown userRole="admin" />
              </div>

              {/* Admin Badge - Hidden on very small screens, visible on tablet+ */}
              <div className="d-none d-md-block">
                <span className="badge-teal p-2">
                  <i className="fas fa-shield-alt me-2"></i>
                  Full Access
                </span>
              </div>

              {/* User Menu */}
              <div className="dropdown">
                <button
                  className="btn btn-link text-white text-decoration-none dropdown-toggle p-0 d-flex align-items-center"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ fontSize: "clamp(0.875rem, 3vw, 1rem)" }}
                >
                  <i className="fas fa-user-shield" style={{ fontSize: "clamp(1.25rem, 5vw, 1.5rem)" }}></i>
                  <span className="d-none d-md-inline ms-1 ms-md-2">
                    {user?.name?.split(' ')[0] || "Admin"}
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end" style={{ background: "rgba(15,30,40,0.96)", backdropFilter: "blur(20px)", border: "1px solid rgba(107,189,208,0.2)", borderRadius: "var(--radius-lg)" }}>
                  <li><Link className="dropdown-item text-white" to="/admin/profile"><i className="fas fa-user me-2" style={{color:"var(--pm-teal)"}}></i>Profile</Link></li>
                  <li><Link className="dropdown-item text-white" to="/admin/settings"><i className="fas fa-cog me-2" style={{color:"var(--pm-teal)"}}></i>Settings</Link></li>
                  <li><hr className="dropdown-divider" style={{borderColor:"rgba(107,189,208,0.2)"}} /></li>
                  <li><button className="dropdown-item text-danger" onClick={handleLogout}><i className="fas fa-sign-out-alt me-2"></i>Logout</button></li>
                </ul>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Admin Banner */}
        {isMobile && (
          <div className="d-md-none px-3 py-2 sticky-top" style={{
            background: "rgba(10,20,28,0.9)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(107,189,208,0.12)",
            marginTop: "-1px", zIndex: 1020
          }}>
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-white-50 small">
                <i className="fas fa-shield-alt me-1 text-warning"></i>Admin Access
              </span>
              <span className="text-warning fw-bold small">
                Full Control
              </span>
            </div>
          </div>
        )}

        {/* Main Layout Container */}
        <div className="d-flex" style={{ minHeight: "calc(100vh - 70px)" }}>
          {/* Sidebar */}
          <div
            className={`
              ${isMobile ? 'position-fixed top-0 start-0 h-100' : 'position-relative d-block'}
              ${isMobile && !sidebarOpen ? 'd-none' : 'd-block'}
            `}
            style={{
              width: "280px",
              background: "linear-gradient(180deg, rgba(15,30,40,0.96) 0%, rgba(10,20,28,0.98) 100%)",
              backdropFilter: "blur(20px)",
              borderRight: "1px solid rgba(107,189,208,0.15)",
              overflowY: "auto",
              zIndex: 1050,
              transition: "transform 0.3s ease-in-out",
              transform: isMobile && sidebarOpen ? "translateX(0)" : isMobile ? "translateX(-100%)" : "translateX(0)",
            }}
          >
            {/* Mobile Sidebar Header */}
            {isMobile && (
              <div className="d-flex d-md-none justify-content-between align-items-center p-3 border-bottom border-secondary">
                <div>
                  <span className="fw-bold text-white">
                    <i className="fas fa-crown text-warning me-2"></i>
                    Admin Panel
                  </span>
                  <div className="small text-white-50 mt-1">
                    <i className="fas fa-user-shield me-1"></i>
                    {user?.name || "Admin"}
                  </div>
                </div>
                <button
                  className="btn btn-link text-warning p-0"
                  onClick={() => setSidebarOpen(false)}
                >
                  <i className="fas fa-times fa-lg"></i>
                </button>
              </div>
            )}

            <div className="p-3 p-md-4 sidebar-header">
              <h6 style={{ color: "rgba(107,189,208,0.7)", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 0 }}>
                <i className="fas fa-cog me-2"></i>Admin Menu
              </h6>
            </div>

            <ul className="nav flex-column p-2 p-md-3">
              {navItems.map((item, idx) => (
                <li className="nav-item mb-1" key={idx}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `sidebar-link d-flex align-items-center justify-content-between ${isActive ? "active" : ""}`}
                    onClick={() => isMobile && setSidebarOpen(false)}
                  >
                    <span className="d-flex align-items-center">
                      <i className={`fas ${item.icon} me-2 me-md-3 nav-icon`}></i>
                      <span className="d-none d-md-inline">{item.label}</span>
                      <span className="d-inline d-md-none">{item.mobileLabel}</span>
                    </span>
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Admin Info in Sidebar for mobile */}
            {isMobile && sidebarOpen && (
              <div className="p-3 mt-auto" style={{ borderTop: "1px solid rgba(107,189,208,0.15)" }}>
                <div className="glass-stat p-3 text-center">
                  <i className="fas fa-shield-alt me-1" style={{ color: "var(--pm-teal)" }}></i>
                  <small style={{ color: "rgba(255,255,255,0.5)" }}>Administrator Access</small>
                </div>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div
            className="flex-grow-1"
            style={{
              transition: "margin-left 0.3s ease-in-out",
              width: isMobile ? "100%" : "calc(100% - 280px)",
            }}
          >
            <div className="p-3 p-md-4">
              {children}
            </div>
          </div>
        </div>

        {/* Mobile Backdrop */}
        {isMobile && sidebarOpen && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{
              background: "rgba(0, 0, 0, 0.5)",
              zIndex: 1040,
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
      </div>

      {/* Mobile Bottom Navigation Bar */}
      {isMobile && !sidebarOpen && (
        <div className="d-md-none position-fixed bottom-0 start-0 w-100"
             style={{
               background: "rgba(0, 0, 0, 0.95)",
               backdropFilter: "blur(10px)",
               borderTop: "1px solid rgba(255, 255, 255, 0.1)",
               zIndex: 1030,
               paddingBottom: "env(safe-area-inset-bottom)",
             }}>
          <div className="d-flex justify-content-around align-items-center py-2">
            {navItems.slice(0, 5).map((item, idx) => (
              <NavLink
                key={idx}
                to={item.path}
                className={({ isActive }) => 
                  `d-flex flex-column align-items-center text-decoration-none py-1 px-2 rounded ${
                    isActive ? 'text-warning' : 'text-white-50'
                  }`
                }
                style={({ isActive }) => ({
                  color: isActive ? "#6BBDD0" : "rgba(255,255,255,0.7)",
                  fontSize: "0.7rem",
                  transition: "all 0.2s ease",
                })}
              >
                <i className={`fas ${item.icon} mb-1`} style={{ fontSize: "1.1rem" }}></i>
                <span className="small">{item.mobileLabel}</span>
              </NavLink>
            ))}
            <NavLink
              to="/admin/profile"
              className={({ isActive }) => 
                `d-flex flex-column align-items-center text-decoration-none py-1 px-2 rounded ${
                  isActive ? 'text-warning' : 'text-white-50'
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? "#6BBDD0" : "rgba(255,255,255,0.7)",
                fontSize: "0.7rem",
              })}
            >
              <i className="fas fa-user-shield mb-1" style={{ fontSize: "1.1rem" }}></i>
              <span className="small">Admin</span>
            </NavLink>
          </div>
        </div>
      )}

      {/* Add padding bottom on mobile for bottom nav */}
      {isMobile && !sidebarOpen && (
        <div style={{ paddingBottom: "70px" }}></div>
      )}

      <style>{`
        .notification-wrapper {
          display: block;
        }
        
        /* Ensure notification dropdown is properly positioned on mobile */
        @media (max-width: 768px) {
          .notification-wrapper {
            margin-right: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;