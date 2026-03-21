import axios from "axios";
import React, { useState } from "react";
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
      await axios.put(`https://computer-excellance-academy.onrender.com/api/examinee/change/${userId}`, data);
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
      <style>{`
        .cp-page {
          min-height: 100vh;
          padding: 24px 0;
          background: linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
        }

        .cp-hero {
          padding: 32px;
          border-radius: 28px;
          color: #fff;
          background: linear-gradient(135deg, #0f172a, #1d4ed8, #4f46e5);
          box-shadow: 0 20px 45px rgba(37, 99, 235, 0.22);
        }

        .cp-card {
          background: #fff;
          border-radius: 24px;
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
          border: 0;
          overflow: hidden;
        }

        .cp-card-header {
          padding: 20px 24px;
          color: #fff;
          background: linear-gradient(135deg, #0f172a, #2563eb);
        }

        .cp-card-header h4 {
          margin: 0 0 4px;
          font-weight: 700;
        }

        .cp-card-header p {
          margin: 0;
          opacity: 0.8;
        }

        .cp-input-wrap {
          position: relative;
        }

        .cp-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
        }

        .cp-input {
          width: 100%;
          border: 1px solid #dbe3f0;
          border-radius: 14px;
          padding: 12px 44px 12px 40px;
          outline: none;
          transition: 0.2s ease;
        }

        .cp-input:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.08);
        }

        .cp-eye-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          border: none;
          background: transparent;
          color: #64748b;
        }

        .cp-btn-primary {
          border: none;
          color: #fff;
          font-weight: 600;
          border-radius: 14px;
          padding: 12px 20px;
          background: linear-gradient(135deg, #2563eb, #4f46e5);
        }

        .cp-btn-soft {
          border-radius: 14px;
          padding: 12px 20px;
          font-weight: 600;
          background: #eef2ff;
          color: #3730a3;
          border: 1px solid #c7d2fe;
        }

        .cp-stat-card {
          height: 100%;
          padding: 24px;
          background: #fff;
          border-radius: 22px;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
        }

        .cp-toast {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          min-width: 280px;
          color: #fff;
          padding: 14px 16px;
          border-radius: 16px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }

        .cp-toast.success {
          background: linear-gradient(135deg, #2563eb, #4f46e5);
        }

        .cp-toast.error {
          background: linear-gradient(135deg, #dc2626, #ef4444);
        }

        .cp-toast-close {
          border: none;
          background: transparent;
          color: #fff;
          font-size: 16px;
        }

        @media (max-width: 767px) {
          .cp-hero {
            padding: 24px;
          }
        }
      `}</style>

      <div className="cp-page">
        <div className="container">
          {toast.show && (
            <div className={`cp-toast ${toast.type === "error" ? "error" : "success"}`}>
              <span>{toast.message}</span>
              <button
                type="button"
                className="cp-toast-close"
                onClick={() => setToast({ show: false, message: "", type: "success" })}
              >
                <FiX />
              </button>
            </div>
          )}

          <div className="cp-hero mb-4">
            <div className="row align-items-center g-4">
              <div className="col-lg-8">
                <h2 className="fw-bold mb-2">Change Password</h2>
                <p className="mb-0" style={{ opacity: 0.88 }}>
                  Keep your account secure by updating your password regularly.
                </p>
              </div>

              <div className="col-lg-4 text-lg-end">
                <div
                  style={{
                    display: "inline-block",
                    padding: "16px 20px",
                    borderRadius: "18px",
                    background: "rgba(255,255,255,0.14)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <div style={{ fontSize: "13px", opacity: 0.8 }}>Security</div>
                  <div className="fw-bold" style={{ fontSize: "22px" }}>
                    Protected
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-md-4">
              <div className="cp-stat-card">
                <div className="text-muted mb-2">Account Status</div>
                <h4 className="fw-bold mb-0">Active</h4>
              </div>
            </div>

            <div className="col-md-4">
              <div className="cp-stat-card">
                <div className="text-muted mb-2">Password Rules</div>
                <h4 className="fw-bold mb-0">Min 6 Characters</h4>
              </div>
            </div>

            <div className="col-md-4">
              <div className="cp-stat-card">
                <div className="text-muted mb-2">Security Mode</div>
                <h4 className="fw-bold mb-0">Enabled</h4>
              </div>
            </div>
          </div>

          <div className="cp-card">
            <div className="cp-card-header">
              <h4>Update Password</h4>
              <p>Enter your current password and choose a new secure password.</p>
            </div>

            <div className="p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Old Password</label>
                  <div className="cp-input-wrap">
                    <FiLock className="cp-input-icon" />
                    <input
                      type={showOld ? "text" : "password"}
                      name="op"
                      value={data.op}
                      onChange={handleChange}
                      className="cp-input"
                      placeholder="Enter old password"
                    />
                    <button
                      type="button"
                      className="cp-eye-btn"
                      onClick={() => setShowOld((prev) => !prev)}
                    >
                      {showOld ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">New Password</label>
                  <div className="cp-input-wrap">
                    <FiShield className="cp-input-icon" />
                    <input
                      type={showNew ? "text" : "password"}
                      name="np"
                      value={data.np}
                      onChange={handleChange}
                      className="cp-input"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      className="cp-eye-btn"
                      onClick={() => setShowNew((prev) => !prev)}
                    >
                      {showNew ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Confirm New Password</label>
                  <div className="cp-input-wrap">
                    <FiCheckCircle className="cp-input-icon" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      name="cnp"
                      value={data.cnp}
                      onChange={handleChange}
                      className="cp-input"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      className="cp-eye-btn"
                      onClick={() => setShowConfirm((prev) => !prev)}
                    >
                      {showConfirm ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-2">
                  <button type="submit" className="cp-btn-primary" disabled={saving}>
                    {saving ? "Updating..." : "Update Password"}
                  </button>

                  <button type="button" className="cp-btn-soft" onClick={resetForm}>
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
