import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import BuyerLayout from "./BuyerLayout";
import { API_ENDPOINTS } from "../../../api/apiConfig";
import { toast } from "../../../utils/toast";
import { showConfirm } from "../../../utils/confirm";
import PageHeader from "../../PageHeader";

const inputStyle = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(107,189,208,0.3)",
  color: "#fff",
};

const NOTIF_KEY = "buyer_notifications";

const defaultNotifs = {
  purchaseConfirmation: true,
  downloadReady: true,
  refundUpdate: true,
  newPhotographerContent: false,
  systemAnnouncements: true,
};

const BuyerSettings = () => {
  const [activeTab, setActiveTab] = useState("security");
  const [saving, setSaving] = useState(false);

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPass, setShowPass] = useState(false);

  const [notifs, setNotifs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(NOTIF_KEY)) || defaultNotifs;
    } catch {
      return defaultNotifs;
    }
  });

  const stored = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = stored.id || stored._id;
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwords.currentPassword || !passwords.newPassword) {
      toast.error("All password fields are required");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSaving(true);
    try {
      await axios.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD(userId), {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      }, { headers });
      toast.success("Password changed successfully");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifs = () => {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
    toast.success("Notification preferences saved");
  };

  const handleDeleteAccount = async () => {
    const ok = await showConfirm(
      "Are you sure you want to delete your account? This action cannot be undone.",
      { title: "Delete Account", confirmText: "Delete My Account", danger: true }
    );
    if (!ok) return;
    try {
      await axios.delete(API_ENDPOINTS.AUTH.DELETE_USER(userId), { headers });
      toast.success("Account deleted");
      localStorage.clear();
      window.location.href = "/";
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete account");
    }
  };

  const tabs = [
    { id: "security", icon: "fa-shield-alt", label: "Security" },
    { id: "notifications", icon: "fa-bell", label: "Notifications" },
    { id: "account", icon: "fa-user-cog", label: "Account" },
  ];

  return (
    <BuyerLayout>
      <div className="mc-page">
        <PageHeader title="Settings" subtitle="Account preferences" />

        {/* Tabs */}
        <div className="d-flex gap-2 mb-4 flex-wrap">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className="btn rounded-pill px-4"
              style={activeTab === t.id
                ? { background: "rgba(255,193,7,0.15)", color: "#ffc107", border: "1px solid rgba(255,193,7,0.4)" }
                : { background: "transparent", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }
              }>
              <i className={`fas ${t.icon} me-2`}></i>{t.label}
            </button>
          ))}
        </div>

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="mc-card">
                <h6 className="text-white-50 mb-4 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.1em" }}>Change Password</h6>
                <form onSubmit={handleChangePassword}>
                  <div className="mb-3">
                    <label className="form-label text-white-50 small">Current Password</label>
                    <div className="position-relative">
                      <input type={showPass ? "text" : "password"} className="form-control rounded-3" style={inputStyle}
                        value={passwords.currentPassword}
                        onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))}
                        placeholder="Enter current password" required />
                      <button type="button" className="btn position-absolute end-0 top-0 h-100 px-3 text-white-50"
                        style={{ background: "transparent", border: "none" }}
                        onClick={() => setShowPass(s => !s)}>
                        <i className={`fas fa-eye${showPass ? "-slash" : ""}`}></i>
                      </button>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-white-50 small">New Password</label>
                    <input type={showPass ? "text" : "password"} className="form-control rounded-3" style={inputStyle}
                      value={passwords.newPassword}
                      onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                      placeholder="At least 6 characters" required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-white-50 small">Confirm New Password</label>
                    <input type={showPass ? "text" : "password"} className="form-control rounded-3"
                      style={{ ...inputStyle, borderColor: passwords.confirmPassword && passwords.confirmPassword !== passwords.newPassword ? "#dc3545" : "rgba(107,189,208,0.3)" }}
                      value={passwords.confirmPassword}
                      onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))}
                      placeholder="Repeat new password" required />
                    {passwords.confirmPassword && passwords.confirmPassword !== passwords.newPassword && (
                      <small style={{ color: "#dc3545" }}>Passwords do not match</small>
                    )}
                  </div>
                  <button type="submit" className="btn mc-btn mc-btn-primary rounded-pill px-4 fw-bold"
                    disabled={saving}>
                    {saving ? <><span className="spinner-border spinner-border-sm me-2"></span>Changing...</> : <><i className="fas fa-lock me-2"></i>Change Password</>}
                  </button>
                </form>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="mc-card h-100">
                <h6 className="text-white-50 mb-4 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.1em" }}>Account Info</h6>
                <div className="mb-3 d-flex justify-content-between">
                  <span className="text-white-50 small">Username</span>
                  <span className="text-white small">{stored.username || "—"}</span>
                </div>
                <div className="mb-3 d-flex justify-content-between">
                  <span className="text-white-50 small">Email</span>
                  <span className="text-white small">{stored.email || "—"}</span>
                </div>
                <div className="mb-3 d-flex justify-content-between">
                  <span className="text-white-50 small">Role</span>
                  <span className="badge rounded-pill px-3" style={{ background: "rgba(255,193,7,0.15)", color: "#ffc107" }}>
                    Buyer
                  </span>
                </div>
                <hr style={{ borderColor: "rgba(255,255,255,0.1)" }} />
                <Link to="/buyer/profile" className="btn btn-sm rounded-pill px-4 w-100"
                  style={{ background: "rgba(255,193,7,0.1)", color: "#ffc107", border: "1px solid rgba(255,193,7,0.3)" }}>
                  <i className="fas fa-user-edit me-2"></i>Edit Profile
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="mc-card" style={{ maxWidth: 600 }}>
            <h6 className="text-white-50 mb-4 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.1em" }}>Notification Preferences</h6>

            {[
              { key: "purchaseConfirmation", label: "Purchase confirmation", desc: "When a purchase is completed" },
              { key: "downloadReady", label: "Download ready", desc: "When your download is available" },
              { key: "refundUpdate", label: "Refund updates", desc: "Status changes on refund requests" },
              { key: "newPhotographerContent", label: "New content from followed photographers", desc: "When photographers you follow upload new media" },
              { key: "systemAnnouncements", label: "System announcements", desc: "Platform updates and announcements" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="d-flex justify-content-between align-items-center py-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div>
                  <div className="text-white small fw-semibold">{label}</div>
                  <div className="text-white-50" style={{ fontSize: "0.75rem" }}>{desc}</div>
                </div>
                <div className="form-check form-switch mb-0">
                  <input className="form-check-input" type="checkbox" style={{ cursor: "pointer" }}
                    checked={notifs[key]}
                    onChange={e => setNotifs(n => ({ ...n, [key]: e.target.checked }))} />
                </div>
              </div>
            ))}

            <div className="mt-4">
              <button className="btn mc-btn mc-btn-primary rounded-pill px-4 fw-bold"
                onClick={handleSaveNotifs}>
                <i className="fas fa-save me-2"></i>Save Preferences
              </button>
            </div>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === "account" && (
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="mc-card">
                <h6 className="text-white-50 mb-3 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.1em" }}>Quick Links</h6>
                <div className="d-flex flex-column gap-2">
                  <Link to="/buyer/transactions" className="btn rounded-3 text-start px-3"
                    style={{ background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <i className="fas fa-history me-2 text-warning"></i>Transaction History
                  </Link>
                  <Link to="/buyer/downloads" className="btn rounded-3 text-start px-3"
                    style={{ background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <i className="fas fa-download me-2 text-warning"></i>My Downloads
                  </Link>
                  <Link to="/buyer/wallet" className="btn rounded-3 text-start px-3"
                    style={{ background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <i className="fas fa-wallet me-2 text-warning"></i>Wallet
                  </Link>
                  <Link to="/buyer/favorites" className="btn rounded-3 text-start px-3"
                    style={{ background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <i className="fas fa-heart me-2 text-warning"></i>Favorites
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="mc-card" style={{ border: "1px solid rgba(220,53,69,0.2)" }}>
                <h6 className="mb-3 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.1em", color: "#dc3545" }}>
                  <i className="fas fa-exclamation-triangle me-2"></i>Danger Zone
                </h6>
                <p className="text-white-50 small mb-3">
                  Deleting your account will permanently remove all your data, purchase history, and favorites. This cannot be undone.
                </p>
                <button className="btn mc-btn mc-btn-danger rounded-pill px-4"
                  onClick={handleDeleteAccount}>
                  <i className="fas fa-trash me-2"></i>Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BuyerLayout>
  );
};

export default BuyerSettings;
