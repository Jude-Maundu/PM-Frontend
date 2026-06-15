import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { API_ENDPOINTS, API_BASE_URL } from "../../api/apiConfig";
import FaceSearchModal from "../FaceSearchModal";
import { Helmet } from "react-helmet-async";

const NAV = "var(--pm-navy)";
const TEAL = "var(--pm-teal, #6BBDD0)";

const TYPE_FILTERS = [
  { value: "all",           label: "All Albums",  icon: "fa-th-large" },
  { value: "event",         label: "Events",      icon: "fa-calendar-star" },
  { value: "personal",      label: "Personal",    icon: "fa-images" },
  { value: "private_client",label: "Private",     icon: "fa-lock" },
];

const EVENT_FILTERS = [
  { value: "wedding",    label: "Weddings",    icon: "fa-rings-wedding",  color: "#F06B8D" },
  { value: "graduation", label: "Graduations", icon: "fa-graduation-cap", color: "#6BBDD0" },
  { value: "marathon",   label: "Marathons",   icon: "fa-running",        color: "#4CC9A6" },
  { value: "corporate",  label: "Corporate",   icon: "fa-briefcase",      color: "#9D7FEB" },
  { value: "concert",    label: "Concerts",    icon: "fa-music",          color: "#FF6B6B" },
  { value: "portrait",   label: "Portraits",   icon: "fa-user-circle",    color: "#1A2E3B" },
  { value: "wildlife",   label: "Wildlife",    icon: "fa-paw",            color: "#4CC9A6" },
  { value: "landscape",  label: "Landscape",   icon: "fa-mountain",       color: "#6BBDD0" },
];

const EVENT_LABELS = {
  wedding: "Wedding", graduation: "Graduation", birthday: "Birthday",
  marathon: "Marathon", corporate: "Corporate", concert: "Concert",
  portrait: "Portrait", wildlife: "Wildlife", landscape: "Landscape",
  sports: "Sports", other: "Photography",
};

function imgUrl(raw) {
  if (!raw) return null;
  if (raw.startsWith("http") || raw.startsWith("data:") || raw.startsWith("blob:")) return raw;
  return `${API_BASE_URL.replace("/api", "")}/${raw}`;
}


function AlbumCard({ album }) {
  const cover     = imgUrl(album.coverImage);
  const eventLabel = EVENT_LABELS[album.eventType] || "Album";
  const photographer = album.photographer;

  return (
    <Link to={`/album/${album._id}`} style={{ textDecoration: "none", display: "block" }}>
      <div className="explore-album-card" style={{ background: "#fff", borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 14px rgba(26,46,59,0.07)", border: "1px solid var(--pm-gray-200, #E8EEF2)", transition: "transform 0.22s, box-shadow 0.22s", height: "100%" }}>
        {/* Cover */}
        <div style={{ position: "relative", overflow: "hidden", height: 200 }}>
          {cover
            ? <img src={cover} alt={album.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.35s" }} className="album-cover-img" loading="lazy" />
            : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #1A2E3B 0%, #2d4a5e 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}><i className="fas fa-images" style={{ fontSize: "2rem", color: "rgba(107,189,208,0.4)" }}></i></div>
          }
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(26,46,59,0.7))" }} />
          {/* Type badge */}
          <div style={{ position: "absolute", top: 10, left: 10 }}>
            <span style={{ background: TEAL, color: "#fff", borderRadius: 999, padding: "0.18rem 0.6rem", fontSize: "0.7rem", fontWeight: 700 }}>
              {eventLabel}
            </span>
          </div>
          {/* Photo count */}
          <div style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(26,46,59,0.75)", color: "#fff", borderRadius: 999, padding: "0.18rem 0.6rem", fontSize: "0.72rem", fontWeight: 600 }}>
            <i className="fas fa-images me-1"></i>{album.mediaCount || 0}
          </div>
          {/* Price */}
          <div style={{ position: "absolute", bottom: 10, left: 10, background: album.price > 0 ? NAV : "rgba(76,201,166,0.9)", color: "#fff", borderRadius: 999, padding: "0.18rem 0.65rem", fontSize: "0.72rem", fontWeight: 700 }}>
            {album.price > 0 ? `KES ${Number(album.price).toLocaleString()}` : "Free"}
          </div>
        </div>
        {/* Body */}
        <div style={{ padding: "1rem" }}>
          <h6 style={{ fontWeight: 700, color: NAV, margin: "0 0 0.3rem", fontSize: "0.95rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{album.name}</h6>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <img src={imgUrl(photographer?.profilePicture) || `https://ui-avatars.com/api/?name=${photographer?.username || "P"}&background=6BBDD0&color=fff&size=24`}
                alt="" style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover" }} />
              <span style={{ fontSize: "0.78rem", color: "var(--pm-text-muted)" }}>{photographer?.username || "Photographer"}</span>
            </div>
            {album.location && <span style={{ fontSize: "0.72rem", color: "var(--pm-text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}><i className="fas fa-map-marker-alt"></i>{album.location}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Explore() {
  const navigate    = useNavigate();
  const [searchParams] = useSearchParams();

  const [albums, setAlbums]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [searchQ, setSearchQ]       = useState(searchParams.get("q") || "");
  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") || "all");
  const [eventFilter, setEventFilter] = useState(searchParams.get("event") || "");
  const [showFaceSearch, setShowFaceSearch] = useState(false);
  const [faceResults, setFaceResults]       = useState(null);
  const [scrolled, setScrolled]     = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const loadAlbums = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== "all") params.set("albumType", typeFilter);
      if (eventFilter) params.set("eventType", eventFilter);
      if (searchQ.trim()) params.set("search", searchQ.trim());
      params.set("limit", "30");

      const res = await axios.get(`${API_ENDPOINTS.MEDIA.GET_PUBLIC_ALBUMS}?${params}`);
      const list = res.data?.albums || res.data || [];
      setAlbums(list);
    } catch {
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, eventFilter, searchQ]);

  useEffect(() => { loadAlbums(); }, [loadAlbums]);

  const handleSearch = (e) => { e.preventDefault(); loadAlbums(); };

  const displayAlbums = faceResults !== null ? [] : albums; // face search shows photos inside albums, not albums

  return (
    <>
      <Helmet>
        <title>Explore Albums — Relic Snap</title>
        <meta name="description" content="Browse stunning photography albums — weddings, wildlife, graduations, corporate events and more from Kenya's top photographers." />
      </Helmet>

      {/* Navbar */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, background: scrolled ? "rgba(26,46,59,0.97)" : "transparent", backdropFilter: scrolled ? "blur(12px)" : "none", transition: "all 0.3s", padding: "0.85rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <img src="/rs-logo.png" alt="Relic Snap" style={{ width: 32, height: 32, objectFit: "contain" }} />
          <span className="pm-nav-brand-text" style={{ color: "#fff", fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.1rem" }}>Relic Snap</span>
        </Link>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button onClick={() => setShowFaceSearch(true)} style={{ background: "rgba(107,189,208,0.15)", border: "1px solid rgba(107,189,208,0.4)", color: TEAL, borderRadius: 999, padding: "0.4rem 0.75rem", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <i className="fas fa-camera"></i><span className="pm-nav-label">Find My Photos</span>
          </button>
          <Link to="/login" className="pm-nav-sign-in" style={{ color: "rgba(255,255,255,0.75)", textDecoration: "none", fontSize: "0.88rem" }}>Sign In</Link>
          <Link to="/register" style={{ background: TEAL, color: "#fff", textDecoration: "none", fontSize: "0.88rem", padding: "0.45rem 1rem", borderRadius: 8, fontWeight: 600 }}>Join Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, ${NAV} 0%, #1a6b8a 100%)`, paddingTop: "8rem", paddingBottom: "4rem" }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: "2.5rem" }}>
            <span className="section-label" style={{ color: "rgba(107,189,208,0.85)" }}>Kenya's Photo Marketplace</span>
            <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "clamp(2rem,5vw,3.2rem)", color: "#fff", margin: "0.5rem 0 0.75rem", lineHeight: 1.2 }}>
              Explore <em style={{ color: TEAL, fontStyle: "normal" }}>Photography Albums</em>
            </h1>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1rem", maxWidth: 520, margin: "0 auto 2rem", lineHeight: 1.7 }}>
              Browse curated albums from Kenya's top photographers — events, wildlife, portraits, and more.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} style={{ maxWidth: 580, margin: "0 auto" }}>
              <div style={{ display: "flex", background: "#fff", borderRadius: 999, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
                <span style={{ display: "flex", alignItems: "center", paddingLeft: "1.25rem", color: "var(--pm-text-muted)" }}>
                  <i className="fas fa-search"></i>
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder="Search albums, events, or photographers…"
                  style={{ flex: 1, border: "none", outline: "none", padding: "0.9rem 1rem", fontSize: "0.95rem", color: NAV }}
                />
                <button type="submit" style={{ background: NAV, color: "#fff", border: "none", padding: "0.9rem 1.5rem", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem" }}>
                  Search
                </button>
              </div>
            </form>

            {/* Selfie search CTA */}
            <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.82rem" }}>or</span>
              <button onClick={() => setShowFaceSearch(true)} style={{ background: "none", border: "1.5px solid rgba(107,189,208,0.5)", color: TEAL, borderRadius: 999, padding: "0.35rem 1rem", fontWeight: 600, fontSize: "0.83rem", cursor: "pointer" }}>
                <i className="fas fa-camera me-1"></i> Find photos of me with AI
              </button>
            </div>
          </div>

          {/* Quick stats */}
          <div style={{ display: "flex", gap: "2rem", justifyContent: "center", flexWrap: "wrap" }}>
            {[["500+","Albums"], ["50+","Photographers"], ["10K+","Photos"]].map(([v,l]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.3rem", color: "#fff" }}>{v}</div>
                <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.55)" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--pm-gray-200)", position: "sticky", top: 56, zIndex: 100 }}>
        <div className="container">
          <div className="pm-filter-bar" style={{ display: "flex", gap: 0, alignItems: "center", padding: "0.75rem 0" }}>
            {/* Type filter */}
            <div style={{ display: "flex", gap: "0.4rem", marginRight: "1.25rem", flexShrink: 0 }}>
              {TYPE_FILTERS.map(f => (
                <button key={f.value} onClick={() => { setTypeFilter(f.value); setEventFilter(""); }}
                  style={{ padding: "0.4rem 0.9rem", borderRadius: 999, border: "none", background: typeFilter === f.value ? NAV : "var(--pm-gray-200)", color: typeFilter === f.value ? "#fff" : "var(--pm-text-muted)", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                  <i className={`fas ${f.icon}`}></i>{f.label}
                </button>
              ))}
            </div>
            {/* Divider */}
            <div style={{ width: 1, height: 28, background: "var(--pm-gray-200)", flexShrink: 0, marginRight: "1.25rem" }} />
            {/* Event type pills */}
            <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
              {EVENT_FILTERS.map(f => (
                <button key={f.value} onClick={() => setEventFilter(eventFilter === f.value ? "" : f.value)}
                  style={{ padding: "0.35rem 0.8rem", borderRadius: 999, border: `1.5px solid ${eventFilter === f.value ? f.color : "transparent"}`, background: eventFilter === f.value ? f.color + "15" : "transparent", color: eventFilter === f.value ? f.color : "var(--pm-text-muted)", fontWeight: 600, fontSize: "0.78rem", cursor: "pointer", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                  <i className={`fas ${f.icon}`}></i>{f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ background: "var(--pm-cream, #F9F7F4)", minHeight: "60vh", paddingTop: "2.5rem", paddingBottom: "5rem" }}>
        <div className="container">
          {/* Active filter breadcrumb */}
          {(typeFilter !== "all" || eventFilter || searchQ) && (
            <div style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.82rem", color: "var(--pm-text-muted)" }}>Filtered by:</span>
              {typeFilter !== "all" && <span style={{ background: NAV, color: "#fff", borderRadius: 999, padding: "0.2rem 0.65rem", fontSize: "0.78rem", fontWeight: 600 }}>{TYPE_FILTERS.find(f => f.value === typeFilter)?.label}</span>}
              {eventFilter && <span style={{ background: TEAL, color: "#fff", borderRadius: 999, padding: "0.2rem 0.65rem", fontSize: "0.78rem", fontWeight: 600 }}>{EVENT_FILTERS.find(f => f.value === eventFilter)?.label}</span>}
              {searchQ && <span style={{ background: "var(--pm-gray-200)", color: NAV, borderRadius: 999, padding: "0.2rem 0.65rem", fontSize: "0.78rem", fontWeight: 600 }}>"{searchQ}"</span>}
              <button onClick={() => { setTypeFilter("all"); setEventFilter(""); setSearchQ(""); }} style={{ background: "none", border: "none", color: "var(--pm-text-muted)", fontSize: "0.78rem", cursor: "pointer", textDecoration: "underline" }}>Clear all</button>
            </div>
          )}

          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{ borderRadius: 18, overflow: "hidden", border: "1px solid var(--pm-gray-200)", background: "#fff" }}>
                  <div className="skeleton-box" style={{ height: 200 }} />
                  <div style={{ padding: "1rem" }}>
                    <div className="skeleton-box" style={{ height: 16, width: "70%", marginBottom: 8 }} />
                    <div className="skeleton-box" style={{ height: 13, width: "45%" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : displayAlbums.length === 0 ? (
            <div style={{ textAlign: "center", padding: "5rem 1rem" }}>
              <i className="fas fa-images" style={{ fontSize: "3rem", color: "var(--pm-gray-200)", display: "block", marginBottom: "1rem" }}></i>
              <h5 style={{ color: NAV, fontFamily: "var(--font-serif)", fontWeight: 700 }}>No albums found</h5>
              <p style={{ color: "var(--pm-text-muted)", fontSize: "0.9rem" }}>Try a different filter or search term.</p>
              <button onClick={() => { setTypeFilter("all"); setEventFilter(""); setSearchQ(""); }} className="btn mt-2" style={{ background: NAV, color: "#fff", borderRadius: 12, padding: "0.65rem 1.5rem", fontWeight: 700 }}>
                View All Albums
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.88rem", color: "var(--pm-text-muted)" }}>{displayAlbums.length} album{displayAlbums.length !== 1 ? "s" : ""} found</span>
                <Link to="/register" style={{ fontSize: "0.85rem", color: TEAL, textDecoration: "none", fontWeight: 600 }}>
                  <i className="fas fa-camera me-1"></i>Sell your photos →
                </Link>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
                {displayAlbums.map(album => <AlbumCard key={album._id} album={album} />)}
              </div>
            </>
          )}

          {/* CTA section */}
          <div style={{ marginTop: "4rem", background: "linear-gradient(135deg, var(--pm-navy) 0%, #1a6b8a 100%)", borderRadius: 20, padding: "2.5rem 2rem", textAlign: "center", color: "#fff" }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, marginBottom: "0.75rem", fontSize: "clamp(1.4rem,3vw,2rem)" }}>Have photos to sell?</h3>
            <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "1.5rem", fontSize: "0.95rem" }}>Join hundreds of Kenyan photographers earning from their work on Relic Snap.</p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/register" style={{ background: TEAL, color: "#fff", padding: "0.85rem 2rem", borderRadius: 12, fontWeight: 700, textDecoration: "none" }}>Start Selling Free</Link>
              <Link to="/" style={{ background: "rgba(255,255,255,0.12)", color: "#fff", padding: "0.85rem 2rem", borderRadius: 12, fontWeight: 600, textDecoration: "none" }}>Learn More</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Face search modal */}
      {showFaceSearch && (
        <FaceSearchModal
          onClose={() => setShowFaceSearch(false)}
          onResults={(matches) => { setFaceResults(matches); setShowFaceSearch(false); }}
        />
      )}

      <style>{`
        .explore-album-card:hover { transform: translateY(-4px) !important; box-shadow: 0 12px 36px rgba(26,46,59,0.14) !important; }
        .explore-album-card:hover .album-cover-img { transform: scale(1.05); }
        .skeleton-box { background: linear-gradient(90deg, #eef0f2 25%, #e0e4e8 50%, #eef0f2 75%); background-size: 200% 100%; animation: shimmer 1.6s infinite; border-radius: 8px; }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>
    </>
  );
}
