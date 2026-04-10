import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

const MainNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null); // "user" or "admin"

  const navLinks = [
    { label: "Home", href: "/", icon: "🏠" },
    { label: "Courses", href: "/courses", icon: "📚", badge: "24+" },
    { label: "PDF Notes", href: "/notes", icon: "📄" },
    { label: "About Us", href: "/aboutus", icon: "ℹ️" },
  ];

  useEffect(() => {
    const checkAuth = () => {
      const userToken = localStorage.getItem("token") || localStorage.getItem("userToken");
      const adminToken = localStorage.getItem("adminToken");
      const userData = localStorage.getItem("userData");
      const adminData = localStorage.getItem("adminData");

      if (userToken || userData) {
        setIsLoggedIn(true);
        setUserType("user");
        return;
      }
      if (adminToken || adminData) {
        setIsLoggedIn(true);
        setUserType("admin");
        return;
      }
      setIsLoggedIn(false);
      setUserType(null);
    };

    checkAuth();
  }, [location]);

  useEffect(() => {
    const fn = () => {
      setScrollY(window.scrollY);
      if (window.scrollY > 10) setMenuOpen(false);
    };
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("adminData");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    setIsLoggedIn(false);
    setUserType(null);
    setDashboardOpen(false);
    setMenuOpen(false);
    navigate("/");
  };

  const handleDashboardClick = (path) => {
    const hasUser = Boolean(localStorage.getItem("token") || localStorage.getItem("userToken") || localStorage.getItem("userData"));
    const hasAdmin = Boolean(localStorage.getItem("adminToken") || localStorage.getItem("adminData"));

    if (path.toLowerCase().startsWith("/userdash") && !hasUser) {
      navigate("/login");
      return;
    }

    if (path.toLowerCase().startsWith("/admin") && !hasAdmin) {
      navigate("/adlogin");
      return;
    }

    setDashboardOpen(false);
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <>
      <style>{`
        .main-nav-container {
          position: sticky;
          top: 0;
          z-index: 1000;
          width: 100%;
          height: 70px;
          padding: 0 5%;
          display: flex;
          align-items: center;
          transition: background 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
          font-family: 'Outfit', sans-serif;
        }

        .main-nav-container.scrolled {
          background: rgba(13, 8, 32, 0.95);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(108, 61, 232, 0.25);
          box-shadow: 0 4px 40px rgba(0, 0, 0, 0.45);
        }

        .main-nav-container.top {
          background: rgba(13, 8, 32, 0.65);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(108, 61, 232, 0.12);
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 11px;
          text-decoration: none;
          margin-right: auto;
          flex-shrink: 0;
        }

        .nav-logo-orb {
          width: 54px;
          height: 54px;
          border-radius: 16px;
          padding: 6px;
          background: radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.34), rgba(255, 255, 255, 0.08) 45%, rgba(255, 255, 255, 0.04) 100%);
          border: 1px solid rgba(255, 255, 255, 0.22);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
          box-shadow: 0 12px 30px rgba(4, 10, 30, 0.32), inset 0 1px 0 rgba(255, 255, 255, 0.22);
          transition: transform 0.35s cubic-bezier(0.23, 1, 0.32, 1);
          overflow: hidden;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .nav-logo-orb img {
          width: 94%;
          height: 94%;
          object-fit: contain;
          object-position: center;
          display: block;
          filter: drop-shadow(0 10px 18px rgba(5, 8, 24, 0.52)) drop-shadow(0 4px 8px rgba(255, 153, 0, 0.12));
        }

        .nav-logo-orb:hover {
          transform: translateY(-2px) scale(1.05);
        }

        .nav-logo-text {
          display: flex;
          flex-direction: column;
        }

        .nav-logo-main {
          font-size: 0.98rem;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.2px;
          background: linear-gradient(90deg, #ffffff, #00d4ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .nav-logo-sub {
          font-size: 0.58rem;
          font-weight: 500;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.38);
          margin-top: 1px;
        }

        .nav-logo-line {
          height: 2px;
          border-radius: 2px;
          margin-top: 3px;
          background: linear-gradient(90deg, #6c3de8, #00d4ff, #f7156a);
          background-size: 200%;
          animation: shimmer 3s linear infinite;
        }

        @keyframes shimmer {
          0% { background-position: 0% }
          100% { background-position: 200% }
        }

        .nav-menu {
          display: flex;
          align-items: center;
          gap: 2px;
          list-style: none;
          margin: 0 18px 0 0;
          padding: 0;
        }

        .nav-menu a {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: rgba(255, 255, 255, 0.72);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          white-space: nowrap;
          padding: 8px 14px;
          border-radius: 10px;
          transition: color 0.2s, background 0.2s;
          position: relative;
        }

        .nav-menu a:hover {
          color: #fff;
          background: rgba(108, 61, 232, 0.22);
        }

        .nav-menu a.active {
          color: #fff;
          background: rgba(108, 61, 232, 0.28);
        }

        .nav-menu a.active::after {
          content: '';
          position: absolute;
          bottom: 6px;
          left: 50%;
          transform: translateX(-50%);
          width: 18px;
          height: 2px;
          border-radius: 2px;
          background: linear-gradient(90deg, #6c3de8, #f7156a);
        }

        .nav-badge {
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.3px;
          padding: 2px 6px;
          border-radius: 5px;
          background: rgba(247, 21, 106, 0.2);
          color: #f7156a;
          text-transform: uppercase;
        }

        .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #f7156a;
          flex-shrink: 0;
          animation: ldot 1.8s ease-in-out infinite;
        }

        @keyframes ldot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .support-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 20px;
          background: rgba(16, 185, 129, 0.15);
          cursor: pointer;
          transition: all 0.3s;
          flex-shrink: 0;
        }

        .support-pill:hover {
          background: rgba(16, 185, 129, 0.25);
          transform: translateY(-2px);
        }

        .support-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          animation: pulse-green 2s ease-in-out infinite;
          flex-shrink: 0;
        }

        @keyframes pulse-green {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }

        .support-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: #10b981;
          white-space: nowrap;
        }

        .nav-divider {
          width: 1px;
          height: 24px;
          background: rgba(255, 255, 255, 0.1);
          flex-shrink: 0;
        }

        .btn-register,
        .btn-login-nav,
        .btn-logout-nav,
        .btn-dashboard-nav {
          position: relative;
          padding: 8px 16px;
          border-radius: 10px;
          border: none;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          flex-shrink: 0;
        }

        .btn-register {
          background: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .btn-register:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.12);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        }

        .btn-login-nav,
        .btn-dashboard-nav {
          background: linear-gradient(135deg, #6c3de8, #f7156a);
          color: #fff;
          box-shadow: 0 4px 20px rgba(108, 61, 232, 0.4);
        }

        .btn-login-nav::before,
        .btn-dashboard-nav::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 10px;
          background: linear-gradient(135deg, #f7156a, #6c3de8);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .btn-login-nav:hover,
        .btn-dashboard-nav:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(108, 61, 232, 0.6);
        }

        .btn-login-nav:hover::before,
        .btn-dashboard-nav:hover::before {
          opacity: 1;
        }

        .btn-login-nav span,
        .btn-dashboard-nav span {
          position: relative;
          z-index: 1;
        }

        .btn-logout-nav {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .btn-logout-nav:hover {
          transform: translateY(-2px);
          background: rgba(239, 68, 68, 0.25);
          box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
        }

        .hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          width: 38px;
          height: 38px;
          border-radius: 9px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.06);
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.22s;
          flex-shrink: 0;
        }

        .hamburger:hover {
          background: rgba(108, 61, 232, 0.25);
          border-color: rgba(108, 61, 232, 0.4);
        }

        .hamburger .bar {
          display: block;
          width: 18px;
          height: 1.8px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 2px;
          transition: all 0.3s ease;
          transform-origin: center;
        }

        .hamburger.open .bar:nth-child(1) {
          transform: translateY(6.8px) rotate(45deg);
        }

        .hamburger.open .bar:nth-child(2) {
          opacity: 0;
          transform: scaleX(0);
        }

        .hamburger.open .bar:nth-child(3) {
          transform: translateY(-6.8px) rotate(-45deg);
        }

        .mobile-drawer {
          position: fixed;
          top: 70px;
          left: 0;
          right: 0;
          z-index: 999;
          background: rgba(10, 5, 28, 0.97);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(108, 61, 232, 0.2);
          max-height: calc(100vh - 70px);
          overflow-y: auto;
          transform: scaleY(0);
          transform-origin: top;
          transition: transform 0.3s ease;
        }

        .mobile-drawer.open {
          transform: scaleY(1);
        }

        .mob-support {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          color: #10b981;
          font-size: 0.82rem;
          font-weight: 600;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .mob-support-title {
          font-weight: 700;
          font-size: 0.88rem;
        }

        .mob-support-sub {
          font-size: 0.72rem;
          opacity: 0.7;
        }

        .mob-links {
          padding: 8px 0;
        }

        .mob-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          color: rgba(255, 255, 255, 0.72);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s;
          border-left: 3px solid transparent;
        }

        .mob-link:hover {
          color: #fff;
          background: rgba(108, 61, 232, 0.15);
          border-left-color: rgba(108, 61, 232, 0.5);
        }

        .mob-link.active {
          color: #fff;
          background: rgba(108, 61, 232, 0.22);
          border-left-color: #6c3de8;
        }

        .mob-link-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mob-chevron {
          font-size: 1.4rem;
          opacity: 0.5;
        }

        .mob-hr {
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
          margin: 8px 0;
        }

        .mob-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 12px 16px;
        }

        .mob-btn-reg,
        .mob-btn-login,
        .mob-btn-dashboard,
        .mob-btn-logout {
          padding: 10px;
          border-radius: 8px;
          border: none;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .mob-btn-reg {
          background: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .mob-btn-login,
        .mob-btn-dashboard {
          background: linear-gradient(135deg, #6c3de8, #f7156a);
          color: #fff;
        }

        .mob-btn-logout {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .dashboard-dropdown {
          position: relative;
          display: inline-block;
        }

        .dashboard-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: rgba(10, 5, 28, 0.98);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(108, 61, 232, 0.3);
          border-radius: 12px;
          min-width: 220px;
          margin-top: 8px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
          z-index: 1001;
          opacity: 0;
          transform: translateY(-10px);
          pointer-events: none;
          transition: all 0.2s ease;
        }

        .dashboard-dropdown.open .dashboard-menu {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        .dashboard-menu-item {
          padding: 12px 16px;
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
          cursor: pointer;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
        }

        .dashboard-menu-item:hover {
          background: rgba(108, 61, 232, 0.2);
          color: #fff;
        }

        .dashboard-menu-item.logout {
          color: #ef4444;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          margin-top: 4px;
          padding-top: 12px;
        }

        .dashboard-menu-item.logout:hover {
          background: rgba(239, 68, 68, 0.15);
        }

        @media (max-width: 1060px) {
          .nav-menu {
            display: none;
          }
          .support-pill {
            display: none;
          }
          .btn-register {
            display: none;
          }
          .btn-login-nav,
          .btn-dashboard-nav {
            display: none;
          }
          .hamburger {
            display: flex;
          }
        }

        @media (max-width: 600px) {
          .nav-logo-main {
            font-size: 0.82rem;
          }
          .nav-logo-sub {
            display: none;
          }
          .nav-logo-line {
            display: none;
          }
          .main-nav-container {
            padding: 0 3%;
          }
        }
      `}</style>

      <nav className={`main-nav-container ${scrollY > 15 ? "scrolled" : "top"}`}>
        <Link to="/" className="nav-logo">
          <div className="nav-logo-orb">
            <img src="/cea-logo.png" alt="CEA logo" />
          </div>
          <div className="nav-logo-text">
            <span className="nav-logo-main">Computer Excellence Academy</span>
            <span className="nav-logo-sub">Digital Learning Platform</span>
            <div className="nav-logo-line" />
          </div>
        </Link>

        <ul className="nav-menu">
          {navLinks.map(({ label, href, icon, badge }) => (
            <li key={href}>
              <Link
                to={href}
                className={
                  location.pathname === href ||
                  (href === "/courses" && location.pathname === "/course")
                    ? "active"
                    : ""
                }
              >
                {icon} {label}
                {badge && <span className="nav-badge">{badge}</span>}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/register" style={{ color: "#f7156a" }}>
              <span className="live-dot" /> Live Class
            </Link>
          </li>
        </ul>

        <div className="nav-right">
          <div
            className="support-pill"
            onClick={() => navigate("/support")}
            role="button"
            tabIndex={0}
          >
            <div className="support-dot" />
            <span className="support-label">Support Open</span>
          </div>
          <div className="nav-divider" />

          {isLoggedIn ? (
            <div className={`dashboard-dropdown ${dashboardOpen ? "open" : ""}`}>
              <button
                className="btn-dashboard-nav"
                onClick={() => setDashboardOpen(!dashboardOpen)}
              >
                <span>📊 Dashboard</span>
              </button>
              <div className="dashboard-menu">
                {userType === "user" && (
                  <>
                    <button
                      className="dashboard-menu-item"
                      onClick={() => handleDashboardClick("/UserDash")}
                    >
                      📚 User Dashboard
                    </button>
                    <button
                      className="dashboard-menu-item"
                      onClick={() => handleDashboardClick("/UserDash/courses")}
                    >
                      📖 My Courses
                    </button>
                    <button
                      className="dashboard-menu-item"
                      onClick={() => handleDashboardClick("/UserDash/notes")}
                    >
                      📝 My Notes
                    </button>
                    <button
                      className="dashboard-menu-item"
                      onClick={() => handleDashboardClick("/UserDash/my-batches")}
                    >
                      👥 My Batches
                    </button>
                    <button
                      className="dashboard-menu-item"
                      onClick={() => handleDashboardClick("/UserDash/myexam")}
                    >
                      ✏️ My Exams
                    </button>
                  </>
                )}
                {userType === "admin" && (
                  <>
                    <button
                      className="dashboard-menu-item"
                      onClick={() => handleDashboardClick("/admin")}
                    >
                      👨‍💼 Admin Dashboard
                    </button>
                    <button
                      className="dashboard-menu-item"
                      onClick={() => handleDashboardClick("/admin/courses")}
                    >
                      📚 Courses
                    </button>
                    <button
                      className="dashboard-menu-item"
                      onClick={() => handleDashboardClick("/admin/batches")}
                    >
                      👥 Batches
                    </button>
                    <button
                      className="dashboard-menu-item"
                      onClick={() => handleDashboardClick("/admin/examinee")}
                    >
                      📋 Examinees
                    </button>
                    <button
                      className="dashboard-menu-item"
                      onClick={() => handleDashboardClick("/admin/examination")}
                    >
                      ✏️ Examinations
                    </button>
                  </>
                )}
                <button
                  className="dashboard-menu-item logout"
                  onClick={handleLogout}
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          ) : (
            <>
              <button className="btn-register" onClick={() => navigate("/register")}>
                Register
              </button>
              <button className="btn-login-nav" onClick={() => navigate("/login")}>
                <span>Login →</span>
              </button>
            </>
          )}

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

      <div className="legacy-top-strip">
        <div className="legacy-top-strip-track">
          <span>Free Live Classes</span>
          <span>Call Support Mon-Sat 10AM-12PM</span>
          <span>Free Certification</span>
          <span>Free PDF Notes</span>
          <span>24+ Free Courses</span>
          {/* Duplicated for loop */}
          <span>Free Live Classes</span>
          <span>Call Support Mon-Sat 10AM-12PM</span>
          <span>Free Certification</span>
          <span>Free PDF Notes</span>
          <span>24+ Free Courses</span>
          <span>Free Live Classes</span>
          <span>Call Support Mon-Sat 10AM-12PM</span>
          <span>Free Certification</span>
          <span>Free PDF Notes</span>
          <span>24+ Free Courses</span>
        </div>
      </div>

      <div className={`mobile-drawer ${menuOpen ? "open" : ""}`}>
        <div className="mob-support">
          <div className="support-dot" />
          <div>
            <div className="mob-support-title">Support Open Now</div>
            <div className="mob-support-sub">Monâ€“Sat Â· 10AM â€“ 12PM</div>
          </div>
        </div>

        <div className="mob-links">
          {navLinks.map(({ label, href, icon, badge }) => (
            <Link
              key={href}
              to={href}
              className={`mob-link ${
                location.pathname === href ||
                (href === "/courses" && location.pathname === "/course")
                  ? "active"
                  : ""
              }`}
              onClick={() => setMenuOpen(false)}
            >
              <span className="mob-link-left">
                {icon} {label}
                {badge && <span className="nav-badge">{badge}</span>}
              </span>
              <span className="mob-chevron">â€º</span>
            </Link>
          ))}
          <Link
            to="/register"
            className="mob-link"
            style={{ color: "#f7156a" }}
            onClick={() => setMenuOpen(false)}
          >
            <span className="mob-link-left">
              <span className="live-dot" /> Live Class
            </span>
            <span className="mob-chevron">â€º</span>
          </Link>
        </div>

        <div className="mob-hr" />
        <div className="mob-actions">
          {isLoggedIn ? (
            <>
              <button
                className="mob-btn-dashboard"
                onClick={() => {
                  if (userType === "user") {
                    handleDashboardClick("/UserDash");
                  } else {
                    handleDashboardClick("/admin");
                  }
                }}
              >
                📊 Go to Dashboard
              </button>
              <button className="mob-btn-logout" onClick={handleLogout}>
                🚪 Logout
              </button>
            </>
          ) : (
            <>
              <button className="mob-btn-reg" onClick={() => {setMenuOpen(false); navigate("/register");}}>
                Register
              </button>
              <button className="mob-btn-login" onClick={() => {setMenuOpen(false); navigate("/login");}}>
                Login →
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default MainNavbar;
