import React, { useState, useEffect } from "react";
import BuyerLayout from "./BuyerLayout";
import { Link } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:4000/api";

const BuyerDownloads = () => {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id || user._id;
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch purchase history for downloads
  const fetchDownloads = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/payments/purchase-history/${userId}`, { headers });
      setDownloads(res.data || []);
    } catch (err) {
      console.error("Error fetching downloads:", err);
      setError("Failed to load downloads");
    } finally {
      setLoading(false);
    }
  };

  // Get signed download URL
  const handleDownload = async (mediaId, title) => {
    try {
      setDownloading(true);
      const res = await axios.get(`${API}/media/${mediaId}/protected`, { headers });
      
      // Create a temporary link and click it
      const link = document.createElement('a');
      link.href = res.data.signedUrl;
      link.download = title || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download file. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    if (!token || !userId) {
      setError("Please login to view downloads");
      return;
    }
    fetchDownloads();
  }, []);

  // Helper for thumbnail
  const getThumbnailUrl = (item) => {
    if (item.mediaDetails?.fileUrl) {
      const filename = item.mediaDetails.fileUrl.split('/').pop();
      return `http://localhost:4000/uploads/photos/${filename}`;
    }
    return "https://via.placeholder.com/300";
  };

  return (
    <BuyerLayout>
      <div className="text-white">
        {/* Header */}
        <h2 className="fw-bold mb-4">
          <i className="fas fa-download me-2 text-warning"></i>
          My Downloads
        </h2>

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
        ) : downloads.length === 0 ? (
          <div className="text-center py-5">
            <i className="fas fa-cloud-download-alt fa-4x text-white-50 mb-3"></i>
            <h5 className="mb-3">No downloads yet</h5>
            <p className="text-white-50 mb-4">Purchase your first photo to start downloading!</p>
            <Link to="/buyer/explore" className="btn btn-warning">
              <i className="fas fa-compass me-2"></i>
              Explore Photos
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {downloads.map((item, idx) => (
              <div className="col-lg-4 col-md-6" key={item._id || idx}>
                <div className="card bg-dark border-secondary h-100">
                  <div className="position-relative">
                    <img
                      src={getThumbnailUrl(item)}
                      className="card-img-top"
                      style={{ height: "200px", objectFit: "cover" }}
                      alt={item.mediaDetails?.title}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300";
                      }}
                    />
                    <span className="position-absolute top-0 end-0 m-2 badge bg-success">
                      <i className="fas fa-check me-1"></i>
                      Purchased
                    </span>
                  </div>
                  <div className="card-body">
                    <h5 className="fw-bold mb-1">{item.mediaDetails?.title || item.title}</h5>
                    <p className="text-white-50 small mb-3">
                      By {item.mediaDetails?.photographerName || item.photographerName}
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <small className="text-white-50 d-block">
                          Purchased: {new Date(item.createdAt || item.date).toLocaleDateString()}
                        </small>
                        <small className="text-white-50">
                          Receipt: #{item.receiptId || item._id?.slice(-6)}
                        </small>
                      </div>
                      <button
                        className="btn btn-warning"
                        onClick={() => handleDownload(
                          item.mediaId || item.mediaDetails?._id,
                          item.mediaDetails?.title
                        )}
                        disabled={downloading}
                      >
                        {downloading ? (
                          <span className="spinner-border spinner-border-sm"></span>
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
            ))}
          </div>
        )}
      </div>
    </BuyerLayout>
  );
};

export default BuyerDownloads;