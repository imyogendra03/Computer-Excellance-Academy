import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiBookOpen,
  FiCalendar,
  FiChevronRight,
  FiClock,
  FiFilter,
  FiSearch,
  FiShoppingCart,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { useSEO } from "../components/SEOHelmet";
import seoConfig from "../config/seoConfig";
import { cachedJsonFetch } from "../services/publicDataCache";
import MainNavbar from "../components/navigation/MainNavbar";
import LegacyFooter from "../components/layout/LegacyFooter";
import { SkeletonCard } from "../components/ui/SkeletonLoader";

const LEVELS = ["All", "Beginner", "Intermediate", "Advanced", "All Levels"];

const Course = () => {
  const navigate = useNavigate();
  useSEO(seoConfig.pages.courses);

  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("All");
  const [courses, setCourses] = useState([]);
  const [fetchingCourses, setFetchingCourses] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [buyingBatchId, setBuyingBatchId] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const levelColors = {
    Beginner: "#26b56f",
    Intermediate: "#f59e0b",
    Advanced: "#f0527a",
    "All Levels": "#7b3ff2",
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 2600);
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
      } catch {
        setCourses([]);
        showToast("Courses load nahi ho paaye.", "error");
      } finally {
        setFetchingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  const fetchBatchesByCourse = async (course) => {
    try {
      setSelectedCourse(course);
      setBatchModalOpen(true);
      setLoadingBatches(true);
      setBatches([]);
      const data = await cachedJsonFetch(
        `${import.meta.env.VITE_API_URL}/api/batch/course/${course._id}`,
        {
          cacheKey: `batches:course:${course._id}`,
          ttlMs: 2 * 60 * 1000,
        }
      );
      setBatches(Array.isArray(data?.data) ? data.data : []);
    } catch {
      showToast("Batches load nahi ho paaye.", "error");
    } finally {
      setLoadingBatches(false);
    }
  };

  const filtered = useMemo(() => {
    return courses.filter((course) => {
      const title = String(course.title || "").toLowerCase();
      const currentLevel = course.level || "Beginner";
      const searchMatch = title.includes(search.toLowerCase().trim());
      const levelMatch = level === "All" || currentLevel === level;
      return searchMatch && levelMatch;
    });
  }, [courses, search, level]);

  const handleBuyNow = async (batch) => {
    const token = localStorage.getItem("token") || localStorage.getItem("userToken");
    const userData = localStorage.getItem("userData");
    const latestUserId = localStorage.getItem("userId") || (userData ? JSON.parse(userData).id : null);

    if (!token) {
      showToast("Please login to purchase a batch.", "error");
      setTimeout(() => navigate("/login", { state: { from: "/course" } }), 700);
      return;
    }

    try {
      setBuyingBatchId(batch._id);
      const finalAmount =
        Number(batch.discountPrice || 0) > 0 ? Number(batch.discountPrice) : Number(batch.price || 0);

      const orderRes = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: finalAmount, batchId: batch._id }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData?.order?.id) {
        throw new Error(orderData?.message || "Order create nahi hua");
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: "INR",
        name: "Computer Excellence Academy",
        description: `${batch.batchName} - Enrollment`,
        order_id: orderData.order.id,
        handler: async (response) => {
          try {
            const verifyRes = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: latestUserId,
                batchId: batch._id,
                amount: finalAmount,
              }),
            });
            if (!verifyRes.ok) throw new Error("Payment verification failed");
            showToast("Enrollment successful! Access batches from your dashboard.");
            setTimeout(() => {
              setBatchModalOpen(false);
              navigate("/userdash/my-batches");
            }, 1000);
          } catch (error) {
            showToast(error.message, "error");
          }
        },
        prefill: {
          name: localStorage.getItem("userName") || "",
          email: localStorage.getItem("userEmail") || "",
        },
        theme: { color: "#7b3ff2" },
        modal: { ondismiss: () => setBuyingBatchId("") },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setBuyingBatchId("");
    }
  };

  return (
    <div className="legacy-page">
      <MainNavbar />

      {toast.show && (
        <div
          style={{
            position: "fixed",
            top: 18,
            right: 18,
            zIndex: 9999,
            minWidth: 260,
            maxWidth: 360,
            borderRadius: 14,
            color: "#fff",
            padding: "12px 14px",
            background:
              toast.type === "error"
                ? "linear-gradient(135deg,#f0527a,#ea2f5f)"
                : "linear-gradient(135deg,#7b3ff2,#f21f85)",
            boxShadow: "0 14px 28px rgba(22,14,50,.35)",
          }}
        >
          <div className="d-flex justify-content-between align-items-center gap-2">
            <span className="small fw-semibold">{toast.message}</span>
            <button
              onClick={() => setToast({ show: false, message: "", type: "success" })}
              style={{ border: 0, background: "transparent", color: "#fff" }}
            >
              <FiX />
            </button>
          </div>
        </div>
      )}

      <section className="legacy-hero">
        <div className="container legacy-hero-inner">
          <span className="legacy-pill dark">Choose Course - Select Batch - Start Learning</span>
          <h1 className="legacy-hero-title">
            Explore <span className="accent">Courses</span> and Join the Right Batch
          </h1>
          <p className="legacy-hero-subtitle">
            Learn practical skills from basic to advanced with guided classes, notes,
            and certification support.
          </p>
        </div>
      </section>

      <section className="legacy-section" style={{ paddingTop: 34 }}>
        <div className="container">
          <div className="legacy-card mb-4">
            <div className="legacy-card-body">
              <div className="row g-3 align-items-center">
                <div className="col-lg-6">
                  <div className="position-relative">
                    <FiSearch className="position-absolute" style={{ left: 14, top: 14, color: "#8c7ba9" }} />
                    <input
                      className="legacy-input ps-5"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search your course..."
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
                    {LEVELS.map((lvl) => (
                      <button
                        key={lvl}
                        className="legacy-btn"
                        style={{
                          padding: "9px 14px",
                          border: "1px solid #e8ddff",
                          background: level === lvl ? "linear-gradient(135deg,#7b3ff2,#f21f85)" : "#fff",
                          color: level === lvl ? "#fff" : "#5f4e86",
                        }}
                        onClick={() => setLevel(lvl)}
                      >
                        <FiFilter className="me-1" />
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {fetchingCourses ? (
              <div className="col-12">
                <SkeletonCard count={6} dark={false} />
              </div>
            ) : filtered.length === 0 ? (
              <div className="col-12">
                <div className="legacy-card">
                  <div className="legacy-card-body text-center py-5">
                    <h5 className="fw-bold mb-1">No course found</h5>
                    <p className="legacy-mini mb-0">Try changing level filter or search keyword.</p>
                  </div>
                </div>
              </div>
            ) : (
              filtered.map((course, index) => {
                const accentColor = levelColors[course.level] || "#7b3ff2";
                return (
                  <div key={course._id || index} className="col-lg-4 col-md-6">
                    <motion.div whileHover={{ y: -6 }} className="legacy-card legacy-grid-hover h-100">
                      <div className="legacy-card-body d-flex flex-column h-100">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="legacy-icon-box">
                            <FiBookOpen />
                          </div>
                          <span
                            className="px-2 py-1 rounded-pill small fw-semibold"
                            style={{
                              background: `${accentColor}18`,
                              color: accentColor,
                              border: `1px solid ${accentColor}3d`,
                            }}
                          >
                            {course.level || "Beginner"}
                          </span>
                        </div>
                        <h5 className="fw-bold mb-2">{course.title}</h5>
                        <p className="legacy-mini mb-3">
                          {course.shortDescription || "Industry-ready skill path with practical classes."}
                        </p>
                        <div className="legacy-mini mb-4 d-flex flex-wrap gap-3">
                          <span>
                            <FiClock className="me-1" />
                            {course.duration || "Flexible"}
                          </span>
                          <span>
                            <FiBookOpen className="me-1" />
                            {course.lessons || 12} Lessons
                          </span>
                        </div>
                        <button
                          className="legacy-btn primary w-100 mt-auto"
                          onClick={() => fetchBatchesByCourse(course)}
                        >
                          View Batches <FiChevronRight className="ms-1" />
                        </button>
                      </div>
                    </motion.div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {batchModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setBatchModalOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 2600,
              background: "rgba(8,4,26,.78)",
              backdropFilter: "blur(8px)",
              padding: 18,
              display: "grid",
              placeItems: "center",
            }}
          >
            <motion.div
              initial={{ y: 26, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 26, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
              style={{
                width: "min(860px,100%)",
                maxHeight: "90vh",
                overflowY: "auto",
                borderRadius: 24,
                background: "#fff",
              }}
            >
              <div
                style={{
                  padding: "20px 22px",
                  color: "#fff",
                  background: "linear-gradient(135deg,#7b3ff2,#f21f85)",
                  borderRadius: "24px 24px 0 0",
                }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="fw-bold mb-1">{selectedCourse?.title}</h5>
                    <div className="small opacity-75">Choose a batch to continue enrollment.</div>
                  </div>
                  <button
                    className="btn btn-light rounded-circle d-grid place-items-center"
                    style={{ width: 36, height: 36 }}
                    onClick={() => setBatchModalOpen(false)}
                  >
                    <FiX />
                  </button>
                </div>
              </div>

              <div className="p-4">
                {loadingBatches ? (
                  <div className="text-center py-5">
                    <div className="spinner-border" role="status" />
                    <p className="legacy-mini mt-3 mb-0">Loading batches...</p>
                  </div>
                ) : batches.length === 0 ? (
                  <div className="legacy-card">
                    <div className="legacy-card-body text-center">
                      <h6 className="fw-bold mb-1">No active batch available</h6>
                      <p className="legacy-mini mb-0">Please check again later.</p>
                    </div>
                  </div>
                ) : (
                  <div className="d-grid gap-3">
                    {batches.map((batch) => (
                      <div key={batch._id} className="legacy-card">
                        <div className="legacy-card-body">
                          <div className="row g-3 align-items-center">
                            <div className="col-md-7">
                              <h6 className="fw-bold mb-1">{batch.batchName}</h6>
                              <div className="legacy-mini d-flex flex-wrap gap-3">
                                <span>
                                  <FiCalendar className="me-1" />
                                  Starts: {batch.startDate ? new Date(batch.startDate).toLocaleDateString() : "-"}
                                </span>
                                <span>
                                  <FiUsers className="me-1" />
                                  Limited seats
                                </span>
                              </div>
                            </div>
                            <div className="col-md-5 text-md-end">
                              <div className="mb-2">
                                <span className="fw-bold fs-5 text-primary">
                                  INR {batch.discountPrice || batch.price}
                                </span>
                                {batch.discountPrice ? (
                                  <span className="text-muted text-decoration-line-through ms-2 small">
                                    INR {batch.price}
                                  </span>
                                ) : null}
                              </div>
                              <button
                                className="legacy-btn primary"
                                style={{ width: "100%", maxWidth: 220 }}
                                onClick={() => navigate(`/batch-preview/${batch._id}`)}
                              >
                                <FiShoppingCart className="me-1" />
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <LegacyFooter />
    </div>
  );
};

export default Course;
