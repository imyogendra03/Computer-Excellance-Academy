import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiBookOpen,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiMapPin,
  FiPhone,
  FiUser,
} from "react-icons/fi";

const QUALIFICATIONS = [
  "8th Pass",
  "10th Pass",
  "12th Pass",
  "Diploma",
  "B.A.",
  "B.Com",
  "B.Sc.",
  "BCA",
  "B.Tech",
  "M.Com",
  "MCA",
  "M.Tech",
  "Other",
];

const Registration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [batches, setBatches] = useState([]);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [form, setForm] = useState({
    name: "",
    email: "",
    number: "",
    password: "",
    address: "",
    college: "",
    qualification: "",
    session: "",
  });
  const [otp, setOtp] = useState("");

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 2600);
  };

  useEffect(() => {
    const fetchData = async () => {
      const apiUrl = import.meta.env.VITE_API_URL;
      try {
        const [sessionRes, batchRes] = await Promise.all([
          axios.get(`${apiUrl}/api/session`),
          axios.get(`${apiUrl}/api/batch`),
        ]);
        setSessions(Array.isArray(sessionRes?.data?.data) ? sessionRes.data.data : []);
        setBatches(Array.isArray(batchRes?.data?.data) ? batchRes.data.data : []);
      } catch {
        setSessions([]);
        setBatches([]);
      }
    };
    fetchData();
  }, []);

  const setField = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateStepOne = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Name is required";
    if (!form.email.trim() || !form.email.includes("@")) nextErrors.email = "Valid email is required";
    if (!form.number.trim() || form.number.length < 10) nextErrors.number = "10-digit phone required";
    if (!form.password || form.password.length < 6) nextErrors.password = "Minimum 6 characters";
    return nextErrors;
  };

  const goNext = () => {
    const nextErrors = validateStepOne();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!form.session) {
      setErrors({ session: "Select a session or batch" });
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, form);
      setStep(3);
    } catch (error) {
      showToast(error?.response?.data?.message || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 4) {
      setErrors({ otp: "Enter valid OTP" });
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/verify-registration`, {
        email: form.email,
        otp,
      });
      setDone(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setErrors({ otp: error?.response?.data?.message || "Invalid OTP" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="legacy-auth-page">
      {toast.show ? (
        <div
          style={{
            position: "fixed",
            top: 18,
            right: 18,
            zIndex: 9999,
            borderRadius: 12,
            padding: "10px 14px",
            color: "#fff",
            background:
              toast.type === "error"
                ? "linear-gradient(135deg,#f0527a,#ea2f5f)"
                : "linear-gradient(135deg,#7b3ff2,#f21f85)",
          }}
        >
          {toast.message}
        </div>
      ) : null}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="legacy-auth-card">
        <div className="legacy-auth-side">
          <div className="d-flex align-items-center gap-2 mb-4">
            <img src="/cea-logo.png" alt="CEA" style={{ width: 42, height: 42, borderRadius: 10 }} />
            <div>
              <div className="fw-bold">Computer Excellence Academy</div>
              <div className="small opacity-75">Digital Learning Platform</div>
            </div>
          </div>
          <span className="legacy-pill dark">Student Registration</span>
          <h2 className="legacy-auth-title legacy-shimmer-text">Start Learning Free</h2>
          <p className="legacy-auth-sub">
            Create your account and access courses, notes, and batch content in one dashboard.
          </p>
          <div className="mt-4 small" style={{ color: "rgba(255,255,255,0.84)", lineHeight: 1.8 }}>
            <div>From Basics to Career-Ready Skills.</div>
            <div>One Platform for Video Learning, Notes, and Exams.</div>
            <div>Trusted by thousands of students at Computer Excellence Academy.</div>
          </div>
        </div>

        <div className="legacy-auth-main">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="fw-bold mb-1">Create Account</h4>
              <div className="legacy-mini">
                Step {done ? 3 : step} of 3
              </div>
            </div>
            <Link to="/login" className="small fw-semibold text-decoration-none">
              Already have account?
            </Link>
          </div>

          <AnimatePresence mode="wait">
            {!done ? (
              <motion.div
                key={`step-${step}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {step === 1 ? (
                  <>
                    <div className="legacy-auth-input-wrap">
                      <FiUser className="icon" />
                      <input
                        className="legacy-auth-input"
                        name="name"
                        value={form.name}
                        onChange={setField}
                        placeholder="Full name"
                      />
                    </div>
                    {errors.name ? <div className="small text-danger mb-2">{errors.name}</div> : null}

                    <div className="legacy-auth-input-wrap">
                      <FiMail className="icon" />
                      <input
                        className="legacy-auth-input"
                        name="email"
                        value={form.email}
                        onChange={setField}
                        placeholder="Email address"
                        type="email"
                      />
                    </div>
                    {errors.email ? <div className="small text-danger mb-2">{errors.email}</div> : null}

                    <div className="legacy-auth-input-wrap">
                      <FiPhone className="icon" />
                      <input
                        className="legacy-auth-input"
                        name="number"
                        value={form.number}
                        onChange={setField}
                        placeholder="Phone number"
                      />
                    </div>
                    {errors.number ? <div className="small text-danger mb-2">{errors.number}</div> : null}

                    <div className="legacy-auth-input-wrap">
                      <FiLock className="icon" />
                      <input
                        className="legacy-auth-input"
                        name="password"
                        value={form.password}
                        onChange={setField}
                        placeholder="Password"
                        type={showPass ? "text" : "password"}
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

                    <div className="legacy-auth-input-wrap">
                      <FiMapPin className="icon" />
                      <input
                        className="legacy-auth-input"
                        name="address"
                        value={form.address}
                        onChange={setField}
                        placeholder="Address"
                      />
                    </div>

                    <button className="legacy-auth-btn mt-2" onClick={goNext} type="button">
                      Continue
                    </button>
                  </>
                ) : null}

                {step === 2 ? (
                  <>
                    <div className="legacy-auth-input-wrap">
                      <FiBookOpen className="icon" />
                      <input
                        className="legacy-auth-input"
                        name="college"
                        value={form.college}
                        onChange={setField}
                        placeholder="College name"
                      />
                    </div>

                    <select
                      className="legacy-select mb-3"
                      name="qualification"
                      value={form.qualification}
                      onChange={setField}
                    >
                      <option value="">Select qualification</option>
                      {QUALIFICATIONS.map((qualification) => (
                        <option key={qualification} value={qualification}>
                          {qualification}
                        </option>
                      ))}
                    </select>

                    <select
                      className="legacy-select"
                      name="session"
                      value={form.session}
                      onChange={setField}
                    >
                      <option value="">Select session or batch</option>
                      {sessions.map((session) => (
                        <option key={session._id} value={session._id}>
                          {session.name || session.sessionName}
                        </option>
                      ))}
                      {batches.map((batch) => (
                        <option key={batch._id} value={batch._id}>
                          {batch.batchName}
                        </option>
                      ))}
                    </select>
                    {errors.session ? <div className="small text-danger mt-2">{errors.session}</div> : null}

                    <div className="row g-2 mt-2">
                      <div className="col-4">
                        <button
                          className="legacy-btn w-100"
                          style={{ border: "1px solid #e7dbff", background: "#faf7ff", color: "#6c53a1" }}
                          type="button"
                          onClick={() => setStep(1)}
                        >
                          Back
                        </button>
                      </div>
                      <div className="col-8">
                        <button className="legacy-auth-btn" type="button" onClick={handleSubmit} disabled={loading}>
                          {loading ? "Submitting..." : "Register"}
                        </button>
                      </div>
                    </div>
                  </>
                ) : null}

                {step === 3 ? (
                  <>
                    <p className="legacy-mini mb-2">Enter OTP sent to {form.email}</p>
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
                    <button className="legacy-auth-btn mt-3" type="button" onClick={handleVerifyOTP} disabled={loading}>
                      {loading ? "Verifying..." : "Verify & Complete"}
                    </button>
                  </>
                ) : null}
              </motion.div>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-5"
              >
                <h4 className="fw-bold mb-2">Registration Successful</h4>
                <p className="legacy-mini mb-0">Redirecting to login...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Registration;
