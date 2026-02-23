import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const AdminMedia = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [filter, setFilter] = useState("all");

  const API = "http://localhost:4000/api/media";

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      console.log("Fetched media:", res.data); // Debug log
      setMedia(res.data);
    } catch (err) {
      console.error("Error fetching media:", err);
      alert("Failed to fetch media");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  // Delete handler
  const deleteMedia = async (id) => {
    if (!window.confirm("Delete this media permanently?")) return;
    try {
      await axios.delete(`${API}/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchMedia();
    } catch (err) {
      alert("Delete failed");
    }
  };

  // Filter media - FIXED to match backend field names
  const filteredMedia = media.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(search.toLowerCase()) ||
                         item.photographer?.username?.toLowerCase().includes(search.toLowerCase());
    
    if (filter === "all") return matchesSearch;
    if (filter === "photos") return matchesSearch && item.mediaType === "photo";
    if (filter === "videos") return matchesSearch && item.mediaType === "video";
    return matchesSearch;
  });

  // Get file URL for display
  const getFileUrl = (fileUrl) => {
    if (!fileUrl) return "https://via.placeholder.com/400";
    // If it's a local file path, you might need to construct the full URL
    if (fileUrl.startsWith('/')) {
      return `http://localhost:4000${fileUrl}`;
    }
    return fileUrl;
  };

  // Glass card style
  const glassStyle = {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  };

  return (
    <AdminLayout>
      {/* Background Image with Overlay */}
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
        {/* Header with Stats */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <div>
            <h2 className="fw-bold mb-1">
              <i className="fas fa-photo-video me-2 text-warning"></i>
              Media Management
            </h2>
            <p className="text-white-50 small mb-0">
              <i className="fas fa-database me-2"></i>
              Total Media: {media.length} · Filtered: {filteredMedia.length}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="d-flex gap-3 mt-3 mt-md-0">
            <div className="text-center">
              <div className="bg-warning bg-opacity-25 rounded-circle p-2 mx-auto mb-1" style={{ width: "40px", height: "40px" }}>
                <i className="fas fa-image text-warning"></i>
              </div>
              <small className="text-white-50 d-block">Photos</small>
              <span className="fw-bold">{media.filter(m => m.mediaType === "photo").length}</span>
            </div>
            <div className="text-center">
              <div className="bg-info bg-opacity-25 rounded-circle p-2 mx-auto mb-1" style={{ width: "40px", height: "40px" }}>
                <i className="fas fa-video text-info"></i>
              </div>
              <small className="text-white-50 d-block">Videos</small>
              <span className="fw-bold">{media.filter(m => m.mediaType === "video").length}</span>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div
          className="d-flex flex-column flex-md-row gap-3 mb-4 p-3 rounded-4"
          style={glassStyle}
        >
          {/* Search */}
          <div className="position-relative flex-grow-1">
            <i className="fas fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-white-50"></i>
            <input
              type="text"
              className="form-control bg-transparent text-white border-secondary rounded-pill"
              placeholder="Search by title or photographer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                paddingLeft: "40px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            />
          </div>

          {/* Filter Buttons */}
          <div className="d-flex gap-2">
            {["all", "photos", "videos"].map((f) => (
              <button
                key={f}
                className={`btn rounded-pill px-4 ${
                  filter === f ? "btn-warning text-dark" : "btn-outline-warning"
                }`}
                onClick={() => setFilter(f)}
                style={{
                  background: filter === f ? "#ffc107" : "rgba(255, 193, 7, 0.1)",
                  borderColor: "rgba(255, 193, 7, 0.3)",
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            className="btn btn-outline-warning rounded-pill px-4"
            onClick={fetchMedia}
          >
            <i className="fas fa-sync-alt me-2"></i>
            Refresh
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div
            className="text-center py-5 rounded-4"
            style={glassStyle}
          >
            <div
              className="spinner-border mb-3"
              style={{ color: "#ffc107", width: "3rem", height: "3rem" }}
            ></div>
            <p className="text-white-50">Loading media library...</p>
          </div>
        )}

        {/* Media Grid/Table */}
        {!loading && (
          <div
            className="rounded-4 overflow-hidden"
            style={glassStyle}
          >
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle mb-0">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                    <th className="ps-4 py-3" style={{ width: "80px" }}>Preview</th>
                    <th className="py-3">Title</th>
                    <th className="py-3">Photographer</th>
                    <th className="py-3">Price</th>
                    <th className="py-3">Type</th>
                    <th className="py-3">Likes</th>
                    <th className="py-3">Views</th>
                    <th className="py-3 pe-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredMedia.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center text-muted py-5">
                        <i className="fas fa-folder-open fa-3x mb-3 opacity-50"></i>
                        <p>No media found</p>
                        <small className="text-white-50">Try adjusting your search or filter</small>
                      </td>
                    </tr>
                  ) : (
                    filteredMedia.map((item, idx) => (
                      <tr
                        key={item._id}
                        style={{
                          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                          background: idx % 2 === 0 ? "rgba(255, 255, 255, 0.02)" : "transparent",
                        }}
                      >
                        {/* Preview */}
                        <td className="ps-4">
                          <div
                            className="position-relative rounded-3 overflow-hidden"
                            style={{ width: "60px", height: "60px", cursor: "pointer" }}
                            onClick={() => {
                              setSelectedMedia(item);
                              setShowPreviewModal(true);
                            }}
                          >
                            {item.mediaType === "video" ? (
                              <div className="bg-dark d-flex align-items-center justify-content-center w-100 h-100">
                                <i className="fas fa-video text-warning"></i>
                              </div>
                            ) : (
                              <img
                                src={getFileUrl(item.fileUrl)}
                                alt={item.title}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://via.placeholder.com/60";
                                }}
                              />
                            )}
                          </div>
                        </td>

                        {/* Title */}
                        <td>
                          <div>
                            <h6 className="fw-bold mb-0">{item.title || "Untitled"}</h6>
                            <small className="text-white-50">
                              ID: {item._id?.substring(0, 8)}...
                            </small>
                            {item.description && (
                              <small className="text-white-50 d-block">
                                {item.description.substring(0, 30)}...
                              </small>
                            )}
                          </div>
                        </td>

                        {/* Photographer */}
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle bg-warning bg-opacity-25 d-flex align-items-center justify-content-center"
                              style={{ width: "32px", height: "32px" }}
                            >
                              <i className="fas fa-user text-warning" style={{ fontSize: "0.8rem" }}></i>
                            </div>
                            <div>
                              <span>{item.photographer?.username || "Unknown"}</span>
                              <small className="text-white-50 d-block">
                                {item.photographer?.email || ""}
                              </small>
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td>
                          <span className="badge bg-warning bg-opacity-25 text-warning px-3 py-2 rounded-pill">
                            ${item.price || 0}
                          </span>
                        </td>

                        {/* Type */}
                        <td>
                          <span
                            className="badge rounded-pill px-3 py-2"
                            style={{
                              background: item.mediaType === "video" 
                                ? "rgba(23, 162, 184, 0.2)" 
                                : "rgba(255, 193, 7, 0.2)",
                              color: item.mediaType === "video" ? "#17a2b8" : "#ffc107",
                              border: `1px solid ${
                                item.mediaType === "video" 
                                  ? "rgba(23, 162, 184, 0.3)" 
                                  : "rgba(255, 193, 7, 0.3)"
                              }`,
                            }}
                          >
                            <i className={`fas ${
                              item.mediaType === "video" ? "fa-video" : "fa-image"
                            } me-2`}></i>
                            {item.mediaType || "photo"}
                          </span>
                        </td>

                        {/* Likes */}
                        <td>
                          <i className="fas fa-heart text-danger me-2"></i>
                          {item.likes || 0}
                        </td>

                        {/* Views */}
                        <td>
                          <i className="fas fa-eye text-info me-2"></i>
                          {item.views || 0}
                        </td>

                        {/* Actions */}
                        <td className="pe-4">
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm rounded-3 px-3"
                              style={{
                                background: "rgba(255, 193, 7, 0.1)",
                                border: "1px solid rgba(255, 193, 7, 0.3)",
                                color: "#ffc107",
                              }}
                              onClick={() => alert("Edit functionality coming soon")}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-sm rounded-3 px-3"
                              style={{
                                background: "rgba(220, 53, 69, 0.1)",
                                border: "1px solid rgba(220, 53, 69, 0.3)",
                                color: "#dc3545",
                              }}
                              onClick={() => deleteMedia(item._id)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer with Pagination - Simplified */}
            {filteredMedia.length > 0 && (
              <div className="d-flex justify-content-between align-items-center p-3 border-top border-secondary border-opacity-25">
                <small className="text-white-50">
                  Showing {filteredMedia.length} {filteredMedia.length === 1 ? 'entry' : 'entries'}
                </small>
                {filteredMedia.length > 10 && (
                  <nav>
                    <ul className="pagination pagination-sm mb-0">
                      <li className="page-item disabled">
                        <span className="page-link bg-transparent text-white-50 border-secondary">Previous</span>
                      </li>
                      <li className="page-item">
                        <span
                          className="page-link bg-warning text-dark border-warning"
                          style={{ cursor: "pointer" }}
                        >
                          1
                        </span>
                      </li>
                      <li className="page-item">
                        <span className="page-link bg-transparent text-white border-secondary" style={{ cursor: "pointer" }}>
                          Next
                        </span>
                      </li>
                    </ul>
                  </nav>
                )}
              </div>
            )}
          </div>
        )}

        {/* Preview Modal */}
        {showPreviewModal && selectedMedia && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{
              background: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(5px)",
              zIndex: 1050,
            }}
            onClick={() => setShowPreviewModal(false)}
          >
            <div
              className="card bg-dark border-warning border-opacity-25"
              style={{
                maxWidth: "500px",
                width: "90%",
                background: "rgba(0, 0, 0, 0.9)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="card-header bg-transparent border-warning border-opacity-25 d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="fas fa-eye me-2 text-warning"></i>
                  Media Preview
                </h5>
                <button
                  className="btn-close btn-close-white"
                  onClick={() => setShowPreviewModal(false)}
                ></button>
              </div>
              <div className="card-body p-4 text-center">
                {selectedMedia.mediaType === "video" ? (
                  <div className="bg-dark rounded-3 p-5 mb-3">
                    <i className="fas fa-video fa-4x text-warning"></i>
                  </div>
                ) : (
                  <img
                    src={getFileUrl(selectedMedia.fileUrl)}
                    alt={selectedMedia.title}
                    className="img-fluid rounded-3 mb-3"
                    style={{ maxHeight: "300px" }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/400";
                    }}
                  />
                )}
                <h5>{selectedMedia.title || "Untitled"}</h5>
                <p className="text-white-50 small mb-2">
                  by {selectedMedia.photographer?.username || "Unknown"}
                </p>
                {selectedMedia.description && (
                  <p className="text-white-50 small mb-3">{selectedMedia.description}</p>
                )}
                <div className="d-flex justify-content-center gap-3 flex-wrap">
                  <span className="badge bg-warning text-dark px-3 py-2">
                    <i className="fas fa-tag me-2"></i>
                    ${selectedMedia.price || 0}
                  </span>
                  <span className="badge bg-danger bg-opacity-25 text-danger px-3 py-2">
                    <i className="fas fa-heart me-2"></i>
                    {selectedMedia.likes || 0} likes
                  </span>
                  <span className="badge bg-info bg-opacity-25 text-info px-3 py-2">
                    <i className="fas fa-eye me-2"></i>
                    {selectedMedia.views || 0} views
                  </span>
                  <span className="badge bg-secondary bg-opacity-25 text-white px-3 py-2">
                    <i className="fas fa-download me-2"></i>
                    {selectedMedia.downloads || 0} downloads
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMedia;