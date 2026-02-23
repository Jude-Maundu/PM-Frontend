import React, { useState, useEffect } from "react";
import BuyerLayout from "./BuyerLayout";
import { Link } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:4000/api";

const BuyerProfile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id || user._id;
  const headers = { Authorization: `Bearer ${token}` };

  // Load user data from localStorage initially
  useEffect(() => {
    setProfile({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      location: user.location || ""
    });
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // You'll need to create this endpoint
      const res = await axios.put(`${API}/users/${userId}`, profile, { headers });
      
      // Update localStorage
      const updatedUser = { ...user, ...profile };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      setSuccess("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BuyerLayout>
      <div className="text-white">
        <h2 className="fw-bold mb-4">
          <i className="fas fa-user me-2 text-warning"></i>
          My Profile
        </h2>

        {/* Alerts */}
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

        <div className="row">
          {/* Profile Card */}
          <div className="col-md-4 mb-4">
            <div className="card bg-dark border-secondary text-center p-4">
              <div className="mb-3">
                <div className="position-relative d-inline-block">
                  <i className="fas fa-user-circle fa-6x text-warning"></i>
                  <button 
                    className="position-absolute bottom-0 end-0 btn btn-sm btn-warning rounded-circle p-2"
                    style={{ width: "40px", height: "40px" }}
                  >
                    <i className="fas fa-camera"></i>
                  </button>
                </div>
              </div>
              <h5 className="fw-bold">{profile.name || "Buyer"}</h5>
              <p className="text-white-50 small">{profile.email}</p>
              
              <div className="mt-3 p-3 rounded" style={{ background: "rgba(255,193,7,0.1)" }}>
                <div className="d-flex justify-content-between mb-2">
                  <span>Member Since:</span>
                  <span className="text-warning">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Total Purchases:</span>
                  <span className="text-warning">24</span>
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
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      className="form-control bg-dark border-secondary text-white"
                      value={profile.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-white-50">
                      <i className="fas fa-envelope me-2 text-warning"></i>
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="form-control bg-dark border-secondary text-white"
                      value={profile.email}
                      onChange={handleChange}
                      required
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
                      placeholder="e.g., 254712345678"
                    />
                  </div>

                  <div className="mb-4">
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
                      placeholder="City, Country"
                    />
                  </div>

                  <div className="d-flex gap-2">
                    <button 
                      type="submit" 
                      className="btn btn-warning px-5"
                      disabled={loading}
                    >
                      {loading ? (
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
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setProfile({
                          name: user.name || "",
                          email: user.email || "",
                          phone: user.phone || "",
                          location: user.location || ""
                        });
                      }}
                    >
                      Reset
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Account Actions */}
            <div className="card bg-dark border-secondary mt-4">
              <div className="card-body">
                <h6 className="fw-bold mb-3 text-warning">Account Actions</h6>
                <div className="d-flex gap-3 flex-wrap">
                  <button className="btn btn-outline-danger">
                    <i className="fas fa-lock me-2"></i>
                    Change Password
                  </button>
                  <button className="btn btn-outline-info">
                    <i className="fas fa-bell me-2"></i>
                    Notification Settings
                  </button>
                  <button className="btn btn-outline-secondary">
                    <i className="fas fa-download me-2"></i>
                    Export Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BuyerLayout>
  );
};

export default BuyerProfile;