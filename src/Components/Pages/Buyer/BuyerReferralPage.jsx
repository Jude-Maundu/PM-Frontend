import React, { useEffect, useState } from "react";
import axios from "axios";
import BuyerLayout from "./BuyerLayout";
import { API_ENDPOINTS, SITE_URL } from "../../../api/apiConfig";
import { toast } from "../../../utils/toast";
import PageHeader from "../../PageHeader";

const BuyerReferralPage = () => {
  const [code, setCode] = useState("");
  const [stats, setStats] = useState({ referredUsers: [], total: 0, referralEarnings: 0 });
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const load = async () => {
      try {
        const [codeRes, statsRes] = await Promise.all([
          axios.get(API_ENDPOINTS.REFERRAL.MY_CODE, { headers }),
          axios.get(API_ENDPOINTS.REFERRAL.STATS, { headers }),
        ]);
        setCode(codeRes.data.referralCode || "");
        setStats(statsRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const referralUrl = `${SITE_URL}/register?ref=${code}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralUrl).then(() => toast.success("Referral link copied!"));
  };

  return (
    <BuyerLayout>
      <div className="mc-page">
        <PageHeader title="Referral Program" subtitle="Invite friends and earn" />

        {loading ? (
          <div className="spinner-border" style={{ color: "var(--pm-teal)" }}></div>
        ) : (
          <>
            {/* Stats */}
            <div className="mc-stats-row-sm mb-4">
              {[
                { label: "Total Referred", value: stats.total, icon: "fa-users" },
                { label: "Referral Earnings", value: `KES ${(stats.referralEarnings || 0).toLocaleString()}`, icon: "fa-coins" },
              ].map((s) => (
                <div className="mc-card p-3" key={s.label}>
                  <i className={`fas ${s.icon} mb-2`} style={{ color: "var(--pm-teal)", fontSize: "1.5rem" }}></i>
                  <div className="fw-bold fs-4 text-white">{s.value}</div>
                  <small style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</small>
                </div>
              ))}
            </div>

            {/* Referral Link */}
            <div className="mc-card mb-4">
              <h6 className="text-white mb-3">Your Referral Link</h6>
              <div className="input-group">
                <input
                  type="text"
                  readOnly
                  value={referralUrl}
                  className="form-control"
                  style={{
                    background: "rgba(107,189,208,0.05)",
                    border: "1px solid rgba(107,189,208,0.2)",
                    color: "#fff",
                    fontSize: "0.85rem",
                  }}
                />
                <button
                  className="btn"
                  style={{ background: "var(--pm-teal)", color: "#fff" }}
                  onClick={copyLink}
                >
                  <i className="fas fa-copy me-1"></i>Copy
                </button>
              </div>
              <small style={{ color: "rgba(255,255,255,0.4)", marginTop: "0.5rem", display: "block" }}>
                Your referral code:{" "}
                <span style={{ color: "var(--pm-teal)", fontWeight: 600 }}>{code || "—"}</span>
              </small>
            </div>

            {/* Referred Users */}
            {stats.referredUsers?.length > 0 && (
              <div className="mc-table-card">
                <h6 className="text-white mb-3">
                  People You Referred ({stats.total})
                </h6>
                <div className="table-responsive">
                  <table className="table table-borderless mb-0">
                    <thead>
                      <tr>
                        <th style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>Username</th>
                        <th style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>Role</th>
                        <th style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.referredUsers.map((u) => (
                        <tr key={u._id}>
                          <td style={{ color: "#fff", fontSize: "0.88rem" }}>{u.username}</td>
                          <td>
                            <span
                              className="badge"
                              style={{
                                background: "rgba(107,189,208,0.15)",
                                color: "var(--pm-teal)",
                              }}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </BuyerLayout>
  );
};

export default BuyerReferralPage;
