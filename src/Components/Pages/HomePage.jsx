import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Link } from "react-router-dom";
import { getAllMedia } from "../../api/API";
import ThemeToggle from "../ThemeToggle";

const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [apiMedia, setApiMedia] = useState([]);
  const [apiError, setApiError] = useState(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);

    const fetchApiMedia = async () => {
      try {
        const response = await getAllMedia();
        const data = Array.isArray(response?.data?.media)
          ? response.data.media
          : Array.isArray(response?.data)
            ? response.data
            : [];
        setApiMedia(data);
      } catch (error) {
        setApiError(error?.response?.data?.message || error.message || "Failed to load media");
      } finally {
        setApiLoading(false);
      }
    };
    fetchApiMedia();

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const categories = [
    { name: "Nature",       icon: "fas fa-leaf",         count: "12.5k" },
    { name: "Travel",       icon: "fas fa-plane",         count: "8.2k"  },
    { name: "Lifestyle",    icon: "fas fa-camera-retro",  count: "15.3k" },
    { name: "Food",         icon: "fas fa-utensils",      count: "6.7k"  },
    { name: "Architecture", icon: "fas fa-building",      count: "9.1k"  },
    { name: "Technology",   icon: "fas fa-microchip",     count: "5.8k"  },
    { name: "Portrait",     icon: "fas fa-user",          count: "11.2k" },
    { name: "Sports",       icon: "fas fa-futbol",        count: "4.5k"  },
  ];

  const howItWorks = [
    { title: "Browse Collection", icon: "fas fa-compass",    description: "Explore thousands of high-quality photos from talented creators worldwide." },
    { title: "Secure Purchase",   icon: "fas fa-shield-alt", description: "Safe and encrypted payments with multiple payment options available." },
    { title: "Instant Access",    icon: "fas fa-bolt",       description: "Download your purchased photos immediately in full resolution." },
  ];

  const testimonials = [
    { name: "Sarah Johnson",  role: "Creative Director", feedback: "The quality is exceptional. It has completely transformed our marketing materials.", avatar: "https://randomuser.me/api/portraits/women/44.jpg", rating: 5 },
    { name: "Michael Chen",   role: "Travel Blogger",    feedback: "Fair revenue for photographers and affordable prices. A win-win for everyone.", avatar: "https://randomuser.me/api/portraits/men/46.jpg", rating: 5 },
    { name: "Emma Williams",  role: "Graphic Designer",  feedback: "Intuitive platform with stunning visuals. My go-to source for client projects.", avatar: "https://randomuser.me/api/portraits/women/63.jpg", rating: 5 },
  ];

  const featuredPhotos = [
    { id: 1, title: "Mountain Serenity", photographer: "Alex Rivera",    price: "3,750", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop", likes: 234 },
    { id: 2, title: "Urban Explorer",    photographer: "Nina Patel",     price: "5,050", image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop", likes: 187 },
    { id: 3, title: "Ocean Dreams",      photographer: "Marcus Webb",    price: "4,400", image: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&h=400&fit=crop", likes: 312 },
    { id: 4, title: "Forest Magic",      photographer: "Lisa Chang",     price: "3,500", image: "https://images.unsplash.com/photo-1426604966841-d7cdac3996e5?w=600&h=400&fit=crop", likes: 156 },
    { id: 5, title: "City Lights",       photographer: "David Kim",      price: "4,150", image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&h=400&fit=crop", likes: 421 },
    { id: 6, title: "Abstract Art",      photographer: "Sofia Martinez", price: "5,850", image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&h=400&fit=crop", likes: 278 },
  ];

  const stats = [
    { value: "50K+",  label: "Photos"       },
    { value: "10K+",  label: "Customers"    },
    { value: "2.5K+", label: "Photographers"},
    { value: "150+",  label: "Countries"    },
  ];

  const displayedPhotos = apiMedia.length > 0 ? apiMedia.slice(0, 6) : featuredPhotos;

  const SkeletonBox = ({ width, height, className = "" }) => (
    <div className={`skeleton-box ${className}`} style={{ width: width || "100%", height: height || "20px" }} />
  );

  return (
    <div className="home-page-shell">

      {/* ── Navbar ── */}
      <nav className={`navbar navbar-expand-lg fixed-top home-navbar ${scrollY > 60 ? "scrolled" : ""}`}>
        <div className="container">

          {/* Brand */}
          <Link to="/" className="navbar-brand">
            <div className="home-nav-logo-icon">
              <i className="fas fa-camera"></i>
            </div>
            <span className="home-nav-brand-text">
              Photo<span className="home-nav-brand-accent">Market</span>
            </span>
          </Link>

          {/* Mobile toggle */}
          <button
            className="navbar-toggler navbar-toggler-home border-0 d-lg-none"
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Links + buttons */}
          <div className={`collapse navbar-collapse home-navbar-collapse ${menuOpen ? "show" : ""}`} id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-1 py-2 py-lg-0">
              {[
                { to: "/explore",       label: "Explore"     },
                { to: "/become-seller", label: "Sell Photos" },
                { to: "/pricing",       label: "Pricing"     },
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
              <li className="nav-item ms-lg-1">
                <ThemeToggle />
              </li>
            </ul>
          </div>

        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="home-hero pt-5">
        {/* Decorative blobs */}
        <div className="home-deco home-deco-1"></div>
        <div className="home-deco home-deco-2"></div>
        <div className="home-deco home-deco-3"></div>

        <div className="container home-hero-content py-5 mt-4">
          <div className="row align-items-center gy-5">
            {/* Text col */}
            <div className="col-12 col-lg-6 text-center text-lg-start">
              {loading ? (
                <div className="placeholder-glow">
                  <SkeletonBox height="16px" width="120px" className="mb-3 rounded-pill mx-auto mx-lg-0" />
                  <SkeletonBox height="60px" width="90%" className="mb-2" />
                  <SkeletonBox height="60px" width="75%" className="mb-4" />
                  <SkeletonBox height="18px" width="80%" className="mb-1" />
                  <SkeletonBox height="18px" width="65%" className="mb-4" />
                  <div className="d-flex gap-3 justify-content-center justify-content-lg-start">
                    <SkeletonBox height="46px" width="148px" className="rounded-pill" />
                    <SkeletonBox height="46px" width="120px" className="rounded-pill" />
                  </div>
                </div>
              ) : (
                <div className="fade-in-up">
                  <span className="section-label" style={{ color: "rgba(255,255,255,0.7)" }}>
                    Trusted by 10,000+ Creators
                  </span>
                  <h1 className="home-hero-heading mb-3">
                    <em>Discover</em> photos<br />
                    you'll truly love.
                  </h1>
                  <p className="home-hero-sub mb-4">
                    High-quality stock photography from the world's most talented creators. License instantly, use everywhere.
                  </p>
                  <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
                    <Link to="/explore">
                      <button className="home-nav-cta btn px-4 py-2" style={{ fontSize: "0.95rem" }}>
                        Start Exploring
                      </button>
                    </Link>
                    <Link to="/register">
                      <button className="btn px-4 py-2 rounded-pill" style={{ background: "rgba(255,255,255,0.18)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.5)", backdropFilter: "blur(8px)", fontSize: "0.95rem" }}>
                        Sell Your Photos
                      </button>
                    </Link>
                  </div>

                  {/* Stats */}
                  <div className="row g-3 mt-4 pt-2">
                    {stats.map((s, i) => (
                      <div key={i} className="col-6 col-sm-3 col-lg-3 text-center text-lg-start">
                        <div className="home-stat-val" style={{ color: "#fff" }}>{s.value}</div>
                        <div className="home-stat-label" style={{ color: "rgba(255,255,255,0.65)" }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Hero image col */}
            <div className="col-12 col-lg-6 d-flex justify-content-center justify-content-lg-end home-hero-img-wrap">
              <div style={{ position: "relative", width: "100%", maxWidth: "520px" }}>
                <img
                  src="https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=700&h=820&fit=crop&crop=faces"
                  alt="Professional photographer"
                  style={{
                    width: "100%",
                    height: "clamp(340px, 55vw, 560px)",
                    objectFit: "cover",
                    borderRadius: "var(--radius-xl)",
                    boxShadow: "0 30px 80px rgba(26,46,59,0.3)",
                  }}
                />
                {/* Floating badge */}
                <div style={{
                  position: "absolute", bottom: "2rem", left: "-1.5rem",
                  background: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(12px)",
                  borderRadius: "var(--radius-lg)",
                  padding: "0.85rem 1.25rem",
                  boxShadow: "0 8px 32px rgba(26,46,59,0.2)",
                  minWidth: "180px",
                }}>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "var(--pm-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.3rem" }}>New this week</div>
                  <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.05rem", fontWeight: 700, color: "var(--pm-navy)" }}>2,400+ photos</div>
                  <div style={{ color: "var(--pm-teal)", fontSize: "0.78rem", marginTop: "0.2rem" }}>
                    <i className="fas fa-arrow-up me-1"></i>+18% from last week
                  </div>
                </div>
                {/* Second badge */}
                <div style={{
                  position: "absolute", top: "1.5rem", right: "-1rem",
                  background: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(12px)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.65rem 1rem",
                  boxShadow: "0 8px 24px rgba(26,46,59,0.18)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--pm-success)" }}></div>
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", fontWeight: 600, color: "var(--pm-navy)" }}>Instant Download</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Section 1: text left / product right ── */}
      <section className="home-feature py-5 py-lg-6" style={{ paddingTop: "6rem", paddingBottom: "6rem" }}>
        <div className="container">
          <div className="row align-items-center gy-5">
            <div className="col-12 col-lg-5">
              <span className="section-label">For Buyers</span>
              <div className="divider-teal"></div>
              <h2 className="home-feature-heading">
                Get curated photos<br />
                <em>styled to perfection.</em>
              </h2>
              <p className="home-feature-body">
                Browse an ever-growing library of premium, licensed photography. Filter by category, mood, or colour palette — and download the moment you buy.
              </p>
              <div className="d-flex flex-wrap gap-3 align-items-center">
                <Link to="/explore">
                  <button className="btn-pm-dark btn px-4 py-2">Start Exploring</button>
                </Link>
                <Link to="/register" className="btn-pm-ghost">
                  Create free account <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            </div>
            <div className="col-12 col-lg-7">
              <div style={{ position: "relative" }}>
                <img
                  src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=520&fit=crop"
                  alt="Curated photography collection"
                  className="home-feature-img"
                />
                {/* Overlapping mini-card */}
                <div style={{
                  position: "absolute", bottom: "2rem", left: "2rem",
                  background: "rgba(255,255,255,0.96)",
                  backdropFilter: "blur(12px)",
                  borderRadius: "var(--radius-lg)",
                  padding: "1.1rem 1.4rem",
                  boxShadow: "var(--shadow-lg)",
                  maxWidth: "220px",
                }}>
                  <div style={{ display: "flex", gap: "0.6rem", marginBottom: "0.5rem" }}>
                    {["#C8E8F0","#A8D8E8","#6BBDD0"].map((c,i) => (
                      <div key={i} style={{ width: 28, height: 28, borderRadius: "50%", background: c, border: "2px solid #fff" }}></div>
                    ))}
                  </div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--pm-text-muted)" }}>50k+ licensed images</div>
                  <div style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", fontWeight: 700, color: "var(--pm-navy)" }}>All categories</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Section 2: image left / text right ── */}
      <section className="home-feature alt py-5" style={{ paddingTop: "6rem", paddingBottom: "6rem" }}>
        <div className="container">
          <div className="row align-items-center gy-5 flex-lg-row-reverse">
            <div className="col-12 col-lg-5">
              <span className="section-label">For Photographers</span>
              <div className="divider-teal"></div>
              <h2 className="home-feature-heading">
                Publish &amp; earn<br />
                <em>from your work.</em>
              </h2>
              <p className="home-feature-body">
                Upload your best shots, set your price, and reach buyers worldwide. Keep up to 70% of every sale — we handle payments, licensing and delivery.
              </p>
              <div className="d-flex flex-wrap gap-3 align-items-center">
                <Link to="/register">
                  <button className="btn-pm-teal btn px-4 py-2">Start Selling</button>
                </Link>
                <Link to="/explore" className="btn-pm-ghost">
                  View top sellers <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            </div>
            <div className="col-12 col-lg-7">
              <div style={{ position: "relative" }}>
                <img
                  src="https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=800&h=520&fit=crop"
                  alt="Photographer at work"
                  className="home-feature-img"
                  style={{ background: "var(--pm-teal-bg)" }}
                />
                {/* Revenue badge */}
                <div style={{
                  position: "absolute", top: "2rem", right: "2rem",
                  background: "rgba(255,255,255,0.96)",
                  backdropFilter: "blur(12px)",
                  borderRadius: "var(--radius-lg)",
                  padding: "1.1rem 1.4rem",
                  boxShadow: "var(--shadow-lg)",
                }}>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "var(--pm-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.3rem" }}>Monthly earnings</div>
                  <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 700, color: "var(--pm-navy)" }}>KES 284,000</div>
                  <div style={{ color: "var(--pm-success)", fontSize: "0.78rem" }}>
                    <i className="fas fa-arrow-up me-1"></i>+24% this month
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Photos Grid ── */}
      <section className="py-5" style={{ paddingTop: "5rem", paddingBottom: "5rem", background: "var(--pm-white)" }}>
        <div className="container">
          <div className="text-center mb-5">
            <span className="section-label">Trending Now</span>
            <h2 className="home-feature-heading" style={{ fontSize: "clamp(1.8rem,3.5vw,2.6rem)" }}>Featured Photos</h2>
            <p style={{ color: "var(--pm-text-muted)", maxWidth: 480, margin: "0 auto", fontSize: "0.95rem" }}>
              Most popular photos this week, handpicked by our curators.
            </p>
          </div>

          <div className="row g-3 g-md-4">
            {apiError && (
              <div className="col-12">
                <div className="alert alert-warning text-center small">{apiError}</div>
              </div>
            )}
            {apiLoading
              ? [1,2,3,4,5,6].map(i => (
                  <div key={i} className="col-6 col-md-4">
                    <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--pm-gray-200)" }}>
                      <SkeletonBox height="220px" />
                      <div style={{ padding: "0.85rem" }}>
                        <SkeletonBox height="16px" width="70%" className="mb-2" />
                        <SkeletonBox height="13px" width="50%" />
                      </div>
                    </div>
                  </div>
                ))
              : displayedPhotos.map((photo, idx) => (
                  <div key={idx} className="col-6 col-md-4">
                    <div className="home-photo-card">
                      <div style={{ position: "relative", overflow: "hidden" }}>
                        <img
                          src={photo.image}
                          className="home-photo-card-img"
                          alt={photo.title}
                        />
                        <span style={{
                          position: "absolute", top: "0.65rem", right: "0.65rem",
                          background: "var(--pm-navy)", color: "#fff",
                          borderRadius: "var(--radius-pill)",
                          fontSize: "0.75rem", fontWeight: 600,
                          padding: "0.2rem 0.65rem",
                        }}>
                          KES {photo.price || 0}
                        </span>
                      </div>
                      <div style={{ padding: "0.85rem 1rem" }}>
                        <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--pm-navy)", marginBottom: "0.25rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {photo.title}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <small style={{ color: "var(--pm-text-muted)", fontSize: "0.78rem" }}>
                            <i className="fas fa-camera me-1" style={{ color: "var(--pm-teal)" }}></i>
                            {photo.photographer?.username || photo.photographer || "Unknown"}
                          </small>
                          <small style={{ color: "var(--pm-text-muted)", fontSize: "0.78rem" }}>
                            <i className="fas fa-heart me-1" style={{ color: "#E85555" }}></i>
                            {photo.likes || 0}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
          </div>

          <div className="text-center mt-5">
            <Link to="/explore">
              <button className="btn-pm-outline btn px-5 py-2">
                View All Photos <i className="fas fa-arrow-right ms-2"></i>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ background: "var(--pm-teal-pale)", paddingTop: "5.5rem", paddingBottom: "5.5rem" }}>
        <div className="container">
          <div className="text-center mb-5">
            <span className="section-label">Simple Process</span>
            <h2 className="home-feature-heading" style={{ fontSize: "clamp(1.8rem,3.5vw,2.6rem)" }}>How It Works</h2>
            <p style={{ color: "var(--pm-text-muted)", maxWidth: 460, margin: "0 auto", fontSize: "0.95rem" }}>
              Three easy steps to start exploring or selling on Relic Snap.
            </p>
          </div>
          <div className="row g-4">
            {howItWorks.map((item, idx) => (
              <div key={idx} className="col-12 col-md-4">
                <div className="home-step-card">
                  <div className="home-step-icon">
                    <i className={item.icon}></i>
                  </div>
                  <div className="home-step-num">{idx + 1}</div>
                  <div className="home-step-title">{item.title}</div>
                  <div className="home-step-body">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section style={{ background: "var(--pm-white)", paddingTop: "5.5rem", paddingBottom: "5.5rem" }}>
        <div className="container">
          <div className="text-center mb-5">
            <span className="section-label">Browse by Theme</span>
            <h2 className="home-feature-heading" style={{ fontSize: "clamp(1.8rem,3.5vw,2.6rem)" }}>Explore by Category</h2>
          </div>
          <div className="row g-3">
            {categories.map((cat, idx) => (
              <div key={idx} className="col-6 col-sm-4 col-md-3">
                <Link to={`/explore?category=${cat.name.toLowerCase()}`} className="home-cat-card">
                  <div className="home-cat-icon"><i className={cat.icon}></i></div>
                  <div className="home-cat-name">{cat.name}</div>
                  <div className="home-cat-count">{cat.count} photos</div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ background: "var(--pm-cream)", paddingTop: "5.5rem", paddingBottom: "5.5rem" }}>
        <div className="container">
          <div className="text-center mb-5">
            <span className="section-label">Community Love</span>
            <h2 className="home-feature-heading" style={{ fontSize: "clamp(1.8rem,3.5vw,2.6rem)" }}>What Our Users Say</h2>
          </div>
          <div className="row g-4">
            {testimonials.map((t, idx) => (
              <div key={idx} className="col-12 col-md-4">
                <div className="home-testi-card">
                  <div className="home-testi-stars">
                    {[...Array(t.rating)].map((_, i) => <i key={i} className="fas fa-star me-1"></i>)}
                  </div>
                  <p className="home-testi-quote">"{t.feedback}"</p>
                  <div className="d-flex align-items-center gap-3">
                    <img src={t.avatar} alt={t.name} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--pm-teal-light)" }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--pm-navy)" }}>{t.name}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--pm-text-muted)" }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA / Newsletter ── */}
      <section className="home-cta-section" style={{ paddingTop: "6rem", paddingBottom: "6rem" }}>
        <div className="container text-center position-relative" style={{ zIndex: 1 }}>
          <span className="section-label" style={{ color: "rgba(107,189,208,0.9)" }}>Get Started Today</span>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 700, color: "#fff", lineHeight: 1.2, marginBottom: "1.25rem" }}>
            Premium photos,<br />
            <em style={{ fontStyle: "italic", color: "var(--pm-teal-light)" }}>built for creators like you.</em>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1rem", maxWidth: 460, margin: "0 auto 2rem", lineHeight: 1.7 }}>
            Join Relic Snap today and get instant access to thousands of high-quality, licensed photos — or start earning from your own photography.
          </p>
          <div className="d-flex flex-wrap gap-3 justify-content-center">
            <Link to="/register">
              <button style={{
                background: "#fff", color: "var(--pm-navy)",
                border: "none", borderRadius: "var(--radius-pill)",
                padding: "0.8rem 2rem", fontWeight: 600, fontSize: "0.95rem",
                transition: "var(--ease)", cursor: "pointer",
              }}
              onMouseOver={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseOut={e => e.currentTarget.style.transform = ""}
              >
                <i className="fas fa-user-plus me-2"></i>Sign Up Free
              </button>
            </Link>
            <Link to="/explore">
              <button style={{
                background: "transparent", color: "#fff",
                border: "1.5px solid rgba(255,255,255,0.45)",
                borderRadius: "var(--radius-pill)",
                padding: "0.8rem 2rem", fontWeight: 500, fontSize: "0.95rem",
                transition: "var(--ease)", cursor: "pointer", backdropFilter: "blur(8px)",
              }}
              onMouseOver={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.7)"; }}
              onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.45)"; }}
              >
                <i className="fas fa-compass me-2"></i>Browse Gallery
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="home-footer" style={{ paddingTop: "4rem", paddingBottom: "2rem" }}>
        <div className="container">
          <div className="row g-4 pb-4">
            {/* Brand */}
            <div className="col-12 col-md-4">
              <div className="home-footer-brand d-flex align-items-center gap-2 mb-3">
                <i className="fas fa-camera" style={{ color: "var(--pm-teal)", fontSize: "1.1rem" }}></i>
                Relic Snap
              </div>
              <p style={{ fontSize: "0.88rem", color: "var(--pm-text-muted)", maxWidth: 260, lineHeight: 1.7 }}>
                Premium stock photos from the world's most talented photographers.
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

            {/* Company links */}
            <div className="col-6 col-md-2">
              <div className="home-footer-heading">Company</div>
              <ul className="list-unstyled mb-0">
                {[["About Us","/about"],["Careers","/careers"],["Press","/press"],["Blog","/blog"]].map(([label,to]) => (
                  <li key={to} className="mb-2"><Link to={to}>{label}</Link></li>
                ))}
              </ul>
            </div>

            {/* Resource links */}
            <div className="col-6 col-md-2">
              <div className="home-footer-heading">Resources</div>
              <ul className="list-unstyled mb-0">
                {[["Help Center","/help"],["Become a Seller","/become-seller"],["API Docs","/api"],["License Info","/license"]].map(([label,to]) => (
                  <li key={to} className="mb-2"><Link to={to}>{label}</Link></li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div className="col-12 col-md-4">
              <div className="home-footer-heading">Stay Updated</div>
              <p style={{ fontSize: "0.88rem", color: "var(--pm-text-muted)", marginBottom: "0.85rem" }}>
                New photos and exclusive deals delivered to your inbox.
              </p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="email"
                  placeholder="Your email address"
                  style={{
                    flex: 1, padding: "0.65rem 1rem",
                    border: "1px solid var(--pm-gray-200)",
                    borderRadius: "var(--radius-pill)",
                    fontFamily: "var(--font-sans)", fontSize: "0.88rem",
                    background: "var(--pm-cream)", color: "var(--pm-text)",
                    outline: "none",
                  }}
                />
                <button style={{
                  background: "var(--pm-navy)", color: "#fff",
                  border: "none", borderRadius: "var(--radius-pill)",
                  padding: "0.65rem 1.1rem", cursor: "pointer", flexShrink: 0,
                }}>
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </div>

          <hr style={{ borderColor: "var(--pm-gray-200)", margin: "1.5rem 0 1rem" }} />
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
            <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--pm-text-muted)" }}>
              &copy; {new Date().getFullYear()} Relic Snap. All rights reserved.
            </p>
            <div className="d-flex gap-3">
              {[["Privacy Policy","/privacy"],["Terms of Service","/terms"],["Cookie Policy","/cookies"]].map(([label,to]) => (
                <Link key={to} to={to} style={{ fontSize: "0.82rem", color: "var(--pm-text-muted)" }}>{label}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
