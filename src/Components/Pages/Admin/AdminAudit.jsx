import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import PageHeader from "../../PageHeader";
import { getAdminPurchaseAudit } from "../../../api/API";

const AdminAudit = () => {
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterBuyer, setFilterBuyer] = useState("");
  const [filterPhotographer, setFilterPhotographer] = useState("");

  const fetchAudit = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminPurchaseAudit();
      setAudit(res.data?.audit || []);
    } catch (err) {
      console.error("Error fetching audit data", err);
      setError(err.response?.data?.message || "Failed to fetch audit data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, []);

  const filtered = audit.filter((row) => {
    const buyerMatch = !filterBuyer || row.buyer?.email?.includes(filterBuyer) || row.buyer?._id?.includes(filterBuyer);
    const photographerMatch = !filterPhotographer || row.photographer?.email?.includes(filterPhotographer) || row.photographer?._id?.includes(filterPhotographer);
    return buyerMatch && photographerMatch;
  });

  return (
    <AdminLayout>
      <PageHeader
        title="Audit Log"
        subtitle="Platform activity and purchase records"
        actions={
          <button className="mc-btn mc-btn-ghost" onClick={fetchAudit} disabled={loading}>
            <i className="fas fa-sync-alt me-1"></i>Refresh
          </button>
        }
      />
      <div className="mc-page">
        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mc-card mb-3" style={{ padding: "0.75rem 1rem" }}>
          <div className="row g-2">
            <div className="col-md-6">
              <input
                className="form-control"
                placeholder="Filter by buyer email / ID"
                value={filterBuyer}
                onChange={(e) => setFilterBuyer(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <input
                className="form-control"
                placeholder="Filter by photographer email / ID"
                value={filterPhotographer}
                onChange={(e) => setFilterPhotographer(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <div className="spinner-border" style={{ color: "var(--mc-accent)" }}></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mc-empty">
            <i className="fas fa-file-invoice-dollar"></i>
            <p>No audit entries found</p>
          </div>
        ) : (
          <div className="mc-table-card">
            <div className="table-responsive">
              <table className="table table-borderless mb-0">
                <thead>
                  <tr>
                    <th className="ps-3 py-3">Buyer</th>
                    <th className="py-3">Photographer</th>
                    <th className="py-3">Media</th>
                    <th className="py-3">Amount</th>
                    <th className="py-3">Date</th>
                    <th className="pe-3 py-3">Download</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr key={row.paymentId || row._id || Math.random()}>
                      <td className="ps-3">
                        <div className="fw-bold">{row.buyer?.email || row.buyer?._id || "-"}</div>
                        <div className="text-muted small">{row.buyer?.username || ""}</div>
                      </td>
                      <td>
                        <div className="fw-bold">{row.photographer?.email || row.photographer?._id || "-"}</div>
                        <div className="text-muted small">{row.photographer?.username || ""}</div>
                      </td>
                      <td>
                        <div className="fw-bold">{row.media?.title || row.media?.name || "-"}</div>
                        <div className="text-muted small">{row.media?._id || ""}</div>
                      </td>
                      <td style={{ color: "var(--mc-accent-gold)" }}>KES {row.amount ?? row.price ?? "-"}</td>
                      <td className="text-muted" style={{ minWidth: "140px" }}>
                        {row.createdAt ? new Date(row.createdAt).toLocaleString() : "-"}
                      </td>
                      <td className="pe-3">
                        {row.downloadUrl ? (
                          <a
                            href={row.downloadUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mc-btn mc-btn-ghost btn-sm"
                          >
                            Download
                          </a>
                        ) : (
                          <span className="text-muted small">No link</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAudit;
