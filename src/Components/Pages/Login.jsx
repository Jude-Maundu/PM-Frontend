import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../../api/apiConfig";

const BOKEH = [
  { size: 10, top: "10%", left: "18%", delay: "0s",   dur: "3.4s" },
  { size: 6,  top: "28%", left: "72%", delay: "0.7s", dur: "4.2s" },
  { size: 14, top: "52%", left: "9%",  delay: "1.3s", dur: "3.8s" },
  { size: 7,  top: "68%", left: "62%", delay: "0.4s", dur: "5.1s" },
  { size: 5,  top: "38%", left: "48%", delay: "1.9s", dur: "3.6s" },
  { size: 11, top: "78%", left: "28%", delay: "1.0s", dur: "4.5s" },
  { size: 8,  top: "20%", left: "57%", delay: "2.2s", dur: "3.0s" },
  { size: 9,  top: "60%", left: "80%", delay: "1.6s", dur: "4.8s" },
  { size: 4,  top: "44%", left: "33%", delay: "0.5s", dur: "3.2s" },
  { size: 12, top: "86%", left: "68%", delay: "2.5s", dur: "5.4s" },
  { size: 6,  top: "15%", left: "40%", delay: "3.0s", dur: "4.0s" },
  { size: 8,  top: "73%", left: "15%", delay: "0.8s", dur: "3.9s" },
];

const Login = () => {
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isDark, setIsDark]             = useState(true);

  // MFA state
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaUserId, setMfaUserId]     = useState(null);
  const [mfaCode, setMfaCode]         = useState("");

  const navigate = useNavigate();
  const m = isDark ? "dark" : "light";

  const col = {
    heading:    isDark ? "#ffffff"               : "#1a2e3b",
    subtitle:   isDark ? "rgba(255,255,255,0.5)" : "#4a6a7a",
    label:      isDark ? "rgba(255,255,255,0.72)": "#2c4a5a",
    muted:      isDark ? "rgba(255,255,255,0.42)": "#5a7a8a",
    divider:    isDark ? "rgba(107,189,208,0.22)": "rgba(107,189,208,0.3)",
    checkLabel: isDark ? "rgba(255,255,255,0.5)" : "#4a7a8a",
  };

  const redirectByRole = (role) => {
    const r = String(role).toLowerCase().trim();
    if (r === "admin" || r === "reviewer" || r === "support") window.location.href = "/admin/dashboard";
    else if (r.includes("photographer")) window.location.href = "/photographer/dashboard";
    else window.location.href = "/buyer/dashboard";
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });

      if (response.data.mfaRequired) {
        setMfaUserId(response.data.mfaUserId);
        setMfaRequired(true);
        setLoading(false);
        return;
      }

      const { token, user } = response.data;
      const userRole = response.data.role || user?.role || "user";
      localStorage.setItem("token", token);
      localStorage.setItem("user",  JSON.stringify(user));
      localStorage.setItem("role",  userRole);
      redirectByRole(userRole);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Login failed, please try again";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleMfaVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-mfa`, { mfaUserId, otp: mfaCode });
      const { token, user } = response.data;
      const userRole = user?.role || "user";
      localStorage.setItem("token", token);
      localStorage.setItem("user",  JSON.stringify(user));
      localStorage.setItem("role",  userRole);
      redirectByRole(userRole);
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid code, please try again";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <div className={`auth-page-v2 ${m}`}>
      <button className={`auth-mode-toggle ${!isDark ? "is-light" : ""}`} onClick={() => setIsDark(!isDark)}>
        <i className={`fas ${isDark ? "fa-sun" : "fa-moon"}`}></i>
        {isDark ? "Light Mode" : "Dark Mode"}
      </button>

      {/* ── Left animated panel ── */}
      <div className="auth-anim-panel d-none d-lg-flex">
        {BOKEH.map((b, i) => (
          <div key={i} className="bokeh-dot" style={{ width: b.size, height: b.size, top: b.top, left: b.left, animationDelay: b.delay, animationDuration: b.dur }} />
        ))}
        <div className="float-card" style={{ width: 205, height: 140, top: "7%", left: "8%", animation: "float1 6.8s ease-in-out infinite" }}>
          <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop" alt="" />
          <div className="fc-badge">Mountain Serenity</div>
        </div>
        <div className="float-card" style={{ width: 158, height: 116, top: "18%", right: "6%", animation: "float2 7.8s ease-in-out infinite 1.3s" }}>
          <img src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=200&fit=crop" alt="" />
        </div>
        <div className="float-card" style={{ width: 215, height: 150, top: "44%", left: "4%", animation: "float3 8.2s ease-in-out infinite 0.7s" }}>
          <img src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop" alt="" />
          <div className="fc-badge">Forest Light</div>
        </div>
        <div className="float-card" style={{ width: 150, height: 108, top: "62%", right: "10%", animation: "float4 7.2s ease-in-out infinite 2.1s" }}>
          <img src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=200&fit=crop" alt="" />
        </div>
        <div className="float-card" style={{ width: 130, height: 90, top: "82%", left: "35%", animation: "float2 6.5s ease-in-out infinite 0.4s" }}>
          <img src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300&h=200&fit=crop" alt="" />
        </div>
        <div className="auth-panel-brand">
          <div className="auth-panel-logo-icon"><i className="fas fa-camera"></i></div>
          <h2 className="auth-panel-heading">Relic Snap</h2>
          <p className="auth-panel-sub">Your gateway to stunning photography</p>
          <div className="auth-panel-stats">
            <div className="auth-stat"><strong>50K+</strong><span>Photos</span></div>
            <div className="auth-stat"><strong>12K+</strong><span>Creators</span></div>
            <div className="auth-stat"><strong>4.9★</strong><span>Rating</span></div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <div className="d-flex d-lg-none align-items-center gap-2 mb-4">
            <div className="auth-panel-logo-icon" style={{ width: 40, height: 40, fontSize: "1rem", borderRadius: 10 }}>
              <i className="fas fa-camera"></i>
            </div>
            <span style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.3rem", color: col.heading }}>Relic Snap</span>
          </div>

          <div className={`auth-card-v2 ${m}`}>
            <div className="text-center mb-4">
              <div className="auth-icon-circle" style={{ margin: "0 auto" }}>
                {mfaRequired ? <i className="fas fa-shield-halved"></i> : <i className="fas fa-camera"></i>}
              </div>
              <h4 style={{ color: col.heading, fontFamily: "var(--font-serif)", fontWeight: 700, marginTop: "0.9rem", marginBottom: "0.25rem" }}>
                {mfaRequired ? "Two-Factor Verification" : "Welcome Back"}
              </h4>
              <p style={{ color: col.subtitle, fontSize: "0.88rem", margin: 0 }}>
                {mfaRequired ? `Check ${email} for your 6-digit code` : "Sign in to continue"}
              </p>
            </div>

            {error && (
              <div className="d-flex align-items-center mb-3 py-2 px-3"
                   style={{ background: "rgba(232,85,85,0.1)", border: "1px solid rgba(232,85,85,0.3)", color: "#ff8080", borderRadius: 12, fontSize: "0.87rem" }}>
                <i className="fas fa-exclamation-circle me-2"></i>
                <span className="flex-grow-1">{error}</span>
                <button type="button" onClick={() => setError(null)} style={{ background: "none", border: "none", color: "#ff8080", cursor: "pointer", padding: 0 }}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}

            {/* ── MFA Step ── */}
            {mfaRequired ? (
              <form onSubmit={handleMfaVerify}>
                <div className="mb-4">
                  <label className="form-label small fw-semibold mb-1 d-block" style={{ color: col.label }}>
                    <i className="fas fa-key me-1" style={{ color: "var(--pm-teal)" }}></i> Verification Code
                  </label>
                  <input
                    type="text"
                    className={`form-control form-control-lg auth-input-v2 ${m} text-center`}
                    placeholder="000000"
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                    style={{ letterSpacing: "0.5em", fontSize: "1.5rem", fontWeight: 700 }}
                    required
                    autoFocus
                  />
                </div>
                <button type="submit" className="btn w-100 fw-bold mb-3" disabled={loading || mfaCode.length !== 6}
                        style={{ background: "linear-gradient(135deg, #1a6b8a, #6bdcd0)", color: "#fff", border: "none", borderRadius: 12, padding: "0.75rem", fontSize: "1rem" }}>
                  {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Verifying…</> : <><i className="fas fa-check-circle me-2"></i>Verify Code</>}
                </button>
                <p className="text-center small" style={{ color: col.muted }}>
                  Didn't get it?{" "}
                  <button type="button" className="btn btn-link p-0 small fw-semibold" style={{ color: "var(--pm-teal)" }}
                          onClick={() => { setMfaRequired(false); setMfaCode(""); setError(null); }}>
                    Go back
                  </button>
                </p>
              </form>
            ) : (
              /* ── Login form ── */
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold mb-1 d-block" style={{ color: col.label }}>
                    <i className="fas fa-envelope me-1" style={{ color: "var(--pm-teal)" }}></i> Email
                  </label>
                  <input type="email" className={`form-control form-control-sm auth-input-v2 ${m}`}
                         placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold mb-1 d-block" style={{ color: col.label }}>
                    <i className="fas fa-lock me-1" style={{ color: "var(--pm-teal)" }}></i> Password
                  </label>
                  <div className="input-group input-group-sm">
                    <input type={showPassword ? "text" : "password"} className={`form-control auth-input-v2 ${m}`}
                           style={{ borderRight: "none", borderRadius: "12px 0 0 12px" }}
                           placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="button" className={`btn auth-eye-btn ${m}`} onClick={() => setShowPassword(!showPassword)}>
                      <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                    </button>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="rememberMe"
                           style={{ background: isDark ? "rgba(255,255,255,0.1)" : "#f0f8fc", borderColor: "rgba(107,189,208,0.4)" }} />
                    <label className="form-check-label small" htmlFor="rememberMe" style={{ color: col.checkLabel }}>Remember me</label>
                  </div>
                  <Link to="/forgot-password" className="text-decoration-none small fw-semibold" style={{ color: "var(--pm-teal)" }}>
                    Forgot Password?
                  </Link>
                </div>

                {/* ── Sign In button — high contrast ── */}
                <button type="submit" disabled={loading}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                          width: "100%", padding: "0.8rem 1.25rem", marginBottom: "0.75rem",
                          background: loading ? "rgba(107,189,208,0.4)" : "linear-gradient(135deg, #1a6b8a 0%, #6bdcd0 100%)",
                          color: "#fff", fontWeight: 700, fontSize: "1rem",
                          border: "none", borderRadius: 12, cursor: loading ? "not-allowed" : "pointer",
                          boxShadow: "0 4px 18px rgba(107,189,208,0.45)",
                          transition: "all 0.2s ease",
                        }}>
                  {loading
                    ? <><span className="spinner-border spinner-border-sm"></span> Signing in…</>
                    : <><i className="fas fa-sign-in-alt"></i> Sign In</>}
                </button>

                <p className="text-center small mb-0" style={{ color: col.muted }}>
                  Don't have an account?{" "}
                  <Link to="/register" className="text-decoration-none fw-semibold" style={{ color: "var(--pm-teal)" }}>Sign up</Link>
                </p>
              </form>
            )}

            {!mfaRequired && (
              <>
                <div className="d-flex align-items-center my-3">
                  <hr className="flex-grow-1 m-0" style={{ borderColor: col.divider }} />
                  <span className="mx-3 small" style={{ color: col.muted }}>or</span>
                  <hr className="flex-grow-1 m-0" style={{ borderColor: col.divider }} />
                </div>

                {/* ── Google button — proper styling ── */}
                <button onClick={handleGoogleSignIn}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem",
                          width: "100%", padding: "0.7rem 1.25rem",
                          background: "#fff", color: "#3c4043", fontWeight: 600, fontSize: "0.95rem",
                          border: "1px solid #dadce0", borderRadius: 12, cursor: "pointer",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
                          transition: "box-shadow 0.2s ease",
                        }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = "0 3px 10px rgba(0,0,0,0.28)"}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.18)"}>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                <p className="text-center small mb-0 mt-3" style={{ color: col.muted }}>
                  <i className="fas fa-shield-alt me-1" style={{ color: "var(--pm-teal)" }}></i>
                  Secured with end-to-end encryption
                </p>
              </>
            )}
          </div>

          <div className="text-center mt-3">
            <Link to="/" className="text-decoration-none small" style={{ color: col.muted }}>
              <i className="fas fa-arrow-left me-1"></i> Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
