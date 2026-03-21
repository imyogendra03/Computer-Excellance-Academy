import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FiActivity,
  FiArrowRight,
  FiBell,
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiCloud,
  FiFileText,
  FiTrendingUp,
} from "react-icons/fi";

const UserHome = () => {
  const examineId = localStorage.getItem("userId");
  const userEmail = localStorage.getItem("userEmail");

  const [examCount, setExamCount] = useState(0);
  const [resultCount, setResultCount] = useState(0);
  const [recentExams, setRecentExams] = useState([]);
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [notifications] = useState([
    "Complete your profile to keep your account updated.",
    "Check upcoming exams regularly from My Exams.",
    "Purchased batches will appear here once course access is enabled.",
  ]);

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 2500);
  };

  const handleFetch = async () => {
    try {
      setLoading(true);

      const [examRes, resultRes] = await Promise.all([
        fetch(`https://computer-excellance-academy.onrender.com/api/dashboard/exams/${examineId}`),
        axios.get(`https://computer-excellance-academy.onrender.com/api/dashboard/examinee-result/${examineId}`),
      ]);

      const examData = await examRes.json();
      const examsArray = Array.isArray(examData)
        ? examData
        : Array.isArray(examData?.message)
        ? examData.message
        : [];

      const totalExams = Array.isArray(examData)
        ? examData.length
        : examData.totalExams || examsArray.length || 0;

      const msg = resultRes?.data?.message;
      const totalResults = Array.isArray(msg)
        ? msg.length
        : typeof msg === "number"
        ? msg
        : parseInt(msg, 10) || 0;

      setExamCount(totalExams);
      setResultCount(totalResults);
      setRecentExams(examsArray.slice(0, 4));
    } catch (error) {
      showToast("Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetch();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setWeatherLoading(true);

        const apiKey = "YOUR_API_KEY_HERE";
        const city = "New York";

        if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
          setWeather(null);
          return;
        }

        const res = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );

        setWeather(res.data);
      } catch (error) {
        setWeather(null);
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeather();
  }, []);

  const failedCount = Math.max(examCount - resultCount, 0);

  const performance = useMemo(() => {
    if (!examCount) return 0;
    return ((resultCount / examCount) * 100).toFixed(0);
  }, [examCount, resultCount]);

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
    <>
      <style>{`
        .uh2-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
        }

        .uh2-hero {
          padding: 32px;
          border-radius: 28px;
          color: #fff;
          background: linear-gradient(135deg, #0f172a, #1d4ed8, #4f46e5);
          box-shadow: 0 20px 45px rgba(37, 99, 235, 0.22);
        }

        .uh2-hero-chip {
          display: inline-block;
          padding: 14px 18px;
          border-radius: 18px;
          background: rgba(255,255,255,0.14);
          backdrop-filter: blur(8px);
          margin-left: 10px;
        }

        .uh2-card,
        .uh2-stat,
        .uh2-quick,
        .uh2-list-card {
          background: #fff;
          border-radius: 24px;
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
          border: 0;
        }

        .uh2-stat {
          padding: 24px;
          height: 100%;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
        }

        .uh2-icon-box {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          margin-bottom: 12px;
        }

        .uh2-quick {
          padding: 18px;
          text-decoration: none;
          color: #0f172a;
          display: block;
          transition: 0.2s ease;
        }

        .uh2-quick:hover {
          transform: translateY(-4px);
          color: #0f172a;
        }

        .uh2-quick-title {
          font-weight: 700;
          margin-bottom: 6px;
        }

        .uh2-progress {
          height: 14px;
          border-radius: 999px;
          background: #e2e8f0;
          overflow: hidden;
        }

        .uh2-progress-bar {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(135deg, #0ea5e9, #2563eb);
        }

        .uh2-list-item {
          padding: 14px 0;
          border-bottom: 1px solid #edf2f7;
        }

        .uh2-list-item:last-child {
          border-bottom: 0;
        }

        .uh2-note {
          padding: 14px 16px;
          border-radius: 16px;
          background: #f8fbff;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .uh2-note + .uh2-note {
          margin-top: 12px;
        }

        .uh2-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 999px;
          background: #dbeafe;
          color: #1d4ed8;
          font-size: 12px;
          font-weight: 700;
        }

        .uh2-toast {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          min-width: 280px;
          color: #fff;
          padding: 14px 16px;
          border-radius: 16px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }

        .uh2-toast.success {
          background: linear-gradient(135deg, #2563eb, #4f46e5);
        }

        .uh2-toast.error {
          background: linear-gradient(135deg, #dc2626, #ef4444);
        }

        .uh2-toast-close {
          border: none;
          background: transparent;
          color: #fff;
          font-size: 16px;
        }

        @media (max-width: 767px) {
          .uh2-hero {
            padding: 24px;
          }

          .uh2-hero-chip {
            margin-left: 0;
            margin-top: 12px;
          }
        }
      `}</style>

      <div className="uh2-page">
        <div className="container py-4">
          {toast.show && (
            <div className={`uh2-toast ${toast.type === "error" ? "error" : "success"}`}>
              <span>{toast.message}</span>
              <button
                type="button"
                className="uh2-toast-close"
                onClick={() => setToast({ show: false, message: "", type: "success" })}
              >
                ×
              </button>
            </div>
          )}

          <div className="uh2-hero mb-4">
            <div className="row align-items-center g-4">
              <div className="col-lg-8">
                <h2 className="fw-bold mb-2">Welcome Back</h2>
                <p className="mb-0" style={{ opacity: 0.88 }}>
                  {userEmail || "Examinee"} dashboard me aapke exams, results, progress aur future learning access sab ek jagah.
                </p>
              </div>

              <div className="col-lg-4 text-lg-end">
                <div className="uh2-hero-chip">
                  <div style={{ fontSize: "13px", opacity: 0.8 }}>Current Time</div>
                  <div className="fw-bold" style={{ fontSize: "22px" }}>
                    {time.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-md-3">
              <div className="uh2-stat">
                <div className="uh2-icon-box" style={{ background: "#dbeafe", color: "#1d4ed8" }}>
                  <FiFileText />
                </div>
                <div className="text-muted mb-2">Total Exams</div>
                <h3 className="fw-bold mb-0">{loading ? "..." : examCount}</h3>
              </div>
            </div>

            <div className="col-md-3">
              <div className="uh2-stat">
                <div className="uh2-icon-box" style={{ background: "#dcfce7", color: "#16a34a" }}>
                  <FiCheckCircle />
                </div>
                <div className="text-muted mb-2">Passed</div>
                <h3 className="fw-bold mb-0">{loading ? "..." : resultCount}</h3>
              </div>
            </div>

            <div className="col-md-3">
              <div className="uh2-stat">
                <div className="uh2-icon-box" style={{ background: "#fee2e2", color: "#dc2626" }}>
                  <FiTrendingUp />
                </div>
                <div className="text-muted mb-2">Failed</div>
                <h3 className="fw-bold mb-0">{loading ? "..." : failedCount}</h3>
              </div>
            </div>

            <div className="col-md-3">
              <div className="uh2-stat">
                <div className="uh2-icon-box" style={{ background: "#e0f2fe", color: "#0284c7" }}>
                  <FiActivity />
                </div>
                <div className="text-muted mb-2">Performance</div>
                <div className="uh2-progress mb-2">
                  <div className="uh2-progress-bar" style={{ width: `${performance}%` }} />
                </div>
                <h5 className="fw-bold mb-0">{performance}%</h5>
              </div>
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-md-3">
              <Link
                to="/userdash"
                className="uh2-quick"
                onClick={(e) => {
                  e.preventDefault();
                  showToast("My Batches page route will be connected next.", "success");
                }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="uh2-quick-title">My Batches</div>
                    <div className="text-muted small">Access purchased learning batches</div>
                  </div>
                  <FiBookOpen />
                </div>
              </Link>
            </div>

            <div className="col-md-3">
              <Link to="/userdash/myexam" className="uh2-quick">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="uh2-quick-title">My Exams</div>
                    <div className="text-muted small">View and start available exams</div>
                  </div>
                  <FiArrowRight />
                </div>
              </Link>
            </div>

            <div className="col-md-3">
              <Link to="/userdash/results" className="uh2-quick">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="uh2-quick-title">My Results</div>
                    <div className="text-muted small">Check your performance report</div>
                  </div>
                  <FiArrowRight />
                </div>
              </Link>
            </div>

            <div className="col-md-3">
              <Link to="/userdash/profile" className="uh2-quick">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="uh2-quick-title">My Profile</div>
                    <div className="text-muted small">Update profile and personal details</div>
                  </div>
                  <FiArrowRight />
                </div>
              </Link>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-7">
              <div className="uh2-list-card p-4 h-100">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <FiCalendar color="#6b7280" />
                  <h5 className="fw-bold mb-0">Recent Exams</h5>
                </div>

                {loading ? (
                  <div className="text-muted">Loading recent exams...</div>
                ) : recentExams.length === 0 ? (
                  <div className="text-muted">No recent exams available.</div>
                ) : (
                  recentExams.map((exam, index) => (
                    <div key={exam._id || index} className="uh2-list-item">
                      <div className="d-flex justify-content-between align-items-start gap-3">
                        <div>
                          <div className="fw-semibold">{exam.title || "Exam"}</div>
                          <div className="text-muted small">
                            Date: {formatDate(exam.date)}
                          </div>
                        </div>
                        <span className="uh2-badge">{exam.time || "Scheduled"}</span>
                      </div>
                    </div>
                  ))
                )}

                <div className="mt-3">
                  <Link to="/userdash/myexam" className="text-decoration-none fw-semibold">
                    View all exams
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="uh2-list-card p-4 h-100 mb-4 mb-lg-0">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <FiCloud color="#0284c7" />
                  <h5 className="fw-bold mb-0">Weather & Time</h5>
                </div>

                <div className="mb-3">
                  <div className="text-muted small">Current Date & Time</div>
                  <div className="fw-bold">{time.toLocaleString()}</div>
                </div>

                {weatherLoading ? (
                  <div className="text-muted">Loading weather data...</div>
                ) : weather ? (
                  <>
                    <div className="fw-semibold">{weather.name}</div>
                    <div className="text-muted small">
                      {weather.weather?.[0]?.description} - {weather.main?.temp}°C
                    </div>
                    <div className="text-muted small">
                      Humidity: {weather.main?.humidity}% | Wind: {weather.wind?.speed} m/s
                    </div>
                  </>
                ) : (
                  <div className="text-muted">
                    Weather unavailable. API key add karoge to live weather show hoga.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="uh2-card p-4 mt-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <FiBell color="#6b7280" />
              <h5 className="fw-bold mb-0">Notifications</h5>
            </div>

            {notifications.map((note, index) => (
              <div key={index} className="uh2-note">
                <FiCalendar color="#f59e0b" style={{ marginTop: 2 }} />
                <span>{note}</span>
              </div>
            ))}

            <div className="mt-3">
              <Link to="/userdash/contact1" className="text-decoration-none fw-semibold">
                Need help? Contact support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserHome;
