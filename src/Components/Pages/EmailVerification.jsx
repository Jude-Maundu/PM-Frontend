import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";
import { API_BASE_URL } from "../../api/apiConfig";

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const token          = searchParams.get("token");
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) { setStatus("error"); setMessage("No verification token found."); return; }
    axios.get(`${API_BASE_URL}/auth/verify-email?token=${token}`)
      .then(() => setStatus("success"))
      .catch(err => { setStatus("error"); setMessage(err.response?.data?.message || "Verification failed."); });
  }, [token]);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f1923 0%, #1a2e3b 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div style={{ width: "100%", maxWidth: 420, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(107,189,208,0.2)", borderRadius: 20, padding: "2.5rem", backdropFilter: "blur(12px)", textAlign: "center" }}>

        {status === "loading" && (
          <>
            <div className="spinner-border mb-3" style={{ color: "#6bdcd0", width: "3rem", height: "3rem" }} role="status"></div>
            <h5 style={{ color: "#fff" }}>Verifying your email…</h5>
          </>
        )}

        {status === "success" && (
          <>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✅</div>
            <h4 style={{ color: "#fff", fontWeight: 700, marginBottom: "0.5rem" }}>Email Verified!</h4>
            <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "1.5rem" }}>
              Your email has been verified successfully. You can now access all features of Relic Snap.
            </p>
            <Link to="/login" style={{ display: "block", padding: "0.75rem", background: "linear-gradient(135deg,#1a6b8a,#6bdcd0)", color: "#fff", borderRadius: 12, fontWeight: 700, textDecoration: "none" }}>
              Sign In
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>❌</div>
            <h4 style={{ color: "#ff8080", fontWeight: 700, marginBottom: "0.5rem" }}>Verification Failed</h4>
            <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "1.5rem" }}>{message || "The link may have expired or already been used."}</p>
            <Link to="/login" style={{ color: "#6bdcd0", fontWeight: 600, textDecoration: "none" }}>Back to Sign In</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
