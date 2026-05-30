import React, { useState } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";
import { API_BASE_URL } from "../../api/apiConfig";

const ResetPassword = () => {
  const [searchParams]          = useSearchParams();
  const token                   = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);
  const [error, setError]       = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match"); return; }
    if (password.length < 6)  { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${API_BASE_URL}/auth/reset-password`, { token, password });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) return (
    <div style={{ minHeight: "100vh", background: "#0f1923", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="text-center" style={{ color: "#fff" }}>
        <p style={{ color: "#ff8080" }}>Invalid reset link.</p>
        <Link to="/forgot-password" style={{ color: "#6bdcd0" }}>Request a new one</Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f1923 0%, #1a2e3b 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div style={{ width: "100%", maxWidth: 420, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(107,189,208,0.2)", borderRadius: 20, padding: "2.5rem", backdropFilter: "blur(12px)" }}>

        <div className="text-center mb-4">
          <div style={{ width: 60, height: 60, background: "linear-gradient(135deg,#1a6b8a,#6bdcd0)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", fontSize: "1.5rem", color: "#fff" }}>
            <i className="fas fa-lock-open"></i>
          </div>
          <h4 style={{ color: "#fff", fontWeight: 700, marginBottom: "0.25rem" }}>Set New Password</h4>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.88rem", margin: 0 }}>
            {done ? "Password updated successfully" : "Choose a strong new password"}
          </p>
        </div>

        {error && (
          <div className="mb-3 px-3 py-2" style={{ background: "rgba(232,85,85,0.1)", border: "1px solid rgba(232,85,85,0.3)", color: "#ff8080", borderRadius: 10, fontSize: "0.87rem" }}>
            <i className="fas fa-exclamation-circle me-2"></i>{error}
          </div>
        )}

        {done ? (
          <div className="text-center">
            <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>✅</div>
            <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "1.5rem" }}>Your password has been reset. You can now sign in with your new password.</p>
            <Link to="/login" style={{ display: "block", padding: "0.75rem", background: "linear-gradient(135deg,#1a6b8a,#6bdcd0)", color: "#fff", borderRadius: 12, fontWeight: 700, textDecoration: "none", textAlign: "center" }}>
              Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label style={{ color: "rgba(255,255,255,0.72)", fontSize: "0.88rem", fontWeight: 600, marginBottom: "0.4rem", display: "block" }}>
                <i className="fas fa-lock me-1" style={{ color: "#6bdcd0" }}></i> New Password
              </label>
              <div style={{ display: "flex", border: "1px solid rgba(107,189,208,0.3)", borderRadius: 12, overflow: "hidden" }}>
                <input type={showPwd ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                       placeholder="Min. 6 characters" required
                       style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "none", padding: "0.7rem 1rem", color: "#fff", fontSize: "0.95rem", outline: "none" }} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                        style={{ background: "rgba(255,255,255,0.07)", border: "none", color: "rgba(255,255,255,0.5)", padding: "0 0.9rem", cursor: "pointer" }}>
                  <i className={`fas ${showPwd ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label style={{ color: "rgba(255,255,255,0.72)", fontSize: "0.88rem", fontWeight: 600, marginBottom: "0.4rem", display: "block" }}>
                <i className="fas fa-lock me-1" style={{ color: "#6bdcd0" }}></i> Confirm Password
              </label>
              <input type={showPwd ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)}
                     placeholder="Repeat password" required
                     style={{ width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(107,189,208,0.3)", borderRadius: 12, padding: "0.7rem 1rem", color: "#fff", fontSize: "0.95rem", outline: "none" }} />
            </div>

            <button type="submit" disabled={loading}
                    style={{ width: "100%", padding: "0.8rem", background: loading ? "rgba(107,189,208,0.4)" : "linear-gradient(135deg,#1a6b8a,#6bdcd0)", color: "#fff", fontWeight: 700, fontSize: "1rem", border: "none", borderRadius: 12, cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 4px 18px rgba(107,189,208,0.35)" }}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving…</> : <><i className="fas fa-save me-2"></i>Reset Password</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
