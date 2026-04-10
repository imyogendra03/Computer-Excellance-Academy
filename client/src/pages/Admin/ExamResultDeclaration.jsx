import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FiFileText, FiCheckCircle, FiClock, FiSearch, FiActivity, FiUser, FiCalendar, FiTarget, FiTrendingUp, FiX, FiCheck } from "react-icons/fi";
import { SkeletonTable, SkeletonStats } from "../../components/ui/SkeletonLoader";
import AppToast from "../../components/ui/AppToast";
import "../../components/ui/app-ui.css";

const ExamResultsDeclaration = () => {
  const [examResults, setExamResults] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [declaringId, setDeclaringId] = useState(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const apiUrl = import.meta.env.VITE_API_URL;

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 2500);
  };

  const formatDate = (v) => {
    if (!v) return "N/A";
    const date = new Date(v);
    return isNaN(date.getTime()) ? v : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const fetchExamResults = async () => {
    try {
      setFetching(true);
      const res = await axios.get(`${apiUrl}/api/exams/examination`);
      setExamResults(res?.data?.message || []);
    } catch (error) { 
      showToast("Error retrieving examination set", "error"); 
    } finally { setFetching(false); }
  };

  useEffect(() => { fetchExamResults(); }, []);

  const handleDeclare = async (id) => {
    try {
      setDeclaringId(id);
      const token = localStorage.getItem("adminToken");
      const res = await axios.post(`${apiUrl}/api/exams/result/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      showToast(res?.data?.message || "Result protocol initiated");
      fetchExamResults();
    } catch (err) {
      showToast(err.response?.data?.message || "Declaration protocol failed", "error");
    } finally { setDeclaringId(null); }
  };

  const filteredResults = useMemo(() => {
    const k = search.toLowerCase();
    return examResults.filter(i => (i.examId?.title || "").toLowerCase().includes(k));
  }, [examResults, search]);

  return (
    <div className="app-page">
      <AppToast toast={toast} onClose={() => setToast({ show: false, message: "", type: "success" })} />

      <div className="container">
        <div className="app-hero mb-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <h2 className="fw-bold mb-2">Results Declaration Dashboard</h2>
              <p className="mb-0" style={{ opacity: 0.88 }}>
                Evaluate performance streams and authorize academic result certification.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
               <div style={{ background: "rgba(0,0,0,0.05)", borderRadius: 16, padding: "12px 20px", display: "inline-block" }}>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>RECORDS</div>
                  <div className="fw-bold" style={{ fontSize: 24 }}>{examResults.length}</div>
               </div>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-4">
           {fetching ? <SkeletonStats count={3} /> : (
             <>
               <div className="col-md-4"><div className="app-stat-card"><div className="app-label-muted">PENDING EXAMS</div><h4 className="fw-bold mb-0">{examResults.length}</h4></div></div>
               <div className="col-md-4"><div className="app-stat-card"><div className="app-label-muted">FILTERED</div><h4 className="fw-bold mb-0">{filteredResults.length}</h4></div></div>
               <div className="col-md-4"><div className="app-stat-card"><div className="app-label-muted">STATUS</div><h4 className="fw-bold mb-0">{declaringId ? "SYNCING" : "IDLE"}</h4></div></div>
             </>
           )}
        </div>

        <div className="app-panel">
           <div className="card-body p-4">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                 <div><h4 className="fw-bold mb-1">Examination Registry</h4><p className="text-muted small">Access and certify completed educational assessments.</p></div>
                 <div className="app-search" style={{ minWidth: 320 }}>
                    <FiSearch className="app-search__icon" />
                    <input type="text" className="form-control app-input" placeholder="Search by exam title..." value={search} onChange={e => setSearch(e.target.value)} />
                 </div>
              </div>

              <div className="d-none d-md-block table-responsive">
                 <table className="table align-middle">
                    <thead><tr style={{ color: "#475569" }}><th>#</th><th>EXAMINATION</th><th>DATE</th><th className="text-center">STATUS</th><th className="text-end">ACTION</th></tr></thead>
                    <tbody>
                       <AnimatePresence>
                       {fetching ? (
                         <tr><td colSpan="5" className="p-0 border-0"><SkeletonTable rows={5} cols={5} /></td></tr>
                       ) : filteredResults.length === 0 ? (
                         <tr><td colSpan="5" className="text-center py-5 fw-bold text-muted">No exams require declaration.</td></tr>
                       ) : (
                         filteredResults.map((item, i) => (
                           <motion.tr key={item._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td className="fw-bold text-muted">{i+1}</td>
                              <td style={{ minWidth: 260 }}><div className="fw-bold text-dark">{item.examId?.title || "EXAM"}</div></td>
                              <td><div className="small text-muted">{formatDate(item.examId?.date)}</div></td>
                              <td className="text-center"><span className="app-badge" style={{ background: declaringId === item._id ? '#fef3c7' : '#eef2ff', color: declaringId === item._id ? '#92400e' : '#4f46e5' }}>{declaringId === item._id ? 'Processing...' : 'Pending'}</span></td>
                              <td className="text-end"><button className={`${declaringId === item._id ? 'app-btn-soft' : 'app-btn-primary'}`} style={{ fontSize: '0.85rem' }} onClick={() => handleDeclare(item._id)} disabled={declaringId === item._id}>{declaringId === item._id ? 'COMMITTING...' : <><FiCheck className="me-1" style={{ display: 'inline' }} />DECLARE</>}</button></td>
                           </motion.tr>
                         ))
                       )}
                       </AnimatePresence>
                    </tbody>
                 </table>
              </div>

              <div className="d-block d-md-none">
                {fetching ? (
                  <div className="text-center py-4">Loading...</div>
                ) : filteredResults.length === 0 ? (
                  <div className="text-center py-4 text-muted">No exams found.</div>
                ) : (
                  <div className="row g-3">
                    {filteredResults.map((item, i) => (
                      <div className="col-12" key={item._id}>
                        <div className="app-mobile-card">
                          <strong>#{i+1} - {item.examId?.title}</strong>
                          <div className="text-muted small mt-1">{formatDate(item.examId?.date)}</div>
                          <div className="mt-2">
                            <button className={`w-100 ${declaringId === item._id ? 'app-btn-soft' : 'app-btn-primary'}`} onClick={() => handleDeclare(item._id)} disabled={declaringId === item._id}>
                              {declaringId === item._id ? 'Processing...' : 'Declare'}
                            </button>
                          </div>
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
  );
};

export default ExamResultsDeclaration;
