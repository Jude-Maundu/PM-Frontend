import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../api/apiConfig";

const STAR = "★";
const EMPTY_STAR = "☆";
const GOLD = "#f0c040";

function StarDisplay({ rating, size = "1rem" }) {
  return (
    <span style={{ fontSize: size, lineHeight: 1 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} style={{ color: s <= Math.round(rating) ? GOLD : "rgba(240,192,64,0.3)" }}>
          {s <= Math.round(rating) ? STAR : EMPTY_STAR}
        </span>
      ))}
    </span>
  );
}

function StarSelector({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <span style={{ fontSize: "1.6rem", cursor: "pointer", lineHeight: 1 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span
          key={s}
          style={{ color: s <= (hovered || value) ? GOLD : "rgba(240,192,64,0.3)", transition: "color 0.15s" }}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}
        >
          {s <= (hovered || value) ? STAR : EMPTY_STAR}
        </span>
      ))}
    </span>
  );
}

function ReviewerAvatar({ username }) {
  const initials = (username || "?").slice(0, 2).toUpperCase();
  return (
    <div
      style={{
        width: "38px", height: "38px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #6BBDD0, #0d6e7e)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontWeight: 700, fontSize: "0.85rem",
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

/**
 * ReviewsSection
 * Props:
 *   photographerId {string}  — fetch reviews for a photographer
 *   mediaId        {string}  — fetch reviews for a specific media item
 *   showForm       {boolean} — show the "Write a Review" form if user is logged in
 */
const ReviewsSection = ({ photographerId, mediaId, showForm = false }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const currentUser = userStr ? JSON.parse(userStr) : null;

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let url;
      if (mediaId) {
        url = API_ENDPOINTS.REVIEWS.BY_MEDIA(mediaId);
      } else if (photographerId) {
        url = API_ENDPOINTS.REVIEWS.BY_PHOTOGRAPHER(photographerId);
      } else {
        return;
      }
      const res = await axios.get(url);
      const raw = res.data;
      const list = Array.isArray(raw) ? raw : (raw?.reviews || raw?.data || []);
      setReviews(list);
    } catch (err) {
      // Silently fail — reviews may not exist yet
      console.warn("[ReviewsSection] fetch error:", err.message);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [photographerId, mediaId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { setError("Please select a star rating."); return; }
    if (!comment.trim()) { setError("Please write a comment."); return; }
    if (!token) { setError("You must be logged in to submit a review."); return; }

    try {
      setSubmitting(true);
      setError(null);
      await axios.post(
        API_ENDPOINTS.REVIEWS.CREATE,
        { photographerId, mediaId, rating, comment: comment.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRating(0);
      setComment("");
      setSuccessMsg("Review submitted successfully!");
      setTimeout(() => setSuccessMsg(null), 4000);
      fetchReviews();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviews.length
      : 0;

  return (
    <div className="reviews-section" style={{ marginTop: "48px" }}>
      {/* Section Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px" }}>
        <h3 style={{ fontWeight: 700, fontSize: "1.4rem", margin: 0 }}>
          <i className="fas fa-star me-2" style={{ color: GOLD }}></i>
          Reviews &amp; Ratings
        </h3>
        {reviews.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <StarDisplay rating={avgRating} size="1.1rem" />
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}>
              {avgRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
            </span>
          </div>
        )}
      </div>

      {/* Write a Review Form */}
      {showForm && currentUser && (
        <div className="card bg-dark border-secondary mb-4">
          <div className="card-header bg-transparent border-secondary">
            <h6 className="mb-0 text-white">
              <i className="fas fa-pen me-2" style={{ color: "var(--pm-teal)" }}></i>
              Write a Review
            </h6>
          </div>
          <div className="card-body">
            {error && (
              <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: "0.875rem" }}>
                <i className="fas fa-exclamation-circle me-2"></i>{error}
              </div>
            )}
            {successMsg && (
              <div className="alert alert-success py-2 px-3 mb-3" style={{ fontSize: "0.875rem" }}>
                <i className="fas fa-check-circle me-2"></i>{successMsg}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-white-50 small fw-semibold mb-1">Your Rating</label>
                <div>
                  <StarSelector value={rating} onChange={setRating} />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label text-white-50 small fw-semibold mb-1">Comment</label>
                <textarea
                  className="form-control bg-dark text-white border-secondary"
                  rows={3}
                  placeholder="Share your experience…"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  style={{ resize: "vertical", minHeight: "80px" }}
                  maxLength={1000}
                />
                <div className="text-end mt-1">
                  <small className="text-white-50">{comment.length}/1000</small>
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-warning fw-semibold px-4"
                disabled={submitting}
              >
                {submitting
                  ? <><span className="spinner-border spinner-border-sm me-2"></span>Submitting…</>
                  : <><i className="fas fa-paper-plane me-2"></i>Submit Review</>
                }
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Show login prompt for the form if not logged in */}
      {showForm && !currentUser && (
        <div className="alert alert-info mb-4" style={{ background: "rgba(107,189,208,0.1)", border: "1px solid rgba(107,189,208,0.3)", color: "#6BBDD0" }}>
          <i className="fas fa-info-circle me-2"></i>
          <a href="/login" style={{ color: "#6BBDD0", fontWeight: 600 }}>Log in</a> to write a review.
        </div>
      )}

      {/* Review List */}
      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border" style={{ color: GOLD }}></div>
        </div>
      ) : reviews.length === 0 ? (
        <p style={{ color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>
          No reviews yet. Be the first to leave one!
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {reviews.map((r, idx) => {
            const reviewer = r.reviewer || r.user || {};
            const name = reviewer.username || reviewer.name || "Anonymous";
            const dateStr = r.createdAt
              ? new Date(r.createdAt).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" })
              : "";
            return (
              <div
                key={r._id || idx}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  padding: "16px 20px",
                  display: "flex",
                  gap: "14px",
                  alignItems: "flex-start",
                }}
              >
                <ReviewerAvatar username={name} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "6px" }}>
                    <span style={{ fontWeight: 700, color: "#fff", fontSize: "0.95rem" }}>{name}</span>
                    <StarDisplay rating={r.rating || 0} size="0.9rem" />
                    {dateStr && (
                      <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.78rem", marginLeft: "auto" }}>
                        {dateStr}
                      </span>
                    )}
                  </div>
                  {r.comment && (
                    <p style={{ margin: 0, color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                      {r.comment}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;
