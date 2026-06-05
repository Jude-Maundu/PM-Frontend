import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import PageHeader from "../../PageHeader";
import { API_BASE_URL } from "../../../api/apiConfig";
import { getAuthHeaders } from "../../../utils/auth";
import { toast } from "../../../utils/toast";

const API = API_BASE_URL;

const PERM_LABELS = {
  canApprovePhotos:    { label: "Approve Photos",       icon: "fa-image" },
  canVerifyUsers:      { label: "Verify Users (KYC)",   icon: "fa-id-card" },
  canViewOrders:       { label: "View Orders",          icon: "fa-shopping-cart" },
  canManageWithdrawals:{ label: "Manage Withdrawals",   icon: "fa-money-bill-wave" },
};

const ROLE_COLORS = { reviewer: "info", support: "secondary", secretary: "primary", engineer: "success", marketing: "warning" };

const EMPTY_FORM = { username: "", email: "", password: "", role: "reviewer", permissions: { canApprovePhotos: false, canVerifyUsers: false, canViewOrders: false, canManageWithdrawals: false } };

export default function AdminStaff() {
  const [staff, setStaff]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [editPerms, setEditPerms] = useState(null); // { id, permissions }
  const [savingPerms, setSavingPerms] = useState(false);
  const [removing, setRemoving] = useState(null);

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/admin/staff`, { headers: getAuthHeaders() });
      setStaff(res.data.data || []);
    } catch { toast.error("Failed to load staff"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      await axios.post(`${API}/admin/staff`, form, { headers: getAuthHeaders() });
      toast.success("Staff member created");
      setShowForm(false);
      setForm(EMPTY_FORM);
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create staff");
    } finally { setCreating(false); }
  };

  const handleSavePerms = async () => {
    try {
      setSavingPerms(true);
      await axios.patch(`${API}/admin/staff/${editPerms.id}/permissions`, { permissions: editPerms.permissions }, { headers: getAuthHeaders() });
      toast.success("Permissions updated");
      setEditPerms(null);
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update permissions");
    } finally { setSavingPerms(false); }
  };

  const handleRemove = async (id, username) => {
    if (!window.confirm(`Remove ${username} from staff? This will revoke their role.`)) return;
    try {
      setRemoving(id);
      await axios.delete(`${API}/admin/staff/${id}`, { headers: getAuthHeaders() });
      toast.success("Staff member removed");
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove staff");
    } finally { setRemoving(null); }
  };

  return (
    <AdminLayout>
      <PageHeader title="Staff Management" subtitle="Manage reviewer and support accounts" />
      <div className="mc-page">

        {/* Toolbar */}
        <div className="mc-card mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <small style={{ opacity: 0.6 }}>{staff.length} staff member{staff.length !== 1 ? "s" : ""}</small>
            <button className="mc-btn mc-btn-primary btn-sm" onClick={() => { setShowForm(true); setForm(EMPTY_FORM); }}>
              <i className="fas fa-user-plus me-2"></i>Add Staff Member
            </button>
          </div>
        </div>

        <div className="mc-table-card">
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border" style={{ color: "var(--mc-accent)" }}></div></div>
          ) : staff.length === 0 ? (
            <div className="mc-empty py-5">
              <i className="fas fa-users fa-2x mb-2"></i>
              <p>No staff members yet</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-dark table-hover mb-0">
                <thead>
                  <tr>
                    <th className="ps-3">Member</th>
                    <th>Role</th>
                    <th>Permissions</th>
                    <th>Added</th>
                    <th className="pe-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map(s => (
                    <tr key={s._id}>
                      <td className="ps-3">
                        <div className="d-flex align-items-center gap-2">
                          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--mc-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.78rem", flexShrink: 0 }}>
                            {s.username?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{s.username}</div>
                            <div style={{ fontSize: "0.7rem", opacity: 0.55 }}>{s.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge bg-${ROLE_COLORS[s.role] || "secondary"}`}>{s.role}</span>
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {Object.entries(PERM_LABELS).map(([key, { label, icon }]) => (
                            s.staffPermissions?.[key] ? (
                              <span key={key} className="badge bg-success" style={{ fontSize: "0.65rem" }}>
                                <i className={`fas ${icon} me-1`}></i>{label}
                              </span>
                            ) : null
                          ))}
                          {!Object.values(s.staffPermissions || {}).some(Boolean) && (
                            <span style={{ fontSize: "0.75rem", opacity: 0.4 }}>None</span>
                          )}
                        </div>
                      </td>
                      <td><small style={{ opacity: 0.6 }}>{new Date(s.createdAt).toLocaleDateString()}</small></td>
                      <td className="pe-3">
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-outline-info" title="Edit permissions"
                            onClick={() => setEditPerms({ id: s._id, username: s.username, permissions: { ...s.staffPermissions } })}>
                            <i className="fas fa-sliders-h"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger" title="Remove staff"
                            disabled={removing === s._id}
                            onClick={() => handleRemove(s._id, s.username)}>
                            {removing === s._id
                              ? <span className="spinner-border spinner-border-sm"></span>
                              : <i className="fas fa-user-times"></i>}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Staff Modal */}
      {showForm && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark border-secondary">
              <div className="modal-header border-secondary">
                <h5 className="modal-title text-white"><i className="fas fa-user-plus me-2"></i>Add Staff Member</h5>
                <button className="btn-close btn-close-white" onClick={() => setShowForm(false)}></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label text-white-50 small">Username</label>
                      <input className="form-control bg-dark text-white border-secondary" required
                        value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-white-50 small">Email</label>
                      <input type="email" className="form-control bg-dark text-white border-secondary" required
                        value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-white-50 small">Password</label>
                      <input type="password" className="form-control bg-dark text-white border-secondary" required minLength={8}
                        value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-white-50 small">Role</label>
                      <select className="form-select bg-dark text-white border-secondary"
                        value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                        <option value="reviewer">Reviewer</option>
                        <option value="support">Support</option>
                        <option value="secretary">Secretary</option>
                        <option value="engineer">Website Maintenance Engineer</option>
                        <option value="marketing">Marketing Lead</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label text-white-50 small">Permissions</label>
                      <div className="d-flex flex-wrap gap-3">
                        {Object.entries(PERM_LABELS).map(([key, { label, icon }]) => (
                          <div key={key} className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" role="switch" id={`cp-${key}`}
                              checked={form.permissions[key]}
                              onChange={e => setForm(f => ({ ...f, permissions: { ...f.permissions, [key]: e.target.checked } }))} />
                            <label className="form-check-label text-white-50 small" htmlFor={`cp-${key}`}>
                              <i className={`fas ${icon} me-1`}></i>{label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-secondary">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={creating}>
                    {creating ? <><span className="spinner-border spinner-border-sm me-1"></span>Creating...</> : "Create Staff Member"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Permissions Modal */}
      {editPerms && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark border-secondary">
              <div className="modal-header border-secondary">
                <h5 className="modal-title text-white">Permissions — {editPerms.username}</h5>
                <button className="btn-close btn-close-white" onClick={() => setEditPerms(null)}></button>
              </div>
              <div className="modal-body">
                <div className="d-flex flex-column gap-3">
                  {Object.entries(PERM_LABELS).map(([key, { label, icon }]) => (
                    <div key={key} className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <div>
                        <i className={`fas ${icon} me-2`} style={{ opacity: 0.6 }}></i>
                        <span style={{ fontSize: "0.88rem" }}>{label}</span>
                      </div>
                      <div className="form-check form-switch mb-0">
                        <input className="form-check-input" type="checkbox" role="switch"
                          checked={!!editPerms.permissions?.[key]}
                          onChange={e => setEditPerms(ep => ({ ...ep, permissions: { ...ep.permissions, [key]: e.target.checked } }))}
                          style={{ width: "2.4em", height: "1.3em", cursor: "pointer" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer border-secondary">
                <button className="btn btn-secondary btn-sm" onClick={() => setEditPerms(null)}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={handleSavePerms} disabled={savingPerms}>
                  {savingPerms ? <><span className="spinner-border spinner-border-sm me-1"></span>Saving...</> : "Save Permissions"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
