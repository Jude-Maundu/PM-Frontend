import React, { useState, useEffect } from "react";
import BuyerLayout from "./BuyerLayout";
import { Link } from "react-router-dom";
import axios from "axios";

const API = "https://pm-backend-1-0s8f.onrender.com/api";

const BuyerProfile = () => {
  const [profile, setProfile] = useState({
    name: "",
    username: "",
    email: "",
    phone: "0793945789", // Your phone number
    location: "",
    bio: "",
    profilePicture: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [walletBalance, setWalletBalance] = useState(12500); // Your balance
  const [imageError, setImageError] = useState(false);
  const [stats, setStats] = useState({
    memberSince: "2024-03-15",
    totalPurchases: 24,
    totalSpent: 12500
  });

  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : {};
  const userId = user.id || user._id;
  
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // Load user data
  useEffect(() => {
    console.log("📝 Loading user from localStorage:", user);
    
    // Check if there's a stored profile picture in localStorage
    const storedProfilePic = localStorage.getItem("profilePicture");
    
    setProfile({
      name: user.name || user.username || "",
      username: user.username || "",
      email: user.email || "",
      phone: user.phone || "0793945789",
      location: user.location || "",
      bio: user.bio || "",
      profilePicture: storedProfilePic || user.profilePicture || user.avatar || ""
    });
    
    setLoading(false);
  }, []);

  // Handle profile picture upload
  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setImageError(false);
      
      console.log("📤 Uploading profile picture...");
      
      // Convert to Base64 for permanent storage
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64Image = reader.result;
        
        console.log("✅ Image converted to Base64");
        
        // Update state with Base64 image
        setProfile(prev => ({
          ...prev,
          profilePicture: base64Image
        }));
        
        // Store in localStorage permanently
        localStorage.setItem("profilePicture", base64Image);
        
        // Update user object in localStorage
        const updatedUser = { ...user, profilePicture: base64Image };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        setSuccess("Profile picture updated!");
        setTimeout(() => setSuccess(null), 3000);
      };
      
    } catch (err) {
      console.error("❌ Error uploading profile picture:", err);
      setError("Failed to upload profile picture");
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      console.log("📤 Saving profile:", profile);
      
      // Save to localStorage
      const updatedUser = { ...user, ...profile };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      setSuccess("Profile updated successfully!");
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (err) {
      console.error("❌ Error saving profile:", err);
      setError("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleImageError = () => {
    console.log("❌ Profile picture failed to load, using fallback");
    setImageError(true);
  };

  if (!token || !userId) {
    return (
      <BuyerLayout>
        <div className="text-center py-5">
          <i className="fas fa-user-lock text-warning fa-4x mb-3"></i>
          <h4 className="text-white mb-3">Authentication Required</h4>
          <p className="text-white-50 mb-4">Please login to view your profile</p>
          <Link to="/login" className="btn btn-warning">
            <i className="fas fa-sign-in-alt me-2"></i>
            Go to Login
          </Link>
        </div>
      </BuyerLayout>
    );
  }

  return (
    <BuyerLayout>
      <div className="text-white">
        <h2 className="fw-bold mb-4">
          <i className="fas fa-user me-2 text-warning"></i>
          My Profile
        </h2>

        {/* Wallet Balance Card */}
        <div className="card bg-dark border-warning mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-white-50 mb-1">Wallet Balance</h6>
                <h3 className="text-warning fw-bold mb-0">KES {walletBalance.toLocaleString()}</h3>
              </div>
              <Link to="/buyer/wallet" className="btn btn-outline-warning">
                <i className="fas fa-arrow-right me-2"></i>
                Manage
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
            <button type="button" className="btn-close" onClick={() => setError(null)}></button>
          </div>
        )}
        
        {success && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <i className="fas fa-check-circle me-2"></i>
            {success}
            <button type="button" className="btn-close" onClick={() => setSuccess(null)}></button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning mb-3"></div>
            <p className="text-white-50">Loading your profile...</p>
          </div>
        ) : (
          <div className="row">
            {/* Profile Card */}
            <div className="col-md-4 mb-4">
              <div className="card bg-dark border-secondary text-center p-4">
                <div className="mb-3 position-relative">
                  <div className="position-relative d-inline-block">
                    {profile.profilePicture && !imageError ? (
                      <img 
                        src={profile.profilePicture}
                        alt={profile.name || "Profile"}
                        className="rounded-circle"
                        style={{ 
                          width: "120px", 
                          height: "120px", 
                          objectFit: "cover",
                          border: "3px solid #ffc107"
                        }}
                        onError={handleImageError}
                      />
                    ) : (
                      <div className="text-center">
                        <i className="fas fa-user-circle fa-6x text-warning"></i>
                        <p className="text-white-50 small mt-2">Click camera to upload</p>
                      </div>
                    )}
                    
                    <label 
                      htmlFor="profile-picture-upload"
                      className="position-absolute bottom-0 end-0 btn btn-sm btn-warning rounded-circle p-2"
                      style={{ 
                        width: "35px", 
                        height: "35px", 
                        cursor: "pointer",
                        border: "2px solid #1a1a1a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      {uploading ? (
                        <span className="spinner-border spinner-border-sm"></span>
                      ) : (
                        <i className="fas fa-camera"></i>
                      )}
                      <input
                        id="profile-picture-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureUpload}
                        style={{ display: "none" }}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>
                
                <h5 className="fw-bold">{profile.name || profile.username || "Buyer"}</h5>
                <p className="text-white-50 small">{profile.email}</p>
                
                <div className="mt-3 p-3 rounded" style={{ background: "rgba(255,193,7,0.1)" }}>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Member Since:</span>
                    <span className="text-warning">
                      {new Date(stats.memberSince).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Total Purchases:</span>
                    <span className="text-warning">{stats.totalPurchases}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Total Spent:</span>
                    <span className="text-warning">KES {stats.totalSpent.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Profile Form */}
            <div className="col-md-8">
              <div className="card bg-dark border-secondary">
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label text-white-50">
                        <i className="fas fa-user me-2 text-warning"></i>
                        Display Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        className="form-control bg-dark border-secondary text-white"
                        value={profile.name}
                        onChange={handleChange}
                        placeholder="Your display name"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label text-white-50">
                        <i className="fas fa-envelope me-2 text-warning"></i>
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="form-control bg-dark border-secondary text-white"
                        value={profile.email}
                        disabled
                      />
                      <small className="text-white-50">Email cannot be changed</small>
                    </div>

                    <div className="mb-3">
                      <label className="form-label text-white-50">
                        <i className="fas fa-phone me-2 text-warning"></i>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        className="form-control bg-dark border-secondary text-white"
                        value={profile.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label text-white-50">
                        <i className="fas fa-map-marker-alt me-2 text-warning"></i>
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        className="form-control bg-dark border-secondary text-white"
                        value={profile.location}
                        onChange={handleChange}
                        placeholder="Enter your location"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label text-white-50">
                        <i className="fas fa-align-left me-2 text-warning"></i>
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        className="form-control bg-dark border-secondary text-white"
                        rows="3"
                        value={profile.bio}
                        onChange={handleChange}
                        placeholder="Tell us about yourself..."
                      ></textarea>
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-warning px-5"
                      disabled={saving || uploading}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>
                          Save Changes
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Account Actions */}
              <div className="card bg-dark border-secondary mt-4">
                <div className="card-body">
                  <h6 className="fw-bold mb-3 text-warning">Account Actions</h6>
                  <div className="d-flex gap-3 flex-wrap">
                    <Link to="/buyer/transactions" className="btn btn-outline-info">
                      <i className="fas fa-history me-2"></i>
                      View Transactions
                    </Link>
                    <button className="btn btn-outline-secondary">
                      <i className="fas fa-download me-2"></i>
                      Export Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </BuyerLayout>
  );
};

export default BuyerProfile;