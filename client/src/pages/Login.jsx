import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

/* ══════════════════════════════════════════
   Login.jsx — Premium Animated UI
   Floating labels, validation, interactions
   ══════════════════════════════════════════ */

const Login = () => {
  const navigate = useNavigate();

  const [data, setData] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [remember, setRemember] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!data.email.trim() || !data.email.includes("@")) {
      e.email = "Valid email is required";
    }
    if (!data.password) {
      e.password = "Password is required";
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();

    if (Object.keys(e2).length) {
      setErrors(e2);
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("https://computer-excellance-academy.onrender.com/api/examinee/login", data);

      if (res.data.message === "Login Successfully") {
        localStorage.setItem("userRole", res.data.user.role || "user");
        localStorage.setItem("userEmail", res.data.user.email || "");
        localStorage.setItem("userId", res.data.user.id || "");
        localStorage.setItem("userData", JSON.stringify(res.data.user || {}));

        if (remember) {
          localStorage.setItem("rememberUserEmail", data.email);
        } else {
          localStorage.removeItem("rememberUserEmail");
        }

        navigate("/userdash");
      } else {
        setErrors({ password: "Invalid credentials. Please try again." });
        setData((prev) => ({ ...prev, password: "" }));
      }
    } catch (error) {
      setErrors({
        password:
          error?.response?.data?.message || "An error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fs = (name) =>
    errors[name] ? "fi bad" : data[name] ? "fi ok" : "fi";

  return (
    <div
      style={{
        fontFamily: "'Outfit','Segoe UI',sans-serif",
        minHeight: "100vh",
        background: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

        .login-card {
          display:flex; width:100%; max-width:820px;
          border-radius:24px; overflow:hidden;
          box-shadow:0 30px 80px rgba(0,0,0,.5);
          animation:cardIn .7s cubic-bezier(.23,1,.32,1);
        }
        @keyframes cardIn { from{opacity:0;transform:translateY(28px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }

        .login-left {
          width:42%; background:linear-gradient(160deg,#6a11cb,#2575fc);
          padding:40px 28px; display:flex; flex-direction:column;
          align-items:center; justify-content:center;
          position:relative; overflow:hidden; text-align:center;
        }
        .login-left::before { content:''; position:absolute; width:260px; height:260px; border-radius:50%; background:rgba(255,255,255,.07); top:-80px; right:-70px; }
        .login-left::after  { content:''; position:absolute; width:180px; height:180px; border-radius:50%; background:rgba(255,255,255,.05); bottom:-50px; left:-50px; }

        .ll-ill {
          width:180px; height:180px; border-radius:50%;
          background:rgba(255,255,255,.12); border:2px solid rgba(255,255,255,.2);
          display:flex; align-items:center; justify-content:center;
          font-size:72px; margin-bottom:22px; position:relative; z-index:1;
          animation:orbFloat 3s ease-in-out infinite;
        }
        @keyframes orbFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }

        .ll-badge {
          display:inline-flex; align-items:center; gap:7px;
          background:rgba(255,255,255,.15); border:1px solid rgba(255,255,255,.25);
          padding:5px 14px; border-radius:50px; margin-bottom:14px;
          position:relative; z-index:1;
        }
        .ll-dot { width:7px; height:7px; border-radius:50%; background:#ffe066; animation:dotP 2s infinite; }
        @keyframes dotP { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.5)} }
        .ll-btx { font-size:.76rem; font-weight:700; color:#ffe066; }

        .ll-title { font-size:1.3rem; font-weight:800; color:#fff; line-height:1.25; margin-bottom:8px; position:relative; z-index:1; }
        .ll-title em { font-style:normal; background:linear-gradient(90deg,#ffe066,#ffb347); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .ll-sub { font-size:.78rem; color:rgba(255,255,255,.7); line-height:1.75; position:relative; z-index:1; max-width:230px; }

        .ll-chips { display:flex; flex-direction:column; gap:8px; margin-top:20px; width:100%; position:relative; z-index:1; }
        .ll-chip {
          display:flex; align-items:center; gap:10px;
          padding:9px 13px; background:rgba(255,255,255,.1);
          border:1px solid rgba(255,255,255,.12); border-radius:10px;
          animation:chipIn .5s ease both;
        }
        @keyframes chipIn { from{opacity:0;transform:translateX(-14px)} to{opacity:1;transform:translateX(0)} }
        .ll-chip:nth-child(1){animation-delay:.1s} .ll-chip:nth-child(2){animation-delay:.2s} .ll-chip:nth-child(3){animation-delay:.3s}
        .ll-chip-ic { font-size:1rem; flex-shrink:0; }
        .ll-chip-tx { font-size:.75rem; color:rgba(255,255,255,.85); font-weight:500; }

        .login-right {
          flex:1; background:#fff; padding:40px 36px;
          display:flex; flex-direction:column; justify-content:center;
        }
        .lr-head { text-align:center; margin-bottom:26px; }
        .lr-logo { display:inline-flex; align-items:center; gap:10px; margin-bottom:14px; }
        .lr-orb  { width:40px; height:40px; border-radius:10px; background:linear-gradient(135deg,#6a11cb,#2575fc); display:flex; align-items:center; justify-content:center; font-size:19px; }
        .lr-name { font-size:.88rem; font-weight:800; text-align:left; line-height:1.2; background:linear-gradient(135deg,#6a11cb,#2575fc); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .lr-sub  { font-size:.58rem; color:#9ca3af; text-transform:uppercase; letter-spacing:1px; }
        .lr-title { font-size:1.5rem; font-weight:800; color:#1a1a2e; margin-bottom:4px; }
        .lr-desc  { font-size:.8rem; color:#9ca3af; }

        .fg { position:relative; margin-bottom:16px; }
        .fi {
          width:100%; padding:16px 14px 6px; border:1.5px solid #e5e7eb; border-radius:11px;
          font-size:.9rem; font-family:'Outfit','Segoe UI',sans-serif; color:#1a1a2e;
          background:#fafafa; outline:none; transition:all .3s ease;
        }
        .fi::placeholder { color:transparent; }
        .fi:hover:not(:focus) { border-color:#c4b5fd; }
        .fi:focus { border-color:#6a11cb; background:#fff; box-shadow:0 0 0 4px rgba(106,17,203,.09); }
        .fi.ok  { border-color:#10b981; background:#f0fdf4; }
        .fi.bad { border-color:#ef4444; background:#fff5f5; }
        .fi.bad:focus { box-shadow:0 0 0 4px rgba(239,68,68,.09); }

        .fg label {
          position:absolute; left:14px; top:50%; transform:translateY(-50%);
          font-size:.85rem; color:#9ca3af; pointer-events:none;
          transition:all .25s cubic-bezier(.23,1,.32,1);
          background:transparent; padding:0 3px;
        }
        .fi:focus ~ label,
        .fi:not(:placeholder-shown) ~ label {
          top:5px; transform:translateY(0);
          font-size:.6rem; font-weight:700; color:#6a11cb;
          background:#fff; letter-spacing:.5px; text-transform:uppercase;
        }
        .fi.ok ~ label   { color:#10b981 !important; }
        .fi.bad ~ label  { color:#ef4444 !important; }

        .pw-wrap { position:relative; }
        .pw-wrap .fi { padding-right:42px; }
        .pw-eye { position:absolute; right:13px; top:50%; transform:translateY(-50%); cursor:pointer; font-size:.9rem; color:#9ca3af; user-select:none; transition:color .2s; }
        .pw-eye:hover { color:#6a11cb; }

        .emsg {
          font-size:.7rem; color:#ef4444; margin-top:3px;
          display:flex; align-items:center; gap:3px; font-weight:600;
          animation:errIn .25s ease;
        }
        @keyframes errIn { from{opacity:0;transform:translateY(-3px)} to{opacity:1;transform:translateY(0)} }

        .rem-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; }
        .rem-left { display:flex; align-items:center; gap:7px; cursor:pointer; }
        .rem-box {
          width:17px; height:17px; border:1.5px solid #e5e7eb; border-radius:5px;
          background:#fff; cursor:pointer; transition:all .25s;
          display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:11px;
        }
        .rem-box.checked { background:#6a11cb; border-color:#6a11cb; color:#fff; }
        .rem-txt { font-size:.78rem; color:#6b7280; font-weight:500; }
        .forgot-link { font-size:.78rem; color:#6a11cb; font-weight:700; text-decoration:none; transition:opacity .2s; }
        .forgot-link:hover { opacity:.75; }

        .btn-login {
          width:100%; padding:13px; border:none; border-radius:11px;
          background:linear-gradient(135deg,#6a11cb,#2575fc); color:#fff;
          font-size:.95rem; font-weight:700; cursor:pointer;
          font-family:'Outfit','Segoe UI',sans-serif;
          transition:all .3s; position:relative; overflow:hidden;
          box-shadow:0 6px 20px rgba(106,17,203,.32);
          display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:16px;
        }
        .btn-login::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,#2575fc,#6a11cb); opacity:0; transition:opacity .35s; }
        .btn-login:hover::before { opacity:1; }
        .btn-login:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(106,17,203,.45); }
        .btn-login:active { transform:scale(.98); }
        .btn-login:disabled { opacity:.65; cursor:not-allowed; transform:none; box-shadow:none; }
        .btn-login span { position:relative; z-index:1; }

        .divider { display:flex; align-items:center; gap:10px; margin-bottom:14px; }
        .dv-l { flex:1; height:1px; background:#f0f0f8; }
        .dv-t { font-size:.72rem; color:#9ca3af; }

        .soc-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px; }
        .soc-btn { border:1.5px solid #e5e7eb; background:#fff; border-radius:10px; padding:10px; font-size:.8rem; cursor:pointer; font-family:inherit; color:#374151; display:flex; align-items:center; justify-content:center; gap:6px; transition:all .22s; }
        .soc-btn:hover { border-color:#6a11cb; color:#6a11cb; background:#f8f5ff; transform:translateY(-1px); }

        .login-links { display:flex; flex-direction:column; gap:5px; text-align:center; }
        .login-links p { font-size:.78rem; color:#9ca3af; }
        .login-links a { color:#6a11cb; font-weight:700; text-decoration:none; }
        .login-links a:hover { text-decoration:underline; }

        .spin { width:15px; height:15px; border:2px solid rgba(255,255,255,.3); border-top-color:#fff; border-radius:50%; animation:sp .7s linear infinite; }
        @keyframes sp { to{transform:rotate(360deg)} }

        @media(max-width:660px) { .login-left{display:none} .login-right{padding:28px 20px} }
      `}</style>

      <div className="login-card">
        <div className="login-left">
          <div className="ll-ill">🎓</div>
          <div className="ll-badge">
            <div className="ll-dot" />
            <span className="ll-btx">India's #1 Free Platform</span>
          </div>
          <div className="ll-title">
            Welcome to <em>Computer<br />Excellence</em> Academy
          </div>
          <div className="ll-sub" style={{ marginTop: "8px" }}>
            "Login to access your exams, results and profile — all in one smart dashboard."
          </div>
          <div className="ll-chips">
            {[
              ["🎓", "24+ Free Courses"],
              ["🏆", "Free Certification"],
              ["📞", "Call Support Mon–Sat"],
            ].map(([ic, tx]) => (
              <div className="ll-chip" key={tx}>
                <span className="ll-chip-ic">{ic}</span>
                <span className="ll-chip-tx">{tx}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="login-right">
          <div className="lr-head">
            <div className="lr-logo">
              <div className="lr-orb">💻</div>
              <div>
                <div className="lr-name">Computer Excellence Academy</div>
                <div className="lr-sub">Digital Learning Platform</div>
              </div>
            </div>
            <div className="lr-title">Welcome Back!</div>
            <div className="lr-desc">Sign in to your free account</div>
          </div>

          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="fg">
              <input
                className={fs("email")}
                type="email"
                name="email"
                placeholder=" "
                value={data.email}
                onChange={handleChange}
              />
              <label>Email Address</label>
              {errors.email && <div className="emsg">⚠ {errors.email}</div>}
            </div>

            <div className="fg pw-wrap">
              <input
                className={fs("password")}
                type={showPass ? "text" : "password"}
                name="password"
                placeholder=" "
                value={data.password}
                onChange={handleChange}
              />
              <label>Password</label>
              <span className="pw-eye" onClick={() => setShowPass((p) => !p)}>
                {showPass ? "🙈" : "👁️"}
              </span>
              {errors.password && <div className="emsg">⚠ {errors.password}</div>}
            </div>

            <div className="rem-row">
              <div className="rem-left" onClick={() => setRemember((p) => !p)}>
                <div className={`rem-box ${remember ? "checked" : ""}`}>
                  {remember && "✓"}
                </div>
                <span className="rem-txt">Remember me</span>
              </div>
              <a href="#" className="forgot-link">
                Forgot password?
              </a>
            </div>

            <button className="btn-login" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Login to Dashboard →</span>
              )}
            </button>
          </form>

          <div className="divider">
            <div className="dv-l" />
            <div className="dv-t">or continue with</div>
            <div className="dv-l" />
          </div>

          <div className="soc-row">
            <button className="soc-btn" type="button">
              🌐 Google
            </button>
            <button className="soc-btn" type="button">
              📘 Facebook
            </button>
          </div>

          <div className="login-links">
            <p>
              Don't have an account? <Link to="/register">Register here</Link>
            </p>
            <p>
              Admin login? <Link to="/adlogin">Click here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
