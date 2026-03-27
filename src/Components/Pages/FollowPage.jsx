import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserFollowers, getUserFollowing } from "../../api/API";

const FollowPage = ({ Layout, roleLabel }) => {
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : {};
  const userId = user.id || user._id;

  useEffect(() => {
    const fetchFollowData = async () => {
      if (!userId) {
        setLoading(false);
        setError("Unable to load follow data. Please login again.");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const [followersRes, followingRes] = await Promise.all([
          getUserFollowers(userId),
          getUserFollowing(userId),
        ]);

        setFollowers(followersRes.data?.followers || []);
        setFollowing(followingRes.data?.following || []);
      } catch (err) {
        console.error("Follow page load failed:", err);
        setError(err.response?.data?.message || "Unable to load follow information.");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowData();
  }, [userId]);

  const handleStartConversation = (otherUserId) => {
    if (!otherUserId || otherUserId === userId) return;
    navigate("/messages", { state: { selectedUserId: otherUserId } });
  };

  const renderUserItem = (person) => {
    const name = person.name || person.username || person.email || "Unknown user";
    const caption = person.username ? `@${person.username}` : person.email || "No handle";

    return (
      <div
        key={person._id || person.id || caption}
        className="d-flex align-items-center justify-content-between py-3 border-bottom border-white-10"
      >
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-circle bg-warning text-dark d-flex align-items-center justify-content-center"
            style={{ width: 44, height: 44, fontWeight: 700 }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="fw-semibold text-white">{name}</div>
            <div className="text-white-50 small">{caption}</div>
          </div>
        </div>
        <button
          className="btn btn-sm btn-outline-warning"
          onClick={() => handleStartConversation(person._id || person.id)}
        >
          Message
        </button>
      </div>
    );
  };

  return (
    <Layout>
      <div className="container-fluid">
        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-4">
          <div>
            <h2 className="mb-1">Followers & Following</h2>
            <p className="text-muted mb-0">
              See who follows you, who you follow, and start conversations from your follow lists.
            </p>
          </div>
          <div className="text-end text-muted">
            <small>{roleLabel} follow panel</small>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <div className="row gy-4">
            <div className="col-lg-6">
              <div className="card bg-secondary bg-opacity-10 border-secondary h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div>
                      <h5 className="card-title mb-1">Followers</h5>
                      <p className="text-muted mb-0">People who already follow you.</p>
                    </div>
                    <span className="badge bg-warning text-dark">{followers.length}</span>
                  </div>

                  {followers.length === 0 ? (
                    <div className="text-center py-4 text-white-50">
                      You do not have any followers yet.
                    </div>
                  ) : (
                    followers.map(renderUserItem)
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card bg-secondary bg-opacity-10 border-secondary h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div>
                      <h5 className="card-title mb-1">Following</h5>
                      <p className="text-muted mb-0">People you are currently following.</p>
                    </div>
                    <span className="badge bg-warning text-dark">{following.length}</span>
                  </div>

                  {following.length === 0 ? (
                    <div className="text-center py-4 text-white-50">
                      You are not following anyone yet.
                    </div>
                  ) : (
                    following.map(renderUserItem)
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FollowPage;
