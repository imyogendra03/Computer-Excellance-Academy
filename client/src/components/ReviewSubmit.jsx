import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FiStar, FiCheckCircle, FiInfo, FiAlertCircle, FiSend, FiMessageSquare } from "react-icons/fi";

const API = import.meta.env.VITE_API_URL;

const ReviewSubmit = ({ batchId }) => {
  const token = localStorage.getItem("token");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [status, setStatus] = useState(null); // 'success' | 'error' | 'already'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setStatus("error"); setMessage("Please select a star rating."); return; }
    if (!reviewText.trim()) { setStatus("error"); setMessage("Please write your review."); return; }
    setLoading(true);
    try {
      await axios.post(
        `${API}/api/review`,
        { batchId, rating, reviewText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatus("success");
      setMessage("Your review has been submitted for moderation. Thank you for your feedback!");
      setRating(0);
      setReviewText("");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to submit review.";
      if (err.response?.status === 409) {
        setStatus("already");
        setMessage("You have already shared your experience for this batch.");
      } else {
        setStatus("error");
        setMessage(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (status === "success" || status === "already") {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="review-status-card mt-4">
        <style>{`
          .review-status-card { background: ${status === "success" ? "#f0fdf4" : "#eff6ff"}; border: 1px solid ${status === "success" ? "#bbf7d0" : "#dbeafe"}; border-radius: 24px; padding: 32px; text-align: center; }
          .status-icon { font-size: 3rem; margin-bottom: 16px; display: inline-block; }
        `}</style>
        <div className="status-icon">
          {status === "success" ? <FiCheckCircle className="text-success" /> : <FiInfo className="text-primary" />}
        </div>
        <h4 className="fw-black mb-2" style={{ color: status === "success" ? "#166534" : "#1e40af" }}>
          {status === "success" ? "Feedback Captured!" : "Review Already Exist"}
        </h4>
        <p className="mb-0 text-muted small">{message}</p>
      </motion.div>
    );
  }

  return (
    <div className="review-glass-card shadow-2xl mt-4">
      <style>{`
        .review-glass-card { background: #fff; border-radius: 32px; border: 1px solid #f1f5f9; padding: 32px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.05); }
        .star-btn { font-size: 2.5rem; background: none; border: none; cursor: pointer; color: #d1d5db; transition: 0.3s cubic-bezier(0.23,1,0.32,1); padding: 0 4px; }
        .star-active { color: #fbbf24; filter: drop-shadow(0 0 8px rgba(251,191,36,0.4)); transform: scale(1.15); }
        .review-textarea { width: 100%; padding: 20px; border-radius: 20px; border: 2px solid #f1f5f9; background: #f8fafc; outline: none; transition: 0.3s; font-size: 0.95rem; line-height: 1.6; resize: none; min-height: 140px; }
        .review-textarea:focus { border-color: #6366f1; background: #fff; box-shadow: 0 0 0 4px rgba(99,102,241,0.1); }
      `}</style>
      
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="p-2 bg-amber-50 rounded-4 text-amber-500 fs-4"><FiMessageSquare /></div>
        <h4 className="fw-black mb-0">Share Your Experience</h4>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="fw-bold small text-muted d-block mb-3 text-uppercase" style={{ letterSpacing: '1px' }}>Your Rating</label>
          <div className="d-flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <button type="button" key={star} className={`star-btn ${(hover || rating) >= star ? "star-active" : ""}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="fw-bold small text-muted d-block mb-3 text-uppercase" style={{ letterSpacing: '1px' }}>Your Feedback</label>
          <textarea
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            maxLength={1000}
            placeholder="What did you think about this batch? Your voice matters to us..."
            className="review-textarea"
          />
          <div className="text-end mt-2" style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8" }}>{reviewText.length} / 1000 CHARACTERS</div>
        </div>

        <AnimatePresence>
          {status === "error" && message && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-danger-subtle text-danger rounded-4 mb-4 d-flex align-items-center gap-3 small fw-bold">
              <FiAlertCircle /> {message}
            </motion.div>
          )}
        </AnimatePresence>

        <button type="submit" disabled={loading} className="btn w-100 py-3 fw-black rounded-4 d-flex align-items-center justify-content-center gap-2 shadow-lg" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', fontSize: '1rem' }}>
          {loading ? "Transmitting..." : <><FiSend /> Submit My Experience</>}
        </button>
      </form>
    </div>
  );
};

export default ReviewSubmit;
