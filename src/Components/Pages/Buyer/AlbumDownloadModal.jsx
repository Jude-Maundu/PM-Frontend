import React, { useState } from "react";
import JSZip from "jszip";

export default function AlbumDownloadModal({ albums, onClose }) {
  const [zipping, setZipping] = useState(null); // albumId being zipped
  const [zipProgress, setZipProgress] = useState(0);
  const [downloadingPhoto, setDownloadingPhoto] = useState(null);

  if (!albums || albums.length === 0) return null;

  const downloadSinglePhoto = async (photo, albumName) => {
    const key = `${albumName}-${photo.title}`;
    setDownloadingPhoto(key);
    try {
      const res = await fetch(photo.fileUrl);
      const blob = await res.blob();
      const ext = photo.fileUrl.split(".").pop().split("?")[0] || "jpg";
      const filename = `${photo.title || "photo"}.${ext}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // If CORS blocks direct fetch, open in new tab for manual save
      window.open(photo.fileUrl, "_blank", "noopener");
    } finally {
      setDownloadingPhoto(null);
    }
  };

  const downloadAllAsZip = async (album) => {
    setZipping(album.albumId);
    setZipProgress(0);
    const zip = new JSZip();
    const folder = zip.folder(album.albumName || "album");
    const photos = album.downloadInfo || [];
    let done = 0;

    const concurrency = 4;
    for (let i = 0; i < photos.length; i += concurrency) {
      const batch = photos.slice(i, i + concurrency);
      await Promise.all(batch.map(async (photo, idx) => {
        try {
          const res = await fetch(photo.fileUrl);
          const blob = await res.blob();
          const ext = photo.fileUrl.split(".").pop().split("?")[0] || "jpg";
          const filename = `${photo.title || `photo_${i + idx + 1}`}.${ext}`;
          folder.file(filename, blob);
        } catch {
          // skip photos that fail (e.g. CORS)
        }
      }));
      done += batch.length;
      setZipProgress(Math.round((done / photos.length) * 100));
    }

    try {
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${album.albumName || "album"}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("ZIP generation failed:", err);
    } finally {
      setZipping(null);
      setZipProgress(0);
    }
  };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
        zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem", overflowY: "auto",
      }}
    >
      <div style={{
        background: "var(--mc-card-bg, #1a2535)", borderRadius: 20,
        border: "1px solid rgba(107,189,208,0.2)", maxWidth: 680, width: "100%",
        maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
      }}>
        {/* Header */}
        <div style={{
          padding: "1.5rem 1.75rem 1.25rem", borderBottom: "1px solid var(--mc-border)",
          display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky",
          top: 0, background: "var(--mc-card-bg, #1a2535)", zIndex: 2, borderRadius: "20px 20px 0 0",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.2rem" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(76,201,166,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className="fas fa-check" style={{ color: "#4CC9A6", fontSize: "0.9rem" }}></i>
              </div>
              <h5 style={{ margin: 0, color: "var(--mc-text)", fontWeight: 700 }}>Purchase Successful!</h5>
            </div>
            <p style={{ margin: 0, color: "var(--mc-text-muted)", fontSize: "0.82rem" }}>
              Download your photos below — as a ZIP folder or individually
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "var(--mc-bg)", border: "1px solid var(--mc-border)", color: "var(--mc-text-muted)", width: 36, height: 36, borderRadius: "50%", cursor: "pointer", fontSize: "1rem" }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Album blocks */}
        <div style={{ padding: "1.25rem 1.75rem" }}>
          {albums.map((album) => {
            const photos = album.downloadInfo || [];
            const isZipping = zipping === album.albumId;
            return (
              <div key={album.albumId} style={{ marginBottom: "1.5rem" }}>
                {/* Album header */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  marginBottom: "0.85rem", gap: "0.75rem", flexWrap: "wrap",
                }}>
                  <div>
                    <h6 style={{ color: "var(--mc-text)", fontWeight: 700, margin: "0 0 0.2rem", fontSize: "0.95rem" }}>
                      <i className="fas fa-images me-2" style={{ color: "#6BBDD0" }}></i>
                      {album.albumName}
                    </h6>
                    <span style={{ color: "var(--mc-text-muted)", fontSize: "0.78rem" }}>
                      {photos.length} photo{photos.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {photos.length > 0 && (
                    <button
                      onClick={() => downloadAllAsZip(album)}
                      disabled={isZipping}
                      style={{
                        background: "linear-gradient(135deg, #6BBDD0, #4CC9A6)",
                        color: "#fff", border: "none", borderRadius: 10,
                        padding: "0.6rem 1.25rem", fontWeight: 700, fontSize: "0.83rem",
                        cursor: isZipping ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", gap: "0.4rem",
                        opacity: isZipping ? 0.7 : 1,
                      }}
                    >
                      {isZipping ? (
                        <>
                          <span className="spinner-border spinner-border-sm"></span>
                          {zipProgress}% zipping…
                        </>
                      ) : (
                        <>
                          <i className="fas fa-file-archive"></i>Download All as ZIP
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* ZIP progress bar */}
                {isZipping && (
                  <div style={{ height: 4, background: "var(--mc-border)", borderRadius: 2, marginBottom: "0.85rem", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${zipProgress}%`, background: "linear-gradient(90deg, #6BBDD0, #4CC9A6)", transition: "width 0.3s", borderRadius: 2 }} />
                  </div>
                )}

                {/* Photos list */}
                {photos.length === 0 ? (
                  <p style={{ color: "var(--mc-text-sub)", fontSize: "0.82rem", fontStyle: "italic" }}>
                    No downloadable photos found for this album.
                  </p>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.6rem" }}>
                    {photos.map((photo, i) => {
                      const key = `${album.albumName}-${photo.title}`;
                      const isDownloading = downloadingPhoto === key;
                      return (
                        <div
                          key={photo.mediaId || i}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "0.6rem 0.85rem", background: "var(--mc-bg)",
                            borderRadius: 10, border: "1px solid var(--mc-border)", gap: "0.5rem",
                          }}
                        >
                          <span style={{ fontSize: "0.8rem", color: "var(--mc-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                            <i className="fas fa-image me-1" style={{ color: "rgba(107,189,208,0.5)", fontSize: "0.7rem" }}></i>
                            {photo.title || `Photo ${i + 1}`}
                          </span>
                          <button
                            onClick={() => downloadSinglePhoto(photo, album.albumName)}
                            disabled={isDownloading}
                            style={{
                              flexShrink: 0, background: "rgba(107,189,208,0.12)",
                              color: "#6BBDD0", border: "1px solid rgba(107,189,208,0.25)",
                              borderRadius: 7, padding: "0.3rem 0.6rem", fontSize: "0.72rem",
                              fontWeight: 600, cursor: isDownloading ? "not-allowed" : "pointer",
                            }}
                          >
                            {isDownloading
                              ? <span className="spinner-border spinner-border-sm" style={{ width: 10, height: 10 }}></span>
                              : <><i className="fas fa-download me-1"></i>Save</>
                            }
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: "1rem 1.75rem 1.5rem", borderTop: "1px solid var(--mc-border)",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap",
        }}>
          <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--mc-text-sub)" }}>
            <i className="fas fa-info-circle me-1"></i>
            Downloads are also saved to your <strong style={{ color: "var(--mc-text-muted)" }}>My Downloads</strong> section.
          </p>
          <button
            onClick={onClose}
            style={{ background: "var(--mc-bg)", color: "var(--mc-text)", border: "1px solid var(--mc-border)", borderRadius: 10, padding: "0.6rem 1.25rem", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
