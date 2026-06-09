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
  { id: "all", name: "All", icon: "fas fa-th-large" },
  { id: "wedding", name: "Wedding", icon: "fas fa-rings-wedding" },
  { id: "nature", name: "Nature", icon: "fas fa-leaf" },
  { id: "portrait", name: "Portrait", icon: "fas fa-user" },
  { id: "urban", name: "Urban", icon: "fas fa-city" },
  { id: "travel", name: "Travel", icon: "fas fa-plane" },
  { id: "wildlife", name: "Wildlife", icon: "fas fa-paw" },
  { id: "architecture", name: "Architecture", icon: "fas fa-building" },
  { id: "sports", name: "Sports", icon: "fas fa-futbol" },
  { id: "food", name: "Food", icon: "fas fa-utensils" },
  { id: "fashion", name: "Fashion", icon: "fas fa-tshirt" },
  { id: "abstract", name: "Abstract", icon: "fas fa-shapes" },
];

const LICENSE_OPTIONS = [
  { id: "all", name: "All Licenses" },
  { id: "personal", name: "Personal" },
  { id: "commercial", name: "Commercial" },
  { id: "editorial", name: "Editorial" },
];

const MOCK_PHOTOS = [
  {
    id: 1, title: "Mountain Serenity", photographer: "Alex Rivera", price: 29,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
    likes: 234, downloads: 1245, category: "nature", tags: ["mountain", "landscape"],
    licenseType: "commercial", rating: 4.8, createdAt: "2024-01-15",
  },
  {
    id: 2, title: "Urban Explorer", photographer: "Nina Patel", price: 39,
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop",
    likes: 187, downloads: 892, category: "urban", tags: ["city", "street"],
    licenseType: "commercial", rating: 4.6, createdAt: "2024-01-20",
  },
  {
    id: 3, title: "Ocean Dreams", photographer: "Marcus Webb", price: 0,
    image: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&h=400&fit=crop",
    likes: 312, downloads: 2156, category: "nature", tags: ["ocean", "waves"],
    licenseType: "personal", rating: 4.9, createdAt: "2024-01-10",
  },
  {
    id: 4, title: "Forest Magic", photographer: "Lisa Chang", price: 27,
    image: "https://images.unsplash.com/photo-1426604966841-d7cdac3996e5?w=600&h=400&fit=crop",
    likes: 156, downloads: 734, category: "nature", tags: ["forest", "trees"],
    licenseType: "personal", rating: 4.7, createdAt: "2024-01-18",
  },
  {
    id: 5, title: "City Lights", photographer: "David Kim", price: 32,
    image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&h=400&fit=crop",
    likes: 421, downloads: 3102, category: "architecture", tags: ["city", "night"],
    licenseType: "commercial", rating: 4.9, createdAt: "2024-01-05",
  },
  {
    id: 6, title: "Fashion Forward", photographer: "Sofia Martinez", price: 45,
    image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&h=400&fit=crop",
    likes: 278, downloads: 1567, category: "fashion", tags: ["fashion", "style"],
    licenseType: "commercial", rating: 4.8, createdAt: "2024-01-12",
  },
  {
    id: 7, title: "Delicious Feast", photographer: "Carlos Mendez", price: 24,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop",
    likes: 445, downloads: 2876, category: "food", tags: ["food", "gourmet"],
    licenseType: "editorial", rating: 4.9, createdAt: "2024-01-08",
  },
  {
    id: 8, title: "Wild Safari", photographer: "Emily Chen", price: 38,
    image: "https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=600&h=400&fit=crop",
    likes: 198, downloads: 1243, category: "wildlife", tags: ["safari", "animals"],
    licenseType: "commercial", rating: 4.7, createdAt: "2024-01-14",
  },
];

const TRENDING_MOCK = MOCK_PHOTOS.filter(p => p.rating >= 4.8).slice(0, 4);

const bannerImages = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1492691527719-9d1e4e485a21?auto=format&fit=crop&w=800&q=80",
    title: "Premium Photography",
    description: "Discover breathtaking images from top photographers worldwide",
    badge: "Featured Collection",
    buttonText: "Start Exploring",
    price: "From KES 2,500",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
    title: "Limited Time Offer",
    description: "Get 30% off on all nature photography — this week only!",
    badge: "Summer Sale",
    buttonText: "Shop Now",
    price: "Save 30%",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80",
    title: "New Arrivals",
    description: "Fresh content added daily from emerging creators",
    badge: "Just Added",
    buttonText: "View New",
    price: "New",
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
    title: "Editor's Choice",
    description: "Curated collection of award-winning photography",
    badge: "Premium Selection",
    buttonText: "Explore Collection",
    price: "Curated",
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80",
    title: "Free Downloads",
    description: "Limited time: select photos available for free download",
    badge: "Free Offer",
    buttonText: "Get Free Photos",
    price: "FREE",
  },
];

const PhotoCard = ({ photo, onPhotoClick }) => {
  const [hovered, setHovered] = useState(false);
  const isPaid = photo.price > 0;

  const licenseColor = {
    commercial: "rgba(107,189,208,0.85)",
    personal: "rgba(72,199,142,0.85)",
    editorial: "rgba(255,186,73,0.85)",
  }[photo.licenseType] || "rgba(255,255,255,0.5)";

  return (
    <div
      className="glass-card overflow-hidden explore-photo-card position-relative"
      style={{ cursor: "pointer", borderRadius: "var(--radius-lg)" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onPhotoClick(photo)}
    >
      <div className="position-relative overflow-hidden" style={{ height: "240px" }}>
        <img
          src={photo.fileUrl || photo.watermarkedUrl || photo.image || photo.thumbnail}
          alt={photo.title}
          className="w-100 h-100"
          style={{
            objectFit: "cover",
            transition: "transform 0.5s ease",
            transform: hovered ? "scale(1.06)" : "scale(1)",
          }}
        />

        {/* Watermark overlay for paid photos on hover */}
        {isPaid && hovered && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              zIndex: 3,
            }}
          >
            <span
              style={{
                fontSize: "clamp(1.2rem, 4vw, 2rem)",
                fontWeight: 800,
                color: "rgba(107,189,208,0.45)",
                letterSpacing: "0.15em",
                transform: "rotate(-25deg)",
                textShadow: "1px 1px 4px rgba(0,0,0,0.6)",
                userSelect: "none",
                whiteSpace: "nowrap",
              }}
            >
              PREVIEW
            </span>
          </div>
        )}

        {/* PREVIEW badge */}
        {isPaid && (
          <div style={{
            position: "absolute", top: 8, left: 8, zIndex: 4,
            background: "rgba(0,0,0,0.55)", color: "rgba(255,255,255,0.7)",
            fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.08em",
            padding: "2px 7px", borderRadius: 4, userSelect: "none",
          }}>
            PREVIEW
          </div>
        )}

        {/* Lock icon for paid photos */}
        {isPaid && (
          <div
            className="position-absolute bottom-0 end-0 m-2"
            style={{ zIndex: 4 }}
          >
            <span
              className="badge rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: 28,
                height: 28,
                background: "rgba(10,20,28,0.82)",
                border: "1px solid rgba(107,189,208,0.35)",
              }}
            >
              <i className="fas fa-lock" style={{ fontSize: "0.65rem", color: "var(--pm-teal)" }}></i>
            </span>
          </div>
        )}

        {/* Price badge */}
        <div className="position-absolute top-0 end-0 m-2">
          <span
            className="badge rounded-pill px-3 py-2 fw-bold"
            style={{
              background: isPaid ? "rgba(15,30,40,0.88)" : "rgba(72,199,142,0.88)",
              color: isPaid ? "var(--pm-teal)" : "#fff",
              border: isPaid ? "1px solid rgba(107,189,208,0.4)" : "none",
              fontSize: "0.78rem",
            }}
          >
            {isPaid ? `KES ${photo.price}` : "Free"}
          </span>
        </div>

        {/* Category badge */}
        {photo.category && photo.category !== "all" && (
          <div className="position-absolute top-0 start-0 m-2">
            <span
              className="badge rounded-pill px-2 py-1"
              style={{
                background: "rgba(107,189,208,0.18)",
                color: "var(--pm-teal)",
                border: "1px solid rgba(107,189,208,0.3)",
                fontSize: "0.7rem",
              }}
            >
              {photo.category.charAt(0).toUpperCase() + photo.category.slice(1)}
            </span>
          </div>
        )}

        {photo.rating >= 4.8 && (
          <div className="position-absolute" style={{ top: "2rem", start: 0, left: "0.5rem", zIndex: 2 }}>
            <span
              className="badge rounded-pill px-2 py-1"
              style={{
                background: "rgba(107,189,208,0.18)",
                color: "var(--pm-teal)",
                border: "1px solid rgba(107,189,208,0.35)",
                fontSize: "0.68rem",
                marginTop: "2rem",
              }}
            >
              <i className="fas fa-crown me-1"></i>Editor's Pick
            </span>
          </div>
        )}
      </div>

      <div className="card-body p-3">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div style={{ minWidth: 0, flex: 1 }}>
            <h6 className="fw-bold mb-1 text-white text-truncate">{photo.title}</h6>
            <p className="small mb-0 text-truncate" style={{ color: "rgba(255,255,255,0.45)" }}>
              <i className="fas fa-user-circle me-1"></i>
              {photo.photographer?.username || photo.photographerName || photo.photographer}
            </p>
          </div>
          <span
            className="badge rounded-pill ms-2 flex-shrink-0"
            style={{
              background: "rgba(107,189,208,0.1)",
              color: licenseColor,
              border: "1px solid rgba(107,189,208,0.2)",
              fontSize: "0.68rem",
            }}
          >
            {photo.licenseType || "standard"}
          </span>
        </div>

        {/* Tags */}
        {photo.tags && photo.tags.length > 0 && (
          <div className="d-flex gap-1 mb-3 flex-wrap">
            {photo.tags.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="badge rounded-pill px-2 py-1 small"
                style={{
                  background: "rgba(107,189,208,0.08)",
                  color: "rgba(107,189,208,0.75)",
                  border: "1px solid rgba(107,189,208,0.18)",
                  fontSize: "0.7rem",
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex gap-3 small" style={{ color: "rgba(255,255,255,0.45)" }}>
            <span><i className="fas fa-heart me-1" style={{ color: "#e57373" }}></i>{photo.likes}</span>
            <span><i className="fas fa-download me-1"></i>{photo.downloads}</span>
            <span><i className="fas fa-star me-1" style={{ color: "var(--pm-teal)" }}></i>{photo.rating}</span>
          </div>
          <button
            className="btn btn-sm rounded-pill px-3"
            style={{ background: "var(--pm-teal)", color: "#fff", fontSize: "0.8rem" }}
            onClick={(e) => { e.stopPropagation(); }}
          >
            <i className="fas fa-shopping-cart me-1"></i>
            {isPaid ? "Buy" : "Get"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState([]);
  const [trending, setTrending] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [sortBy, setSortBy] = useState("newest");
  const [license, setLicense] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedColor, setSelectedColor] = useState("");

  // Banner state
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [nextBannerIndex, setNextBannerIndex] = useState(1);
  const [isFading, setIsFading] = useState(false);

  const navigate = useNavigate();

  // Banner rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % bannerImages.length);
        setNextBannerIndex((prev) => (prev + 1) % bannerImages.length);
        setIsFading(false);
      }, 500);
    }, 5000);
    setNextBannerIndex(1 % bannerImages.length);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load photos (tries API, falls back to mock)
  const loadPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedCategory !== "all") params.category = selectedCategory;
      if (sortBy) params.sort = sortBy;
      if (minPrice !== "") params.minPrice = minPrice;
      if (maxPrice !== "") params.maxPrice = maxPrice;
      if (license !== "all") params.license = license;
      if (selectedColor) params.color = selectedColor;

      const res = await axios.get(API_ENDPOINTS.MEDIA.FILTER, { params, timeout: 8000 });
      const data = res.data?.media || res.data?.data || res.data;
      if (Array.isArray(data) && data.length > 0) {
        setPhotos(data);
      } else {
        setPhotos(MOCK_PHOTOS);
      }
    } catch {
      setPhotos(MOCK_PHOTOS);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, sortBy, minPrice, maxPrice, license, selectedColor]);

  const loadTrending = useCallback(async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.MEDIA.TRENDING, { timeout: 8000 });
      const data = res.data?.media || res.data?.data || res.data;
      if (Array.isArray(data) && data.length > 0) {
        setTrending(data.slice(0, 6));
      } else {
        setTrending(TRENDING_MOCK);
      }
    } catch {
      setTrending(TRENDING_MOCK);
    }
  }, []);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  useEffect(() => {
    loadTrending();
  }, [loadTrending]);

  // Sync category to URL
  useEffect(() => {
    if (selectedCategory !== "all") {
      setSearchParams({ category: selectedCategory });
    } else {
      setSearchParams({});
    }
  }, [selectedCategory, setSearchParams]);

  // Client-side filter/sort (used when API returns mock data)
  const filteredPhotos = photos.filter((photo) => {
    const categoryMatch = selectedCategory === "all" || photo.category === selectedCategory;
    const licenseMatch = license === "all" || photo.licenseType === license;
    const minMatch = minPrice === "" || (photo.price || 0) >= Number(minPrice);
    const maxMatch = maxPrice === "" || (photo.price || 0) <= Number(maxPrice);
    const searchMatch =
      !searchQuery ||
      (photo.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (photo.photographer?.username || photo.photographerName || String(photo.photographer || "")).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (photo.tags || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return categoryMatch && licenseMatch && minMatch && maxMatch && searchMatch;
  }).sort((a, b) => {
    switch (sortBy) {
      case "popular": return (b.likes || b.downloads || 0) - (a.likes || a.downloads || 0);
      case "price-low": return (a.price || 0) - (b.price || 0);
      case "price-high": return (b.price || 0) - (a.price || 0);
      default: return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
  });

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(107,189,208,0.3)",
    color: "#fff",
  };

  return (
    <div className="dash-shell">
      <Helmet>
        <title>Explore Photos — Relic Snap</title>
        <meta name="description" content="Browse and download thousands of high-quality photos from Kenya's top photographers. Search by category: weddings, nature, portraits, wildlife, travel and more." />
        <meta property="og:title" content="Explore Photos — Relic Snap" />
        <meta property="og:description" content="Browse thousands of high-quality photos from Kenya's top photographers." />
        <meta property="og:url" content="https://relicsnap.onrender.com/explore" />
        <link rel="canonical" href="https://relicsnap.onrender.com/explore" />
      </Helmet>
      {/* Navigation */}
      <nav
        className="glass-navbar navbar navbar-expand-lg fixed-top w-100 py-3"
        style={{ zIndex: 1000 }}
      >
        <div className="container px-3 px-lg-4">
          <Link
            to="/"
            className="navbar-brand fw-bold text-decoration-none d-flex align-items-center gap-2"
          >
            <div
              className="d-flex align-items-center justify-content-center rounded-circle"
              style={{
                width: 40, height: 40,
                background: "rgba(107,189,208,0.15)",
                border: "1px solid rgba(107,189,208,0.3)",
              }}
            >
              <i className="fas fa-camera" style={{ color: "var(--pm-teal)" }}></i>
            </div>
            <span className="fs-5 fw-bold" style={{ fontFamily: "var(--font-serif)", color: "#fff" }}>
              Photo<span style={{ color: "var(--pm-teal)" }}>Market</span>
            </span>
          </Link>

          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#exploreNav"
          >
            <i className="fas fa-bars fs-4" style={{ color: "var(--pm-teal)" }}></i>
          </button>

          <div className="collapse navbar-collapse" id="exploreNav">
            <ul className="navbar-nav ms-auto align-items-center gap-2 gap-lg-3">
              <li className="nav-item">
                <Link
                  className="nav-link px-3 py-2 rounded-pill"
                  style={{ color: "rgba(255,255,255,0.8)" }}
                  to="/explore"
                >
                  <i className="fas fa-compass me-1"></i> Explore
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link px-3 py-2 rounded-pill"
                  style={{ color: "rgba(255,255,255,0.8)" }}
                  to="/pricing"
                >
                  <i className="fas fa-tag me-1"></i> Pricing
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link px-3 py-2 rounded-pill"
                  style={{ color: "rgba(255,255,255,0.8)" }}
                  to="/become-seller"
                >
                  <i className="fas fa-crown me-1"></i> Sell
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/login">
                  <button
                    className="btn rounded-pill px-4 py-2"
                    style={{
                      border: "1px solid rgba(107,189,208,0.5)",
                      color: "var(--pm-teal)",
                      background: "transparent",
                    }}
                  >
                    <i className="fas fa-sign-in-alt me-2"></i> Sign In
                  </button>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/register">
                  <button
                    className="btn rounded-pill px-4 py-2 fw-semibold"
                    style={{ background: "var(--pm-teal)", color: "#fff" }}
                  >
                    <i className="fas fa-user-plus me-2"></i> Join Free
                  </button>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container px-3 px-lg-4" style={{ paddingTop: "100px" }}>
        <div className="row g-4">
          {/* Main Content Area */}
          <div className={`${!isMobile ? "col-lg-9" : "col-12"}`}>

            {/* Hero + Search */}
            <div className="text-center mb-5">
              <div
                className="d-inline-flex align-items-center gap-2 rounded-pill px-4 py-2 mb-4"
                style={{
                  background: "rgba(107,189,208,0.12)",
                  border: "1px solid rgba(107,189,208,0.25)",
                }}
              >
                <i className="fas fa-images" style={{ color: "var(--pm-teal)" }}></i>
                <span className="small fw-semibold" style={{ color: "var(--pm-teal)" }}>
                  50,000+ Premium Photos
                </span>
              </div>
              <h1
                className="display-3 fw-bold mb-3"
                style={{
                  fontFamily: "var(--font-serif)",
                  background: "linear-gradient(135deg, #fff 0%, var(--pm-teal) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Discover Stunning <br className="d-none d-sm-block" />
                Visual Stories
              </h1>
              <p
                className="lead mb-4"
                style={{ color: "rgba(255,255,255,0.5)", maxWidth: "600px", margin: "0 auto" }}
              >
                Browse millions of high-quality photos from talented creators around the world
              </p>

              {/* Search Bar */}
              <div className="position-relative mx-auto" style={{ maxWidth: "500px" }}>
                <div className="input-group">
                  <span
                    className="input-group-text rounded-start-pill ps-4"
                    style={{
                      ...inputStyle,
                      borderRight: "none",
                      color: "var(--pm-teal)",
                    }}
                  >
                    <i className="fas fa-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Search photos, categories, or creators..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ ...inputStyle, borderLeft: "none", borderRight: "none" }}
                  />
                  <button
                    className="btn rounded-end-pill px-4"
                    style={{ background: "var(--pm-teal)", color: "#fff", border: "none" }}
                    onClick={loadPhotos}
                  >
                    <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="mb-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="fw-bold mb-0 text-white">
                  <i className="fas fa-th-large me-2" style={{ color: "var(--pm-teal)" }}></i>
                  Categories
                </h5>
                <span className="small" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {filteredPhotos.length} results
                </span>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className="btn rounded-pill px-3 py-2 explore-cat-pill"
                    style={{
                      fontSize: "0.82rem",
                      background:
                        selectedCategory === cat.id ? "var(--pm-teal)" : "rgba(107,189,208,0.08)",
                      border:
                        selectedCategory === cat.id
                          ? "1px solid var(--pm-teal)"
                          : "1px solid rgba(107,189,208,0.25)",
                      color: selectedCategory === cat.id ? "#fff" : "rgba(255,255,255,0.65)",
                    }}
                  >
                    <i className={`${cat.icon} me-1`}></i>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Filter Row */}
            <div className="mb-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <i className="fas fa-palette" style={{ color: "var(--pm-teal)", fontSize: "0.9rem" }}></i>
                <span className="small fw-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>Color</span>
              </div>
              <div className="d-flex flex-wrap gap-2 align-items-center">
                {[
                  { value: "", label: "Any", bg: "rgba(107,189,208,0.15)", border: "rgba(107,189,208,0.4)" },
                  { value: "red", label: "Red", bg: "#e53935" },
                  { value: "orange", label: "Orange", bg: "#fb8c00" },
                  { value: "yellow", label: "Yellow", bg: "#fdd835" },
                  { value: "green", label: "Green", bg: "#43a047" },
                  { value: "blue", label: "Blue", bg: "#1e88e5" },
                  { value: "purple", label: "Purple", bg: "#8e24aa" },
                  { value: "pink", label: "Pink", bg: "#e91e8c" },
                  { value: "brown", label: "Brown", bg: "#795548" },
                  { value: "black", label: "Black", bg: "#212121" },
                  { value: "white", label: "White", bg: "#f5f5f5" },
                  { value: "grey", label: "Grey", bg: "#757575" },
                ].map((c) => (
                  <button
                    key={c.value}
                    title={c.label}
                    onClick={() => setSelectedColor(c.value)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: c.bg,
                      border: selectedColor === c.value
                        ? "3px solid var(--pm-teal)"
                        : "2px solid rgba(255,255,255,0.2)",
                      cursor: "pointer",
                      padding: 0,
                      flexShrink: 0,
                      boxShadow: selectedColor === c.value ? "0 0 0 2px rgba(107,189,208,0.4)" : "none",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {c.value === "" && (
                      <span style={{ fontSize: "0.55rem", color: "var(--pm-teal)", fontWeight: 700, lineHeight: 1 }}>Any</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Filters Bar */}
            <div className="glass-card p-3 mb-4">
              <div className="row g-3 align-items-end">
                {/* Sort */}
                <div className="col-sm-4">
                  <label className="form-label small" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Sort
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="form-select rounded-pill"
                    style={inputStyle}
                  >
                    <option value="newest" style={{ background: "#1a2e3b" }}>Newest First</option>
                    <option value="popular" style={{ background: "#1a2e3b" }}>Most Popular</option>
                    <option value="price-low" style={{ background: "#1a2e3b" }}>Price: Low to High</option>
                    <option value="price-high" style={{ background: "#1a2e3b" }}>Price: High to Low</option>
                  </select>
                </div>

                {/* License */}
                <div className="col-sm-4">
                  <label className="form-label small" style={{ color: "rgba(255,255,255,0.5)" }}>
                    License
                  </label>
                  <select
                    value={license}
                    onChange={(e) => setLicense(e.target.value)}
                    className="form-select rounded-pill"
                    style={inputStyle}
                  >
                    {LICENSE_OPTIONS.map((l) => (
                      <option key={l.id} value={l.id} style={{ background: "#1a2e3b" }}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div className="col-sm-4">
                  <label className="form-label small" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Price Range (KES)
                  </label>
                  <div className="d-flex gap-2 align-items-center">
                    <input
                      type="number"
                      className="form-control rounded-pill"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      style={{ ...inputStyle, fontSize: "0.82rem" }}
                      min="0"
                    />
                    <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span>
                    <input
                      type="number"
                      className="form-control rounded-pill"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      style={{ ...inputStyle, fontSize: "0.82rem" }}
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Clear filters */}
              {(searchQuery || selectedCategory !== "all" || license !== "all" || minPrice !== "" || maxPrice !== "" || selectedColor !== "") && (
                <div className="mt-3 text-end">
                  <button
                    className="btn btn-sm rounded-pill px-3"
                    style={{
                      background: "rgba(107,189,208,0.1)",
                      border: "1px solid rgba(107,189,208,0.3)",
                      color: "var(--pm-teal)",
                      fontSize: "0.8rem",
                    }}
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                      setLicense("all");
                      setMinPrice("");
                      setMaxPrice("");
                      setSortBy("newest");
                      setSelectedColor("");
                    }}
                  >
                    <i className="fas fa-times me-1"></i>Clear All Filters
                  </button>
                </div>
              )}
            </div>

            {/* Trending Section */}
            {trending.length > 0 && selectedCategory === "all" && !searchQuery && (
              <div className="mb-5">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <i className="fas fa-fire" style={{ color: "#ff6b35", fontSize: "1.1rem" }}></i>
                  <h5 className="fw-bold mb-0 text-white">Trending Now</h5>
                  <span
                    className="badge rounded-pill ms-1"
                    style={{
                      background: "rgba(255,107,53,0.15)",
                      color: "#ff6b35",
                      border: "1px solid rgba(255,107,53,0.3)",
                      fontSize: "0.72rem",
                    }}
                  >
                    Hot
                  </span>
                </div>
                <div className="row g-3">
                  {trending.map((photo) => {
                    const img = photo.image || photo.fileUrl || photo.url || photo.thumbnail;
                    const isPaid = (photo.price || 0) > 0;
                    return (
                      <div key={photo.id || photo._id} className="col-6 col-md-3">
                        <div
                          className="position-relative rounded-3 overflow-hidden"
                          style={{ height: 160, cursor: "pointer" }}
                          onClick={() => setSelectedPhoto(photo)}
                        >
                          <img
                            src={img || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop"}
                            alt={photo.title}
                            className="w-100 h-100"
                            style={{ objectFit: "cover", transition: "transform 0.4s" }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                          />
                          <div
                            className="position-absolute inset-0 w-100 h-100"
                            style={{
                              background: "linear-gradient(transparent 40%, rgba(0,0,0,0.75))",
                              top: 0, left: 0,
                            }}
                          />
                          {/* lock icon */}
                          {isPaid && (
                            <span
                              className="position-absolute bottom-0 end-0 m-1 badge"
                              style={{
                                background: "rgba(10,20,28,0.8)",
                                border: "1px solid rgba(107,189,208,0.3)",
                                borderRadius: "50%",
                                width: 22, height: 22,
                                display: "flex", alignItems: "center", justifyContent: "center",
                              }}
                            >
                              <i className="fas fa-lock" style={{ fontSize: "0.55rem", color: "var(--pm-teal)" }}></i>
                            </span>
                          )}
                          <div className="position-absolute bottom-0 start-0 p-2">
                            <p className="mb-0 text-white fw-semibold text-truncate" style={{ fontSize: "0.75rem" }}>
                              {photo.title}
                            </p>
                            <span
                              className="badge rounded-pill"
                              style={{
                                background: isPaid ? "rgba(107,189,208,0.25)" : "rgba(72,199,142,0.25)",
                                color: isPaid ? "var(--pm-teal)" : "#48c78e",
                                fontSize: "0.65rem",
                              }}
                            >
                              {isPaid ? `KES ${photo.price}` : "Free"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Photo Grid */}
            {loading ? (
              <div className="text-center py-5">
                <div
                  className="spinner-border mb-3"
                  style={{ width: "3rem", height: "3rem", color: "var(--pm-teal)" }}
                ></div>
                <p style={{ color: "rgba(255,255,255,0.4)" }}>Loading amazing photos...</p>
              </div>
            ) : filteredPhotos.length > 0 ? (
              <div className="row g-4">
                {filteredPhotos.map((photo) => (
                  <div key={photo.id || photo._id} className="col-md-6 col-lg-4">
                    <PhotoCard photo={photo} onPhotoClick={handlePhotoClick} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="fas fa-search fa-3x mb-3" style={{ color: "rgba(107,189,208,0.4)" }}></i>
                <h4 style={{ color: "rgba(255,255,255,0.5)" }}>No photos found</h4>
                <p style={{ color: "rgba(255,255,255,0.35)" }}>
                  Try adjusting your filters or search query
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSearchQuery("");
                    setMinPrice("");
                    setMaxPrice("");
                    setLicense("all");
                    setSelectedColor("");
                  }}
                  className="btn rounded-pill px-4 mt-3"
                  style={{ background: "var(--pm-teal)", color: "#fff" }}
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Load More */}
            {filteredPhotos.length > 0 && (
              <div className="text-center mt-5">
                <button className="btn rounded-pill px-5 py-3 explore-load-more">
                  <i className="fas fa-sync-alt me-2"></i>Load More Photos
                </button>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          {!isMobile && (
            <div className="col-lg-3">
              <div className="position-sticky" style={{ top: "100px" }}>
                {/* Fading Banner */}
                <div
                  className="position-relative rounded-4 overflow-hidden mb-4"
                  style={{
                    height: "500px",
                    background: "#0a1520",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                  }}
                >
                  <div
                    className="position-absolute w-100 h-100"
                    style={{
                      backgroundImage: `url(${bannerImages[currentBannerIndex].url})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      transition: "opacity 0.8s ease-in-out",
                      opacity: isFading ? 0 : 1,
                      zIndex: 1,
                    }}
                  >
                    <div
                      className="position-absolute w-100 h-100"
                      style={{
                        background: "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(10,21,32,0.95) 100%)",
                      }}
                    ></div>
                  </div>

                  <div
                    className="position-absolute w-100 h-100"
                    style={{
                      backgroundImage: `url(${bannerImages[nextBannerIndex].url})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      transition: "opacity 0.8s ease-in-out",
                      opacity: isFading ? 1 : 0,
                      zIndex: 0,
                    }}
                  >
                    <div
                      className="position-absolute w-100 h-100"
                      style={{
                        background: "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(10,21,32,0.95) 100%)",
                      }}
                    ></div>
                  </div>

                  <div
                    className="position-relative h-100 d-flex flex-column justify-content-end p-4"
                    style={{ zIndex: 2 }}
                  >
                    <div
                      className="badge rounded-pill mb-3 align-self-start px-3 py-2"
                      style={{
                        background: "rgba(107,189,208,0.2)",
                        color: "var(--pm-teal)",
                        border: "1px solid rgba(107,189,208,0.4)",
                      }}
                    >
                      <i className="fas fa-star me-1"></i>
                      {bannerImages[currentBannerIndex].badge}
                    </div>
                    <h3
                      className="fw-bold mb-2 text-white"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {bannerImages[currentBannerIndex].title}
                    </h3>
                    <p className="small mb-3" style={{ color: "rgba(255,255,255,0.55)" }}>
                      {bannerImages[currentBannerIndex].description}
                    </p>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="fw-bold" style={{ color: "var(--pm-teal)" }}>
                        {bannerImages[currentBannerIndex].price}
                      </span>
                      <button
                        className="btn btn-sm rounded-pill px-3"
                        style={{ background: "var(--pm-teal)", color: "#fff" }}
                        onClick={() => navigate("/register")}
                      >
                        {bannerImages[currentBannerIndex].buttonText}
                      </button>
                    </div>
                  </div>

                  <div
                    className="position-absolute bottom-0 start-0 end-0 d-flex justify-content-center gap-2 pb-3"
                    style={{ zIndex: 3 }}
                  >
                    {bannerImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setIsFading(true);
                          setTimeout(() => {
                            setCurrentBannerIndex(idx);
                            setNextBannerIndex((idx + 1) % bannerImages.length);
                            setIsFading(false);
                          }, 500);
                        }}
                        className="border-0 rounded-pill"
                        style={{
                          width: currentBannerIndex === idx ? "28px" : "6px",
                          height: "6px",
                          background:
                            currentBannerIndex === idx
                              ? "var(--pm-teal)"
                              : "rgba(255,255,255,0.3)",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Community Card */}
                <div className="glass-stat rounded-4 p-4 mb-4 text-center">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3"
                    style={{
                      width: 56, height: 56,
                      background: "rgba(107,189,208,0.15)",
                      border: "1px solid rgba(107,189,208,0.25)",
                    }}
                  >
                    <i className="fas fa-chart-line fs-4" style={{ color: "var(--pm-teal)" }}></i>
                  </div>
                  <h5
                    className="fw-bold mb-1 text-white"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    Join Our Community
                  </h5>
                  <p className="small mb-3" style={{ color: "rgba(255,255,255,0.45)" }}>
                    50,000+ active creators
                  </p>
                  <button
                    className="btn rounded-pill w-100 fw-semibold"
                    style={{ background: "var(--pm-teal)", color: "#fff" }}
                    onClick={() => navigate("/register")}
                  >
                    <i className="fas fa-user-plus me-2"></i> Sign Up Free
                  </button>
                </div>

                {/* Trending Tags */}
                <div className="glass-card p-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <i className="fas fa-fire" style={{ color: "var(--pm-teal)" }}></i>
                    <h6 className="fw-bold mb-0 text-white">Trending Tags</h6>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {[
                      "nature", "sunset", "cityscape", "portrait",
                      "wildlife", "abstract", "vintage", "minimal",
                    ].map((tag, idx) => (
                      <button
                        key={idx}
                        className="btn btn-sm rounded-pill px-3 py-1"
                        style={{
                          background: "rgba(107,189,208,0.08)",
                          border: "1px solid rgba(107,189,208,0.25)",
                          color: "rgba(107,189,208,0.85)",
                          fontSize: "0.78rem",
                        }}
                        onClick={() => setSearchQuery(tag)}
                      >
                        <i className="fas fa-hashtag me-1"></i>{tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div
          className="modal show d-block"
          style={{ background: "rgba(0,0,0,0.88)", zIndex: 2000 }}
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal-content"
              style={{
                background: "rgba(10,20,30,0.97)",
                border: "1px solid rgba(107,189,208,0.2)",
                borderRadius: "var(--radius-lg)",
              }}
            >
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-white">{selectedPhoto.title}</h5>
                <button
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedPhoto(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="position-relative rounded-3 overflow-hidden mb-3">
                  <img
                    src={selectedPhoto.fileUrl || selectedPhoto.watermarkedUrl || selectedPhoto.image || selectedPhoto.thumbnail}
                    alt={selectedPhoto.title}
                    className="w-100"
                    style={{
                      maxHeight: "60vh",
                      objectFit: "contain",
                      background: "#0a1520",
                      userSelect: "none",
                      pointerEvents: "none",
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                  {/* Watermark on modal */}
                  {(selectedPhoto.price || 0) > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%) rotate(-25deg)",
                        fontSize: "clamp(20px, 5vw, 40px)",
                        fontWeight: 800,
                        color: "rgba(107,189,208,0.25)",
                        pointerEvents: "none",
                        userSelect: "none",
                        whiteSpace: "nowrap",
                        letterSpacing: "0.1em",
                      }}
                    >
                      PREVIEW ONLY
                    </div>
                  )}
                </div>

                <div className="row g-3">
                  <div className="col-md-8">
                    <p className="text-white-50 small mb-1">
                      <i className="fas fa-user-circle me-1" style={{ color: "var(--pm-teal)" }}></i>
                      {selectedPhoto.photographer?.username || selectedPhoto.photographerName || selectedPhoto.photographer}
                    </p>
                    <div className="d-flex flex-wrap gap-2">
                      {selectedPhoto.category && (
                        <span
                          className="badge rounded-pill px-3 py-1"
                          style={{
                            background: "rgba(107,189,208,0.12)",
                            color: "var(--pm-teal)",
                            border: "1px solid rgba(107,189,208,0.3)",
                            fontSize: "0.75rem",
                          }}
                        >
                          <i className="fas fa-tag me-1"></i>
                          {selectedPhoto.category}
                        </span>
                      )}
                      {selectedPhoto.licenseType && (
                        <span
                          className="badge rounded-pill px-3 py-1"
                          style={{
                            background: "rgba(72,199,142,0.12)",
                            color: "#48c78e",
                            border: "1px solid rgba(72,199,142,0.3)",
                            fontSize: "0.75rem",
                          }}
                        >
                          <i className="fas fa-file-contract me-1"></i>
                          {selectedPhoto.licenseType} license
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-4 text-md-end">
                    <div className="fs-3 fw-bold" style={{ color: "var(--pm-teal)" }}>
                      {(selectedPhoto.price || 0) > 0
                        ? `KES ${selectedPhoto.price}`
                        : "Free"}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0 flex-column align-items-start gap-3">
                <SocialShareButtons
                  url={`${window.location.origin}/explore?photo=${selectedPhoto._id || selectedPhoto.id}`}
                  title={selectedPhoto.title}
                />
                <div className="d-flex gap-2 w-100 justify-content-end">
                  <button
                    className="btn rounded-pill px-4"
                    style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.15)" }}
                    onClick={() => setSelectedPhoto(null)}
                  >
                    Close
                  </button>
                  <button
                    className="btn rounded-pill px-5 fw-semibold"
                    style={{ background: "var(--pm-teal)", color: "#fff" }}
                    onClick={() => navigate("/login?redirect=/buyer/explore")}
                  >
                    <i className="fas fa-shopping-cart me-2"></i>
                    {(selectedPhoto.price || 0) > 0 ? "Buy Now" : "Download"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .explore-photo-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .explore-photo-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 48px rgba(0,0,0,0.35) !important;
        }
        .explore-load-more {
          border: 1px solid rgba(107,189,208,0.4);
          color: var(--pm-teal);
          background: rgba(107,189,208,0.06);
          transition: all 0.3s ease;
        }
        .explore-load-more:hover {
          background: rgba(107,189,208,0.15);
          box-shadow: 0 0 20px rgba(107,189,208,0.2);
          color: var(--pm-teal);
        }
        .explore-cat-pill {
          transition: all 0.2s ease;
        }
        .explore-cat-pill:hover {
          background: rgba(107,189,208,0.18) !important;
          color: #fff !important;
        }
        @media (max-width: 768px) {
          .display-3 { font-size: 2rem; }
        }
      `}</style>
    </div>
  );
};

export default Explore;
