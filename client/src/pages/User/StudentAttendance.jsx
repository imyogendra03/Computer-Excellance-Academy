import React, { useState, useEffect } from "react";
import axios from "axios";
import AppToast from "../../components/ui/AppToast";
import "../../components/ui/app-ui.css";
import { 
  FiCalendar,
  FiCheckCircle,
  FiX,
  FiClock,
  FiAward,
  FiTrendingUp,
  FiBookOpen
} from "react-icons/fi";

const StudentAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ percentage: 0, total: 0, present: 0 });
  const [userBatches, setUserBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    fetchData();
  }, [selectedBatch]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await axios.get(`${apiUrl}/api/attendance/my-attendance`, {
        params: { batchId: selectedBatch !== "all" ? selectedBatch : undefined },
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      const data = res.data.data || [];
      setAttendance(data);
      
      const total = data.length;
      const present = data.filter(a => a.status === "Present" || a.status === "Late").length;
      const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
      
      setStats({ percentage, total, present });

      if (userBatches.length === 0) {
        const uniqueBatches = [];
        const seen = new Set();
        data.forEach(a => {
          if (a.batch && !seen.has(a.batch._id)) {
            uniqueBatches.push(a.batch);
            seen.add(a.batch._id);
          }
        });
        setUserBatches(uniqueBatches);
      }
    } catch (err) {
      console.error("Error fetching attendance", err);
    } finally {
      setLoading(true);
      setTimeout(() => setLoading(false), 500); // Smooth transition
    }
  };

  return (
    <div className="app-page">
      <AppToast toast={toast} onClose={() => setToast({ show: false, message: "", type: "success" })} />

      <div className="container">
        {/* Hero Section */}
        <div className="app-hero mb-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <h2 className="fw-bold mb-2">My Attendance</h2>
              <p className="mb-0">Track your daily presence and academic engagement</p>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <div className="app-stat-card">
              <div className="app-label-muted">ENGAGEMENT SCORE</div>
              <h4 className="fw-bold mb-0">{stats.percentage}%</h4>
            </div>
          </div>
          <div className="col-md-6">
            <div className="app-stat-card">
              <div className="app-label-muted">DAYS PRESENT</div>
              <h4 className="fw-bold mb-0">{stats.present} <span style={{ fontSize: "0.9rem", color: "#94a3b8", fontWeight: "600" }}>/ {stats.total}</span></h4>
            </div>
          </div>
        </div>

        {/* Batch Filter */}
        {userBatches.length > 0 && (
          <div className="app-panel mb-4">
            <div className="card-body p-4">
              <label className="form-label fw-semibold mb-2">Filter by Batch:</label>
              <div className="d-flex gap-2 flex-wrap">
                <button 
                  className={selectedBatch === "all" ? "app-btn-primary" : "app-btn-soft"}
                  onClick={() => setSelectedBatch("all")}
                  style={{ padding: "8px 16px", fontSize: "0.9rem" }}
                >
                  All Records
                </button>
                {userBatches.map(b => (
                  <button 
                    key={b._id}
                    className={selectedBatch === b._id ? "app-btn-primary" : "app-btn-soft"}
                    onClick={() => setSelectedBatch(b._id)}
                    style={{ padding: "8px 16px", fontSize: "0.9rem" }}
                  >
                    {b.batchName}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Attendance List */}
        <div className="app-panel">
          <div className="card-body p-4">
            {loading ? (
              <div className="text-center py-5">
                <div style={{ color: "#7b73a0", fontWeight: "700" }}>Syncing records...</div>
              </div>
            ) : attendance.length === 0 ? (
              <div className="text-center py-5">
                <div style={{ fontSize: "3rem", marginBottom: "15px" }}>📚</div>
                <div style={{ color: "#7b73a0", fontWeight: "700" }}>No attendance records found yet.</div>
              </div>
            ) : (
              <div>
                {attendance.map((item, idx) => (
                  <div
                    key={item._id}
                    style={{
                      padding: "20px 0",
                      borderBottom: idx === attendance.length - 1 ? "none" : "1px solid #f1f5f9",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                      <div style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "14px",
                        background: item.status === "Present" ? "#f0fdf4" : item.status === "Late" ? "#fffbeb" : "#fef2f2",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        {item.status === "Present" ? <FiCheckCircle size={20} color="#10b981" /> :
                         item.status === "Late" ? <FiClock size={20} color="#f59e0b" /> :
                         <FiX size={20} color="#ef4444" />}
                      </div>
                      <div>
                        <div style={{ fontWeight: "800", color: "#24124f", fontSize: "1rem" }}>
                          {new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#7b73a0", fontWeight: "700" }}>
                          {item.batch?.batchName}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{
                        display: "inline-block",
                        padding: "6px 12px",
                        borderRadius: "10px",
                        fontSize: "0.75rem",
                        fontWeight: "800",
                        background: item.status === "Present" ? "#10b98115" : item.status === "Late" ? "#f59e0b15" : "#ef444415",
                        color: item.status === "Present" ? "#059669" : item.status === "Late" ? "#b45309" : "#dc2626",
                      }}>
                        {item.status.toUpperCase()}
                      </div>
                      {item.remarks && <div style={{ fontSize: "0.7rem", color: "#7b73a0", marginTop: "4px", fontWeight: "700" }}>Note: {item.remarks}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;
