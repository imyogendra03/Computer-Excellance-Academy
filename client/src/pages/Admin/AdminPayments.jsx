import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiSearch } from "react-icons/fi";
import { SkeletonTable, SkeletonStats } from "../../components/ui/SkeletonLoader";
import AppToast from "../../components/ui/AppToast";
import "../../components/ui/app-ui.css";

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
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/payment`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
    const stage = p.purchaseStage?.toLowerCase() || "";
    const keyword = search.toLowerCase();
    const matchSearch = name.includes(keyword) || email.includes(keyword) || txn.includes(keyword) || receipt.includes(keyword) || stage.includes(keyword);
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
    <div className="app-page">
      <AppToast
        toast={toast}
        onClose={() => setToast({ show: false, message: "", type: "success" })}
      />
      <div className="container">
        <div className="app-hero mb-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <h2 className="fw-bold mb-2">Payment History</h2>
              <p className="mb-0" style={{ opacity: 0.88 }}>
                All student payments, receipts, and transactions.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <div style={{ background: "rgba(0,0,0,0.05)", borderRadius: 16, padding: "12px 20px", display: "inline-block" }}>
                <div style={{ fontSize: 12, opacity: 0.7 }}>Total Revenue</div>
                <div className="fw-bold" style={{ fontSize: 24 }}>₹{totalAmount.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <SkeletonStats count={4} />
        ) : (
          <div className="row g-4 mb-4">
            <div className="col-md-3">
              <div className="app-stat-card">
                <div className="app-label-muted">Total Payments</div>
                <h4 className="fw-bold mb-0">{payments.length}</h4>
              </div>
            </div>
            <div className="col-md-3">
              <div className="app-stat-card">
                <div className="app-label-muted">Successful</div>
                <h4 className="fw-bold mb-0" style={{ color: "#16a34a" }}>
                  {payments.filter(p => p.paymentStatus === "success").length}
                </h4>
              </div>
            </div>
            <div className="col-md-3">
              <div className="app-stat-card">
                <div className="app-label-muted">Pending</div>
                <h4 className="fw-bold mb-0" style={{ color: "#d97706" }}>
                  {payments.filter(p => p.paymentStatus === "pending").length}
                </h4>
              </div>
            </div>
            <div className="col-md-3">
              <div className="app-stat-card">
                <div className="app-label-muted">Failed</div>
                <h4 className="fw-bold mb-0" style={{ color: "#dc2626" }}>
                  {payments.filter(p => p.paymentStatus === "failed").length}
                </h4>
              </div>
            </div>
          </div>
        )}

        <div className="app-panel">
          <div className="card-body p-4">
            <div className="row g-3 mb-4">
              <div className="col-md-5">
                <div className="app-search">
                  <FiSearch className="app-search__icon" />
                  <input
                    className="form-control app-input"
                    placeholder="Search by name, email, transaction ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <select className="form-select app-input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="">All Status</option>
                  <option value="success">Success</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div className="col-md-3">
                <select className="form-select app-input" value={filterMethod} onChange={(e) => setFilterMethod(e.target.value)}>
                  <option value="">All Methods</option>
                  <option value="razorpay">Razorpay</option>
                  <option value="manual">Manual</option>
                  <option value="free">Free</option>
                </select>
              </div>
              <div className="col-md-1 d-flex align-items-center">
                <span className="text-muted small">{filtered.length}</span>
              </div>
            </div>

            <div className="d-none d-md-block table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr style={{ color: "#475569" }}>
                    <th>#</th>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Batch</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Stage</th>
                    <th>Access</th>
                    <th>Status</th>
                    <th>Receipt</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="11" className="p-0 border-0">
                        <SkeletonTable rows={8} cols={11} />
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan="11" className="text-center py-5 text-muted">No payment records found.</td></tr>
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
                          <span className="app-badge" style={{ background: p.paymentMethod === "razorpay" ? "#dbeafe" : "#f3f4f6", color: p.paymentMethod === "razorpay" ? "#1d4ed8" : "#374151" }}>
                            {p.paymentMethod || "manual"}
                          </span>
                        </td>
                        <td>
                          <span className="app-badge" style={{ background: "#eef2ff", color: "#5b5bd6" }}>
                            {(p.purchaseStage || "payment_successful").replaceAll("_", " ")}
                          </span>
                        </td>
                        <td>
                          <span className="app-badge" style={{ background: p.accessType === "free" ? "#dcfce7" : "#eff6ff", color: p.accessType === "free" ? "#16a34a" : "#1d4ed8" }}>
                            {(p.accessType || "paid").toUpperCase()} / {(p.accessStatus || "active").toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span
                            className="app-badge"
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

            <div className="d-block d-md-none">
              {loading ? (
                <div className="text-center py-4">Loading payments...</div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-4 text-muted">No records found.</div>
              ) : (
                <div className="row g-3">
                  {filtered.map((p, i) => (
                    <div className="col-12" key={p._id}>
                      <div className="app-mobile-card">
                        <strong>#{i + 1} - {p.user?.name || "-"}</strong>
                        <div className="text-muted small mt-1">₹{p.amount?.toLocaleString()}</div>
                        <div className="text-muted small">Status: {p.paymentStatus}</div>
                        <div className="text-muted small">{formatDate(p.paidAt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {filtered.length > 0 && (
              <div className="d-flex justify-content-between align-items-center mt-3 pt-3" style={{ borderTop: "2px solid #e2e8f0" }}>
                <span className="text-muted fw-semibold">{filtered.length} payments</span>
                <span className="fw-bold">
                  Total: ₹{filtered.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;
