import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import PageHeader from "../../PageHeader";
import { API_BASE_URL } from "../../../api/apiConfig";
import { getAuthHeaders } from "../../../utils/auth";
import { toast } from "../../../utils/toast";

const API = API_BASE_URL;

const CATEGORY_LABELS = {
  feature_flags: "Feature Flags",
  commission:    "Commission",
  payment:       "Payment",
  content:       "Content",
  system:        "System",
};

const CATEGORY_ICONS = {
  feature_flags: "fa-toggle-on",
  commission:    "fa-percent",
  payment:       "fa-credit-card",
  content:       "fa-image",
  system:        "fa-cog",
};

export default function AdminConfig() {
  const [configs, setConfigs]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [local, setLocal]             = useState({});

  // Reset modal
  const [showReset, setShowReset]     = useState(false);
  const [resetPwd, setResetPwd]       = useState("");
  const [resetPhrase, setResetPhrase] = useState("");
  const [resetting, setResetting]     = useState(false);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/admin/config`, { headers: getAuthHeaders() });
      setConfigs(res.data.data || []);
      const map = {};
      (res.data.data || []).forEach(c => { map[c.key] = c.value; });
      setLocal(map);
    } catch { toast.error("Failed to load config"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchConfigs(); }, []);

  const handleChange = (key, value) => setLocal(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = configs.map(c => ({ key: c.key, value: local[c.key] ?? c.value }));
      await axios.put(`${API}/admin/config`, { configs: payload }, { headers: getAuthHeaders() });
      toast.success("Configuration saved");
      fetchConfigs();
    } catch { toast.error("Failed to save config"); }
    finally { setSaving(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      setResetting(true);
      await axios.post(`${API}/admin/system/reset`, { password: resetPwd, confirmPhrase: resetPhrase }, { headers: getAuthHeaders() });
      toast.success("System reset complete. Settings and logs cleared.");
      setShowReset(false);
      setResetPwd(""); setResetPhrase("");
      fetchConfigs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    } finally { setResetting(false); }
  };

  // Group by category
  const grouped = configs.reduce((acc, c) => {
    if (!acc[c.category]) acc[c.category] = [];
    acc[c.category].push(c);
    return acc;
  }, {});

  const renderControl = (c) => {
    const val = local[c.key] ?? c.value;
    if (typeof c.value === "boolean") {
      return (
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            checked={!!val}
            onChange={e => handleChange(c.key, e.target.checked)}
            style={{ width: "2.8em", height: "1.5em", cursor: "pointer" }}
          />
        </div>
      );
    }
    if (c.key === "payment_mode") {
      return (
        <select
          className="form-select form-select-sm bg-dark text-white border-secondary"
          style={{ maxWidth: 160 }}
          value={val}
          onChange={e => handleChange(c.key, e.target.value)}
        >
          <option value="sandbox">Sandbox (Test)</option>
          <option value="production">Production (Live)</option>
        </select>
      );
    }
    if (typeof c.value === "number") {
      return (
        <input
          type="number"
          className="form-control form-control-sm bg-dark text-white border-secondary"
          style={{ maxWidth: 120 }}
          value={val}
          min={0}
          max={c.key.includes("commission") ? 100 : undefined}
          onChange={e => handleChange(c.key, Number(e.target.value))}
        />
      );
    }
    return (
      <input
        type="text"
        className="form-control form-control-sm bg-dark text-white border-secondary"
        style={{ maxWidth: 240 }}
        value={val}
        onChange={e => handleChange(c.key, e.target.value)}
      />
    );
  };

  return (
    <AdminLayout>
      <PageHeader title="System Configuration" subtitle="Feature flags, commissions, payment mode, and system reset" />
      <div className="mc-page">

        {loading ? (
          <div className="text-center py-5"><div className="spinner-border" style={{ color: "var(--mc-accent)" }}></div></div>
        ) : (
          <>
            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat} className="mc-card mb-3">
                <div className="mc-card-header mb-3">
                  <span className="mc-card-title">
                    <i className={`fas ${CATEGORY_ICONS[cat] || "fa-cog"} me-2`}></i>
                    {CATEGORY_LABELS[cat] || cat}
                  </span>
                </div>
                {items.map(c => (
                  <div key={c.key} className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <div>
                      <div style={{ fontWeight: 500, color: "var(--mc-text)", fontSize: "0.9rem" }}>{c.label || c.key}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--mc-text-muted)" }}>{c.key}</div>
                    </div>
                    {renderControl(c)}
                  </div>
                ))}
              </div>
            ))}

            <div className="d-flex gap-3 align-items-center mt-2 mb-4">
              <button className="mc-btn mc-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</> : <><i className="fas fa-save me-2"></i>Save All Changes</>}
              </button>
            </div>
          </>
        )}

        {/* Danger Zone */}
        <div className="mc-card" style={{ border: "1px solid rgba(220,53,69,0.4)", background: "rgba(220,53,69,0.06)" }}>
          <div className="mc-card-header mb-3">
            <span className="mc-card-title" style={{ color: "#dc3545" }}>
              <i className="fas fa-skull-crossbones me-2"></i>DANGER ZONE
            </span>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <div style={{ fontWeight: 600, color: "#fff" }}>Reset System Settings & Logs</div>
              <small style={{ color: "rgba(255,255,255,0.5)" }}>
                Wipes all admin audit logs and system config. Restores defaults. Does NOT delete users, media, or financial data.
              </small>
            </div>
            <button className="btn btn-danger btn-sm" onClick={() => setShowReset(true)}>
              <i className="fas fa-trash-alt me-2"></i>Reset System
            </button>
          </div>
        </div>

        {/* Reset Confirmation Modal */}
        {showReset && (
          <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.85)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content bg-dark border-danger">
                <div className="modal-header border-danger">
                  <h5 className="modal-title text-danger"><i className="fas fa-exclamation-triangle me-2"></i>Confirm System Reset</h5>
                  <button className="btn-close btn-close-white" onClick={() => { setShowReset(false); setResetPwd(""); setResetPhrase(""); }}></button>
                </div>
                <form onSubmit={handleReset}>
                  <div className="modal-body">
                    <div className="alert alert-danger py-2">
                      <strong>This will permanently delete all audit logs and reset all system configuration.</strong> This cannot be undone.
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-white-50 small">Your admin password</label>
                      <input type="password" className="form-control bg-dark text-white border-secondary" value={resetPwd} onChange={e => setResetPwd(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-white-50 small">Type <strong className="text-danger">RESET SYSTEM</strong> to confirm</label>
                      <input type="text" className="form-control bg-dark text-white border-secondary" value={resetPhrase} onChange={e => setResetPhrase(e.target.value)} placeholder="RESET SYSTEM" required />
                    </div>
                  </div>
                  <div className="modal-footer border-danger">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowReset(false)}>Cancel</button>
                    <button type="submit" className="btn btn-danger btn-sm" disabled={resetting || resetPhrase !== "RESET SYSTEM"}>
                      {resetting ? <><span className="spinner-border spinner-border-sm me-2"></span>Resetting...</> : "Reset System"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
