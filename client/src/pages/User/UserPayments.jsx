import React, { useEffect, useMemo, useState } from "react";
import { FiCreditCard, FiCheckCircle, FiClock, FiXCircle, FiSearch, FiActivity, FiUser, FiCalendar, FiTarget, FiTrendingUp, FiDownload, FiDollarSign } from "react-icons/fi";
import AppToast from "../../components/ui/AppToast";
import "../../components/ui/app-ui.css";
import { lmsApi } from "../../services/lmsApi";

const UserPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 2500);
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const rows = await lmsApi.getMyPaymentHistory();
      setPayments(rows || []);
    } catch {
      showToast("Error retrieving financial records", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filtered = useMemo(() => {
    const k = search.toLowerCase();
    return payments.filter(p => 
      (p.course?.title || "").toLowerCase().includes(k) || 
      (p.batch?.batchName || "").toLowerCase().includes(k) || 
      (p.transactionId || "").toLowerCase().includes(k) ||
      (p.accessType || "").toLowerCase().includes(k) ||
      (p.purchaseStage || "").toLowerCase().includes(k)
    );
  }, [payments, search]);

  const totalSpent = useMemo(() => filtered.reduce((sum, p) => sum + (p.amount || 0), 0), [filtered]);

  const formatDate = (v) => {
    if (!v) return "-";
    return new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const statusStyle = {
    success: { bg: "#f0fdf4", color: "#10b981", border: "#bbf7d0" },
    pending: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
    failed:  { bg: "#fef2f2", color: "#ef4444", border: "#fecaca" },
  };

  return (
    <div className="app-page">
      <AppToast toast={toast} onClose={() => setToast({ show: false, message: "", type: "success" })} />

      <div className="container">
        {/* Hero Section */}
        <div className="app-hero mb-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <h2 className="fw-bold mb-2">Transaction History</h2>
              <p className="mb-0">Monitor your investment in education and access digital payment receipts.</p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <div style={{ display: "inline-block", padding: "12px 20px", borderRadius: "16px", background: "#f3f4f6", textAlign: "right", minWidth: "220px" }}>
                <div className="small fw-bold text-muted">AGGREGATE SPENDING</div>
                <div className="h4 fw-bold mb-0 d-flex align-items-center justify-content-end gap-2">
                  ₹{totalSpent.toLocaleString()}
                  <FiCreditCard style={{ color: "#34d399" }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="row g-4 mb-4">
          {!loading && (
            <>
              <div className="col-md-4">
                <div className="app-stat-card">
                  <div className="app-label-muted">TOTAL PAYMENTS</div>
                  <h4 className="fw-bold mb-0">{payments.length}</h4>
                </div>
              </div>
              <div className="col-md-4">
                <div className="app-stat-card">
                  <div className="app-label-muted">SUCCESSFUL</div>
                  <h4 className="fw-bold mb-0">{payments.filter(p => p.paymentStatus === "success").length}</h4>
                </div>
              </div>
              <div className="col-md-4">
                <div className="app-stat-card">
                  <div className="app-label-muted">PENDING / OTHERS</div>
                  <h4 className="fw-bold mb-0">{payments.filter(p => p.paymentStatus !== "success").length}</h4>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Main Panel */}
        <div className="app-panel">
          <div className="card-body p-4">
            {/* Header */}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-4 mb-4">
              <div>
                <h5 className="fw-bold mb-1">Financial Archive</h5>
                <p className="text-muted small mb-0">Search and retrieve official payment certifications.</p>
              </div>
              <div style={{ position: "relative", minWidth: 340 }}>
                <FiSearch style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input 
                  type="text" 
                  className="app-search"
                  placeholder="Search by batch name or receipt..." 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                />
              </div>
            </div>

            {/* Desktop Table */}
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr className="text-muted small fw-bold">
                    <th className="pb-3">#</th>
                    <th className="pb-3">COURSE / BATCH</th>
                    <th className="pb-3 text-center">AMOUNT</th>
                    <th className="pb-3 text-center">STATUS</th>
                    <th className="pb-3 text-center">STAGE</th>
                    <th className="pb-3">DATE / RECEIPT</th>
                    <th className="pb-3 text-end">DETAILS</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="7" className="text-center py-5 text-muted fw-bold">Loading payments...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan="7" className="text-center py-5 fw-bold text-muted">Archive Empty: No transactions found in registry.</td></tr>
                  ) : (
                    filtered.map((item, i) => (
                      <tr key={item._id} style={{ transition: "0.3s", borderBottom: "1px solid #f1f5f9" }}>
                        <td className="fw-bold text-muted">{i+1}</td>
                        <td style={{ minWidth: 260 }}>
                          <div className="fw-bold text-dark">{item.course?.title || "GLOBAL MODULE"}</div>
                          <div className="small fw-bold text-muted mt-1 d-flex align-items-center gap-1"><FiTarget /> {item.batch?.batchName || "N/A"}</div>
                        </td>
                        <td className="text-center">
                          <div className="fw-bold text-indigo-600">₹{item.amount?.toLocaleString()}</div>
                        </td>
                        <td className="text-center">
                          <span className="app-badge" style={{ background: statusStyle[item.paymentStatus]?.bg || "#f1f5f9", color: statusStyle[item.paymentStatus]?.color || "#64748b" }}>
                            {item.paymentStatus}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className="app-badge" style={{ background: "#eef2ff", color: "#5b5bd6" }}>
                            {(item.purchaseStage || "payment_successful").replaceAll("_", " ")}
                          </span>
                        </td>
                        <td>
                          <div className="small fw-bold text-dark d-flex align-items-center gap-2"><FiCalendar /> {formatDate(item.paidAt)}</div>
                          <div className="small text-muted fw-bold">#{item.receiptNumber || "ID-REDACTED"} • {item.accessType || "paid"}</div>
                        </td>
                        <td className="text-end">
                          <button className="app-btn-soft" style={{ padding: "8px 12px", fontSize: "0.85rem" }}>
                            <FiDownload className="me-1"/> Receipt
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPayments;
