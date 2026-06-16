import React from "react";
import { Link } from "react-router-dom";
import { getStoredUser, getDisplayName, getProfilePhoto } from "../../../utils/auth";

const StaffWorkspacePage = ({
  Layout,
  accent = "#6BBDD0",
  icon = "fa-layer-group",
  title,
  subtitle,
  description,
  stats = [],
  details = [],
  shortcuts = [],
}) => {
  const user = getStoredUser();
  const displayName = getDisplayName(user) || "Staff Member";
  const profilePhoto = getProfilePhoto(user);
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <Layout>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div
          className="mc-card"
          style={{
            background: `linear-gradient(135deg, ${accent}22 0%, rgba(8,15,28,0.94) 78%)`,
            border: `1px solid ${accent}55`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ minWidth: 0, flex: "1 1 320px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", padding: "0.35rem 0.7rem", borderRadius: 999, background: `${accent}22`, color: accent, fontSize: "0.72rem", fontWeight: 700, marginBottom: "0.85rem" }}>
                <i className={`fas ${icon}`}></i>
                <span>{title}</span>
              </div>
              <h2 style={{ margin: 0, fontSize: "1.7rem", fontWeight: 800, color: "var(--mc-text)" }}>{title}</h2>
              <p style={{ margin: "0.4rem 0 0", color: "var(--mc-text-muted)", maxWidth: 700 }}>
                {subtitle}
              </p>
              {description ? (
                <p style={{ margin: "0.75rem 0 0", color: "var(--mc-text)", maxWidth: 760, lineHeight: 1.6 }}>
                  {description}
                </p>
              ) : null}
            </div>

            <div className="mc-card" style={{ minWidth: 260, flex: "0 1 300px", background: "rgba(6,12,22,0.55)", border: `1px solid ${accent}33` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    overflow: "hidden",
                    flexShrink: 0,
                    background: accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: "1.15rem",
                  }}
                >
                  {profilePhoto ? (
                    <img src={profilePhoto} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    avatarLetter
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--mc-text)" }}>{displayName}</div>
                  <div style={{ fontSize: "0.84rem", color: "var(--mc-text-muted)" }}>{user?.email || "No email on file"}</div>
                  <div style={{ marginTop: "0.4rem", display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.72rem", color: accent }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: accent }}></span>
                    <span>{user?.role || "staff"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {stats.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
            {stats.map((stat) => (
              <div key={stat.label} className="mc-card" style={{ borderTop: `3px solid ${stat.color || accent}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                  <div>
                    <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--mc-text-muted)" }}>
                      {stat.label}
                    </div>
                    <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--mc-text)", marginTop: "0.2rem" }}>
                      {stat.value}
                    </div>
                  </div>
                  <span style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: `${stat.color || accent}22`, color: stat.color || accent }}>
                    <i className={`fas ${stat.icon || "fa-chart-line"}`}></i>
                  </span>
                </div>
                {stat.note ? (
                  <div style={{ marginTop: "0.45rem", fontSize: "0.8rem", color: "var(--mc-text-muted)" }}>{stat.note}</div>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(280px, 1fr)", gap: "1rem" }}>
          <div className="mc-card">
            <div className="mc-card-header mb-3">
              <span className="mc-card-title">WORKSPACE CHECKLIST</span>
            </div>
            {details.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {details.map((detail, index) => (
                  <div key={`${detail.title}-${index}`} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                    <span style={{ width: 28, height: 28, borderRadius: "50%", background: `${accent}22`, color: accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <i className={`fas ${detail.icon || "fa-check"}`}></i>
                    </span>
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--mc-text)" }}>{detail.title}</div>
                      <div style={{ color: "var(--mc-text-muted)", fontSize: "0.92rem", lineHeight: 1.55 }}>{detail.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: "var(--mc-text-muted)" }}>This workspace is ready for role-specific tools and automations.</div>
            )}
          </div>

          <div className="mc-card">
            <div className="mc-card-header mb-3">
              <span className="mc-card-title">QUICK LINKS</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
              {shortcuts.map((shortcut) => (
                <Link
                  key={shortcut.to}
                  to={shortcut.to}
                  className="btn"
                  style={{
                    background: shortcut.primary ? accent : "transparent",
                    color: shortcut.primary ? "#071018" : "var(--mc-text)",
                    border: `1px solid ${accent}66`,
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.8rem 0.95rem",
                    fontWeight: 700,
                  }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}>
                    <i className={`fas ${shortcut.icon || "fa-arrow-right"}`}></i>
                    <span>{shortcut.label}</span>
                  </span>
                  <i className="fas fa-chevron-right" style={{ opacity: 0.7 }}></i>
                </Link>
              ))}
              {shortcuts.length === 0 ? (
                <div style={{ color: "var(--mc-text-muted)", fontSize: "0.9rem" }}>
                  Add connected tools here as this staff area grows.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StaffWorkspacePage;
