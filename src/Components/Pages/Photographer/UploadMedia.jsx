import React, { useState, useEffect } from "react";
import axios from "axios";
import PhotographerLayout from "./PhotographerLayout";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:4000/api/media";

const PhotographerUpload = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    mediaType: "photo",
    tags: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [photographerId, setPhotographerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // Get photographer ID from localStorage on component mount
  useEffect(() => {
    const getUserData = () => {
      try {
        const userStr = localStorage.getItem("user");
        const role = localStorage.getItem("role");
        
        console.log("User from localStorage:", userStr);
        console.log("Role from localStorage:", role);
        
        if (role !== "photographer") {
          setError("Access denied. Photographers only.");
          setTimeout(() => navigate("/dashboard"), 2000);
          return;
        }
        
        if (userStr) {
          const user = JSON.parse(userStr);
          // Check different possible ID fields
          const id = user._id || user.id || user.photographerId || user.userId;
          setPhotographerId(id);
          console.log("Photographer ID found:", id);
        } else {
          console.error("No user data found in localStorage");
          setError("User data not found. Please log in again.");
        }
      } catch (err) {
        console.error("Error getting user data:", err);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, [navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        setError("Only image and video files are allowed");
        return;
      }
      
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
      setError(""); // Clear any previous errors
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("Starting upload process...");
    console.log("Photographer ID:", photographerId);
    console.log("File:", imageFile);
    console.log("Form data:", formData);

    if (!photographerId) {
      setError("Photographer ID not found. Please log in again.");
      return;
    }

    if (!imageFile) {
      setError("Please select a file to upload.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      // Create ONE FormData object with ALL fields
      const formDataToSend = new FormData();
      
      // Append the file (MUST match 'file' in uploadPhoto.single("file"))
      formDataToSend.append("file", imageFile);
      
      // Append all other fields as form data
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description || "");
      formDataToSend.append("price", formData.price);
      formDataToSend.append("mediaType", formData.mediaType);
      formDataToSend.append("photographer", photographerId); // This is CRITICAL!
      
      // Handle tags - send as JSON string
      if (formData.tags) {
        const tagsArray = formData.tags.split(",").map(tag => tag.trim());
        formDataToSend.append("tags", JSON.stringify(tagsArray));
      }

      // Log FormData contents for debugging
      console.log("FormData contents:");
      for (let pair of formDataToSend.entries()) {
        console.log(`  ${pair[0]}: ${pair[1]}`);
      }

      console.log("Sending request to:", API);
      console.log("Headers:", headers);

      // Send ONE request with ALL data
      const response = await axios.post(API, formDataToSend, {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
          console.log(`Upload progress: ${percentCompleted}%`);
        },
      });

      console.log("Upload successful! Response:", response.data);
      
      alert("Media uploaded successfully!");
      navigate("/photographer/media");
      
    } catch (error) {
      console.error("Upload error details:");
      console.error("Message:", error.message);
      console.error("Response:", error.response);
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);
      
      setError(
        error.response?.data?.message || 
        error.message || 
        "Upload failed. Please try again."
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Test API connection
  const testConnection = async () => {
    try {
      console.log("Testing API connection to:", API);
      const response = await axios.get(API);
      console.log("API connection successful:", response.data);
      alert("✅ API is reachable! Check console for details.");
    } catch (error) {
      console.error("API connection failed:", error);
      alert("❌ Cannot reach API. Check if server is running at " + API);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <PhotographerLayout>
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-white-50 mt-3">Loading upload form...</p>
        </div>
      </PhotographerLayout>
    );
  }

  // Glass card style matching your theme
  const glassStyle = {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  };

  return (
    <PhotographerLayout>
      {/* Background Image with Overlay */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2070&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: "0.1",
          zIndex: 0,
        }}
      ></div>

      {/* Content */}
      <div className="position-relative" style={{ zIndex: 1 }}>
        {/* Header with Test Button */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <div>
            <h4 className="fw-bold mb-1">
              <i className="fas fa-cloud-upload-alt me-2 text-warning"></i>
              Upload Media
            </h4>
            <p className="text-white-50 small mb-0">
              <i className="fas fa-info-circle me-2"></i>
              POST to: {API}
            </p>
          </div>
          <div className="d-flex gap-2 mt-3 mt-md-0">
            <button 
              className="btn btn-outline-info rounded-pill px-4"
              onClick={testConnection}
              type="button"
            >
              <i className="fas fa-plug me-2"></i>
              Test Connection
            </button>
            <button 
              className="btn btn-outline-warning rounded-pill px-4"
              onClick={() => navigate("/photographer/media")}
              type="button"
            >
              <i className="fas fa-arrow-left me-2"></i>
              Back to Media
            </button>
          </div>
        </div>

        {/* Debug Info Card */}
        <div 
          className="alert mb-4"
          style={{
            background: "rgba(0, 123, 255, 0.1)",
            border: "1px solid rgba(0, 123, 255, 0.3)",
            borderRadius: "12px",
            color: "#17a2b8",
          }}
        >
          <div className="d-flex align-items-center">
            <i className="fas fa-bug me-3 fa-lg"></i>
            <div>
              <small className="d-block">
                <strong>Debug Info:</strong>
              </small>
              <small className="d-block">
                API URL: {API} | 
                Photographer ID: {photographerId || "❌ Not found"} | 
                Token: {token ? "✅ Present" : "❌ Missing"} |
                Role: {localStorage.getItem("role") || "❌ No role"}
              </small>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Upload Form */}
          <div className="col-lg-8">
            <div 
              className="card border-0 h-100"
              style={{
                ...glassStyle,
                borderRadius: "24px",
              }}
            >
              <div className="card-body p-4">
                {error && (
                  <div 
                    className="alert d-flex align-items-center mb-4" 
                    style={{
                      background: "rgba(220, 53, 69, 0.1)",
                      border: "1px solid rgba(220, 53, 69, 0.3)",
                      borderRadius: "12px",
                      color: "#dc3545",
                    }}
                  >
                    <i className="fas fa-exclamation-circle me-2"></i>
                    <span>{error}</span>
                    <button 
                      type="button" 
                      className="btn-close btn-close-white ms-auto" 
                      onClick={() => setError("")}
                    ></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Title Field */}
                  <div className="mb-4">
                    <label className="form-label text-white-50 small fw-semibold text-uppercase tracking-wide mb-2">
                      <i className="fas fa-heading me-2 text-warning"></i>
                      Title <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control bg-transparent text-white"
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "12px",
                        padding: "12px",
                      }}
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Enter media title"
                      required
                    />
                  </div>

                  {/* Description Field */}
                  <div className="mb-4">
                    <label className="form-label text-white-50 small fw-semibold text-uppercase tracking-wide mb-2">
                      <i className="fas fa-align-left me-2 text-warning"></i>
                      Description
                    </label>
                    <textarea
                      className="form-control bg-transparent text-white"
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "12px",
                        padding: "12px",
                      }}
                      rows="4"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Describe your media..."
                    ></textarea>
                  </div>

                  {/* Price and Type Row */}
                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <label className="form-label text-white-50 small fw-semibold text-uppercase tracking-wide mb-2">
                        <i className="fas fa-tag me-2 text-warning"></i>
                        Price (KES) <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span 
                          className="input-group-text bg-transparent text-warning"
                          style={{
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          KES
                        </span>
                        <input
                          type="number"
                          className="form-control bg-transparent text-white"
                          style={{
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                          }}
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          placeholder="0.00"
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div className="col-md-6 mb-4">
                      <label className="form-label text-white-50 small fw-semibold text-uppercase tracking-wide mb-2">
                        <i className="fas fa-film me-2 text-warning"></i>
                        Media Type <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select bg-transparent text-white"
                        style={{
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "12px",
                          padding: "12px",
                        }}
                        value={formData.mediaType}
                        onChange={(e) => setFormData({...formData, mediaType: e.target.value})}
                        required
                      >
                        <option value="photo" className="bg-dark">📷 Photo</option>
                        <option value="video" className="bg-dark">🎥 Video</option>
                      </select>
                    </div>
                  </div>

                  {/* Tags Field */}
                  <div className="mb-4">
                    <label className="form-label text-white-50 small fw-semibold text-uppercase tracking-wide mb-2">
                      <i className="fas fa-tags me-2 text-warning"></i>
                      Tags
                    </label>
                    <input
                      type="text"
                      className="form-control bg-transparent text-white"
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "12px",
                        padding: "12px",
                      }}
                      value={formData.tags}
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      placeholder="nature, sunset, travel (comma separated)"
                    />
                    <small className="text-white-50 mt-1 d-block">
                      <i className="fas fa-info-circle me-1"></i>
                      Separate tags with commas
                    </small>
                  </div>

                  {/* File Upload */}
                  <div className="mb-4">
                    <label className="form-label text-white-50 small fw-semibold text-uppercase tracking-wide mb-2">
                      <i className="fas fa-file me-2 text-warning"></i>
                      Upload File <span className="text-danger">*</span>
                    </label>
                    <div
                      className="border-2 border-dashed rounded-4 p-4 text-center cursor-pointer"
                      style={{
                        border: "2px dashed rgba(255, 255, 255, 0.1)",
                        background: "rgba(255, 255, 255, 0.02)",
                        transition: "all 0.3s ease",
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file) {
                          const input = { target: { files: [file] } };
                          handleFileChange(input);
                        }
                      }}
                    >
                      <input
                        type="file"
                        className="d-none"
                        id="fileUpload"
                        onChange={handleFileChange}
                        accept="image/*,video/*"
                        required
                      />
                      <label htmlFor="fileUpload" className="d-block cursor-pointer">
                        <i className="fas fa-cloud-upload-alt fa-3x text-warning mb-3"></i>
                        <p className="text-white mb-1">
                          {imageFile ? imageFile.name : "Drag & drop or click to upload"}
                        </p>
                        <small className="text-white-50">
                          Supported: JPG, PNG, GIF, MP4, MOV (Max 10MB)
                        </small>
                      </label>
                    </div>
                  </div>

                  {/* Upload Progress Bar */}
                  {uploading && uploadProgress > 0 && (
                    <div className="mb-4">
                      <div className="d-flex justify-content-between mb-1">
                        <small className="text-white-50">Uploading...</small>
                        <small className="text-warning">{uploadProgress}%</small>
                      </div>
                      <div className="progress" style={{ height: "6px", background: "rgba(255,255,255,0.1)" }}>
                        <div 
                          className="progress-bar bg-warning" 
                          role="progressbar" 
                          style={{ width: `${uploadProgress}%` }}
                          aria-valuenow={uploadProgress} 
                          aria-valuemin="0" 
                          aria-valuemax="100"
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Photographer ID (hidden field for debugging) */}
                  {photographerId && (
                    <input type="hidden" name="photographer" value={photographerId} />
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn btn-warning w-100 py-3 fw-bold rounded-pill mt-3"
                    style={{
                      transition: "all 0.3s ease",
                    }}
                    disabled={uploading || !photographerId || !imageFile}
                  >
                    {uploading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Uploading... {uploadProgress}%
                      </>
                    ) : (
                      <>
                        <i className="fas fa-cloud-upload-alt me-2"></i>
                        Publish Media
                      </>
                    )}
                  </button>

                  {/* Required Fields Note */}
                  <p className="text-white-50 small text-center mt-3 mb-0">
                    <i className="fas fa-asterisk text-danger me-1"></i>
                    Required fields
                  </p>
                </form>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="col-lg-4">
            <div 
              className="card border-0 sticky-top"
              style={{
                ...glassStyle,
                borderRadius: "24px",
                top: "100px",
              }}
            >
              <div className="card-header bg-transparent border-warning border-opacity-25 p-4">
                <h5 className="mb-0">
                  <i className="fas fa-eye me-2 text-warning"></i>
                  Preview
                </h5>
              </div>
              <div className="card-body p-4 text-center">
                {preview ? (
                  <>
                    {formData.mediaType === "video" ? (
                      <video
                        src={preview}
                        className="img-fluid rounded-3 mb-3"
                        style={{ maxHeight: "200px", width: "100%", objectFit: "cover" }}
                        controls
                      />
                    ) : (
                      <img
                        src={preview}
                        alt="Preview"
                        className="img-fluid rounded-3 mb-3"
                        style={{ maxHeight: "200px", width: "100%", objectFit: "cover" }}
                      />
                    )}
                    
                    <div className="mt-3">
                      {formData.title && (
                        <h6 className="text-white mb-2">{formData.title}</h6>
                      )}
                      
                      {formData.description && (
                        <p className="small text-white-50 mb-2">
                          {formData.description.length > 50 
                            ? formData.description.substring(0, 50) + "..." 
                            : formData.description}
                        </p>
                      )}
                      
                      <div className="d-flex justify-content-center gap-2">
                        {formData.price && (
                          <span className="badge bg-warning text-dark px-3 py-2 rounded-pill">
                            <i className="fas fa-tag me-2"></i>
                            KES {formData.price}
                          </span>
                        )}
                        
                        <span className="badge bg-info bg-opacity-25 text-info px-3 py-2 rounded-pill">
                          <i className={`fas ${formData.mediaType === "video" ? "fa-video" : "fa-camera"} me-2`}></i>
                          {formData.mediaType}
                        </span>
                      </div>

                      {formData.tags && (
                        <div className="mt-3">
                          {formData.tags.split(",").map((tag, idx) => (
                            tag.trim() && (
                              <span 
                                key={idx}
                                className="badge bg-secondary bg-opacity-25 text-white-50 me-1 mb-1 px-2 py-1"
                              >
                                #{tag.trim()}
                              </span>
                            )
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="py-5">
                    <i className="fas fa-image fa-4x text-white-50 mb-3"></i>
                    <p className="text-white-50">No file selected</p>
                    <small className="text-white-50 d-block">
                      Upload a file to see preview
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PhotographerLayout>
  );
};

export default PhotographerUpload;