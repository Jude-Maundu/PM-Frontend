import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import PageHeader from "../../PageHeader";
import { API_BASE_URL } from "../../../api/apiConfig";
import { getAuthHeaders } from "../../../utils/auth";
import { toast } from "../../../utils/toast";

const API = API_BASE_URL;

const PERM_LABELS = {
  canApprovePhotos:    { label: "Approve Photos",     icon: "fa-image"          },
  canVerifyUsers:      { label: "Verify Users (KYC)", icon: "fa-id-card"        },
  canViewOrders:       { label: "View Orders",        icon: "fa-shopping-cart"  },
  canManageWithdrawals:{ label: "Manage Withdrawals", icon: "fa-money-bill-wave"},
};

const ROLE_OPTIONS = [
  { value: "reviewer",   label: "Reviewer"                    },
  { value: "support",    label: "Support"                     },
  { value: "secretary",  label: "Secretary"                   },
  { value: "engineer",   label: "Website Maintenance Engineer"},
  { value: "marketing",  label: "Marketing Lead"              },
];

const ROLE_COLORS = {
  reviewer: "info", support: "secondary",
  secretary: "primary", engineer: "success", marketing: "warning",
};

const EMPTY_FORM = {
  username: "", email: "", password: "", role: "reviewer",
  permissions: { canApprovePhotos: false, canVerifyUsers: false, canViewOrders: false, canManageWithdrawals: false },
};

const Avatar = ({ letter, color = "var(--mc-accent)" }) => (
  <div style={{
    width: 34, height: 34, borderRadius: "50%", background: color,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: "0.78rem", flexShrink: 0, color: "#fff",
  }}>
    {letter}
  </div>
);

export default function AdminStaff() {
  const [tab, setTab]           = useState("list"); // "list" | "create" | "promote"
  const [staff, setStaff]       = useState([]);
  const [loading, setLoading]   = useState(true);

  // Create form
  const [form, setForm]         = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);

  // Promote from users
  const [users, setUsers]       = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch]     = useState("");
  const [promoteTarget, setPromoteTarget] = useState(null); // user object
  const [promoteRole, setPromoteRole]     = useState("reviewer");
  const [promoting, setPromoting]         = useState(false);

  // Edit permissions
  const [editPerms, setEditPerms]     = useState(null);
  const [savingPerms, setSavingPerms] = useState(false);
  const [removing, setRemoving]       = useState(null);

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/admin/staff`, { headers: getAuthHeaders() });
      setStaff(res.data.data || []);
    } catch { toast.error("Failed to load staff"); }
    finally { setLoading(false); }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const res = await axios.get(`${API}/auth/users`, { headers: getAuthHeaders() });
      // Exclude users who are already staff / admin
      const all = Array.isArray(res.data) ? res.data : (res.data?.users || res.data?.data || []);
      setUsers(all.filter(u => !["admin","reviewer","support","secretary","engineer","marketing"].includes(u.role)));
    } catch { toast.error("Failed to load users"); }
    finally { setUsersLoading(false); }
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  useEffect(() => {
    if (tab === "promote") fetchUsers();
  }, [tab, fetchUsers]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      await axios.post(`${API}/admin/staff`, form, { headers: getAuthHeaders() });
      toast.success("Staff member created");
      setForm(EMPTY_FORM);
      setTab("list");
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create staff");
    } finally { setCreating(false); }
  };

  const handlePromote = async () => {
    if (!promoteTarget) return;
    try {
      setPromoting(true);
      await axios.patch(
        `${API}/admin/users/${promoteTarget._id}/role`,
        { role: promoteRole },
        { headers: getAuthHeaders() }
      );
      toast.success(`${promoteTarget.username || promoteTarget.email} promoted to ${promoteRole}`);
      setPromoteTarget(null);
      setPromoteRole("reviewer");
      setUserSearch("");
      setTab("list");
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to promote user");
    } finally { setPromoting(false); }
  };

  const handleSavePerms = async () => {
    try {
      setSavingPerms(true);
      await axios.patch(
        `${API}/admin/staff/${editPerms.id}/permissions`,
        { permissions: editPerms.permissions },
        { headers: getAuthHeaders() }
      );
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

  const filteredUsers = users.filter(u => {
    const q = userSearch.toLowerCase();
    return (
      (u.username || "").toLowerCase().includes(q) ||
      (u.email    || "").toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout>
      <PageHeader title="Staff Management" subtitle="Manage staff accounts and promote existing users" />
      <div className="mc-page">

        {/* Tab bar */}
        <div className="mc-card mb-3">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="d-flex gap-2">
              {[
                { key: "list",    icon: "fa-users",       label: "Staff List"           },
                { key: "create",  icon: "fa-user-plus",   label: "Create New Staff"     },
                { key: "promote", icon: "fa-user-shield", label: "Promote Existing User"},
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`btn btn-sm ${tab === t.key ? "btn-primary" : "btn-outline-secondary"}`}
                >
                  <i className={`fas ${t.icon} me-2`}></i>{t.label}
                </button>
              ))}
            </div>
            <small style={{ opacity: 0.5 }}>{staff.length} staff member{staff.length !== 1 ? "s" : ""}</small>
          </div>
        </div>

        {/* ── TAB: Staff List ── */}
        {tab === "list" && (
          <div className="mc-table-card">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border" style={{ color: "var(--mc-accent)" }}></div>
              </div>
            ) : staff.length === 0 ? (
              <div className="mc-empty py-5">
                <i className="fas fa-users fa-2x mb-2"></i>
                <p>No staff members yet. Create one or promote an existing user.</p>
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
                            <Avatar letter={s.username?.[0]?.toUpperCase()} />
                            <div>
                              <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{s.username}</div>
                              <div style={{ fontSize: "0.7rem", opacity: 0.55 }}>{s.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge bg-${ROLE_COLORS[s.role] || "secondary"}`}>
                            {ROLE_OPTIONS.find(r => r.value === s.role)?.label || s.role}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {Object.entries(PERM_LABELS).map(([key, { label, icon }]) =>
                              s.staffPermissions?.[key] ? (
                                <span key={key} className="badge bg-success" style={{ fontSize: "0.65rem" }}>
                                  <i className={`fas ${icon} me-1`}></i>{label}
                                </span>
                              ) : null
                            )}
                            {!Object.values(s.staffPermissions || {}).some(Boolean) && (
                              <span style={{ fontSize: "0.75rem", opacity: 0.4 }}>None</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <small style={{ opacity: 0.6 }}>{new Date(s.createdAt).toLocaleDateString()}</small>
                        </td>
                        <td className="pe-3">
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-info" title="Edit permissions"
                              onClick={() => setEditPerms({ id: s._id, username: s.username, permissions: { ...s.staffPermissions } })}
                            >
                              <i className="fas fa-sliders-h"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger" title="Remove staff"
                              disabled={removing === s._id}
                              onClick={() => handleRemove(s._id, s.username)}
                            >
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
        )}

        {/* ── TAB: Create New Staff ── */}
        {tab === "create" && (
          <div className="mc-card" style={{ maxWidth: 640 }}>
            <h6 className="mb-3" style={{ fontWeight: 700 }}>
              <i className="fas fa-user-plus me-2" style={{ color: "var(--mc-accent)" }}></i>Create New Staff Account
            </h6>
            <form onSubmit={handleCreate}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label text-white-50 small">Username</label>
                  <input className="form-control bg-dark text-white border-secondary" required
                    placeholder="e.g. jane_sec"
                    value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-white-50 small">Email</label>
                  <input type="email" className="form-control bg-dark text-white border-secondary" required
                    placeholder="e.g. jane@company.com"
                    value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-white-50 small">Password</label>
                  <input type="password" className="form-control bg-dark text-white border-secondary" required minLength={8}
                    placeholder="Min. 8 characters"
                    value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-white-50 small">Role</label>
                  <select className="form-select bg-dark text-white border-secondary"
                    value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                    {ROLE_OPTIONS.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
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
                <div className="col-12 d-flex gap-2 pt-2">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setTab("list")}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={creating}>
                    {creating
                      ? <><span className="spinner-border spinner-border-sm me-1"></span>Creating...</>
                      : <><i className="fas fa-user-plus me-1"></i>Create Staff Member</>}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ── TAB: Promote Existing User ── */}
        {tab === "promote" && (
          <div className="row g-3">

            {/* User search list */}
            <div className="col-md-7">
              <div className="mc-card h-100">
                <h6 className="mb-3" style={{ fontWeight: 700 }}>
                  <i className="fas fa-search me-2" style={{ color: "var(--mc-accent)" }}></i>
                  Select a User to Promote
                </h6>
                <input
                  className="form-control bg-dark text-white border-secondary mb-3"
                  placeholder="Search by name or email..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                />
                <div style={{ maxHeight: 400, overflowY: "auto" }}>
                  {usersLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border spinner-border-sm" style={{ color: "var(--mc-accent)" }}></div>
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-4" style={{ opacity: 0.5, fontSize: "0.82rem" }}>
                      {userSearch ? "No users match your search" : "No eligible users found"}
                    </div>
                  ) : (
                    filteredUsers.map(u => {
                      const isSelected = promoteTarget?._id === u._id;
                      return (
                        <div
                          key={u._id}
                          onClick={() => setPromoteTarget(isSelected ? null : u)}
                          style={{
                            display: "flex", alignItems: "center", gap: "0.75rem",
                            padding: "0.55rem 0.75rem", borderRadius: 10, marginBottom: "0.35rem",
                            cursor: "pointer", transition: "all 0.15s",
                            background: isSelected ? "rgba(91,127,229,0.18)" : "rgba(255,255,255,0.03)",
                            border: `1px solid ${isSelected ? "rgba(91,127,229,0.4)" : "rgba(255,255,255,0.06)"}`,
                          }}
                        >
                          <Avatar
                            letter={(u.username || u.email)?.[0]?.toUpperCase()}
                            color={isSelected ? "var(--mc-accent)" : "#444"}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: "0.83rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {u.username || "—"}
                            </div>
                            <div style={{ fontSize: "0.7rem", opacity: 0.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {u.email}
                            </div>
                          </div>
                          <span className={`badge bg-${u.role === "photographer" ? "warning" : "secondary"} text-dark`} style={{ fontSize: "0.6rem" }}>
                            {u.role || "user"}
                          </span>
                          {isSelected && (
                            <i className="fas fa-check-circle" style={{ color: "var(--mc-accent)", fontSize: "0.9rem" }}></i>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Promote panel */}
            <div className="col-md-5">
              <div className="mc-card h-100 d-flex flex-column">
                <h6 className="mb-3" style={{ fontWeight: 700 }}>
                  <i className="fas fa-user-shield me-2" style={{ color: "var(--mc-accent)" }}></i>
                  Assign Role
                </h6>

                {!promoteTarget ? (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: 0.4, gap: "0.5rem" }}>
                    <i className="fas fa-hand-pointer" style={{ fontSize: "2rem" }}></i>
                    <span style={{ fontSize: "0.8rem" }}>Select a user from the list</span>
                  </div>
                ) : (
                  <>
                    {/* Selected user preview */}
                    <div style={{ padding: "0.75rem", borderRadius: 10, background: "rgba(91,127,229,0.1)", border: "1px solid rgba(91,127,229,0.25)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <Avatar letter={(promoteTarget.username || promoteTarget.email)?.[0]?.toUpperCase()} color="var(--mc-accent)" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>{promoteTarget.username || "—"}</div>
                        <div style={{ fontSize: "0.7rem", opacity: 0.55, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {promoteTarget.email}
                        </div>
                        <div style={{ marginTop: "2px" }}>
                          <span className="badge bg-secondary" style={{ fontSize: "0.6rem" }}>
                            Current: {promoteTarget.role || "user"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <label className="form-label text-white-50 small mb-1">Assign as</label>
                    <select
                      className="form-select bg-dark text-white border-secondary mb-3"
                      value={promoteRole}
                      onChange={e => setPromoteRole(e.target.value)}
                    >
                      {ROLE_OPTIONS.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>

                    <div style={{ padding: "0.6rem 0.75rem", borderRadius: 8, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", fontSize: "0.72rem", marginBottom: "1rem", color: "#F59E0B" }}>
                      <i className="fas fa-info-circle me-1"></i>
                      This will change <strong>{promoteTarget.username}</strong>'s role from <strong>{promoteTarget.role || "user"}</strong> to <strong>{promoteRole}</strong> and grant them dashboard access.
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}>
                      <button
                        className="btn btn-secondary btn-sm flex-grow-1"
                        onClick={() => { setPromoteTarget(null); setPromoteRole("reviewer"); }}
                      >
                        Clear
                      </button>
                      <button
                        className="btn btn-primary btn-sm flex-grow-1"
                        onClick={handlePromote}
                        disabled={promoting}
                      >
                        {promoting
                          ? <><span className="spinner-border spinner-border-sm me-1"></span>Promoting...</>
                          : <><i className="fas fa-user-shield me-1"></i>Promote User</>}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

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
                    <div key={key} className="d-flex justify-content-between align-items-center py-2"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
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
                  {savingPerms
                    ? <><span className="spinner-border spinner-border-sm me-1"></span>Saving...</>
                    : "Save Permissions"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
