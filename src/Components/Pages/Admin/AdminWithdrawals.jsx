import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import { API_ENDPOINTS } from "../../../api/apiConfig";
import { toast } from "../../../utils/toast";
import { showConfirm } from "../../../utils/confirm";

const STATUS_COLORS = {
  pending: { bg: "rgba(255,193,7,0.15)", color: "#ffc107", border: "rgba(255,193,7,0.3)" },
  processing: { bg: "rgba(107,189,208,0.15)", color: "#6BBDD0", border: "rgba(107,189,208,0.3)" },
  completed: { bg: "rgba(40,167,69,0.15)", color: "#28a745", border: "rgba(40,167,69,0.3)" },
  failed: { bg: "rgba(220,53,69,0.15)", color: "#dc3545", border: "rgba(220,53,69,0.3)" },
};

const AdminWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [processing, setProcessing] = useState(null);
  const [notesMap, setNotesMap] = useState({});

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const glassStyle = {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.1)",
  };

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
      <div className="position-relative" style={{ zIndex: 1 }}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1">
              <i className="fas fa-money-check-alt me-2 text-warning"></i>
              Withdrawal Requests
            </h2>
            <p className="text-white-50 small mb-0">
              KES {stats.totalAmount.toLocaleString()} pending across {stats.pending} requests
            </p>
          </div>
          <button className="btn btn-outline-warning rounded-pill px-4" onClick={fetchWithdrawals}>
            <i className="fas fa-sync-alt me-2"></i>Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="row g-3 mb-4">
          {[
            { label: "Pending", value: stats.pending, icon: "fa-clock", color: "#ffc107" },
            { label: "Processing", value: stats.processing, icon: "fa-spinner", color: "#6BBDD0" },
            { label: "Completed", value: stats.completed, icon: "fa-check-circle", color: "#28a745" },
            { label: "Failed", value: stats.failed, icon: "fa-times-circle", color: "#dc3545" },
          ].map((s, i) => (
            <div key={i} className="col-6 col-md-3">
              <div className="rounded-4 p-3 text-center h-100" style={glassStyle}>
                <i className={`fas ${s.icon} fa-2x mb-2`} style={{ color: s.color }}></i>
                <h4 className="fw-bold mb-0" style={{ color: s.color }}>{s.value}</h4>
                <small className="text-white-50">{s.label}</small>
              </div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="d-flex gap-2 mb-4 flex-wrap">
          {["all", "pending", "processing", "completed", "failed"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`btn btn-sm rounded-pill px-3 ${filter === f ? "btn-warning" : "btn-outline-secondary"}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== "all" && <span className="ms-1 badge rounded-pill bg-dark">{withdrawals.filter(w => w.status === f).length}</span>}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-5" style={glassStyle}>
            <div className="spinner-border mb-3" style={{ color: "#6BBDD0" }}></div>
            <p className="text-white-50">Loading withdrawals...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5 rounded-4" style={glassStyle}>
            <i className="fas fa-money-check-alt fa-4x text-white-50 mb-3"></i>
            <p className="text-white-50">No {filter !== "all" ? filter : ""} withdrawal requests</p>
          </div>
        ) : (
          <div className="rounded-4 overflow-hidden" style={glassStyle}>
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle mb-0">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
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
                      <tr key={w._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td className="ps-4">
                          <div className="fw-bold">{w.photographer?.username || "Unknown"}</div>
                          <small className="text-white-50">{w.photographer?.email}</small>
                          {w.phoneNumber && <div><small className="text-white-50">{w.phoneNumber}</small></div>}
                        </td>
                        <td>
                          <span className="fw-bold text-warning" style={{ fontSize: "1.1rem" }}>
                            KES {w.amount?.toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <span className="badge rounded-pill px-3 py-2" style={{ background: "rgba(107,189,208,0.15)", color: "#6BBDD0" }}>
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
                          <small className="text-white-50">
                            {w.createdAt ? new Date(w.createdAt).toLocaleDateString() : "N/A"}
                          </small>
                        </td>
                        <td style={{ minWidth: 160 }}>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "0.75rem" }}
                            placeholder="Add notes..."
                            value={notesMap[w._id] || w.notes || ""}
                            onChange={e => setNotesMap(prev => ({ ...prev, [w._id]: e.target.value }))}
                          />
                        </td>
                        <td className="pe-4">
                          {w.status === "pending" || w.status === "processing" ? (
                            <div className="d-flex gap-1">
                              {w.status === "pending" && (
                                <button className="btn btn-sm rounded-3 px-2"
                                  style={{ background: "rgba(107,189,208,0.15)", color: "#6BBDD0", border: "1px solid rgba(107,189,208,0.3)" }}
                                  onClick={() => handleProcess(w, "processing")} disabled={isProcessing}
                                  title="Mark Processing">
                                  <i className="fas fa-spinner"></i>
                                </button>
                              )}
                              <button className="btn btn-sm rounded-3 px-2"
                                style={{ background: "rgba(40,167,69,0.15)", color: "#28a745", border: "1px solid rgba(40,167,69,0.3)" }}
                                onClick={() => handleProcess(w, "completed")} disabled={isProcessing}
                                title="Approve">
                                {isProcessing ? <span className="spinner-border spinner-border-sm"></span> : <i className="fas fa-check"></i>}
                              </button>
                              <button className="btn btn-sm rounded-3 px-2"
                                style={{ background: "rgba(220,53,69,0.15)", color: "#dc3545", border: "1px solid rgba(220,53,69,0.3)" }}
                                onClick={() => handleProcess(w, "failed")} disabled={isProcessing}
                                title="Reject">
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          ) : (
                            <small className="text-white-50">
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
