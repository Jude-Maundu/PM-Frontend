import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import { API_ENDPOINTS } from "../../../api/apiConfig";
import { toast } from "../../../utils/toast";
import PageHeader from "../../PageHeader";

const AdminWallets = () => {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [adjustModal, setAdjustModal] = useState(null); // { wallet }
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjusting, setAdjusting] = useState(false);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINTS.ADMIN.GET_WALLETS, { headers });
      setWallets(res.data?.data || res.data || []);
    } catch (err) {
      toast.error("Failed to load wallets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdjust = async (e) => {
    e.preventDefault();
    const amount = parseFloat(adjustAmount);
    if (isNaN(amount) || amount === 0) { toast.error("Enter a valid amount"); return; }
    setAdjusting(true);
    try {
      const res = await axios.post(
        API_ENDPOINTS.ADMIN.ADJUST_WALLET(adjustModal.wallet.user?._id || adjustModal.wallet.user),
        { amount, reason: adjustReason || "Admin adjustment" },
        { headers }
      );
      toast.success(`Wallet adjusted. New balance: KES ${res.data.balance?.toLocaleString()}`);
      setAdjustModal(null);
      setAdjustAmount("");
      setAdjustReason("");
      fetchWallets();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to adjust wallet");
    } finally {
      setAdjusting(false);
    }
  };

  const totalBalance = wallets.reduce((s, w) => s + (w.balance || 0), 0);
  const filtered = wallets.filter(w =>
    w.user?.username?.toLowerCase().includes(search.toLowerCase()) ||
    w.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="mc-page">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <PageHeader title="Wallet Management" subtitle="User balances and adjustments" />
          <button className="btn btn-outline-warning rounded-pill px-4 mt-1" onClick={fetchWallets}>
            <i className="fas fa-sync-alt me-2"></i>Refresh
          </button>
        </div>

        <p className="text-white-50 small mb-4">
          Total platform balance: <span className="text-warning fw-bold">KES {totalBalance.toLocaleString()}</span> across {wallets.length} wallets
        </p>

        {/* Search */}
        <div className="mc-card mb-4">
          <div className="position-relative">
            <i className="fas fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-white-50"></i>
            <input type="text" className="form-control"
              style={{ paddingLeft: 40, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
              placeholder="Search by username or email..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="mc-card text-center py-5">
            <div className="spinner-border mb-3" style={{ color: "#6BBDD0" }}></div>
            <p className="text-white-50">Loading wallets...</p>
          </div>
        ) : (
          <div className="mc-table-card">
            <div className="table-responsive">
              <table className="table table-borderless align-middle mb-0">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <th className="ps-4 py-3">User</th>
                    <th className="py-3">Role</th>
                    <th className="py-3">Balance</th>
                    <th className="py-3">Currency</th>
                    <th className="py-3">Transactions</th>
                    <th className="pe-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan="6" className="text-center text-white-50 py-5">No wallets found</td></tr>
                  ) : filtered.map(w => (
                    <tr key={w._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td className="ps-4">
                        <div className="fw-bold text-white">{w.user?.username || "Unknown"}</div>
                        <small className="text-white-50">{w.user?.email}</small>
                      </td>
                      <td>
                        <span className="badge rounded-pill px-3 py-2"
                          style={{ background: "rgba(107,189,208,0.15)", color: "#6BBDD0", fontSize: "0.75rem" }}>
                          {w.user?.role || "user"}
                        </span>
                      </td>
                      <td>
                        <span className="fw-bold" style={{ color: w.balance > 0 ? "#28a745" : "#ccc", fontSize: "1.05rem" }}>
                          KES {(w.balance || 0).toLocaleString()}
                        </span>
                      </td>
                      <td><small className="text-white-50">{w.currency || "KES"}</small></td>
                      <td>
                        <span className="badge rounded-pill px-3 py-2" style={{ background: "rgba(255,255,255,0.08)", color: "#ccc" }}>
                          {w.transactions?.length || 0} txns
                        </span>
                      </td>
                      <td className="pe-4">
                        <button className="btn mc-btn mc-btn-primary btn-sm rounded-3 px-3"
                          onClick={() => { setAdjustModal({ wallet: w }); setAdjustAmount(""); setAdjustReason(""); }}>
                          <i className="fas fa-plus-minus me-1"></i>Adjust
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Adjust Modal */}
      {adjustModal && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.75)", zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 420 }}>
            <div className="modal-content border-0 rounded-4" style={{ background: "#0d1f33", border: "1px solid rgba(107,189,208,0.2)" }}>
              <div className="modal-header border-0 pb-0 pt-4 px-4">
                <h5 className="modal-title text-white fw-bold">
                  <i className="fas fa-wallet me-2" style={{ color: "#ffc107" }}></i>
                  Adjust Wallet
                </h5>
                <button className="btn-close btn-close-white" onClick={() => setAdjustModal(null)}></button>
              </div>
              <form onSubmit={handleAdjust}>
                <div className="modal-body px-4 py-3">
                  <p className="text-white-50 small mb-3">
                    User: <strong className="text-white">{adjustModal.wallet.user?.username}</strong>
                    &nbsp;· Current balance: <strong className="text-warning">KES {(adjustModal.wallet.balance || 0).toLocaleString()}</strong>
                  </p>
                  <div className="mb-3">
                    <label className="form-label text-white-50 small">Amount (positive to add, negative to deduct)</label>
                    <input type="number" className="form-control"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(107,189,208,0.3)", color: "#fff" }}
                      placeholder="e.g. 500 or -200"
                      value={adjustAmount} onChange={e => setAdjustAmount(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-white-50 small">Reason (optional)</label>
                    <input type="text" className="form-control"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(107,189,208,0.3)", color: "#fff" }}
                      placeholder="e.g. Refund, bonus, correction..."
                      value={adjustReason} onChange={e => setAdjustReason(e.target.value)} />
                  </div>
                </div>
                <div className="modal-footer border-0 px-4 pb-4 pt-0 gap-2">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setAdjustModal(null)}>Cancel</button>
                  <button type="submit" className="btn mc-btn mc-btn-primary rounded-pill px-4 fw-bold" disabled={adjusting}>
                    {adjusting ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</> : "Apply Adjustment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminWallets;
