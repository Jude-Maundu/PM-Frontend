import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import PageHeader from "../../PageHeader";
import { adminGetAllShares } from "../../../api/API";
import { API_ENDPOINTS } from "../../../api/apiConfig";
import { toast } from "../../../utils/toast";
import { showConfirm } from "../../../utils/confirm";

const AdminShares = () => {
  const [shares, setShares] = useState([]);
  const [summary, setSummary] = useState({
    totalShares: 0,
    activeShares: 0,
    expiredShares: 0,
    totalAccesses: 0,
    totalDownloads: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revoking, setRevoking] = useState(null);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchShares = async () => {
    try {
      setLoading(true);
      const res = await adminGetAllShares("", 20, 0);
      const data = res.data || {};
      const shareList = Array.isArray(data.shares) ? data.shares : [];
      const totalAccesses = shareList.reduce((sum, item) => sum + (item.accessCount || 0), 0);
      const totalDownloads = shareList.reduce((sum, item) => sum + (item.downloadCount || 0), 0);
      const activeShares = shareList.filter((item) => item.isActive).length;
      const expiredShares = shareList.filter((item) => item.isExpired).length;

      setShares(shareList);
      setSummary({
        totalShares: data.total ?? shareList.length,
        activeShares,
        expiredShares,
        totalAccesses,
        totalDownloads,
      });
      setError(null);
    } catch (err) {
      console.error("AdminShares error:", err);
      setError(err.response?.data?.error || "Failed to load share monitoring data.");
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (share) => {
    const ok = await showConfirm(
      `Revoke this share link? It will no longer be accessible.`,
      { title: "Revoke Share Link", confirmText: "Revoke", danger: true }
    );
    if (!ok) return;
    setRevoking(share.token);
    try {
      await axios.delete(API_ENDPOINTS.ADMIN.REVOKE_SHARE(share.token), { headers });
      toast.success("Share link revoked");
      fetchShares();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to revoke share link");
    } finally {
      setRevoking(null);
    }
  };

  useEffect(() => {
    fetchShares();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AdminLayout>
      <PageHeader
        title="Share Links"
        subtitle="Manage active share tokens"
        actions={
          <button className="mc-btn mc-btn-ghost" onClick={fetchShares}>
            <i className="fas fa-sync-alt me-1"></i>Refresh
          </button>
        }
      />
      <div className="mc-page">
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <div className="spinner-border" style={{ color: "var(--mc-accent)" }}></div>
          </div>
        ) : (
          <>
            {error && (
              <div className="alert alert-danger" role="alert">{error}</div>
            )}

            {/* Stats */}
            <div className="mc-stats-row-sm" style={{ marginBottom: "1.25rem" }}>
              <div className="mc-stat-card">
                <div className="mc-stat-label">TOTAL SHARES</div>
                <div className="mc-stat-value">{summary.totalShares}</div>
              </div>
              <div className="mc-stat-card">
                <div className="mc-stat-label">ACTIVE</div>
                <div className="mc-stat-value" style={{ color: "var(--mc-accent-teal)" }}>{summary.activeShares}</div>
              </div>
              <div className="mc-stat-card">
                <div className="mc-stat-label">EXPIRED</div>
                <div className="mc-stat-value">{summary.expiredShares}</div>
              </div>
              <div className="mc-stat-card">
                <div className="mc-stat-label">TOTAL ACCESSES</div>
                <div className="mc-stat-value" style={{ color: "var(--mc-accent)" }}>{summary.totalAccesses}</div>
              </div>
              <div className="mc-stat-card">
                <div className="mc-stat-label">TOTAL DOWNLOADS</div>
                <div className="mc-stat-value" style={{ color: "var(--mc-accent-pink)" }}>{summary.totalDownloads}</div>
              </div>
            </div>

            <div className="mc-table-card">
              <div className="table-responsive">
                <table className="table table-borderless mb-0">
                  <thead>
                    <tr>
                      <th className="ps-3 py-3">Token</th>
                      <th className="py-3">Type</th>
                      <th className="py-3">Owner</th>
                      <th className="py-3">Accesses</th>
                      <th className="py-3">Downloads</th>
                      <th className="py-3">Remaining</th>
                      <th className="py-3">Expires</th>
                      <th className="py-3">Status</th>
                      <th className="pe-3 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shares.length === 0 ? (
                      <tr>
                        <td colSpan="9">
                          <div className="mc-empty">
                            <i className="fas fa-link"></i>
                            <p>No share data available.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      shares.map((share, idx) => (
                        <tr key={idx}>
                          <td className="ps-3" style={{ maxWidth: "180px" }}>
                            <small className="text-truncate d-block">{share.token}</small>
                          </td>
                          <td>{share.media ? "Media" : "Album"}</td>
                          <td>{share.createdBy?.name || share.createdBy?.email || "Unknown"}</td>
                          <td>{share.accessCount || 0}</td>
                          <td>{share.downloadCount || 0}</td>
                          <td>{share.remainingDownloads}</td>
                          <td>{share.expiresAt ? new Date(share.expiresAt).toLocaleDateString() : "Never"}</td>
                          <td>
                            <span className="badge rounded-pill px-3 py-1"
                              style={{ background: share.isActive ? "rgba(76,201,166,0.15)" : "rgba(255,255,255,0.08)", color: share.isActive ? "var(--mc-accent-teal)" : "inherit" }}>
                              {share.isActive ? "Active" : "Revoked"}
                            </span>
                          </td>
                          <td className="pe-3">
                            {share.isActive && (
                              <button
                                className="mc-btn mc-btn-danger btn-sm px-2"
                                onClick={() => handleRevoke(share)}
                                disabled={revoking === share.token}
                                title="Revoke"
                              >
                                {revoking === share.token
                                  ? <span className="spinner-border spinner-border-sm"></span>
                                  : <><i className="fas fa-ban me-1"></i>Revoke</>
                                }
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminShares;
