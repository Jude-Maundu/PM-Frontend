import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import PhotographerLayout from "./PhotographerLayout";
import PageHeader from "../../PageHeader";
import { API_ENDPOINTS, SITE_URL } from "../../../api/apiConfig";
import { toast } from "../../../utils/toast";

const EXPIRE_OPTIONS = [3, 7, 14, 30];

const ClientProofing = () => {
  const [galleries, setGalleries] = useState([]);
  const [myPhotos, setMyPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    title: "",
    clientName: "",
    clientEmail: "",
    message: "",
    selectedPhotos: [],
    expiresInDays: 7,
  });

  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const fetchGalleries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_ENDPOINTS.PROOFING.MY_GALLERIES, {
        headers: authHeader(),
        timeout: 10000,
      });
      setGalleries(res.data?.galleries || res.data?.data || res.data || []);
    } catch {
      setGalleries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyPhotos = useCallback(async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.MEDIA.GET_MY, {
        headers: authHeader(),
        timeout: 10000,
      });
      const data = res.data?.media || res.data?.data || res.data;
      setMyPhotos(Array.isArray(data) ? data : []);
    } catch {
      setMyPhotos([]);
    }
  }, []);

  useEffect(() => {
    fetchGalleries();
    fetchMyPhotos();
  }, [fetchGalleries, fetchMyPhotos]);

  const openModal = () => {
    setForm({ title: "", clientName: "", clientEmail: "", message: "", selectedPhotos: [], expiresInDays: 7 });
    setShowModal(true);
  };

  const togglePhoto = (id) => {
    setForm((f) => ({
      ...f,
      selectedPhotos: f.selectedPhotos.includes(id)
        ? f.selectedPhotos.filter((p) => p !== id)
        : [...f.selectedPhotos, id],
    }));
  };

  const handleCreate = async () => {
    if (!form.title.trim()) { toast.error("Gallery title is required"); return; }
    if (!form.clientName.trim()) { toast.error("Client name is required"); return; }
    if (form.selectedPhotos.length === 0) { toast.error("Please select at least one photo"); return; }
    setCreating(true);
    try {
      await axios.post(
        API_ENDPOINTS.PROOFING.CREATE,
        {
          title: form.title,
          clientName: form.clientName,
          clientEmail: form.clientEmail,
          message: form.message,
          photos: form.selectedPhotos,
          expiresInDays: form.expiresInDays,
        },
        { headers: authHeader() }
      );
      toast.success("Gallery created!");
      setShowModal(false);
      fetchGalleries();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create gallery");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this gallery?")) return;
    try {
      await axios.delete(API_ENDPOINTS.PROOFING.DELETE(id), { headers: authHeader() });
      toast.success("Gallery deleted");
      fetchGalleries();
    } catch {
      toast.error("Failed to delete gallery");
    }
  };

  const copyLink = (token) => {
    const link = `${SITE_URL}/proofing/${token}`;
    navigator.clipboard.writeText(link).then(() => {
      toast.success("Proofing link copied!");
    });
  };

  return (
    <PhotographerLayout>
      <div className="mc-page">
      <PageHeader
        title="Client Proofing"
        subtitle="Share galleries for client approval"
        action={
          <button className="btn mc-btn mc-btn-primary rounded-pill px-4" onClick={openModal}>
            <i className="fas fa-plus me-2"></i>Create New Gallery
          </button>
        }
      />

      {loading ? (
        <div style={{padding:"2rem",textAlign:"center"}}><div className="spinner-border" style={{color:"var(--mc-accent)"}}></div></div>
      ) : galleries.length === 0 ? (
        <div className="mc-card">
          <div className="mc-empty">
            <i className="fas fa-folder-open"></i>
            <p>No proofing galleries yet</p>
            <button className="btn mc-btn mc-btn-primary rounded-pill px-4 mt-2" onClick={openModal}>
              <i className="fas fa-plus me-2"></i>Create Gallery
            </button>
          </div>
        </div>
      ) : (
        <div className="mc-card">
        <div className="row g-3">
          {galleries.map((g) => {
            const total = g.photos?.length || 0;
            const approved = g.photos?.filter((p) => p.status === "approved").length || 0;
            const expiry = g.expiresAt ? new Date(g.expiresAt).toLocaleDateString() : "N/A";
            return (
              <div key={g._id} className="col-md-6 col-lg-4">
                <div className="mc-card h-100 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6 className="fw-bold text-white mb-0 text-truncate" style={{ maxWidth: "70%" }}>{g.title}</h6>
                    <button
                      onClick={() => handleDelete(g._id)}
                      style={{ background: "none", border: "none", color: "rgba(232,85,85,0.7)", cursor: "pointer", padding: "0 0 0 8px" }}
                      title="Delete gallery"
                    >
                      <i className="fas fa-trash-alt" style={{ fontSize: "0.85rem" }}></i>
                    </button>
                  </div>

                  <p className="mb-1" style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.82rem" }}>
                    <i className="fas fa-user me-1" style={{ color: "var(--pm-teal)" }}></i>
                    {g.clientName}
                  </p>
                  <p className="mb-2" style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem" }}>
                    <i className="fas fa-calendar me-1"></i>Expires: {expiry}
                  </p>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <small style={{ color: "rgba(255,255,255,0.5)" }}>Approval Progress</small>
                      <small style={{ color: "var(--pm-teal)" }}>{approved}/{total}</small>
                    </div>
                    <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 99 }}>
                      <div
                        style={{
                          height: "100%",
                          width: total > 0 ? `${(approved / total) * 100}%` : "0%",
                          background: "var(--pm-teal)",
                          borderRadius: 99,
                          transition: "width 0.4s ease",
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <button
                      className="btn btn-sm w-100 rounded-pill"
                      style={{
                        background: "rgba(107,189,208,0.12)",
                        color: "var(--pm-teal)",
                        border: "1px solid rgba(107,189,208,0.3)",
                        fontSize: "0.8rem",
                      }}
                      onClick={() => copyLink(g.token)}
                    >
                      <i className="fas fa-link me-2"></i>Copy Client Link
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ background: "rgba(0,0,0,0.85)", zIndex: 3000 }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content mc-card" style={{ maxHeight: "90vh", overflowY: "auto" }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-white">
                  <i className="fas fa-plus-circle me-2" style={{ color: "var(--pm-teal)" }}></i>
                  Create Proofing Gallery
                </h5>
                <button className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small text-white-50">Gallery Title *</label>
                    <input
                      type="text"
                      className="form-control"

                      placeholder="e.g. Wedding Preview — Smith Family"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-white-50">Client Name *</label>
                    <input
                      type="text"
                      className="form-control"

                      placeholder="Client full name"
                      value={form.clientName}
                      onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-white-50">Client Email (optional)</label>
                    <input
                      type="email"
                      className="form-control"

                      placeholder="client@email.com"
                      value={form.clientEmail}
                      onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-white-50">Expires In</label>
                    <select
                      className="form-select"

                      value={form.expiresInDays}
                      onChange={(e) => setForm({ ...form, expiresInDays: Number(e.target.value) })}
                    >
                      {EXPIRE_OPTIONS.map((d) => (
                        <option key={d} value={d} style={{ background: "#0f1e28" }}>
                          {d} days
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label small text-white-50">Message to Client</label>
                    <textarea
                      className="form-control"
                      style={{ minHeight: 80 }}
                      placeholder="Add a note for your client..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                    />
                  </div>

                  {/* Photo Selection */}
                  <div className="col-12">
                    <label className="form-label small text-white-50">
                      Select Photos * ({form.selectedPhotos.length} selected)
                    </label>
                    {myPhotos.length === 0 ? (
                      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.85rem" }}>
                        No photos found. Upload some photos first.
                      </p>
                    ) : (
                      <div
                        className="d-flex flex-wrap gap-2"
                        style={{ maxHeight: 240, overflowY: "auto", padding: "4px" }}
                      >
                        {myPhotos.map((photo) => {
                          const isSelected = form.selectedPhotos.includes(photo._id);
                          const imgSrc = photo.thumbnail || photo.fileUrl || photo.image;
                          return (
                            <div
                              key={photo._id}
                              onClick={() => togglePhoto(photo._id)}
                              style={{
                                width: 80,
                                height: 80,
                                borderRadius: 8,
                                overflow: "hidden",
                                cursor: "pointer",
                                border: isSelected ? "3px solid var(--pm-teal)" : "2px solid rgba(255,255,255,0.1)",
                                position: "relative",
                                flexShrink: 0,
                              }}
                            >
                              <img
                                src={imgSrc}
                                alt={photo.title}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                              {isSelected && (
                                <div
                                  style={{
                                    position: "absolute",
                                    inset: 0,
                                    background: "rgba(107,189,208,0.35)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <i className="fas fa-check-circle" style={{ color: "#fff", fontSize: "1.4rem" }}></i>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 gap-2">
                <button
                  className="btn mc-btn mc-btn-ghost rounded-pill px-4"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn mc-btn mc-btn-primary rounded-pill px-5 fw-semibold"
                  onClick={handleCreate}
                  disabled={creating}
                >
                  {creating ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>Creating...</>
                  ) : (
                    <><i className="fas fa-plus me-2"></i>Create Gallery</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </PhotographerLayout>
  );
};

export default ClientProofing;
