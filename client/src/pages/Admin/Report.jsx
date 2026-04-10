import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiFileText, FiPrinter, FiSearch, FiCheckCircle, FiXCircle, FiActivity, FiUser, FiCalendar, FiTarget } from "react-icons/fi";
import { SkeletonTable, SkeletonStats } from "../../components/ui/SkeletonLoader";

const Report = () => {
  const [reports, setReports] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");

  const fetchReports = async () => {
    try {
      setFetching(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/exams/report`);
      setReports(res?.data || []);
    } catch (error) {
      console.error("Fetch failure", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const formatDate = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const filteredReports = useMemo(() => {
    const k = search.toLowerCase();
    return reports.filter(b => b.examTitle?.toLowerCase().includes(k) || b.examineeName?.toLowerCase().includes(k) || b.examineeEmail?.toLowerCase().includes(k));
  }, [reports, search]);

  const stats = useMemo(() => {
    const total = reports.length;
    const passed = reports.filter(r => String(r.status).toLowerCase() === "pass").length;
    const failed = reports.filter(r => String(r.status).toLowerCase() === "fail").length;
    return { total, passed, failed };
  }, [reports]);

  const handlePrint = (item) => {
    const w = window.open("", "", "width=900,height=700");
    if (!w) return;
    w.document.write(`
      <html>
        <head>
          <title>Protocol Report - ${item.examineeName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700&display=swap');
            body { font-family: 'Outfit', sans-serif; background: #f8fafc; padding: 40px; color: #0f172a; }
            .report-card { max-width: 800px; margin: auto; background: white; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
            .report-header { background: linear-gradient(135deg, #0f172a, #1e1b4b); color: white; padding: 40px; text-align: center; }
            .report-body { padding: 40px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; padding: 16px; background: #f1f5f9; color: #64748b; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #e2e8f0; }
            td { padding: 16px; border-bottom: 1px solid #f1f5f9; font-weight: 600; font-size: 0.95rem; }
            .status-pass { color: #10b981; }
            .status-fail { color: #ef4444; }
            .footer { padding: 20px; text-align: center; font-size: 0.75rem; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="report-card">
            <div class="report-header">
               <div style="font-size: 10px; font-weight: 800; opacity: 0.5; margin-bottom: 8px; letter-spacing: 2px;">OFFICIAL EXAMINATION PROTOCOL</div>
               <h1 style="margin:0; font-size: 32px;">${item.examTitle}</h1>
               <div style="margin-top: 5px; opacity: 0.7; font-weight: 600;">Result Certification Statement</div>
            </div>
            <div class="report-body">
               <table>
                  <tr><th>Examinee Name</th><td>${item.examineeName}</td></tr>
                  <tr><th>System Identity</th><td>${item.examineeEmail}</td></tr>
                  <tr><th>Assessment Date</th><td>${formatDate(item.attemptedAt)}</td></tr>
                  <tr><th>Score Metric</th><td>${item.score} / ${item.totalMarks}</td></tr>
                  <tr><th>Protocol Requirement</th><td>${item.passingMarks} Marks</td></tr>
                  <tr><th>Status Label</th><td class="${String(item.status).toLowerCase()==='pass'?'status-pass':'status-fail'}">${String(item.status).toUpperCase()}</td></tr>
               </table>
            </div>
            <div class="footer">Computer Excellence Academy Digital Registry • Verified Document</div>
          </div>
        </body>
      </html>
    `);
    w.document.close(); w.focus(); w.print();
  };

  return (
    <div className="home-page pt-0">
      <style>{`
        .rp-hero { background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 60px 40px; border-radius: 32px; color: #fff; margin-bottom: 40px; position: relative; overflow: hidden; }
        .rp-hero::after { content: ""; position: absolute; bottom: -80px; left: -80px; width: 300px; height: 300px; background: radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%); border-radius: 50%; }
        .rp-stat-card { background: #fff; border-radius: 24px; padding: 28px; border: 1px solid #f1f5f9; box-shadow: 0 10px 25px rgba(0,0,0,0.02); transition: 0.3s; height: 100%; display: flex; align-items: center; gap: 24px; }
        .rp-stat-card:hover { transform: translateY(-5px); border-color: #6366f1; box-shadow: 0 20px 40px rgba(99,102,241,0.08); }
        .rp-table-row { transition: 0.3s; border-bottom: 1px solid #f1f5f9; }
        .rp-table-row:hover { background: #f8fbff; }
        .rp-badge { padding: 6px 14px; border-radius: 50px; font-weight: 800; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.5px; }
        .badge-pass { background: #f0fdf4; color: #10b981; border: 1px solid #bbf7d0; }
        .badge-fail { background: #fef2f2; color: #ef4444; border: 1px solid #fee2e2; }
      `}</style>

      <div className="container-fluid p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rp-hero shadow-2xl">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <span className="badge bg-white bg-opacity-20 mb-3 px-3 py-2 rounded-pill fw-bold">ANALYTICS HUB</span>
              <h1 className="display-5 fw-black mb-2">Examinee Performance</h1>
              <p className="lead opacity-75 mb-0">Aggregate assessment data and individual performance certifications.</p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <div className="p-3 bg-white bg-opacity-10 rounded-4 d-inline-block text-start" style={{ backdropFilter: 'blur(10px)' }}>
                 <div className="small fw-bold opacity-50 mb-1">REAL-TIME SYNC</div>
                 <div className="fw-black d-flex align-items-center gap-2"><FiActivity className="text-emerald-400" /> ONLINE REGISTRY</div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="row g-4 mb-5">
           {fetching ? <SkeletonStats count={3} /> : (
             <>
               <div className="col-md-4"><div className="rp-stat-card"><div className="p-3 bg-indigo-50 rounded-4 text-indigo-600 fs-3"><FiFileText /></div><div><div className="small fw-bold text-muted">TOTAL SUBMISSIONS</div><div className="h2 fw-black mb-0">{stats.total}</div></div></div></div>
               <div className="col-md-4"><div className="rp-stat-card"><div className="p-3 bg-emerald-50 rounded-4 text-emerald-600 fs-3"><FiCheckCircle /></div><div><div className="small fw-bold text-muted">PASS PROTOCOLS</div><div className="h2 fw-black mb-0">{stats.passed}</div></div></div></div>
               <div className="col-md-4"><div className="rp-stat-card"><div className="p-3 bg-rose-50 rounded-4 text-rose-600 fs-3"><FiXCircle /></div><div><div className="small fw-bold text-muted">FAILED ATTEMPTS</div><div className="h2 fw-black mb-0">{stats.failed}</div></div></div></div>
             </>
           )}
        </div>

        <div className="home-panel shadow-sm">
           <div className="d-flex flex-wrap justify-content-between align-items-center gap-4 mb-5">
              <div><h3 className="fw-black mb-1">Global Report Registry</h3><p className="text-muted small">Search and retrieve official assessment certifications.</p></div>
              <div className="position-relative" style={{ minWidth: 340 }}>
                 <FiSearch className="position-absolute" style={{ left: 18, top: 18, color: '#94a3b8' }} />
                 <input type="text" className="form-control rounded-4 py-3 ps-5 border-light bg-light" placeholder="Search by name, email or exam title..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
           </div>

           <div className="table-responsive">
              <table className="table align-middle">
                 <thead><tr className="text-muted small fw-black"><th className="pb-3">#</th><th className="pb-3">EXAM HUB</th><th className="pb-3">EXAMINEE IDENTITY</th><th className="pb-3">METRIC</th><th className="pb-3 text-center">STATUS</th><th className="pb-3 text-end">ARCHIVE</th></tr></thead>
                 <tbody>
                    <AnimatePresence>
                    {fetching ? (
                      <tr><td colSpan="6" className="p-0 border-0"><SkeletonTable rows={5} cols={6} /></td></tr>
                    ) : filteredReports.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-5 fw-bold text-muted">Log Entry: No matching records found in registry.</td></tr>
                    ) : (
                      filteredReports.map((item, i) => (
                        <motion.tr key={item._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rp-table-row">
                           <td className="fw-black text-muted">{i+1}</td>
                           <td style={{ minWidth: 200 }}><div className="fw-black text-dark fs-6 d-flex align-items-center gap-2"><FiTarget className="text-indigo-400" /> {item.examTitle}</div><div className="small fw-bold text-muted mt-1 d-flex align-items-center gap-1"><FiCalendar /> {formatDate(item.attemptedAt)}</div></td>
                           <td><div className="fw-black text-dark d-flex align-items-center gap-2"><FiUser className="text-primary" /> {item.examineeName}</div><div className="small text-muted fw-bold">{item.examineeEmail}</div></td>
                           <td><div className="fw-black text-indigo-600 fs-5">{item.score} <span className="small text-muted fw-bold">/ {item.totalMarks}</span></div><div className="small fw-bold opacity-50">MIN: {item.passingMarks}</div></td>
                           <td className="text-center"><span className={`rp-badge ${String(item.status).toLowerCase()==='pass'?'badge-pass':'badge-fail'}`}>{item.status}</span></td>
                           <td className="text-end"><button className="btn btn-sm btn-indigo-600 text-white rounded-3 p-2 px-4 fw-black shadow-sm" style={{ background: '#6366f1' }} onClick={() => handlePrint(item)}><FiPrinter className="me-2"/> PRINT</button></td>
                        </motion.tr>
                      ))
                    )}
                    </AnimatePresence>
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
