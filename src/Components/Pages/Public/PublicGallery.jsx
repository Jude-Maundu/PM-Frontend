import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS, SITE_URL } from "../../../api/apiConfig";
import QuickBuyModal from "../../QuickBuyModal";
import FaceSearchModal from "../../FaceSearchModal";
import { QRCodeSVG } from "qrcode.react";

const PublicGallery = () => {
  const { albumId } = useParams();
  const [album, setAlbum] = useState(null);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buyTarget, setBuyTarget] = useState(null);
  const [showFaceSearch, setShowFaceSearch] = useState(false);
  const [faceResults, setFaceResults] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [search, setSearch] = useState("");

  const galleryUrl = `${SITE_URL}/gallery/${albumId}`;
  const isLoggedIn = !!localStorage.getItem("token");

  const fetchGallery = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINTS.MEDIA.GET_PUBLIC_GALLERY(albumId));
      setAlbum(res.data.album);
      setMedia(res.data.media || []);
    } catch (err) {
      setError(err.response?.data?.message || "Gallery not found or not public.");
    } finally {
      setLoading(false);
    }
  }, [albumId]);

  useEffect(() => { fetchGallery(); }, [fetchGallery]);

  const displayMedia = faceResults
    ? media.filter((m) => faceResults.includes(m._id))
    : search
    ? media.filter((m) => m.title?.toLowerCase().includes(search.toLowerCase()))
    : media;

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--mc-bg, #1B2A4A)" }}>
      <div className="spinner-border" style={{ color: "var(--mc-accent, #5B7FE5)" }}></div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--mc-bg, #1B2A4A)", color: "#fff", gap: "1rem" }}>
      <i className="fas fa-image-slash fa-3x" style={{ opacity: 0.3 }}></i>
      <p>{error}</p>
      <Link to="/" className="btn btn-sm" style={{ background: "var(--mc-accent, #5B7FE5)", color: "#fff", border: "none", borderRadius: 8 }}>← Go Home</Link>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--mc-bg, #1B2A4A)", color: "#fff" }}>
      {/* Header */}
      <div style={{ background: "var(--mc-sidebar-bg, #162038)", borderBottom: "1px solid rgba(107,189,208,0.15)", padding: "1rem 1.5rem" }}>
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3" style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="d-flex align-items-center gap-3">
            {album?.photographer?.profilePicture && (
              <img src={album.photographer.profilePicture} alt="" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
            )}
            <div>
              <h5 className="mb-0 fw-bold text-white">{album?.name}</h5>
              <small style={{ color: "rgba(255,255,255,0.45)" }}>
                by {album?.photographer?.username} · {media.length} photos
              </small>
            </div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <button
              className="btn btn-sm"
              style={{ background: "rgba(107,189,208,0.12)", color: "var(--mc-accent, #5B7FE5)", border: "1px solid rgba(107,189,208,0.25)", borderRadius: 8 }}
              onClick={() => setShowFaceSearch(true)}
            >
              <i className="fas fa-user-circle me-2"></i>Find My Photo
            </button>
            <button
              className="btn btn-sm"
              style={{ background: "rgba(107,189,208,0.12)", color: "var(--mc-accent, #5B7FE5)", border: "1px solid rgba(107,189,208,0.25)", borderRadius: 8 }}
              onClick={() => setShowQR((v) => !v)}
            >
              <i className="fas fa-qrcode me-2"></i>QR Code
            </button>
            {!isLoggedIn && (
              <Link to="/register" className="btn btn-sm" style={{ background: "var(--mc-accent, #5B7FE5)", color: "#fff", border: "none", borderRadius: 8 }}>
                Sign up free
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* QR Inline Panel */}
      {showQR && (
        <div style={{ background: "rgba(107,189,208,0.06)", borderBottom: "1px solid rgba(107,189,208,0.12)", padding: "1.5rem", textAlign: "center" }}>
          <p className="mb-2" style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" }}>Share this gallery</p>
          <div style={{ display: "inline-block", padding: 12, background: "#fff", borderRadius: 10, marginBottom: 12 }}>
            <QRCodeSVG value={galleryUrl} size={140} level="H" />
          </div>
          <p style={{ color: "var(--mc-accent, #5B7FE5)", fontSize: "0.8rem" }}>{galleryUrl}</p>
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem" }}>
        {/* Face search results banner */}
        {faceResults && (
          <div className="d-flex align-items-center gap-3 p-3 rounded-3 mb-3" style={{ background: "rgba(107,189,208,0.1)", border: "1px solid rgba(107,189,208,0.25)" }}>
            <i className="fas fa-user-check" style={{ color: "var(--mc-accent, #5B7FE5)" }}></i>
            <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem" }}>
              Showing {faceResults.length} photos matching your face
            </span>
            <button className="btn btn-sm ms-auto" style={{ color: "rgba(255,255,255,0.5)", background: "none", border: "none" }} onClick={() => setFaceResults(null)}>
              Show all
            </button>
          </div>
        )}

        {/* Search */}
        <div className="input-group mb-4" style={{ maxWidth: 360 }}>
          <span className="input-group-text" style={{ background: "rgba(107,189,208,0.08)", border: "1px solid rgba(107,189,208,0.2)", color: "var(--mc-accent, #5B7FE5)" }}>
            <i className="fas fa-search"></i>
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search photos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ background: "rgba(107,189,208,0.05)", border: "1px solid rgba(107,189,208,0.2)", color: "#fff" }}
          />
        </div>

        {/* Photo Grid */}
        {displayMedia.length === 0 ? (
          <div className="text-center py-5">
            <i className="fas fa-images fa-3x mb-3" style={{ opacity: 0.2 }}></i>
            <p style={{ color: "rgba(255,255,255,0.4)" }}>No photos found</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.75rem" }}>
            {displayMedia.map((item) => (
              <div key={item._id} style={{ borderRadius: 10, overflow: "hidden", background: "rgba(255,255,255,0.04)", position: "relative", aspectRatio: "3/2" }}>
                {/* Watermarked preview */}
                <img
                  src={item.watermarkedUrl || item.fileUrl}
                  alt={item.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  onContextMenu={(e) => e.preventDefault()}
                  draggable={false}
                />
                {/* PREVIEW badge */}
                <div style={{
                  position: "absolute", top: 8, left: 8,
                  background: "rgba(0,0,0,0.55)", color: "rgba(255,255,255,0.7)",
                  fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.08em",
                  padding: "2px 7px", borderRadius: 4, userSelect: "none",
                }}>
                  PREVIEW
                </div>
                {/* Buy overlay on hover */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)",
                  display: "flex", flexDirection: "column", justifyContent: "flex-end",
                  padding: "0.75rem",
                  opacity: 0,
                  transition: "opacity 0.2s",
                }}
                  className="gallery-hover-overlay"
                  onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                >
                  <p className="mb-1 text-white fw-semibold" style={{ fontSize: "0.82rem" }}>{item.title}</p>
                  <div className="d-flex gap-2 align-items-center">
                    <span style={{ color: "#4CC9A6", fontWeight: 700, fontSize: "0.85rem" }}>
                      KES {Number(item.price).toLocaleString()}
                    </span>
                    <button
                      className="btn btn-sm ms-auto"
                      style={{ background: "#4CC9A6", color: "#0f1e28", border: "none", borderRadius: 6, fontWeight: 700, fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}
                      onClick={() => {
                        if (!isLoggedIn) { window.location.href = `/login?redirect=/gallery/${albumId}`; return; }
                        setBuyTarget(item);
                      }}
                    >
                      <i className="fas fa-bolt me-1"></i>Buy
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="mt-4 text-center" style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.75rem" }}>
          Powered by Relic Snap · All images are watermarked previews. HD originals delivered after payment.
        </p>
      </div>

      {buyTarget && (
        <QuickBuyModal
          media={buyTarget}
          onClose={() => setBuyTarget(null)}
          onSuccess={() => setBuyTarget(null)}
        />
      )}
      {showFaceSearch && (
        <FaceSearchModal
          onClose={() => setShowFaceSearch(false)}
          onResults={(ids) => { setFaceResults(ids); setShowFaceSearch(false); }}
        />
      )}
    </div>
  );
};

export default PublicGallery;
