import React, { useState } from "react";
import AdminLayout from "./AdminLayout";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: "PhotoMarket",
    siteUrl: "http://localhost:4000",
    adminEmail: "admin@photmarket.com",
    platformFee: "30",
    minPayout: "1000",
    maxUploadSize: "10",
    allowedFormats: ["jpg", "png", "mp4"],
    requireApproval: true,
    autoPublish: false,
  });

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  return (
    <AdminLayout>
      <h4 className="fw-bold mb-4">
        <i className="fas fa-cog me-2 text-warning"></i>
        Settings
      </h4>

      <div className="row">
        <div className="col-md-6">
          <div className="card bg-dark border-secondary mb-4">
            <div className="card-header bg-transparent border-secondary">
              <h6 className="mb-0 text-warning">General Settings</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label text-white-50">Site Name</label>
                <input
                  type="text"
                  className="form-control bg-dark border-secondary text-white"
                  value={settings.siteName}
                  onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-white-50">Site URL</label>
                <input
                  type="text"
                  className="form-control bg-dark border-secondary text-white"
                  value={settings.siteUrl}
                  onChange={(e) => setSettings({...settings, siteUrl: e.target.value})}
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-white-50">Admin Email</label>
                <input
                  type="email"
                  className="form-control bg-dark border-secondary text-white"
                  value={settings.adminEmail}
                  onChange={(e) => setSettings({...settings, adminEmail: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card bg-dark border-secondary mb-4">
            <div className="card-header bg-transparent border-secondary">
              <h6 className="mb-0 text-warning">Payment Settings</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label text-white-50">Platform Fee (%)</label>
                <input
                  type="number"
                  className="form-control bg-dark border-secondary text-white"
                  value={settings.platformFee}
                  onChange={(e) => setSettings({...settings, platformFee: e.target.value})}
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-white-50">Minimum Payout (KES)</label>
                <input
                  type="number"
                  className="form-control bg-dark border-secondary text-white"
                  value={settings.minPayout}
                  onChange={(e) => setSettings({...settings, minPayout: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card bg-dark border-secondary mb-4">
            <div className="card-header bg-transparent border-secondary">
              <h6 className="mb-0 text-warning">Upload Settings</h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-white-50">Max Upload Size (MB)</label>
                    <input
                      type="number"
                      className="form-control bg-dark border-secondary text-white"
                      value={settings.maxUploadSize}
                      onChange={(e) => setSettings({...settings, maxUploadSize: e.target.value})}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-white-50">Allowed Formats</label>
                    <input
                      type="text"
                      className="form-control bg-dark border-secondary text-white"
                      value={settings.allowedFormats.join(", ")}
                      onChange={(e) => setSettings({...settings, allowedFormats: e.target.value.split(", ")})}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 text-end">
          <button className="btn btn-warning px-5" onClick={handleSave}>
            <i className="fas fa-save me-2"></i>
            Save Settings
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;