import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import PageHeader from "../../PageHeader";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { getAllMedia, deleteMedia as apiDeleteMedia } from "../../../api/API";
import { placeholderLarge, placeholderSmall } from "../../../utils/placeholders";
import { getImageUrl, fetchProtectedUrl } from "../../../utils/imageUrl";
import { toast } from "../../../utils/toast";
import { showConfirm } from "../../../utils/confirm";

const AdminMedia = () => {
  const [media, setMedia] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [filter, setFilter] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await getAllMedia();

      const mediaArray = Array.isArray(res.data?.media)
        ? res.data.media
        : (Array.isArray(res.data) ? res.data : []);

      setMedia(mediaArray);

      const urls = {};
      await Promise.all(
        mediaArray.map(async (item) => {
          const raw = getImageUrl({ fileUrl: item.fileUrl }, null);
          const needsProtected =
            !raw ||
            raw.includes("/opt/") ||
            raw.startsWith("file://");

          if (needsProtected) {
            const mediaId = item._id || item.mediaId;
            if (!mediaId) return;
            const protectedUrl = await fetchProtectedUrl(mediaId);
            if (protectedUrl) {
              urls[mediaId] = protectedUrl;
            }
          }
        })
      );
      setImageUrls(urls);
    } catch (err) {
      console.error("Error fetching media:", err);
      toast.error("Failed to fetch media");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const deleteMedia = async (id) => {
    const ok = await showConfirm("This media will be permanently removed.", { title: "Delete Media?", confirmText: "Delete", danger: true });
    if (!ok) return;
    try {
      await apiDeleteMedia(id);
      toast.success("Media deleted successfully.");
      fetchMedia();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // Filter media
  const getFilteredMedia = () => {
    return media.filter(item => {
      const matchesSearch = item.title?.toLowerCase().includes(search.toLowerCase()) ||
                           item.photographer?.username?.toLowerCase().includes(search.toLowerCase());

      if (filter === "all") return matchesSearch;
      if (filter === "photos") return matchesSearch && item.mediaType === "photo";
      if (filter === "videos") return matchesSearch && item.mediaType === "video";
      return matchesSearch;
    });
  };

  const filteredMedia = getFilteredMedia();

  // Update total pages when filtered media or items per page changes
  useEffect(() => {
    const total = Math.ceil(filteredMedia.length / itemsPerPage);
    setTotalPages(total > 0 ? total : 1);
    setCurrentPage(1);
  }, [filteredMedia.length, itemsPerPage, search, filter]);

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredMedia.slice(startIndex, endIndex);
  };

  // Pagination handlers
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleItemsPerPageChange = (e) => {
    const newValue = Number(e.target.value);
    setItemsPerPage(newValue);
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  const getFileUrl = (fileUrl) => {
    return getImageUrl({ fileUrl }, placeholderLarge);
  };

  const currentItems = getCurrentPageItems();

  return (
    <AdminLayout>
      <PageHeader
        title="Media Management"
        subtitle="Review and moderate all content"
        onSearch={setSearch}
        searchQuery={search}
        searchPlaceholder="Search by title or photographer..."
        actions={
          <button className="mc-btn mc-btn-ghost" onClick={fetchMedia}>
            <i className="fas fa-sync-alt me-1"></i>Refresh
          </button>
        }
      />
      <div className="mc-page">
        {/* Stats */}
        <div className="mc-stats-row-sm" style={{ marginBottom: "1.25rem" }}>
          <div className="mc-stat-card">
            <div className="mc-stat-label">TOTAL MEDIA</div>
            <div className="mc-stat-value">{media.length}</div>
          </div>
          <div className="mc-stat-card">
            <div className="mc-stat-label">PHOTOS</div>
            <div className="mc-stat-value">{media.filter(m => m.mediaType === "photo").length}</div>
          </div>
          <div className="mc-stat-card">
            <div className="mc-stat-label">VIDEOS</div>
            <div className="mc-stat-value">{media.filter(m => m.mediaType === "video").length}</div>
          </div>
          <div className="mc-stat-card">
            <div className="mc-stat-label">FILTERED</div>
            <div className="mc-stat-value">{filteredMedia.length}</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mc-card mb-3" style={{ padding: "0.75rem 1rem" }}>
          <div className="d-flex gap-2 flex-wrap align-items-center">
            {["all", "photos", "videos"].map((f) => (
              <button
                key={f}
                className={`mc-btn ${filter === f ? "mc-btn-primary" : "mc-btn-ghost"}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <div className="spinner-border" style={{ color: "var(--mc-accent)" }}></div>
          </div>
        )}

        {/* Media Table */}
        {!loading && (
          <div className="mc-table-card">
            <div className="table-responsive">
              <table className="table table-borderless mb-0">
                <thead>
                  <tr>
                    <th className="ps-4 py-3" style={{ width: "80px" }}>Preview</th>
                    <th className="py-3">Title</th>
                    <th className="py-3">Photographer</th>
                    <th className="py-3">Price</th>
                    <th className="py-3">Type</th>
                    <th className="py-3">Likes</th>
                    <th className="py-3">Views</th>
                    <th className="pe-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="8">
                        <div className="mc-empty">
                          <i className="fas fa-folder-open"></i>
                          <p>No media found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((item) => (
                      <tr key={item._id}>
                        <td className="ps-4">
                          <div
                            className="rounded-3 overflow-hidden"
                            style={{ width: "60px", height: "60px", cursor: "pointer" }}
                            onClick={() => { setSelectedMedia(item); setShowPreviewModal(true); }}
                          >
                            {item.mediaType === "video" ? (
                              <div className="d-flex align-items-center justify-content-center w-100 h-100" style={{ background: "rgba(0,0,0,0.2)" }}>
                                <i className="fas fa-video" style={{ color: "var(--mc-accent-gold)" }}></i>
                              </div>
                            ) : (
                              <img
                                src={imageUrls[item._id] || getImageUrl({ fileUrl: item.fileUrl }, placeholderSmall) || placeholderSmall}
                                alt={item.title}
                                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                onError={(e) => { e.target.onerror = null; e.target.src = placeholderSmall; }}
                              />
                            )}
                          </div>
                        </td>
                        <td>
                          <div>
                            <h6 className="fw-bold mb-0">{item.title || "Untitled"}</h6>
                            <small className="text-muted">ID: {item._id?.substring(0, 8)}...</small>
                            {item.description && (
                              <small className="text-muted d-block">{item.description.substring(0, 30)}...</small>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: "32px", height: "32px", background: "rgba(91,127,229,0.15)" }}>
                              <i className="fas fa-user" style={{ color: "var(--mc-accent)", fontSize: "0.8rem" }}></i>
                            </div>
                            <div>
                              <span>{item.photographer?.username || "Unknown"}</span>
                              <small className="text-muted d-block">{item.photographer?.email || ""}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge px-3 py-2" style={{ background: "rgba(245,166,35,0.15)", color: "var(--mc-accent-gold)" }}>
                            KES {item.price || 0}
                          </span>
                        </td>
                        <td>
                          <span className="badge rounded-pill px-3 py-2"
                            style={{ background: item.mediaType === "video" ? "rgba(91,127,229,0.15)" : "rgba(76,201,166,0.15)", color: item.mediaType === "video" ? "var(--mc-accent)" : "var(--mc-accent-teal)" }}>
                            <i className={`fas ${item.mediaType === "video" ? "fa-video" : "fa-image"} me-2`}></i>
                            {item.mediaType || "photo"}
                          </span>
                        </td>
                        <td>
                          <i className="fas fa-heart me-2" style={{ color: "var(--mc-accent-pink)" }}></i>
                          {item.likes || 0}
                        </td>
                        <td>
                          <i className="fas fa-eye me-2" style={{ color: "var(--mc-accent)" }}></i>
                          {item.views || 0}
                        </td>
                        <td className="pe-4">
                          <div className="d-flex gap-2">
                            <button className="mc-btn mc-btn-ghost btn-sm px-3"
                              onClick={() => toast.info("Edit functionality coming soon")}>
                              <i className="fas fa-edit"></i>
                            </button>
                            <button className="mc-btn mc-btn-danger btn-sm px-3"
                              onClick={() => deleteMedia(item._id)}>
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

            {/* Pagination Footer */}
            {filteredMedia.length > 0 && (
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center p-3 border-top gap-3">
                <div className="d-flex align-items-center gap-2">
                  <small className="text-muted">Show</small>
                  <select className="form-select form-select-sm" style={{ width: "70px" }} value={itemsPerPage} onChange={handleItemsPerPageChange}>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <small className="text-muted">entries</small>
                </div>
                <small className="text-muted">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredMedia.length)} of{" "}
                  {filteredMedia.length} entries
                </small>
                <nav>
                  <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button className="page-link" onClick={goToPreviousPage} disabled={currentPage === 1}>
                        <i className="fas fa-chevron-left"></i>
                      </button>
                    </li>
                    {getPageNumbers()[0] > 1 && (
                      <>
                        <li className="page-item"><button className="page-link" onClick={() => goToPage(1)}>1</button></li>
                        {getPageNumbers()[0] > 2 && <li className="page-item disabled"><span className="page-link">...</span></li>}
                      </>
                    )}
                    {getPageNumbers().map(pageNum => (
                      <li key={pageNum} className={`page-item ${currentPage === pageNum ? "active" : ""}`}>
                        <button className="page-link" onClick={() => goToPage(pageNum)}>{pageNum}</button>
                      </li>
                    ))}
                    {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
                      <>
                        {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && <li className="page-item disabled"><span className="page-link">...</span></li>}
                        <li className="page-item"><button className="page-link" onClick={() => goToPage(totalPages)}>{totalPages}</button></li>
                      </>
                    )}
                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                      <button className="page-link" onClick={goToNextPage} disabled={currentPage === totalPages}>
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        )}

        {/* Preview Modal */}
        {showPreviewModal && selectedMedia && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(5px)", zIndex: 1050 }}
            onClick={() => setShowPreviewModal(false)}
          >
            <div className="mc-card" style={{ maxWidth: "500px", width: "90%" }} onClick={(e) => e.stopPropagation()}>
              <div className="mc-card-header d-flex justify-content-between align-items-center">
                <h5 className="mc-card-title mb-0">
                  <i className="fas fa-eye me-2"></i>Media Preview
                </h5>
                <button className="btn-close" onClick={() => setShowPreviewModal(false)}></button>
              </div>
              <div style={{ padding: "1rem", textAlign: "center" }}>
                {selectedMedia.mediaType === "video" ? (
                  <div className="rounded-3 p-5 mb-3" style={{ background: "rgba(0,0,0,0.2)" }}>
                    <i className="fas fa-video fa-4x" style={{ color: "var(--mc-accent-gold)" }}></i>
                  </div>
                ) : (
                  <img
                    src={getFileUrl(selectedMedia.fileUrl)}
                    alt={selectedMedia.title}
                    className="img-fluid rounded-3 mb-3"
                    style={{ maxHeight: "300px" }}
                    onError={(e) => { e.target.onerror = null; e.target.src = placeholderLarge; }}
                  />
                )}
                <h5>{selectedMedia.title || "Untitled"}</h5>
                <p className="text-muted small mb-2">by {selectedMedia.photographer?.username || "Unknown"}</p>
                {selectedMedia.description && <p className="text-muted small mb-3">{selectedMedia.description}</p>}
                <div className="d-flex justify-content-center gap-3 flex-wrap">
                  <span className="badge px-3 py-2" style={{ background: "rgba(245,166,35,0.15)", color: "var(--mc-accent-gold)" }}>
                    <i className="fas fa-tag me-2"></i>KES {selectedMedia.price || 0}
                  </span>
                  <span className="badge px-3 py-2" style={{ background: "rgba(240,107,141,0.15)", color: "var(--mc-accent-pink)" }}>
                    <i className="fas fa-heart me-2"></i>{selectedMedia.likes || 0} likes
                  </span>
                  <span className="badge px-3 py-2" style={{ background: "rgba(91,127,229,0.15)", color: "var(--mc-accent)" }}>
                    <i className="fas fa-eye me-2"></i>{selectedMedia.views || 0} views
                  </span>
                  <span className="badge px-3 py-2" style={{ background: "rgba(255,255,255,0.08)", color: "inherit" }}>
                    <i className="fas fa-download me-2"></i>{selectedMedia.downloads || 0} downloads
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
