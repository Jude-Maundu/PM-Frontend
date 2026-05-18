import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../../api/apiConfig";

const STATUS_COLORS = {
  approved: { bg: "rgba(46,204,154,0.15)", color: "#2ecc9a", border: "rgba(46,204,154,0.35)" },
  rejected: { bg: "rgba(232,85,85,0.15)", color: "#e85555", border: "rgba(232,85,85,0.35)" },
  pending: { bg: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)", border: "rgba(255,255,255,0.15)" },
};

const ClientProofingView = () => {
  const { token } = useParams();
  const [gallery, setGallery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [photoStatuses, setPhotoStatuses] = useState({});
  const [updating, setUpdating] = useState({});

  const fetchGallery = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_ENDPOINTS.PROOFING.GET(token), { timeout: 10000 });
      const data = res.data?.gallery || res.data?.data || res.data;
      setGallery(data);
      // Initialize statuses from the gallery data
      const statuses = {};
      (data?.photos || []).forEach((p) => {
        statuses[p._id || p.mediaId] = p.status || "pending";
      });
      setPhotoStatuses(statuses);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "This gallery could not be loaded. It may have expired or the link is invalid."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const updateStatus = async (mediaId, status) => {
    setUpdating((u) => ({ ...u, [mediaId]: true }));
    try {
      await axios.patch(
        API_ENDPOINTS.PROOFING.APPROVE_PHOTO(token, mediaId),
        { status },
        { timeout: 10000 }
      );
      setPhotoStatuses((prev) => ({ ...prev, [mediaId]: status }));
    } catch {
      // silently fail — show previous state
    } finally {
      setUpdating((u) => ({ ...u, [mediaId]: false }));
    }
  };

  const photos = gallery?.photos || [];
  const total = photos.length;
  const approvedCount = Object.values(photoStatuses).filter((s) => s === "approved").length;
  const rejectedCount = Object.values(photoStatuses).filter((s) => s === "rejected").length;
  const pendingCount = Object.values(photoStatuses).filter((s) => s === "pending").length;
  const reviewedCount = approvedCount + rejectedCount;
  const progressPct = total > 0 ? Math.round((reviewedCount / total) * 100) : 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a1628 0%, #0f1e28 60%, #1a2e3b 100%)",
        fontFamily: "var(--font-sans, 'Inter', sans-serif)",
        color: "#fff",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          background: "rgba(10,20,30,0.92)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(107,189,208,0.15)",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "rgba(107,189,208,0.15)",
            border: "1px solid rgba(107,189,208,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <i className="fas fa-camera" style={{ color: "var(--pm-teal, #6bbdd0)" }}></i>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: "1rem" }}>
            Photo<span style={{ color: "var(--pm-teal, #6bbdd0)" }}>Market</span>
          </div>
          <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>Client Proofing Gallery</div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 20px" }}>
        {loading ? (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <div
              className="spinner-border"
              style={{ width: "3rem", height: "3rem", color: "var(--pm-teal, #6bbdd0)" }}
            ></div>
            <p style={{ color: "rgba(255,255,255,0.4)", marginTop: 16 }}>Loading gallery...</p>
          </div>
        ) : error ? (
          <div
            style={{
              textAlign: "center",
              paddingTop: 80,
              background: "rgba(232,85,85,0.08)",
              border: "1px solid rgba(232,85,85,0.25)",
              borderRadius: 16,
              padding: 48,
            }}
          >
            <i className="fas fa-exclamation-circle fa-3x mb-3" style={{ color: "rgba(232,85,85,0.6)" }}></i>
            <h4 style={{ color: "rgba(255,255,255,0.7)" }}>Gallery Unavailable</h4>
            <p style={{ color: "rgba(255,255,255,0.35)", maxWidth: 400, margin: "0 auto" }}>{error}</p>
          </div>
        ) : (
          <>
            {/* Gallery Header */}
            <div className="mb-4">
              <div
                style={{
                  background: "rgba(107,189,208,0.08)",
                  border: "1px solid rgba(107,189,208,0.2)",
                  borderRadius: 12,
                  padding: "24px 28px",
                  marginBottom: 24,
                }}
              >
                <h2 style={{ fontWeight: 700, fontSize: "1.6rem", marginBottom: 4 }}>{gallery?.title}</h2>
                {gallery?.photographerName && (
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", marginBottom: 12 }}>
                    <i className="fas fa-camera me-1" style={{ color: "var(--pm-teal, #6bbdd0)" }}></i>
                    By {gallery.photographerName}
                  </p>
                )}
                {gallery?.message && (
                  <p
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      fontSize: "0.9rem",
                      fontStyle: "italic",
                      background: "rgba(255,255,255,0.04)",
                      borderRadius: 8,
                      padding: "10px 14px",
                      marginBottom: 0,
                      borderLeft: "3px solid rgba(107,189,208,0.4)",
                    }}
                  >
                    {gallery.message}
                  </p>
                )}
              </div>

              {/* Progress bar */}
              <div
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(107,189,208,0.15)",
                  borderRadius: 12,
                  padding: "16px 20px",
                  marginBottom: 24,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>
                    {reviewedCount} of {total} photos reviewed
                  </span>
                  <span style={{ fontSize: "0.85rem", color: "var(--pm-teal, #6bbdd0)", fontWeight: 600 }}>
                    {progressPct}%
                  </span>
                </div>
                <div style={{ height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 99 }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${progressPct}%`,
                      background: "linear-gradient(90deg, var(--pm-teal, #6bbdd0), #2ecc9a)",
                      borderRadius: 99,
                      transition: "width 0.4s ease",
                    }}
                  ></div>
                </div>
                <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
                  <span style={{ fontSize: "0.78rem", color: "#2ecc9a" }}>
                    <i className="fas fa-check me-1"></i>{approvedCount} Approved
                  </span>
                  <span style={{ fontSize: "0.78rem", color: "#e85555" }}>
                    <i className="fas fa-times me-1"></i>{rejectedCount} Rejected
                  </span>
                  <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>
                    <i className="fas fa-clock me-1"></i>{pendingCount} Pending
                  </span>
                </div>
              </div>
            </div>

            {/* Photo Grid */}
            {photos.length === 0 ? (
              <p style={{ textAlign: "center", color: "rgba(255,255,255,0.35)" }}>No photos in this gallery.</p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 20,
                }}
              >
                {photos.map((photo) => {
                  const id = photo._id || photo.mediaId;
                  const status = photoStatuses[id] || "pending";
                  const imgSrc = photo.thumbnail || photo.fileUrl || photo.image;
                  const sc = STATUS_COLORS[status] || STATUS_COLORS.pending;
                  const isUpdating = !!updating[id];

                  return (
                    <div
                      key={id}
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: `1px solid ${sc.border}`,
                        borderRadius: 14,
                        overflow: "hidden",
                        transition: "border-color 0.3s ease",
                      }}
                    >
                      <div style={{ position: "relative", height: 200, background: "#0a1520" }}>
                        <img
                          src={imgSrc}
                          alt={photo.title || "Photo"}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                        {/* Status badge */}
                        <div
                          style={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            background: sc.bg,
                            color: sc.color,
                            border: `1px solid ${sc.border}`,
                            borderRadius: 20,
                            padding: "3px 10px",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            backdropFilter: "blur(8px)",
                          }}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </div>
                      </div>
                      <div style={{ padding: "14px 16px" }}>
                        {photo.title && (
                          <p style={{ color: "rgba(255,255,255,0.8)", fontWeight: 600, marginBottom: 12, fontSize: "0.9rem" }}>
                            {photo.title}
                          </p>
                        )}
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => updateStatus(id, "approved")}
                            disabled={isUpdating || status === "approved"}
                            style={{
                              flex: 1,
                              border: "none",
                              borderRadius: 8,
                              padding: "8px 0",
                              cursor: status === "approved" ? "default" : "pointer",
                              background: status === "approved" ? "rgba(46,204,154,0.3)" : "rgba(46,204,154,0.12)",
                              color: "#2ecc9a",
                              fontWeight: 600,
                              fontSize: "0.8rem",
                              transition: "all 0.2s",
                              opacity: isUpdating ? 0.6 : 1,
                            }}
                          >
                            {isUpdating ? (
                              <span className="spinner-border spinner-border-sm"></span>
                            ) : (
                              <><i className="fas fa-check me-1"></i>Approve</>
                            )}
                          </button>
                          <button
                            onClick={() => updateStatus(id, "rejected")}
                            disabled={isUpdating || status === "rejected"}
                            style={{
                              flex: 1,
                              border: "none",
                              borderRadius: 8,
                              padding: "8px 0",
                              cursor: status === "rejected" ? "default" : "pointer",
                              background: status === "rejected" ? "rgba(232,85,85,0.3)" : "rgba(232,85,85,0.1)",
                              color: "#e85555",
                              fontWeight: 600,
                              fontSize: "0.8rem",
                              transition: "all 0.2s",
                              opacity: isUpdating ? 0.6 : 1,
                            }}
                          >
                            <i className="fas fa-times me-1"></i>Reject
                          </button>
                          <button
                            onClick={() => updateStatus(id, "pending")}
                            disabled={isUpdating || status === "pending"}
                            style={{
                              flex: 1,
                              border: "none",
                              borderRadius: 8,
                              padding: "8px 0",
                              cursor: status === "pending" ? "default" : "pointer",
                              background: status === "pending" ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
                              color: "rgba(255,255,255,0.45)",
                              fontWeight: 600,
                              fontSize: "0.8rem",
                              transition: "all 0.2s",
                              opacity: isUpdating ? 0.6 : 1,
                            }}
                          >
                            <i className="fas fa-question me-1"></i>Pending
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Summary */}
            <div
              style={{
                marginTop: 40,
                background: "rgba(107,189,208,0.06)",
                border: "1px solid rgba(107,189,208,0.2)",
                borderRadius: 14,
                padding: "20px 24px",
                display: "flex",
                gap: 32,
                flexWrap: "wrap",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#2ecc9a" }}>{approvedCount}</div>
                <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>Approved</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#e85555" }}>{rejectedCount}</div>
                <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>Rejected</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>{pendingCount}</div>
                <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>Pending</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--pm-teal, #6bbdd0)" }}>{total}</div>
                <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>Total Photos</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ClientProofingView;
