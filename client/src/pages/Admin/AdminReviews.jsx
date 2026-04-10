import React, { useEffect, useState } from "react";
import axios from "axios";
import AppToast from "../../components/ui/AppToast";
import "../../components/ui/app-ui.css";

const API = import.meta.env.VITE_API_URL;

const AdminReviews = () => {
  const token = localStorage.getItem("adminToken");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 2800);
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/review/all`, { headers: { Authorization: `Bearer ${token}` } });
      setReviews(res.data?.data || []);
    } catch (_) { showToast("Could not load reviews", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, []);

  const approve = async (id) => {
    try {
      await axios.put(`${API}/api/review/${id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      showToast("Review approved! It is now live on the homepage.");
      fetchReviews();
    } catch (_) { showToast("Failed to approve", "error"); }
  };

  const reject = async (id) => {
    try {
      await axios.put(`${API}/api/review/${id}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
      showToast("Review rejected and removed.");
      fetchReviews();
    } catch (_) { showToast("Failed to reject", "error"); }
  };

  const displayed = filter === "all" ? reviews : reviews.filter(r => r.status === filter);

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
              <h2 className="fw-bold mb-2">⭐ Review Management</h2>
              <p className="mb-0" style={{ opacity: 0.88 }}>
                Approve reviews to show them on the homepage. Rejected reviews are permanently removed.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <div style={{ background: "rgba(0,0,0,0.05)", borderRadius: 16, padding: "12px 20px", display: "inline-block" }}>
                <div style={{ fontSize: 12, opacity: 0.7 }}>Pending</div>
                <div className="fw-bold" style={{ fontSize: 24 }}>{reviews.filter(r => r.status === "pending").length}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-4">
          {loading ? (
            <div className="col-12">
              <div className="app-stat-card">Loading reviews...</div>
            </div>
          ) : (
            <>
              <div className="col-md-4">
                <div className="app-stat-card">
                  <div className="app-label-muted">Pending</div>
                  <h4 className="fw-bold mb-0">{reviews.filter(r => r.status === "pending").length}</h4>
                </div>
              </div>
              <div className="col-md-4">
                <div className="app-stat-card">
                  <div className="app-label-muted">Approved</div>
                  <h4 className="fw-bold mb-0">{reviews.filter(r => r.status === "approved").length}</h4>
                </div>
              </div>
              <div className="col-md-4">
                <div className="app-stat-card">
                  <div className="app-label-muted">Total</div>
                  <h4 className="fw-bold mb-0">{reviews.length}</h4>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="d-flex gap-2 mb-4 flex-wrap">
          {!loading && ["pending", "approved", "all"].map(f => (
            <button 
              key={f} 
              className={filter === f ? "app-btn-primary" : "app-btn-soft"}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} ({reviews.filter(r => f === "all" || r.status === f).length})
            </button>
          ))}
        </div>

        <div className="review-records">
          {loading ? (
            <div className="text-center py-5">Loading reviews...</div>
          ) : displayed.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <div style={{ fontSize: "3rem", marginBottom: 8 }}>📭</div>
              <div>No {filter} reviews found.</div>
            </div>
          ) : (
            <div className="row g-3">
              {displayed.map(r => (
                <div key={r._id} className="col-12">
                  <div className="app-mobile-card">
                    <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap gap-2">
                      <div>
                        <strong>{r.student?.name || "Student"}</strong>
                        <div style={{ color: "#94a3b8", fontSize: "0.82rem" }}>{r.student?.email}</div>
                      </div>
                      <span className="app-badge" style={{
                        background: r.status === "pending" ? "#fef3c7" : r.status === "approved" ? "#dcfce7" : "#fee2e2",
                        color: r.status === "pending" ? "#d97706" : r.status === "approved" ? "#16a34a" : "#dc2626"
                      }}>{r.status}</span>
                    </div>
                    <div className="mb-2" style={{ color: "#f59e0b", letterSpacing: 2 }}>{"★".repeat(r.rating || 0)}{"☆".repeat(5 - (r.rating || 0))}</div>
                    <div style={{ color: "#1e293b", fontSize: "0.92rem", marginBottom: 8 }}>{r.reviewText}</div>
                    <div style={{ color: "#94a3b8", fontSize: "0.78rem", marginBottom: 12 }}>
                      📚 {r.batch?.batchName || "Batch"} • {new Date(r.createdAt).toLocaleDateString("en-GB")}
                    </div>
                    {r.status === "pending" && (
                      <div className="d-flex gap-2">
                        <button
                          className="app-btn-primary flex-grow-1"
                          onClick={() => approve(r._id)}
                        >
                          ✓ Approve
                        </button>
                        <button
                          className="app-btn-delete flex-grow-1"
                          onClick={() => reject(r._id)}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReviews;
