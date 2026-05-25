/**
 * generateLicenseCertificate
 * Generates a plain-text license certificate and triggers a browser download.
 */
export function generateLicenseCertificate({
  buyerName,
  photoTitle,
  photographer,
  licenseType,
  purchaseDate,
  amount,
  transactionId,
}) {
  const content = `
=====================================
    PHOTO LICENSE CERTIFICATE
=====================================

Certificate ID: CERT-${transactionId || Date.now()}
Issued: ${new Date(purchaseDate).toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" })}

LICENSED WORK
-------------
Photo Title  : ${photoTitle}
Photographer : ${photographer}
License Type : ${(licenseType || "Personal").toUpperCase()} USE

LICENSEE
--------
Name         : ${buyerName}
License Date : ${new Date(purchaseDate).toLocaleDateString("en-KE")}
Amount Paid  : KES ${Number(amount).toLocaleString()}

LICENSE TERMS
-------------
${licenseType === "commercial"
  ? "This license grants the right to use the image for commercial purposes including advertising, marketing, and business use. The photographer retains copyright."
  : licenseType === "editorial"
  ? "This license grants the right to use the image for editorial and journalistic purposes only. Commercial use is prohibited."
  : "This license grants the right to use the image for personal, non-commercial purposes only. The photographer retains copyright."
}

This certificate confirms a valid purchase on the Relic Snap platform.
=====================================
  `.trim();

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `license-${(photoTitle || "photo").replace(/\s+/g, "-").toLowerCase()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
