import React, { useState } from "react";
import PhotographerLayout from "./PhotographerLayout";

const PhotographerWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([
    // Mock data - will be replaced by API calls
    {
      id: 1,
      amount: 5000,
      method: "mpesa",
      phone: "254712345678",
      status: "completed",
      date: "2024-01-15",
    },
    {
      id: 2,
      amount: 3000,
      method: "bank",
      account: "****1234",
      status: "pending",
      date: "2024-01-20",
    },
  ]);

  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestData, setRequestData] = useState({
    amount: "",
    method: "mpesa",
    phone: "",
    accountName: "",
    accountNumber: "",
  });

  const handleRequest = (e) => {
    e.preventDefault();
    alert("Withdrawal request submitted!");
    setShowRequestForm(false);
  };

  return (
    <PhotographerLayout>
      <h4 className="fw-bold mb-4">
        <i className="fas fa-money-bill-wave me-2 text-warning"></i>
        Withdrawals
      </h4>

      {/* Balance Card */}
      <div className="card bg-dark border-warning mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-6">
              <small className="text-white-50">Available Balance</small>
              <h2 className="text-warning fw-bold">KES 12,500</h2>
              <p className="text-white-50 small mb-md-0">Minimum withdrawal: KES 1,000</p>
            </div>
            <div className="col-md-6 text-end">
              <button
                className="btn btn-warning px-4"
                onClick={() => setShowRequestForm(true)}
              >
                <i className="fas fa-plus-circle me-2"></i>
                Request Withdrawal
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Request Form Modal */}
      {showRequestForm && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div className="modal-dialog">
            <div className="modal-content bg-dark border-warning">
              <div className="modal-header border-warning">
                <h5 className="modal-title text-warning">Request Withdrawal</h5>
                <button className="btn-close btn-close-white" onClick={() => setShowRequestForm(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleRequest}>
                  <div className="mb-3">
                    <label className="form-label text-white-50">Amount (KES)</label>
                    <input
                      type="number"
                      className="form-control bg-dark text-white border-secondary"
                      value={requestData.amount}
                      onChange={(e) => setRequestData({...requestData, amount: e.target.value})}
                      required
                      min="1000"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-white-50">Withdrawal Method</label>
                    <select
                      className="form-select bg-dark text-white border-secondary"
                      value={requestData.method}
                      onChange={(e) => setRequestData({...requestData, method: e.target.value})}
                    >
                      <option value="mpesa">M-Pesa</option>
                      <option value="bank">Bank Transfer</option>
                    </select>
                  </div>

                  {requestData.method === "mpesa" ? (
                    <div className="mb-3">
                      <label className="form-label text-white-50">M-Pesa Phone Number</label>
                      <input
                        type="tel"
                        className="form-control bg-dark text-white border-secondary"
                        placeholder="254712345678"
                        value={requestData.phone}
                        onChange={(e) => setRequestData({...requestData, phone: e.target.value})}
                        required
                      />
                    </div>
                  ) : (
                    <>
                      <div className="mb-3">
                        <label className="form-label text-white-50">Account Name</label>
                        <input
                          type="text"
                          className="form-control bg-dark text-white border-secondary"
                          value={requestData.accountName}
                          onChange={(e) => setRequestData({...requestData, accountName: e.target.value})}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label text-white-50">Account Number</label>
                        <input
                          type="text"
                          className="form-control bg-dark text-white border-secondary"
                          value={requestData.accountNumber}
                          onChange={(e) => setRequestData({...requestData, accountNumber: e.target.value})}
                          required
                        />
                      </div>
                    </>
                  )}

                  <button type="submit" className="btn btn-warning w-100">
                    Submit Request
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawals History */}
      <div className="card bg-dark border-secondary">
        <div className="card-header bg-transparent border-secondary">
          <h6 className="mb-0 text-warning">
            <i className="fas fa-history me-2"></i>
            Withdrawal History
          </h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-dark table-hover mb-0">
              <thead>
                <tr>
                  <th className="ps-3">Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Details</th>
                  <th className="pe-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w.id}>
                    <td className="ps-3">
                      <small>{new Date(w.date).toLocaleDateString()}</small>
                    </td>
                    <td>
                      <span className="badge bg-warning text-dark">KES {w.amount}</span>
                    </td>
                    <td>
                      <span className={`badge bg-${w.method === 'mpesa' ? 'success' : 'info'}`}>
                        {w.method}
                      </span>
                    </td>
                    <td>
                      <small className="text-white-50">
                        {w.method === 'mpesa' ? w.phone : w.account}
                      </small>
                    </td>
                    <td className="pe-3">
                      <span className={`badge bg-${w.status === 'completed' ? 'success' : 'warning'}`}>
                        {w.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PhotographerLayout>
  );
};

export default PhotographerWithdrawals;