import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "./AdminLayout";
import axios from "axios";
import { API_BASE_URL } from "../../../api/apiConfig";

const STATUS = { idle: "idle", loading: "loading", done: "done" };

const AdminMediaApproval = () => {
  const [photos, setPhotos]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [total, setTotal]           = useState(0);
  const [actionMap, setActionMap]   = useState({});   // { [id]: "approving"|"rejecting"|"done" }
  const [rejectId, setRejectId]     = useState(null); // photo ID awaiting rejection reason
  const [rejectReason, setRejectReason] = useState("");
  const [preview, setPreview]       = useState(null); // photo to preview full-size

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/media/admin/pending`, { headers });
      setPhotos(res.data.media || []);
      setTotal(res.data.total || 0);
    } catch {
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const approve = async (id) => {
    setActionMap(m => ({ ...m, [id]: "approving" }));
    try {
      await axios.patch(`${API_BASE_URL}/media/${id}/approve`, {}, { headers });
      setPhotos(p => p.filter(x => x._id !== id));
      setTotal(t => t - 1);
    } catch {
      alert("Approval failed — please try again.");
    } finally {
      setActionMap(m => { const n = { ...m }; delete n[id]; return n; });
    }
  };

  const reject = async () => {
    if (!rejectId) return;
    setActionMap(m => ({ ...m, [rejectId]: "rejecting" }));
    try {
      await axios.patch(`${API_BASE_URL}/media/${rejectId}/reject`, { reason: rejectReason }, { headers });
      setPhotos(p => p.filter(x => x._id !== rejectId));
      setTotal(t => t - 1);
    } catch {
      alert("Rejection failed — please try again.");
    } finally {
      setActionMap(m => { const n = { ...m }; delete n[rejectId]; return n; });
      setRejectId(null);
      setRejectReason("");
    }
  };

  const pgName = (photo) =>
    photo.photographer?.username || photo.photographerName || "Unknown";

  return (
    <AdminLayout>
      <div style={{ padding: "1.5rem 2rem" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <h4 style={{ margin: 0, fontFamily: "var(--font-serif)", fontWeight: 700, color: "var(--mc-text)" }}>
              <i className="fas fa-camera-retro me-2" style={{ color: "var(--mc-accent)" }}></i>
              Photo Approval Queue
            </h4>
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "var(--mc-text-muted)" }}>
              Review and approve photos before they go live on the marketplace
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <span style={{
              background: total > 0 ? "rgba(245,166,35,0.15)" : "rgba(107,189,208,0.12)",
              color: total > 0 ? "#d4900a" : "var(--mc-accent)",
              border: `1px solid ${total > 0 ? "rgba(245,166,35,0.3)" : "rgba(107,189,208,0.25)"}`,
              borderRadius: 20, padding: "0.3rem 0.85rem",
              fontSize: "0.82rem", fontWeight: 600,
            }}>
              {total} pending
            </span>
            <button
              onClick={load}
              style={{ background: "var(--mc-card-bg)", border: "1px solid var(--mc-border)", borderRadius: 8, padding: "0.4rem 0.85rem", cursor: "pointer", color: "var(--mc-text-muted)", fontSize: "0.82rem" }}
            >
              <i className="fas fa-sync-alt me-1"></i>Refresh
            </button>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: "1.25rem" }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ borderRadius: 12, overflow: "hidden", background: "var(--mc-card-bg)", border: "1px solid var(--mc-border)" }}>
                <div className="skeleton-box" style={{ height: 200 }} />
                <div style={{ padding: "1rem" }}>
                  <div className="skeleton-box" style={{ height: 14, width: "60%", marginBottom: 8 }} />
                  <div className="skeleton-box" style={{ height: 12, width: "40%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 1rem" }}>
            <i className="fas fa-check-circle fa-3x mb-3" style={{ color: "var(--mc-accent)", display: "block", marginBottom: "1rem" }}></i>
            <h5 style={{ color: "var(--mc-text)", fontFamily: "var(--font-serif)", fontWeight: 700 }}>All caught up!</h5>
            <p style={{ color: "var(--mc-text-muted)", fontSize: "0.9rem" }}>No photos waiting for approval right now.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: "1.25rem" }}>
            {photos.map((photo) => {
              const busy = actionMap[photo._id];
              const imgSrc = photo.watermarkedUrl || photo.fileUrl;
              return (
                <div key={photo._id} style={{ borderRadius: 12, overflow: "hidden", background: "var(--mc-card-bg)", border: "1px solid var(--mc-border)", boxShadow: "var(--mc-card-shadow)", display: "flex", flexDirection: "column" }}>
                  {/* Thumbnail */}
                  <div
                    style={{ position: "relative", height: 200, background: "#0a1520", cursor: "pointer", flexShrink: 0 }}
                    onClick={() => setPreview(photo)}
                  >
                    <img
                      src={imgSrc}
                      alt={photo.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      onError={e => { e.target.style.display = "none"; }}
                    />
                    <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(245,166,35,0.9)", color: "#fff", borderRadius: 6, padding: "2px 8px", fontSize: "0.68rem", fontWeight: 700 }}>
                      PENDING
                    </div>
                    <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.6)", color: "#fff", borderRadius: 6, padding: "2px 8px", fontSize: "0.68rem" }}>
                      <i className="fas fa-expand-alt me-1"></i>Preview
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ padding: "0.85rem 1rem", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--mc-text)", marginBottom: "0.25rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {photo.title}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--mc-text-muted)", marginBottom: "0.2rem" }}>
                      <i className="fas fa-camera me-1" style={{ color: "var(--mc-accent)" }}></i>
                      {pgName(photo)}
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "0.72rem", background: "rgba(107,189,208,0.1)", color: "var(--mc-accent)", borderRadius: 4, padding: "1px 6px", border: "1px solid rgba(107,189,208,0.2)" }}>
                        {photo.category || "general"}
                      </span>
                      <span style={{ fontSize: "0.72rem", background: "rgba(107,189,208,0.1)", color: "var(--mc-text-muted)", borderRadius: 4, padding: "1px 6px", border: "1px solid var(--mc-border)" }}>
                        KES {Number(photo.price || 0).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--mc-text-sub)", marginBottom: "0.75rem" }}>
                      <i className="fas fa-clock me-1"></i>
                      {new Date(photo.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}>
                      <button
                        disabled={!!busy}
                        onClick={() => approve(photo._id)}
                        style={{
                          flex: 1, padding: "0.5rem", borderRadius: 8, border: "none",
                          background: busy === "approving" ? "rgba(107,189,208,0.3)" : "var(--mc-accent)",
                          color: "#fff", fontWeight: 600, fontSize: "0.82rem",
                          cursor: busy ? "not-allowed" : "pointer",
                        }}
                      >
                        {busy === "approving"
                          ? <><span className="spinner-border spinner-border-sm me-1" style={{ width: 12, height: 12 }}></span>Approving…</>
                          : <><i className="fas fa-check me-1"></i>Approve</>
                        }
                      </button>
                      <button
                        disabled={!!busy}
                        onClick={() => { setRejectId(photo._id); setRejectReason(""); }}
                        style={{
                          flex: 1, padding: "0.5rem", borderRadius: 8,
                          border: "1px solid rgba(220,53,69,0.4)",
                          background: "rgba(220,53,69,0.08)",
                          color: "#dc3545", fontWeight: 600, fontSize: "0.82rem",
                          cursor: busy ? "not-allowed" : "pointer",
                        }}
                      >
                        {busy === "rejecting"
                          ? <><span className="spinner-border spinner-border-sm me-1" style={{ width: 12, height: 12 }}></span>Rejecting…</>
                          : <><i className="fas fa-times me-1"></i>Reject</>
                        }
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reject reason modal */}
      {rejectId && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(10,20,30,0.7)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={() => setRejectId(null)}
        >
          <div
            style={{ background: "var(--mc-card-bg)", borderRadius: 12, padding: "1.75rem", width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
            onClick={e => e.stopPropagation()}
          >
            <h6 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, color: "var(--mc-text)", marginBottom: "0.5rem" }}>
              <i className="fas fa-times-circle me-2" style={{ color: "#dc3545" }}></i>Reject Photo
            </h6>
            <p style={{ fontSize: "0.85rem", color: "var(--mc-text-muted)", marginBottom: "1rem" }}>
              Optionally provide a reason so the photographer can improve their submission.
            </p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Low resolution, inappropriate content, poor framing..."
              rows={3}
              style={{ width: "100%", padding: "0.65rem 0.85rem", borderRadius: 8, border: "1px solid var(--mc-border)", background: "var(--mc-bg)", color: "var(--mc-text)", fontFamily: "var(--font-sans)", fontSize: "0.88rem", resize: "vertical", outline: "none" }}
            />
            <div style={{ display: "flex", gap: "0.65rem", marginTop: "1.1rem" }}>
              <button
                onClick={() => setRejectId(null)}
                style={{ flex: 1, padding: "0.6rem", borderRadius: 8, border: "1px solid var(--mc-border)", background: "transparent", color: "var(--mc-text-muted)", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={reject}
                disabled={!!actionMap[rejectId]}
                style={{ flex: 1, padding: "0.6rem", borderRadius: 8, border: "none", background: "#dc3545", color: "#fff", fontWeight: 600, cursor: "pointer" }}
              >
                {actionMap[rejectId] ? "Rejecting…" : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-size preview modal */}
      {preview && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(10,20,30,0.9)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={() => setPreview(null)}
        >
          <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }} onClick={e => e.stopPropagation()}>
            <img
              src={preview.fileUrl || preview.watermarkedUrl}
              alt={preview.title}
              style={{ maxWidth: "90vw", maxHeight: "85vh", borderRadius: 12, objectFit: "contain", display: "block" }}
            />
            <div style={{ position: "absolute", bottom: -48, left: 0, right: 0, textAlign: "center", color: "rgba(255,255,255,0.7)", fontSize: "0.88rem" }}>
              {preview.title} — by {pgName(preview)}
            </div>
            <button
              onClick={() => setPreview(null)}
              style={{ position: "absolute", top: -14, right: -14, width: 32, height: 32, borderRadius: "50%", background: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#1A2E3B", fontWeight: 700 }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminMediaApproval;
