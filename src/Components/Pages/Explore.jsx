import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
  const [scrollY, setScrollY] = useState(0);

  // Mock data - replace with actual API calls
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
      tags: ["mountain", "nature", "landscape", "sunset"],
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
      tags: ["city", "urban", "street", "architecture"],
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
      tags: ["ocean", "beach", "waves", "sunset"],
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
      tags: ["forest", "trees", "magic", "sunlight"],
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
      tags: ["city", "night", "lights", "urban"],
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
      tags: ["abstract", "art", "colorful", "modern"],
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
      tags: ["food", "burger", "delicious", "fastfood"],
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
      tags: ["technology", "workspace", "laptop", "coding"],
      licenseType: "commercial",
      rating: 4.7,
      createdAt: "2024-01-14"
    }
  ];

  // Mock data - replace with actual API calls
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    
    // Simulate API loading
    setTimeout(() => {
      setPhotos(mockPhotos);
      setCategories(mockCategories);
      setLoading(false);
    }, 1000);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update URL when category changes
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
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'popular':
        return b.likes - a.likes;
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      default:
        return 0;
    }
  });

  return (
    <div className="bg-dark text-white min-vh-100 explore-root fixed-navbar-container" style={{ paddingTop: '90px' }}>
      {/* Navigation */}
      <nav 
        className="navbar navbar-expand-lg fixed-top w-100 py-2 py-lg-3 transition-all duration-300"
        style={{ 
          background: 'transparent',
          backdropFilter: 'none',
          borderBottom: 'none',
          zIndex: 1000
        }}
      >
        <div className="container-fluid px-3 px-lg-4">
          <Link to="/" className="navbar-brand fw-bold fs-4 fs-lg-3 text-decoration-none">
            <i className="fas fa-camera me-2 text-warning"></i>
            <span className="gradient-text">PhotoMarket</span>
          </Link>
          
          <button
            className="navbar-toggler border-0 shadow-none"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-lg-center gap-2 gap-lg-3 py-3 py-lg-0">
              <li className="nav-item">
                <Link className="nav-link px-3 text-white hover-warning transition active" to="/explore">
                  <i className="fas fa-search me-1"></i> Explore
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link px-3 text-white hover-warning transition" to="/pricing">
                  <i className="fas fa-tag me-1"></i> Pricing
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link px-3 text-white hover-warning transition" to="/become-seller">
                  <i className="fas fa-crown me-1"></i> Become a Seller
                </Link>
              </li>
              <li className="nav-item mt-2 mt-lg-0">
                <Link to="/login">
                  <button className="btn btn-outline-warning rounded-pill px-3 px-lg-4 w-100 w-lg-auto hover-glow">
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Login
                  </button>
                </Link>
              </li>
              <li className="nav-item mt-2 mt-lg-0">
                <Link to="/register">
                  <button className="btn btn-warning rounded-pill px-3 px-lg-4 text-dark fw-semibold w-100 w-lg-auto hover-scale">
                    <i className="fas fa-user-plus me-2"></i>
                    Sign Up
                  </button>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-5 mt-5">
        <div className="container-fluid px-3 px-lg-4 py-4">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8 text-center">
              <h1 className="display-4 display-5 display-lg-4 fw-bold mb-3">
                Explore <span className="text-warning">Stunning Photos</span>
              </h1>
              <p className="lead lead-sm fs-6 fs-lg-5 text-white-50 mb-4">
                Discover high-quality images from talented photographers around the world
              </p>
              
              {/* Search Bar */}
              <div className="position-relative max-w-md mx-auto">
                <input
                  type="text"
                  className="form-control form-control-lg bg-dark border-secondary text-white ps-5"
                  placeholder="Search by title, tags, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ borderRadius: '50px' }}
                />
                <i className="fas fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-4">
        <div className="container-fluid px-3 px-lg-4">
          <div className="row g-3">
            {/* Categories */}
            <div className="col-12">
              <div className="d-flex flex-wrap gap-2 justify-content-center px-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`btn btn-sm btn-lg-md rounded-pill px-3 px-lg-4 py-2 transition ${
                      selectedCategory === category.id
                        ? 'btn-warning text-dark'
                        : 'btn-outline-warning'
                    }`}
                  >
                    <i className={`${category.icon} me-1 me-lg-2`}></i>
                    <span className="d-none d-sm-inline">{category.name}</span>
                    <span className="d-inline d-sm-none">{category.name.split(' ')[0]}</span>
                    <span className="ms-1 ms-lg-2 badge bg-light text-dark rounded-pill fs-7 fs-lg-6">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filters Row */}
            <div className="col-12 mt-3 mt-lg-4">
              <div className="row g-3 align-items-center">
                <div className="col-12 col-md-6 col-lg-4">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="form-select bg-dark border-secondary text-white w-100"
                  >
                    <option value="newest">Newest First</option>
                    <option value="popular">Most Popular</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>

                <div className="col-12 col-md-6 col-lg-4">
                  <div className="btn-group w-100">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`btn ${viewMode === 'grid' ? 'btn-warning' : 'btn-outline-warning'} flex-fill`}
                    >
                      <i className="fas fa-th-large"></i>
                      <span className="d-none d-sm-inline ms-2">Grid</span>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`btn ${viewMode === 'list' ? 'btn-warning' : 'btn-outline-warning'} flex-fill`}
                    >
                      <i className="fas fa-list"></i>
                      <span className="d-none d-sm-inline ms-2">List</span>
                    </button>
                  </div>
                </div>

                {/* Price Range */}
                <div className="col-12 col-lg-4">
                  <div className="d-flex align-items-center justify-content-center justify-content-lg-end gap-2 gap-lg-3">
                    <span className="text-white-50 fs-7 fs-lg-6">Price:</span>
                    <input
                      type="range"
                      className="form-range flex-grow-1 flex-lg-grow-0"
                      min="0"
                      max="100"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                      style={{ maxWidth: '120px' }}
                    />
                    <span className="text-warning fw-bold fs-6 fs-lg-5">${priceRange[1]}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Count */}
      <section className="py-2">
        <div className="container-fluid px-3 px-lg-4">
          <div className="row align-items-center">
            <div className="col-12 col-md-6">
              <p className="text-white-50 mb-0 fs-7 fs-md-6">
                <i className="fas fa-images me-2"></i>
                {sortedPhotos.length} photos found
              </p>
            </div>
            <div className="col-12 col-md-6 text-start text-md-end mt-2 mt-md-0">
              <button className="btn btn-sm btn-outline-warning rounded-pill px-3 px-lg-4">
                <i className="fas fa-sliders-h me-1"></i>
                <span className="d-none d-sm-inline">Advanced </span>Filters
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Photos Grid */}
      <section className="py-4">
        <div className="container-fluid px-3 px-lg-4">
          {loading ? (
            <div className="row g-3 g-lg-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="col-12 col-sm-6 col-lg-4">
                  <div className="card bg-dark border-secondary">
                    <div className="bg-secondary bg-opacity-25" style={{ height: '200px' }}></div>
                    <div className="card-body p-3">
                      <div className="bg-secondary bg-opacity-25" style={{ height: '20px', width: '80%' }}></div>
                      <div className="bg-secondary bg-opacity-25 mt-2" style={{ height: '15px', width: '60%' }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : sortedPhotos.length > 0 ? (
            <div className={viewMode === 'grid' ? 'row g-3 g-lg-4' : 'd-flex flex-column gap-3 gap-lg-4'}>
              {sortedPhotos.map(photo => (
                <div key={photo.id} className={viewMode === 'grid' ? 'col-12 col-sm-6 col-lg-4' : 'col-12'}>
                  <Link to={`/photos/${photo.id}`} className="text-decoration-none">
                    <div className={`card bg-dark border-secondary overflow-hidden transition hover-scale ${viewMode === 'list' ? 'd-flex flex-column flex-lg-row' : ''}`}>
                      <div className={viewMode === 'list' ? 'col-12 col-lg-4' : ''} style={{ overflow: 'hidden' }}>
                        <img
                          src={photo.thumbnail}
                          alt={photo.title}
                          className="w-100"
                          style={{ 
                            height: viewMode === 'list' ? '200px' : '200px',
                            objectFit: 'contain',
                            backgroundColor: '#1a1a1a',
                            transition: 'transform 0.3s ease'
                          }}
                        />
                      </div>
                      <div className={`card-body ${viewMode === 'list' ? 'col-12 col-lg-8' : ''} p-3 p-lg-4`}>
                        <div className="d-flex justify-content-between align-items-start mb-2 mb-lg-3">
                          <div className="flex-grow-1 me-2">
                            <h5 className="card-title text-white fw-bold mb-1 fs-6 fs-lg-5">{photo.title}</h5>
                            <p className="text-white-50 small mb-2 fs-7 fs-lg-6">
                              <i className="fas fa-camera me-1"></i> {photo.photographer?.username || photo.photographer || 'Unknown'}
                            </p>
                          </div>
                          <div className="text-warning fw-bold fs-5 fs-lg-4">${photo.price}</div>
                        </div>
                        
                        <div className="d-flex flex-wrap gap-1 gap-lg-2 mb-3">
                          {photo.tags.slice(0, viewMode === 'list' ? 4 : 3).map((tag, idx) => (
                            <span key={idx} className="badge bg-secondary bg-opacity-25 text-white-50 fs-8 fs-lg-7">
                              <i className="fas fa-tag me-1"></i> {tag}
                            </span>
                          ))}
                        </div>
                        
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                          <div className="d-flex gap-2 gap-lg-3 text-white-50 small fs-8 fs-lg-7">
                            <span>
                              <i className="fas fa-heart text-danger me-1"></i> {photo.likes || 0}
                            </span>
                            <span>
                              <i className="fas fa-download me-1"></i> {photo.downloads}
                            </span>
                            <span>
                              <i className="fas fa-star text-warning me-1"></i> {photo.rating}
                            </span>
                          </div>
                          <span className={`badge ${photo.licenseType === 'commercial' ? 'bg-success' : 'bg-info'} fs-8 fs-lg-7`}>
                            {photo.licenseType}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-search fa-3x text-secondary mb-3"></i>
              <h3 className="text-white-50 fs-5 fs-lg-4">No photos found</h3>
              <p className="text-white-50 fs-7 fs-lg-6">Try adjusting your filters or search query</p>
              <button 
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setPriceRange([0, 100]);
                }}
                className="btn btn-warning rounded-pill px-4 py-2 mt-3"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Load More Button */}
      {sortedPhotos.length > 0 && (
        <section className="py-4 py-lg-5">
          <div className="container-fluid px-3 px-lg-4 text-center">
            <button className="btn btn-outline-warning rounded-pill px-4 px-lg-5 py-2 py-lg-3 hover-glow fs-6 fs-lg-5">
              <i className="fas fa-sync-alt me-2"></i>
              Load More Photos
            </button>
          </div>
        </section>
      )}

      {/* Custom CSS */}
      <style jsx="true">{`
        .gradient-text {
          background: linear-gradient(135deg, #ffc107, #ff8c00);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .transition {
          transition: all 0.3s ease;
        }
        
        .hover-warning:hover {
          color: #ffc107 !important;
        }
        
        .hover-scale {
          transition: transform 0.3s ease;
        }
        
        .hover-scale:hover {
          transform: translateY(-5px);
        }
        
        .hover-glow:hover {
          box-shadow: 0 0 20px rgba(255,193,7,0.3);
        }
        
        .btn-outline-warning:hover {
          background-color: rgba(255,193,7,0.1);
        }
        
        .form-range::-webkit-slider-thumb {
          background: #ffc107;
        }
        
        .form-range::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
        
        .card {
          transition: all 0.3s ease;
        }
        
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        /* Mobile-first responsive utilities */
        .max-w-md {
          max-width: 28rem;
        }

        .fs-7 {
          font-size: 0.875rem !important;
        }

        .fs-8 {
          font-size: 0.75rem !important;
        }

        .btn-sm {
          padding: 0.375rem 0.75rem;
          font-size: 0.875rem;
        }

        .btn-lg-md {
          padding: 0.5rem 1rem;
          font-size: 1rem;
        }

        /* Mobile responsive adjustments */
        @media (max-width: 575.98px) {
          .display-5 {
            font-size: 2rem;
          }
          
          .lead-sm {
            font-size: 1rem;
          }
          
          .container-fluid {
            padding-left: 1rem;
            padding-right: 1rem;
          }
          
          .card-body {
            padding: 1rem !important;
          }
          
          .btn-group .btn {
            padding: 0.5rem 0.75rem;
            font-size: 0.875rem;
          }

          .explore-root {
            padding-top: 120px !important;
          }

          .navbar {
            position: fixed;
            top: 0;
          }

          section {
            margin-top: 0 !important;
            padding-top: 0 !important;
          }

          .card {
            min-height: auto;
          }

          .photo-card img {
            height: 180px !important;
          }
        }

        @media (min-width: 576px) and (max-width: 767.98px) {
          .display-5 {
            font-size: 2.5rem;
          }
          
          .lead-sm {
            font-size: 1.125rem;
          }
        }

        @media (min-width: 768px) and (max-width: 991.98px) {
          .display-lg-4 {
            font-size: 2.5rem;
          }
          
          .fs-lg-5 {
            font-size: 1.25rem !important;
          }
          
          .fs-lg-6 {
            font-size: 1rem !important;
          }
        }

        @media (min-width: 992px) {
          .display-lg-4 {
            font-size: 3.5rem;
          }
          
          .fs-lg-5 {
            font-size: 1.25rem !important;
          }
          
          .fs-lg-6 {
            font-size: 1rem !important;
          }
          
          .fs-lg-7 {
            font-size: 0.875rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Explore;