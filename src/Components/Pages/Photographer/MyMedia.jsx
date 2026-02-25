import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import PhotographerLayout from "./PhotographerLayout";
import { useNavigate } from "react-router-dom";

const API = "https://pm-backend-1-0s8f.onrender.com/api/media";

const PhotographerMedia = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [videoErrors, setVideoErrors] = useState({});
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [authChecked, setAuthChecked] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // Modified fetchMedia to accept userId parameter
  const fetchMedia = async (id) => {
    setLoading(true);
    setError("");
    try {
      console.log("🔍 Fetching media for user ID:", id);
      const res = await axios.get(API, { headers });
      
      if (!Array.isArray(res.data)) {
        setMedia([]);
        setLoading(false);
        return;
      }

      console.log(`📦 Total media in DB: ${res.data.length}`);
      console.log(`👤 Current user ID: ${id}`);

      // Filter using the passed ID, not state
      const myMedia = res.data.filter(item => {
        let photographerId = null;
        
        if (item.photographer && typeof item.photographer === 'object') {
          photographerId = item.photographer._id || item.photographer.id;
        } else {
          photographerId = item.photographer || item.photographerId;
        }
        
        const photographerIdStr = photographerId ? String(photographerId).trim() : null;
        const userIdStr = id ? String(id).trim() : null;
        
        const matches = photographerIdStr === userIdStr;
        
        if (matches) console.log(`✅ Match found: ${item.title}`);
        
        return matches;
      });

      console.log(`📸 Found ${myMedia.length} media items for user ${id}`);
      setMedia(myMedia);

    } catch (error) {
      console.error("Error fetching media:", error);
      setError(error.response?.data?.message || "Failed to load media");
    } finally {
      setLoading(false);
    }
  };

  // Check authentication and role on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      const role = localStorage.getItem("role");
      
      console.log("🔐 Auth Check - Token:", token ? "Present" : "Missing");
      console.log("🔐 Auth Check - Role:", role);
      console.log("🔐 Auth Check - User:", userStr);

      if (!token) {
        setError("No authentication token found. Please log in again.");
        setTimeout(() => navigate("/login"), 2000);
        return false;
      }

      // ✅ Allow both photographers AND admins
      if (role !== "photographer" && role !== "admin") {
        setError(`Access denied. Your role is "${role}". Photographers and admins only.`);
        setTimeout(() => navigate("/dashboard"), 2000);
        return false;
      }

      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          // Get the ID from the user object
          const id = user._id || user.id || user.userId || user.photographerId;
          
          // Set state FIRST
          setUserId(id);
          setUserRole(role);
          
          console.log("✅ User ID found and set:", id);
          console.log("✅ Role:", role, "- Access granted");
          
          // THEN fetch media with the ID
          fetchMedia(id); // Pass ID directly
          
          return true;
        } catch (err) {
          console.error("Error parsing user data:", err);
          setError("Invalid user data. Please log in again.");
          setTimeout(() => navigate("/login"), 2000);
          return false;
        }
      } else {
        setError("User data not found. Please log in again.");
        setTimeout(() => navigate("/login"), 2000);
        return false;
      }
    };

    const isAuthenticated = checkAuth();
    setAuthChecked(true);
  }, []); // Empty dependency array - runs once on mount

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this media permanently?")) return;
    
    try {
      await axios.delete(`${API}/${id}`, { headers });
      setMedia(media.filter(item => item._id !== id));
    } catch (error) {
      alert(error.response?.data?.message || "Delete failed");
    }
  };

  const handlePriceUpdate = async (id, newPrice) => {
    if (!newPrice || newPrice <= 0) {
      alert("Please enter a valid price");
      return;
    }

    setUpdating(true);
    try {
      await axios.put(`${API}/${id}/price`, { price: newPrice }, { headers });
      
      setMedia(media.map(item => {
        if (item._id === id) {
          return { ...item, price: newPrice };
        }
        return item;
      }));
      
      setEditingItem(null);
    } catch (error) {
      alert(error.response?.data?.message || "Price update failed");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateMedia = async (id, updatedData) => {
    setUpdating(true);
    try {
      await axios.put(`${API}/${id}`, updatedData, { headers });
      
      setMedia(media.map(item => {
        if (item._id === id) {
          return { ...item, ...updatedData };
        }
        return item;
      }));
      
      setShowPreviewModal(false);
      setSelectedMedia(null);
    } catch (error) {
      alert(error.response?.data?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  const getMediaUrl = (item) => {
    if (!item || !item.fileUrl) return null;

    if (item.mediaType === "video" && videoErrors[item._id]) {
      return null;
    }
    if (item.mediaType === "photo" && imageErrors[item._id]) {
      return null;
    }

    const filename = item.fileUrl.split('/').pop();
    if (!filename) return null;

    const baseUrl = "https://pm-backend-1-0s8f.onrender.com";
    return `${baseUrl}/uploads/photos/${filename}`;
  };

  const handleMediaError = (item, errorType) => {
    console.log(`❌ Media failed to load: ${item.title}`);
    if (item.mediaType === "video") {
      setVideoErrors(prev => ({ ...prev, [item._id]: true }));
    } else {
      setImageErrors(prev => ({ ...prev, [item._id]: true }));
    }
  };

  const stats = {
    total: media.length,
    photos: media.filter(item => item.mediaType === "photo").length,
    videos: media.filter(item => item.mediaType === "video").length,
    totalValue: media.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0),
    totalLikes: media.reduce((sum, item) => sum + (item.likes || 0), 0),
    totalViews: media.reduce((sum, item) => sum + (item.views || 0), 0),
    totalDownloads: media.reduce((sum, item) => sum + (item.downloads || 0), 0),
  };

  const glassStyle = {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  };

  if (!authChecked) {
    return (
      <PhotographerLayout>
        <div className="text-center py-5">
          <div className="spinner-border text-warning mb-3"></div>
          <p className="text-white-50">Checking authentication...</p>
        </div>
      </PhotographerLayout>
    );
  }

  return (
    <PhotographerLayout>
      {/* Background Image */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2070&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: "0.1",
          zIndex: 0,
        }}
      ></div>

      {/* Content */}
      <div className="position-relative" style={{ zIndex: 1 }}>
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <div>
            <h2 className="fw-bold mb-1">
              <i className="fas fa-photo-video me-2 text-warning"></i>
              My Media Library
            </h2>
            <p className="text-white-50 small mb-0">
              <i className="fas fa-images me-2"></i>
              Total: {stats.total} items · {stats.photos} photos · {stats.videos} videos
            </p>
          </div>
          <div className="d-flex gap-2 mt-3 mt-md-0">
            <button 
              className="btn btn-outline-warning rounded-pill px-4" 
              onClick={() => fetchMedia(userId)}
            >
              <i className="fas fa-sync-alt me-2"></i>
              Refresh
            </button>
            <Link to="/photographer/upload" className="btn btn-warning rounded-pill px-4">
              <i className="fas fa-plus me-2"></i>
              Upload
            </Link>
          </div>
        </div>

        {/* Debug Info */}
        <div 
          className="alert mb-4"
          style={{
            background: "rgba(0, 123, 255, 0.1)",
            border: "1px solid rgba(0, 123, 255, 0.3)",
            borderRadius: "12px",
            color: "#17a2b8",
          }}
        >
          <div className="d-flex align-items-center">
            <i className="fas fa-bug me-3 fa-lg"></i>
            <div>
              <small className="d-block">
                <strong>Debug Info:</strong>
              </small>
              <small className="d-block">
                User ID: {userId || "❌ Not found"} | 
                Role: {userRole || "❌ No role"} |
                Token: {token ? "✅ Present" : "❌ Missing"} |
                Status: {(userRole === "photographer" || userRole === "admin") ? "✅ Access granted" : "❌ Access denied"}
              </small>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div 
            className="alert d-flex align-items-center mb-4" 
            style={{
              background: "rgba(220, 53, 69, 0.1)",
              border: "1px solid rgba(220, 53, 69, 0.3)",
              borderRadius: "12px",
              color: "#dc3545",
            }}
          >
            <i className="fas fa-exclamation-circle me-2"></i>
            <span>{error}</span>
            <button 
              type="button" 
              className="btn-close btn-close-white ms-auto" 
              onClick={() => setError("")}
            ></button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-2 col-6">
            <div 
              className="card text-center p-3 h-100"
              style={{
                ...glassStyle,
                borderRadius: "16px",
              }}
            >
              <h3 className="text-warning fw-bold mb-1">{stats.total}</h3>
              <small className="text-white-50">Total Items</small>
            </div>
          </div>
          <div className="col-md-2 col-6">
            <div 
              className="card text-center p-3 h-100"
              style={{
                ...glassStyle,
                borderRadius: "16px",
              }}
            >
              <h3 className="text-info fw-bold mb-1">{stats.photos}</h3>
              <small className="text-white-50">Photos</small>
            </div>
          </div>
          <div className="col-md-2 col-6">
            <div 
              className="card text-center p-3 h-100"
              style={{
                ...glassStyle,
                borderRadius: "16px",
              }}
            >
              <h3 className="text-success fw-bold mb-1">{stats.videos}</h3>
              <small className="text-white-50">Videos</small>
            </div>
          </div>
          <div className="col-md-2 col-6">
            <div 
              className="card text-center p-3 h-100"
              style={{
                ...glassStyle,
                borderRadius: "16px",
              }}
            >
              <h3 className="text-warning fw-bold mb-1">{stats.totalLikes}</h3>
              <small className="text-white-50">Likes</small>
            </div>
          </div>
          <div className="col-md-2 col-6">
            <div 
              className="card text-center p-3 h-100"
              style={{
                ...glassStyle,
                borderRadius: "16px",
              }}
            >
              <h3 className="text-info fw-bold mb-1">{stats.totalViews}</h3>
              <small className="text-white-50">Views</small>
            </div>
          </div>
          <div className="col-md-2 col-6">
            <div 
              className="card text-center p-3 h-100"
              style={{
                ...glassStyle,
                borderRadius: "16px",
              }}
            >
              <h3 className="text-warning fw-bold mb-1">
                KES {stats.totalValue.toLocaleString()}
              </h3>
              <small className="text-white-50">Value</small>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div 
            className="text-center py-5 rounded-4"
            style={glassStyle}
          >
            <div className="spinner-border text-warning mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-white-50">Loading your media library...</p>
          </div>
        )}

        {/* Media Grid */}
        {!loading && (
          <>
            {media.length === 0 ? (
              <div 
                className="text-center py-5 rounded-4"
                style={glassStyle}
              >
                <i className="fas fa-cloud-upload-alt fa-4x text-white-50 mb-3"></i>
                <h5 className="text-white mb-2">Your media library is empty</h5>
                <p className="text-white-50 mb-4">Upload your first photo or video to get started</p>
                <Link to="/photographer/upload" className="btn btn-warning btn-lg px-5">
                  <i className="fas fa-plus me-2"></i>
                  Upload Media
                </Link>
              </div>
            ) : (
              <div className="row g-4">
                {media.map((item) => {
                  const mediaUrl = getMediaUrl(item);
                  const isEditing = editingItem === item._id;
                  
                  return (
                    <div className="col-lg-3 col-md-4 col-6" key={item._id}>
                      <div 
                        className="card h-100 border-0"
                        style={{
                          ...glassStyle,
                          borderRadius: "16px",
                          overflow: "hidden",
                          transition: "all 0.3s ease",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-5px)";
                          e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                        onClick={() => {
                          setSelectedMedia(item);
                          setShowPreviewModal(true);
                        }}
                      >
                        <div className="position-relative">
                          {item.mediaType === "video" ? (
                            <div className="position-relative">
                              <video
                                src={mediaUrl}
                                className="card-img-top"
                                style={{ 
                                  height: "180px", 
                                  objectFit: "cover",
                                  background: "#1a1a1a"
                                }}
                                onError={() => handleMediaError(item, "video")}
                              />
                              <div className="position-absolute top-50 start-50 translate-middle">
                                <div className="bg-dark bg-opacity-75 rounded-circle p-3">
                                  <i className="fas fa-play text-warning fa-2x"></i>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <img
                              src={mediaUrl}
                              alt={item.title}
                              className="card-img-top"
                              style={{ 
                                height: "180px", 
                                objectFit: "cover",
                                background: "#1a1a1a"
                              }}
                              onError={() => handleMediaError(item, "photo")}
                            />
                          )}
                          
                          <span 
                            className="position-absolute top-0 end-0 m-2 badge rounded-pill"
                            style={{
                              background: "rgba(255, 193, 7, 0.9)",
                              color: "#000",
                              padding: "8px 12px",
                            }}
                          >
                            <i className="fas fa-tag me-1"></i>
                            KES {parseFloat(item.price || 0).toLocaleString()}
                          </span>
                          <span 
                            className="position-absolute top-0 start-0 m-2 badge rounded-pill"
                            style={{
                              background: item.mediaType === "video" 
                                ? "rgba(23, 162, 184, 0.9)" 
                                : "rgba(40, 167, 69, 0.9)",
                              color: "#fff",
                              padding: "8px 12px",
                            }}
                          >
                            <i className={`fas ${item.mediaType === "video" ? "fa-video" : "fa-camera"} me-1`}></i>
                            {item.mediaType || "photo"}
                          </span>
                        </div>
                        
                        <div className="card-body p-3">
                          <h6 className="card-title fw-bold text-truncate mb-2" title={item.title}>
                            {item.title || "Untitled"}
                          </h6>
                          
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <small className="text-white-50">
                              <i className="fas fa-heart text-danger me-1"></i>
                              {item.likes || 0}
                            </small>
                            <small className="text-white-50">
                              <i className="fas fa-eye me-1"></i>
                              {item.views || 0}
                            </small>
                            <small className="text-white-50">
                              <i className="fas fa-download me-1"></i>
                              {item.downloads || 0}
                            </small>
                          </div>

                          {isEditing ? (
                            <div className="d-flex gap-2" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="number"
                                className="form-control form-control-sm bg-dark text-white border-warning"
                                defaultValue={item.price}
                                id={`price-${item._id}`}
                                min="0"
                                step="0.01"
                              />
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => {
                                  const input = document.getElementById(`price-${item._id}`);
                                  handlePriceUpdate(item._id, parseFloat(input.value));
                                }}
                                disabled={updating}
                              >
                                <i className="fas fa-check"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => setEditingItem(null)}
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          ) : (
                            <div className="d-flex gap-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                className="btn btn-sm btn-outline-warning flex-grow-1"
                                onClick={() => setEditingItem(item._id)}
                              >
                                <i className="fas fa-edit me-1"></i>
                                Edit Price
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(item._id)}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </PhotographerLayout>
  );
};

export default PhotographerMedia;