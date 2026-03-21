import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FiBookOpen,
  FiCalendar,
  FiClock,
  FiLayers,
  FiPlayCircle,
  FiSearch,
  FiX,
} from "react-icons/fi";

const MyBatches = () => {
  const userId = localStorage.getItem("userId");

  const [batches, setBatches] = useState([]);
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

  const fetchMyBatches = async () => {
    try {
      setFetching(true);

      const res = await axios.get(
        `https://computer-excellance-academy.onrender.com/api/examinee/${userId}/my-batches`
      );

      setBatches(res?.data?.data || []);
    } catch (error) {
      showToast("Failed to load batches", "error");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchMyBatches();
    }
  }, [userId]);

  const filteredBatches = useMemo(() => {
    const keyword = search.toLowerCase();
    return batches.filter((item) => {
      return (
        item.batch?.batchName?.toLowerCase().includes(keyword) ||
        item.course?.title?.toLowerCase().includes(keyword) ||
        item.batch?.mode?.toLowerCase().includes(keyword)
      );
    });
  }, [batches, search]);

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
        .mb-page {
          min-height: 100vh;
          padding: 24px 0;
          background: linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
        }

        .mb-hero {
          padding: 32px;
          border-radius: 28px;
          color: #fff;
          background: linear-gradient(135deg, #0f172a, #1d4ed8, #4f46e5);
          box-shadow: 0 20px 45px rgba(37, 99, 235, 0.22);
        }

        .mb-stat {
          display: inline-block;
          padding: 16px 20px;
          border-radius: 18px;
          background: rgba(255,255,255,0.14);
          backdrop-filter: blur(8px);
        }

        .mb-panel {
          background: #fff;
          border-radius: 24px;
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
          border: 0;
        }

        .mb-search {
          position: relative;
          min-width: 240px;
        }

        .mb-search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
        }

        .mb-input {
          width: 100%;
          border: 1px solid #dbe3f0;
          border-radius: 14px;
          padding: 12px 14px 12px 40px;
          outline: none;
        }

        .mb-input:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.08);
        }

        .mb-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 999px;
          background: #dbeafe;
          color: #1d4ed8;
          font-size: 12px;
          font-weight: 700;
        }

        .mb-open-btn {
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

        .mb-mobile-card {
          padding: 16px;
          background: #fff;
          border-radius: 18px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
        }

        .mb-toast {
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

        .mb-toast.success {
          background: linear-gradient(135deg, #2563eb, #4f46e5);
        }

        .mb-toast.error {
          background: linear-gradient(135deg, #dc2626, #ef4444);
        }

        .mb-toast-close {
          border: none;
          background: transparent;
          color: #fff;
          font-size: 16px;
        }

        @media (max-width: 767px) {
          .mb-hero {
            padding: 24px;
          }
        }
      `}</style>

      <div className="mb-page">
        <div className="container">
          {toast.show && (
            <div className={`mb-toast ${toast.type === "error" ? "error" : "success"}`}>
              <span>{toast.message}</span>
              <button
                type="button"
                className="mb-toast-close"
                onClick={() => setToast({ show: false, message: "", type: "success" })}
              >
                <FiX />
              </button>
            </div>
          )}

          <div className="mb-hero mb-4">
            <div className="row align-items-center g-4">
              <div className="col-lg-8">
                <h2 className="fw-bold mb-2">My Batches</h2>
                <p className="mb-0" style={{ opacity: 0.88 }}>
                  Yahan aapke purchased batches show honge jinko aap login ke baad access kar sakte hain.
                </p>
              </div>

              <div className="col-lg-4 text-lg-end">
                <div className="mb-stat">
                  <div style={{ fontSize: "13px", opacity: 0.8 }}>Purchased Batches</div>
                  <div className="fw-bold" style={{ fontSize: "24px" }}>
                    {filteredBatches.length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-panel">
            <div className="card-body p-4">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                  <h4 className="fw-bold mb-1">Batch List</h4>
                  <p className="text-muted mb-0">
                    Search and open your purchased learning batches.
                  </p>
                </div>

                <div className="mb-search">
                  <FiSearch className="mb-search-icon" />
                  <input
                    type="text"
                    className="mb-input"
                    placeholder="Search batches..."
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
                      <th>Batch Name</th>
                      <th>Course</th>
                      <th>Mode</th>
                      <th>Access</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fetching ? (
                      <tr>
                        <td colSpan="6" className="text-center py-5">
                          Loading batches...
                        </td>
                      </tr>
                    ) : filteredBatches.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-5 text-muted">
                          No purchased batches found.
                        </td>
                      </tr>
                    ) : (
                      filteredBatches.map((item, i) => (
                        <tr key={item.batch?._id || i}>
                          <td>{i + 1}</td>
                          <td className="fw-semibold">
                            {item.batch?.batchName || "Batch"}
                          </td>
                          <td>{item.course?.title || "-"}</td>
                          <td>
                            <span className="mb-badge">
                              {item.batch?.mode || "-"}
                            </span>
                          </td>
                          <td>{item.accessStatus || "active"}</td>
                          <td className="text-center">
                            <Link
                              to={`/userdash/batch/${item.batch?._id}`}
                              className="mb-open-btn"
                            >
                              <FiPlayCircle />
                              Open Batch
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
                  <div className="text-center py-4">Loading batches...</div>
                ) : filteredBatches.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    No purchased batches found.
                  </div>
                ) : (
                  <div className="row g-3">
                    {filteredBatches.map((item, i) => (
                      <div className="col-12" key={item.batch?._id || i}>
                        <div className="mb-mobile-card">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <strong>#{i + 1}</strong>
                            <span className="mb-badge">
                              {item.batch?.mode || "-"}
                            </span>
                          </div>

                          <div className="fw-semibold mb-1">
                            {item.batch?.batchName || "Batch"}
                          </div>

                          <div className="text-muted small mb-1">
                            <FiBookOpen className="me-1" />
                            {item.course?.title || "-"}
                          </div>

                          <div className="text-muted small mb-1">
                            <FiCalendar className="me-1" />
                            Enrolled: {formatDate(item.enrolledAt)}
                          </div>

                          <div className="text-muted small mb-3">
                            <FiClock className="me-1" />
                            Access: {item.accessStatus || "active"}
                          </div>

                          <Link
                            to={`/userdash/batch/${item.batch?._id}`}
                            className="mb-open-btn w-100 justify-content-center"
                          >
                            <FiPlayCircle />
                            Open Batch
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

export default MyBatches;
