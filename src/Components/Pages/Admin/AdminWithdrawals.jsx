import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import PageHeader from "../../PageHeader";
import { API_ENDPOINTS } from "../../../api/apiConfig";
import { toast } from "../../../utils/toast";
import { showConfirm } from "../../../utils/confirm";

const STATUS_COLORS = {
  pending: { bg: "rgba(245,166,35,0.15)", color: "var(--mc-accent-gold)", border: "rgba(245,166,35,0.3)" },
  processing: { bg: "rgba(91,127,229,0.15)", color: "var(--mc-accent)", border: "rgba(91,127,229,0.3)" },
  completed: { bg: "rgba(76,201,166,0.15)", color: "var(--mc-accent-teal)", border: "rgba(76,201,166,0.3)" },
  failed: { bg: "rgba(240,107,141,0.15)", color: "var(--mc-accent-pink)", border: "rgba(240,107,141,0.3)" },
};

const AdminWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [processing, setProcessing] = useState(null);
  const [notesMap, setNotesMap] = useState({});

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINTS.ADMIN.GET_WITHDRAWALS, { headers });
      setWithdrawals(res.data || []);
    } catch (err) {
      toast.error("Failed to load withdrawals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProcess = async (withdrawal, status) => {
    const label = status === "completed" ? "Approve" : status === "failed" ? "Reject" : "Mark Processing";
    const ok = await showConfirm(
      `${label} withdrawal of KES ${withdrawal.amount?.toLocaleString()} for ${withdrawal.photographer?.username}?`,
      { title: `${label} Withdrawal`, confirmText: label, danger: status === "failed" }
    );
    if (!ok) return;
    setProcessing(withdrawal._id);
    try {
      await axios.put(API_ENDPOINTS.ADMIN.PROCESS_WITHDRAWAL(withdrawal._id), {
        status,
        notes: notesMap[withdrawal._id] || "",
      }, { headers });
      toast.success(`Withdrawal ${status}`);
      fetchWithdrawals();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to process withdrawal");
    } finally {
      setProcessing(null);
    }
  };

  const filtered = filter === "all" ? withdrawals : withdrawals.filter(w => w.status === filter);

  const stats = {
    total: withdrawals.length,
    pending: withdrawals.filter(w => w.status === "pending").length,
    processing: withdrawals.filter(w => w.status === "processing").length,
    completed: withdrawals.filter(w => w.status === "completed").length,
    failed: withdrawals.filter(w => w.status === "failed").length,
    totalAmount: withdrawals.filter(w => w.status === "pending").reduce((s, w) => s + (w.amount || 0), 0),
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Withdrawal Requests"
        subtitle="Process photographer payouts"
        actions={
          <button className="mc-btn mc-btn-ghost" onClick={fetchWithdrawals}>
            <i className="fas fa-sync-alt me-1"></i>Refresh
          </button>
        }
      />
      <div className="mc-page">
        {/* Stats */}
        <div className="mc-stats-row-sm" style={{ marginBottom: "1.25rem" }}>
          <div className="mc-stat-card">
            <div className="mc-stat-label">PENDING</div>
            <div className="mc-stat-value" style={{ color: "var(--mc-accent-gold)" }}>{stats.pending}</div>
          </div>
          <div className="mc-stat-card">
            <div className="mc-stat-label">PROCESSING</div>
            <div className="mc-stat-value" style={{ color: "var(--mc-accent)" }}>{stats.processing}</div>
          </div>
          <div className="mc-stat-card">
            <div className="mc-stat-label">COMPLETED</div>
            <div className="mc-stat-value" style={{ color: "var(--mc-accent-teal)" }}>{stats.completed}</div>
          </div>
          <div className="mc-stat-card">
            <div className="mc-stat-label">FAILED</div>
            <div className="mc-stat-value" style={{ color: "var(--mc-accent-pink)" }}>{stats.failed}</div>
          </div>
        </div>

        {/* Filter */}
        <div className="mc-card mb-3" style={{ padding: "0.75rem 1rem" }}>
          <div className="d-flex gap-2 flex-wrap">
            {["all", "pending", "processing", "completed", "failed"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`mc-btn ${filter === f ? "mc-btn-primary" : "mc-btn-ghost"} btn-sm`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f !== "all" && <span className="ms-1 badge rounded-pill" style={{ background: "rgba(0,0,0,0.2)", color: "inherit" }}>{withdrawals.filter(w => w.status === f).length}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <div className="spinner-border" style={{ color: "var(--mc-accent)" }}></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mc-empty">
            <i className="fas fa-money-check-alt"></i>
            <p>No {filter !== "all" ? filter : ""} withdrawal requests</p>
          </div>
        ) : (
          <div className="mc-table-card">
            <div className="table-responsive">
              <table className="table table-borderless mb-0">
                <thead>
                  <tr>
                    <th className="ps-4 py-3">Photographer</th>
                    <th className="py-3">Amount</th>
                    <th className="py-3">Method</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Requested</th>
                    <th className="py-3">Notes</th>
                    <th className="pe-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((w) => {
                    const sc = STATUS_COLORS[w.status] || STATUS_COLORS.pending;
                    const isProcessing = processing === w._id;
                    return (
                      <tr key={w._id}>
                        <td className="ps-4">
                          <div className="fw-bold">{w.photographer?.username || "Unknown"}</div>
                          <small className="text-muted">{w.photographer?.email}</small>
                          {w.phoneNumber && <div><small className="text-muted">{w.phoneNumber}</small></div>}
                        </td>
                        <td>
                          <span className="fw-bold" style={{ color: "var(--mc-accent-gold)", fontSize: "1.05rem" }}>
                            KES {w.amount?.toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <span className="badge rounded-pill px-3 py-2" style={{ background: "rgba(91,127,229,0.15)", color: "var(--mc-accent)" }}>
                            <i className={`fas fa-${w.method === "mpesa" ? "mobile-alt" : "university"} me-1`}></i>
                            {w.method?.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className="badge rounded-pill px-3 py-2" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                            {w.status}
                          </span>
                        </td>
                        <td>
                          <small className="text-muted">
                            {w.createdAt ? new Date(w.createdAt).toLocaleDateString() : "N/A"}
                          </small>
                        </td>
                        <td style={{ minWidth: 160 }}>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Add notes..."
                            value={notesMap[w._id] || w.notes || ""}
                            onChange={e => setNotesMap(prev => ({ ...prev, [w._id]: e.target.value }))}
                          />
                        </td>
                        <td className="pe-4">
                          {w.status === "pending" || w.status === "processing" ? (
                            <div className="d-flex gap-1">
                              {w.status === "pending" && (
                                <button className="mc-btn mc-btn-ghost btn-sm px-2"
                                  onClick={() => handleProcess(w, "processing")} disabled={isProcessing}
                                  title="Mark Processing">
                                  <i className="fas fa-spinner"></i>
                                </button>
                              )}
                              <button className="mc-btn mc-btn-primary btn-sm px-2"
                                onClick={() => handleProcess(w, "completed")} disabled={isProcessing}
                                title="Approve">
                                {isProcessing ? <span className="spinner-border spinner-border-sm"></span> : <i className="fas fa-check"></i>}
                              </button>
                              <button className="mc-btn mc-btn-danger btn-sm px-2"
                                onClick={() => handleProcess(w, "failed")} disabled={isProcessing}
                                title="Reject">
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          ) : (
                            <small className="text-muted">
                              {w.processedAt ? new Date(w.processedAt).toLocaleDateString() : "—"}
                            </small>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminWithdrawals;
