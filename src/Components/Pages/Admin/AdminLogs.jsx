import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import PageHeader from "../../PageHeader";
import { API_BASE_URL } from "../../../api/apiConfig";
import { getAuthHeaders } from "../../../utils/auth";
import { toast } from "../../../utils/toast";

const API = API_BASE_URL;

const ACTION_COLORS = {
  ban_user: "danger", approve_application: "success", reject_application: "danger",
  kyc_verify: "success", kyc_reject: "danger", update_commission: "warning",
  adjust_wallet: "warning", update_config: "info", bulk_update_config: "info",
  create_staff: "primary", remove_staff: "danger", update_staff_permissions: "secondary",
};

export default function AdminLogs() {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const [total, setTotal]     = useState(0);
  const [pages, setPages]     = useState(1);
  const [search, setSearch]   = useState("");
  const [expanded, setExpanded] = useState(null);
  const LIMIT = 50;

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (search) params.set("action", search);
      const res = await axios.get(`${API}/admin/logs?${params}`, { headers: getAuthHeaders() });
      setLogs(res.data.data || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch { toast.error("Failed to load logs"); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const formatDate = (d) => new Date(d).toLocaleString();

  return (
    <AdminLayout>
      <PageHeader title="Audit Logs" subtitle={`${total.toLocaleString()} admin actions recorded`} />
      <div className="mc-page">

        {/* Filters */}
        <div className="mc-card mb-3">
          <div className="d-flex gap-3 flex-wrap">
            <div className="mc-search-wrap" style={{ maxWidth: 300 }}>
              <i className="fas fa-search mc-search-icon"></i>
              <input className="mc-search" placeholder="Filter by action..." value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <button className="mc-btn mc-btn-primary btn-sm" onClick={fetchLogs}>
              <i className="fas fa-sync-alt me-1"></i>Refresh
            </button>
          </div>
        </div>

        <div className="mc-table-card">
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border" style={{ color: "var(--mc-accent)" }}></div></div>
          ) : logs.length === 0 ? (
            <div className="mc-empty py-5">
              <i className="fas fa-clipboard-list fa-2x mb-2"></i>
              <p>No audit logs yet</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-dark table-hover mb-0">
                <thead>
                  <tr>
                    <th className="ps-3">Time</th>
                    <th>Admin</th>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>IP</th>
                    <th className="pe-3">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(l => (
                    <React.Fragment key={l._id}>
                      <tr style={{ cursor: "pointer" }} onClick={() => setExpanded(expanded === l._id ? null : l._id)}>
                        <td className="ps-3"><small style={{ opacity: 0.7 }}>{formatDate(l.createdAt)}</small></td>
                        <td>
                          <div style={{ fontSize: "0.82rem", fontWeight: 500 }}>{l.admin?.username || l.adminName}</div>
                          <div style={{ fontSize: "0.68rem", opacity: 0.5 }}>{l.admin?.email}</div>
                        </td>
                        <td>
                          <span className={`badge bg-${ACTION_COLORS[l.action] || "secondary"}`} style={{ fontSize: "0.7rem" }}>
                            {l.action.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td><small style={{ opacity: 0.7 }}>{l.entityType}{l.entityId ? ` · ${l.entityId.slice(0, 8)}…` : ""}</small></td>
                        <td><small style={{ opacity: 0.5 }}>{l.ip || "—"}</small></td>
                        <td className="pe-3">
                          <i className={`fas fa-chevron-${expanded === l._id ? "up" : "down"}`} style={{ opacity: 0.5, fontSize: "0.75rem" }}></i>
                        </td>
                      </tr>
                      {expanded === l._id && l.details && (
                        <tr>
                          <td colSpan={6} className="p-0">
                            <pre className="m-0 p-3" style={{ background: "rgba(0,0,0,0.3)", color: "var(--mc-accent)", fontSize: "0.72rem", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                              {JSON.stringify(l.details, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="d-flex justify-content-between align-items-center p-3">
              <small style={{ opacity: 0.6 }}>Page {page} of {pages} · {total} entries</small>
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-outline-secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹ Prev</button>
                <button className="btn btn-sm btn-outline-secondary" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Next ›</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
