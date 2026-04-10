import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";

const Login = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!data.email.trim() || !data.email.includes("@")) nextErrors.email = "Valid email is required";
    if (!data.password) nextErrors.password = "Password is required";
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (step === 1) {
      const validationErrors = validate();
      if (Object.keys(validationErrors).length) {
        setErrors(validationErrors);
        return;
      }
      setLoading(true);
      try {
        await axios.post(`${apiUrl}/api/auth/login`, data);
        setStep(2);
      } catch (error) {
        setErrors({ email: error?.response?.data?.message || "Login failed" });
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!otp || otp.trim().length < 4) {
      setErrors({ otp: "Enter valid OTP" });
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${apiUrl}/api/auth/verify-login`, {
        email: data.email,
        otp: otp.trim(),
      });
      if (response?.data?.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken || "");
        localStorage.setItem("role", response.data.user?.role || "user");
        localStorage.setItem("userData", JSON.stringify(response.data.user || {}));
        localStorage.setItem(
          "userId",
          response.data.user?._id || response.data.user?.id || ""
        );
        localStorage.setItem("userEmail", response.data.user?.email || data.email || "");
        localStorage.setItem("userRole", "user");
      }
      navigate("/UserDash");
    } catch (error) {
      setErrors({ otp: error?.response?.data?.message || "OTP verification failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setErrors({});
    setOtp("");
    setLoading(true);
    try {
      await axios.post(`${apiUrl}/api/auth/login`, data);
      setStep(2);
    } catch (error) {
      setErrors({ otp: error?.response?.data?.message || "Failed to resend OTP." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="legacy-auth-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="legacy-auth-card">
        <div className="legacy-auth-side">
          <div className="d-flex align-items-center gap-2 mb-4">
            <img src="/cea-logo.png" alt="CEA" style={{ width: 42, height: 42, borderRadius: 10 }} />
            <div>
              <div className="fw-bold">Computer Excellence Academy</div>
              <div className="small opacity-75">Digital Learning Platform</div>
            </div>
          </div>
          <span className="legacy-pill dark">Student Login</span>
          <h2 className="legacy-auth-title legacy-shimmer-text">Welcome Back</h2>
          <p className="legacy-auth-sub">
            Continue your learning journey with chapter videos, notes, and assignments.
          </p>
          <div className="mt-4 small" style={{ color: "rgba(255,255,255,0.84)", lineHeight: 1.8 }}>
            <div>Learn Free. Build Skills. Earn Respect.</div>
            <div>Computer Excellence Academy - Skills for Future Careers.</div>
            <div>Daily learners active in classes, notes, and practice tests.</div>
          </div>
        </div>

        <div className="legacy-auth-main">
          <div className="mb-4">
            <h4 className="fw-bold mb-1">{step === 1 ? "Login to your account" : "Verify OTP"}</h4>
            <div className="legacy-mini">
              {step === 1 ? "Enter your credentials to continue." : `Code sent to ${data.email}`}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="login-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="legacy-auth-input-wrap">
                    <FiMail className="icon" />
                    <input
                      type="email"
                      name="email"
                      value={data.email}
                      onChange={handleChange}
                      className="legacy-auth-input"
                      placeholder="Email address"
                      required
                    />
                  </div>
                  {errors.email ? <div className="small text-danger mb-2">{errors.email}</div> : null}

                  <div className="legacy-auth-input-wrap">
                    <FiLock className="icon" />
                    <input
                      type={showPass ? "text" : "password"}
                      name="password"
                      value={data.password}
                      onChange={handleChange}
                      className="legacy-auth-input"
                      placeholder="Password"
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
                  {errors.password ? <div className="small text-danger mb-2">{errors.password}</div> : null}

                  <div className="d-flex justify-content-between mb-3">
                    <Link to="/forgot" className="small text-decoration-none">
                      Forgot Password?
                    </Link>
                    <Link to="/adlogin" className="small text-decoration-none">
                      Admin Login
                    </Link>
                  </div>

                  <button type="submit" className="legacy-auth-btn" disabled={loading}>
                    {loading ? "Checking..." : "Send OTP"}
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="otp-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                    className="legacy-auth-input text-center fw-bold fs-4"
                    style={{ letterSpacing: "8px", paddingLeft: 12 }}
                    placeholder="000000"
                  />
                  {errors.otp ? <div className="small text-danger mt-2">{errors.otp}</div> : null}
                  <button type="submit" className="legacy-auth-btn mt-3" disabled={loading}>
                    {loading ? "Verifying..." : "Login"}
                  </button>
                  <button
                    type="button"
                    className="legacy-btn w-100 mt-2"
                    style={{ border: "1px solid #e7dbff", background: "#fff", color: "#6c53a1" }}
                    onClick={handleResendOTP}
                    disabled={loading}
                  >
                    Resend OTP
                  </button>
                  <button
                    type="button"
                    className="legacy-btn w-100 mt-2"
                    style={{ border: "1px solid #e7dbff", background: "#faf7ff", color: "#6c53a1" }}
                    onClick={() => setStep(1)}
                  >
                    Back to Login
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <div className="text-center mt-4">
            <span className="legacy-mini">Don&apos;t have an account? </span>
            <Link to="/register" className="fw-semibold text-decoration-none">
              Register
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
