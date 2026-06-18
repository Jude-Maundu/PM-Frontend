import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../../api/apiConfig";
import PhotographerLayout from "./PhotographerLayout";
import { Helmet } from "react-helmet-async";

const TYPE_COLORS = {
  event:          { bg: "#EEF8FB", color: "#1A6B8A", label: "Event" },
  personal:       { bg: "#F0FFF8", color: "#0F7B52", label: "Personal" },
  private_client: { bg: "#FFF8EE", color: "#B7860E", label: "Private" },
};

const EVENT_ICONS = {
  wedding: "fa-rings-wedding", graduation: "fa-graduation-cap", birthday: "fa-birthday-cake",
  marathon: "fa-running", corporate: "fa-briefcase", concert: "fa-music",
  portrait: "fa-user-circle", wildlife: "fa-paw", landscape: "fa-mountain",
  sports: "fa-trophy", other: "fa-camera",
};

function ShareModal({ album, onClose }) {
  const [link, setLink]       = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied]   = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    const generate = async () => {
      try {
        const res = await axios.post(
          API_ENDPOINTS.SHARE.SHARE_ALBUM(album._id),
          { expirationDays: 30, maxDownloads: 200 },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        const url = res.data?.data?.shareUrl || `${window.location.origin}/share/${res.data?.data?.token}`;
        setLink(url);
      } catch {
        setError("Could not generate link. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    generate();
  }, [album._id]);

  const copy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(26,46,59,0.55)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div style={{ background: "var(--mc-card-bg, #fff)", borderRadius: 20, padding: "2rem", width: "min(480px,95vw)", boxShadow: "0 24px 60px rgba(26,46,59,0.22)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h6 style={{ margin: 0, fontWeight: 700, color: "var(--mc-text, #1A2E3B)", fontSize: "1rem" }}>
            <i className="fas fa-link me-2" style={{ color: "#6BBDD0" }}></i>Share Link
          </h6>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--mc-text-muted)", fontSize: "1.1rem" }}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <p style={{ fontSize: "0.85rem", color: "var(--mc-text-muted)", marginBottom: "1.25rem" }}>
          Anyone with this link can view <strong style={{ color: "var(--mc-text)" }}>{album.name}</strong> and purchase photos without needing an account.
        </p>

        {loading ? (
          <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
            <div className="spinner-border spinner-border-sm" style={{ color: "#6BBDD0" }}></div>
            <p style={{ color: "var(--mc-text-muted)", fontSize: "0.82rem", marginTop: "0.5rem", marginBottom: 0 }}>Generating link…</p>
          </div>
        ) : error ? (
          <p style={{ color: "#e85555", fontSize: "0.85rem", textAlign: "center" }}>{error}</p>
        ) : (
          <>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
              <input readOnly value={link} style={{ flex: 1, border: "1px solid var(--mc-border, #E8EEF2)", borderRadius: 10, padding: "0.6rem 0.85rem", fontSize: "0.82rem", color: "var(--mc-text)", background: "var(--mc-bg, #F9F7F4)", outline: "none" }} onClick={e => e.target.select()} />
              <button onClick={copy} style={{ padding: "0.6rem 1rem", background: copied ? "#4CC9A6" : "#6BBDD0", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", whiteSpace: "nowrap", transition: "background 0.2s" }}>
                <i className={`fas ${copied ? "fa-check" : "fa-copy"} me-1`}></i>{copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--mc-text-muted)", margin: 0 }}>
              <i className="fas fa-shield-alt me-1" style={{ color: "#4CC9A6" }}></i>
              Link valid for 30 days · No account required to purchase
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function AlbumCard({ album, onDelete }) {
  const [deleting, setDeleting]   = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const nav = "var(--pm-navy)";

  const cover = album.coverImage
    ? (album.coverImage.startsWith("http") ? album.coverImage : `${process.env.REACT_APP_API_URL || "https://pm-backend-f3b6.onrender.com"}/${album.coverImage}`)
    : null;

  const typeStyle = TYPE_COLORS[album.albumType] || TYPE_COLORS.personal;

  const handleDelete = async () => {
    if (!confirmDel) { setConfirmDel(true); return; }
    setDeleting(true);
    try {
      await axios.delete(API_ENDPOINTS.MEDIA.DELETE_ALBUM(album._id), {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      onDelete(album._id);
    } catch {
      setDeleting(false); setConfirmDel(false);
    }
  };

  return (
    <div style={{ background: "var(--mc-card-bg, #fff)", borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 16px rgba(26,46,59,0.08)", border: "1px solid var(--pm-gray-200, #E8EEF2)", transition: "transform 0.2s, box-shadow 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(26,46,59,0.14)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 16px rgba(26,46,59,0.08)"; }}
    >
      {/* Cover */}
      <Link to={`/photographer/albums/${album._id}`} style={{ display: "block", position: "relative", height: 200, overflow: "hidden", textDecoration: "none", background: "#dfeaf0" }}>
        {cover
          ? <>
              <img
                src={cover}
                alt=""
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: `${album.coverImagePosition?.x ?? 50}% ${album.coverImagePosition?.y ?? 50}%`,
                  filter: "blur(16px)",
                  transform: "scale(1.08)",
                  opacity: 0.5,
                }}
              />
              <img
                src={cover}
                alt={album.name}
                style={{
                  position: "relative",
                  zIndex: 1,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: `${album.coverImagePosition?.x ?? 50}% ${album.coverImagePosition?.y ?? 50}%`,
                  padding: "0.35rem",
                }}
              />
            </>
          : <div style={{ width: "100%", height: "100%", background: "var(--pm-teal-pale, #EEF8FB)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className={`fas ${EVENT_ICONS[album.eventType] || "fa-images"}`} style={{ fontSize: "3rem", color: "var(--pm-teal, #6BBDD0)" }}></i>
            </div>
        }
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,24,34,0.05), rgba(11,24,34,0.22))" }} />
        {/* Badges */}
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          <span style={{ background: typeStyle.bg, color: typeStyle.color, borderRadius: 999, padding: "0.2rem 0.65rem", fontSize: "0.72rem", fontWeight: 700 }}>
            {typeStyle.label}
          </span>
          {album.isPrivate && (
            <span style={{ background: "rgba(26,46,59,0.75)", color: "#fff", borderRadius: 999, padding: "0.2rem 0.65rem", fontSize: "0.72rem", fontWeight: 700 }}>
              <i className="fas fa-lock me-1"></i>Private
            </span>
          )}
        </div>
        <div style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(26,46,59,0.75)", color: "#fff", borderRadius: 999, padding: "0.2rem 0.65rem", fontSize: "0.75rem", fontWeight: 700 }}>
          {album.mediaCount || 0} photo{album.mediaCount !== 1 ? "s" : ""}
        </div>
      </Link>

      {/* Body */}
      <div style={{ padding: "1rem" }}>
        <Link to={`/photographer/albums/${album._id}`} style={{ textDecoration: "none" }}>
          <h6 style={{ fontWeight: 700, color: nav, margin: "0 0 0.25rem", fontSize: "0.95rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{album.name}</h6>
        </Link>
        {album.location && (
          <div style={{ fontSize: "0.78rem", color: "var(--pm-text-muted)", marginBottom: "0.5rem" }}>
            <i className="fas fa-map-marker-alt me-1"></i>{album.location}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <span style={{ fontSize: "0.9rem", fontWeight: 700, color: nav }}>
            {`KES ${Number(album.price).toLocaleString()}`}
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--pm-text-muted)" }}>
            <i className="fas fa-eye me-1"></i>{album.views || 0} views
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Link to={`/photographer/albums/${album._id}`} style={{ flex: 1, padding: "0.5rem 0", background: nav, color: "#fff", borderRadius: 9, fontWeight: 600, fontSize: "0.82rem", textAlign: "center", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem" }}>
            <i className="fas fa-edit"></i> Manage
          </Link>
          <button onClick={() => setShowShare(true)} style={{ flex: 1, padding: "0.5rem 0", background: "var(--pm-teal-pale, #EEF8FB)", color: "var(--pm-teal, #6BBDD0)", border: "none", borderRadius: 9, fontWeight: 600, fontSize: "0.82rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem" }}>
            <i className="fas fa-share-alt"></i> Share
          </button>
          <button onClick={handleDelete} disabled={deleting} style={{ padding: "0.5rem 0.75rem", background: confirmDel ? "#e85555" : "transparent", color: confirmDel ? "#fff" : "#e85555", border: `1.5px solid ${confirmDel ? "#e85555" : "rgba(232,85,85,0.3)"}`, borderRadius: 9, fontWeight: 600, fontSize: "0.82rem", cursor: "pointer" }}>
            {deleting ? <span className="spinner-border spinner-border-sm"></span> : confirmDel ? "Confirm" : <i className="fas fa-trash"></i>}
          </button>
        </div>
      </div>

      {showShare && <ShareModal album={album} onClose={() => setShowShare(false)} />}
    </div>
  );
}

export default function MyAlbums() {
  const navigate = useNavigate();
  const [albums, setAlbums]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("all"); // all | event | personal | private_client
  const [search, setSearch]   = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_ENDPOINTS.MEDIA.GET_ALBUMS, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAlbums(res.data?.albums || res.data || []);
    } catch {
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = (id) => setAlbums(prev => prev.filter(a => a._id !== id));

  const filtered = albums.filter(a => {
    const matchType   = filter === "all" || a.albumType === filter;
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const nav = "var(--pm-navy)";
  const totalPhotos = albums.reduce((s, a) => s + (a.mediaCount || 0), 0);
  const totalSales  = albums.reduce((s, a) => s + (a.purchasedBy?.length || 0), 0);

  return (
    <PhotographerLayout>
      <Helmet><title>My Albums — Relic Snap</title></Helmet>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1rem 4rem" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "clamp(1.5rem,3vw,2rem)", color: nav, margin: 0 }}>My Albums</h1>
            <p style={{ color: "var(--pm-text-muted)", marginTop: "0.3rem", fontSize: "0.9rem", margin: "0.25rem 0 0" }}>Manage your photography collections and client work.</p>
          </div>
          <button onClick={() => navigate("/photographer/albums/create")} style={{ background: nav, color: "#fff", border: "none", borderRadius: 12, padding: "0.75rem 1.5rem", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem", whiteSpace: "nowrap" }}>
            <i className="fas fa-plus"></i> New Album
          </button>
        </div>

        {/* Stats strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { icon: "fa-images", label: "Albums", value: albums.length },
            { icon: "fa-photo-video", label: "Total Photos", value: totalPhotos },
            { icon: "fa-shopping-cart", label: "Album Sales", value: totalSales },
            { icon: "fa-lock", label: "Private Albums", value: albums.filter(a => a.isPrivate).length },
          ].map(s => (
            <div key={s.label} style={{ background: "var(--mc-card-bg, #fff)", borderRadius: 14, padding: "1rem 1.25rem", boxShadow: "0 1px 10px rgba(26,46,59,0.06)", border: "1px solid var(--pm-gray-200)" }}>
              <i className={`fas ${s.icon}`} style={{ color: "var(--pm-teal, #6BBDD0)", marginBottom: "0.4rem", display: "block" }}></i>
              <div style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.4rem", color: nav }}>{s.value}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--pm-text-muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters + search */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "0.4rem", background: "var(--pm-gray-200, #E8EEF2)", borderRadius: 999, padding: "4px" }}>
            {["all", "event", "personal", "private_client"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: "0.4rem 0.9rem", borderRadius: 999, border: "none", background: filter === f ? nav : "transparent", color: filter === f ? "#fff" : "var(--pm-text-muted)", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }}>
                {f === "all" ? "All" : f === "private_client" ? "Private" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ position: "relative" }}>
              <i className="fas fa-search" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--pm-text-muted)", fontSize: "0.85rem" }}></i>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search albums…" style={{ width: "100%", paddingLeft: "2.2rem", padding: "0.55rem 0.85rem 0.55rem 2.2rem", border: "1.5px solid var(--pm-gray-200)", borderRadius: 999, fontSize: "0.85rem", outline: "none" }} />
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ borderRadius: 18, overflow: "hidden", border: "1px solid var(--pm-gray-200)" }}>
                <div className="skeleton-box" style={{ height: 180 }} />
                <div style={{ padding: "1rem" }}>
                  <div className="skeleton-box" style={{ height: 16, width: "65%", marginBottom: 8 }} />
                  <div className="skeleton-box" style={{ height: 13, width: "40%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 1rem" }}>
            <i className="fas fa-images" style={{ fontSize: "3.5rem", color: "var(--pm-gray-200)", display: "block", marginBottom: "1rem" }}></i>
            <h5 style={{ color: nav, fontFamily: "var(--font-serif)", fontWeight: 700 }}>{search ? "No albums match your search" : "No albums yet"}</h5>
            <p style={{ color: "var(--pm-text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              {search ? "Try a different search term" : "Create your first album to start selling your photography."}
            </p>
            {!search && (
              <button onClick={() => navigate("/photographer/albums/create")} style={{ background: nav, color: "#fff", border: "none", borderRadius: 12, padding: "0.75rem 2rem", fontWeight: 700, cursor: "pointer" }}>
                <i className="fas fa-plus me-2"></i>Create First Album
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
            {filtered.map(album => (
              <AlbumCard key={album._id} album={album} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </PhotographerLayout>
  );
}
