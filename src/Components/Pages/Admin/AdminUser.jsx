import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import PageHeader from "../../PageHeader";
import { API_ENDPOINTS } from "../../../api/apiConfig";
import { toast } from "../../../utils/toast";
import { showConfirm } from "../../../utils/confirm";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "user",
    active: true
  });

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.AUTH.GET_USERS, { headers });
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter users
  const getFilteredUsers = () => {
    return users.filter(user => {
      const matchesSearch =
        user.username?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase());

      if (roleFilter === "all") return matchesSearch;
      return matchesSearch && user.role === roleFilter;
    });
  };

  const filteredUsers = getFilteredUsers();

  // Update total pages when filtered users or items per page changes
  useEffect(() => {
    const total = Math.ceil(filteredUsers.length / itemsPerPage);
    setTotalPages(total > 0 ? total : 1);
    setCurrentPage(1);
  }, [filteredUsers.length, itemsPerPage, search, roleFilter]);

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
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

  const currentUsers = getCurrentPageItems();

  // Validation function
  const validateForm = (isEditing = false) => {
    const errors = {};

    if (!formData.username?.trim()) {
      errors.username = "Username is required";
    } else if (formData.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    if (!formData.email?.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    if (!formData.phoneNumber?.trim()) {
      errors.phoneNumber = "Phone number is required";
    } else if (!/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im.test(formData.phoneNumber.replace(/\s/g, ''))) {
      errors.phoneNumber = "Phone number is invalid";
    }

    if (!isEditing && !formData.password?.trim()) {
      errors.password = "Password is required";
    } else if (!isEditing && formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!formData.role) {
      errors.role = "Role is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.patch(`${API_ENDPOINTS.ADMIN.BASE}/users/${userId}/role`, { role: newRole }, { headers });
      toast.success("Role updated");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const handleBanUser = async (user) => {
    const action = user.isBanned ? "unban" : "ban";
    const ok = await showConfirm(
      user.isBanned ? `Unban ${user.username}? They will regain access.` : `Ban ${user.username}? They will lose access immediately.`,
      { title: user.isBanned ? "Unban User" : "Ban User", confirmText: action.charAt(0).toUpperCase() + action.slice(1), danger: !user.isBanned }
    );
    if (!ok) return;
    try {
      await axios.patch(`${API_ENDPOINTS.ADMIN.BASE}/users/${user._id}/ban`, {}, { headers });
      toast.success(`User ${action}ned`);
      fetchUsers();
    } catch (error) {
      toast.error(`Failed to ${action} user`);
    }
  };

  const handleVerifyUser = async (user) => {
    try {
      await axios.patch(`${API_ENDPOINTS.ADMIN.BASE}/users/${user._id}/verify`, {}, { headers });
      toast.success(`User ${user.isVerified ? "unverified" : "verified"}`);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update verification");
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    if (!validateForm(false)) {
      return;
    }

    setSubmitting(true);
    try {
      const registrationData = {
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        role: formData.role
      };
      await axios.post(API_ENDPOINTS.AUTH.REGISTER, registrationData, { headers });
      fetchUsers();
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();

    if (!validateForm(true)) {
      return;
    }

    setSubmitting(true);
    try {
      const updateData = {
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        role: formData.role,
        active: formData.active
      };

      if (formData.password?.trim()) {
        updateData.password = formData.password;
      }

      await axios.put(API_ENDPOINTS.AUTH.UPDATE_USER(editingUser._id), updateData, { headers });
      fetchUsers();
      setShowEditModal(false);
      setEditingUser(null);
      resetForm();
    } catch (error) {
      toast.success("User updated successfully!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    const ok = await showConfirm("This action cannot be undone. The user's data will be permanently removed.", { title: "Delete User?", confirmText: "Delete", danger: true });
    if (!ok) return;

    try {
      await axios.delete(API_ENDPOINTS.AUTH.DELETE_USER(userId), { headers });
      toast.success("User deleted successfully.");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      phoneNumber: "",
      password: "",
      role: "user",
      active: true
    });
    setFormErrors({});
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || user.phone || "",
      password: "",
      role: user.role || "user",
      active: user.active !== false
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === "admin").length,
    photographers: users.filter(u => u.role === "photographer").length,
    buyers: users.filter(u => u.role === "user").length,
    active: users.filter(u => u.active !== false).length,
  };

  return (
    <AdminLayout>
      <PageHeader
        title="User Management"
        subtitle="Manage all registered users"
        onSearch={setSearch}
        searchQuery={search}
        searchPlaceholder="Search by username or email..."
        actions={
          <button
            className="mc-btn mc-btn-primary"
            onClick={() => { resetForm(); setShowAddModal(true); }}
          >
            <i className="fas fa-user-plus me-1"></i>Add User
          </button>
        }
      />
      <div className="mc-page">
        {/* Stats */}
        <div className="mc-stats-row-sm" style={{ marginBottom: "1.25rem" }}>
          <div className="mc-stat-card">
            <div className="mc-stat-label">TOTAL USERS</div>
            <div className="mc-stat-value">{stats.total}</div>
          </div>
          <div className="mc-stat-card">
            <div className="mc-stat-label">ADMINS</div>
            <div className="mc-stat-value">{stats.admins}</div>
          </div>
          <div className="mc-stat-card">
            <div className="mc-stat-label">PHOTOGRAPHERS</div>
            <div className="mc-stat-value">{stats.photographers}</div>
          </div>
          <div className="mc-stat-card">
            <div className="mc-stat-label">BUYERS</div>
            <div className="mc-stat-value">{stats.buyers}</div>
          </div>
          <div className="mc-stat-card">
            <div className="mc-stat-label">ACTIVE</div>
            <div className="mc-stat-value">{stats.active}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="mc-card mb-3" style={{ padding: "0.75rem 1rem" }}>
          <div className="row g-2 align-items-center">
            <div className="col-md-6">
              <select
                className="form-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="photographer">Photographer</option>
                <option value="user">User</option>
              </select>
            </div>
            <div className="col-md-6 d-flex justify-content-end">
              <button className="mc-btn mc-btn-ghost" onClick={fetchUsers}>
                <i className="fas fa-sync-alt me-1"></i>Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <div className="spinner-border" style={{ color: "var(--mc-accent)" }}></div>
          </div>
        )}

        {/* Users Table */}
        {!loading && (
          <div className="mc-table-card">
            <div className="table-responsive">
              <table className="table table-borderless mb-0">
                <thead>
                  <tr>
                    <th className="ps-4 py-3">User</th>
                    <th className="py-3">Email</th>
                    <th className="py-3">Role</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Joined</th>
                    <th className="py-3">Media</th>
                    <th className="py-3">Earnings</th>
                    <th className="pe-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.length === 0 ? (
                    <tr>
                      <td colSpan="8">
                        <div className="mc-empty">
                          <i className="fas fa-users-slash"></i>
                          <p>No users found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentUsers.map((user) => (
                      <tr key={user._id}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center gap-3">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center"
                              style={{
                                width: "40px",
                                height: "40px",
                                background: user.role === "admin"
                                  ? "rgba(91,127,229,0.2)"
                                  : user.role === "photographer"
                                  ? "rgba(76,201,166,0.2)"
                                  : "rgba(240,107,141,0.2)",
                              }}
                            >
                              <i className={`fas ${
                                user.role === "admin"
                                  ? "fa-crown"
                                  : user.role === "photographer"
                                  ? "fa-camera"
                                  : "fa-user"
                              }`} style={{ color: user.role === "admin" ? "var(--mc-accent)" : user.role === "photographer" ? "var(--mc-accent-teal)" : "var(--mc-accent-pink)" }}></i>
                            </div>
                            <div>
                              <div className="fw-bold">{user.username || "N/A"}</div>
                              <small className="text-muted">ID: {user._id?.substring(0, 8)}...</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <i className="fas fa-envelope me-2 text-muted"></i>
                          {user.email}
                        </td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            style={{ width: "130px" }}
                            value={user.role}
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          >
                            <option value="user">User</option>
                            <option value="photographer">Photographer</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td>
                          <div className="d-flex flex-column gap-1">
                            <span className="badge rounded-pill px-2 py-1" style={{
                              background: user.isBanned ? "rgba(220,53,69,0.15)" : "rgba(76,201,166,0.15)",
                              color: user.isBanned ? "#dc3545" : "var(--mc-accent-teal)",
                              fontSize: "0.7rem"
                            }}>
                              <i className={`fas ${user.isBanned ? "fa-ban" : "fa-check-circle"} me-1`}></i>
                              {user.isBanned ? "Banned" : "Active"}
                            </span>
                            {user.isVerified && (
                              <span className="badge rounded-pill px-2 py-1" style={{ background: "rgba(91,127,229,0.15)", color: "var(--mc-accent)", fontSize: "0.7rem" }}>
                                <i className="fas fa-shield-check me-1"></i>Verified
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <small className="text-muted">
                            <i className="fas fa-calendar me-2"></i>
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                          </small>
                        </td>
                        <td>
                          <span className="badge px-3 py-2" style={{ background: "rgba(91,127,229,0.15)", color: "var(--mc-accent)" }}>
                            <i className="fas fa-image me-2"></i>
                            {user.mediaCount || 0}
                          </span>
                        </td>
                        <td>
                          <span className="badge px-3 py-2" style={{ background: "rgba(245,166,35,0.15)", color: "var(--mc-accent-gold)" }}>
                            <i className="fas fa-coins me-2"></i>
                            KES {user.earnings?.toLocaleString() || 0}
                          </span>
                        </td>
                        <td className="pe-4">
                          <div className="d-flex gap-1 flex-wrap">
                            <button className="mc-btn mc-btn-ghost btn-sm px-2"
                              style={{ color: user.isBanned ? "var(--mc-accent-teal)" : "#dc3545" }}
                              onClick={() => handleBanUser(user)} title={user.isBanned ? "Unban" : "Ban"}>
                              <i className={`fas ${user.isBanned ? "fa-check" : "fa-ban"}`}></i>
                            </button>
                            <button className="mc-btn mc-btn-ghost btn-sm px-2"
                              onClick={() => handleVerifyUser(user)} title={user.isVerified ? "Remove Verification" : "Verify"}>
                              <i className="fas fa-shield-alt"></i>
                            </button>
                            <button className="mc-btn mc-btn-ghost btn-sm px-2"
                              onClick={() => openEditModal(user)} title="Edit">
                              <i className="fas fa-edit"></i>
                            </button>
                            <button className="mc-btn mc-btn-ghost btn-sm px-2"
                              onClick={() => setSelectedUser(user)} title="View Details">
                              <i className="fas fa-eye"></i>
                            </button>
                            <button className="mc-btn mc-btn-danger btn-sm px-2"
                              onClick={() => handleDeleteUser(user._id)} title="Delete">
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
            {filteredUsers.length > 0 && (
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center p-3 border-top gap-3">
                <div className="d-flex align-items-center gap-2">
                  <small className="text-muted">Show</small>
                  <select
                    className="form-select form-select-sm"
                    style={{ width: "70px" }}
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <small className="text-muted">entries</small>
                </div>

                <small className="text-muted">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of{" "}
                  {filteredUsers.length} users
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
                        <li className="page-item">
                          <button className="page-link" onClick={() => goToPage(1)}>1</button>
                        </li>
                        {getPageNumbers()[0] > 2 && (
                          <li className="page-item disabled">
                            <span className="page-link">...</span>
                          </li>
                        )}
                      </>
                    )}

                    {getPageNumbers().map(pageNum => (
                      <li key={pageNum} className={`page-item ${currentPage === pageNum ? "active" : ""}`}>
                        <button className="page-link" onClick={() => goToPage(pageNum)}>{pageNum}</button>
                      </li>
                    ))}

                    {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
                      <>
                        {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
                          <li className="page-item disabled">
                            <span className="page-link">...</span>
                          </li>
                        )}
                        <li className="page-item">
                          <button className="page-link" onClick={() => goToPage(totalPages)}>{totalPages}</button>
                        </li>
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

        {/* Add User Modal */}
        {showAddModal && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(5px)", zIndex: 1050 }}
            onClick={() => setShowAddModal(false)}
          >
            <div className="mc-card" style={{ maxWidth: "500px", width: "90%" }} onClick={(e) => e.stopPropagation()}>
              <div className="mc-card-header d-flex justify-content-between align-items-center">
                <h5 className="mc-card-title mb-0">
                  <i className="fas fa-user-plus me-2"></i>Add New User
                </h5>
                <button className="btn-close" onClick={() => { setShowAddModal(false); resetForm(); }}></button>
              </div>
              <form onSubmit={handleAddUser}>
                <div style={{ padding: "1rem" }}>
                  <div className="mb-3">
                    <label className="form-label small">Username *</label>
                    <input type="text" className={`form-control ${formErrors.username ? 'is-invalid' : ''}`}
                      value={formData.username}
                      onChange={(e) => { setFormData({...formData, username: e.target.value}); if (formErrors.username) setFormErrors({...formErrors, username: null}); }}
                      required />
                    {formErrors.username && <div className="invalid-feedback">{formErrors.username}</div>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label small">Email *</label>
                    <input type="email" className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                      value={formData.email}
                      onChange={(e) => { setFormData({...formData, email: e.target.value}); if (formErrors.email) setFormErrors({...formErrors, email: null}); }}
                      required />
                    {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label small">Phone *</label>
                    <input type="tel" className={`form-control ${formErrors.phoneNumber ? 'is-invalid' : ''}`}
                      value={formData.phoneNumber}
                      onChange={(e) => { setFormData({...formData, phoneNumber: e.target.value}); if (formErrors.phoneNumber) setFormErrors({...formErrors, phoneNumber: null}); }}
                      required />
                    {formErrors.phoneNumber && <div className="invalid-feedback">{formErrors.phoneNumber}</div>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label small">Password *</label>
                    <input type="password" className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                      value={formData.password}
                      onChange={(e) => { setFormData({...formData, password: e.target.value}); if (formErrors.password) setFormErrors({...formErrors, password: null}); }}
                      required />
                    {formErrors.password && <div className="invalid-feedback">{formErrors.password}</div>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label small">Role *</label>
                    <select className={`form-select ${formErrors.role ? 'is-invalid' : ''}`}
                      value={formData.role}
                      onChange={(e) => { setFormData({...formData, role: e.target.value}); if (formErrors.role) setFormErrors({...formErrors, role: null}); }}>
                      <option value="user">User</option>
                      <option value="photographer">Photographer</option>
                      <option value="admin">Admin</option>
                    </select>
                    {formErrors.role && <div className="invalid-feedback">{formErrors.role}</div>}
                  </div>
                  <div className="mb-3">
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" role="switch" id="activeSwitch"
                        checked={formData.active}
                        onChange={(e) => setFormData({...formData, active: e.target.checked})} />
                      <label className="form-check-label small" htmlFor="activeSwitch">Active Account</label>
                    </div>
                  </div>
                </div>
                <div className="d-flex gap-2 justify-content-end p-3 border-top">
                  <button type="button" className="mc-btn mc-btn-ghost" onClick={() => { setShowAddModal(false); resetForm(); }}>Cancel</button>
                  <button type="submit" className="mc-btn mc-btn-primary" disabled={submitting}>
                    {submitting ? <><span className="spinner-border spinner-border-sm me-2"></span>Adding...</> : <><i className="fas fa-save me-2"></i>Add User</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && editingUser && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(5px)", zIndex: 1050 }}
            onClick={() => { setShowEditModal(false); setEditingUser(null); resetForm(); }}
          >
            <div className="mc-card" style={{ maxWidth: "500px", width: "90%" }} onClick={(e) => e.stopPropagation()}>
              <div className="mc-card-header d-flex justify-content-between align-items-center">
                <h5 className="mc-card-title mb-0">
                  <i className="fas fa-edit me-2"></i>Edit User
                </h5>
                <button className="btn-close" onClick={() => { setShowEditModal(false); setEditingUser(null); resetForm(); }}></button>
              </div>
              <form onSubmit={handleEditUser}>
                <div style={{ padding: "1rem" }}>
                  <div className="mb-3">
                    <label className="form-label small">Username *</label>
                    <input type="text" className={`form-control ${formErrors.username ? 'is-invalid' : ''}`}
                      value={formData.username}
                      onChange={(e) => { setFormData({...formData, username: e.target.value}); if (formErrors.username) setFormErrors({...formErrors, username: null}); }}
                      required />
                    {formErrors.username && <div className="invalid-feedback">{formErrors.username}</div>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label small">Email *</label>
                    <input type="email" className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                      value={formData.email}
                      onChange={(e) => { setFormData({...formData, email: e.target.value}); if (formErrors.email) setFormErrors({...formErrors, email: null}); }}
                      required />
                    {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label small">Phone *</label>
                    <input type="tel" className={`form-control ${formErrors.phoneNumber ? 'is-invalid' : ''}`}
                      value={formData.phoneNumber}
                      onChange={(e) => { setFormData({...formData, phoneNumber: e.target.value}); if (formErrors.phoneNumber) setFormErrors({...formErrors, phoneNumber: null}); }}
                      required />
                    {formErrors.phoneNumber && <div className="invalid-feedback">{formErrors.phoneNumber}</div>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label small">New Password <span className="text-muted">(leave blank to keep current)</span></label>
                    <input type="password" className="form-control"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small">Role *</label>
                    <select className={`form-select ${formErrors.role ? 'is-invalid' : ''}`}
                      value={formData.role}
                      onChange={(e) => { setFormData({...formData, role: e.target.value}); if (formErrors.role) setFormErrors({...formErrors, role: null}); }}>
                      <option value="user">User</option>
                      <option value="photographer">Photographer</option>
                      <option value="admin">Admin</option>
                    </select>
                    {formErrors.role && <div className="invalid-feedback">{formErrors.role}</div>}
                  </div>
                  <div className="mb-3">
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" role="switch" id="editActiveSwitch"
                        checked={formData.active}
                        onChange={(e) => setFormData({...formData, active: e.target.checked})} />
                      <label className="form-check-label small" htmlFor="editActiveSwitch">Active Account</label>
                    </div>
                  </div>
                </div>
                <div className="d-flex gap-2 justify-content-end p-3 border-top">
                  <button type="button" className="mc-btn mc-btn-ghost" onClick={() => { setShowEditModal(false); setEditingUser(null); resetForm(); }}>Cancel</button>
                  <button type="submit" className="mc-btn mc-btn-primary" disabled={submitting}>
                    {submitting ? <><span className="spinner-border spinner-border-sm me-2"></span>Updating...</> : <><i className="fas fa-save me-2"></i>Update User</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        {selectedUser && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(5px)", zIndex: 1050 }}
            onClick={() => setSelectedUser(null)}
          >
            <div className="mc-card" style={{ maxWidth: "500px", width: "90%" }} onClick={(e) => e.stopPropagation()}>
              <div className="mc-card-header d-flex justify-content-between align-items-center">
                <h5 className="mc-card-title mb-0">
                  <i className="fas fa-user me-2"></i>User Details
                </h5>
                <button className="btn-close" onClick={() => setSelectedUser(null)}></button>
              </div>
              <div style={{ padding: "1rem" }}>
                <div className="text-center mb-4">
                  <div className="rounded-circle d-inline-flex align-items-center justify-content-center"
                    style={{ width: 80, height: 80, background: "rgba(91,127,229,0.15)" }}>
                    <i className={`fas ${selectedUser.role === "admin" ? "fa-crown" : selectedUser.role === "photographer" ? "fa-camera" : "fa-user"} fa-2x`}
                      style={{ color: "var(--mc-accent)" }}></i>
                  </div>
                  <h5 className="mt-3 mb-1">{selectedUser.username}</h5>
                  <p className="text-muted mb-2">{selectedUser.email}</p>
                </div>
                <div className="row g-2">
                  <div className="col-6">
                    <div className="mc-card p-2 text-center">
                      <small className="text-muted d-block">Role</small>
                      <span className="fw-bold">{selectedUser.role?.charAt(0).toUpperCase() + selectedUser.role?.slice(1)}</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="mc-card p-2 text-center">
                      <small className="text-muted d-block">Media Count</small>
                      <span className="fw-bold">{selectedUser.mediaCount || 0}</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="mc-card p-2 text-center">
                      <small className="text-muted d-block">Earnings</small>
                      <span className="fw-bold">KES {selectedUser.earnings?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="mc-card p-2 text-center">
                      <small className="text-muted d-block">Joined</small>
                      <span className="fw-bold" style={{ fontSize: "0.85rem" }}>
                        {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 p-3 rounded-3" style={{ background: "rgba(0,0,0,0.15)" }}>
                  <small className="text-muted d-block mb-1">User ID: {selectedUser._id}</small>
                  <small className="text-muted d-block">Last Updated: {selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleString() : 'N/A'}</small>
                </div>
              </div>
              <div className="d-flex gap-2 justify-content-end p-3 border-top">
                <button className="mc-btn mc-btn-ghost" onClick={() => { setSelectedUser(null); openEditModal(selectedUser); }}>
                  <i className="fas fa-edit me-2"></i>Edit User
                </button>
                <button className="mc-btn mc-btn-ghost" onClick={() => setSelectedUser(null)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
