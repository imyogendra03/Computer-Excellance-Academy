import React, { useEffect, useState } from "react";
import axios from "axios";

/* ══════════════════════════════════════════
   Registration.jsx — Animated & Interactive
   Floating labels, strength bar, step form
   ══════════════════════════════════════════ */

const QUALIFICATIONS = [
  "8th Pass","10th Pass","12th Pass","Diploma",
  "B.A.","B.Com","B.Sc","BCA","B.Tech",
  "M.Com","MCA","M.Tech","Other",
];

const getStrength = (pw) => {
  if (!pw) return { level: 0, label: "", color: "#e5e7eb" };
  let l = 0;
  if (pw.length >= 4) l = 1;
  if (pw.length >= 7) l = 2;
  if (pw.length >= 10 || (/[A-Z]/.test(pw) && /[0-9]/.test(pw))) l = 3;
  return [
    { level:1, label:"Weak",   color:"#ef4444" },
    { level:2, label:"Good",   color:"#f59e0b" },
    { level:3, label:"Strong", color:"#10b981" },
  ][Math.max(l - 1, 0)];
};

const Registration = () => {
  const [step,     setStep]     = useState(1);
  const [done,     setDone]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [errors,   setErrors]   = useState({});
  const [animBack, setAnimBack] = useState(false);

  const [form, setForm] = useState({
    name:"", email:"", number:"", password:"",
    address:"", college:"", qualification:"", session:"",
  });

  useEffect(() => {
    axios.get("https://computer-excellance-academy.onrender.com/api/session")
      .then(r => setSessions(r.data.data))
      .catch(() => setSessions([
        { _id:"jan25", name:"January 2025 Batch" },
        { _id:"jul25", name:"July 2025 Batch" },
        { _id:"oct25", name:"October 2025 Batch" },
      ]));
  }, []);

  const set = e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: "" }));
  };

  const validate1 = () => {
    const e = {};
    if (!form.name.trim())                                   e.name     = "Name is required";
    if (!form.email.trim() || !form.email.includes("@"))     e.email    = "Valid email required";
    if (!form.number.trim() || form.number.replace(/\D/g,"").length < 10) e.number = "10-digit phone needed";
    if (!form.password || form.password.length < 6)          e.password = "Min. 6 characters";
    if (!form.address.trim())                                e.address  = "Address is required";
    return e;
  };

  const validate2 = () => {
    const e = {};
    if (!form.college.trim())  e.college       = "College is required";
    if (!form.qualification)   e.qualification = "Select qualification";
    if (!form.session)         e.session       = "Select a session";
    return e;
  };

  const goNext = () => {
    const e = validate1();
    if (Object.keys(e).length) { setErrors(e); return; }
    setAnimBack(false);
    setStep(2);
  };

  const goBack = () => {
    setAnimBack(true);
    setStep(1);
  };

  const handleSubmit = async () => {
    const e = validate2();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      await axios.post("https://computer-excellance-academy.onrender.com/api/examinee", form);
      setDone(true);
      setTimeout(() => { window.location.href = "/"; }, 3000);
    } catch {
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const pw = getStrength(form.password);

  // Field status helper
  const fs = (name) => errors[name] ? "bad" : form[name] ? "ok" : "";

  return (
    <div style={{
      fontFamily:"'Outfit','Segoe UI',sans-serif",
      minHeight:"100vh",
      background:"linear-gradient(135deg,#0f0c29,#302b63,#24243e)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:"20px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

        .reg-card {
          display:flex; width:100%; max-width:880px; border-radius:24px;
          overflow:hidden; box-shadow:0 30px 80px rgba(0,0,0,.5);
          animation:cardIn .7s cubic-bezier(.23,1,.32,1);
        }
        @keyframes cardIn { from{opacity:0;transform:translateY(30px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }

        /* LEFT */
        .reg-left {
          width:36%; background:linear-gradient(160deg,#6a11cb,#2575fc);
          padding:38px 28px; display:flex; flex-direction:column;
          justify-content:space-between; position:relative; overflow:hidden;
        }
        .reg-left::before { content:''; position:absolute; width:260px; height:260px; border-radius:50%; background:rgba(255,255,255,.07); top:-80px; right:-80px; }
        .reg-left::after  { content:''; position:absolute; width:180px; height:180px; border-radius:50%; background:rgba(255,255,255,.05); bottom:-50px; left:-50px; }
        .rl-orb {
          width:52px; height:52px; border-radius:14px; background:rgba(255,255,255,.18);
          display:flex; align-items:center; justify-content:center; font-size:24px; margin-bottom:16px;
          border:1px solid rgba(255,255,255,.25); animation:orbPulse 3s ease-in-out infinite;
          position:relative; z-index:1;
        }
        @keyframes orbPulse { 0%,100%{box-shadow:0 0 0 0 rgba(255,255,255,.2)} 50%{box-shadow:0 0 0 10px rgba(255,255,255,0)} }
        .rl-title { font-size:1.55rem; font-weight:800; color:#fff; line-height:1.2; margin-bottom:8px; position:relative; z-index:1; }
        .rl-title em { font-style:normal; background:linear-gradient(90deg,#ffe066,#ffb347); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .rl-sub { font-size:.82rem; color:rgba(255,255,255,.7); line-height:1.8; position:relative; z-index:1; }
        .rl-feats { display:flex; flex-direction:column; gap:9px; }
        .rl-feat {
          display:flex; align-items:center; gap:10px;
          padding:10px 13px; background:rgba(255,255,255,.1);
          border:1px solid rgba(255,255,255,.12); border-radius:11px;
          animation:featIn .5s ease both;
        }
        @keyframes featIn { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }
        .rl-feat:nth-child(1){animation-delay:.1s} .rl-feat:nth-child(2){animation-delay:.2s}
        .rl-feat:nth-child(3){animation-delay:.3s} .rl-feat:nth-child(4){animation-delay:.4s}
        .rl-feat-ic { font-size:1rem; flex-shrink:0; }
        .rl-feat-tx { font-size:.78rem; color:rgba(255,255,255,.85); font-weight:500; }
        .rl-foot { font-size:.74rem; color:rgba(255,255,255,.48); position:relative; z-index:1; }
        .rl-foot a { color:rgba(255,255,255,.9); font-weight:700; text-decoration:none; }

        /* RIGHT */
        .reg-right { flex:1; background:#fff; padding:34px 30px; display:flex; flex-direction:column; }
        .rr-head { text-align:center; margin-bottom:20px; }
        .rr-title { font-size:1.45rem; font-weight:800; color:#1a1a2e; margin-bottom:4px; }
        .rr-sub   { font-size:.8rem; color:#9ca3af; }

        /* STEPS */
        .step-bar { display:flex; align-items:center; justify-content:center; margin-bottom:20px; }
        .stp-col { display:flex; flex-direction:column; align-items:center; gap:4px; }
        .stp-dot {
          width:30px; height:30px; border-radius:50%;
          border:2px solid #e5e7eb; background:#fff;
          display:flex; align-items:center; justify-content:center;
          font-size:.76rem; font-weight:700; color:#9ca3af;
          transition:all .4s cubic-bezier(.23,1,.32,1);
        }
        .stp-dot.on   { background:linear-gradient(135deg,#6a11cb,#2575fc); border-color:transparent; color:#fff; box-shadow:0 4px 14px rgba(106,17,203,.4); transform:scale(1.1); }
        .stp-dot.done { background:#10b981; border-color:#10b981; color:#fff; transform:scale(1); }
        .stp-lbl { font-size:.62rem; font-weight:600; color:#9ca3af; transition:color .3s; }
        .stp-lbl.on   { color:#6a11cb; }
        .stp-lbl.done { color:#10b981; }
        .stp-line { width:50px; height:2px; background:#e5e7eb; margin:0 6px 18px; border-radius:2px; transition:background .5s ease; }
        .stp-line.done { background:#10b981; }

        /* PANEL ANIMATION */
        .panel     { animation:panelFwd .4s cubic-bezier(.23,1,.32,1); }
        .panel.bk  { animation:panelBk  .4s cubic-bezier(.23,1,.32,1); }
        @keyframes panelFwd { from{opacity:0;transform:translateX(22px)} to{opacity:1;transform:translateX(0)} }
        @keyframes panelBk  { from{opacity:0;transform:translateX(-22px)} to{opacity:1;transform:translateX(0)} }

        /* GRID */
        .r2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; }

        /* FLOATING LABEL INPUTS */
        .fg { position:relative; margin-bottom:14px; }
        .fg input, .fg select, .fg textarea {
          width:100%; padding:16px 14px 6px; border:1.5px solid #e5e7eb; border-radius:11px;
          font-size:.88rem; font-family:'Outfit','Segoe UI',sans-serif; color:#1a1a2e;
          background:#fafafa; outline:none; transition:all .3s ease; appearance:auto;
        }
        .fg input:focus, .fg select:focus, .fg textarea:focus {
          border-color:#6a11cb; background:#fff; box-shadow:0 0 0 4px rgba(106,17,203,.09);
        }
        .fg input.ok, .fg select.ok, .fg textarea.ok   { border-color:#10b981; background:#f0fdf4; }
        .fg input.bad, .fg select.bad, .fg textarea.bad { border-color:#ef4444; background:#fff5f5; }
        .fg input.bad:focus, .fg select.bad:focus { box-shadow:0 0 0 4px rgba(239,68,68,.09); }
        .fg label {
          position:absolute; left:14px; top:50%; transform:translateY(-50%);
          font-size:.85rem; color:#9ca3af; pointer-events:none;
          transition:all .25s cubic-bezier(.23,1,.32,1);
          background:transparent; padding:0 3px;
        }
        .fg input:focus ~ label,
        .fg input:not(:placeholder-shown) ~ label,
        .fg select:focus ~ label,
        .fg textarea:focus ~ label,
        .fg textarea:not(:placeholder-shown) ~ label {
          top:5px; transform:translateY(0);
          font-size:.62rem; font-weight:700; color:#6a11cb;
          background:#fff; letter-spacing:.5px; text-transform:uppercase;
        }
        .fg input.ok ~ label, .fg select.ok ~ label { color:#10b981 !important; }
        .fg input.bad ~ label, .fg select.bad ~ label { color:#ef4444 !important; }
        .fg textarea { padding-top:20px; resize:none; min-height:76px; }
        .fg textarea ~ label { top:14px; transform:none; }
        .fg textarea:focus ~ label, .fg textarea:not(:placeholder-shown) ~ label { top:4px; transform:none; }
        .pw-wrap input { padding-right:42px; }
        .pw-eye { position:absolute; right:13px; top:50%; transform:translateY(-50%); cursor:pointer; font-size:.9rem; color:#9ca3af; user-select:none; transition:color .2s; }
        .pw-eye:hover { color:#6a11cb; }

        /* Strength */
        .str-bars { display:flex; gap:3px; margin-top:5px; }
        .str-seg { flex:1; height:3px; border-radius:2px; background:#e5e7eb; transition:background .35s ease; }
        .str-lbl { font-size:.66rem; font-weight:700; text-align:right; margin-top:3px; transition:color .3s; }

        /* Errors */
        .emsg {
          font-size:.7rem; color:#ef4444; margin-top:3px;
          display:flex; align-items:center; gap:3px; font-weight:600;
          animation:errIn .25s ease;
        }
        @keyframes errIn { from{opacity:0;transform:translateY(-3px)} to{opacity:1;transform:translateY(0)} }

        /* Summary */
        .summary {
          background:linear-gradient(135deg,rgba(106,17,203,.05),rgba(37,117,252,.05));
          border:1.5px solid rgba(106,17,203,.13); border-radius:13px;
          padding:14px 16px; margin-bottom:14px;
        }
        .sum-hd { font-size:.68rem; font-weight:800; text-transform:uppercase; letter-spacing:1.2px; color:#6a11cb; margin-bottom:10px; }
        .sum-row { display:flex; gap:8px; font-size:.8rem; margin-bottom:5px; }
        .sum-k { color:#9ca3af; min-width:52px; }
        .sum-v { color:#1a1a2e; font-weight:700; }

        /* Buttons */
        .btn {
          width:100%; padding:13px; border:none; border-radius:11px;
          font-size:.92rem; font-weight:700; cursor:pointer;
          font-family:'Outfit','Segoe UI',sans-serif;
          transition:all .3s; display:flex; align-items:center; justify-content:center; gap:8px;
        }
        .btn-p {
          background:linear-gradient(135deg,#6a11cb,#2575fc); color:#fff;
          box-shadow:0 6px 20px rgba(106,17,203,.32); position:relative; overflow:hidden;
        }
        .btn-p::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,#2575fc,#6a11cb); opacity:0; transition:opacity .35s; }
        .btn-p:hover::before { opacity:1; }
        .btn-p:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(106,17,203,.45); }
        .btn-p:active { transform:scale(.98); }
        .btn-p:disabled { opacity:.6; cursor:not-allowed; transform:none; box-shadow:none; }
        .btn-p span { position:relative; z-index:1; }
        .btn-out { background:#fff; color:#6a11cb; border:1.5px solid rgba(106,17,203,.22); margin-bottom:10px; }
        .btn-out:hover { background:rgba(106,17,203,.04); border-color:#6a11cb; }

        /* Divider */
        .divider { display:flex; align-items:center; gap:10px; margin:14px 0; }
        .dv-l { flex:1; height:1px; background:#f0f0f8; }
        .dv-t { font-size:.72rem; color:#9ca3af; }

        /* Social */
        .soc { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px; }
        .soc-btn { border:1.5px solid #e5e7eb; background:#fff; border-radius:10px; padding:10px; font-size:.8rem; cursor:pointer; font-family:inherit; color:#374151; display:flex; align-items:center; justify-content:center; gap:6px; transition:all .22s; }
        .soc-btn:hover { border-color:#6a11cb; color:#6a11cb; background:#f8f5ff; transform:translateY(-1px); }

        /* Login link */
        .login-link { text-align:center; font-size:.78rem; color:#9ca3af; margin-top:8px; }
        .login-link a { color:#6a11cb; font-weight:700; text-decoration:none; }

        /* Spinner */
        .spin { width:15px; height:15px; border:2px solid rgba(255,255,255,.3); border-top-color:#fff; border-radius:50%; animation:sp .7s linear infinite; }
        @keyframes sp { to{transform:rotate(360deg)} }

        /* SUCCESS */
        .success { text-align:center; padding:10px 0; animation:panelFwd .5s ease; }
        .s-glow { width:84px; height:84px; border-radius:50%; background:linear-gradient(135deg,#10b981,#06b6d4); display:flex; align-items:center; justify-content:center; font-size:2.4rem; margin:0 auto 16px; animation:pop .55s cubic-bezier(.23,1,.32,1); box-shadow:0 12px 40px rgba(16,185,129,.4); }
        @keyframes pop { from{opacity:0;transform:scale(.4)} to{opacity:1;transform:scale(1)} }
        .s-conf { font-size:1.4rem; letter-spacing:4px; margin-bottom:12px; animation:fly .6s ease .3s both; }
        @keyframes fly { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        .s-title { font-size:1.3rem; font-weight:800; color:#1a1a2e; margin-bottom:8px; }
        .s-sub   { font-size:.83rem; color:#6b7280; line-height:1.8; margin-bottom:16px; }
        .s-pills { display:flex; gap:6px; justify-content:center; flex-wrap:wrap; margin-bottom:16px; }
        .s-pill  { font-size:.7rem; font-weight:700; padding:4px 12px; border-radius:50px; background:#f0fdf4; color:#059669; border:1px solid #bbf7d0; }
        .s-bar   { width:180px; height:3px; background:#f0f0f8; border-radius:2px; margin:0 auto; overflow:hidden; }
        .s-fill  { height:100%; background:linear-gradient(90deg,#6a11cb,#2575fc); animation:fill 3s linear forwards; }
        @keyframes fill { from{width:0} to{width:100%} }

        /* RESPONSIVE */
        @media(max-width:700px) { .reg-left{display:none} .r2{grid-template-columns:1fr} .reg-right{padding:26px 18px} }
      `}</style>

      <div className="reg-card">

        {/* ── LEFT PANEL ── */}
        <div className="reg-left">
          <div>
            <div className="rl-orb">💻</div>
            <div className="rl-title">Join <em>Computer<br/>Excellence</em> Academy</div>
            <div className="rl-sub" style={{ marginTop:"10px" }}>
              Free courses, free certs, free support — everything you need to grow digitally.
            </div>
          </div>
          <div className="rl-feats">
            {[["🎓","24+ Free Courses"],["🏆","Free Certification"],["📄","500+ PDF Notes"],["📞","Call Support Mon–Sat"]].map(([ic,tx])=>(
              <div className="rl-feat" key={tx}>
                <span className="rl-feat-ic">{ic}</span>
                <span className="rl-feat-tx">{tx}</span>
              </div>
            ))}
          </div>
          <div className="rl-foot">Already have an account? <a href="/login">Sign in →</a></div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="reg-right">
          <div className="rr-head">
            <div className="rr-title">Create Account</div>
            <div className="rr-sub">100% free — takes less than 2 minutes</div>
          </div>

          {/* Step Indicator */}
          <div className="step-bar">
            <div className="stp-col">
              <div className={`stp-dot ${step > 1 ? "done" : "on"}`}>{step > 1 ? "✓" : "1"}</div>
              <div className={`stp-lbl ${step > 1 ? "done" : "on"}`}>Personal</div>
            </div>
            <div className={`stp-line ${step > 1 ? "done" : ""}`} />
            <div className="stp-col">
              <div className={`stp-dot ${step === 2 ? "on" : ""}`}>2</div>
              <div className={`stp-lbl ${step === 2 ? "on" : ""}`}>Academic</div>
            </div>
          </div>

          {/* ── SUCCESS ── */}
          {done && (
            <div className="success">
              <div className="s-glow">🎉</div>
              <div className="s-conf">🌟 🎓 🏆</div>
              <div className="s-title">Welcome, {form.name.split(" ")[0]}!</div>
              <p className="s-sub">Your account is ready. Start exploring free courses, download PDF notes, and get certified!</p>
              <div className="s-pills">
                <div className="s-pill">✅ Account Created</div>
                <div className="s-pill">🎓 Courses Unlocked</div>
                <div className="s-pill">📄 Notes Ready</div>
              </div>
              <div className="s-bar"><div className="s-fill" /></div>
              <p style={{ fontSize:".72rem", color:"#9ca3af", marginTop:"8px" }}>Redirecting to login…</p>
            </div>
          )}

          {/* ── STEP 1 ── */}
          {!done && step === 1 && (
            <div className={`panel ${animBack ? "bk" : ""}`}>
              <div className="r2">
                <div className="fg">
                  <input className={fs("name")} type="text" name="name" placeholder=" " value={form.name} onChange={set} />
                  <label>Full Name</label>
                  {errors.name && <div className="emsg">⚠ {errors.name}</div>}
                </div>
                <div className="fg">
                  <input className={fs("email")} type="email" name="email" placeholder=" " value={form.email} onChange={set} />
                  <label>Email Address</label>
                  {errors.email && <div className="emsg">⚠ {errors.email}</div>}
                </div>
              </div>

              <div className="r2">
                <div className="fg">
                  <input className={fs("number")} type="tel" name="number" placeholder=" " value={form.number} onChange={set} />
                  <label>Phone Number</label>
                  {errors.number && <div className="emsg">⚠ {errors.number}</div>}
                </div>
                <div className="fg pw-wrap">
                  <input className={fs("password")} type={showPass ? "text" : "password"} name="password" placeholder=" " value={form.password} onChange={set} />
                  <label>Password</label>
                  <span className="pw-eye" onClick={() => setShowPass(p => !p)}>{showPass ? "🙈" : "👁️"}</span>
                  {form.password && (
                    <>
                      <div className="str-bars">
                        {[0,1,2,3].map(i => <div key={i} className="str-seg" style={{ background: pw.level > i ? pw.color : "#e5e7eb" }} />)}
                      </div>
                      <div className="str-lbl" style={{ color: pw.color }}>{pw.label}</div>
                    </>
                  )}
                  {errors.password && <div className="emsg">⚠ {errors.password}</div>}
                </div>
              </div>

              <div className="fg">
                <textarea className={fs("address")} name="address" placeholder=" " rows="3" value={form.address} onChange={set} />
                <label>Full Address</label>
                {errors.address && <div className="emsg">⚠ {errors.address}</div>}
              </div>

              <button className="btn btn-p" onClick={goNext}><span>Next — Academic Info →</span></button>

              <div className="divider"><div className="dv-l"/><div className="dv-t">or continue with</div><div className="dv-l"/></div>
              <div className="soc">
                <button className="soc-btn" type="button">🌐 Google</button>
                <button className="soc-btn" type="button">📘 Facebook</button>
              </div>
              <div className="login-link">Already registered? <a href="/">Sign in →</a></div>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {!done && step === 2 && (
            <div className="panel">
              <div className="r2">
                <div className="fg">
                  <input className={fs("college")} type="text" name="college" placeholder=" " value={form.college} onChange={set} />
                  <label>College / Institute</label>
                  {errors.college && <div className="emsg">⚠ {errors.college}</div>}
                </div>
                <div className="fg">
                  <select className={fs("qualification")} name="qualification" value={form.qualification} onChange={set}>
                    <option value="">Select Qualification</option>
                    {QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
                  </select>
                  <label>Qualification</label>
                  {errors.qualification && <div className="emsg">⚠ {errors.qualification}</div>}
                </div>
              </div>

              <div className="fg">
                <select className={fs("session")} name="session" value={form.session} onChange={set}>
                  <option value="">Choose Your Batch</option>
                  {sessions.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
                <label>Session / Batch</label>
                {errors.session && <div className="emsg">⚠ {errors.session}</div>}
              </div>

              {/* Summary */}
              <div className="summary">
                <div className="sum-hd">📋 Your Details</div>
                {[["👤","Name",form.name],["📧","Email",form.email],["📞","Phone",form.number]].map(([ic,k,v]) => (
                  <div className="sum-row" key={k}>
                    <span>{ic}</span><span className="sum-k">{k}</span><span className="sum-v">{v||"—"}</span>
                  </div>
                ))}
              </div>

              <button className="btn btn-out" onClick={goBack}>← Back to Personal Info</button>
              <button className="btn btn-p" onClick={handleSubmit} disabled={loading}>
                {loading ? <><div className="spin"/><span>Registering…</span></> : <span>🚀 Complete Registration</span>}
              </button>
              <div className="login-link" style={{ marginTop:"10px" }}>Already registered? <a href="/login">Sign in →</a></div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Registration;
