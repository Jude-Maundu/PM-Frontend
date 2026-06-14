import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../../api/apiConfig";
import { placeholderMedium } from "../../../utils/placeholders";
import { getImageUrl, resolveUrl } from "../../../utils/imageUrl";

const POLL_INTERVAL = 3000;
const MAX_POLLS = 60; // 3 min max

const ShareAccess = () => {
  const { token } = useParams();
  const [shareData, setShareData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Purchase flow state
  const [step, setStep] = useState("view"); // view | phone | waiting | success | failed
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [purchasing, setPurchasing] = useState(false);
  const [checkoutRequestID, setCheckoutRequestID] = useState(null);
  const [pollCount, setPollCount] = useState(0);
  const [downloadItems, setDownloadItems] = useState([]);
  const [paymentAmount, setPaymentAmount] = useState(0);

  // Fetch share data on load
  useEffect(() => {
    const fetchShare = async () => {
      if (!token) { setError("Invalid share link."); setLoading(false); return; }
      try {
        const res = await axios.get(API_ENDPOINTS.SHARE.ACCESS(token), { timeout: 12000 });
        const data = res.data?.data || res.data;
        if (!data || data.success === false) {
          setError(data?.message || "Share link not found or has expired.");
        } else {
          setShareData(data);
        }
      } catch (err) {
        if (err.code === "ECONNABORTED") {
          setError("The server took too long to respond. Please try again in a moment.");
        } else {
          setError(err.response?.data?.message || "Unable to load this shared content. The link may have expired.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchShare();
  }, [token]);

  // Calculate total price
  const totalPrice = shareData?.shareType === "album"
    ? (shareData?.album?.media || []).reduce((sum, m) => sum + Number(m.price || 0), 0)
    : Number(shareData?.media?.price || 0);

  const itemCount = shareData?.shareType === "album"
    ? (shareData?.album?.media || []).length
    : 1;

  // Resolve image URL
  const resolveImage = (item) => {
    if (!item) return placeholderMedium;
    return getImageUrl(item, placeholderMedium) || placeholderMedium;
  };

  // Validate phone
  const validatePhone = (val) => {
    const cleaned = val.replace(/[^0-9]/g, "").replace(/^0/, "254");
    if (!/^254\d{9}$/.test(cleaned)) return "Enter a valid Kenyan number (e.g. 0712345678)";
    return "";
  };

  // Initiate purchase
  const handlePurchase = async (e) => {
    e.preventDefault();
    const err = validatePhone(phone);
    if (err) { setPhoneError(err); return; }
    setPhoneError("");
    setPurchasing(true);

    try {
      const res = await axios.post(API_ENDPOINTS.SHARE.PURCHASE(token), { phone });
      setCheckoutRequestID(res.data.checkoutRequestID);
      setPaymentAmount(res.data.amount);
      setPollCount(0);
      setStep("waiting");
    } catch (err) {
      setPhoneError(err.response?.data?.message || "Failed to initiate payment. Please try again.");
    } finally {
      setPurchasing(false);
    }
  };

  // Poll for payment status
  const pollStatus = useCallback(async () => {
    if (!checkoutRequestID || step !== "waiting") return;

    try {
      const res = await axios.get(API_ENDPOINTS.SHARE.PAYMENT_STATUS(token, checkoutRequestID));
      const { status, downloadItems: items } = res.data;

      if (status === "completed") {
        setDownloadItems(items || []);
        setStep("success");
      } else if (status === "failed") {
        setStep("failed");
      } else {
        setPollCount(prev => {
          if (prev + 1 >= MAX_POLLS) { setStep("failed"); return prev; }
          return prev + 1;
        });
      }
    } catch {
      setPollCount(prev => prev + 1);
    }
  }, [checkoutRequestID, step, token]);

  useEffect(() => {
    if (step !== "waiting") return;
    const timer = setTimeout(pollStatus, POLL_INTERVAL);
    return () => clearTimeout(timer);
  }, [step, pollCount, pollStatus]);

  // ── Layout shell (no BuyerLayout — works for non-authenticated guests) ──
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #0a1e32 100%)" }}>

      {/* Minimal brand navbar */}
      <nav style={{ background: "rgba(10,22,40,0.95)", borderBottom: "1px solid rgba(107,189,208,0.2)", padding: "14px 24px" }}
        className="d-flex align-items-center justify-content-between">
        <span className="fw-bold text-white" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem" }}>
          <img src="/rs-logo.png" alt="Relic Snap" style={{ width: 28, height: 28, objectFit: "contain", marginRight: "0.5rem" }} />
          Relic Snap
        </span>
        <div className="d-flex gap-2">
          <Link to="/explore" className="btn btn-sm btn-outline-light rounded-pill px-3" style={{ opacity: 0.7 }}>
            Explore
          </Link>
          <Link to="/login" className="btn btn-sm rounded-pill px-3"
            style={{ background: "#6BBDD0", color: "#fff", border: "none" }}>
            Sign In
          </Link>
        </div>
      </nav>

      <div className="container py-5" style={{ maxWidth: "900px" }}>

        {/* ── Loading ── */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border mb-3" style={{ color: "#6BBDD0", width: "3rem", height: "3rem" }} role="status"></div>
            <p className="text-white-50">Loading shared content...</p>
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div className="text-center py-5">
            <i className="fas fa-link-slash fa-4x mb-4" style={{ color: "#6BBDD0", opacity: 0.6 }}></i>
            <h4 className="text-white mb-2">Link Unavailable</h4>
            <p className="text-white-50 mb-4">{error}</p>
            <Link to="/explore" className="btn rounded-pill px-4 py-2"
              style={{ background: "#6BBDD0", color: "#fff" }}>
              <i className="fas fa-compass me-2"></i>Browse Public Photos
            </Link>
          </div>
        )}

        {/* ── Main content ── */}
        {!loading && !error && shareData && (
          <>
            {/* Shared-by badge */}
            {shareData.sharedBy && (
              <div className="d-flex align-items-center gap-2 mb-4">
                <div className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 36, height: 36, background: "rgba(107,189,208,0.2)", border: "1px solid rgba(107,189,208,0.4)" }}>
                  <i className="fas fa-camera-retro" style={{ color: "#6BBDD0", fontSize: "0.9rem" }}></i>
                </div>
                <div>
                  <span className="text-white fw-semibold" style={{ fontSize: "0.9rem" }}>
                    {shareData.sharedBy.username || shareData.sharedBy.email || "Photographer"}
                  </span>
                  <span className="text-white-50 ms-2" style={{ fontSize: "0.8rem" }}>shared this with you</span>
                </div>
              </div>
            )}

            {/* Hero card */}
            <div className="rounded-4 overflow-hidden mb-4"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(107,189,208,0.15)", backdropFilter: "blur(12px)" }}>
              <div className="row g-0">
                {/* Cover image */}
                <div className="col-md-5" style={{ background: "#0a1628", minHeight: "260px" }}>
                  {(() => {
                    const coverSrc = shareData.shareType === "album"
                      ? (resolveUrl(shareData.album?.coverImage) || resolveImage(shareData.album?.media?.[0]))
                      : resolveImage(shareData.media);
                    return coverSrc && coverSrc !== placeholderMedium
                      ? <img src={coverSrc} alt={shareData.media?.title || shareData.album?.name || "Shared"} className="w-100 h-100" style={{ objectFit: "cover", minHeight: "260px", maxHeight: "340px" }} onError={e => { e.target.style.display = "none"; }} />
                      : <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "260px", background: "linear-gradient(135deg,#0d2137,#0a1e32)" }}>
                          <i className="fas fa-images" style={{ fontSize: "3rem", color: "rgba(107,189,208,0.3)", marginBottom: "0.75rem" }}></i>
                          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.8rem" }}>No cover image</span>
                        </div>;
                  })()}

                </div>

                {/* Details */}
                <div className="col-md-7 p-4 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex gap-2 flex-wrap mb-3">
                      <span className="badge rounded-pill px-3 py-2"
                        style={{ background: "rgba(107,189,208,0.2)", color: "#6BBDD0", border: "1px solid rgba(107,189,208,0.3)", fontSize: "0.75rem" }}>
                        {shareData.shareType === "album" ? "Album" : "Photo"}
                      </span>
                      {itemCount > 1 && (
                        <span className="badge rounded-pill px-3 py-2"
                          style={{ background: "rgba(255,255,255,0.08)", color: "#ccc", fontSize: "0.75rem" }}>
                          {itemCount} items
                        </span>
                      )}
                      {shareData.expiresAt && (
                        <span className="badge rounded-pill px-3 py-2"
                          style={{ background: "rgba(255,255,255,0.06)", color: "#999", fontSize: "0.75rem" }}>
                          <i className="fas fa-clock me-1"></i>
                          Expires {new Date(shareData.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <h3 className="text-white fw-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {shareData.media?.title || shareData.album?.name || "Shared Content"}
                    </h3>

                    {shareData.message && (
                      <p className="text-white-50 mb-3" style={{ fontSize: "0.9rem", fontStyle: "italic" }}>
                        "{shareData.message}"
                      </p>
                    )}

                    <p className="text-white-50 mb-4" style={{ fontSize: "0.85rem" }}>
                      {shareData.media?.description || shareData.album?.description ||
                        (shareData.shareType === "album"
                          ? `A curated collection of ${itemCount} high-quality photo${itemCount !== 1 ? "s" : ""}.`
                          : "A high-quality photo available for purchase.")}
                    </p>
                  </div>

                  {/* Price + CTA */}
                  <div>
                    {step === "view" && (
                      <>
                        <div className="d-flex align-items-center gap-3 mb-3">
                          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", fontWeight: 700, color: "#6BBDD0" }}>
                            KES {totalPrice.toLocaleString()}
                          </span>
                          {itemCount > 1 && (
                            <span className="text-white-50" style={{ fontSize: "0.8rem" }}>
                              ({itemCount} photos)
                            </span>
                          )}
                        </div>
                        <button
                          className="btn w-100 py-3 fw-bold rounded-pill"
                          style={{ background: "linear-gradient(135deg, #6BBDD0, #5AAFC3)", color: "#fff", fontSize: "1rem", letterSpacing: "0.5px" }}
                          onClick={() => setStep("phone")}
                        >
                          <i className="fas fa-mobile-alt me-2"></i>
                          Buy via M-Pesa
                        </button>
                        <p className="text-white-50 text-center mt-2" style={{ fontSize: "0.75rem" }}>
                          <i className="fas fa-shield-alt me-1"></i>
                          Secure payment · No account required
                        </p>
                      </>
                    )}

                    {(step === "phone" || step === "waiting" || step === "success" || step === "failed") && (
                      <div className="text-white-50 text-center" style={{ fontSize: "0.85rem" }}>
                        <i className="fas fa-check-circle me-1" style={{ color: "#6BBDD0" }}></i>
                        KES {totalPrice.toLocaleString()} · {itemCount} item{itemCount !== 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Album grid preview ── */}
            {shareData.shareType === "album" && step === "view" && (
              <div>
                <h6 className="text-white-50 mb-3" style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1px" }}>
                  <i className="fas fa-images me-2"></i>
                  Photos in this album
                  {shareData.album?.media?.length > 0 && <span className="ms-2">({shareData.album.media.length})</span>}
                </h6>

                {(!shareData.album?.media || shareData.album.media.length === 0) ? (
                  <div className="rounded-4 d-flex flex-column align-items-center justify-content-center py-5"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(107,189,208,0.2)" }}>
                    <i className="fas fa-images mb-2" style={{ fontSize: "2rem", color: "rgba(107,189,208,0.3)" }}></i>
                    <p className="text-white-50 mb-0" style={{ fontSize: "0.85rem" }}>No photos in this album yet.</p>
                  </div>
                ) : (
                  <div style={{ columns: "3 160px", columnGap: "0.6rem" }}>
                    {shareData.album.media.map((item, idx) => {
                      const src = resolveImage(item);
                      return (
                        <div key={item._id || idx} style={{ breakInside: "avoid", marginBottom: "0.6rem", borderRadius: 10, overflow: "hidden", position: "relative" }}>
                          {src && src !== placeholderMedium
                            ? <img src={src} alt={item.title || "Photo"} style={{ width: "100%", display: "block", borderRadius: 10 }} loading="lazy" onError={e => { e.target.parentElement.style.background = "#0d2137"; e.target.style.display = "none"; }} />
                            : <div style={{ width: "100%", aspectRatio: "4/3", background: "linear-gradient(135deg,#0d2137,#0a1628)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <i className="fas fa-image" style={{ color: "rgba(107,189,208,0.2)", fontSize: "1.5rem" }}></i>
                              </div>
                          }
                          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0.4rem 0.5rem", background: "linear-gradient(transparent, rgba(0,0,0,0.8))", borderRadius: "0 0 10px 10px" }}>
                            <div style={{ color: "#fff", fontSize: "0.65rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title || "Untitled"}</div>
                            {item.price > 0 && <div style={{ color: "#6BBDD0", fontSize: "0.65rem", fontWeight: 700 }}>KES {Number(item.price).toLocaleString()}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── Step: Phone entry ── */}
            {step === "phone" && (
              <div className="rounded-4 p-4 mt-2"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(107,189,208,0.2)" }}>
                <h5 className="text-white fw-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                  <i className="fas fa-mobile-alt me-2" style={{ color: "#6BBDD0" }}></i>
                  Enter your M-Pesa number
                </h5>
                <p className="text-white-50 mb-4" style={{ fontSize: "0.85rem" }}>
                  You'll receive an M-Pesa prompt on your phone to pay <strong className="text-white">KES {totalPrice.toLocaleString()}</strong>.
                </p>

                <form onSubmit={handlePurchase}>
                  <div className="mb-3">
                    <label className="form-label text-white-50 small">M-Pesa Phone Number</label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text"
                        style={{ background: "rgba(107,189,208,0.1)", border: "1px solid rgba(107,189,208,0.3)", color: "#6BBDD0" }}>
                        <i className="fas fa-phone"></i>
                      </span>
                      <input
                        type="tel"
                        className="form-control"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(107,189,208,0.3)",
                          borderLeft: "none",
                          color: "#fff",
                          fontSize: "1.1rem"
                        }}
                        placeholder="0712 345 678"
                        value={phone}
                        onChange={e => { setPhone(e.target.value); setPhoneError(""); }}
                        autoFocus
                      />
                    </div>
                    {phoneError && (
                      <small className="text-danger mt-1 d-block"><i className="fas fa-exclamation-circle me-1"></i>{phoneError}</small>
                    )}
                    <small className="text-white-50 mt-1 d-block">Safaricom M-Pesa numbers only (07XX or 01XX)</small>
                  </div>

                  <div className="d-flex gap-3">
                    <button type="button" className="btn btn-outline-secondary rounded-pill px-4"
                      onClick={() => { setStep("view"); setPhoneError(""); }}>
                      Back
                    </button>
                    <button type="submit" className="btn flex-grow-1 py-2 rounded-pill fw-bold"
                      style={{ background: "#6BBDD0", color: "#fff" }}
                      disabled={purchasing || !phone}>
                      {purchasing ? (
                        <><span className="spinner-border spinner-border-sm me-2"></span>Sending...</>
                      ) : (
                        <><i className="fas fa-paper-plane me-2"></i>Send M-Pesa Prompt</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── Step: Waiting for payment ── */}
            {step === "waiting" && (
              <div className="rounded-4 p-4 mt-2 text-center"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(107,189,208,0.2)" }}>
                <div className="mb-4" style={{ position: "relative", display: "inline-block" }}>
                  <div className="spinner-border" role="status"
                    style={{ width: "4rem", height: "4rem", color: "#6BBDD0", borderWidth: "3px" }}></div>
                  <i className="fas fa-mobile-alt position-absolute"
                    style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)", color: "#6BBDD0", fontSize: "1.4rem" }}></i>
                </div>
                <h5 className="text-white fw-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Check your phone!
                </h5>
                <p className="text-white-50 mb-1">An M-Pesa prompt has been sent to <strong className="text-white">{phone}</strong></p>
                <p className="text-white-50 mb-4" style={{ fontSize: "0.85rem" }}>
                  Enter your M-Pesa PIN to pay <strong className="text-white">KES {(paymentAmount || totalPrice).toLocaleString()}</strong>
                </p>

                {/* Progress dots */}
                <div className="d-flex justify-content-center gap-2 mb-4">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="rounded-circle"
                      style={{
                        width: 8, height: 8,
                        background: "#6BBDD0",
                        animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                        opacity: 0.7
                      }} />
                  ))}
                </div>

                <p className="text-white-50 mb-3" style={{ fontSize: "0.75rem" }}>
                  Auto-checking every 3 seconds... ({Math.floor((MAX_POLLS - pollCount) * POLL_INTERVAL / 1000)}s remaining)
                </p>
                <button className="btn btn-outline-secondary btn-sm rounded-pill"
                  onClick={() => { setStep("phone"); setCheckoutRequestID(null); }}>
                  Cancel
                </button>
              </div>
            )}

            {/* ── Step: Success — show downloads ── */}
            {step === "success" && (
              <div className="rounded-4 p-4 mt-2"
                style={{ background: "rgba(46,204,154,0.06)", border: "1px solid rgba(46,204,154,0.25)" }}>
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <i className="fas fa-check-circle fa-4x" style={{ color: "#2ECC9A" }}></i>
                  </div>
                  <h4 className="text-white fw-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Payment Successful!
                  </h4>
                  <p className="text-white-50">
                    You paid <strong className="text-white">KES {(paymentAmount || totalPrice).toLocaleString()}</strong>.
                    Your photos are ready to download.
                  </p>
                </div>

                <div className="row g-3">
                  {downloadItems.length > 0 ? downloadItems.map((item, idx) => (
                    <div className="col-12" key={idx}>
                      <div className="d-flex align-items-center justify-content-between p-3 rounded-3"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <div className="d-flex align-items-center gap-3">
                          <i className="fas fa-image" style={{ color: "#6BBDD0", fontSize: "1.2rem" }}></i>
                          <div>
                            <p className="text-white mb-0 fw-semibold" style={{ fontSize: "0.9rem" }}>{item.title || "Photo"}</p>
                            {item.price && (
                              <small className="text-white-50">KES {Number(item.price).toLocaleString()}</small>
                            )}
                          </div>
                        </div>
                        {item.fileUrl ? (
                          <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" download
                            className="btn btn-sm rounded-pill px-3"
                            style={{ background: "#6BBDD0", color: "#fff", border: "none" }}>
                            <i className="fas fa-download me-1"></i> Download
                          </a>
                        ) : (
                          <span className="text-white-50 small">URL unavailable</span>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="col-12 text-center py-3">
                      <p className="text-white-50">Contact the photographer to receive your files.</p>
                    </div>
                  )}
                </div>

                <div className="text-center mt-4 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <p className="text-white-50 mb-3" style={{ fontSize: "0.8rem" }}>
                    <i className="fas fa-info-circle me-1"></i>
                    Save your downloads now — this link expires on {shareData?.expiresAt ? new Date(shareData.expiresAt).toLocaleDateString() : "soon"}.
                  </p>
                  <Link to="/register" className="btn btn-outline-warning btn-sm rounded-pill px-4 me-2">
                    Create Account
                  </Link>
                  <Link to="/explore" className="btn btn-sm rounded-pill px-4"
                    style={{ background: "rgba(107,189,208,0.15)", color: "#6BBDD0", border: "1px solid rgba(107,189,208,0.3)" }}>
                    Browse More Photos
                  </Link>
                </div>
              </div>
            )}

            {/* ── Step: Failed ── */}
            {step === "failed" && (
              <div className="rounded-4 p-4 mt-2 text-center"
                style={{ background: "rgba(232,85,85,0.06)", border: "1px solid rgba(232,85,85,0.25)" }}>
                <i className="fas fa-times-circle fa-4x mb-3" style={{ color: "#E85555" }}></i>
                <h5 className="text-white fw-bold mb-2">Payment Failed</h5>
                <p className="text-white-50 mb-4">
                  {pollCount >= MAX_POLLS
                    ? "Payment timed out. Please try again."
                    : "Your payment was declined or cancelled."}
                </p>
                <button className="btn rounded-pill px-5 py-2 fw-bold"
                  style={{ background: "#6BBDD0", color: "#fff" }}
                  onClick={() => { setStep("phone"); setCheckoutRequestID(null); setPollCount(0); }}>
                  <i className="fas fa-redo me-2"></i>Try Again
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ShareAccess;
