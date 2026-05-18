import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../api/apiConfig";
import { toast } from "../utils/toast";

const STEPS = ["Welcome", "Profile", "First Upload", "Portfolio"];

const OnboardingWizard = () => {
  const navigate = useNavigate();

  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [bio, setBio] = useState("");
  const [profilePreview, setProfilePreview] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const isDismissed = localStorage.getItem("onboarding_complete");
      const isNewPhotographer = user.role === "photographer" && !isDismissed && !user.profilePicture;
      if (isNewPhotographer) setVisible(true);
    } catch {
      // ignore
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem("onboarding_complete", "true");
    setVisible(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setProfilePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    const user = (() => {
      try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
    })();
    if (!user._id) { setStep(2); return; }

    setSaving(true);
    try {
      const formData = new FormData();
      if (bio) formData.append("bio", bio);
      if (profileFile) formData.append("profilePicture", profileFile);

      const res = await axios.put(API_ENDPOINTS.AUTH.UPDATE_USER(user._id), formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
        timeout: 15000,
      });
      const updated = res.data?.user || res.data;
      if (updated) {
        localStorage.setItem("user", JSON.stringify({ ...user, ...updated }));
      }
      toast.success("Profile updated!");
      setStep(2);
    } catch {
      toast.error("Could not save profile, but you can continue.");
      setStep(2);
    } finally {
      setSaving(false);
    }
  };

  if (!visible) return null;

  const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.85)",
    zIndex: 2000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  };

  const cardStyle = {
    background: "rgba(10,20,30,0.97)",
    border: "1px solid rgba(107,189,208,0.25)",
    borderRadius: 20,
    backdropFilter: "blur(24px)",
    width: "100%",
    maxWidth: 480,
    padding: "2rem",
    boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(107,189,208,0.1)",
  };

  const btnPrimary = {
    background: "var(--pm-teal, #6bbdd0)",
    color: "#fff",
    border: "none",
    borderRadius: 999,
    padding: "10px 32px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "0.9rem",
  };

  const btnSecondary = {
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.5)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 999,
    padding: "8px 20px",
    fontWeight: 500,
    cursor: "pointer",
    fontSize: "0.85rem",
  };

  return (
    <div style={overlayStyle}>
      <div style={cardStyle}>
        {/* Step dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 28 }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === step ? 24 : 8,
                height: 8,
                borderRadius: 99,
                background: i === step ? "var(--pm-teal, #6bbdd0)" : i < step ? "rgba(107,189,208,0.45)" : "rgba(255,255,255,0.12)",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "rgba(107,189,208,0.12)",
                border: "1px solid rgba(107,189,208,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <i className="fas fa-camera" style={{ color: "var(--pm-teal, #6bbdd0)", fontSize: "1.8rem" }}></i>
            </div>
            <h3 style={{ fontWeight: 700, color: "#fff", marginBottom: 10 }}>Welcome to PhotoMarket!</h3>
            <p style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 28 }}>
              Let's set up your photographer profile so you can start selling your incredible work.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button style={btnPrimary} onClick={() => setStep(1)}>
                <i className="fas fa-arrow-right me-2"></i>Get Started
              </button>
              <button style={btnSecondary} onClick={dismiss}>Skip for now</button>
            </div>
          </div>
        )}

        {/* Step 1: Profile */}
        {step === 1 && (
          <div>
            <h4 style={{ fontWeight: 700, color: "#fff", marginBottom: 6 }}>Set Up Your Profile</h4>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.87rem", marginBottom: 20 }}>
              Add a profile photo and bio to build trust with buyers.
            </p>

            {/* Photo upload */}
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: "50%",
                  background: profilePreview ? "transparent" : "rgba(107,189,208,0.08)",
                  border: "2px dashed rgba(107,189,208,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 8px",
                  cursor: "pointer",
                  overflow: "hidden",
                }}
              >
                {profilePreview ? (
                  <img src={profilePreview} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <i className="fas fa-camera" style={{ color: "rgba(107,189,208,0.6)", fontSize: "1.4rem" }}></i>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
              <button onClick={() => fileInputRef.current?.click()} style={{ ...btnSecondary, padding: "6px 16px", fontSize: "0.78rem" }}>
                {profilePreview ? "Change Photo" : "Upload Photo"}
              </button>
            </div>

            {/* Bio */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.82rem", display: "block", marginBottom: 6 }}>Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell buyers about yourself and your photography style..."
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(107,189,208,0.3)",
                  borderRadius: 10,
                  color: "#fff",
                  padding: "10px 14px",
                  fontSize: "0.87rem",
                  minHeight: 90,
                  resize: "vertical",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button style={btnSecondary} onClick={dismiss}>Skip for now</button>
              <button style={btnPrimary} onClick={handleSaveProfile} disabled={saving}>
                {saving ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="fas fa-save me-2"></i>}
                Save & Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: First Upload */}
        {step === 2 && (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "rgba(107,189,208,0.12)",
                border: "1px solid rgba(107,189,208,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <i className="fas fa-cloud-upload-alt" style={{ color: "var(--pm-teal, #6bbdd0)", fontSize: "1.8rem" }}></i>
            </div>
            <h4 style={{ fontWeight: 700, color: "#fff", marginBottom: 8 }}>Upload Your First Photo</h4>
            <p style={{ color: "rgba(255,255,255,0.45)", marginBottom: 28, fontSize: "0.87rem" }}>
              Share your best work with thousands of buyers on PhotoMarket.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                style={btnPrimary}
                onClick={() => { dismiss(); navigate("/photographer/upload"); }}
              >
                <i className="fas fa-upload me-2"></i>Upload Now
              </button>
              <button style={btnSecondary} onClick={() => setStep(3)}>Skip</button>
            </div>
          </div>
        )}

        {/* Step 3: Portfolio */}
        {step === 3 && (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "rgba(107,189,208,0.12)",
                border: "1px solid rgba(107,189,208,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <i className="fas fa-globe" style={{ color: "var(--pm-teal, #6bbdd0)", fontSize: "1.8rem" }}></i>
            </div>
            <h4 style={{ fontWeight: 700, color: "#fff", marginBottom: 8 }}>Set Your Portfolio</h4>
            <p style={{ color: "rgba(255,255,255,0.45)", marginBottom: 28, fontSize: "0.87rem" }}>
              Create a stunning public portfolio to attract clients and showcase your talent.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                style={btnPrimary}
                onClick={() => { dismiss(); navigate("/photographer/portfolio"); }}
              >
                <i className="fas fa-globe me-2"></i>Create Portfolio
              </button>
              <button style={{ ...btnPrimary, background: "var(--pm-success, #2ecc9a)" }} onClick={dismiss}>
                <i className="fas fa-check me-2"></i>Finish Setup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingWizard;
