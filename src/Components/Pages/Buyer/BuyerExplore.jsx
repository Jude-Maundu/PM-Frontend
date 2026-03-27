import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import BuyerLayout from "./BuyerLayout";
import axios from "axios";
import MasonryGrid from "../../MasonryGrid";
import { API_BASE_URL } from "../../../api/apiConfig";
import { placeholderMedium } from "../../../utils/placeholders";
import { getImageUrl, fetchProtectedUrl } from "../../../utils/imageUrl";
import { addToLocalCart, disableApi, isApiAvailable } from "../../../utils/localStore";
import { getUserFollowing, getLikedMedia, addFavorite, removeFavorite, likeMedia, unlikeMedia, followUser, unfollowUser, getConversationWithUser } from "../../../api/API";

const API = API_BASE_URL;

const BuyerExplore = () => {
  const [media, setMedia] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [addingToCart, setAddingToCart] = useState(null);
  const [likedItems, setLikedItems] = useState(new Set());
  const [likingItem, setLikingItem] = useState(null);
  const [followingUsers, setFollowingUsers] = useState(new Set());
  const [followingUser, setFollowingUser] = useState(null);
  const [messagingUser, setMessagingUser] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id || user._id;
  const headers = React.useMemo(() => (token ? { Authorization: `Bearer ${token}` } : {}), [token]);

  const categories = ["All", "Nature", "Travel", "Lifestyle", "Food", "Technology", "Architecture"];

  const resolveImage = (item) => getImageUrl(item, placeholderMedium);

  // Load following status - defined ONCE
  const loadFollowingStatus = useCallback(async () => {
    if (!token || !userId) return;
    
    try {
      const response = await getUserFollowing(userId);
      const followingList = response.data?.following || [];
      const followingIds = new Set(followingList.map(u => u._id));
      setFollowingUsers(followingIds);
    } catch (error) {
      if (error.response?.status === 404) {
        setFollowingUsers(new Set());
        return;
      }
      console.error('Error loading following status:', error);
    }
  }, [token, userId]);

  // Load liked items - defined ONCE
  const loadLikedItems = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await getLikedMedia();
      const likedIds = new Set((response.data || []).map(item => item._id));
      setLikedItems(likedIds);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 400) {
        setLikedItems(new Set());
        return;
      }
      console.error('Error loading liked items:', error);
    }
  }, [token]);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/media`, {
          headers,
          timeout: 10000,
        });

        let items = [];
        if (Array.isArray(res.data?.media)) {
          items = res.data.media;
        } else if (Array.isArray(res.data)) {
          items = res.data;
        }
        
        setMedia(items);

        const urls = {};
        await Promise.all(
          items.map(async (item) => {
            const raw = getImageUrl(item, null);
            const needsProtected =
              !raw ||
              raw.includes("/opt/") ||
              raw.includes("/uploads/") ||
              raw.startsWith("file://");
            const isFree = !item.price || item.price <= 0;

            if (!needsProtected || !isFree) {
              return;
            }

            const mediaId = item._id || item.mediaId;
            if (!mediaId) return;
            const protectedUrl = await fetchProtectedUrl(mediaId);
            if (protectedUrl) {
              urls[mediaId] = protectedUrl;
            }
          })
        );

        setImageUrls(urls);
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
    if (!token) {
      alert("Please login to add items to cart");
      return;
    }

    const feature = "cart";
    const apiAvailable = isApiAvailable(feature);

    if (!apiAvailable) {
      addToLocalCart(mediaId, { title: item?.title, price: item?.price });
      alert("Added to cart (local fallback)");
      return;
    }

    try {
      setAddingToCart(mediaId);
      console.log("[BuyerExplore] Adding to cart:", { userId, mediaId });
      
      await axios.post(`${API}/payments/cart/add`, {
        userId,
        mediaId
      }, { headers });
      alert("Added to cart!");

    } catch (err) {
      const status = err.response?.status;
      const errMsg = err.response?.data?.message || err.message || "Unknown error";
      
      console.error("Error adding to cart:", {
        status,
        message: errMsg,
        userId,
        mediaId,
        fullError: err
      });

      if (status === 404 || status === 400 || status === 500) {
        disableApi(feature);
        addToLocalCart(mediaId, { title: item?.title, price: item?.price });
        alert(`Added to cart (local fallback). Server error: ${errMsg || 'Server unavailable'}`);
        return;
      }

      alert(`Failed to add to cart: ${errMsg}`);
    } finally {
      setAddingToCart(null);
    }
  };

  const handleLike = async (mediaId) => {
    if (!token) {
      alert("Please login to like photos");
      return;
    }

    const isLiked = likedItems.has(mediaId);
    
    try {
      setLikingItem(mediaId);
      
      if (isLiked) {
        await unlikeMedia(mediaId);

        if (userId) {
          try {
            await removeFavorite(userId, mediaId);
          } catch (favErr) {
            console.warn('Warning: unable to remove from favorites after unlike', favErr);
          }
        }

        setLikedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(mediaId);
          return newSet;
        });
      } else {
        await likeMedia(mediaId);

        if (userId) {
          try {
            await addFavorite({ userId, mediaId });
          } catch (favErr) {
            console.warn('Warning: unable to add to favorites after like', favErr);
          }
        }

        setLikedItems(prev => new Set([...prev, mediaId]));
      }

      setMedia(prev => prev.map(item => 
        item._id === mediaId 
          ? { ...item, likes: (item.likes || 0) + (isLiked ? -1 : 1) }
          : item
      ));

    } catch (err) {
      console.error("Error toggling like:", err);
      alert("Failed to update like. Please try again.");
    } finally {
      setLikingItem(null);
    }
  };

  const handleFollow = async (userIdToFollow) => {
    if (!token) {
      alert("Please login to follow users");
      return;
    }

    const isFollowing = followingUsers.has(userIdToFollow);
    
    try {
      setFollowingUser(userIdToFollow);
      
      if (isFollowing) {
        await unfollowUser(userIdToFollow);
        setFollowingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userIdToFollow);
          return newSet;
        });
      } else {
        await followUser(userIdToFollow);
        setFollowingUsers(prev => new Set([...prev, userIdToFollow]));
      }

    } catch (err) {
      console.error("Error toggling follow:", err);
      alert("Failed to update follow. Please try again.");
    } finally {
      setFollowingUser(null);
    }
  };

  const handleMessage = async (photographerId) => {
    if (!token) {
      alert("Please login to message users");
      return;
    }

    if (!photographerId) return;

    try {
      setMessagingUser(photographerId);
      
      const response = await getConversationWithUser(photographerId);
      const conversationId = response?.data?._id;
      
      if (!conversationId) {
        console.error("No conversation id returned", response);
        alert("Unable to start conversation. Please try again.");
        return;
      }

      navigate(`/messages?conversation=${conversationId}`);
      
    } catch (err) {
      console.error("Error starting conversation:", err);
      const status = err?.response?.status;
      if (status === 400) {
        alert("Cannot start conversation with this user.");
      } else if (status === 404) {
        alert("User not found. Please refresh and try again.");
      } else {
        alert("Failed to start conversation. Please try again.");
      }
    } finally {
      setMessagingUser(null);
    }
  };

  const filteredMedia = media.filter(item => {
    const matchesCategory = selectedCategory === "all" || 
      (item.category || "").toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = (item.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    switch(sortBy) {
      case "price_low":
        return (a.price || 0) - (b.price || 0);
      case "price_high":
        return (b.price || 0) - (a.price || 0);
      case "popular":
        return (b.likes || 0) - (a.likes || 0);
      default:
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
  });

  return (
    <BuyerLayout>
      <div className="text-white">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <h2 className="fw-bold mb-3 mb-md-0">
            <i className="fas fa-compass me-2 text-warning"></i>
            Explore Photos
          </h2>
          <div className="d-flex gap-2 flex-column flex-sm-row">
            <input
              type="text"
              className="form-control bg-dark border-secondary text-white"
              placeholder="Search photos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ minWidth: "200px" }}
            />
            <select
              className="form-select bg-dark border-secondary text-white"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: "150px" }}
            >
              <option value="newest">Newest</option>
              <option value="popular">Most Popular</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-4">
          <div className="d-flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                className={`btn ${
                  selectedCategory === cat.toLowerCase() 
                    ? 'btn-warning' 
                    : 'btn-outline-warning'
                }`}
                onClick={() => setSelectedCategory(cat.toLowerCase())}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
            <button type="button" className="btn-close" onClick={() => setError(null)}></button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center py-5">
            <i className="fas fa-search fa-4x text-white-50 mb-3"></i>
            <h5 className="mb-3">No photos found</h5>
            <p className="text-white-50 mb-4">Try adjusting your search or category</p>
            <button 
              className="btn btn-warning"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <MasonryGrid
            items={filteredMedia}
            mobileColumns={2}
            tabletColumns={3}
            desktopColumns={4}
            gap={16}
            renderItem={(item) => (
              <div className="card bg-dark border-secondary h-100">
                <div className="position-relative">
                  <img
                    src={
                      imageUrls[item._id || item.mediaId] ||
                      resolveImage(item) ||
                      placeholderMedium
                    }
                    className="card-img-top"
                    style={{ height: "180px", objectFit: "contain", backgroundColor: "#1a1a1a" }}
                    alt={item.title}
                    loading="lazy"
                    onError={async (e) => {
                      e.target.onerror = null;
                      const mediaId = item._id || item.mediaId;
                      const protectedUrl = await fetchProtectedUrl(mediaId);
                      if (protectedUrl) {
                        e.target.src = protectedUrl;
                      } else {
                        e.target.src = placeholderMedium;
                      }
                    }}
                  />
                  <span className="position-absolute top-0 start-0 m-2 badge bg-warning text-dark">
                    KES {item.price}
                  </span>
                </div>
                <div className="card-body">
                  <h6 className="fw-bold text-truncate mb-1">{item.title}</h6>
                  <small className="text-white-50 d-block mb-2">
                    By {item.photographer?.username || "Anonymous"}
                  </small>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="text-white-50">
                      <i className="fas fa-heart text-danger me-1"></i>
                      {item.likes || 0}
                    </small>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(item._id);
                        }}
                        disabled={likingItem === item._id}
                        title="Like this photo"
                      >
                        {likingItem === item._id ? (
                          <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                          <i className={`fas fa-heart ${likedItems.has(item._id) ? 'text-danger' : ''}`}></i>
                        )}
                      </button>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFollow(item.photographer?._id);
                        }}
                        disabled={followingUser === item.photographer?._id}
                        title={`Follow ${item.photographer?.username || 'this photographer'}`}
                      >
                        {followingUser === item.photographer?._id ? (
                          <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                          <i className={`fas fa-user-plus ${followingUsers.has(item.photographer?._id) ? 'text-primary' : ''}`}></i>
                        )}
                      </button>
                      <button
                        className="btn btn-sm btn-outline-info"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMessage(item.photographer?._id);
                        }}
                        disabled={messagingUser === item.photographer?._id}
                        title={`Message ${item.photographer?.username || 'this photographer'}`}
                      >
                        {messagingUser === item.photographer?._id ? (
                          <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                          <i className="fas fa-envelope"></i>
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    className="btn btn-warning w-100"
                    onClick={() => addToCart(item._id, item)}
                    disabled={addingToCart === item._id}
                  >
                    {addingToCart === item._id ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      <>
                        <i className="fas fa-cart-plus me-2"></i>
                        Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          />
        )}
      </div>
    </BuyerLayout>
  );
};

export default BuyerExplore;