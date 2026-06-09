import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { API_ENDPOINTS } from "../../api/apiConfig";
import SocialShareButtons from "../SocialShareButtons";
import { Helmet } from "react-helmet-async";

const CATEGORIES = [
  { id: "all",          name: "All",          icon: "fas fa-th-large" },
  { id: "wedding",      name: "Wedding",       icon: "fas fa-rings-wedding" },
  { id: "nature",       name: "Nature",        icon: "fas fa-leaf" },
  { id: "portrait",     name: "Portrait",      icon: "fas fa-user" },
  { id: "urban",        name: "Urban",         icon: "fas fa-city" },
  { id: "travel",       name: "Travel",        icon: "fas fa-plane" },
  { id: "wildlife",     name: "Wildlife",      icon: "fas fa-paw" },
  { id: "architecture", name: "Architecture",  icon: "fas fa-building" },
  { id: "sports",       name: "Sports",        icon: "fas fa-futbol" },
  { id: "food",         name: "Food",          icon: "fas fa-utensils" },
  { id: "fashion",      name: "Fashion",       icon: "fas fa-tshirt" },
  { id: "abstract",     name: "Abstract",      icon: "fas fa-shapes" },
];

const LICENSE_OPTIONS = [
  { id: "all",        name: "All Licenses" },
  { id: "personal",   name: "Personal"     },
  { id: "commercial", name: "Commercial"   },
  { id: "editorial",  name: "Editorial"    },
];

const MOCK_PHOTOS = [
  { id: 1, title: "Mountain Serenity",   photographer: "Alex Rivera",    price: 2900,  image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",   likes: 234,  downloads: 1245, category: "nature",       tags: ["mountain","landscape"], licenseType: "commercial", rating: 4.8, createdAt: "2024-01-15" },
  { id: 2, title: "Urban Explorer",      photographer: "Nina Patel",     price: 3900,  image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop",   likes: 187,  downloads: 892,  category: "urban",        tags: ["city","street"],    licenseType: "commercial", rating: 4.6, createdAt: "2024-01-20" },
  { id: 3, title: "Ocean Dreams",        photographer: "Marcus Webb",    price: 0,     image: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&h=400&fit=crop",   likes: 312,  downloads: 2156, category: "nature",       tags: ["ocean","waves"],    licenseType: "personal",   rating: 4.9, createdAt: "2024-01-10" },
  { id: 4, title: "Forest Magic",        photographer: "Lisa Chang",     price: 2700,  image: "https://images.unsplash.com/photo-1426604966841-d7cdac3996e5?w=600&h=400&fit=crop",   likes: 156,  downloads: 734,  category: "nature",       tags: ["forest","trees"],   licenseType: "personal",   rating: 4.7, createdAt: "2024-01-18" },
  { id: 5, title: "City Lights",         photographer: "David Kim",      price: 3200,  image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&h=400&fit=crop",   likes: 421,  downloads: 3102, category: "architecture", tags: ["city","night"],     licenseType: "commercial", rating: 4.9, createdAt: "2024-01-05" },
  { id: 6, title: "Fashion Forward",     photographer: "Sofia Martinez", price: 4500,  image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&h=400&fit=crop",   likes: 278,  downloads: 1567, category: "fashion",      tags: ["fashion","style"],  licenseType: "commercial", rating: 4.8, createdAt: "2024-01-12" },
  { id: 7, title: "Delicious Feast",     photographer: "Carlos Mendez",  price: 2400,  image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop",   likes: 445,  downloads: 2876, category: "food",         tags: ["food","gourmet"],   licenseType: "editorial",  rating: 4.9, createdAt: "2024-01-08" },
  { id: 8, title: "Wild Safari",         photographer: "Emily Chen",     price: 3800,  image: "https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=600&h=400&fit=crop",   likes: 198,  downloads: 1243, category: "wildlife",     tags: ["safari","animals"], licenseType: "commercial", rating: 4.7, createdAt: "2024-01-14" },
];

const TRENDING_MOCK = MOCK_PHOTOS.filter(p => p.rating >= 4.8).slice(0, 4);

const COLOR_FILTERS = [
  { value: "",        label: "Any",    bg: "var(--pm-teal-pale)",  border: "var(--pm-teal-light)", text: "var(--pm-teal)" },
  { value: "red",     label: "Red",    bg: "#e53935" },
  { value: "orange",  label: "Orange", bg: "#fb8c00" },
  { value: "yellow",  label: "Yellow", bg: "#fdd835" },
  { value: "green",   label: "Green",  bg: "#43a047" },
  { value: "blue",    label: "Blue",   bg: "#1e88e5" },
  { value: "purple",  label: "Purple", bg: "#8e24aa" },
  { value: "pink",    label: "Pink",   bg: "#e91e8c" },
  { value: "brown",   label: "Brown",  bg: "#795548" },
  { value: "black",   label: "Black",  bg: "#212121" },
  { value: "white",   label: "White",  bg: "#f0f0f0", border: "#ccc" },
  { value: "grey",    label: "Grey",   bg: "#757575" },
];

/* ─── Photo Card ─── */
const PhotoCard = ({ photo, onPhotoClick }) => {
  const isPaid = (photo.price || 0) > 0;
  const imgSrc = photo.fileUrl || photo.watermarkedUrl || photo.image || photo.thumbnail;
  const pgName = photo.photographer?.username || photo.photographerName || (typeof photo.photographer === "string" ? photo.photographer : "Unknown");

  return (
    <div
      className="home-photo-card explore-card"
      style={{ cursor: "pointer" }}
      onClick={() => onPhotoClick(photo)}
    >
      <div style={{ position: "relative", overflow: "hidden" }}>
        <img
          src={imgSrc || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop"}
          className="home-photo-card-img"
          alt={photo.title}
          onContextMenu={(e) => e.preventDefault()}
          draggable={false}
        />
        {/* Price badge */}
        <span style={{
          position: "absolute", top: "0.65rem", right: "0.65rem",
          background: isPaid ? "var(--pm-navy)" : "var(--pm-success, #2ecc71)",
          color: "#fff", borderRadius: "var(--radius-pill)",
          fontSize: "0.73rem", fontWeight: 700,
          padding: "0.2rem 0.7rem",
        }}>
          {isPaid ? `KES ${Number(photo.price).toLocaleString()}` : "Free"}
        </span>
        {/* Category */}
        {photo.category && photo.category !== "all" && (
          <span style={{
            position: "absolute", bottom: "0.6rem", left: "0.6rem",
            background: "rgba(255,255,255,0.93)", color: "var(--pm-navy)",
            borderRadius: "var(--radius-pill)",
            fontSize: "0.68rem", fontWeight: 600,
            padding: "0.15rem 0.55rem",
          }}>
            {photo.category.charAt(0).toUpperCase() + photo.category.slice(1)}
          </span>
        )}
        {/* Editor's pick */}
        {(photo.rating || 0) >= 4.8 && (
          <span style={{
            position: "absolute", top: "0.6rem", left: "0.6rem",
            background: "var(--pm-teal)", color: "#fff",
            borderRadius: "var(--radius-pill)",
            fontSize: "0.65rem", fontWeight: 700,
            padding: "0.15rem 0.55rem",
          }}>
            <i className="fas fa-crown me-1"></i>Top Pick
          </span>
        )}
      </div>
      <div style={{ padding: "0.85rem 1rem" }}>
        <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--pm-navy)", marginBottom: "0.3rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {photo.title}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <small style={{ color: "var(--pm-text-muted)", fontSize: "0.78rem" }}>
            <i className="fas fa-camera me-1" style={{ color: "var(--pm-teal)" }}></i>
            {pgName}
          </small>
          <small style={{ color: "var(--pm-text-muted)", fontSize: "0.78rem" }}>
            <i className="fas fa-heart me-1" style={{ color: "#E85555" }}></i>
            {photo.likes || 0}
          </small>
        </div>
      </div>
    </div>
  );
};

/* ─── Explore Page ─── */
const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading]                   = useState(true);
  const [photos, setPhotos]                     = useState([]);
  const [trending, setTrending]                 = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [sortBy, setSortBy]                     = useState("newest");
  const [license, setLicense]                   = useState("all");
  const [minPrice, setMinPrice]                 = useState("");
  const [maxPrice, setMaxPrice]                 = useState("");
  const [searchQuery, setSearchQuery]           = useState("");
  const [selectedPhoto, setSelectedPhoto]       = useState(null);
  const [selectedColor, setSelectedColor]       = useState("");
  const [scrollY, setScrollY]                   = useState(0);
  const [menuOpen, setMenuOpen]                 = useState(false);

  const navigate = useNavigate();
  const isScrolled = scrollY > 60;

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Load photos ── */
  const loadPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery)             params.search   = searchQuery;
      if (selectedCategory !== "all") params.category = selectedCategory;
      if (sortBy)                  params.sort     = sortBy;
      if (minPrice !== "")         params.minPrice = minPrice;
      if (maxPrice !== "")         params.maxPrice = maxPrice;
      if (license !== "all")       params.license  = license;
      if (selectedColor)           params.color    = selectedColor;

      const res  = await axios.get(API_ENDPOINTS.MEDIA.FILTER, { params, timeout: 8000 });
      const data = res.data?.media || res.data?.data || res.data;
      setPhotos(Array.isArray(data) && data.length > 0 ? data : MOCK_PHOTOS);
    } catch {
      setPhotos(MOCK_PHOTOS);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, sortBy, minPrice, maxPrice, license, selectedColor]);

  const loadTrending = useCallback(async () => {
    try {
      const res  = await axios.get(API_ENDPOINTS.MEDIA.TRENDING, { timeout: 8000 });
      const data = res.data?.media || res.data?.data || res.data;
      setTrending(Array.isArray(data) && data.length > 0 ? data.slice(0, 6) : TRENDING_MOCK);
    } catch {
      setTrending(TRENDING_MOCK);
    }
  }, []);

  useEffect(() => { loadPhotos();   }, [loadPhotos]);
  useEffect(() => { loadTrending(); }, [loadTrending]);

  useEffect(() => {
    selectedCategory !== "all" ? setSearchParams({ category: selectedCategory }) : setSearchParams({});
  }, [selectedCategory, setSearchParams]);

  /* ── Client-side filter/sort ── */
  const filteredPhotos = photos.filter((p) => {
    const pgStr = p.photographer?.username || p.photographerName || String(p.photographer || "");
    return (
      (selectedCategory === "all" || p.category === selectedCategory) &&
      (license === "all"          || p.licenseType === license)        &&
      (minPrice === ""            || (p.price || 0) >= Number(minPrice)) &&
      (maxPrice === ""            || (p.price || 0) <= Number(maxPrice)) &&
      (!searchQuery || (p.title  || "").toLowerCase().includes(searchQuery.toLowerCase()) || pgStr.toLowerCase().includes(searchQuery.toLowerCase()) || (p.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
    );
  }).sort((a, b) => {
    if (sortBy === "popular")    return (b.likes || b.downloads || 0) - (a.likes || a.downloads || 0);
    if (sortBy === "price-low")  return (a.price || 0) - (b.price || 0);
    if (sortBy === "price-high") return (b.price || 0) - (a.price || 0);
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  const hasFilters = searchQuery || selectedCategory !== "all" || license !== "all" || minPrice !== "" || maxPrice !== "" || selectedColor !== "";

  const clearFilters = () => {
    setSearchQuery(""); setSelectedCategory("all"); setLicense("all");
    setMinPrice(""); setMaxPrice(""); setSortBy("newest"); setSelectedColor("");
  };

  /* ── Input style ── */
  const inputBase = {
    border: "1px solid var(--pm-gray-200)", borderRadius: "var(--radius-pill)",
    fontFamily: "var(--font-sans)", fontSize: "0.88rem",
    background: "var(--pm-white)", color: "var(--pm-text)",
    padding: "0.5rem 1rem", outline: "none", width: "100%",
  };

  return (
    <div className="home-page-shell">
      <Helmet>
        <title>Explore Photos — Relic Snap</title>
        <meta name="description" content="Browse and download thousands of high-quality photos from Kenya's top photographers. Search by category: weddings, nature, portraits, wildlife, travel and more." />
        <meta property="og:title"       content="Explore Photos — Relic Snap" />
        <meta property="og:description" content="Browse thousands of high-quality photos from Kenya's top photographers." />
        <meta property="og:url"         content="https://relicsnap.onrender.com/explore" />
        <link rel="canonical"           href="https://relicsnap.onrender.com/explore" />
      </Helmet>

      {/* ── Navbar ── */}
      <nav
        className={`navbar navbar-expand-lg fixed-top home-navbar${isScrolled ? " scrolled" : ""}`}
        style={{ background: isScrolled ? undefined : "transparent", backgroundColor: isScrolled ? undefined : "transparent" }}
      >
        <div className="container">
          <Link to="/" className="navbar-brand">
            <div className="home-nav-logo-icon"><i className="fas fa-camera"></i></div>
            <span className="home-nav-brand-text">Relic<span className="home-nav-brand-accent"> Snap</span></span>
          </Link>

          <button
            className="navbar-toggler navbar-toggler-home border-0 d-lg-none"
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className={`collapse navbar-collapse home-navbar-collapse ${menuOpen ? "show" : ""}`}>
            <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-1 py-2 py-lg-0">
              {[
                { to: "/explore",  label: "Explore"    },
                { to: "/register", label: "Sell Photos" },
                { to: "/login",    label: "Pricing"    },
              ].map(({ to, label }) => (
                <li key={to} className="nav-item">
                  <Link className="nav-link" to={to} onClick={() => setMenuOpen(false)}>{label}</Link>
                </li>
              ))}
              <li className="nav-item ms-lg-2">
                <Link to="/login" onClick={() => setMenuOpen(false)}>
                  <button className="home-nav-signin btn btn-sm">Sign In</button>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/register" onClick={() => setMenuOpen(false)}>
                  <button className="home-nav-cta btn btn-sm">Get Started</button>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* ── Hero / Search ── */}
      <section style={{ background: "var(--pm-teal-pale)", paddingTop: "7.5rem", paddingBottom: "3rem", borderBottom: "1px solid var(--pm-gray-200)" }}>
        <div className="container text-center">
          <span className="section-label">🇰🇪 Kenya's Photo Marketplace</span>
          <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "clamp(2rem,4.5vw,3.2rem)", color: "var(--pm-navy)", margin: "0.5rem 0 1rem", lineHeight: 1.2 }}>
            Explore <em>Stunning</em> Photography
          </h1>
          <p style={{ color: "var(--pm-text-muted)", fontSize: "1rem", maxWidth: 520, margin: "0 auto 2rem", lineHeight: 1.7 }}>
            Browse thousands of licensed photos from Kenya's top photographers — wildlife, culture, cities and more.
          </p>

          {/* Search bar */}
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <div style={{ display: "flex", background: "#fff", border: "1.5px solid var(--pm-gray-200)", borderRadius: "var(--radius-pill)", boxShadow: "var(--shadow-md, 0 4px 16px rgba(26,46,59,0.1))", overflow: "hidden" }}>
              <span style={{ display: "flex", alignItems: "center", paddingLeft: "1.25rem", color: "var(--pm-teal)" }}>
                <i className="fas fa-search"></i>
              </span>
              <input
                type="text"
                placeholder="Search photos, categories, or photographers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadPhotos()}
                style={{ flex: 1, border: "none", outline: "none", padding: "0.85rem 1rem", fontFamily: "var(--font-sans)", fontSize: "0.95rem", color: "var(--pm-text)", background: "transparent" }}
              />
              <button
                onClick={loadPhotos}
                style={{ background: "var(--pm-navy)", color: "#fff", border: "none", padding: "0.85rem 1.5rem", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", fontFamily: "var(--font-sans)", flexShrink: 0 }}
              >
                Search
              </button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="d-flex gap-4 justify-content-center mt-3 flex-wrap">
            {[["28+","Photos available"],["12+","Top photographers"],["5","Categories"]].map(([v, l]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.1rem", color: "var(--pm-navy)" }}>{v}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--pm-text-muted)" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category pills ── */}
      <section style={{ background: "var(--pm-white)", borderBottom: "1px solid var(--pm-gray-200)", padding: "1rem 0", position: "sticky", top: "64px", zIndex: 100 }}>
        <div className="container">
          <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.25rem", scrollbarWidth: "none" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  flexShrink: 0,
                  padding: "0.4rem 1rem",
                  borderRadius: "var(--radius-pill)",
                  border: selectedCategory === cat.id ? "1.5px solid var(--pm-teal)" : "1.5px solid var(--pm-gray-200)",
                  background: selectedCategory === cat.id ? "var(--pm-teal)" : "var(--pm-white)",
                  color: selectedCategory === cat.id ? "#fff" : "var(--pm-text-muted)",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.82rem", fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}
              >
                <i className={`${cat.icon} me-1`}></i>{cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main content ── */}
      <div style={{ background: "var(--pm-white)", paddingTop: "2.5rem", paddingBottom: "5rem" }}>
        <div className="container">
          <div className="row g-4">

            {/* ── Left / main column ── */}
            <div className="col-lg-8">

              {/* Filters bar */}
              <div style={{ background: "var(--pm-cream)", border: "1px solid var(--pm-gray-200)", borderRadius: "var(--radius-lg)", padding: "1.25rem 1.5rem", marginBottom: "1.75rem" }}>
                <div className="row g-3 align-items-end">
                  <div className="col-sm-4">
                    <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--pm-text-muted)", display: "block", marginBottom: "0.35rem", fontFamily: "var(--font-sans)" }}>Sort by</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={inputBase}>
                      <option value="newest">Newest First</option>
                      <option value="popular">Most Popular</option>
                      <option value="price-low">Price: Low → High</option>
                      <option value="price-high">Price: High → Low</option>
                    </select>
                  </div>
                  <div className="col-sm-4">
                    <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--pm-text-muted)", display: "block", marginBottom: "0.35rem", fontFamily: "var(--font-sans)" }}>License</label>
                    <select value={license} onChange={(e) => setLicense(e.target.value)} style={inputBase}>
                      {LICENSE_OPTIONS.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                  <div className="col-sm-4">
                    <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--pm-text-muted)", display: "block", marginBottom: "0.35rem", fontFamily: "var(--font-sans)" }}>Price range (KES)</label>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} style={{ ...inputBase, width: "50%", padding: "0.5rem 0.75rem" }} min="0" />
                      <span style={{ color: "var(--pm-gray-200)", flexShrink: 0 }}>—</span>
                      <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={{ ...inputBase, width: "50%", padding: "0.5rem 0.75rem" }} min="0" />
                    </div>
                  </div>
                </div>

                {/* Color row */}
                <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--pm-gray-200)" }}>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--pm-text-muted)", display: "block", marginBottom: "0.5rem", fontFamily: "var(--font-sans)" }}>
                    <i className="fas fa-palette me-1" style={{ color: "var(--pm-teal)" }}></i>Filter by colour
                  </label>
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center" }}>
                    {COLOR_FILTERS.map((c) => (
                      <button
                        key={c.value}
                        title={c.label}
                        onClick={() => setSelectedColor(c.value)}
                        style={{
                          width: c.value === "" ? "auto" : 26, height: 26,
                          padding: c.value === "" ? "0 0.6rem" : 0,
                          borderRadius: c.value === "" ? "var(--radius-pill)" : "50%",
                          background: c.value === "" ? "var(--pm-teal-pale)" : c.bg,
                          border: selectedColor === c.value ? "2.5px solid var(--pm-teal)" : `1.5px solid ${c.border || "transparent"}`,
                          cursor: "pointer", flexShrink: 0,
                          fontSize: "0.7rem", fontWeight: 700,
                          color: c.value === "" ? "var(--pm-teal)" : "transparent",
                          boxShadow: selectedColor === c.value ? "0 0 0 3px rgba(107,189,208,0.25)" : "none",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {c.value === "" ? "Any" : ""}
                      </button>
                    ))}
                    {hasFilters && (
                      <button
                        onClick={clearFilters}
                        style={{ padding: "0.15rem 0.75rem", borderRadius: "var(--radius-pill)", border: "1px solid var(--pm-gray-200)", background: "transparent", color: "var(--pm-text-muted)", fontSize: "0.75rem", cursor: "pointer", fontFamily: "var(--font-sans)" }}
                      >
                        <i className="fas fa-times me-1"></i>Clear all
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Results count */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                <h6 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, color: "var(--pm-navy)", margin: 0, fontSize: "1rem" }}>
                  {loading ? "Loading…" : `${filteredPhotos.length} photo${filteredPhotos.length !== 1 ? "s" : ""} found`}
                </h6>
                {selectedCategory !== "all" && (
                  <span style={{ background: "var(--pm-teal-pale)", color: "var(--pm-teal)", padding: "0.2rem 0.75rem", borderRadius: "var(--radius-pill)", fontSize: "0.78rem", fontWeight: 600 }}>
                    {CATEGORIES.find(c => c.id === selectedCategory)?.name}
                  </span>
                )}
              </div>

              {/* Trending section */}
              {trending.length > 0 && selectedCategory === "all" && !searchQuery && (
                <div style={{ marginBottom: "2.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
                    <span className="section-label" style={{ fontSize: "0.75rem" }}>Trending Now</span>
                    <span style={{ background: "rgba(255,107,53,0.12)", color: "#ff6b35", padding: "0.1rem 0.55rem", borderRadius: "var(--radius-pill)", fontSize: "0.7rem", fontWeight: 700, border: "1px solid rgba(255,107,53,0.25)" }}>
                      🔥 Hot
                    </span>
                  </div>
                  <div className="row g-3">
                    {trending.map((photo) => {
                      const img   = photo.fileUrl || photo.watermarkedUrl || photo.image || photo.url || photo.thumbnail;
                      const isPaid = (photo.price || 0) > 0;
                      return (
                        <div key={photo._id || photo.id} className="col-6 col-sm-3">
                          <div
                            className="explore-trend-card"
                            style={{ position: "relative", borderRadius: "var(--radius-lg)", overflow: "hidden", height: 150, cursor: "pointer", boxShadow: "var(--shadow-sm, 0 2px 8px rgba(26,46,59,0.08))" }}
                            onClick={() => setSelectedPhoto(photo)}
                          >
                            <img
                              src={img || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop"}
                              alt={photo.title}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 35%, rgba(26,46,59,0.75))" }} />
                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0.5rem 0.65rem" }}>
                              <p style={{ margin: 0, color: "#fff", fontWeight: 600, fontSize: "0.73rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{photo.title}</p>
                              <span style={{
                                background: isPaid ? "var(--pm-navy)" : "var(--pm-success, #2ecc71)",
                                color: "#fff", borderRadius: "var(--radius-pill)",
                                fontSize: "0.62rem", fontWeight: 700, padding: "0.1rem 0.45rem",
                              }}>
                                {isPaid ? `KES ${Number(photo.price).toLocaleString()}` : "Free"}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ height: 1, background: "var(--pm-gray-200)", margin: "2rem 0 0" }} />
                </div>
              )}

              {/* Photo grid */}
              {loading ? (
                <div className="row g-4">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="col-6 col-md-4">
                      <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--pm-gray-200)" }}>
                        <div className="skeleton-box" style={{ height: 220 }} />
                        <div style={{ padding: "0.85rem" }}>
                          <div className="skeleton-box" style={{ height: 16, width: "70%", marginBottom: 8 }} />
                          <div className="skeleton-box" style={{ height: 13, width: "50%" }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredPhotos.length > 0 ? (
                <div className="row g-4">
                  {filteredPhotos.map((photo) => (
                    <div key={photo._id || photo.id} className="col-6 col-md-4">
                      <PhotoCard photo={photo} onPhotoClick={setSelectedPhoto} />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
                  <i className="fas fa-search fa-3x mb-3" style={{ color: "var(--pm-gray-200)", display: "block", marginBottom: "1rem" }}></i>
                  <h5 style={{ color: "var(--pm-navy)", fontFamily: "var(--font-serif)", fontWeight: 700 }}>No photos found</h5>
                  <p style={{ color: "var(--pm-text-muted)", fontSize: "0.9rem" }}>Try adjusting your filters or search query</p>
                  <button onClick={clearFilters} className="btn-pm-outline btn px-4 mt-2">
                    Clear All Filters
                  </button>
                </div>
              )}

              {/* Load more */}
              {filteredPhotos.length > 0 && !loading && (
                <div style={{ textAlign: "center", marginTop: "3rem" }}>
                  <button className="btn-pm-outline btn px-5 py-2" onClick={loadPhotos}>
                    <i className="fas fa-sync-alt me-2"></i>Load More Photos
                  </button>
                </div>
              )}
            </div>

            {/* ── Sidebar ── */}
            <div className="col-lg-4 d-none d-lg-block">
              <div style={{ position: "sticky", top: "130px", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

                {/* Join CTA */}
                <div style={{ background: "var(--pm-navy)", borderRadius: "var(--radius-lg)", padding: "1.75rem", textAlign: "center" }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%",
                    background: "rgba(107,189,208,0.15)",
                    border: "1px solid rgba(107,189,208,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 1rem",
                  }}>
                    <i className="fas fa-camera" style={{ color: "var(--pm-teal-light, #6BBDD0)", fontSize: "1.2rem" }}></i>
                  </div>
                  <h6 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, color: "#fff", marginBottom: "0.4rem" }}>Join Relic Snap</h6>
                  <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.83rem", lineHeight: 1.6, marginBottom: "1.1rem" }}>
                    Buy photos instantly with M-Pesa, or start selling your own photography today.
                  </p>
                  <Link to="/register">
                    <button style={{
                      width: "100%", padding: "0.65rem", borderRadius: "var(--radius-pill)",
                      background: "var(--pm-teal, #6BBDD0)", color: "#fff",
                      border: "none", fontWeight: 600, fontSize: "0.88rem",
                      cursor: "pointer", fontFamily: "var(--font-sans)",
                    }}>
                      <i className="fas fa-user-plus me-2"></i>Sign Up Free
                    </button>
                  </Link>
                  <Link to="/login">
                    <button style={{
                      width: "100%", marginTop: "0.5rem", padding: "0.55rem",
                      borderRadius: "var(--radius-pill)",
                      background: "transparent", color: "rgba(255,255,255,0.55)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      fontWeight: 500, fontSize: "0.83rem",
                      cursor: "pointer", fontFamily: "var(--font-sans)",
                    }}>
                      Sign In
                    </button>
                  </Link>
                </div>

                {/* Browse by category */}
                <div style={{ background: "var(--pm-white)", border: "1px solid var(--pm-gray-200)", borderRadius: "var(--radius-lg)", padding: "1.25rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                    <i className="fas fa-th-large" style={{ color: "var(--pm-teal)" }}></i>
                    <h6 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, color: "var(--pm-navy)", margin: 0 }}>Browse Categories</h6>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                    {CATEGORIES.filter(c => c.id !== "all").slice(0, 8).map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        style={{
                          display: "flex", alignItems: "center", gap: "0.65rem",
                          padding: "0.45rem 0.75rem", borderRadius: "var(--radius-md)",
                          border: "none", textAlign: "left",
                          background: selectedCategory === cat.id ? "var(--pm-teal-pale)" : "transparent",
                          color: selectedCategory === cat.id ? "var(--pm-teal)" : "var(--pm-text-muted)",
                          fontFamily: "var(--font-sans)", fontSize: "0.83rem", fontWeight: 500,
                          cursor: "pointer", transition: "all 0.15s ease",
                          width: "100%",
                        }}
                      >
                        <i className={cat.icon} style={{ width: 16, textAlign: "center", color: selectedCategory === cat.id ? "var(--pm-teal)" : "var(--pm-text-muted)" }}></i>
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trending tags */}
                <div style={{ background: "var(--pm-cream)", border: "1px solid var(--pm-gray-200)", borderRadius: "var(--radius-lg)", padding: "1.25rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.85rem" }}>
                    <i className="fas fa-fire" style={{ color: "#ff6b35" }}></i>
                    <h6 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, color: "var(--pm-navy)", margin: 0 }}>Trending Tags</h6>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                    {["nature","sunset","cityscape","portrait","wildlife","abstract","vintage","minimal","kenya","safari"].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSearchQuery(tag)}
                        style={{
                          padding: "0.25rem 0.7rem",
                          borderRadius: "var(--radius-pill)",
                          border: "1px solid var(--pm-gray-200)",
                          background: "var(--pm-white)", color: "var(--pm-text-muted)",
                          fontFamily: "var(--font-sans)", fontSize: "0.78rem",
                          cursor: "pointer", transition: "all 0.15s ease",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--pm-teal)"; e.currentTarget.style.color = "var(--pm-teal)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--pm-gray-200)"; e.currentTarget.style.color = "var(--pm-text-muted)"; }}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sell your photos */}
                <div style={{ background: "var(--pm-teal-pale)", border: "1px solid var(--pm-teal-light, #a8d8e8)", borderRadius: "var(--radius-lg)", padding: "1.25rem" }}>
                  <h6 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, color: "var(--pm-navy)", marginBottom: "0.4rem" }}>
                    <i className="fas fa-crown me-2" style={{ color: "var(--pm-teal)" }}></i>Sell Your Photos
                  </h6>
                  <p style={{ color: "var(--pm-text-muted)", fontSize: "0.82rem", lineHeight: 1.6, marginBottom: "0.85rem" }}>
                    Earn up to 70% on every sale. M-Pesa payouts, instant delivery.
                  </p>
                  <Link to="/register">
                    <button className="btn-pm-teal btn w-100" style={{ fontSize: "0.85rem", padding: "0.55rem" }}>
                      Start Selling <i className="fas fa-arrow-right ms-1"></i>
                    </button>
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Photo Detail Modal ── */}
      {selectedPhoto && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(26,46,59,0.75)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", backdropFilter: "blur(4px)" }}
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            style={{ background: "#fff", borderRadius: "var(--radius-xl)", maxWidth: 680, width: "100%", boxShadow: "0 40px 80px rgba(26,46,59,0.3)", overflow: "hidden", maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal image */}
            <div style={{ position: "relative", background: "var(--pm-navy)" }}>
              <img
                src={selectedPhoto.fileUrl || selectedPhoto.watermarkedUrl || selectedPhoto.image || selectedPhoto.thumbnail}
                alt={selectedPhoto.title}
                style={{ width: "100%", maxHeight: "50vh", objectFit: "contain", display: "block", userSelect: "none", pointerEvents: "none" }}
                onContextMenu={(e) => e.preventDefault()}
              />
              {(selectedPhoto.price || 0) > 0 && (
                <div style={{
                  position: "absolute", top: "50%", left: "50%",
                  transform: "translate(-50%, -50%) rotate(-25deg)",
                  fontSize: "clamp(18px,4vw,36px)", fontWeight: 800,
                  color: "rgba(255,255,255,0.18)", pointerEvents: "none",
                  userSelect: "none", whiteSpace: "nowrap", letterSpacing: "0.1em",
                }}>
                  PREVIEW ONLY
                </div>
              )}
              <button
                onClick={() => setSelectedPhoto(null)}
                style={{ position: "absolute", top: "0.75rem", right: "0.75rem", width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--pm-navy)" }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Modal content */}
            <div style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", gap: "1rem" }}>
                <div>
                  <h5 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, color: "var(--pm-navy)", marginBottom: "0.25rem" }}>{selectedPhoto.title}</h5>
                  <p style={{ color: "var(--pm-text-muted)", fontSize: "0.85rem", margin: 0 }}>
                    <i className="fas fa-camera me-1" style={{ color: "var(--pm-teal)" }}></i>
                    {selectedPhoto.photographer?.username || selectedPhoto.photographerName || selectedPhoto.photographer}
                  </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.5rem", color: "var(--pm-teal)" }}>
                    {(selectedPhoto.price || 0) > 0 ? `KES ${Number(selectedPhoto.price).toLocaleString()}` : "Free"}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1.25rem" }}>
                {selectedPhoto.category && (
                  <span style={{ background: "var(--pm-teal-pale)", color: "var(--pm-teal)", padding: "0.2rem 0.7rem", borderRadius: "var(--radius-pill)", fontSize: "0.75rem", fontWeight: 600 }}>
                    <i className="fas fa-tag me-1"></i>{selectedPhoto.category}
                  </span>
                )}
                {selectedPhoto.licenseType && (
                  <span style={{ background: "var(--pm-cream)", color: "var(--pm-text-muted)", padding: "0.2rem 0.7rem", borderRadius: "var(--radius-pill)", fontSize: "0.75rem", fontWeight: 500, border: "1px solid var(--pm-gray-200)" }}>
                    <i className="fas fa-file-contract me-1"></i>{selectedPhoto.licenseType} license
                  </span>
                )}
                {(selectedPhoto.tags || []).slice(0, 3).map((tag, i) => (
                  <span key={i} style={{ background: "var(--pm-cream)", color: "var(--pm-text-muted)", padding: "0.2rem 0.7rem", borderRadius: "var(--radius-pill)", fontSize: "0.75rem", border: "1px solid var(--pm-gray-200)" }}>#{tag}</span>
                ))}
              </div>

              <SocialShareButtons
                url={`${window.location.origin}/explore?photo=${selectedPhoto._id || selectedPhoto.id}`}
                title={selectedPhoto.title}
              />

              {/* Actions */}
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  style={{ flex: 1, padding: "0.75rem", borderRadius: "var(--radius-pill)", border: "1.5px solid var(--pm-gray-200)", background: "transparent", color: "var(--pm-text-muted)", fontFamily: "var(--font-sans)", fontWeight: 500, cursor: "pointer" }}
                >
                  Close
                </button>
                <button
                  onClick={() => navigate("/login?redirect=/buyer/explore")}
                  style={{ flex: 2, padding: "0.75rem", borderRadius: "var(--radius-pill)", border: "none", background: "var(--pm-navy)", color: "#fff", fontFamily: "var(--font-sans)", fontWeight: 600, cursor: "pointer", fontSize: "0.95rem" }}
                >
                  <i className="fas fa-shopping-cart me-2"></i>
                  {(selectedPhoto.price || 0) > 0 ? "Buy Now" : "Download Free"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="home-footer" style={{ paddingTop: "4rem", paddingBottom: "2rem" }}>
        <div className="container">
          <div className="row g-4 pb-4">
            <div className="col-12 col-md-4">
              <div className="home-footer-brand d-flex align-items-center gap-2 mb-3">
                <i className="fas fa-camera" style={{ color: "var(--pm-teal)", fontSize: "1.1rem" }}></i>
                Relic Snap
              </div>
              <p style={{ fontSize: "0.88rem", color: "var(--pm-text-muted)", maxWidth: 260, lineHeight: 1.7 }}>
                Kenya's home for premium photography. Nairobi-built, M-Pesa powered, community driven.
              </p>
              <p style={{ fontSize: "0.82rem", color: "var(--pm-text-muted)", marginTop: "0.5rem" }}>
                <i className="fas fa-map-marker-alt me-1" style={{ color: "var(--pm-teal)" }}></i>
                Nairobi, Kenya 🇰🇪
              </p>
              <div className="d-flex gap-3 mt-3">
                {[["fab fa-facebook-f","https://www.facebook.com"],["fab fa-twitter","https://www.twitter.com"],["fab fa-instagram","https://www.instagram.com"],["fab fa-linkedin-in","https://www.linkedin.com"]].map(([icon, href]) => (
                  <a key={icon} href={href} target="_blank" rel="noopener noreferrer"
                    style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--pm-teal-pale)", color: "var(--pm-teal)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", transition: "var(--ease)" }}
                    onMouseOver={e => { e.currentTarget.style.background = "var(--pm-teal)"; e.currentTarget.style.color = "#fff"; }}
                    onMouseOut={e => { e.currentTarget.style.background = "var(--pm-teal-pale)"; e.currentTarget.style.color = "var(--pm-teal)"; }}
                  >
                    <i className={icon}></i>
                  </a>
                ))}
              </div>
            </div>
            <div className="col-6 col-md-2">
              <div className="home-footer-heading">Company</div>
              <ul className="list-unstyled mb-0">
                {[["About Us","/about"],["Careers","/careers"],["Press","/press"],["Blog","/blog"]].map(([label,to]) => (
                  <li key={to} className="mb-2"><Link to={to}>{label}</Link></li>
                ))}
              </ul>
            </div>
            <div className="col-6 col-md-2">
              <div className="home-footer-heading">Resources</div>
              <ul className="list-unstyled mb-0">
                {[["Help Centre","/help"],["Sell Photos","/register"],["M-Pesa Guide","/mpesa"],["License Info","/license"]].map(([label,to]) => (
                  <li key={to} className="mb-2"><Link to={to}>{label}</Link></li>
                ))}
              </ul>
            </div>
            <div className="col-12 col-md-4">
              <div className="home-footer-heading">Stay Updated</div>
              <p style={{ fontSize: "0.88rem", color: "var(--pm-text-muted)", marginBottom: "0.85rem" }}>
                New Kenyan photos and exclusive deals delivered to your inbox.
              </p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="email"
                  placeholder="Your email address"
                  style={{ flex: 1, padding: "0.65rem 1rem", border: "1px solid var(--pm-gray-200)", borderRadius: "var(--radius-pill)", fontFamily: "var(--font-sans)", fontSize: "0.88rem", background: "var(--pm-cream)", color: "var(--pm-text)", outline: "none" }}
                />
                <button style={{ background: "var(--pm-navy)", color: "#fff", border: "none", borderRadius: "var(--radius-pill)", padding: "0.65rem 1.1rem", cursor: "pointer", flexShrink: 0 }}>
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </div>
          <hr style={{ borderColor: "var(--pm-gray-200)", margin: "1.5rem 0 1rem" }} />
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
            <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--pm-text-muted)" }}>
              &copy; {new Date().getFullYear()} Relic Snap. All rights reserved. Made with ❤️ in Nairobi.
            </p>
            <div className="d-flex gap-3">
              {[["Privacy Policy","/privacy"],["Terms of Service","/terms"],["Cookie Policy","/cookies"]].map(([label,to]) => (
                <Link key={to} to={to} style={{ fontSize: "0.82rem", color: "var(--pm-text-muted)" }}>{label}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .explore-card { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .explore-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg, 0 16px 40px rgba(26,46,59,0.15)) !important; }
        .explore-trend-card { transition: transform 0.2s ease; }
        .explore-trend-card:hover { transform: scale(1.03); }
      `}</style>
    </div>
  );
};

export default Explore;
