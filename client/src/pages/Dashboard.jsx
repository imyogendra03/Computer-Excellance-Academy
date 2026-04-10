import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiBookOpen, FiCheckCircle, FiChevronDown, FiClock, FiPlayCircle, FiAward } from "react-icons/fi";
import { Link } from "react-router-dom";
import axios from "axios";
import { getUserId, lmsApi } from "../services/lmsApi";
import { SkeletonCard, SkeletonStats } from "../components/ui/SkeletonLoader";
import "../components/ui/app-ui.css";

const Dashboard = () => {
  const userId = getUserId();
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [syllabus, setSyllabus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openBatch, setOpenBatch] = useState("");
  
  // New State for Insights
  const [userStats, setUserStats] = useState({
    rank: "N/A",
    examsAttempted: 0,
    examsTotal: 0,
    attendanceMonthly: []
  });

  useEffect(() => {
    let isMounted = true;
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [recent, myBatches, allExams, attendanceRes] = await Promise.all([
          lmsApi.getRecentlyViewed(),
          lmsApi.getMyBatches(userId),
          axios.get(`${apiUrl}/api/exams/exams`, config).then(r => r.data).catch(() => []),
          axios.get(`${apiUrl}/api/attendance/my-attendance`, config).then(r => r.data?.data).catch(() => [])
        ]);

        const activeBatches = (myBatches || []).filter((item) => item.accessStatus === "active");
        
        // Fetch rank from the first active batch
        let myRank = "N/A";
        if (activeBatches.length > 0) {
          const bId = activeBatches[0].batch?._id || activeBatches[0].batch;
          try {
            const lbRes = await axios.get(`${apiUrl}/api/leaderboard/${bId}`, config);
            const myEntry = lbRes.data?.data?.find(e => String(e.student?._id) === String(userId));
            if (myEntry) myRank = `#${myEntry.rank}`;
          } catch (e) {}
        }

        // Process Attendance Monthly
        const monthMap = {};
        (attendanceRes || []).forEach(a => {
           const d = new Date(a.date);
           const m = d.toLocaleString('default', { month: 'short' });
           if (!monthMap[m]) monthMap[m] = { present: 0, total: 0 };
           monthMap[m].total++;
           if (a.status === "Present" || a.status === "Late") monthMap[m].present++;
        });

        const syllabusRows = await Promise.all(
          activeBatches.slice(0, 5).map(async (item) => {
            try {
              const data = await lmsApi.getBatchContent(item.batch?._id);
              const completed = data.flatItems.filter((entry) => entry.progress?.completed).length || 0;
              const total = data.flatItems.length || 0;
              return {
                batch: data.batch,
                subjects: data.subjects,
                completed,
                total,
                progressPercentage: total ? Math.round((completed / total) * 100) : 0,
              };
            } catch { return null; }
          })
        );

        if (!isMounted) return;
        setRecentlyViewed(recent);
        setSyllabus(syllabusRows.filter(Boolean));
        setOpenBatch(syllabusRows.find(Boolean)?.batch?._id || "");
        
        setUserStats({
          rank: myRank,
          examsAttempted: (allExams || []).filter(e => e.isAttempted).length,
          examsTotal: (allExams || []).length,
          attendanceMonthly: Object.entries(monthMap).slice(-4)
        });

      } finally {
        if (isMounted) setLoading(false);
      }
    };
    if (userId) fetchDashboard();
    return () => { isMounted = false; };
  }, [userId]);

  const stats = useMemo(() => {
    const totalLectures = syllabus.reduce((sum, item) => sum + item.total, 0);
    const completedLectures = syllabus.reduce((sum, item) => sum + item.completed, 0);
    const percentage = totalLectures ? Math.round((completedLectures / totalLectures) * 100) : 0;
    return { totalLectures, completedLectures, batches: syllabus.length, percentage };
  }, [syllabus]);

  return (
    <div className="app-page">
      <div className="container py-0">
        {/* Modern Light Hero Section */}
        <motion.div 
          className="app-hero mb-4 shadow-sm overflow-hidden position-relative mt-0" 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
            borderLeft: '5px solid #2563eb',
            borderRadius: '24px',
            border: '1px solid rgba(37, 99, 235, 0.1)',
            padding: '24px 30px'
          }}
        >
          <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'radial-gradient(circle, rgba(239, 68, 68, 0.05) 0%, transparent 70%)', zIndex: 0 }} />
          
          <div className="row align-items-center position-relative" style={{ zIndex: 1 }}>
            <div className="col-lg-7">
              <div className="small mb-2 fw-800 text-uppercase tracking-wider" style={{ color: '#2563eb' }}>
                <FiAward className="me-2" /> Global Explorer Dashboard
              </div>
              <h1 className="h2 fw-900 text-dark mb-3">
                Elevate Your <span style={{ background: 'linear-gradient(to right, #2563eb, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Potential</span>
              </h1>
              <p className="text-secondary mb-0 fw-500">Welcome back! Manage your exams, batches, and progress here.</p>
            </div>
            <div className="col-lg-5">
              <div className="row g-3">
                <div className="col-6">
                  <div className="p-3 bg-white shadow-sm rounded-4 text-center border">
                    <div className="small text-muted fw-bold mb-1">LEADERBOARD RANK</div>
                    <div className="h4 fw-900 text-primary mb-0">{userStats.rank}</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 bg-white shadow-sm rounded-4 text-center border">
                    <div className="small text-muted fw-bold mb-1">EXAM PERFORMANCE</div>
                    <div className="h4 fw-900 text-danger mb-0">{userStats.examsAttempted} <span className="small opacity-50">/ {userStats.examsTotal}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="row g-4 mb-4">
           {/* Stat Overview Cards */}
           {[
             { label: "Active Batches", val: stats.batches, color: "#2563eb", icon: <FiBookOpen size={16}/> },
             { label: "Course Completion", val: `${stats.percentage}%`, color: "#ef4444", icon: <FiCheckCircle size={16}/> },
             { label: "Live Lectures Done", val: stats.completedLectures, color: "#1e293b", icon: <FiPlayCircle size={16}/> }
           ].map((s, idx) => (
             <div className="col-md-4" key={idx}>
               <div className="app-panel p-3 d-flex align-items-center gap-3 border-0 shadow-sm" style={{ background: '#fff', borderRadius: '20px' }}>
                 <div style={{ padding: '12px', background: `${s.color}15`, color: s.color, borderRadius: '15px' }}>{s.icon}</div>
                 <div>
                   <div className="small fw-800 text-muted text-uppercase">{s.label}</div>
                   <div className="h5 fw-900 mb-0" style={{ color: s.color }}>{s.val}</div>
                 </div>
               </div>
             </div>
           ))}
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="app-panel shadow-sm border-0 p-4 mb-4" style={{ background: '#fff', borderRadius: '28px' }}>
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h3 className="mb-0 fw-900 h4 text-dark d-flex align-items-center gap-2">
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiPlayCircle className="text-primary" size={18} />
                  </div>
                  Continue Watching
                </h3>
                <Link className="btn btn-sm rounded-pill px-4 fw-bold shadow-sm" to="/userdash/my-batches" 
                      style={{ background: 'linear-gradient(to right, #2563eb, #ef4444)', border: 'none', color: '#fff' }}>
                  Explore Batches
                </Link>
              </div>

              {loading ? (
                <div className="row g-3">
                  {[...Array(2)].map((_, i) => <div className="col-md-6" key={i}><SkeletonCard count={1} /></div>)}
                </div>
              ) : recentlyViewed.length ? (
                <div className="row g-3">
                  {recentlyViewed.slice(0, 2).map((item) => (
                    <div className="col-md-6" key={item._id}>
                      <motion.div className="app-mobile-card h-100 p-4 border rounded-4 d-flex flex-column justify-content-between" style={{ background: "#fff" }} whileHover={{ y: -5 }}>
                        <div>
                          <span className="badge mb-2 d-inline-flex align-items-center gap-1" style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}>
                            <FiClock size={10} /> {Math.floor((item.progress?.watchedTime || 0) / 60)} min
                          </span>
                          <h6 className="fw-900 text-dark text-truncate mb-1">{item.title}</h6>
                          <p className="smaller text-muted fw-600 mb-2">{(item.batchId?.batchName || "Batch")}</p>
                        </div>
                        <Link className="btn btn-sm w-100 rounded-3 fw-800" style={{ background: 'linear-gradient(to right, #2563eb, #ef4444)', color: '#fff' }} to={`/userdash/batch/${item.batchId?._id || item.batchId}`}>
                          Resume
                        </Link>
                      </motion.div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-light rounded-4"><FiPlayCircle size={30} className="mb-2 opacity-30"/><p className="small mb-0">No history found</p></div>
              )}
            </div>

            {/* Attendance Monthly Overview */}
            <div className="app-panel shadow-sm border-0 p-4" style={{ background: '#fff', borderRadius: '28px' }}>
              <h3 className="mb-4 fw-900 h4 text-dark d-flex align-items-center gap-2">
                 <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiCheckCircle className="text-success" size={18} />
                  </div>
                  Attendance History
              </h3>
              <div className="row g-3">
                {userStats.attendanceMonthly.length > 0 ? (
                  userStats.attendanceMonthly.map(([month, data], i) => (
                    <div className="col-md-3 col-6" key={i}>
                      <div className="p-3 border rounded-4 text-center">
                        <div className="small fw-800 text-muted mb-2">{month.toUpperCase()}</div>
                        <div className="h5 fw-900 text-dark mb-2">{Math.round((data.present / data.total) * 100)}%</div>
                        <div className="lb-meter-bg" style={{ height: 4 }}>
                           <div className="lb-meter-fill" style={{ width: `${(data.present / data.total) * 100}%`, background: '#10b981' }}></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12 text-center py-3 text-muted">Attendance records will be displayed here monthly.</div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="app-panel shadow-sm border-0 p-4" style={{ background: '#fff', borderRadius: '28px' }}>
              <h3 className="mb-4 fw-900 h4 text-dark d-flex align-items-center gap-2">
                 <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiBookOpen className="text-danger" size={18} />
                  </div>
                  Batch Roadmap
              </h3>

              {loading ? (
                <div className="d-grid gap-3">
                  {[...Array(3)].map((_, i) => <div key={i} className="app-skeleton" style={{ height: 80, borderRadius: 16 }}></div>)}
                </div>
              ) : (
                <div className="d-grid gap-3">
                  {syllabus.map((item) => {
                    const isOpen = openBatch === item.batch._id;
                    return (
                      <div key={item.batch._id} className="border rounded-4 overflow-hidden">
                        <button className="w-100 btn text-start p-3 d-flex align-items-center justify-content-between border-0 bg-white" onClick={() => setOpenBatch(isOpen ? "" : item.batch._id)}>
                          <div className="flex-grow-1">
                             <div className="fw-900 text-dark smaller mb-1 text-truncate" style={{ maxWidth: 180 }}>{item.batch.batchName}</div>
                             <div className="d-flex justify-content-between align-items-center">
                                <span className="smaller text-muted fw-700">{item.progressPercentage}% Done</span>
                             </div>
                          </div>
                          <FiChevronDown className="text-muted" style={{ transform: isOpen ? "rotate(180deg)" : "" }}/>
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="px-3 pb-3">
                               <div className="lb-meter-bg mb-3" style={{ height: 6 }}>
                                  <div className="lb-meter-fill" style={{ width: `${item.progressPercentage}%`, background: 'linear-gradient(to right, #2563eb, #ef4444)' }}></div>
                               </div>
                               {item.subjects.slice(0, 3).map(s => (
                                 <div key={s._id} className="smaller fw-700 d-flex justify-content-between p-2 mb-1 bg-light rounded-3">
                                   <span className="text-truncate" style={{ maxWidth: 150 }}>{s.title}</span>
                                   <span className="text-primary">{s.chapters.length} Mod</span>
                                 </div>
                               ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
