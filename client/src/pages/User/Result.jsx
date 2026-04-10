import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FiFileText, FiPrinter, FiSearch, FiCheckCircle, FiXCircle, FiActivity, FiUser, FiCalendar, FiTarget, FiTrendingUp, FiAward } from "react-icons/fi";
import AppToast from "../../components/ui/AppToast";
import "../../components/ui/app-ui.css";

const Result = () => {
  const [results, setResults] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 2500);
  };

  const fetchResults = async () => {
    try {
      setFetching(true);
      const res = await axios.get(`${apiUrl}/api/exams/result`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResults(res?.data?.data || []);
    } catch (error) {
      showToast("Error retrieving academic records", "error");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchResults(); }, []);

  const formatDate = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const filteredResults = useMemo(() => {
    const k = search.toLowerCase();
    return results.filter(i => (i.examId?.title || "").toLowerCase().includes(k));
  }, [results, search]);

  const stats = useMemo(() => {
    const total = results.length;
    const passed = results.filter(r => String(r.status).toLowerCase() === "pass").length;
    const avgScore = total > 0 ? (results.reduce((acc, curr) => acc + (curr.score || 0), 0) / total).toFixed(1) : 0;
    return { total, passed, avgScore };
  }, [results]);

  const handlePrint = (item) => {
    const w = window.open("", "", "width=900,height=700");
    if (!w) return;
    w.document.write(`
      <html>
        <head>
          <title>Academic Certification - ${item.examId?.title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700&display=swap');
            body { font-family: 'Outfit', sans-serif; background: #f8fafc; padding: 40px; color: #0f172a; text-align: center; }
            .cert-card { max-width: 800px; margin: auto; background: white; border-radius: 40px; overflow: hidden; box-shadow: 0 40px 80px rgba(0,0,0,0.1); border: 2px solid #eef2ff; }
            .cert-header { background: linear-gradient(135deg, #0f172a, #1e1b4b); color: white; padding: 60px 40px; }
            .cert-body { padding: 50px; text-align: left; }
            .cert-title { font-size: 32px; font-weight: 800; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            th { text-align: left; padding: 16px; background: #f8fafc; color: #64748b; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #e2e8f0; }
            td { padding: 16px; border-bottom: 1px solid #f1f5f9; font-weight: 600; font-size: 1rem; }
            .status-tag { display: inline-block; padding: 8px 16px; border-radius: 50px; font-weight: 800; text-transform: uppercase; font-size: 0.75rem; }
            .status-pass { background: #f0fdf4; color: #10b981; }
            .status-fail { background: #fef2f2; color: #ef4444; }
            .cert-footer { padding: 30px; font-size: 0.8rem; color: #94a3b8; border-top: 1px solid #f1f5f9; }
          </style>
        </head>
        <body>
          <div class="cert-card">
            <div class="cert-header">
               <div style="font-size: 12px; font-weight: 800; opacity: 0.5; margin-bottom: 10px; letter-spacing: 3px;">OFFICIAL RESULT CERTIFICATION</div>
               <div class="cert-title">${item.examId?.title || 'Academic Assessment'}</div>
               <div style="opacity: 0.7; font-weight: 600;">Computer Excellence Academy</div>
            </div>
            <div class="cert-body">
               <table>
                  <tr><th>Performance Metric</th><th>Certification Data</th></tr>
                  <tr><td>Assessment Date</td><td>${formatDate(item.createdAt)}</td></tr>
                  <tr><td>Score Archive</td><td>${item.score} / ${item.totalMarks}</td></tr>
                  <tr><td>Requirement</td><td>${item.passingMarks} Marks</td></tr>
                  <tr><td>Final Status</td><td><span class="status-tag ${String(item.status).toLowerCase()==='pass'?'status-pass':'status-fail'}">${item.status}</span></td></tr>
               </table>
            </div>
            <div class="cert-footer">Generated via CEA Registry • Secure Digital Document</div>
          </div>
        </body>
      </html>
    `);
    w.document.close(); w.focus(); w.print();
  };

  return (
    <div className="app-page">
      <AppToast toast={toast} onClose={() => setToast({ show: false, message: "", type: "success" })} />

      <div className="container">
        {/* Hero Section */}
        <div className="app-hero mb-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <h2 className="fw-bold mb-2">Academic Roadmap</h2>
              <p className="mb-0">Track your assessment trajectory, scores, and certification status.</p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <div style={{ display: "inline-block", padding: "12px 20px", borderRadius: "16px", background: "#f3f4f6", textAlign: "right" }}>
                <div className="small fw-bold text-muted">TOTAL ASSESSMENTS</div>
                <div className="h4 fw-bold mb-0">{results.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="row g-4 mb-4">
          {!fetching && (
            <>
              <div className="col-md-4">
                <div className="app-stat-card">
                  <div className="app-label-muted">TOTAL ASSESSMENTS</div>
                  <h4 className="fw-bold mb-0">{stats.total}</h4>
                </div>
              </div>
              <div className="col-md-4">
                <div className="app-stat-card">
                  <div className="app-label-muted">MODULES CLEARED</div>
                  <h4 className="fw-bold mb-0">{stats.passed}</h4>
                </div>
              </div>
              <div className="col-md-4">
                <div className="app-stat-card">
                  <div className="app-label-muted">AVERAGE SCORE</div>
                  <h4 className="fw-bold mb-0">{stats.avgScore}%</h4>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Main Panel */}
        <div className="app-panel">
          <div className="card-body p-4">
            {/* Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
              <div>
                <h5 className="fw-bold mb-1">Result Archive</h5>
                <p className="text-muted small mb-0">Access and retrieve your official performance certifications.</p>
              </div>

              {/* Search */}
              <div style={{ position: "relative", maxWidth: 360, width: "100%" }}>
                <FiSearch style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input
                  type="text"
                  className="app-search"
                  placeholder="Filter by examination title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Table */}
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr className="text-muted small fw-bold">
                    <th className="py-3">#</th>
                    <th className="py-3">EXAMINATION PROTOCOL</th>
                    <th className="py-3">METRIC</th>
                    <th className="py-3 text-center">STATUS</th>
                    <th className="py-3 text-end">CERTIFICATION</th>
                  </tr>
                </thead>

                <tbody>
                  {fetching ? (
                    <tr>
                      <td colSpan="5" className="text-center py-5 text-muted fw-bold">Loading results...</td>
                    </tr>
                  ) : filteredResults.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-5 fw-bold text-muted">Archive Empty: No completed assessments found.</td>
                    </tr>
                  ) : (
                    filteredResults.map((item, i) => (
                      <tr key={item._id} style={{ transition: "0.3s", borderBottom: "1px solid #f1f5f9" }}>
                        <td className="fw-bold text-muted py-3">{i + 1}</td>
                        <td style={{ minWidth: 240 }} className="py-3">
                          <div className="fw-bold d-flex align-items-center gap-2">
                            <FiTarget className="text-indigo-400" />
                            {item.examId?.title || "PROTOCOL-X"}
                          </div>
                          <div className="small text-muted mt-1 d-flex align-items-center gap-1">
                            <FiCalendar /> {formatDate(item.createdAt)}
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="fw-bold text-indigo-600">
                            {item.score}
                            <span className="small text-muted fw-bold"> / {item.totalMarks}</span>
                          </div>
                          <div className="small text-muted">PASS MIN: {item.passingMarks}</div>
                        </td>
                        <td className="text-center py-3">
                          <span className="app-badge" style={{ background: String(item.status).toLowerCase() === "pass" ? "#f0fdf4" : "#fef2f2", color: String(item.status).toLowerCase() === "pass" ? "#10b981" : "#ef4444" }}>
                            {item.status}
                          </span>
                        </td>
                        <td className="text-end py-3">
                          <button className="app-btn-primary" style={{ padding: "8px 16px", fontSize: "0.85rem" }} onClick={() => handlePrint(item)}>
                            <FiPrinter className="me-1" /> Download
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
    </div>
  );
};

export default Result;
