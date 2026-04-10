import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { FiMail, FiLock, FiArrowRight, FiCheckCircle, FiChevronLeft, FiKey, FiEye, FiEyeOff, FiX } from "react-icons/fi";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  const validatePassword = (pw) => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return re.test(pw);
  };

  const sendOtp = async () => {
    if (!email.includes("@")) {
      showToast("Please enter a valid registered email.", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${apiUrl}/api/auth/forgot-init`, { email: email.trim() });
      if (res?.data?.debugOtp) { setOtp(res.data.debugOtp); }
      setStep(2);
      showToast(res?.data?.message || "OTP sent to your email.");
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to send OTP.", "error");
    } finally { setLoading(false); }
  };

  const resetPassword = async () => {
    if (!otp || otp.length < 4) { showToast("Please enter the OTP.", "error"); return; }
    if (!password || password.length < 8) { showToast("Password must be at least 8 characters.", "error"); return; }
    if (!validatePassword(password)) {
      showToast("Include uppercase, lowercase and a number.", "error");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${apiUrl}/api/auth/forgot-complete`, {
        email: email.trim(),
        otp: otp.trim(),
        newPassword: password,
      });
      showToast("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      showToast(err?.response?.data?.message || "Reset failed.", "error");
    } finally { setLoading(false); }
  };

  return (
    <div className="legacy-auth-page">
      {toast.show && (
        <div
          style={{
            position: "fixed",
            top: 18,
            right: 18,
            zIndex: 9999,
            minWidth: 260,
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

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="legacy-auth-card">
        <div className="legacy-auth-side">
          <div className="d-flex align-items-center gap-2 mb-4">
            <img src="/cea-logo.png" alt="CEA" style={{ width: 42, height: 42, borderRadius: 10 }} />
            <div>
              <div className="fw-bold">Computer Excellence Academy</div>
              <div className="small opacity-75">Digital Learning Platform</div>
            </div>
          </div>
          <span className="legacy-pill dark">Secure Recovery</span>
          <h2 className="legacy-auth-title legacy-shimmer-text">Account Recovery</h2>
          <p className="legacy-auth-sub">
            Follow the steps to regain access to your courses, notes, and progress.
          </p>
          <div className="mt-4 small" style={{ color: "rgba(255,255,255,0.84)", lineHeight: 1.8 }}>
            <div>Safe. Secure. Seamless.</div>
            <div>Your digital learning progress is safe with us.</div>
            <div>For assistance, please visit the support page.</div>
          </div>
        </div>

        <div className="legacy-auth-main">
          <div className="mb-4">
            <h4 className="fw-bold mb-1">Reset Password</h4>
            <div className="legacy-mini">
              Step {step} of 2
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); step === 1 ? sendOtp() : resetPassword(); }}>
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="legacy-auth-input-wrap">
                    <FiMail className="icon" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="legacy-auth-input"
                      placeholder="Registered Email Address"
                      required
                    />
                  </div>
                  
                  <button type="submit" className="legacy-auth-btn mt-2" disabled={loading}>
                    {loading ? "Sending..." : (
                      <>Request Recovery Code <FiArrowRight className="ms-1" /></>
                    )}
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <p className="legacy-mini mb-2">Code sent to {email}</p>
                  <input
                    type="text"
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="legacy-auth-input text-center fw-bold fs-4 mb-3"
                    style={{ letterSpacing: "8px", paddingLeft: 12 }}
                    placeholder="000000"
                  />
                  
                  <div className="legacy-auth-input-wrap">
                    <FiLock className="icon" />
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="legacy-auth-input"
                      placeholder="New Password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((prev) => !prev)}
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        border: 0,
                        background: "transparent",
                        color: "#8a78b3",
                      }}
                    >
                      {showPass ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  
                  <button type="submit" className="legacy-auth-btn mt-2" disabled={loading}>
                    {loading ? "Resetting..." : (
                      <>Confirm New Password <FiCheckCircle className="ms-1" /></>
                    )}
                  </button>
                  <button
                    type="button"
                    className="legacy-btn w-100 mt-2"
                    style={{ border: "1px solid #e7dbff", background: "#fff", color: "#6c53a1" }}
                    onClick={() => setStep(1)}
                  >
                    <FiChevronLeft className="me-1" /> Use different email
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <div className="text-center mt-4">
            <Link to="/login" className="fw-semibold text-decoration-none legacy-mini">
              &larr; Back to Secure Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
