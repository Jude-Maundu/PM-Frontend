import React, { useState, useEffect } from "react";
import BuyerLayout from "./BuyerLayout";
import { Link } from "react-router-dom";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "https://pm-backend-1-0s8f.onrender.com/api";

const BuyerDownloads = () => {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : {};
  const userId = user.id || user._id;
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // Production-ready image URL constructor
  const getImageUrl = (item) => {
    if (!item) return "https://via.placeholder.com/300";
    
    // Check different possible locations for the file URL
    const fileUrl = item.mediaDetails?.fileUrl || item.fileUrl;
    
    if (fileUrl) {
      const filename = fileUrl.split('/').pop();
      if (filename) {
        return `${API.replace('/api', '')}/uploads/photos/${filename}`;
      }
    }
    
    return "https://via.placeholder.com/300";
  };

  // Fetch purchase history for downloads
  const fetchDownloads = async () => {
    if (!token || !userId) {
      setError("Please login to view your downloads");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log("📥 Fetching downloads for user:", userId);
      
      // Try to get purchase history
      const res = await axios.get(`${API}/payments/purchase-history/${userId}`, { 
        headers,
        timeout: 10000 // 10 second timeout
      });
      
      console.log("✅ Downloads response:", res.data);
      
      // If response is array, use it; otherwise check for data.items or data.purchases
      let downloadsData = [];
      if (Array.isArray(res.data)) {
        downloadsData = res.data;
      } else if (res.data.purchases) {
        downloadsData = res.data.purchases;
      } else if (res.data.items) {
        downloadsData = res.data.items;
      }
      
      setDownloads(downloadsData);
      
    } catch (err) {
      console.error("❌ Error fetching downloads:", err);
      
      if (err.response?.status === 404) {
        // Endpoint doesn't exist - show sample data for development
        console.log("ℹ️ Purchase history endpoint not found - using sample data");
        setDownloads([
          {
            _id: "sample1",
            title: "Mountain Sunset",
            photographerName: "John Doe",
            price: 29,
            date: new Date().toISOString(),
            mediaDetails: {
              title: "Mountain Sunset",
              photographerName: "John Doe",
              fileUrl: "sample.jpg"
            }
          }
        ]);
        setError("Using sample data - purchase history endpoint not configured");
      } else if (err.code === 'ECONNABORTED') {
        setError("Request timeout. Please check your connection.");
      } else if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        localStorage.clear();
      } else {
        setError(err.response?.data?.message || "Failed to load downloads");
      }
    } finally {
      setLoading(false);
    }
  };

  // Get signed download URL
  const handleDownload = async (mediaId, title) => {
    if (!mediaId) {
      alert("Cannot download: Media ID not found");
      return;
    }

    try {
      setDownloading(true);
      
      console.log("⬇️ Downloading media:", mediaId);
      
      // Try to get protected media URL
      const res = await axios.get(`${API}/media/${mediaId}/protected`, { 
        headers,
        timeout: 30000 // 30 second timeout for downloads
      });
      
      console.log("✅ Download URL received:", res.data);
      
      // Use the signed URL or fallback to constructed URL
      const downloadUrl = res.data.signedUrl || 
                         res.data.downloadUrl || 
                         `${API.replace('/api', '')}/uploads/photos/${mediaId}.jpg`;
      
      // Create download link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = title || 'download';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message
      alert("Download started!");
      
    } catch (err) {
      console.error("❌ Download error:", err);
      
      if (err.response?.status === 404) {
        alert("Download endpoint not found. Please contact support.");
      } else if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.clear();
        window.location.reload();
      } else {
        alert("Failed to download file. Please try again later.");
      }
    } finally {
      setDownloading(false);
    }
  };

  // Check authentication on mount
  useEffect(() => {
    if (!token || !userId) {
      setError("Please login to view your downloads");
      setLoading(false);
    } else {
      fetchDownloads();
    }
  }, []);

  // If not authenticated, show login prompt
  if (!token || !userId) {
    return (
      <BuyerLayout>
        <div className="text-center py-5">
          <i className="fas fa-lock text-warning fa-4x mb-3"></i>
          <h4 className="text-white mb-3">Authentication Required</h4>
          <p className="text-white-50 mb-4">Please login to view your downloads</p>
          <Link to="/login" className="btn btn-warning">
            <i className="fas fa-sign-in-alt me-2"></i>
            Go to Login
          </Link>
        </div>
      </BuyerLayout>
    );
  }

  return (
    <BuyerLayout>
      <div className="text-white">
        {/* Header with Refresh Button */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">
            <i className="fas fa-download me-2 text-warning"></i>
            My Downloads
          </h2>
          <button 
            className="btn btn-outline-warning btn-sm"
            onClick={fetchDownloads}
            disabled={loading}
          >
            <i className="fas fa-sync-alt me-2"></i>
            Refresh
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setError(null)}
            ></button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-white-50">Loading your downloads...</p>
          </div>
        ) : downloads.length === 0 ? (
          <div className="text-center py-5">
            <i className="fas fa-cloud-download-alt fa-4x text-white-50 mb-3"></i>
            <h5 className="mb-3">No downloads yet</h5>
            <p className="text-white-50 mb-4">Purchase your first photo to start downloading!</p>
            <Link to="/buyer/explore" className="btn btn-warning btn-lg">
              <i className="fas fa-compass me-2"></i>
              Explore Photos
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {downloads.map((item, idx) => {
              // Extract media details safely
              const mediaId = item.mediaId || item.mediaDetails?._id || item._id;
              const title = item.mediaDetails?.title || item.title || "Untitled";
              const photographer = item.mediaDetails?.photographerName || item.photographerName || "Anonymous";
              const purchaseDate = item.createdAt || item.date || new Date().toISOString();
              const receiptId = item.receiptId || item._id?.slice(-6) || "N/A";
              
              return (
                <div className="col-lg-4 col-md-6" key={item._id || idx}>
                  <div className="card bg-dark border-secondary h-100">
                    <div className="position-relative">
                      <img
                        src={getImageUrl(item)}
                        className="card-img-top"
                        style={{ height: "200px", objectFit: "cover" }}
                        alt={title}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/300?text=Image+Not+Found";
                        }}
                      />
                      <span className="position-absolute top-0 end-0 m-2 badge bg-success">
                        <i className="fas fa-check-circle me-1"></i>
                        Purchased
                      </span>
                    </div>
                    <div className="card-body d-flex flex-column">
                      <h5 className="fw-bold mb-1 text-truncate">{title}</h5>
                      <p className="text-white-50 small mb-2">
                        <i className="fas fa-camera me-1"></i>
                        {photographer}
                      </p>
                      <div className="mt-auto">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <small className="text-white-50">
                            <i className="fas fa-calendar me-1"></i>
                            {new Date(purchaseDate).toLocaleDateString()}
                          </small>
                          <small className="text-white-50">
                            <i className="fas fa-receipt me-1"></i>
                            #{receiptId}
                          </small>
                        </div>
                        <button
                          className="btn btn-warning w-100"
                          onClick={() => handleDownload(mediaId, title)}
                          disabled={downloading || !mediaId}
                        >
                          {downloading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Preparing...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-download me-2"></i>
                              Download
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </BuyerLayout>
  );
};

export default BuyerDownloads;