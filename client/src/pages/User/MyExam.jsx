import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FiCalendar,
  FiClock,
  FiFileText,
  FiPlayCircle,
  FiSearch,
  FiX,
} from "react-icons/fi";

const MyExam = () => {
  const [exams, setExams] = useState([]);
  const [search, setSearch] = useState("");
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 2500);
  };

  const fetchExams = async () => {
    try {
      setFetching(true);
      const res = await axios.get("https://computer-excellance-academy.onrender.com/api/exams/exams");
      setExams(res?.data || []);
    } catch (error) {
      showToast("Failed to load exams", "error");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

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
    return isNaN(date.getTime())
      ? value
      : date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  return (
    <>
      <style>{`
        .me-page {
          min-height: 100vh;
          padding: 24px 0;
          background: linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
        }

        .me-hero {
          padding: 32px;
          border-radius: 28px;
          color: #fff;
          background: linear-gradient(135deg, #0f172a, #1d4ed8, #4f46e5);
          box-shadow: 0 20px 45px rgba(37, 99, 235, 0.22);
        }

        .me-stat {
          display: inline-block;
          padding: 16px 20px;
          border-radius: 18px;
          background: rgba(255,255,255,0.14);
          backdrop-filter: blur(8px);
        }

        .me-panel {
          background: #fff;
          border-radius: 24px;
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
          border: 0;
        }

        .me-search {
          position: relative;
          min-width: 240px;
        }

        .me-search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
        }

        .me-input {
          width: 100%;
          border: 1px solid #dbe3f0;
          border-radius: 14px;
          padding: 12px 14px 12px 40px;
          outline: none;
        }

        .me-input:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.08);
        }

        .me-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 999px;
          background: #dbeafe;
          color: #1d4ed8;
          font-size: 12px;
          font-weight: 700;
        }

        .me-start-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: none;
          color: #fff;
          text-decoration: none;
          font-weight: 600;
          border-radius: 12px;
          padding: 10px 16px;
          background: linear-gradient(135deg, #2563eb, #4f46e5);
        }

        .me-mobile-card {
          padding: 16px;
          background: #fff;
          border-radius: 18px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
        }

        .me-toast {
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

        .me-toast.success {
          background: linear-gradient(135deg, #2563eb, #4f46e5);
        }

        .me-toast.error {
          background: linear-gradient(135deg, #dc2626, #ef4444);
        }

        .me-toast-close {
          border: none;
          background: transparent;
          color: #fff;
          font-size: 16px;
        }

        @media (max-width: 767px) {
          .me-hero {
            padding: 24px;
          }
        }
      `}</style>

      <div className="me-page">
        <div className="container">
          {toast.show && (
            <div className={`me-toast ${toast.type === "error" ? "error" : "success"}`}>
              <span>{toast.message}</span>
              <button
                type="button"
                className="me-toast-close"
                onClick={() => setToast({ show: false, message: "", type: "success" })}
              >
                <FiX />
              </button>
            </div>
          )}

          <div className="me-hero mb-4">
            <div className="row align-items-center g-4">
              <div className="col-lg-8">
                <h2 className="fw-bold mb-2">My Exams</h2>
                <p className="mb-0" style={{ opacity: 0.88 }}>
                  Browse available exams and start your test from this dashboard.
                </p>
              </div>

              <div className="col-lg-4 text-lg-end">
                <div className="me-stat">
                  <div style={{ fontSize: "13px", opacity: 0.8 }}>Available Exams</div>
                  <div className="fw-bold" style={{ fontSize: "24px" }}>
                    {filteredExams.length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="me-panel">
            <div className="card-body p-4">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                  <h4 className="fw-bold mb-1">Exam List</h4>
                  <p className="text-muted mb-0">
                    Search and start any available exam.
                  </p>
                </div>

                <div className="me-search">
                  <FiSearch className="me-search-icon" />
                  <input
                    type="text"
                    className="me-input"
                    placeholder="Search exams..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="d-none d-md-block table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr style={{ color: "#475569" }}>
                      <th>#</th>
                      <th>Exam Name</th>
                      <th>Date Of Exam</th>
                      <th>Time</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fetching ? (
                      <tr>
                        <td colSpan="5" className="text-center py-5">
                          Loading exams...
                        </td>
                      </tr>
                    ) : filteredExams.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-5 text-muted">
                          No exams found.
                        </td>
                      </tr>
                    ) : (
                      filteredExams.map((item, i) => (
                        <tr key={item._id}>
                          <td>{i + 1}</td>
                          <td className="fw-semibold">{item.title}</td>
                          <td>
                            <span className="me-badge">{formatDate(item.date)}</span>
                          </td>
                          <td>{item.time || "-"}</td>
                          <td className="text-center">
                            <Link
                              to={`/userdash/getexam/${item._id}`}
                              className="me-start-btn"
                            >
                              <FiPlayCircle />
                              Start Exam
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="d-block d-md-none">
                {fetching ? (
                  <div className="text-center py-4">Loading exams...</div>
                ) : filteredExams.length === 0 ? (
                  <div className="text-center py-4 text-muted">No exams found.</div>
                ) : (
                  <div className="row g-3">
                    {filteredExams.map((item, i) => (
                      <div className="col-12" key={item._id}>
                        <div className="me-mobile-card">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <strong>#{i + 1}</strong>
                            <span className="me-badge">{formatDate(item.date)}</span>
                          </div>

                          <div className="fw-semibold mb-2">{item.title}</div>
                          <div className="text-muted small mb-3">
                            <FiClock className="me-1" />
                            {item.time || "-"}
                          </div>

                          <Link
                            to={`/userdash/getexam/${item._id}`}
                            className="me-start-btn w-100 justify-content-center"
                          >
                            <FiPlayCircle />
                            Start Exam
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyExam;
