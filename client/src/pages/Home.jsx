import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  FiArrowRight,
  FiBookOpen,
  FiCode,
  FiDatabase,
  FiFileText,
  FiPhoneCall,
  FiStar,
  FiTrendingUp,
  FiUsers,
  FiSend,
} from "react-icons/fi";
import { useSEO } from "../components/SEOHelmet";
import seoConfig from "../config/seoConfig";
import MainNavbar from "../components/navigation/MainNavbar";
import LegacyFooter from "../components/layout/LegacyFooter";
import { cachedJsonFetch } from "../services/publicDataCache";
import { SkeletonCard } from "../components/ui/SkeletonLoader";
import AppToast from "../components/ui/AppToast";

const courseIcons = [FiBookOpen, FiCode, FiDatabase, FiTrendingUp];

const Home = () => {
  useSEO(seoConfig.pages.home);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  
  // Review Form State
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const [countTargets, setCountTargets] = useState({
    students: 15000,
    courses: 24,
    notes: 500,
    support: 10000,
  });
  const [counts, setCounts] = useState({ students: 0, courses: 0, notes: 0, support: 0 });
  const [statsVisible, setStatsVisible] = useState(false);
  const [activeReview, setActiveReview] = useState(0);
  const [liveReaders, setLiveReaders] = useState(127);
  const statsRef = useRef(null);

  const isLoggedIn = Boolean(localStorage.getItem("token") || localStorage.getItem("userData"));

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 2500);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStatsVisible(true);
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [courseData, reviewData] = await Promise.all([
          cachedJsonFetch(`${import.meta.env.VITE_API_URL}/api/course`, {
            cacheKey: "courses:home",
            ttlMs: 5 * 60 * 1000,
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/review/approved`).then(r => r.data?.data)
        ]);

        const list = Array.isArray(courseData?.data) ? courseData.data : [];
        setCourses(list.slice(0, 6));
        setCountTargets((prev) => ({ ...prev, courses: list.length || prev.courses }));
        
        if (reviewData && reviewData.length > 0) {
          setReviews(reviewData);
        } else {
          setReviews([
            { student: { name: "Nepali Sangeet" }, reviewText: "The teaching quality is exceptional. The certificate I received has already helped me in interviews.", rating: 5, createdAt: new Date() },
            { student: { name: "Kalyan Lohar" }, reviewText: "Classes are easy to understand and support team is always active. Best free learning platform for beginners.", rating: 5, createdAt: new Date() },
            { student: { name: "Lavanya T." }, reviewText: "I started from basics and now I can build projects confidently. Notes and classes are both very helpful.", rating: 4, createdAt: new Date() }
          ]);
        }
      } catch {
        setCourses([]);
      } finally {
        setLoadingCourses(false);
        setLoadingReviews(false);
      }
    };
    fetchHomeData();
  }, []);

  useEffect(() => {
    if (!statsVisible) return;
    const duration = 1800;
    const steps = 55;
    let step = 0;
    const timer = setInterval(() => {
      step += 1;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3);
      setCounts({
        students: Math.floor(countTargets.students * ease),
        courses: Math.floor(countTargets.courses * ease),
        notes: Math.floor(countTargets.notes * ease),
        support: Math.floor(countTargets.support * ease),
      });
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [statsVisible, countTargets]);

  useEffect(() => {
    if (reviews.length === 0) return;
    const interval = setInterval(() => {
      setActiveReview((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [reviews]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveReaders((prev) => {
        const delta = Math.floor(Math.random() * 5) - 1;
        return Math.max(80, prev + delta);
      });
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      showToast("Please login to write a review", "error");
      return;
    }
    if (!reviewText.trim()) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token") || localStorage.getItem("userToken");
      await axios.post(`${import.meta.env.VITE_API_URL}/api/review`, {
        rating,
        reviewText: reviewText.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast("Review submitted! Admin approval pending.");
      setReviewText("");
      setRating(5);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to submit review", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const stats = [
    { 
      icon: FiUsers, 
      value: `${counts.students.toLocaleString()}+`, 
      label: "Happy Students",
      color: "#7c3cf0",
      bgColor: "rgba(124, 60, 240, 0.15)"
    },
    { 
      icon: FiBookOpen, 
      value: `${counts.courses}+`, 
      label: "Free Courses",
      color: "#f59e0b",
      bgColor: "rgba(245, 158, 11, 0.15)"
    },
    { 
      icon: FiFileText, 
      value: `${counts.notes}+`, 
      label: "PDF Notes",
      color: "#06b6d4",
      bgColor: "rgba(6, 182, 212, 0.15)"
    },
    { 
      icon: FiPhoneCall, 
      value: `${counts.support.toLocaleString()}+`, 
      label: "Queries Resolved",
      color: "#ec4899",
      bgColor: "rgba(236, 72, 153, 0.15)"
    },
  ];

  return (
    <div className="legacy-page">
      <AppToast toast={toast} onClose={() => setToast({ show: false, message: "", type: "success" })} />
      <MainNavbar />

      <section className="legacy-hero">
        <div className="container legacy-hero-inner">
          <span className="legacy-pill dark">India&apos;s #1 Free Computer Learning Platform</span>
          <h1 className="legacy-hero-title legacy-shimmer-text">
            Learn Computer Skills <span className="accent">Free</span> with Expert Guidance
          </h1>
          <p className="legacy-hero-subtitle">
            Join 15,000+ students mastering digital skills from scratch to advanced levels.
            Get certified, get ahead, with live support every step of the way.
          </p>
          <div className="legacy-actions">
            <button className="legacy-btn primary" onClick={() => navigate("/register")}>
              Start Learning Free
            </button>
            <button className="legacy-btn ghost" onClick={() => navigate("/courses")}>
              View All Courses
            </button>
          </div>
          <div className="mt-3 d-inline-flex align-items-center gap-2 legacy-float" style={{ color: "#d8ccff", fontWeight: 600 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#38d39f", display: "inline-block" }} />
            {liveReaders} students are reading notes right now
          </div>
        </div>
      </section>

      <section className="legacy-section" ref={statsRef}>
        <div className="container">
          <div className="row g-4">
            {stats.map((item) => (
              <div className="col-md-3 col-6" key={item.label}>
                <motion.div 
                  className="legacy-card legacy-grid-hover h-100"
                  whileHover={{ y: -12, scale: 1.05, boxShadow: "0 30px 50px rgba(124, 60, 240, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="legacy-card-body text-center">
                    <motion.div 
                      className="legacy-icon-box mx-auto"
                      style={{
                        width: 64,
                        height: 64,
                        backgroundColor: item.bgColor,
                        color: item.color,
                        fontSize: "1.8rem"
                      }}
                      whileHover={{ rotate: 10, scale: 1.15 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <item.icon />
                    </motion.div>
                    <motion.div 
                      className="legacy-counter"
                      style={{ color: item.color }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      viewport={{ once: true }}
                    >
                      {item.value}
                    </motion.div>
                    <div className="legacy-mini fw-semibold">{item.label}</div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="legacy-section soft">
        <div className="container">
          <div className="legacy-head">
            <span className="legacy-pill light">Browse By Category</span>
            <h2>Explore Course Categories</h2>
            <p>From basics to advanced, we have a course for every skill level and career goal.</p>
          </div>
          <div className="row g-4">
            {loadingCourses ? (
              <div className="col-12">
                <SkeletonCard count={6} dark={false} />
              </div>
            ) : courses.length === 0 ? (
              <div className="col-12 text-center text-muted py-4">Courses are coming soon.</div>
            ) : (
              courses.map((course, index) => {
                const Icon = courseIcons[index % courseIcons.length];
                return (
                  <div className="col-lg-4 col-md-6" key={course._id || index}>
                    <motion.div
                      whileHover={{ y: -6 }}
                      className="legacy-card legacy-grid-hover h-100"
                      onClick={() => navigate("/courses")}
                      role="button"
                    >
                      <div className="legacy-card-body">
                        <div className="legacy-icon-box mb-3">
                          <Icon />
                        </div>
                        <h5 className="fw-bold mb-2">{course.title}</h5>
                        <p className="legacy-mini mb-3">
                          {course.shortDescription || "Practical learning with guided modules."}
                        </p>
                        <button className="legacy-btn primary w-100">
                          Explore <FiArrowRight className="ms-2" />
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

      {/* Testimonials Section */}
      <section className="legacy-section">
        <div className="container">
          <div className="legacy-head">
            <span className="legacy-pill light">Testimonials</span>
            <h2>What Our Students Say</h2>
            <p>Real stories from learners who transformed their careers with CEA.</p>
          </div>
          {loadingReviews ? (
            <div className="text-center py-5">Loading testimonials...</div>
          ) : (
            <div className="mx-auto" style={{ maxWidth: 760 }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeReview}
                  className="legacy-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                >
                  <div className="legacy-card-body text-center py-5">
                    <div
                      className="mx-auto mb-3 d-inline-flex align-items-center justify-content-center"
                      style={{
                        width: 70,
                        height: 70,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg,#7c3cf0,#f11f84)",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 22,
                      }}
                    >
                      {(reviews[activeReview]?.student?.name || "S").charAt(0)}
                    </div>
                    <div className="mb-3 text-warning">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} fill={i < (reviews[activeReview]?.rating || 5) ? "currentColor" : "none"} />
                      ))}
                    </div>
                    <p className="mb-3 px-md-5" style={{ color: "#3d2f66", lineHeight: 1.8 }}>
                      "{reviews[activeReview]?.reviewText}"
                    </p>
                    <div className="fw-bold">{reviews[activeReview]?.student?.name || "Anonymous"}</div>
                    <div className="legacy-mini">
                      {reviews[activeReview]?.batch?.batchName || "Academy Enthusiast"} • {new Date(reviews[activeReview]?.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className="d-flex justify-content-center gap-2 mt-3">
                {reviews.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveReview(idx)}
                    style={{
                      width: idx === activeReview ? 22 : 8,
                      height: 8,
                      border: 0,
                      borderRadius: 20,
                      background: idx === activeReview ? "#7f42f2" : "#d8caef",
                      transition: "all .2s ease",
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Review Submission Section */}
      <section className="legacy-section soft">
        <div className="container" style={{ maxWidth: 1100 }}>
          <div className="legacy-card shadow-lg" style={{ borderRadius: 28, overflow: 'hidden' }}>
            <div className="row g-0">
              <div className="col-md-5 p-4 text-white d-flex flex-column justify-content-center" style={{ background: 'linear-gradient(135deg, #7b3ff2 0%, #4f46e5 100%)' }}>
                <h3 className="fw-bold mb-3">Rate Our Academy</h3>
                <p className="mb-4 small" style={{ opacity: 0.9 }}>Your feedback helps us improve and inspire thousands of other learners across India.</p>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <FiUsers size={20} /> <span>15k+ Students</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <FiStar size={20} /> <span>4.9/5 Average Rating</span>
                </div>
              </div>
              <div className="col-md-7 p-4 bg-white">
                <form onSubmit={handleReviewSubmit}>
                  <div className="mb-4">
                    <label className="form-label fw-bold small text-muted text-uppercase mb-2">Rate Your Experience</label>
                    <div className="d-flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar
                          key={star}
                          size={28}
                          role="button"
                          onClick={() => setRating(star)}
                          style={{ 
                            cursor: 'pointer', 
                            color: star <= rating ? '#f59e0b' : '#e2e8f0',
                            fill: star <= rating ? '#f59e0b' : 'none',
                            transition: 'all 0.2s'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-bold small text-muted text-uppercase mb-2">Write Your Thoughts</label>
                    <textarea 
                      className="form-control border-0 bg-light p-3" 
                      rows="3" 
                      placeholder="What did you learn? How was our support?"
                      style={{ borderRadius: 16, fontSize: '0.95rem' }}
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    className="legacy-btn primary w-100 d-flex align-items-center justify-content-center gap-2"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : <><FiSend /> Submit Review</>}
                  </button>
                  {!isLoggedIn && (
                    <p className="mt-2 text-center small text-danger fw-bold">Please login to submit a review.</p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          background: "linear-gradient(135deg,#7b3ff2 0%,#f21f85 100%)",
          color: "#fff",
          padding: "64px 0",
          textAlign: "center",
        }}
      >
        <div className="container">
          <h2 className="mb-3" style={{ fontFamily: "Playfair Display, serif", fontSize: "2.2rem" }}>
            Ready to Start Your Digital Journey?
          </h2>
          <p className="mb-4">Join thousands of learners. No fees. No barriers. Just knowledge.</p>
          <button className="legacy-btn ghost" onClick={() => navigate("/register")}>
            Create Free Account
          </button>
        </div>
      </section>

      <LegacyFooter />
    </div>
  );
};

export default Home;
