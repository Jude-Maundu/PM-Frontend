import React, { useState, useEffect, useCallback } from "react";
import { _registerToastDispatch } from "../utils/toast";

const ICONS = {
  success: "fa-check-circle",
  error:   "fa-times-circle",
  warning: "fa-exclamation-triangle",
  info:    "fa-info-circle",
};

const COLORS = {
  success: { bar: "#2ECC9A", icon: "#2ECC9A", bg: "rgba(46,204,154,0.12)",  border: "rgba(46,204,154,0.3)"  },
  error:   { bar: "#E85555", icon: "#E85555", bg: "rgba(232,85,85,0.12)",   border: "rgba(232,85,85,0.3)"   },
  warning: { bar: "#6BBDD0", icon: "#6BBDD0", bg: "rgba(107,189,208,0.12)", border: "rgba(107,189,208,0.3)" },
  info:    { bar: "#6BBDD0", icon: "#6BBDD0", bg: "rgba(107,189,208,0.12)", border: "rgba(107,189,208,0.3)" },
};

let _id = 0;

const ToastItem = ({ id, type, message, duration, onRemove }) => {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const c = COLORS[type] || COLORS.info;

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const step = 100 / (duration / 50);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p <= 0) { clearInterval(interval); return 0; }
        return p - step;
      });
    }, 50);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(id), 320);
    }, duration);
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, [id, duration, onRemove]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
        padding: "0.9rem 1rem",
        borderRadius: "14px",
        background: "rgba(15,30,40,0.96)",
        backdropFilter: "blur(20px)",
        border: `1px solid ${c.border}`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
        minWidth: "280px",
        maxWidth: "360px",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.32s cubic-bezier(0.4,0,0.2,1)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(110%)",
        marginBottom: "0.5rem",
      }}
    >
      <i
        className={`fas ${ICONS[type]}`}
        style={{ color: c.icon, fontSize: "1.1rem", marginTop: "1px", flexShrink: 0 }}
      />
      <span style={{ color: "#fff", fontSize: "0.875rem", lineHeight: 1.5, flex: 1 }}>
        {message}
      </span>
      <button
        onClick={() => { setVisible(false); setTimeout(() => onRemove(id), 320); }}
        style={{
          background: "none", border: "none", color: "rgba(255,255,255,0.4)",
          cursor: "pointer", padding: "0 0 0 0.25rem", fontSize: "0.85rem",
          lineHeight: 1, flexShrink: 0,
        }}
      >
        <i className="fas fa-times" />
      </button>
      {/* Progress bar */}
      <div
        style={{
          position: "absolute", bottom: 0, left: 0,
          height: "3px",
          width: `${progress}%`,
          background: c.bar,
          borderRadius: "0 0 0 14px",
          transition: "width 50ms linear",
        }}
      />
    </div>
  );
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  const dispatch = useCallback(({ type, message, duration }) => {
    const id = ++_id;
    setToasts((prev) => [...prev, { id, type, message, duration }]);
  }, []);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    _registerToastDispatch(dispatch);
  }, [dispatch]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column-reverse",
        alignItems: "flex-end",
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <div key={t.id} style={{ pointerEvents: "auto" }}>
          <ToastItem {...t} onRemove={remove} />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
