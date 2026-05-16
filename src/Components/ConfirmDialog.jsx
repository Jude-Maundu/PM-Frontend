import React, { useState, useEffect } from "react";
import { _registerConfirm, _resolveConfirm } from "../utils/confirm";

const ConfirmDialog = () => {
  const [state, setState] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    _registerConfirm((opts) => {
      setState(opts);
      requestAnimationFrame(() => setVisible(true));
    });
  }, []);

  const close = (result) => {
    setVisible(false);
    setTimeout(() => {
      setState(null);
      _resolveConfirm(result);
    }, 250);
  };

  if (!state) return null;

  const {
    message,
    title       = "Are you sure?",
    confirmText = "Confirm",
    cancelText  = "Cancel",
    danger      = false,
  } = state;

  const confirmBg = danger
    ? "linear-gradient(135deg, #E85555, #c94444)"
    : "linear-gradient(135deg, #6BBDD0, #5AAFC3)";

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(6px)",
        transition: "opacity 0.25s ease",
        opacity: visible ? 1 : 0,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) close(false); }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "rgba(15,30,40,0.97)",
          backdropFilter: "blur(24px)",
          border: danger
            ? "1px solid rgba(232,85,85,0.3)"
            : "1px solid rgba(107,189,208,0.25)",
          borderRadius: "20px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
          padding: "2rem",
          transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease",
          transform: visible ? "scale(1) translateY(0)" : "scale(0.92) translateY(20px)",
          opacity: visible ? 1 : 0,
        }}
      >
        {/* Icon */}
        <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
          <div
            style={{
              width: "56px", height: "56px",
              borderRadius: "50%",
              background: danger ? "rgba(232,85,85,0.15)" : "rgba(107,189,208,0.15)",
              border: danger ? "1px solid rgba(232,85,85,0.3)" : "1px solid rgba(107,189,208,0.3)",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.4rem",
              color: danger ? "#E85555" : "#6BBDD0",
            }}
          >
            <i className={`fas ${danger ? "fa-exclamation-triangle" : "fa-question-circle"}`} />
          </div>
        </div>

        {/* Title */}
        <h5
          style={{
            fontFamily: "var(--font-serif)", fontWeight: 700,
            color: "#fff", textAlign: "center", marginBottom: "0.6rem",
            fontSize: "1.15rem",
          }}
        >
          {title}
        </h5>

        {/* Message */}
        <p
          style={{
            color: "rgba(255,255,255,0.55)", textAlign: "center",
            fontSize: "0.88rem", lineHeight: 1.6,
            marginBottom: "1.75rem",
          }}
        >
          {message}
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={() => close(false)}
            style={{
              flex: 1, padding: "0.7rem 1rem",
              borderRadius: "999px",
              background: "transparent",
              border: "1.5px solid rgba(255,255,255,0.18)",
              color: "rgba(255,255,255,0.7)",
              fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: "0.88rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "rgba(255,255,255,0.7)";
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={() => close(true)}
            style={{
              flex: 1, padding: "0.7rem 1rem",
              borderRadius: "999px",
              background: confirmBg,
              border: "none",
              color: "#fff",
              fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "0.88rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: danger
                ? "0 4px 16px rgba(232,85,85,0.3)"
                : "0 4px 16px rgba(107,189,208,0.3)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
