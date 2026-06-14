import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Helmet } from "react-helmet-async";
import { API_ENDPOINTS, API_BASE_URL } from "../../../api/apiConfig";

function imageUrl(raw) {
  if (!raw) return null;
  if (raw.startsWith("http")) return raw;
  return `${API_BASE_URL.replace("/api", "")}/${raw}`;
}

function formatKES(n) {
  return `KES ${Number(n).toLocaleString()}`;
}

const EVENT_LABELS = {
  wedding: "Wedding", graduation: "Graduation", birthday: "Birthday",
  marathon: "Marathon", corporate: "Corporate", concert: "Concert",
  portrait: "Portrait", wildlife: "Wildlife", landscape: "Landscape",
  sports: "Sports", other: "Photography",
};

export default function PublicAlbumView() {
  const { albumId } = useParams();
  const navigate    = useNavigate();

  const [album, setAlbum]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [lightbox, setLightbox] = useState(null); // media object
  const [buying, setBuying]     = useState(null);  // 'album' | mediaId
  const [phone, setPhone]       = useState("");
  const [payStatus, setPayStatus] = useState(""); // '' | 'pending' | 'success' | 'error'
  const [payMsg, setPayMsg]     = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_ENDPOINTS.MEDIA.GET_PUBLIC_GALLERY(albumId));
      setAlbum(res.data.album || res.data);
    } catch (e) {
      setError(e.response?.data?.message || "Album not found or is private.");
    } finally {
      setLoading(false);
    }
  }, [albumId]);

  useEffect(() => { load(); }, [load]);

  const isLoggedIn = !!localStorage.getItem("token");
  const token      = localStorage.getItem("token");

  const handleBuy = async (type, mediaItem) => {
    if (!isLoggedIn) { navigate(`/login?next=/album/${albumId}`); return; }
    setBuying(type === "album" ? "album" : mediaItem._id);
    setPayStatus(""); setPayMsg(""); setPhone("");
  };

  const submitPayment = async () => {
    if (!phone) { setPayMsg("Enter your M-Pesa phone number"); return; }
    setPayStatus("pending"); setPayMsg("Initiating M-Pesa payment…");
    try {
      const payload = buying === "album"
        ? { albumId, phone, type: "album" }
        : { mediaId: buying, phone, type: "photo" };
      await axios.post(`${API_BASE_URL}/payments/buy`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayStatus("success");
      setPayMsg("Check your phone for the M-Pesa prompt and enter your PIN.");
    } catch (e) {
      setPayStatus("error");
      setPayMsg(e.response?.data?.message || "Payment failed. Please try again.");
    }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--pm-cream, #F9F7F4)" }}>
      <div style={{ textAlign: "center" }}>
        <div className="spinner-border" style={{ color: "var(--pm-teal)", width: "2.5rem", height: "2.5rem" }} role="status"></div>
        <p style={{ color: "var(--pm-text-muted)", marginTop: "1rem", fontSize: "0.9rem" }}>Loading album…</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--pm-cream, #F9F7F4)", padding: "2rem" }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <i className="fas fa-lock" style={{ fontSize: "3rem", color: "var(--pm-text-muted)", display: "block", marginBottom: "1rem" }}></i>
        <h4 style={{ color: "var(--pm-navy)", fontWeight: 700 }}>Album Not Found</h4>
        <p style={{ color: "var(--pm-text-muted)" }}>{error}</p>
        <Link to="/explore" style={{ background: "var(--pm-navy)", color: "#fff", padding: "0.75rem 2rem", borderRadius: 12, textDecoration: "none", fontWeight: 700, display: "inline-block", marginTop: "1rem" }}>Browse Albums</Link>
      </div>
    </div>
  );

  const media    = album?.media || [];
  const cover    = imageUrl(album?.coverImage);
  const photog   = album?.photographer;
  const hasPrice = album?.price > 0;
  const nav      = "var(--pm-navy)";
  const teal     = "var(--pm-teal, #6BBDD0)";
  const eventLabel = EVENT_LABELS[album?.eventType] || "Photography";

  return (
    <>
      <Helmet>
        <title>{album?.name || "Album"} — Relic Snap</title>
        <meta name="description" content={album?.description || `Browse and purchase photos from ${album?.name}`} />
      </Helmet>

      {/* Navbar */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(26,46,59,0.96)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.85rem 1.5rem" }}>
        <Link to="/explore" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <i className="fas fa-camera" style={{ color: teal }}></i>
          <span style={{ color: "#fff", fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.1rem" }}>Relic Snap</span>
        </Link>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {!isLoggedIn && <Link to="/login" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: "0.9rem", padding: "0.4rem 1rem" }}>Sign In</Link>}
          <Link to="/explore" style={{ color: "#fff", textDecoration: "none", fontSize: "0.9rem", padding: "0.4rem 1rem", background: "rgba(255,255,255,0.1)", borderRadius: 8 }}>Browse Albums</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ marginTop: 56, position: "relative", height: "360px", overflow: "hidden", background: "linear-gradient(135deg, #1A2E3B 0%, #0f1e28 100%)" }}>
        {cover && <img src={cover} alt={album?.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(26,46,59,0.2) 0%, rgba(26,46,59,0.85) 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "2rem 2rem 2.5rem" }}>
          <span style={{ background: teal, color: "#fff", borderRadius: 999, padding: "0.2rem 0.75rem", fontSize: "0.75rem", fontWeight: 700, display: "inline-block", marginBottom: "0.75rem" }}>
            {eventLabel}
          </span>
          <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, color: "#fff", fontSize: "clamp(1.6rem,4vw,2.8rem)", margin: "0 0 0.5rem", lineHeight: 1.2 }}>
            {album?.name}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            {photog && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <img src={imageUrl(photog.profilePicture) || `https://ui-avatars.com/api/?name=${photog.username}&background=6BBDD0&color=fff`}
                  alt={photog.username} style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.5)" }} />
                <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.9rem" }}>by <strong style={{ color: "#fff" }}>{photog.username}</strong></span>
              </div>
            )}
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" }}><i className="fas fa-images me-1"></i>{media.length} photos</span>
            {album?.location && <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" }}><i className="fas fa-map-marker-alt me-1"></i>{album.location}</span>}
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" }}><i className="fas fa-eye me-1"></i>{album?.views || 0} views</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ background: "var(--pm-cream, #F9F7F4)", minHeight: "60vh" }}>
        <div className="container" style={{ paddingTop: "2.5rem", paddingBottom: "4rem" }}>
          <div className="row g-4">
            {/* Photos grid */}
            <div className="col-12 col-lg-8">
              {album?.description && (
                <p style={{ color: "var(--pm-text-muted)", lineHeight: 1.7, marginBottom: "1.5rem", fontSize: "0.95rem" }}>{album.description}</p>
              )}

              {media.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 1rem", background: "#fff", borderRadius: 16 }}>
                  <i className="fas fa-images" style={{ fontSize: "2.5rem", color: "var(--pm-gray-200)", display: "block", marginBottom: "0.75rem" }}></i>
                  <p style={{ color: "var(--pm-text-muted)" }}>No photos in this album yet.</p>
                </div>
              ) : (
                <div style={{ columns: "3 200px", columnGap: "0.75rem" }}>
                  {media.filter(m => m.isApproved !== false).map((m, idx) => {
                    const src = imageUrl(m.watermarkedUrl || m.fileUrl);
                    return (
                      <div key={m._id || idx} onClick={() => setLightbox(m)}
                        style={{ breakInside: "avoid", marginBottom: "0.75rem", borderRadius: 12, overflow: "hidden", cursor: "pointer", position: "relative", display: "block" }}
                        onMouseEnter={e => e.currentTarget.querySelector(".ph-overlay").style.opacity = "1"}
                        onMouseLeave={e => e.currentTarget.querySelector(".ph-overlay").style.opacity = "0"}
                      >
                        <img src={src} alt={m.title} style={{ width: "100%", display: "block", borderRadius: 12 }} loading="lazy" />
                        <div className="ph-overlay" style={{ position: "absolute", inset: 0, background: "rgba(26,46,59,0.7)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem", opacity: 0, transition: "opacity 0.2s", borderRadius: 12 }}>
                          <i className="fas fa-expand" style={{ color: "#fff", fontSize: "1.25rem" }}></i>
                          {m.price > 0 && <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.85rem" }}>{formatKES(m.price)}</span>}
                          {m.price === 0 && <span style={{ color: "#fff", fontSize: "0.8rem" }}>Free with album</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="col-12 col-lg-4">
              <div style={{ position: "sticky", top: 80, display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Buy album card */}
                {hasPrice && (
                  <div style={{ background: nav, borderRadius: 18, padding: "1.5rem", color: "#fff" }}>
                    <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.25rem" }}>Full Album Access</div>
                    <div style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "2rem", marginBottom: "0.75rem" }}>{formatKES(album.price)}</div>
                    <ul style={{ margin: "0 0 1.25rem", padding: 0, listStyle: "none" }}>
                      {[`All ${media.length} photos`, "High-resolution downloads", "Lifetime access"].map(f => (
                        <li key={f} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", marginBottom: "0.4rem", color: "rgba(255,255,255,0.8)" }}>
                          <i className="fas fa-check-circle" style={{ color: teal }}></i> {f}
                        </li>
                      ))}
                    </ul>
                    <button onClick={() => handleBuy("album")} style={{ width: "100%", padding: "0.85rem", background: teal, color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}>
                      <i className="fas fa-shopping-bag me-2"></i>Buy Full Album
                    </button>
                  </div>
                )}

                {/* Per-photo info */}
                <div style={{ background: "#fff", borderRadius: 18, padding: "1.25rem", border: "1px solid var(--pm-gray-200)" }}>
                  <div style={{ fontWeight: 700, color: nav, marginBottom: "0.5rem", fontSize: "0.95rem" }}><i className="fas fa-images me-2" style={{ color: teal }}></i>Individual Photos</div>
                  <p style={{ color: "var(--pm-text-muted)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>Click any photo to preview and purchase it individually.</p>
                  {media.filter(m => m.price > 0).length > 0 && (
                    <div style={{ fontSize: "0.8rem", color: "var(--pm-text-muted)" }}>
                      Prices from <strong style={{ color: nav }}>{formatKES(Math.min(...media.filter(m => m.price > 0).map(m => m.price)))}</strong>
                    </div>
                  )}
                </div>

                {/* Photographer info */}
                {photog && (
                  <div style={{ background: "#fff", borderRadius: 18, padding: "1.25rem", border: "1px solid var(--pm-gray-200)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                      <img src={imageUrl(photog.profilePicture) || `https://ui-avatars.com/api/?name=${photog.username}&background=6BBDD0&color=fff`}
                        alt={photog.username} style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }} />
                      <div>
                        <div style={{ fontWeight: 700, color: nav, fontSize: "0.95rem" }}>{photog.username}</div>
                        {photog.location && <div style={{ fontSize: "0.78rem", color: "var(--pm-text-muted)" }}><i className="fas fa-map-marker-alt me-1"></i>{photog.location}</div>}
                      </div>
                    </div>
                    {photog.bio && <p style={{ color: "var(--pm-text-muted)", fontSize: "0.82rem", lineHeight: 1.6, margin: 0 }}>{photog.bio}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => { if (!buying) setLightbox(null); }} style={{ position: "fixed", inset: 0, background: "rgba(10,15,20,0.96)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <button onClick={() => setLightbox(null)} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: 40, height: 40, borderRadius: "50%", fontSize: "1.1rem", cursor: "pointer" }}>
            <i className="fas fa-times"></i>
          </button>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: 700, width: "100%", display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
            <img src={imageUrl(lightbox.watermarkedUrl || lightbox.fileUrl)} alt={lightbox.title} style={{ maxWidth: "100%", maxHeight: "65vh", objectFit: "contain", borderRadius: 14 }} />
            <div style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)", borderRadius: 14, padding: "1.25rem 1.5rem", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <div style={{ fontWeight: 700, color: "#fff", fontSize: "1rem" }}>{lightbox.title}</div>
                {lightbox.description && <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.8rem", marginTop: "0.2rem" }}>{lightbox.description}</div>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem" }}>
                  {lightbox.price > 0 ? formatKES(lightbox.price) : "Free with album"}
                </span>
                {lightbox.price > 0 && (
                  <button onClick={() => handleBuy("photo", lightbox)} style={{ background: teal, color: "#fff", border: "none", borderRadius: 10, padding: "0.6rem 1.4rem", fontWeight: 700, cursor: "pointer" }}>
                    Buy Photo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment modal */}
      {buying && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,15,20,0.7)", zIndex: 9100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "2rem", maxWidth: 420, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <h5 style={{ fontWeight: 700, color: nav, marginBottom: "0.25rem" }}>Complete Purchase</h5>
            <p style={{ color: "var(--pm-text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
              {buying === "album" ? `Full album — ${formatKES(album?.price)}` : `Photo — ${formatKES(media.find(m => m._id === buying)?.price || 0)}`}
            </p>

            {payStatus !== "success" && (
              <>
                <label style={{ fontWeight: 600, fontSize: "0.85rem", color: nav, marginBottom: "0.4rem", display: "block" }}>
                  <i className="fas fa-phone me-1" style={{ color: teal }}></i> M-Pesa Number (254XXXXXXXXX)
                </label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="254712345678" className="form-control mb-3" style={{ borderRadius: 10 }} />
              </>
            )}

            {payMsg && (
              <div style={{ padding: "0.75rem 1rem", borderRadius: 10, marginBottom: "1rem", fontSize: "0.85rem", background: payStatus === "success" ? "rgba(76,201,166,0.1)" : payStatus === "error" ? "rgba(232,85,85,0.1)" : "rgba(107,189,208,0.1)", color: payStatus === "success" ? "#0F7B52" : payStatus === "error" ? "#c0392b" : nav, border: `1px solid ${payStatus === "success" ? "rgba(76,201,166,0.3)" : payStatus === "error" ? "rgba(232,85,85,0.3)" : "rgba(107,189,208,0.3)"}` }}>
                <i className={`fas fa-${payStatus === "success" ? "check-circle" : payStatus === "error" ? "exclamation-circle" : "spinner fa-spin"} me-2`}></i>{payMsg}
              </div>
            )}

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => { setBuying(null); setPayStatus(""); setPayMsg(""); }} style={{ flex: 1, padding: "0.8rem", background: "transparent", border: "1.5px solid var(--pm-gray-200)", color: nav, borderRadius: 12, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              {payStatus !== "success" && (
                <button onClick={submitPayment} disabled={payStatus === "pending"} style={{ flex: 2, padding: "0.8rem", background: nav, color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, cursor: "pointer" }}>
                  {payStatus === "pending" ? <span className="spinner-border spinner-border-sm"></span> : <><i className="fas fa-mobile-alt me-1"></i>Pay via M-Pesa</>}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
