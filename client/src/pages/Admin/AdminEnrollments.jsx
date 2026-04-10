import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheck, FiX, FiUser, FiBook, FiClock, FiAlertCircle, FiActivity, FiUserCheck, FiUserX, FiTarget, FiMail, FiPhone } from "react-icons/fi";
import { SkeletonTable, SkeletonStats } from "../../components/ui/SkeletonLoader";
import AppToast from "../../components/ui/AppToast";
import "../../components/ui/app-ui.css";

const AdminEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const adminToken = localStorage.getItem("adminToken");

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 2500);
  };

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/examinee`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      
      const pendingOnes = [];
      res.data?.data?.forEach(user => {
        user.purchasedBatches?.forEach(pb => {
          if (pb.accessStatus === "pending") {
            pendingOnes.push({
              userId: user._id,
              userName: user.name,
              userEmail: user.email,
              userNumber: user.number,
              batchId: pb.batch?._id || pb.batch,
              batchName: pb.batch?.batchName || "Unknown Batch",
              courseName: pb.course?.title || "Unknown Course",
              enrolledAt: pb.enrolledAt,
              accessType: pb.accessType
            });
          }
        });
      });
      setEnrollments(pendingOnes);
    } catch (err) {
      showToast("Sync Error: Failed to retrieve requests", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEnrollments(); }, []);

  const handleAction = async (userId, batchId, action) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/examinee/${userId}/batch-access`, {
        batchId,
        accessStatus: action === "approve" ? "active" : "rejected"
      }, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      showToast(`Protocol: Enrollment ${action}d successfully`);
      fetchEnrollments();
    } catch (err) {
      showToast("Terminal Error: Action failed", "error");
    }
  };

  return (
    <div className="app-page">
      <div className="container">
        <AppToast toast={toast} onClose={() => setToast({ show: false, message: "", type: "success" })} />

        <div className="app-hero mb-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <h2 className="fw-bold mb-2">Access Gatekeeper</h2>
              <p className="mb-0" style={{ opacity: 0.88 }}>
                Authorize student batch deployments and verify transaction authenticity.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
               <div style={{ background: "rgba(0,0,0,0.05)", borderRadius: 16, padding: "12px 20px", display: "inline-block" }}>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>PENDING QUEUE</div>
                  <div className="fw-bold" style={{ fontSize: 24 }}>{enrollments.length}</div>
               </div>
            </div>
          </div>
        </div>

        <div className="mt-5">
           <AnimatePresence>
            {loading ? (
              <div className="row g-4">
                 {[1,2,3].map(i => <div key={i} className="col-12"><SkeletonTable rows={1} cols={4} /></div>)}
              </div>
            ) : enrollments.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-5 bg-white rounded-5 shadow-sm border">
                 <div style={{ fontSize: "3rem", opacity: 0.2, marginBottom: 16 }}><FiUserCheck /></div>
                 <h3 className="fw-bold text-dark">Registry Synchronized</h3>
                 <p className="text-muted fw-bold">No pending authorization requests detected in the queue.</p>
              </motion.div>
            ) : (
              <div className="row g-3">
                {enrollments.map((en, idx) => (
                  <div className="col-12" key={`${en.userId}-${en.batchId}`}>
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: idx * 0.05 }}
                      className="app-mobile-card"
                    >
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <div style={{ width: 40, height: 40, background: '#eef2ff', color: '#6366f1', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FiUser />
                        </div>
                        <div>
                          <h5 className="fw-bold mb-0">{en.userName}</h5>
                          <div className="small text-muted">{en.userEmail}</div>
                        </div>
                      </div>
                      
                      <div className="bg-light rounded-3 p-3 mb-3">
                        <div className="small fw-bold text-primary mb-1">BATCH</div>
                        <div className="small text-muted">{en.batchName}</div>
                        <div className="small text-muted">{en.courseName}</div>
                      </div>

                      <div className="d-flex gap-2">
                        <button onClick={() => handleAction(en.userId, en.batchId, "reject")} className="app-btn-soft flex-grow-1">
                          <FiUserX className="me-1" style={{ display: 'inline' }} /> Reject
                        </button>
                        <button onClick={() => handleAction(en.userId, en.batchId, "approve")} className="app-btn-primary flex-grow-1">
                          <FiUserCheck className="me-1" style={{ display: 'inline' }} /> Approve
                        </button>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminEnrollments;
