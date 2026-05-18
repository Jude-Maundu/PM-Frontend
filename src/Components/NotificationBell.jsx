import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSocket } from "../hooks/useSocket";
import { API_ENDPOINTS } from "../api/apiConfig";

const NotificationBell = () => {
  const navigate = useNavigate();
  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  })();
  const userId = user?._id;

  const [liveCount, setLiveCount] = useState(0);
  const [initialCount, setInitialCount] = useState(0);
  const [shaking, setShaking] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const socket = useSocket(userId);

  // Fetch initial unread count
  useEffect(() => {
    if (!userId) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get(API_ENDPOINTS.NOTIFICATIONS.GET_UNREAD, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 8000,
      })
      .then((res) => {
        const data = res.data?.notifications || res.data?.data || res.data;
        if (Array.isArray(data)) {
          setInitialCount(data.length);
          setNotifications(data.slice(0, 5));
        } else if (typeof res.data?.count === "number") {
          setInitialCount(res.data.count);
        }
      })
      .catch(() => {});
  }, [userId]);

  // Listen for live socket notifications
  useEffect(() => {
    if (!socket) return;
    const handler = (notification) => {
      setLiveCount((c) => c + 1);
      setNotifications((prev) => [notification, ...prev].slice(0, 5));
      setShaking(true);
      setTimeout(() => setShaking(false), 700);
    };
    socket.on("notification", handler);
    return () => { socket.off("notification", handler); };
  }, [socket]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const totalCount = initialCount + liveCount;

  const handleClick = () => {
    setDropdownOpen((v) => !v);
  };

  const goToNotifications = () => {
    setDropdownOpen(false);
    navigate("/notifications");
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <div
        style={{ position: "relative", cursor: "pointer" }}
        onClick={handleClick}
        title="Notifications"
      >
        <i
          className={`fas fa-bell ${shaking ? "bell-shake" : ""}`}
          style={{ color: "var(--pm-teal)", fontSize: "1.2rem" }}
        ></i>
        {totalCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: -6,
              right: -6,
              background: "#e85555",
              color: "#fff",
              borderRadius: "50%",
              fontSize: "0.6rem",
              width: 16,
              height: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
            }}
          >
            {totalCount > 99 ? "99+" : totalCount}
          </span>
        )}
      </div>

      {dropdownOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 12px)",
            right: 0,
            width: 300,
            background: "rgba(10,20,30,0.97)",
            border: "1px solid rgba(107,189,208,0.25)",
            borderRadius: "var(--radius-md)",
            backdropFilter: "blur(20px)",
            zIndex: 9999,
            boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid rgba(107,189,208,0.15)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem" }}>
              Notifications
            </span>
            {totalCount > 0 && (
              <span
                style={{
                  background: "rgba(232,85,85,0.2)",
                  color: "#e85555",
                  border: "1px solid rgba(232,85,85,0.3)",
                  borderRadius: 999,
                  fontSize: "0.7rem",
                  padding: "1px 8px",
                  fontWeight: 700,
                }}
              >
                {totalCount} unread
              </span>
            )}
          </div>

          {notifications.length === 0 ? (
            <div
              style={{
                padding: "24px 16px",
                textAlign: "center",
                color: "rgba(255,255,255,0.35)",
                fontSize: "0.85rem",
              }}
            >
              <i className="fas fa-bell-slash mb-2 d-block" style={{ fontSize: "1.4rem" }}></i>
              No new notifications
            </div>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {notifications.map((n, idx) => (
                <li
                  key={n._id || idx}
                  style={{
                    padding: "10px 16px",
                    borderBottom: "1px solid rgba(107,189,208,0.08)",
                    color: "rgba(255,255,255,0.8)",
                    fontSize: "0.82rem",
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                  }}
                >
                  <i
                    className="fas fa-bell mt-1 flex-shrink-0"
                    style={{ color: "var(--pm-teal)", fontSize: "0.75rem" }}
                  ></i>
                  <span style={{ flex: 1 }}>{n.message || n.title || "New notification"}</span>
                </li>
              ))}
            </ul>
          )}

          <div
            style={{
              padding: "10px 16px",
              textAlign: "center",
              borderTop: "1px solid rgba(107,189,208,0.12)",
            }}
          >
            <button
              onClick={goToNotifications}
              style={{
                background: "none",
                border: "none",
                color: "var(--pm-teal)",
                fontSize: "0.8rem",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
