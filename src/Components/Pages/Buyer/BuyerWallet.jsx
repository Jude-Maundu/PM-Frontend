import React, { useState, useEffect } from "react";
import BuyerLayout from "./BuyerLayout";
import { Link } from "react-router-dom";
import axios from "axios";

const API = "https://pm-backend-1-0s8f.onrender.com/api";

const BuyerWallet = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id || user._id;
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch wallet balance
  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const balanceRes = await axios.get(`${API}/payments/wallet/${userId}`, { headers });
      setBalance(balanceRes.data.balance || 0);
      
      const transactionsRes = await axios.get(`${API}/payments/transactions/${userId}`, { headers });
      setTransactions(transactionsRes.data || []);
    } catch (err) {
      console.error("Error fetching wallet data:", err);
      setError("Failed to load wallet data");
    } finally {
      setLoading(false);
    }
  };

  // Initiate M-Pesa payment
  const handleMpesaPayment = async () => {
    if (!amount || amount < 10) {
      alert("Please enter a valid amount (minimum KES 10)");
      return;
    }
    if (!phone || phone.length < 10) {
      alert("Please enter a valid phone number");
      return;
    }

    try {
      setProcessing(true);
      const res = await axios.post(`${API}/payments/mpesa`, {
        userId,
        amount: parseFloat(amount),
        phoneNumber: phone
      }, { headers });

      if (res.data.success) {
        alert("STK Push sent to your phone. Please enter your PIN to complete payment.");
        setTimeout(() => {
          fetchWalletData();
          setShowAddFunds(false);
          setAmount("");
          setPhone("");
        }, 10000);
      }
    } catch (err) {
      console.error("M-Pesa error:", err);
      setError(err.response?.data?.message || "M-Pesa payment failed");
    } finally {
      setProcessing(false);
    }
  };

  // Mock payment (for testing)
  const handleMockPayment = async () => {
    if (!amount || amount < 10) {
      alert("Please enter a valid amount (minimum KES 10)");
      return;
    }

    try {
      setProcessing(true);
      const res = await axios.post(`${API}/payments/buy`, {
        userId,
        amount: parseFloat(amount),
        type: "wallet_topup"
      }, { headers });

      if (res.data.success) {
        alert(`KES ${amount} added to wallet successfully!`);
        fetchWalletData();
        setShowAddFunds(false);
        setAmount("");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.response?.data?.message || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (!token || !userId) {
      setError("Please login to view wallet");
      return;
    }
    fetchWalletData();
  }, []);

  return (
    <BuyerLayout>
      <div className="text-white">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">
            <i className="fas fa-wallet me-2 text-warning"></i>
            My Wallet
          </h2>
          <button
            className="btn btn-warning"
            onClick={() => setShowAddFunds(!showAddFunds)}
          >
            <i className="fas fa-plus me-2"></i>
            Add Funds
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
            <button type="button" className="btn-close" onClick={() => setError(null)}></button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="row">
            {/* Balance Card */}
            <div className="col-md-4 mb-4">
              <div className="card bg-dark border-warning">
                <div className="card-body text-center">
                  <i className="fas fa-wallet fa-4x text-warning mb-3"></i>
                  <h3 className="fw-bold text-warning">KES {balance.toLocaleString()}</h3>
                  <p className="text-white-50">Available Balance</p>
                  
                  {/* Add Funds Form */}
                  {showAddFunds && (
                    <div className="mt-4 p-3 rounded" style={{ background: "rgba(0,0,0,0.3)" }}>
                      <h6 className="mb-3">Add Funds</h6>
                      <div className="mb-3">
                        <input
                          type="number"
                          className="form-control bg-dark border-secondary text-white mb-2"
                          placeholder="Amount (KES)"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          min="10"
                        />
                        <input
                          type="tel"
                          className="form-control bg-dark border-secondary text-white mb-3"
                          placeholder="Phone Number (254...)"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-success flex-grow-1"
                            onClick={handleMpesaPayment}
                            disabled={processing}
                          >
                            {processing ? (
                              <span className="spinner-border spinner-border-sm"></span>
                            ) : (
                              <>
                                <i className="fas fa-mobile-alt me-2"></i>
                                M-Pesa
                              </>
                            )}
                          </button>
                          <button
                            className="btn btn-warning flex-grow-1"
                            onClick={handleMockPayment}
                            disabled={processing}
                          >
                            <i className="fas fa-credit-card me-2"></i>
                            Mock
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Transactions */}
            <div className="col-md-8">
              <div className="card bg-dark border-secondary">
                <div className="card-header bg-transparent border-secondary">
                  <h6 className="mb-0 text-warning">
                    <i className="fas fa-history me-2"></i>
                    Recent Transactions
                  </h6>
                </div>
                <div className="list-group list-group-flush bg-dark">
                  {transactions.length === 0 ? (
                    <div className="list-group-item bg-transparent text-white-50 text-center py-4">
                      No transactions yet
                    </div>
                  ) : (
                    transactions.map((tx, idx) => (
                      <div key={tx._id || idx} className="list-group-item bg-transparent text-white border-secondary">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <small className="text-white-50 d-block">
                              {new Date(tx.createdAt || tx.date).toLocaleString()}
                            </small>
                            <span>{tx.description || tx.title || "Transaction"}</span>
                          </div>
                          <div className="text-end">
                            <span className={tx.type === 'credit' ? 'text-success' : 'text-danger'}>
                              {tx.type === 'credit' ? '+' : '-'} KES {tx.amount || tx.price}
                            </span>
                            <small className="text-white-50 d-block">
                              {tx.status || "completed"}
                            </small>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </BuyerLayout>
  );
};

export default BuyerWallet;