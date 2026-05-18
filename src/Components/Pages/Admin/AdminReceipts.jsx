import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import PageHeader from "../../PageHeader";
import { API_BASE_URL } from "../../../api/apiConfig";

const API = API_BASE_URL;

const AdminReceipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchReceipts = async () => {
    try {
      const res = await axios.get(`${API}/payments/admin/receipts`, { headers });
      setReceipts(res.data);
    } catch (error) {
      console.error("Error fetching receipts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredReceipts = receipts.filter(r => {
    const searchTerm = search.toLowerCase();
    const matchesSearch =
      r.user?.email?.toLowerCase().includes(searchTerm) ||
      r.receiptNumber?.toLowerCase().includes(searchTerm) ||
      r.transactionId?.toLowerCase().includes(searchTerm);

    if (dateFilter === "all") return matchesSearch;

    const date = new Date(r.createdAt);
    const now = new Date();
    const days = (now - date) / (1000 * 60 * 60 * 24);

    if (dateFilter === "today") return days <= 1 && matchesSearch;
    if (dateFilter === "week") return days <= 7 && matchesSearch;
    if (dateFilter === "month") return days <= 30 && matchesSearch;

    return matchesSearch;
  });

  const totalRevenue = filteredReceipts.reduce((sum, r) => sum + (r.amount || 0), 0);
  const photographerShare = totalRevenue * 0.7;
  const platformFees = totalRevenue * 0.3;

  return (
    <AdminLayout>
      <PageHeader
        title="Transaction Receipts"
        subtitle="All platform payment records"
        onSearch={setSearch}
        searchQuery={search}
        searchPlaceholder="Search by email or receipt number..."
        actions={
          <button className="mc-btn mc-btn-ghost" onClick={fetchReceipts}>
            <i className="fas fa-sync-alt me-1"></i>Refresh
          </button>
        }
      />
      <div className="mc-page">
        {/* Summary Stats */}
        <div className="mc-stats-row-sm" style={{ marginBottom: "1.25rem" }}>
          <div className="mc-stat-card">
            <div className="mc-stat-label">TOTAL REVENUE</div>
            <div className="mc-stat-value" style={{ fontSize: "1.2rem" }}>KES {totalRevenue.toLocaleString()}</div>
          </div>
          <div className="mc-stat-card">
            <div className="mc-stat-label">PHOTOGRAPHERS SHARE (70%)</div>
            <div className="mc-stat-value" style={{ fontSize: "1.2rem", color: "var(--mc-accent-teal)" }}>KES {photographerShare.toLocaleString()}</div>
          </div>
          <div className="mc-stat-card">
            <div className="mc-stat-label">PLATFORM FEES (30%)</div>
            <div className="mc-stat-value" style={{ fontSize: "1.2rem", color: "var(--mc-accent-pink)" }}>KES {platformFees.toLocaleString()}</div>
          </div>
          <div className="mc-stat-card">
            <div className="mc-stat-label">TOTAL TRANSACTIONS</div>
            <div className="mc-stat-value">{filteredReceipts.length}</div>
          </div>
        </div>

        {/* Date Filter */}
        <div className="mc-card mb-3" style={{ padding: "0.75rem 1rem" }}>
          <select
            className="form-select"
            style={{ maxWidth: 220 }}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <div className="spinner-border" style={{ color: "var(--mc-accent)" }}></div>
          </div>
        )}

        {/* Receipts Table */}
        {!loading && (
          <div className="mc-table-card">
            <div className="table-responsive">
              <table className="table table-borderless mb-0">
                <thead>
                  <tr>
                    <th className="ps-3 py-3">Receipt #</th>
                    <th className="py-3">User</th>
                    <th className="py-3">Amount</th>
                    <th className="py-3">Method</th>
                    <th className="py-3">Txn Code</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Date</th>
                    <th className="pe-3 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReceipts.length === 0 ? (
                    <tr>
                      <td colSpan="8">
                        <div className="mc-empty">
                          <i className="fas fa-receipt"></i>
                          <p>No receipts found</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredReceipts.map((r) => (
                    <tr key={r._id}>
                      <td className="ps-3">
                        <small className="fw-bold">{r.receiptNumber || `REC-${r._id?.substring(0, 8)}`}</small>
                      </td>
                      <td>
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
                        <span className="badge rounded-pill px-3 py-2"
                          style={{ background: r.method === 'mpesa' ? "rgba(76,201,166,0.15)" : "rgba(91,127,229,0.15)", color: r.method === 'mpesa' ? "var(--mc-accent-teal)" : "var(--mc-accent)" }}>
                          <i className={`fas fa-${r.method === 'mpesa' ? 'mobile-alt' : 'credit-card'} me-1`}></i>
                          {r.method || 'card'}
                        </span>
                      </td>
                      <td>
                        <small className="text-muted">{r.transactionId || 'N/A'}</small>
                      </td>
                      <td>
                        <span className="badge rounded-pill px-3 py-2"
                          style={{ background: r.status === 'completed' ? "rgba(76,201,166,0.15)" : "rgba(245,166,35,0.15)", color: r.status === 'completed' ? "var(--mc-accent-teal)" : "var(--mc-accent-gold)" }}>
                          {r.status || 'pending'}
                        </span>
                      </td>
                      <td>
                        <small>{new Date(r.createdAt).toLocaleString()}</small>
                      </td>
                      <td className="pe-3">
                        <button className="mc-btn mc-btn-ghost btn-sm" onClick={() => setSelectedReceipt(r)}>
                          <i className="fas fa-eye"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Receipt Modal */}
        {selectedReceipt && (
          <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.7)", zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="mc-card modal-content border-0">
                <div className="mc-card-header d-flex justify-content-between align-items-center">
                  <h5 className="mc-card-title mb-0">Receipt Details</h5>
                  <button className="btn-close" onClick={() => setSelectedReceipt(null)}></button>
                </div>
                <div style={{ padding: "1rem" }}>
                  <div className="text-center mb-4">
                    <i className="fas fa-receipt fa-3x mb-2" style={{ color: "var(--mc-accent)" }}></i>
                    <h5>{selectedReceipt.receiptNumber || `REC-${selectedReceipt._id?.substring(0, 8)}`}</h5>
                  </div>
                  <div className="row g-3">
                    <div className="col-6">
                      <div className="mc-card p-2">
                        <small className="text-muted">User</small>
                        <div>{selectedReceipt.user?.email || "N/A"}</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="mc-card p-2">
                        <small className="text-muted">Amount</small>
                        <div className="fw-bold" style={{ color: "var(--mc-accent-gold)" }}>KES {selectedReceipt.amount}</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="mc-card p-2">
                        <small className="text-muted">Method</small>
                        <div>{selectedReceipt.method || 'card'}</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="mc-card p-2">
                        <small className="text-muted">Transaction Code</small>
                        <div>{selectedReceipt.transactionId || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="mc-card p-2">
                        <small className="text-muted">Date</small>
                        <div>{new Date(selectedReceipt.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminReceipts;
