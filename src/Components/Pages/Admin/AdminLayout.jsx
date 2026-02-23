import React, { useState } from "react";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-vh-100 bg-dark text-white">
      {/* Background Image */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2070&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: "0.1",
          zIndex: 0,
        }}
      ></div>

      {/* Content */}
      <div className="position-relative" style={{ zIndex: 1 }}>
        <AdminNavbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="container-fluid">
          <div className="row">
            {/* Sidebar - hidden on mobile by default */}
            <div className={`col-lg-2 col-md-3 p-0 ${sidebarOpen ? 'd-block' : 'd-none d-md-block'}`}>
              <AdminSidebar />
            </div>

            {/* Main Content */}
            <div className={`col-lg-10 col-md-9 col-12 p-4 ${sidebarOpen ? 'd-none d-md-block' : ''}`}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;