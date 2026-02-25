import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

const PhotographerLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Force Bootstrap to re-initialize when component mounts
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      // Re-initialize dropdowns if Bootstrap is available
      if (typeof window !== 'undefined' && window.bootstrap) {
        // Initialize all dropdowns
        const dropdowns = document.querySelectorAll('[data-bs-toggle="dropdown"]');
        dropdowns.forEach(dropdown => {
          try {
            new window.bootstrap.Dropdown(dropdown);
          } catch (e) {
            console.log("Dropdown init error:", e);
          }
        });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Re-initialize when route changes
  useEffect(() => {
    // This runs every time the component renders (including route changes)
    if (typeof window !== 'undefined' && window.bootstrap) {
      const dropdowns = document.querySelectorAll('[data-bs-toggle="dropdown"]');
      dropdowns.forEach(dropdown => {
        try {
          new window.bootstrap.Dropdown(dropdown);
        } catch (e) {
          // Ignore if already initialized
        }
      });
    }
  });

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-vh-100 bg-dark text-white">
      {/* Background Image */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2070&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: "0.1",
          zIndex: 0,
        }}
      ></div>

      {/* Content */}
      <div className="position-relative" style={{ zIndex: 1 }}>
        {/* Navbar */}
        <nav
          className="navbar navbar-dark px-4 py-3 sticky-top w-100"
          style={{
            background: "transparent",
            backdropFilter: "none",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div className="container-fluid px-0">
            <div className="d-flex align-items-center">
              <button
                className="btn btn-link text-warning d-md-none p-0 me-3"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <i className="fas fa-bars fa-xl"></i>
              </button>
              <Link
                to="/photographer/dashboard"
                className="text-decoration-none"
              >
                <span className="fw-bold fs-4">
                  <i className="fas fa-camera text-warning me-2"></i>
                  <span className="text-white">Photo</span>
                  <span className="text-warning">Market</span>
                  <span className="badge bg-warning text-dark ms-3 d-none d-md-inline">
                    Photographer
                  </span>
                </span>
              </Link>
            </div>

            <div className="d-flex align-items-center gap-3">
              <div className="dropdown">
                <button
                  className="btn btn-link text-white text-decoration-none dropdown-toggle p-0"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  id="userDropdown"
                >
                  <i className="fas fa-user-circle me-1"></i>
                  <span className="d-none d-md-inline">
                    {JSON.parse(localStorage.getItem("user") || "{}")?.name ||
                      JSON.parse(localStorage.getItem("user") || "{}")?.username ||
                      "Photographer"}
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end bg-dark border-secondary" aria-labelledby="userDropdown">
                  <li>
                    <Link
                      className="dropdown-item text-white"
                      to="/photographer/profile"
                    >
                      <i className="fas fa-user me-2 text-warning"></i>Profile
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item text-white"
                      to="/photographer/settings"
                    >
                      <i className="fas fa-cog me-2 text-warning"></i>Settings
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider bg-secondary" />
                  </li>
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={handleLogout}
                    >
                      <i className="fas fa-sign-out-alt me-2"></i>Logout
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </nav>

        <div className="container-fluid">
          <div className="row">
            {/* Sidebar */}
            <div
              className={`col-md-2 p-0 ${sidebarOpen ? "d-block" : "d-none d-md-block"}`}
              style={{
                background: "rgba(0, 0, 0, 0.7)",
                backdropFilter: "blur(10px)",
                borderRight: "1px solid rgba(255, 255, 255, 0.1)",
                minHeight: "calc(100vh - 70px)",
              }}
            >
              <div className="p-4 border-bottom border-secondary border-opacity-25">
                <h6 className="text-white-50 small mb-0">
                  <i className="fas fa-camera me-2"></i>
                  PHOTOGRAPHER MENU
                </h6>
              </div>

              <ul className="nav flex-column p-3">
                {[
                  {
                    path: "/photographer/dashboard",
                    icon: "fa-chart-pie",
                    label: "Dashboard",
                  },
                  {
                    path: "/photographer/media",
                    icon: "fa-photo-video",
                    label: "My Media",
                  },
                  {
                    path: "/photographer/upload",
                    icon: "fa-cloud-upload-alt",
                    label: "Upload Media",
                  },
                  {
                    path: "/photographer/earnings",
                    icon: "fa-dollar-sign",
                    label: "Earnings",
                  },
                  {
                    path: "/photographer/sales",
                    icon: "fa-chart-line",
                    label: "Sales History",
                  },
                  {
                    path: "/photographer/withdrawals",
                    icon: "fa-money-bill-wave",
                    label: "Withdrawals",
                  },
                  {
                    path: "/photographer/profile",
                    icon: "fa-user",
                    label: "Profile",
                  },
                ].map((item, idx) => (
                  <li className="nav-item mb-2" key={idx}>
                    <NavLink
                      to={item.path}
                      className="nav-link d-flex align-items-center px-3 py-2 rounded-3"
                      style={({ isActive }) => ({
                        background: isActive
                          ? "rgba(255, 193, 7, 0.15)"
                          : "transparent",
                        border: isActive
                          ? "1px solid rgba(255, 193, 7, 0.3)"
                          : "none",
                        color: isActive ? "#ffc107" : "rgba(255,255,255,0.7)",
                      })}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <i
                        className={`fas ${item.icon} me-3`}
                        style={{ width: "20px" }}
                      ></i>
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>

              <div className="p-3 mt-auto">
                <div
                  className="p-3 rounded-3"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  <small className="text-white-50 d-block text-center">
                    Total Earnings: <span className="text-warning">KES 0</span>
                  </small>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div
              className={`col-md-10 p-4 ${sidebarOpen ? "d-none d-md-block" : ""}`}
            >
              {children}
            </div>
          </div>
        </div>

        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-md-none"
            style={{
              background: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(3px)",
              zIndex: 1035,
            }}
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
      </div>
    </div>
  );
};

export default PhotographerLayout;