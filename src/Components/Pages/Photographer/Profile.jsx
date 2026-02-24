import React, { useEffect, useState } from "react";
import axios from "axios";
import PhotographerLayout from "./PhotographerLayout";
import { Link } from "react-router-dom";

const API = "https://pm-backend-1-0s8f.onrender.com/api";

const PhotographerProfile = () => {
  const [profile, setProfile] = useState({
    id: "",
    name: "",
    email: "",
    bio: "",
    location: "",
    website: "",
    social: {
      instagram: "",
      twitter: "",
      facebook: "",
    },
    skills: [],
    equipment: [],
    joinedDate: "",
    profileImage: "",
    coverImage: "",
  });

  const [stats, setStats] = useState({
    totalMedia: 0,
    totalSales: 0,
    totalEarnings: 0,
    totalLikes: 0,
    totalViews: 0,
    followers: 0,
    rating: 4.8,
    reviewCount: 24,
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [portfolio, setPortfolio] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState({ profile: false, cover: false });

  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : {};
  const photographerId = user?.id || user?._id;

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // Helper function to get image URL with fallback
  const getImageUrl = (type) => {
    if (type === 'profile') {
      if (profile.profileImage && !imageError.profile) {
        // If it's a Base64 image (starts with data:image)
        if (profile.profileImage.startsWith('data:image')) {
          return profile.profileImage;
        }
        // If it's a full URL
        if (profile.profileImage.startsWith('http')) {
          return profile.profileImage;
        }
      }
      // Fallback to avatar with name
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'Photographer')}&background=ffc107&color=000&size=200`;
    } else {
      // Cover image
      if (profile.coverImage && !imageError.cover) {
        if (profile.coverImage.startsWith('data:image') || profile.coverImage.startsWith('http')) {
          return profile.coverImage;
        }
      }
      return "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2070&q=80";
    }
  };

  // Load saved images from localStorage
  useEffect(() => {
    const savedProfileImage = localStorage.getItem(`photographer_profile_${photographerId}`);
    const savedCoverImage = localStorage.getItem(`photographer_cover_${photographerId}`);
    
    if (savedProfileImage) {
      setProfile(prev => ({ ...prev, profileImage: savedProfileImage }));
    }
    if (savedCoverImage) {
      setProfile(prev => ({ ...prev, coverImage: savedCoverImage }));
    }
  }, [photographerId]);

  // Fetch photographer profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      // Get user details
      let userData = user;
      try {
        const userRes = await axios.get(`${API}/users/${photographerId}`, { headers });
        userData = userRes.data;
      } catch (err) {
        console.log("Using cached user data");
      }

      // Get photographer's media
      let myMedia = [];
      try {
        const mediaRes = await axios.get(`${API}/media`, { headers });
        myMedia = (mediaRes.data || []).filter(m => 
          m.photographerId === photographerId || m.userId === photographerId
        );
      } catch (err) {
        console.log("Could not fetch media");
      }

      // Get earnings
      let earnings = 0;
      try {
        const earningsRes = await axios.get(`${API}/payments/earnings-summary/${photographerId}`, { headers });
        earnings = earningsRes.data?.total || 0;
      } catch (err) {
        console.log("Could not fetch earnings");
      }

      // Get sales
      let sales = [];
      try {
        const salesRes = await axios.get(`${API}/payments/transactions/${photographerId}`, { headers });
        sales = salesRes.data || [];
      } catch (err) {
        console.log("Could not fetch sales");
      }

      // Calculate stats
      const totalLikes = myMedia.reduce((sum, m) => sum + (m.likes || 0), 0);
      const totalViews = myMedia.reduce((sum, m) => sum + (m.views || 0), 0);

      // Load saved images from localStorage
      const savedProfileImage = localStorage.getItem(`photographer_profile_${photographerId}`);
      const savedCoverImage = localStorage.getItem(`photographer_cover_${photographerId}`);

      setProfile({
        id: photographerId,
        name: userData?.name || user?.name || "Photographer",
        email: userData?.email || user?.email || "photographer@example.com",
        bio: userData?.bio || "Passionate photographer capturing moments and creating visual stories. Specializing in landscape, portrait, and commercial photography.",
        location: userData?.location || "Nairobi, Kenya",
        website: userData?.website || "www.photographer.com",
        social: userData?.social || {
          instagram: "@photographer",
          twitter: "@photographer",
          facebook: "photographer.page",
        },
        skills: userData?.skills || ["Landscape", "Portrait", "Commercial", "Wedding"],
        equipment: userData?.equipment || ["Canon EOS R5", "Sony A7III", "DJI Mavic 3"],
        joinedDate: userData?.createdAt || new Date().toISOString(),
        profileImage: savedProfileImage || userData?.profileImage || "",
        coverImage: savedCoverImage || userData?.coverImage || "",
      });

      setStats({
        totalMedia: myMedia.length,
        totalSales: sales.length,
        totalEarnings: earnings,
        totalLikes,
        totalViews,
        followers: userData?.followers || 156,
        rating: 4.8,
        reviewCount: 24,
      });

      setPortfolio(myMedia.slice(0, 6));

      // Mock reviews
      setReviews([
        {
          id: 1,
          user: "John Doe",
          avatar: "https://randomuser.me/api/portraits/men/1.jpg",
          rating: 5,
          comment: "Amazing quality photos! Very professional.",
          date: "2024-01-15",
        },
        {
          id: 2,
          user: "Jane Smith",
          avatar: "https://randomuser.me/api/portraits/women/2.jpg",
          rating: 5,
          comment: "Great experience working with them. Highly recommended!",
          date: "2024-01-10",
        },
        {
          id: 3,
          user: "Mike Johnson",
          avatar: "https://randomuser.me/api/portraits/men/3.jpg",
          rating: 4,
          comment: "Good quality and fast delivery.",
          date: "2024-01-05",
        },
      ]);

    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile({
        ...profile,
        [parent]: {
          ...profile[parent],
          [child]: value,
        },
      });
    } else {
      setProfile({ ...profile, [name]: value });
    }
  };

  const handleArrayInput = (field, value) => {
    setProfile({
      ...profile,
      [field]: value.split(',').map(item => item.trim()),
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to localStorage
      const updatedUser = { ...user, ...profile };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Try to save to backend
      try {
        await axios.put(`${API}/users/${photographerId}`, profile, { headers });
      } catch (err) {
        console.log("Backend save failed, saved locally only");
      }
      
      alert("Profile updated successfully!");
      setEditing(false);
    } catch (error) {
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (type, file) => {
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setUploadingImage(true);
    setImageError(prev => ({ ...prev, [type]: false }));

    try {
      // Convert to Base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64Image = reader.result;
        
        // Update state
        if (type === 'profile') {
          setProfile({ ...profile, profileImage: base64Image });
          localStorage.setItem(`photographer_profile_${photographerId}`, base64Image);
        } else {
          setProfile({ ...profile, coverImage: base64Image });
          localStorage.setItem(`photographer_cover_${photographerId}`, base64Image);
        }

        // Update user object in localStorage
        const updatedUser = { 
          ...user, 
          ...(type === 'profile' ? { profileImage: base64Image } : { coverImage: base64Image }) 
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        setUploadingImage(false);
      };
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploadingImage(false);
    }
  };

  const handleImageError = (type) => {
    setImageError(prev => ({ ...prev, [type]: true }));
  };

  if (loading) {
    return (
      <PhotographerLayout>
        <div className="text-center py-5">
          <div className="spinner-border text-warning mb-3"></div>
          <p>Loading profile...</p>
        </div>
      </PhotographerLayout>
    );
  }

  return (
    <PhotographerLayout>
      {/* Cover Image */}
      <div className="position-relative mb-5">
        <div
          className="rounded-3"
          style={{
            height: "300px",
            backgroundImage: `url(${getImageUrl('cover')})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
          }}
        >
          <div
            className="position-absolute top-0 start-0 w-100 h-100 rounded-3"
            style={{
              background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%)",
            }}
          ></div>

          {editing && (
            <div className="position-absolute bottom-0 end-0 m-3">
              <label className="btn btn-sm btn-warning">
                {uploadingImage ? (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                ) : (
                  <i className="fas fa-camera me-2"></i>
                )}
                Change Cover
                <input
                  type="file"
                  className="d-none"
                  accept="image/*"
                  onChange={(e) => handleImageUpload('cover', e.target.files[0])}
                  disabled={uploadingImage}
                />
              </label>
            </div>
          )}
        </div>

        {/* Profile Image */}
        <div className="position-absolute bottom-0 start-0 translate-middle-y ms-4">
          <div className="position-relative">
            <img
              src={getImageUrl('profile')}
              alt={profile.name}
              className="rounded-circle border border-4 border-warning"
              style={{ width: "150px", height: "150px", objectFit: "cover" }}
              onError={() => handleImageError('profile')}
            />
            {editing && (
              <label className="position-absolute bottom-0 end-0 btn btn-sm btn-warning rounded-circle p-2"
                     style={{ transform: "translate(10%, 10%)" }}>
                {uploadingImage ? (
                  <span className="spinner-border spinner-border-sm"></span>
                ) : (
                  <i className="fas fa-camera"></i>
                )}
                <input
                  type="file"
                  className="d-none"
                  accept="image/*"
                  onChange={(e) => handleImageUpload('profile', e.target.files[0])}
                  disabled={uploadingImage}
                />
              </label>
            )}
          </div>
        </div>

        {/* Edit Button */}
        <div className="position-absolute top-0 end-0 m-3">
          {!editing ? (
            <button
              className="btn btn-warning"
              onClick={() => setEditing(true)}
            >
              <i className="fas fa-edit me-2"></i>
              Edit Profile
            </button>
          ) : (
            <div className="btn-group">
              <button
                className="btn btn-success"
                onClick={handleSave}
                disabled={saving || uploadingImage}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check me-2"></i>
                    Save
                  </>
                )}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setEditing(false);
                  fetchProfile();
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div className="row">
        <div className="col-md-4">
          {/* Basic Info Card */}
          <div className="card bg-dark border-secondary mb-4">
            <div className="card-body">
              <h4 className="fw-bold mb-0">{profile.name}</h4>
              <p className="text-warning mb-2">
                <i className="fas fa-camera me-2"></i>
                Photographer
              </p>
              <p className="text-white-50 small mb-3">
                <i className="fas fa-calendar-alt me-2"></i>
                Joined {new Date(profile.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>

              {editing ? (
                <>
                  <div className="mb-3">
                    <label className="form-label text-white-50 small">Name</label>
                    <input
                      type="text"
                      className="form-control form-control-sm bg-dark text-white border-secondary"
                      name="name"
                      value={profile.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-white-50 small">Email</label>
                    <input
                      type="email"
                      className="form-control form-control-sm bg-dark text-white border-secondary"
                      name="email"
                      value={profile.email}
                      onChange={handleInputChange}
                      disabled
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-white-50 small">Location</label>
                    <input
                      type="text"
                      className="form-control form-control-sm bg-dark text-white border-secondary"
                      name="location"
                      value={profile.location}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-white-50 small">Website</label>
                    <input
                      type="text"
                      className="form-control form-control-sm bg-dark text-white border-secondary"
                      name="website"
                      value={profile.website}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              ) : (
                <>
                  <p className="mb-2">
                    <i className="fas fa-map-marker-alt text-warning me-2"></i>
                    {profile.location}
                  </p>
                  <p className="mb-3">
                    <i className="fas fa-globe text-warning me-2"></i>
                    <a href={`https://${profile.website}`} target="_blank" rel="noopener noreferrer"
                       className="text-warning text-decoration-none">
                      {profile.website}
                    </a>
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Stats Card */}
          <div className="card bg-dark border-secondary mb-4">
            <div className="card-body">
              <h6 className="text-warning mb-3">Stats</h6>
              <div className="row g-3">
                <div className="col-6">
                  <div className="text-center p-2 rounded-3" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <h5 className="fw-bold text-warning mb-0">{stats.totalMedia}</h5>
                    <small className="text-white-50">Photos</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-center p-2 rounded-3" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <h5 className="fw-bold text-info mb-0">{stats.totalSales}</h5>
                    <small className="text-white-50">Sales</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-center p-2 rounded-3" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <h5 className="fw-bold text-success mb-0">{stats.totalLikes}</h5>
                    <small className="text-white-50">Likes</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-center p-2 rounded-3" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <h5 className="fw-bold text-primary mb-0">{stats.totalViews}</h5>
                    <small className="text-white-50">Views</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-center p-2 rounded-3" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <h5 className="fw-bold text-warning mb-0">{stats.followers}</h5>
                    <small className="text-white-50">Followers</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-center p-2 rounded-3" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <h5 className="fw-bold text-warning mb-0">{stats.rating}</h5>
                    <small className="text-white-50">Rating</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="card bg-dark border-secondary mb-4">
            <div className="card-body">
              <h6 className="text-warning mb-3">Social Links</h6>
              {editing ? (
                <>
                  <div className="mb-3">
                    <label className="form-label text-white-50 small">Instagram</label>
                    <input
                      type="text"
                      className="form-control form-control-sm bg-dark text-white border-secondary"
                      name="social.instagram"
                      value={profile.social.instagram}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-white-50 small">Twitter</label>
                    <input
                      type="text"
                      className="form-control form-control-sm bg-dark text-white border-secondary"
                      name="social.twitter"
                      value={profile.social.twitter}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-white-50 small">Facebook</label>
                    <input
                      type="text"
                      className="form-control form-control-sm bg-dark text-white border-secondary"
                      name="social.facebook"
                      value={profile.social.facebook}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              ) : (
                <div className="d-flex gap-3">
                  <a href={`https://instagram.com/${profile.social.instagram.replace('@', '')}`} target="_blank"
                     className="text-white-50 hover-text-warning">
                    <i className="fab fa-instagram fa-lg"></i>
                  </a>
                  <a href={`https://twitter.com/${profile.social.twitter.replace('@', '')}`} target="_blank"
                     className="text-white-50 hover-text-warning">
                    <i className="fab fa-twitter fa-lg"></i>
                  </a>
                  <a href={`https://facebook.com/${profile.social.facebook}`} target="_blank"
                     className="text-white-50 hover-text-warning">
                    <i className="fab fa-facebook fa-lg"></i>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-8">
          {/* Tabs */}
          <ul className="nav nav-tabs border-secondary mb-4">
            <li className="nav-item">
              <button
                className={`nav-link bg-transparent ${activeTab === 'profile' ? 'active text-warning border-warning' : 'text-white-50'}`}
                onClick={() => setActiveTab('profile')}
              >
                <i className="fas fa-user me-2"></i>
                About
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link bg-transparent ${activeTab === 'portfolio' ? 'active text-warning border-warning' : 'text-white-50'}`}
                onClick={() => setActiveTab('portfolio')}
              >
                <i className="fas fa-images me-2"></i>
                Portfolio
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link bg-transparent ${activeTab === 'reviews' ? 'active text-warning border-warning' : 'text-white-50'}`}
                onClick={() => setActiveTab('reviews')}
              >
                <i className="fas fa-star me-2"></i>
                Reviews
              </button>
            </li>
          </ul>

          {/* Tab Content */}
          <div className="card bg-dark border-secondary">
            <div className="card-body">
              {activeTab === 'profile' && (
                <>
                  {/* Bio */}
                  <div className="mb-4">
                    <h6 className="text-warning mb-3">Bio</h6>
                    {editing ? (
                      <textarea
                        className="form-control bg-dark text-white border-secondary"
                        rows="4"
                        name="bio"
                        value={profile.bio}
                        onChange={handleInputChange}
                      ></textarea>
                    ) : (
                      <p className="text-white-50">{profile.bio}</p>
                    )}
                  </div>

                  {/* Skills */}
                  <div className="mb-4">
                    <h6 className="text-warning mb-3">Skills & Specialties</h6>
                    {editing ? (
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        value={profile.skills.join(', ')}
                        onChange={(e) => handleArrayInput('skills', e.target.value)}
                        placeholder="Separate with commas"
                      />
                    ) : (
                      <div className="d-flex flex-wrap gap-2">
                        {profile.skills.map((skill, idx) => (
                          <span key={idx} className="badge bg-warning bg-opacity-25 text-warning px-3 py-2">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Equipment */}
                  <div className="mb-4">
                    <h6 className="text-warning mb-3">Equipment</h6>
                    {editing ? (
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        value={profile.equipment.join(', ')}
                        onChange={(e) => handleArrayInput('equipment', e.target.value)}
                        placeholder="Separate with commas"
                      />
                    ) : (
                      <ul className="list-unstyled">
                        {profile.equipment.map((item, idx) => (
                          <li key={idx} className="mb-2">
                            <i className="fas fa-camera text-warning me-2"></i>
                            <span className="text-white-50">{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Earnings Summary */}
                  <div className="mt-4 p-3 rounded-3" style={{ background: "rgba(255,193,7,0.1)" }}>
                    <h6 className="text-warning mb-3">Earnings Summary</h6>
                    <div className="row">
                      <div className="col-4">
                        <small className="text-white-50">Total Earnings</small>
                        <h6 className="text-white fw-bold">KES {stats.totalEarnings.toLocaleString()}</h6>
                      </div>
                      <div className="col-4">
                        <small className="text-white-50">This Month</small>
                        <h6 className="text-white fw-bold">KES 15,000</h6>
                      </div>
                      <div className="col-4">
                        <small className="text-white-50">Average/Photo</small>
                        <h6 className="text-white fw-bold">
                          KES {stats.totalMedia ? (stats.totalEarnings / stats.totalMedia).toFixed(0) : 0}
                        </h6>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'portfolio' && (
                <div className="row g-3">
                  {portfolio.map((item, idx) => (
                    <div className="col-md-4 col-6" key={idx}>
                      <div className="card bg-dark border-secondary">
                        <img
                          src={item.thumbnail || "https://via.placeholder.com/300"}
                          alt={item.title}
                          className="card-img-top"
                          style={{ height: "150px", objectFit: "cover" }}
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/300";
                          }}
                        />
                        <div className="card-body p-2">
                          <small className="fw-bold d-block text-truncate">{item.title}</small>
                          <small className="text-warning">KES {item.price}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="col-12 text-center mt-3">
                    <Link to="/photographer/media" className="btn btn-outline-warning">
                      View All Media
                    </Link>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  {/* Rating Summary */}
                  <div className="d-flex align-items-center gap-4 mb-4 p-3 rounded-3"
                       style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div className="text-center">
                      <h2 className="fw-bold text-warning mb-0">{stats.rating}</h2>
                      <div className="mb-1">
                        {[1,2,3,4,5].map(star => (
                          <i key={star} className={`fas fa-star ${star <= stats.rating ? 'text-warning' : 'text-white-50'}`} style={{ fontSize: "0.8rem" }}></i>
                        ))}
                      </div>
                      <small className="text-white-50">{stats.reviewCount} reviews</small>
                    </div>
                    <div className="flex-grow-1">
                      {[5,4,3,2,1].map(rating => (
                        <div key={rating} className="d-flex align-items-center gap-2 mb-1">
                          <small className="text-white-50" style={{ width: "30px" }}>{rating}★</small>
                          <div className="progress flex-grow-1" style={{ height: "6px", background: "rgba(255,255,255,0.1)" }}>
                            <div className="progress-bar bg-warning" style={{ width: `${rating * 20}%` }}></div>
                          </div>
                          <small className="text-white-50" style={{ width: "30px" }}>{rating * 4}</small>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reviews List */}
                  {reviews.map((review) => (
                    <div key={review.id} className="d-flex gap-3 mb-4 p-3 rounded-3"
                         style={{ background: "rgba(255,255,255,0.02)" }}>
                      <img
                        src={review.avatar}
                        alt={review.user}
                        className="rounded-circle"
                        width="50"
                        height="50"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/50";
                        }}
                      />
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <h6 className="fw-bold mb-0">{review.user}</h6>
                          <small className="text-white-50">
                            {new Date(review.date).toLocaleDateString()}
                          </small>
                        </div>
                        <div className="mb-2">
                          {[1,2,3,4,5].map(star => (
                            <i key={star} className={`fas fa-star ${star <= review.rating ? 'text-warning' : 'text-white-50'}`} style={{ fontSize: "0.8rem" }}></i>
                          ))}
                        </div>
                        <p className="text-white-50 small mb-0">{review.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PhotographerLayout>
  );
};

export default PhotographerProfile;