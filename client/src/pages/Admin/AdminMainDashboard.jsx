import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import MainNavbar from "../../components/navigation/MainNavbar";
import {
  FiAward,
  FiBookOpen,
  FiCheckSquare,
  FiClipboard,
  FiCreditCard,
  FiFileText,
  FiGrid,
  FiHelpCircle,
  FiKey,
  FiLogOut,
  FiMenu,
  FiMessageSquare,
  FiPenTool,
  FiPieChart,
  FiUsers,
  FiX,
} from "react-icons/fi";

const AdminMainDashboard = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 1024);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 1024);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const email = localStorage.getItem("email");
  const adminToken = localStorage.getItem("adminToken");
  const adminRefreshToken = localStorage.getItem("adminRefreshToken");

  useEffect(() => {
    const normalizeToken = (value) => {
      if (!value || value === "undefined" || value === "null") {
        return "";
      }
      return value;
    };

    const parseJwtPayload = (token) => {
      try {
        const base64 = token.split(".")[1];
        if (!base64) return null;
        return JSON.parse(atob(base64));
      } catch {
        return null;
      }
    };

    const isTokenExpired = (token) => {
      const payload = parseJwtPayload(token);
      if (!payload?.exp) return false;
      // 15s skew to avoid near-expiry race.
      return payload.exp * 1000 <= Date.now() + 15000;
    };

    const fetchAdminProfile = async (token) => {
      return axios.get(`${import.meta.env.VITE_API_URL}/api/admin/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    };

    const refreshAdminAccessToken = async () => {
      const refreshToken = normalizeToken(adminRefreshToken);
      if (!refreshToken) {
        throw new Error("No admin refresh token");
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/refresh-token`,
        { refreshToken }
      );

      const newToken = response?.data?.accessToken;
      if (!newToken) {
        throw new Error("Refresh token response missing accessToken");
      }

      localStorage.setItem("adminToken", newToken);
      if (response?.data?.refreshToken) {
        localStorage.setItem("adminRefreshToken", response.data.refreshToken);
      }

      return newToken;
    };

    const verifyAccess = async () => {
      const initialToken = normalizeToken(adminToken);
      if (!initialToken) {
        navigate("/adlogin");
        return;
      }

      if (role !== "admin") {
        localStorage.setItem("role", "admin");
      }

      try {
        let tokenToUse = initialToken;

        if (isTokenExpired(tokenToUse)) {
          tokenToUse = await refreshAdminAccessToken();
        }

        let response;
        try {
          response = await fetchAdminProfile(tokenToUse);
        } catch (error) {
          if (error?.response?.status === 401) {
            tokenToUse = await refreshAdminAccessToken();
            response = await fetchAdminProfile(tokenToUse);
          } else {
            throw error;
          }
        }

        if (response?.data?.admin) {
          localStorage.setItem("adminData", JSON.stringify(response.data.admin));
          localStorage.setItem("email", response.data.admin.email || "");
          localStorage.setItem("role", response.data.admin.role || "admin");
        }
      } catch {
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminRefreshToken");
        localStorage.removeItem("adminData");
        navigate("/adlogin");
        return;
      } finally {
        setCheckingAccess(false);
      }
    };

    verifyAccess();
  }, [adminToken, adminRefreshToken, navigate, role]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

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
        setSidebarOpen(false); // Collapsed Sidebar
      } else if (width > 1400) {
        setSidebarOpen(true); // Default Expanded
      } else {
        setSidebarOpen(false); // Closed drawer for mobile
      }
    };

    handleResize(); // Trigger on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRefreshToken");
    localStorage.removeItem("adminData");
    navigate("/adlogin");
  };

  const adminCategories = [
    {
      title: "Admin Home",
      items: [{ to: "/admin", label: "Overview", icon: <FiGrid /> }],
    },
    {
      title: "Academic Setup",
      items: [
        { to: "/admin/courses", label: "Courses", icon: <FiBookOpen /> },
        { to: "/admin/batches", label: "Batches", icon: <FiClipboard /> },
        { to: "/admin/session", label: "Sessions", icon: <FiClipboard /> },
        { to: "/admin/subject", label: "Subjects", icon: <FiBookOpen /> },
        { to: "/admin/notes", label: "Learning Content", icon: <FiFileText /> },
      ],
    },
    {
      title: "Assessment",
      items: [
        { to: "/admin/examinee", label: "Students", icon: <FiUsers /> },
        { to: "/admin/questionbank", label: "Question Bank", icon: <FiHelpCircle /> },
        { to: "/admin/examination", label: "Exams", icon: <FiPenTool /> },
        { to: "/admin/attendance", label: "Attendance", icon: <FiCheckSquare /> },
        { to: "/admin/enrollments", label: "Enrollments", icon: <FiUsers /> },
      ],
    },
    {
      title: "Reports & Finance",
      items: [
        { to: "/admin/report", label: "Reports", icon: <FiFileText /> },
        { to: "/admin/result", label: "Results", icon: <FiAward /> },
        { to: "/admin/payments", label: "Payments", icon: <FiCreditCard /> },
        { to: "/admin/coupons", label: "Coupons", icon: <FiPieChart /> },
      ],
    },
    {
      title: "Support",
      items: [
        { to: "/admin/reviews", label: "Reviews", icon: <FiMessageSquare /> },
        { to: "/admin/contact", label: "Messages", icon: <FiMessageSquare /> },
        { to: "/admin/password", label: "Security", icon: <FiKey /> },
      ],
    },
  ];

  if (checkingAccess) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)",
          color: "#1e3a8a",
          fontWeight: 700,
        }}
      >
        Verifying admin access...
      </div>
    );
  }

  if (role !== "admin" || !adminToken) {
    return null;
  }

  return (
    <>
      <MainNavbar />
      <style>{`
        .adminx-layout {
          --adminx-navbar-height: 70px;
          min-height: 100vh;
          background: #ffffff;
          padding-top: 0;
          font-family: "Outfit", sans-serif;
        }
        .adminx-sidebar { position: fixed; top: 0; left: 0; height: 100vh; width: 300px; padding: calc(var(--adminx-navbar-height) + 18px) 18px 20px; color: #fff; background: radial-gradient(circle at top right, rgba(82, 191, 255, 0.2), transparent 26%), radial-gradient(circle at 18% 10%, rgba(250, 204, 21, 0.12), transparent 18%), linear-gradient(180deg, #0d0626 0%, #18084a 52%, #280a69 100%); border-right: 1px solid rgba(255,255,255,0.1); box-shadow: 18px 0 48px rgba(29, 12, 80, 0.2); display: flex; flex-direction: column; gap: 18px; transition: width 0.3s ease, padding 0.3s ease, transform 0.3s ease; z-index: 940; overflow-y: auto; }
        .adminx-layout.collapsed .adminx-sidebar { width: 92px; padding: calc(var(--adminx-navbar-height) + 18px) 12px 20px; }
        .adminx-main { margin-left: 300px; min-height: 100vh; margin-top: -120px; transition: margin-left 0.3s ease; position: relative; overflow: hidden; background: #ffffffcb; }
        .adminx-main::before { content: ""; position: absolute; inset: 0; pointer-events: none; background: none; }
        .adminx-layout.collapsed .adminx-main { margin-left: 92px; }
        .adminx-header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.12); }
        .adminx-brand { color: #fff; text-decoration: none; }
        .adminx-brand h3 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.02em; font-family: "Playfair Display", serif; }
        .adminx-brand p { margin: 4px 0 0; font-size: 11px; opacity: 0.76; letter-spacing: 0.14em; text-transform: uppercase; }
        .adminx-toggle { border: none; background: rgba(255,255,255,0.12); color: #fff; width: 40px; height: 40px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; transition: 0.2s ease; }
        .adminx-toggle:hover { background: rgba(255,255,255,0.2); }
        .adminx-welcome { display: flex; gap: 12px; align-items: center; padding: 15px; border-radius: 24px; background: linear-gradient(180deg, rgba(255,255,255,0.15), rgba(255,255,255,0.08)); border: 1px solid rgba(255,255,255,0.12); backdrop-filter: blur(12px); box-shadow: inset 0 1px 0 rgba(255,255,255,0.12); }
        .adminx-avatar { width: 46px; height: 46px; border-radius: 16px; display: grid; place-items: center; font-weight: 800; background: linear-gradient(135deg, #6f3cf2, #1c9df2, #f8b400); flex-shrink: 0; box-shadow: 0 14px 28px rgba(28, 157, 242, 0.24); color: #fff; }
        .adminx-welcome-text strong { display: block; font-size: 14px; }
        .adminx-welcome-text p { margin: 2px 0 0; font-size: 12px; opacity: 0.8; word-break: break-word; }
        .adminx-nav { display: flex; flex-direction: column; gap: 8px; }
        .adminx-link { position: relative; display: flex; align-items: center; gap: 12px; color: #dbeafe; text-decoration: none; padding: 12px 14px; border-radius: 16px; border: 1px solid transparent; backdrop-filter: blur(8px); transition: all 0.25s ease; overflow: hidden; }
        .adminx-link::before { content: ""; position: absolute; left: 0; top: 10px; bottom: 10px; width: 4px; border-radius: 999px; background: transparent; transition: 0.25s ease; }
        .adminx-link:hover { color: #fff; background: linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06)); border-color: rgba(255,255,255,0.12); transform: translateX(5px); }
        .adminx-link.active-link { color: #fff; background: linear-gradient(135deg, rgba(111,60,242,0.95), rgba(28,157,242,0.9)); border-color: rgba(255,255,255,0.14); box-shadow: 0 14px 30px rgba(28, 157, 242, 0.24); }
        .adminx-link.active-link::before { background: #a5b4fc; }
        .adminx-icon-wrap { width: 36px; height: 36px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.1); flex-shrink: 0; transition: 0.25s ease; }
        .adminx-link:hover .adminx-icon-wrap, .adminx-link.active-link .adminx-icon-wrap { background: rgba(255,255,255,0.18); }
        .adminx-icon { font-size: 18px; display: flex; }
        .adminx-logout { margin-top: auto; border: 1px solid rgba(254, 202, 202, 0.22); background: linear-gradient(135deg, rgba(127,29,29,0.24), rgba(220,38,38,0.12)); color: #fff; border-radius: 16px; padding: 12px 14px; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: 0.25s ease; }
        .adminx-logout:hover { background: linear-gradient(135deg, rgba(127,29,29,0.34), rgba(220,38,38,0.18)); transform: translateY(-1px); }
        .adminx-logout-icon { width: 36px; height: 36px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.1); flex-shrink: 0; }
        .adminx-layout.collapsed .adminx-header { justify-content: center; padding-bottom: 10px; }
        .adminx-layout.collapsed .adminx-brand, .adminx-layout.collapsed .adminx-welcome-text, .adminx-layout.collapsed .adminx-link-label { display: none; }
        .adminx-layout.collapsed .adminx-toggle { margin: 0 auto; }
        .adminx-layout.collapsed .adminx-welcome { justify-content: center; padding: 12px; }
        .adminx-layout.collapsed .adminx-link { justify-content: center; padding: 12px; }
        .adminx-layout.collapsed .adminx-link:hover { transform: none; }
        .adminx-layout.collapsed .adminx-link::before { display: none; }
        .adminx-layout.collapsed .adminx-logout { width: 52px; height: 52px; padding: 0; margin-left: auto; margin-right: auto; border-radius: 16px; justify-content: center; gap: 0; }
        .adminx-layout.collapsed .adminx-logout span:not(.adminx-logout-icon) { display: none; }
        .adminx-layout.collapsed .adminx-logout-icon { width: 100%; height: 100%; background: transparent; border-radius: 16px; }
        .adminx-topbar { position: sticky; top: var(--adminx-navbar-height); z-index: 900; margin: 100px 16px 20px; padding: 12px 20px; border-radius: 24px; color: #fff; background: radial-gradient(circle at right top, rgba(82, 191, 255, 0.18), transparent 22%), radial-gradient(circle at left bottom, rgba(248, 180, 0, 0.16), transparent 20%), linear-gradient(135deg, #10052d, #250966, #1d7ed8); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 16px 32px rgba(35, 17, 98, 0.18); display: flex; justify-content: space-between; align-items: center; gap: 10px; }
        .adminx-topbar h4 { margin: 0 0 4px; font-weight: 800; font-size: 1.7rem; font-family: "Playfair Display", serif; }
        .adminx-topbar p { margin: 0; opacity: 0.82; font-size: 14px; }
        .adminx-topbar-btn { border: none; background: rgba(255,255,255,0.14); color: #fff; width: 42px; height: 42px; border-radius: 12px; display: none; align-items: center; justify-content: center; }
        .adminx-content { position: relative; z-index: 1; padding: 0px 24px 34px; background: #ffffff; min-height: calc(100vh - 140px); }
        .adminx-content .card, .adminx-content .home-panel, .adminx-content .ap-panel, .adminx-content .ap-stat, .adminx-content [class*="-panel"] { border-radius: 22px !important; border: 1px solid #e8dcff !important; box-shadow: 0 14px 30px rgba(33, 17, 73, 0.07) !important; background: linear-gradient(180deg, #ffffff 0%, #fbf8ff 100%) !important; }
        .adminx-content .table tr:hover td { background: #f8f2ff !important; }
        .adminx-content .btn-primary, .adminx-content .btn-success { border: none !important; background: linear-gradient(135deg, #7b3ff2, #f21f85) !important; box-shadow: 0 10px 22px rgba(123, 63, 242, 0.24); }
        .adminx-content .btn-primary:hover, .adminx-content .btn-success:hover { transform: translateY(-2px); }
        .adminx-content .form-control, .adminx-content input, .adminx-content select, .adminx-content textarea { border-radius: 13px !important; border: 1px solid #dcccfb !important; box-shadow: none !important; }
        .adminx-content .form-control:focus, .adminx-content input:focus, .adminx-content select:focus, .adminx-content textarea:focus { border-color: #8e58ef !important; box-shadow: 0 0 0 3px rgba(142, 88, 239, 0.14) !important; }
        .adminx-animated-line { display: inline-block; background: linear-gradient(90deg, #ffffff, #f0d5ff, #ffffff); background-size: 220% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; animation: shimmerText 4s linear infinite; }
        @keyframes shimmerText { 0% { background-position: 0% 0%; } 100% { background-position: 220% 0%; } }
        .page-hero { background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%); padding: 60px 40px; border-radius: 28px; color: #fff; position: relative; overflow: hidden; margin-bottom: 40px; border: 1px solid rgba(99,102,241,0.2); box-shadow: 0 18px 40px rgba(15,23,42,0.2); }
        .page-hero::before { content: ""; position: absolute; top: -100px; right: -100px; width: 400px; height: 400px; background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%); border-radius: 50%; }
        .page-hero h1 { position: relative; z-index: 2; font-size: 2.5rem; font-weight: 900; margin-bottom: 16px; }
        .page-hero p { position: relative; z-index: 2; color: rgba(255,255,255,0.85); font-size: 1.1rem; margin-bottom: 0; }
        .page-hero .badge { position: relative; z-index: 2; }
        .adminx-nav-category { margin-top: 20px; margin-bottom: 8px; padding: 0 14px; font-size: 11px; font-weight: 800; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.8px; }
        .adminx-layout.collapsed .adminx-nav-category { display: none; }
        .adminx-backdrop { display: none; }
        @media (max-width: 1024px) {
          .adminx-sidebar { width: min(86vw, 320px); transform: translateX(-100%); box-shadow: 20px 0 48px rgba(29, 12, 80, 0.28); }
          .adminx-layout:not(.collapsed) .adminx-sidebar { transform: translateX(0); }
          .adminx-layout.collapsed .adminx-sidebar { width: min(86vw, 320px); padding: calc(var(--adminx-navbar-height) + 18px) 18px 20px; }
          .adminx-main, .adminx-layout.collapsed .adminx-main { margin-left: 0; }
          .adminx-topbar { top: calc(var(--adminx-navbar-height) + 10px); margin: 12px 12px 20px; padding: 14px 16px; border-radius: 20px; }
          .adminx-topbar h4 { font-size: 1.4rem; }
          .adminx-topbar p { font-size: 13px; }
          .adminx-topbar-btn { display: inline-flex; flex-shrink: 0; }
          .adminx-content { padding: 0px 14px 28px; }
          .adminx-backdrop { position: fixed; inset: var(--adminx-navbar-height) 0 0 0; display: block; background: rgba(7, 11, 25, 0.45); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); z-index: 930; }
        }
        @media (max-width: 640px) {
          .adminx-topbar { align-items: flex-start; }
          .adminx-content { padding-left: 12px; padding-right: 12px; }
        }
      `}</style>

      <div className={`adminx-layout ${isSidebarExpanded ? "" : "collapsed"}`}>
        {isMobile && isSidebarExpanded ? (
          <motion.button
            type="button"
            className="adminx-backdrop"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        ) : null}

        <motion.aside
          className="adminx-sidebar"
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div className="adminx-header" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            {isSidebarExpanded ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <NavLink to="/admin" className="adminx-brand" onClick={handleNavItemClick}>
                  <h3>CEA Admin</h3>
                  <p>Control Center</p>
                </NavLink>
              </motion.div>
            ) : null}

            <motion.button
              type="button"
              className="adminx-toggle"
              onClick={handleSidebarToggle}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSidebarExpanded ? <FiX /> : <FiMenu />}
            </motion.button>
          </motion.div>

          <motion.div className="adminx-welcome" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <motion.div className="adminx-avatar" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }}>
              {(() => {
                const adminData = JSON.parse(localStorage.getItem("adminData") || "{}");
                return (adminData.name || "A").charAt(0).toUpperCase();
              })()}
            </motion.div>
            {isSidebarExpanded ? (
              <motion.div className="adminx-welcome-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <strong>Welcome Back</strong>
                <p>
                  {(() => {
                    const adminData = JSON.parse(localStorage.getItem("adminData") || "{}");
                    return adminData.name || email || "Administrator";
                  })()}
                </p>
              </motion.div>
            ) : null}
          </motion.div>

          <nav className="adminx-nav">
            {adminCategories.map((category, catIndex) => (
              <motion.div key={category.title} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: catIndex * 0.05 + 0.2 }}>
                {isSidebarExpanded ? (
                  <motion.div className="adminx-nav-category" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {category.title}
                  </motion.div>
                ) : null}

                {category.items.map((item, itemIndex) => (
                  <motion.div key={item.to} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: catIndex * 0.05 + itemIndex * 0.03 + 0.2 }}>
                    <NavLink
                      to={item.to}
                      end={item.to === "/admin"}
                      className={({ isActive }) => `adminx-link ${isActive ? "active-link" : ""}`}
                      onClick={handleNavItemClick}
                    >
                      {({ isActive }) => (
                        <>
                          <motion.span className="adminx-icon-wrap" whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.92 }}>
                            <span className="adminx-icon">{item.icon}</span>
                          </motion.span>
                          {isSidebarExpanded ? <span className="adminx-link-label">{item.label}</span> : null}
                          {isActive ? (
                            <motion.div
                              layoutId="activeAdminIndicator"
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
            className="adminx-logout"
            onClick={handleLogout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <span className="adminx-logout-icon">
              <FiLogOut />
            </span>
            {isSidebarExpanded ? <span>Log Out</span> : null}
          </motion.button>
        </motion.aside>

        <main className="adminx-main">
          <motion.div className="adminx-topbar" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div>
              <h4>{greeting}</h4>
              <p className="adminx-animated-line">Manage batches, content, exams, reports, and support from one dashboard.</p>
            </div>

            <motion.button
              type="button"
              className="adminx-topbar-btn"
              onClick={handleSidebarToggle}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSidebarExpanded ? <FiX /> : <FiMenu />}
            </motion.button>
          </motion.div>

          <motion.div className="adminx-content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Outlet />
          </motion.div>
        </main>
      </div>
    </>
  );
};

export default AdminMainDashboard;
