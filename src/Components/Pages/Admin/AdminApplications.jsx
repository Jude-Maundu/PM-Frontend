import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import PageHeader from "../../PageHeader";
import { API_BASE_URL } from "../../../api/apiConfig";
import { getAuthHeaders } from "../../../utils/auth";
import { toast } from "../../../utils/toast";

const API = API_BASE_URL;

const STATUS_COLORS = { pending: "warning", approved: "success", rejected: "danger" };

export default function AdminApplications() {
  const [apps, setApps]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState("pending");
  const [selected, setSelected] = useState(null);
  const [notes, setNotes]       = useState("");
  const [acting, setActing]     = useState(false);

  const fetchApps = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/admin/applications?status=${tab}&limit=50`, { headers: getAuthHeaders() });
      setApps(res.data.data || []);
    } catch { toast.error("Failed to load applications"); }
    finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const act = async (id, action) => {
    try {
      setActing(true);
      const body = action === "approve" ? { notes } : { reason: notes };
      await axios.patch(`${API}/admin/applications/${id}/${action}`, body, { headers: getAuthHeaders() });
      toast.success(`Application ${action}d`);
      setSelected(null); setNotes("");
      fetchApps();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action}`);
    } finally { setActing(false); }
  };

  return (
    <AdminLayout>
      <PageHeader title="Photographer Applications" subtitle="Review and approve requests to sell on the platform" />
      <div className="mc-page">

        {/* Tabs */}
        <div className="d-flex gap-2 mb-3">
          {["pending", "approved", "rejected", "all"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`btn btn-sm ${tab === t ? "btn-warning" : "btn-outline-secondary"}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="mc-table-card">
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border" style={{ color: "var(--mc-accent)" }}></div></div>
          ) : apps.length === 0 ? (
            <div className="mc-empty py-5">
              <i className="fas fa-inbox fa-2x mb-2"></i>
              <p>No {tab} applications</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-dark table-hover mb-0">
                <thead>
                  <tr>
                    <th className="ps-3">Applicant</th>
                    <th>Specialization</th>
                    <th>Experience</th>
                    <th>Applied</th>
                    <th>Status</th>
                    <th className="pe-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {apps.map(a => (
                    <tr key={a._id}>
                      <td className="ps-3">
                        <div className="d-flex align-items-center gap-2">
                          {a.user?.profilePicture
                            ? <img src={a.user.profilePicture} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
                            : <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--mc-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.75rem" }}>{a.user?.username?.[0]?.toUpperCase()}</div>
                          }
                          <div>
                            <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{a.user?.username}</div>
                            <div style={{ fontSize: "0.7rem", opacity: 0.55 }}>{a.user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><small>{a.specialization || "—"}</small></td>
                      <td><small>{a.experience || "—"}</small></td>
                      <td><small>{new Date(a.createdAt).toLocaleDateString()}</small></td>
                      <td>
                        <span className={`badge bg-${STATUS_COLORS[a.status]}`}>{a.status}</span>
                      </td>
                      <td className="pe-3">
                        <button className="btn btn-sm btn-outline-info" onClick={() => { setSelected(a); setNotes(""); }}>
                          <i className="fas fa-eye"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {selected && (
          <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.8)" }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content bg-dark border-secondary">
                <div className="modal-header border-secondary">
                  <h5 className="modal-title text-white">Application — {selected.user?.username}</h5>
                  <button className="btn-close btn-close-white" onClick={() => setSelected(null)}></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    {[
                      ["Portfolio URL", selected.portfolio],
                      ["Experience", selected.experience],
                      ["Specialization", selected.specialization],
                      ["Equipment", selected.equipment],
                    ].map(([label, val]) => val ? (
                      <div key={label} className="col-md-6">
                        <div style={{ fontSize: "0.72rem", color: "var(--mc-text-muted)", marginBottom: 4 }}>{label.toUpperCase()}</div>
                        <div style={{ color: "#fff", fontSize: "0.85rem" }}>{val}</div>
                      </div>
                    ) : null)}
                    {selected.message && (
                      <div className="col-12">
                        <div style={{ fontSize: "0.72rem", color: "var(--mc-text-muted)", marginBottom: 4 }}>PITCH / MESSAGE</div>
                        <div className="p-3 rounded" style={{ background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: "0.85rem" }}>{selected.message}</div>
                      </div>
                    )}
                    {selected.status === "pending" && (
                      <div className="col-12">
                        <label className="form-label text-white-50 small">Notes / Reason (optional)</label>
                        <textarea className="form-control bg-dark text-white border-secondary" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Internal notes or rejection reason..." />
                      </div>
                    )}
                  </div>
                </div>
                {selected.status === "pending" && (
                  <div className="modal-footer border-secondary">
                    <button className="btn btn-danger btn-sm" onClick={() => act(selected._id, "reject")} disabled={acting}>
                      <i className="fas fa-times me-1"></i>Reject
                    </button>
                    <button className="btn btn-success btn-sm" onClick={() => act(selected._id, "approve")} disabled={acting}>
                      {acting ? <span className="spinner-border spinner-border-sm me-1"></span> : <i className="fas fa-check me-1"></i>}
                      Approve as Photographer
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
