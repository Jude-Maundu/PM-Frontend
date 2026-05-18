import React, { useState, useEffect, useMemo, useCallback } from "react";
import AdminLayout from "./AdminLayout";
import axios from "axios";
import { API_ENDPOINTS } from "../../../api/apiConfig";
import { toast } from "../../../utils/toast";
import { showConfirm } from "../../../utils/confirm";
import PageHeader from "../../PageHeader";

const SETTINGS_API_AVAILABLE = true; // Backend implements /admin/settings routes (check backend docs or README)

const inputStyle = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(107,189,208,0.3)",
  color: "#fff",
};

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [settings, setSettings] = useState({
    siteName: "PhotoMarket",
    siteUrl: "https://pm-frontend-1-u2y3.onrender.com",
    adminEmail: "",
    platformFee: 30,
    minPayout: 1000,
    maxUploadSize: 10,
    allowedFormats: ["jpg", "jpeg", "png", "gif", "mp4", "webm"],
    requireApproval: true,
    autoPublish: false,
    enableMpesa: true,
    enableWallet: true,
    maintenanceMode: false,
    registrationOpen: true,
    emailVerification: false,
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPass: "",
    razorpayKey: "",
    stripeKey: "",
  });

  const [activeTab, setActiveTab] = useState("general");

  const token = localStorage.getItem("token");
  const headers = useMemo(() => ({ Authorization: token ? `Bearer ${token}` : "" }), [token]);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(API_ENDPOINTS.ADMIN.SETTINGS, { headers });
      if (response?.data) {
        setSettings((prev) => ({ ...prev, ...response.data }));
      }
    } catch (err) {
      console.warn("Unable to load admin settings:", err);
      setError("Could not load settings. Please ensure the backend supports /admin/settings.");
    } finally {
      setLoading(false);
    }
  }, [headers]);

  // Save settings
  const handleSave = async () => {
    if (!SETTINGS_API_AVAILABLE) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await axios.put(API_ENDPOINTS.ADMIN.UPDATE_SETTINGS, settings, { headers });

      setSuccess("Settings saved successfully!");

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
      setError(err.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Update platform fee
  const handleUpdatePlatformFee = async () => {
    if (!SETTINGS_API_AVAILABLE) {
      return;
    }

    try {
      setSaving(true);
      await axios.put(API_ENDPOINTS.ADMIN.PLATFORM_FEE, {
        fee: settings.platformFee
      }, { headers });

      setSuccess("Platform fee updated!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to update platform fee");
    } finally {
      setSaving(false);
    }
  };

  // Update payout settings
  const handleUpdatePayoutSettings = async () => {
    if (!SETTINGS_API_AVAILABLE) {
      return;
    }

    try {
      setSaving(true);
      await axios.put(API_ENDPOINTS.ADMIN.PAYOUT, {
        minPayout: settings.minPayout
      }, { headers });

      setSuccess("Payout settings updated!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to update payout settings");
    } finally {
      setSaving(false);
    }
  };

  // Test email configuration
  const handleTestEmail = async () => {
    if (!SETTINGS_API_AVAILABLE) {
      return;
    }

    try {
      setSaving(true);
      await axios.post(API_ENDPOINTS.ADMIN.TEST_EMAIL, {
        to: settings.adminEmail,
        smtpHost: settings.smtpHost,
        smtpPort: settings.smtpPort,
        smtpUser: settings.smtpUser,
        smtpPass: settings.smtpPass
      }, { headers });

      toast.success("Test email sent successfully!");
    } catch (err) {
      toast.error("Failed to send test email");
    } finally {
      setSaving(false);
    }
  };

  // Clear cache
  const handleClearCache = async () => {
    if (!SETTINGS_API_AVAILABLE) {
      return;
    }

    const ok = await showConfirm("Are you sure you want to clear the cache?", { title: "Clear Cache", confirmText: "Clear" });
    if (!ok) return;

    try {
      await axios.post(API_ENDPOINTS.ADMIN.CLEAR_CACHE, {}, { headers });
      toast.success("Cache cleared successfully!");
    } catch (err) {
      toast.error("Failed to clear cache");
    }
  };

  // Toggle maintenance mode
  const handleToggleMaintenance = async () => {
    if (!SETTINGS_API_AVAILABLE) {
      return;
    }

    try {
      const newMode = !settings.maintenanceMode;
      await axios.post(API_ENDPOINTS.ADMIN.MAINTENANCE_MODE, {
        enabled: newMode
      }, { headers });

      setSettings({ ...settings, maintenanceMode: newMode });
      setSuccess(`Maintenance mode ${newMode ? 'enabled' : 'disabled'}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to toggle maintenance mode");
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: "#6BBDD0" }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mc-page">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <PageHeader title="Platform Settings" subtitle="Configure global platform behavior" />
          <div className="d-flex gap-2 mt-1">
            <button
              className="btn mc-btn mc-btn-ghost rounded-pill px-4"
              onClick={handleClearCache}
              disabled={!SETTINGS_API_AVAILABLE}
            >
              <i className="fas fa-broom me-2"></i>
              Clear Cache
            </button>
            <button
              className="btn mc-btn mc-btn-primary rounded-pill px-4"
              onClick={handleSave}
              disabled={saving || !SETTINGS_API_AVAILABLE}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>
                  Save All
                </>
              )}
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
            <button type="button" className="btn-close" onClick={() => setError(null)}></button>
          </div>
        )}

        {success && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <i className="fas fa-check-circle me-2"></i>
            {success}
            <button type="button" className="btn-close" onClick={() => setSuccess(null)}></button>
          </div>
        )}

        {!SETTINGS_API_AVAILABLE && (
          <div className="alert alert-info" role="alert">
            <i className="fas fa-info-circle me-2"></i>
            Settings management endpoints are not available on the backend, so changes can't be saved.
          </div>
        )}

        {/* Tabs */}
        <div className="d-flex gap-2 mb-4 flex-wrap">
          {[
            { key: "general", icon: "fa-globe", label: "General" },
            { key: "payment", icon: "fa-credit-card", label: "Payment" },
            { key: "upload", icon: "fa-upload", label: "Upload" },
            { key: "email", icon: "fa-envelope", label: "Email" },
            { key: "security", icon: "fa-shield-alt", label: "Security" },
          ].map(tab => (
            <button
              key={tab.key}
              className="btn rounded-pill px-4"
              onClick={() => setActiveTab(tab.key)}
              style={activeTab === tab.key
                ? { background: "rgba(107,189,208,0.2)", color: "#6BBDD0", border: "1px solid rgba(107,189,208,0.4)" }
                : { background: "transparent", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }
              }
            >
              <i className={`fas ${tab.icon} me-2`}></i>{tab.label}
            </button>
          ))}
        </div>

        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <div className="row g-4">
            <div className="col-md-6">
              <div className="mc-card">
                <h6 className="text-white-50 mb-4 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.1em" }}>Site Information</h6>
                <div className="mb-3">
                  <label className="form-label text-white-50 small">Site Name</label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    style={inputStyle}
                    value={settings.siteName}
                    onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label text-white-50 small">Site URL</label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    style={inputStyle}
                    value={settings.siteUrl}
                    onChange={(e) => setSettings({...settings, siteUrl: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label text-white-50 small">Admin Email</label>
                  <input
                    type="email"
                    className="form-control rounded-3"
                    style={inputStyle}
                    value={settings.adminEmail}
                    onChange={(e) => setSettings({...settings, adminEmail: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="mc-card">
                <h6 className="text-white-50 mb-4 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.1em" }}>System Status</h6>
                <div className="mb-3">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="maintenanceMode"
                      checked={settings.maintenanceMode}
                      onChange={handleToggleMaintenance}
                    />
                    <label className="form-check-label text-white-50" htmlFor="maintenanceMode">
                      Maintenance Mode
                    </label>
                    <small className="d-block text-white-50 mt-1">
                      When enabled, only admins can access the site
                    </small>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="registrationOpen"
                      checked={settings.registrationOpen}
                      onChange={(e) => setSettings({...settings, registrationOpen: e.target.checked})}
                    />
                    <label className="form-check-label text-white-50" htmlFor="registrationOpen">
                      Allow New Registrations
                    </label>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="emailVerification"
                      checked={settings.emailVerification}
                      onChange={(e) => setSettings({...settings, emailVerification: e.target.checked})}
                    />
                    <label className="form-check-label text-white-50" htmlFor="emailVerification">
                      Require Email Verification
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Settings Tab */}
        {activeTab === 'payment' && (
          <div className="row g-4">
            <div className="col-md-6">
              <div className="mc-card">
                <h6 className="text-white-50 mb-4 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.1em" }}>Platform Fees</h6>
                <div className="mb-3">
                  <label className="form-label text-white-50 small">Platform Fee (%)</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control rounded-3"
                      style={inputStyle}
                      value={settings.platformFee}
                      onChange={(e) => setSettings({...settings, platformFee: e.target.value})}
                      min="0"
                      max="100"
                    />
                    <button
                      className="btn mc-btn mc-btn-ghost"
                      onClick={handleUpdatePlatformFee}
                      disabled={saving || !SETTINGS_API_AVAILABLE}
                    >
                      Update
                    </button>
                  </div>
                  <small className="text-white-50">Percentage taken from each sale</small>
                </div>
                <div className="mb-3">
                  <label className="form-label text-white-50 small">Minimum Payout (KES)</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control rounded-3"
                      style={inputStyle}
                      value={settings.minPayout}
                      onChange={(e) => setSettings({...settings, minPayout: e.target.value})}
                      min="100"
                    />
                    <button
                      className="btn mc-btn mc-btn-ghost"
                      onClick={handleUpdatePayoutSettings}
                      disabled={saving || !SETTINGS_API_AVAILABLE}
                    >
                      Update
                    </button>
                  </div>
                  <small className="text-white-50">Minimum amount photographers can withdraw</small>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="mc-card mb-4">
                <h6 className="text-white-50 mb-4 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.1em" }}>Payment Methods</h6>
                <div className="mb-3">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="enableMpesa"
                      checked={settings.enableMpesa}
                      onChange={(e) => setSettings({...settings, enableMpesa: e.target.checked})}
                    />
                    <label className="form-check-label text-white-50" htmlFor="enableMpesa">
                      Enable M-Pesa Payments
                    </label>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="enableWallet"
                      checked={settings.enableWallet}
                      onChange={(e) => setSettings({...settings, enableWallet: e.target.checked})}
                    />
                    <label className="form-check-label text-white-50" htmlFor="enableWallet">
                      Enable Wallet System
                    </label>
                  </div>
                </div>
              </div>

              <div className="mc-card">
                <h6 className="text-white-50 mb-4 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.1em" }}>Payment Gateway Keys</h6>
                <div className="mb-3">
                  <label className="form-label text-white-50 small">Razorpay Key</label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    style={inputStyle}
                    value={settings.razorpayKey}
                    onChange={(e) => setSettings({...settings, razorpayKey: e.target.value})}
                    placeholder="rzp_test_..."
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label text-white-50 small">Stripe Public Key</label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    style={inputStyle}
                    value={settings.stripeKey}
                    onChange={(e) => setSettings({...settings, stripeKey: e.target.value})}
                    placeholder="pk_test_..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Settings Tab */}
        {activeTab === 'upload' && (
          <div className="row g-4">
            <div className="col-md-6">
              <div className="mc-card">
                <h6 className="text-white-50 mb-4 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.1em" }}>Upload Limits</h6>
                <div className="mb-3">
                  <label className="form-label text-white-50 small">Max Upload Size (MB)</label>
                  <input
                    type="number"
                    className="form-control rounded-3"
                    style={inputStyle}
                    value={settings.maxUploadSize}
                    onChange={(e) => setSettings({...settings, maxUploadSize: e.target.value})}
                    min="1"
                    max="100"
                  />
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="mc-card">
                <h6 className="text-white-50 mb-4 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.1em" }}>File Formats</h6>
                <div className="mb-3">
                  <label className="form-label text-white-50 small">Allowed Formats</label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    style={inputStyle}
                    value={settings.allowedFormats.join(", ")}
                    onChange={(e) => setSettings({...settings, allowedFormats: e.target.value.split(",").map(f => f.trim())})}
                    placeholder="jpg, png, mp4"
                  />
                  <small className="text-white-50">Comma separated values</small>
                </div>
                <div className="mb-3">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="requireApproval"
                      checked={settings.requireApproval}
                      onChange={(e) => setSettings({...settings, requireApproval: e.target.checked})}
                    />
                    <label className="form-check-label text-white-50" htmlFor="requireApproval">
                      Require Admin Approval
                    </label>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="autoPublish"
                      checked={settings.autoPublish}
                      onChange={(e) => setSettings({...settings, autoPublish: e.target.checked})}
                    />
                    <label className="form-check-label text-white-50" htmlFor="autoPublish">
                      Auto-Publish Uploads
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Email Settings Tab */}
        {activeTab === 'email' && (
          <div className="row g-4">
            <div className="col-md-6">
              <div className="mc-card">
                <h6 className="text-white-50 mb-4 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.1em" }}>SMTP Configuration</h6>
                <div className="mb-3">
                  <label className="form-label text-white-50 small">SMTP Host</label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    style={inputStyle}
                    value={settings.smtpHost}
                    onChange={(e) => setSettings({...settings, smtpHost: e.target.value})}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label text-white-50 small">SMTP Port</label>
                  <input
                    type="number"
                    className="form-control rounded-3"
                    style={inputStyle}
                    value={settings.smtpPort}
                    onChange={(e) => setSettings({...settings, smtpPort: e.target.value})}
                    placeholder="587"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label text-white-50 small">SMTP Username</label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    style={inputStyle}
                    value={settings.smtpUser}
                    onChange={(e) => setSettings({...settings, smtpUser: e.target.value})}
                    placeholder="user@example.com"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label text-white-50 small">SMTP Password</label>
                  <input
                    type="password"
                    className="form-control rounded-3"
                    style={inputStyle}
                    value={settings.smtpPass}
                    onChange={(e) => setSettings({...settings, smtpPass: e.target.value})}
                    placeholder="••••••••"
                  />
                </div>
                <button
                  className="btn mc-btn mc-btn-ghost rounded-pill px-4"
                  onClick={handleTestEmail}
                  disabled={saving || !SETTINGS_API_AVAILABLE}
                >
                  <i className="fas fa-paper-plane me-2"></i>
                  Test Email
                </button>
              </div>
            </div>

            <div className="col-md-6">
              <div className="mc-card">
                <h6 className="text-white-50 mb-4 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.1em" }}>Email Templates</h6>
                <p className="text-white-50 small">Manage email templates sent to users</p>
                <div className="d-flex flex-column gap-2">
                  {["Welcome Email", "Password Reset", "Purchase Confirmation", "Withdrawal Notification"].map(template => (
                    <div key={template} className="d-flex justify-content-between align-items-center py-2"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                      <span className="text-white small">{template}</span>
                      <button className="btn btn-sm mc-btn mc-btn-ghost rounded-pill px-3">Edit</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Settings Tab */}
        {activeTab === 'security' && (
          <div className="row g-4">
            <div className="col-md-6">
              <div className="mc-card">
                <h6 className="text-white-50 mb-4 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.1em" }}>Security Options</h6>
                <div className="mb-3">
                  <label className="form-label text-white-50 small">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    className="form-control rounded-3"
                    style={inputStyle}
                    value={30}
                    min="5"
                    max="120"
                  />
                </div>
                <div className="mb-3">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="twoFactorAuth"
                      defaultChecked={false}
                    />
                    <label className="form-check-label text-white-50" htmlFor="twoFactorAuth">
                      Require Two-Factor Authentication for Admins
                    </label>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="httpsOnly"
                      defaultChecked={true}
                    />
                    <label className="form-check-label text-white-50" htmlFor="httpsOnly">
                      HTTPS Only (Force SSL)
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="mc-card">
                <h6 className="text-white-50 mb-4 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.1em" }}>API Security</h6>
                <div className="mb-3">
                  <label className="form-label text-white-50 small">API Rate Limit (requests/minute)</label>
                  <input
                    type="number"
                    className="form-control rounded-3"
                    style={inputStyle}
                    value={60}
                    min="10"
                    max="1000"
                  />
                </div>
                <button className="btn mc-btn mc-btn-danger rounded-pill px-4">
                  <i className="fas fa-key me-2"></i>
                  Rotate API Keys
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
