import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Link } from "react-router-dom";

const HomePage = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(true);

  useEffect(() => {
    const timer1 = setTimeout(() => setLoading(false), 1500);
    const timer2 = setTimeout(() => setLoadingPhotos(false), 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const categories = [
    {
      name: "Nature",
      icon: "fas fa-leaf",
      count: "12.5k",
      bg: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop",
    },
    {
      name: "Travel",
      icon: "fas fa-plane",
      count: "8.2k",
      bg: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=200&h=200&fit=crop",
    },
    {
      name: "Lifestyle",
      icon: "fas fa-camera-retro",
      count: "15.3k",
      bg: "https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=200&h=200&fit=crop",
    },
    {
      name: "Food",
      icon: "fas fa-utensils",
      count: "6.7k",
      bg: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop",
    },
    {
      name: "Architecture",
      icon: "fas fa-building",
      count: "9.1k",
      bg: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=200&h=200&fit=crop",
    },
    {
      name: "Technology",
      icon: "fas fa-microchip",
      count: "5.8k",
      bg: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=200&fit=crop",
    },
  ];

  const howItWorks = [
    {
      title: "Browse Collection",
      icon: "fas fa-compass",
      description:
        "Explore thousands of high-quality photos from talented creators worldwide.",
    },
    {
      title: "Secure Purchase",
      icon: "fas fa-shield-alt",
      description: "Safe and encrypted payments with multiple payment options.",
    },
    {
      title: "Instant Access",
      icon: "fas fa-bolt",
      description:
        "Download your purchased photos immediately in high resolution.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Creative Director",
      feedback:
        "The quality of photos is exceptional. Has transformed our marketing materials.",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Travel Blogger",
      feedback:
        "Fair revenue for photographers and affordable prices. Win-win!",
      avatar: "https://randomuser.me/api/portraits/men/46.jpg",
      rating: 5,
    },
    {
      name: "Emma Williams",
      role: "Graphic Designer",
      feedback:
        "Intuitive platform with stunning visuals. My go-to for client projects.",
      avatar: "https://randomuser.me/api/portraits/women/63.jpg",
      rating: 5,
    },
  ];

  const featuredPhotos = [
    {
      id: 1,
      title: "Mountain Serenity",
      photographer: "Alex Rivera",
      price: "$29",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
      likes: 234,
    },
    {
      id: 2,
      title: "Urban Explorer",
      photographer: "Nina Patel",
      price: "$39",
      image:
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop",
      likes: 187,
    },
    {
      id: 3,
      title: "Ocean Dreams",
      photographer: "Marcus Webb",
      price: "$34",
      image:
        "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&h=400&fit=crop",
      likes: 312,
    },
    {
      id: 4,
      title: "Forest Magic",
      photographer: "Lisa Chang",
      price: "$27",
      image:
        "https://images.unsplash.com/photo-1426604966841-d7cdac3996e5?w=600&h=400&fit=crop",
      likes: 156,
    },
  ];

  const stats = [
    { value: "50K+", label: "Photos" },
    { value: "10K+", label: "Customers" },
    { value: "2.5K+", label: "Photographers" },
    { value: "150+", label: "Countries" },
  ];

  // Skeleton components remain the same...
  const SkeletonBox = ({ width, height, className = "" }) => (
    <div
      className={`bg-secondary bg-opacity-25 rounded placeholder-glow ${className}`}
      style={{
        width: width || "100%",
        height: height || "20px",
        animation: "pulse 1.5s ease-in-out infinite",
      }}
    >
      <div className="placeholder w-100 h-100"></div>
    </div>
  );

  const SkeletonCard = () => (
    <div className="card bg-dark border-secondary h-100 placeholder-glow">
      <SkeletonBox height="200px" className="rounded-top" />
      <div className="card-body p-3">
        <SkeletonBox width="80%" height="20px" className="mb-2" />
        <SkeletonBox width="60%" height="16px" className="mb-2" />
        <div className="d-flex justify-content-between">
          <SkeletonBox width="40%" height="14px" />
          <SkeletonBox width="30%" height="14px" />
        </div>
      </div>
    </div>
  );

  const skeletonStyles = `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .placeholder-glow .placeholder {
      animation: pulse 1.5s ease-in-out infinite;
      background: linear-gradient(90deg, #4a5568 25%, #6b7280 50%, #4a5568 75%);
      background-size: 200% 100%;
    }
    @media (max-width: 768px) {
      .display-1 { font-size: 2.5rem; }
      .display-4 { font-size: 2rem; }
      .lead { font-size: 1rem; }
    }
  `;

  return (
    <div className="bg-dark text-white overflow-hidden">
      <style>{skeletonStyles}</style>

      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-transparent position-absolute w-100 z-3 py-3">
        <div className="container">
          <Link
            to="/"
            className="navbar-brand fw-bold fs-3 text-decoration-none"
          >
            <i className="fas fa-camera me-2 text-warning"></i>
            Photo{" "}
            <span
              style={{
                color: "#ffc107",
                textShadow: "0 0 10px rgba(255, 193, 7, 0.5)",
              }}
            >
              Market
            </span>
          </Link>
          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-lg-center gap-3">
              <li className="nav-item">
                <button className="btn nav-link px-3 bg-transparent border-0 text-white">
                  Explore
                </button>
              </li>
              <li className="nav-item">
                <button className="btn nav-link px-3 bg-transparent border-0 text-white">
                  Pricing
                </button>
              </li>
              <li className="nav-item">
                <button className="btn nav-link px-3 bg-transparent border-0 text-white">
                  Become a Seller
                </button>
              </li>
              <li className="nav-item">
                <Link to="/login">
                  <button className="btn btn-outline-light rounded-pill px-4 me-2">
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Login
                  </button>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/register">
                  <button className="btn btn-warning rounded-pill px-4 text-dark fw-semibold">
                    <i className="fas fa-user-plus me-2"></i>
                    Sign Up
                  </button>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      {/* Hero Section - Mobile Optimized */}
      <section className="min-vh-100 d-flex align-items-center position-relative overflow-hidden pt-5">
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2070&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-50"></div>

        <div className="container position-relative text-center text-lg-start py-5">
          <div className="row">
            <div className="col-lg-8">
              {loading ? (
                <div className="placeholder-glow">
                  <SkeletonBox
                    width="150px"
                    height="30px"
                    className="mb-3 rounded-pill"
                  />
                  <SkeletonBox width="100%" height="60px" className="mb-3" />
                  <SkeletonBox width="90%" height="60px" className="mb-3" />
                  <SkeletonBox width="80%" height="24px" className="mb-4" />
                  <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start mb-5">
                    <SkeletonBox
                      width="160px"
                      height="48px"
                      className="rounded-pill"
                    />
                    <SkeletonBox
                      width="160px"
                      height="48px"
                      className="rounded-pill"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="badge bg-warning text-dark px-3 py-2 rounded-pill mb-3 fs-6">
                    <i className="fas fa-star me-2"></i>
                    <span className="d-none d-sm-inline">
                      Trusted by 10,000+ Creators
                    </span>
                    <span className="d-inline d-sm-none">10K+ Creators</span>
                  </div>
                  <h1 className="display-1 fw-bold mb-3">
                    <span className="text-warning">Stunning</span> Photos
                  </h1>
                  <h2 className="display-4 fw-bold mb-3">Instant Access</h2>
                  <p
                    className="lead mb-4 mx-auto mx-lg-0"
                    style={{ maxWidth: "500px" }}
                  >
                    Join the world's leading creative community. High-quality
                    images from best photographers.
                  </p>
                  <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start mb-5">
                    <Link to="/explore">
                      <button className="btn btn-warning rounded-pill px-4 py-2 fw-bold text-dark w-100 w-sm-auto">
                        <i className="fas fa-search me-2"></i>
                        Start Exploring
                      </button>
                    </Link>
                    <Link to="/demo">
                      <button className="btn btn-outline-light rounded-pill px-4 py-2 w-100 w-sm-auto">
                        <i className="fas fa-play-circle me-2"></i>
                        Watch Demo
                      </button>
                    </Link>
                  </div>

                  {/* Stats - Mobile Horizontal Scroll */}
                  <div className="row g-2 g-md-4 mt-4">
                    {stats.map((stat, idx) => (
                      <div key={idx} className="col-3">
                        <div className="text-center">
                          <h3 className="h4 fw-bold text-warning mb-0">
                            {stat.value}
                          </h3>
                          <p className="text-white-50 small mb-0">
                            {stat.label}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Photos - Mobile Optimized */}
      <section className="py-4 py-md-5 bg-black">
        <div className="container py-2 py-md-4">
          <div className="text-center mb-4">
            <span className="badge bg-warning text-dark px-3 py-2 rounded-pill mb-2">
              <i className="fas fa-fire me-2"></i>
              Trending
            </span>
            <h2 className="display-5 fw-bold mb-2">Featured Photos</h2>
            <p
              className="text-white-50 small mx-auto px-3"
              style={{ maxWidth: "500px" }}
            >
              Most popular photos this week
            </p>
          </div>

          <div className="row g-3">
            {loadingPhotos
              ? [1, 2, 3, 4].map((i) => (
                  <div key={i} className="col-6 col-md-4 col-lg-3">
                    <SkeletonCard />
                  </div>
                ))
              : featuredPhotos.map((photo, idx) => (
                  <div
                    key={idx}
                    className="col-6 col-md-4 col-lg-3"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <div className="card bg-transparent border-0 h-100">
                      <div className="position-relative overflow-hidden rounded-3">
                        <img
                          src={photo.image}
                          className="card-img-top"
                          alt={photo.title}
                          style={{
                            height: "150px",
                            objectFit: "cover",
                            transform:
                              hoveredIndex === idx ? "scale(1.1)" : "scale(1)",
                            transition: "transform 0.5s ease",
                          }}
                        />
                        <div className="position-absolute top-0 end-0 m-2">
                          <span
                            className="badge bg-warning text-dark px-2 py-1 rounded-pill"
                            style={{ fontSize: "0.7rem" }}
                          >
                            {photo.price}
                          </span>
                        </div>
                        <div className="position-absolute bottom-0 start-0 end-0 p-2 bg-gradient-dark">
                          <h6 className="text-white mb-0 small fw-bold">
                            {photo.title}
                          </h6>
                          <div className="d-flex justify-content-between align-items-center">
                            <small
                              className="text-white-50"
                              style={{ fontSize: "0.6rem" }}
                            >
                              <i className="fas fa-camera me-1"></i>
                              {photo.photographer.split(" ")[0]}
                            </small>
                            <small
                              className="text-white-50"
                              style={{ fontSize: "0.6rem" }}
                            >
                              <i className="fas fa-heart text-danger me-1"></i>
                              {photo.likes}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
          </div>

          <div className="text-center mt-4">
            <button className="btn btn-outline-warning rounded-pill px-4 py-2">
              View All
              <i className="fas fa-arrow-right ms-2"></i>
            </button>
          </div>
        </div>
      </section>

      {/* How It Works - Mobile Optimized */}
      <section className="py-4 py-md-5">
        <div className="container py-2 py-md-4">
          <div className="text-center mb-4">
            <span className="badge bg-warning text-dark px-3 py-2 rounded-pill mb-2">
              <i className="fas fa-magic me-2"></i>
              Simple
            </span>
            <h2 className="display-5 fw-bold mb-2">How It Works</h2>
          </div>

          <div className="row g-3">
            {howItWorks.map((item, idx) => (
              <div key={idx} className="col-12 col-md-4">
                <div
                  className="card bg-dark border-secondary h-100 text-center p-3"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <div className="card-body">
                    <div className="display-6 text-warning mb-2">
                      <i className={item.icon}></i>
                    </div>
                    <h5 className="fw-bold mb-2">{item.title}</h5>
                    <p className="text-white-50 small mb-0">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories - Mobile Optimized */}
      <section className="py-4 py-md-5 bg-black">
        <div className="container py-2 py-md-4">
          <div className="text-center mb-4">
            <span className="badge bg-warning text-dark px-3 py-2 rounded-pill mb-2">
              <i className="fas fa-tags me-2"></i>
              Categories
            </span>
            <h2 className="display-5 fw-bold mb-2">Top Categories</h2>
          </div>

          <div className="row g-2 g-md-3">
            {categories.map((cat, idx) => (
              <div key={idx} className="col-4 col-md-2">
                <div
                  className="card bg-dark border-secondary text-center p-2 p-md-3 h-100"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    cursor: "pointer",
                  }}
                  onMouseEnter={() => setHoveredIndex(idx + 10)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="card-body p-1 p-md-2">
                    <i
                      className={`${cat.icon} text-warning mb-1`}
                      style={{ fontSize: "1.2rem" }}
                    ></i>
                    <h6 className="fw-bold mb-0 small">{cat.name}</h6>
                    <small
                      className="text-white-50"
                      style={{ fontSize: "0.6rem" }}
                    >
                      {cat.count}
                    </small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Mobile Optimized */}
      <section className="py-4 py-md-5">
        <div className="container py-2 py-md-4">
          <div className="text-center mb-4">
            <span className="badge bg-warning text-dark px-3 py-2 rounded-pill mb-2">
              <i className="fas fa-comments me-2"></i>
              Testimonials
            </span>
            <h2 className="display-5 fw-bold mb-2">User Reviews</h2>
          </div>

          <div className="row g-3">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="col-12 col-md-4">
                <div
                  className="card bg-dark border-secondary h-100 p-3"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <div className="d-flex mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <i
                        key={i}
                        className="fas fa-star text-warning me-1"
                        style={{ fontSize: "0.7rem" }}
                      ></i>
                    ))}
                  </div>
                  <p className="small mb-3">"{testimonial.feedback}"</p>
                  <div className="d-flex align-items-center">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="rounded-circle me-2"
                      width="32"
                      height="32"
                    />
                    <div>
                      <h6 className="fw-bold mb-0 small">{testimonial.name}</h6>
                      <small
                        className="text-white-50"
                        style={{ fontSize: "0.6rem" }}
                      >
                        {testimonial.role}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Mobile Optimized */}
      <section className="py-4 py-md-5 bg-warning">
        <div className="container py-2 py-md-4 text-center">
          <h2 className="display-6 fw-bold text-dark mb-3">
            Start Your Journey Today
          </h2>
          <p className="text-dark mb-4 small px-3">
            Join our community and get access to premium photos
          </p>
          <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
            <Link to="/register">
              <button className="btn btn-dark rounded-pill px-4 py-2 fw-bold w-100 w-sm-auto">
                <i className="fas fa-user-plus me-2"></i>
                Sign Up Free
              </button>
            </Link>
            <Link to="/contact">
              <button className="btn btn-outline-dark rounded-pill px-4 py-2 w-100 w-sm-auto">
                <i className="fas fa-headset me-2"></i>
                Contact
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - Mobile Optimized */}
      <footer className="bg-black text-white-50 py-4">
        <div className="container">
          <div className="row g-3">
            <div className="col-12 col-md-4 text-center text-md-start">
              <Link
                className="navbar-brand fw-bold fs-5 text-white mb-2 d-inline-block"
                to="/"
              >
                <i className="fas fa-camera me-2 text-warning"></i>
                PhotoMarket
              </Link>
              <p className="small mb-3">
                Premium stock photos from best photographers.
              </p>
              <div className="d-flex gap-3 justify-content-center justify-content-md-start mb-3 mb-md-0">
                <button className="btn btn-link text-white-50 p-0">
                  <i className="fab fa-facebook-f"></i>
                </button>
                <button className="btn btn-link text-white-50 p-0">
                  <i className="fab fa-twitter"></i>
                </button>
                <button className="btn btn-link text-white-50 p-0">
                  <i className="fab fa-instagram"></i>
                </button>
              </div>
            </div>
            <div className="col-6 col-md-2">
              <h6 className="text-white fw-bold mb-2 small">Company</h6>
              <ul className="list-unstyled small">
                <li className="mb-1">
                  <button className="btn btn-link text-white-50 text-decoration-none p-0">
                    About
                  </button>
                </li>
                <li className="mb-1">
                  <button className="btn btn-link text-white-50 text-decoration-none p-0">
                    Careers
                  </button>
                </li>
                <li className="mb-1">
                  <button className="btn btn-link text-white-50 text-decoration-none p-0">
                    Press
                  </button>
                </li>
              </ul>
            </div>
            <div className="col-6 col-md-2">
              <h6 className="text-white fw-bold mb-2 small">Resources</h6>
              <ul className="list-unstyled small">
                <li className="mb-1">
                  <button className="btn btn-link text-white-50 text-decoration-none p-0">
                    Help
                  </button>
                </li>
                <li className="mb-1">
                  <button className="btn btn-link text-white-50 text-decoration-none p-0">
                    Sell
                  </button>
                </li>
                <li className="mb-1">
                  <button className="btn btn-link text-white-50 text-decoration-none p-0">
                    API
                  </button>
                </li>
              </ul>
            </div>
            <div className="col-12 col-md-4">
              <h6 className="text-white fw-bold mb-2 small">Subscribe</h6>
              <div className="input-group input-group-sm">
                <input
                  type="email"
                  className="form-control form-control-sm bg-dark border-secondary text-white"
                  placeholder="Email"
                />
                <button className="btn btn-warning btn-sm" type="button">
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </div>

          <hr className="border-secondary my-3" />

          <div className="row">
            <div className="col-12 text-center">
              <p className="small mb-0">
                &copy; {new Date().getFullYear()} PhotoMarket
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
