import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";

const Report = () => {
  const [reports, setReports] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");

  const fetchReports = async () => {
    try {
      setFetching(true);
      const res = await axios.get("https://computer-excellance-academy.onrender.com/api/exams/report");
      setReports(res?.data || []);
    } catch (error) {
      alert("Sorry, fetching reports failed.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    const date = new Date(dateValue);
    return isNaN(date.getTime())
      ? dateValue
      : date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      const keyword = search.toLowerCase();
      return (
        item.examTitle?.toLowerCase().includes(keyword) ||
        item.examineeName?.toLowerCase().includes(keyword) ||
        item.examineeEmail?.toLowerCase().includes(keyword) ||
        item.status?.toLowerCase().includes(keyword)
      );
    });
  }, [reports, search]);

  const totalReports = reports.length;
  const passedCount = reports.filter(
    (item) => String(item.status).toLowerCase() === "pass"
  ).length;
  const failedCount = reports.filter(
    (item) => String(item.status).toLowerCase() === "fail"
  ).length;

  const handlePrint = (item) => {
    const printWindow = window.open("", "", "width=900,height=700");
    if (!printWindow) {
      alert("Please allow popups for printing.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Exam Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: #f4f7fb;
              padding: 30px;
              color: #1e293b;
            }
            .card {
              max-width: 800px;
              margin: auto;
              background: white;
              border-radius: 18px;
              overflow: hidden;
              box-shadow: 0 10px 30px rgba(0,0,0,0.12);
            }
            .header {
              background: linear-gradient(135deg, #0f172a, #2563eb);
              color: white;
              padding: 24px 30px;
            }
            .header h2 {
              margin: 0;
              font-size: 28px;
            }
            .header p {
              margin-top: 6px;
              opacity: 0.85;
            }
            .content {
              padding: 24px 30px;
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
              background: #f8fafc;
              width: 35%;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h2>${item.examTitle || "Exam Report"}</h2>
              <p>Examinee performance summary</p>
            </div>
            <div class="content">
              <table>
                <tr><th>Examinee Name</th><td>${item.examineeName || "-"}</td></tr>
                <tr><th>Email</th><td>${item.examineeEmail || "-"}</td></tr>
                <tr><th>Total Marks</th><td>${item.totalMarks ?? "-"}</td></tr>
                <tr><th>Passing Marks</th><td>${item.passingMarks ?? "-"}</td></tr>
                <tr><th>Score</th><td>${item.score ?? "-"}</td></tr>
                <tr><th>Status</th><td>${item.status || "-"}</td></tr>
                <tr><th>Date of Exam</th><td>${formatDate(item.attemptedAt)}</td></tr>
              </table>
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const getStatusStyle = (status) => {
    const value = String(status || "").toLowerCase();
    if (value === "pass") {
      return {
        backgroundColor: "#dcfce7",
        color: "#166534",
      };
    }
    if (value === "fail") {
      return {
        backgroundColor: "#fee2e2",
        color: "#991b1b",
      };
    }
    return {
      backgroundColor: "#e2e8f0",
      color: "#334155",
    };
  };

  return (
    <div className="container py-4">
      <div
        className="p-4 mb-4 text-white"
        style={{
          borderRadius: "24px",
          background: "linear-gradient(135deg, #0f172a, #2563eb)",
          boxShadow: "0 12px 30px rgba(37, 99, 235, 0.25)",
        }}
      >
        <h2 className="fw-bold mb-2">Exam Reports Dashboard</h2>
        <p className="mb-0" style={{ opacity: 0.85 }}>
          Track examinee performance, search records, and print clean reports.
        </p>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div
            className="p-4 h-100 bg-white"
            style={{
              borderRadius: "18px",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
            }}
          >
            <p className="text-muted mb-2">Total Reports</p>
            <h3 className="fw-bold mb-0">{totalReports}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div
            className="p-4 h-100 bg-white"
            style={{
              borderRadius: "18px",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
            }}
          >
            <p className="text-muted mb-2">Passed</p>
            <h3 className="fw-bold mb-0 text-success">{passedCount}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div
            className="p-4 h-100 bg-white"
            style={{
              borderRadius: "18px",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
            }}
          >
            <p className="text-muted mb-2">Failed</p>
            <h3 className="fw-bold mb-0 text-danger">{failedCount}</h3>
          </div>
        </div>
      </div>

      <div
        className="card border-0"
        style={{
          borderRadius: "22px",
          overflow: "hidden",
          boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
        }}
      >
        <div className="card-body p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div>
              <h4 className="fw-bold mb-1">Examinee Data</h4>
              <p className="text-muted mb-0">
                Search and manage exam performance reports.
              </p>
            </div>

            <div style={{ minWidth: "280px" }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search by exam, name, email or status..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  borderRadius: "12px",
                  padding: "12px 14px",
                  border: "1px solid #cbd5e1",
                }}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr style={{ color: "#475569" }}>
                  <th>#</th>
                  <th>Exam</th>
                  <th>Examinee</th>
                  <th>Email</th>
                  <th>Total</th>
                  <th>Passing</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {fetching ? (
                  <tr>
                    <td colSpan="10" className="text-center py-5">
                      Loading reports...
                    </td>
                  </tr>
                ) : filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-5 text-muted">
                      No reports found.
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((item, index) => (
                    <tr key={item._id}>
                      <td>{index + 1}</td>
                      <td className="fw-semibold">{item.examTitle}</td>
                      <td>{item.examineeName}</td>
                      <td>{item.examineeEmail}</td>
                      <td>{item.totalMarks}</td>
                      <td>{item.passingMarks}</td>
                      <td>{item.score}</td>
                      <td>
                        <span
                          style={{
                            ...getStatusStyle(item.status),
                            padding: "6px 12px",
                            borderRadius: "999px",
                            fontSize: "12px",
                            fontWeight: "600",
                            display: "inline-block",
                            minWidth: "70px",
                            textAlign: "center",
                          }}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td>{formatDate(item.attemptedAt)}</td>
                      <td className="text-center">
                        <button
                          type="button"
                          onClick={() => handlePrint(item)}
                          className="btn text-white"
                          style={{
                            border: "none",
                            borderRadius: "10px",
                            padding: "8px 16px",
                            background:
                              "linear-gradient(135deg, #2563eb, #1d4ed8)",
                          }}
                        >
                          Print
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
