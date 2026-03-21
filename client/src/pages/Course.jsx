import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

/* ══════════════════════════════════════════
   Course.jsx — Public course listing + batch purchase flow
   ══════════════════════════════════════════ */

const FALLBACK_COURSES = [
  {
    _id: "demo-1",
    title: "Basic Computer Course",
    slug: "basic-computer-course",
    icon: "💻",
    category: "Computer Basics",
    level: "Beginner",
    duration: "1 Month",
    lessons: 32,
    students: 4200,
    highlightTag: "Most Popular",
    shortDescription:
      "Master the fundamentals — hardware, software, MS Office, internet & more.",
  },
  {
    _id: "demo-2",
    title: "English Typing Course",
    slug: "english-typing-course",
    icon: "⌨️",
    category: "Typing",
    level: "All Levels",
    duration: "20 Days",
    lessons: 18,
    students: 2800,
    highlightTag: "Trending",
    shortDescription:
      "Build speed & accuracy with structured typing practice and techniques.",
  },
  {
    _id: "demo-3",
    title: "ADCA Diploma Course",
    slug: "adca-diploma-course",
    icon: "📊",
    category: "Diploma",
    level: "Intermediate",
    duration: "6 Months",
    lessons: 120,
    students: 6100,
    highlightTag: "Certificate",
    shortDescription:
      "Advanced diploma covering DTP, Tally, web basics, networking & more.",
  },
];

const LEVELS = ["All", "Beginner", "Intermediate", "Advanced", "All Levels"];

const navLinks = [
  { label: "Home", href: "/", icon: "🏠" },
  { label: "Courses", href: "/courses", icon: "📚", badge: "24+" },
  { label: "PDF Notes", href: "/notes", icon: "📄" },
  { label: "About Us", href: "/aboutus", icon: "👥" },
];

const Course = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("All");
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [visible, setVisible] = useState({});
  const [courses, setCourses] = useState([]);
  const [fetchingCourses, setFetchingCourses] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [buyingBatchId, setBuyingBatchId] = useState("");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const cardRefs = useRef([]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 2500);
  };

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
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible((v) => ({ ...v, [e.target.dataset.idx]: true }));
          }
        }),
      { threshold: 0.12 }
    );
    cardRefs.current.forEach((r) => r && obs.observe(r));
    return () => obs.disconnect();
  }, [courses]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setFetchingCourses(true);
       const res = await fetch(`${import.meta.env.VITE_API_URL}/api/course`);
        const data = await res.json();
        const list = Array.isArray(data?.data) ? data.data : [];
        setCourses(list.length ? list : FALLBACK_COURSES);
      } catch (error) {
        setCourses(FALLBACK_COURSES);
        showToast("Live courses load nahi hue, demo courses show ho rahe hain.", "error");
      } finally {
        setFetchingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  const fetchBatchesByCourse = async (course) => {
    try {
      setSelectedCourse(course);
      setBatchModalOpen(true);
      setLoadingBatches(true);
      setBatches([]);

      if (!course?._id || String(course._id).startsWith("demo-")) {
        setBatches([
          {
            _id: "demo-batch-1",
            batchName: "Starter Batch",
            mode: "online",
            duration: course.duration || "1 Month",
            price: 1999,
            discountPrice: 999,
            startDate: new Date().toISOString(),
            features: ["Recorded lectures", "PDF notes", "Practice support"],
          },
        ]);
        return;
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/batch/course/${course._id}`);


      const data = await res.json();
      setBatches(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      showToast("Batches load nahi ho paaye.", "error");
    } finally {
      setLoadingBatches(false);
    }
  };

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const title = String(c.title || "").toLowerCase();
      const currentLevel = c.level || "Beginner";
      return (
        (level === "All" || currentLevel === level) &&
        title.includes(search.toLowerCase())
      );
    });
  }, [courses, search, level]);

  const levelColor = {
    Beginner: "#10b981",
    Intermediate: "#f59e0b",
    Advanced: "#f43f5e",
    "All Levels": "#6c3de8",
  };

  const getCardIcon = (course) => {
    if (course.icon) return course.icon;
    if (course.category?.toLowerCase().includes("typing")) return "⌨️";
    if (course.category?.toLowerCase().includes("design")) return "🎨";
    if (course.category?.toLowerCase().includes("web")) return "🌐";
    return "📘";
  };

const handleBuyNow = async (batch) => {
  const latestUserId = localStorage.getItem("userId");
  const latestUserRole = localStorage.getItem("userRole");

  if (!latestUserId || latestUserRole !== "user") {
    showToast("Purchase se pehle login karna hoga.", "error");
    setTimeout(() => {
      navigate("/login", { state: { from: "/courses" } });
    }, 700);
    return;
  }

  try {
    setBuyingBatchId(batch._id);

    const finalAmount =
      Number(batch.discountPrice || 0) > 0
        ? Number(batch.discountPrice)
        : Number(batch.price || 0);

    // Step 1 — Razorpay order create karo backend se
    const orderRes = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: finalAmount,
        batchId: batch._id,
      }),
    });

    const orderData = await orderRes.json();

    if (!orderRes.ok || !orderData?.order?.id) {
      throw new Error(orderData?.message || "Order create nahi hua");
    }

    // Step 2 — Razorpay checkout popup open karo
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: orderData.order.amount,
      currency: "INR",
      name: "Computer Excellence Academy",
      description: `${batch.batchName} - Batch Purchase`,
      order_id: orderData.order.id,
      handler: async function (response) {
        try {
          // Step 3 — Payment verify karo backend se
          const verifyRes = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: latestUserId,
              batchId: batch._id,
              amount: finalAmount,
            }),
          });

          const verifyData = await verifyRes.json();

          if (!verifyRes.ok) {
            throw new Error(verifyData?.message || "Payment verify nahi hua");
          }

          showToast("Payment successful! Batch aapke dashboard me add ho gaya. 🎉");
          setTimeout(() => {
            setBatchModalOpen(false);
            navigate("/userdash/my-batches");
          }, 1200);
        } catch (err) {
          showToast(err.message || "Verification failed", "error");
        }
      },
      prefill: {
        name: localStorage.getItem("userName") || "",
        email: localStorage.getItem("userEmail") || "",
      },
      theme: {
        color: "#2563eb",
      },
      modal: {
        ondismiss: function () {
          showToast("Payment cancel kar diya gaya.", "error");
          setBuyingBatchId("");
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (error) {
    showToast(error.message || "Payment failed", "error");
  } finally {
    setBuyingBatchId("");
  }
};


  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    return isNaN(date.getTime())
      ? value
      : date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

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
          --primary: #6c3de8;
          --secondary: #f7156a;
          --accent: #00d4ff;
          --green: #10b981;
          --text-dark: #1a1a2e;
          --text-muted: #6b7280;
          --gradient-main: linear-gradient(135deg, #0d0820 0%, #1a0640 50%, #2d1060 100%);
          --gradient-accent: linear-gradient(135deg, #6c3de8, #f7156a);
          --gradient-blue: linear-gradient(90deg, #ffffff, #00d4ff);
          --gradient-gold: linear-gradient(135deg, #f7971e, #ffd200);
          --radius: 20px;
        }

        .cea-nav {
          position: sticky; top: 0; z-index: 1000;
          width: 100%; height: 70px; padding: 0 5%;
          display: flex; align-items: center;
          transition: background 0.35s, box-shadow 0.35s, border-color 0.35s;
          font-family: 'Outfit', sans-serif;
        }
        .cea-nav.scrolled {
          background: rgba(13,8,32,0.95);
          backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(108,61,232,0.25);
          box-shadow: 0 4px 40px rgba(0,0,0,0.45);
        }
        .cea-nav.top {
          background: rgba(13,8,32,0.65);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(108,61,232,0.12);
        }

        .nav-logo { display: flex; align-items: center; gap: 11px; text-decoration: none; margin-right: auto; flex-shrink: 0; }
        .nav-logo-orb {
          width: 42px; height: 42px; border-radius: 12px;
          background: var(--gradient-accent);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; flex-shrink: 0;
          box-shadow: 0 0 20px rgba(108,61,232,0.55);
        }
        .nav-logo-text { display: flex; flex-direction: column; }
        .nav-logo-main {
          font-size: 0.98rem; font-weight: 800; line-height: 1.15;
          background: var(--gradient-blue); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .nav-logo-sub { font-size: 0.58rem; font-weight: 500; letter-spacing: 1.8px; text-transform: uppercase; color: rgba(255,255,255,0.38); margin-top: 1px; }
        .nav-logo-line {
          height: 2px; border-radius: 2px; margin-top: 3px;
          background: linear-gradient(90deg,#6c3de8,#00d4ff,#f7156a); background-size: 200%;
          animation: shimmer 3s linear infinite;
        }
        @keyframes shimmer { 0%{background-position:0%} 100%{background-position:200%} }

        .nav-menu { display: flex; align-items: center; gap: 2px; list-style: none; margin: 0 18px 0 0; padding: 0; }
        .nav-menu a {
          display: inline-flex; align-items: center; gap: 5px;
          color: rgba(255,255,255,0.72); text-decoration: none;
          font-size: 0.875rem; font-weight: 500; white-space: nowrap;
          padding: 8px 14px; border-radius: 10px;
          transition: color 0.2s, background 0.2s; position: relative;
        }
        .nav-menu a:hover { color: #fff; background: rgba(108,61,232,0.22); }
        .nav-menu a.active { color: #fff; background: rgba(108,61,232,0.28); }
        .nav-badge { font-size: 0.58rem; font-weight: 700; padding: 2px 6px; border-radius: 5px; background: rgba(247,21,106,0.2); color: #f7156a; }
        .live-dot { width: 6px; height: 6px; border-radius: 50%; background: #f7156a; flex-shrink: 0; animation: ldot 1.8s ease-in-out infinite; }
        @keyframes ldot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(0.7)} }

        .nav-right { display: flex; align-items: center; gap: 10px; }
        .nav-divider { width: 1px; height: 22px; background: rgba(255,255,255,0.1); flex-shrink: 0; }
        .support-pill {
          display: flex; align-items: center; gap: 7px;
          background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.28);
          border-radius: 50px; padding: 6px 13px; white-space: nowrap;
        }
        .support-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); animation: ldot 1.5s infinite; flex-shrink: 0; }
        .support-label { font-size: 0.74rem; font-weight: 600; color: var(--green); }
        .btn-register {
          border: 1.5px solid rgba(108,61,232,0.5); color: rgba(255,255,255,0.85); background: transparent;
          border-radius: 10px; padding: 8px 18px; font-size: 0.84rem; font-weight: 600; cursor: pointer;
        }
        .btn-login-nav {
          background: var(--gradient-accent); color: white; border: none;
          border-radius: 10px; padding: 9px 22px; font-size: 0.84rem; font-weight: 700; cursor: pointer;
          box-shadow: 0 4px 18px rgba(108,61,232,0.45);
        }

        .hamburger {
          display: none; flex-direction: column; gap: 5px;
          width: 38px; height: 38px; border-radius: 9px;
          border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.06);
          align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;
        }
        .hamburger .bar { display: block; width: 18px; height: 1.8px; background: rgba(255,255,255,0.8); border-radius: 2px; }
        .hamburger.open .bar:nth-child(1) { transform: translateY(6.8px) rotate(45deg); }
        .hamburger.open .bar:nth-child(2) { opacity: 0; }
        .hamburger.open .bar:nth-child(3) { transform: translateY(-6.8px) rotate(-45deg); }

        .mobile-drawer {
          position: fixed; top: 70px; left: 0; right: 0; z-index: 999;
          background: rgba(10,5,28,0.97); backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(108,61,232,0.2); box-shadow: 0 20px 60px rgba(0,0,0,0.6);
          padding: 16px 5% 22px; transform: translateY(-110%); opacity: 0; transition: 0.3s;
        }
        .mobile-drawer.open { transform: translateY(0); opacity: 1; }
        .mob-support { display: flex; align-items: center; gap: 10px; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.25); border-radius: 12px; padding: 12px 14px; margin-bottom: 12px; }
        .mob-support-title { font-size: 0.84rem; font-weight: 600; color: var(--green); }
        .mob-support-sub { font-size: 0.72rem; color: rgba(16,185,129,0.7); margin-top: 1px; }
        .mob-links { display: flex; flex-direction: column; gap: 3px; margin-bottom: 14px; }
        .mob-link {
          display: flex; align-items: center; justify-content: space-between;
          color: rgba(255,255,255,0.75); text-decoration: none; font-size: 0.9rem; font-weight: 500; padding: 11px 14px;
          border-radius: 11px; border: 1px solid transparent;
        }
        .mob-actions { display: flex; gap: 10px; }
        .mob-btn-reg, .mob-btn-login {
          flex: 1; border-radius: 11px; padding: 12px; font-size: 0.88rem; font-weight: 700; cursor: pointer; border: none;
        }
        .mob-btn-reg { background: transparent; color: white; border: 1px solid rgba(108,61,232,0.5); }
        .mob-btn-login { background: var(--gradient-accent); color: white; }

        .hero {
          background: var(--gradient-main); position: relative; overflow: hidden;
          padding: 90px 5% 110px; display: flex; align-items: center; min-height: 480px;
        }
        .hero::before { content:''; position:absolute; width:600px; height:600px; background:radial-gradient(circle,rgba(108,61,232,0.4) 0%,transparent 70%); top:-120px; right:-80px; border-radius:50%; }
        .hero::after  { content:''; position:absolute; width:350px; height:350px; background:radial-gradient(circle,rgba(0,212,255,0.15) 0%,transparent 70%); bottom:-60px; left:8%; border-radius:50%; }
        .hero-inner { position:relative; z-index:2; max-width:720px; }
        .hero-badge {
          display:inline-flex; align-items:center; gap:8px;
          background:rgba(108,61,232,0.25); border:1px solid rgba(108,61,232,0.45);
          padding:6px 18px; border-radius:50px; color:var(--accent);
          font-size:0.82rem; font-weight:600; margin-bottom:22px; backdrop-filter:blur(10px);
        }
        .hero-badge span { width:7px; height:7px; background:var(--accent); border-radius:50%; animation:pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.6)} }
        .hero h1 { font-family:'Playfair Display',serif; font-size:clamp(2rem,4.5vw,3.6rem); font-weight:900; color:#fff; line-height:1.15; margin-bottom:18px; }
        .hero h1 em { font-style:normal; background:var(--gradient-gold); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .hero p { color:rgba(255,255,255,0.72); font-size:1.05rem; line-height:1.75; margin-bottom:36px; max-width:580px; }
        .hero-stats { display:flex; gap:36px; flex-wrap:wrap; }
        .hs-num { font-size:1.8rem; font-weight:900; background:var(--gradient-gold); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .hs-lbl { font-size:0.78rem; color:rgba(255,255,255,0.6); margin-top:2px; }
        .hero-chips { position:absolute; right:5%; top:50%; transform:translateY(-50%); z-index:2; display:flex; flex-direction:column; gap:14px; }
        .chip { background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.14); backdrop-filter:blur(18px); border-radius:14px; padding:14px 20px; color:white; width:210px; }
        .chip-top { font-size:0.7rem; color:rgba(255,255,255,0.5); text-transform:uppercase; letter-spacing:1px; margin-bottom:6px; }
        .chip-val { font-size:1.5rem; font-weight:800; background:var(--gradient-gold); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .chip-sub { font-size:0.75rem; color:rgba(255,255,255,0.6); margin-top:2px; }

        .marquee-bar { background:var(--gradient-accent); padding:12px 0; overflow:hidden; white-space:nowrap; }
        .marquee-inner { display:inline-block; animation:marquee 22s linear infinite; color:white; font-weight:600; font-size:0.88rem; }
        @keyframes marquee{0%{transform:translateX(100vw)}100%{transform:translateX(-100%)}}

        .filter-bar { background:white; padding:28px 5%; box-shadow:0 4px 24px rgba(108,61,232,0.07); position:sticky; top:70px; z-index:900; }
        .filter-inner { max-width:1100px; margin:0 auto; display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
        .search-wrap { position:relative; flex:1; min-width:220px; }
        .search-inp { width:100%; padding:13px 46px 13px 18px; border-radius:12px; border:2px solid rgba(108,61,232,0.15); background:#f8f9ff; font-size:0.95rem; font-family:inherit; outline:none; color:var(--text-dark); }
        .search-ic { position:absolute; right:16px; top:50%; transform:translateY(-50%); font-size:1.1rem; pointer-events:none; }
        .level-tabs { display:flex; gap:8px; flex-wrap:wrap; }
        .ltab { padding:8px 18px; border-radius:50px; border:1.5px solid rgba(108,61,232,0.18); background:transparent; font-size:0.83rem; font-weight:600; color:var(--text-muted); cursor:pointer; }
        .ltab.on { background:var(--gradient-accent); color:white; border-color:transparent; }
        .result-count { margin-left:auto; font-size:0.85rem; color:var(--text-muted); font-weight:500; white-space:nowrap; }

        .courses-section { padding:70px 5%; background:#f8f9ff; }
        .courses-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:26px; max-width:1200px; margin:0 auto; }
        .cc {
          background:white; border-radius:var(--radius); overflow:hidden;
          border:1px solid #eeeef8; cursor:pointer;
          transition:all 0.4s cubic-bezier(0.23,1,0.32,1);
          box-shadow:0 4px 20px rgba(0,0,0,0.05);
          opacity:0; transform:translateY(28px);
        }
        .cc.show { opacity:1; transform:translateY(0); }
        .cc:hover { transform:translateY(-10px) scale(1.01); box-shadow:0 24px 60px rgba(108,61,232,0.18); border-color:rgba(108,61,232,0.25); }
        .cc-head { height:150px; display:flex; align-items:center; justify-content:center; font-size:3.6rem; position:relative; overflow:hidden; }
        .cc-tag1 { position:absolute; top:12px; left:12px; font-size:0.66rem; font-weight:800; padding:4px 11px; border-radius:50px; background:rgba(0,0,0,0.48); color:white; }
        .cc-free { position:absolute; top:12px; right:12px; font-size:0.66rem; font-weight:800; padding:4px 11px; border-radius:50px; background:#10b981; color:white; }
        .cc-body { padding:20px; }
        .cc-lv { display:inline-block; font-size:0.7rem; font-weight:700; padding:3px 10px; border-radius:6px; margin-bottom:8px; }
        .cc-title { font-weight:800; font-size:1rem; color:var(--text-dark); margin-bottom:8px; line-height:1.4; }
        .cc-desc { font-size:0.83rem; color:var(--text-muted); line-height:1.65; margin-bottom:14px; }
        .cc-meta { display:flex; gap:14px; margin-bottom:14px; flex-wrap:wrap; }
        .cc-meta span { font-size:0.77rem; color:var(--text-muted); }
        .cc-footer { display:flex; align-items:center; justify-content:space-between; padding-top:12px; border-top:1px solid #f0f0f8; }
        .cc-stu { font-size:0.76rem; color:var(--text-muted); }
        .btn-enroll { background:var(--gradient-accent); color:white; border:none; padding:9px 20px; border-radius:10px; font-size:0.82rem; font-weight:700; cursor:pointer; }
        .empty { text-align:center; padding:80px 20px; color:var(--text-muted); }

        .why-section { padding:80px 5%; background:var(--gradient-main); }
        .why-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:24px; max-width:1100px; margin:0 auto; }
        .why-card { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:var(--radius); padding:30px 22px; text-align:center; backdrop-filter:blur(10px); }
        .why-icon { width:64px; height:64px; background:rgba(108,61,232,0.3); border-radius:16px; display:flex; align-items:center; justify-content:center; font-size:1.8rem; margin:0 auto 18px; }
        .why-title { color:white; font-weight:700; font-size:0.95rem; margin-bottom:8px; }
        .why-desc { color:rgba(255,255,255,0.62); font-size:0.84rem; line-height:1.7; }
        .s-tag { display:inline-block; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:var(--accent); font-size:0.78rem; font-weight:700; padding:5px 14px; border-radius:50px; margin-bottom:14px; }
        .s-title { font-family:'Playfair Display',serif; font-size:clamp(1.7rem,3.5vw,2.6rem); font-weight:900; color:white; margin-bottom:12px; }
        .s-sub { color:rgba(255,255,255,0.65); font-size:0.97rem; max-width:520px; margin:0 auto 50px; line-height:1.75; }

        .cta { background:var(--gradient-accent); padding:80px 5%; text-align:center; }
        .cta-title { font-family:'Playfair Display',serif; font-size:clamp(1.9rem,4vw,3rem); font-weight:900; color:white; margin-bottom:14px; }
        .cta-sub { color:rgba(255,255,255,0.85); font-size:1.03rem; margin-bottom:36px; }
        .cta-btns { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; }
        .btn-cta-w { background:white; color:var(--primary); border:none; padding:16px 44px; border-radius:14px; font-size:1rem; font-weight:800; cursor:pointer; }
        .btn-cta-o { background:transparent; color:white; border:2px solid rgba(255,255,255,0.6); padding:14px 36px; border-radius:14px; font-size:1rem; font-weight:700; cursor:pointer; }

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

        .scroll-top { position:fixed; bottom:28px; right:28px; z-index:999; width:46px; height:46px; border-radius:13px; background:var(--gradient-accent); border:none; color:white; font-size:1.2rem; cursor:pointer; opacity:0; pointer-events:none; }
        .scroll-top.show { opacity:1; pointer-events:auto; }

        .course-modal-overlay {
          position: fixed; inset: 0; background: rgba(3, 7, 18, 0.72); z-index: 1200;
          display: flex; align-items: center; justify-content: center; padding: 18px;
        }
        .course-modal {
          width: 100%; max-width: 820px; max-height: 88vh; overflow: auto;
          background: white; border-radius: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.28);
          padding: 24px;
        }
        .cm-head { display:flex; justify-content:space-between; gap:14px; margin-bottom:18px; }
        .cm-close { border:none; background:#eef2ff; color:#3730a3; width:40px; height:40px; border-radius:12px; cursor:pointer; }
        .cm-course { padding:18px; border-radius:18px; background:#f8fbff; margin-bottom:18px; }
        .cm-batches { display:grid; gap:14px; }
        .cm-batch { border:1px solid #e2e8f0; border-radius:18px; padding:18px; }
        .cm-row { display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; }
        .cm-badge { display:inline-block; padding:6px 12px; border-radius:999px; background:#dbeafe; color:#1d4ed8; font-size:12px; font-weight:700; }
        .cm-price { font-size:1.05rem; font-weight:800; color:#111827; }
        .cm-old { color:#94a3b8; text-decoration:line-through; font-size:0.88rem; margin-left:8px; }
        .cm-btn {
          border:none; color:#fff; font-weight:700; border-radius:12px; padding:11px 18px;
          background: linear-gradient(135deg, #2563eb, #4f46e5); cursor:pointer;
        }
        .cm-btn:disabled { opacity:0.6; cursor:not-allowed; }

        .toast {
          position: fixed; top: 20px; right: 20px; z-index: 1300;
          min-width: 260px; color: #fff; padding: 14px 16px; border-radius: 16px;
          box-shadow: 0 12px 30px rgba(0,0,0,0.18);
        }
        .toast.success { background: linear-gradient(135deg, #2563eb, #4f46e5); }
        .toast.error { background: linear-gradient(135deg, #dc2626, #ef4444); }

        @media(max-width:1060px){
          .nav-menu{display:none} .support-pill{display:none} .btn-register{display:none}
          .btn-login-nav{display:none} .nav-divider{display:none} .hamburger{display:flex}
          .courses-grid{grid-template-columns:repeat(2,1fr)} .why-grid{grid-template-columns:repeat(2,1fr)}
          .hero-chips{display:none} .footer-grid{grid-template-columns:1fr 1fr;gap:30px}
        }
        @media(max-width:640px){
          .courses-grid{grid-template-columns:1fr} .why-grid{grid-template-columns:1fr 1fr}
          .filter-inner{flex-direction:column;align-items:stretch} .result-count{margin-left:0}
          .footer-grid{grid-template-columns:1fr} .nav-logo-main{font-size:0.82rem}
          .nav-logo-sub{display:none} .nav-logo-line{display:none}
        }
      `}</style>

      {toast.show && (
        <div className={`toast ${toast.type === "error" ? "error" : "success"}`}>
          {toast.message}
        </div>
      )}

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
          <button className="btn-login-nav" onClick={() => navigate("/login", { state: { from: "/courses" } })}>
            <span>Login →</span>
          </button>
          <div className={`hamburger ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen((o) => !o)}>
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
          <button className="mob-btn-login" onClick={() => navigate("/login", { state: { from: "/courses" } })}>
            Login →
          </button>
        </div>
      </div>

      <div className="marquee-bar">
        <span className="marquee-inner">
          💻 Basic Computer • ⌨️ English Typing • 📊 ADCA Diploma • 🌐 Web Development • 🧾 Tally Prime • 🎨 Graphic Design • 🐍 Python • 🔒 Cyber Security • 📝 MS Office • 🏆 Certification • 📞 Support Open
        </span>
      </div>

      <section className="hero">
        <div className="hero-inner">
          <div className="hero-badge">
            <span />
            Explore Courses and Paid Batches
          </div>
          <h1>
            Explore Our <em>Courses</em> and Join the Right Batch
          </h1>
          <p>
            Public users courses explore kar sakte hain. Login user batch purchase karke dashboard se learning access le sakta hai.
          </p>
          <div className="hero-stats">
            {[
              [String(courses.length || 0), "Courses"],
              ["Live", "Batch Access"],
              ["Email", "Receipt"],
              ["Admin", "Full Control"],
            ].map(([n, l], i) => (
              <div key={i}>
                <div className="hs-num">{n}</div>
                <div className="hs-lbl">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-chips">
          <div className="chip">
            <div className="chip-top">Public Access</div>
            <div className="chip-val">Courses</div>
            <div className="chip-sub">Sab users dekh sakte hain</div>
          </div>
          <div className="chip">
            <div className="chip-top">After Payment</div>
            <div className="chip-val">My Batches</div>
            <div className="chip-sub">Dashboard me access</div>
          </div>
          <div className="chip">
            <div className="chip-top">Admin Control</div>
            <div className="chip-val">Full CRUD</div>
            <div className="chip-sub">Price, publish, update</div>
          </div>
        </div>
      </section>

      <div className="filter-bar">
        <div className="filter-inner">
          <div className="search-wrap">
            <input
              className="search-inp"
              placeholder="Search courses…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="search-ic">🔍</span>
          </div>

          <div className="level-tabs">
            {LEVELS.map((l) => (
              <button key={l} className={`ltab ${level === l ? "on" : ""}`} onClick={() => setLevel(l)}>
                {l}
              </button>
            ))}
          </div>

          <div className="result-count">
            {fetchingCourses ? "Loading..." : `${filtered.length} course${filtered.length !== 1 ? "s" : ""} found`}
          </div>
        </div>
      </div>

      <section className="courses-section">
        {fetchingCourses ? (
          <div className="empty">
            <h3>Loading courses...</h3>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <div style={{ fontSize: "4rem", marginBottom: "16px" }}>😕</div>
            <h3>No courses found</h3>
            <p>Try a different search term or filter.</p>
          </div>
        ) : (
          <div className="courses-grid">
            {filtered.map((c, i) => (
              <div
                key={c._id || i}
                className={`cc ${visible[i] ? "show" : ""}`}
                ref={(el) => (cardRefs.current[i] = el)}
                data-idx={i}
                style={{ transitionDelay: `${(i % 3) * 80}ms` }}
                onClick={() => fetchBatchesByCourse(c)}
              >
                <div
                  className="cc-head"
                  style={{
                    background: `linear-gradient(135deg, ${(levelColor[c.level] || "#6c3de8")}22, ${(levelColor[c.level] || "#6c3de8")}44)`,
                  }}
                >
                  <span style={{ position: "relative", zIndex: 1 }}>{getCardIcon(c)}</span>
                  <div className="cc-tag1">{c.highlightTag || "Course"}</div>
                  <div className="cc-free">VIEW</div>
                </div>

                <div className="cc-body">
                  <div
                    className="cc-lv"
                    style={{
                      background: `${levelColor[c.level] || "#6c3de8"}18`,
                      color: levelColor[c.level] || "#6c3de8",
                    }}
                  >
                    {c.level || "Beginner"}
                  </div>
                  <div className="cc-title">{c.title}</div>
                  <div className="cc-desc">
                    {c.shortDescription || c.fullDescription || "No description available."}
                  </div>
                  <div className="cc-meta">
                    <span>⏱️ {c.duration || "-"}</span>
                    <span>📖 {c.lessons || 0} Lessons</span>
                    <span>🏷️ {c.category || "General"}</span>
                  </div>
                  <div className="cc-footer">
                    <span className="cc-stu">👥 {c.students || 0} enrolled</span>
                    <button
                      className="btn-enroll"
                      onClick={(e) => {
                        e.stopPropagation();
                        fetchBatchesByCourse(c);
                      }}
                    >
                      Explore Batches →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="why-section">
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
          <div className="s-tag">How It Works</div>
          <h2 className="s-title">Public Courses, Purchased Batch Access</h2>
          <p className="s-sub">
            Course page sab dekh sakte hain. Batch purchase ke baad hi user dashboard me access milta hai.
          </p>
        </div>
        <div className="why-grid">
          {[
            { icon: "📚", title: "Explore Courses", desc: "Public users sabhi courses aur available batches dekh sakte hain." },
            { icon: "💳", title: "Buy Batch", desc: "Login user selected batch purchase kar sakta hai." },
            { icon: "📩", title: "Get Receipt", desc: "Payment hone ke baad email par receipt bheji jaati hai." },
            { icon: "🎓", title: "Study in Dashboard", desc: "Purchased batch automatically My Batches me show hota hai." },
          ].map((w, i) => (
            <div className="why-card" key={i}>
              <div className="why-icon">{w.icon}</div>
              <div className="why-title">{w.title}</div>
              <div className="why-desc">{w.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta">
        <h2 className="cta-title">Ready to Join a Batch?</h2>
        <p className="cta-sub">Course explore kijiye, batch select kijiye, aur dashboard access paiye.</p>
        <div className="cta-btns">
          <button className="btn-cta-w" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            🚀 Explore Now
          </button>
          <button className="btn-cta-o" onClick={() => navigate("/login", { state: { from: "/courses" } })}>
            Login First
          </button>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-grid">
          <div>
            <div className="ft-logo-wrap">
              <div className="nav-logo-orb" style={{ width: 36, height: 36, borderRadius: 9, fontSize: 17 }}>
                💻
              </div>
              <span className="ft-logo-name">Computer Excellence Academy</span>
            </div>
            <p className="ft-desc">
              Admin-managed courses and batches with dashboard-based learning access.
            </p>
            <div className="socials">
              {["📘", "📸", "▶️", "🐦"].map((s, i) => (
                <a key={i} href="#" className="soc">
                  {s}
                </a>
              ))}
            </div>
          </div>
          <div>
            <div className="ft-h">Quick Links</div>
            <ul className="ft-l">
              <li><a href="/">Home</a></li>
              <li><a href="/courses">All Courses</a></li>
              <li><a href="/notes">PDF Notes</a></li>
              <li><a href="/aboutus">About Us</a></li>
            </ul>
          </div>
          <div>
            <div className="ft-h">Learner Flow</div>
            <ul className="ft-l">
              <li><a href="/courses">Explore Courses</a></li>
              <li><a href="/login">Login</a></li>
              <li><a href="/userdash/my-batches">My Batches</a></li>
            </ul>
          </div>
          <div>
            <div className="ft-h">Admin</div>
            <ul className="ft-l">
              <li><a href="/adlogin">Admin Login</a></li>
              <li><a href="/admin/courses">Manage Courses</a></li>
              <li><a href="/admin/batches">Manage Batches</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Computer Excellence Academy. All rights reserved.</p>
        </div>
      </footer>

      <button className={`scroll-top ${scrollY > 400 ? "show" : ""}`} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        ↑
      </button>

      {batchModalOpen && (
        <div className="course-modal-overlay" onClick={() => setBatchModalOpen(false)}>
          <div className="course-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cm-head">
              <div>
                <h3 style={{ marginBottom: "6px" }}>{selectedCourse?.title || "Course Batches"}</h3>
                <p style={{ color: "#64748b", margin: 0 }}>
                  Available batches explore kijiye aur suitable batch purchase kijiye.
                </p>
              </div>
              <button className="cm-close" onClick={() => setBatchModalOpen(false)}>
                ✕
              </button>
            </div>

            {selectedCourse && (
              <div className="cm-course">
                <div style={{ fontWeight: "700", marginBottom: "8px" }}>{selectedCourse.title}</div>
                <div style={{ color: "#64748b", fontSize: "14px", lineHeight: "1.7" }}>
                  {selectedCourse.shortDescription || selectedCourse.fullDescription || "No description available."}
                </div>
              </div>
            )}

            {loadingBatches ? (
              <div style={{ padding: "28px", textAlign: "center", color: "#64748b" }}>
                Loading batches...
              </div>
            ) : batches.length === 0 ? (
              <div style={{ padding: "28px", textAlign: "center", color: "#64748b" }}>
                Is course ke liye abhi koi published batch available nahi hai.
              </div>
            ) : (
              <div className="cm-batches">
                {batches.map((batch) => {
                  const finalAmount =
                    Number(batch.discountPrice || 0) > 0
                      ? Number(batch.discountPrice)
                      : Number(batch.price || 0);

                  return (
                    <div className="cm-batch" key={batch._id}>
                      <div className="cm-row" style={{ marginBottom: "10px" }}>
                        <div>
                          <div style={{ fontWeight: "800", fontSize: "1rem" }}>
                            {batch.batchName}
                          </div>
                          <div style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
                            {batch.description || "Batch description not available."}
                          </div>
                        </div>
                        <div>
                          <span className="cm-badge">{batch.mode || "online"}</span>
                        </div>
                      </div>

                      <div className="cm-row" style={{ marginBottom: "12px" }}>
                        <div style={{ color: "#64748b", fontSize: "14px" }}>
                          Start: {formatDate(batch.startDate)}
                        </div>
                        <div style={{ color: "#64748b", fontSize: "14px" }}>
                          Duration: {batch.duration || "-"}
                        </div>
                      </div>

                      {Array.isArray(batch.features) && batch.features.length > 0 && (
                        <div style={{ color: "#475569", fontSize: "14px", marginBottom: "12px" }}>
                          {batch.features.slice(0, 3).map((feature, index) => (
                            <div key={index}>• {feature}</div>
                          ))}
                        </div>
                      )}

                      <div className="cm-row">
                        <div className="cm-price">
                          ₹{finalAmount}
                          {Number(batch.discountPrice || 0) > 0 && (
                            <span className="cm-old">₹{batch.price}</span>
                          )}
                        </div>

                        <button
                          className="cm-btn"
                          disabled={buyingBatchId === batch._id}
                          onClick={() => handleBuyNow(batch)}
                        >
                          {buyingBatchId === batch._id ? "Processing..." : "Buy Now"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Course;
