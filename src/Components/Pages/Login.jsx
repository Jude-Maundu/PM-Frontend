import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../../api/apiConfig";
import GoogleAuth from "../GoogleAuth";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const navigate = useNavigate();
  const m = isDark ? "dark" : "light";

  // Derived colors (avoids relying on CSS class inheritance broken by Bootstrap load order)
  const col = {
    heading:    isDark ? "#ffffff"              : "#1a2e3b",
    subtitle:   isDark ? "rgba(255,255,255,0.5)": "#4a6a7a",
    label:      isDark ? "rgba(255,255,255,0.72)": "#2c4a5a",
    muted:      isDark ? "rgba(255,255,255,0.42)": "#5a7a8a",
    divider:    isDark ? "rgba(107,189,208,0.22)": "rgba(107,189,208,0.3)",
    checkLabel: isDark ? "rgba(255,255,255,0.5)" : "#4a7a8a",
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      const token    = response.data.token;
      const user     = response.data.user;
      const userRole = response.data.role || response.data.user?.role || response.data.data?.role || "user";

      localStorage.setItem("token", token);
      localStorage.setItem("user",  JSON.stringify(user));
      localStorage.setItem("role",  userRole);

      setTimeout(() => {
        const r = String(userRole).toLowerCase().trim();
        if (r.includes("admin"))        navigate("/admin/media");
        else if (r.includes("photographer") || r.includes("photog")) navigate("/photographer/dashboard");
        else                            navigate("/buyer/dashboard");
      }, 1500);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (err.response?.data ? JSON.stringify(err.response.data) : null);
      setError(msg || (err.response?.status === 400 ? "Invalid email or password" : "Login failed, please try again"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`auth-page-v2 ${m}`}>

      {/* Mode toggle */}
      <button className={`auth-mode-toggle ${!isDark ? "is-light" : ""}`} onClick={() => setIsDark(!isDark)}>
        <i className={`fas ${isDark ? "fa-sun" : "fa-moon"}`}></i>
        {isDark ? "Light Mode" : "Dark Mode"}
      </button>

      {/* ── Left: Animated Panel ── */}
      <div className="auth-anim-panel d-none d-lg-flex">

        {/* Bokeh particles */}
        {BOKEH.map((b, i) => (
          <div key={i} className="bokeh-dot" style={{
            width: b.size, height: b.size,
            top: b.top, left: b.left,
            animationDelay: b.delay, animationDuration: b.dur,
          }} />
        ))}

        {/* Floating photo cards */}
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

        {/* Brand overlay */}
        <div className="auth-panel-brand">
          <div className="auth-panel-logo-icon">
            <i className="fas fa-camera"></i>
          </div>
          <h2 className="auth-panel-heading">Relic Snap</h2>
          <p className="auth-panel-sub">Your gateway to stunning photography</p>
          <div className="auth-panel-stats">
            <div className="auth-stat"><strong>50K+</strong><span>Photos</span></div>
            <div className="auth-stat"><strong>12K+</strong><span>Creators</span></div>
            <div className="auth-stat"><strong>4.9★</strong><span>Rating</span></div>
          </div>
        </div>
      </div>

      {/* ── Right: Form Panel ── */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">

          {/* Mobile brand header */}
          <div className="d-flex d-lg-none align-items-center gap-2 mb-4">
            <div className="auth-panel-logo-icon" style={{ width: 40, height: 40, fontSize: "1rem", borderRadius: 10 }}>
              <i className="fas fa-camera"></i>
            </div>
            <span style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.3rem", color: col.heading }}>
              Relic Snap
            </span>
          </div>

          {/* Form card */}
          <div className={`auth-card-v2 ${m}`}>

            {/* Header */}
            <div className="text-center mb-4">
              <div className="auth-icon-circle" style={{ margin: "0 auto" }}>
                <i className="fas fa-camera"></i>
              </div>
              <h4 style={{ color: col.heading, fontFamily: "var(--font-serif)", fontWeight: 700, marginTop: "0.9rem", marginBottom: "0.25rem" }}>
                Welcome Back
              </h4>
              <p style={{ color: col.subtitle, fontSize: "0.88rem", margin: 0 }}>Sign in to continue</p>
            </div>

            {/* Error alert */}
            {error && (
              <div className="d-flex align-items-center mb-3 py-2 px-3"
                   style={{ background: "rgba(232,85,85,0.1)", border: "1px solid rgba(232,85,85,0.3)", color: "#ff8080", borderRadius: 12, fontSize: "0.87rem" }}>
                <i className="fas fa-exclamation-circle me-2"></i>
                <span className="flex-grow-1">{error}</span>
                <button type="button" onClick={() => setError(null)}
                        style={{ background: "none", border: "none", color: "#ff8080", cursor: "pointer", padding: 0, lineHeight: 1 }}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}

            {/* Redirecting */}
            {loading && !error && (
              <div className="d-flex align-items-center mb-3 py-2 px-3"
                   style={{ background: "rgba(107,189,208,0.1)", border: "1px solid rgba(107,189,208,0.28)", color: "var(--pm-teal)", borderRadius: 12, fontSize: "0.87rem" }}>
                <div className="spinner-border spinner-border-sm me-2" style={{ color: "var(--pm-teal)" }}></div>
                <span>Redirecting to your dashboard…</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              {/* Email */}
              <div className="mb-3">
                <label className="form-label small fw-semibold mb-1 d-block" style={{ color: col.label }}>
                  <i className="fas fa-envelope me-1" style={{ color: "var(--pm-teal)" }}></i> Email
                </label>
                <input
                  type="email"
                  className={`form-control form-control-sm auth-input-v2 ${m}`}
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div className="mb-3">
                <label className="form-label small fw-semibold mb-1 d-block" style={{ color: col.label }}>
                  <i className="fas fa-lock me-1" style={{ color: "var(--pm-teal)" }}></i> Password
                </label>
                <div className="input-group input-group-sm">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`form-control auth-input-v2 ${m}`}
                    style={{ borderRight: "none", borderRadius: "12px 0 0 12px" }}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" className={`btn auth-eye-btn ${m}`}
                          onClick={() => setShowPassword(!showPassword)}>
                    <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="rememberMe"
                         style={{
                           background: isDark ? "rgba(255,255,255,0.1)" : "#f0f8fc",
                           borderColor: "rgba(107,189,208,0.4)"
                         }} />
                  <label className="form-check-label small" htmlFor="rememberMe" style={{ color: col.checkLabel }}>
                    Remember me
                  </label>
                </div>
                <Link to="/forgot-password" className="text-decoration-none small fw-semibold"
                      style={{ color: "var(--pm-teal)" }}>
                  Forgot Password?
                </Link>
              </div>

              {/* Submit */}
              <button type="submit" className="btn auth-button w-100 fw-semibold mb-3" disabled={loading}>
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-2"></span>Signing in…</>
                  : <><i className="fas fa-sign-in-alt me-2"></i>Sign In</>
                }
              </button>

              {/* Sign up link */}
              <p className="text-center small mb-0" style={{ color: col.muted }}>
                Don't have an account?{" "}
                <Link to="/register" className="text-decoration-none fw-semibold" style={{ color: "var(--pm-teal)" }}>
                  Sign up
                </Link>
              </p>
            </form>

            {/* Divider */}
            <div className="d-flex align-items-center my-3">
              <hr className="flex-grow-1 m-0" style={{ borderColor: col.divider }} />
              <span className="mx-3 small" style={{ color: col.muted }}>or</span>
              <hr className="flex-grow-1 m-0" style={{ borderColor: col.divider }} />
            </div>

            <GoogleAuth text="Continue with Google" />

            <p className="text-center small mb-0 mt-3" style={{ color: col.muted }}>
              <i className="fas fa-shield-alt me-1" style={{ color: "var(--pm-teal)" }}></i>
              Secured with end-to-end encryption
            </p>
          </div>

          {/* Back to home */}
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
