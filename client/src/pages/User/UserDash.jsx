import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import MainNavbar from "../../components/navigation/MainNavbar";
import {
  FiAward,
  FiBookOpen,
  FiFileText,
  FiGrid,
  FiKey,
  FiLogOut,
  FiMenu,
  FiMessageSquare,
  FiUser,
  FiX,
  FiCreditCard,
  FiCheckSquare
} from "react-icons/fi";


const UserDash = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 1024);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 1024);
  const navigate = useNavigate();

  const role = localStorage.getItem("userRole");
  const email = localStorage.getItem("userEmail");
  const token = localStorage.getItem("token") || localStorage.getItem("userToken");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (role !== "user") {
      localStorage.setItem("userRole", "user");
    }
  }, [role, token, navigate]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width <= 1024;
      setIsMobile(mobile);
      
      // Auto-collapse logic:
      // > 1400px: Expanded (300px)
      // 1024px - 1400px: Collapsed Icons Only (92px)
      // <= 1024px: Closed Drawer
      if (width <= 1400 && width > 1024) {
        setSidebarOpen(false); // Collapsed
      } else if (width > 1400) {
        setSidebarOpen(true); // Expanded
      } else {
        setSidebarOpen(false); // Mobile Drawer closed
      }
    };

    handleResize(); // Run on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const isSidebarExpanded = sidebarOpen;

  const handleSidebarToggle = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleNavItemClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    localStorage.removeItem("userData");
    localStorage.removeItem("userToken");
    navigate("/");
  };

  if (!token) return null;

  const userCategories = [
    {
      title: "My Journey",
      items: [
        { to: "/userdash", label: "Overview", icon: <FiGrid /> },
        { to: "/userdash/profile", label: "My Profile", icon: <FiUser /> },
      ]
    },
    {
      title: "Learning Hub",
      items: [
        { to: "/userdash/courses", label: "All Courses", icon: <FiBookOpen /> },
        { to: "/userdash/my-batches", label: "My Batches", icon: <FiBookOpen /> },
        { to: "/userdash/notes", label: "Study Notes", icon: <FiFileText /> },
      ]
    },
    {
      title: "Assessment",
      items: [
        { to: "/userdash/myexam", label: "My Exams", icon: <FiBookOpen /> },
        { to: "/userdash/results", label: "Exam Results", icon: <FiAward /> },
        { to: "/userdash/attendance", label: "Attendance", icon: <FiCheckSquare /> },
        { to: "/userdash/leaderboard", label: "Leaderboard 🏆", icon: <FiAward /> },
      ]
    },
    {
      title: "Account & Support",
      items: [
        { to: "/userdash/payments", label: "Payments", icon: <FiCreditCard /> },
        { to: "/userdash/chanpass", label: "Security", icon: <FiKey /> },
        { to: "/userdash/contact1", label: "Support", icon: <FiMessageSquare /> },
      ]
    }
  ];

  return (
    <>
      <MainNavbar />
      <style>{`
        .userdash-layout {
          --userdash-navbar-height: 70px;
          min-height: 100vh;
          background: #f6fbff;
          padding-top: 0;
          font-family: "Outfit", sans-serif;
        }
        .userdash-sidebar { position: fixed; top: 0; left: 0; height: 100vh; width: 300px; padding: calc(var(--userdash-navbar-height) + 18px) 18px 20px; color: #fff; background: radial-gradient(circle at top right, rgba(78, 214, 255, 0.2), transparent 26%), radial-gradient(circle at 20% 10%, rgba(242, 31, 133, 0.18), transparent 22%), linear-gradient(180deg, #0d0626 0%, #1c0750 52%, #2f0d79 100%); border-right: 1px solid rgba(255,255,255,0.1); box-shadow: 18px 0 48px rgba(30, 10, 80, 0.22); display: flex; flex-direction: column; gap: 18px; transition: width 0.3s ease, padding 0.3s ease, transform 0.3s ease; z-index: 940; overflow-y: auto; }
        .userdash-layout.collapsed .userdash-sidebar { width: 92px; padding: calc(var(--userdash-navbar-height) + 18px) 12px 20px; }
        .userdash-main { margin-left: 300px; min-height: 100vh; margin-top: -120px; transition: margin-left 0.3s ease; position: relative; overflow: hidden; background: #f6fbff; }
        .userdash-main::before { content: ""; position: absolute; inset: 0; pointer-events: none; background: none; }
        .userdash-layout.collapsed .userdash-main { margin-left: 92px; }
        .userdash-header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.12); }
        .userdash-brand { color: #fff; text-decoration: none; }
        .userdash-brand h3 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.02em; font-family: "Playfair Display", serif; }
        .userdash-brand p { margin: 4px 0 0; font-size: 11px; opacity: 0.76; letter-spacing: 0.14em; text-transform: uppercase; }
        .userdash-toggle { border: none; background: rgba(255,255,255,0.12); color: #fff; width: 40px; height: 40px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; transition: 0.2s ease; }
        .userdash-toggle:hover { background: rgba(255,255,255,0.2); }
        .userdash-welcome { display: flex; gap: 12px; align-items: center; padding: 15px; border-radius: 24px; background: linear-gradient(180deg, rgba(255,255,255,0.15), rgba(255,255,255,0.08)); border: 1px solid rgba(255,255,255,0.12); backdrop-filter: blur(12px); box-shadow: inset 0 1px 0 rgba(255,255,255,0.12); }
        .userdash-avatar { width: 46px; height: 46px; border-radius: 16px; display: grid; place-items: center; font-weight: 800; background: linear-gradient(135deg, #6f3cf2, #f21f85, #38bdf8); flex-shrink: 0; box-shadow: 0 14px 28px rgba(111, 60, 242, 0.28); color: #fff; }
        .userdash-welcome-text strong { display: block; font-size: 14px; }
        .userdash-welcome-text p { margin: 2px 0 0; font-size: 12px; opacity: 0.8; word-break: break-word; }
        .userdash-nav { display: flex; flex-direction: column; gap: 8px; }
        .userdash-link { position: relative; display: flex; align-items: center; gap: 12px; color: #dbeafe; text-decoration: none; padding: 12px 14px; border-radius: 16px; border: 1px solid transparent; backdrop-filter: blur(8px); transition: all 0.25s ease; overflow: hidden; }
        .userdash-link::before { content: ""; position: absolute; left: 0; top: 10px; bottom: 10px; width: 4px; border-radius: 999px; background: transparent; transition: 0.25s ease; }
        .userdash-link:hover { color: #fff; background: linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06)); border-color: rgba(255,255,255,0.12); transform: translateX(5px); }
        .userdash-link.active-link { color: #fff; background: linear-gradient(135deg, rgba(111,60,242,0.95), rgba(242,31,133,0.92)); border-color: rgba(255,255,255,0.14); box-shadow: 0 14px 30px rgba(111, 60, 242, 0.28); }
        .userdash-link.active-link::before { background: #a5b4fc; }
        .userdash-icon-wrap { width: 36px; height: 36px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.1); flex-shrink: 0; transition: 0.25s ease; }
        .userdash-link:hover .userdash-icon-wrap, .userdash-link.active-link .userdash-icon-wrap { background: rgba(255,255,255,0.18); }
        .userdash-icon { font-size: 18px; display: flex; }
        .userdash-logout { margin-top: auto; border: 1px solid rgba(254, 202, 202, 0.22); background: linear-gradient(135deg, rgba(127,29,29,0.24), rgba(220,38,38,0.12)); color: #fff; border-radius: 16px; padding: 12px 14px; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: 0.25s ease; }
        .userdash-logout:hover { background: linear-gradient(135deg, rgba(127,29,29,0.34), rgba(220,38,38,0.18)); transform: translateY(-1px); }
        .userdash-logout-icon { width: 36px; height: 36px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.1); flex-shrink: 0; }
        .userdash-layout.collapsed .userdash-header { justify-content: center; padding-bottom: 10px; }
        .userdash-layout.collapsed .userdash-brand, .userdash-layout.collapsed .userdash-welcome-text, .userdash-layout.collapsed .userdash-link-label { display: none; }
        .userdash-layout.collapsed .userdash-toggle { margin: 0 auto; }
        .userdash-layout.collapsed .userdash-welcome { justify-content: center; padding: 12px; }
        .userdash-layout.collapsed .userdash-link { justify-content: center; padding: 12px; }
        .userdash-layout.collapsed .userdash-link:hover { transform: none; }
        .userdash-layout.collapsed .userdash-link::before { display: none; }
        .userdash-layout.collapsed .userdash-logout { width: 52px; height: 52px; padding: 0; margin-left: auto; margin-right: auto; border-radius: 16px; justify-content: center; gap: 0; }
        .userdash-layout.collapsed .userdash-logout span:not(.userdash-logout-icon) { display: none; }
        .userdash-layout.collapsed .userdash-logout-icon { width: 100%; height: 100%; background: transparent; border-radius: 16px; }
       .userdash-topbar { position: sticky; top: var(--adminx-navbar-height); z-index: 900; margin: 100px 16px 20px; padding: 12px 20px; border-radius: 24px; color: #fff; background: radial-gradient(circle at right top, rgba(82, 191, 255, 0.18), transparent 22%), radial-gradient(circle at left bottom, rgba(248, 180, 0, 0.16), transparent 20%), linear-gradient(135deg, #10052d, #250966, #1d7ed8); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 16px 32px rgba(35, 17, 98, 0.18); display: flex; justify-content: space-between; align-items: center; gap: 10px; }
        .userdash-topbar h4 { margin: 0 0 4px; font-weight: 800; font-size: 1.7rem; font-family: "Playfair Display", serif; }
        .userdash-topbar p { margin: 0; opacity: 0.82; font-size: 14px; }
        .userdash-topbar-btn { border: none; background: rgba(255,255,255,0.14); color: #fff; width: 42px; height: 42px; border-radius: 12px; display: none; align-items: center; justify-content: center; }
        .userdash-content { position: relative; z-index: 1; padding: 0px 24px 34px; background: #f6fbff; min-height: calc(100vh - 140px); }
        .userdash-content .card, .userdash-content .home-panel, .userdash-content .ap-panel, .userdash-content .ap-stat, .userdash-content [class*="-panel"] { border-radius: 22px !important; border: 1px solid #e8dcff !important; box-shadow: 0 14px 30px rgba(33, 17, 73, 0.07) !important; background: linear-gradient(180deg, #ffffff 0%, #fbf8ff 100%) !important; }
        .userdash-content .table tr:hover td { background: #f8f2ff !important; }
        .userdash-content .btn-primary, .userdash-content .btn-success { border: none !important; background: linear-gradient(135deg, #7b3ff2, #f21f85) !important; box-shadow: 0 10px 22px rgba(123, 63, 242, 0.24); }
        .userdash-content .btn-primary:hover, .userdash-content .btn-success:hover { transform: translateY(-2px); }
        .userdash-content .form-control, .userdash-content input, .userdash-content select, .userdash-content textarea { border-radius: 13px !important; border: 1px solid #dcccfb !important; box-shadow: none !important; }
        .userdash-content .form-control:focus, .userdash-content input:focus, .userdash-content select:focus, .userdash-content textarea:focus { border-color: #8e58ef !important; box-shadow: 0 0 0 3px rgba(142, 88, 239, 0.14) !important; }
        .userdash-animated-line { display: inline-block; color: rgba(255, 255, 255, 0.8); }
        @keyframes shimmerText { 0% { background-position: 0% 0%; } 100% { background-position: 220% 0%; } }
        .page-hero { background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%); padding: 60px 40px; border-radius: 28px; color: #fff; position: relative; overflow: hidden; margin-bottom: 40px; border: 1px solid rgba(99,102,241,0.2); box-shadow: 0 18px 40px rgba(15,23,42,0.2); }
        .page-hero::before { content: ""; position: absolute; top: -100px; right: -100px; width: 400px; height: 400px; background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%); border-radius: 50%; }
        .page-hero h1 { position: relative; z-index: 2; font-size: 2.5rem; font-weight: 900; margin-bottom: 16px; }
        .page-hero p { position: relative; z-index: 2; color: rgba(255,255,255,0.85); font-size: 1.1rem; margin-bottom: 0; }
        .page-hero .badge { position: relative; z-index: 2; }
        .userdash-nav-category { margin-top: 20px; margin-bottom: 8px; padding: 0 14px; font-size: 11px; font-weight: 800; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.8px; }
        .userdash-layout.collapsed .userdash-nav-category { display: none; }
        .userdash-backdrop { display: none; }
        @media (max-width: 1024px) {
          .userdash-sidebar { width: min(86vw, 320px); transform: translateX(-100%); box-shadow: 20px 0 48px rgba(30, 10, 80, 0.28); }
          .userdash-layout:not(.collapsed) .userdash-sidebar { transform: translateX(0); }
          .userdash-layout.collapsed .userdash-sidebar { width: min(86vw, 320px); padding: calc(var(--userdash-navbar-height) + 18px) 18px 20px; }
          .userdash-main, .userdash-layout.collapsed .userdash-main { margin-left: 0; }
          .userdash-topbar { top: calc(var(--userdash-navbar-height) + 6px); margin: 10px 12px 24px; padding: 18px 20px; border-radius: 20px; }
          .userdash-topbar h4 { font-size: 1.3rem; margin-bottom: 6px; }
          .userdash-topbar p { font-size: 0.9rem; }
          .userdash-topbar-btn { display: inline-flex; flex-shrink: 0; }
          .userdash-content { padding: 0px 14px 28px; }
          .userdash-backdrop { position: fixed; inset: var(--userdash-navbar-height) 0 0 0; display: block; background: rgba(7, 11, 25, 0.45); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); z-index: 930; }
        }
        @media (max-width: 640px) {
          .userdash-topbar { align-items: flex-start; }
          .userdash-content { padding-left: 12px; padding-right: 12px; }
        }
      `}</style>

      <div className={`userdash-layout ${isSidebarExpanded ? "" : "collapsed"}`}>
        {isMobile && isSidebarExpanded ? (
          <motion.button
            type="button"
            className="userdash-backdrop"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        ) : null}

        <motion.aside
          className="userdash-sidebar"
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div className="userdash-header" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            {isSidebarExpanded ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <NavLink to="/userdash" className="userdash-brand" onClick={handleNavItemClick}>
                  <h3>CEA Learning</h3>
                  <p>Student Portal</p>
                </NavLink>
              </motion.div>
            ) : null}

            <motion.button
              type="button"
              className="userdash-toggle"
              onClick={handleSidebarToggle}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSidebarExpanded ? <FiX /> : <FiMenu />}
            </motion.button>
          </motion.div>

          <motion.div className="userdash-welcome" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <motion.div className="userdash-avatar" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }}>
              {(() => {
                const userData = JSON.parse(localStorage.getItem("userData") || "{}");
                return (userData.name || "U").charAt(0).toUpperCase();
              })()}
            </motion.div>
            {isSidebarExpanded ? (
              <motion.div className="userdash-welcome-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <strong>Welcome Back</strong>
                <p>
                  {(() => {
                    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
                    return userData.name || email || "Student";
                  })()}
                </p>
              </motion.div>
            ) : null}
          </motion.div>

          <nav className="userdash-nav">
            {userCategories.map((category, catIndex) => (
              <motion.div key={category.title} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: catIndex * 0.05 + 0.2 }}>
                {isSidebarExpanded ? (
                  <motion.div className="userdash-nav-category" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {category.title}
                  </motion.div>
                ) : null}

                {category.items.map((item, itemIndex) => (
                  <motion.div key={item.to} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: catIndex * 0.05 + itemIndex * 0.03 + 0.2 }}>
                    <NavLink
                      to={item.to}
                      end={item.to === "/userdash"}
                      className={({ isActive }) => `userdash-link ${isActive ? "active-link" : ""}`}
                      onClick={handleNavItemClick}
                    >
                      {({ isActive }) => (
                        <>
                          <motion.span className="userdash-icon-wrap" whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.92 }}>
                            <span className="userdash-icon">{item.icon}</span>
                          </motion.span>
                          {isSidebarExpanded ? <span className="userdash-link-label">{item.label}</span> : null}
                          {isActive ? (
                            <motion.div
                              layoutId="activeUserIndicator"
                              style={{
                                position: "absolute",
                                left: 0,
                                top: "10px",
                                bottom: "10px",
                                width: "4px",
                                background: "#a5b4fc",
                                borderRadius: "0 999px 999px 0",
                              }}
                            />
                          ) : null}
                        </>
                      )}
                    </NavLink>
                  </motion.div>
                ))}
              </motion.div>
            ))}
          </nav>

          <motion.button
            type="button"
            className="userdash-logout"
            onClick={handleLogout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <span className="userdash-logout-icon">
              <FiLogOut />
            </span>
            {isSidebarExpanded ? <span>Log Out</span> : null}
          </motion.button>
        </motion.aside>

        <main className="userdash-main">
          <motion.div className="userdash-topbar" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div>
              <h4>{greeting}</h4>
              <p className="userdash-animated-line">Manage your exams, batches, profile, results, and support messages.</p>
            </div>

            <motion.button
              type="button"
              className="userdash-topbar-btn"
              onClick={handleSidebarToggle}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSidebarExpanded ? <FiX /> : <FiMenu />}
            </motion.button>
          </motion.div>

          <motion.div className="userdash-content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Outlet />
          </motion.div>
        </main>
      </div>
    </>
  );
};

export default UserDash;
