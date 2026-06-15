import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import BuyerLayout from "./BuyerLayout";
import axios from "axios";
import { API_ENDPOINTS } from "../../../api/apiConfig";
import { toast } from "../../../utils/toast";
import AlbumDownloadModal from "./AlbumDownloadModal";

const EVENT_TYPES = [
  { value: "",           label: "All",        icon: "fa-th-large" },
  { value: "wedding",    label: "Weddings",   icon: "fa-rings-wedding",  color: "#F06B8D" },
  { value: "graduation", label: "Graduation", icon: "fa-graduation-cap", color: "#6BBDD0" },
  { value: "marathon",   label: "Marathon",   icon: "fa-running",        color: "#4CC9A6" },
  { value: "corporate",  label: "Corporate",  icon: "fa-briefcase",      color: "#9D7FEB" },
  { value: "concert",    label: "Concerts",   icon: "fa-music",          color: "#FF6B6B" },
  { value: "portrait",   label: "Portraits",  icon: "fa-user-circle",    color: "#F5A623" },
  { value: "wildlife",   label: "Wildlife",   icon: "fa-paw",            color: "#4CC9A6" },
  { value: "landscape",  label: "Landscape",  icon: "fa-mountain",       color: "#6BBDD0" },
];

const ALBUM_TYPES = [
  { value: "",               label: "All Types" },
  { value: "event",          label: "Events" },
  { value: "personal",       label: "Personal" },
  { value: "private_client", label: "Private" },
];

function imgUrl(raw) {
  if (!raw) return null;
  if (raw.startsWith("http") || raw.startsWith("data:") || raw.startsWith("blob:")) return raw;
  return `https://pm-backend-f3b6.onrender.com/${raw.replace(/^\//, "")}`;
}

function AlbumCard({ album, userId, onBuy, onAddToCart, buying, cartAlbumIds }) {
  const navigate = useNavigate();
  const cover = imgUrl(album.coverImage);
  const alreadyPurchased = (album.purchasedBy || []).map(id => id.toString()).includes(userId?.toString());
  const isFree = !album.price || album.price <= 0;
  const inCart = cartAlbumIds?.includes(album._id);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 18, overflow: "hidden",
        background: "var(--mc-card-bg, #1a2535)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: hovered ? "0 16px 40px rgba(0,0,0,0.4)" : "0 2px 12px rgba(0,0,0,0.2)",
        transform: hovered ? "translateY(-4px)" : "none",
        transition: "all 0.22s ease", cursor: "pointer",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Cover */}
      <div onClick={() => navigate(`/album/${album._id}`)}
        style={{ position: "relative", height: 200, overflow: "hidden", flexShrink: 0 }}
      >
        {cover
          ? <img src={cover} alt={album.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.35s", transform: hovered ? "scale(1.06)" : "scale(1)" }} loading="lazy" />
          : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #1A2E3B 0%, #2d4a5e 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="fas fa-images" style={{ fontSize: "2.5rem", color: "rgba(107,189,208,0.35)" }}></i>
            </div>
        }
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0) 45%, rgba(0,0,0,0.72))" }} />

        {album.eventType && album.eventType !== "other" && (
          <div style={{ position: "absolute", top: 10, left: 10 }}>
            <span style={{ background: "rgba(107,189,208,0.85)", backdropFilter: "blur(6px)", color: "#fff", borderRadius: 999, padding: "0.2rem 0.65rem", fontSize: "0.68rem", fontWeight: 700, textTransform: "capitalize" }}>
              {album.eventType}
            </span>
          </div>
        )}

        <div style={{ position: "absolute", bottom: 10, left: 10, right: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ background: "rgba(26,46,59,0.8)", color: "#fff", borderRadius: 999, padding: "0.2rem 0.6rem", fontSize: "0.7rem", fontWeight: 600 }}>
            <i className="fas fa-images me-1"></i>{album.mediaCount || 0} photos
          </span>
          <span style={{ background: isFree ? "rgba(76,201,166,0.85)" : "rgba(245,166,35,0.9)", color: isFree ? "#fff" : "#1a1a00", borderRadius: 999, padding: "0.2rem 0.65rem", fontSize: "0.7rem", fontWeight: 700 }}>
            {isFree ? "Free" : `KES ${Number(album.price).toLocaleString()}`}
          </span>
        </div>

        {hovered && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(107,189,208,0.08)", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <div style={{ background: "rgba(107,189,208,0.9)", color: "#fff", borderRadius: 999, padding: "0.5rem 1.25rem", fontSize: "0.82rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <i className="fas fa-images"></i> View Album
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "1rem", display: "flex", flexDirection: "column", flex: 1 }}>
        <h6 onClick={() => navigate(`/album/${album._id}`)}
          style={{ fontWeight: 700, color: "#fff", margin: "0 0 0.35rem", fontSize: "0.95rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", cursor: "pointer" }}
        >{album.name}</h6>

        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.75rem" }}>
          <img
            src={imgUrl(album.photographer?.profilePicture) || `https://ui-avatars.com/api/?name=${album.photographer?.username || "P"}&background=6BBDD0&color=fff&size=24`}
            alt="" style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover" }}
          />
          <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>{album.photographer?.username || "Photographer"}</span>
          {album.location && (
            <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.2rem" }}>
              <i className="fas fa-map-marker-alt"></i>{album.location}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ marginTop: "auto" }}>
          {alreadyPurchased ? (
            <button onClick={() => navigate(`/album/${album._id}`)}
              style={{ width: "100%", padding: "0.6rem", background: "rgba(76,201,166,0.12)", color: "#4CC9A6", border: "1px solid rgba(76,201,166,0.3)", borderRadius: 10, fontWeight: 700, fontSize: "0.83rem", cursor: "pointer" }}
            >
              <i className="fas fa-check me-1"></i>Purchased — View Album
            </button>
          ) : isFree ? (
            <button onClick={() => navigate(`/album/${album._id}`)}
              style={{ width: "100%", padding: "0.6rem", background: "rgba(107,189,208,0.12)", color: "#6BBDD0", border: "1px solid rgba(107,189,208,0.3)", borderRadius: 10, fontWeight: 700, fontSize: "0.83rem", cursor: "pointer" }}
            >
              <i className="fas fa-images me-1"></i>View Free Album
            </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {/* Add to Cart */}
              <button
                onClick={() => onAddToCart(album)}
                disabled={inCart}
                style={{
                  width: "100%", padding: "0.55rem", borderRadius: 10, fontWeight: 700, fontSize: "0.78rem", cursor: inCart ? "default" : "pointer",
                  background: inCart ? "rgba(107,189,208,0.08)" : "rgba(107,189,208,0.14)",
                  color: inCart ? "rgba(107,189,208,0.5)" : "#6BBDD0",
                  border: `1px solid ${inCart ? "rgba(107,189,208,0.15)" : "rgba(107,189,208,0.35)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem",
                }}
              >
                <i className={`fas ${inCart ? "fa-check" : "fa-cart-plus"}`}></i>
                {inCart ? "In Cart" : "Add to Cart"}
              </button>
              {/* Buy now row */}
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <button onClick={() => navigate(`/album/${album._id}`)}
                  style={{ flex: 1, padding: "0.55rem", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontWeight: 600, fontSize: "0.75rem", cursor: "pointer" }}
                >
                  <i className="fas fa-eye me-1"></i>Preview
                </button>
                <button onClick={() => onBuy(album)} disabled={buying === album._id}
                  style={{ flex: 1, padding: "0.55rem", background: "#F5A623", color: "#1a1a00", border: "none", borderRadius: 10, fontWeight: 700, fontSize: "0.75rem", cursor: "pointer" }}
                >
                  {buying === album._id
                    ? <span className="spinner-border spinner-border-sm"></span>
                    : <><i className="fas fa-bolt me-1"></i>Buy Now</>
                  }
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BuyerExplore() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id || user._id;
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [eventType, setEventType] = useState("");
  const [albumType, setAlbumType] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [buyingAlbum, setBuyingAlbum] = useState(null);
  const [cartAlbumIds, setCartAlbumIds] = useState([]);
  const [downloadModalData, setDownloadModalData] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (albumType) params.set("albumType", albumType);
      if (eventType) params.set("eventType", eventType);
      if (search.trim()) params.set("search", search.trim());
      params.set("limit", "60");

      const res = await axios.get(`${API_ENDPOINTS.MEDIA.GET_PUBLIC_ALBUMS}?${params}`, { headers });
      setAlbums(res.data?.albums || res.data || []);
    } catch {
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [albumType, eventType, search]);

  useEffect(() => { load(); }, [load]);

  // Load cart album IDs so cards show "In Cart" state
  useEffect(() => {
    if (!token || !userId) return;
    axios.get(API_ENDPOINTS.CART.GET(userId), { headers })
      .then(res => {
        const albumItems = res.data?.albumItems || [];
        setCartAlbumIds(albumItems.map(i => (i.album?._id || i.album)?.toString?.()));
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleAddToCart = async (album) => {
    if (!token || !userId) { navigate("/login"); return; }
    try {
      await axios.post(API_ENDPOINTS.CART.ADD, { albumId: album._id }, { headers: { Authorization: `Bearer ${token}` } });
      setCartAlbumIds(prev => [...prev, album._id]);
      toast.success(`"${album.name}" added to cart`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not add to cart");
    }
  };

  const handleBuyAlbum = async (album) => {
    if (!token || !userId) { navigate("/login"); return; }
    if (album.price <= 0) { toast.info("This album is free"); return; }
    setBuyingAlbum(album._id);
    try {
      const res = await axios.post(API_ENDPOINTS.WALLET.BUY_ALBUM(album._id), {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(res.data.message || "Album purchased!");
      setAlbums(prev => prev.map(a => a._id === album._id ? { ...a, purchasedBy: [...(a.purchasedBy || []), userId] } : a));
      // Show download modal
      if (res.data.downloadInfo) {
        setDownloadModalData([{
          albumId: album._id,
          albumName: res.data.albumName || album.name,
          downloadInfo: res.data.downloadInfo,
        }]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Purchase failed");
    } finally {
      setBuyingAlbum(null);
    }
  };

  const sorted = [...albums].sort((a, b) => {
    if (sortBy === "popular") return (b.views || 0) - (a.views || 0);
    if (sortBy === "price_low") return (a.price || 0) - (b.price || 0);
    if (sortBy === "price_high") return (b.price || 0) - (a.price || 0);
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  return (
    <BuyerLayout>
      <div style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>

        {/* Page header */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontWeight: 700, color: "#fff", margin: "0 0 0.25rem", fontSize: "clamp(1.3rem,3vw,1.7rem)" }}>
            <i className="fas fa-compass me-2" style={{ color: "#6BBDD0" }}></i>Explore Albums
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", margin: 0, fontSize: "0.88rem" }}>
            Browse photography collections — click any album to explore and purchase photos inside
          </p>
        </div>

        {/* Search + sort bar */}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: "1 1 220px", position: "relative" }}>
            <i className="fas fa-search" style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)", fontSize: "0.82rem" }}></i>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search albums or photographer…"
              style={{ width: "100%", paddingLeft: "2.4rem", padding: "0.65rem 1rem 0.65rem 2.4rem", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 999, color: "#fff", fontSize: "0.85rem", outline: "none" }}
            />
          </div>
          <select
            value={albumType}
            onChange={e => setAlbumType(e.target.value)}
            style={{ padding: "0.65rem 1rem", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 999, color: "#fff", fontSize: "0.82rem", outline: "none", cursor: "pointer" }}
          >
            {ALBUM_TYPES.map(t => <option key={t.value} value={t.value} style={{ background: "#1a2535" }}>{t.label}</option>)}
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{ padding: "0.65rem 1rem", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 999, color: "#fff", fontSize: "0.82rem", outline: "none", cursor: "pointer" }}
          >
            <option value="newest" style={{ background: "#1a2535" }}>Newest</option>
            <option value="popular" style={{ background: "#1a2535" }}>Most Viewed</option>
            <option value="price_low" style={{ background: "#1a2535" }}>Price: Low</option>
            <option value="price_high" style={{ background: "#1a2535" }}>Price: High</option>
          </select>
        </div>

        {/* Event type pills */}
        <div style={{ display: "flex", gap: "0.4rem", overflowX: "auto", paddingBottom: "0.5rem", marginBottom: "1.5rem", scrollbarWidth: "none" }}>
          {EVENT_TYPES.map(et => (
            <button
              key={et.value}
              onClick={() => setEventType(et.value)}
              style={{
                flexShrink: 0, padding: "0.38rem 0.9rem", borderRadius: 999, border: `1.5px solid ${eventType === et.value ? (et.color || "#6BBDD0") : "rgba(255,255,255,0.1)"}`,
                background: eventType === et.value ? (et.color ? et.color + "22" : "rgba(107,189,208,0.15)") : "transparent",
                color: eventType === et.value ? (et.color || "#6BBDD0") : "rgba(255,255,255,0.5)",
                fontWeight: 600, fontSize: "0.78rem", cursor: "pointer", whiteSpace: "nowrap",
                display: "inline-flex", alignItems: "center", gap: "0.3rem", transition: "all 0.18s",
              }}
            >
              {et.icon && <i className={`fas ${et.icon}`} style={{ fontSize: "0.7rem" }}></i>}
              {et.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!loading && (
          <div style={{ marginBottom: "1rem", fontSize: "0.82rem", color: "rgba(255,255,255,0.38)" }}>
            {sorted.length} album{sorted.length !== 1 ? "s" : ""} found
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ borderRadius: 18, overflow: "hidden", background: "rgba(255,255,255,0.05)" }}>
                <div style={{ height: 200, background: "rgba(255,255,255,0.04)", animation: "pulse 1.6s infinite" }} />
                <div style={{ padding: "1rem" }}>
                  <div style={{ height: 16, width: "65%", background: "rgba(255,255,255,0.07)", borderRadius: 6, marginBottom: 10 }} />
                  <div style={{ height: 12, width: "40%", background: "rgba(255,255,255,0.05)", borderRadius: 6 }} />
                </div>
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 1rem" }}>
            <i className="fas fa-folder-open" style={{ fontSize: "3.5rem", color: "rgba(255,255,255,0.1)", display: "block", marginBottom: "1rem" }}></i>
            <h5 style={{ color: "#fff", fontWeight: 700, marginBottom: "0.5rem" }}>No albums found</h5>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem", marginBottom: "1.25rem" }}>Try a different filter or search term.</p>
            <button
              onClick={() => { setSearch(""); setAlbumType(""); setEventType(""); }}
              style={{ background: "#6BBDD0", color: "#fff", border: "none", borderRadius: 12, padding: "0.65rem 1.75rem", fontWeight: 700, cursor: "pointer" }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
            {sorted.map(album => (
              <AlbumCard
                key={album._id}
                album={album}
                userId={userId}
                onBuy={handleBuyAlbum}
                onAddToCart={handleAddToCart}
                buying={buyingAlbum}
                cartAlbumIds={cartAlbumIds}
              />
            ))}
          </div>
        )}
      </div>

      {downloadModalData && (
        <AlbumDownloadModal
          albums={downloadModalData}
          onClose={() => setDownloadModalData(null)}
        />
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        div[style*="scrollbarWidth"] ::-webkit-scrollbar { display: none; }
        option { background: #1a2535 !important; }
      `}</style>
    </BuyerLayout>
  );
}
