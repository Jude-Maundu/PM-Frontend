import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../../api/apiConfig";
import PhotographerLayout from "./PhotographerLayout";
import { Helmet } from "react-helmet-async";

const token = () => localStorage.getItem("token");
const headers = () => ({ Authorization: `Bearer ${token()}` });

function resolveUrl(url) {
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("data:") || url.startsWith("blob:")) return url;
  return `${process.env.REACT_APP_API_URL || "https://pm-backend-f3b6.onrender.com"}/${url.replace(/^\//, "")}`;
}

export default function AlbumManage() {
  const { albumId } = useParams();
  const navigate = useNavigate();
  const uploadRef = useRef();

  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPrice, setEditPrice] = useState("0");
  const [editPrivate, setEditPrivate] = useState(false);
  const [saving, setSaving] = useState(false);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragging, setDragging] = useState(false);

  // Remove state
  const [removing, setRemoving] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(API_ENDPOINTS.MEDIA.GET_ALBUM(albumId), {
        headers: headers(),
      });
      const a = res.data?.album || res.data;
      const mediaArr = res.data?.media || a.media || [];
      setAlbum({ ...a, media: mediaArr });
      setEditName(a.name || "");
      setEditDesc(a.description || "");
      setEditPrice(String(a.price ?? 0));
      setEditPrivate(!!a.isPrivate);
    } catch {
      setError("Could not load album.");
    } finally {
      setLoading(false);
    }
  }, [albumId]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await axios.put(API_ENDPOINTS.MEDIA.UPDATE_ALBUM(albumId), {
        name: editName.trim(),
        description: editDesc.trim(),
        price: Number(editPrice) || 0,
        isPrivate: editPrivate,
      }, { headers: headers() });
      setAlbum(prev => ({ ...prev, name: editName.trim(), description: editDesc.trim(), price: Number(editPrice) || 0, isPrivate: editPrivate }));
      setEditing(false);
    } catch {
      setError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (mediaId) => {
    setRemoving(mediaId);
    try {
      await axios.delete(API_ENDPOINTS.MEDIA.REMOVE_PHOTO_FROM_ALBUM(albumId, mediaId), { headers: headers() });
      setAlbum(prev => ({ ...prev, media: prev.media.filter(m => (m._id || m) !== mediaId) }));
    } catch {
      setError("Failed to remove photo.");
    } finally {
      setRemoving(null);
    }
  };

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;
    const valid = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (!valid.length) return;

    setUploading(true);
    setUploadProgress(0);
    setError("");
    try {
      const fd = new FormData();
      fd.append("albumId", albumId);
      valid.forEach(f => fd.append("files", f));

      await axios.post(API_ENDPOINTS.MEDIA.BULK_UPLOAD, fd, {
        headers: headers(),
        onUploadProgress: e => setUploadProgress(Math.round((e.loaded * 100) / e.total)),
      });
      await load();
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const nav = "var(--pm-navy, #1A2E3B)";
  const teal = "var(--pm-teal, #6BBDD0)";

  if (loading) {
    return (
      <PhotographerLayout>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <div className="spinner-border" style={{ color: teal }}></div>
        </div>
      </PhotographerLayout>
    );
  }

  if (!album) {
    return (
      <PhotographerLayout>
        <div style={{ textAlign: "center", padding: "5rem 1rem" }}>
          <i className="fas fa-exclamation-circle" style={{ fontSize: "2.5rem", color: "#e85555", marginBottom: "1rem", display: "block" }}></i>
          <h5 style={{ color: nav }}>Album not found</h5>
          <Link to="/photographer/albums" style={{ color: teal }}>Back to My Albums</Link>
        </div>
      </PhotographerLayout>
    );
  }

  const photos = album.media || [];
  const cover = resolveUrl(album.coverImage);

  return (
    <PhotographerLayout>
      <Helmet><title>{album.name} — Relic Snap</title></Helmet>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1rem 4rem" }}>

        {/* Back */}
        <Link to="/photographer/albums" style={{ color: "var(--pm-text-muted)", fontSize: "0.85rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.4rem", marginBottom: "1.25rem" }}>
          <i className="fas fa-arrow-left"></i> My Albums
        </Link>

        {/* Error */}
        {error && (
          <div style={{ background: "rgba(232,85,85,0.08)", border: "1px solid rgba(232,85,85,0.3)", color: "#c0392b", borderRadius: 12, padding: "0.75rem 1rem", marginBottom: "1.25rem", fontSize: "0.88rem" }}>
            <i className="fas fa-exclamation-circle me-2"></i>{error}
          </div>
        )}

        {/* Header card */}
        <div style={{ background: "var(--mc-card-bg, #fff)", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 20px rgba(26,46,59,0.08)", marginBottom: "2rem" }}>
          {/* Cover strip */}
          <div style={{ height: 200, background: cover ? `url(${cover}) center/cover` : "var(--pm-teal-pale, #EEF8FB)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {!cover && <i className="fas fa-images" style={{ fontSize: "3.5rem", color: teal }}></i>}
            <div style={{ position: "absolute", inset: 0, background: "rgba(26,46,59,0.35)" }}></div>
            <div style={{ position: "absolute", bottom: 16, left: 20, right: 20, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ color: "#fff", fontFamily: "var(--font-serif)", fontWeight: 700, margin: 0, fontSize: "clamp(1.2rem,3vw,1.7rem)", textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>{album.name}</h2>
                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.82rem", marginTop: "0.2rem" }}>
                  {photos.length} photo{photos.length !== 1 ? "s" : ""}
                  {album.location && <span style={{ marginLeft: "0.75rem" }}><i className="fas fa-map-marker-alt me-1"></i>{album.location}</span>}
                </div>
              </div>
              <button onClick={() => setEditing(!editing)} style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1.5px solid rgba(255,255,255,0.4)", color: "#fff", borderRadius: 10, padding: "0.45rem 1rem", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer" }}>
                <i className={`fas ${editing ? "fa-times" : "fa-edit"} me-1`}></i>{editing ? "Cancel" : "Edit"}
              </button>
            </div>
          </div>

          {/* Edit form */}
          {editing && (
            <div style={{ padding: "1.5rem", borderTop: "1px solid var(--pm-gray-200, #E8EEF2)" }}>
              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <label style={{ fontWeight: 600, fontSize: "0.83rem", color: nav, marginBottom: "0.3rem", display: "block" }}>Album Name</label>
                  <input className="form-control" value={editName} onChange={e => setEditName(e.target.value)} style={{ borderRadius: 10 }} />
                </div>
                <div className="col-12 col-sm-6">
                  <label style={{ fontWeight: 600, fontSize: "0.83rem", color: nav, marginBottom: "0.3rem", display: "block" }}>Album Price (KES)</label>
                  <input type="number" min="0" className="form-control" value={editPrice} onChange={e => setEditPrice(e.target.value)} style={{ borderRadius: 10 }} />
                </div>
                <div className="col-12">
                  <label style={{ fontWeight: 600, fontSize: "0.83rem", color: nav, marginBottom: "0.3rem", display: "block" }}>Description</label>
                  <textarea className="form-control" rows={2} value={editDesc} onChange={e => setEditDesc(e.target.value)} style={{ borderRadius: 10, resize: "vertical" }} />
                </div>
                <div className="col-12">
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    {[{ val: false, label: "Public", icon: "fa-globe", color: "#4CC9A6" }, { val: true, label: "Private", icon: "fa-lock", color: "#F5A623" }].map(opt => (
                      <div key={String(opt.val)} onClick={() => setEditPrivate(opt.val)} style={{ flex: 1, padding: "0.75rem 1rem", borderRadius: 12, border: `2px solid ${editPrivate === opt.val ? opt.color : "var(--pm-gray-200)"}`, background: editPrivate === opt.val ? opt.color + "12" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <i className={`fas ${opt.icon}`} style={{ color: opt.color }}></i>
                        <span style={{ fontWeight: 600, fontSize: "0.85rem", color: nav }}>{opt.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={handleSave} disabled={saving || !editName.trim()} style={{ marginTop: "1rem", padding: "0.7rem 2rem", background: nav, color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                {saving ? <span className="spinner-border spinner-border-sm"></span> : <><i className="fas fa-check"></i> Save Changes</>}
              </button>
            </div>
          )}

          {/* Stats row */}
          {!editing && (
            <div style={{ padding: "1rem 1.5rem", display: "flex", gap: "1.5rem", flexWrap: "wrap", borderTop: "1px solid var(--pm-gray-200, #E8EEF2)" }}>
              <div style={{ fontSize: "0.82rem", color: "var(--pm-text-muted)" }}>
                <i className="fas fa-tag me-1" style={{ color: teal }}></i>
                {album.price > 0 ? `KES ${Number(album.price).toLocaleString()}` : "Free / Pay per photo"}
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--pm-text-muted)" }}>
                <i className={`fas ${album.isPrivate ? "fa-lock" : "fa-globe"} me-1`} style={{ color: teal }}></i>
                {album.isPrivate ? "Private" : "Public"}
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--pm-text-muted)" }}>
                <i className="fas fa-eye me-1" style={{ color: teal }}></i>
                {album.views || 0} views
              </div>
              {album.albumType && (
                <div style={{ fontSize: "0.82rem", color: "var(--pm-text-muted)", textTransform: "capitalize" }}>
                  <i className="fas fa-folder me-1" style={{ color: teal }}></i>
                  {album.albumType.replace("_", " ")}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Photos section header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <h5 style={{ margin: 0, fontWeight: 700, color: nav, fontFamily: "var(--font-serif)" }}>
            Photos <span style={{ fontWeight: 400, fontSize: "0.85rem", color: "var(--pm-text-muted)" }}>({photos.length})</span>
          </h5>

          {/* Add photos button */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); handleUpload(e.dataTransfer.files); }}
          >
            <input ref={uploadRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => handleUpload(e.target.files)} />
            <button onClick={() => uploadRef.current?.click()} disabled={uploading} style={{ padding: "0.6rem 1.25rem", background: dragging ? teal : nav, color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem", transition: "background 0.2s" }}>
              {uploading
                ? <><span className="spinner-border spinner-border-sm"></span> Uploading… {uploadProgress}%</>
                : <><i className="fas fa-plus"></i> Add Photos</>
              }
            </button>
          </div>
        </div>

        {/* Upload progress bar */}
        {uploading && (
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ background: "var(--pm-gray-200, #E8EEF2)", borderRadius: 999, height: 6 }}>
              <div style={{ width: `${uploadProgress}%`, height: "100%", background: teal, borderRadius: 999, transition: "width 0.3s" }} />
            </div>
          </div>
        )}

        {/* Photo grid */}
        {photos.length === 0 ? (
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); handleUpload(e.dataTransfer.files); }}
            onClick={() => uploadRef.current?.click()}
            style={{ border: `2px dashed ${dragging ? teal : "var(--pm-gray-200, #E8EEF2)"}`, borderRadius: 20, padding: "5rem 1rem", textAlign: "center", cursor: "pointer", background: dragging ? "var(--pm-teal-pale, #EEF8FB)" : "transparent", transition: "all 0.2s" }}
          >
            <i className="fas fa-cloud-upload-alt" style={{ fontSize: "3rem", color: dragging ? teal : "var(--pm-gray-200)", display: "block", marginBottom: "1rem" }}></i>
            <h6 style={{ color: nav, fontWeight: 700 }}>No photos yet</h6>
            <p style={{ color: "var(--pm-text-muted)", fontSize: "0.88rem", margin: 0 }}>Click or drag & drop to add photos to this album</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem" }}>
            {photos.map(photo => {
              const id = photo._id || photo;
              const src = typeof photo === "object"
                ? (resolveUrl(photo.watermarkedUrl) || resolveUrl(photo.fileUrl) || resolveUrl(photo.imageUrl))
                : null;
              const title = typeof photo === "object" ? (photo.title || "Untitled") : "";
              const price = typeof photo === "object" ? photo.price : 0;

              return (
                <div key={id} style={{ borderRadius: 14, overflow: "hidden", border: "1.5px solid var(--pm-gray-200, #E8EEF2)", background: "var(--mc-card-bg, #fff)", position: "relative", boxShadow: "0 1px 8px rgba(26,46,59,0.06)" }}>
                  {/* Image */}
                  <div style={{ height: 160, background: "var(--pm-teal-pale, #EEF8FB)", overflow: "hidden", position: "relative" }}>
                    {src
                      ? <img src={src} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <i className="fas fa-image" style={{ fontSize: "2rem", color: teal }}></i>
                        </div>
                    }
                    {/* Remove button */}
                    <button
                      onClick={() => handleRemove(id)}
                      disabled={removing === id}
                      style={{ position: "absolute", top: 8, right: 8, background: "rgba(232,85,85,0.85)", color: "#fff", border: "none", borderRadius: "50%", width: 28, height: 28, fontSize: "0.72rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}
                    >
                      {removing === id
                        ? <span className="spinner-border spinner-border-sm" style={{ width: 12, height: 12, borderWidth: 2 }}></span>
                        : <i className="fas fa-times"></i>
                      }
                    </button>
                  </div>

                  {/* Info */}
                  <div style={{ padding: "0.6rem 0.75rem" }}>
                    <div style={{ fontWeight: 600, fontSize: "0.8rem", color: nav, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
                    <div style={{ fontSize: "0.75rem", color: price > 0 ? teal : "var(--pm-text-muted)", fontWeight: price > 0 ? 700 : 400 }}>
                      {price > 0 ? `KES ${Number(price).toLocaleString()}` : "Free"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PhotographerLayout>
  );
}
