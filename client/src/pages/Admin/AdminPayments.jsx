import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMethod, setFilterMethod] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 2500);
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/payment");
      setPayments(res.data?.data || []);
    } catch {
      showToast("Payments load nahi ho paaye", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filtered = payments.filter((p) => {
    const name = p.user?.name?.toLowerCase() || "";
    const email = p.user?.email?.toLowerCase() || "";
    const txn = p.transactionId?.toLowerCase() || "";
    const receipt = p.receiptNumber?.toLowerCase() || "";
    const keyword = search.toLowerCase();
    const matchSearch = name.includes(keyword) || email.includes(keyword) || txn.includes(keyword) || receipt.includes(keyword);
    const matchStatus = filterStatus ? p.paymentStatus === filterStatus : true;
    const matchMethod = filterMethod ? p.paymentMethod === filterMethod : true;
    return matchSearch && matchStatus && matchMethod;
  });

  const totalAmount = filtered.reduce((sum, p) => sum + (p.amount || 0), 0);

  const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const statusColor = {
    success: { bg: "#dcfce7", color: "#16a34a" },
    pending: { bg: "#fef3c7", color: "#d97706" },
    failed:  { bg: "#fee2e2", color: "#dc2626" },
  };

  return (
    <>
      <style>{`
        .ap-page { min-height: 100vh; background: linear-gradient(180deg,#f8fbff,#eef4ff); }
        .ap-hero { padding: 32px; border-radius: 28px; color: #fff; background: linear-gradient(135deg,#0f172a,#1d4ed8,#4f46e5); box-shadow: 0 20px 45px rgba(37,99,235,0.22); margin-bottom: 24px; }
        .ap-panel { background: #fff; border-radius: 24px; box-shadow: 0 16px 40px rgba(15,23,42,0.08); padding: 24px; }
        .ap-stat { background: #fff; border-radius: 20px; padding: 20px 24px; box-shadow: 0 10px 30px rgba(15,23,42,0.08); }
        .ap-input { width: 100%; padding: 11px 14px; border: 2px solid #e2e8f0; border-radius: 12px; outline: none; font-size: 0.9rem; }
        .ap-input:focus { border-color: #2563eb; }
        .ap-select { width: 100%; padding: 11px 14px; border: 2px solid #e2e8f0; border-radius: 12px; outline: none; font-size: 0.9rem; background: #fff; }
        .ap-select:focus { border-color: #2563eb; }
        .ap-badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; }
        .ap-toast { position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 280px; color: #fff; padding: 14px 16px; border-radius: 16px; box-shadow: 0 12px 30px rgba(0,0,0,0.18); }
        .ap-toast.success { background: linear-gradient(135deg,#2563eb,#4f46e5); }
        .ap-toast.error { background: linear-gradient(135deg,#dc2626,#ef4444); }
        .ap-table th { color: #475569; font-weight: 600; font-size: 0.85rem; padding: 12px 10px; border-bottom: 2px solid #e2e8f0; }
        .ap-table td { padding: 14px 10px; border-bottom: 1px solid #f1f5f9; font-size: 0.88rem; vertical-align: middle; }
        .ap-table tr:last-child td { border-bottom: 0; }
        .ap-table tr:hover td { background: #f8fbff; }
      `}</style>

      {toast.show && <div className={`ap-toast ${toast.type}`}>{toast.message}</div>}

      <div className="ap-page">
        <div className="container py-4">

          {/* Hero */}
          <div className="ap-hero">
            <div className="row align-items-center g-4">
              <div className="col-lg-8">
                <h2 className="fw-bold mb-2">Payment History</h2>
                <p className="mb-0" style={{ opacity: 0.88 }}>
                  Sabhi students ke payments, receipts aur transactions yahan dekhein.
                </p>
              </div>
              <div className="col-lg-4 text-lg-end">
                <div style={{ background: "rgba(255,255,255,0.14)", borderRadius: 18, padding: "16px 20px", display: "inline-block" }}>
                  <div style={{ fontSize: 13, opacity: 0.8 }}>Total Revenue</div>
                  <div className="fw-bold" style={{ fontSize: 26 }}>₹{totalAmount.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="row g-4 mb-4">
            <div className="col-md-3">
              <div className="ap-stat">
                <div className="text-muted small mb-1">Total Payments</div>
                <h4 className="fw-bold mb-0">{payments.length}</h4>
              </div>
            </div>
            <div className="col-md-3">
              <div className="ap-stat">
                <div className="text-muted small mb-1">Successful</div>
                <h4 className="fw-bold mb-0" style={{ color: "#16a34a" }}>
                  {payments.filter(p => p.paymentStatus === "success").length}
                </h4>
              </div>
            </div>
            <div className="col-md-3">
              <div className="ap-stat">
                <div className="text-muted small mb-1">Pending</div>
                <h4 className="fw-bold mb-0" style={{ color: "#d97706" }}>
                  {payments.filter(p => p.paymentStatus === "pending").length}
                </h4>
              </div>
            </div>
            <div className="col-md-3">
              <div className="ap-stat">
                <div className="text-muted small mb-1">Failed</div>
                <h4 className="fw-bold mb-0" style={{ color: "#dc2626" }}>
                  {payments.filter(p => p.paymentStatus === "failed").length}
                </h4>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="ap-panel">
            {/* Filters */}
            <div className="row g-3 mb-4">
              <div className="col-md-5">
                <input
                  className="ap-input"
                  placeholder="Search by name, email, transaction ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <select className="ap-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="">All Status</option>
                  <option value="success">Success</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div className="col-md-3">
                <select className="ap-select" value={filterMethod} onChange={(e) => setFilterMethod(e.target.value)}>
                  <option value="">All Methods</option>
                  <option value="razorpay">Razorpay</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
              <div className="col-md-1 d-flex align-items-center">
                <span className="text-muted small">{filtered.length} records</span>
              </div>
            </div>

            {/* Table */}
            <div className="table-responsive">
              <table className="table ap-table mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Batch</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Receipt</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="9" className="text-center py-5 text-muted">Loading payments...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan="9" className="text-center py-5 text-muted">Koi payment record nahi mila.</td></tr>
                  ) : (
                    filtered.map((p, i) => (
                      <tr key={p._id}>
                        <td>{i + 1}</td>
                        <td>
                          <div className="fw-semibold">{p.user?.name || "-"}</div>
                          <div className="text-muted" style={{ fontSize: "0.78rem" }}>{p.user?.email || "-"}</div>
                        </td>
                        <td>{p.course?.title || "-"}</td>
                        <td>{p.batch?.batchName || "-"}</td>
                        <td className="fw-bold">₹{p.amount?.toLocaleString() || 0}</td>
                        <td>
                          <span className="ap-badge" style={{ background: p.paymentMethod === "razorpay" ? "#dbeafe" : "#f3f4f6", color: p.paymentMethod === "razorpay" ? "#1d4ed8" : "#374151" }}>
                            {p.paymentMethod || "manual"}
                          </span>
                        </td>
                        <td>
                          <span
                            className="ap-badge"
                            style={{
                              background: statusColor[p.paymentStatus]?.bg || "#f3f4f6",
                              color: statusColor[p.paymentStatus]?.color || "#374151"
                            }}
                          >
                            {p.paymentStatus || "success"}
                          </span>
                        </td>
                        <td style={{ fontSize: "0.78rem", color: "#64748b" }}>{p.receiptNumber || "-"}</td>
                        <td style={{ fontSize: "0.78rem", color: "#64748b" }}>{formatDate(p.paidAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Total Row */}
            {filtered.length > 0 && (
              <div className="d-flex justify-content-between align-items-center mt-3 pt-3" style={{ borderTop: "2px solid #e2e8f0" }}>
                <span className="text-muted fw-semibold">{filtered.length} payments shown</span>
                <span className="fw-bold" style={{ fontSize: "1.1rem" }}>
                  Total: ₹{filtered.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPayments;