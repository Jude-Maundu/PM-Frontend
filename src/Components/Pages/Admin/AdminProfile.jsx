import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
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

const AdminProfile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [profile, setProfile] = useState({
    username: "",
    email: "",
    bio: "",
    location: "",
    phoneNumber: "",
    profilePicture: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPass, setShowPass] = useState(false);

  const stored = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = stored.id || stored._id;
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(API_ENDPOINTS.AUTH.GET_USER(userId), { headers });
        const u = res.data;
        setProfile({
          username: u.username || "",
          email: u.email || "",
          bio: u.bio || "",
          location: u.location || "",
          phoneNumber: u.phoneNumber || "",
          profilePicture: u.profilePicture || "",
        });
      } catch {
        setProfile({
          username: stored.username || "",
          email: stored.email || "",
          bio: stored.bio || "",
          location: stored.location || "",
          phoneNumber: stored.phoneNumber || "",
          profilePicture: stored.profilePicture || "",
        });
      } finally {
        setLoading(false);
      }
    };
    if (userId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProfilePicture = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setProfile(prev => ({ ...prev, profilePicture: reader.result }));
      setUploading(false);
    };
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profile.username.trim()) { toast.error("Username is required"); return; }
    setSaving(true);
    try {
      const res = await axios.put(API_ENDPOINTS.AUTH.UPDATE_USER(userId), {
        username: profile.username,
        email: profile.email,
        bio: profile.bio,
        location: profile.location,
        phoneNumber: profile.phoneNumber,
        profilePicture: profile.profilePicture,
      }, { headers });
      localStorage.setItem("user", JSON.stringify({ ...stored, ...res.data }));
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

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

  const tabs = [
    { id: "profile", icon: "fa-user", label: "Profile" },
    { id: "security", icon: "fa-shield-alt", label: "Security" },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: "#6BBDD0" }}></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="position-relative" style={{ zIndex: 1 }}>
        <div className="mb-4">
          <h2 className="fw-bold mb-1">
            <i className="fas fa-user-circle me-2 text-warning"></i>
            My Profile
          </h2>
          <p className="text-white-50 small mb-0">Manage your personal information and account security</p>
        </div>

        {/* Profile header card */}
        <div className="rounded-4 p-4 mb-4 d-flex align-items-center gap-4" style={glassStyle}>
          <div className="position-relative">
            {profile.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt="Avatar"
                className="rounded-circle"
                style={{ width: 90, height: 90, objectFit: "cover", border: "3px solid rgba(107,189,208,0.4)" }}
                onError={e => { e.target.style.display = "none"; }}
              />
            ) : (
              <div className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 90, height: 90, background: "rgba(107,189,208,0.15)", border: "3px solid rgba(107,189,208,0.4)" }}>
                <i className="fas fa-user-shield fa-2x" style={{ color: "#6BBDD0" }}></i>
              </div>
            )}
            <label htmlFor="admin-pic-upload" className="position-absolute bottom-0 end-0 rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: 30, height: 30, background: "#ffc107", cursor: "pointer", border: "2px solid #0d1f33" }}>
              {uploading
                ? <span className="spinner-border spinner-border-sm text-dark"></span>
                : <i className="fas fa-camera text-dark" style={{ fontSize: 12 }}></i>
              }
              <input id="admin-pic-upload" type="file" accept="image/*" style={{ display: "none" }}
                onChange={handleProfilePicture} disabled={uploading} />
            </label>
          </div>
          <div>
            <h5 className="fw-bold mb-0 text-white">{profile.username || "Admin"}</h5>
            <small className="text-white-50">{profile.email}</small>
            <div className="mt-1">
              <span className="badge rounded-pill px-3 py-1" style={{ background: "rgba(255,193,7,0.2)", color: "#ffc107", border: "1px solid rgba(255,193,7,0.4)" }}>
                <i className="fas fa-crown me-1"></i>Administrator
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="d-flex gap-2 mb-4">
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

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="rounded-4 p-4" style={glassStyle}>
            <h6 className="text-white-50 mb-4 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.1em" }}>Personal Information</h6>
            <form onSubmit={handleSaveProfile}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label text-white-50 small">Username *</label>
                  <input className="form-control rounded-3" style={inputStyle}
                    value={profile.username}
                    onChange={e => setProfile(p => ({ ...p, username: e.target.value }))}
                    placeholder="Your username" required />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-white-50 small">Email Address</label>
                  <input className="form-control rounded-3" style={{ ...inputStyle, opacity: 0.6 }}
                    value={profile.email} disabled />
                  <small className="text-white-50" style={{ fontSize: "0.7rem" }}>Email cannot be changed</small>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-white-50 small">Phone Number</label>
                  <input className="form-control rounded-3" style={inputStyle}
                    value={profile.phoneNumber}
                    onChange={e => setProfile(p => ({ ...p, phoneNumber: e.target.value }))}
                    placeholder="0712345678" />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-white-50 small">Location</label>
                  <input className="form-control rounded-3" style={inputStyle}
                    value={profile.location}
                    onChange={e => setProfile(p => ({ ...p, location: e.target.value }))}
                    placeholder="City, Country" />
                </div>
                <div className="col-12">
                  <label className="form-label text-white-50 small">Bio</label>
                  <textarea className="form-control rounded-3" style={inputStyle} rows={3}
                    value={profile.bio}
                    onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."></textarea>
                </div>
                <div className="col-12">
                  <button type="submit" className="btn rounded-pill px-5 fw-bold"
                    style={{ background: "#ffc107", color: "#000" }} disabled={saving}>
                    {saving ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</> : <><i className="fas fa-save me-2"></i>Save Changes</>}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="rounded-4 p-4" style={glassStyle}>
            <h6 className="text-white-50 mb-4 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.1em" }}>Change Password</h6>
            <form onSubmit={handleChangePassword}>
              <div className="row g-3" style={{ maxWidth: 500 }}>
                <div className="col-12">
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
                <div className="col-12">
                  <label className="form-label text-white-50 small">New Password</label>
                  <input type={showPass ? "text" : "password"} className="form-control rounded-3" style={inputStyle}
                    value={passwords.newPassword}
                    onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                    placeholder="At least 6 characters" required />
                </div>
                <div className="col-12">
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
                <div className="col-12">
                  <button type="submit" className="btn rounded-pill px-5 fw-bold"
                    style={{ background: "rgba(107,189,208,0.2)", color: "#6BBDD0", border: "1px solid rgba(107,189,208,0.4)" }}
                    disabled={saving}>
                    {saving ? <><span className="spinner-border spinner-border-sm me-2"></span>Changing...</> : <><i className="fas fa-lock me-2"></i>Change Password</>}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;
