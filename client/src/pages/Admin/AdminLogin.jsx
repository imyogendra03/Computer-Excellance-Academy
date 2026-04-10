import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiLock, FiMail } from "react-icons/fi";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/login`, form);
      if (response.data.message === "Login Successfully") {
        localStorage.setItem("adminToken", response.data.token);
        if (response.data.refreshToken) localStorage.setItem("adminRefreshToken", response.data.refreshToken);
        localStorage.setItem("role", response.data.admin.role || "admin");
        localStorage.setItem("email", response.data.admin.email || "");
        localStorage.setItem("adminData", JSON.stringify(response.data.admin || {}));
        navigate("/admin");
      } else {
        setErrorMessage("Authentication failed.");
      }
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Internal access error");
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
              <div className="small opacity-75">Admin Console</div>
            </div>
          </div>
          <span className="legacy-pill dark">Admin Access</span>
          <h2 className="legacy-auth-title legacy-shimmer-text">Secure Dashboard Login</h2>
          <p className="legacy-auth-sub">
            Manage batches, notes, payments, and learners from a single admin control panel.
          </p>
          <div className="mt-4 small" style={{ color: "rgba(255,255,255,0.84)", lineHeight: 1.8 }}>
            <div>Monitor learning quality in real time.</div>
            <div>Guide students with faster support and structured workflows.</div>
          </div>
        </div>

        <div className="legacy-auth-main">
          <div className="mb-4">
            <h4 className="fw-bold mb-1">Admin Login</h4>
            <div className="legacy-mini">Authorized staff only</div>
          </div>

          {errorMessage ? (
            <div className="alert alert-danger py-2 small" role="alert">
              {errorMessage}
            </div>
          ) : null}

          <form onSubmit={handleSubmit}>
            <div className="legacy-auth-input-wrap">
              <FiMail className="icon" />
              <input
                type="email"
                name="email"
                className="legacy-auth-input"
                placeholder="Admin email"
                required
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div className="legacy-auth-input-wrap">
              <FiLock className="icon" />
              <input
                type="password"
                name="password"
                className="legacy-auth-input"
                placeholder="Password"
                required
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="legacy-auth-btn mt-2" disabled={loading}>
              {loading ? "Signing in..." : "Login to Admin"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="legacy-btn w-100 mt-3"
            style={{ border: "1px solid #e7dbff", background: "#faf7ff", color: "#6c53a1" }}
          >
            Back to Student Login
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
