import React, { useState, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS, API_BASE_URL } from "../../../api/apiConfig";
import PhotographerLayout from "./PhotographerLayout";
import { Helmet } from "react-helmet-async";

const ALBUM_TYPES = [
  { value: "event",          icon: "fa-calendar-star", label: "Event",          desc: "Wedding, graduation, marathon…" },
  { value: "personal",       icon: "fa-images",        label: "Personal",       desc: "Aesthetic, portfolio, travel…" },
  { value: "private_client", icon: "fa-lock",          label: "Private Client", desc: "Hired shoot, hidden from public" },
];

const EVENT_TYPES = [
  { value: "wedding",    icon: "fa-rings-wedding",  label: "Wedding",    color: "#F06B8D" },
  { value: "graduation", icon: "fa-graduation-cap", label: "Graduation", color: "#6BBDD0" },
  { value: "birthday",   icon: "fa-birthday-cake",  label: "Birthday",   color: "#F5A623" },
  { value: "marathon",   icon: "fa-running",        label: "Marathon",   color: "#4CC9A6" },
  { value: "corporate",  icon: "fa-briefcase",      label: "Corporate",  color: "#9D7FEB" },
  { value: "concert",    icon: "fa-music",          label: "Concert",    color: "#FF6B6B" },
  { value: "portrait",   icon: "fa-user-circle",    label: "Portrait",   color: "#1A2E3B" },
  { value: "wildlife",   icon: "fa-paw",            label: "Wildlife",   color: "#4CC9A6" },
  { value: "landscape",  icon: "fa-mountain",       label: "Landscape",  color: "#6BBDD0" },
  { value: "sports",     icon: "fa-trophy",         label: "Sports",     color: "#F5A623" },
  { value: "other",      icon: "fa-camera",         label: "Other",      color: "#6A8895" },
];

const STEPS = ["Album Details", "Upload Photos", "Pricing & Privacy", "Review"];

const token = () => localStorage.getItem("token");
const headers = () => ({ Authorization: `Bearer ${token()}` });

export default function CreateAlbum() {
  const navigate = useNavigate();
  const coverRef  = useRef();
  const photosRef = useRef();
  const dropRef   = useRef();

  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [albumId, setAlbumId] = useState(null);

  // Step 1 — details
  const [name, setName]             = useState("");
  const [description, setDesc]      = useState("");
  const [albumType, setAlbumType]   = useState("personal");
  const [eventType, setEventType]   = useState("other");
  const [location, setLocation]     = useState("");
  const [eventDate, setEventDate]   = useState("");
  const [clientName, setClientName] = useState("");
  const [coverFile, setCoverFile]   = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [tags, setTags]             = useState("");

  // Step 2 — photos
  const [photos, setPhotos]     = useState([]); // [{file, preview, price, title}]
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Step 3 — pricing / privacy
  const [albumPrice, setAlbumPrice] = useState("0");
  const [isPrivate, setIsPrivate]   = useState(false);
  const [shareLink, setShareLink]   = useState("");

  const handleCoverChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setCoverFile(f);
    setCoverPreview(URL.createObjectURL(f));
  };

  const addPhotos = useCallback((files) => {
    const valid = Array.from(files).filter(f => f.type.startsWith("image/"));
    const newPhotos = valid.map(f => ({
      file: f,
      preview: URL.createObjectURL(f),
      title: f.name.replace(/\.[^/.]+$/, ""),
      price: "0",
    }));
    setPhotos(prev => [...prev, ...newPhotos]);
  }, []);

  const handlePhotoDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    addPhotos(e.dataTransfer.files);
  }, [addPhotos]);

  const removePhoto = (idx) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const updatePhotoField = (idx, field, value) => {
    setPhotos(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };

  const setAllPrices = (price) => {
    setPhotos(prev => prev.map(p => ({ ...p, price })));
  };

  // Step 1 → Create album on backend
  const handleCreateAlbum = async () => {
    if (!name.trim()) { setError("Album name is required"); return; }
    setLoading(true); setError("");
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("description", description.trim());
      fd.append("albumType", albumType);
      fd.append("eventType", eventType);
      fd.append("location", location.trim());
      fd.append("clientName", clientName.trim());
      fd.append("tags", tags.split(",").map(t => t.trim()).filter(Boolean).join(","));
      if (eventDate) fd.append("eventDate", eventDate);
      if (coverFile) fd.append("coverImage", coverFile);

      const res = await axios.post(API_ENDPOINTS.MEDIA.CREATE_ALBUM, fd, { headers: headers() });
      setAlbumId(res.data.album._id);
      setStep(1);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to create album");
    } finally {
      setLoading(false);
    }
  };

  // Step 2 → Bulk upload photos to album
  const handleUploadPhotos = async () => {
    if (!albumId) return;
    if (photos.length === 0) { setStep(2); return; }

    setUploading(true); setUploadProgress(0); setError("");
    try {
      const fd = new FormData();
      fd.append("albumId", albumId);
      photos.forEach((p, i) => {
        fd.append("files", p.file);
        fd.append(`title_${i}`, p.title);
        fd.append(`price_${i}`, p.price || "0");
      });

      await axios.post(API_ENDPOINTS.MEDIA.BULK_UPLOAD, fd, {
        headers: headers(),
        onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / e.total)),
      });
      setStep(2);
    } catch (e) {
      setError(e.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Step 3 → Apply pricing and privacy settings
  const handleApplySettings = async () => {
    if (!albumId) return;
    setLoading(true); setError("");
    try {
      await axios.put(API_ENDPOINTS.MEDIA.UPDATE_ALBUM(albumId), {
        price: Number(albumPrice) || 0,
        isPrivate,
      }, { headers: headers() });

      if (isPrivate) {
        // Generate share link
        const res = await axios.post(
          `${API_BASE_URL}/media/album/${albumId}/access`,
          { expiresInHours: 720, maxAccess: 500, description: `Private link for ${name}` },
          { headers: headers() }
        );
        setShareLink(res.data.shareLink || "");
      }
      setStep(3);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const nav = "var(--pm-navy)";
  const teal = "var(--pm-teal, #6BBDD0)";

  return (
    <PhotographerLayout>
      <Helmet><title>Create Album — Relic Snap</title></Helmet>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "2rem 1rem 4rem" }}>

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <Link to="/photographer/albums" style={{ color: "var(--pm-text-muted)", fontSize: "0.85rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.4rem", marginBottom: "1rem" }}>
            <i className="fas fa-arrow-left"></i> My Albums
          </Link>
          <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "clamp(1.6rem,3vw,2rem)", color: nav, margin: 0 }}>
            Create New Album
          </h1>
          <p style={{ color: "var(--pm-text-muted)", marginTop: "0.3rem", fontSize: "0.9rem" }}>
            Organise your photos into a beautiful, shareable album.
          </p>
        </div>

        {/* Step progress */}
        <div style={{ display: "flex", gap: 0, marginBottom: "2.5rem", background: "var(--pm-gray-200, #E8EEF2)", borderRadius: 999, padding: "4px", overflow: "hidden" }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{
              flex: 1, textAlign: "center", padding: "0.55rem 0.5rem", borderRadius: 999, fontSize: "0.8rem", fontWeight: 600,
              background: i === step ? nav : "transparent",
              color: i === step ? "#fff" : (i < step ? teal : "var(--pm-text-muted)"),
              transition: "all 0.3s",
            }}>
              {i < step ? <i className="fas fa-check me-1"></i> : `${i + 1}. `}{s}
            </div>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <div style={{ background: "rgba(232,85,85,0.08)", border: "1px solid rgba(232,85,85,0.3)", color: "#c0392b", borderRadius: 12, padding: "0.75rem 1rem", marginBottom: "1.5rem", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        {/* ── STEP 0: Album Details ── */}
        {step === 0 && (
          <div style={{ background: "var(--mc-card-bg, #fff)", borderRadius: 20, padding: "2rem", boxShadow: "0 2px 20px rgba(26,46,59,0.07)" }}>
            {/* Cover image */}
            <div
              onClick={() => coverRef.current?.click()}
              style={{ height: 180, borderRadius: 16, border: `2px dashed ${coverPreview ? "transparent" : "var(--pm-gray-200)"}`, background: coverPreview ? `url(${coverPreview}) center/cover` : "var(--pm-teal-pale, #EEF8FB)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", marginBottom: "1.5rem", position: "relative", overflow: "hidden" }}
            >
              {!coverPreview && <>
                <i className="fas fa-image" style={{ fontSize: "2.5rem", color: teal, marginBottom: "0.5rem" }}></i>
                <span style={{ color: "var(--pm-text-muted)", fontSize: "0.88rem" }}>Click to set a cover photo</span>
              </>}
              {coverPreview && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(26,46,59,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#fff", fontSize: "0.85rem", fontWeight: 600 }}><i className="fas fa-edit me-1"></i>Change cover</span>
                </div>
              )}
              <input ref={coverRef} type="file" accept="image/*" onChange={handleCoverChange} style={{ display: "none" }} />
            </div>

            <div className="row g-3">
              <div className="col-12">
                <label style={{ fontWeight: 600, fontSize: "0.85rem", color: nav, marginBottom: "0.4rem", display: "block" }}>Album Name *</label>
                <input className="form-control" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sarah & Mike's Wedding" style={{ borderRadius: 10 }} />
              </div>
              <div className="col-12">
                <label style={{ fontWeight: 600, fontSize: "0.85rem", color: nav, marginBottom: "0.4rem", display: "block" }}>Description</label>
                <textarea className="form-control" rows={3} value={description} onChange={e => setDesc(e.target.value)} placeholder="Tell people what this album is about…" style={{ borderRadius: 10, resize: "vertical" }} />
              </div>
            </div>

            {/* Album type */}
            <div style={{ marginTop: "1.5rem" }}>
              <label style={{ fontWeight: 600, fontSize: "0.85rem", color: nav, marginBottom: "0.75rem", display: "block" }}>Album Type</label>
              <div className="row g-3">
                {ALBUM_TYPES.map(t => (
                  <div key={t.value} className="col-12 col-sm-4">
                    <div onClick={() => setAlbumType(t.value)} style={{ padding: "1rem", borderRadius: 14, border: `2px solid ${albumType === t.value ? teal : "var(--pm-gray-200)"}`, background: albumType === t.value ? "var(--pm-teal-pale, #EEF8FB)" : "#fff", cursor: "pointer", transition: "all 0.2s", textAlign: "center" }}>
                      <i className={`fas ${t.icon}`} style={{ fontSize: "1.4rem", color: albumType === t.value ? teal : "var(--pm-text-muted)", display: "block", marginBottom: "0.4rem" }}></i>
                      <div style={{ fontWeight: 700, fontSize: "0.9rem", color: albumType === t.value ? nav : "var(--pm-text-muted)" }}>{t.label}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--pm-text-muted)" }}>{t.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Event type (only for event albums) */}
            {albumType === "event" && (
              <div style={{ marginTop: "1.5rem" }}>
                <label style={{ fontWeight: 600, fontSize: "0.85rem", color: nav, marginBottom: "0.75rem", display: "block" }}>Event Category</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {EVENT_TYPES.map(et => (
                    <button key={et.value} onClick={() => setEventType(et.value)} style={{ padding: "0.4rem 0.9rem", borderRadius: 999, border: `1.5px solid ${eventType === et.value ? et.color : "var(--pm-gray-200)"}`, background: eventType === et.value ? et.color + "18" : "#fff", color: eventType === et.value ? et.color : "var(--pm-text-muted)", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                      <i className={`fas ${et.icon}`}></i> {et.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="row g-3 mt-1">
              <div className="col-12 col-sm-6">
                <label style={{ fontWeight: 600, fontSize: "0.85rem", color: nav, marginBottom: "0.4rem", display: "block" }}>Location</label>
                <input className="form-control" value={location} onChange={e => setLocation(e.target.value)} placeholder="Nairobi, Kenya" style={{ borderRadius: 10 }} />
              </div>
              {albumType === "event" && (
                <div className="col-12 col-sm-6">
                  <label style={{ fontWeight: 600, fontSize: "0.85rem", color: nav, marginBottom: "0.4rem", display: "block" }}>Event Date</label>
                  <input type="date" className="form-control" value={eventDate} onChange={e => setEventDate(e.target.value)} style={{ borderRadius: 10 }} />
                </div>
              )}
              {albumType === "private_client" && (
                <div className="col-12 col-sm-6">
                  <label style={{ fontWeight: 600, fontSize: "0.85rem", color: nav, marginBottom: "0.4rem", display: "block" }}>Client Name</label>
                  <input className="form-control" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="e.g. Wanjiku Kamau" style={{ borderRadius: 10 }} />
                </div>
              )}
              <div className="col-12">
                <label style={{ fontWeight: 600, fontSize: "0.85rem", color: nav, marginBottom: "0.4rem", display: "block" }}>Tags <span style={{ fontWeight: 400, color: "var(--pm-text-muted)" }}>(comma separated)</span></label>
                <input className="form-control" value={tags} onChange={e => setTags(e.target.value)} placeholder="nature, nairobi, outdoor" style={{ borderRadius: 10 }} />
              </div>
            </div>

            <button onClick={handleCreateAlbum} disabled={loading || !name.trim()} style={{ marginTop: "2rem", width: "100%", padding: "0.85rem", background: nav, color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem" }}>
              {loading ? <span className="spinner-border spinner-border-sm"></span> : <><i className="fas fa-arrow-right"></i> Continue to Photos</>}
            </button>
          </div>
        )}

        {/* ── STEP 1: Upload Photos ── */}
        {step === 1 && (
          <div style={{ background: "var(--mc-card-bg, #fff)", borderRadius: 20, padding: "2rem", boxShadow: "0 2px 20px rgba(26,46,59,0.07)" }}>
            {/* Drop zone */}
            <div
              ref={dropRef}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handlePhotoDrop}
              onClick={() => photosRef.current?.click()}
              style={{ border: `2px dashed ${dragging ? teal : "var(--pm-gray-200)"}`, borderRadius: 16, padding: "3rem 1rem", textAlign: "center", cursor: "pointer", background: dragging ? "var(--pm-teal-pale, #EEF8FB)" : "var(--pm-white, #fff)", transition: "all 0.2s", marginBottom: "1.5rem" }}
            >
              <i className="fas fa-cloud-upload-alt" style={{ fontSize: "3rem", color: dragging ? teal : "var(--pm-gray-200)", display: "block", marginBottom: "0.75rem" }}></i>
              <div style={{ fontWeight: 700, fontSize: "1rem", color: nav }}>Drag & drop photos here</div>
              <div style={{ color: "var(--pm-text-muted)", fontSize: "0.88rem", marginTop: "0.3rem" }}>or click to browse your device</div>
              <input ref={photosRef} type="file" accept="image/*" multiple onChange={e => addPhotos(e.target.files)} style={{ display: "none" }} />
            </div>

            {photos.length > 0 && (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
                  <div style={{ fontWeight: 700, color: nav }}>{photos.length} photo{photos.length !== 1 ? "s" : ""} selected</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--pm-text-muted)" }}>Set all prices:</span>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      {["0", "50", "100", "200"].map(p => (
                        <button key={p} onClick={() => setAllPrices(p)} style={{ padding: "0.3rem 0.7rem", borderRadius: 999, border: "1.5px solid var(--pm-gray-200)", background: "#fff", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", color: nav }}>
                          {p === "0" ? "Free" : `KES ${p}`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem", maxHeight: 420, overflowY: "auto", paddingRight: "0.25rem" }}>
                  {photos.map((ph, idx) => (
                    <div key={idx} style={{ borderRadius: 12, overflow: "hidden", border: "1.5px solid var(--pm-gray-200)", background: "#fff", position: "relative" }}>
                      <img src={ph.preview} alt={ph.title} style={{ width: "100%", height: 110, objectFit: "cover", display: "block" }} />
                      <button onClick={() => removePhoto(idx)} style={{ position: "absolute", top: 6, right: 6, background: "rgba(26,46,59,0.7)", color: "#fff", border: "none", borderRadius: "50%", width: 24, height: 24, fontSize: "0.7rem", cursor: "pointer" }}>
                        <i className="fas fa-times"></i>
                      </button>
                      <div style={{ padding: "0.5rem" }}>
                        <input value={ph.title} onChange={e => updatePhotoField(idx, "title", e.target.value)} style={{ width: "100%", border: "1px solid var(--pm-gray-200)", borderRadius: 6, padding: "0.25rem 0.4rem", fontSize: "0.75rem", color: nav }} placeholder="Title" />
                        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.3rem" }}>
                          <span style={{ fontSize: "0.72rem", color: "var(--pm-text-muted)", flexShrink: 0 }}>KES</span>
                          <input type="number" min="0" value={ph.price} onChange={e => updatePhotoField(idx, "price", e.target.value)} style={{ width: "100%", border: "1px solid var(--pm-gray-200)", borderRadius: 6, padding: "0.2rem 0.35rem", fontSize: "0.75rem", color: nav }} placeholder="0" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {uploading && (
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: nav, marginBottom: "0.4rem" }}>
                  <span>Uploading photos…</span><span>{uploadProgress}%</span>
                </div>
                <div style={{ background: "var(--pm-gray-200)", borderRadius: 999, height: 8 }}>
                  <div style={{ width: `${uploadProgress}%`, height: "100%", background: teal, borderRadius: 999, transition: "width 0.3s" }} />
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setStep(0)} style={{ padding: "0.85rem 1.5rem", background: "transparent", border: `1.5px solid var(--pm-gray-200)`, color: nav, borderRadius: 12, fontWeight: 600, cursor: "pointer" }}>
                <i className="fas fa-arrow-left me-1"></i> Back
              </button>
              <button onClick={handleUploadPhotos} disabled={uploading} style={{ flex: 1, padding: "0.85rem", background: nav, color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem" }}>
                {uploading ? <span className="spinner-border spinner-border-sm"></span> : photos.length === 0 ? <><i className="fas fa-arrow-right"></i> Skip for now</> : <><i className="fas fa-cloud-upload-alt"></i> Upload {photos.length} Photo{photos.length !== 1 ? "s" : ""}</>}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Pricing & Privacy ── */}
        {step === 2 && (
          <div style={{ background: "var(--mc-card-bg, #fff)", borderRadius: 20, padding: "2rem", boxShadow: "0 2px 20px rgba(26,46,59,0.07)" }}>
            <h5 style={{ fontWeight: 700, color: nav, marginBottom: "1.5rem" }}>Pricing & Privacy</h5>

            {/* Full album price */}
            <div style={{ background: "var(--pm-teal-pale, #EEF8FB)", borderRadius: 14, padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
              <div style={{ fontWeight: 700, color: nav, marginBottom: "0.3rem" }}>Full Album Price</div>
              <div style={{ color: "var(--pm-text-muted)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>Buyers can purchase access to every photo at once. Set 0 to make it free (individual photo prices still apply).</div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", maxWidth: 260 }}>
                <span style={{ fontWeight: 700, color: nav, fontSize: "0.9rem" }}>KES</span>
                <input type="number" min="0" value={albumPrice} onChange={e => setAlbumPrice(e.target.value)} className="form-control" placeholder="0" style={{ borderRadius: 10 }} />
              </div>
            </div>

            {/* Privacy */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontWeight: 700, color: nav, marginBottom: "0.75rem" }}>Visibility</div>
              <div className="row g-3">
                {[
                  { val: false, icon: "fa-globe", label: "Public", desc: "Visible on Explore, search, and your portfolio", color: "#4CC9A6" },
                  { val: true,  icon: "fa-lock",  label: "Private", desc: "Hidden from public. Share via a secure private link", color: "#F5A623" },
                ].map(opt => (
                  <div key={String(opt.val)} className="col-12 col-sm-6">
                    <div onClick={() => setIsPrivate(opt.val)} style={{ padding: "1.25rem", borderRadius: 14, border: `2px solid ${isPrivate === opt.val ? opt.color : "var(--pm-gray-200)"}`, background: isPrivate === opt.val ? opt.color + "10" : "#fff", cursor: "pointer", transition: "all 0.2s" }}>
                      <i className={`fas ${opt.icon}`} style={{ fontSize: "1.4rem", color: opt.color, display: "block", marginBottom: "0.5rem" }}></i>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem", color: nav }}>{opt.label}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--pm-text-muted)", marginTop: "0.25rem" }}>{opt.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setStep(1)} style={{ padding: "0.85rem 1.5rem", background: "transparent", border: "1.5px solid var(--pm-gray-200)", color: nav, borderRadius: 12, fontWeight: 600, cursor: "pointer" }}>
                <i className="fas fa-arrow-left me-1"></i> Back
              </button>
              <button onClick={handleApplySettings} disabled={loading} style={{ flex: 1, padding: "0.85rem", background: nav, color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem" }}>
                {loading ? <span className="spinner-border spinner-border-sm"></span> : <><i className="fas fa-check"></i> Save & Review</>}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Done ── */}
        {step === 3 && (
          <div style={{ background: "var(--mc-card-bg, #fff)", borderRadius: 20, padding: "3rem 2rem", boxShadow: "0 2px 20px rgba(26,46,59,0.07)", textAlign: "center" }}>
            <div style={{ width: 72, height: 72, background: "linear-gradient(135deg, #4CC9A6, #6BBDD0)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem", fontSize: "1.8rem", color: "#fff" }}>
              <i className="fas fa-check"></i>
            </div>
            <h3 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, color: nav, marginBottom: "0.5rem" }}>Album Created!</h3>
            <p style={{ color: "var(--pm-text-muted)", maxWidth: 380, margin: "0 auto 1.75rem" }}>
              Your album <strong style={{ color: nav }}>{name}</strong> is live and ready. {isPrivate ? "Share the private link with your client." : "It's visible on the public Explore page."}
            </p>

            {isPrivate && shareLink && (
              <div style={{ background: "rgba(245,166,35,0.08)", border: "1.5px solid rgba(245,166,35,0.3)", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1.5rem", textAlign: "left" }}>
                <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#b7860e", marginBottom: "0.5rem" }}><i className="fas fa-link me-1"></i> Private Share Link</div>
                <div style={{ fontSize: "0.8rem", color: nav, wordBreak: "break-all", marginBottom: "0.5rem" }}>{shareLink}</div>
                <button onClick={() => navigator.clipboard.writeText(shareLink)} style={{ background: "#b7860e", color: "#fff", border: "none", borderRadius: 8, padding: "0.35rem 0.9rem", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                  <i className="fas fa-copy me-1"></i> Copy Link
                </button>
              </div>
            )}

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => navigate("/photographer/albums")} style={{ padding: "0.8rem 1.75rem", background: nav, color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, cursor: "pointer" }}>
                <i className="fas fa-images me-2"></i>My Albums
              </button>
              <button onClick={() => navigate("/photographer/albums/create")} style={{ padding: "0.8rem 1.75rem", background: "transparent", border: `1.5px solid ${nav}`, color: nav, borderRadius: 12, fontWeight: 700, cursor: "pointer" }}>
                <i className="fas fa-plus me-2"></i>Create Another
              </button>
            </div>
          </div>
        )}
      </div>
    </PhotographerLayout>
  );
}
