import { toast } from "../../../utils/toast";
import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import PhotographerLayout from "./PhotographerLayout";
import PageHeader from "../../PageHeader";
import { API_BASE_URL } from "../../../api/apiConfig";
import { getAuthHeaders, getCurrentUserId, getStoredUser } from "../../../utils/auth";

const API = API_BASE_URL;
const SOCKET_URL = "https://pm-backend-f3b6.onrender.com";

const PAYOUT_SCHEDULE_KEY = "photographer_payout_schedule";

const defaultSchedule = { enabled: false, dayOfMonth: 1, minBalance: 1000 };

const PhotographerWithdrawals = () => {
  const storedUser = getStoredUser();
  const storedPhone = storedUser?.phoneNumber || storedUser?.phone || "";

  const [withdrawals, setWithdrawals] = useState([]);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestData, setRequestData] = useState({
    amount: "",
    method: "mpesa",
    phone: storedPhone,
    accountName: "",
    accountNumber: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const socketRef = useRef(null);

  // Auto withdrawal schedule state
  const [schedule, setSchedule] = useState(() => {
    try {
      const stored = localStorage.getItem(PAYOUT_SCHEDULE_KEY);
      return stored ? JSON.parse(stored) : defaultSchedule;
    } catch {
      return defaultSchedule;
    }
  });
  const [scheduleSaved, setScheduleSaved] = useState(false);

  const saveSchedule = () => {
    try {
      localStorage.setItem(PAYOUT_SCHEDULE_KEY, JSON.stringify(schedule));
      setScheduleSaved(true);
      setTimeout(() => setScheduleSaved(false), 2500);
    } catch (e) {
      console.error("Failed to save schedule:", e);
    }
  };

  const fetchWithdrawals = useCallback(async () => {
    const headers = getAuthHeaders();
    const photographerId = getCurrentUserId();
    try {
      setLoading(true);

      const [withdrawalsRes, walletRes] = await Promise.all([
        axios.get(`${API}/withdrawals/my`, { headers }),
        photographerId
          ? axios.get(`${API}/payments/wallet/${photographerId}`, { headers }).catch(() => ({ data: { balance: 0 } }))
          : Promise.resolve({ data: { balance: 0 } }),
      ]);

      setWithdrawals(withdrawalsRes.data || []);
      setAvailableBalance(walletRes.data?.balance ?? walletRes.data?.netBalance ?? 0);

    } catch (error) {
      console.error("Error fetching withdrawals:", error);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  // Real-time withdrawal status updates via Socket.IO
  useEffect(() => {
    const userId = getCurrentUserId();
    if (!userId) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token: localStorage.getItem("token") },
    });
    socketRef.current = socket;
    socket.emit("join", `user_${userId}`);

    socket.on("withdrawal:processing", (data) => {
      toast.info(data.message || "Your withdrawal is being processed.");
      fetchWithdrawals();
    });

    socket.on("withdrawal:completed", (data) => {
      toast.success(data.message || `KES ${data.amount?.toLocaleString()} sent to your M-Pesa!`);
      fetchWithdrawals();
    });

    socket.on("withdrawal:failed", (data) => {
      toast.error(data.message || "Withdrawal failed. Your balance has been restored.");
      fetchWithdrawals();
    });

    return () => { socket.disconnect(); };
  }, [fetchWithdrawals]);

  const handleRequest = async (e) => {
    e.preventDefault();

    if (!requestData.amount || Number(requestData.amount) < 1) {
      toast.warning("Please enter a valid withdrawal amount");
      return;
    }

    if (Number(requestData.amount) > availableBalance) {
      toast.error("Insufficient available balance");
      return;
    }

    try {
      setSubmitting(true);
      const headers = getAuthHeaders();

      const payload = {
        amount: Number(requestData.amount),
        method: requestData.method,
        phoneNumber: requestData.method === 'mpesa' ? requestData.phone : undefined,
        accountName: requestData.method === 'bank' ? requestData.accountName : undefined,
        accountNumber: requestData.method === 'bank' ? requestData.accountNumber : undefined,
      };

      const res = await axios.post(`${API}/withdrawals/request`, payload, { headers });

      toast.success(res.data?.message || "Withdrawal request submitted successfully!");
      setShowRequestForm(false);
      setRequestData({
        amount: "",
        method: "mpesa",
        phone: storedPhone,
        accountName: "",
        accountNumber: "",
      });

      // Refresh data
      fetchWithdrawals();

    } catch (error) {
      console.error("Error submitting withdrawal request:", error);
      toast.error(error.response?.data?.message || "Failed to submit withdrawal request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PhotographerLayout>
      <PageHeader title="Withdrawals" subtitle="Request and track payouts" />
      <div className="mc-page">

        {/* Auto Withdrawal Card */}
        <div className="mc-card" style={{ marginBottom: "1.25rem" }}>
          <div className="mc-card-header">
            <span className="mc-card-title">
              <i className="fas fa-robot me-2"></i>AUTO WITHDRAWAL
            </span>
          </div>
          {/* Toggle */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <p className="mb-0 text-white fw-semibold">Enable automatic monthly withdrawal</p>
              <small style={{ color: "rgba(255,255,255,0.45)" }}>
                Funds will be transferred automatically on your chosen day each month
              </small>
            </div>
            <div className="form-check form-switch ms-3">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="autoWithdrawToggle"
                checked={schedule.enabled}
                onChange={(e) => setSchedule((prev) => ({ ...prev, enabled: e.target.checked }))}
                style={{ width: "3em", height: "1.6em", cursor: "pointer" }}
              />
            </div>
          </div>

          {/* Settings (shown when enabled) */}
          <div
            style={{
              opacity: schedule.enabled ? 1 : 0.4,
              pointerEvents: schedule.enabled ? "auto" : "none",
              transition: "opacity 0.25s",
            }}
          >
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label text-white-50 small">
                  <i className="fas fa-calendar-day me-1"></i>
                  Withdraw on day of month
                </label>
                <select
                  className="form-select bg-dark text-white border-secondary"
                  value={schedule.dayOfMonth}
                  onChange={(e) => setSchedule((prev) => ({ ...prev, dayOfMonth: parseInt(e.target.value) }))}
                >
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d} style={{ background: "#1a2e3b" }}>
                      {d === 1 ? "1st" : d === 2 ? "2nd" : d === 3 ? "3rd" : `${d}th`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label text-white-50 small">
                  <i className="fas fa-coins me-1"></i>
                  Only withdraw if balance is above (KES)
                </label>
                <input
                  type="number"
                  className="form-control bg-dark text-white border-secondary"
                  placeholder="e.g. 5000"
                  value={schedule.minBalance}
                  onChange={(e) => setSchedule((prev) => ({ ...prev, minBalance: parseInt(e.target.value) || 0 }))}
                  min="0"
                  step="500"
                />
              </div>
            </div>

            {/* Info note */}
            <div
              className="d-flex gap-2 p-3 rounded-3 mb-3"
              style={{ background: "rgba(107,189,208,0.07)", border: "1px solid rgba(107,189,208,0.18)" }}
            >
              <i className="fas fa-info-circle mt-1 flex-shrink-0" style={{ color: "var(--mc-accent-teal)" }}></i>
              <small style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
                Automatic withdrawals will be processed on{" "}
                <span style={{ color: "var(--mc-accent-teal)", fontWeight: 600 }}>day {schedule.dayOfMonth}</span> of each month
                when your available balance exceeds{" "}
                <span style={{ color: "var(--mc-accent-teal)", fontWeight: 600 }}>
                  KES {(schedule.minBalance || 0).toLocaleString()}
                </span>
                . Withdrawals are subject to bank processing times.
              </small>
            </div>
          </div>

          {/* Save button */}
          <div className="d-flex align-items-center gap-3">
            <button className="mc-btn mc-btn-primary" onClick={saveSchedule}>
              <i className="fas fa-save me-2"></i>Save Settings
            </button>
            {scheduleSaved && (
              <span style={{ color: "var(--mc-accent-teal)", fontSize: "0.85rem" }}>
                <i className="fas fa-check-circle me-1"></i>Saved!
              </span>
            )}
          </div>
        </div>

        {/* Balance Card */}
        <div className="mc-card" style={{ marginBottom: "1.25rem" }}>
          <div className="mc-card-header">
            <span className="mc-card-title">AVAILABLE BALANCE</span>
            <span className="mc-card-badge">Withdraw any amount</span>
          </div>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--mc-accent-gold)" }}>
                KES {availableBalance.toLocaleString()}
              </div>
              <small style={{ opacity: 0.55 }}>Withdraw your full balance or any amount</small>
            </div>
            <button
              className="mc-btn mc-btn-primary"
              onClick={() => setShowRequestForm(true)}
              disabled={availableBalance <= 0}
            >
              <i className="fas fa-plus-circle me-2"></i>
              Request Withdrawal
            </button>
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
                        min="1"
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
                      <>
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
                        <div
                          className="d-flex gap-2 p-3 rounded-3 mb-3"
                          style={{ background: "rgba(107,189,208,0.08)", border: "1px solid rgba(107,189,208,0.2)" }}
                        >
                          <i className="fas fa-mobile-alt mt-1 flex-shrink-0" style={{ color: "var(--mc-accent-teal)" }}></i>
                          <small style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
                            You will receive an <strong style={{ color: "var(--mc-accent-teal)" }}>M-Pesa notification</strong> on{" "}
                            <strong style={{ color: "#fff" }}>{requestData.phone || "your phone"}</strong> once the transfer is initiated.
                            Funds typically arrive within a few minutes.
                          </small>
                        </div>
                      </>
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

                    <button type="submit" className="mc-btn mc-btn-primary w-100" disabled={submitting}>
                      {submitting ? (
                        <><span className="spinner-border spinner-border-sm me-2"></span>Sending to M-Pesa...</>
                      ) : requestData.method === "mpesa" ? (
                        <><i className="fas fa-paper-plane me-2"></i>Send to M-Pesa</>
                      ) : (
                        <><i className="fas fa-university me-2"></i>Submit Bank Request</>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Withdrawals History */}
        <div className="mc-table-card">
          <div className="mc-card-header" style={{ padding: "1rem 1.25rem 0" }}>
            <span className="mc-card-title">WITHDRAWAL HISTORY</span>
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
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Details</th>
                    <th className="pe-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w) => (
                    <tr key={w._id}>
                      <td className="ps-3">
                        <small>{new Date(w.createdAt).toLocaleDateString()}</small>
                      </td>
                      <td>
                        <span className="badge bg-warning text-dark">KES {w.amount.toLocaleString()}</span>
                      </td>
                      <td>
                        <span className={`badge bg-${w.method === 'mpesa' ? 'success' : 'info'}`}>
                          {w.method.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <small className="text-white-50">
                          {w.method === 'mpesa' ? w.phoneNumber : `${w.accountName} - ${w.accountNumber}`}
                        </small>
                      </td>
                      <td className="pe-3">
                        <span className={`badge bg-${
                          w.status === 'completed' ? 'success' :
                          w.status === 'pending' ? 'warning' :
                          w.status === 'processing' ? 'info' : 'danger'
                        }`}>
                          {w.status.charAt(0).toUpperCase() + w.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {withdrawals.length === 0 && (
                    <tr>
                      <td colSpan="5">
                        <div className="mc-empty">
                          <i className="fas fa-money-bill-wave"></i>
                          <p>No withdrawal requests yet</p>
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

export default PhotographerWithdrawals;
