import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const navLinks = [
  { label: "Home",      href: "/",        icon: "🏠" },
  { label: "Courses",   href: "/courses",  icon: "📚", badge: "24+" },
  { label: "PDF Notes", href: "/notes",    icon: "📄" },
  { label: "About Us",  href: "/aboutus",  icon: "👥" },
];

export const Notes = () => {
  const navigate = useNavigate();

  const [scrollY,      setScrollY]      = useState(0);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [search,       setSearch]       = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterSubject,setFilterSubject]= useState("");
  const [notes,        setNotes]        = useState([]);
  const [courses,      setCourses]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [previewNote,  setPreviewNote]  = useState(null);
  const [cardVis,      setCardVis]      = useState({});
  const cardRefs = useRef([]);

  useEffect(() => {
    const fn = () => {
      setScrollY(window.scrollY);
      if (window.scrollY > 10) setMenuOpen(false);
    };
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) setCardVis(v => ({ ...v, [e.target.dataset.idx]: true }));
      }),
      { threshold: 0.1 }
    );
    cardRefs.current.forEach(r => r && obs.observe(r));
    return () => obs.disconnect();
  }, [notes]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("https://computer-excellance-academy.onrender.com/api/course");
        const data = await res.json();
        setCourses(data?.data || []);
      } catch {}
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        let url = "https://computer-excellance-academy.onrender.com/api/notes/user?";
        if (filterCourse)  url += `courseId=${filterCourse}&`;
        if (filterSubject) url += `subject=${filterSubject}`;
        const res  = await fetch(url);
        const data = await res.json();
        setNotes(data?.data || []);
      } catch {} finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [filterCourse, filterSubject]);

  const subjects = [...new Set(notes.map(n => n.subject).filter(Boolean))];

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    (n.subject || "").toLowerCase().includes(search.toLowerCase()) ||
    (n.chapter || "").toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce((acc, note) => {
    const key = note.chapter || "General";
    if (!acc[key]) acc[key] = [];
    acc[key].push(note);
    return acc;
  }, {});

  const getYoutubeEmbed = (url) => {
    if (!url) return "";
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  return (
    <div style={{ fontFamily: "'Outfit','Segoe UI',sans-serif", background: "#f8f9ff", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@700;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        :root {
          --primary: #6c3de8; --secondary: #f7156a; --accent: #00d4ff; --green: #10b981;
          --text-dark: #1a1a2e; --text-muted: #6b7280;
          --gradient-main: linear-gradient(135deg, #0d0820 0%, #1a0640 50%, #2d1060 100%);
          --gradient-accent: linear-gradient(135deg, #6c3de8, #f7156a);
          --gradient-blue: linear-gradient(90deg, #ffffff, #00d4ff);
          --gradient-gold: linear-gradient(135deg, #f7971e, #ffd200);
          --radius: 20px;
        }
        .cea-nav { position: sticky; top: 0; z-index: 1000; width: 100%; height: 70px; padding: 0 5%; display: flex; align-items: center; transition: background 0.35s, box-shadow 0.35s; font-family: 'Outfit', sans-serif; }
        .cea-nav.scrolled { background: rgba(13,8,32,0.95); backdrop-filter: blur(24px); border-bottom: 1px solid rgba(108,61,232,0.25); box-shadow: 0 4px 40px rgba(0,0,0,0.45); }
        .cea-nav.top { background: rgba(13,8,32,0.65); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(108,61,232,0.12); }
        .nav-logo { display: flex; align-items: center; gap: 11px; text-decoration: none; margin-right: auto; }
        .nav-logo-orb { width: 42px; height: 42px; border-radius: 12px; background: var(--gradient-accent); display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 0 20px rgba(108,61,232,0.55); }
        .nav-logo-text { display: flex; flex-direction: column; }
        .nav-logo-main { font-size: 0.98rem; font-weight: 800; background: var(--gradient-blue); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .nav-logo-sub { font-size: 0.58rem; font-weight: 500; letter-spacing: 1.8px; text-transform: uppercase; color: rgba(255,255,255,0.38); }
        .nav-logo-line { height: 2px; border-radius: 2px; margin-top: 3px; background: linear-gradient(90deg,#6c3de8,#00d4ff,#f7156a); background-size: 200%; animation: shimmer 3s linear infinite; }
        @keyframes shimmer { 0%{background-position:0%} 100%{background-position:200%} }
        .nav-menu { display: flex; align-items: center; gap: 2px; list-style: none; margin: 0 18px 0 0; padding: 0; }
        .nav-menu a { display: inline-flex; align-items: center; gap: 5px; color: rgba(255,255,255,0.72); text-decoration: none; font-size: 0.875rem; font-weight: 500; padding: 8px 14px; border-radius: 10px; transition: color 0.2s, background 0.2s; }
        .nav-menu a:hover { color: #fff; background: rgba(108,61,232,0.22); }
        .nav-menu a.active { color: #fff; background: rgba(108,61,232,0.28); }
        .nav-badge { font-size: 0.58rem; font-weight: 700; padding: 2px 6px; border-radius: 5px; background: rgba(247,21,106,0.2); color: #f7156a; }
        .live-dot { width: 6px; height: 6px; border-radius: 50%; background: #f7156a; animation: ldot 1.8s ease-in-out infinite; }
        @keyframes ldot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(0.7)} }
        .nav-right { display: flex; align-items: center; gap: 10px; }
        .support-pill { display: flex; align-items: center; gap: 7px; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.28); border-radius: 50px; padding: 6px 13px; }
        .support-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); animation: ldot 1.5s infinite; }
        .support-label { font-size: 0.74rem; font-weight: 600; color: var(--green); }
        .btn-login-nav { background: var(--gradient-accent); color: white; border: none; border-radius: 10px; padding: 9px 22px; font-size: 0.84rem; font-weight: 700; cursor: pointer; font-family: 'Outfit',sans-serif; }
        .hamburger { display: none; flex-direction: column; gap: 5px; width: 38px; height: 38px; border-radius: 9px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.06); align-items: center; justify-content: center; cursor: pointer; }
        .hamburger .bar { display: block; width: 18px; height: 1.8px; background: rgba(255,255,255,0.8); border-radius: 2px; transition: all 0.3s ease; }
        .hamburger.open .bar:nth-child(1) { transform: translateY(6.8px) rotate(45deg); }
        .hamburger.open .bar:nth-child(2) { opacity: 0; }
        .hamburger.open .bar:nth-child(3) { transform: translateY(-6.8px) rotate(-45deg); }
        .mobile-drawer { position: fixed; top: 70px; left: 0; right: 0; z-index: 999; background: rgba(10,5,28,0.97); backdrop-filter: blur(24px); border-bottom: 1px solid rgba(108,61,232,0.2); box-shadow: 0 20px 60px rgba(0,0,0,0.6); padding: 16px 5% 22px; transform: translateY(-110%); opacity: 0; transition: 0.3s; }
        .mobile-drawer.open { transform: translateY(0); opacity: 1; }
        .mob-links { display: flex; flex-direction: column; gap: 3px; margin-bottom: 14px; }
        .mob-link { display: flex; align-items: center; justify-content: space-between; color: rgba(255,255,255,0.75); text-decoration: none; font-size: 0.9rem; font-weight: 500; padding: 11px 14px; border-radius: 11px; }
        .mob-actions { display: flex; gap: 10px; }
        .mob-btn-login { flex: 1; background: var(--gradient-accent); color: white; border: none; border-radius: 11px; padding: 12px; font-size: 0.88rem; font-weight: 700; cursor: pointer; }

        .marquee-bar { background: var(--gradient-accent); padding: 11px 0; overflow: hidden; white-space: nowrap; }
        .marquee-inner { display: inline-block; animation: mq 24s linear infinite; color: white; font-weight: 600; font-size: 0.88rem; }
        @keyframes mq { 0%{transform:translateX(100vw)} 100%{transform:translateX(-100%)} }

        .hero { background: var(--gradient-main); position: relative; overflow: hidden; padding: 90px 5% 110px; display: flex; align-items: center; min-height: 400px; }
        .hero::before { content:''; position:absolute; width:600px; height:600px; background:radial-gradient(circle,rgba(108,61,232,0.4) 0%,transparent 70%); top:-120px; right:-80px; border-radius:50%; }
        .hero-inner { position:relative; z-index:2; max-width:720px; }
        .hero-badge { display:inline-flex; align-items:center; gap:8px; background:rgba(108,61,232,0.25); border:1px solid rgba(108,61,232,0.45); padding:6px 18px; border-radius:50px; color:var(--accent); font-size:0.82rem; font-weight:600; margin-bottom:22px; }
        .hero-badge span { width:7px; height:7px; background:var(--accent); border-radius:50%; animation:pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.6)} }
        .hero h1 { font-family:'Playfair Display',serif; font-size:clamp(2rem,4.5vw,3.4rem); font-weight:900; color:#fff; line-height:1.15; margin-bottom:18px; }
        .hero h1 em { font-style:normal; background:var(--gradient-gold); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .hero p { color:rgba(255,255,255,0.72); font-size:1.05rem; line-height:1.75; margin-bottom:0; max-width:580px; }

        .filter-bar { background: white; padding: 24px 5%; box-shadow: 0 4px 24px rgba(108,61,232,0.07); position: sticky; top: 70px; z-index: 900; }
        .filter-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
        .search-wrap { position: relative; flex: 1; min-width: 200px; }
        .search-inp { width: 100%; padding: 11px 44px 11px 16px; border-radius: 11px; border: 1.5px solid rgba(108,61,232,0.15); background: #f8f9ff; font-size: 0.92rem; font-family: inherit; outline: none; color: var(--text-dark); }
        .search-inp:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(108,61,232,0.08); }
        .search-ic { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 1rem; pointer-events: none; }
        .fn-select { padding: 11px 14px; border-radius: 11px; border: 1.5px solid rgba(108,61,232,0.15); background: #f8f9ff; font-size: 0.88rem; font-family: inherit; outline: none; color: var(--text-dark); min-width: 160px; }
        .fn-select:focus { border-color: var(--primary); }
        .count-badge { margin-left: auto; background: rgba(108,61,232,0.08); border: 1px solid rgba(108,61,232,0.15); color: var(--primary); font-size: 0.8rem; font-weight: 700; padding: 6px 14px; border-radius: 50px; white-space: nowrap; }

        .notes-section { padding: 48px 5%; }
        .chapter-title { font-weight: 800; font-size: 1.05rem; color: #0f172a; padding: 10px 0 8px; border-bottom: 2px solid #e2e8f0; margin-bottom: 16px; }
        .notes-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; margin-bottom: 32px; }

        .note-card { background: white; border-radius: var(--radius); overflow: hidden; border: 1px solid #eeeef8; transition: all 0.4s cubic-bezier(0.23,1,0.32,1); box-shadow: 0 4px 20px rgba(0,0,0,0.05); opacity: 0; transform: translateY(24px); display: flex; flex-direction: column; }
        .note-card.show { opacity: 1; transform: translateY(0); }
        .note-card:hover { transform: translateY(-8px); box-shadow: 0 20px 50px rgba(108,61,232,0.15); }
        .note-card.locked { opacity: 0.72; }

        .nc-head { height: 110px; display: flex; align-items: center; justify-content: center; font-size: 2.8rem; position: relative; }
        .nc-badge-free { position: absolute; top: 10px; right: 10px; font-size: 0.66rem; font-weight: 800; padding: 4px 10px; border-radius: 50px; background: #10b981; color: white; }
        .nc-badge-paid { position: absolute; top: 10px; right: 10px; font-size: 0.66rem; font-weight: 800; padding: 4px 10px; border-radius: 50px; background: #f59e0b; color: white; }
        .nc-badge-lock { position: absolute; top: 10px; left: 10px; font-size: 0.66rem; font-weight: 800; padding: 4px 10px; border-radius: 50px; background: rgba(0,0,0,0.5); color: white; }

        .nc-body { padding: 16px 18px; flex: 1; display: flex; flex-direction: column; }
        .nc-title { font-weight: 800; font-size: 0.95rem; color: var(--text-dark); margin-bottom: 6px; }
        .nc-desc { font-size: 0.82rem; color: var(--text-muted); line-height: 1.65; margin-bottom: 12px; flex: 1; }
        .nc-meta { font-size: 0.76rem; color: var(--text-muted); }

        .nc-footer { padding: 12px 18px; border-top: 1px solid #f0f0f8; display: flex; gap: 8px; }
        .btn-preview-note { flex: 1; background: var(--gradient-accent); color: white; border: none; padding: 9px 14px; border-radius: 10px; font-size: 0.82rem; font-weight: 700; cursor: pointer; font-family: inherit; }
        .btn-ext-link { background: rgba(108,61,232,0.08); border: 1.5px solid rgba(108,61,232,0.2); color: var(--primary); padding: 9px 12px; border-radius: 10px; font-size: 0.82rem; font-weight: 600; cursor: pointer; font-family: inherit; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; }
        .nc-locked-msg { display: flex; align-items: center; gap: 6px; background: #fef3c7; color: #92400e; padding: 8px 12px; border-radius: 10px; font-size: 0.78rem; font-weight: 600; width: 100%; justify-content: center; }

        /* Fullscreen Modal */
        .fn-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 9999; display: flex; flex-direction: column; }
        .fn-modal-topbar { display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; background: #0f172a; color: #fff; gap: 12px; flex-shrink: 0; }
        .fn-modal-topbar h5 { margin: 0; font-weight: 700; font-size: 1rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .fn-modal-tabs { display: flex; gap: 8px; flex-shrink: 0; }
        .fn-modal-tab { border: none; font-weight: 600; border-radius: 10px; padding: 7px 14px; cursor: pointer; font-size: 0.82rem; background: rgba(255,255,255,0.12); color: #fff; }
        .fn-modal-tab.active-pdf { background: #2563eb; }
        .fn-modal-tab.active-video { background: #dc2626; }
        .fn-modal-tab.active-external { background: #16a34a; }
        .fn-modal-close { border: none; background: rgba(255,255,255,0.12); color: #fff; width: 38px; height: 38px; border-radius: 10px; cursor: pointer; font-size: 18px; flex-shrink: 0; }
        .fn-modal-body { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
        .fn-pdf-frame { width: 100%; height: 100%; border: none; flex: 1; }
        .fn-video-frame { width: 100%; height: 100%; border: none; flex: 1; }
        .fn-ext-body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 16px; color: #fff; }
        .fn-ext-link { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; border-radius: 14px; background: linear-gradient(135deg,#2563eb,#4f46e5); color: #fff; text-decoration: none; font-weight: 700; font-size: 1rem; }

        .login-prompt { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 40px; text-align: center; }
        .login-prompt p { color: rgba(255,255,255,0.8); font-size: 1rem; }
        .login-prompt-btn { background: var(--gradient-accent); color: white; border: none; padding: 12px 28px; border-radius: 12px; font-size: 0.95rem; font-weight: 700; cursor: pointer; font-family: inherit; }

        .cta { background: var(--gradient-accent); padding: 80px 5%; text-align: center; }
        .cta-title { font-family:'Playfair Display',serif; font-size:clamp(1.9rem,4vw,3rem); font-weight:900; color:white; margin-bottom:14px; }
        .cta-sub { color:rgba(255,255,255,0.85); font-size:1.03rem; margin-bottom:36px; }
        .cta-btns { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; }
        .btn-cta-w { background:white; color:var(--primary); border:none; padding:15px 40px; border-radius:14px; font-size:1rem; font-weight:800; cursor:pointer; font-family:inherit; }
        .btn-cta-o { background:transparent; color:white; border:2px solid rgba(255,255,255,0.6); padding:13px 32px; border-radius:14px; font-size:1rem; font-weight:700; cursor:pointer; font-family:inherit; }

        .footer { background:#080514; padding:60px 5% 28px; color:rgba(255,255,255,0.65); }
        .footer-grid { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:44px; max-width:1100px; margin:0 auto 50px; }
        .ft-logo-wrap { display:flex; align-items:center; gap:10px; margin-bottom:14px; }
        .ft-logo-name { font-weight:800; font-size:1rem; background:var(--gradient-blue); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .ft-desc { font-size:0.87rem; line-height:1.85; margin-bottom:22px; margin-top:10px; }
        .socials { display:flex; gap:10px; }
        .soc { width:38px; height:38px; border-radius:10px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.06); display:flex; align-items:center; justify-content:center; font-size:1rem; text-decoration:none; color:white; }
        .ft-h { color:white; font-weight:700; font-size:0.92rem; margin-bottom:18px; }
        .ft-l { list-style:none; display:flex; flex-direction:column; gap:9px; }
        .ft-l a { color:rgba(255,255,255,0.55); text-decoration:none; font-size:0.85rem; }
        .footer-bottom { border-top:1px solid rgba(255,255,255,0.07); padding-top:24px; text-align:center; font-size:0.82rem; max-width:1100px; margin:0 auto; }
        .scroll-top { position:fixed; bottom:28px; right:28px; z-index:999; width:46px; height:46px; border-radius:13px; background:var(--gradient-accent); border:none; color:white; font-size:1.2rem; cursor:pointer; opacity:0; pointer-events:none; display:flex; align-items:center; justify-content:center; }
        .scroll-top.show { opacity:1; pointer-events:auto; }

        @media(max-width:1060px){ .nav-menu{display:none} .support-pill{display:none} .btn-login-nav{display:none} .hamburger{display:flex} .notes-grid{grid-template-columns:repeat(2,1fr)} .footer-grid{grid-template-columns:1fr 1fr;gap:30px} }
        @media(max-width:640px){ .notes-grid{grid-template-columns:1fr} .filter-inner{flex-direction:column;align-items:stretch} .footer-grid{grid-template-columns:1fr} }
      `}</style>

      {/* Navbar */}
      <nav className={`cea-nav ${scrollY > 15 ? "scrolled" : "top"}`}>
        <a href="/" className="nav-logo">
          <div className="nav-logo-orb">💻</div>
          <div className="nav-logo-text">
            <span className="nav-logo-main">Computer Excellence Academy</span>
            <span className="nav-logo-sub">Digital Learning Platform</span>
            <div className="nav-logo-line" />
          </div>
        </a>
        <ul className="nav-menu">
          {navLinks.map(({ label, href, icon, badge }) => (
            <li key={href}>
              <a href={href} className={window.location.pathname === href ? "active" : ""}>
                {icon} {label}
                {badge && <span className="nav-badge">{badge}</span>}
              </a>
            </li>
          ))}
          <li><a href="#" style={{ color: "#f7156a" }}><span className="live-dot" /> Live Class</a></li>
        </ul>
        <div className="nav-right">
          <div className="support-pill"><div className="support-dot" /><span className="support-label">Support Open</span></div>
          <button className="btn-login-nav" onClick={() => navigate("/login")}>Login →</button>
          <div className={`hamburger ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(o => !o)}>
            <span className="bar" /><span className="bar" /><span className="bar" />
          </div>
        </div>
      </nav>

      <div className={`mobile-drawer ${menuOpen ? "open" : ""}`}>
        <div className="mob-links">
          {navLinks.map(({ label, href, icon }) => (
            <a key={href} href={href} className="mob-link">{icon} {label}</a>
          ))}
        </div>
        <div className="mob-actions">
          <button className="mob-btn-login" onClick={() => navigate("/login")}>Login →</button>
        </div>
      </div>

      {/* Marquee */}
      <div className="marquee-bar">
        <span className="marquee-inner">
          📝 MS Word &nbsp;•&nbsp; 📊 MS Excel &nbsp;•&nbsp; 🧾 Tally Prime &nbsp;•&nbsp; 🎨 Photoshop &nbsp;•&nbsp; 🐍 Python &nbsp;•&nbsp; ⚡ JavaScript &nbsp;•&nbsp; 🌐 HTML & CSS &nbsp;•&nbsp; ☕ Java &nbsp;•&nbsp; 💻 C & C++ &nbsp;•&nbsp; 📞 Support Open Mon–Sat &nbsp;&nbsp;&nbsp;
        </span>
      </div>

      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-badge"><span />Study Notes — Course Wise</div>
          <h1>Free & Premium <em>Study Notes</em></h1>
          <p>
            Free notes sabke liye available hain. Paid notes access karne ke liye login karke batch purchase karo.
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-inner">
          <div className="search-wrap">
            <input className="search-inp" placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} />
            <span className="search-ic">🔍</span>
          </div>
          <select className="fn-select" value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
            <option value="">All Courses</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
          </select>
          <select className="fn-select" value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="count-badge">{filtered.length} notes</div>
        </div>
      </div>

      {/* Notes Section */}
      <section className="notes-section" style={{ maxWidth: 1200, margin: "0 auto" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "#64748b" }}>
            Notes load ho rahe hain...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "#64748b" }}>
            <div style={{ fontSize: "4rem", marginBottom: 16 }}>📭</div>
            <h3>Koi note nahi mila</h3>
            <p>Admin ne abhi notes add nahi kiye hain.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([chapter, chapterNotes]) => (
            <div key={chapter} className="mb-4">
              <div className="chapter-title">
                📖 {chapter}
                <span style={{ color: "#64748b", fontWeight: 400, fontSize: "0.85rem", marginLeft: 8 }}>
                  ({chapterNotes.length} notes)
                </span>
              </div>
              <div className="notes-grid">
                {chapterNotes.map((note, i) => {
                  const isFree = note.type === "free";
                  const icons = ["📝","📊","📸","🧾","🎨","💻","⚙️","☕","🐍","🌐","⚡","📋"];
                  const colors = ["#667eea","#43e97b","#f093fb","#fa709a","#a18cd1","#4facfe","#f7971e","#f43f5e","#84fab0","#43e97b","#f7971e","#fa709a"];
                  const idx = i % icons.length;

                  return (
                    <div
                      key={note._id}
                      className={`note-card ${cardVis[i] ? "show" : ""} ${!isFree ? "locked" : ""}`}
                      ref={el => cardRefs.current[i] = el}
                      data-idx={i}
                      style={{ transitionDelay: `${(i % 3) * 80}ms` }}
                    >
                      <div className="nc-head" style={{ background: `linear-gradient(135deg,${colors[idx]}22,${colors[idx]}44)` }}>
                        <span style={{ position: "relative", zIndex: 1 }}>{icons[idx]}</span>
                        {isFree
                          ? <div className="nc-badge-free">🆓 FREE</div>
                          : <div className="nc-badge-paid">💰 PAID</div>
                        }
                        {!isFree && <div className="nc-badge-lock">🔒 Login Required</div>}
                      </div>

                      <div className="nc-body">
                        <div className="nc-title">{note.title}</div>
                        {note.description && <div className="nc-desc">{note.description}</div>}
                        <div className="nc-meta">
                          📚 {note.course?.title || "-"} &nbsp;|&nbsp; 📂 {note.subject || "-"}
                        </div>
                      </div>

                      <div className="nc-footer">
                        {isFree ? (
                          <>
                            {note.fileUrl && (
                              <button className="btn-preview-note" onClick={() => setPreviewNote({ ...note, activeTab: "pdf" })}>
                                📄 PDF Preview
                              </button>
                            )}
                            {note.videoLink && (
                              <button className="btn-preview-note" style={{ background: "linear-gradient(135deg,#dc2626,#ef4444)" }} onClick={() => setPreviewNote({ ...note, activeTab: "video" })}>
                                🎬 Video
                              </button>
                            )}
                            {note.externalLink && (
                              <a href={note.externalLink} target="_blank" rel="noreferrer" className="btn-ext-link">
                                🔗 Link
                              </a>
                            )}
                          </>
                        ) : (
                          <div className="nc-locked-msg">
                            🔒 Login karke batch purchase karo
                            <button
                              style={{ border: "none", background: "#2563eb", color: "#fff", borderRadius: 8, padding: "4px 10px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", marginLeft: 8 }}
                              onClick={() => navigate("/login")}
                            >
                              Login
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </section>

      {/* CTA */}
      <section className="cta">
        <h2 className="cta-title">Paid Notes Access chahiye?</h2>
        <p className="cta-sub">Login karke batch purchase karo aur saare premium notes unlock karo.</p>
        <div className="cta-btns">
          <button className="btn-cta-w" onClick={() => navigate("/login")}>🔐 Login Now</button>
          <button className="btn-cta-o" onClick={() => navigate("/courses")}>📚 View Courses</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <div className="ft-logo-wrap">
              <div className="nav-logo-orb" style={{ width: 36, height: 36, borderRadius: 9, fontSize: 17 }}>💻</div>
              <span className="ft-logo-name">Computer Excellence Academy</span>
            </div>
            <p className="ft-desc">Admin-managed notes with free and premium access system.</p>
            <div className="socials">
              {["📘","📸","▶️","🐦"].map((s, i) => <a key={i} href="#" className="soc">{s}</a>)}
            </div>
          </div>
          <div>
            <div className="ft-h">Quick Links</div>
            <ul className="ft-l">
              <li><a href="/">Home</a></li>
              <li><a href="/courses">Courses</a></li>
              <li><a href="/notes">Notes</a></li>
              <li><a href="/aboutus">About Us</a></li>
            </ul>
          </div>
          <div>
            <div className="ft-h">Access</div>
            <ul className="ft-l">
              <li><a href="/login">Login</a></li>
              <li><a href="/register">Register</a></li>
              <li><a href="/userdash/notes">My Notes</a></li>
              <li><a href="/userdash/courses">Buy Batch</a></li>
            </ul>
          </div>
          <div>
            <div className="ft-h">Contact</div>
            <ul className="ft-l">
              <li><a href="#">📞 Mon–Sat</a></li>
              <li><a href="#">⏰ 10AM – 12PM</a></li>
              <li><a href="#">📧 support@cea.edu</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Computer Excellence Academy. All rights reserved.</p>
        </div>
      </footer>

      <button className={`scroll-top ${scrollY > 400 ? "show" : ""}`} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>↑</button>

      {/* Fullscreen Modal */}
      {previewNote && (
        <div className="fn-modal-overlay">
          <div className="fn-modal-topbar">
            <h5>{previewNote.title}</h5>
            <div className="fn-modal-tabs">
              {previewNote.fileUrl && (
                <button className={`fn-modal-tab ${previewNote.activeTab === "pdf" ? "active-pdf" : ""}`} onClick={() => setPreviewNote({ ...previewNote, activeTab: "pdf" })}>📄 PDF</button>
              )}
              {previewNote.videoLink && (
                <button className={`fn-modal-tab ${previewNote.activeTab === "video" ? "active-video" : ""}`} onClick={() => setPreviewNote({ ...previewNote, activeTab: "video" })}>🎬 Video</button>
              )}
              {previewNote.externalLink && (
                <button className={`fn-modal-tab ${previewNote.activeTab === "external" ? "active-external" : ""}`} onClick={() => setPreviewNote({ ...previewNote, activeTab: "external" })}>🔗 Link</button>
              )}
            </div>
            <button className="fn-modal-close" onClick={() => setPreviewNote(null)}>✕</button>
          </div>
          <div className="fn-modal-body">
            {previewNote.activeTab === "pdf" && previewNote.fileUrl && (
              <iframe src={previewNote.fileUrl} className="fn-pdf-frame" title="PDF Preview" />
            )}
            {previewNote.activeTab === "video" && previewNote.videoLink && (
              <iframe src={getYoutubeEmbed(previewNote.videoLink)} className="fn-video-frame" title="Video" allowFullScreen />
            )}
            {previewNote.activeTab === "external" && previewNote.externalLink && (
              <div className="fn-ext-body">
                <p>Ye content external platform pe available hai:</p>
                <a href={previewNote.externalLink} target="_blank" rel="noreferrer" className="fn-ext-link">🔗 Open in New Tab</a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
