import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import { API_ENDPOINTS, SITE_URL } from "../../../api/apiConfig";
import { toast } from "../../../utils/toast";
import { showConfirm } from "../../../utils/confirm";

const TEMPLATE_LABELS = {
  noir: { label: "Noir", color: "#c9a84c", bg: "rgba(201,168,76,0.12)" },
  studio: { label: "Studio", color: "#8b5e3c", bg: "rgba(139,94,60,0.12)" },
  bold: { label: "Bold", color: "#e63946", bg: "rgba(230,57,70,0.12)" },
  lens: { label: "Lens", color: "var(--pm-teal)", bg: "rgba(107,189,208,0.12)" },
};

const AdminPortfolios = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchPortfolios = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINTS.PORTFOLIO.ADMIN_GET_ALL, { headers });
      setPortfolios(res.data.portfolios || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load portfolios");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchPortfolios(); }, [fetchPortfolios]);

  const handleTogglePublish = async (portfolio) => {
    const action = portfolio.isPublished ? "unpublish" : "publish";
    const confirmed = await showConfirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Portfolio`,
      message: `Are you sure you want to ${action} ${portfolio.photographer?.username}'s portfolio?`,
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      variant: portfolio.isPublished ? "warning" : "success",
    });
    if (!confirmed) return;

    setToggling(portfolio._id);
    try {
      const res = await axios.patch(
        API_ENDPOINTS.PORTFOLIO.ADMIN_TOGGLE_PUBLISH(portfolio._id),
        {},
        { headers }
      );
      setPortfolios(prev =>
        prev.map(p => p._id === portfolio._id ? { ...p, isPublished: res.data.isPublished } : p)
      );
      toast.success(`Portfolio ${res.data.isPublished ? "published" : "unpublished"} successfully`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update portfolio");
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (portfolio) => {
    const confirmed = await showConfirm({
      title: "Delete Portfolio",
      message: `Permanently delete ${portfolio.photographer?.username}'s portfolio? This cannot be undone.`,
      confirmText: "Delete",
      variant: "danger",
    });
    if (!confirmed) return;

    setDeleting(portfolio._id);
    try {
      await axios.delete(API_ENDPOINTS.PORTFOLIO.ADMIN_DELETE(portfolio._id), { headers });
      setPortfolios(prev => prev.filter(p => p._id !== portfolio._id));
      toast.success("Portfolio deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete portfolio");
    } finally {
      setDeleting(null);
    }
  };

  const filtered = portfolios.filter(p => {
    const q = search.toLowerCase();
    return (
      p.photographer?.username?.toLowerCase().includes(q) ||
      p.photographer?.email?.toLowerCase().includes(q) ||
      p.template?.toLowerCase().includes(q)
    );
  });

  const stats = {
    total: portfolios.length,
    published: portfolios.filter(p => p.isPublished).length,
    unpublished: portfolios.filter(p => !p.isPublished).length,
  };

  return (
    <AdminLayout>
      <div className="p-4">
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="fw-bold mb-0" style={{ color: "#fff", fontFamily: "var(--font-serif)" }}>
              Photographer Portfolios
            </h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
              Oversee and manage all photographer mini-websites
            </p>
          </div>
          <button className="btn btn-outline-light btn-sm" onClick={fetchPortfolios}>
            <i className="fas fa-sync-alt me-2"></i>Refresh
          </button>
        </div>

        {/* Stats Row */}
        <div className="row g-3 mb-4">
          {[
            { label: "Total Portfolios", value: stats.total, icon: "fa-globe", color: "var(--pm-teal)" },
            { label: "Published", value: stats.published, icon: "fa-eye", color: "var(--pm-success)" },
            { label: "Unpublished", value: stats.unpublished, icon: "fa-eye-slash", color: "rgba(255,255,255,0.4)" },
          ].map(stat => (
            <div className="col-6 col-md-4" key={stat.label}>
              <div className="glass-card p-3 h-100">
                <div className="d-flex align-items-center gap-3">
                  <div style={{
                    width: 42, height: 42, borderRadius: 10,
                    background: `rgba(107,189,208,0.1)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <i className={`fas ${stat.icon}`} style={{ color: stat.color, fontSize: "1.1rem" }}></i>
                  </div>
                  <div>
                    <div className="fw-bold fs-4" style={{ color: "#fff", lineHeight: 1 }}>{stat.value}</div>
                    <small style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.75rem" }}>{stat.label}</small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="mb-3">
          <div className="input-group" style={{ maxWidth: 380 }}>
            <span className="input-group-text" style={{ background: "rgba(107,189,208,0.08)", border: "1px solid rgba(107,189,208,0.2)", color: "var(--pm-teal)" }}>
              <i className="fas fa-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by photographer or template..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ background: "rgba(107,189,208,0.05)", border: "1px solid rgba(107,189,208,0.2)", color: "#fff" }}
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: "var(--pm-teal)" }}></div>
            <p className="mt-3" style={{ color: "rgba(255,255,255,0.5)" }}>Loading portfolios...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-5 text-center">
            <i className="fas fa-globe fa-3x mb-3" style={{ color: "rgba(255,255,255,0.2)" }}></i>
            <p style={{ color: "rgba(255,255,255,0.5)" }}>
              {search ? "No portfolios match your search." : "No portfolios have been created yet."}
            </p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="table-responsive">
              <table className="table table-dark mb-0" style={{ borderColor: "rgba(107,189,208,0.1)" }}>
                <thead>
                  <tr style={{ borderColor: "rgba(107,189,208,0.15)" }}>
                    <th style={{ color: "rgba(255,255,255,0.5)", fontWeight: 500, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Photographer</th>
                    <th style={{ color: "rgba(255,255,255,0.5)", fontWeight: 500, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Template</th>
                    <th style={{ color: "rgba(255,255,255,0.5)", fontWeight: 500, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                    <th style={{ color: "rgba(255,255,255,0.5)", fontWeight: 500, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Portfolio URL</th>
                    <th style={{ color: "rgba(255,255,255,0.5)", fontWeight: 500, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Last Updated</th>
                    <th style={{ color: "rgba(255,255,255,0.5)", fontWeight: 500, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(portfolio => {
                    const tmpl = TEMPLATE_LABELS[portfolio.template] || { label: portfolio.template, color: "var(--pm-teal)", bg: "rgba(107,189,208,0.1)" };
                    const publicUrl = `/portfolio/${portfolio.username}`;
                    return (
                      <tr key={portfolio._id} style={{ borderColor: "rgba(107,189,208,0.08)" }}>
                        {/* Photographer */}
                        <td className="align-middle">
                          <div className="d-flex align-items-center gap-2">
                            {portfolio.photographer?.profilePicture ? (
                              <img
                                src={portfolio.photographer.profilePicture}
                                alt=""
                                style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(107,189,208,0.3)" }}
                              />
                            ) : (
                              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(107,189,208,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <i className="fas fa-user" style={{ color: "var(--pm-teal)", fontSize: "0.8rem" }}></i>
                              </div>
                            )}
                            <div>
                              <div style={{ color: "#fff", fontWeight: 600, fontSize: "0.88rem" }}>
                                {portfolio.photographer?.username || "Unknown"}
                              </div>
                              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem" }}>
                                {portfolio.photographer?.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Template */}
                        <td className="align-middle">
                          <span style={{
                            background: tmpl.bg,
                            color: tmpl.color,
                            border: `1px solid ${tmpl.color}40`,
                            borderRadius: 6,
                            padding: "0.2rem 0.6rem",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            textTransform: "capitalize",
                          }}>
                            {tmpl.label}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="align-middle">
                          {portfolio.isPublished ? (
                            <span style={{ color: "var(--pm-success)", fontSize: "0.8rem", fontWeight: 600 }}>
                              <i className="fas fa-circle me-1" style={{ fontSize: "0.45rem", verticalAlign: "middle" }}></i>
                              Published
                            </span>
                          ) : (
                            <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8rem" }}>
                              <i className="fas fa-circle me-1" style={{ fontSize: "0.45rem", verticalAlign: "middle" }}></i>
                              Unpublished
                            </span>
                          )}
                        </td>

                        {/* URL */}
                        <td className="align-middle">
                          {portfolio.isPublished ? (
                            <a
                              href={`${SITE_URL}/portfolio/${portfolio.username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "var(--pm-teal)", fontSize: "0.8rem", textDecoration: "none" }}
                            >
                              <i className="fas fa-external-link-alt me-1"></i>
                              /portfolio/{portfolio.username}
                            </a>
                          ) : (
                            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.8rem" }}>Not published</span>
                          )}
                        </td>

                        {/* Last Updated */}
                        <td className="align-middle">
                          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>
                            {new Date(portfolio.updatedAt).toLocaleDateString("en-KE", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="align-middle">
                          <div className="d-flex gap-2 flex-wrap">
                            {/* Preview */}
                            <a
                              href={`${SITE_URL}/portfolio/${portfolio.username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm"
                              style={{ background: "rgba(107,189,208,0.1)", color: "var(--pm-teal)", border: "1px solid rgba(107,189,208,0.25)", fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}
                              title="View portfolio"
                            >
                              <i className="fas fa-eye"></i>
                            </a>

                            {/* Toggle Publish */}
                            <button
                              className="btn btn-sm"
                              style={{
                                background: portfolio.isPublished ? "rgba(255,193,7,0.1)" : "rgba(46,204,154,0.1)",
                                color: portfolio.isPublished ? "#ffc107" : "var(--pm-success)",
                                border: `1px solid ${portfolio.isPublished ? "rgba(255,193,7,0.3)" : "rgba(46,204,154,0.3)"}`,
                                fontSize: "0.75rem", padding: "0.25rem 0.6rem",
                              }}
                              onClick={() => handleTogglePublish(portfolio)}
                              disabled={toggling === portfolio._id}
                              title={portfolio.isPublished ? "Unpublish" : "Publish"}
                            >
                              {toggling === portfolio._id ? (
                                <span className="spinner-border spinner-border-sm"></span>
                              ) : (
                                <i className={`fas ${portfolio.isPublished ? "fa-eye-slash" : "fa-check-circle"}`}></i>
                              )}
                            </button>

                            {/* Delete */}
                            <button
                              className="btn btn-sm"
                              style={{ background: "rgba(220,53,69,0.1)", color: "#dc3545", border: "1px solid rgba(220,53,69,0.25)", fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}
                              onClick={() => handleDelete(portfolio)}
                              disabled={deleting === portfolio._id}
                              title="Delete portfolio"
                            >
                              {deleting === portfolio._id ? (
                                <span className="spinner-border spinner-border-sm"></span>
                              ) : (
                                <i className="fas fa-trash-alt"></i>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <p className="mt-3" style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75rem" }}>
          {filtered.length} portfolio{filtered.length !== 1 ? "s" : ""} shown
        </p>
      </div>
    </AdminLayout>
  );
};

export default AdminPortfolios;
