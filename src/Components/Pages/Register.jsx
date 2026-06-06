import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../../api/apiConfig";
import GoogleAuth from "../GoogleAuth";
import { Helmet } from "react-helmet-async";

function getRefFromUrl() {
  try {
    return new URLSearchParams(window.location.search).get("ref") || "";
  } catch {
    return "";
  }
}

const BOKEH = [
  { size: 12, top: "8%",  left: "22%", delay: "0s",   dur: "3.6s" },
  { size: 7,  top: "25%", left: "68%", delay: "0.9s", dur: "4.4s" },
  { size: 9,  top: "55%", left: "12%", delay: "1.4s", dur: "3.9s" },
  { size: 5,  top: "72%", left: "58%", delay: "0.3s", dur: "5.2s" },
  { size: 13, top: "40%", left: "42%", delay: "2.0s", dur: "3.7s" },
  { size: 6,  top: "82%", left: "30%", delay: "1.1s", dur: "4.6s" },
  { size: 10, top: "18%", left: "53%", delay: "2.3s", dur: "3.1s" },
  { size: 8,  top: "64%", left: "78%", delay: "1.7s", dur: "5.0s" },
  { size: 4,  top: "32%", left: "26%", delay: "0.6s", dur: "3.3s" },
  { size: 11, top: "90%", left: "72%", delay: "2.6s", dur: "5.5s" },
  { size: 7,  top: "12%", left: "38%", delay: "3.1s", dur: "4.1s" },
  { size: 9,  top: "76%", left: "18%", delay: "0.9s", dur: "4.0s" },
];

const Register = () => {
  const [username, setUsername]               = useState("");
  const [email, setEmail]                     = useState("");
  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole]                       = useState("user");
  const [phoneNumber, setPhoneNumber]         = useState("");
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState(null);
  const [success, setSuccess]                 = useState(null);
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [termsAccepted, setTermsAccepted]     = useState(false);
  const [referralCode, setReferralCode]       = useState(getRefFromUrl);
  const [isDark, setIsDark]                   = useState(true);

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

  // Password strength
  const getStrength = () => {
    if (!password.length) return 0;
    if (password.length < 6) return 1;
    if (password.length < 8) return 2;
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return 4;
    if (/^(?=.*[a-z])(?=.*[A-Z])/.test(password)) return 3;
    return 2;
  };
  const strength      = getStrength();
  const strengthText  = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColor = ["", "#e85555", "#f5a623", "#6bbdd0", "#2ecc9a"];

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) { setError("Passwords do not match!"); return; }
    if (password.length < 6)          { setError("Password must be at least 6 characters."); return; }
    if (!termsAccepted)               { setError("You must accept the Terms & Conditions."); return; }

    const phoneRegex = /^254\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError("Phone must be in format 254XXXXXXXXX (e.g. 254712345678).");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`,
        { username, email, password, role, phoneNumber, ...(referralCode.trim() ? { referralCode: referralCode.trim() } : {}) }
      );

      if (response.data.token)  localStorage.setItem("token", response.data.token);
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("role", response.data.user.role || role);
      }

      setSuccess("Account created! Redirecting to your dashboard…");

      setTimeout(() => {
        navigate(role === "photographer" ? "/photographer/dashboard" : "/buyer/dashboard");
      }, 2000);
    } catch (err) {
      if (err.response)     setError(err.response.data?.message || `Error: ${err.response.status}`);
      else if (err.request) setError("Cannot connect to server. Check your connection.");
      else                  setError(err.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`auth-page-v2 ${m}`}>
      <Helmet>
        <title>Create Account — Relic Snap</title>
        <meta name="description" content="Join Relic Snap — Kenya's photography marketplace. Sign up as a buyer to access premium photos, or as a photographer to sell your work." />
        <meta property="og:title" content="Join Relic Snap — Create Your Account" />
        <meta property="og:description" content="Sign up as a buyer or photographer on Kenya's leading photo marketplace." />
        <meta property="og:url" content="https://relicsnap.onrender.com/register" />
        <link rel="canonical" href="https://relicsnap.onrender.com/register" />
      </Helmet>

      {/* Mode toggle */}
      <button className={`auth-mode-toggle ${!isDark ? "is-light" : ""}`} onClick={() => setIsDark(!isDark)}>
        <i className={`fas ${isDark ? "fa-sun" : "fa-moon"}`}></i>
        {isDark ? "Light Mode" : "Dark Mode"}
      </button>

      {/* ── Left: Animated Panel ── */}
      <div className="auth-anim-panel d-none d-lg-flex">

        {BOKEH.map((b, i) => (
          <div key={i} className="bokeh-dot" style={{
            width: b.size, height: b.size,
            top: b.top, left: b.left,
            animationDelay: b.delay, animationDuration: b.dur,
          }} />
        ))}

        {/* Floating photo cards — different layout from login */}
        <div className="float-card" style={{ width: 190, height: 132, top: "6%", left: "14%", animation: "float2 7.2s ease-in-out infinite" }}>
          <img src="https://images.unsplash.com/photo-1492691527719-9d1e4e485a21?w=300&h=200&fit=crop" alt="" />
          <div className="fc-badge">Premium Collection</div>
        </div>

        <div className="float-card" style={{ width: 165, height: 118, top: "22%", right: "5%", animation: "float1 6.6s ease-in-out infinite 0.9s" }}>
          <img src="https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=300&h=200&fit=crop" alt="" />
        </div>

        <div className="float-card" style={{ width: 220, height: 155, top: "42%", left: "6%", animation: "float4 8.5s ease-in-out infinite 1.5s" }}>
          <img src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=300&h=200&fit=crop" alt="" />
          <div className="fc-badge">City Lights</div>
        </div>

        <div className="float-card" style={{ width: 145, height: 105, top: "65%", right: "12%", animation: "float3 7.5s ease-in-out infinite 2.4s" }}>
          <img src="https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=300&h=200&fit=crop" alt="" />
        </div>

        <div className="float-card" style={{ width: 125, height: 88, top: "84%", left: "28%", animation: "float1 6.2s ease-in-out infinite 0.3s" }}>
          <img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop" alt="" />
        </div>

        {/* Brand overlay */}
        <div className="auth-panel-brand">
          <div className="auth-panel-logo-icon">
            <i className="fas fa-user-plus"></i>
          </div>
          <h2 className="auth-panel-heading">Join Relic Snap</h2>
          <p className="auth-panel-sub">Sell or discover premium photography</p>
          <div className="auth-panel-stats">
            <div className="auth-stat"><strong>Free</strong><span>To Join</span></div>
            <div className="auth-stat"><strong>100%</strong><span>Secure</span></div>
            <div className="auth-stat"><strong>24/7</strong><span>Support</span></div>
          </div>
        </div>
      </div>

      {/* ── Right: Form Panel ── */}
      <div className="auth-form-panel" style={{ paddingTop: "1.5rem", paddingBottom: "1.5rem" }}>
        <div className="auth-form-inner">

          {/* Mobile brand */}
          <div className="d-flex d-lg-none align-items-center gap-2 mb-3">
            <div className="auth-panel-logo-icon" style={{ width: 40, height: 40, fontSize: "1rem", borderRadius: 10 }}>
              <i className="fas fa-camera"></i>
            </div>
            <span style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.3rem", color: col.heading }}>
              Relic Snap
            </span>
          </div>

          <div className={`auth-card-v2 ${m}`}>

            {/* Header */}
            <div className="text-center mb-3">
              <div className="auth-icon-circle" style={{ margin: "0 auto" }}>
                <i className="fas fa-user-plus"></i>
              </div>
              <h4 style={{ color: col.heading, fontFamily: "var(--font-serif)", fontWeight: 700, marginTop: "0.85rem", marginBottom: "0.2rem" }}>
                Create Account
              </h4>
              <p style={{ color: col.subtitle, fontSize: "0.86rem", margin: 0 }}>Join our community today</p>
            </div>

            {/* Alerts */}
            {error && (
              <div className="d-flex align-items-center mb-3 py-2 px-3"
                   style={{ background: "rgba(232,85,85,0.1)", border: "1px solid rgba(232,85,85,0.3)", color: "#ff8080", borderRadius: 12, fontSize: "0.85rem" }}>
                <i className="fas fa-exclamation-circle me-2 flex-shrink-0"></i>
                <span className="flex-grow-1">{error}</span>
                <button type="button" onClick={() => setError(null)}
                        style={{ background: "none", border: "none", color: "#ff8080", cursor: "pointer", padding: 0 }}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}

            {success && (
              <div className="d-flex align-items-center mb-3 py-2 px-3"
                   style={{ background: "rgba(46,204,154,0.1)", border: "1px solid rgba(46,204,154,0.3)", color: "#6ee7b7", borderRadius: 12, fontSize: "0.85rem" }}>
                <i className="fas fa-check-circle me-2"></i>
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleRegister}>

              {/* Username */}
              <div className="mb-3">
                <label className="form-label small fw-semibold mb-1 d-block" style={{ color: col.label }}>
                  <i className="fas fa-user me-1" style={{ color: "var(--pm-teal)" }}></i> Username
                </label>
                <input type="text"
                  className={`form-control form-control-sm auth-input-v2 ${m}`}
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="form-label small fw-semibold mb-1 d-block" style={{ color: col.label }}>
                  <i className="fas fa-envelope me-1" style={{ color: "var(--pm-teal)" }}></i> Email
                </label>
                <input type="email"
                  className={`form-control form-control-sm auth-input-v2 ${m}`}
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Phone */}
              <div className="mb-3">
                <label className="form-label small fw-semibold mb-1 d-block" style={{ color: col.label }}>
                  <i className="fas fa-phone me-1" style={{ color: "var(--pm-teal)" }}></i> Phone (254XXXXXXXXX)
                </label>
                <input type="tel"
                  className={`form-control form-control-sm auth-input-v2 ${m}`}
                  placeholder="254712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>

              {/* Referral Code */}
              <div className="mb-3">
                <label className="form-label small fw-semibold mb-1 d-block" style={{ color: col.label }}>
                  <i className="fas fa-ticket-alt me-1" style={{ color: "var(--pm-teal)" }}></i> Referral Code{" "}
                  <span style={{ color: col.muted, fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  type="text"
                  className={`form-control form-control-sm auth-input-v2 ${m}`}
                  placeholder="Enter referral code if you have one"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
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
                    placeholder="Create password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" className={`btn auth-eye-btn ${m}`}
                          onClick={() => setShowPassword(!showPassword)}>
                    <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>

                {password.length > 0 && (
                  <div className="mt-2 d-flex align-items-center gap-2">
                    <div className={`auth-progress-track flex-grow-1 ${m}`} style={{ borderRadius: 2 }}>
                      <div style={{
                        height: 4,
                        width: `${(strength / 4) * 100}%`,
                        background: strengthColor[strength],
                        borderRadius: 2,
                        transition: "width 0.3s ease, background 0.3s ease"
                      }} />
                    </div>
                    <small style={{ color: strengthColor[strength], fontWeight: 600, fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                      {strengthText[strength]}
                    </small>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="mb-3">
                <label className="form-label small fw-semibold mb-1 d-block" style={{ color: col.label }}>
                  <i className="fas fa-check-circle me-1" style={{ color: "var(--pm-teal)" }}></i> Confirm Password
                </label>
                <div className="input-group input-group-sm">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    className={`form-control auth-input-v2 ${m}`}
                    style={{ borderRight: "none", borderRadius: "12px 0 0 12px" }}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button type="button" className={`btn auth-eye-btn ${m}`}
                          onClick={() => setShowConfirmPass(!showConfirmPass)}>
                    <i className={`fas ${showConfirmPass ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
              </div>

              {/* Role selector */}
              <div className="mb-3">
                <label className="form-label small fw-semibold mb-2 d-block" style={{ color: col.label }}>
                  Register as
                </label>
                <div className="d-flex gap-2">
                  {[
                    { value: "user",         icon: "fa-user",   label: "Buyer",        desc: "Buy photos" },
                    { value: "photographer", icon: "fa-camera", label: "Photographer", desc: "Sell photos" },
                  ].map((r) => (
                    <div
                      key={r.value}
                      className={`auth-role-pill ${m} ${role === r.value ? "active" : ""}`}
                      onClick={() => setRole(r.value)}
                    >
                      <i className={`fas ${r.icon} mb-1`} style={{ color: role === r.value ? "var(--pm-teal)" : col.muted, display: "block" }}></i>
                      <small className="d-block fw-semibold" style={{ color: role === r.value ? col.heading : col.muted, fontSize: "0.82rem" }}>
                        {r.label}
                      </small>
                      <small className="d-block" style={{ color: col.muted, fontSize: "0.72rem" }}>{r.desc}</small>
                    </div>
                  ))}
                </div>
              </div>

              {/* Terms */}
              <div className="mb-3 form-check">
                <input className="form-check-input" type="checkbox" id="terms"
                       checked={termsAccepted}
                       onChange={(e) => setTermsAccepted(e.target.checked)}
                       style={{ background: isDark ? "rgba(255,255,255,0.1)" : "#f0f8fc", borderColor: "rgba(107,189,208,0.4)" }} />
                <label className="form-check-label small" htmlFor="terms" style={{ color: col.checkLabel }}>
                  I agree to the{" "}
                  <Link to="/terms" className="text-decoration-none fw-semibold" style={{ color: "var(--pm-teal)" }}>Terms & Conditions</Link>
                </label>
              </div>

              {/* Submit */}
              <button type="submit" className="btn auth-button w-100 fw-semibold mb-2" disabled={loading}>
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-2"></span>Creating account…</>
                  : <><i className="fas fa-user-plus me-2"></i>Sign Up</>
                }
              </button>

              <p className="text-center small mb-0" style={{ color: col.muted }}>
                Already have an account?{" "}
                <Link to="/login" className="text-decoration-none fw-semibold" style={{ color: "var(--pm-teal)" }}>
                  Sign in
                </Link>
              </p>
            </form>

            {/* Divider */}
            <div className="d-flex align-items-center my-3">
              <hr className="flex-grow-1 m-0" style={{ borderColor: col.divider }} />
              <span className="mx-3 small" style={{ color: col.muted }}>or</span>
              <hr className="flex-grow-1 m-0" style={{ borderColor: col.divider }} />
            </div>

            <GoogleAuth text="Sign up with Google" />

            <p className="text-center small mb-0 mt-3" style={{ color: col.muted }}>
              <i className="fas fa-shield-alt me-1" style={{ color: "var(--pm-teal)" }}></i>
              Your data is always protected
            </p>
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

export default Register;
