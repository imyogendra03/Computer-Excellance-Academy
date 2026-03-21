import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const ExamResultsDeclaration = () => {
  const [examResults, setExamResults] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [declaringId, setDeclaringId] = useState(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 2500);
  };

  const formatDate = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    return isNaN(date.getTime())
      ? value
      : date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  const fetchExamResults = async () => {
    try {
      setFetching(true);
      const res = await axios.get("https://computer-excellance-academy.onrender.com/api/exams/examination");
      setExamResults(res?.data?.message || []);
    } catch (error) {
      showToast("Failed to load exam results", "error");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchExamResults();
  }, []);

  const handleDeclare = async (examResultId) => {
    try {
      setDeclaringId(examResultId);
      const response = await axios.post(
        `https://computer-excellance-academy.onrender.com/api/exams/result/${examResultId}`
      );
      showToast(response?.data?.message || "Result declared successfully");
      fetchExamResults();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to declare result",
        "error"
      );
    } finally {
      setDeclaringId(null);
    }
  };

  const filteredResults = useMemo(() => {
    const keyword = search.toLowerCase();
    return examResults.filter((item) => {
      const examTitle = item.examId?.title || "";
      const examDate = item.examId?.date || "";
      return (
        examTitle.toLowerCase().includes(keyword) ||
        String(examDate).toLowerCase().includes(keyword)
      );
    });
  }, [examResults, search]);

  return (
    <div
      className="container py-4"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)",
      }}
    >
      {toast.show && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            minWidth: "280px",
            padding: "14px 16px",
            borderRadius: "16px",
            color: "#fff",
            background:
              toast.type === "error"
                ? "linear-gradient(135deg,#dc2626,#ef4444)"
                : "linear-gradient(135deg,#2563eb,#4f46e5)",
            boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
          }}
        >
          <div className="d-flex justify-content-between align-items-center gap-3">
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() =>
                setToast({ show: false, message: "", type: "success" })
              }
              style={{
                border: "none",
                background: "transparent",
                color: "#fff",
                fontSize: "16px",
              }}
            >
              x
            </button>
          </div>
        </div>
      )}

      <div
        className="p-4 p-md-5 mb-4 text-white"
        style={{
          borderRadius: "28px",
          background: "linear-gradient(135deg, #0f172a, #1d4ed8, #4f46e5)",
          boxShadow: "0 20px 45px rgba(37, 99, 235, 0.22)",
        }}
      >
        <div className="row align-items-center g-4">
          <div className="col-lg-8">
            <h2 className="fw-bold mb-2">Exam Results Declaration</h2>
            <p className="mb-0" style={{ opacity: 0.88 }}>
              Review exam entries and declare results through a clean professional dashboard.
            </p>
          </div>
          <div className="col-lg-4 text-lg-end">
            <div
              className="d-inline-block px-4 py-3"
              style={{
                borderRadius: "18px",
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div style={{ fontSize: "13px", opacity: 0.8 }}>Total Exams</div>
              <div className="fw-bold" style={{ fontSize: "28px" }}>
                {examResults.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div
            className="p-4 bg-white h-100"
            style={{
              borderRadius: "22px",
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
            }}
          >
            <div className="text-muted mb-2">Total Records</div>
            <h4 className="fw-bold mb-0">{examResults.length}</h4>
          </div>
        </div>

        <div className="col-md-4">
          <div
            className="p-4 bg-white h-100"
            style={{
              borderRadius: "22px",
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
            }}
          >
            <div className="text-muted mb-2">Visible Records</div>
            <h4 className="fw-bold mb-0">{filteredResults.length}</h4>
          </div>
        </div>

        <div className="col-md-4">
          <div
            className="p-4 bg-white h-100"
            style={{
              borderRadius: "22px",
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
            }}
          >
            <div className="text-muted mb-2">Action Status</div>
            <h4 className="fw-bold mb-0">
              {declaringId ? "Declaring..." : "Ready"}
            </h4>
          </div>
        </div>
      </div>

      <div
        className="card border-0"
        style={{
          borderRadius: "24px",
          boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)",
        }}
      >
        <div className="card-body p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div>
              <h4 className="fw-bold mb-1">Exam Records</h4>
              <p className="text-muted mb-0">
                Search and declare exam results easily.
              </p>
            </div>

            <div style={{ minWidth: "240px", position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#64748b",
                }}
              >
                🔍
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search exam name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  borderRadius: "14px",
                  padding: "12px 14px 12px 40px",
                  border: "1px solid #dbe3f0",
                }}
              />
            </div>
          </div>

          <div className="d-none d-md-block table-responsive">
            <table className="table align-middle">
              <thead>
                <tr style={{ color: "#475569" }}>
                  <th>#</th>
                  <th>Exam Name</th>
                  <th>Exam Date</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {fetching ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      Loading exam records...
                    </td>
                  </tr>
                ) : filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      No exam records found.
                    </td>
                  </tr>
                ) : (
                  filteredResults.map((examResult, index) => (
                    <tr key={examResult._id}>
                      <td>{index + 1}</td>
                      <td className="fw-semibold">
                        {examResult.examId?.title || "N/A"}
                      </td>
                      <td>{formatDate(examResult.examId?.date)}</td>
                      <td className="text-center">
                        <span
                          style={{
                            display: "inline-block",
                            padding: "6px 12px",
                            borderRadius: "999px",
                            background:
                              declaringId === examResult._id
                                ? "#fef3c7"
                                : "#dbeafe",
                            color:
                              declaringId === examResult._id
                                ? "#92400e"
                                : "#1d4ed8",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          {declaringId === examResult._id ? "Processing" : "Pending"}
                        </span>
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          onClick={() => handleDeclare(examResult._id)}
                          disabled={declaringId === examResult._id}
                          className="btn btn-sm text-white"
                          style={{
                            border: "none",
                            borderRadius: "10px",
                            padding: "8px 16px",
                            background:
                              declaringId === examResult._id
                                ? "#94a3b8"
                                : "linear-gradient(135deg, #16a34a, #22c55e)",
                          }}
                        >
                          {declaringId === examResult._id
                            ? "Declaring..."
                            : "Declare"}
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
              <div className="text-center py-4">Loading exam records...</div>
            ) : filteredResults.length === 0 ? (
              <div className="text-center py-4 text-muted">
                No exam records found.
              </div>
            ) : (
              <div className="row g-3">
                {filteredResults.map((examResult, index) => (
                  <div className="col-12" key={examResult._id}>
                    <div
                      className="p-3 bg-white"
                      style={{
                        borderRadius: "18px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)",
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <strong>#{index + 1}</strong>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "6px 12px",
                            borderRadius: "999px",
                            background:
                              declaringId === examResult._id
                                ? "#fef3c7"
                                : "#dbeafe",
                            color:
                              declaringId === examResult._id
                                ? "#92400e"
                                : "#1d4ed8",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          {declaringId === examResult._id ? "Processing" : "Pending"}
                        </span>
                      </div>

                      <div className="fw-semibold mb-2">
                        {examResult.examId?.title || "N/A"}
                      </div>
                      <div className="text-muted small mb-3">
                        Exam Date: {formatDate(examResult.examId?.date)}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeclare(examResult._id)}
                        disabled={declaringId === examResult._id}
                        className="btn w-100 text-white"
                        style={{
                          border: "none",
                          borderRadius: "10px",
                          padding: "10px 16px",
                          background:
                            declaringId === examResult._id
                              ? "#94a3b8"
                              : "linear-gradient(135deg, #16a34a, #22c55e)",
                        }}
                      >
                        {declaringId === examResult._id
                          ? "Declaring..."
                          : "Declare Result"}
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
  );
};

export default ExamResultsDeclaration;
