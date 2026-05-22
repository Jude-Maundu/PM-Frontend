import React, { useState, useRef } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../api/apiConfig";
import { toast } from "../utils/toast";

const FaceSearchModal = ({ onClose, onResults }) => {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [searching, setSearching] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (!f || !f.type.startsWith("image/")) { toast.error("Please select an image"); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setUnavailable(false);
  };

  const handleSearch = async () => {
    if (!file) { toast.error("Upload a selfie first"); return; }
    setSearching(true);
    try {
      const form = new FormData();
      form.append("selfie", file);
      const res = await axios.post(API_ENDPOINTS.MEDIA.FACE_SEARCH, form, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.data.available === false) {
        setUnavailable(true);
      } else {
        toast.success(`Found ${res.data.matches?.length || 0} photos with your face`);
        onResults?.(res.data.matches || []);
        onClose();
      }
    } catch (err) {
      if (err.response?.data?.available === false) {
        setUnavailable(true);
      } else {
        toast.error(err.response?.data?.message || "Search failed");
      }
    } finally {
      setSearching(false);
    }
  };

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
              <i className="fas fa-user-circle me-2" style={{ color: "var(--mc-accent)" }}></i>
              Find My Photo
            </h5>
            <button className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {unavailable ? (
              <div className="text-center py-3">
                <div style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: "rgba(107,189,208,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 1rem",
                }}>
                  <i className="fas fa-satellite-dish" style={{ fontSize: "1.8rem", color: "var(--mc-accent)" }}></i>
                </div>
                <p className="text-white fw-semibold mb-1">Coming Soon</p>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.85rem" }}>
                  AI face search is being set up. For now, browse the gallery and use tags to find your photos.
                </p>
                <button className="btn btn-sm mt-2" style={{ background: "rgba(107,189,208,0.15)", color: "var(--mc-accent)", border: "1px solid rgba(107,189,208,0.25)", borderRadius: 8 }} onClick={onClose}>
                  Got it
                </button>
              </div>
            ) : (
              <>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }} className="mb-3">
                  Upload a clear selfie and we'll find photos of you across the gallery instantly.
                </p>

                {/* Upload zone */}
                <div
                  onClick={() => inputRef.current?.click()}
                  style={{
                    border: "2px dashed rgba(107,189,208,0.3)",
                    borderRadius: 12, padding: "1.5rem",
                    textAlign: "center", cursor: "pointer",
                    background: "rgba(107,189,208,0.04)",
                    marginBottom: "1rem",
                    transition: "border-color 0.2s",
                  }}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => handleFile(e.target.files[0])}
                  />
                  {preview ? (
                    <img
                      src={preview}
                      alt="selfie"
                      style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--mc-accent)" }}
                    />
                  ) : (
                    <>
                      <i className="fas fa-camera" style={{ fontSize: "2rem", color: "var(--mc-accent)", marginBottom: "0.5rem", display: "block" }}></i>
                      <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>Tap to upload a selfie</span>
                    </>
                  )}
                </div>

                {preview && (
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", textAlign: "center" }} className="mb-3">
                    Tap photo to change
                  </p>
                )}

                <button
                  className="btn w-100"
                  onClick={handleSearch}
                  disabled={searching || !file}
                  style={{
                    background: file ? "var(--mc-accent)" : "rgba(107,189,208,0.15)",
                    color: "#fff", border: "none", borderRadius: 8, padding: "0.7rem", fontWeight: 600,
                  }}
                >
                  {searching ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>Scanning gallery…</>
                  ) : (
                    <><i className="fas fa-search me-2"></i>Find My Photos</>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceSearchModal;
