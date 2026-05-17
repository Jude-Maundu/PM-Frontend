import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import PhotographerLayout from "./PhotographerLayout";
import { API_ENDPOINTS } from "../../../api/apiConfig";
import { toast } from "../../../utils/toast";

const glassStyle = {
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.1)",
};

const inputStyle = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(107,189,208,0.3)",
  color: "#fff",
};

const NOTIF_KEY = "photographer_notifications";

const defaultNotifs = {
  newSale: true,
  newFollower: true,
  withdrawalUpdate: true,
  systemAnnouncements: true,
  shareActivity: false,
};

const PhotographerSettings = () => {
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

  const [watermark, setWatermark] = useState("");
  const [savingWatermark, setSavingWatermark] = useState(false);

  const stored = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = stored.id || stored._id;
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    setWatermark(stored.watermark || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleSaveWatermark = async () => {
    setSavingWatermark(true);
    try {
      await axios.put(API_ENDPOINTS.AUTH.UPDATE_USER(userId), {
        username: stored.username,
        email: stored.email,
        watermark,
      }, { headers });
      localStorage.setItem("user", JSON.stringify({ ...stored, watermark }));
      toast.success("Watermark updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save watermark");
    } finally {
      setSavingWatermark(false);
    }
  };

  const tabs = [
    { id: "security", icon: "fa-shield-alt", label: "Security" },
    { id: "notifications", icon: "fa-bell", label: "Notifications" },
    { id: "branding", icon: "fa-stamp", label: "Branding" },
  ];

  return (
    <PhotographerLayout>
      <div className="mb-4">
        <h2 className="fw-bold mb-1">
          <i className="fas fa-cog me-2" style={{ color: "#6BBDD0" }}></i>
          Settings
        </h2>
        <p className="text-white-50 small mb-0">Manage your account security and preferences</p>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className="btn rounded-pill px-4"
            style={activeTab === t.id
              ? { background: "rgba(107,189,208,0.2)", color: "#6BBDD0", border: "1px solid rgba(107,189,208,0.4)" }
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
            <div className="rounded-4 p-4" style={glassStyle}>
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
                <button type="submit" className="btn rounded-pill px-4 fw-bold"
                  style={{ background: "rgba(107,189,208,0.2)", color: "#6BBDD0", border: "1px solid rgba(107,189,208,0.4)" }}
                  disabled={saving}>
                  {saving ? <><span className="spinner-border spinner-border-sm me-2"></span>Changing...</> : <><i className="fas fa-lock me-2"></i>Change Password</>}
                </button>
              </form>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="rounded-4 p-4 h-100" style={glassStyle}>
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
                <span className="badge rounded-pill px-3" style={{ background: "rgba(107,189,208,0.15)", color: "#6BBDD0" }}>
                  Photographer
                </span>
              </div>
              <hr style={{ borderColor: "rgba(255,255,255,0.1)" }} />
              <Link to="/photographer/profile" className="btn btn-sm rounded-pill px-4 w-100"
                style={{ background: "rgba(255,193,7,0.1)", color: "#ffc107", border: "1px solid rgba(255,193,7,0.3)" }}>
                <i className="fas fa-user-edit me-2"></i>Edit Full Profile
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="rounded-4 p-4" style={{ ...glassStyle, maxWidth: 600 }}>
          <h6 className="text-white-50 mb-4 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.1em" }}>Email & In-App Notifications</h6>

          {[
            { key: "newSale", label: "New sale", desc: "When someone purchases your media" },
            { key: "newFollower", label: "New follower", desc: "When someone follows your profile" },
            { key: "withdrawalUpdate", label: "Withdrawal updates", desc: "Status changes on withdrawal requests" },
            { key: "systemAnnouncements", label: "System announcements", desc: "Platform updates and announcements" },
            { key: "shareActivity", label: "Share link activity", desc: "When someone accesses your share links" },
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
            <button className="btn rounded-pill px-4 fw-bold"
              style={{ background: "#ffc107", color: "#000" }}
              onClick={handleSaveNotifs}>
              <i className="fas fa-save me-2"></i>Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* Branding Tab */}
      {activeTab === "branding" && (
        <div className="rounded-4 p-4" style={{ ...glassStyle, maxWidth: 600 }}>
          <h6 className="text-white-50 mb-1 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.1em" }}>Watermark Text</h6>
          <p className="text-white-50 small mb-4">This text appears on your protected media previews</p>
          <div className="mb-3">
            <input className="form-control rounded-3" style={inputStyle}
              value={watermark}
              onChange={e => setWatermark(e.target.value)}
              placeholder="e.g. © John Doe Photography" />
          </div>
          {watermark && (
            <div className="mb-4 rounded-3 d-flex align-items-center justify-content-center"
              style={{ height: 100, background: "rgba(0,0,0,0.4)", border: "1px dashed rgba(255,255,255,0.2)", fontSize: "1.4rem", color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: "0.05em" }}>
              {watermark}
            </div>
          )}
          <button className="btn rounded-pill px-4 fw-bold"
            style={{ background: "#ffc107", color: "#000" }}
            onClick={handleSaveWatermark} disabled={savingWatermark}>
            {savingWatermark ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</> : <><i className="fas fa-save me-2"></i>Save Watermark</>}
          </button>
        </div>
      )}
    </PhotographerLayout>
  );
};

export default PhotographerSettings;
