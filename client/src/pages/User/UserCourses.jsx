import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiBookOpen, FiSearch, FiTag, FiClock, FiUsers, FiArrowRight, FiShoppingCart, FiZap, FiInfo, FiCheck, FiX, FiLayers, FiActivity, FiBriefcase } from "react-icons/fi";
import { cachedJsonFetch } from "../../services/publicDataCache";
import { SkeletonCard } from "../../components/ui/SkeletonLoader";
import AppToast from "../../components/ui/AppToast";
import "../../components/ui/app-ui.css";

const UserCourses = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const userEmail = localStorage.getItem("userEmail");
  const userName = localStorage.getItem("userName");

  const [courses, setCourses] = useState([]);
  const [fetchingCourses, setFetchingCourses] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [buyingBatchId, setBuyingBatchId] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 2500);
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setFetchingCourses(true);
        const data = await cachedJsonFetch(`${import.meta.env.VITE_API_URL}/api/course`, {
          cacheKey: "courses:public",
          ttlMs: 5 * 60 * 1000,
        });
        setCourses(Array.isArray(data?.data) ? data.data : []);
      } catch (error) {
        showToast("System error retrieving course archive.", "error");
      } finally {
        setFetchingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  const fetchBatches = async (course) => {
    try {
      setSelectedCourse(course);
      setBatchModalOpen(true);
      setLoadingBatches(true);
      setBatches([]);
      const data = await cachedJsonFetch(`${import.meta.env.VITE_API_URL}/api/batch/course/${course._id}`, {
        cacheKey: `batches:course:${course._id}`,
        ttlMs: 2 * 60 * 1000,
      });
      setBatches(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      showToast("Sync failure retrieving batch data.", "error");
    } finally {
      setLoadingBatches(false);
    }
  };

  const filtered = useMemo(() => courses.filter((c) => String(c.title || "").toLowerCase().includes(search.toLowerCase())), [courses, search]);

  return (
    <div className="app-page">
      <AppToast toast={toast} onClose={() => setToast({ show: false, message: "", type: "success" })} />
      <div className="container">
        
        {/* Hero Section */}
        <div className="app-hero mb-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <h2 className="fw-bold mb-2">Explore Courses</h2>
              <p className="mb-0">Discover professional certification tracks designed for career excellence.</p>
            </div>
            <div className="col-lg-4">
              <div className="app-search">
                <FiSearch className="app-search__icon" />
                <input type="text" className="form-control app-input" placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="row g-4 mb-5">
          {fetchingCourses ? (
            <div className="col-12"><SkeletonCard count={6} /></div>
          ) : (
            filtered.map((c, i) => (
              <motion.div key={c._id} className="col-xl-4 col-md-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="app-mobile-card h-100 d-flex flex-column clickable" style={{ cursor: "pointer" }} onClick={() => fetchBatches(c)}>
                  <div className="p-4 text-center mb-3" style={{ background: "#f8fafc", borderRadius: 16, fontSize: "3rem" }}>{c.icon || "🎓"}</div>
                  <div className="app-badge mb-2">{c.category || "General"}</div>
                  <h5 className="fw-bold mb-2">{c.title}</h5>
                  <p className="text-muted small mb-4 flex-grow-1">{c.shortDescription || "Master professional concepts with our industry-led module."}</p>
                  <div className="pt-3 border-top d-flex gap-3 align-items-center">
                    <small className="fw-bold text-muted d-flex align-items-center gap-1"><FiClock size={14} /> {c.duration || "Self-Paced"}</small>
                    <small className="fw-bold text-muted d-flex align-items-center gap-1"><FiLayers size={14} /> {c.level || "Foundation"}</small>
                    <small className="ms-auto fw-bold text-primary">View →</small>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {batchModalOpen && (
          <motion.div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(12px)", zIndex: 1200, display: "grid", placeItems: "center", padding: "20px" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setBatchModalOpen(false)}>
            <motion.div className="app-panel" style={{ maxWidth: 600, width: "100%" }} initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={e => e.stopPropagation()}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div>
                    <div className="app-badge mb-2">DEPLOYMENT SELECTOR</div>
                    <h4 className="fw-bold mb-0">{selectedCourse?.title}</h4>
                  </div>
                  <button className="btn btn-light rounded-circle" onClick={() => setBatchModalOpen(false)}><FiX /></button>
                </div>

                {loadingBatches ? (
                  <div className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary" /></div>
                ) : batches.length === 0 ? (
                  <div className="py-5 text-center text-muted small">No active batches found for this module.</div>
                ) : (
                  <div className="space-y-3">
                    {batches.map(b => (
                      <div key={b._id} className="p-3 border-bottom d-flex justify-content-between align-items-center" style={{ background: "#f8fafc", borderRadius: 12 }}>
                        <div>
                          <h6 className="fw-bold mb-1">{b.batchName}</h6>
                          <div className="d-flex gap-2 align-items-center">
                            <span className="fw-bold text-primary h5 mb-0">₹{(b.discountPrice || b.price).toLocaleString()}</span>
                            <span className="app-badge bg-info">{b.mode}</span>
                          </div>
                        </div>
                        <button className="app-btn-primary btn btn-sm" onClick={() => navigate(`/batch-preview/${b._id}`)}><FiShoppingCart size={16} className="me-1" /> View</button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 p-3 bg-info-subtle rounded-3 d-flex gap-2 align-items-start">
                  <FiInfo size={18} className="text-info flex-shrink-0 mt-1" />
                  <small className="text-info fw-bold">All enrollments include lifetime access and digital certification upon completion.</small>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserCourses;
