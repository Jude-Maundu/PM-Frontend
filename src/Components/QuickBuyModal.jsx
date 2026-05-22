import React, { useState } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../api/apiConfig";
import { toast } from "../utils/toast";

const QuickBuyModal = ({ media, onClose, onSuccess }) => {
  const [phone, setPhone] = useState(
    JSON.parse(localStorage.getItem("user") || "{}")?.phoneNumber || ""
  );
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("form"); // form | waiting | done

  const token = localStorage.getItem("token");

  const handleBuy = async (e) => {
    e.preventDefault();
    const cleaned = phone.replace(/\s/g, "");
    if (!/^(07|01|2547|2541)\d{8}$/.test(cleaned)) {
      toast.error("Enter a valid Kenyan phone number");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        API_ENDPOINTS.PAYMENTS.BUY,
        { mediaId: media._id, phone: cleaned },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStep("waiting");
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment initiation failed");
      setLoading(false);
      return;
    }
    setLoading(false);
  };

  const handleConfirmPaid = () => {
    setStep("done");
    toast.success("Payment confirmed! Check your downloads.");
    onSuccess?.();
    setTimeout(onClose, 2000);
  };

  const imgSrc = media.watermarkedUrl || media.fileUrl;

  return (
    <div
      className="modal show d-block"
      style={{ background: "rgba(0,0,0,0.9)", zIndex: 4000 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content mc-card border-0" style={{ maxWidth: 400, margin: "auto" }}>
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold text-white">
              <i className="fas fa-bolt me-2" style={{ color: "#4CC9A6" }}></i>
              Quick Buy
            </h5>
            <button className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {/* Photo preview */}
            <div className="position-relative mb-3 rounded-3 overflow-hidden" style={{ height: 160 }}>
              <img
                src={imgSrc}
                alt={media.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)",
              }}></div>
              <div style={{ position: "absolute", bottom: 10, left: 12 }}>
                <p className="mb-0 text-white fw-semibold" style={{ fontSize: "0.9rem" }}>{media.title}</p>
                <p className="mb-0" style={{ color: "#4CC9A6", fontWeight: 700 }}>
                  KES {Number(media.price).toLocaleString()}
                </p>
              </div>
            </div>

            {step === "form" && (
              <form onSubmit={handleBuy}>
                <label className="form-label" style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem" }}>
                  M-Pesa Phone Number
                </label>
                <div className="input-group mb-3">
                  <span
                    className="input-group-text"
                    style={{ background: "rgba(76,201,166,0.1)", border: "1px solid rgba(76,201,166,0.25)", color: "#4CC9A6" }}
                  >
                    <i className="fas fa-mobile-alt"></i>
                  </span>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="07XX XXX XXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ background: "rgba(76,201,166,0.05)", border: "1px solid rgba(76,201,166,0.2)", color: "#fff" }}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn w-100"
                  disabled={loading}
                  style={{ background: "#4CC9A6", color: "#0f1e28", fontWeight: 700, border: "none", borderRadius: 8, padding: "0.7rem" }}
                >
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>Sending STK Push…</>
                  ) : (
                    <><i className="fas fa-bolt me-2"></i>Pay KES {Number(media.price).toLocaleString()} Now</>
                  )}
                </button>
              </form>
            )}

            {step === "waiting" && (
              <div className="text-center py-3">
                <div
                  style={{
                    width: 64, height: 64, borderRadius: "50%",
                    background: "rgba(76,201,166,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 1rem",
                  }}
                >
                  <i className="fas fa-mobile-alt" style={{ fontSize: "1.8rem", color: "#4CC9A6" }}></i>
                </div>
                <p className="text-white fw-semibold mb-1">Check your phone!</p>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
                  Enter your M-Pesa PIN when prompted. Then tap below.
                </p>
                <button
                  className="btn w-100 mt-2"
                  onClick={handleConfirmPaid}
                  style={{ background: "#4CC9A6", color: "#0f1e28", fontWeight: 700, border: "none", borderRadius: 8, padding: "0.65rem" }}
                >
                  <i className="fas fa-check me-2"></i>I've completed payment
                </button>
                <button
                  className="btn btn-link w-100 mt-1"
                  onClick={() => setStep("form")}
                  style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}
                >
                  ← Try again
                </button>
              </div>
            )}

            {step === "done" && (
              <div className="text-center py-3">
                <i className="fas fa-check-circle" style={{ fontSize: "3rem", color: "#4CC9A6", marginBottom: "0.75rem", display: "block" }}></i>
                <p className="text-white fw-semibold">Photo unlocked!</p>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>Find it in your Downloads section.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickBuyModal;
