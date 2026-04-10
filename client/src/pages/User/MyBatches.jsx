import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FiBookOpen, FiCalendar, FiClock, FiLayers, FiPlayCircle, FiSearch, FiCheckCircle } from "react-icons/fi";
import { SkeletonTable, SkeletonCard } from "../../components/ui/SkeletonLoader";
import AppToast from "../../components/ui/AppToast";
import "../../components/ui/app-ui.css";

const MyBatches = () => {
  const storedUserData = localStorage.getItem("userData");
  const parsedUser = storedUserData ? JSON.parse(storedUserData) : null;
  const userId = localStorage.getItem("userId") || parsedUser?.id || parsedUser?._id;

  const [batches, setBatches] = useState([]);
  const [search, setSearch] = useState("");
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 2500);
  };

  const fetchMyBatches = async () => {
    try {
      setFetching(true);
      const token = localStorage.getItem("token") || localStorage.getItem("userToken");
      if (!token || !userId) {
        showToast("Please login to see your batches", "error");
        return;
      }
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/examinee/${userId}/my-batches`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBatches(res?.data?.data || []);
    } catch (error) {
      showToast("Failed to load batches", "error");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (userId) fetchMyBatches();
    else setFetching(false);
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
    return isNaN(date.getTime()) ? value : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="app-page">
      <AppToast toast={toast} onClose={() => setToast({ show: false, message: "", type: "success" })} />
      <div className="container">
        
        {/* Hero Section */}
        <div className="app-hero mb-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <h2 className="fw-bold mb-2">My Batches</h2>
              <p className="mb-0">Continue your learning journey. All your enrolled batches in one place.</p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <div className="app-stat-card">
                <div className="app-label-muted">Active Batches</div>
                <h4 className="fw-bold mb-0">{fetching ? "..." : filteredBatches.length}</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Main Panel */}
        <div className="app-panel">
          <div className="card-body p-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
              <div>
                <h4 className="fw-bold mb-1">Purchased Batches</h4>
                <p className="text-muted mb-0">Manage and access your courses below.</p>
              </div>
              <div className="app-search">
                <FiSearch className="app-search__icon" />
                <input type="text" className="form-control app-input" placeholder="Search batches..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>

            {fetching ? (
              <SkeletonCard count={3} />
            ) : filteredBatches.length === 0 ? (
              <div className="text-center py-5">
                <div style={{ fontSize: 48, opacity: 0.2, marginBottom: 16 }}>📚</div>
                <h5 className="fw-bold mb-2">No batches found</h5>
                <p className="text-muted mb-3">You haven't enrolled in any batches yet.</p>
                <Link to="/course" className="app-btn-primary btn btn-sm">Browse Courses</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredBatches.map((item, i) => (
                  <div key={item.batch?._id || i} className="p-4" style={{ background: "#f8fafc", borderRadius: 16, border: "1px solid #e2e8f0" }}>
                    <div className="row align-items-center g-3">
                      <div className="col-lg-4">
                        <div className="d-flex align-items-center gap-3">
                          <div className="p-3 bg-primary-subtle rounded-3 text-primary"><FiLayers size={24} /></div>
                          <div>
                            <div className="app-badge bg-info mb-2">{item.batch?.mode || "Online"}</div>
                            <h6 className="fw-bold mb-0">{item.batch?.batchName || "Special Batch"}</h6>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-3">
                        <div className="small text-muted mb-1">COURSE</div>
                        <div className="fw-bold">{item.course?.title || "N/A"}</div>
                      </div>
                      <div className="col-lg-2">
                        <div className="small text-muted mb-1">STATUS</div>
                        <span className={`app-badge ${item.accessStatus === "active" ? "bg-success" : "bg-danger"}`}>{item.accessStatus?.toUpperCase() || "ACTIVE"}</span>
                      </div>
                      <div className="col-lg-3 text-lg-end">
                        {item.accessStatus === "active" ? (
                          <Link to={`/userdash/batch/${item.batch?._id}`} className="app-btn-primary btn btn-sm">
                            <FiPlayCircle className="me-1" size={16} /> Start
                          </Link>
                        ) : (
                          <span className="text-danger fw-bold small">Access Revoked</span>
                        )}
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
  );
};

export default MyBatches;
