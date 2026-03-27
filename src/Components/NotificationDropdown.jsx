import React, { useState, useEffect } from "react";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from "../api/API";
import { useNavigate } from "react-router-dom";

const NotificationDropdown = ({ userRole = "user" }) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getNotifications(10, 0);
      setNotifications(res.data?.notifications || []);
      setUnreadCount(res.data?.unreadCount || 0);
    } catch (err) {
      let msg = "";
      if (err.response?.status === 404) {
        msg = "Notifications service unavailable (404)";
        console.warn("NotificationDropdown: Notifications endpoint not available (404)");
      } else if (err.message) {
        msg = err.message;
        console.error("NotificationDropdown: fetch error", err);
      } else {
        msg = "Failed to load notifications.";
        console.error("NotificationDropdown: fetch error", err);
      }
      setError(msg);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 30000);
    return () => clearInterval(timer);
  }, []);

  const onToggle = () => {
    setOpen((prev) => !prev);
    if (!open) {
      fetchNotifications();
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((u) => Math.max(0, u - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleView = (actionUrl) => {
    if (actionUrl) {
      navigate(actionUrl);
      setOpen(false);
    }
  };

  return (
    <div className="position-relative">
      <button
        className="btn btn-sm rounded-circle p-2"
        onClick={onToggle}
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          color: "#fff",
          width: "38px",
          height: "38px",
        }}
      >
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
            style={{
              background: "#ffc107",
              color: "#000",
              fontSize: "0.6rem",
              padding: "2px 5px",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="position-absolute end-0 mt-2 p-2 rounded-3"
          style={{
            width: "320px",
            maxHeight: "420px",
            background: "rgba(0,0,0,0.9)",
            border: "1px solid rgba(255,255,255,0.15)",
            overflowY: "auto",
            zIndex: 1100,
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="text-warning mb-0">Notifications</h6>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => { markAllNotificationsAsRead(); setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true }))); setUnreadCount(0); }}>
              Mark all read
            </button>
          </div>

          {error && !loading && (
            <div className="alert alert-danger text-center py-2 mb-2" style={{ fontSize: "0.95rem" }}>
              {error}
            </div>
          )}

          {loading && <div className="text-center text-white-50 py-3">Loading...</div>}

          {!loading && !error && notifications.length === 0 && (
            <div className="text-center text-white-50 py-3">No notifications</div>
          )}

          {!loading && !error && notifications.map((n) => (
            <div key={n._id} className={`p-2 mb-2 rounded ${n.isRead ? "bg-dark" : "bg-warning bg-opacity-20"}`}>
              <div className="d-flex justify-content-between align-items-start">
                <div style={{ cursor: n.actionUrl ? "pointer" : "default" }} onClick={() => handleView(n.actionUrl)}>
                  <p className="mb-1 text-white small">{n.title}</p>
                  <p className="mb-1 text-white-50 xsmall" style={{ fontSize: "0.75rem" }}>{n.message}</p>
                  <small className="text-white-50">{new Date(n.createdAt).toLocaleString()}</small>
                </div>
                <div className="text-end">
                  {!n.isRead && (
                    <button className="btn btn-sm btn-outline-info mb-1" onClick={() => handleMarkAsRead(n._id)}>Read</button>
                  )}
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(n._id)}>X</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
