import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import { API_ENDPOINTS } from "../../../api/apiConfig";
import PageHeader from "../../PageHeader";

const TABS = [
  { key: "flagged", label: "Flagged", icon: "fa-flag", color: "#dc3545" },
  { key: "pending", label: "Pending Approval", icon: "fa-clock", color: "#ffc107" },
  { key: "all", label: "All Issues", icon: "fa-list", color: "var(--pm-teal, #6bbdd0)" },
];

const AdminModeration = () => {
  const [activeTab, setActiveTab] = useState("flagged");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [counts, setCounts] = useState({ flagged: 0, pending: 0 });
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [dismissing, setDismissing] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  const fetchItems = useCallback(async (status) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_ENDPOINTS.ADMIN.MODERATION_LIST}?status=${status}`, {
        headers: getHeaders(),
      });
      const data = Array.isArray(res.data) ? res.data : (res.data?.items || res.data?.data || []);
      setItems(data);
    } catch (err) {
      setError("Failed to load moderation queue.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCounts = useCallback(async () => {
    try {
      const [flagRes, pendRes] = await Promise.all([
        axios.get(`${API_ENDPOINTS.ADMIN.MODERATION_LIST}?status=flagged`, { headers: getHeaders() }).catch(() => ({ data: [] })),
        axios.get(`${API_ENDPOINTS.ADMIN.MODERATION_LIST}?status=pending`, { headers: getHeaders() }).catch(() => ({ data: [] })),
      ]);
      const flagged = Array.isArray(flagRes.data) ? flagRes.data.length : (flagRes.data?.items?.length || 0);
      const pending = Array.isArray(pendRes.data) ? pendRes.data.length : (pendRes.data?.items?.length || 0);
      setCounts({ flagged, pending });
    } catch (e) {
      // counts not critical
    }
  }, []);

  useEffect(() => {
    fetchItems(activeTab);
    fetchCounts();
  }, [activeTab, fetchItems, fetchCounts]);

  const removeWithTransition = (id) => {
    setDismissing((prev) => [...prev, id]);
    setTimeout(() => {
      setItems((prev) => prev.filter((item) => (item._id || item.id) !== id));
      setDismissing((prev) => prev.filter((d) => d !== id));
      fetchCounts();
    }, 400);
  };

  const handleApprove = async (item) => {
    const id = item._id || item.id;
    setActionLoading(id + "_approve");
    try {
      await axios.patch(API_ENDPOINTS.ADMIN.MODERATION_APPROVE(id), {}, { headers: getHeaders() });
      removeWithTransition(id);
    } catch (err) {
      alert("Approve failed. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (item) => {
    const id = item._id || item.id;
    if (!rejectReason.trim()) {
      alert("Please enter a reason for rejection.");
      return;
    }
    setActionLoading(id + "_reject");
    try {
      await axios.patch(
        API_ENDPOINTS.ADMIN.MODERATION_REJECT(id),
        { reason: rejectReason },
        { headers: getHeaders() }
      );
      setRejectingId(null);
      setRejectReason("");
      removeWithTransition(id);
    } catch (err) {
      alert("Reject failed. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <AdminLayout>
      <div className="mc-page">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-2 gap-3">
          <PageHeader title="Content Moderation" subtitle="Review flagged and pending content" />

          {/* Count Pills */}
          <div className="d-flex gap-2 flex-wrap">
            <span
              className="badge d-flex align-items-center gap-1 px-3 py-2"
              style={{ background: "rgba(220,53,69,0.15)", color: "#dc3545", border: "1px solid rgba(220,53,69,0.25)", fontSize: "0.8rem", borderRadius: "999px" }}
            >
              <i className="fas fa-flag me-1"></i>
              {counts.flagged} Flagged
            </span>
            <span
              className="badge d-flex align-items-center gap-1 px-3 py-2"
              style={{ background: "rgba(255,193,7,0.12)", color: "#ffc107", border: "1px solid rgba(255,193,7,0.25)", fontSize: "0.8rem", borderRadius: "999px" }}
            >
              <i className="fas fa-clock me-1"></i>
              {counts.pending} Pending
            </span>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="d-flex gap-2 mb-4 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setRejectingId(null);
                setRejectReason("");
              }}
              className="btn btn-sm"
              style={{
                background: activeTab === tab.key ? `${tab.color}22` : "rgba(255,255,255,0.04)",
                border: `1px solid ${activeTab === tab.key ? tab.color + "66" : "rgba(255,255,255,0.1)"}`,
                color: activeTab === tab.key ? tab.color : "rgba(255,255,255,0.5)",
                borderRadius: "8px",
                fontWeight: activeTab === tab.key ? 600 : 400,
                transition: "all 0.2s",
                padding: "0.4rem 1rem",
              }}
            >
              <i className={`fas ${tab.icon} me-2`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-5">
            <div
              className="spinner-border mb-3"
              style={{ width: "2.5rem", height: "2.5rem", color: "var(--pm-teal)" }}
            ></div>
            <p className="text-white-50">Loading queue...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div
            className="alert border-0 mb-4"
            style={{ background: "rgba(220,53,69,0.15)", color: "#f88", border: "1px solid rgba(220,53,69,0.3)" }}
          >
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
            <button
              className="btn btn-sm ms-3"
              style={{ color: "#f88", border: "1px solid rgba(220,53,69,0.3)" }}
              onClick={() => fetchItems(activeTab)}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && items.length === 0 && (
          <div
            className="mc-card text-center py-5"
            style={{ background: "rgba(46,204,154,0.05)", border: "1px solid rgba(46,204,154,0.15)" }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "rgba(46,204,154,0.12)",
                border: "2px solid rgba(46,204,154,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
              }}
            >
              <i className="fas fa-check-circle fa-2x" style={{ color: "#2ecc9a" }}></i>
            </div>
            <h5 className="fw-bold mb-2" style={{ color: "#2ecc9a" }}>All clear!</h5>
            <p className="text-white-50 mb-0">No content needs review in this queue.</p>
          </div>
        )}

        {/* Media Cards Grid */}
        {!loading && !error && items.length > 0 && (
          <div className="row g-3">
            {items.map((item) => {
              const id = item._id || item.id;
              const isDismissing = dismissing.includes(id);
              const isRejectOpen = rejectingId === id;
              const thumbnail = item.thumbnail || item.imageUrl || item.image || item.url || null;
              const title = item.title || item.name || "Untitled";
              const photographerName =
                item.photographer?.username ||
                item.photographer?.name ||
                item.uploadedBy?.username ||
                item.uploadedBy?.name ||
                "Unknown";
              const flagReason = item.flagReason || item.reason || item.flag || "No reason provided";
              const uploadedAt = item.createdAt || item.uploadedAt || item.date;

              return (
                <div
                  className="col-xl-4 col-lg-6 col-12"
                  key={id}
                  style={{
                    transition: "opacity 0.4s ease, transform 0.4s ease",
                    opacity: isDismissing ? 0 : 1,
                    transform: isDismissing ? "scale(0.95)" : "scale(1)",
                  }}
                >
                  <div className="mc-card h-100" style={{ padding: 0 }}>
                    {/* Thumbnail */}
                    <div style={{ position: "relative", height: "180px", overflow: "hidden", borderRadius: "12px 12px 0 0" }}>
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        style={{
                          display: thumbnail ? "none" : "flex",
                          width: "100%",
                          height: "100%",
                          background: "rgba(255,255,255,0.04)",
                          alignItems: "center",
                          justifyContent: "center",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        <i className="fas fa-image fa-2x" style={{ color: "rgba(255,255,255,0.2)" }}></i>
                        <small style={{ color: "rgba(255,255,255,0.2)" }}>No preview</small>
                      </div>

                      {/* Status Badge */}
                      <span
                        style={{
                          position: "absolute",
                          top: "10px",
                          left: "10px",
                          background: item.status === "flagged" ? "rgba(220,53,69,0.85)" : "rgba(255,193,7,0.85)",
                          color: "#fff",
                          fontSize: "0.65rem",
                          fontWeight: 600,
                          padding: "3px 10px",
                          borderRadius: "999px",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {item.status || activeTab}
                      </span>
                    </div>

                    <div className="p-3">
                      {/* Title */}
                      <h6
                        className="fw-bold mb-1 text-truncate text-white"
                        title={title}
                      >
                        {title}
                      </h6>

                      {/* Meta */}
                      <div className="mb-2" style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)" }}>
                        <span>
                          <i className="fas fa-camera me-1"></i>
                          {photographerName}
                        </span>
                        <span className="mx-2">·</span>
                        <span>
                          <i className="fas fa-calendar me-1"></i>
                          {formatDate(uploadedAt)}
                        </span>
                      </div>

                      {/* Flag Reason */}
                      <div
                        className="mb-3 p-2"
                        style={{
                          background: "rgba(220,53,69,0.08)",
                          border: "1px solid rgba(220,53,69,0.2)",
                          borderRadius: "6px",
                          fontSize: "0.78rem",
                          color: "rgba(255,180,180,0.85)",
                        }}
                      >
                        <i className="fas fa-exclamation-circle me-2" style={{ color: "#dc3545" }}></i>
                        {flagReason}
                      </div>

                      {/* Action Buttons */}
                      {!isRejectOpen && (
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm flex-fill"
                            style={{
                              background: "rgba(40,167,69,0.15)",
                              border: "1px solid rgba(40,167,69,0.35)",
                              color: "#28a745",
                              fontWeight: 600,
                            }}
                            disabled={actionLoading === id + "_approve"}
                            onClick={() => handleApprove(item)}
                          >
                            {actionLoading === id + "_approve" ? (
                              <span className="spinner-border spinner-border-sm me-1"></span>
                            ) : (
                              <i className="fas fa-check me-1"></i>
                            )}
                            Approve
                          </button>
                          <button
                            className="btn btn-sm flex-fill"
                            style={{
                              background: "rgba(220,53,69,0.12)",
                              border: "1px solid rgba(220,53,69,0.35)",
                              color: "#dc3545",
                              fontWeight: 600,
                            }}
                            onClick={() => {
                              setRejectingId(id);
                              setRejectReason("");
                            }}
                          >
                            <i className="fas fa-times me-1"></i>
                            Reject
                          </button>
                        </div>
                      )}

                      {/* Reject Inline Form */}
                      {isRejectOpen && (
                        <div
                          style={{
                            background: "rgba(220,53,69,0.07)",
                            border: "1px solid rgba(220,53,69,0.2)",
                            borderRadius: "8px",
                            padding: "0.75rem",
                          }}
                        >
                          <label style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.6)", marginBottom: "6px", display: "block" }}>
                            Rejection reason
                          </label>
                          <textarea
                            className="form-control mb-2"
                            rows={2}
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Enter reason for rejection..."
                            style={{
                              background: "rgba(255,255,255,0.06)",
                              border: "1px solid rgba(220,53,69,0.3)",
                              color: "#fff",
                              fontSize: "0.82rem",
                              resize: "none",
                            }}
                          />
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm flex-fill"
                              style={{
                                background: "rgba(220,53,69,0.2)",
                                border: "1px solid rgba(220,53,69,0.4)",
                                color: "#dc3545",
                                fontWeight: 600,
                              }}
                              disabled={actionLoading === id + "_reject"}
                              onClick={() => handleReject(item)}
                            >
                              {actionLoading === id + "_reject" ? (
                                <span className="spinner-border spinner-border-sm me-1"></span>
                              ) : (
                                <i className="fas fa-times-circle me-1"></i>
                              )}
                              Confirm Reject
                            </button>
                            <button
                              className="btn btn-sm"
                              style={{
                                background: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                color: "rgba(255,255,255,0.5)",
                              }}
                              onClick={() => {
                                setRejectingId(null);
                                setRejectReason("");
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminModeration;
