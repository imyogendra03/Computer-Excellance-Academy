import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
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
} from "react-icons/fi";


const UserDash = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const role = localStorage.getItem("userRole");
  const email = localStorage.getItem("userEmail");

  useEffect(() => {
    if (role !== "user") {
      navigate("/");
    }
  }, [role, navigate]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    localStorage.removeItem("userData");
    localStorage.removeItem("userToken");
    navigate("/");
  };

  if (role !== "user") return null;

  const navItems = [
    { to: "/userdash/profile", label: "Profile", icon: <FiUser /> },
    { to: "/userdash", label: "Overview", icon: <FiGrid /> },
    { to: "/userdash/courses", label: "Courses", icon: <FiBookOpen /> },
    { to: "/userdash/notes", label: "Study Notes", icon: <FiFileText /> },
    { to: "/userdash/my-batches", label: "My Batches", icon: <FiBookOpen /> },
    { to: "/userdash/myexam", label: "My Exams", icon: <FiBookOpen /> },
    { to: "/userdash/results", label: "Results", icon: <FiAward /> },
    { to: "/userdash/payments", label: "My Payments", icon: <FiCreditCard /> },
    { to: "/userdash/chanpass", label: "Change Password", icon: <FiKey /> },
    { to: "/userdash/contact1", label: "Contact Us", icon: <FiMessageSquare /> },
  ];

  return (
    <>
      <style>{`
        .userdash-layout {
          min-height: 100vh;
          background: linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
        }

        .userdash-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: 300px;
          padding: 20px 18px;
          color: #fff;
          background:
            radial-gradient(circle at top right, rgba(96, 165, 250, 0.18), transparent 28%),
            linear-gradient(180deg, #081120 0%, #132c68 55%, #1d4ed8 100%);
          box-shadow: 14px 0 40px rgba(15, 23, 42, 0.18);
          display: flex;
          flex-direction: column;
          gap: 18px;
          transition: all 0.3s ease;
          z-index: 1000;
          overflow-y: auto;
        }

        .userdash-layout.collapsed .userdash-sidebar {
          width: 92px;
          padding: 20px 12px;
        }

        .userdash-main {
          margin-left: 300px;
          min-height: 100vh;
          transition: all 0.3s ease;
        }

        .userdash-layout.collapsed .userdash-main {
          margin-left: 92px;
        }

        .userdash-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.12);
        }

        .userdash-brand {
          color: #fff;
          text-decoration: none;
        }

        .userdash-brand h3 {
          margin: 0;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: 0.3px;
        }

        .userdash-brand p {
          margin: 4px 0 0;
          font-size: 13px;
          opacity: 0.72;
        }

        .userdash-toggle {
          border: none;
          background: rgba(255,255,255,0.12);
          color: #fff;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: 0.2s ease;
        }

        .userdash-toggle:hover {
          background: rgba(255,255,255,0.2);
        }

        .userdash-welcome {
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 14px;
          border-radius: 20px;
          background: rgba(255,255,255,0.09);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(8px);
        }

        .userdash-avatar {
          width: 46px;
          height: 46px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          font-weight: 800;
          background: linear-gradient(135deg, #34d399, #06b6d4);
          flex-shrink: 0;
          box-shadow: 0 10px 24px rgba(6, 182, 212, 0.28);
        }

        .userdash-welcome-text strong {
          display: block;
          font-size: 14px;
        }

        .userdash-welcome-text p {
          margin: 2px 0 0;
          font-size: 12px;
          opacity: 0.8;
          word-break: break-word;
        }

        .userdash-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .userdash-link {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #dbeafe;
          text-decoration: none;
          padding: 12px 14px;
          border-radius: 16px;
          transition: all 0.25s ease;
          overflow: hidden;
        }

        .userdash-link::before {
          content: "";
          position: absolute;
          left: 0;
          top: 10px;
          bottom: 10px;
          width: 4px;
          border-radius: 999px;
          background: transparent;
          transition: 0.25s ease;
        }

        .userdash-link:hover {
          color: #fff;
          background: rgba(255,255,255,0.1);
          transform: translateX(5px);
        }

        .userdash-link.active-link {
          color: #fff;
          background: linear-gradient(135deg, rgba(37,99,235,0.95), rgba(79,70,229,0.95));
          box-shadow: 0 12px 26px rgba(79, 70, 229, 0.28);
        }

        .userdash-link.active-link::before {
          background: #a5b4fc;
        }

        .userdash-icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.1);
          flex-shrink: 0;
          transition: 0.25s ease;
        }

        .userdash-link:hover .userdash-icon-wrap,
        .userdash-link.active-link .userdash-icon-wrap {
          background: rgba(255,255,255,0.18);
        }

        .userdash-icon {
          font-size: 18px;
          display: flex;
        }

        .userdash-logout {
          margin-top: auto;
          border: 1px solid rgba(254, 202, 202, 0.22);
          background: linear-gradient(135deg, rgba(127,29,29,0.24), rgba(220,38,38,0.12));
          color: #fff;
          border-radius: 16px;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: 0.25s ease;
        }

        .userdash-logout:hover {
          background: linear-gradient(135deg, rgba(127,29,29,0.34), rgba(220,38,38,0.18));
          transform: translateY(-1px);
        }

        .userdash-logout-icon {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.1);
          flex-shrink: 0;
        }

        .userdash-layout.collapsed .userdash-header {
          justify-content: center;
          padding-bottom: 10px;
        }

        .userdash-layout.collapsed .userdash-brand,
        .userdash-layout.collapsed .userdash-welcome-text,
        .userdash-layout.collapsed .userdash-link-label {
          display: none;
        }

        .userdash-layout.collapsed .userdash-toggle {
          margin: 0 auto;
        }

        .userdash-layout.collapsed .userdash-welcome {
          justify-content: center;
          padding: 12px;
        }

        .userdash-layout.collapsed .userdash-link {
          justify-content: center;
          padding: 12px;
        }

        .userdash-layout.collapsed .userdash-link:hover {
          transform: none;
        }

        .userdash-layout.collapsed .userdash-link::before {
          display: none;
        }

        .userdash-layout.collapsed .userdash-logout {
          width: 52px;
          height: 52px;
          padding: 0;
          margin-left: auto;
          margin-right: auto;
          border-radius: 16px;
          justify-content: center;
          gap: 0;
        }

        .userdash-layout.collapsed .userdash-logout span:not(.userdash-logout-icon) {
          display: none;
        }

        .userdash-layout.collapsed .userdash-logout-icon {
          width: 100%;
          height: 100%;
          background: transparent;
          border-radius: 16px;
        }

        .userdash-topbar {
          position: sticky;
          top: 0;
          z-index: 900;
          margin: 20px 20px 0;
          padding: 18px 22px;
          border-radius: 24px;
          color: #fff;
          background:
            radial-gradient(circle at right top, rgba(96, 165, 250, 0.2), transparent 25%),
            linear-gradient(135deg, #0f172a, #1d4ed8, #4f46e5);
          box-shadow: 0 18px 40px rgba(37, 99, 235, 0.2);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .userdash-topbar h4 {
          margin: 0 0 4px;
          font-weight: 700;
        }

        .userdash-topbar p {
          margin: 0;
          opacity: 0.82;
          font-size: 14px;
        }

        .userdash-topbar-btn {
          border: none;
          background: rgba(255,255,255,0.14);
          color: #fff;
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: none;
          align-items: center;
          justify-content: center;
        }

        .userdash-content {
          padding: 20px;
        }

        @media (max-width: 991px) {
          .userdash-sidebar {
            position: fixed;
            width: 100%;
            height: auto;
            max-height: 100vh;
          }

          .userdash-main,
          .userdash-layout.collapsed .userdash-main {
            margin-left: 0;
            padding-top: 110px;
          }

          .userdash-layout.collapsed .userdash-nav,
          .userdash-layout.collapsed .userdash-welcome,
          .userdash-layout.collapsed .userdash-logout {
            display: none;
          }

          .userdash-layout.collapsed .userdash-sidebar {
            width: 100%;
            padding: 20px 18px;
          }

          .userdash-layout.collapsed .userdash-brand {
            display: block;
          }

          .userdash-topbar {
            margin: 0 20px;
          }

          .userdash-topbar-btn {
            display: inline-flex;
          }
        }
      `}</style>

      <div className={`userdash-layout ${collapsed ? "collapsed" : ""}`}>
        <aside className="userdash-sidebar">
          <div className="userdash-header">
            {!collapsed && (
              <NavLink to="/userdash" className="userdash-brand">
                <h3>ExamPrep</h3>
                <p>User Panel</p>
              </NavLink>
            )}

            <button
              type="button"
              className="userdash-toggle"
              onClick={() => setCollapsed((prev) => !prev)}
            >
              {collapsed ? <FiMenu /> : <FiX />}
            </button>
          </div>

          <div className="userdash-welcome">
            <div className="userdash-avatar">U</div>
            <div className="userdash-welcome-text">
              <strong>Welcome Back</strong>
              <p>{email || "user@email.com"}</p>
            </div>
          </div>

          <nav className="userdash-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/userdash"}
                className={({ isActive }) =>
                  `userdash-link ${isActive ? "active-link" : ""}`
                }
              >
                <span className="userdash-icon-wrap">
                  <span className="userdash-icon">{item.icon}</span>
                </span>
                <span className="userdash-link-label">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <button type="button" className="userdash-logout" onClick={handleLogout}>
            <span className="userdash-logout-icon">
              <FiLogOut />
            </span>
            <span>Log Out</span>
          </button>
        </aside>

        <main className="userdash-main">
          <div className="userdash-topbar">
            <div>
              <h4>{greeting}</h4>
              <p>Manage your exams, batches, profile, results, and support messages.</p>
            </div>

            <button
              type="button"
              className="userdash-topbar-btn"
              onClick={() => setCollapsed((prev) => !prev)}
            >
              <FiMenu />
            </button>
          </div>

          <div className="userdash-content">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
};

export default UserDash;
