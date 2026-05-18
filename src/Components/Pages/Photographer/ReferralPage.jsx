import React, { useEffect, useState } from "react";
import axios from "axios";
import PhotographerLayout from "./PhotographerLayout";
import PageHeader from "../../PageHeader";
import { API_ENDPOINTS, SITE_URL } from "../../../api/apiConfig";
import { toast } from "../../../utils/toast";

const ReferralPage = () => {
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
    <PhotographerLayout>
      <PageHeader title="Referral Program" subtitle="Invite photographers and earn rewards" />
      <div className="mc-page">
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <div className="spinner-border" style={{ color: "var(--mc-accent)" }}></div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="mc-stats-row-sm" style={{ marginBottom: "1.25rem" }}>
              <div className="mc-stat-card">
                <div className="mc-stat-label">TOTAL REFERRED</div>
                <div className="mc-stat-value">{stats.total}</div>
                <div className="mc-stat-trend up"><i className="fas fa-users"></i> Signups</div>
              </div>
              <div className="mc-stat-card">
                <div className="mc-stat-label">REFERRAL EARNINGS</div>
                <div className="mc-stat-value">KES {(stats.referralEarnings || 0).toLocaleString()}</div>
                <div className="mc-stat-trend up"><i className="fas fa-coins"></i> Earned</div>
              </div>
            </div>

            {/* Referral Link Card */}
            <div className="mc-card" style={{ marginBottom: "1.25rem" }}>
              <div className="mc-card-header">
                <span className="mc-card-title">YOUR REFERRAL LINK</span>
              </div>
              <div className="input-group mb-3">
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
                  className="mc-btn mc-btn-primary"
                  style={{ borderRadius: "0 8px 8px 0" }}
                  onClick={copyLink}
                >
                  <i className="fas fa-copy me-1"></i>Copy
                </button>
              </div>
              <small style={{ color: "rgba(255,255,255,0.4)", display: "block" }}>
                Your referral code:{" "}
                <span style={{ color: "var(--mc-accent-teal)", fontWeight: 600 }}>{code || "—"}</span>
              </small>
            </div>

            {/* Referred Users */}
            {stats.referredUsers?.length > 0 && (
              <div className="mc-table-card">
                <div className="mc-card-header" style={{ padding: "1rem 1.25rem 0" }}>
                  <span className="mc-card-title">PEOPLE YOU REFERRED</span>
                  <span className="mc-card-badge">{stats.total}</span>
                </div>
                <div className="table-responsive">
                  <table className="table table-dark mb-0" style={{ borderColor: "rgba(107,189,208,0.1)" }}>
                    <thead>
                      <tr>
                        <th style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>Username</th>
                        <th style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>Role</th>
                        <th style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.referredUsers.map((u) => (
                        <tr key={u._id} style={{ borderColor: "rgba(107,189,208,0.08)" }}>
                          <td style={{ color: "#fff", fontSize: "0.88rem" }}>{u.username}</td>
                          <td>
                            <span className="mc-card-badge">{u.role}</span>
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

            {stats.referredUsers?.length === 0 && (
              <div className="mc-card">
                <div className="mc-empty">
                  <i className="fas fa-users"></i>
                  <p>No referrals yet. Share your link to get started!</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PhotographerLayout>
  );
};

export default ReferralPage;
