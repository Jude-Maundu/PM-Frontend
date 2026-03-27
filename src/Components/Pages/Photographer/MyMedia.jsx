import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import PhotographerLayout from "./PhotographerLayout";
import { useNavigate } from "react-router-dom";
import MasonryGrid from "../../MasonryGrid";
import { fetchProtectedUrl, getImageUrl } from "../../../utils/imageUrl";
import { placeholderMedium } from "../../../utils/placeholders";
import { getAuthToken, getCurrentUserId } from "../../../utils/auth";
import {
  getMyMedia,
  deleteMedia,
  updateMediaPrice,
  createAlbum,
  getAlbums,
  getAlbumMedia,
  updateAlbum,
  deleteAlbum,
  generateShareLink,
  addMediaToAlbum,
  removeMediaFromAlbum,
} from "../../../api/API";

const PhotographerMedia = () => {
  // Watermark state
  const [watermark, setWatermark] = useState("");
  
  // Fetch watermark from backend on mount
  useEffect(() => {
    const fetchWatermark = async () => {
      try {
        const photographerId = getCurrentUserId();
        if (!photographerId) return;
        const res = await import("../../../api/API").then(m => m.getUser(photographerId));
        const profile = res.data || {};
        setWatermark(profile.watermark || "");
      } catch (err) {
        setWatermark("");
      }
    };
    fetchWatermark();
  }, []);

  // State declarations
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [error, setError] = useState("");
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [shareMedia, setShareMedia] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [showEditAlbumModal, setShowEditAlbumModal] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [shareMaxDownloads, setShareMaxDownloads] = useState(10);
  const [shareExpirationDays, setShareExpirationDays] = useState(7);
  const [shareMessage, setShareMessage] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [shareQrUrl, setShareQrUrl] = useState("");
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [mediaUrls, setMediaUrls] = useState({});
  const [activeTab, setActiveTab] = useState("gallery");
  const [creatingAlbum, setCreatingAlbum] = useState(false);
  const [updatingAlbum, setUpdatingAlbum] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [newAlbumDescription, setNewAlbumDescription] = useState("");
  const [createAlbumError, setCreateAlbumError] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [showAlbumMediaModal, setShowAlbumMediaModal] = useState(false);
  const [albumMedia, setAlbumMedia] = useState([]);
  const [loadingAlbumMedia, setLoadingAlbumMedia] = useState(false);
  
  // NEW: State for adding media to album
  const [showAddToAlbumModal, setShowAddToAlbumModal] = useState(false);
  const [selectedMediaForAlbum, setSelectedMediaForAlbum] = useState(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState("");
  const [addingToAlbum, setAddingToAlbum] = useState(false);

  const navigate = useNavigate();
  const token = getAuthToken();

  // Fetch protected URLs
  const fetchProtectedUrls = useCallback(async (mediaItems) => {
    const urlMap = {};
    
    for (const item of mediaItems) {
      const mediaId = item._id;
      if (!mediaId) continue;
      
      try {
        let url = getImageUrl(item, null);
        
        if (!url || url === placeholderMedium) {
          try {
            const protectedUrl = await fetchProtectedUrl(mediaId, { userId, token });
            if (protectedUrl && protectedUrl.trim()) {
              url = protectedUrl;
            }
          } catch (err) {
            console.warn(`Failed to fetch protected URL for ${item.title}`);
          }
        }
        
        urlMap[mediaId] = url || placeholderMedium;
      } catch (err) {
        urlMap[mediaId] = placeholderMedium;
      }
    }
    
    setMediaUrls(urlMap);
  }, [userId, token]);

  // Fetch media
  const fetchMedia = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getMyMedia();

      let mediaItems = [];
      if (Array.isArray(res.data)) {
        mediaItems = res.data;
      } else if (Array.isArray(res.data?.media)) {
        mediaItems = res.data.media;
      } else {
        mediaItems = [];
      }

      // Filter for current user
      const userMedia = userId 
        ? mediaItems.filter(item => {
            const ownerId = item.photographer?._id || item.photographer?.id || item.owner || item.userId;
            return String(ownerId) === String(userId);
          })
        : mediaItems;

      setMedia(userMedia);
      await fetchProtectedUrls(userMedia);
    } catch (error) {
      console.error("Error fetching media:", error);
      setError(error.response?.data?.message || "Failed to load media");
    } finally {
      setLoading(false);
    }
  }, [userId, token, fetchProtectedUrls]);

  // Load albums
  const loadAlbums = async () => {
    try {
      const res = await getAlbums();
      let list = [];
      if (Array.isArray(res.data)) {
        list = res.data;
      } else if (Array.isArray(res.data?.albums)) {
        list = res.data.albums;
      } else if (Array.isArray(res.data?.data)) {
        list = res.data.data;
      }
      setAlbums(list);
    } catch (err) {
      console.warn("Failed to load albums:", err.message);
    }
  };

  // Create album
  const handleCreateAlbum = async (event) => {
    event.preventDefault();
    if (!newAlbumName.trim()) {
      setCreateAlbumError("Please enter a name for the album.");
      return;
    }

    setCreateAlbumError(null);
    setCreatingAlbum(true);

    try {
      const payload = {
        name: newAlbumName.trim(),
        description: newAlbumDescription.trim(),
      };

      console.log("Creating album with payload:", payload);
      
      const res = await createAlbum(payload);
      const data = res.data || {};
      const album = data.album || data;
      
      console.log("Album created successfully:", album);
      
      setAlbums(prev => [...prev, album]);

      // Reset form
      setNewAlbumName("");
      setNewAlbumDescription("");
      setShowAlbumModal(false);
      
    } catch (err) {
      console.error("Create album error:", err);
      const message = err.response?.data?.message || err.message || "Failed to create album";
      setCreateAlbumError(message);
    } finally {
      setCreatingAlbum(false);
    }
  };

  // NEW: Add media to album
  const handleAddToAlbum = async () => {
    if (!selectedMediaForAlbum || !selectedAlbumId) {
      alert("Please select a media item and an album");
      return;
    }

    setAddingToAlbum(true);
    try {
      await addMediaToAlbum(selectedAlbumId, selectedMediaForAlbum._id);
      alert("Media added to album successfully!");
      
      // Refresh album media if the album is currently being viewed
      if (selectedAlbum && selectedAlbum._id === selectedAlbumId) {
        refreshAlbumMedia(selectedAlbumId);
      }
      
      setShowAddToAlbumModal(false);
      setSelectedMediaForAlbum(null);
      setSelectedAlbumId("");
    } catch (err) {
      console.error("Error adding to album:", err);
      alert(err.response?.data?.message || "Failed to add media to album");
    } finally {
      setAddingToAlbum(false);
    }
  };

  // NEW: Remove media from album
  const handleRemoveFromAlbum = async (mediaId, albumId) => {
    if (!window.confirm("Remove this media from the album?")) return;
    
    try {
      await removeMediaFromAlbum(albumId, mediaId);
      // Refresh album media
      await refreshAlbumMedia(albumId);
    } catch (err) {
      console.error("Error removing from album:", err);
      alert(err.response?.data?.message || "Failed to remove media from album");
    }
  };

  // Refresh album media
  const refreshAlbumMedia = async (albumId) => {
    try {
      const res = await getAlbumMedia(albumId);
      const data = res.data || {};
      setAlbumMedia(data.media || []);
    } catch (err) {
      console.error("Failed to refresh album media:", err);
    }
  };

  // Generate share link for MEDIA
  const generateMediaShareLink = async (item) => {
    if (!item || !item._id) {
      setShareError("No media selected.");
      return;
    }

    setShareError(null);
    setShareLoading(true);

    try {
      const payload = {
        mediaId: item._id,
        maxDownloads: parseInt(shareMaxDownloads, 10) || 10,
        expirationDays: parseInt(shareExpirationDays, 10) || 7,
      };

      if (shareMessage?.trim()) {
        payload.message = shareMessage.trim();
      }

      const res = await generateShareLink(payload);
      const data = res.data || {};
      const link = data.shareUrl || data.link || data.url;

      if (!link) {
        throw new Error("No share URL returned.");
      }

      setShareLink(link);
      setShareQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`);
    } catch (err) {
      setShareError(err.message || "Failed to generate share link");
    } finally {
      setShareLoading(false);
    }
  };

  // Generate share link for ALBUM
  const generateAlbumShareLink = async (album) => {
    if (!album?._id) {
      setShareError("No album selected.");
      return;
    }
    
    setShareError(null);
    setShareLoading(true);
    
    try {
      const payload = {
        albumId: album._id,
        maxDownloads: parseInt(shareMaxDownloads, 10) || 10,
        expirationDays: parseInt(shareExpirationDays, 10) || 7,
        message: shareMessage?.trim() || undefined,
      };
      const res = await generateShareLink(payload);
      const data = res.data || {};
      const link = data.shareUrl || data.link || data.url;
      
      if (!link) throw new Error("No share URL returned");
      
      setShareLink(link);
      setShareQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`);
    } catch (err) {
      setShareError(err.message || "Failed to generate share link");
      setShareLink("");
      setShareQrUrl("");
    } finally {
      setShareLoading(false);
    }
  };

  // View album details
  const handleViewAlbum = async (album) => {
    if (!album?._id) return;
    setLoadingAlbumMedia(true);
    setSelectedAlbum(album);
    try {
      const res = await getAlbumMedia(album._id);
      const data = res.data || {};
      setAlbumMedia(data.media || []);
      setShowAlbumMediaModal(true);
    } catch (err) {
      console.error("Failed to load album media:", err);
      alert(err.response?.data?.message || "Failed to load album");
    } finally {
      setLoadingAlbumMedia(false);
    }
  };

  // Update album
  const handleUpdateAlbum = async (e) => {
    e.preventDefault();
    if (!editingAlbum?._id) return;
    if (!editingAlbum.name?.trim()) {
      alert("Album name is required");
      return;
    }

    setUpdatingAlbum(true);
    try {
      const payload = {
        name: editingAlbum.name.trim(),
        description: editingAlbum.description?.trim() || "",
      };

      const res = await updateAlbum(editingAlbum._id, payload);
      const updatedAlbum = res.data?.album || res.data;

      setAlbums(prev => prev.map(album => 
        album._id === editingAlbum._id ? { ...album, ...updatedAlbum } : album
      ));
      
      setShowEditAlbumModal(false);
      setEditingAlbum(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update album");
    } finally {
      setUpdatingAlbum(false);
    }
  };

  // Delete album
  const handleDeleteAlbum = async (albumId) => {
    if (!window.confirm("Delete this album? The media will remain in your library.")) return;
    
    try {
      await deleteAlbum(albumId);
      setAlbums(prev => prev.filter(album => album._id !== albumId));
      if (selectedAlbum?._id === albumId) {
        setShowAlbumMediaModal(false);
        setSelectedAlbum(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete album");
    }
  };

  // Get media URL
  const getMediaUrl = (item) => {
    if (!item) return placeholderMedium;
    const id = item._id;
    return mediaUrls[id] || placeholderMedium;
  };

  // Handle media error
  const handleMediaError = (event, item) => {
    console.warn(`Media failed to load: ${item.title}`);
    if (event?.target) {
      event.target.src = placeholderMedium;
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this media permanently?")) return;
    
    try {
      await deleteMedia(id);
      setMedia(media.filter(item => item._id !== id));
      setMediaUrls(prev => {
        const newMap = { ...prev };
        delete newMap[id];
        return newMap;
      });
    } catch (error) {
      alert(error.response?.data?.message || "Delete failed");
    }
  };

  // Handle price update
  const handlePriceUpdate = async (id, newPrice) => {
    if (!newPrice || newPrice <= 0) {
      alert("Please enter a valid price");
      return;
    }

    try {
      await updateMediaPrice(id, newPrice);
      setMedia(media.map(item => 
        item._id === id ? { ...item, price: newPrice } : item
      ));
      setEditingItem(null);
    } catch (error) {
      alert(error.response?.data?.message || "Price update failed");
    }
  };

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      const userStr = localStorage.getItem("user");
      const role = localStorage.getItem("role");
      
      if (!token) {
        setError("Please log in again.");
        setTimeout(() => navigate("/login"), 2000);
        setAuthChecked(true);
        return;
      }

      if (role !== "photographer" && role !== "admin") {
        setError("Access denied. Photographers and admins only.");
        setTimeout(() => navigate("/photographer/dashboard"), 2000);
        setAuthChecked(true);
        return;
      }

      if (userStr) {
        try {
          const id = getCurrentUserId();
          setUserId(id);
          await fetchMedia();
          await loadAlbums();
        } catch (err) {
          setError("Invalid user data.");
          setTimeout(() => navigate("/login"), 2000);
        }
      }
      
      setAuthChecked(true);
    };

    checkAuth();
  }, [fetchMedia, navigate]);

  // Stats
  const stats = {
    total: media.length,
    photos: media.filter(item => item.mediaType === "photo").length,
    videos: media.filter(item => item.mediaType === "video").length,
    totalValue: media.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0),
  };

  const glassStyle = {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  };

  if (!authChecked) {
    return (
      <PhotographerLayout>
        <div className="text-center py-5">
          <div className="spinner-border text-warning mb-3"></div>
          <p className="text-white-50">Loading...</p>
        </div>
      </PhotographerLayout>
    );
  }

  return (
    <PhotographerLayout>
      <div className="position-relative">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <div className="d-flex gap-2 mt-3 mt-md-0">
            <button 
              className="btn btn-outline-success rounded-pill px-4" 
              onClick={() => setShowAlbumModal(true)}
            >
              <i className="fas fa-folder-plus me-2"></i>
              New Album
            </button>
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

        {/* Tabs */}
        <div className="d-flex gap-2 mb-4 border-bottom border-secondary pb-2">
          <button
            className={`btn btn-sm ${activeTab === "gallery" ? "btn-warning" : "btn-outline-secondary"} rounded-pill px-4`}
            onClick={() => setActiveTab("gallery")}
          >
            Gallery ({media.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === "albums" ? "btn-warning" : "btn-outline-secondary"} rounded-pill px-4`}
            onClick={() => setActiveTab("albums")}
          >
            Albums ({albums.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === "stats" ? "btn-warning" : "btn-outline-secondary"} rounded-pill px-4`}
            onClick={() => setActiveTab("stats")}
          >
            Stats
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger mb-4">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
          </div>
        )}

        {/* Stats Cards */}
        {activeTab === "stats" && (
          <div className="row g-3 mb-4">
            <div className="col-md-3 col-6">
              <div className="card text-center p-3" style={glassStyle}>
                <h3 className="text-warning fw-bold mb-1">{stats.total}</h3>
                <small className="text-white-50">Total Items</small>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="card text-center p-3" style={glassStyle}>
                <h3 className="text-info fw-bold mb-1">{stats.photos}</h3>
                <small className="text-white-50">Photos</small>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="card text-center p-3" style={glassStyle}>
                <h3 className="text-success fw-bold mb-1">{stats.videos}</h3>
                <small className="text-white-50">Videos</small>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="card text-center p-3" style={glassStyle}>
                <h3 className="text-warning fw-bold mb-1">
                  KES {stats.totalValue.toLocaleString()}
                </h3>
                <small className="text-white-50">Total Value</small>
              </div>
            </div>
          </div>
        )}

        {/* Albums Section */}
        {activeTab === "albums" && (
          <div className="mb-4">
            {albums.length === 0 ? (
              <div className="text-center py-5" style={glassStyle}>
                <i className="fas fa-folder-open fa-4x text-white-50 mb-3"></i>
                <p className="text-white-50 mb-3">No albums yet. Create your first album!</p>
                <button className="btn btn-warning" onClick={() => setShowAlbumModal(true)}>
                  <i className="fas fa-plus me-2"></i>Create Album
                </button>
              </div>
            ) : (
              <div className="row g-3">
                {albums.map((album) => (
                  <div className="col-md-4 col-sm-6" key={album._id}>
                    <div className="card bg-dark border-secondary h-100" style={{ borderRadius: "12px", overflow: "hidden" }}>
                      <div className="position-relative">
                        <img
                          src={album.coverImage || placeholderMedium}
                          className="card-img-top"
                          alt={album.name}
                          style={{ height: "160px", objectFit: "contain", backgroundColor: "#1a1a1a", cursor: "pointer" }}
                          onClick={() => handleViewAlbum(album)}
                          onError={(e) => { e.target.src = placeholderMedium; }}
                        />
                        <div className="position-absolute top-0 end-0 m-2">
                          <div className="dropdown">
                            <button className="btn btn-sm btn-dark rounded-circle" data-bs-toggle="dropdown">
                              <i className="fas fa-ellipsis-v"></i>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end bg-dark border-secondary">
                              <li>
                                <button className="dropdown-item text-white" onClick={() => handleViewAlbum(album)}>
                                  <i className="fas fa-eye me-2 text-info"></i>View
                                </button>
                              </li>
                              <li>
                                <button className="dropdown-item text-white" onClick={() => {
                                  setEditingAlbum(album);
                                  setShowEditAlbumModal(true);
                                }}>
                                  <i className="fas fa-edit me-2 text-warning"></i>Edit
                                </button>
                              </li>
                              <li>
                                <button className="dropdown-item text-white" onClick={() => generateAlbumShareLink(album)}>
                                  <i className="fas fa-share-alt me-2 text-success"></i>Share
                                </button>
                              </li>
                              <li><hr className="dropdown-divider" /></li>
                              <li>
                                <button className="dropdown-item text-danger" onClick={() => handleDeleteAlbum(album._id)}>
                                  <i className="fas fa-trash me-2"></i>Delete
                                </button>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="card-body p-3">
                        <h6 className="text-warning mb-1 text-truncate">{album.name}</h6>
                        <p className="text-white-50 small text-truncate mb-2">
                          {album.description || 'No description'}
                        </p>
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-white-50">
                            <i className="fas fa-calendar me-1"></i>
                            {new Date(album.createdAt).toLocaleDateString()}
                          </small>
                          <button 
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => handleViewAlbum(album)}
                          >
                            View ({album.mediaCount || 0})
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Album Media Modal */}
        {showAlbumMediaModal && selectedAlbum && (
          <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.9)", zIndex: 1060 }}>
            <div className="modal-dialog modal-xl modal-dialog-centered">
              <div className="modal-content bg-dark border-warning">
                <div className="modal-header border-warning">
                  <div>
                    <h5 className="modal-title text-warning">
                      <i className="fas fa-folder-open me-2"></i>
                      {selectedAlbum.name}
                    </h5>
                    <p className="text-white-50 small mb-0 mt-1">{selectedAlbum.description}</p>
                  </div>
                  <button className="btn-close btn-close-white" onClick={() => setShowAlbumMediaModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <button 
                      className="btn btn-sm btn-outline-warning"
                      onClick={() => {
                        setSelectedMediaForAlbum(null);
                        setShowAddToAlbumModal(true);
                      }}
                    >
                      <i className="fas fa-plus me-2"></i>
                      Add Media to Album
                    </button>
                  </div>
                  {loadingAlbumMedia ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-warning"></div>
                      <p className="text-white-50 mt-2">Loading media...</p>
                    </div>
                  ) : albumMedia.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="fas fa-image fa-4x text-white-50 mb-3"></i>
                      <p className="text-white-50">This album has no media yet.</p>
                      <button 
                        className="btn btn-warning"
                        onClick={() => {
                          setSelectedMediaForAlbum(null);
                          setShowAddToAlbumModal(true);
                        }}
                      >
                        <i className="fas fa-plus me-2"></i>Add Media to Album
                      </button>
                    </div>
                  ) : (
                    <div className="row g-3">
                      {albumMedia.map((item) => (
                        <div className="col-lg-3 col-md-4 col-sm-6" key={item._id}>
                          <div className="card bg-dark border-secondary">
                            <img
                              src={getMediaUrl(item)}
                              className="card-img-top"
                              alt={item.title}
                              style={{ height: "150px", objectFit: "contain", backgroundColor: "#1a1a1a", cursor: "pointer" }}
                              onClick={() => {
                                setSelectedMedia(item);
                                setShowPreviewModal(true);
                              }}
                              onError={(e) => handleMediaError(e, item)}
                            />
                            <div className="card-body p-2">
                              <small className="text-white-50 text-truncate d-block">{item.title || 'Untitled'}</small>
                              <div className="mt-2 d-flex gap-2">
                                <button 
                                  className="btn btn-sm btn-outline-warning flex-grow-1"
                                  onClick={() => {
                                    setSelectedMedia(item);
                                    setShowPreviewModal(true);
                                  }}
                                >
                                  Details
                                </button>
                                <button 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleRemoveFromAlbum(item._id, selectedAlbum._id)}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add to Album Modal */}
        {showAddToAlbumModal && (
          <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.8)", zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content bg-dark border-warning">
                <div className="modal-header border-warning">
                  <h5 className="modal-title text-warning">
                    <i className="fas fa-plus me-2"></i>
                    Add Media to Album
                  </h5>
                  <button className="btn-close btn-close-white" onClick={() => setShowAddToAlbumModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label text-white">Select Media</label>
                    <select 
                      className="form-select bg-dark text-white border-secondary"
                      value={selectedMediaForAlbum?._id || ""}
                      onChange={(e) => {
                        const mediaItem = media.find(m => m._id === e.target.value);
                        setSelectedMediaForAlbum(mediaItem);
                      }}
                    >
                      <option value="">Choose a media item...</option>
                      {media.map(item => (
                        <option key={item._id} value={item._id}>
                          {item.title || "Untitled"} - KES {item.price}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-white">Select Album</label>
                    <select 
                      className="form-select bg-dark text-white border-secondary"
                      value={selectedAlbumId}
                      onChange={(e) => setSelectedAlbumId(e.target.value)}
                    >
                      <option value="">Choose an album...</option>
                      {albums.map(album => (
                        <option key={album._id} value={album._id}>
                          {album.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-warning flex-grow-1" 
                      onClick={handleAddToAlbum}
                      disabled={addingToAlbum || !selectedMediaForAlbum || !selectedAlbumId}
                    >
                      {addingToAlbum ? 'Adding...' : 'Add to Album'}
                    </button>
                    <button 
                      className="btn btn-outline-secondary" 
                      onClick={() => setShowAddToAlbumModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Share Panel */}
        {shareMedia && (
          <div className="card bg-dark border-warning mb-4">
            <div className="card-header bg-transparent border-warning d-flex justify-content-between align-items-center">
              <h6 className="mb-0 text-warning">
                <i className="fas fa-share-alt me-2"></i>
                Share: {shareMedia?.title || 'Media'}
              </h6>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setShareMedia(null)}>
                Close
              </button>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label text-white-50 small">Max Downloads</label>
                  <input
                    type="number"
                    className="form-control bg-dark border-secondary text-white"
                    value={shareMaxDownloads}
                    onChange={(e) => setShareMaxDownloads(e.target.value)}
                    min={1}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label text-white-50 small">Expires (days)</label>
                  <input
                    type="number"
                    className="form-control bg-dark border-secondary text-white"
                    value={shareExpirationDays}
                    onChange={(e) => setShareExpirationDays(e.target.value)}
                    min={1}
                  />
                </div>
                <div className="col-12 mb-3">
                  <label className="form-label text-white-50 small">Message (optional)</label>
                  <textarea
                    className="form-control bg-dark border-secondary text-white"
                    value={shareMessage}
                    onChange={(e) => setShareMessage(e.target.value)}
                    rows={2}
                  />
                </div>
                {shareError && (
                  <div className="col-12 mb-3">
                    <div className="alert alert-danger small">{shareError}</div>
                  </div>
                )}
                <div className="col-12">
                  <button
                    className="btn btn-warning w-100"
                    onClick={() => generateMediaShareLink(shareMedia)}
                    disabled={shareLoading}
                  >
                    {shareLoading ? 'Generating...' : 'Generate Share Link'}
                  </button>
                </div>
                {shareLink && (
                  <>
                    <div className="col-12 mt-3">
                      <div className="bg-dark p-3 rounded border border-warning">
                        <p className="text-white-50 small mb-1">Share Link</p>
                        <a href={shareLink} className="text-warning small" target="_blank" rel="noreferrer" style={{ wordBreak: "break-all" }}>
                          {shareLink}
                        </a>
                      </div>
                    </div>
                    {shareQrUrl && (
                      <div className="col-12 mt-3 text-center">
                        <img src={shareQrUrl} alt="QR Code" width={120} />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Media Grid */}
        {activeTab === "gallery" && (
          <>
            {loading ? (
              <div className="text-center py-5" style={glassStyle}>
                <div className="spinner-border text-warning mb-3"></div>
                <p className="text-white-50">Loading...</p>
              </div>
            ) : media.length === 0 ? (
              <div className="text-center py-5" style={glassStyle}>
                <i className="fas fa-cloud-upload-alt fa-4x text-white-50 mb-3"></i>
                <h5 className="text-white mb-2">Your library is empty</h5>
                <Link to="/photographer/upload" className="btn btn-warning mt-3">
                  Upload Media
                </Link>
              </div>
            ) : (
              <MasonryGrid
                items={media}
                mobileColumns={2}
                tabletColumns={3}
                desktopColumns={4}
                gap={16}
                renderItem={(item) => {
                  const mediaUrl = getMediaUrl(item);
                  const isEditing = editingItem === item._id;
                  return (
                    <div className="card border-0" style={glassStyle}>
                      <div className="watermark-overlay protected-content" style={{ position: "relative" }}>
                        <img
                          src={mediaUrl}
                          className="card-img-top protected-image"
                          alt={item.title}
                          style={{ height: "180px", objectFit: "contain", backgroundColor: "#1a1a1a", cursor: "pointer" }}
                          onClick={() => {
                            setSelectedMedia(item);
                            setShowPreviewModal(true);
                          }}
                          onError={(e) => handleMediaError(e, item)}
                        />
                        {watermark && (
                          <div
                            style={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%) rotate(-25deg)",
                              fontSize: 22,
                              fontWeight: "bold",
                              color: "rgba(255,255,255,0.35)",
                              textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
                              pointerEvents: "none",
                              zIndex: 10,
                              userSelect: "none",
                              whiteSpace: "pre-wrap",
                              textAlign: "center",
                              width: "90%",
                            }}
                          >
                            {watermark}
                          </div>
                        )}
                      </div>
                      <div className="card-body p-2">
                        <h6 className="text-truncate mb-2">{item.title || "Untitled"}</h6>
                        <div className="d-flex gap-2 mb-2">
                          <button
                            className="btn btn-sm btn-outline-info flex-grow-1"
                            onClick={() => {
                              setSelectedMediaForAlbum(item);
                              setShowAddToAlbumModal(true);
                            }}
                          >
                            <i className="fas fa-folder-plus me-1"></i> Add to Album
                          </button>
                        </div>
                        {isEditing ? (
                          <div className="d-flex gap-2">
                            <input
                              type="number"
                              className="form-control form-control-sm bg-dark text-white"
                              defaultValue={item.price}
                              id={`price-${item._id}`}
                            />
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => {
                                const input = document.getElementById(`price-${item._id}`);
                                handlePriceUpdate(item._id, parseFloat(input.value));
                              }}
                            >
                              Save
                            </button>
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => setEditingItem(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-warning flex-grow-1"
                              onClick={() => setEditingItem(item._id)}
                            >
                              Set Price
                            </button>
                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() => setShareMedia(item)}
                            >
                              Share
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(item._id)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }}
              />
            )}
          </>
        )}
      </div>

      {/* Create Album Modal */}
      {showAlbumModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.8)", zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark border-warning">
              <div className="modal-header border-warning">
                <h5 className="modal-title text-warning">
                  <i className="fas fa-folder-plus me-2"></i>
                  Create New Album
                </h5>
                <button className="btn-close btn-close-white" onClick={() => setShowAlbumModal(false)}></button>
              </div>
              <div className="modal-body">
                {createAlbumError && (
                  <div className="alert alert-danger small">{createAlbumError}</div>
                )}
                <form onSubmit={handleCreateAlbum}>
                  <div className="mb-3">
                    <label className="form-label text-white">Album Name *</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary"
                      value={newAlbumName}
                      onChange={(e) => setNewAlbumName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-white">Description</label>
                    <textarea
                      className="form-control bg-dark text-white border-secondary"
                      rows="3"
                      value={newAlbumDescription}
                      onChange={(e) => setNewAlbumDescription(e.target.value)}
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-warning flex-grow-1" disabled={creatingAlbum}>
                      {creatingAlbum ? 'Creating...' : 'Create Album'}
                    </button>
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowAlbumModal(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Album Modal */}
      {showEditAlbumModal && editingAlbum && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.8)", zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark border-warning">
              <div className="modal-header border-warning">
                <h5 className="modal-title text-warning">
                  <i className="fas fa-edit me-2"></i>
                  Edit Album
                </h5>
                <button className="btn-close btn-close-white" onClick={() => setShowEditAlbumModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleUpdateAlbum}>
                  <div className="mb-3">
                    <label className="form-label text-white">Album Name *</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary"
                      value={editingAlbum.name || ""}
                      onChange={(e) => setEditingAlbum({ ...editingAlbum, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-white">Description</label>
                    <textarea
                      className="form-control bg-dark text-white border-secondary"
                      rows="3"
                      value={editingAlbum.description || ""}
                      onChange={(e) => setEditingAlbum({ ...editingAlbum, description: e.target.value })}
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-warning flex-grow-1" disabled={updatingAlbum}>
                      {updatingAlbum ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowEditAlbumModal(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedMedia && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.9)", zIndex: 1060 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content bg-dark">
              <div className="modal-header border-secondary">
                <h5 className="text-white">{selectedMedia.title || 'Media Details'}</h5>
                <button className="btn-close btn-close-white" onClick={() => setShowPreviewModal(false)}></button>
              </div>
              <div className="modal-body text-center">
                <img
                  src={getMediaUrl(selectedMedia)}
                  alt={selectedMedia.title}
                  className="img-fluid rounded"
                  style={{ maxHeight: "60vh" }}
                  onError={(e) => handleMediaError(e, selectedMedia)}
                />
                <div className="mt-3 text-start">
                  <p><strong className="text-warning">Price:</strong> KES {selectedMedia.price}</p>
                  <p><strong className="text-warning">Likes:</strong> {selectedMedia.likes || 0}</p>
                  <p><strong className="text-warning">Views:</strong> {selectedMedia.views || 0}</p>
                  <p><strong className="text-warning">Downloads:</strong> {selectedMedia.downloads || 0}</p>
                  {albums.length > 0 && (
                    <div className="mt-3">
                      <label className="text-warning small">Add to Album:</label>
                      <select 
                        className="form-select form-select-sm bg-dark text-white border-secondary mt-1"
                        onChange={(e) => {
                          if (e.target.value) {
                            setSelectedMediaForAlbum(selectedMedia);
                            setSelectedAlbumId(e.target.value);
                            handleAddToAlbum();
                          }
                        }}
                      >
                        <option value="">Select album</option>
                        {albums.map(album => (
                          <option key={album._id} value={album._id}>{album.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
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