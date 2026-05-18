import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import PhotographerLayout from "./PhotographerLayout";
import PageHeader from "../../PageHeader";
import { API_BASE_URL } from "../../../api/apiConfig";

const API = API_BASE_URL;

const PhotographerSales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const photographerId = user?._id;

  const fetchSales = useCallback(async () => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    try {
      setLoading(true);

      // Get photographer's transactions (sales)
      const transactionsRes = await axios.get(`${API}/payments/transactions/${photographerId}`, { headers });

      // Transform transactions to sales format
      const sales = (transactionsRes.data || []).map(transaction => ({
        _id: transaction.id || transaction._id,
        receiptNumber: `REC-${(transaction.id || transaction._id)?.substring(0, 8)}`,
        user: { email: transaction.description?.split(' for ')[0]?.replace('Earnings from ', '') || 'Unknown' },
        items: [{ title: transaction.description?.split(' for ')[1] || 'Media' }],
        amount: transaction.amount,
        createdAt: transaction.date || transaction.createdAt,
        status: transaction.status || 'completed'
      }));

      setSales(sales);

    } catch (error) {
      console.error("Error fetching sales:", error);
    } finally {
      setLoading(false);
    }
  }, [photographerId]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const filteredSales = sales.filter(s => {
    if (filter === "all") return true;
    if (filter === "today") {
      const today = new Date().toDateString();
      return new Date(s.createdAt).toDateString() === today;
    }
    if (filter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(s.createdAt) >= weekAgo;
    }
    return true;
  });

  const totalRevenue = filteredSales.reduce((sum, s) => sum + (s.amount || 0), 0);

  return (
    <PhotographerLayout>
      <PageHeader title="Sales History" subtitle="All your completed transactions" />
      <div className="mc-page">
        {/* Summary Stats */}
        <div className="mc-stats-row-sm" style={{ marginBottom: "1.25rem" }}>
          <div className="mc-stat-card">
            <div className="mc-stat-label">TOTAL SALES</div>
            <div className="mc-stat-value">{filteredSales.length}</div>
            <div className="mc-stat-trend up"><i className="fas fa-shopping-bag"></i> Transactions</div>
          </div>
          <div className="mc-stat-card">
            <div className="mc-stat-label">REVENUE</div>
            <div className="mc-stat-value">KES {totalRevenue.toLocaleString()}</div>
            <div className="mc-stat-trend up"><i className="fas fa-arrow-up"></i> Earned</div>
          </div>
          <div className="mc-stat-card">
            <div className="mc-stat-label">AVERAGE SALE</div>
            <div className="mc-stat-value">
              KES {filteredSales.length ? (totalRevenue / filteredSales.length).toFixed(0) : 0}
            </div>
            <div className="mc-stat-trend"><i className="fas fa-chart-line"></i> Per sale</div>
          </div>
        </div>

        {/* Filter */}
        <div className="mc-card" style={{ marginBottom: "1.25rem" }}>
          <div className="mc-card-header">
            <span className="mc-card-title">FILTER BY PERIOD</span>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            {["all", "today", "week"].map(f => (
              <button
                key={f}
                className={filter === f ? "mc-btn mc-btn-primary" : "mc-btn mc-btn-ghost"}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All Time" : f === "today" ? "Today" : "This Week"}
              </button>
            ))}
          </div>
        </div>

        {/* Sales Table */}
        <div className="mc-table-card">
          <div className="mc-card-header" style={{ padding: "1rem 1.25rem 0" }}>
            <span className="mc-card-title">TRANSACTIONS</span>
            <span className="mc-card-badge">{filteredSales.length} records</span>
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
                    <th className="ps-3">Receipt #</th>
                    <th>Buyer</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th className="pe-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale) => (
                    <tr key={sale._id}>
                      <td className="ps-3">
                        <small className="fw-bold">{sale.receiptNumber || `REC-${sale._id?.substring(0, 8)}`}</small>
                      </td>
                      <td>
                        <i className="fas fa-user-circle text-warning me-2"></i>
                        {sale.user?.email || "Anonymous"}
                      </td>
                      <td>{sale.items?.length || 1} item(s)</td>
                      <td>
                        <span className="badge bg-success">KES {sale.amount}</span>
                      </td>
                      <td>
                        <small>{new Date(sale.createdAt).toLocaleString()}</small>
                      </td>
                      <td className="pe-3">
                        <span className="badge bg-success">Completed</span>
                      </td>
                    </tr>
                  ))}
                  {filteredSales.length === 0 && (
                    <tr>
                      <td colSpan="6">
                        <div className="mc-empty">
                          <i className="fas fa-chart-line"></i>
                          <p>No sales found</p>
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

export default PhotographerSales;
