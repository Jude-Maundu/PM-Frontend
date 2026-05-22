import React, { useRef, useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { SITE_URL } from "../api/apiConfig";
import { toast } from "../utils/toast";

const GalleryQRModal = ({ album, onClose }) => {
  const url = `${SITE_URL}/gallery/${album._id}`;
  const svgRef = useRef(null);
  const [eventDisplay, setEventDisplay] = useState(false);

  // Exit event display on Escape
  useEffect(() => {
    if (!eventDisplay) return;
    const handler = (e) => { if (e.key === "Escape") setEventDisplay(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [eventDisplay]);

  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => toast.success("Gallery link copied!"));
  };

  const downloadQR = () => {
    const svg = svgRef.current?.querySelector("svg");
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${album.name || "gallery"}-qr.svg`;
    a.click();
  };

  // Full-screen event display mode
  if (eventDisplay) {
    return (
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "#0a1628",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: "1.5rem",
          cursor: "pointer",
        }}
        onClick={() => setEventDisplay(false)}
      >
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", letterSpacing: "0.1em", marginBottom: 0 }}>
          TAP TO EXIT · PRESS ESC
        </p>
        <div style={{ background: "#fff", padding: 24, borderRadius: 20 }} ref={svgRef}>
          <QRCodeSVG value={url} size={280} level="H" includeMargin={false} />
        </div>
        <p style={{ color: "#fff", fontWeight: 700, fontSize: "1.4rem", textAlign: "center", maxWidth: 400, lineHeight: 1.3 }}>
          {album.name}
        </p>
        <p style={{ color: "rgba(107,189,208,0.8)", fontSize: "1rem", marginTop: -8 }}>
          Scan to browse &amp; buy your photos
        </p>
        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.72rem", letterSpacing: "0.06em", marginTop: 8 }}>
          {url}
        </p>
      </div>
    );
  }

  return (
    <div
      className="modal show d-block"
      style={{ background: "rgba(0,0,0,0.85)", zIndex: 4000 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content mc-card border-0" style={{ maxWidth: 400, margin: "auto" }}>
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold text-white">
              <i className="fas fa-qrcode me-2" style={{ color: "var(--mc-accent)" }}></i>
              Share Gallery
            </h5>
            <button className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body text-center py-3">
            <p className="mb-1 fw-semibold text-white">{album.name}</p>
            <p className="mb-4" style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8rem" }}>
              Attendees scan this to browse &amp; buy photos
            </p>

            {/* QR Code */}
            <div
              ref={svgRef}
              style={{
                display: "inline-block",
                padding: 16,
                background: "#fff",
                borderRadius: 12,
                marginBottom: "1.25rem",
              }}
            >
              <QRCodeSVG
                value={url}
                size={200}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: "/logo192.png",
                  height: 36,
                  width: 36,
                  excavate: true,
                }}
              />
            </div>

            {/* URL row */}
            <div
              className="d-flex align-items-center gap-2 p-2 rounded-3 mb-3"
              style={{ background: "rgba(107,189,208,0.08)", border: "1px solid rgba(107,189,208,0.2)" }}
            >
              <span
                className="text-truncate flex-grow-1"
                style={{ color: "var(--mc-accent)", fontSize: "0.78rem" }}
              >
                {url}
              </span>
              <button
                className="btn btn-sm flex-shrink-0"
                style={{ background: "rgba(107,189,208,0.15)", color: "var(--mc-accent)", border: "none" }}
                onClick={copyLink}
              >
                <i className="fas fa-copy"></i>
              </button>
            </div>

            {/* Action buttons */}
            <div className="d-flex gap-2 mb-2">
              <button
                className="btn btn-sm flex-grow-1"
                style={{ background: "var(--mc-accent)", color: "#fff", border: "none", borderRadius: 8 }}
                onClick={copyLink}
              >
                <i className="fas fa-link me-2"></i>Copy Link
              </button>
              <button
                className="btn btn-sm flex-grow-1"
                style={{ background: "rgba(107,189,208,0.12)", color: "var(--mc-accent)", border: "1px solid rgba(107,189,208,0.25)", borderRadius: 8 }}
                onClick={downloadQR}
              >
                <i className="fas fa-download me-2"></i>Download QR
              </button>
            </div>

            {/* Event display button */}
            <button
              className="btn btn-sm w-100 mt-1"
              style={{ background: "rgba(76,201,166,0.12)", color: "#4CC9A6", border: "1px solid rgba(76,201,166,0.3)", borderRadius: 8, padding: "0.55rem" }}
              onClick={() => setEventDisplay(true)}
            >
              <i className="fas fa-expand me-2"></i>Display at Event (Fullscreen)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryQRModal;
