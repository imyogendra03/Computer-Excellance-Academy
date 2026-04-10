import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import AppToast from "../../components/ui/AppToast";
import "../../components/ui/app-ui.css";
import { FiCalendar, FiClock, FiFileText, FiPlayCircle, FiSearch, FiX, FiCheckCircle, FiChevronRight, FiAlertCircle } from "react-icons/fi";

const MyExam = () => {
  const [exams, setExams] = useState([]);
  const [search, setSearch] = useState("");
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 2500);
  };

  const fetchExams = async () => {
    try {
      setFetching(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/exams/exams`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExams(res?.data || []);
    } catch (error) {
      showToast("Failed to load exams", "error");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchExams(); }, []);

  const filteredExams = useMemo(() => {
    const keyword = search.toLowerCase();
    return exams.filter((item) => {
      return (
        item.title?.toLowerCase().includes(keyword) ||
        item.time?.toLowerCase().includes(keyword) ||
        String(item.date || "").toLowerCase().includes(keyword)
      );
    });
  }, [exams, search]);

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    return isNaN(date.getTime()) ? value : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="app-page">
      <AppToast toast={toast} onClose={() => setToast({ show: false, message: "", type: "success" })} />

      <div className="container">
        {/* Hero Section */}
        <div className="app-hero mb-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <h2 className="fw-bold mb-2">Available Exams</h2>
              <p className="mb-0">Showcase your skills and earn your certification. Best of luck!</p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <div style={{ display: "inline-block", padding: "12px 20px", borderRadius: "16px", background: "#f3f4f6", textAlign: "right", minWidth: 200 }}>
                <div className="small fw-bold text-muted">UPCOMING EXAMS</div>
                <div className="h4 fw-bold mb-0">{fetching ? "..." : filteredExams.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Header Section */}
        <div className="app-panel mb-4">
          <div className="card-body p-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-4">
              <div>
                <h5 className="fw-bold mb-1">Your Assessments</h5>
                <p className="text-muted small mb-0">Select an exam to begin your evaluation.</p>
              </div>
              <div style={{ position: "relative", maxWidth: 380, width: "100%" }}>
                <FiSearch style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input 
                  type="text" 
                  className="app-search"
                  placeholder="Search exams..." 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Exams List */}
        {fetching ? (
          <div className="text-center py-5">
            <div className="text-muted fw-bold">Loading exams...</div>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="app-panel">
            <div className="card-body p-4 text-center py-5">
              <div style={{ fontSize: "3rem", marginBottom: "15px" }}>📝</div>
              <h4 className="fw-bold">No active exams found</h4>
              <p className="text-muted">Check back later or contact your instructor.</p>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {filteredExams.map((item, i) => (
              <div key={item._id || i} className="col-12">
                <div className="app-panel">
                  <div className="card-body p-4">
                    <div className="row align-items-center g-4">
                      <div className="col-lg-5">
                        <div className="d-flex align-items-center gap-4">
                          <div style={{ padding: "12px", background: "#f0fdf4", borderRadius: "16px", color: "#10b981", fontSize: "1.5rem" }}>
                            <FiFileText />
                          </div>
                          <div>
                            <div className="app-badge mb-1">{formatDate(item.date)}</div>
                            <h5 className="fw-bold mb-0">{item.title}</h5>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-3">
                        <div className="small text-muted mb-1">SCHEDULED TIME</div>
                        <div className="fw-bold d-flex align-items-center gap-2">
                          <FiClock className="text-primary"/> {item.time || "Not specified"}
                        </div>
                      </div>
                      <div className="col-lg-2">
                        <div className="small text-muted mb-1">INSTRUCTIONS</div>
                        <div className="fw-bold small d-flex align-items-center gap-2">
                          <FiAlertCircle className="text-warning"/> 60 Mins / 100 Marks
                        </div>
                      </div>
                      <div className="col-lg-2 text-lg-end">
                        <Link to={`/userdash/getexam/${item._id}`} className="app-btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 16px", fontSize: "0.9rem", textDecoration: "none" }}>
                          <FiPlayCircle /> Start Exam
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyExam;
