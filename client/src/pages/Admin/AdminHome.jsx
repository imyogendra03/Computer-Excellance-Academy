import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FiBookOpen,
  FiClipboard,
  FiLayers,
  FiSearch,
  FiUsers,
} from "react-icons/fi";
import { SkeletonTable, SkeletonStats } from "../../components/ui/SkeletonLoader";
import AppToast from "../../components/ui/AppToast";
import "../../components/ui/app-ui.css";

const AdminHome = () => {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState({});
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 2500);
  };

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [dashboardRes, examsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard/`, config),
        axios.get(`${import.meta.env.VITE_API_URL}/api/exams/exams`, config),
      ]);
      setDashboard(dashboardRes?.data || {});
      setExams(examsRes?.data || []);
    } catch (error) {
      showToast("Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, perPage]);

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    return isNaN(date.getTime())
      ? value
      : date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  const filteredExams = useMemo(() => {
    const keyword = search.toLowerCase();
    return exams.filter((exam) => {
      return (
        exam.title?.toLowerCase().includes(keyword) ||
        exam.status?.toLowerCase().includes(keyword) ||
        String(exam.totalMarks || "").toLowerCase().includes(keyword) ||
        String(exam.date || "").toLowerCase().includes(keyword)
      );
    });
  }, [exams, search]);

  const totalPages = Math.max(1, Math.ceil(filteredExams.length / perPage));
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentExams = filteredExams.slice(indexOfFirst, indexOfLast);

  const getStatusStyle = (status) => {
    const value = String(status || "").toLowerCase();
    if (value === "scheduled") return { background: "#dbeafe", color: "#1d4ed8" };
    if (value === "draft") return { background: "#fef3c7", color: "#92400e" };
    if (value === "closed") return { background: "#fee2e2", color: "#b91c1c" };
    return { background: "#e2e8f0", color: "#334155" };
  };

  return (
    <div className="app-page">
      <AppToast toast={toast} onClose={() => setToast({ show: false, message: "", type: "success" })} />

      <div className="container">
        <div className="app-hero mb-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <h2 className="fw-bold mb-2">Dashboard Intelligence</h2>
              <p className="mb-0" style={{ opacity: 0.88 }}>
                Command center for your academy. Manage content, monitor students, and track academic performance at scale.
              </p>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-md-3" onClick={() => navigate("/admin/courses")} style={{ cursor: 'pointer' }}>
            <div className="app-stat-card" style={{ display: 'flex', gap: 15, alignItems: 'center', padding: '1.25rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: "#ede9fe", color: "#7c3aed", fontSize: '1.3rem' }}><FiBookOpen /></div>
              <div><h6 className="fw-bold mb-0">Courses</h6><p className="text-muted small mb-0">Manage catalog</p></div>
            </div>
          </div>
          <div className="col-md-3" onClick={() => navigate("/admin/batches")} style={{ cursor: 'pointer' }}>
            <div className="app-stat-card" style={{ display: 'flex', gap: 15, alignItems: 'center', padding: '1.25rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: "#dbeafe", color: "#2563eb", fontSize: '1.3rem' }}><FiLayers /></div>
              <div><h6 className="fw-bold mb-0">Batches</h6><p className="text-muted small mb-0">Enrollments</p></div>
            </div>
          </div>
          <div className="col-md-3" onClick={() => navigate("/admin/examinee")} style={{ cursor: 'pointer' }}>
            <div className="app-stat-card" style={{ display: 'flex', gap: 15, alignItems: 'center', padding: '1.25rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: "#d1fae5", color: "#10b981", fontSize: '1.3rem' }}><FiUsers /></div>
              <div><h6 className="fw-bold mb-0">Registry</h6><p className="text-muted small mb-0">User profiles</p></div>
            </div>
          </div>
          <div className="col-md-3" onClick={() => navigate("/admin/payments")} style={{ cursor: 'pointer' }}>
            <div className="app-stat-card" style={{ display: 'flex', gap: 15, alignItems: 'center', padding: '1.25rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: "#fef3c7", color: "#d97706", fontSize: '1.3rem' }}>₹</div>
              <div><h6 className="fw-bold mb-0">Revenue</h6><p className="text-muted small mb-0">Check payments</p></div>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-4">
          {loading ? (
            <SkeletonStats count={3} />
          ) : (
            <>
              <div className="col-md-4">
                <div className="app-stat-card">
                  <div className="app-label-muted">EXAMINATIONS</div>
                  <div className="d-flex align-items-center justify-content-between">
                    <h4 className="fw-bold mb-0">{dashboard.totalExams || 0}</h4>
                    <FiClipboard size={26} color="#4f46e5" opacity={0.4} />
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="app-stat-card">
                  <div className="app-label-muted">ACTIVE LEARNERS</div>
                  <div className="d-flex align-items-center justify-content-between">
                    <h4 className="fw-bold mb-0">{dashboard.totalExaminees || 0}</h4>
                    <FiUsers size={26} color="#10b981" opacity={0.4} />
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="app-stat-card">
                  <div className="app-label-muted">ACADEMIC SUBJECTS</div>
                  <div className="d-flex align-items-center justify-content-between">
                    <h4 className="fw-bold mb-0">{dashboard.totalSubject || 0}</h4>
                    <FiBookOpen size={26} color="#f59e0b" opacity={0.4} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="app-panel">
          <div className="card-body p-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
              <div><h4 className="fw-bold mb-1">Recent Examinations</h4><p className="text-muted small">Real-time status of all active and upcoming tests.</p></div>
              <div className="d-flex flex-wrap gap-2">
                <div className="app-search" style={{ minWidth: 240 }}>
                  <FiSearch className="app-search__icon" />
                  <input type="text" className="form-control app-input" placeholder="Search exams..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))} className="form-select border-0 bg-light" style={{ width: "130px", borderRadius: "14px", fontWeight: 600 }}>
                  <option value={5}>5 / page</option><option value={10}>10 / page</option><option value={20}>20 / page</option>
                </select>
              </div>
            </div>

            <div className="d-none d-md-block table-responsive">
              <table className="table table-hover align-middle">
                <thead><tr style={{ color: "#475569" }}><th>#</th><th>EXAM TITLE</th><th>DATE</th><th className="text-center">STATUS</th><th className="text-end">MARKS</th></tr></thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="5" className="p-0 border-0"><SkeletonTable rows={5} cols={5} /></td></tr>
                  ) : currentExams.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-5 text-muted">No intelligence matches your search criteria.</td></tr>
                  ) : (
                    currentExams.map((item, index) => (
                      <tr key={item._id || index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td className="fw-bold text-muted small">{indexOfFirst + index + 1}</td>
                        <td><div className="fw-bold text-dark">{item.title}</div><div className="small text-muted">{item.batch?.batchName || "Global Exam"}</div></td>
                        <td className="text-muted">{formatDate(item.date)}</td>
                        <td className="text-center"><span className="app-badge" style={{ ...getStatusStyle(item.status) }}>{item.status}</span></td>
                        <td className="text-end fw-bold text-primary">{item.totalMarks}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="d-block d-md-none">
              {loading ? (
                <div className="text-center py-4">Loading exams...</div>
              ) : currentExams.length === 0 ? (
                <div className="text-center py-4 text-muted">No exams found.</div>
              ) : (
                <div className="row g-3">
                  {currentExams.map((item, index) => (
                    <div className="col-12" key={item._id || index}>
                      <div className="app-mobile-card">
                        <strong>#{indexOfFirst + index + 1} - {item.title}</strong>
                        <div className="text-muted small mt-1">{item.batch?.batchName || "Global Exam"}</div>
                        <div className="text-muted small"><small>{formatDate(item.date)}</small></div>
                        <div className="d-flex justify-content-between align-items-center mt-2">
                          <span className="app-badge" style={{ ...getStatusStyle(item.status) }}>{item.status}</span>
                          <span className="fw-bold text-primary">{item.totalMarks} Marks</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!loading && filteredExams.length > 0 && (
              <div className="d-flex justify-content-between align-items-center mt-4 pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
                <div className="text-muted small fw-medium">Showing <strong>{indexOfFirst + 1}</strong> to <strong>{Math.min(indexOfLast, filteredExams.length)}</strong> of {filteredExams.length} results</div>
                <div className="d-flex gap-2">
                  <button className="app-btn-soft" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>Previous</button>
                  <button className="app-btn-primary" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>Next</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
