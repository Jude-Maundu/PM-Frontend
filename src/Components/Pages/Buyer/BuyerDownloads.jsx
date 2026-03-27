import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import BuyerLayout from "./BuyerLayout";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "../../../api/apiConfig";
import { placeholderMedium } from "../../../utils/placeholders";
import { getImageUrl, fetchProtectedUrl } from "../../../utils/imageUrl";
import { getLocalPurchases, setLocalPurchases, disableApi, isApiAvailable } from "../../../utils/localStore";

const API = API_BASE_URL;

const BuyerDownloads = () => {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState(null);
  const [imageUrls, setImageUrls] = useState({});
  const [loadingImages, setLoadingImages] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const hasFetched = useRef(false);

  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const user = useMemo(() => userStr ? JSON.parse(userStr) : {}, [userStr]);
  const userId = user.id || user._id;
  const headers = useMemo(() => token ? { Authorization: `Bearer ${token}` } : {}, [token]);

  // Get media image URL (synchronous, from preloaded state)
  const getMediaImageUrl = useCallback((item) => {
    // Try multiple ways to get the media object
    let mediaObj = item.mediaDetails || item.media || item;
    
    // If we have a preloaded URL for this mediaId, use it
    const mediaId = item.mediaId || item.mediaDetails?._id || item._id;
    if (mediaId && imageUrls[mediaId]) {
      return imageUrls[mediaId];
    }
    
    // Try to get URL from getImageUrl helper
    if (mediaObj) {
      const url = getImageUrl(mediaObj, null);
      if (url && url !== placeholderMedium && url.startsWith('http')) {
        return url;
      }
    }
    
    // Fallback to placeholder
    return placeholderMedium;
  }, [imageUrls]);

  // Check if image is loading
  const isImageLoading = useCallback((item) => {
    const mediaId = item.mediaId || item.mediaDetails?._id || item._id;
    return loadingImages[mediaId];
  }, [loadingImages]);

  // Improved image URL resolver with better error handling
  const resolveImageUrl = useCallback(async (item, mediaId) => {
    console.log(`🔍 Resolving image URL for media ${mediaId}`);
    
    // Try to get the media object
    let mediaObj = item.mediaDetails || item.media || item;
    
    // 1. Try direct file URL from media details
    if (mediaObj?.fileUrl) {
      const directUrl = getImageUrl(mediaObj, null);
      if (directUrl && directUrl !== placeholderMedium && directUrl.startsWith('http')) {
        console.log(`✅ Using direct URL for ${mediaId}: ${directUrl}`);
        return directUrl;
      }
    }

    // 2. Try protected URL API
    try {
      console.log(`🔄 Fetching protected URL for ${mediaId}`);
      const protectedUrl = await fetchProtectedUrl(mediaId, { userId, token });
      if (protectedUrl && protectedUrl.startsWith('http')) {
        console.log(`✅ Got protected URL for ${mediaId}: ${protectedUrl}`);
        return protectedUrl;
      }
    } catch (err) {
      console.error(`❌ Failed to fetch protected URL for ${mediaId}:`, err.message);
    }

    // 3. Try to construct URL from media ID if we have a pattern
    try {
      const constructedUrl = `${API}/media/${mediaId}/thumbnail`;
      console.log(`🔧 Trying constructed URL: ${constructedUrl}`);
      // Test if URL works (optional - you can just return it and let img onError handle)
      return constructedUrl;
    } catch (err) {
      console.error(`❌ Failed to construct URL for ${mediaId}`);
    }

    // 4. Final fallback: placeholder
    console.log(`⚠️ Using placeholder for ${mediaId}`);
    return placeholderMedium;
  }, [userId, token]);

  // Preload all image URLs when downloads are loaded
  const preloadImageUrls = useCallback(async (downloadsList) => {
    const urlMap = {};
    
    for (const item of downloadsList) {
      // Try multiple ways to get the media ID
      let mediaId = item.mediaId || item.mediaDetails?._id || item._id;
      
      // If no mediaId, try to get from media object
      if (!mediaId && item.mediaDetails?._id) mediaId = item.mediaDetails._id;
      if (!mediaId && item.media?._id) mediaId = item.media._id;
      if (!mediaId && item._id) mediaId = item._id;
      
      if (!mediaId) {
        console.warn("⚠️ No media ID found for item:", item);
        continue;
      }
      
      console.log(`📸 Preloading image for media ${mediaId}`);
      
      // Set loading state for this image
      setLoadingImages(prev => ({ ...prev, [mediaId]: true }));
      
      const url = await resolveImageUrl(item, mediaId);
      urlMap[mediaId] = url;
      
      setLoadingImages(prev => ({ ...prev, [mediaId]: false }));
    }
    
    setImageUrls(urlMap);
    console.log(`✅ Preloaded ${Object.keys(urlMap).length} image URLs`);
  }, [resolveImageUrl]);

  // Fetch purchase history for downloads
  const fetchDownloads = useCallback(async () => {
    if (!token || !userId) {
      setError("Please login to view your downloads");
      setLoading(false);
      return;
    }

    if (hasFetched.current) return;
    hasFetched.current = true;

    try {
      setLoading(true);
      setError(null);

      console.log("📥 Fetching downloads for user:", userId);

      if (!isApiAvailable("purchaseHistory")) {
        console.log("ℹ️ Using local purchases (API unavailable)");
        const localPurchases = getLocalPurchases();
        setDownloads(localPurchases);
        await preloadImageUrls(localPurchases);
        setLoading(false);
        return;
      }

      const res = await axios.get(API_ENDPOINTS.PAYMENTS.PURCHASE_HISTORY(userId), {
        headers,
        timeout: 30000,
      });

      console.log("✅ Downloads response:", res.data);

      let downloadsData = [];
      if (Array.isArray(res.data)) {
        downloadsData = res.data;
      } else if (res.data?.purchases && Array.isArray(res.data.purchases)) {
        downloadsData = res.data.purchases;
      } else if (res.data?.items && Array.isArray(res.data.items)) {
        downloadsData = res.data.items;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        downloadsData = res.data.data;
      } else {
        console.warn("Unexpected response structure:", res.data);
        downloadsData = [];
      }

      // Normalize each download item to have consistent structure
      const normalizedDownloads = downloadsData.map(item => ({
        ...item,
        mediaId: item.mediaId || item.mediaDetails?._id || item._id,
        title: item.mediaDetails?.title || item.title || item.media?.title || "Untitled",
        photographerName: item.mediaDetails?.photographerName || item.photographerName || item.photographer?.username || "Anonymous",
        createdAt: item.createdAt || item.date || new Date().toISOString(),
        mediaDetails: item.mediaDetails || item.media || item
      }));

      setDownloads(normalizedDownloads);
      setCurrentPage(1);
      
      // Save to local storage as backup
      setLocalPurchases(normalizedDownloads);
      
      // Preload all image URLs
      await preloadImageUrls(normalizedDownloads);
      
    } catch (err) {
      console.error("❌ Error fetching downloads:", err);

      if (err.response?.status === 404 || err.response?.status === 400) {
        console.log("ℹ️ Using local purchases");
        disableApi("purchaseHistory");
        const localPurchases = getLocalPurchases();
        setDownloads(localPurchases);
        setCurrentPage(1);
        await preloadImageUrls(localPurchases);
        setError("Using local purchase data");
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
  }, [token, userId, headers, preloadImageUrls]);

  // Manual refresh function
  const refreshDownloads = useCallback(() => {
    hasFetched.current = false;
    fetchDownloads();
  }, [fetchDownloads]);

  // Pagination setup
  const totalPages = Math.max(1, Math.ceil(downloads.length / itemsPerPage));
  const currentDownloads = downloads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get signed download URL and trigger download
  const handleDownload = useCallback(async (mediaId, title) => {
    if (!mediaId) {
      alert("Cannot download: Media ID not found");
      return;
    }

    setDownloadingId(mediaId);

    try {
      console.log(`📥 Downloading media: ${mediaId}`);

      const response = await fetch(`${API}/media/${mediaId}/download?user=${encodeURIComponent(userId)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Download failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = title || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log(`✅ Download started for: ${title}`);

    } catch (err) {
      console.error("❌ Download error:", err);
      
      // Fallback: try to get protected URL using fetchProtectedUrl
      try {
        const protectedUrl = await fetchProtectedUrl(mediaId, { userId, token });
        if (protectedUrl && protectedUrl.startsWith('http')) {
          const fileResponse = await fetch(protectedUrl, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (fileResponse.ok) {
            const blob = await fileResponse.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = title || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            console.log(`✅ Download started via fallback for: ${title}`);
            return;
          }
        }
      } catch (fallbackErr) {
        console.error("❌ Fallback download also failed:", fallbackErr);
      }

      alert(err.message || "Failed to download file. Please try again later.");
    } finally {
      setDownloadingId(null);
    }
  }, [userId, token]);

  // Fetch on mount
  useEffect(() => {
    fetchDownloads();
  }, [fetchDownloads]);

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
            className="btn btn-outline-warning btn-sm rounded-pill px-4"
            onClick={refreshDownloads}
            disabled={loading}
          >
            <i className="fas fa-sync-alt me-2"></i>
            Refresh
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-warning alert-dismissible fade show mb-4" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
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
            <Link to="/buyer/explore" className="btn btn-warning btn-lg rounded-pill px-5">
              <i className="fas fa-compass me-2"></i>
              Explore Photos
            </Link>
          </div>
        ) : (
          <>
            <div className="row g-4">
              {currentDownloads.map((item, idx) => {
                const mediaId = item.mediaId;
                const title = item.title;
                const photographer = item.photographerName;
                const purchaseDate = item.createdAt;
                const receiptId = item.receiptId || item._id?.slice(-6) || "N/A";
                const isDownloading = downloadingId === mediaId;
                const imageUrl = getMediaImageUrl(item);
                const isLoadingImage = isImageLoading(item);
                
                console.log(`🎨 Rendering item: ${title}, mediaId: ${mediaId}, imageUrl: ${imageUrl?.substring(0, 80)}`);
                
                return (
                  <div className="col-lg-4 col-md-6" key={item._id || idx}>
                    <div className="card bg-dark border-secondary h-100" style={{ borderRadius: "16px", overflow: "hidden" }}>
                      <div className="position-relative" style={{ height: "200px", backgroundColor: "#1a1a1a" }}>
                        {isLoadingImage ? (
                          <div className="d-flex align-items-center justify-content-center h-100">
                            <div className="spinner-border text-warning" style={{ width: "1.5rem", height: "1.5rem" }}>
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={imageUrl}
                            className="card-img-top"
                            style={{ height: "200px", objectFit: "contain", width: "100%", backgroundColor: "#1a1a1a" }}
                            alt={title}
                            onError={(e) => {
                              console.error(`❌ Image failed to load for ${mediaId}: ${imageUrl}`);
                              e.target.src = placeholderMedium;
                              e.target.onerror = null;
                            }}
                          />
                        )}
                        <span className="position-absolute top-0 end-0 m-2 badge bg-success rounded-pill px-3 py-2">
                          <i className="fas fa-check-circle me-1"></i>
                          Purchased
                        </span>
                      </div>
                      <div className="card-body d-flex flex-column p-3">
                        <h5 className="fw-bold mb-1 text-truncate text-white">{title}</h5>
                        <p className="text-white-50 small mb-2">
                          <i className="fas fa-camera me-1"></i>
                          {photographer}
                        </p>
                        <div className="mt-auto">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <small className="text-white-50">
                              <i className="fas fa-calendar me-1"></i>
                              {new Date(purchaseDate).toLocaleDateString()}
                            </small>
                            <small className="text-white-50">
                              <i className="fas fa-receipt me-1"></i>
                              {receiptId}
                            </small>
                          </div>
                          <button
                            className="btn btn-warning w-100 py-2 fw-semibold"
                            onClick={() => handleDownload(mediaId, title)}
                            disabled={isDownloading || !mediaId}
                            style={{ borderRadius: "12px" }}
                          >
                            {isDownloading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Preparing...
                              </>
                            ) : !mediaId ? (
                              <>
                                <i className="fas fa-exclamation-triangle me-2"></i>
                                Download Unavailable
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
            {totalPages > 1 && (
              <div className="d-flex justify-content-center align-items-center mt-4">
                <nav>
                  <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => goToPage(page)}>{page}</button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </BuyerLayout>
  );
};

export default BuyerDownloads;