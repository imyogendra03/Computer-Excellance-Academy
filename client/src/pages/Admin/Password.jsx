import React, { useState } from "react";
import axios from "axios";
import { FiLock, FiShield, FiKey } from "react-icons/fi";

const Password = () => {
    const [form, setForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });

    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "success" }), 2500);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.newPassword !== form.confirmPassword) {
            return showToast("New passwords do not match", "error");
        }
        if (form.newPassword.length < 6) {
            return showToast("Password must be at least 6 characters", "error");
        }

        try {
            setLoading(true);
            await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/change-password`, {
                oldPassword: form.oldPassword,
                newPassword: form.newPassword,
                confirmPassword: form.confirmPassword,
            });

            showToast("Password updated successfully");
            setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            showToast(error.response?.data?.message || "Failed to update password", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5" style={{ minHeight: "100vh", background: "linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)" }}>
            {toast.show && (
                <div style={{
                    position: "fixed", top: 25, right: 25, zIndex: 9999, minWidth: "300px",
                    padding: "16px 20px", borderRadius: "18px", color: "#fff",
                    background: toast.type === "error" ? "linear-gradient(135deg,#dc2626,#ef4444)" : "linear-gradient(135deg,#2563eb,#4f46e5)",
                    boxShadow: "0 15px 35px rgba(0,0,0,0.2)", animation: "slideIn 0.3s ease-out"
                }}>
                    {toast.message}
                </div>
            )}

            <div className="row justify-content-center">
                <div className="col-lg-6 col-md-8">
                    <div style={{
                        background: "linear-gradient(135deg, #0f172a, #1d4ed8, #4f46e5)",
                        borderRadius: "28px", padding: "40px", color: "#fff",
                        boxShadow: "0 20px 45px rgba(37, 99, 235, 0.22)", marginBottom: "30px"
                    }}>
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <div style={{ background: "rgba(255,255,255,0.15)", padding: "12px", borderRadius: "15px" }}>
                                <FiShield size={28} />
                            </div>
                            <h2 className="fw-bold mb-0">Change Password</h2>
                        </div>
                        <p className="mb-0" style={{ opacity: 0.85 }}>
                            Apna admin account secure rakhein. Password regular intervals par change karte rahein.
                        </p>
                    </div>

                    <div style={{
                        background: "#fff", borderRadius: "24px", padding: "40px",
                        boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)", border: "1px solid #f1f5f9"
                    }}>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="form-label fw-bold text-muted small text-uppercase mb-2">Current Password</label>
                                <div style={{ position: "relative" }}>
                                    <FiLock style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                                    <input
                                        type="password"
                                        name="oldPassword"
                                        className="form-control"
                                        placeholder="Enter current password"
                                        value={form.oldPassword}
                                        onChange={handleChange}
                                        required
                                        style={{ borderRadius: "14px", padding: "14px 14px 14px 45px", border: "2px solid #eef2f6", background: "#f8fafc" }}
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-bold text-muted small text-uppercase mb-2">New Password</label>
                                <div style={{ position: "relative" }}>
                                    <FiKey style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                                    <input
                                        type="password"
                                        name="newPassword"
                                        className="form-control"
                                        placeholder="Enter new password"
                                        value={form.newPassword}
                                        onChange={handleChange}
                                        required
                                        style={{ borderRadius: "14px", padding: "14px 14px 14px 45px", border: "2px solid #eef2f6", background: "#f8fafc" }}
                                    />
                                </div>
                            </div>

                            <div className="mb-5">
                                <label className="form-label fw-bold text-muted small text-uppercase mb-2">Confirm New Password</label>
                                <div style={{ position: "relative" }}>
                                    <FiKey style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        className="form-control"
                                        placeholder="Re-type new password"
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        style={{ borderRadius: "14px", padding: "14px 14px 14px 45px", border: "2px solid #eef2f6", background: "#f8fafc" }}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn w-100 text-white fw-bold"
                                disabled={loading}
                                style={{
                                    borderRadius: "16px", padding: "16px",
                                    background: "linear-gradient(135deg, #2563eb, #4f46e5)",
                                    boxShadow: "0 10px 25px rgba(37, 99, 235, 0.25)",
                                    border: "none", transition: "all 0.3s ease"
                                }}
                            >
                                {loading ? "Updating..." : "Update Password"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .form-control:focus {
                    border-color: #3b82f6 !important;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
                    background: #fff !important;
                }
            `}</style>
        </div>
    );
};

export default Password;
