import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import PageHeader from "../../PageHeader";
import { API_BASE_URL } from "../../../api/apiConfig";
import { getAuthHeaders } from "../../../utils/auth";
import { toast } from "../../../utils/toast";

const API = API_BASE_URL;

const TARGETS = [
  { value: "all",           label: "All Users",        icon: "fa-globe",          desc: "Every registered user on the platform" },
  { value: "buyers",        label: "Clients / Buyers", icon: "fa-shopping-bag",   desc: "Users who browse and purchase photos"  },
  { value: "photographers", label: "Photographers",    icon: "fa-camera",         desc: "Registered photographer accounts"      },
  { value: "specific",      label: "Specific Users",   icon: "fa-user-check",     desc: "Hand-pick individual recipients"       },
];

const PRIORITIES = [
  { value: "low",    label: "Low",    color: "#6B7280" },
  { value: "normal", label: "Normal", color: "#3B82F6" },
  { value: "high",   label: "High",   color: "#EF4444" },
];

const EMPTY_FORM = {
  target: "all",
  title: "",
  message: "",
  priority: "normal",
  actionUrl: "",
  actionLabel: "",
};

const Avatar = ({ letter }) => (
  <div style={{
    width: 28, height: 28, borderRadius: "50%", background: "var(--mc-accent)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: "0.7rem", color: "#fff", flexShrink: 0,
  }}>
    {letter}
  </div>
);

const PriorityDot = ({ value }) => {
  const p = PRIORITIES.find(x => x.value === value);
  return <span style={{ width: 8, height: 8, borderRadius: "50%", background: p?.color, display: "inline-block", marginRight: 5 }}></span>;
};

export default function NotificationsBroadcast() {
  const [tab, setTab]         = useState("compose"); // "compose" | "history"
  const [form, setForm]       = useState(EMPTY_FORM);
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(null); // { count } after success

  // Specific-user search
  const [userSearch, setUserSearch]   = useState("");
  const [userResults, setUserResults] = useState([]);
  const [searching, setSearching]     = useState(false);
  const [selected, setSelected]       = useState([]); // [{_id, username, email, role}]

  // History
  const [history, setHistory]         = useState([]);
  const [histLoading, setHistLoading] = useState(false);

  const searchUsers = useCallback(async (q) => {
    if (!q || q.trim().length < 2) { setUserResults([]); return; }
    try {
      setSearching(true);
      const res = await axios.get(`${API}/notifications/share/search-recipients?query=${encodeURIComponent(q)}&limit=10`, { headers: getAuthHeaders() });
      setUserResults(res.data || []);
    } catch { setUserResults([]); }
    finally { setSearching(false); }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => searchUsers(userSearch), 300);
    return () => clearTimeout(id);
  }, [userSearch, searchUsers]);

  const fetchHistory = useCallback(async () => {
    try {
      setHistLoading(true);
      const res = await axios.get(`${API}/notifications/admin/broadcast/history`, { headers: getAuthHeaders() });
      setHistory(res.data.history || []);
    } catch { toast.error("Failed to load history"); }
    finally { setHistLoading(false); }
  }, []);

  useEffect(() => {
    if (tab === "history") fetchHistory();
  }, [tab, fetchHistory]);

  const toggleSelected = (user) => {
    setSelected(prev =>
      prev.find(u => u._id === user._id)
        ? prev.filter(u => u._id !== user._id)
        : [...prev, user]
    );
  };

  const handleSend = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast.error("Title and message are required");
      return;
    }
    if (form.target === "specific" && selected.length === 0) {
      toast.error("Select at least one recipient");
      return;
    }

    try {
      setSending(true);
      setSent(null);
      const payload = {
        target:    form.target,
        title:     form.title.trim(),
        message:   form.message.trim(),
        priority:  form.priority,
        ...(form.actionUrl   && { actionUrl:   form.actionUrl.trim()   }),
        ...(form.actionLabel && { actionLabel: form.actionLabel.trim() }),
        ...(form.target === "specific" && { recipientIds: selected.map(u => u._id) }),
      };
      const res = await axios.post(`${API}/notifications/admin/broadcast`, payload, { headers: getAuthHeaders() });
      setSent({ count: res.data.sent });
      toast.success(`Sent to ${res.data.sent} user(s)`);
      setForm(EMPTY_FORM);
      setSelected([]);
      setUserSearch("");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send notification");
    } finally { setSending(false); }
  };

  const targetInfo = TARGETS.find(t => t.value === form.target);
  const charLeft   = 500 - form.message.length;

  return (
    <div className="mc-page">
      <PageHeader
        title="Send Notifications"
        subtitle="Broadcast announcements to clients, photographers, or specific users"
      />

      {/* Tabs */}
      <div className="mc-card mb-3">
        <div className="d-flex gap-2">
          {[
            { key: "compose", icon: "fa-paper-plane", label: "Compose"  },
            { key: "history", icon: "fa-history",     label: "History"  },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`btn btn-sm ${tab === t.key ? "btn-primary" : "btn-outline-secondary"}`}>
              <i className={`fas ${t.icon} me-2`}></i>{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── COMPOSE TAB ── */}
      {tab === "compose" && (
        <div className="row g-3">

          {/* Left: Form */}
          <div className="col-lg-7">
            <div className="mc-card">
              <h6 style={{ fontWeight: 700, marginBottom: "1.25rem" }}>
                <i className="fas fa-edit me-2" style={{ color: "var(--mc-accent)" }}></i>Compose Notification
              </h6>

              {/* Target audience */}
              <label className="form-label text-white-50 small mb-2">Audience</label>
              <div className="row g-2 mb-3">
                {TARGETS.map(t => (
                  <div key={t.value} className="col-6">
                    <div
                      onClick={() => { setForm(f => ({ ...f, target: t.value })); setSelected([]); setUserSearch(""); }}
                      style={{
                        padding: "0.6rem 0.75rem",
                        borderRadius: 10,
                        border: `1.5px solid ${form.target === t.value ? "var(--mc-accent)" : "rgba(255,255,255,0.08)"}`,
                        background: form.target === t.value ? "rgba(91,127,229,0.15)" : "rgba(255,255,255,0.03)",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <i className={`fas ${t.icon}`} style={{ color: form.target === t.value ? "var(--mc-accent)" : "#6B7280", fontSize: "0.85rem" }}></i>
                        <span style={{ fontWeight: 600, fontSize: "0.8rem" }}>{t.label}</span>
                        {form.target === t.value && <i className="fas fa-check-circle ms-auto" style={{ color: "var(--mc-accent)", fontSize: "0.75rem" }}></i>}
                      </div>
                      <div style={{ fontSize: "0.68rem", opacity: 0.5, marginTop: "0.2rem", paddingLeft: "1.35rem" }}>{t.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Specific-user picker */}
              {form.target === "specific" && (
                <div style={{ marginBottom: "1rem", padding: "0.75rem", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.5rem", opacity: 0.7 }}>
                    <i className="fas fa-users me-1"></i>Recipients {selected.length > 0 && <span className="badge bg-primary ms-1">{selected.length} selected</span>}
                  </div>

                  {/* Selected chips */}
                  {selected.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "0.5rem" }}>
                      {selected.map(u => (
                        <span key={u._id} style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "2px 8px 2px 4px", borderRadius: 20, background: "rgba(91,127,229,0.2)", border: "1px solid rgba(91,127,229,0.3)", fontSize: "0.72rem" }}>
                          <Avatar letter={(u.username || u.email)?.[0]?.toUpperCase()} />
                          {u.username || u.email}
                          <span onClick={() => toggleSelected(u)} style={{ cursor: "pointer", opacity: 0.6, marginLeft: 2 }}>×</span>
                        </span>
                      ))}
                    </div>
                  )}

                  <input
                    className="form-control form-control-sm bg-dark text-white border-secondary"
                    placeholder="Search users by name or email..."
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                  />
                  {searching && <div style={{ fontSize: "0.72rem", opacity: 0.5, marginTop: "0.35rem" }}><i className="fas fa-spinner fa-spin me-1"></i>Searching…</div>}
                  {userResults.length > 0 && (
                    <div style={{ maxHeight: 180, overflowY: "auto", marginTop: "0.4rem", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)" }}>
                      {userResults.map(u => {
                        const isChosen = selected.find(s => s._id === u._id);
                        return (
                          <div key={u._id} onClick={() => toggleSelected(u)} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 0.6rem", cursor: "pointer", background: isChosen ? "rgba(91,127,229,0.12)" : "transparent", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                            <Avatar letter={(u.name || u.username || u.email)?.[0]?.toUpperCase()} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: "0.78rem", fontWeight: 600 }}>{u.name || u.username}</div>
                              <div style={{ fontSize: "0.65rem", opacity: 0.5 }}>{u.email}</div>
                            </div>
                            <span className={`badge bg-${u.role === "photographer" ? "warning text-dark" : "secondary"}`} style={{ fontSize: "0.58rem" }}>{u.role}</span>
                            {isChosen && <i className="fas fa-check" style={{ color: "var(--mc-accent)", fontSize: "0.7rem" }}></i>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Title */}
              <label className="form-label text-white-50 small mb-1">Title <span style={{ color: "#EF4444" }}>*</span></label>
              <input
                className="form-control bg-dark text-white border-secondary mb-3"
                placeholder="e.g. System Maintenance Notice"
                maxLength={120}
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />

              {/* Message */}
              <label className="form-label text-white-50 small mb-1">Message <span style={{ color: "#EF4444" }}>*</span></label>
              <textarea
                className="form-control bg-dark text-white border-secondary mb-1"
                rows={4}
                placeholder="Write your notification message here…"
                maxLength={500}
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                style={{ resize: "vertical" }}
              />
              <div style={{ fontSize: "0.68rem", opacity: 0.4, textAlign: "right", marginBottom: "1rem" }}>
                {charLeft} characters remaining
              </div>

              {/* Priority */}
              <label className="form-label text-white-50 small mb-2">Priority</label>
              <div className="d-flex gap-2 mb-3">
                {PRIORITIES.map(p => (
                  <button key={p.value} type="button"
                    onClick={() => setForm(f => ({ ...f, priority: p.value }))}
                    style={{ padding: "0.3rem 0.85rem", borderRadius: 20, border: `1.5px solid ${form.priority === p.value ? p.color : "rgba(255,255,255,0.1)"}`, background: form.priority === p.value ? `${p.color}22` : "transparent", color: form.priority === p.value ? p.color : "inherit", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600 }}>
                    <PriorityDot value={p.value} />{p.label}
                  </button>
                ))}
              </div>

              {/* Optional action button */}
              <label className="form-label text-white-50 small mb-1">Action Link <span style={{ opacity: 0.4 }}>(optional)</span></label>
              <div className="row g-2 mb-3">
                <div className="col-7">
                  <input className="form-control form-control-sm bg-dark text-white border-secondary"
                    placeholder="URL e.g. /buyer/explore"
                    value={form.actionUrl}
                    onChange={e => setForm(f => ({ ...f, actionUrl: e.target.value }))}
                  />
                </div>
                <div className="col-5">
                  <input className="form-control form-control-sm bg-dark text-white border-secondary"
                    placeholder="Button label"
                    value={form.actionLabel}
                    onChange={e => setForm(f => ({ ...f, actionLabel: e.target.value }))}
                  />
                </div>
              </div>

              {/* Send button */}
              <button
                className="btn btn-primary w-100"
                onClick={handleSend}
                disabled={sending || !form.title.trim() || !form.message.trim()}
              >
                {sending
                  ? <><span className="spinner-border spinner-border-sm me-2"></span>Sending…</>
                  : <><i className="fas fa-paper-plane me-2"></i>Send Notification</>}
              </button>

              {sent && (
                <div style={{ marginTop: "0.75rem", padding: "0.6rem 0.75rem", borderRadius: 8, background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", color: "#10B981", fontSize: "0.82rem", textAlign: "center" }}>
                  <i className="fas fa-check-circle me-1"></i>
                  Delivered to <strong>{sent.count}</strong> user{sent.count !== 1 ? "s" : ""}
                </div>
              )}
            </div>
          </div>

          {/* Right: Live preview */}
          <div className="col-lg-5">
            <div className="mc-card" style={{ position: "sticky", top: "1rem" }}>
              <h6 style={{ fontWeight: 700, marginBottom: "1.25rem" }}>
                <i className="fas fa-eye me-2" style={{ color: "var(--mc-accent)" }}></i>Preview
              </h6>

              <div style={{ fontSize: "0.72rem", opacity: 0.5, marginBottom: "0.5rem" }}>
                <i className={`fas ${targetInfo?.icon} me-1`}></i>
                To: <strong>{targetInfo?.label}</strong>
                {form.target === "specific" && selected.length > 0 && ` (${selected.length} user${selected.length !== 1 ? "s" : ""})`}
              </div>

              {/* Notification card mockup */}
              <div style={{ borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden", background: "rgba(255,255,255,0.03)" }}>
                {/* Top stripe by priority */}
                <div style={{ height: 3, background: PRIORITIES.find(p => p.value === form.priority)?.color || "#3B82F6" }}></div>
                <div style={{ padding: "0.85rem 1rem" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.65rem" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--mc-accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <i className="fas fa-bell" style={{ fontSize: "0.85rem", color: "#fff" }}></i>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                        {form.title || <span style={{ opacity: 0.35 }}>Notification title…</span>}
                      </div>
                      <div style={{ fontSize: "0.75rem", opacity: 0.65, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {form.message || <span style={{ opacity: 0.4 }}>Your message will appear here…</span>}
                      </div>
                      {form.actionUrl && (
                        <div style={{ marginTop: "0.6rem" }}>
                          <span style={{ display: "inline-block", padding: "0.25rem 0.7rem", borderRadius: 20, background: "var(--mc-accent)", color: "#fff", fontSize: "0.72rem", fontWeight: 600 }}>
                            {form.actionLabel || "Open →"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ marginTop: "0.5rem", fontSize: "0.65rem", opacity: 0.35, textAlign: "right" }}>
                    Just now · <PriorityDot value={form.priority} />{form.priority}
                  </div>
                </div>
              </div>

              {/* Quick-fill templates */}
              <div style={{ marginTop: "1rem" }}>
                <div style={{ fontSize: "0.72rem", opacity: 0.5, marginBottom: "0.5rem" }}>Quick templates</div>
                <div className="d-flex flex-column gap-2">
                  {[
                    { label: "Maintenance",  title: "Scheduled Maintenance",      msg: "We will be performing scheduled maintenance on our platform. Some features may be temporarily unavailable. We apologize for any inconvenience." },
                    { label: "New Feature",  title: "New Feature Available",      msg: "We've just launched an exciting new feature! Log in to check it out and let us know what you think." },
                    { label: "Promotion",    title: "Special Offer — Limited Time",msg: "For a limited time, enjoy exclusive discounts on premium photos. Browse our collection and save today!" },
                    { label: "Policy",       title: "Policy Update",              msg: "We've updated our Terms of Service and Privacy Policy. Please review the changes the next time you log in." },
                  ].map(t => (
                    <button key={t.label} type="button"
                      onClick={() => setForm(f => ({ ...f, title: t.title, message: t.msg }))}
                      style={{ textAlign: "left", padding: "0.4rem 0.7rem", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", cursor: "pointer", fontSize: "0.75rem", color: "inherit" }}>
                      <i className="fas fa-magic me-1" style={{ opacity: 0.5 }}></i>{t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {tab === "history" && (
        <div className="mc-table-card">
          {histLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border" style={{ color: "var(--mc-accent)" }}></div>
            </div>
          ) : history.length === 0 ? (
            <div className="mc-empty py-5">
              <i className="fas fa-history fa-2x mb-2"></i>
              <p>No notifications sent yet.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-dark table-hover mb-0">
                <thead>
                  <tr>
                    <th className="ps-3">Title</th>
                    <th>Message</th>
                    <th>Priority</th>
                    <th>Sent by</th>
                    <th>Recipients</th>
                    <th className="pe-3">When</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={i}>
                      <td className="ps-3">
                        <div style={{ fontWeight: 600, fontSize: "0.83rem", maxWidth: 220 }}>{h.title}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: "0.75rem", opacity: 0.65, maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {h.message}
                        </div>
                      </td>
                      <td>
                        <span style={{ display: "flex", alignItems: "center", fontSize: "0.75rem" }}>
                          <PriorityDot value={h.priority} />
                          <span style={{ textTransform: "capitalize" }}>{h.priority}</span>
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: "0.75rem" }}>{h.senderInfo?.username || h.senderInfo?.email || "—"}</div>
                      </td>
                      <td>
                        <span className="badge bg-primary">{h.totalSent}</span>
                        <span style={{ fontSize: "0.68rem", opacity: 0.5, marginLeft: 5 }}>{h.readCount} read</span>
                      </td>
                      <td className="pe-3">
                        <small style={{ opacity: 0.6 }}>{new Date(h.sentAt).toLocaleString()}</small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
