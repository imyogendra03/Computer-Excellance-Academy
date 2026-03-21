import React, { useEffect, useState } from "react";
import axios from "axios";

const UserPayments = () => {
  const userId = localStorage.getItem("userId");
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 2500);
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/payment/user/${userId}`);
      setPayments(res.data?.data || []);
    } catch {
      showToast("Payments load nahi ho paaye", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchPayments();
  }, [userId]);

  const filtered = payments.filter((p) => {
    const keyword = search.toLowerCase();
    return (
      p.course?.title?.toLowerCase().includes(keyword) ||
      p.batch?.batchName?.toLowerCase().includes(keyword) ||
      p.transactionId?.toLowerCase().includes(keyword) ||
      p.receiptNumber?.toLowerCase().includes(keyword)
    );
  });

  const totalSpent = filtered.reduce((sum, p) => sum + (p.amount || 0), 0);

  const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric"
    });
  };

  const statusStyle = {
    success: { bg: "#dcfce7", color: "#16a34a" },
    pending: { bg: "#fef3c7", color: "#d97706" },
    failed:  { bg: "#fee2e2", color: "#dc2626" },
  };

  return (
    <>
      <style>{`
        .up-page { min-height: 100vh; background: linear-gradient(180deg,#f8fbff,#eef4ff); }
        .up-hero { padding: 32px; border-radius: 28px; color: #fff; background: linear-gradient(135deg,#0f172a,#1d4ed8,#4f46e5); box-shadow: 0 20px 45px rgba(37,99,235,0.22); margin-bottom: 24px; }
        .up-panel { background: #fff; border-radius: 24px; box-shadow: 0 16px 40px rgba(15,23,42,0.08); padding: 24px; }
        .up-stat { background: #fff; border-radius: 20px; padding: 20px 24px; box-shadow: 0 10px 30px rgba(15,23,42,0.08); height: 100%; }
        .up-input { width: 100%; padding: 11px 14px; border: 2px solid #e2e8f0; border-radius: 12px; outline: none; font-size: 0.9rem; }
        .up-input:focus { border-color: #2563eb; }
        .up-badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; }
        .up-receipt-card { border: 1px solid #e2e8f0; border-radius: 18px; padding: 20px; margin-bottom: 14px; transition: 0.2s ease; }
        .up-receipt-card:hover { border-color: #93c5fd; box-shadow: 0 8px 24px rgba(37,99,235,0.08); }
        .up-toast { position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 280px; color: #fff; padding: 14px 16px; border-radius: 16px; box-shadow: 0 12px 30px rgba(0,0,0,0.18); }
        .up-toast.success { background: linear-gradient(135deg,#2563eb,#4f46e5); }
        .up-toast.error { background: linear-gradient(135deg,#dc2626,#ef4444); }
        .up-divider { height: 1px; background: #e2e8f0; margin: 10px 0; }
        .up-table th { color: #475569; font-weight: 600; font-size: 0.85rem; padding: 12px 10px; border-bottom: 2px solid #e2e8f0; }
        .up-table td { padding: 14px 10px; border-bottom: 1px solid #f1f5f9; font-size: 0.88rem; vertical-align: middle; }
        .up-table tr:last-child td { border-bottom: 0; }
        .up-table tr:hover td { background: #f8fbff; }
        @media(max-width:767px){ .up-hero { padding: 24px; } }
      `}</style>

      {toast.show && <div className={`up-toast ${toast.type}`}>{toast.message}</div>}

      <div className="up-page">
        <div className="container py-4">

          {/* Hero */}
          <div className="up-hero">
            <div className="row align-items-center g-4">
              <div className="col-lg-8">
                <h2 className="fw-bold mb-2">My Payments</h2>
                <p className="mb-0" style={{ opacity: 0.88 }}>
                  Aapke sabhi payments, receipts aur transaction history yahan available hain.
                </p>
              </div>
              <div className="col-lg-4 text-lg-end">
                <div style={{ background: "rgba(255,255,255,0.14)", borderRadius: 18, padding: "16px 20px", display: "inline-block" }}>
                  <div style={{ fontSize: 13, opacity: 0.8 }}>Total Spent</div>
                  <div className="fw-bold" style={{ fontSize: 26 }}>₹{totalSpent.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="row g-4 mb-4">
            <div className="col-md-4">
              <div className="up-stat">
                <div className="text-muted small mb-1">Total Payments</div>
                <h4 className="fw-bold mb-0">{payments.length}</h4>
              </div>
            </div>
            <div className="col-md-4">
              <div className="up-stat">
                <div className="text-muted small mb-1">Successful</div>
                <h4 className="fw-bold mb-0" style={{ color: "#16a34a" }}>
                  {payments.filter(p => p.paymentStatus === "success").length}
                </h4>
              </div>
            </div>
            <div className="col-md-4">
              <div className="up-stat">
                <div className="text-muted small mb-1">Total Batches</div>
                <h4 className="fw-bold mb-0" style={{ color: "#2563eb" }}>
                  {payments.length}
                </h4>
              </div>
            </div>
          </div>

          {/* Payment List */}
          <div className="up-panel">
            {/* Search */}
            <div className="mb-4">
              <input
                className="up-input"
                placeholder="Search by course, batch, transaction ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Desktop Table */}
            <div className="d-none d-md-block table-responsive">
              <table className="table up-table mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Course</th>
                    <th>Batch</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Receipt No.</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="8" className="text-center py-5 text-muted">Loading payments...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-5 text-muted">
                        <div style={{ fontSize: "3rem", marginBottom: 12 }}>📭</div>
                        Koi payment record nahi mila.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((p, i) => (
                      <tr key={p._id}>
                        <td>{i + 1}</td>
                        <td className="fw-semibold">{p.course?.title || "-"}</td>
                        <td>{p.batch?.batchName || "-"}</td>
                        <td className="fw-bold">₹{p.amount?.toLocaleString() || 0}</td>
                        <td>
                          <span className="up-badge" style={{
                            background: p.paymentMethod === "razorpay" ? "#dbeafe" : "#f3f4f6",
                            color: p.paymentMethod === "razorpay" ? "#1d4ed8" : "#374151"
                          }}>
                            {p.paymentMethod || "manual"}
                          </span>
                        </td>
                        <td>
                          <span className="up-badge" style={{
                            background: statusStyle[p.paymentStatus]?.bg || "#f3f4f6",
                            color: statusStyle[p.paymentStatus]?.color || "#374151"
                          }}>
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

            {/* Mobile Cards */}
            <div className="d-block d-md-none">
              {loading ? (
                <div className="text-center py-4 text-muted">Loading...</div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-4 text-muted">Koi payment nahi mila.</div>
              ) : (
                filtered.map((p, i) => (
                  <div className="up-receipt-card" key={p._id}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <strong>#{i + 1} {p.course?.title || "-"}</strong>
                      <span className="up-badge" style={{
                        background: statusStyle[p.paymentStatus]?.bg || "#f3f4f6",
                        color: statusStyle[p.paymentStatus]?.color || "#374151"
                      }}>
                        {p.paymentStatus}
                      </span>
                    </div>
                    <div className="text-muted small mb-1">🎓 {p.batch?.batchName || "-"}</div>
                    <div className="up-divider" />
                    <div className="d-flex justify-content-between">
                      <span className="text-muted small">Amount</span>
                      <strong>₹{p.amount?.toLocaleString()}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted small">Method</span>
                      <span className="text-muted small">{p.paymentMethod}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted small">Receipt</span>
                      <span className="text-muted small">{p.receiptNumber}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted small">Date</span>
                      <span className="text-muted small">{formatDate(p.paidAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total */}
            {filtered.length > 0 && (
              <div className="d-flex justify-content-between align-items-center mt-3 pt-3" style={{ borderTop: "2px solid #e2e8f0" }}>
                <span className="text-muted fw-semibold">{filtered.length} payments</span>
                <span className="fw-bold" style={{ fontSize: "1.1rem" }}>
                  Total: ₹{totalSpent.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserPayments;