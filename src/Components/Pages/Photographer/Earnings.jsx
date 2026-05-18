import { toast } from "../../../utils/toast";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import PhotographerLayout from "./PhotographerLayout";
import PageHeader from "../../PageHeader";
import { API_ENDPOINTS } from "../../../api/apiConfig";
import { getAuthHeaders, getCurrentUserId } from "../../../utils/auth";

const PhotographerEarnings = () => {
  const [earnings, setEarnings] = useState({
    total: 0,
    pending: 0,
    withdrawn: 0,
    available: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEarnings = useCallback(async () => {
    const photographerId = getCurrentUserId();
    const headers = getAuthHeaders();
    if (!photographerId) {
      console.warn("Photographer ID missing; cannot fetch earnings.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const summaryRes = await axios.get(API_ENDPOINTS.PAYMENTS.EARNINGS_SUMMARY(photographerId), { headers });
      const transactionsRes = await axios.get(API_ENDPOINTS.PAYMENTS.TRANSACTIONS(photographerId), { headers });

      setEarnings({
        total: summaryRes.data?.total || 0,
        pending: summaryRes.data?.pending || 0,
        withdrawn: summaryRes.data?.withdrawn || 0,
        available: summaryRes.data?.available || 0,
      });

      setTransactions(transactionsRes.data || []);

    } catch (error) {
      console.error("Error fetching earnings:", error);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  const handleWithdraw = () => {
    if (earnings.available < 1000) {
      toast.warning("Minimum withdrawal amount is KES 1,000");
      return;
    }
    toast.success("Withdrawal request submitted successfully!");
  };

  return (
    <PhotographerLayout>
      <PageHeader title="My Earnings" subtitle="Track your income and payouts" />
      <div className="mc-page">
        {/* Stat Cards */}
        <div className="mc-stats-row-sm" style={{ marginBottom: "1.25rem" }}>
          <div className="mc-stat-card">
            <div className="mc-stat-label">TOTAL EARNINGS</div>
            <div className="mc-stat-value">KES {earnings.total.toLocaleString()}</div>
            <div className="mc-stat-trend up"><i className="fas fa-coins"></i> All time</div>
          </div>
          <div className="mc-stat-card">
            <div className="mc-stat-label">AVAILABLE</div>
            <div className="mc-stat-value">KES {earnings.available.toLocaleString()}</div>
            <div className="mc-stat-trend up"><i className="fas fa-wallet"></i> Ready to withdraw</div>
          </div>
          <div className="mc-stat-card">
            <div className="mc-stat-label">PENDING</div>
            <div className="mc-stat-value">KES {earnings.pending.toLocaleString()}</div>
            <div className="mc-stat-trend"><i className="fas fa-clock"></i> Processing</div>
          </div>
          <div className="mc-stat-card">
            <div className="mc-stat-label">WITHDRAWN</div>
            <div className="mc-stat-value">KES {earnings.withdrawn.toLocaleString()}</div>
            <div className="mc-stat-trend up"><i className="fas fa-check-circle"></i> Paid out</div>
          </div>
        </div>

        {/* Withdraw Action Card */}
        <div className="mc-card" style={{ marginBottom: "1.25rem" }}>
          <div className="mc-card-header">
            <span className="mc-card-title">AVAILABLE FOR WITHDRAWAL</span>
            <span className="mc-card-badge">KES {earnings.available.toLocaleString()}</span>
          </div>
          <p style={{ fontSize: "0.85rem", opacity: 0.6, marginBottom: "1rem" }}>
            Minimum withdrawal: KES 1,000
          </p>
          <button
            className="mc-btn mc-btn-primary"
            onClick={handleWithdraw}
            disabled={earnings.available < 1000}
          >
            <i className="fas fa-money-bill-wave me-2"></i>
            Withdraw Funds
          </button>
        </div>

        {/* Transactions Table */}
        <div className="mc-table-card">
          <div className="mc-card-header" style={{ padding: "1rem 1.25rem 0" }}>
            <span className="mc-card-title">TRANSACTION HISTORY</span>
          </div>
          {loading ? (
            <div style={{ padding: "2rem", textAlign: "center" }}>
              <div className="spinner-border" style={{ color: "var(--mc-accent)" }}></div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-dark table-hover mb-0">
                <thead>
                  <tr>
                    <th className="ps-3">Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th className="pe-3">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, idx) => (
                    <tr key={idx}>
                      <td className="ps-3">
                        <small>{new Date(t.createdAt).toLocaleDateString()}</small>
                      </td>
                      <td>{t.description || "Media Sale"}</td>
                      <td>
                        <span className="badge bg-success">KES {t.amount}</span>
                      </td>
                      <td>
                        <span className={`badge bg-${t.status === 'completed' ? 'success' : 'warning'}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="pe-3">
                        <span className="badge bg-info">Sale</span>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan="5">
                        <div className="mc-empty">
                          <i className="fas fa-receipt"></i>
                          <p>No transactions yet</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PhotographerLayout>
  );
};

export default PhotographerEarnings;
