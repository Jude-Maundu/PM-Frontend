import React, { useState } from "react";
import { toast } from "../utils/toast";

const SocialShareButtons = ({ url, title }) => {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title || "Check out this photo!");

  const share = (platform) => {
    const links = {
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    };
    window.open(links[platform], "_blank", "width=600,height=400");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="d-flex gap-2 align-items-center flex-wrap">
      <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>Share:</span>
      <button
        onClick={() => share("whatsapp")}
        className="btn btn-sm"
        style={{ background: "#25D366", color: "#fff", border: "none", borderRadius: 8, padding: "4px 10px", fontSize: "0.75rem" }}
      >
        <i className="fab fa-whatsapp me-1"></i>WhatsApp
      </button>
      <button
        onClick={() => share("twitter")}
        className="btn btn-sm"
        style={{ background: "#1DA1F2", color: "#fff", border: "none", borderRadius: 8, padding: "4px 10px", fontSize: "0.75rem" }}
      >
        <i className="fab fa-twitter me-1"></i>Twitter
      </button>
      <button
        onClick={() => share("facebook")}
        className="btn btn-sm"
        style={{ background: "#1877F2", color: "#fff", border: "none", borderRadius: 8, padding: "4px 10px", fontSize: "0.75rem" }}
      >
        <i className="fab fa-facebook me-1"></i>Facebook
      </button>
      <button
        onClick={copyLink}
        className="btn btn-sm"
        style={{
          background: copied ? "var(--pm-success)" : "rgba(107,189,208,0.15)",
          color: copied ? "#fff" : "var(--pm-teal)",
          border: "1px solid rgba(107,189,208,0.3)",
          borderRadius: 8,
          padding: "4px 10px",
          fontSize: "0.75rem",
        }}
      >
        <i className={`fas ${copied ? "fa-check" : "fa-link"} me-1`}></i>
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
};

export default SocialShareButtons;
