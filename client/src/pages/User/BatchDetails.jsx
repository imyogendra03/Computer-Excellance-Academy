import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiBookOpen,
  FiCalendar,
  FiClock,
  FiFileText,
  FiLayers,
  FiMonitor,
  FiPlayCircle,
} from "react-icons/fi";

const BatchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 2500);
  };

  const fetchBatch = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/batch/${id}`);
      setBatch(res?.data?.data || null);
    } catch (error) {
      showToast("Failed to load batch details", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBatch();
    }
  }, [id]);

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
        .bd-page {
          min-height: 100vh;
          padding: 24px 0;
          background: linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
        }

        .bd-hero {
          padding: 32px;
          border-radius: 28px;
          color: #fff;
          background: linear-gradient(135deg, #0f172a, #1d4ed8, #4f46e5);
          box-shadow: 0 20px 45px rgba(37, 99, 235, 0.22);
        }

        .bd-chip {
          display: inline-block;
          padding: 14px 18px;
          border-radius: 18px;
          background: rgba(255,255,255,0.14);
          backdrop-filter: blur(8px);
        }

        .bd-card {
          background: #fff;
          border-radius: 24px;
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
          border: 0;
        }

        .bd-mini-card {
          height: 100%;
          padding: 22px;
          background: #fff;
          border-radius: 22px;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
        }

        .bd-icon-box {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          margin-bottom: 12px;
        }

        .bd-feature {
          padding: 16px;
          border-radius: 18px;
          background: #f8fbff;
          border: 1px solid #e2e8f0;
        }

        .bd-feature + .bd-feature {
          margin-top: 12px;
        }

        .bd-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: none;
          color: #fff;
          font-weight: 600;
          border-radius: 12px;
          padding: 10px 16px;
          background: rgba(255,255,255,0.14);
        }

        .bd-open-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: none;
          color: #fff;
          font-weight: 600;
          border-radius: 12px;
          padding: 12px 18px;
          background: linear-gradient(135deg, #2563eb, #4f46e5);
        }

        .bd-toast {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          min-width: 280px;
          color: #fff;
          padding: 14px 16px;
          border-radius: 16px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
        }

        .bd-toast.success {
          background: linear-gradient(135deg, #2563eb, #4f46e5);
        }

        .bd-toast.error {
          background: linear-gradient(135deg, #dc2626, #ef4444);
        }

        @media (max-width: 767px) {
          .bd-hero {
            padding: 24px;
          }
        }
      `}</style>

      <div className="bd-page">
        <div className="container">
          {toast.show && (
            <div className={`bd-toast ${toast.type === "error" ? "error" : "success"}`}>
              {toast.message}
            </div>
          )}

          <div className="bd-hero mb-4">
            <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
              <div>
                <button
                  type="button"
                  className="bd-back-btn mb-3"
                  onClick={() => navigate("/userdash/my-batches")}
                >
                  <FiArrowLeft />
                  Back to My Batches
                </button>

                <h2 className="fw-bold mb-2">
                  {loading ? "Loading batch..." : batch?.batchName || "Batch Details"}
                </h2>

                <p className="mb-0" style={{ opacity: 0.88 }}>
                  {batch?.course?.title || "Purchased batch"} ka structured learning access yahan available hoga.
                </p>
              </div>

              <div className="bd-chip">
                <div style={{ fontSize: "13px", opacity: 0.8 }}>Mode</div>
                <div className="fw-bold" style={{ fontSize: "22px" }}>
                  {batch?.mode || "-"}
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="bd-card p-5 text-center">Loading batch details...</div>
          ) : !batch ? (
            <div className="bd-card p-5 text-center text-muted">
              Batch details not found.
            </div>
          ) : (
            <>
              <div className="row g-4 mb-4">
                <div className="col-md-3">
                  <div className="bd-mini-card">
                    <div className="bd-icon-box" style={{ background: "#dbeafe", color: "#1d4ed8" }}>
                      <FiBookOpen />
                    </div>
                    <div className="text-muted mb-2">Course</div>
                    <h5 className="fw-bold mb-0">{batch.course?.title || "-"}</h5>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="bd-mini-card">
                    <div className="bd-icon-box" style={{ background: "#dcfce7", color: "#16a34a" }}>
                      <FiCalendar />
                    </div>
                    <div className="text-muted mb-2">Start Date</div>
                    <h5 className="fw-bold mb-0">{formatDate(batch.startDate)}</h5>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="bd-mini-card">
                    <div className="bd-icon-box" style={{ background: "#fef3c7", color: "#d97706" }}>
                      <FiClock />
                    </div>
                    <div className="text-muted mb-2">Duration</div>
                    <h5 className="fw-bold mb-0">{batch.duration || "-"}</h5>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="bd-mini-card">
                    <div className="bd-icon-box" style={{ background: "#ede9fe", color: "#7c3aed" }}>
                      <FiLayers />
                    </div>
                    <div className="text-muted mb-2">Access</div>
                    <h5 className="fw-bold mb-0">{batch.accessStatus || "open"}</h5>
                  </div>
                </div>
              </div>

              <div className="row g-4">
                <div className="col-lg-7">
                  <div className="bd-card p-4 h-100">
                    <h4 className="fw-bold mb-3">Batch Overview</h4>
                    <p className="text-muted mb-4">
                      {batch.description || "Batch description not added yet."}
                    </p>

                    <h5 className="fw-bold mb-3">Included Features</h5>

                    {Array.isArray(batch.features) && batch.features.length > 0 ? (
                      batch.features.map((feature, index) => (
                        <div key={index} className="bd-feature">
                          <strong>Feature {index + 1}</strong>
                          <div className="text-muted small mt-1">{feature}</div>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="bd-feature">
                          <strong>Recorded / Live Sessions</strong>
                          <div className="text-muted small mt-1">
                            Batch content yahan lessons ya videos ke form me connect hoga.
                          </div>
                        </div>
                        <div className="bd-feature">
                          <strong>Study Material</strong>
                          <div className="text-muted small mt-1">
                            PDF notes, assignments, and practice content later yahan show kiya jayega.
                          </div>
                        </div>
                        <div className="bd-feature">
                          <strong>Assessments</strong>
                          <div className="text-muted small mt-1">
                            Batch-linked exams and tests future phase me connect honge.
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="col-lg-5">
                  <div className="bd-card p-4 h-100">
                    <h4 className="fw-bold mb-3">Learning Access</h4>

                    <div className="bd-feature mb-3">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <FiMonitor color="#2563eb" />
                        <strong>Mode</strong>
                      </div>
                      <div className="text-muted small">{batch.mode || "-"}</div>
                    </div>

                    <div className="bd-feature mb-3">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <FiFileText color="#2563eb" />
                        <strong>Price Summary</strong>
                      </div>
                      <div className="text-muted small">
                        Price: ₹{batch.price || 0}
                      </div>
                      <div className="text-muted small">
                        Offer Price: ₹{batch.discountPrice || 0}
                      </div>
                    </div>

                    <div className="bd-feature mb-4">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <FiPlayCircle color="#2563eb" />
                        <strong>Content Status</strong>
                      </div>
                      <div className="text-muted small">
                        Actual study content integration next phase me yahan connect ki jayegi.
                      </div>
                    </div>

                    <button
                      type="button"
                      className="bd-open-btn"
                      onClick={() =>
                        showToast("Batch study content page next step me connect hoga.", "success")
                      }
                    >
                      <FiPlayCircle />
                      Start Learning
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default BatchDetails;
