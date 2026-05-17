import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [nextBannerIndex, setNextBannerIndex] = useState(1);
  const [isFading, setIsFading] = useState(false);

  const navigate = useNavigate();

  const bannerImages = [
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1492691527719-9d1e4e485a21?auto=format&fit=crop&w=800&q=80",
      title: "Premium Photography",
      description: "Discover breathtaking images from top photographers worldwide",
      badge: "Featured Collection",
      buttonText: "Start Exploring",
      price: "From KES 2,500"
    },
    {
      id: 2,
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
      title: "Limited Time Offer",
      description: "Get 30% off on all nature photography - this week only!",
      badge: "Summer Sale",
      buttonText: "Shop Now",
      price: "Save 30%"
    },
    {
      id: 3,
      url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80",
      title: "New Arrivals",
      description: "Fresh content added daily from emerging creators",
      badge: "Just Added",
      buttonText: "View New",
      price: "New"
    },
    {
      id: 4,
      url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
      title: "Editor's Choice",
      description: "Curated collection of award-winning photography",
      badge: "Premium Selection",
      buttonText: "Explore Collection",
      price: "Curated"
    },
    {
      id: 5,
      url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80",
      title: "Free Downloads",
      description: "Limited time: select photos available for free download",
      badge: "Free Offer",
      buttonText: "Get Free Photos",
      price: "FREE"
    }
  ];

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
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mockCategories = [
    { id: 'all', name: 'All', icon: 'fas fa-th-large', count: 1250 },
    { id: 'nature', name: 'Nature', icon: 'fas fa-leaf', count: 342 },
    { id: 'travel', name: 'Travel', icon: 'fas fa-plane', count: 289 },
    { id: 'lifestyle', name: 'Lifestyle', icon: 'fas fa-camera-retro', count: 415 },
    { id: 'food', name: 'Food', icon: 'fas fa-utensils', count: 178 },
    { id: 'architecture', name: 'Architecture', icon: 'fas fa-building', count: 234 },
    { id: 'technology', name: 'Technology', icon: 'fas fa-microchip', count: 156 },
    { id: 'portrait', name: 'Portrait', icon: 'fas fa-user', count: 198 },
    { id: 'sports', name: 'Sports', icon: 'fas fa-futbol', count: 124 },
  ];

  const mockPhotos = [
    {
      id: 1,
      title: "Mountain Serenity",
      photographer: "Alex Rivera",
      price: 29,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      likes: 234,
      downloads: 1245,
      category: "nature",
      tags: ["mountain", "nature", "landscape"],
      licenseType: "commercial",
      rating: 4.8,
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      title: "Urban Explorer",
      photographer: "Nina Patel",
      price: 39,
      image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop",
      likes: 187,
      downloads: 892,
      category: "travel",
      tags: ["city", "urban", "street"],
      licenseType: "commercial",
      rating: 4.6,
      createdAt: "2024-01-20"
    },
    {
      id: 3,
      title: "Ocean Dreams",
      photographer: "Marcus Webb",
      price: 34,
      image: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&h=400&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&h=300&fit=crop",
      likes: 312,
      downloads: 2156,
      category: "nature",
      tags: ["ocean", "beach", "waves"],
      licenseType: "commercial",
      rating: 4.9,
      createdAt: "2024-01-10"
    },
    {
      id: 4,
      title: "Forest Magic",
      photographer: "Lisa Chang",
      price: 27,
      image: "https://images.unsplash.com/photo-1426604966841-d7cdac3996e5?w=600&h=400&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1426604966841-d7cdac3996e5?w=400&h=300&fit=crop",
      likes: 156,
      downloads: 734,
      category: "nature",
      tags: ["forest", "trees", "magic"],
      licenseType: "personal",
      rating: 4.7,
      createdAt: "2024-01-18"
    },
    {
      id: 5,
      title: "City Lights",
      photographer: "David Kim",
      price: 32,
      image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&h=400&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&h=300&fit=crop",
      likes: 421,
      downloads: 3102,
      category: "architecture",
      tags: ["city", "night", "lights"],
      licenseType: "commercial",
      rating: 4.9,
      createdAt: "2024-01-05"
    },
    {
      id: 6,
      title: "Abstract Art",
      photographer: "Sofia Martinez",
      price: 45,
      image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&h=400&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=300&fit=crop",
      likes: 278,
      downloads: 1567,
      category: "lifestyle",
      tags: ["abstract", "art", "colorful"],
      licenseType: "commercial",
      rating: 4.8,
      createdAt: "2024-01-12"
    },
    {
      id: 7,
      title: "Delicious Burger",
      photographer: "Carlos Mendez",
      price: 24,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
      likes: 445,
      downloads: 2876,
      category: "food",
      tags: ["food", "burger", "delicious"],
      licenseType: "commercial",
      rating: 4.9,
      createdAt: "2024-01-08"
    },
    {
      id: 8,
      title: "Tech Workspace",
      photographer: "Emily Chen",
      price: 38,
      image: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=600&h=400&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=400&h=300&fit=crop",
      likes: 198,
      downloads: 1243,
      category: "technology",
      tags: ["technology", "workspace", "laptop"],
      licenseType: "commercial",
      rating: 4.7,
      createdAt: "2024-01-14"
    }
  ];

  useEffect(() => {
    setTimeout(() => {
      setPhotos(mockPhotos);
      setCategories(mockCategories);
      setLoading(false);
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedCategory !== 'all') {
      setSearchParams({ category: selectedCategory });
    } else {
      setSearchParams({});
    }
  }, [selectedCategory, setSearchParams]);

  const filteredPhotos = photos.filter(photo => {
    const matchesCategory = selectedCategory === 'all' || photo.category === selectedCategory;
    const matchesPrice = photo.price >= priceRange[0] && photo.price <= priceRange[1];
    const matchesSearch = photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          photo.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesPrice && matchesSearch;
  });

  const sortedPhotos = [...filteredPhotos].sort((a, b) => {
    switch(sortBy) {
      case 'newest': return new Date(b.createdAt) - new Date(a.createdAt);
      case 'popular': return b.likes - a.likes;
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      default: return 0;
    }
  });

  return (
    <div className="dash-shell">
      {/* Navigation */}
      <nav className="glass-navbar navbar navbar-expand-lg fixed-top w-100 py-3" style={{ zIndex: 1000 }}>
        <div className="container px-3 px-lg-4">
          <Link to="/" className="navbar-brand fw-bold text-decoration-none d-flex align-items-center gap-2">
            <div className="d-flex align-items-center justify-content-center rounded-circle"
                 style={{ width: 40, height: 40, background: "rgba(107,189,208,0.15)", border: "1px solid rgba(107,189,208,0.3)" }}>
              <i className="fas fa-camera" style={{ color: "var(--pm-teal)" }}></i>
            </div>
            <span className="fs-5 fw-bold" style={{ fontFamily: "var(--font-serif)", color: "#fff" }}>
              Photo<span style={{ color: "var(--pm-teal)" }}>Market</span>
            </span>
          </Link>

          <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#exploreNav">
            <i className="fas fa-bars fs-4" style={{ color: "var(--pm-teal)" }}></i>
          </button>

          <div className="collapse navbar-collapse" id="exploreNav">
            <ul className="navbar-nav ms-auto align-items-center gap-2 gap-lg-3">
              <li className="nav-item">
                <Link className="nav-link px-3 py-2 rounded-pill" style={{ color: "rgba(255,255,255,0.8)" }} to="/explore">
                  <i className="fas fa-compass me-1"></i> Explore
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link px-3 py-2 rounded-pill" style={{ color: "rgba(255,255,255,0.8)" }} to="/pricing">
                  <i className="fas fa-tag me-1"></i> Pricing
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link px-3 py-2 rounded-pill" style={{ color: "rgba(255,255,255,0.8)" }} to="/become-seller">
                  <i className="fas fa-crown me-1"></i> Sell
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/login">
                  <button className="btn rounded-pill px-4 py-2"
                    style={{ border: "1px solid rgba(107,189,208,0.5)", color: "var(--pm-teal)", background: "transparent" }}>
                    <i className="fas fa-sign-in-alt me-2"></i> Sign In
                  </button>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/register">
                  <button className="btn rounded-pill px-4 py-2 fw-semibold"
                    style={{ background: "var(--pm-teal)", color: "#fff" }}>
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
          <div className={`${!isMobile ? 'col-lg-9' : 'col-12'}`}>

            {/* Hero Section */}
            <div className="text-center mb-5">
              <div className="d-inline-flex align-items-center gap-2 rounded-pill px-4 py-2 mb-4"
                   style={{ background: "rgba(107,189,208,0.12)", border: "1px solid rgba(107,189,208,0.25)" }}>
                <i className="fas fa-images" style={{ color: "var(--pm-teal)" }}></i>
                <span className="small fw-semibold" style={{ color: "var(--pm-teal)" }}>50,000+ Premium Photos</span>
              </div>
              <h1 className="display-3 fw-bold mb-3" style={{
                fontFamily: "var(--font-serif)",
                background: "linear-gradient(135deg, #fff 0%, var(--pm-teal) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}>
                Discover Stunning <br className="d-none d-sm-block" />Visual Stories
              </h1>
              <p className="lead mb-4" style={{ color: "rgba(255,255,255,0.5)", maxWidth: "600px", margin: "0 auto" }}>
                Browse millions of high-quality photos from talented creators around the world
              </p>

              {/* Search Bar */}
              <div className="position-relative mx-auto" style={{ maxWidth: "500px" }}>
                <div className="input-group">
                  <span className="input-group-text rounded-start-pill ps-4"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(107,189,208,0.3)", borderRight: "none", color: "var(--pm-teal)" }}>
                    <i className="fas fa-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Search photos, categories, or creators..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(107,189,208,0.3)",
                      borderLeft: "none",
                      borderRight: "none",
                      color: "#fff"
                    }}
                  />
                  <button className="btn rounded-end-pill px-4"
                          style={{ background: "var(--pm-teal)", color: "#fff", border: "none" }}
                          onClick={() => setSearchQuery(searchQuery)}>
                    <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Category Pills */}
            <div className="mb-5">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="fw-bold mb-0" style={{ color: "#fff" }}>
                  <i className="fas fa-th-large me-2" style={{ color: "var(--pm-teal)" }}></i>
                  Categories
                </h5>
                <span className="small" style={{ color: "rgba(255,255,255,0.4)" }}>{filteredPhotos.length} results</span>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className="btn rounded-pill px-4 py-2 explore-cat-pill"
                    style={{
                      fontSize: "0.88rem",
                      background: selectedCategory === category.id
                        ? "var(--pm-teal)"
                        : "rgba(107,189,208,0.08)",
                      border: selectedCategory === category.id
                        ? "1px solid var(--pm-teal)"
                        : "1px solid rgba(107,189,208,0.25)",
                      color: selectedCategory === category.id
                        ? "#fff"
                        : "rgba(255,255,255,0.65)"
                    }}
                  >
                    <i className={`${category.icon} me-2`}></i>
                    {category.name}
                    <span className="ms-2" style={{ opacity: 0.65 }}>({category.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filters Bar */}
            <div className="glass-card p-3 mb-4">
              <div className="row g-3 align-items-center">
                <div className="col-md-4">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="form-select rounded-pill"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(107,189,208,0.3)",
                      color: "#fff"
                    }}
                  >
                    <option value="newest" style={{ background: "#1a2e3b" }}>Newest First</option>
                    <option value="popular" style={{ background: "#1a2e3b" }}>Most Popular</option>
                    <option value="price-low" style={{ background: "#1a2e3b" }}>Price: Low to High</option>
                    <option value="price-high" style={{ background: "#1a2e3b" }}>Price: High to Low</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <div className="btn-group w-100">
                    <button
                      onClick={() => setViewMode('grid')}
                      className="btn rounded-start-pill"
                      style={{
                        background: viewMode === 'grid' ? "var(--pm-teal)" : "rgba(107,189,208,0.08)",
                        border: "1px solid rgba(107,189,208,0.3)",
                        color: viewMode === 'grid' ? "#fff" : "rgba(255,255,255,0.6)"
                      }}
                    >
                      <i className="fas fa-th-large me-2"></i> Grid
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className="btn rounded-end-pill"
                      style={{
                        background: viewMode === 'list' ? "var(--pm-teal)" : "rgba(107,189,208,0.08)",
                        border: "1px solid rgba(107,189,208,0.3)",
                        color: viewMode === 'list' ? "#fff" : "rgba(255,255,255,0.6)"
                      }}
                    >
                      <i className="fas fa-list me-2"></i> List
                    </button>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-center gap-3">
                    <span className="small" style={{ color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap" }}>Max Price:</span>
                    <input
                      type="range"
                      className="form-range flex-grow-1"
                      min="0"
                      max="100"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    />
                    <span className="fw-bold" style={{ color: "var(--pm-teal)", whiteSpace: "nowrap" }}>KES {priceRange[1]}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Photo Grid */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border mb-3" style={{ width: "3rem", height: "3rem", color: "var(--pm-teal)" }}></div>
                <p style={{ color: "rgba(255,255,255,0.4)" }}>Loading amazing photos...</p>
              </div>
            ) : sortedPhotos.length > 0 ? (
              <div className={viewMode === 'grid' ? 'row g-4' : 'd-flex flex-column gap-4'}>
                {sortedPhotos.map(photo => (
                  <div key={photo.id} className={viewMode === 'grid' ? 'col-md-6 col-lg-4' : 'col-12'}>
                    <div
                      className="glass-card overflow-hidden explore-photo-card"
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/login?redirect=/photos/${photo.id}`)}
                    >
                      <div className="position-relative overflow-hidden" style={{ height: viewMode === 'list' ? "200px" : "240px" }}>
                        <img
                          src={photo.thumbnail}
                          alt={photo.title}
                          className="w-100 h-100 explore-photo-img"
                          style={{ objectFit: "cover", transition: "transform 0.5s ease" }}
                        />
                        <div className="position-absolute top-0 end-0 m-3">
                          <span className="badge rounded-pill px-3 py-2 fw-bold"
                                style={{ background: "rgba(15,30,40,0.85)", color: "var(--pm-teal)", border: "1px solid rgba(107,189,208,0.4)" }}>
                            KES {photo.price}
                          </span>
                        </div>
                        {photo.rating >= 4.8 && (
                          <div className="position-absolute top-0 start-0 m-3">
                            <span className="badge rounded-pill px-3 py-2"
                                  style={{ background: "rgba(107,189,208,0.2)", color: "var(--pm-teal)", border: "1px solid rgba(107,189,208,0.35)" }}>
                              <i className="fas fa-crown me-1"></i> Editor's Pick
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h6 className="fw-bold mb-1 text-white">{photo.title}</h6>
                            <p className="small mb-0" style={{ color: "rgba(255,255,255,0.45)" }}>
                              <i className="fas fa-user-circle me-1"></i> {photo.photographer}
                            </p>
                          </div>
                          <button className="btn btn-sm btn-link p-0" style={{ color: "rgba(255,255,255,0.4)" }}>
                            <i className="far fa-heart"></i>
                          </button>
                        </div>
                        <div className="d-flex gap-2 mb-3">
                          {photo.tags.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="badge rounded-pill px-2 py-1 small"
                                  style={{ background: "rgba(107,189,208,0.1)", color: "rgba(107,189,208,0.8)", border: "1px solid rgba(107,189,208,0.2)" }}>
                              #{tag}
                            </span>
                          ))}
                          {photo.tags.length > 2 && (
                            <span className="badge rounded-pill px-2 py-1 small"
                                  style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
                              +{photo.tags.length - 2}
                            </span>
                          )}
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex gap-3 small" style={{ color: "rgba(255,255,255,0.45)" }}>
                            <span><i className="fas fa-heart me-1" style={{ color: "#e57373" }}></i>{photo.likes}</span>
                            <span><i className="fas fa-download me-1"></i>{photo.downloads}</span>
                            <span><i className="fas fa-star me-1" style={{ color: "var(--pm-teal)" }}></i>{photo.rating}</span>
                          </div>
                          <button className="btn btn-sm rounded-pill px-3"
                                  style={{ background: "var(--pm-teal)", color: "#fff", fontSize: "0.8rem" }}>
                            <i className="fas fa-shopping-cart me-1"></i> Buy
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="fas fa-search fa-3x mb-3" style={{ color: "rgba(107,189,208,0.4)" }}></i>
                <h4 style={{ color: "rgba(255,255,255,0.5)" }}>No photos found</h4>
                <p style={{ color: "rgba(255,255,255,0.35)" }}>Try adjusting your filters or search query</p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setPriceRange([0, 100]);
                  }}
                  className="btn rounded-pill px-4 mt-3"
                  style={{ background: "var(--pm-teal)", color: "#fff" }}
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Load More */}
            {sortedPhotos.length > 0 && (
              <div className="text-center mt-5">
                <button className="btn rounded-pill px-5 py-3 explore-load-more">
                  <i className="fas fa-sync-alt me-2"></i>
                  Load More Photos
                </button>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          {!isMobile && (
            <div className="col-lg-3">
              <div className="position-sticky" style={{ top: "100px" }}>

                {/* Fading Banner */}
                <div className="position-relative rounded-4 overflow-hidden mb-4"
                     style={{ height: "500px", background: "#0a1520", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
                  <div
                    className="position-absolute w-100 h-100"
                    style={{
                      backgroundImage: `url(${bannerImages[currentBannerIndex].url})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      transition: "opacity 0.8s ease-in-out",
                      opacity: isFading ? 0 : 1,
                      zIndex: 1
                    }}
                  >
                    <div className="position-absolute w-100 h-100"
                         style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(10,21,32,0.95) 100%)" }}></div>
                  </div>

                  <div
                    className="position-absolute w-100 h-100"
                    style={{
                      backgroundImage: `url(${bannerImages[nextBannerIndex].url})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      transition: "opacity 0.8s ease-in-out",
                      opacity: isFading ? 1 : 0,
                      zIndex: 0
                    }}
                  >
                    <div className="position-absolute w-100 h-100"
                         style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(10,21,32,0.95) 100%)" }}></div>
                  </div>

                  <div className="position-relative h-100 d-flex flex-column justify-content-end p-4" style={{ zIndex: 2 }}>
                    <div className="badge rounded-pill mb-3 align-self-start px-3 py-2"
                         style={{ background: "rgba(107,189,208,0.2)", color: "var(--pm-teal)", border: "1px solid rgba(107,189,208,0.4)" }}>
                      <i className="fas fa-star me-1"></i> {bannerImages[currentBannerIndex].badge}
                    </div>
                    <h3 className="fw-bold mb-2 text-white" style={{ fontFamily: "var(--font-serif)" }}>
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
                        onClick={() => navigate('/register')}
                      >
                        {bannerImages[currentBannerIndex].buttonText}
                      </button>
                    </div>
                  </div>

                  <div className="position-absolute bottom-0 start-0 end-0 d-flex justify-content-center gap-2 pb-3" style={{ zIndex: 3 }}>
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
                          background: currentBannerIndex === idx ? "var(--pm-teal)" : "rgba(255,255,255,0.3)",
                          cursor: "pointer",
                          transition: "all 0.3s ease"
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Community Card */}
                <div className="glass-stat rounded-4 p-4 mb-4 text-center">
                  <div className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3"
                       style={{ width: 56, height: 56, background: "rgba(107,189,208,0.15)", border: "1px solid rgba(107,189,208,0.25)" }}>
                    <i className="fas fa-chart-line fs-4" style={{ color: "var(--pm-teal)" }}></i>
                  </div>
                  <h5 className="fw-bold mb-1 text-white" style={{ fontFamily: "var(--font-serif)" }}>
                    Join Our Community
                  </h5>
                  <p className="small mb-3" style={{ color: "rgba(255,255,255,0.45)" }}>50,000+ active creators</p>
                  <button className="btn rounded-pill w-100 fw-semibold"
                          style={{ background: "var(--pm-teal)", color: "#fff" }}
                          onClick={() => navigate('/register')}>
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
                    {["nature", "sunset", "cityscape", "portrait", "wildlife", "abstract", "vintage", "minimal"].map((tag, idx) => (
                      <button
                        key={idx}
                        className="btn btn-sm rounded-pill px-3 py-1"
                        style={{
                          background: "rgba(107,189,208,0.08)",
                          border: "1px solid rgba(107,189,208,0.25)",
                          color: "rgba(107,189,208,0.85)",
                          fontSize: "0.78rem"
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

      <style>{`
        .explore-photo-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border-radius: var(--radius-lg) !important;
        }
        .explore-photo-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 48px rgba(0,0,0,0.35) !important;
        }
        .explore-photo-img:hover {
          transform: scale(1.05);
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
          .display-3 {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Explore;
