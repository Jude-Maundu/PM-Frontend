import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import BuyerLayout from "./BuyerLayout";
import PageHeader from "../../PageHeader";
import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "../../../api/apiConfig";
import { toast } from "../../../utils/toast";
import { placeholderMedium } from "../../../utils/placeholders";
import { getImageUrl, fetchProtectedUrl } from "../../../utils/imageUrl";
import { addToLocalCart, disableApi, isApiAvailable } from "../../../utils/localStore";
import { getUserFollowing, getLikedMedia, addFavorite, removeFavorite, likeMedia, unlikeMedia, getConversationWithUser } from "../../../api/API";

const API = API_BASE_URL;

const BuyerExplore = () => {
  const [media, setMedia] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [imageDimensions, setImageDimensions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [, setAddingToCart] = useState(null);
  const [likedItems, setLikedItems] = useState(new Set());
  const [, setFollowingUsers] = useState(new Set());
  const [, setMessagingUser] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [columns, setColumns] = useState(4);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [showProtectionWarning, setShowProtectionWarning] = useState(false);
  
  // Fading banner state
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [nextBannerIndex, setNextBannerIndex] = useState(1);
  const [isFading, setIsFading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeView, setActiveView] = useState("photos");
  const [albums, setAlbums] = useState([]);
  const [albumsLoading, setAlbumsLoading] = useState(false);
  const [albumSearch, setAlbumSearch] = useState("");
  const [buyingAlbum, setBuyingAlbum] = useState(null);
  
  // Ref for modal content to detect keyboard shortcuts
  const modalRef = useRef(null); // eslint-disable-line no-unused-vars
  const imageRef = useRef(null);

  const bannerImages = [
    { 
      id: 1, 
      url: "https://images.unsplash.com/photo-1492691527719-9d1e4e485a21?auto=format&fit=crop&w=800&q=80", 
      title: "Mountain Majesty", 
      photographer: "Alex Chen", 
      description: "Breathtaking mountain landscapes captured at golden hour",
      price: "KES 25",
      badge: "Trending"
    },
    { 
      id: 2, 
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80", 
      title: "Wilderness Escape", 
      photographer: "Maria Garcia", 
      description: "Explore the great outdoors with stunning wilderness shots",
      price: "KES 30",
      badge: "Editor's Pick"
    },
    { 
      id: 3, 
      url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80", 
      title: "Forest Dreams", 
      photographer: "James Wilson", 
      description: "Serene forest photography with mystical lighting",
      price: "KES 20",
      badge: "Popular"
    },
    { 
      id: 4, 
      url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80", 
      title: "Nature's Palette", 
      photographer: "Emma Brown", 
      description: "Vibrant natural colors from around the world",
      price: "KES 35",
      badge: "New"
    },
    { 
      id: 5, 
      url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80", 
      title: "Sunset Serenity", 
      photographer: "Sophia Lee", 
      description: "Golden hour moments that capture pure tranquility",
      price: "KES 28",
      badge: "Limited"
    }
  ];

  // Auto-rotate banner images
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

  // Disable right-click globally
  useEffect(() => {
    const disableRightClick = (e) => {
      e.preventDefault();
      setShowProtectionWarning(true);
      setTimeout(() => setShowProtectionWarning(false), 2000);
      return false;
    };
    
    document.addEventListener('contextmenu', disableRightClick);
    
    return () => {
      document.removeEventListener('contextmenu', disableRightClick);
    };
  }, []);

  // Prevent keyboard shortcuts for screenshots
  useEffect(() => {
    const preventKeyboardShortcuts = (e) => {
      // Prevent Print Screen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        setShowProtectionWarning(true);
        setTimeout(() => setShowProtectionWarning(false), 2000);
        return false;
      }
      
      // Prevent Ctrl+S (Save)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        setShowProtectionWarning(true);
        setTimeout(() => setShowProtectionWarning(false), 2000);
        return false;
      }
      
      // Prevent Ctrl+P (Print)
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        setShowProtectionWarning(true);
        setTimeout(() => setShowProtectionWarning(false), 2000);
        return false;
      }
      
      // Prevent Ctrl+Shift+I (Dev Tools)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }
      
      // Prevent Ctrl+U (View Source)
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        return false;
      }
      
      // Prevent F12 (Dev Tools)
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
    };
    
    window.addEventListener('keydown', preventKeyboardShortcuts);
    
    return () => {
      window.removeEventListener('keydown', preventKeyboardShortcuts);
    };
  }, []);

  // Add protection when modal is open
  useEffect(() => {
    if (showModal) {
      // Disable body scroll
      document.body.style.overflow = 'hidden';
      
      // Add class to prevent selection
      document.body.classList.add('no-select');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('no-select');
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('no-select');
    };
  }, [showModal]);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id || user._id;
  const headers = React.useMemo(() => (token ? { Authorization: `Bearer ${token}` } : {}), [token]);

  const categories = [
    { name: "All", icon: "fas fa-th-large" },
    { name: "Nature", icon: "fas fa-leaf" },
    { name: "Travel", icon: "fas fa-plane" },
    { name: "Lifestyle", icon: "fas fa-camera-retro" },
    { name: "Food", icon: "fas fa-utensils" },
    { name: "Tech", icon: "fas fa-microchip" },
    { name: "Arch", icon: "fas fa-building" },
  ];

  const resolveImage = (item) => getImageUrl(item, placeholderMedium);

  const getImageDimensions = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height, ratio: img.height / img.width });
      };
      img.onerror = () => resolve({ width: 300, height: 300, ratio: 1 });
      img.src = url;
    });
  };

  const loadFollowingStatus = useCallback(async () => {
    if (!token || !userId) return;
    try {
      const response = await getUserFollowing(userId);
      const followingList = response.data?.following || [];
      const followingIds = new Set(followingList.map(u => u._id));
      setFollowingUsers(followingIds);
    } catch (error) {
      if (error.response?.status !== 404) console.error('Error loading following status:', error);
    }
  }, [token, userId]);

  const loadLikedItems = useCallback(async () => {
    if (!token) return;
    try {
      const response = await getLikedMedia();
      const likedIds = new Set((response.data || []).map(item => item._id));
      setLikedItems(likedIds);
    } catch (error) {
      if (error.response?.status !== 401 && error.response?.status !== 400) {
        console.error('Error loading liked items:', error);
      }
    }
  }, [token]);

  const fetchAlbums = useCallback(async () => {
    setAlbumsLoading(true);
    try {
      const res = await axios.get(API_ENDPOINTS.MEDIA.GET_PUBLIC_ALBUMS, { headers, timeout: 10000 });
      setAlbums(res.data?.albums || []);
    } catch (err) {
      console.error("Failed to load albums:", err);
    } finally {
      setAlbumsLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    if (activeView === "albums") fetchAlbums();
  }, [activeView, fetchAlbums]);

  const handleBuyAlbum = async (album) => {
    if (!token || !userId) { toast.error("Please log in to purchase albums"); return; }
    if (album.price <= 0) { toast.info("This album is free — no purchase needed"); return; }
    setBuyingAlbum(album._id);
    try {
      const res = await axios.post(API_ENDPOINTS.WALLET.BUY_ALBUM(album._id), {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(res.data.message || "Album purchased!");
      setAlbums(prev => prev.map(a =>
        a._id === album._id ? { ...a, purchasedBy: [...(a.purchasedBy || []), userId] } : a
      ));
    } catch (err) {
      toast.error(err.response?.data?.message || "Purchase failed");
    } finally {
      setBuyingAlbum(null);
    }
  };

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/media`, { headers, timeout: 10000 });
        let items = [];
        if (Array.isArray(res.data?.media)) items = res.data.media;
        else if (Array.isArray(res.data)) items = res.data;
        setMedia(items);

        const urls = {};
        const dimensions = {};
        
        await Promise.all(
          items.map(async (item) => {
            const raw = getImageUrl(item, null);
            const needsProtected = !raw || raw.includes("/opt/") || raw.startsWith("file://");
            const isFree = !item.price || item.price <= 0;
            
            let imageUrl = raw;
            if (needsProtected && !isFree) return;
            if (needsProtected && isFree) {
              const mediaId = item._id || item.mediaId;
              if (mediaId) {
                const protectedUrl = await fetchProtectedUrl(mediaId);
                if (protectedUrl) imageUrl = protectedUrl;
              }
            }
            
            if (imageUrl && imageUrl !== placeholderMedium) {
              urls[item._id] = imageUrl;
              const dims = await getImageDimensions(imageUrl);
              dimensions[item._id] = dims;
            }
          })
        );
        setImageUrls(urls);
        setImageDimensions(dimensions);
      } catch (err) {
        console.error("Error fetching media:", err);
        setError("Failed to load photos. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };
    const loadInitialData = async () => {
      await fetchMedia();
      await loadFollowingStatus();
      await loadLikedItems();
    };
    loadInitialData();
  }, [token, headers, loadFollowingStatus, loadLikedItems]);

  const addToCart = async (mediaId, item) => {
    if (!token) { toast.warning("Please login to add items to cart"); return; }
    const feature = "cart";
    const apiAvailable = isApiAvailable(feature);
    if (!apiAvailable) {
      addToLocalCart(mediaId, { title: item?.title, price: item?.price });
      toast.success("Added to cart!");
      return;
    }
    try {
      setAddingToCart(mediaId);
      await axios.post(`${API}/payments/cart/add`, { userId, mediaId }, { headers });
      toast.success("Added to cart!");
    } catch (err) {
      const status = err.response?.status;
      const errMsg = err.response?.data?.message || err.message || "Unknown error";
      if (status === 404 || status === 400 || status === 500) {
        disableApi(feature);
        addToLocalCart(mediaId, { title: item?.title, price: item?.price });
        toast.info(`Added to cart. (Server unavailable)`);
      } else {
        toast.error(`Failed to add to cart: ${errMsg}`);
      }
    } finally {
      setAddingToCart(null);
    }
  };

  const handleLike = async (mediaId) => {
    if (!token) { toast.warning("Please login to like photos"); return; }
    const isLiked = likedItems.has(mediaId);
    try {
      if (isLiked) {
        await unlikeMedia(mediaId);
        if (userId) try { await removeFavorite(userId, mediaId); } catch (favErr) {}
        setLikedItems(prev => { const newSet = new Set(prev); newSet.delete(mediaId); return newSet; });
      } else {
        await likeMedia(mediaId);
        if (userId) try { await addFavorite({ userId, mediaId }); } catch (favErr) {}
        setLikedItems(prev => new Set([...prev, mediaId]));
      }
      setMedia(prev => prev.map(item => item._id === mediaId ? { ...item, likes: (item.likes || 0) + (isLiked ? -1 : 1) } : item));
    } catch (err) {
      console.error("Error toggling like:", err);
      toast.error("Failed to update like. Please try again.");
    }
  };

  const handleMessage = async (photographerId) => {
    if (!token) { toast.warning("Please login to message users"); return; }
    if (!photographerId) return;
    try {
      setMessagingUser(photographerId);
      const response = await getConversationWithUser(photographerId);
      const conversationId = response?.data?._id;
      if (!conversationId) { toast.error("Unable to start conversation. Please try again."); return; }
      navigate(`/messages?conversation=${conversationId}`);
    } catch (err) {
      console.error("Error starting conversation:", err);
      toast.error("Failed to start conversation. Please try again.");
    } finally {
      setMessagingUser(null);
    }
  };

  const filteredMedia = media.filter(item => {
    const matchesCategory = selectedCategory === "all" || (item.category || "").toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = (item.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    switch(sortBy) {
      case "price_low": return (a.price || 0) - (b.price || 0);
      case "price_high": return (b.price || 0) - (a.price || 0);
      case "popular": return (b.likes || 0) - (a.likes || 0);
      default: return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
  });

  const createMasonryColumns = () => {
    const columnArrays = Array.from({ length: columns }, () => []);
    filteredMedia.forEach((item, index) => {
      const columnIndex = index % columns;
      columnArrays[columnIndex].push(item);
    });
    return columnArrays;
  };

  const masonryColumns = createMasonryColumns();

  const getImageStyle = (item) => {
    const dims = imageDimensions[item._id];
    if (dims && dims.ratio) {
      return {
        aspectRatio: `${dims.width} / ${dims.height}`,
        objectFit: "cover"
      };
    }
    return {
      aspectRatio: "1 / 1",
      objectFit: "cover"
    };
  };

  // Responsive column count and sidebar width
  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth;
      
      if (width >= 1920) {
        setSidebarWidth(380);
        setColumns(4);
      } else if (width >= 1600) {
        setSidebarWidth(340);
        setColumns(4);
      } else if (width >= 1400) {
        setSidebarWidth(320);
        setColumns(3);
      } else if (width >= 1200) {
        setSidebarWidth(300);
        setColumns(3);
      } else if (width >= 992) {
        setSidebarWidth(280);
        setColumns(3);
        setShowSidebar(true);
      } else {
        setShowSidebar(false);
        if (width < 576) setColumns(2);
        else if (width < 768) setColumns(2);
        else if (width < 992) setColumns(3);
        else setColumns(4);
      }
      
      setIsMobile(width < 992);
      setShowSidebar(width >= 992);
    };
    
    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  return (
    <BuyerLayout>
      {/* Protection Warning Toast */}
      {showProtectionWarning && (
        <div className="position-fixed top-50 start-50 translate-middle z-3" style={{ zIndex: 9999 }}>
          <div className="alert alert-warning shadow-lg rounded-pill px-4 py-2" style={{ animation: 'fadeInOut 2s ease' }}>
            <i className="fas fa-shield-alt me-2"></i>
            Content is protected. Screenshots are disabled.
          </div>
        </div>
      )}

      <div className="mc-page text-white" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <PageHeader
          title="Explore"
          subtitle="Discover amazing photography"
          searchQuery={searchTerm}
          onSearch={setSearchTerm}
          searchPlaceholder="Search photos, artists..."
        />

        {/* Main Content with Flexible Sidebar Layout */}
        <div className="d-flex flex-column flex-lg-row gap-4" style={{ gap: "clamp(1rem, 3vw, 2rem)" }}>

          {/* Main Image Grid Area */}
          <div className="flex-grow-1" style={{ minWidth: 0 }}>

            {/* Sort + View Toggle */}
            <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-3 px-2 px-sm-0">
              <select
                className="form-select rounded-pill py-2"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ width: "130px", fontSize: "0.85rem" }}
              >
                <option value="newest">Newest</option>
                <option value="popular">Popular</option>
                <option value="price_low">Price ↑</option>
                <option value="price_high">Price ↓</option>
              </select>
            </div>
            <div className="d-flex gap-2 mb-4 px-2 px-sm-0">
              <button
                className={`btn rounded-pill px-4 fw-semibold ${activeView === "photos" ? "btn-warning text-dark" : "btn-outline-secondary text-white-50"}`}
                style={{ fontSize: "0.85rem" }}
                onClick={() => setActiveView("photos")}
              >
                <i className="fas fa-images me-2"></i>Photos
              </button>
              <button
                className={`btn rounded-pill px-4 fw-semibold ${activeView === "albums" ? "btn-warning text-dark" : "btn-outline-secondary text-white-50"}`}
                style={{ fontSize: "0.85rem" }}
                onClick={() => setActiveView("albums")}
              >
                <i className="fas fa-folder-open me-2"></i>Albums
              </button>
            </div>

            {/* Categories - photos view only */}
            {activeView === "photos" && <div className="mc-card mb-4 px-2 px-sm-0">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="fw-bold mb-0" style={{ fontSize: "0.85rem" }}>
                  <i className="fas fa-tags me-1 text-warning"></i>
                  Categories
                </h6>
                <span className="text-white-50 small">{filteredMedia.length} photos</span>
              </div>
              <div className={`d-flex ${isMobile ? "overflow-auto pb-1" : "flex-wrap"} gap-1`} style={{ scrollbarWidth: "thin" }}>
                {categories.map(cat => (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name.toLowerCase())}
                    className={`btn btn-sm rounded-pill px-3 py-1 flex-shrink-0 ${selectedCategory === cat.name.toLowerCase() ? 'btn-warning text-dark' : 'btn-outline-warning'}`}
                    style={{ fontSize: "0.7rem", whiteSpace: "nowrap" }}
                  >
                    <i className={`${cat.icon} me-1`} style={{ fontSize: "0.65rem" }}></i>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>}

            {/* Photos view: error + masonry grid */}
            {activeView === "photos" && <>
              {error && (
                <div className="alert alert-danger alert-dismissible fade show mb-3 mx-2" role="alert">
                  <i className="fas fa-exclamation-circle me-2"></i> {error}
                  <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                </div>
              )}

            {/* Masonry Grid */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-warning mb-2" style={{ width: "2rem", height: "2rem" }}></div>
                <p className="text-white-50 small">Loading amazing photos...</p>
              </div>
            ) : filteredMedia.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-search fa-3x text-white-50 mb-2"></i>
                <h6 className="mb-1">No photos found</h6>
                <p className="text-white-50 small">Try a different search</p>
                <button className="btn btn-warning btn-sm rounded-pill" onClick={() => { setSearchTerm(""); setSelectedCategory("all"); }}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="container-fluid px-2 px-sm-3">
                <div className="row g-2 g-sm-3">
                  {masonryColumns.map((column, colIndex) => (
                    <div key={colIndex} className={`col-${Math.floor(12 / columns)}`} style={{ paddingLeft: "6px", paddingRight: "6px" }}>
                      {column.map((item) => {
                        const imageUrl = imageUrls[item._id] || resolveImage(item) || placeholderMedium;
                        return (
                          <div
                            key={item._id}
                            className="card bg-dark border-secondary mb-3 overflow-hidden"
                            style={{ 
                              borderRadius: "16px", 
                              cursor: "pointer",
                              transition: "transform 0.2s ease, box-shadow 0.2s ease",
                              animation: "fadeInUp 0.4s ease-out"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = "translateY(-4px)";
                              e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.3)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "none";
                            }}
                            onClick={() => { setSelectedPhoto(item); setShowModal(true); }}
                          >
                            <div className="position-relative">
                              <img
                                src={imageUrl}
                                className="w-100"
                                style={getImageStyle(item)}
                                alt={item.title}
                                loading="lazy"
                                onError={(e) => { e.target.src = placeholderMedium; }}
                              />
                              <span className="position-absolute top-0 end-0 m-2 badge bg-warning text-dark rounded-pill px-2 py-1" style={{ fontSize: "0.7rem", fontWeight: 600 }}>
                                KES {item.price || 0}
                              </span>
                              <div className="position-absolute bottom-0 start-0 end-0 p-2" style={{
                                background: "linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 100%)",
                                borderRadius: "0 0 16px 16px"
                              }}>
                                <div className="d-flex align-items-center gap-1">
                                  <i className="fas fa-circle-user text-warning" style={{ fontSize: "0.7rem" }}></i>
                                  <span className="text-white small fw-semibold text-truncate" style={{ fontSize: "0.7rem" }}>
                                    {item.photographer?.username || "User"}
                                  </span>
                                </div>
                                <span className="text-white-50 small d-block text-truncate mt-1" style={{ fontSize: "0.7rem", fontWeight: 500 }}>
                                  {item.title || "Untitled"}
                                </span>
                              </div>
                            </div>
                            <div className="card-body p-2 pt-1">
                              <div className="d-flex gap-1">
                                <button 
                                  className="btn btn-warning btn-sm flex-grow-1 rounded-pill"
                                  onClick={(e) => { e.stopPropagation(); addToCart(item._id, item); }}
                                  style={{ fontSize: "0.7rem", padding: "4px 8px" }}
                                >
                                  <i className="fas fa-cart-plus me-1"></i>Cart
                                </button>
                                <button 
                                  className="btn btn-sm btn-outline-danger rounded-circle"
                                  onClick={(e) => { e.stopPropagation(); handleLike(item._id); }}
                                  style={{ width: "30px", height: "30px", padding: 0 }}
                                >
                                  <i className={`fas fa-heart ${likedItems.has(item._id) ? 'text-danger' : ''}`} style={{ fontSize: "0.7rem" }}></i>
                                </button>
                                <button 
                                  className="btn btn-sm btn-outline-info rounded-circle"
                                  onClick={(e) => { e.stopPropagation(); handleMessage(item.photographer?._id); }}
                                  style={{ width: "30px", height: "30px", padding: 0 }}
                                >
                                  <i className="fas fa-envelope" style={{ fontSize: "0.7rem" }}></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
            </>}

            {/* Albums view */}
            {activeView === "albums" && (
              <div className="px-2 px-sm-0">
                {/* Album search */}
                <div className="mb-3 position-relative">
                  <i className="fas fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-white-50" style={{ fontSize: "0.8rem" }}></i>
                  <input
                    type="text"
                    className="form-control rounded-pill ps-5"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontSize: "0.85rem" }}
                    placeholder="Search albums or photographer..."
                    value={albumSearch}
                    onChange={e => setAlbumSearch(e.target.value)}
                  />
                </div>

                {albumsLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-warning mb-2" style={{ width: "2rem", height: "2rem" }}></div>
                    <p className="text-white-50 small">Loading albums...</p>
                  </div>
                ) : albums.filter(a =>
                  a.name?.toLowerCase().includes(albumSearch.toLowerCase()) ||
                  a.photographer?.username?.toLowerCase().includes(albumSearch.toLowerCase())
                ).length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-folder-open fa-3x text-white-50 mb-3"></i>
                    <p className="text-white-50">No albums found</p>
                  </div>
                ) : (
                  <div className="row g-3">
                    {albums
                      .filter(a =>
                        a.name?.toLowerCase().includes(albumSearch.toLowerCase()) ||
                        a.photographer?.username?.toLowerCase().includes(albumSearch.toLowerCase())
                      )
                      .map(album => {
                        const alreadyPurchased = (album.purchasedBy || []).map(id => id.toString()).includes(userId?.toString());
                        const isFree = !album.price || album.price <= 0;
                        return (
                          <div key={album._id} className="col-12 col-sm-6 col-lg-4">
                            <div className="card bg-dark border-secondary h-100 overflow-hidden" style={{ borderRadius: 14 }}>
                              <div className="position-relative" style={{ height: 160 }}>
                                <img
                                  src={album.coverImage || placeholderMedium}
                                  alt={album.name}
                                  className="w-100 h-100"
                                  style={{ objectFit: "cover" }}
                                  onError={e => { e.target.src = placeholderMedium; }}
                                />
                                <div className="position-absolute top-0 start-0 end-0 bottom-0"
                                  style={{ background: "linear-gradient(transparent 40%, rgba(0,0,0,0.75))" }} />
                                <div className="position-absolute bottom-0 start-0 p-2">
                                  {isFree ? (
                                    <span className="badge bg-success rounded-pill px-2" style={{ fontSize: "0.7rem" }}>Free</span>
                                  ) : (
                                    <span className="badge bg-warning text-dark rounded-pill px-2" style={{ fontSize: "0.7rem" }}>
                                      KES {Number(album.price).toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="card-body p-3">
                                <h6 className="text-white fw-bold mb-1 text-truncate">{album.name}</h6>
                                <p className="text-white-50 small mb-2 text-truncate">{album.description || "No description"}</p>
                                <div className="d-flex align-items-center gap-2 mb-3">
                                  <i className="fas fa-camera text-warning" style={{ fontSize: "0.75rem" }}></i>
                                  <small className="text-white-50">{album.photographer?.username || "Unknown"}</small>
                                  <span className="ms-auto">
                                    <i className="fas fa-images text-white-50 me-1" style={{ fontSize: "0.7rem" }}></i>
                                    <small className="text-white-50">{album.mediaCount || 0}</small>
                                  </span>
                                </div>
                                {isFree ? (
                                  <button className="btn btn-sm btn-outline-success w-100 rounded-pill" style={{ fontSize: "0.8rem" }}>
                                    <i className="fas fa-unlock me-1"></i>Free Access
                                  </button>
                                ) : alreadyPurchased ? (
                                  <button className="btn btn-sm btn-outline-secondary w-100 rounded-pill" style={{ fontSize: "0.8rem" }} disabled>
                                    <i className="fas fa-check me-1"></i>Purchased
                                  </button>
                                ) : (
                                  <button
                                    className="btn btn-sm btn-warning w-100 rounded-pill fw-bold"
                                    style={{ fontSize: "0.8rem" }}
                                    onClick={() => handleBuyAlbum(album)}
                                    disabled={buyingAlbum === album._id}
                                  >
                                    {buyingAlbum === album._id
                                      ? <><span className="spinner-border spinner-border-sm me-1"></span>Buying...</>
                                      : <><i className="fas fa-shopping-bag me-1"></i>Buy — KES {Number(album.price).toLocaleString()}</>
                                    }
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          {showSidebar && (
            <div style={{ 
              width: `${sidebarWidth}px`, 
              flexShrink: 0,
              transition: "width 0.3s ease-in-out"
            }}>
              <div className="position-sticky" style={{ top: "20px" }}>
                
                {/* Fading Banner Component */}
                <div className="position-relative rounded-3 overflow-hidden mb-4" style={{ 
                  height: `clamp(420px, 45vh, 520px)`,
                  background: "#0a0a0a",
                  borderRadius: "20px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.3)"
                }}>
                  {/* Current Banner Image */}
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
                    <div className="position-absolute w-100 h-100" style={{
                      background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 100%)"
                    }}></div>
                  </div>
                  
                  {/* Next Banner Image */}
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
                    <div className="position-absolute w-100 h-100" style={{
                      background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 100%)"
                    }}></div>
                  </div>
                  
                  {/* Banner Content */}
                  <div className="position-relative h-100 d-flex flex-column justify-content-end p-4" style={{ zIndex: 2 }}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="badge bg-warning text-dark rounded-pill px-3 py-1">
                        <i className="fas fa-camera me-1"></i> {bannerImages[currentBannerIndex].badge}
                      </div>
                    </div>
                    <h4 className="fw-bold mb-2" style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)" }}>
                      {bannerImages[currentBannerIndex].title}
                    </h4>
                    <p className="text-white-50 small mb-2">
                      <i className="fas fa-user-circle me-1"></i> {bannerImages[currentBannerIndex].photographer}
                    </p>
                    <p className="text-white-50 small mb-3" style={{ fontSize: "0.75rem" }}>
                      {bannerImages[currentBannerIndex].description}
                    </p>
                    <div className="d-flex gap-2 mb-3">
                      <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold">
                        {bannerImages[currentBannerIndex].price}
                      </span>
                      <button className="btn btn-sm btn-outline-warning rounded-pill px-3 flex-grow-1">
                        <i className="fas fa-shopping-cart me-1"></i> Buy Now
                      </button>
                    </div>
                  </div>
                  
                  {/* Dots Indicator */}
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
                          width: currentBannerIndex === idx ? "clamp(16px, 3vw, 24px)" : "clamp(4px, 1vw, 6px)",
                          height: "clamp(4px, 1vw, 6px)",
                          backgroundColor: currentBannerIndex === idx ? "#6BBDD0" : "rgba(255,255,255,0.5)",
                          transition: "all 0.3s ease",
                          cursor: "pointer"
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Additional Promo Cards */}
                <div className="bg-dark rounded-3 p-3 text-center mb-3" style={{ 
                  background: "linear-gradient(135deg, #2a1b3d 0%, #1a1a2e 100%)", 
                  borderRadius: "20px" 
                }}>
                  <i className="fas fa-gem fs-1 text-warning mb-2"></i>
                  <h6 className="fw-bold mb-1">Premium Collection</h6>
                  <p className="small text-white-50 mb-2">Get 20% off on first purchase</p>
                  <button className="btn btn-warning btn-sm rounded-pill w-100">
                    <i className="fas fa-tag me-1"></i> Claim Offer
                  </button>
                </div>

                <div className="bg-dark rounded-3 p-3" style={{ 
                  background: "linear-gradient(135deg, #1e3c2c 0%, #0a2a1a 100%)", 
                  borderRadius: "20px" 
                }}>
                  <i className="fas fa-download fs-1 text-warning mb-2"></i>
                  <h6 className="fw-bold mb-1">Daily Free Photo</h6>
                  <p className="small text-white-50 mb-2">New free photo every day</p>
                  <button className="btn btn-outline-warning btn-sm rounded-pill w-100">
                    <i className="fas fa-arrow-right me-1"></i> Download Now
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Protected Modal with Anti-Screenshot Measures */}
      {showModal && selectedPhoto && (
        <div 
          className="modal show d-block" 
          style={{ 
            backgroundColor: "rgba(0,0,0,0.95)", 
            zIndex: 1060,
            backdropFilter: "blur(5px)"
          }} 
          onClick={() => setShowModal(false)}
          onContextMenu={(e) => {
            e.preventDefault();
            setShowProtectionWarning(true);
            setTimeout(() => setShowProtectionWarning(false), 2000);
            return false;
          }}
        >
          <div className="modal-dialog modal-dialog-centered m-0 mx-auto" style={{ maxWidth: "90vw", minHeight: "100vh", display: "flex", alignItems: "center" }}>
            <div className="modal-content bg-transparent border-0" onClick={(e) => e.stopPropagation()}>
              <button 
                className="btn-close btn-close-white position-absolute top-0 end-0 m-3" 
                style={{ zIndex: 1061 }}
                onClick={() => setShowModal(false)}
              ></button>
              <div className="text-center position-relative">
                {/* Watermark Overlay */}
                <div 
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%) rotate(-25deg)",
                    fontSize: "clamp(24px, 5vw, 48px)",
                    fontWeight: "bold",
                    color: "rgba(107,189,208,0.3)",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                    pointerEvents: "none",
                    zIndex: 10,
                    whiteSpace: "nowrap",
                    width: "100%",
                    textAlign: "center"
                  }}
                >
                  © Relic Snap
                </div>
                
                {/* Image with protection */}
                <img 
                  ref={imageRef}
                  src={imageUrls[selectedPhoto._id] || resolveImage(selectedPhoto) || placeholderMedium} 
                  alt={selectedPhoto.title} 
                  className="img-fluid rounded-3 protected-image"
                  style={{ 
                    maxHeight: "80vh", 
                    maxWidth: "100%", 
                    objectFit: "contain",
                    pointerEvents: "none",
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    MozUserSelect: "none",
                    msUserSelect: "none"
                  }} 
                  onDragStart={(e) => {
                    e.preventDefault();
                    return false;
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setShowProtectionWarning(true);
                    setTimeout(() => setShowProtectionWarning(false), 2000);
                    return false;
                  }}
                />
                
                {/* Protective overlay to block screenshot tools */}
                <div 
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "transparent",
                    pointerEvents: "none",
                    zIndex: 5
                  }}
                />
                
                <div className="mt-3">
                  <h5 className="fw-bold mb-1">{selectedPhoto.title}</h5>
                  <p className="text-white-50 small mb-2">By {selectedPhoto.photographer?.username || "Anonymous"}</p>
                  <div className="d-flex justify-content-center gap-2">
                    <button className="btn btn-warning btn-sm rounded-pill px-3" onClick={() => addToCart(selectedPhoto._id, selectedPhoto)}>
                      <i className="fas fa-cart-plus me-1"></i>Add to Cart
                    </button>
                    <button className="btn btn-outline-light btn-sm rounded-pill px-3" onClick={() => handleLike(selectedPhoto._id)}>
                      <i className="fas fa-heart me-1"></i>Like ({selectedPhoto.likes || 0})
                    </button>
                  </div>
                  <div className="mt-2">
                    <small className="text-white-50">
                      <i className="fas fa-shield-alt me-1"></i>
                      Protected content - Screenshots disabled
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
          10% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          90% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
        }
        
        .card {
          animation: fadeInUp 0.4s ease-out;
          transition: all 0.2s ease;
        }
        
        .protected-image {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        
        .no-select {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        
        .overflow-auto::-webkit-scrollbar {
          height: 3px;
        }
        
        .overflow-auto::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        
        .overflow-auto::-webkit-scrollbar-thumb {
          background: rgba(107,189,208,0.5);
          border-radius: 10px;
        }
        
        @media (max-width: 768px) {
          button, .btn {
            min-height: 36px;
          }
          .btn-sm {
            min-height: 30px;
          }
        }
      `}</style>
    </BuyerLayout>
  );
};

export default BuyerExplore;