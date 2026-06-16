import React, { useEffect, useState } from "react";
import axios from "axios";
import EngineerLayout from "./EngineerLayout";
import PageHeader from "../../PageHeader";
import { API_BASE_URL } from "../../../api/apiConfig";
import { getAuthHeaders } from "../../../utils/auth";
import { toast } from "../../../utils/toast";

const API = API_BASE_URL;
const EDITABLE_KEYS = ["maintenance_mode", "uploads_enabled", "purchases_enabled", "registrations_enabled", "photo_approval_required", "withdrawal_approval_required", "watermark_enabled"];

export default function EngineerConfig() {
  const [configs, setConfigs] = useState([]);
  const [local, setLocal] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/admin/config`, { headers: getAuthHeaders() });
      const all = res.data?.data || [];
      const filtered = all.filter((item) => EDITABLE_KEYS.includes(item.key));
      setConfigs(filtered);
      setLocal(Object.fromEntries(filtered.map((item) => [item.key, item.value])));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load system config");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const save = async () => {
    try {
      setSaving(true);
      const payload = configs.map((item) => ({ key: item.key, value: local[item.key] }));
      await axios.put(`${API}/admin/config`, { configs: payload }, { headers: getAuthHeaders() });
      toast.success("System config updated");
      fetchConfigs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save config");
    } finally {
      setSaving(false);
    }
  };

  return (
    <EngineerLayout>
      <PageHeader title="System Controls" subtitle="Engineers can perform basic config CRUD for platform feature flags." />
      <div className="mc-page">
        <div className="mc-card">
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border" style={{ color: "#06B6D4" }}></div></div>
          ) : (
            <>
              <div className="row g-3">
                {configs.map((config) => (
                  <div key={config.key} className="col-12 col-md-6">
                    <div className="p-3 rounded" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
                      <div style={{ fontWeight: 700 }}>{config.label || config.key}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--mc-text-muted)", marginBottom: "0.75rem" }}>{config.key}</div>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={Boolean(local[config.key])}
                          onChange={(e) => setLocal((prev) => ({ ...prev, [config.key]: e.target.checked }))}
                        />
                        <label className="form-check-label">
                          {Boolean(local[config.key]) ? "Enabled" : "Disabled"}
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="d-flex justify-content-end mt-4">
                <button className="btn btn-info" onClick={save} disabled={saving}>
                  {saving ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="fas fa-save me-2"></i>}
                  Save Changes
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </EngineerLayout>
  );
}
