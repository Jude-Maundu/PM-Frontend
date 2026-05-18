import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import PageHeader from "../../PageHeader";
import { API_BASE_URL } from "../../../api/apiConfig";
import { toast } from "../../../utils/toast";
import { showConfirm } from "../../../utils/confirm";

const API = API_BASE_URL;

const AdminRefunds = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchRefunds = async () => {
    try {
      const res = await axios.get(`${API}/payments/admin/refunds`, { headers });
      setRefunds(res.data);
    } catch (error) {
      console.error("Error fetching refunds:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApprove = async (refundId) => {
    const ok = await showConfirm("Approve this refund?", { title: "Approve Refund", confirmText: "Approve" });
    if (!ok) return;
    try {
      await axios.post(`${API}/payments/refund/approve`, { refundId }, { headers });
      toast.success("Refund approved successfully!");
      fetchRefunds();
    } catch (error) {
      toast.error("Failed to approve refund");
    }
  };

  const handleReject = async (refundId) => {
    const ok = await showConfirm("Reject this refund?", { title: "Reject Refund", confirmText: "Reject", danger: true });
    if (!ok) return;
    try {
      await axios.post(`${API}/payments/refund/reject`, { refundId }, { headers });
      toast.success("Refund rejected.");
      fetchRefunds();
    } catch (error) {
      toast.error("Failed to reject refund");
    }
  };

  const handleProcess = async (refundId) => {
    const ok = await showConfirm("Process this refund and credit the buyer's wallet?", { title: "Process Refund", confirmText: "Process" });
    if (!ok) return;
    try {
      await axios.post(`${API}/payments/refund/process`, { refundId }, { headers });
      toast.success("Refund processed and wallet credited.");
      fetchRefunds();
    } catch (error) {
      toast.error("Failed to process refund");
    }
  };

  const filteredRefunds = refunds.filter(r => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  const stats = {
    pending: refunds.filter(r => r.status === "pending").length,
    approved: refunds.filter(r => r.status === "approved").length,
    rejected: refunds.filter(r => r.status === "rejected").length,
    processed: refunds.filter(r => r.status === "processed").length,
    totalAmount: refunds.reduce((sum, r) => sum + (r.amount || 0), 0),
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Refund Requests"
        subtitle="Review and process refunds"
        actions={
          <button className="mc-btn mc-btn-ghost" onClick={fetchRefunds}>
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
            <div className="mc-stat-label">APPROVED</div>
            <div className="mc-stat-value" style={{ color: "var(--mc-accent-teal)" }}>{stats.approved}</div>
          </div>
          <div className="mc-stat-card">
            <div className="mc-stat-label">REJECTED</div>
            <div className="mc-stat-value" style={{ color: "var(--mc-accent-pink)" }}>{stats.rejected}</div>
          </div>
          <div className="mc-stat-card">
            <div className="mc-stat-label">PROCESSED</div>
            <div className="mc-stat-value" style={{ color: "var(--mc-accent)" }}>{stats.processed}</div>
          </div>
          <div className="mc-stat-card">
            <div className="mc-stat-label">TOTAL REFUND AMOUNT</div>
            <div className="mc-stat-value" style={{ fontSize: "1.1rem" }}>KES {stats.totalAmount.toLocaleString()}</div>
          </div>
        </div>

        {/* Filter */}
        <div className="mc-card mb-3" style={{ padding: "0.75rem 1rem" }}>
          <div className="d-flex gap-2 flex-wrap">
            {["pending", "approved", "rejected", "processed", "all"].map((f) => (
              <button
                key={f}
                className={`mc-btn ${filter === f ? "mc-btn-primary" : "mc-btn-ghost"}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <div className="spinner-border" style={{ color: "var(--mc-accent)" }}></div>
          </div>
        )}

        {/* Refunds Table */}
        {!loading && (
          <div className="mc-table-card">
            <div className="table-responsive">
              <table className="table table-borderless mb-0">
                <thead>
                  <tr>
                    <th className="ps-3 py-3">User</th>
                    <th className="py-3">Amount</th>
                    <th className="py-3">Reason</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Date</th>
                    <th className="pe-3 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRefunds.length === 0 ? (
                    <tr>
                      <td colSpan="6">
                        <div className="mc-empty">
                          <i className="fas fa-undo"></i>
                          <p>No refunds found</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredRefunds.map((r) => (
                    <tr key={r._id}>
                      <td className="ps-3">
                        <div className="d-flex align-items-center gap-2">
                          <i className="fas fa-user-circle" style={{ color: "var(--mc-accent)" }}></i>
                          {r.user?.email || "N/A"}
                        </div>
                      </td>
                      <td>
                        <span className="badge px-3 py-2" style={{ background: "rgba(245,166,35,0.15)", color: "var(--mc-accent-gold)" }}>
                          KES {r.amount}
                        </span>
                      </td>
                      <td>
                        <small>{r.reason || "No reason provided"}</small>
                      </td>
                      <td>
                        <span className="badge rounded-pill px-3 py-2" style={{
                          background: r.status === "pending" ? "rgba(245,166,35,0.15)" :
                                      r.status === "approved" ? "rgba(76,201,166,0.15)" :
                                      r.status === "rejected" ? "rgba(240,107,141,0.15)" : "rgba(91,127,229,0.15)",
                          color: r.status === "pending" ? "var(--mc-accent-gold)" :
                                 r.status === "approved" ? "var(--mc-accent-teal)" :
                                 r.status === "rejected" ? "var(--mc-accent-pink)" : "var(--mc-accent)",
                        }}>
                          {r.status}
                        </span>
                      </td>
                      <td>
                        <small>{new Date(r.createdAt).toLocaleDateString()}</small>
                      </td>
                      <td className="pe-3">
                        {r.status === "pending" && (
                          <div className="d-flex gap-2">
                            <button className="mc-btn mc-btn-primary btn-sm" onClick={() => handleApprove(r._id)}>
                              Approve
                            </button>
                            <button className="mc-btn mc-btn-danger btn-sm" onClick={() => handleReject(r._id)}>
                              Reject
                            </button>
                          </div>
                        )}
                        {r.status === "approved" && (
                          <button className="mc-btn mc-btn-ghost btn-sm" onClick={() => handleProcess(r._id)}>
                            Process Refund
                          </button>
                        )}
                        {r.status === "processed" && (
                          <span style={{ color: "var(--mc-accent-teal)" }}>
                            <i className="fas fa-check-circle me-1"></i>Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminRefunds;
