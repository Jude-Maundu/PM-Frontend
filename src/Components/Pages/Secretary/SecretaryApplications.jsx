import React, { useEffect, useState } from "react";
import axios from "axios";
import SecretaryLayout from "./SecretaryLayout";
import PageHeader from "../../PageHeader";
import { API_BASE_URL } from "../../../api/apiConfig";
import { getAuthHeaders } from "../../../utils/auth";
import { toast } from "../../../utils/toast";

const API = API_BASE_URL;
const STATUS_COLORS = { pending: "#F59E0B", approved: "#4CC9A6", rejected: "#F06B8D" };

export default function SecretaryApplications() {
  const [apps, setApps] = useState([]);
  const [tab, setTab] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState("");
  const [acting, setActing] = useState(false);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/admin/applications?status=${tab}&limit=50`, { headers: getAuthHeaders() });
      setApps(res.data?.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [tab]);

  const act = async (id, action) => {
    try {
      setActing(true);
      await axios.patch(`${API}/admin/applications/${id}/${action}`, action === "approve" ? { notes } : { reason: notes }, { headers: getAuthHeaders() });
      toast.success(`Application ${action}d`);
      setSelected(null);
      setNotes("");
      fetchApps();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} application`);
    } finally {
      setActing(false);
    }
  };

  return (
    <SecretaryLayout>
      <PageHeader title="Applications" subtitle="Review photographer applications and perform approval actions." />
      <div className="mc-page">
        <div className="d-flex gap-2 mb-3 flex-wrap">
          {["pending", "approved", "rejected", "all"].map((item) => (
            <button key={item} onClick={() => setTab(item)} className={`btn btn-sm ${tab === item ? "btn-primary" : "btn-outline-secondary"}`}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>

        <div className="mc-card">
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border" style={{ color: "#8B5CF6" }}></div></div>
          ) : apps.length === 0 ? (
            <div className="mc-empty py-5">
              <i className="fas fa-user-clock fa-2x mb-2"></i>
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
                  {apps.map((app) => (
                    <tr key={app._id}>
                      <td className="ps-3">
                        <div style={{ fontWeight: 700 }}>{app.user?.username || "Unknown"}</div>
                        <div style={{ fontSize: "0.78rem", color: "var(--mc-text-muted)" }}>{app.user?.email || "—"}</div>
                      </td>
                      <td>{app.specialization || "—"}</td>
                      <td>{app.experience || "—"}</td>
                      <td>{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "—"}</td>
                      <td><span style={{ color: STATUS_COLORS[app.status] || "#fff", fontWeight: 700 }}>{app.status}</span></td>
                      <td className="pe-3">
                        <button className="btn btn-sm btn-outline-info" onClick={() => { setSelected(app); setNotes(""); }}>
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

        {selected && (
          <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.8)" }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content bg-dark border-secondary">
                <div className="modal-header border-secondary">
                  <h5 className="modal-title text-white">Application Review</h5>
                  <button className="btn-close btn-close-white" onClick={() => setSelected(null)}></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6"><strong>Applicant:</strong> {selected.user?.username || "—"}</div>
                    <div className="col-md-6"><strong>Email:</strong> {selected.user?.email || "—"}</div>
                    <div className="col-md-6"><strong>Portfolio:</strong> {selected.portfolio || "—"}</div>
                    <div className="col-md-6"><strong>Specialization:</strong> {selected.specialization || "—"}</div>
                    <div className="col-md-6"><strong>Experience:</strong> {selected.experience || "—"}</div>
                    <div className="col-md-6"><strong>Equipment:</strong> {selected.equipment || "—"}</div>
                    <div className="col-12"><strong>Message:</strong><div className="mt-2 p-3 rounded" style={{ background: "rgba(255,255,255,0.04)" }}>{selected.message || "No message provided"}</div></div>
                    {selected.status === "pending" && (
                      <div className="col-12">
                        <label className="form-label text-white-50 small">Notes / Reason</label>
                        <textarea className="form-control bg-dark text-white border-secondary" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional internal note or rejection reason..." />
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
                      Approve
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </SecretaryLayout>
  );
}
