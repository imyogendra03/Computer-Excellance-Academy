import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

const Home = () => {
  const navigate = useNavigate();

  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const [activeReview, setActiveReview] = useState(0);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);
  const [counts, setCounts] = useState({
    students: 0,
    courses: 0,
    notes: 0,
    support: 0,
  });

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (scrollY > 10 && menuOpen) setMenuOpen(false);
  }, [scrollY, menuOpen]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStatsVisible(true);
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!statsVisible) return;
    const targets = { students: 15000, courses: 24, notes: 500, support: 10000 };
    const duration = 2000;
    const steps = 60;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3);

      setCounts({
        students: Math.floor(targets.students * ease),
        courses: Math.floor(targets.courses * ease),
        notes: Math.floor(targets.notes * ease),
        support: Math.floor(targets.support * ease),
      });

      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [statsVisible]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveReview((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const courses = [
    { title: "Basic Computer Course", icon: "💻", color: "#667eea", duration: "3 Months", lessons: 45 },
    { title: "English Typing", icon: "⌨️", color: "#f093fb", duration: "2 Months", lessons: 30 },
    { title: "ADCA Course", icon: "📊", color: "#4facfe", duration: "6 Months", lessons: 120 },
    { title: "Web Development", icon: "🌐", color: "#43e97b", duration: "4 Months", lessons: 80 },
    { title: "Tally Prime", icon: "🧾", color: "#fa709a", duration: "2 Months", lessons: 35 },
    { title: "Graphic Design", icon: "🎨", color: "#a18cd1", duration: "3 Months", lessons: 60 },
  ];

  const reviews = [
    {
      name: "Nepali Sangeet",
      city: "Kathmandu",
      stars: 5,
      review:
        "The teaching quality is exceptional! I loved every bit of explanation. The certificate I received has already helped me land a job interview.",
      avatar: "NS",
    },
    {
      name: "Kalyan Lohar",
      city: "Mumbai",
      stars: 5,
      review:
        "One month and I feel completely transformed. The institute's support system is unlike anything I've seen — every student matters here.",
      avatar: "KL",
    },
    {
      name: "Lavanya Thipparapu",
      city: "Hyderabad",
      stars: 5,
      review:
        "Outstanding online coaching! The academy makes complex topics incredibly simple. My confidence in computers has grown 10x.",
      avatar: "LT",
    },
  ];

  const features = [
    { icon: "🎥", title: "Live & Recorded Classes", desc: "Interactive sessions with industry experts, available 24/7" },
    { icon: "📄", title: "Free PDF Notes", desc: "Downloadable study material for every topic covered" },
    { icon: "🏆", title: "Free Certification", desc: "Industry-recognized certificates to boost your career" },
    { icon: "📞", title: "Free Call Support", desc: "Expert help Mon–Sat, 10AM–12PM just a call away" },
  ];

  const examCategories = [
    { icon: "🔬", name: "MS Office", count: "12 Courses" },
    { icon: "💡", name: "Programming", count: "8 Courses" },
    { icon: "📈", name: "Accounting", count: "5 Courses" },
    { icon: "🎨", name: "Design", count: "6 Courses" },
    { icon: "🌐", name: "Web Dev", count: "10 Courses" },
    { icon: "🔒", name: "Cybersecurity", count: "3 Courses" },
  ];

  const navLinks = [
    { label: "Home", href: "/", icon: "🏠" },
    { label: "Courses", href: "/courses", icon: "📚", badge: "24+" },
    { label: "PDF Notes", href: "/notes", icon: "📄" },
    { label: "About Us", href: "/aboutus", icon: "👥" },
  ];

  return (
    <div
      style={{
        fontFamily: "'Outfit','Segoe UI',sans-serif",
        background: "#f8f9ff",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@700;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        :root {
          --primary:        #6c3de8;
          --secondary:      #f7156a;
          --accent:         #00d4ff;
          --gold:           #ffd700;
          --green:          #10b981;
          --text-dark:      #1a1a2e;
          --text-muted:     #6b7280;
          --gradient-main:  linear-gradient(135deg, #0d0820 0%, #1a0640 50%, #2d1060 100%);
          --gradient-accent:linear-gradient(135deg, #6c3de8, #f7156a);
          --gradient-blue:  linear-gradient(90deg, #ffffff, #00d4ff);
          --gradient-gold:  linear-gradient(135deg, #f7971e, #ffd200);
          --shadow-glow:    0 0 40px rgba(108,61,232,0.3);
          --shadow-card:    0 10px 40px rgba(0,0,0,0.08);
          --radius:         20px;
        }

        .cea-nav {
          position: sticky; top: 0; z-index: 1000;
          width: 100%; height: 70px;
          padding: 0 5%;
          display: flex; align-items: center;
          transition: background 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
          font-family: 'Outfit', sans-serif;
        }
        .cea-nav.scrolled {
          background: rgba(13,8,32,0.95);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(108,61,232,0.25);
          box-shadow: 0 4px 40px rgba(0,0,0,0.45);
        }
        .cea-nav.top {
          background: rgba(13,8,32,0.65);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(108,61,232,0.12);
        }

        .nav-logo {
          display: flex; align-items: center; gap: 11px;
          text-decoration: none; margin-right: auto; flex-shrink: 0;
        }
        .nav-logo-orb {
          width: 42px; height: 42px; border-radius: 12px;
          background: var(--gradient-accent);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; flex-shrink: 0;
          box-shadow: 0 0 20px rgba(108,61,232,0.55);
          transition: transform 0.35s cubic-bezier(0.23,1,0.32,1);
        }
        .nav-logo-orb:hover { transform: rotate(-10deg) scale(1.12); }
        .nav-logo-text { display: flex; flex-direction: column; }
        .nav-logo-main {
          font-size: 0.98rem; font-weight: 800; line-height: 1.15; letter-spacing: -0.2px;
          background: var(--gradient-blue);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .nav-logo-sub {
          font-size: 0.58rem; font-weight: 500; letter-spacing: 1.8px;
          text-transform: uppercase; color: rgba(255,255,255,0.38); margin-top: 1px;
        }
        .nav-logo-line {
          height: 2px; border-radius: 2px; margin-top: 3px;
          background: linear-gradient(90deg, #6c3de8, #00d4ff, #f7156a);
          background-size: 200%;
          animation: shimmer 3s linear infinite;
        }
        @keyframes shimmer { 0%{background-position:0%} 100%{background-position:200%} }

        .nav-menu {
          display: flex; align-items: center; gap: 2px;
          list-style: none; margin: 0 18px 0 0; padding: 0;
        }
        .nav-menu a {
          display: inline-flex; align-items: center; gap: 5px;
          color: rgba(255,255,255,0.72); text-decoration: none;
          font-size: 0.875rem; font-weight: 500; white-space: nowrap;
          padding: 8px 14px; border-radius: 10px;
          transition: color 0.2s, background 0.2s; position: relative;
        }
        .nav-menu a:hover { color: #fff; background: rgba(108,61,232,0.22); }
        .nav-menu a.active { color: #fff; background: rgba(108,61,232,0.28); }
        .nav-menu a.active::after {
          content: '';
          position: absolute; bottom: 6px; left: 50%; transform: translateX(-50%);
          width: 18px; height: 2px; border-radius: 2px;
          background: linear-gradient(90deg, var(--primary), var(--accent));
        }
        .nav-badge {
          font-size: 0.58rem; font-weight: 700; letter-spacing: 0.3px;
          padding: 2px 6px; border-radius: 5px;
          background: rgba(247,21,106,0.2); color: #f7156a; text-transform: uppercase;
        }
        .live-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #f7156a; flex-shrink: 0;
          animation: ldot 1.8s ease-in-out infinite;
        }
        @keyframes ldot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(0.7)} }

        .nav-right { display: flex; align-items: center; gap: 10px; }
        .nav-divider { width: 1px; height: 22px; background: rgba(255,255,255,0.1); flex-shrink: 0; }

        .support-pill {
          display: flex; align-items: center; gap: 7px;
          background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.28);
          border-radius: 50px; padding: 6px 13px;
          cursor: default; white-space: nowrap;
        }
        .support-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--green); animation: ldot 1.5s infinite; flex-shrink: 0;
        }
        .support-label { font-size: 0.74rem; font-weight: 600; color: var(--green); }

        .btn-register {
          border: 1.5px solid rgba(108,61,232,0.5);
          color: rgba(255,255,255,0.85); background: transparent;
          border-radius: 10px; padding: 8px 18px;
          font-size: 0.84rem; font-weight: 600; cursor: pointer;
          transition: all 0.22s; font-family: 'Outfit', sans-serif; white-space: nowrap;
        }
        .btn-register:hover { background: rgba(108,61,232,0.2); border-color: rgba(108,61,232,0.8); color: white; }

        .btn-login-nav {
          position: relative; overflow: hidden;
          background: var(--gradient-accent); color: white; border: none;
          border-radius: 10px; padding: 9px 22px;
          font-size: 0.84rem; font-weight: 700; cursor: pointer;
          transition: transform 0.25s, box-shadow 0.25s;
          font-family: 'Outfit', sans-serif;
          box-shadow: 0 4px 18px rgba(108,61,232,0.45); white-space: nowrap;
        }
        .btn-login-nav::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, #f7156a, #6c3de8);
          opacity: 0; transition: opacity 0.3s;
        }
        .btn-login-nav:hover::before { opacity: 1; }
        .btn-login-nav:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(108,61,232,0.6); }
        .btn-login-nav span { position: relative; z-index: 1; }

        .hamburger {
          display: none; flex-direction: column; gap: 5px;
          width: 38px; height: 38px; border-radius: 9px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
          align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.22s; flex-shrink: 0;
        }
        .hamburger:hover { background: rgba(108,61,232,0.25); border-color: rgba(108,61,232,0.4); }
        .hamburger .bar {
          display: block; width: 18px; height: 1.8px;
          background: rgba(255,255,255,0.8); border-radius: 2px;
          transition: all 0.3s ease; transform-origin: center;
        }
        .hamburger.open .bar:nth-child(1) { transform: translateY(6.8px) rotate(45deg); }
        .hamburger.open .bar:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .hamburger.open .bar:nth-child(3) { transform: translateY(-6.8px) rotate(-45deg); }

        .mobile-drawer {
          position: fixed; top: 70px; left: 0; right: 0; z-index: 999;
          background: rgba(10,5,28,0.97);
          backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(108,61,232,0.2);
          box-shadow: 0 20px 60px rgba(0,0,0,0.6);
          padding: 16px 5% 22px;
          transform: translateY(-110%); opacity: 0;
          transition: transform 0.35s cubic-bezier(0.23,1,0.32,1), opacity 0.3s;
          font-family: 'Outfit', sans-serif;
        }
        .mobile-drawer.open { transform: translateY(0); opacity: 1; }

        .mob-support {
          display: flex; align-items: center; gap: 10px;
          background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.25);
          border-radius: 12px; padding: 12px 14px; margin-bottom: 12px;
        }
        .mob-support-title { font-size: 0.84rem; font-weight: 600; color: var(--green); }
        .mob-support-sub { font-size: 0.72rem; color: rgba(16,185,129,0.7); margin-top: 1px; }

        .mob-links { display: flex; flex-direction: column; gap: 3px; margin-bottom: 14px; }
        .mob-link {
          display: flex; align-items: center; justify-content: space-between;
          color: rgba(255,255,255,0.75); text-decoration: none;
          font-size: 0.9rem; font-weight: 500; padding: 11px 14px;
          border-radius: 11px; border: 1px solid transparent; transition: all 0.2s;
        }
        .mob-link:hover { background: rgba(108,61,232,0.2); color: white; border-color: rgba(108,61,232,0.2); }
        .mob-link.active { background: rgba(108,61,232,0.25); color: white; border-color: rgba(108,61,232,0.3); }
        .mob-link-left { display: flex; align-items: center; gap: 10px; }
        .mob-chevron { font-size: 13px; color: rgba(255,255,255,0.28); }

        .mob-hr { height: 1px; background: rgba(255,255,255,0.07); margin: 8px 0; }
        .mob-actions { display: flex; gap: 10px; }
        .mob-btn-reg {
          flex: 1; border: 1.5px solid rgba(108,61,232,0.5);
          color: rgba(255,255,255,0.85); background: transparent;
          border-radius: 11px; padding: 12px; font-size: 0.88rem;
          font-weight: 600; cursor: pointer; font-family: 'Outfit', sans-serif; transition: all 0.2s;
        }
        .mob-btn-reg:hover { background: rgba(108,61,232,0.2); color: white; }
        .mob-btn-login {
          flex: 1; background: var(--gradient-accent); color: white; border: none;
          border-radius: 11px; padding: 12px; font-size: 0.88rem; font-weight: 700;
          cursor: pointer; font-family: 'Outfit', sans-serif;
          box-shadow: 0 4px 18px rgba(108,61,232,0.4); transition: all 0.2s;
        }
        .mob-btn-login:hover { box-shadow: 0 8px 26px rgba(108,61,232,0.55); }

        .hero {
          background: var(--gradient-main);
          position: relative; overflow: hidden;
          padding: 80px 5% 100px; min-height: 600px; display: flex; align-items: center;
        }
        .hero::before {
          content: ''; position: absolute;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(108,61,232,0.4) 0%, transparent 70%);
          top: -100px; right: -100px; border-radius: 50%;
        }
        .hero::after {
          content: ''; position: absolute;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(247,21,106,0.2) 0%, transparent 70%);
          bottom: -50px; left: 10%; border-radius: 50%;
        }
        .hero-content { position: relative; z-index: 2; max-width: 700px; }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(108,61,232,0.3); border: 1px solid rgba(108,61,232,0.5);
          padding: 6px 16px; border-radius: 50px; color: var(--accent);
          font-size: 0.85rem; font-weight: 600; margin-bottom: 24px; backdrop-filter: blur(10px);
        }
        .hero-badge span { width: 8px; height: 8px; background: var(--accent); border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.5)} }
        .hero h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.2rem,5vw,3.8rem); font-weight: 900;
          color: white; line-height: 1.15; margin-bottom: 20px;
        }
        .hero h1 em { font-style: normal; background: var(--gradient-gold); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero p { color: rgba(255,255,255,0.75); font-size: 1.1rem; margin-bottom: 36px; line-height: 1.7; }
        .hero-cta { display: flex; gap: 16px; flex-wrap: wrap; }
        .btn-primary-hero {
          background: var(--gradient-accent); color: white; border: none;
          padding: 16px 36px; border-radius: 14px; font-size: 1rem; font-weight: 700;
          cursor: pointer; transition: all 0.3s ease;
          box-shadow: 0 8px 30px rgba(108,61,232,0.5); font-family: inherit;
        }
        .btn-primary-hero:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(108,61,232,0.6); }
        .btn-secondary-hero {
          background: rgba(255,255,255,0.1); color: white;
          border: 1px solid rgba(255,255,255,0.3); padding: 16px 36px;
          border-radius: 14px; font-size: 1rem; font-weight: 600;
          cursor: pointer; transition: all 0.3s ease; font-family: inherit; backdrop-filter: blur(10px);
        }
        .btn-secondary-hero:hover { background: rgba(255,255,255,0.2); border-color: rgba(255,255,255,0.5); }
        .hero-floating-cards {
          position: absolute; right: 5%; top: 50%; transform: translateY(-50%);
          z-index: 2; display: flex; flex-direction: column; gap: 16px;
        }
        .floating-card {
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
          backdrop-filter: blur(20px); border-radius: 16px; padding: 16px 20px;
          color: white; width: 220px; animation: float 4s ease-in-out infinite;
        }
        .floating-card:nth-child(2) { animation-delay: -2s; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .floating-card .fc-num { font-size: 1.8rem; font-weight: 800; background: var(--gradient-gold); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .floating-card .fc-label { font-size: 0.8rem; color: rgba(255,255,255,0.7); }

        .marquee-bar { background: var(--gradient-accent); padding: 12px 0; overflow: hidden; white-space: nowrap; }
        .marquee-inner { display: inline-block; animation: marquee 20s linear infinite; color: white; font-weight: 600; font-size: 0.9rem; }
        @keyframes marquee { 0%{transform:translateX(100vw)} 100%{transform:translateX(-100%)} }

        .stats-bar { background: white; padding: 50px 5%; box-shadow: var(--shadow-card); }
        .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 30px; max-width: 1100px; margin: 0 auto; }
        .stat-card {
          text-align: center; padding: 30px 20px; border-radius: var(--radius);
          border: 2px solid #f0f0f8; transition: all 0.3s ease; position: relative; overflow: hidden;
        }
        .stat-card::before {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
          background: var(--gradient-accent); transform: scaleX(0); transition: transform 0.3s ease;
        }
        .stat-card:hover::before { transform: scaleX(1); }
        .stat-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-glow); border-color: transparent; }
        .stat-icon { font-size: 2.5rem; margin-bottom: 12px; }
        .stat-num { font-size: 2.5rem; font-weight: 900; background: var(--gradient-accent); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .stat-label { color: var(--text-muted); font-size: 0.9rem; font-weight: 500; margin-top: 4px; }

        .section { padding: 90px 5%; }
        .section-light { background: #f8f9ff; }
        .section-dark { background: var(--gradient-main); }
        .section-white { background: white; }
        .section-header { text-align: center; margin-bottom: 60px; }
        .section-tag {
          display: inline-block;
          background: linear-gradient(135deg,rgba(108,61,232,0.1),rgba(247,21,106,0.1));
          border: 1px solid rgba(108,61,232,0.2); color: var(--primary);
          font-size: 0.8rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
          padding: 6px 16px; border-radius: 50px; margin-bottom: 16px;
        }
        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.8rem,4vw,2.8rem); font-weight: 900;
          color: var(--text-dark); margin-bottom: 14px;
        }
        .section-title-white { color: white; }
        .section-subtitle { color: var(--text-muted); font-size: 1rem; max-width: 560px; margin: 0 auto; line-height: 1.7; }
        .section-subtitle-white { color: rgba(255,255,255,0.7); }

        .category-grid { display: grid; grid-template-columns: repeat(6,1fr); gap: 16px; max-width: 1100px; margin: 0 auto; }
        .category-pill {
          background: white; border: 2px solid #eeeef8; border-radius: 16px;
          padding: 20px 12px; text-align: center; cursor: pointer;
          transition: all 0.3s ease; text-decoration: none; color: var(--text-dark);
        }
        .category-pill:hover { border-color: var(--primary); transform: translateY(-5px); box-shadow: 0 10px 30px rgba(108,61,232,0.15); color: var(--primary); }
        .cat-icon { font-size: 2rem; margin-bottom: 8px; }
        .cat-name { font-size: 0.85rem; font-weight: 700; }
        .cat-count { font-size: 0.75rem; color: var(--text-muted); margin-top: 2px; }

        .courses-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; max-width: 1100px; margin: 0 auto; }
        .course-card {
          background: white; border-radius: var(--radius); overflow: hidden;
          border: 1px solid #eeeef8; transition: all 0.3s ease; cursor: pointer; position: relative;
        }
        .course-card:hover { transform: translateY(-8px); box-shadow: 0 20px 50px rgba(0,0,0,0.12); }
        .course-card-header {
          height: 160px; display: flex; align-items: center; justify-content: center;
          font-size: 4rem; position: relative; overflow: hidden;
        }
        .course-card-header::after { content: ''; position: absolute; inset: 0; opacity: 0.15; background: inherit; }
        .course-badge {
          position: absolute; top: 12px; right: 12px; background: #22c55e; color: white;
          font-size: 0.7rem; font-weight: 700; padding: 4px 10px; border-radius: 50px;
          text-transform: uppercase; letter-spacing: 1px;
        }
        .course-body { padding: 20px; }
        .course-title { font-weight: 700; font-size: 1rem; margin-bottom: 8px; color: var(--text-dark); }
        .course-meta { display: flex; gap: 16px; margin-bottom: 16px; }
        .course-meta span { font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 4px; }
        .course-rating { display: flex; align-items: center; gap: 6px; margin-bottom: 16px; }
        .stars { color: #fbbf24; font-size: 0.85rem; }
        .rating-num { font-size: 0.85rem; font-weight: 600; color: var(--text-dark); }
        .btn-course {
          width: 100%;
          background: linear-gradient(135deg,rgba(108,61,232,0.08),rgba(247,21,106,0.08));
          border: 1px solid rgba(108,61,232,0.2); color: var(--primary); padding: 10px;
          border-radius: 10px; font-weight: 600; font-size: 0.9rem; cursor: pointer;
          transition: all 0.2s ease; font-family: inherit;
        }
        .btn-course:hover { background: var(--gradient-accent); color: white; border-color: transparent; }

        .features-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 24px; max-width: 1100px; margin: 0 auto; }
        .feature-card {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          border-radius: var(--radius); padding: 32px 24px; text-align: center;
          transition: all 0.3s ease; backdrop-filter: blur(10px);
        }
        .feature-card:hover { background: rgba(255,255,255,0.1); transform: translateY(-5px); }
        .feature-icon {
          width: 70px; height: 70px; background: rgba(108,61,232,0.3); border-radius: 18px;
          display: flex; align-items: center; justify-content: center; font-size: 2rem;
          margin: 0 auto 20px; border: 1px solid rgba(108,61,232,0.3);
        }
        .feature-title { color: white; font-weight: 700; font-size: 1rem; margin-bottom: 10px; }
        .feature-desc { color: rgba(255,255,255,0.65); font-size: 0.88rem; line-height: 1.7; }

        .review-container { max-width: 900px; margin: 0 auto; position: relative; }
        .review-card {
          background: white; border-radius: 24px; padding: 48px;
          box-shadow: var(--shadow-card); border: 1px solid #eeeef8; text-align: center;
          opacity: 0; transform: translateY(20px); transition: all 0.5s ease;
          position: absolute; width: 100%; pointer-events: none;
        }
        .review-card.active { opacity: 1; transform: translateY(0); position: relative; pointer-events: auto; }
        .review-avatar {
          width: 80px; height: 80px; background: var(--gradient-accent); border-radius: 50%;
          display: flex; align-items: center; justify-content: center; color: white;
          font-weight: 800; font-size: 1.5rem; margin: 0 auto 20px;
          box-shadow: 0 8px 25px rgba(108,61,232,0.4);
        }
        .review-text { font-size: 1.1rem; color: var(--text-dark); line-height: 1.8; font-style: italic; margin-bottom: 20px; }
        .review-name { font-weight: 800; font-size: 1rem; color: var(--text-dark); }
        .review-city { color: var(--text-muted); font-size: 0.85rem; }
        .review-stars { color: #fbbf24; font-size: 1.2rem; margin-bottom: 16px; }
        .review-dots { display: flex; justify-content: center; gap: 8px; margin-top: 30px; }
        .dot { width: 8px; height: 8px; border-radius: 50%; background: #e5e7eb; cursor: pointer; transition: all 0.3s; }
        .dot.active { width: 24px; border-radius: 4px; background: var(--primary); }

        .cta-section {
          background: var(--gradient-accent); padding: 80px 5%; text-align: center;
          position: relative; overflow: hidden;
        }
        .cta-section::before {
          content: ''; position: absolute; inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .cta-title { font-family: 'Playfair Display',serif; font-size: clamp(2rem,4vw,3rem); font-weight: 900; color: white; margin-bottom: 16px; position: relative; }
        .cta-sub { color: rgba(255,255,255,0.85); font-size: 1.05rem; margin-bottom: 36px; position: relative; }
        .btn-cta-white {
          background: white; color: var(--primary); border: none; padding: 18px 44px;
          border-radius: 14px; font-size: 1rem; font-weight: 800; cursor: pointer;
          transition: all 0.3s ease; box-shadow: 0 8px 30px rgba(0,0,0,0.2);
          font-family: inherit; position: relative;
        }
        .btn-cta-white:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.3); }

        .footer { background: #080514; padding: 70px 5% 30px; color: rgba(255,255,255,0.7); }
        .footer-grid {
          display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 48px; margin-bottom: 60px; max-width: 1100px; margin-left: auto; margin-right: auto;
        }
        .footer-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
        .footer-desc { font-size: 0.9rem; line-height: 1.8; margin-bottom: 24px; }
        .social-links { display: flex; gap: 12px; }
        .social-btn {
          width: 40px; height: 40px; background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          text-decoration: none; color: white; font-size: 1.1rem; transition: all 0.2s ease;
        }
        .social-btn:hover { background: var(--gradient-accent); border-color: transparent; transform: translateY(-2px); }
        .footer-heading { color: white; font-weight: 700; font-size: 0.95rem; margin-bottom: 20px; letter-spacing: 0.5px; }
        .footer-links { list-style: none; display: flex; flex-direction: column; gap: 10px; }
        .footer-links a { color: rgba(255,255,255,0.6); text-decoration: none; font-size: 0.88rem; transition: color 0.2s; }
        .footer-links a:hover { color: var(--accent); }
        .footer-bottom {
          border-top: 1px solid rgba(255,255,255,0.08); padding-top: 30px;
          text-align: center; font-size: 0.85rem; max-width: 1100px; margin: 0 auto;
        }

        .btn-show-all {
          display: block; margin: 48px auto 0; background: var(--gradient-accent);
          color: white; border: none; padding: 16px 48px; border-radius: 14px;
          font-size: 1rem; font-weight: 700; cursor: pointer; transition: all 0.3s ease;
          font-family: inherit; box-shadow: 0 8px 30px rgba(108,61,232,0.3);
        }
        .btn-show-all:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(108,61,232,0.5); }

        @media (max-width: 1060px) {
          .nav-menu { display: none; }
          .support-pill { display: none; }
          .btn-register { display: none; }
          .btn-login-nav { display: none; }
          .nav-divider { display: none; }
          .hamburger { display: flex; }
        }
        @media (max-width: 900px) {
          .courses-grid { grid-template-columns: repeat(2,1fr); }
          .features-grid { grid-template-columns: repeat(2,1fr); }
          .stats-grid { grid-template-columns: repeat(2,1fr); }
          .category-grid { grid-template-columns: repeat(3,1fr); }
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 30px; }
          .hero-floating-cards { display: none; }
          .hero-content { max-width: 100%; }
        }
        @media (max-width: 600px) {
          .courses-grid { grid-template-columns: 1fr; }
          .features-grid { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: repeat(2,1fr); }
          .category-grid { grid-template-columns: repeat(2,1fr); }
          .footer-grid { grid-template-columns: 1fr; }
          .nav-logo-main { font-size: 0.82rem; }
          .nav-logo-sub { display: none; }
          .nav-logo-line { display: none; }
        }
      `}</style>

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
              <a
                href={href}
                className={
                  window.location.pathname === href ||
                  (href === "/courses" && window.location.pathname === "/course")
                    ? "active"
                    : ""
                }
              >
                {icon} {label}
                {badge && <span className="nav-badge">{badge}</span>}
              </a>
            </li>
          ))}
          <li>
            <a href="#" style={{ color: "#f7156a" }}>
              <span className="live-dot" /> Live Class
            </a>
          </li>
        </ul>

        <div className="nav-right">
          <div className="support-pill">
            <div className="support-dot" />
            <span className="support-label">Support Open</span>
          </div>
          <div className="nav-divider" />
          <button className="btn-register" onClick={() => navigate("/register")}>
            Register
          </button>
          <button className="btn-login-nav" onClick={() => navigate("/login")}>
            <span>Login →</span>
          </button>
          <div
            className={`hamburger ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="bar" />
            <span className="bar" />
            <span className="bar" />
          </div>
        </div>
      </nav>

      <div className={`mobile-drawer ${menuOpen ? "open" : ""}`}>
        <div className="mob-support">
          <div className="support-dot" />
          <div>
            <div className="mob-support-title">Support Open Now</div>
            <div className="mob-support-sub">Mon–Sat · 10AM – 12PM</div>
          </div>
        </div>

        <div className="mob-links">
          {navLinks.map(({ label, href, icon, badge }) => (
            <a
              key={href}
              href={href}
              className={`mob-link ${
                window.location.pathname === href ||
                (href === "/courses" && window.location.pathname === "/course")
                  ? "active"
                  : ""
              }`}
            >
              <span className="mob-link-left">
                {icon} {label}
                {badge && <span className="nav-badge">{badge}</span>}
              </span>
              <span className="mob-chevron">›</span>
            </a>
          ))}
          <a href="#" className="mob-link" style={{ color: "#f7156a" }}>
            <span className="mob-link-left">
              <span className="live-dot" /> Live Class
            </span>
            <span className="mob-chevron">›</span>
          </a>
        </div>

        <div className="mob-hr" />
        <div className="mob-actions">
          <button className="mob-btn-reg" onClick={() => navigate("/register")}>
            Register
          </button>
          <button className="mob-btn-login" onClick={() => navigate("/login")}>
            Login →
          </button>
        </div>
      </div>

      <div className="marquee-bar">
        <span className="marquee-inner">
          🎓 Free Computer Courses &nbsp;•&nbsp; 📞 Call Support Mon-Sat 10AM–12PM &nbsp;•&nbsp; 🏆 Free Certification &nbsp;•&nbsp; 📄 Free PDF Notes &nbsp;•&nbsp; 🌐 Web Development &nbsp;•&nbsp; 💻 Basic Computer &nbsp;•&nbsp; 🧾 Tally Prime &nbsp;•&nbsp; 🎨 Graphic Design &nbsp;•&nbsp; ⌨️ English Typing &nbsp;•&nbsp; 📊 ADCA Course &nbsp;&nbsp;&nbsp;
        </span>
      </div>

      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span></span>
            India's #1 Free Computer Learning Platform
          </div>
          <h1>
            Learn Computer Skills <em>Free</em> with Expert Guidance
          </h1>
          <p>
            Join 15,000+ students mastering digital skills from scratch to advanced levels.
            Get certified, get ahead — with live call support every step of the way.
          </p>
          <div className="hero-cta">
            <button className="btn-primary-hero" onClick={() => navigate("/courses")}>
              🚀 Start Learning Free
            </button>
            <button className="btn-secondary-hero" onClick={() => navigate("/courses")}>
              📚 View All Courses
            </button>
          </div>
        </div>

        <div className="hero-floating-cards">
          {[["15K+", "Happy Students"], ["100%", "Free Certification"], ["24+", "Expert Courses"]].map(
            ([n, l], i) => (
              <div className="floating-card" key={i}>
                <div className="fc-num">{n}</div>
                <div className="fc-label">{l}</div>
              </div>
            )
          )}
        </div>
      </section>

      <section className="stats-bar" ref={statsRef}>
        <div className="stats-grid">
          {[
            { icon: "🎓", num: counts.students.toLocaleString() + "+", label: "Happy Students" },
            { icon: "📚", num: counts.courses + "+", label: "Free Courses" },
            { icon: "📄", num: counts.notes + "+", label: "PDF Notes" },
            { icon: "📞", num: counts.support.toLocaleString() + "+", label: "Queries Resolved" },
          ].map((s, i) => (
            <div className="stat-card" key={i}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-num">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section section-light">
        <div className="section-header">
          <div className="section-tag">Browse by Category</div>
          <h2 className="section-title">Explore Course Categories</h2>
          <p className="section-subtitle">
            From basics to advanced — we have a course for every skill level and career goal
          </p>
        </div>
        <div className="category-grid">
          {examCategories.map((cat, i) => (
            <a href="/courses" className="category-pill" key={i}>
              <div className="cat-icon">{cat.icon}</div>
              <div className="cat-name">{cat.name}</div>
              <div className="cat-count">{cat.count}</div>
            </a>
          ))}
        </div>
      </section>

      <section className="section section-white">
        <div className="section-header">
          <div className="section-tag">Top Picks</div>
          <h2 className="section-title">Our Free Courses</h2>
          <p className="section-subtitle">
            Handcrafted curricula, expert instructors, zero cost — your career transformation starts here
          </p>
        </div>
        <div className="courses-grid">
          {courses.map((course, i) => (
            <div className="course-card" key={i} onClick={() => navigate("/courses")}>
              <div
                className="course-card-header"
                style={{ background: `linear-gradient(135deg, ${course.color}22, ${course.color}44)` }}
              >
                <span style={{ fontSize: "4rem" }}>{course.icon}</span>
                <div className="course-badge">FREE</div>
              </div>
              <div className="course-body">
                <div className="course-title">{course.title}</div>
                <div className="course-meta">
                  <span>⏱️ {course.duration}</span>
                  <span>📖 {course.lessons} Lessons</span>
                </div>
                <div className="course-rating">
                  <span className="stars">⭐⭐⭐⭐⭐</span>
                  <span className="rating-num">4.8 (1.2k reviews)</span>
                </div>
                <button className="btn-course">View Course Details →</button>
              </div>
            </div>
          ))}
        </div>
        <button className="btn-show-all" onClick={() => navigate("/courses")}>
          View All Courses →
        </button>
      </section>

      <section className="section section-dark">
        <div className="section-header">
          <div
            className="section-tag"
            style={{
              background: "rgba(255,255,255,0.1)",
              borderColor: "rgba(255,255,255,0.2)",
              color: "#00d4ff",
            }}
          >
            Why CEA?
          </div>
          <h2 className="section-title section-title-white">Everything You Need to Succeed</h2>
          <p className="section-subtitle section-subtitle-white">
            We don't just teach — we support, certify, and celebrate every student's growth
          </p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section section-light">
        <div className="section-header">
          <div className="section-tag">Testimonials</div>
          <h2 className="section-title">What Our Students Say</h2>
          <p className="section-subtitle">
            Real stories from real learners who transformed their careers with CEA
          </p>
        </div>
        <div className="review-container">
          {reviews.map((r, i) => (
            <div className={`review-card ${i === activeReview ? "active" : ""}`} key={i}>
              <div className="review-avatar">{r.avatar}</div>
              <div className="review-stars">{"⭐".repeat(r.stars)}</div>
              <p className="review-text">"{r.review}"</p>
              <div className="review-name">{r.name}</div>
              <div className="review-city">📍 {r.city}</div>
            </div>
          ))}
          <div className="review-dots">
            {reviews.map((_, i) => (
              <div
                className={`dot ${i === activeReview ? "active" : ""}`}
                key={i}
                onClick={() => setActiveReview(i)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2 className="cta-title">Ready to Start Your Digital Journey?</h2>
        <p className="cta-sub">Join thousands of learners. No fees. No barriers. Just knowledge.</p>
        <button className="btn-cta-white" onClick={() => navigate("/courses")}>
          🎓 Enroll Now — It's Free!
        </button>
      </section>

      <footer className="footer">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">
              <div
                className="nav-logo-orb"
                style={{ width: 38, height: 38, borderRadius: 10, fontSize: 17 }}
              >
                💻
              </div>
              <span className="nav-logo-main" style={{ fontSize: "1rem" }}>
                Computer Excellence Academy
              </span>
            </div>
            <p className="footer-desc">
              Empowering India's youth with free, high-quality digital education. From basics to advanced computing — we've got you covered.
            </p>
            <div className="social-links">
              {["📘", "📸", "▶️", "🐦"].map((s, i) => (
                <a key={i} href="#" className="social-btn">
                  {s}
                </a>
              ))}
            </div>
          </div>
          <div>
            <div className="footer-heading">Quick Links</div>
            <ul className="footer-links">
              <li><a href="/">Home</a></li>
              <li><a href="/courses">All Courses</a></li>
              <li><a href="/notes">PDF Notes</a></li>
              <li><a href="/aboutus">About Us</a></li>
            </ul>
          </div>
          <div>
            <div className="footer-heading">Our Courses</div>
            <ul className="footer-links">
              {["Basic Computer", "English Typing", "ADCA Course", "Web Development", "Tally Prime", "Graphic Design"].map((c) => (
                <li key={c}>
                  <a href="/courses">{c}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="footer-heading">Contact Us</div>
            <ul className="footer-links">
              <li><a href="#">📞 Call: Mon–Sat</a></li>
              <li><a href="#">⏰ 10AM – 12PM</a></li>
              <li><a href="#">📧 support@cea.edu</a></li>
              <li><a href="#">📍 India</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} Computer Excellence Academy. All rights reserved. | Made with ❤️ for learners across India
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
