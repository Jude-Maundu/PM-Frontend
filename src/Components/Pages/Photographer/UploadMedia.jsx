import React, { useState, useEffect, useRef } from "react";
import PhotographerLayout from "./PhotographerLayout";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../../api/apiConfig";
import { toast } from "../../../utils/toast";

const MAX_FILES = 20;
const MAX_SIZE_MB = 15;

const PhotographerUpload = () => {
  const [files, setFiles]           = useState([]);
  const [price, setPrice]           = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags]             = useState("");
  const [category, setCategory]     = useState("general");
  const [uploading, setUploading]   = useState(false);
  const [progress, setProgress]     = useState(0);
  const [userId, setUserId]         = useState(null);
  const [dragging, setDragging]     = useState(false);
  const [done, setDone]             = useState(false);
  const fileInputRef = useRef(null);
  const navigate     = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const role    = localStorage.getItem("role");
    const token   = localStorage.getItem("token");
    if (!token || (role !== "photographer" && role !== "admin")) { navigate("/login"); return; }
    try {
      const user = JSON.parse(userStr);
      setUserId(user._id || user.id);
    } catch { navigate("/login"); }
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
    setDone(false);
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
    form.append("category", category);
    if (tags.trim()) form.append("tags", JSON.stringify(tags.split(",").map((t) => t.trim()).filter(Boolean)));
    form.append("photographer", userId);

    try {
      await axios.post(`${API_BASE_URL}/media/bulk-upload`, form, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total)),
      });

      toast.success(`${files.length} photo${files.length > 1 ? "s" : ""} submitted for approval!`);
      files.forEach((f) => URL.revokeObjectURL(f.preview));
      setFiles([]);
      setPrice("");
      setDescription("");
      setTags("");
      setCategory("general");
      setProgress(0);
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed — please try again.");
    } finally {
      setUploading(false);
    }
  };

  const categories = ["general", "portrait", "wildlife", "landscape", "events", "architecture", "street", "sports", "fashion"];

  return (
    <PhotographerLayout>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "1.5rem 1rem 3rem" }}>

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ margin: 0, fontFamily: "var(--font-serif)", fontWeight: 700, color: "var(--mc-text)", fontSize: "1.6rem" }}>
            Upload Photos
          </h3>
          <p style={{ margin: "0.3rem 0 0", color: "var(--mc-text-muted)", fontSize: "0.95rem" }}>
            Your photos will be reviewed by our team before going live on the marketplace.
          </p>
        </div>

        {/* Success state */}
        {done && (
          <div style={{
            background: "rgba(76,201,166,0.1)", border: "1px solid rgba(76,201,166,0.3)",
            borderRadius: 16, padding: "1.5rem 2rem", marginBottom: "1.5rem",
            display: "flex", alignItems: "center", gap: "1rem",
          }}>
            <i className="fas fa-check-circle fa-2x" style={{ color: "#4CC9A6" }}></i>
            <div>
              <div style={{ fontWeight: 700, color: "var(--mc-text)", fontSize: "1rem" }}>Photos submitted successfully!</div>
              <div style={{ color: "var(--mc-text-muted)", fontSize: "0.88rem" }}>
                They're now in the admin review queue. You'll be able to see them in{" "}
                <a href="/photographer/media" style={{ color: "var(--mc-accent)" }}>My Media</a> once approved.
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem", alignItems: "start" }}>

            {/* Left: drop zone + preview grid */}
            <div>

              {/* Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  borderRadius: 16,
                  border: `2px dashed ${dragging ? "var(--mc-accent)" : "rgba(107,189,208,0.35)"}`,
                  background: dragging ? "rgba(107,189,208,0.07)" : "var(--mc-card-bg)",
                  cursor: "pointer", textAlign: "center", padding: "3rem 2rem",
                  transition: "border-color 0.2s, background 0.2s",
                  marginBottom: "1rem",
                  boxShadow: "var(--mc-card-shadow)",
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
                <div style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: "rgba(107,189,208,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 1.25rem",
                }}>
                  <i className="fas fa-cloud-upload-alt" style={{ fontSize: "1.8rem", color: "var(--mc-accent)" }}></i>
                </div>
                <p style={{ margin: "0 0 0.4rem", fontWeight: 700, fontSize: "1.05rem", color: "var(--mc-text)" }}>
                  {dragging ? "Drop your photos here" : "Click or drag photos here"}
                </p>
                <p style={{ margin: 0, color: "var(--mc-text-muted)", fontSize: "0.85rem" }}>
                  JPG, PNG, MP4 · Max {MAX_SIZE_MB} MB each · Up to {MAX_FILES} files
                </p>
              </div>

              {/* Preview Grid */}
              {files.length > 0 && (
                <div style={{
                  background: "var(--mc-card-bg)", borderRadius: 16, padding: "1.25rem",
                  border: "1px solid var(--mc-border)", boxShadow: "var(--mc-card-shadow)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <span style={{ fontWeight: 600, color: "var(--mc-text)", fontSize: "0.9rem" }}>
                      {files.length} file{files.length !== 1 ? "s" : ""} selected
                    </span>
                    <button
                      type="button"
                      onClick={() => { files.forEach((f) => URL.revokeObjectURL(f.preview)); setFiles([]); }}
                      style={{ border: "none", background: "none", color: "#dc3545", fontSize: "0.82rem", cursor: "pointer", fontWeight: 600 }}
                    >
                      <i className="fas fa-times me-1"></i>Clear all
                    </button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "0.6rem" }}>
                    {files.map((f) => (
                      <div key={f.id} style={{ position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: "1", background: "var(--mc-bg)" }}>
                        <img src={f.preview} alt={f.file.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}
                          style={{
                            position: "absolute", top: 4, right: 4,
                            width: 24, height: 24, borderRadius: "50%",
                            background: "rgba(0,0,0,0.6)", border: "none",
                            color: "#fff", fontSize: "0.7rem", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                        <div style={{
                          position: "absolute", bottom: 0, left: 0, right: 0,
                          background: "rgba(0,0,0,0.55)", padding: "3px 5px",
                          fontSize: "0.6rem", color: "rgba(255,255,255,0.85)",
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                          {f.file.name}
                        </div>
                      </div>
                    ))}
                    {files.length < MAX_FILES && (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          borderRadius: 10, border: "2px dashed rgba(107,189,208,0.3)",
                          aspectRatio: "1", display: "flex", flexDirection: "column",
                          alignItems: "center", justifyContent: "center", cursor: "pointer",
                          color: "var(--mc-text-muted)", fontSize: "0.75rem", gap: 6,
                        }}
                      >
                        <i className="fas fa-plus" style={{ fontSize: "1.2rem", color: "var(--mc-accent)" }}></i>
                        Add more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right: details panel */}
            <div style={{
              background: "var(--mc-card-bg)", borderRadius: 16, padding: "1.5rem",
              border: "1px solid var(--mc-border)", boxShadow: "var(--mc-card-shadow)",
              display: "flex", flexDirection: "column", gap: "1.25rem",
            }}>
              <h6 style={{ margin: 0, fontWeight: 700, color: "var(--mc-text)", fontSize: "0.95rem" }}>
                Photo Details
              </h6>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--mc-text)", marginBottom: "0.4rem" }}>
                  Price per photo (KES) <span style={{ color: "#dc3545" }}>*</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 150"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  step="50"
                  style={{
                    width: "100%", padding: "0.65rem 0.85rem", borderRadius: 10,
                    border: "1.5px solid var(--mc-border)", background: "var(--mc-bg)",
                    color: "var(--mc-text)", fontSize: "0.95rem", outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <p style={{ margin: "0.35rem 0 0", fontSize: "0.75rem", color: "var(--mc-text-muted)" }}>
                  Recommended: KES 100 – 300
                </p>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--mc-text)", marginBottom: "0.4rem" }}>
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: "100%", padding: "0.65rem 0.85rem", borderRadius: 10,
                    border: "1.5px solid var(--mc-border)", background: "var(--mc-bg)",
                    color: "var(--mc-text)", fontSize: "0.9rem", outline: "none",
                    boxSizing: "border-box",
                  }}
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--mc-text)", marginBottom: "0.4rem" }}>
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Event name, date, location..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: "100%", padding: "0.65rem 0.85rem", borderRadius: 10,
                    border: "1.5px solid var(--mc-border)", background: "var(--mc-bg)",
                    color: "var(--mc-text)", fontSize: "0.9rem", resize: "vertical", outline: "none",
                    boxSizing: "border-box", fontFamily: "inherit",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--mc-text)", marginBottom: "0.4rem" }}>
                  Tags <span style={{ fontWeight: 400, color: "var(--mc-text-muted)" }}>(comma-separated)</span>
                </label>
                <input
                  type="text"
                  placeholder="graduation, campus, nairobi"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  style={{
                    width: "100%", padding: "0.65rem 0.85rem", borderRadius: 10,
                    border: "1.5px solid var(--mc-border)", background: "var(--mc-bg)",
                    color: "var(--mc-text)", fontSize: "0.9rem", outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Watermark notice */}
              <div style={{
                background: "rgba(107,189,208,0.08)", border: "1px solid rgba(107,189,208,0.25)",
                borderRadius: 10, padding: "0.85rem",
              }}>
                <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                  <i className="fas fa-shield-alt" style={{ color: "var(--mc-accent)", marginTop: 2, fontSize: "0.95rem" }}></i>
                  <div>
                    <p style={{ margin: "0 0 0.2rem", color: "var(--mc-text)", fontSize: "0.82rem", fontWeight: 700 }}>Auto-watermark enabled</p>
                    <p style={{ margin: 0, color: "var(--mc-text-muted)", fontSize: "0.76rem" }}>
                      Buyers see watermarked previews. Originals are delivered only after payment.
                    </p>
                  </div>
                </div>
              </div>

              {/* Admin review notice */}
              <div style={{
                background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.25)",
                borderRadius: 10, padding: "0.85rem",
              }}>
                <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                  <i className="fas fa-clock" style={{ color: "#F5A623", marginTop: 2, fontSize: "0.95rem" }}></i>
                  <div>
                    <p style={{ margin: "0 0 0.2rem", color: "var(--mc-text)", fontSize: "0.82rem", fontWeight: 700 }}>Needs admin approval</p>
                    <p style={{ margin: 0, color: "var(--mc-text-muted)", fontSize: "0.76rem" }}>
                      Photos go live after our team reviews them, usually within 24 hours.
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress */}
              {uploading && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                    <span style={{ fontSize: "0.82rem", color: "var(--mc-text-muted)" }}>Uploading…</span>
                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--mc-accent)" }}>{progress}%</span>
                  </div>
                  <div style={{ height: 8, background: "var(--mc-border)", borderRadius: 99 }}>
                    <div style={{
                      height: "100%", width: `${progress}%`,
                      background: "var(--mc-accent)", borderRadius: 99, transition: "width 0.3s",
                    }}></div>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={uploading || files.length === 0}
                style={{
                  padding: "0.85rem", borderRadius: 12, border: "none",
                  background: files.length > 0 && !uploading ? "var(--mc-accent)" : "rgba(107,189,208,0.25)",
                  color: "#fff", fontWeight: 700, fontSize: "1rem", cursor: files.length > 0 && !uploading ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                  transition: "background 0.2s",
                }}
              >
                {uploading ? (
                  <><span className="spinner-border spinner-border-sm"></span> Uploading {files.length} photo{files.length !== 1 ? "s" : ""}…</>
                ) : (
                  <><i className="fas fa-cloud-upload-alt"></i> Upload {files.length > 0 ? `${files.length} ` : ""}Photo{files.length !== 1 ? "s" : ""}</>
                )}
              </button>
            </div>

          </div>
        </form>
      </div>
    </PhotographerLayout>
  );
};

export default PhotographerUpload;
