import { toast } from "../../../utils/toast";
import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import PhotographerLayout from "./PhotographerLayout";
import PageHeader from "../../PageHeader";
import { API_ENDPOINTS } from "../../../api/apiConfig";
import { getCurrentUserId, getAuthHeaders } from "../../../utils/auth";

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
    profileImagePosition: { x: 50, y: 50 },
    coverImagePosition: { x: 50, y: 50 },
    watermark: "",
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState({ profile: false, cover: false });
  const [error, setError] = useState(null);
  const profilePreviewRef = useRef(null);

  const user = useMemo(() => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : {};
    } catch (e) {
      console.error("Error parsing user:", e);
      return {};
    }
  }, []);

  // Get photographer ID safely
  const photographerId = useMemo(() => {
    const id = getCurrentUserId();
    console.log("🔍 Photographer ID from getCurrentUserId:", id);
    return id;
  }, []);

  const headers = useMemo(() => {
    const authHeaders = getAuthHeaders();
    console.log("🔍 Auth headers:", authHeaders ? "Present" : "Missing");
    return authHeaders;
  }, []);

  // Helper function to get image URL with fallback
  const getImageUrl = useCallback((type) => {
    if (type === 'profile') {
      if (profile.profileImage && !imageError.profile) {
        if (profile.profileImage.startsWith('data:image')) {
          return profile.profileImage;
        }
        if (profile.profileImage.startsWith('http')) {
          return profile.profileImage;
        }
      }
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'Photographer')}&background=ffc107&color=000&size=200`;
    } else {
      if (profile.coverImage && !imageError.cover) {
        if (profile.coverImage.startsWith('data:image') || profile.coverImage.startsWith('http')) {
          return profile.coverImage;
        }
      }
      return "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2070&q=80";
    }
  }, [profile.profileImage, profile.coverImage, imageError, profile.name]);

  const updateStoredUser = useCallback((updates) => {
    try {
      const currentRaw = localStorage.getItem("user");
      const currentUser = currentRaw ? JSON.parse(currentRaw) : {};
      const merged = { ...currentUser, ...updates };
      localStorage.setItem("user", JSON.stringify(merged));
    } catch (err) {
      console.error("Error updating stored user:", err);
    }
  }, []);

  // Load saved cover image from localStorage
  useEffect(() => {
    if (!photographerId) return;

    try {
      const savedCoverImage = localStorage.getItem(`photographer_cover_${photographerId}`);

      if (savedCoverImage) {
        setProfile(prev => ({ ...prev, coverImage: savedCoverImage }));
      }
    } catch (err) {
      console.error("Error loading saved images:", err);
    }
  }, [photographerId]);

  useEffect(() => () => {
    if (profilePreviewRef.current) {
      URL.revokeObjectURL(profilePreviewRef.current);
    }
  }, []);

  // Fetch photographer profile
  const fetchProfile = useCallback(async () => {
    // Check if we have necessary data
    if (!photographerId) {
      console.error("❌ No photographer ID found");
      setError("Please login to view your profile");
      setLoading(false);
      return;
    }

    if (!headers) {
      console.error("❌ No auth headers found");
      setError("Authentication required. Please login.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("📡 Fetching profile for photographer ID:", photographerId);

      // Get user details from backend
      let userData = user;
      try {
        const userRes = await axios.get(API_ENDPOINTS.AUTH.GET_USER(photographerId), {
          headers,
          timeout: 10000
        });
        userData = userRes.data;
        console.log("✅ Profile fetched successfully:", userData);
      } catch (err) {
        console.error("⚠️ Error fetching from backend:", err.message);
        console.log("Using cached user data from localStorage");

        // If no cached user data, show error
        if (!user.name && !user.username) {
          setError("Unable to load profile. Please check your connection and try again.");
          setLoading(false);
          return;
        }
      }

      const savedCoverImage = localStorage.getItem(`photographer_cover_${photographerId}`);

      // Update profile with data from backend or localStorage
      setProfile({
        id: photographerId,
        name: userData?.name || user?.name || user?.username || "Photographer",
        email: userData?.email || user?.email || "photographer@example.com",
        bio: userData?.bio || user?.bio || "Passionate photographer capturing moments and creating visual stories. Specializing in landscape, portrait, and commercial photography.",
        location: userData?.location || user?.location || "Nairobi, Kenya",
        website: userData?.website || user?.website || "www.photographer.com",
        social: userData?.social || user?.social || {
          instagram: "@photographer",
          twitter: "@photographer",
          facebook: "photographer.page",
        },
        skills: userData?.skills || user?.skills || ["Landscape", "Portrait", "Commercial", "Wedding"],
        equipment: userData?.equipment || user?.equipment || ["Canon EOS R5", "Sony A7III", "DJI Mavic 3"],
        joinedDate: userData?.createdAt || user?.createdAt || new Date().toISOString(),
        profileImage: userData?.profilePicture || userData?.profileImage || user?.profilePicture || user?.profileImage || "",
        coverImage: savedCoverImage || userData?.coverImage || user?.coverImage || "",
        profileImagePosition: userData?.profilePicturePosition || user?.profilePicturePosition || { x: 50, y: 50 },
        coverImagePosition: userData?.coverImagePosition || user?.coverImagePosition || { x: 50, y: 50 },
        watermark: userData?.watermark || user?.watermark || "Relic Snap",
      });

    } catch (error) {
      console.error("❌ Error fetching profile:", error);
      setError(error.response?.data?.message || "Failed to load profile. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, [photographerId, user, headers]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const updatePayload = {
        username: profile.name || user.username,
        email: profile.email || user.email,
        bio: profile.bio,
        location: profile.location,
        website: profile.website,
        social: profile.social,
        skills: profile.skills,
        equipment: profile.equipment,
        watermark: profile.watermark || "Relic Snap",
        profilePicturePosition: profile.profileImagePosition,
        coverImagePosition: profile.coverImagePosition,
        profilePicture: profile.profileImage && !String(profile.profileImage).startsWith("blob:")
          ? profile.profileImage
          : "",
      };

      // Try to save to backend
      try {
        const res = await axios.put(API_ENDPOINTS.AUTH.UPDATE_USER(photographerId), updatePayload, {
          headers,
          timeout: 10000
        });
        updateStoredUser(res.data);
        console.log("✅ Profile saved to backend");
      } catch (err) {
        console.log("Backend save failed, saved locally only", err?.response?.data || err.message);
        updateStoredUser(updatePayload);
      }

      toast.success("Profile updated successfully!");
      setEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (type, file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.warning("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.warning("File size must be less than 5MB");
      return;
    }

    setUploadingImage(true);
    setImageError(prev => ({ ...prev, [type]: false }));

    try {
      if (type === "profile") {
        if (profilePreviewRef.current) {
          URL.revokeObjectURL(profilePreviewRef.current);
        }

        const previewUrl = URL.createObjectURL(file);
        profilePreviewRef.current = previewUrl;
        setProfile(prev => ({ ...prev, profileImage: previewUrl }));

        const formData = new FormData();
        formData.append("profilePicture", file);
        formData.append("username", profile.name || user.username || "Photographer");
        formData.append("email", profile.email || user.email || "");

        const res = await axios.put(API_ENDPOINTS.AUTH.UPDATE_USER(photographerId), formData, {
          headers: {
            ...headers,
            "Content-Type": "multipart/form-data",
          },
          timeout: 20000,
        });

        const savedUrl = res.data?.profilePicture || previewUrl;
        setProfile(prev => ({ ...prev, profileImage: savedUrl }));
        updateStoredUser(res.data || { profilePicture: savedUrl });
        toast.success("Profile photo updated successfully!");
      } else {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const base64Image = reader.result;
          try {
            localStorage.setItem(`photographer_cover_${photographerId}`, base64Image);
          } catch (storageErr) {
            console.error("Error saving cover image locally:", storageErr);
            toast.warning("Cover image preview is too large to save on this device.");
          }
          setProfile(prev => ({ ...prev, coverImage: base64Image }));
        };
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(error.response?.data?.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageError = (type) => {
    setImageError(prev => ({ ...prev, [type]: true }));
  };

  // Show loading state
  if (loading) {
    return (
      <PhotographerLayout>
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <div className="spinner-border" style={{ color: "var(--mc-accent)" }}></div>
        </div>
      </PhotographerLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <PhotographerLayout>
        <PageHeader title="My Profile" subtitle="Manage your account details" />
        <div className="mc-page">
          <div className="mc-card text-center" style={{ padding: "2.5rem" }}>
            <div className="alert alert-danger mb-4">
              <i className="fas fa-exclamation-circle me-2"></i>
              {error}
            </div>
            <button
              className="mc-btn mc-btn-primary"
              onClick={() => window.location.reload()}
            >
              <i className="fas fa-sync-alt me-2"></i>
              Retry
            </button>
          </div>
        </div>
      </PhotographerLayout>
    );
  }

  // Show not authenticated state
  if (!photographerId) {
    return (
      <PhotographerLayout>
        <PageHeader title="My Profile" subtitle="Manage your account details" />
        <div className="mc-page">
          <div className="mc-card text-center" style={{ padding: "2.5rem" }}>
            <i className="fas fa-user-lock fa-4x mb-3" style={{ color: "var(--mc-accent-gold)" }}></i>
            <h4 className="text-white mb-3">Authentication Required</h4>
            <p className="text-white-50 mb-4">Please login to view your profile</p>
            <button
              className="mc-btn mc-btn-primary"
              onClick={() => window.location.href = "/login"}
            >
              <i className="fas fa-sign-in-alt me-2"></i>
              Go to Login
            </button>
          </div>
        </div>
      </PhotographerLayout>
    );
  }

  return (
    <PhotographerLayout>
      <PageHeader title="My Profile" subtitle="Manage your account details" />
      <div className="mc-page">
        {/* Cover Image */}
        <div className="position-relative mb-5">
          <div
            className="rounded-3"
            style={{
              height: "300px",
              backgroundImage: `url(${getImageUrl('cover')})`,
              backgroundSize: "cover",
              backgroundPosition: `${profile.coverImagePosition?.x ?? 50}% ${profile.coverImagePosition?.y ?? 50}%`,
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
              <div className="position-absolute bottom-0 end-0 m-3" style={{ minWidth: "260px" }}>
                <div className="d-flex flex-column gap-2">
                  <label className="mc-btn mc-btn-ghost">
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
                  <div style={{ background: "rgba(9, 14, 20, 0.68)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: "0.7rem 0.85rem", color: "#fff" }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.45rem" }}>Position Cover</div>
                    <label style={{ display: "block", fontSize: "0.72rem", color: "rgba(255,255,255,0.8)" }}>Horizontal</label>
                    <input type="range" min="0" max="100" value={profile.coverImagePosition?.x ?? 50} onChange={(e) => setProfile(prev => ({ ...prev, coverImagePosition: { ...prev.coverImagePosition, x: Number(e.target.value) } }))} style={{ width: "100%" }} />
                    <label style={{ display: "block", fontSize: "0.72rem", color: "rgba(255,255,255,0.8)" }}>Vertical</label>
                    <input type="range" min="0" max="100" value={profile.coverImagePosition?.y ?? 50} onChange={(e) => setProfile(prev => ({ ...prev, coverImagePosition: { ...prev.coverImagePosition, y: Number(e.target.value) } }))} style={{ width: "100%" }} />
                  </div>
                </div>
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
                style={{ width: "150px", height: "150px", objectFit: "cover", objectPosition: `${profile.profileImagePosition?.x ?? 50}% ${profile.profileImagePosition?.y ?? 50}%` }}
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
            {editing && (
              <div style={{ marginTop: "1rem", width: "220px", background: "rgba(12, 20, 28, 0.78)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "0.7rem 0.85rem" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#fff", marginBottom: "0.45rem" }}>Position Profile Photo</div>
                <label style={{ display: "block", fontSize: "0.72rem", color: "rgba(255,255,255,0.78)" }}>Horizontal</label>
                <input type="range" min="0" max="100" value={profile.profileImagePosition?.x ?? 50} onChange={(e) => setProfile(prev => ({ ...prev, profileImagePosition: { ...prev.profileImagePosition, x: Number(e.target.value) } }))} style={{ width: "100%" }} />
                <label style={{ display: "block", fontSize: "0.72rem", color: "rgba(255,255,255,0.78)" }}>Vertical</label>
                <input type="range" min="0" max="100" value={profile.profileImagePosition?.y ?? 50} onChange={(e) => setProfile(prev => ({ ...prev, profileImagePosition: { ...prev.profileImagePosition, y: Number(e.target.value) } }))} style={{ width: "100%" }} />
              </div>
            )}
          </div>

          {/* Edit Button */}
          <div className="position-absolute top-0 end-0 m-3">
            {!editing ? (
              <button
                className="mc-btn mc-btn-primary"
                onClick={() => setEditing(true)}
              >
                <i className="fas fa-edit me-2"></i>
                Edit Profile
              </button>
            ) : (
              <div className="d-flex gap-2">
                <button
                  className="mc-btn mc-btn-primary"
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
                  className="mc-btn mc-btn-ghost"
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

        {/* Profile Content */}
        <div className="row">
          <div className="col-md-4">
            {/* Basic Info Card */}
            <div className="mc-card" style={{ marginBottom: "1.25rem" }}>
              <h4 className="fw-bold mb-0">{profile.name}</h4>
              <p style={{ color: "var(--mc-accent-gold)", marginBottom: "0.5rem" }}>
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
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-white-50 small">Email</label>
                    <input
                      type="email"
                      className="form-control form-control-sm bg-dark text-white border-secondary"
                      value={profile.email}
                      disabled
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-white-50 small">Location</label>
                    <input
                      type="text"
                      className="form-control form-control-sm bg-dark text-white border-secondary"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-white-50 small">Website</label>
                    <input
                      type="text"
                      className="form-control form-control-sm bg-dark text-white border-secondary"
                      value={profile.website}
                      onChange={(e) => setProfile({ ...profile, website: e.target.value })}
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

            {/* Social Links Card */}
            <div className="mc-card" style={{ marginBottom: "1.25rem" }}>
              <div className="mc-card-header">
                <span className="mc-card-title">SOCIAL LINKS</span>
              </div>
              {editing ? (
                <>
                  <div className="mb-3">
                    <label className="form-label text-white-50 small">Instagram</label>
                    <input
                      type="text"
                      className="form-control form-control-sm bg-dark text-white border-secondary"
                      value={profile.social.instagram}
                      onChange={(e) => setProfile({
                        ...profile,
                        social: { ...profile.social, instagram: e.target.value }
                      })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-white-50 small">Twitter</label>
                    <input
                      type="text"
                      className="form-control form-control-sm bg-dark text-white border-secondary"
                      value={profile.social.twitter}
                      onChange={(e) => setProfile({
                        ...profile,
                        social: { ...profile.social, twitter: e.target.value }
                      })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-white-50 small">Facebook</label>
                    <input
                      type="text"
                      className="form-control form-control-sm bg-dark text-white border-secondary"
                      value={profile.social.facebook}
                      onChange={(e) => setProfile({
                        ...profile,
                        social: { ...profile.social, facebook: e.target.value }
                      })}
                    />
                  </div>
                </>
              ) : (
                <div className="d-flex gap-3">
                  {profile.social.instagram && (
                    <a href={`https://instagram.com/${profile.social.instagram.replace('@', '')}`} target="_blank" rel="noreferrer"
                       className="text-white-50">
                      <i className="fab fa-instagram fa-lg"></i>
                    </a>
                  )}
                  {profile.social.twitter && (
                    <a href={`https://twitter.com/${profile.social.twitter.replace('@', '')}`} target="_blank" rel="noreferrer"
                       className="text-white-50">
                      <i className="fab fa-twitter fa-lg"></i>
                    </a>
                  )}
                  {profile.social.facebook && (
                    <a href={`https://facebook.com/${profile.social.facebook}`} target="_blank" rel="noreferrer"
                       className="text-white-50">
                      <i className="fab fa-facebook fa-lg"></i>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="col-md-8">
            <div className="mc-card">
              {/* Bio */}
              <div className="mb-4">
                <div className="mc-card-header">
                  <span className="mc-card-title">BIO</span>
                </div>
                {editing ? (
                  <textarea
                    className="form-control bg-dark text-white border-secondary"
                    rows="4"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  ></textarea>
                ) : (
                  <p className="text-white-50">{profile.bio}</p>
                )}
              </div>

              {/* Skills */}
              <div className="mb-4">
                <div className="mc-card-header">
                  <span className="mc-card-title">SKILLS &amp; SPECIALTIES</span>
                </div>
                {editing ? (
                  <input
                    type="text"
                    className="form-control bg-dark text-white border-secondary"
                    value={profile.skills.join(', ')}
                    onChange={(e) => setProfile({ ...profile, skills: e.target.value.split(',').map(s => s.trim()) })}
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
              <div className="mb-2">
                <div className="mc-card-header">
                  <span className="mc-card-title">EQUIPMENT</span>
                </div>
                {editing ? (
                  <input
                    type="text"
                    className="form-control bg-dark text-white border-secondary"
                    value={profile.equipment.join(', ')}
                    onChange={(e) => setProfile({ ...profile, equipment: e.target.value.split(',').map(s => s.trim()) })}
                    placeholder="Separate with commas"
                  />
                ) : (
                  <ul className="list-unstyled mb-0">
                    {profile.equipment.map((item, idx) => (
                      <li key={idx} className="mb-2">
                        <i className="fas fa-camera text-warning me-2"></i>
                        <span className="text-white-50">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {editing && (
                <div className="mt-4">
                  <button
                    className="mc-btn mc-btn-primary"
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
                        <i className="fas fa-save me-2"></i>
                        Save Profile
                      </>
                    )}
                  </button>
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
