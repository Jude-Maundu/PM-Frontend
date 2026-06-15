import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Link } from "react-router-dom";
import { getAllMedia } from "../../api/API";
import ThemeToggle from "../ThemeToggle";
import { Helmet } from "react-helmet-async";
import FaceSearchModal from "../FaceSearchModal";

const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [apiMedia, setApiMedia] = useState([]);
  const [apiError, setApiError] = useState(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFaceSearch, setShowFaceSearch] = useState(false);

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
    { name: "Weddings",     icon: "fas fa-rings-wedding",  count: "3.2k", color: "#F06B8D",  event: "wedding"    },
    { name: "Graduations",  icon: "fas fa-graduation-cap", count: "4.7k", color: "#6BBDD0",  event: "graduation" },
    { name: "Marathons",    icon: "fas fa-running",        count: "2.1k", color: "#F5A623",  event: "marathon"   },
    { name: "Corporate",    icon: "fas fa-briefcase",      count: "1.8k", color: "#9D7FEB",  event: "corporate"  },
    { name: "Wildlife",     icon: "fas fa-paw",            count: "8.4k", color: "#4CC9A6",  event: "wildlife"   },
    { name: "Culture",      icon: "fas fa-drum",           count: "5.2k", color: "#F06B8D",  event: "other"      },
    { name: "Landscape",    icon: "fas fa-mountain",       count: "6.8k", color: "#6BBDD0",  event: "landscape"  },
    { name: "Portraits",    icon: "fas fa-user",           count: "5.5k", color: "#1A2E3B",  event: "portrait"   },
  ];

  const howItWorks = [
    { title: "Browse the Gallery",  icon: "fas fa-compass",    description: "Explore thousands of stunning photos from across Kenya — wildlife, cities, coast, and culture." },
    { title: "Pay via M-Pesa",      icon: "fas fa-mobile-alt", description: "Buy instantly with M-Pesa, card, or wallet. Fast, secure, and built for Kenya." },
    { title: "Instant Download",    icon: "fas fa-bolt",       description: "Get your full-resolution photo the moment payment clears — no waiting." },
  ];

  const testimonials = [
    { name: "Wanjiru Kamau",  role: "Creative Director, Nairobi",   feedback: "The quality of Kenyan photography here is outstanding. It transformed our campaign materials completely.", avatar: "https://randomuser.me/api/portraits/women/32.jpg", rating: 5 },
    { name: "Brian Otieno",   role: "Travel Blogger, Kisumu",       feedback: "Photographers earn fair revenue and buyers get affordable prices. Finally a platform that works for us.", avatar: "https://randomuser.me/api/portraits/men/75.jpg", rating: 5 },
    { name: "Amina Hassan",   role: "Brand Designer, Mombasa",      feedback: "Incredible Kenyan photography — from Maasai Mara sunsets to Nairobi street life. My go-to source.", avatar: "https://randomuser.me/api/portraits/women/68.jpg", rating: 5 },
  ];

  const stats = [
    { value: "20K+",  label: "Photos"           },
    { value: "5K+",   label: "Buyers"           },
    { value: "800+",  label: "Photographers"    },
    { value: "47",    label: "Counties Covered" },
  ];

  const displayedPhotos = apiMedia.slice(0, 6);

  const SkeletonBox = ({ width, height, className = "" }) => (
    <div className={`skeleton-box ${className}`} style={{ width: width || "100%", height: height || "20px" }} />
  );

  const isScrolled = scrollY > 60;

  return (
    <div className="home-page-shell">
      <Helmet>
        <title>Relic Snap — Kenya's Premium Photography Marketplace</title>
        <meta name="description" content="Buy and download stunning photos from Kenya's best photographers. High-quality wedding, nature, portrait, wildlife and travel photography." />
        <meta property="og:title" content="Relic Snap — Kenya's Premium Photography Marketplace" />
        <meta property="og:description" content="Buy and download stunning photos from Kenya's best photographers." />
        <meta property="og:url" content="https://relicsnap.onrender.com/" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://relicsnap.onrender.com/" />
      </Helmet>

      {/* ── Navbar ── */}
      <nav
        className={`navbar navbar-expand-lg fixed-top home-navbar${isScrolled ? " scrolled" : ""}`}
        style={{ background: isScrolled ? undefined : "transparent", backgroundColor: isScrolled ? undefined : "transparent" }}
      >
        <div className="container">

          {/* Brand */}
          <Link to="/" className="navbar-brand">
            <div className="home-nav-logo-icon" style={{ background: "none", border: "none", padding: 0 }}>
              <img src="/rs-logo.png" alt="Relic Snap" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
            <span className="home-nav-brand-text">
              Relic<span className="home-nav-brand-accent"> Snap</span>
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
                { to: "/register",      label: "Sell Photos" },
                { to: "/login",         label: "Pricing"     },
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
      <section className="home-hero">
        <div className="home-deco home-deco-1"></div>
        <div className="home-deco home-deco-2"></div>
        <div className="home-deco home-deco-3"></div>

        <div className="container home-hero-content py-5" style={{ paddingTop: "7rem" }}>
          <div className="row align-items-center gy-5">
            {/* Text col */}
            <div className="col-12 col-lg-6 text-center text-lg-start">
              {loading ? (
                <div className="placeholder-glow">
                  <SkeletonBox height="16px" width="140px" className="mb-3 rounded-pill mx-auto mx-lg-0" />
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
                  <span className="section-label" style={{ color: "rgba(255,255,255,0.8)" }}>
                    🇰🇪 Kenya's Premier Photo Marketplace
                  </span>
                  <h1 className="home-hero-heading mb-3">
                    <em>Kenya's</em> stories,<br />
                    beautifully captured.
                  </h1>
                  <p className="home-hero-sub mb-4">
                    Buy and sell stunning photography from across Kenya — wildlife, culture, cities and landscapes. M-Pesa payments, instant downloads.
                  </p>
                  <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
                    <Link to="/explore">
                      <button className="home-nav-cta btn px-4 py-2" style={{ fontSize: "0.95rem" }}>
                        <i className="fas fa-compass me-2"></i>Explore Photos
                      </button>
                    </Link>
                    <button
                      onClick={() => setShowFaceSearch(true)}
                      className="btn px-4 py-2 rounded-pill"
                      style={{ background: "rgba(255,255,255,0.18)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.5)", backdropFilter: "blur(8px)", fontSize: "0.95rem" }}
                    >
                      <i className="fas fa-user-circle me-2"></i>Find My Photos
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="row g-3 mt-4 pt-2">
                    {stats.map((s, i) => (
                      <div key={i} className="col-6 col-sm-3 text-center text-lg-start">
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
                  src="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=700&h=820&fit=crop"
                  alt="Kenyan wildlife photography"
                  style={{
                    width: "100%",
                    height: "clamp(340px, 55vw, 560px)",
                    objectFit: "cover",
                    borderRadius: "var(--radius-xl)",
                    boxShadow: "0 30px 80px rgba(26,46,59,0.3)",
                  }}
                />
                {/* M-Pesa badge */}
                <div style={{
                  position: "absolute", bottom: "2rem", left: "-1.5rem",
                  background: "rgba(255,255,255,0.97)",
                  backdropFilter: "blur(12px)",
                  borderRadius: "var(--radius-lg)",
                  padding: "0.85rem 1.25rem",
                  boxShadow: "0 8px 32px rgba(26,46,59,0.2)",
                  minWidth: "180px",
                }}>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "var(--pm-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.3rem" }}>New this week</div>
                  <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.05rem", fontWeight: 700, color: "var(--pm-navy)" }}>1,200+ Kenyan shots</div>
                  <div style={{ color: "var(--pm-teal)", fontSize: "0.78rem", marginTop: "0.2rem" }}>
                    <i className="fas fa-arrow-up me-1"></i>+22% from last week
                  </div>
                </div>
                {/* M-Pesa badge top */}
                <div style={{
                  position: "absolute", top: "1.5rem", right: "-1rem",
                  background: "rgba(255,255,255,0.97)",
                  backdropFilter: "blur(12px)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.65rem 1rem",
                  boxShadow: "0 8px 24px rgba(26,46,59,0.18)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--pm-success)" }}></div>
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", fontWeight: 600, color: "var(--pm-navy)" }}>M-Pesa Ready</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Section 1: Buyers ── */}
      <section className="home-feature py-5 py-lg-6" style={{ paddingTop: "6rem", paddingBottom: "6rem" }}>
        <div className="container">
          <div className="row align-items-center gy-5">
            <div className="col-12 col-lg-5">
              <span className="section-label">For Buyers</span>
              <div className="divider-teal"></div>
              <h2 className="home-feature-heading">
                Kenya through<br />
                <em>a photographer's eye.</em>
              </h2>
              <p className="home-feature-body">
                Browse thousands of premium, licensed photos shot across Kenya — from the Maasai Mara to the Nairobi skyline to the Diani coast. Filter by county, mood, or theme and download the moment you pay.
              </p>
              <div className="d-flex flex-wrap gap-3 align-items-center">
                <Link to="/explore">
                  <button className="btn-pm-dark btn px-4 py-2">Browse Gallery</button>
                </Link>
                <Link to="/register" className="btn-pm-ghost">
                  Create free account <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            </div>
            <div className="col-12 col-lg-7">
              <div style={{ position: "relative" }}>
                <img
                  src="https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&h=520&fit=crop"
                  alt="Maasai Mara landscape Kenya"
                  className="home-feature-img"
                />
                <div style={{
                  position: "absolute", bottom: "2rem", left: "2rem",
                  background: "rgba(255,255,255,0.96)",
                  backdropFilter: "blur(12px)",
                  borderRadius: "var(--radius-lg)",
                  padding: "1.1rem 1.4rem",
                  boxShadow: "var(--shadow-lg)",
                  maxWidth: "240px",
                }}>
                  <div style={{ display: "flex", gap: "0.6rem", marginBottom: "0.5rem" }}>
                    {["#C8E8F0","#A8D8E8","#6BBDD0"].map((c,i) => (
                      <div key={i} style={{ width: 28, height: 28, borderRadius: "50%", background: c, border: "2px solid #fff" }}></div>
                    ))}
                  </div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--pm-text-muted)" }}>All 47 Kenyan counties</div>
                  <div style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", fontWeight: 700, color: "var(--pm-navy)" }}>20k+ licensed images</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Section 2: Photographers ── */}
      <section className="home-feature alt py-5" style={{ paddingTop: "6rem", paddingBottom: "6rem" }}>
        <div className="container">
          <div className="row align-items-center gy-5 flex-lg-row-reverse">
            <div className="col-12 col-lg-5">
              <span className="section-label">For Photographers</span>
              <div className="divider-teal"></div>
              <h2 className="home-feature-heading">
                Earn from your<br />
                <em>Kenyan photography.</em>
              </h2>
              <p className="home-feature-body">
                Upload your best shots, set your price in KES, and reach buyers across Kenya and beyond. Keep up to 70% of every sale — we handle M-Pesa payouts, licensing, and delivery.
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
                  src="https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800&h=520&fit=crop"
                  alt="Nairobi Kenya city photography"
                  className="home-feature-img"
                  style={{ background: "var(--pm-teal-bg)" }}
                />
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

      {/* ── Featured Albums Grid ── */}
      <section className="py-5" style={{ paddingTop: "5rem", paddingBottom: "5rem", background: "var(--pm-white)" }}>
        <div className="container">
          <div className="text-center mb-5">
            <span className="section-label">Trending Now</span>
            <h2 className="home-feature-heading" style={{ fontSize: "clamp(1.8rem,3.5vw,2.6rem)" }}>Featured Albums</h2>
            <p style={{ color: "var(--pm-text-muted)", maxWidth: 480, margin: "0 auto", fontSize: "0.95rem" }}>
              Curated photography albums from across Kenya — events, wildlife, portraits and more.
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
                          src={photo.image || photo.url || photo.fileUrl}
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
                Browse All Albums <i className="fas fa-arrow-right ms-2"></i>
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
              Three easy steps to explore or sell on Relic Snap — built for Kenya.
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

      {/* ── Find Your Photos — AI Face Search ── */}
      <section style={{ background: "var(--pm-navy)", paddingTop: "5.5rem", paddingBottom: "5.5rem" }}>
        <div className="container">
          <div className="row align-items-center gy-5">
            <div className="col-12 col-lg-6">
              <span className="section-label" style={{ color: "rgba(107,189,208,0.85)" }}>AI Face Search</span>
              <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, color: "#fff", fontSize: "clamp(1.8rem,3.5vw,2.8rem)", lineHeight: 1.2, margin: "0.75rem 0 1rem" }}>
                Attended an event?<br /><em style={{ color: "var(--pm-teal, #6BBDD0)", fontStyle: "normal" }}>Find your photos instantly.</em>
              </h2>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1rem", lineHeight: 1.7, marginBottom: "1.75rem", maxWidth: 480 }}>
                Our AI-powered face search finds every photo of you from weddings, graduations, marathons, and more — just upload a selfie. No scrolling through hundreds of photos.
              </p>
              <button
                onClick={() => setShowFaceSearch(true)}
                style={{ background: "var(--pm-teal, #6BBDD0)", color: "#fff", border: "none", borderRadius: "var(--radius-pill, 999px)", padding: "0.85rem 2rem", fontWeight: 700, fontSize: "1rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.6rem", boxShadow: "0 4px 18px rgba(107,189,208,0.35)" }}
              >
                <i className="fas fa-camera"></i> Try Face Search — It's Free
              </button>
            </div>
            <div className="col-12 col-lg-6">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {[
                  { icon: "fa-rings-wedding", label: "Weddings", color: "#F06B8D" },
                  { icon: "fa-graduation-cap", label: "Graduations", color: "#6BBDD0" },
                  { icon: "fa-running", label: "Marathons", color: "#F5A623" },
                  { icon: "fa-briefcase", label: "Corporate", color: "#9D7FEB" },
                ].map(ev => (
                  <div key={ev.label} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 16, padding: "1.25rem", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: "0.85rem" }}>
                    <span style={{ width: 44, height: 44, borderRadius: 12, background: ev.color + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <i className={`fas ${ev.icon}`} style={{ fontSize: "1.3rem", color: ev.color }}></i>
                    </span>
                    <span style={{ color: "#fff", fontWeight: 600, fontSize: "0.95rem" }}>{ev.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section style={{ background: "var(--pm-white)", paddingTop: "5.5rem", paddingBottom: "5.5rem" }}>
        <div className="container">
          <div className="text-center mb-5">
            <span className="section-label">Browse by Theme</span>
            <h2 className="home-feature-heading" style={{ fontSize: "clamp(1.8rem,3.5vw,2.6rem)" }}>Explore by Category</h2>
            <p style={{ color: "var(--pm-text-muted)", maxWidth: 460, margin: "0 auto", fontSize: "0.95rem" }}>
              From Maasai Mara wildlife to Nairobi street life — find exactly what you need.
            </p>
          </div>
          <div className="row g-3">
            {categories.map((cat, idx) => (
              <div key={idx} className="col-6 col-sm-4 col-md-3">
                <Link to={`/explore?event=${cat.event}`} className="home-cat-card">
                  <div className="home-cat-icon" style={{ color: cat.color }}><i className={cat.icon}></i></div>
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
            <h2 className="home-feature-heading" style={{ fontSize: "clamp(1.8rem,3.5vw,2.6rem)" }}>What Kenyans Are Saying</h2>
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

      {/* ── CTA ── */}
      <section className="home-cta-section" style={{ paddingTop: "6rem", paddingBottom: "6rem" }}>
        <div className="container text-center position-relative" style={{ zIndex: 1 }}>
          <span className="section-label" style={{ color: "rgba(107,189,208,0.9)" }}>🇰🇪 Made for Kenya</span>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 700, color: "#fff", lineHeight: 1.2, marginBottom: "1.25rem" }}>
            Kenya's stories deserve<br />
            <em style={{ fontStyle: "italic", color: "var(--pm-teal-light)" }}>to be seen and sold.</em>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1rem", maxWidth: 480, margin: "0 auto 2rem", lineHeight: 1.7 }}>
            Join Relic Snap today — access thousands of licensed Kenyan photos, or start earning from your own photography with instant M-Pesa payouts.
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
                <img src="/rs-logo.png" alt="Relic Snap" style={{ width: 28, height: 28, objectFit: "contain" }} />
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
                {[["Help Centre","/help"],["Sell Photos","/register"],["M-Pesa Guide","/mpesa"],["License Info","/license"]].map(([label,to]) => (
                  <li key={to} className="mb-2"><Link to={to}>{label}</Link></li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div className="col-12 col-md-4">
              <div className="home-footer-heading">Stay Updated</div>
              <p style={{ fontSize: "0.88rem", color: "var(--pm-text-muted)", marginBottom: "0.85rem" }}>
                New Kenyan photos and exclusive deals delivered to your inbox.
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

      {showFaceSearch && (
        <FaceSearchModal
          onClose={() => setShowFaceSearch(false)}
          onResults={() => {}}
        />
      )}
    </div>
  );
};

export default HomePage;
