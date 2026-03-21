import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: "", password: "" });
    const [focused, setFocused] = useState("");
    const [loading, setLoading] = useState(false);
    const [shake, setShake] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 50);
        return () => clearTimeout(timer);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 600);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post("http://localhost:5000/api/admin/login", form);

            if (res.data.message === "Login Successfully") {
                localStorage.setItem("role", res.data.admin.role || "admin");
                localStorage.setItem("email", res.data.admin.email || "");
                localStorage.setItem("adminData", JSON.stringify(res.data.admin || {}));

                if (res.data.token) {
                    localStorage.setItem("adminToken", res.data.token);
                }

                navigate("/admin");
            } else {
                triggerShake();
            }
        } catch (error) {
            triggerShake();
            console.error("Admin login error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:wght@300;400;500;600&display=swap');

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                .al-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #0a0a0f;
                    font-family: 'DM Sans', sans-serif;
                    position: relative;
                    overflow: hidden;
                }

                .al-bg-grid {
                    position: absolute;
                    inset: 0;
                    background-image:
                        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
                    background-size: 48px 48px;
                }

                .al-bg-glow-1 {
                    position: absolute;
                    width: 600px; height: 600px;
                    top: -200px; left: -200px;
                    background: radial-gradient(circle, rgba(120,60,220,0.18) 0%, transparent 70%);
                    pointer-events: none;
                }

                .al-bg-glow-2 {
                    position: absolute;
                    width: 500px; height: 500px;
                    bottom: -150px; right: -100px;
                    background: radial-gradient(circle, rgba(60,180,220,0.12) 0%, transparent 70%);
                    pointer-events: none;
                }

                .al-card {
                    position: relative;
                    z-index: 1;
                    display: flex;
                    width: 860px;
                    min-height: 520px;
                    border-radius: 20px;
                    overflow: hidden;
                    border: 1px solid rgba(255,255,255,0.08);
                    box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
                    opacity: 0;
                    transform: translateY(24px);
                    transition: opacity 0.7s ease, transform 0.7s ease;
                }

                .al-card.mounted {
                    opacity: 1;
                    transform: translateY(0);
                }

                .al-left {
                    width: 42%;
                    background: linear-gradient(160deg, #1a0a2e 0%, #0f0a1e 60%, #0a0a18 100%);
                    position: relative;
                    padding: 48px 40px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    overflow: hidden;
                }

                .al-left-orb-1 {
                    position: absolute;
                    width: 220px; height: 220px;
                    top: -60px; right: -60px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(150,80,255,0.25) 0%, transparent 70%);
                }

                .al-left-orb-2 {
                    position: absolute;
                    width: 160px; height: 160px;
                    bottom: 40px; left: -40px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(80,160,255,0.15) 0%, transparent 70%);
                }

                .al-left-ring {
                    position: absolute;
                    width: 280px; height: 280px;
                    bottom: -100px; right: -80px;
                    border-radius: 50%;
                    border: 1px solid rgba(150,80,255,0.15);
                }

                .al-left-ring-2 {
                    position: absolute;
                    width: 180px; height: 180px;
                    bottom: -50px; right: -30px;
                    border-radius: 50%;
                    border: 1px solid rgba(150,80,255,0.1);
                }

                .al-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    background: rgba(150,80,255,0.15);
                    border: 1px solid rgba(150,80,255,0.25);
                    border-radius: 100px;
                    padding: 6px 14px;
                    width: fit-content;
                }

                .al-badge-dot {
                    width: 6px; height: 6px;
                    border-radius: 50%;
                    background: #a06fff;
                    box-shadow: 0 0 8px rgba(160,111,255,0.8);
                    animation: pulse 2s ease-in-out infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(0.85); }
                }

                .al-badge-text {
                    font-size: 11px;
                    font-weight: 500;
                    color: #c09fff;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                }

                .al-left-headline {
                    font-family: 'Playfair Display', serif;
                    font-size: 36px;
                    font-weight: 700;
                    line-height: 1.15;
                    color: #ffffff;
                    margin-top: 24px;
                    position: relative;
                    z-index: 1;
                }

                .al-left-headline span {
                    background: linear-gradient(90deg, #c09fff, #7eb8ff);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .al-left-desc {
                    font-size: 13.5px;
                    color: rgba(255,255,255,0.45);
                    line-height: 1.7;
                    margin-top: 14px;
                    position: relative;
                    z-index: 1;
                }

                .al-stats {
                    display: flex;
                    gap: 20px;
                    margin-top: 32px;
                    position: relative;
                    z-index: 1;
                }

                .al-stat {
                    flex: 1;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 12px;
                    padding: 14px 12px;
                    text-align: center;
                }

                .al-stat-value {
                    font-family: 'Playfair Display', serif;
                    font-size: 22px;
                    font-weight: 700;
                    color: #c09fff;
                }

                .al-stat-label {
                    font-size: 10.5px;
                    color: rgba(255,255,255,0.35);
                    margin-top: 3px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .al-right {
                    flex: 1;
                    background: #111118;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 48px 44px;
                }

                .al-form-wrap {
                    width: 100%;
                    max-width: 320px;
                }

                .al-eyebrow {
                    font-size: 11px;
                    font-weight: 600;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    color: #a06fff;
                    margin-bottom: 10px;
                }

                .al-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 30px;
                    font-weight: 700;
                    color: #f0eeff;
                    margin-bottom: 6px;
                }

                .al-subtitle {
                    font-size: 13px;
                    color: rgba(255,255,255,0.35);
                    margin-bottom: 32px;
                }

                .al-divider {
                    width: 32px;
                    height: 2px;
                    background: linear-gradient(90deg, #a06fff, #5ba3ff);
                    border-radius: 2px;
                    margin-bottom: 28px;
                }

                .al-field {
                    margin-bottom: 18px;
                }

                .al-label {
                    display: block;
                    font-size: 12px;
                    font-weight: 500;
                    color: rgba(255,255,255,0.5);
                    margin-bottom: 7px;
                    letter-spacing: 0.03em;
                    text-transform: uppercase;
                }

                .al-input-wrap {
                    position: relative;
                }

                .al-input {
                    width: 100%;
                    padding: 13px 16px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.09);
                    border-radius: 10px;
                    font-size: 14px;
                    font-family: 'DM Sans', sans-serif;
                    color: #f0eeff;
                    outline: none;
                    transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
                }

                .al-input::placeholder { color: rgba(255,255,255,0.2); }

                .al-input:focus {
                    border-color: rgba(160,111,255,0.55);
                    background: rgba(160,111,255,0.06);
                    box-shadow: 0 0 0 3px rgba(160,111,255,0.1);
                }

                .al-input-line {
                    position: absolute;
                    bottom: 0; left: 10%; right: 10%;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, #a06fff, transparent);
                    opacity: 0;
                    transition: opacity 0.3s;
                    border-radius: 1px;
                }

                .al-input:focus + .al-input-line { opacity: 1; }

                .al-btn {
                    width: 100%;
                    padding: 13px;
                    border: none;
                    border-radius: 10px;
                    background: linear-gradient(135deg, #7b3fe4, #4f90f0);
                    color: #fff;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 14.5px;
                    font-weight: 600;
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                    transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
                    box-shadow: 0 4px 20px rgba(123,63,228,0.35);
                    letter-spacing: 0.02em;
                }

                .al-btn::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, #9b5ff4, #6fb0ff);
                    opacity: 0;
                    transition: opacity 0.3s;
                }

                .al-btn:hover::before { opacity: 1; }
                .al-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(123,63,228,0.45); }
                .al-btn:active { transform: translateY(0px); }
                .al-btn:disabled { opacity: 0.6; cursor: not-allowed; }

                .al-btn-text { position: relative; z-index: 1; }

                .al-spinner {
                    display: inline-block;
                    width: 14px; height: 14px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: spin 0.7s linear infinite;
                    vertical-align: middle;
                    margin-right: 8px;
                }

                @keyframes spin { to { transform: rotate(360deg); } }

                .al-footer-text {
                    text-align: center;
                    font-size: 12.5px;
                    color: rgba(255,255,255,0.3);
                    margin-top: 20px;
                }

                .al-footer-text a {
                    color: #a06fff;
                    text-decoration: none;
                    font-weight: 500;
                    margin-left: 4px;
                    transition: color 0.2s;
                }

                .al-footer-text a:hover { color: #c09fff; }

                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    20% { transform: translateX(-8px); }
                    40% { transform: translateX(8px); }
                    60% { transform: translateX(-5px); }
                    80% { transform: translateX(5px); }
                }

                .shaking { animation: shake 0.55s ease; }

                @media (max-width: 700px) {
                    .al-card { flex-direction: column; width: 95vw; min-height: unset; }
                    .al-left { width: 100%; min-height: 180px; padding: 32px 28px; }
                    .al-stats { display: none; }
                    .al-right { padding: 32px 28px; }
                }
            `}</style>

            <div className="al-page">
                <div className="al-bg-grid" />
                <div className="al-bg-glow-1" />
                <div className="al-bg-glow-2" />

                <div className={`al-card ${mounted ? "mounted" : ""} ${shake ? "shaking" : ""}`}>
                    <div className="al-left">
                        <div className="al-left-orb-1" />
                        <div className="al-left-orb-2" />
                        <div className="al-left-ring" />
                        <div className="al-left-ring-2" />

                        <div>
                            <div className="al-badge">
                                <div className="al-badge-dot" />
                                <span className="al-badge-text">Admin Portal</span>
                            </div>

                            <div className="al-left-headline">
                                Your command
                                <br />
                                center
                                <br />
                                <span>awaits.</span>
                            </div>

                            <div className="al-left-desc">
                                Manage users, monitor exams, and track performance — all from one unified dashboard.
                            </div>
                        </div>

                        <div className="al-stats">
                            <div className="al-stat">
                                <div className="al-stat-value">2.4k</div>
                                <div className="al-stat-label">Users</div>
                            </div>
                            <div className="al-stat">
                                <div className="al-stat-value">98%</div>
                                <div className="al-stat-label">Uptime</div>
                            </div>
                            <div className="al-stat">
                                <div className="al-stat-value">140</div>
                                <div className="al-stat-label">Exams</div>
                            </div>
                        </div>
                    </div>

                    <div className="al-right">
                        <form onSubmit={handleSubmit} className="al-form-wrap">
                            <div className="al-eyebrow">Secure Access</div>
                            <div className="al-title">Welcome back</div>
                            <div className="al-subtitle">Sign in to your admin account</div>
                            <div className="al-divider" />

                            <div className="al-field">
                                <label className="al-label">Email address</label>
                                <div className="al-input-wrap">
                                    <input
                                        className="al-input"
                                        type="email"
                                        name="email"
                                        placeholder="admin@example.com"
                                        required
                                        autoComplete="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        onFocus={() => setFocused("email")}
                                        onBlur={() => setFocused("")}
                                    />
                                    <div className="al-input-line" />
                                </div>
                            </div>

                            <div className="al-field">
                                <label className="al-label">Password</label>
                                <div className="al-input-wrap">
                                    <input
                                        className="al-input"
                                        type="password"
                                        name="password"
                                        placeholder="Enter your password"
                                        required
                                        autoComplete="current-password"
                                        value={form.password}
                                        onChange={handleChange}
                                        onFocus={() => setFocused("password")}
                                        onBlur={() => setFocused("")}
                                    />
                                    <div className="al-input-line" />
                                </div>
                            </div>

                            <button type="submit" className="al-btn" disabled={loading}>
                                <span className="al-btn-text">
                                    {loading && <span className="al-spinner" />}
                                    {loading ? "Signing in..." : "Sign In"}
                                </span>
                            </button>

                            <div className="al-footer-text">
                                Not an admin?
                                <a href="/">Switch to User Login</a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminLogin;
