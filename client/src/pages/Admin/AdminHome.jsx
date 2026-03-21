import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FiBookOpen,
  FiCalendar,
  FiClipboard,
  FiLayers,
  FiSearch,
  FiUsers,
} from "react-icons/fi";

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

      const [dashboardRes, examsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/dashboard/"),
        axios.get("http://localhost:5000/api/exams/exams"),
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

    if (value === "scheduled") {
      return { background: "#dbeafe", color: "#1d4ed8" };
    }
    if (value === "draft") {
      return { background: "#fef3c7", color: "#92400e" };
    }
    if (value === "closed") {
      return { background: "#fee2e2", color: "#b91c1c" };
    }

    return { background: "#e2e8f0", color: "#334155" };
  };

  return (
    <>
      <style>{`
        .home-page {
          min-height: 100vh;
          padding: 24px 0;
          background: linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
        }

        .home-hero {
          padding: 32px;
          border-radius: 28px;
          color: #fff;
          background: linear-gradient(135deg, #0f172a, #1d4ed8, #4f46e5);
          box-shadow: 0 20px 45px rgba(37, 99, 235, 0.22);
        }

        .home-hero-stat {
          display: inline-block;
          padding: 16px 20px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.14);
          backdrop-filter: blur(8px);
        }

        .home-stat-card {
          height: 100%;
          padding: 24px;
          background: #fff;
          border-radius: 22px;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
        }

        .home-panel {
          background: #fff;
          border-radius: 24px;
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
          border: 0;
        }

        .home-search {
          position: relative;
          min-width: 240px;
        }

        .home-search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
        }

        .home-input {
          width: 100%;
          border: 1px solid #dbe3f0;
          border-radius: 14px;
          padding: 12px 14px 12px 40px;
          outline: none;
        }

        .home-input:focus,
        .home-select:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.08);
        }

        .home-select {
          min-width: 130px;
          border: 1px solid #dbe3f0;
          border-radius: 14px;
          padding: 12px 14px;
          outline: none;
        }

        .home-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
        }

        .home-mobile-card {
          padding: 16px;
          background: #fff;
          border-radius: 18px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
        }

        .home-btn-primary {
          border: none;
          color: #fff;
          font-weight: 600;
          border-radius: 14px;
          padding: 10px 18px;
          background: linear-gradient(135deg, #2563eb, #4f46e5);
        }

        .home-btn-soft {
          border-radius: 14px;
          padding: 10px 18px;
          font-weight: 600;
          background: #eef2ff;
          color: #3730a3;
          border: 1px solid #c7d2fe;
        }

        .home-quick-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
          margin-bottom: 24px;
        }

        .home-quick-card {
          padding: 22px;
          border-radius: 22px;
          background: #ffffff;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.07);
          border: 1px solid #e8ecf6;
          transition: 0.25s ease;
          cursor: pointer;
        }

        .home-quick-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 18px 36px rgba(15, 23, 42, 0.1);
        }

        .home-quick-icon {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
          font-size: 22px;
          color: #fff;
        }

        .home-quick-title {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .home-quick-desc {
          margin: 0;
          color: #64748b;
          font-size: 14px;
          line-height: 1.7;
        }

        .home-toast {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          min-width: 280px;
          color: #fff;
          padding: 14px 16px;
          border-radius: 16px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }

        .home-toast.success {
          background: linear-gradient(135deg, #2563eb, #4f46e5);
        }

        .home-toast.error {
          background: linear-gradient(135deg, #dc2626, #ef4444);
        }

        .home-toast-close {
          border: none;
          background: transparent;
          color: #fff;
          font-size: 16px;
        }

        @media (max-width: 767px) {
          .home-hero {
            padding: 24px;
          }

          .home-quick-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="home-page">
        <div className="container">
          {toast.show && (
            <div className={`home-toast ${toast.type === "error" ? "error" : "success"}`}>
              <span>{toast.message}</span>
              <button
                type="button"
                className="home-toast-close"
                onClick={() => setToast({ show: false, message: "", type: "success" })}
              >
                x
              </button>
            </div>
          )}

          <div className="home-hero mb-4">
            <div className="row align-items-center g-4">
              <div className="col-lg-8">
                <h2 className="fw-bold mb-2">Dashboard Overview</h2>
                <p className="mb-0" style={{ opacity: 0.88 }}>
                  Monitor exams, users, and upcoming learning modules from one professional admin dashboard.
                </p>
              </div>

              <div className="col-lg-4 text-lg-end">
                <div className="home-hero-stat">
                  <div style={{ fontSize: "13px", opacity: 0.8 }}>Welcome</div>
                  <div className="fw-bold" style={{ fontSize: "24px" }}>
                    Admin
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="home-quick-grid">
            <div
              className="home-quick-card"
              onClick={() => showToast("Courses page route will be connected next.", "success")}
            >
              <div
                className="home-quick-icon"
                style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
              >
                <FiBookOpen />
              </div>
              <div className="home-quick-title">Course Management</div>
              <p className="home-quick-desc">
                Add, update, publish, and organize all public courses from one place.
              </p>
            </div>

            <div
              className="home-quick-card"
              onClick={() => showToast("Batches page route will be connected next.", "success")}
            >
              <div
                className="home-quick-icon"
                style={{ background: "linear-gradient(135deg, #2563eb, #06b6d4)" }}
              >
                <FiLayers />
              </div>
              <div className="home-quick-title">Batch Management</div>
              <p className="home-quick-desc">
                Create paid batches, set price, manage visibility, and prepare learner access.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="home-panel p-5 text-center">Loading dashboard...</div>
          ) : (
            <>
              <div className="row g-4 mb-4">
                <div className="col-md-4">
                  <div className="home-stat-card">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <FiClipboard color="#4f46e5" />
                      <div className="text-muted">Total Exams</div>
                    </div>
                    <h4 className="fw-bold mb-0">{dashboard.totalExams || 0}</h4>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="home-stat-card">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <FiUsers color="#16a34a" />
                      <div className="text-muted">Total Examinees</div>
                    </div>
                    <h4 className="fw-bold mb-0">{dashboard.totalExaminees || 0}</h4>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="home-stat-card">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <FiBookOpen color="#f59e0b" />
                      <div className="text-muted">Total Subjects</div>
                    </div>
                    <h4 className="fw-bold mb-0">{dashboard.totalSubject || 0}</h4>
                  </div>
                </div>
              </div>

              <div className="home-panel">
                <div className="card-body p-4">
                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                    <div>
                      <h4 className="fw-bold mb-1">Recent Exams</h4>
                      <p className="text-muted mb-0">
                        Search and review the latest exam records.
                      </p>
                    </div>

                    <div className="d-flex flex-wrap gap-2">
                      <div className="home-search">
                        <FiSearch className="home-search-icon" />
                        <input
                          type="text"
                          className="home-input"
                          placeholder="Search exams..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                        />
                      </div>

                      <select
                        value={perPage}
                        onChange={(e) => setPerPage(Number(e.target.value))}
                        className="home-select"
                      >
                        <option value={5}>5 / page</option>
                        <option value={10}>10 / page</option>
                        <option value={20}>20 / page</option>
                      </select>
                    </div>
                  </div>

                  <div className="d-none d-md-block table-responsive">
                    <table className="table align-middle">
                      <thead>
                        <tr style={{ color: "#475569" }}>
                          <th>#</th>
                          <th>Exam Name</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Total Marks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentExams.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center py-5 text-muted">
                              No exams found.
                            </td>
                          </tr>
                        ) : (
                          currentExams.map((item, index) => (
                            <tr key={item._id || index}>
                              <td>{indexOfFirst + index + 1}</td>
                              <td className="fw-semibold">{item.title}</td>
                              <td>{formatDate(item.date)}</td>
                              <td>
                                <span
                                  className="home-badge"
                                  style={getStatusStyle(item.status)}
                                >
                                  {item.status}
                                </span>
                              </td>
                              <td>{item.totalMarks}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="d-block d-md-none">
                    {currentExams.length === 0 ? (
                      <div className="text-center py-4 text-muted">No exams found.</div>
                    ) : (
                      <div className="row g-3">
                        {currentExams.map((item, index) => (
                          <div className="col-12" key={item._id || index}>
                            <div className="home-mobile-card">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <strong>#{indexOfFirst + index + 1}</strong>
                                <span
                                  className="home-badge"
                                  style={getStatusStyle(item.status)}
                                >
                                  {item.status}
                                </span>
                              </div>

                              <div className="fw-semibold mb-2">{item.title}</div>
                              <div className="text-muted small mb-1">
                                Date: {formatDate(item.date)}
                              </div>
                              <div className="text-muted small">
                                Total Marks: {item.totalMarks}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="d-flex flex-wrap justify-content-between align-items-center mt-4 gap-3">
                    <div className="text-muted">
                      Page {currentPage} of {totalPages}
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="home-btn-soft"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                      >
                        Previous
                      </button>

                      <button
                        type="button"
                        className="home-btn-primary"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminHome;
