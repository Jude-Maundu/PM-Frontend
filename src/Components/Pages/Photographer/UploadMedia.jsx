import React, { useState, useEffect, useRef } from "react";
import PhotographerLayout from "./PhotographerLayout";
import PageHeader from "../../PageHeader";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../../api/apiConfig";
import { toast } from "../../../utils/toast";

const MAX_FILES = 20;
const MAX_SIZE_MB = 15;

const PhotographerUpload = () => {
  const [files, setFiles] = useState([]);           // [{file, preview, id}]
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [userId, setUserId] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");
    if (!token || (role !== "photographer" && role !== "admin")) {
      navigate("/login");
      return;
    }
    try {
      const user = JSON.parse(userStr);
      setUserId(user._id || user.id);
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  const addFiles = (incoming) => {
    const valid = Array.from(incoming).filter((f) => {
      if (!f.type.startsWith("image/") && !f.type.startsWith("video/")) {
        toast.error(`${f.name}: only images/videos allowed`);
        return false;
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`${f.name}: exceeds ${MAX_SIZE_MB}MB limit`);
        return false;
      }
      return true;
    });

    setFiles((prev) => {
      const combined = [
        ...prev,
        ...valid.map((f) => ({ file: f, preview: URL.createObjectURL(f), id: crypto.randomUUID() })),
      ];
      if (combined.length > MAX_FILES) {
        toast.error(`Max ${MAX_FILES} files at once`);
        return combined.slice(0, MAX_FILES);
      }
      return combined;
    });
  };

  const removeFile = (id) => {
    setFiles((prev) => {
      const removed = prev.find((f) => f.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) { toast.error("Not authenticated"); return; }
    if (files.length === 0) { toast.error("Select at least one photo"); return; }
    if (!price || Number(price) < 0) { toast.error("Enter a valid price"); return; }

    setUploading(true);
    setProgress(0);

    const form = new FormData();
    files.forEach((f) => form.append("files", f.file));
    form.append("price", price);
    form.append("description", description);
    if (tags.trim()) form.append("tags", JSON.stringify(tags.split(",").map((t) => t.trim()).filter(Boolean)));
    form.append("photographer", userId);

    try {
      await axios.post(`${API_BASE_URL}/media/bulk-upload`, form, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total)),
      });

      toast.success(`${files.length} photo${files.length > 1 ? "s" : ""} uploaded!`);
      files.forEach((f) => URL.revokeObjectURL(f.preview));
      setFiles([]);
      setPrice("");
      setDescription("");
      setTags("");
      setProgress(0);
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <PhotographerLayout>
      <div className="mc-page">
        <PageHeader
          title="Upload Photos"
          subtitle={`Select up to ${MAX_FILES} photos — watermarks applied automatically`}
        />

        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            {/* Left: drop zone + grid */}
            <div className="col-lg-8">
              {/* Drop Zone */}
              <div
                className="mc-card"
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragging ? "var(--mc-accent)" : "rgba(107,189,208,0.25)"}`,
                  background: dragging ? "rgba(107,189,208,0.06)" : "rgba(107,189,208,0.03)",
                  cursor: "pointer",
                  textAlign: "center",
                  padding: "2rem",
                  transition: "border-color 0.2s, background 0.2s",
                  marginBottom: "1rem",
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={(e) => addFiles(e.target.files)}
                />
                <i className="fas fa-cloud-upload-alt" style={{ fontSize: "2.5rem", color: "var(--mc-accent)", marginBottom: "0.75rem", display: "block" }}></i>
                <p style={{ color: "#fff", fontWeight: 600, marginBottom: "0.25rem" }}>
                  {dragging ? "Drop photos here" : "Click or drag photos here"}
                </p>
                <small style={{ color: "rgba(255,255,255,0.4)" }}>
                  JPG, PNG, MP4 · Max {MAX_SIZE_MB}MB each · Up to {MAX_FILES} files
                </small>
              </div>

              {/* Preview Grid */}
              {files.length > 0 && (
                <div className="mc-card">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.82rem" }}>
                      {files.length} file{files.length !== 1 ? "s" : ""} selected
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{ color: "rgba(255,100,100,0.7)", background: "none", border: "none", fontSize: "0.8rem" }}
                      onClick={() => { files.forEach((f) => URL.revokeObjectURL(f.preview)); setFiles([]); }}
                    >
                      <i className="fas fa-times me-1"></i>Clear all
                    </button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "0.6rem" }}>
                    {files.map((f) => (
                      <div key={f.id} style={{ position: "relative", borderRadius: 8, overflow: "hidden", aspectRatio: "1", background: "rgba(0,0,0,0.3)" }}>
                        <img
                          src={f.preview}
                          alt={f.file.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}
                          style={{
                            position: "absolute", top: 4, right: 4,
                            width: 22, height: 22, borderRadius: "50%",
                            background: "rgba(0,0,0,0.65)", border: "none",
                            color: "#fff", fontSize: "0.65rem", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                        <div style={{
                          position: "absolute", bottom: 0, left: 0, right: 0,
                          background: "rgba(0,0,0,0.5)", padding: "2px 4px",
                          fontSize: "0.6rem", color: "rgba(255,255,255,0.7)",
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                          {f.file.name}
                        </div>
                      </div>
                    ))}
                    {/* Add more tile */}
                    {files.length < MAX_FILES && (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          borderRadius: 8, border: "2px dashed rgba(107,189,208,0.25)",
                          aspectRatio: "1", display: "flex", flexDirection: "column",
                          alignItems: "center", justifyContent: "center", cursor: "pointer",
                          color: "rgba(107,189,208,0.6)", fontSize: "0.75rem", gap: 4,
                        }}
                      >
                        <i className="fas fa-plus" style={{ fontSize: "1.2rem" }}></i>
                        Add more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right: details */}
            <div className="col-lg-4">
              <div className="mc-card h-100 d-flex flex-column gap-3">
                <div>
                  <label className="form-label" style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem" }}>
                    Price per photo (KES) *
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="e.g. 150"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="0"
                    step="50"
                    style={{ background: "rgba(107,189,208,0.05)", border: "1px solid rgba(107,189,208,0.2)", color: "#fff" }}
                  />
                  <small style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.72rem" }}>
                    Recommended: KES 100 – 300 per photo
                  </small>
                </div>

                <div>
                  <label className="form-label" style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem" }}>
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Event name, date, location..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ background: "rgba(107,189,208,0.05)", border: "1px solid rgba(107,189,208,0.2)", color: "#fff", resize: "none" }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem" }}>
                    Tags <span style={{ color: "rgba(255,255,255,0.3)" }}>(comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="graduation, campus, nairobi"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    style={{ background: "rgba(107,189,208,0.05)", border: "1px solid rgba(107,189,208,0.2)", color: "#fff" }}
                  />
                </div>

                {/* Watermark notice */}
                <div style={{ background: "rgba(107,189,208,0.07)", border: "1px solid rgba(107,189,208,0.2)", borderRadius: 8, padding: "0.75rem" }}>
                  <div className="d-flex gap-2 align-items-start">
                    <i className="fas fa-shield-alt" style={{ color: "var(--mc-accent)", marginTop: 2 }}></i>
                    <div>
                      <p className="mb-0" style={{ color: "#fff", fontSize: "0.82rem", fontWeight: 600 }}>Auto-watermark enabled</p>
                      <small style={{ color: "rgba(255,255,255,0.45)" }}>
                        Previews shown to buyers will carry your name watermark. Originals delivered only after payment.
                      </small>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                {uploading && (
                  <div>
                    <div className="d-flex justify-content-between mb-1">
                      <small style={{ color: "rgba(255,255,255,0.5)" }}>Uploading…</small>
                      <small style={{ color: "var(--mc-accent)" }}>{progress}%</small>
                    </div>
                    <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 99 }}>
                      <div style={{ height: "100%", width: `${progress}%`, background: "var(--mc-accent)", borderRadius: 99, transition: "width 0.3s" }}></div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn mt-auto"
                  disabled={uploading || files.length === 0}
                  style={{
                    background: files.length > 0 ? "var(--mc-accent)" : "rgba(107,189,208,0.15)",
                    color: "#fff", border: "none", borderRadius: 8, padding: "0.7rem",
                    fontWeight: 600, fontSize: "0.95rem",
                    opacity: uploading ? 0.7 : 1,
                  }}
                >
                  {uploading ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>Uploading {files.length} photo{files.length !== 1 ? "s" : ""}…</>
                  ) : (
                    <><i className="fas fa-cloud-upload-alt me-2"></i>
                    Upload {files.length > 0 ? `${files.length} ` : ""}Photo{files.length !== 1 ? "s" : ""}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </PhotographerLayout>
  );
};

export default PhotographerUpload;
