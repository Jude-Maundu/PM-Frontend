import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BuyerLayout from "../Buyer/BuyerLayout";
import PhotographerLayout from "../Photographer/PhotographerLayout";
import ConversationList from "./ConversationList";
import ChatUI from "./ChatUI";
import {
  getConversations,
  getConversationWithUser,
  markConversationAsRead,
  searchUsersForShare,
} from "../../../api/API";
import "./Messaging.css";

const MessagingPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [syncKey, setSyncKey] = useState(0);
  const [pendingUserId, setPendingUserId] = useState(null);
  const [pendingConversationId, setPendingConversationId] = useState(null);

  // New conversation search
  const [showNewConv, setShowNewConv] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const searchDebounceRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id || user._id;
  const userRole = String(localStorage.getItem("role") || "").toLowerCase();
  const Layout = userRole.includes("photographer") ? PhotographerLayout : BuyerLayout;

  // Redirect if not authenticated
  useEffect(() => {
    if (!token || !userId) {
      navigate("/login");
    }
  }, [token, userId, navigate]);

  // Read route state / query params for direct conversation start
  useEffect(() => {
    const routeUserId = location.state?.selectedUserId;
    const urlSearch = new URLSearchParams(location.search);
    const routeConversationId = urlSearch.get("conversation");

    if (routeUserId) {
      setPendingUserId(routeUserId);
    }

    if (routeConversationId) {
      setPendingConversationId(routeConversationId);
    }
  }, [location.state, location.search]);

  useEffect(() => {
    if (!pendingUserId || !userId) return;

    const openConversation = async () => {
      try {
        const response = await getConversationWithUser(pendingUserId);
        if (response?.data) {
          setSelectedConversation(response.data);
        }
      } catch (err) {
        console.error("Failed to open conversation from route state:", err);
      } finally {
        setPendingUserId(null);
      }
    };

    openConversation();
  }, [pendingUserId, userId]);

  // Fetch all conversations
  useEffect(() => {
    if (!userId) return;

    const fetchConversations = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getConversations(50, 0);
        setConversations(response.data || []);
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
        setError(err.response?.data?.message || "Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [userId, syncKey]);

  // Handle conversation selection
  const handleSelectConversation = useCallback(async (conversation) => {
    setSelectedConversation(conversation);
    // Mark as read when selected
    try {
      await markConversationAsRead(conversation._id);
      // Update conversation in list
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === conversation._id
            ? { ...conv, unreadCounts: { ...conv.unreadCounts, [userId]: 0 } }
            : conv
        )
      );
    } catch (err) {
      console.error("Failed to mark conversation as read:", err);
    }
  }, [userId]);

  useEffect(() => {
    if (!pendingConversationId || conversations.length === 0) return;

    const selected = conversations.find((conv) => conv._id === pendingConversationId);
    if (selected) {
      handleSelectConversation(selected);
      setPendingConversationId(null);
    }
  }, [pendingConversationId, conversations, handleSelectConversation]);

  // Handle new message sent - refresh conversations
  const handleMessageSent = () => {
    setSyncKey((prev) => prev + 1);
  };

  // User search for new conversation
  const handleUserSearchChange = (value) => {
    setUserSearchQuery(value);
    clearTimeout(searchDebounceRef.current);
    if (!value.trim()) { setUserSearchResults([]); return; }
    searchDebounceRef.current = setTimeout(async () => {
      setSearchingUsers(true);
      try {
        const res = await searchUsersForShare(value);
        const users = res.data?.users || res.data || [];
        setUserSearchResults(users.filter(u => u._id !== userId));
      } catch { setUserSearchResults([]); }
      finally { setSearchingUsers(false); }
    }, 300);
  };

  const handleStartConversation = async (otherUser) => {
    try {
      const res = await getConversationWithUser(otherUser._id);
      const conv = res.data;
      if (!conv) return;
      setSelectedConversation(conv);
      setShowNewConv(false);
      setUserSearchQuery("");
      setUserSearchResults([]);
      setConversations(prev =>
        prev.find(c => c._id === conv._id) ? prev : [conv, ...prev]
      );
    } catch (err) {
      console.error("Failed to start conversation:", err);
    }
  };

  // Filter conversations by search
  const filteredConversations = conversations.filter((conv) => {
    const participantName =
      conv.participants
        ?.find((p) => p._id !== userId)
        ?.username || "Unknown";
    return participantName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <Layout>
      <div className="messaging-container">
        <div className="messaging-wrapper">
          {/* Conversation List Sidebar */}
          <div className="messaging-sidebar">
            <div className="sidebar-header">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h2 className="fs-4 fw-bold text-white mb-0">Messages</h2>
                <button
                  className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 34, height: 34, background: "rgba(107,189,208,0.15)", color: "#6BBDD0", border: "1px solid rgba(107,189,208,0.3)" }}
                  onClick={() => { setShowNewConv(!showNewConv); setUserSearchQuery(""); setUserSearchResults([]); }}
                  title="New Message"
                >
                  <i className={`fas fa-${showNewConv ? "times" : "edit"}`} style={{ fontSize: "0.8rem" }}></i>
                </button>
              </div>

              {/* New conversation user search */}
              {showNewConv && (
                <div className="mb-3 position-relative">
                  <div className="input-group input-group-sm">
                    <span className="input-group-text" style={{ background: "rgba(107,189,208,0.1)", border: "1px solid rgba(107,189,208,0.3)", color: "#6BBDD0" }}>
                      <i className="fas fa-search" style={{ fontSize: "0.75rem" }}></i>
                    </span>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Search by username..."
                      value={userSearchQuery}
                      onChange={(e) => handleUserSearchChange(e.target.value)}
                      autoFocus
                      style={{ background: "rgba(107,189,208,0.08)", border: "1px solid rgba(107,189,208,0.3)", borderLeft: "none", color: "white" }}
                    />
                  </div>
                  {/* Search results dropdown */}
                  {(userSearchResults.length > 0 || searchingUsers) && (
                    <div className="position-absolute w-100 rounded-2 overflow-hidden mt-1" style={{ zIndex: 100, background: "#0d1f33", border: "1px solid rgba(107,189,208,0.25)", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
                      {searchingUsers && (
                        <div className="text-center py-2">
                          <span className="spinner-border spinner-border-sm" style={{ color: "#6BBDD0" }}></span>
                        </div>
                      )}
                      {userSearchResults.map((user) => (
                        <div
                          key={user._id}
                          className="d-flex align-items-center gap-2 px-3 py-2"
                          style={{ cursor: "pointer", transition: "background 0.15s" }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(107,189,208,0.12)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                          onClick={() => handleStartConversation(user)}
                        >
                          <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ width: 32, height: 32, background: "linear-gradient(135deg, #6BBDD0, #5AAFC3)", color: "#fff", fontWeight: 700, fontSize: "0.85rem" }}>
                            {(user.username || user.email || "U").charAt(0).toUpperCase()}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-white mb-0 text-truncate" style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                              {user.username || user.email}
                            </p>
                            <small className="text-white-50" style={{ fontSize: "0.7rem" }}>
                              {user.role || "user"}
                            </small>
                          </div>
                        </div>
                      ))}
                      {!searchingUsers && userSearchResults.length === 0 && userSearchQuery.trim() && (
                        <p className="text-white-50 text-center py-2 mb-0" style={{ fontSize: "0.8rem" }}>No users found</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Filter existing conversations */}
              {!showNewConv && (
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "white" }}
                />
              )}
            </div>

            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : error ? (
              <div className="alert alert-danger alert-sm mb-3">{error}</div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <p className="small">No conversations yet</p>
              </div>
            ) : (
              <ConversationList
                conversations={filteredConversations}
                selectedConversationId={selectedConversation?._id}
                onSelectConversation={handleSelectConversation}
                currentUserId={userId}
              />
            )}
          </div>

          {/* Chat Window */}
          <div className="messaging-main">
            {selectedConversation ? (
              <ChatUI
                conversation={selectedConversation}
                onMessageSent={handleMessageSent}
                currentUserId={userId}
              />
            ) : (
              <div className="chat-empty">
                <div className="text-center">
                  <i className="fas fa-comments text-muted" style={{ fontSize: "3rem" }}></i>
                  <p className="text-muted mt-3">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MessagingPage;
