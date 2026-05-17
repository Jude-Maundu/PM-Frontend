import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import { API_ENDPOINTS } from "../../../api/apiConfig";
import { toast } from "../../../utils/toast";
import { showConfirm } from "../../../utils/confirm";
import { placeholderMedium } from "../../../utils/placeholders";

const AdminAlbums = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState(null);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const glassStyle = {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.1)",
  };

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINTS.ADMIN.GET_ALBUMS, { headers });
      setAlbums(res.data?.data || res.data || []);
    } catch (err) {
      toast.error("Failed to load albums");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (album) => {
    const ok = await showConfirm(
      `Delete album "${album.name}"? All media associations will be removed. This cannot be undone.`,
      { title: "Delete Album", confirmText: "Delete", danger: true }
    );
    if (!ok) return;
    setDeleting(album._id);
    try {
      await axios.delete(API_ENDPOINTS.ADMIN.DELETE_ALBUM(album._id), { headers });
      toast.success("Album deleted");
      setAlbums(prev => prev.filter(a => a._id !== album._id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete album");
    } finally {
      setDeleting(null);
    }
  };

  const filtered = albums.filter(a =>
    a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.photographer?.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="position-relative" style={{ zIndex: 1 }}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1">
              <i className="fas fa-folder-open me-2 text-warning"></i>
              Albums Management
            </h2>
            <p className="text-white-50 small mb-0">{albums.length} albums on the platform</p>
          </div>
          <button className="btn btn-outline-warning rounded-pill px-4" onClick={fetchAlbums}>
            <i className="fas fa-sync-alt me-2"></i>Refresh
          </button>
        </div>

        {/* Search */}
        <div className="mb-4 p-3 rounded-4" style={glassStyle}>
          <div className="position-relative">
            <i className="fas fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-white-50"></i>
            <input type="text" className="form-control"
              style={{ paddingLeft: 40, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
              placeholder="Search by album name or photographer..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5 rounded-4" style={glassStyle}>
            <div className="spinner-border mb-3" style={{ color: "#6BBDD0" }}></div>
            <p className="text-white-50">Loading albums...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5 rounded-4" style={glassStyle}>
            <i className="fas fa-folder-open fa-4x text-white-50 mb-3"></i>
            <p className="text-white-50">No albums found</p>
          </div>
        ) : (
          <div className="row g-3">
            {filtered.map(album => (
              <div className="col-12 col-md-6 col-lg-4" key={album._id}>
                <div className="rounded-4 overflow-hidden h-100" style={{ ...glassStyle, borderRadius: 16 }}>
                  {/* Cover */}
                  <div style={{ height: 160, position: "relative", overflow: "hidden", background: "#0d1f33" }}>
                    <img
                      src={album.coverImage || placeholderMedium}
                      alt={album.name}
                      className="w-100 h-100"
                      style={{ objectFit: "cover", opacity: 0.8 }}
                      onError={e => { e.target.src = placeholderMedium; }}
                    />
                    <div className="position-absolute top-0 start-0 end-0 bottom-0"
                      style={{ background: "linear-gradient(transparent 40%, rgba(0,0,0,0.7))" }} />
                    <div className="position-absolute bottom-0 start-0 p-3">
                      <span className="badge rounded-pill px-3 py-2"
                        style={{ background: album.isPrivate ? "rgba(220,53,69,0.8)" : "rgba(40,167,69,0.8)", color: "#fff", fontSize: "0.7rem" }}>
                        <i className={`fas fa-${album.isPrivate ? "lock" : "globe"} me-1`}></i>
                        {album.isPrivate ? "Private" : "Public"}
                      </span>
                    </div>
                  </div>

                  <div className="p-3">
                    <h6 className="text-white fw-bold mb-1 text-truncate">{album.name || "Unnamed Album"}</h6>
                    <p className="text-white-50 small mb-2 text-truncate">{album.description || "No description"}</p>

                    <div className="d-flex gap-2 flex-wrap mb-3">
                      <span className="badge rounded-pill px-2 py-1" style={{ background: "rgba(107,189,208,0.15)", color: "#6BBDD0", fontSize: "0.7rem" }}>
                        <i className="fas fa-camera me-1"></i>{album.photographer?.username || "Unknown"}
                      </span>
                      <span className="badge rounded-pill px-2 py-1" style={{ background: "rgba(255,255,255,0.08)", color: "#ccc", fontSize: "0.7rem" }}>
                        <i className="fas fa-images me-1"></i>{album.mediaCount || 0} photos
                      </span>
                      {album.price > 0 && (
                        <span className="badge rounded-pill px-2 py-1" style={{ background: "rgba(255,193,7,0.15)", color: "#ffc107", fontSize: "0.7rem" }}>
                          KES {Number(album.price).toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-white-50">
                        {album.createdAt ? new Date(album.createdAt).toLocaleDateString() : ""}
                      </small>
                      <button
                        className="btn btn-sm rounded-3 px-3"
                        style={{ background: "rgba(220,53,69,0.15)", color: "#dc3545", border: "1px solid rgba(220,53,69,0.3)" }}
                        onClick={() => handleDelete(album)}
                        disabled={deleting === album._id}
                      >
                        {deleting === album._id
                          ? <span className="spinner-border spinner-border-sm"></span>
                          : <><i className="fas fa-trash me-1"></i>Delete</>
                        }
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAlbums;
