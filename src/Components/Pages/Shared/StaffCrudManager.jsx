import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import PageHeader from "../../PageHeader";
import { API_ENDPOINTS } from "../../../api/apiConfig";
import { getAuthHeaders } from "../../../utils/auth";
import { toast } from "../../../utils/toast";

function buildInitialState(fields) {
  return Object.fromEntries(fields.map((field) => [field.key, field.defaultValue ?? ""]));
}

function normalizeValue(field, value) {
  if (field.type === "number") return value === "" ? 0 : Number(value);
  if (field.type === "checkbox") return Boolean(value);
  if (field.type === "date") return value || null;
  return value;
}

function FieldInput({ field, value, onChange }) {
  if (field.type === "textarea") {
    return (
      <textarea
        className="form-control bg-dark text-white border-secondary"
        rows={field.rows || 3}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder || ""}
      />
    );
  }

  if (field.type === "select") {
    return (
      <select
        className="form-select bg-dark text-white border-secondary"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      >
        {(field.options || []).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "checkbox") {
    return (
      <div className="form-check form-switch">
        <input
          className="form-check-input"
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
        <label className="form-check-label">{field.checkboxLabel || field.label}</label>
      </div>
    );
  }

  return (
    <input
      className="form-control bg-dark text-white border-secondary"
      type={field.type || "text"}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder || ""}
    />
  );
}

export default function StaffCrudManager({
  Layout,
  accent = "#6BBDD0",
  title,
  subtitle,
  group,
  resource,
  fields,
  columns,
  searchPlaceholder,
  resourceLabel,
}) {
  const initialState = useMemo(() => buildInitialState(fields), [fields]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialState);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINTS.STAFF_OPS.LIST(group, resource), {
        headers: getAuthHeaders(),
        params: search ? { search } : {},
      });
      setItems(res.data?.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to load ${resourceLabel}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [search]);

  useEffect(() => {
    setForm(initialState);
  }, [initialState]);

  const openCreate = () => {
    setEditing(null);
    setForm(initialState);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    const next = { ...initialState };
    fields.forEach((field) => {
      if (field.type === "date") {
        next[field.key] = item[field.key] ? new Date(item[field.key]).toISOString().slice(0, 10) : "";
      } else {
        next[field.key] = item[field.key] ?? field.defaultValue ?? "";
      }
    });
    setForm(next);
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = Object.fromEntries(fields.map((field) => [field.key, normalizeValue(field, form[field.key])]));
      if (editing?._id) {
        await axios.patch(API_ENDPOINTS.STAFF_OPS.UPDATE(group, resource, editing._id), payload, { headers: getAuthHeaders() });
        toast.success(`${resourceLabel} updated`);
      } else {
        await axios.post(API_ENDPOINTS.STAFF_OPS.CREATE(group, resource), payload, { headers: getAuthHeaders() });
        toast.success(`${resourceLabel} created`);
      }
      setModalOpen(false);
      setEditing(null);
      setForm(initialState);
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to save ${resourceLabel}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const ok = window.confirm(`Delete "${item.title || item.name}"? This cannot be undone.`);
    if (!ok) return;
    try {
      await axios.delete(API_ENDPOINTS.STAFF_OPS.DELETE(group, resource, item._id), { headers: getAuthHeaders() });
      toast.success(`${resourceLabel} deleted`);
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to delete ${resourceLabel}`);
    }
  };

  return (
    <Layout>
      <div className="mc-page">
        <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-3">
          <div>
            <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--mc-text)" }}>{title}</div>
            <PageHeader subtitle={subtitle} />
          </div>
          <button className="btn" style={{ background: accent, color: "#08121f", fontWeight: 700 }} onClick={openCreate}>
            <i className="fas fa-plus me-2"></i>Create {resourceLabel}
          </button>
        </div>

        <div className="mc-card mb-3">
          <div className="row g-2 align-items-center">
            <div className="col-md-8">
              <input
                className="form-control bg-dark text-white border-secondary"
                placeholder={searchPlaceholder || `Search ${resourceLabel.toLowerCase()}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-4 text-md-end">
              <button className="btn btn-outline-secondary" onClick={fetchItems}>
                <i className="fas fa-rotate-right me-2"></i>Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="mc-card">
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border" style={{ color: accent }}></div></div>
          ) : items.length === 0 ? (
            <div className="mc-empty py-5">
              <i className="fas fa-inbox fa-2x mb-2"></i>
              <p>No {resourceLabel.toLowerCase()} yet.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-dark table-hover mb-0">
                <thead>
                  <tr>
                    {columns.map((column) => (
                      <th key={column.key}>{column.label}</th>
                    ))}
                    <th className="pe-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item._id}>
                      {columns.map((column) => (
                        <td key={column.key}>{column.render ? column.render(item) : item[column.key]}</td>
                      ))}
                      <td className="pe-3">
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-outline-info" onClick={() => openEdit(item)}>
                            <i className="fas fa-pen"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item)}>
                            <i className="fas fa-trash"></i>
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

        {modalOpen && (
          <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.8)" }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content bg-dark border-secondary">
                <div className="modal-header border-secondary">
                  <h5 className="modal-title text-white">{editing ? `Edit ${resourceLabel}` : `Create ${resourceLabel}`}</h5>
                  <button className="btn-close btn-close-white" onClick={() => setModalOpen(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    {fields.map((field) => (
                      <div key={field.key} className={field.colClass || "col-12"}>
                        <label className="form-label text-white-50 small">{field.label}</label>
                        <FieldInput
                          field={field}
                          value={form[field.key]}
                          onChange={(value) => setForm((prev) => ({ ...prev, [field.key]: value }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="modal-footer border-secondary">
                  <button className="btn btn-outline-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                  <button className="btn" style={{ background: accent, color: "#08121f", fontWeight: 700 }} onClick={handleSave} disabled={saving}>
                    {saving ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="fas fa-save me-2"></i>}
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
