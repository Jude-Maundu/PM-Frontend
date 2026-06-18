import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../../api/apiConfig";
import PhotographerLayout from "./PhotographerLayout";
import { Helmet } from "react-helmet-async";
import MediaEditingStudio from "./MediaEditingStudio";

const token = () => localStorage.getItem("token");
const headers = () => ({ Authorization: `Bearer ${token()}` });

function resolveUrl(url) {
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("data:") || url.startsWith("blob:")) return url;
  return `${process.env.REACT_APP_API_URL || "https://pm-backend-f3b6.onrender.com"}/${url.replace(/^\//, "")}`;
}

function getPhotoPreview(photo) {
  return resolveUrl(photo?.watermarkedUrl) || resolveUrl(photo?.fileUrl) || resolveUrl(photo?.imageUrl);
}

function PhotoActionsModal({
  photo,
  albumName,
  renameValue,
  onRenameChange,
  onClose,
  onRename,
  onSetCover,
  onDelete,
  onEdit,
  busyAction,
}) {
  if (!photo) return null;

  const preview = getPhotoPreview(photo);
  const isVideo = photo.mediaType === "video";
  const isBusy = Boolean(busyAction);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1300,
        background: "rgba(8, 17, 24, 0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(94vw, 760px)",
          maxHeight: "92vh",
          overflowY: "auto",
          background: "var(--mc-card-bg, #fff)",
          borderRadius: 24,
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.32)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "0",
          }}
        >
          <div style={{ background: "#e8eef2", minHeight: 280, position: "relative" }}>
            {preview ? (
              isVideo ? (
                <video src={preview} controls style={{ width: "100%", height: "100%", minHeight: 280, objectFit: "contain", background: "#08131c" }} />
              ) : (
                <>
                  <img
                    src={preview}
                    alt=""
                    aria-hidden="true"
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "blur(18px)", transform: "scale(1.08)", opacity: 0.42 }}
                  />
                  <img
                    src={preview}
                    alt={photo.title || "Album photo"}
                    style={{ position: "relative", zIndex: 1, width: "100%", height: "100%", minHeight: 280, objectFit: "contain", padding: "0.85rem" }}
                  />
                </>
              )
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 280 }}>
                <i className={`fas ${isVideo ? "fa-film" : "fa-image"}`} style={{ fontSize: "3rem", color: "var(--pm-teal, #6BBDD0)" }}></i>
              </div>
            )}
          </div>

          <div style={{ padding: "1.25rem 1.25rem 1.4rem" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem", marginBottom: "1rem" }}>
              <div>
                <div style={{ fontSize: "0.74rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--pm-text-muted)" }}>
                  {albumName}
                </div>
                <h4 style={{ margin: "0.2rem 0 0", color: "var(--pm-navy, #1A2E3B)", fontFamily: "var(--font-serif)" }}>
                  Photo Options
                </h4>
              </div>
              <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--pm-text-muted)", fontSize: "1.1rem", cursor: "pointer" }}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--pm-navy, #1A2E3B)", marginBottom: "0.4rem" }}>
                Rename photo
              </label>
              <input
                value={renameValue}
                onChange={(e) => onRenameChange(e.target.value)}
                placeholder="Enter photo name"
                className="form-control"
                style={{ borderRadius: 12 }}
              />
            </div>

            <div style={{ display: "grid", gap: "0.7rem" }}>
              <button
                onClick={onEdit}
                disabled={isBusy}
                style={{ padding: "0.78rem 1rem", borderRadius: 14, border: "none", background: "var(--pm-teal, #6BBDD0)", color: "#072030", fontWeight: 800, cursor: "pointer" }}
              >
                <i className="fas fa-sliders me-2"></i>Edit Photo
              </button>
              <button
                onClick={onRename}
                disabled={isBusy || !renameValue.trim()}
                style={{ padding: "0.78rem 1rem", borderRadius: 14, border: "none", background: "var(--pm-navy, #1A2E3B)", color: "#fff", fontWeight: 700, cursor: "pointer" }}
              >
                {busyAction === "rename" ? <span className="spinner-border spinner-border-sm"></span> : <><i className="fas fa-pen me-2"></i>Rename Photo</>}
              </button>

              <button
                onClick={onSetCover}
                disabled={isBusy || !preview}
                style={{ padding: "0.78rem 1rem", borderRadius: 14, border: "1px solid rgba(107,189,208,0.35)", background: "rgba(107,189,208,0.12)", color: "var(--pm-teal-deep, #1A6B8A)", fontWeight: 700, cursor: "pointer" }}
              >
                {busyAction === "cover" ? <span className="spinner-border spinner-border-sm"></span> : <><i className="fas fa-image me-2"></i>Set As Album Cover</>}
              </button>

              <button
                onClick={onDelete}
                disabled={isBusy}
                style={{ padding: "0.78rem 1rem", borderRadius: 14, border: "1px solid rgba(232,85,85,0.28)", background: "rgba(232,85,85,0.08)", color: "#d64343", fontWeight: 700, cursor: "pointer" }}
              >
                {busyAction === "delete" ? <span className="spinner-border spinner-border-sm"></span> : <><i className="fas fa-trash me-2"></i>Delete From Album</>}
              </button>
            </div>

            <p style={{ margin: "1rem 0 0", fontSize: "0.78rem", lineHeight: 1.55, color: "var(--pm-text-muted)" }}>
              Deleting here removes the item from this album view. You can still keep the rest of the album untouched.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AlbumManage() {
  const { albumId } = useParams();
  const uploadRef = useRef();
  const coverDragRef = useRef();

  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPrice, setEditPrice] = useState("0");
  const [editPrivate, setEditPrivate] = useState(false);
  const [editCoverPosition, setEditCoverPosition] = useState({ x: 50, y: 50 });
  const [saving, setSaving] = useState(false);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragging, setDragging] = useState(false);

  // Remove state
  const [removing, setRemoving] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [busyAction, setBusyAction] = useState("");
  const [selectedMediaIds, setSelectedMediaIds] = useState([]);
  const [editingPhoto, setEditingPhoto] = useState(null);

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
      setEditCoverPosition(a.coverImagePosition || { x: 50, y: 50 });
    } catch {
      setError("Could not load album.");
    } finally {
      setLoading(false);
    }
  }, [albumId]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (Number(editPrice) <= 0) {
      setError("Album price must be greater than 0.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await axios.put(API_ENDPOINTS.MEDIA.UPDATE_ALBUM(albumId), {
        name: editName.trim(),
        description: editDesc.trim(),
        price: Number(editPrice) || 0,
        isPrivate: editPrivate,
        coverImagePosition: editCoverPosition,
      }, { headers: headers() });
      setAlbum(prev => ({ ...prev, name: editName.trim(), description: editDesc.trim(), price: Number(editPrice) || 0, isPrivate: editPrivate, coverImagePosition: editCoverPosition }));
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
      setAlbum(prev => {
        const remaining = prev.media.filter(m => (m._id || m) !== mediaId);
        const removedWasCover = selectedPhoto && (selectedPhoto._id || selectedPhoto) === mediaId && prev.coverImage && prev.media.some(item => {
          const itemId = item._id || item;
          if (String(itemId) !== String(mediaId) || typeof item !== "object") return false;
          return getPhotoPreview(item) === prev.coverImage || resolveUrl(prev.coverImage) === getPhotoPreview(item);
        });

        return {
          ...prev,
          media: remaining,
          coverImage: removedWasCover ? (getPhotoPreview(remaining[0]) || "") : prev.coverImage,
        };
      });
      return true;
    } catch {
      setError("Failed to remove photo.");
      return false;
    } finally {
      setRemoving(null);
    }
  };

  const openPhotoActions = (photo) => {
    setSelectedPhoto(photo);
    setRenameValue(photo?.title || "");
    setBusyAction("");
  };

  const closePhotoActions = () => {
    if (busyAction) return;
    setSelectedPhoto(null);
    setRenameValue("");
  };

  const handleRenamePhoto = async () => {
    if (!selectedPhoto?._id || !renameValue.trim()) return;
    setBusyAction("rename");
    setError("");
    try {
      const res = await axios.put(
        API_ENDPOINTS.MEDIA.UPDATE(selectedPhoto._id),
        { title: renameValue.trim() },
        { headers: headers() }
      );
      const updated = res.data;
      setAlbum(prev => ({
        ...prev,
        media: prev.media.map(item => (item._id === selectedPhoto._id ? { ...item, ...updated, title: updated?.title || renameValue.trim() } : item)),
      }));
      setSelectedPhoto(prev => prev ? { ...prev, title: updated?.title || renameValue.trim() } : prev);
    } catch {
      setError("Failed to rename photo.");
    } finally {
      setBusyAction("");
    }
  };

  const handleSetAlbumCover = async () => {
    if (!selectedPhoto?._id) return;
    const nextCover = getPhotoPreview(selectedPhoto);
    if (!nextCover) return;

    setBusyAction("cover");
    setError("");
    try {
      await axios.put(
        API_ENDPOINTS.MEDIA.UPDATE_ALBUM(albumId),
        { coverImage: nextCover },
        { headers: headers() }
      );
      setAlbum(prev => ({ ...prev, coverImage: nextCover }));
    } catch {
      setError("Failed to update album cover.");
    } finally {
      setBusyAction("");
    }
  };

  const handleDeleteFromModal = async () => {
    if (!selectedPhoto?._id) return;
    setBusyAction("delete");
    const removed = await handleRemove(selectedPhoto._id);
    setBusyAction("");
    if (removed) {
      setSelectedPhoto(null);
      setRenameValue("");
    }
  };

  const toggleSelectedMedia = (mediaId) => {
    setSelectedMediaIds((prev) => (
      prev.includes(mediaId) ? prev.filter((id) => id !== mediaId) : [...prev, mediaId]
    ));
  };

  const openEditor = () => {
    if (!selectedPhoto) return;
    setEditingPhoto(selectedPhoto);
    setSelectedPhoto(null);
  };

  const handlePublishEditedMedia = async ({ blob, applyToSelected }) => {
    const targetIds = applyToSelected && selectedMediaIds.length > 0
      ? selectedMediaIds
      : [editingPhoto?._id].filter(Boolean);

    for (const targetId of targetIds) {
      const formData = new FormData();
      const ext = blob.type === "image/png" ? "png" : blob.type === "image/webp" ? "webp" : "jpg";
      formData.append("file", new File([blob], `${targetId}-edited.${ext}`, { type: blob.type || "image/jpeg" }));
      await axios.put(API_ENDPOINTS.MEDIA.UPDATE(targetId), formData, {
        headers: { ...headers(), "Content-Type": "multipart/form-data" },
      });
    }

    await load();
    setEditingPhoto(null);
  };

  const updateCoverPositionFromPointer = useCallback((event) => {
    const rect = coverDragRef.current?.getBoundingClientRect?.();
    if (!rect) return;
    const point = "touches" in event ? event.touches[0] : event;
    const x = ((point.clientX - rect.left) / rect.width) * 100;
    const y = ((point.clientY - rect.top) / rect.height) * 100;
    setEditCoverPosition({
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    });
  }, []);

  const beginCoverDrag = useCallback((event) => {
    event.preventDefault();
    updateCoverPositionFromPointer(event);

    const move = (moveEvent) => updateCoverPositionFromPointer(moveEvent);
    const stop = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", stop);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", stop);
  }, [updateCoverPositionFromPointer]);

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;
    const valid = Array.from(files).filter(f => f.type.startsWith("image/") || f.type.startsWith("video/"));
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
          <div
            ref={coverDragRef}
            onMouseDown={editing ? beginCoverDrag : undefined}
            onTouchStart={editing ? beginCoverDrag : undefined}
            style={{ height: 220, background: cover ? "#dfe8ee" : "var(--pm-teal-pale, #EEF8FB)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", cursor: editing ? "grab" : "default" }}
          >
            {cover ? (
              <>
                <img
                  src={cover}
                  alt=""
                  aria-hidden="true"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: `${album.coverImagePosition?.x ?? 50}% ${album.coverImagePosition?.y ?? 50}%`, filter: "blur(18px)", transform: "scale(1.06)", opacity: 0.45 }}
                />
                <img
                  src={cover}
                  alt={album.name}
                  style={{ position: "relative", zIndex: 1, width: "100%", height: "100%", objectFit: "cover", objectPosition: `${album.coverImagePosition?.x ?? 50}% ${album.coverImagePosition?.y ?? 50}%`, padding: "0.35rem" }}
                />
              </>
            ) : <i className="fas fa-images" style={{ fontSize: "3.5rem", color: teal, position: "relative", zIndex: 1 }}></i>}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(26,46,59,0.08), rgba(26,46,59,0.42))" }}></div>
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
                  <input type="number" min="1" className="form-control" value={editPrice} onChange={e => setEditPrice(e.target.value)} style={{ borderRadius: 10 }} />
                </div>
                <div className="col-12">
                  <label style={{ fontWeight: 600, fontSize: "0.83rem", color: nav, marginBottom: "0.3rem", display: "block" }}>Description</label>
                  <textarea className="form-control" rows={2} value={editDesc} onChange={e => setEditDesc(e.target.value)} style={{ borderRadius: 10, resize: "vertical" }} />
                </div>
                <div className="col-12">
                  <label style={{ fontWeight: 600, fontSize: "0.83rem", color: nav, marginBottom: "0.55rem", display: "block" }}>Cover Position</label>
                  <div style={{ background: "var(--pm-gray-100, #F2F5F7)", borderRadius: 12, padding: "0.9rem 1rem" }}>
                    <div style={{ fontSize: "0.78rem", color: "var(--pm-text-muted)" }}>Drag the cover preview above to choose the visible part of the image.</div>
                  </div>
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
                {`KES ${Number(album.price).toLocaleString()}`}
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
            Media <span style={{ fontWeight: 400, fontSize: "0.85rem", color: "var(--pm-text-muted)" }}>({photos.length})</span>
          </h5>

          {/* Add photos button */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); handleUpload(e.dataTransfer.files); }}
          >
            <input ref={uploadRef} type="file" accept="image/*,video/*" multiple style={{ display: "none" }} onChange={e => handleUpload(e.target.files)} />
            <button onClick={() => uploadRef.current?.click()} disabled={uploading} style={{ padding: "0.6rem 1.25rem", background: dragging ? teal : nav, color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem", transition: "background 0.2s" }}>
              {uploading
                ? <><span className="spinner-border spinner-border-sm"></span> Uploading… {uploadProgress}%</>
                : <><i className="fas fa-plus"></i> Add Media</>
              }
            </button>
          </div>
        </div>

        {selectedMediaIds.length > 0 && (
          <div style={{ marginBottom: "1rem", background: "rgba(107,189,208,0.08)", border: "1px solid rgba(107,189,208,0.18)", borderRadius: 14, padding: "0.75rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
            <div style={{ fontSize: "0.85rem", color: nav, fontWeight: 600 }}>
              {selectedMediaIds.length} photo{selectedMediaIds.length !== 1 ? "s" : ""} selected for batch editing
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => {
                  const current = photos.find((item) => selectedMediaIds.includes(item._id));
                  if (current) setEditingPhoto(current);
                }}
                style={{ padding: "0.55rem 1rem", background: nav, color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}
              >
                <i className="fas fa-sliders me-2"></i>Batch Edit
              </button>
              <button
                onClick={() => setSelectedMediaIds([])}
                style={{ padding: "0.55rem 1rem", background: "transparent", color: "var(--pm-text-muted)", border: "1px solid var(--pm-gray-200)", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}
              >
                Clear
              </button>
            </div>
          </div>
        )}

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
            <h6 style={{ color: nav, fontWeight: 700 }}>No media yet</h6>
            <p style={{ color: "var(--pm-text-muted)", fontSize: "0.88rem", margin: 0 }}>Click or drag & drop to add photos or videos to this album</p>
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
                <div
                  key={id}
                  onClick={() => typeof photo === "object" && openPhotoActions(photo)}
                  style={{ borderRadius: 14, overflow: "hidden", border: "1.5px solid var(--pm-gray-200, #E8EEF2)", background: "var(--mc-card-bg, #fff)", position: "relative", boxShadow: "0 1px 8px rgba(26,46,59,0.06)", cursor: typeof photo === "object" ? "pointer" : "default" }}
                >
                  {/* Thumbnail */}
                  <div style={{ height: 160, background: "var(--pm-teal-pale, #EEF8FB)", overflow: "hidden", position: "relative" }}>
                    {typeof photo === "object" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectedMedia(id);
                        }}
                        style={{
                          position: "absolute",
                          top: 8,
                          left: 8,
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          border: selectedMediaIds.includes(id) ? "1px solid var(--pm-teal, #6BBDD0)" : "1px solid rgba(255,255,255,0.4)",
                          background: selectedMediaIds.includes(id) ? "var(--pm-teal, #6BBDD0)" : "rgba(11,23,33,0.45)",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          zIndex: 3,
                        }}
                      >
                        <i className={`fas ${selectedMediaIds.includes(id) ? "fa-check" : "fa-plus"}`}></i>
                      </button>
                    )}
                    {src
                      ? photo.mediaType === "video"
                        ? <video src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted playsInline preload="metadata" />
                        : <img src={src} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <i className={`fas ${photo.mediaType === "video" ? "fa-film" : "fa-image"}`} style={{ fontSize: "2rem", color: teal }}></i>
                        </div>
                    }
                    {photo.mediaType === "video" && src && (
                      <div style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(0,0,0,0.6)", borderRadius: 6, padding: "2px 7px", fontSize: "0.68rem", color: "#fff" }}>
                        <i className="fas fa-play me-1"></i>Video
                      </div>
                    )}
                    {/* Remove button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(id);
                      }}
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
                    <div style={{ fontSize: "0.72rem", color: "var(--pm-text-muted)", marginTop: "0.35rem" }}>
                      Click photo for options
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <PhotoActionsModal
        photo={selectedPhoto}
        albumName={album.name}
        renameValue={renameValue}
        onRenameChange={setRenameValue}
        onClose={closePhotoActions}
        onRename={handleRenamePhoto}
        onSetCover={handleSetAlbumCover}
        onDelete={handleDeleteFromModal}
        onEdit={openEditor}
        busyAction={busyAction}
      />
      {editingPhoto && (
        <MediaEditingStudio
          photo={editingPhoto}
          albumName={album.name}
          selectedCount={selectedMediaIds.length || 1}
          onClose={() => setEditingPhoto(null)}
          onPublish={handlePublishEditedMedia}
        />
      )}
    </PhotographerLayout>
  );
}
