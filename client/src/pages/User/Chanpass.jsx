import axios from "axios";
import React, { useState } from "react";
import AppToast from "../../components/ui/AppToast";
import "../../components/ui/app-ui.css";
import {
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiLock,
  FiShield,
  FiX,
} from "react-icons/fi";

const Chanpass = () => {
  const userId = localStorage.getItem("userId");

  const [data, setFormData] = useState({
    op: "",
    np: "",
    cnp: "",
  });

  const [saving, setSaving] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 2500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      op: "",
      np: "",
      cnp: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!data.op || !data.np || !data.cnp) {
      showToast("Please fill in all fields", "error");
      return;
    }

    if (data.np !== data.cnp) {
      showToast("New password and confirm password do not match", "error");
      return;
    }

    if (data.np.length < 6) {
      showToast("New password must be at least 6 characters", "error");
      return;
    }

    try {
      setSaving(true);
      await axios.put(`${import.meta.env.VITE_API_URL}/api/examinee/change/${userId}`, data);
      showToast("Password changed successfully");
      resetForm();
    } catch (error) {
      showToast("Sorry, try again later", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="app-page">
        <div className="container">
          <AppToast toast={toast} onClose={() => setToast({ show: false, message: "", type: "success" })} />

          {/* Hero Section */}
          <div className="app-hero mb-4">
            <div className="row align-items-center g-4">
              <div className="col-lg-8">
                <h2 className="fw-bold mb-2">Change <em style={{ fontStyle: "normal", color: "#60a5fa" }}>Password</em></h2>
                <p className="mb-0">Keep your account secure by updating your password regularly.</p>
              </div>
              <div className="col-lg-4 text-lg-end">
                <div style={{ display: "inline-block", padding: "12px 20px", borderRadius: "16px", background: "#f3f4f6", textAlign: "right" }}>
                  <div className="small fw-bold text-muted">Security</div>
                  <div className="fw-bold" style={{ fontSize: "20px" }}>Protected</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="row g-4 mb-4">
            <div className="col-md-4">
              <div className="app-stat-card">
                <div className="app-label-muted">Account Status</div>
                <h4 className="fw-bold mb-0">Active</h4>
              </div>
            </div>
            <div className="col-md-4">
              <div className="app-stat-card">
                <div className="app-label-muted">Password Rules</div>
                <h4 className="fw-bold mb-0">Min 6 Characters</h4>
              </div>
            </div>
            <div className="col-md-4">
              <div className="app-stat-card">
                <div className="app-label-muted">Security Mode</div>
                <h4 className="fw-bold mb-0">Enabled</h4>
              </div>
            </div>
          </div>

          {/* Password Change Panel */}
          <div className="app-panel">
            <div style={{ padding: "20px 24px", color: "#fff", background: "linear-gradient(135deg, #0f172a, #2563eb)", borderRadius: "24px 24px 0 0" }}>
              <h5 className="fw-bold mb-1">Update Password</h5>
              <p className="mb-0" style={{ opacity: 0.8 }}>Enter your current password and choose a new secure password.</p>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Old Password</label>
                  <div style={{ position: "relative" }}>
                    <FiLock style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                    <input
                      type={showOld ? "text" : "password"}
                      name="op"
                      value={data.op}
                      onChange={handleChange}
                      className="app-input"
                      placeholder="Enter old password"
                      style={{ paddingLeft: "40px" }}
                    />
                    <button
                      type="button"
                      style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", color: "#64748b" }}
                      onClick={() => setShowOld((prev) => !prev)}
                    >
                      {showOld ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">New Password</label>
                  <div style={{ position: "relative" }}>
                    <FiShield style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                    <input
                      type={showNew ? "text" : "password"}
                      name="np"
                      value={data.np}
                      onChange={handleChange}
                      className="app-input"
                      placeholder="Enter new password"
                      style={{ paddingLeft: "40px" }}
                    />
                    <button
                      type="button"
                      style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", color: "#64748b" }}
                      onClick={() => setShowNew((prev) => !prev)}
                    >
                      {showNew ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Confirm New Password</label>
                  <div style={{ position: "relative" }}>
                    <FiCheckCircle style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                    <input
                      type={showConfirm ? "text" : "password"}
                      name="cnp"
                      value={data.cnp}
                      onChange={handleChange}
                      className="app-input"
                      placeholder="Confirm new password"
                      style={{ paddingLeft: "40px" }}
                    />
                    <button
                      type="button"
                      style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", color: "#64748b" }}
                      onClick={() => setShowConfirm((prev) => !prev)}
                    >
                      {showConfirm ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-2">
                  <button type="submit" className="app-btn-primary" disabled={saving}>
                    {saving ? "Updating..." : "Update Password"}
                  </button>
                  <button type="button" className="app-btn-soft" onClick={resetForm}>
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chanpass;
