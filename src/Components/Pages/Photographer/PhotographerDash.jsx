import React, { useEffect, useState } from "react";
import axios from "axios";
import PhotographerLayout from "./PhotographerLayout";
import { Link } from "react-router-dom";

const API = "https://pm-backend-1-0s8f.onrender.com/api";

const PhotographerDashboard = () => {
  const [stats, setStats] = useState({
    totalMedia: 0,
    totalSales: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    totalViews: 0,
    totalLikes: 0,
  });
  const [recentSales, setRecentSales] = useState([]);
  const [popularMedia, setPopularMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("week");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const photographerId = user?.id;

  const headers = { Authorization: `Bearer ${token}` };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      
      // Fetch photographer's media https://pm-backend-1-0s8f.onrender.com/api/media 
      const mediaRes = await axios.get(`https://pm-backend-1-0s8f.onrender.com/api/media`, { headers });
      const myMedia = (mediaRes.data || []).filter(m => m.userId === photographerId);
      
      // Fetch earnings
      const earningsRes = await axios.get(`${API}/payments/earnings-summary/${photographerId}`, { headers })
        .catch(() => ({ data: { total: 0, pending: 0 } }));
      
      // Fetch sales history
      const salesRes = await axios.get(`${API}/payments/transactions/${photographerId}`, { headers })
        .catch(() => ({ data: [] }));

      // Calculate stats
      const totalViews = myMedia.reduce((sum, m) => sum + (m.views || 0), 0);
      const totalLikes = myMedia.reduce((sum, m) => sum + (m.likes || 0), 0);
      
      // Get recent sales for photographer's media
      const photographerSales = (salesRes.data || []).filter(s => 
        s.items?.some(item => myMedia.some(m => m.id === item.mediaId))
      );

      // Get popular media (most liked)
      const popular = [...myMedia].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 5);

      setStats({
        totalMedia: myMedia.length,
        totalSales: photographerSales.length,
        totalEarnings: earningsRes.data?.total || 0,
        pendingEarnings: earningsRes.data?.pending || 0,
        totalViews,
        totalLikes,
      });

      setRecentSales(photographerSales.slice(0, 5));
      setPopularMedia(popular);

    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const statsCards = [
    {
      title: "Total Media",
      value: stats.totalMedia,
      icon: "fa-photo-video",
      color: "warning",
      link: "/photographer/media",
    },
    {
      title: "Total Sales",
      value: stats.totalSales,
      icon: "fa-shopping-cart",
      color: "success",
      link: "/photographer/sales",
    },
    {
      title: "Total Earnings",
      value: `KES ${stats.totalEarnings.toLocaleString()}`,
      icon: "fa-dollar-sign",
      color: "info",
      link: "/photographer/earnings",
    },
    {
      title: "Pending",
      value: `KES ${stats.pendingEarnings.toLocaleString()}`,
      icon: "fa-clock",
      color: "warning",
      link: "/photographer/withdrawals",
    },
    {
      title: "Total Views",
      value: stats.totalViews,
      icon: "fa-eye",
      color: "primary",
      link: "#",
    },
    {
      title: "Total Likes",
      value: stats.totalLikes,
      icon: "fa-heart",
      color: "danger",
      link: "#",
    },
  ];

  return (
    <PhotographerLayout>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">
            <i className="fas fa-camera me-2 text-warning"></i>
            Photographer Dashboard
          </h4>
          <p className="text-white-50 small mb-0">
            Welcome back, {user?.name || "Photographer"}!
          </p>
        </div>

        {/* Time Range */}
        <div className="btn-group mt-3 mt-md-0">
          {["week", "month", "year"].map((range) => (
            <button
              key={range}
              className={`btn btn-sm ${timeRange === range ? "btn-warning" : "btn-outline-warning"}`}
              onClick={() => setTimeRange(range)}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-warning mb-3"></div>
          <p>Loading dashboard...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* Stats Cards */}
          <div className="row g-3 mb-4">
            {statsCards.map((stat, idx) => (
              <div className="col-xl-2 col-lg-4 col-md-6" key={idx}>
                <Link to={stat.link} className="text-decoration-none">
                  <div className="card bg-dark border-secondary h-100">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <p className="text-white-50 small mb-1">{stat.title}</p>
                          <h5 className="fw-bold mb-0 text-white">{stat.value}</h5>
                        </div>
                        <div className="rounded-circle p-3"
                             style={{ background: `rgba(255, 193, 7, 0.1)` }}>
                          <i className={`fas ${stat.icon} text-${stat.color}`}></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Charts and Popular Media */}
          <div className="row g-3 mb-4">
            {/* Earnings Chart */}
            <div className="col-lg-8">
              <div className="card bg-dark border-secondary">
                <div className="card-header bg-transparent border-secondary">
                  <h6 className="mb-0 text-warning">
                    <i className="fas fa-chart-line me-2"></i>
                    Earnings Overview ({timeRange})
                  </h6>
                </div>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-end" style={{ height: "200px" }}>
                    {[45, 65, 55, 75, 85, 60, 50].map((height, idx) => (
                      <div key={idx} className="text-center" style={{ width: "12%" }}>
                        <div
                          className="bg-warning rounded-3 mb-2"
                          style={{
                            height: `${height}px`,
                            width: "100%",
                            opacity: 0.7,
                          }}
                        ></div>
                        <small className="text-white-50" style={{ fontSize: "0.6rem" }}>
                          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][idx]}
                        </small>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Popular Media */}
            <div className="col-lg-4">
              <div className="card bg-dark border-secondary h-100">
                <div className="card-header bg-transparent border-secondary">
                  <h6 className="mb-0 text-warning">
                    <i className="fas fa-fire me-2"></i>
                    Popular Media
                  </h6>
                </div>
                <div className="card-body">
                  {popularMedia.map((item, idx) => (
                    <div key={idx} className="d-flex align-items-center gap-2 mb-3">
                      <img
                        src={item.thumbnail || "https://via.placeholder.com/40"}
                        alt=""
                        width="40"
                        height="40"
                        className="rounded"
                        style={{ objectFit: "cover" }}
                      />
                      <div className="flex-grow-1">
                        <small className="fw-bold d-block text-truncate">{item.title}</small>
                        <small className="text-white-50">
                          <i className="fas fa-heart text-danger me-1"></i>
                          {item.likes || 0} likes
                        </small>
                      </div>
                      <small className="text-warning">KES {item.price}</small>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Sales */}
          <div className="card bg-dark border-secondary">
            <div className="card-header bg-transparent border-secondary d-flex justify-content-between align-items-center">
              <h6 className="mb-0 text-warning">
                <i className="fas fa-shopping-cart me-2"></i>
                Recent Sales
              </h6>
              <Link to="/photographer/sales" className="btn btn-sm btn-outline-warning">
                View All
              </Link>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-dark table-hover mb-0">
                  <thead>
                    <tr>
                      <th className="ps-3">Buyer</th>
                      <th>Item</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSales.map((sale, idx) => (
                      <tr key={idx}>
                        <td className="ps-3">
                          <i className="fas fa-user-circle text-warning me-2"></i>
                          {sale.user?.email || "Anonymous"}
                        </td>
                        <td>{sale.items?.[0]?.title || "Media"}</td>
                        <td>
                          <span className="badge bg-success">KES {sale.amount}</span>
                        </td>
                        <td>
                          <small>{new Date(sale.createdAt).toLocaleDateString()}</small>
                        </td>
                        <td>
                          <span className="badge bg-success">Completed</span>
                        </td>
                      </tr>
                    ))}
                    {recentSales.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center text-white-50 py-4">
                          No sales yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </PhotographerLayout>
  );
};

export default PhotographerDashboard;