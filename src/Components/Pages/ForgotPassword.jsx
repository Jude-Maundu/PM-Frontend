import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../../api/apiConfig";

const ForgotPassword = () => {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f1923 0%, #1a2e3b 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div style={{ width: "100%", maxWidth: 420, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(107,189,208,0.2)", borderRadius: 20, padding: "2.5rem", backdropFilter: "blur(12px)" }}>

        <div className="text-center mb-4">
          <div style={{ width: 60, height: 60, background: "linear-gradient(135deg,#1a6b8a,#6bdcd0)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", fontSize: "1.5rem", color: "#fff" }}>
            <i className="fas fa-key"></i>
          </div>
          <h4 style={{ color: "#fff", fontWeight: 700, marginBottom: "0.25rem" }}>Forgot Password</h4>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.88rem", margin: 0 }}>
            {sent ? "Check your email for the reset link" : "Enter your email and we'll send you a reset link"}
          </p>
        </div>

        {error && (
          <div className="mb-3 px-3 py-2" style={{ background: "rgba(232,85,85,0.1)", border: "1px solid rgba(232,85,85,0.3)", color: "#ff8080", borderRadius: 10, fontSize: "0.87rem" }}>
            <i className="fas fa-exclamation-circle me-2"></i>{error}
          </div>
        )}

        {sent ? (
          <div className="text-center">
            <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>📬</div>
            <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "1.5rem" }}>
              We sent a reset link to <strong style={{ color: "#6bdcd0" }}>{email}</strong>. Check your inbox (and spam folder).
            </p>
            <Link to="/login" style={{ display: "block", padding: "0.75rem", background: "linear-gradient(135deg,#1a6b8a,#6bdcd0)", color: "#fff", borderRadius: 12, fontWeight: 700, textDecoration: "none", textAlign: "center" }}>
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label style={{ color: "rgba(255,255,255,0.72)", fontSize: "0.88rem", fontWeight: 600, marginBottom: "0.4rem", display: "block" }}>
                <i className="fas fa-envelope me-1" style={{ color: "#6bdcd0" }}></i> Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{ width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(107,189,208,0.3)", borderRadius: 12, padding: "0.7rem 1rem", color: "#fff", fontSize: "0.95rem", outline: "none" }}
              />
            </div>

            <button type="submit" disabled={loading}
                    style={{ width: "100%", padding: "0.8rem", background: loading ? "rgba(107,189,208,0.4)" : "linear-gradient(135deg,#1a6b8a,#6bdcd0)", color: "#fff", fontWeight: 700, fontSize: "1rem", border: "none", borderRadius: 12, cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 4px 18px rgba(107,189,208,0.35)" }}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Sending…</> : <><i className="fas fa-paper-plane me-2"></i>Send Reset Link</>}
            </button>

            <p className="text-center mt-3 mb-0" style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.87rem" }}>
              Remember it?{" "}
              <Link to="/login" style={{ color: "#6bdcd0", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
