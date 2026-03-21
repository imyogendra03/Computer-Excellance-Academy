import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import {
  FiAward,
  FiCalendar,
  FiFileText,
  FiPrinter,
  FiSearch,
  FiX,
} from "react-icons/fi";

const Result = () => {
  const [results, setResults] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const userId = localStorage.getItem("userId");

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 2500);
  };

  const handleFetch = async () => {
    try {
      setFetching(true);
      const res = await axios.get(
        `https://computer-excellance-academy.onrender.com/api/exams/examinee-result/${userId}`
      );

      setResults(
        Array.isArray(res?.data?.message)
          ? res.data.message
          : res?.data?.message
          ? [res.data.message]
          : []
      );
    } catch (error) {
      showToast("Failed to load results", "error");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    handleFetch();
  }, []);

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    return isNaN(date.getTime())
      ? value
      : date.toLocaleString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  const filteredResults = useMemo(() => {
    const keyword = search.toLowerCase();

    return results.filter((item) => {
      return (
        item.examId?.title?.toLowerCase().includes(keyword) ||
        String(item.examineeId?.name || item.examineeId || "")
          .toLowerCase()
          .includes(keyword) ||
        String(item.status || "").toLowerCase().includes(keyword)
      );
    });
  }, [results, search]);

  const passedCount = filteredResults.filter(
    (item) => String(item.status).toLowerCase() === "passed"
  ).length;

  const handlePrint = (item) => {
    const printWindow = window.open("", "_blank", "width=850,height=700");

    if (!printWindow) {
      showToast("Please allow popups to print result", "error");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Exam Result - ${item.examId?.title || "Exam Result"}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 30px;
              background: #f8fbff;
              color: #0f172a;
            }
            .card {
              max-width: 820px;
              margin: 0 auto;
              background: #fff;
              border-radius: 18px;
              overflow: hidden;
              box-shadow: 0 12px 30px rgba(0,0,0,0.12);
              border: 1px solid #e2e8f0;
            }
            .header {
              padding: 24px 28px;
              color: white;
              background: linear-gradient(135deg, #0f172a, #1d4ed8, #4f46e5);
            }
            .header h2 {
              margin: 0 0 6px;
              font-size: 28px;
            }
            .header p {
              margin: 0;
              opacity: 0.85;
            }
            .body {
              padding: 24px 28px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid #e2e8f0;
              padding: 12px;
              text-align: left;
            }
            th {
              width: 35%;
              background: #f8fafc;
            }
            .status-pass {
              color: #166534;
              font-weight: bold;
            }
            .status-fail {
              color: #991b1b;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h2>Exam Result Sheet</h2>
              <p>Generated from ExamPrep</p>
            </div>
            <div class="body">
              <table>
                <tr><th>Exam Name</th><td>${item.examId?.title || "-"}</td></tr>
                <tr><th>Candidate Name</th><td>${item.examineeId?.name || item.examineeId || "-"}</td></tr>
                <tr><th>Total Marks</th><td>${item.totalMarks ?? "-"}</td></tr>
                <tr><th>Score</th><td>${item.score ?? "-"}</td></tr>
                <tr><th>Passing Marks</th><td>${item.passingMarks ?? "-"}</td></tr>
                <tr>
                  <th>Status</th>
                  <td class="${String(item.status).toLowerCase() === "passed" ? "status-pass" : "status-fail"}">
                    ${item.status || "-"}
                  </td>
                </tr>
                <tr><th>Date</th><td>${formatDate(item.createdAt)}</td></tr>
              </table>
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const getStatusStyle = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "passed") {
      return { background: "#dcfce7", color: "#166534" };
    }
    return { background: "#fee2e2", color: "#991b1b" };
  };

  return (
    <>
      <style>{`
        .rs-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
        }

        .rs-hero {
          padding: 32px;
          border-radius: 28px;
          color: #fff;
          background: linear-gradient(135deg, #0f172a, #1d4ed8, #4f46e5);
          box-shadow: 0 20px 45px rgba(37, 99, 235, 0.22);
        }

        .rs-hero-stat {
          display: inline-block;
          padding: 16px 20px;
          border-radius: 18px;
          background: rgba(255,255,255,0.14);
          backdrop-filter: blur(8px);
        }

        .rs-panel,
        .rs-stat-card,
        .rs-mobile-card {
          background: #fff;
          border-radius: 24px;
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
          border: 0;
        }

        .rs-stat-card {
          padding: 24px;
          border-radius: 22px;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
          height: 100%;
        }

        .rs-search {
          position: relative;
          min-width: 240px;
        }

        .rs-search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
        }

        .rs-input {
          width: 100%;
          border: 1px solid #dbe3f0;
          border-radius: 14px;
          padding: 12px 14px 12px 40px;
          outline: none;
        }

        .rs-input:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.08);
        }

        .rs-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
        }

        .rs-print-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: none;
          color: #fff;
          font-weight: 600;
          border-radius: 12px;
          padding: 10px 16px;
          background: linear-gradient(135deg, #2563eb, #4f46e5);
        }

        .rs-mobile-card {
          padding: 16px;
          border-radius: 18px;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
        }

        .rs-toast {
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

        .rs-toast.success {
          background: linear-gradient(135deg, #2563eb, #4f46e5);
        }

        .rs-toast.error {
          background: linear-gradient(135deg, #dc2626, #ef4444);
        }

        .rs-toast-close {
          border: none;
          background: transparent;
          color: #fff;
          font-size: 16px;
        }

        @media (max-width: 767px) {
          .rs-hero {
            padding: 24px;
          }
        }
      `}</style>

      <div className="rs-page">
        <div className="container py-4">
          {toast.show && (
            <div className={`rs-toast ${toast.type === "error" ? "error" : "success"}`}>
              <span>{toast.message}</span>
              <button
                type="button"
                className="rs-toast-close"
                onClick={() => setToast({ show: false, message: "", type: "success" })}
              >
                <FiX />
              </button>
            </div>
          )}

          <div className="rs-hero mb-4">
            <div className="row align-items-center g-4">
              <div className="col-lg-8">
                <h2 className="fw-bold mb-2">My Results</h2>
                <p className="mb-0" style={{ opacity: 0.88 }}>
                  View your exam performance and print result sheets anytime.
                </p>
              </div>

              <div className="col-lg-4 text-lg-end">
                <div className="rs-hero-stat">
                  <div style={{ fontSize: "13px", opacity: 0.8 }}>Available Results</div>
                  <div className="fw-bold" style={{ fontSize: "24px" }}>
                    {filteredResults.length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-md-4">
              <div className="rs-stat-card">
                <div className="text-muted mb-2">Total Results</div>
                <h4 className="fw-bold mb-0">{results.length}</h4>
              </div>
            </div>

            <div className="col-md-4">
              <div className="rs-stat-card">
                <div className="text-muted mb-2">Passed</div>
                <h4 className="fw-bold mb-0">{passedCount}</h4>
              </div>
            </div>

            <div className="col-md-4">
              <div className="rs-stat-card">
                <div className="text-muted mb-2">Visible Records</div>
                <h4 className="fw-bold mb-0">{filteredResults.length}</h4>
              </div>
            </div>
          </div>

          <div className="rs-panel">
            <div className="card-body p-4">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                  <h4 className="fw-bold mb-1">Examinee Results</h4>
                  <p className="text-muted mb-0">
                    Search and print your result records.
                  </p>
                </div>

                <div className="rs-search">
                  <FiSearch className="rs-search-icon" />
                  <input
                    type="text"
                    className="rs-input"
                    placeholder="Search results..."
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
                      <th>Your Name</th>
                      <th>Total Marks</th>
                      <th>Score</th>
                      <th>Passing Marks</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fetching ? (
                      <tr>
                        <td colSpan="9" className="text-center py-5">
                          Loading results...
                        </td>
                      </tr>
                    ) : filteredResults.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center py-5 text-muted">
                          No result records found.
                        </td>
                      </tr>
                    ) : (
                      filteredResults.map((item, i) => (
                        <tr key={item._id}>
                          <td>{i + 1}</td>
                          <td className="fw-semibold">{item.examId?.title}</td>
                          <td>{item.examineeId?.name || item.examineeId}</td>
                          <td>{item.totalMarks}</td>
                          <td>{item.score}</td>
                          <td>{item.passingMarks}</td>
                          <td>
                            <span className="rs-badge" style={getStatusStyle(item.status)}>
                              {item.status}
                            </span>
                          </td>
                          <td>{formatDate(item.createdAt)}</td>
                          <td className="text-center">
                            <button
                              type="button"
                              className="rs-print-btn"
                              onClick={() => handlePrint(item)}
                            >
                              <FiPrinter />
                              Print
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="d-block d-md-none">
                {fetching ? (
                  <div className="text-center py-4">Loading results...</div>
                ) : filteredResults.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    No result records found.
                  </div>
                ) : (
                  <div className="row g-3">
                    {filteredResults.map((item, i) => (
                      <div className="col-12" key={item._id}>
                        <div className="rs-mobile-card">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <strong>#{i + 1}</strong>
                            <span className="rs-badge" style={getStatusStyle(item.status)}>
                              {item.status}
                            </span>
                          </div>

                          <div className="fw-semibold mb-2">{item.examId?.title}</div>
                          <div className="text-muted small mb-1">
                            Candidate: {item.examineeId?.name || item.examineeId}
                          </div>
                          <div className="text-muted small mb-1">
                            Score: {item.score} / {item.totalMarks}
                          </div>
                          <div className="text-muted small mb-1">
                            Passing: {item.passingMarks}
                          </div>
                          <div className="text-muted small mb-3">
                            Date: {formatDate(item.createdAt)}
                          </div>

                          <button
                            type="button"
                            className="rs-print-btn w-100 justify-content-center"
                            onClick={() => handlePrint(item)}
                          >
                            <FiPrinter />
                            Print Result
                          </button>
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

export default Result;
