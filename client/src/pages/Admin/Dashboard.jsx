import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FiBookOpen,
  FiClipboard,
  FiFileText,
  FiGrid,
  FiHelpCircle,
  FiLock,
  FiLogOut,
  FiMenu,
  FiMessageSquare,
  FiPenTool,
  FiPieChart,
  FiUsers,
  FiX,
  FiCreditCard, 
} from "react-icons/fi";

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const email = localStorage.getItem("email");

  useEffect(() => {
    if (role !== "admin") {
      navigate("/adlogin");
    }
  }, [role, navigate]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    navigate("/adlogin");
  };

  const navItems = [
    { to: "/admin", label: "Overview", icon: <FiGrid /> },
    { to: "/admin/courses", label: "Courses", icon: <FiBookOpen /> },
    { to: "/admin/batches", label: "Batches", icon: <FiClipboard /> },
    { to: "/admin/notes", label: "Notes", icon: <FiFileText /> },
    { to: "/admin/session", label: "Session", icon: <FiClipboard /> },
    { to: "/admin/subject", label: "Subject", icon: <FiBookOpen /> },
    { to: "/admin/examinee", label: "Examinee", icon: <FiUsers /> },
    { to: "/admin/questionbank", label: "Question Bank", icon: <FiHelpCircle /> },
    { to: "/admin/examination", label: "Examination", icon: <FiPenTool /> },
    { to: "/admin/report", label: "Report Generation", icon: <FiFileText /> },
    { to: "/admin/result", label: "Result Declaration", icon: <FiPieChart /> },
    { to: "/admin/payments", label: "Payments", icon: <FiCreditCard /> },
    { to: "/admin/password", label: "Change Password", icon: <FiLock /> },
    { to: "/admin/contact", label: "Contact Us", icon: <FiMessageSquare /> },
  ];

  if (role !== "admin") {
    return null;
  }

  return (
    <>
      <style>{`
        .admin-layout {
          min-height: 100vh;
          display: flex;
          background: linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
        }

        .admin-sidebar {
          width: 290px;
          padding: 20px;
          color: #fff;
          background: linear-gradient(180deg, #0f172a 0%, #1e3a8a 100%);
          box-shadow: 10px 0 30px rgba(15, 23, 42, 0.12);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .admin-sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        }

        .admin-sidebar-header h3 {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
        }

        .admin-sidebar-header p {
          margin: 4px 0 0;
          opacity: 0.72;
          font-size: 14px;
        }

        .admin-toggle-btn,
        .admin-topbar-menu {
          border: none;
          background: rgba(255, 255, 255, 0.12);
          color: #fff;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: none;
          align-items: center;
          justify-content: center;
        }

        .admin-welcome-box {
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 14px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.08);
        }

        .admin-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-weight: 700;
          background: linear-gradient(135deg, #60a5fa, #8b5cf6);
        }

        .admin-welcome-box p {
          margin: 0;
          font-size: 13px;
          opacity: 0.75;
          word-break: break-word;
        }

        .admin-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .admin-nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #dbeafe;
          text-decoration: none;
          padding: 12px 14px;
          border-radius: 14px;
          transition: 0.2s ease;
        }

        .admin-nav-link:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.08);
        }

        .admin-nav-link.active {
          color: #fff;
          background: linear-gradient(135deg, #2563eb, #4f46e5);
          box-shadow: 0 10px 24px rgba(79, 70, 229, 0.28);
        }

        .admin-nav-icon {
          font-size: 18px;
          display: flex;
        }

        .admin-logout {
          margin-top: auto;
          border: 1px solid rgba(254, 202, 202, 0.25);
          background: rgba(127, 29, 29, 0.18);
          color: #fff;
          border-radius: 14px;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .admin-main {
          flex: 1;
          padding: 20px;
          min-width: 0;
        }

        .admin-topbar {
          padding: 18px 22px;
          border-radius: 24px;
          color: #fff;
          background: linear-gradient(135deg, #0f172a, #1d4ed8, #4f46e5);
          box-shadow: 0 18px 40px rgba(37, 99, 235, 0.2);
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .admin-topbar h4 {
          margin: 0 0 4px;
          font-weight: 700;
        }

        .admin-topbar p {
          margin: 0;
          opacity: 0.8;
          font-size: 14px;
        }

        @media (max-width: 991px) {
          .admin-layout {
            flex-direction: column;
          }

          .admin-sidebar {
            width: 100%;
          }

          .admin-toggle-btn,
          .admin-topbar-menu {
            display: inline-flex;
          }

          .admin-layout.collapsed .admin-nav,
          .admin-layout.collapsed .admin-welcome-box,
          .admin-layout.collapsed .admin-logout {
            display: none;
          }
        }
      `}</style>

      <div className={`admin-layout ${collapsed ? "collapsed" : ""}`}>
        <aside className="admin-sidebar">
          <div className="admin-sidebar-header">
            <div>
              <h3>PrepExam</h3>
              <p>Admin Panel</p>
            </div>

            <button
              type="button"
              className="admin-toggle-btn"
              onClick={() => setCollapsed((prev) => !prev)}
            >
              {collapsed ? <FiMenu /> : <FiX />}
            </button>
          </div>

          <div className="admin-welcome-box">
            <span className="admin-avatar">A</span>
            <div>
              <strong>Welcome</strong>
              <p>{email || "admin@panel.com"}</p>
            </div>
          </div>

          <nav className="admin-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/admin"}
                className={({ isActive }) =>
                  `admin-nav-link ${isActive ? "active" : ""}`
                }
              >
                <span className="admin-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <button type="button" className="admin-logout" onClick={handleLogout}>
            <FiLogOut />
            <span>Log Out</span>
          </button>
        </aside>

        <main className="admin-main">
          <div className="admin-topbar">
            <div>
              <h4>{greeting}</h4>
              <p>Manage your examination system professionally.</p>
            </div>

            <button
              type="button"
              className="admin-topbar-menu"
              onClick={() => setCollapsed((prev) => !prev)}
            >
              <FiMenu />
            </button>
          </div>

          <Outlet />
        </main>
      </div>
    </>
  );
};

export default Dashboard;
