import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const navLinks = [
  { label: "Home",      href: "/home",    icon: "🏠" },
  { label: "Courses",   href: "/course",  icon: "📚", badge: "24+" },
  { label: "PDF Notes", href: "/notes",   icon: "📄" },
  { label: "About Us",  href: "/aboutus", icon: "👥" },
];

const STATS = [
  { icon: "🎓", num: "15,000+", label: "Happy Students",      desc: "Across 28 states" },
  { icon: "📚", num: "24+",     label: "Free Courses",        desc: "Constantly updated" },
  { icon: "🏆", num: "12,400+", label: "Certificates Issued", desc: "Resume-ready" },
  { icon: "⭐", num: "4.9/5",   label: "Student Rating",      desc: "Verified reviews" },
];

const VALUES = [
  { icon: "🆓", title: "Always Free",       desc: "Every course, certificate and PDF note is 100% free — no hidden costs, ever." },
  { icon: "🎯", title: "Quality First",      desc: "Curriculum crafted by industry experts to ensure practical, job-ready skills." },
  { icon: "🤝", title: "Student Support",    desc: "Live call support Mon–Sat, 10AM–12PM so no student is ever left behind." },
  { icon: "🌍", title: "Accessible to All",  desc: "Digital literacy is a right, not a privilege — available to everyone in India." },
  { icon: "📜", title: "Certified Learning", desc: "Industry-recognized certificates that boost your resume and LinkedIn profile." },
  { icon: "🔄", title: "Lifetime Access",    desc: "Enroll once and access course content forever — rewatch anytime, at your pace." },
];

// ── TEACHERS ─────────────────────────────────────────────
const TEACHERS = [
  {
    name: "Prof. Ramesh Sharma",
    role: "Founder & Computer Science Expert",
    emoji: "👨‍🏫",
    color: "#667eea",
    exp: "15 Years",
    edu: [
      "M.Tech — Computer Science, IIT Delhi",
      "B.Tech — Information Technology, NIT Jaipur",
      "Certified Microsoft Office Specialist",
    ],
    subjects: ["Basic Computer", "MS Office", "Networking", "ADCA"],
    achievement: "Trained 8,000+ students across India",
    quote: "Education is the most powerful weapon to change the world.",
  },
  {
    name: "Priya Mehta",
    role: "Web Development & Design Lead",
    emoji: "👩‍💻",
    color: "#f093fb",
    exp: "9 Years",
    edu: [
      "MCA — Software Engineering, Pune University",
      "B.Sc — Computer Science, Mumbai University",
      "Google Certified UX Designer",
    ],
    subjects: ["HTML & CSS", "JavaScript", "React JS", "Graphic Design"],
    achievement: "Built 50+ production-level web apps",
    quote: "Good design is making something beautiful. Great design is making it work.",
  },
  {
    name: "Arun Verma",
    role: "Accounting & Tally Prime Trainer",
    emoji: "👨‍💼",
    color: "#4facfe",
    exp: "15 Years",
    edu: [
      "M.Com — Accounting & Finance, Delhi University",
      "B.Com — Commerce, Agra University",
      "Certified Tally Prime Professional",
    ],
    subjects: ["Tally Prime", "GST Filing", "MS Excel", "Accounting"],
    achievement: "Placed 500+ students in accounting roles",
    quote: "Numbers tell the truth — learn to speak their language.",
  },
  {
    name: "Sneha Gupta",
    role: "Graphic Design & Media Expert",
    emoji: "👩‍🎨",
    color: "#fa709a",
    exp: "7 Years",
    edu: [
      "BFA — Visual Communication, NIFT Delhi",
      "Diploma in Multimedia Design, MAAC",
      "Adobe Certified Expert — Photoshop & Illustrator",
    ],
    subjects: ["Photoshop", "CorelDraw", "Canva", "Video Editing"],
    achievement: "Designed for 30+ national brands",
    quote: "Every pixel has a purpose — make it count.",
  },
];

// ── CHIEF GUESTS ──────────────────────────────────────────
const CHIEF_GUESTS = [
  {
    name: "Dr. Arvind Khanna",
    title: "IAS Officer — District Collector",
    emoji: "🏛️",
    color: "#667eea",
    event: "Annual Convocation 2024",
    quote: "Computer Excellence Academy is bridging the digital divide in our society. This initiative is truly commendable.",
  },
  {
    name: "Mrs. Sunita Rao",
    title: "Principal — Govt. Degree College",
    emoji: "🎓",
    color: "#43e97b",
    event: "Certification Ceremony 2023",
    quote: "The quality of education and free access to certification makes this academy a beacon of hope for rural students.",
  },
  {
    name: "Mr. Vikram Singh",
    title: "CEO — TechBridge Solutions",
    emoji: "💼",
    color: "#f093fb",
    event: "Industry Partnership Meet 2024",
    quote: "I have personally hired CEA graduates. Their practical skills and dedication are unmatched in the industry.",
  },
  {
    name: "Prof. Meera Joshi",
    title: "Head of CS Dept — State University",
    emoji: "🔬",
    color: "#fa709a",
    event: "Digital India Workshop 2024",
    quote: "The curriculum here matches international standards. This academy is shaping the future of digital India.",
  },
];

// ── GALLERY (Student + Certificate) ───────────────────────
const GALLERY = [
  { name: "Aarav Sharma",   course: "Web Development",       cert: "Advanced Web Dev Certificate",  emoji: "👨‍💻", color: "#667eea", city: "Lucknow",    year: "2024" },
  { name: "Priya Singh",    course: "Basic Computer",        cert: "Computer Fundamentals Cert.",    emoji: "👩‍🎓", color: "#f093fb", city: "Kanpur",     year: "2024" },
  { name: "Rahul Gupta",    course: "Tally Prime + GST",     cert: "Tally Prime Professional Cert.", emoji: "👨‍💼", color: "#43e97b", city: "Agra",       year: "2023" },
  { name: "Neha Verma",     course: "Graphic Design",        cert: "Creative Design Certificate",    emoji: "👩‍🎨", color: "#fa709a", city: "Varanasi",   year: "2024" },
  { name: "Amit Kumar",     course: "Python Programming",    cert: "Python Developer Certificate",   emoji: "👨‍🔬", color: "#84fab0", city: "Mathura",    year: "2024" },
  { name: "Kavya Patel",    course: "MS Office Complete",    cert: "MS Office Expert Certificate",   emoji: "👩‍💻", color: "#ffecd2", city: "Allahabad",  year: "2023" },
  { name: "Deepak Yadav",   course: "ADCA Diploma",          cert: "ADCA Diploma Certificate",       emoji: "👨‍🎓", color: "#4facfe", city: "Meerut",     year: "2024" },
  { name: "Ritu Sharma",    course: "English Typing",        cert: "Typing Speed Certificate",       emoji: "👩‍💼", color: "#a18cd1", city: "Gorakhpur",  year: "2023" },
];

// ── EVENTS ─────────────────────────────────────────────────
const EVENTS = [
  { title: "Annual Convocation Ceremony 2024",   date: "15 March 2024",    type: "Convocation",    emoji: "🎓", color: "#667eea", desc: "500+ students received their certificates in a grand ceremony attended by district officials and industry leaders.",        attendees: "500+", location: "City Hall, Lucknow" },
  { title: "Digital India Workshop 2024",         date: "22 January 2024",  type: "Workshop",       emoji: "💻", color: "#43e97b", desc: "A hands-on workshop on emerging technologies, cybersecurity and the future of digital India — open to all students.",  attendees: "300+", location: "CEA Campus" },
  { title: "Industry Partnership Meet 2024",      date: "10 February 2024", type: "Corporate",      emoji: "🤝", color: "#f093fb", desc: "Top companies met our graduates for placement discussions. 50+ students received job offers on the spot.",               attendees: "200+", location: "Tech Hub, Lucknow" },
  { title: "Certification Ceremony 2023",         date: "20 December 2023", type: "Convocation",    emoji: "🏆", color: "#fa709a", desc: "Year-end celebration where 800+ students of the batch 2023 received their completion certificates with pride.",         attendees: "800+", location: "City Auditorium" },
  { title: "Free Computer Literacy Camp",         date: "5 August 2023",    type: "Social",         emoji: "🌍", color: "#ffd700", desc: "A 3-day free camp in rural areas teaching basic computer skills to 1000+ underprivileged students.",                    attendees: "1000+", location: "Rural Uttar Pradesh" },
  { title: "Graphic Design Hackathon 2023",       date: "18 October 2023",  type: "Competition",    emoji: "🎨", color: "#a18cd1", desc: "Students competed in a 24-hour design challenge. Top 10 designs were featured in a national digital magazine.",          attendees: "150+", location: "CEA Campus" },
];

const AboutUs = () => {
  const navigate = useNavigate();
  const [scrollY,       setScrollY]       = useState(0);
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [galleryFilter, setGalleryFilter] = useState("All");
  const [activeTeacher, setActiveTeacher] = useState(null);

  useEffect(() => {
    const fn = () => {
      setScrollY(window.scrollY);
      if (window.scrollY > 10) setMenuOpen(false);
    };
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ fontFamily: "'Outfit','Segoe UI',sans-serif", background: "#f8f9ff", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@700;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        :root {
          --primary: #6c3de8; --secondary: #f7156a; --accent: #00d4ff; --green: #10b981;
          --text-dark: #1a1a2e; --text-muted: #6b7280;
          --gradient-main:   linear-gradient(135deg,#0d0820 0%,#1a0640 50%,#2d1060 100%);
          --gradient-accent: linear-gradient(135deg,#6c3de8,#f7156a);
          --gradient-blue:   linear-gradient(90deg,#ffffff,#00d4ff);
          --gradient-gold:   linear-gradient(135deg,#f7971e,#ffd200);
          --shadow-card: 0 10px 40px rgba(0,0,0,0.08);
          --shadow-glow: 0 0 40px rgba(108,61,232,0.25);
          --radius: 20px;
        }

        /* ── NAVBAR ── */
        .cea-nav { position:sticky;top:0;z-index:1000;width:100%;height:70px;padding:0 5%;display:flex;align-items:center;transition:background .35s,box-shadow .35s;font-family:'Outfit',sans-serif; }
        .cea-nav.scrolled { background:rgba(13,8,32,.95);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-bottom:1px solid rgba(108,61,232,.25);box-shadow:0 4px 40px rgba(0,0,0,.45); }
        .cea-nav.top { background:rgba(13,8,32,.65);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-bottom:1px solid rgba(108,61,232,.12); }
        .nav-logo { display:flex;align-items:center;gap:11px;text-decoration:none;margin-right:auto;flex-shrink:0; }
        .nav-logo-orb { width:42px;height:42px;border-radius:12px;background:var(--gradient-accent);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;box-shadow:0 0 20px rgba(108,61,232,.55);transition:transform .35s cubic-bezier(.23,1,.32,1); }
        .nav-logo-orb:hover { transform:rotate(-10deg) scale(1.12); }
        .nav-logo-text { display:flex;flex-direction:column; }
        .nav-logo-main { font-size:.98rem;font-weight:800;line-height:1.15;background:var(--gradient-blue);-webkit-background-clip:text;-webkit-text-fill-color:transparent; }
        .nav-logo-sub  { font-size:.58rem;font-weight:500;letter-spacing:1.8px;text-transform:uppercase;color:rgba(255,255,255,.38);margin-top:1px; }
        .nav-logo-line { height:2px;border-radius:2px;margin-top:3px;background:linear-gradient(90deg,#6c3de8,#00d4ff,#f7156a);background-size:200%;animation:shimmer 3s linear infinite; }
        @keyframes shimmer { 0%{background-position:0%}100%{background-position:200%} }
        .nav-menu { display:flex;align-items:center;gap:2px;list-style:none;margin:0 18px 0 0;padding:0; }
        .nav-menu a { display:inline-flex;align-items:center;gap:5px;color:rgba(255,255,255,.72);text-decoration:none;font-size:.875rem;font-weight:500;white-space:nowrap;padding:8px 14px;border-radius:10px;transition:color .2s,background .2s;position:relative; }
        .nav-menu a:hover { color:#fff;background:rgba(108,61,232,.22); }
        .nav-menu a.active { color:#fff;background:rgba(108,61,232,.28); }
        .nav-menu a.active::after { content:'';position:absolute;bottom:6px;left:50%;transform:translateX(-50%);width:18px;height:2px;border-radius:2px;background:linear-gradient(90deg,var(--primary),var(--accent)); }
        .nav-badge { font-size:.58rem;font-weight:700;padding:2px 6px;border-radius:5px;background:rgba(247,21,106,.2);color:#f7156a;text-transform:uppercase; }
        .live-dot { width:6px;height:6px;border-radius:50%;background:#f7156a;flex-shrink:0;animation:ldot 1.8s ease-in-out infinite; }
        @keyframes ldot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(.7)} }
        .nav-right { display:flex;align-items:center;gap:10px; }
        .nav-divider { width:1px;height:22px;background:rgba(255,255,255,.1);flex-shrink:0; }
        .support-pill { display:flex;align-items:center;gap:7px;background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.28);border-radius:50px;padding:6px 13px;cursor:default;white-space:nowrap; }
        .support-dot   { width:7px;height:7px;border-radius:50%;background:var(--green);animation:ldot 1.5s infinite;flex-shrink:0; }
        .support-label { font-size:.74rem;font-weight:600;color:var(--green); }
        .btn-register  { border:1.5px solid rgba(108,61,232,.5);color:rgba(255,255,255,.85);background:transparent;border-radius:10px;padding:8px 18px;font-size:.84rem;font-weight:600;cursor:pointer;transition:all .22s;font-family:'Outfit',sans-serif;white-space:nowrap; }
        .btn-register:hover { background:rgba(108,61,232,.2);border-color:rgba(108,61,232,.8);color:white; }
        .btn-login-nav { position:relative;overflow:hidden;background:var(--gradient-accent);color:white;border:none;border-radius:10px;padding:9px 22px;font-size:.84rem;font-weight:700;cursor:pointer;transition:transform .25s,box-shadow .25s;font-family:'Outfit',sans-serif;box-shadow:0 4px 18px rgba(108,61,232,.45);white-space:nowrap; }
        .btn-login-nav::before { content:'';position:absolute;inset:0;background:linear-gradient(135deg,#f7156a,#6c3de8);opacity:0;transition:opacity .3s; }
        .btn-login-nav:hover::before { opacity:1; }
        .btn-login-nav:hover { transform:translateY(-2px);box-shadow:0 8px 28px rgba(108,61,232,.6); }
        .btn-login-nav span { position:relative;z-index:1; }
        .hamburger { display:none;flex-direction:column;gap:5px;width:38px;height:38px;border-radius:9px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);align-items:center;justify-content:center;cursor:pointer;transition:all .22s;flex-shrink:0; }
        .hamburger:hover { background:rgba(108,61,232,.25);border-color:rgba(108,61,232,.4); }
        .hamburger .bar { display:block;width:18px;height:1.8px;background:rgba(255,255,255,.8);border-radius:2px;transition:all .3s ease;transform-origin:center; }
        .hamburger.open .bar:nth-child(1) { transform:translateY(6.8px) rotate(45deg); }
        .hamburger.open .bar:nth-child(2) { opacity:0;transform:scaleX(0); }
        .hamburger.open .bar:nth-child(3) { transform:translateY(-6.8px) rotate(-45deg); }
        .mobile-drawer { position:fixed;top:70px;left:0;right:0;z-index:999;background:rgba(10,5,28,.97);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-bottom:1px solid rgba(108,61,232,.2);box-shadow:0 20px 60px rgba(0,0,0,.6);padding:16px 5% 22px;transform:translateY(-110%);opacity:0;transition:transform .35s cubic-bezier(.23,1,.32,1),opacity .3s;font-family:'Outfit',sans-serif; }
        .mobile-drawer.open { transform:translateY(0);opacity:1; }
        .mob-support { display:flex;align-items:center;gap:10px;background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.25);border-radius:12px;padding:12px 14px;margin-bottom:12px; }
        .mob-support-title { font-size:.84rem;font-weight:600;color:var(--green); }
        .mob-support-sub   { font-size:.72rem;color:rgba(16,185,129,.7);margin-top:1px; }
        .mob-links { display:flex;flex-direction:column;gap:3px;margin-bottom:14px; }
        .mob-link { display:flex;align-items:center;justify-content:space-between;color:rgba(255,255,255,.75);text-decoration:none;font-size:.9rem;font-weight:500;padding:11px 14px;border-radius:11px;border:1px solid transparent;transition:all .2s; }
        .mob-link:hover  { background:rgba(108,61,232,.2);color:white;border-color:rgba(108,61,232,.2); }
        .mob-link.active { background:rgba(108,61,232,.25);color:white;border-color:rgba(108,61,232,.3); }
        .mob-link-left { display:flex;align-items:center;gap:10px; }
        .mob-chevron { font-size:13px;color:rgba(255,255,255,.28); }
        .mob-hr { height:1px;background:rgba(255,255,255,.07);margin:8px 0; }
        .mob-actions { display:flex;gap:10px; }
        .mob-btn-reg   { flex:1;border:1.5px solid rgba(108,61,232,.5);color:rgba(255,255,255,.85);background:transparent;border-radius:11px;padding:12px;font-size:.88rem;font-weight:600;cursor:pointer;font-family:'Outfit',sans-serif;transition:all .2s; }
        .mob-btn-reg:hover { background:rgba(108,61,232,.2);color:white; }
        .mob-btn-login { flex:1;background:var(--gradient-accent);color:white;border:none;border-radius:11px;padding:12px;font-size:.88rem;font-weight:700;cursor:pointer;font-family:'Outfit',sans-serif;box-shadow:0 4px 18px rgba(108,61,232,.4); }

        /* ── MARQUEE ── */
        .mq { background:var(--gradient-accent);padding:11px 0;overflow:hidden;white-space:nowrap; }
        .mq-i { display:inline-block;animation:mq 24s linear infinite;color:white;font-weight:600;font-size:.88rem; }
        @keyframes mq { 0%{transform:translateX(100vw)}100%{transform:translateX(-100%)} }

        /* ── HERO ── */
        .hero { background:var(--gradient-main);position:relative;overflow:hidden;padding:100px 5% 120px;min-height:500px;display:flex;align-items:center;text-align:center;justify-content:center; }
        .hero::before { content:'';position:absolute;width:700px;height:700px;background:radial-gradient(circle,rgba(108,61,232,.4) 0%,transparent 70%);top:-150px;right:-100px;border-radius:50%;animation:glw 8s ease-in-out infinite; }
        .hero::after  { content:'';position:absolute;width:400px;height:400px;background:radial-gradient(circle,rgba(247,21,106,.18) 0%,transparent 70%);bottom:-80px;left:5%;border-radius:50%;animation:glw 10s ease-in-out infinite reverse; }
        @keyframes glw { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1) translate(10px,-10px)} }
        .hero-inner { position:relative;z-index:2;max-width:780px; }
        .h-badge { display:inline-flex;align-items:center;gap:8px;background:rgba(108,61,232,.25);border:1px solid rgba(108,61,232,.45);padding:6px 18px;border-radius:50px;color:var(--accent);font-size:.82rem;font-weight:600;margin-bottom:22px;backdrop-filter:blur(10px); }
        .h-badge span { width:7px;height:7px;background:var(--accent);border-radius:50%;animation:pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.6)} }
        .hero h1 { font-family:'Playfair Display',serif;font-size:clamp(2.4rem,5vw,4rem);font-weight:900;color:#fff;line-height:1.12;margin-bottom:20px; }
        .hero h1 em { font-style:normal;background:var(--gradient-gold);-webkit-background-clip:text;-webkit-text-fill-color:transparent; }
        .hero p { color:rgba(255,255,255,.72);font-size:1.08rem;line-height:1.8;margin-bottom:36px;max-width:620px;margin-left:auto;margin-right:auto; }
        .hero-btns { display:flex;gap:14px;justify-content:center;flex-wrap:wrap; }
        .btn-hp { background:var(--gradient-accent);color:white;border:none;padding:15px 36px;border-radius:14px;font-size:1rem;font-weight:700;cursor:pointer;transition:all .3s;font-family:inherit;box-shadow:0 8px 30px rgba(108,61,232,.5); }
        .btn-hp:hover { transform:translateY(-3px);box-shadow:0 14px 40px rgba(108,61,232,.6); }
        .btn-hs { background:rgba(255,255,255,.08);color:white;border:1.5px solid rgba(255,255,255,.25);padding:15px 32px;border-radius:14px;font-size:1rem;font-weight:600;cursor:pointer;transition:all .3s;font-family:inherit;backdrop-filter:blur(10px); }
        .btn-hs:hover { background:rgba(255,255,255,.16);border-color:rgba(255,255,255,.5); }

        /* ── STATS ── */
        .stats-s { background:white;padding:60px 5%;box-shadow:var(--shadow-card); }
        .stats-g { display:grid;grid-template-columns:repeat(4,1fr);gap:24px;max-width:1100px;margin:0 auto; }
        .sc { text-align:center;padding:30px 20px;border-radius:var(--radius);border:2px solid #f0f0f8;transition:all .3s;position:relative;overflow:hidden; }
        .sc::before { content:'';position:absolute;bottom:0;left:0;right:0;height:3px;background:var(--gradient-accent);transform:scaleX(0);transition:transform .3s; }
        .sc:hover::before { transform:scaleX(1); }
        .sc:hover { transform:translateY(-6px);box-shadow:var(--shadow-glow);border-color:transparent; }
        .sc-icon { font-size:2.4rem;margin-bottom:12px; }
        .sc-num  { font-size:2.4rem;font-weight:900;background:var(--gradient-accent);-webkit-background-clip:text;-webkit-text-fill-color:transparent; }
        .sc-lbl  { color:var(--text-muted);font-size:.88rem;font-weight:600;margin-top:6px; }
        .sc-desc { color:#9ca3af;font-size:.76rem;margin-top:3px; }

        /* ── SECTION COMMON ── */
        .sec { padding:88px 5%; }
        .sec-light { background:#f8f9ff; }
        .sec-dark  { background:var(--gradient-main); }
        .sec-white { background:white; }
        .sh { text-align:center;margin-bottom:56px; }
        .s-tag { display:inline-block;background:linear-gradient(135deg,rgba(108,61,232,.1),rgba(247,21,106,.1));border:1px solid rgba(108,61,232,.2);color:var(--primary);font-size:.78rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:5px 14px;border-radius:50px;margin-bottom:14px; }
        .s-tag-w { background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.2);color:#00d4ff; }
        .s-title { font-family:'Playfair Display',serif;font-size:clamp(1.8rem,4vw,2.8rem);font-weight:900;color:var(--text-dark);margin-bottom:14px;line-height:1.2; }
        .s-title-w { color:white; }
        .s-sub { color:var(--text-muted);font-size:.97rem;max-width:560px;margin:0 auto;line-height:1.8; }
        .s-sub-w { color:rgba(255,255,255,.65); }

        /* ── MISSION ── */
        .mission-grid { display:grid;grid-template-columns:1fr 1fr;gap:72px;max-width:1100px;margin:0 auto;align-items:center; }
        .mission-img-wrap { position:relative; }
        .m-img { width:100%;border-radius:24px;object-fit:cover;height:400px;display:block; }
        .m-badge { position:absolute;bottom:-20px;right:-20px;background:var(--gradient-accent);color:white;border-radius:18px;padding:20px 24px;text-align:center;box-shadow:0 12px 40px rgba(108,61,232,.5); }
        .mb-num { font-size:2rem;font-weight:900; }
        .mb-lbl { font-size:.78rem;font-weight:600;opacity:.9; }
        .mission-content h2 { font-family:'Playfair Display',serif;font-size:clamp(1.8rem,3.5vw,2.6rem);font-weight:900;color:var(--text-dark);margin-bottom:18px;line-height:1.2; }
        .mission-content h2 em { font-style:normal;background:var(--gradient-accent);-webkit-background-clip:text;-webkit-text-fill-color:transparent; }
        .mission-content p { color:var(--text-muted);font-size:1rem;line-height:1.85;margin-bottom:16px; }
        .m-checks { display:flex;flex-direction:column;gap:12px;margin-top:24px; }
        .mck { display:flex;align-items:center;gap:12px;font-size:.92rem;color:var(--text-dark);font-weight:500; }
        .mck-ic { width:28px;height:28px;border-radius:8px;background:rgba(108,61,232,.1);color:var(--primary);display:flex;align-items:center;justify-content:center;font-size:.9rem;flex-shrink:0; }

        /* ════════════════════════════════
           TEACHERS SECTION
        ════════════════════════════════ */
        .teachers-grid { display:grid;grid-template-columns:repeat(2,1fr);gap:28px;max-width:1100px;margin:0 auto; }
        .teacher-card {
          background:white;border-radius:24px;overflow:hidden;
          border:1px solid #eeeef8;transition:all .35s cubic-bezier(.23,1,.32,1);
          box-shadow:0 4px 20px rgba(0,0,0,.06);
        }
        .teacher-card:hover { transform:translateY(-8px);box-shadow:0 28px 64px rgba(108,61,232,.18);border-color:rgba(108,61,232,.22); }
        .tc-head { display:flex;align-items:center;gap:20px;padding:28px 28px 0; }
        .tc-avatar { width:88px;height:88px;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:2.8rem;flex-shrink:0; }
        .tc-info { flex:1; }
        .tc-name { font-weight:900;font-size:1.05rem;color:var(--text-dark);margin-bottom:4px; }
        .tc-role { font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px; }
        .tc-exp-badge { display:inline-flex;align-items:center;gap:6px;font-size:.72rem;font-weight:700;padding:4px 12px;border-radius:50px;background:rgba(108,61,232,.08);color:var(--primary); }
        .tc-body { padding:20px 28px 28px; }
        .tc-quote { font-size:.88rem;color:var(--text-muted);font-style:italic;line-height:1.7;padding:14px 16px;background:#f8f9ff;border-left:3px solid;border-radius:0 10px 10px 0;margin-bottom:18px; }
        .tc-section-title { font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:var(--text-muted);margin-bottom:10px;margin-top:16px; }
        .tc-edu { display:flex;flex-direction:column;gap:8px; }
        .tc-edu-item { display:flex;align-items:flex-start;gap:10px;font-size:.83rem;color:var(--text-dark); }
        .tc-edu-dot { width:6px;height:6px;border-radius:50%;flex-shrink:0;margin-top:6px; }
        .tc-subjects { display:flex;gap:6px;flex-wrap:wrap;margin-top:12px; }
        .tc-subj-pill { font-size:.72rem;font-weight:700;padding:4px 11px;border-radius:50px;border:1.5px solid;opacity:.9; }
        .tc-achievement { display:flex;align-items:center;gap:10px;margin-top:16px;padding:12px 14px;border-radius:12px; }
        .tc-ach-icon { font-size:1.2rem; }
        .tc-ach-text { font-size:.82rem;font-weight:600;color:var(--text-dark); }

        /* ════════════════════════════════
           CHIEF GUESTS
        ════════════════════════════════ */
        .guests-grid { display:grid;grid-template-columns:repeat(2,1fr);gap:24px;max-width:1100px;margin:0 auto; }
        .guest-card {
          background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);
          border-radius:22px;padding:32px;backdrop-filter:blur(10px);
          transition:all .3s;position:relative;overflow:hidden;
        }
        .guest-card::before { content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--gradient-accent);transform:scaleX(0);transition:transform .35s; }
        .guest-card:hover::before { transform:scaleX(1); }
        .guest-card:hover { background:rgba(255,255,255,.09);transform:translateY(-5px); }
        .guest-top { display:flex;align-items:center;gap:18px;margin-bottom:20px; }
        .guest-avatar { width:72px;height:72px;border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:2.2rem;flex-shrink:0; }
        .guest-name  { font-weight:900;font-size:1rem;color:white;margin-bottom:4px; }
        .guest-title { font-size:.78rem;color:rgba(255,255,255,.6);font-weight:500; }
        .guest-event-badge { display:inline-flex;align-items:center;gap:6px;font-size:.7rem;font-weight:700;padding:4px 12px;border-radius:50px;background:rgba(0,212,255,.12);border:1px solid rgba(0,212,255,.25);color:var(--accent);margin-bottom:14px; }
        .guest-quote { font-size:.88rem;color:rgba(255,255,255,.72);line-height:1.8;font-style:italic;padding-left:14px;border-left:2px solid rgba(255,255,255,.2); }
        .guest-quote-icon { font-size:1.4rem;color:rgba(255,255,255,.2);margin-bottom:8px; }

        /* ════════════════════════════════
           GALLERY SECTION
        ════════════════════════════════ */
        .gallery-filters { display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:40px; }
        .gf-btn { padding:8px 20px;border-radius:50px;border:1.5px solid rgba(108,61,232,.18);background:transparent;font-size:.83rem;font-weight:600;color:var(--text-muted);cursor:pointer;transition:all .2s;font-family:inherit; }
        .gf-btn.on { background:var(--gradient-accent);color:white;border-color:transparent;box-shadow:0 4px 16px rgba(108,61,232,.35); }
        .gf-btn:hover:not(.on) { border-color:var(--primary);color:var(--primary); }
        .gallery-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:20px;max-width:1200px;margin:0 auto; }
        .gallery-card {
          border-radius:18px;overflow:hidden;background:white;
          border:1px solid #eeeef8;transition:all .35s cubic-bezier(.23,1,.32,1);
          box-shadow:0 4px 16px rgba(0,0,0,.06);
        }
        .gallery-card:hover { transform:translateY(-8px) scale(1.02);box-shadow:0 20px 50px rgba(108,61,232,.2);border-color:rgba(108,61,232,.22); }
        .gc-photo { height:160px;display:flex;align-items:center;justify-content:center;font-size:3.8rem;position:relative;overflow:hidden; }
        .gc-photo::after { content:'';position:absolute;inset:0;opacity:.12;background:inherit; }
        .gc-cert-badge { position:absolute;bottom:10px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:.62rem;font-weight:800;text-transform:uppercase;letter-spacing:.8px;padding:4px 12px;border-radius:50px;background:rgba(0,0,0,.55);color:white;backdrop-filter:blur(6px); }
        .gc-body { padding:16px; }
        .gc-name   { font-weight:800;font-size:.92rem;color:var(--text-dark);margin-bottom:3px; }
        .gc-course { font-size:.75rem;color:var(--primary);font-weight:600;margin-bottom:6px; }
        .gc-meta   { display:flex;align-items:center;justify-content:space-between; }
        .gc-city   { font-size:.72rem;color:var(--text-muted); }
        .gc-year   { font-size:.7rem;font-weight:700;padding:2px 9px;border-radius:5px;background:rgba(108,61,232,.08);color:var(--primary); }

        /* ════════════════════════════════
           EVENTS SECTION
        ════════════════════════════════ */
        .events-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:1200px;margin:0 auto; }
        .event-card {
          background:white;border-radius:22px;overflow:hidden;
          border:1px solid #eeeef8;transition:all .35s cubic-bezier(.23,1,.32,1);
          box-shadow:0 4px 16px rgba(0,0,0,.06);display:flex;flex-direction:column;
        }
        .event-card:hover { transform:translateY(-8px);box-shadow:0 24px 56px rgba(108,61,232,.18);border-color:rgba(108,61,232,.2); }
        .ev-head { height:130px;display:flex;align-items:center;justify-content:center;font-size:3.6rem;position:relative;overflow:hidden; }
        .ev-head::after { content:'';position:absolute;inset:0;opacity:.12;background:inherit; }
        .ev-type-badge { position:absolute;top:12px;left:12px;font-size:.66rem;font-weight:800;text-transform:uppercase;letter-spacing:1px;padding:4px 11px;border-radius:50px;background:rgba(0,0,0,.5);color:white;backdrop-filter:blur(6px); }
        .ev-date-badge { position:absolute;top:12px;right:12px;font-size:.66rem;font-weight:700;padding:4px 11px;border-radius:50px;background:rgba(108,61,232,.8);color:white; }
        .ev-body { padding:20px;flex:1;display:flex;flex-direction:column; }
        .ev-title { font-weight:800;font-size:.97rem;color:var(--text-dark);margin-bottom:10px;line-height:1.4; }
        .ev-desc  { font-size:.82rem;color:var(--text-muted);line-height:1.7;flex:1;margin-bottom:14px; }
        .ev-meta  { display:flex;gap:12px;align-items:center;padding-top:12px;border-top:1px solid #f0f0f8; }
        .ev-meta-item { display:flex;align-items:center;gap:5px;font-size:.75rem;color:var(--text-muted); }
        .ev-meta-item strong { color:var(--text-dark);font-weight:700; }

        /* ── VALUES ── */
        .values-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:1100px;margin:0 auto; }
        .v-card { background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:var(--radius);padding:28px 24px;transition:all .3s;backdrop-filter:blur(10px); }
        .v-card:hover { background:rgba(255,255,255,.1);transform:translateY(-5px); }
        .v-icon { width:56px;height:56px;background:rgba(108,61,232,.3);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.6rem;margin-bottom:16px;border:1px solid rgba(108,61,232,.3); }
        .v-title { color:white;font-weight:700;font-size:.95rem;margin-bottom:8px; }
        .v-desc  { color:rgba(255,255,255,.62);font-size:.84rem;line-height:1.75; }

        /* ── CONTACT ── */
        .contact-grid { display:grid;grid-template-columns:1fr 1fr;gap:48px;max-width:1000px;margin:0 auto;align-items:start; }
        .contact-info { display:flex;flex-direction:column;gap:16px; }
        .ci { display:flex;align-items:center;gap:16px;padding:18px 20px;background:white;border-radius:16px;border:1px solid #eeeef8;transition:all .3s;box-shadow:0 4px 16px rgba(0,0,0,.04); }
        .ci:hover { transform:translateY(-3px);box-shadow:0 12px 32px rgba(108,61,232,.12);border-color:rgba(108,61,232,.2); }
        .ci-icon { width:46px;height:46px;border-radius:12px;background:var(--gradient-accent);display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0; }
        .ci-label { font-size:.72rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:2px; }
        .ci-val a, .ci-val span { font-size:.92rem;font-weight:600;color:var(--text-dark);text-decoration:none;transition:color .2s; }
        .ci-val a:hover { color:var(--primary); }
        .ch { background:var(--gradient-main);border-radius:20px;padding:30px; }
        .ch-title { font-family:'Playfair Display',serif;font-size:1.2rem;font-weight:900;color:white;margin-bottom:18px; }
        .ch-row { display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.08); }
        .ch-row:last-of-type { border-bottom:none; }
        .ch-day  { font-size:.85rem;color:rgba(255,255,255,.7);font-weight:500; }
        .ch-time { font-size:.85rem;font-weight:700; }
        .ch-time.open   { color:#10b981; }
        .ch-time.closed { color:rgba(255,255,255,.3); }
        .ch-pill { display:inline-flex;align-items:center;gap:6px;background:rgba(16,185,129,.15);border:1px solid rgba(16,185,129,.3);border-radius:50px;padding:8px 16px;margin-top:18px; }
        .ch-dot  { width:7px;height:7px;border-radius:50%;background:#10b981;animation:ldot 1.5s infinite; }
        .ch-pill-text { font-size:.8rem;font-weight:600;color:#10b981; }

        /* ── CTA ── */
        .cta { background:var(--gradient-accent);padding:90px 5%;text-align:center;position:relative;overflow:hidden; }
        .cta::before { content:'';position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"); }
        .cta-title { font-family:'Playfair Display',serif;font-size:clamp(2rem,4vw,3rem);font-weight:900;color:white;margin-bottom:14px;position:relative; }
        .cta-sub { color:rgba(255,255,255,.85);font-size:1.03rem;margin-bottom:36px;position:relative; }
        .cta-btns { display:flex;gap:14px;justify-content:center;flex-wrap:wrap;position:relative; }
        .btn-cw { background:white;color:var(--primary);border:none;padding:15px 40px;border-radius:14px;font-size:1rem;font-weight:800;cursor:pointer;transition:all .3s;font-family:inherit;box-shadow:0 8px 30px rgba(0,0,0,.18); }
        .btn-cw:hover { transform:translateY(-3px);box-shadow:0 14px 40px rgba(0,0,0,.28); }
        .btn-co { background:transparent;color:white;border:2px solid rgba(255,255,255,.6);padding:13px 32px;border-radius:14px;font-size:1rem;font-weight:700;cursor:pointer;transition:all .3s;font-family:inherit; }
        .btn-co:hover { background:rgba(255,255,255,.15);border-color:white; }

        /* ── FOOTER ── */
        .footer { background:#080514;padding:60px 5% 28px;color:rgba(255,255,255,.65); }
        .ft-g { display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:44px;max-width:1100px;margin:0 auto 50px; }
        .ft-lw { display:flex;align-items:center;gap:10px;margin-bottom:14px; }
        .ft-ln { font-weight:800;font-size:1rem;background:var(--gradient-blue);-webkit-background-clip:text;-webkit-text-fill-color:transparent; }
        .ft-d  { font-size:.87rem;line-height:1.85;margin-bottom:22px;margin-top:10px; }
        .socs  { display:flex;gap:10px; }
        .soc   { width:38px;height:38px;border-radius:10px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;font-size:1rem;text-decoration:none;color:white;transition:all .2s; }
        .soc:hover { background:var(--gradient-accent);border-color:transparent;transform:translateY(-2px); }
        .ft-h  { color:white;font-weight:700;font-size:.92rem;margin-bottom:18px; }
        .ft-l  { list-style:none;display:flex;flex-direction:column;gap:9px; }
        .ft-l a { color:rgba(255,255,255,.55);text-decoration:none;font-size:.85rem;transition:color .2s; }
        .ft-l a:hover { color:var(--accent); }
        .ft-bot { border-top:1px solid rgba(255,255,255,.07);padding-top:24px;text-align:center;font-size:.82rem;max-width:1100px;margin:0 auto; }

        /* Scroll top */
        .scroll-top { position:fixed;bottom:28px;right:28px;z-index:999;width:46px;height:46px;border-radius:13px;background:var(--gradient-accent);border:none;color:white;font-size:1.2rem;cursor:pointer;box-shadow:0 8px 28px rgba(108,61,232,.5);transition:all .3s;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none; }
        .scroll-top.show { opacity:1;pointer-events:auto; }
        .scroll-top:hover { transform:translateY(-4px); }

        /* ── RESPONSIVE ── */
        @media(max-width:1060px){ .nav-menu{display:none} .support-pill{display:none} .btn-register{display:none} .btn-login-nav{display:none} .nav-divider{display:none} .hamburger{display:flex} .teachers-grid{grid-template-columns:1fr} .guests-grid{grid-template-columns:1fr} .gallery-grid{grid-template-columns:repeat(2,1fr)} .events-grid{grid-template-columns:repeat(2,1fr)} .values-grid{grid-template-columns:repeat(2,1fr)} .contact-grid{grid-template-columns:1fr} .ft-g{grid-template-columns:1fr 1fr;gap:30px} .stats-g{grid-template-columns:repeat(2,1fr)} .mission-grid{grid-template-columns:1fr;gap:40px} }
        @media(max-width:640px){ .gallery-grid{grid-template-columns:1fr 1fr} .events-grid{grid-template-columns:1fr} .values-grid{grid-template-columns:1fr} .ft-g{grid-template-columns:1fr} .nav-logo-main{font-size:.82rem} .nav-logo-sub{display:none} .nav-logo-line{display:none} }
      `}</style>

      {/* ══ NAVBAR ══ */}
      <nav className={`cea-nav ${scrollY > 15 ? "scrolled" : "top"}`}>
        <a href="/home" className="nav-logo">
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
                {icon} {label}{badge && <span className="nav-badge">{badge}</span>}
              </a>
            </li>
          ))}
          <li><a href="#" style={{ color: "#f7156a" }}><span className="live-dot" /> Live Class</a></li>
        </ul>
        <div className="nav-right">
          <div className="support-pill"><div className="support-dot" /><span className="support-label">Support Open</span></div>
          <div className="nav-divider" />
          <button className="btn-register" onClick={() => navigate("/")}>Register</button>
          <button className="btn-login-nav" onClick={() => navigate("/")}><span>Login →</span></button>
          <div className={`hamburger ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(o => !o)}>
            <span className="bar" /><span className="bar" /><span className="bar" />
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${menuOpen ? "open" : ""}`}>
        <div className="mob-support"><div className="support-dot" /><div><div className="mob-support-title">Support Open Now</div><div className="mob-support-sub">Mon–Sat · 10AM – 12PM</div></div></div>
        <div className="mob-links">
          {navLinks.map(({ label, href, icon, badge }) => (
            <a key={href} href={href} className={`mob-link ${window.location.pathname === href ? "active" : ""}`}>
              <span className="mob-link-left">{icon} {label}{badge && <span className="nav-badge">{badge}</span>}</span>
              <span className="mob-chevron">›</span>
            </a>
          ))}
          <a href="#" className="mob-link" style={{ color:"#f7156a" }}><span className="mob-link-left"><span className="live-dot" /> Live Class</span><span className="mob-chevron">›</span></a>
        </div>
        <div className="mob-hr" />
        <div className="mob-actions">
          <button className="mob-btn-reg"   onClick={() => navigate("/")}>Register</button>
          <button className="mob-btn-login" onClick={() => navigate("/")}>Login →</button>
        </div>
      </div>

      {/* ══ MARQUEE ══ */}
      <div className="mq"><span className="mq-i">🎓 15,000+ Happy Students &nbsp;•&nbsp; 📚 24+ Free Courses &nbsp;•&nbsp; 🏆 Free Certification &nbsp;•&nbsp; 📞 Call Support Mon–Sat 10AM–12PM &nbsp;•&nbsp; 📄 500+ PDF Notes &nbsp;•&nbsp; ⭐ 4.9/5 Rating &nbsp;•&nbsp; 🌍 Available Across India &nbsp;&nbsp;&nbsp;</span></div>

      {/* ══ HERO ══ */}
      <section className="hero">
        <div className="hero-inner">
          <div className="h-badge"><span />Empowering India Since 2020</div>
          <h1>About <em>Computer Excellence</em> Academy</h1>
          <p>India's leading free digital education platform — built on a mission to make quality computer education accessible to every student, everywhere.</p>
          <div className="hero-btns">
            <button className="btn-hp" onClick={() => navigate("/course")}>📚 Explore Courses</button>
            <button className="btn-hs" onClick={() => document.getElementById("contact").scrollIntoView({ behavior:"smooth" })}>📞 Contact Us</button>
          </div>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <section className="stats-s">
        <div className="stats-g">
          {STATS.map((s,i) => (
            <div className="sc" key={i}>
              <div className="sc-icon">{s.icon}</div>
              <div className="sc-num">{s.num}</div>
              <div className="sc-lbl">{s.label}</div>
              <div className="sc-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ MISSION ══ */}
      <section className="sec sec-light">
        <div className="mission-grid">
          <div className="mission-img-wrap">
            <img className="m-img" src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80" alt="Our Mission" />
            <div className="m-badge"><div className="mb-num">4+ Yrs</div><div className="mb-lbl">of Excellence</div></div>
          </div>
          <div className="mission-content">
            <div className="s-tag">🎯 Our Mission</div>
            <h2>Making <em>Digital Education</em> Free for Every Indian</h2>
            <p>At Computer Excellence Academy, we believe quality computer education should never come with a price tag. We provide practical, job-ready courses taught by industry experts — completely free.</p>
            <div className="m-checks">
              {["100% Free — Always, No Hidden Fees","Expert-led Live & Recorded Classes","Free PDF Notes & Study Material","Industry-recognized Free Certificates","Live Call Support Mon–Sat 10AM–12PM","Mobile, Tablet & Desktop Accessible"].map((item,i) => (
                <div className="mck" key={i}><div className="mck-ic">✅</div>{item}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          TEACHERS SECTION
      ══════════════════════════════ */}
      <section className="sec sec-white">
        <div className="sh">
          <div className="s-tag">👨‍🏫 Expert Faculty</div>
          <h2 className="s-title">Meet Our Teachers</h2>
          <p className="s-sub">Learn from seasoned professionals — their education, experience and passion make the difference</p>
        </div>
        <div className="teachers-grid">
          {TEACHERS.map((t, i) => (
            <div className="teacher-card" key={i}>
              <div className="tc-head">
                <div className="tc-avatar" style={{ background:`${t.color}18`, boxShadow:`0 0 0 3px ${t.color}30` }}>{t.emoji}</div>
                <div className="tc-info">
                  <div className="tc-name">{t.name}</div>
                  <div className="tc-role" style={{ color: t.color }}>{t.role}</div>
                  <div className="tc-exp-badge">🕐 {t.exp} Experience</div>
                </div>
              </div>
              <div className="tc-body">
                <div className="tc-quote" style={{ borderLeftColor: t.color }}>"{t.quote}"</div>

                <div className="tc-section-title">🎓 Education & Qualifications</div>
                <div className="tc-edu">
                  {t.edu.map((e, ei) => (
                    <div className="tc-edu-item" key={ei}>
                      <div className="tc-edu-dot" style={{ background: t.color }} />
                      {e}
                    </div>
                  ))}
                </div>

                <div className="tc-section-title">📚 Subjects Taught</div>
                <div className="tc-subjects">
                  {t.subjects.map((s, si) => (
                    <span className="tc-subj-pill" key={si} style={{ color: t.color, borderColor: `${t.color}40`, background: `${t.color}0d` }}>{s}</span>
                  ))}
                </div>

                <div className="tc-achievement" style={{ background:`${t.color}0d`, borderRadius:"10px" }}>
                  <span className="tc-ach-icon">🏆</span>
                  <span className="tc-ach-text">{t.achievement}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════
          CHIEF GUESTS SECTION
      ══════════════════════════════ */}
      <section className="sec sec-dark">
        <div className="sh">
          <div className="s-tag s-tag-w">🌟 Distinguished Visitors</div>
          <h2 className="s-title s-title-w">Chief Guests & Dignitaries</h2>
          <p className="s-sub s-sub-w">Honored guests who have graced our events and shared their inspiring words with our students</p>
        </div>
        <div className="guests-grid">
          {CHIEF_GUESTS.map((g, i) => (
            <div className="guest-card" key={i}>
              <div className="guest-top">
                <div className="guest-avatar" style={{ background:`${g.color}22`, boxShadow:`0 0 0 2px ${g.color}44` }}>{g.emoji}</div>
                <div>
                  <div className="guest-name">{g.name}</div>
                  <div className="guest-title">{g.title}</div>
                </div>
              </div>
              <div className="guest-event-badge">📅 {g.event}</div>
              <div className="guest-quote-icon">"</div>
              <div className="guest-quote">{g.quote}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════
          GALLERY SECTION
      ══════════════════════════════ */}
      <section className="sec sec-light">
        <div className="sh">
          <div className="s-tag">🏆 Student Success</div>
          <h2 className="s-title">Student Gallery & Certificates</h2>
          <p className="s-sub">Celebrating our students' achievements — every certificate earned is a dream fulfilled</p>
        </div>
        <div className="gallery-filters">
          {["All","2024","2023"].map(f => (
            <button key={f} className={`gf-btn ${galleryFilter===f?"on":""}`} onClick={() => setGalleryFilter(f)}>{f === "All" ? "All Students" : `Batch ${f}`}</button>
          ))}
        </div>
        <div className="gallery-grid">
          {GALLERY.filter(g => galleryFilter === "All" || g.year === galleryFilter).map((g, i) => (
            <div className="gallery-card" key={i}>
              <div className="gc-photo" style={{ background:`linear-gradient(135deg,${g.color}22,${g.color}44)` }}>
                <span style={{ position:"relative", zIndex:1 }}>{g.emoji}</span>
                <div className="gc-cert-badge">🏆 Certificate Holder</div>
              </div>
              <div className="gc-body">
                <div className="gc-name">{g.name}</div>
                <div className="gc-course" style={{ color: g.color }}>{g.course}</div>
                <div style={{ fontSize:".76rem", color:"var(--text-muted)", marginBottom:"10px", lineHeight:1.5 }}>{g.cert}</div>
                <div className="gc-meta">
                  <span className="gc-city">📍 {g.city}</span>
                  <span className="gc-year">{g.year}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════
          EVENTS SECTION
      ══════════════════════════════ */}
      <section className="sec sec-white">
        <div className="sh">
          <div className="s-tag">📅 Our Events</div>
          <h2 className="s-title">Events & Celebrations</h2>
          <p className="s-sub">From convocations to workshops — every event is a milestone in our journey together</p>
        </div>
        <div className="events-grid">
          {EVENTS.map((ev, i) => (
            <div className="event-card" key={i}>
              <div className="ev-head" style={{ background:`linear-gradient(135deg,${ev.color}22,${ev.color}44)` }}>
                <span style={{ position:"relative", zIndex:1 }}>{ev.emoji}</span>
                <div className="ev-type-badge">{ev.type}</div>
                <div className="ev-date-badge">{ev.date}</div>
              </div>
              <div className="ev-body">
                <div className="ev-title">{ev.title}</div>
                <div className="ev-desc">{ev.desc}</div>
                <div className="ev-meta">
                  <div className="ev-meta-item">👥 <strong>{ev.attendees}</strong> Attended</div>
                  <div className="ev-meta-item">📍 {ev.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ VALUES ══ */}
      <section className="sec sec-dark">
        <div className="sh">
          <div className="s-tag s-tag-w">💡 Our Values</div>
          <h2 className="s-title s-title-w">What We Stand For</h2>
          <p className="s-sub s-sub-w">Every decision guided by these values — putting students first, always</p>
        </div>
        <div className="values-grid">
          {VALUES.map((v,i) => (
            <div className="v-card" key={i}>
              <div className="v-icon">{v.icon}</div>
              <div className="v-title">{v.title}</div>
              <div className="v-desc">{v.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CONTACT ══ */}
      <section className="sec sec-light" id="contact">
        <div className="sh">
          <div className="s-tag">📞 Get in Touch</div>
          <h2 className="s-title">Contact Us</h2>
          <p className="s-sub">Have a question? We're always here to help — reach out anytime</p>
        </div>
        <div className="contact-grid">
          <div className="contact-info">
            {[
              { icon:"📧", label:"Email Us",     val:<a href="mailto:support@cea.edu">support@cea.edu.in</a> },
              { icon:"📞", label:"Call Support",  val:<a href="tel:+919999999999">+91 99999 99999</a> },
              { icon:"📍", label:"Available",     val:<span>Pan India — Online Platform</span> },
              { icon:"💬", label:"WhatsApp",      val:<a href="#">Chat on WhatsApp</a> },
              { icon:"▶️", label:"YouTube",       val:<a href="#">Subscribe to our Channel</a> },
              { icon:"📸", label:"Instagram",     val:<a href="#">Follow @cea.academy</a> },
            ].map((c,i) => (
              <div className="ci" key={i}>
                <div className="ci-icon">{c.icon}</div>
                <div><div className="ci-label">{c.label}</div><div className="ci-val">{c.val}</div></div>
              </div>
            ))}
          </div>
          <div className="ch">
            <div className="ch-title">📅 Support Hours</div>
            {[
              {day:"Monday",    time:"10:00 AM – 12:00 PM", open:true },
              {day:"Tuesday",   time:"10:00 AM – 12:00 PM", open:true },
              {day:"Wednesday", time:"10:00 AM – 12:00 PM", open:true },
              {day:"Thursday",  time:"10:00 AM – 12:00 PM", open:true },
              {day:"Friday",    time:"10:00 AM – 12:00 PM", open:true },
              {day:"Saturday",  time:"10:00 AM – 12:00 PM", open:true },
              {day:"Sunday",    time:"Closed",               open:false},
            ].map((d,i) => (
              <div className="ch-row" key={i}>
                <span className="ch-day">{d.day}</span>
                <span className={`ch-time ${d.open?"open":"closed"}`}>{d.time}</span>
              </div>
            ))}
            <div className="ch-pill"><div className="ch-dot" /><span className="ch-pill-text">Currently Open — Call Now!</span></div>
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="cta">
        <h2 className="cta-title">Ready to Start Learning?</h2>
        <p className="cta-sub">Join 15,000+ students — no fees, no barriers, just pure knowledge. Start today.</p>
        <div className="cta-btns">
          <button className="btn-cw" onClick={() => navigate("/course")}>🚀 Enroll Now — It's Free</button>
          <button className="btn-co" onClick={() => navigate("/home")}>← Back to Home</button>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="footer">
        <div className="ft-g">
          <div>
            <div className="ft-lw">
              <div className="nav-logo-orb" style={{width:36,height:36,borderRadius:9,fontSize:17}}>💻</div>
              <span className="ft-ln">Computer Excellence Academy</span>
            </div>
            <p className="ft-d">Empowering India's youth with free digital education — from basics to advanced computing, accessible to everyone, everywhere in India.</p>
            <div className="socs">{["📘","📸","▶️","🐦"].map((s,i)=><a key={i} href="#" className="soc">{s}</a>)}</div>
          </div>
          <div>
            <div className="ft-h">Quick Links</div>
            <ul className="ft-l">
              <li><a href="/home">Home</a></li>
              <li><a href="/course">All Courses</a></li>
              <li><a href="/notes">PDF Notes</a></li>
              <li><a href="/aboutus">About Us</a></li>
            </ul>
          </div>
          <div>
            <div className="ft-h">Our Courses</div>
            <ul className="ft-l">
              {["Basic Computer","English Typing","ADCA Diploma","Web Development","Tally Prime","Graphic Design"].map(c=>(
                <li key={c}><a href="/course">→ {c}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="ft-h">Contact Us</div>
            <ul className="ft-l">
              <li><a href="#">📞 Call: Mon–Sat</a></li>
              <li><a href="#">⏰ 10AM – 12PM</a></li>
              <li><a href="#">📧 support@cea.edu</a></li>
              <li><a href="#">📍 India</a></li>
            </ul>
          </div>
        </div>
        <div className="ft-bot">
          <p>© {new Date().getFullYear()} Computer Excellence Academy. All rights reserved. | Made with ❤️ for learners across India</p>
        </div>
      </footer>

      <button className={`scroll-top ${scrollY > 400 ? "show" : ""}`} onClick={() => window.scrollTo({top:0,behavior:"smooth"})}>↑</button>
    </div>
  );
};

export default AboutUs;