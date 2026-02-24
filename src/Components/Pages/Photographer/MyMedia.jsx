import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import PhotographerLayout from "./PhotographerLayout";

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

  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : {};
  
  const photographerId = user._id || user.id || user.userId || user.photographerId;
  
  const headers = { Authorization: `Bearer ${token}` };

  const fetchMedia = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(API, { headers });
      
      if (!Array.isArray(res.data)) {
        setMedia([]);
        setLoading(false);
        return;
      }

      // Filter media by photographer
      const myMedia = res.data.filter(item => {
        const matches = 
          item.photographer === photographerId ||
          item.photographerId === photographerId ||
          item.userId === photographerId ||
          item.uploadedBy === photographerId ||
          item.photographer?._id === photographerId ||
          item.photographer?.id === photographerId;
        
        return matches;
      });

      setMedia(myMedia.length > 0 ? myMedia : res.data); // Show all if none match

    } catch (error) {
      setError(error.response?.data?.message || "Failed to load media");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setError("No authentication token found. Please log in again.");
      setLoading(false);
      return;
    }
    fetchMedia();
  }, []);

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

  // FIXED: Extract filename from fileUrl and construct proper URL
  const getImageUrl = (item) => {
    // If this image previously failed to load, return placeholder
    if (imageErrors[item._id]) {
      return "https://via.placeholder.com/300?text=Image+Not+Found";
    }

    // Extract filename from the fileUrl path
    if (item.fileUrl) {
      // Split by / and get the last part (the filename)
      const filename = item.fileUrl.split('/').pop();
      if (filename) {
        // Construct URL to your backend static file serving
        return `https://pm-backend-1-0s8f.onrender.com/uploads/photos/${filename}`;
      }
    }

    // Fallback to placeholder
    return "https://via.placeholder.com/300?text=No+Image";
  };

  // Handle image load error
  const handleImageError = (itemId) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };

  // Calculate stats
  const stats = {
    total: media.length,
    photos: media.filter(item => item.mediaType === "photo").length,
    videos: media.filter(item => item.mediaType === "video").length,
    totalValue: media.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0),
    totalLikes: media.reduce((sum, item) => sum + (item.likes || 0), 0),
    totalViews: media.reduce((sum, item) => sum + (item.views || 0), 0),
    totalDownloads: media.reduce((sum, item) => sum + (item.downloads || 0), 0),
  };

  // Glass style
  const glassStyle = {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  };

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
              onClick={fetchMedia}
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
                  const imageUrl = getImageUrl(item);
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
                          <img
                            src={imageUrl}
                            alt={item.title}
                            className="card-img-top"
                            style={{ 
                              height: "180px", 
                              objectFit: "cover",
                              background: "#1a1a1a"
                            }}
                            onError={() => handleImageError(item._id)}
                          />
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
                                style={{
                                  background: "rgba(255, 255, 255, 0.1)",
                                  border: "1px solid rgba(255, 193, 7, 0.3)",
                                }}
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

      {/* Preview Modal */}
      {showPreviewModal && selectedMedia && (
        <div
          className="modal show d-block"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(5px)",
            zIndex: 1050,
          }}
          onClick={() => {
            setShowPreviewModal(false);
            setSelectedMedia(null);
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div 
              className="modal-content bg-dark"
              style={{
                ...glassStyle,
                borderRadius: "24px",
                border: "1px solid rgba(255, 193, 7, 0.3)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header border-warning border-opacity-25">
                <h5 className="modal-title text-white">
                  <i className="fas fa-edit me-2 text-warning"></i>
                  Edit Media
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowPreviewModal(false);
                    setSelectedMedia(null);
                  }}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="row">
                  <div className="col-md-6">
                    {selectedMedia.mediaType === "video" ? (
                      <video
                        src={getImageUrl(selectedMedia)}
                        className="img-fluid rounded-3 mb-3"
                        style={{ width: "100%", maxHeight: "300px", objectFit: "contain" }}
                        controls
                      />
                    ) : (
                      <img
                        src={getImageUrl(selectedMedia)}
                        alt={selectedMedia.title}
                        className="img-fluid rounded-3 mb-3"
                        style={{ width: "100%", maxHeight: "300px", objectFit: "contain" }}
                        onError={() => handleImageError(selectedMedia._id)}
                      />
                    )}
                    
                    <div className="d-flex justify-content-around p-3 rounded-3" style={{ background: "rgba(0,0,0,0.3)" }}>
                      <div className="text-center">
                        <i className="fas fa-heart text-danger"></i>
                        <p className="text-white mb-0">{selectedMedia.likes || 0}</p>
                        <small className="text-white-50">Likes</small>
                      </div>
                      <div className="text-center">
                        <i className="fas fa-eye text-info"></i>
                        <p className="text-white mb-0">{selectedMedia.views || 0}</p>
                        <small className="text-white-50">Views</small>
                      </div>
                      <div className="text-center">
                        <i className="fas fa-download text-success"></i>
                        <p className="text-white mb-0">{selectedMedia.downloads || 0}</p>
                        <small className="text-white-50">Downloads</small>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target);
                      const updatedData = {
                        title: formData.get('title'),
                        description: formData.get('description'),
                        price: parseFloat(formData.get('price')),
                        mediaType: formData.get('mediaType'),
                      };
                      handleUpdateMedia(selectedMedia._id, updatedData);
                    }}>
                      <div className="mb-3">
                        <label className="form-label text-white-50 small fw-semibold">
                          <i className="fas fa-heading me-2 text-warning"></i>
                          Title
                        </label>
                        <input
                          type="text"
                          name="title"
                          className="form-control bg-transparent text-white"
                          defaultValue={selectedMedia.title}
                          style={{
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                          }}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label text-white-50 small fw-semibold">
                          <i className="fas fa-align-left me-2 text-warning"></i>
                          Description
                        </label>
                        <textarea
                          name="description"
                          className="form-control bg-transparent text-white"
                          rows="3"
                          defaultValue={selectedMedia.description}
                          style={{
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                          }}
                        ></textarea>
                      </div>

                      <div className="mb-3">
                        <label className="form-label text-white-50 small fw-semibold">
                          <i className="fas fa-tag me-2 text-warning"></i>
                          Price (KES)
                        </label>
                        <input
                          type="number"
                          name="price"
                          className="form-control bg-transparent text-white"
                          defaultValue={selectedMedia.price}
                          style={{
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                          }}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label text-white-50 small fw-semibold">
                          <i className="fas fa-film me-2 text-warning"></i>
                          Media Type
                        </label>
                        <select
                          name="mediaType"
                          className="form-select bg-transparent text-white"
                          defaultValue={selectedMedia.mediaType || "photo"}
                          style={{
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          <option value="photo" className="bg-dark">Photo</option>
                          <option value="video" className="bg-dark">Video</option>
                        </select>
                      </div>

                      <div className="d-flex gap-2 justify-content-end mt-4">
                        <button
                          type="button"
                          className="btn btn-outline-secondary rounded-pill px-4"
                          onClick={() => {
                            setShowPreviewModal(false);
                            setSelectedMedia(null);
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-warning rounded-pill px-4"
                          disabled={updating}
                        >
                          {updating ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Updating...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-save me-2"></i>
                              Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PhotographerLayout>
  );
};

export default PhotographerMedia;