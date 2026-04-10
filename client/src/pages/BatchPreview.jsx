import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiArrowLeft,
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiFileText,
  FiLayers,
  FiLock,
  FiPlayCircle,
  FiShield,
  FiShoppingCart,
  FiStar,
  FiTarget,
  FiTrendingUp,
  FiUnlock,
  FiVideo,
  FiXCircle,
} from "react-icons/fi";
import MainNavbar from "../components/navigation/MainNavbar";
import LegacyFooter from "../components/layout/LegacyFooter";
import { getUserId, lmsApi } from "../services/lmsApi";

const stageOrder = ["explored", "order_created", "payment_failed", "access_granted"];

const stageCopy = {
  explored: {
    label: "Batch Explored",
    note: "You are reviewing the curriculum, pricing, and access journey.",
  },
  order_created: {
    label: "Payment Initiated",
    note: "Your payment order is created. Complete payment to unlock everything.",
  },
  payment_failed: {
    label: "Payment Failed",
    note: "Your transaction did not complete. You can retry anytime.",
  },
  access_granted: {
    label: "Access Granted",
    note: "Payment successful. Full videos, PDFs, DPPs, and solutions are now unlocked.",
  },
};

const iconByType = {
  video: <FiVideo />,
  note: <FiFileText />,
  dpp: <FiTarget />,
  solution: <FiCheckCircle />,
};

const BatchPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [purchaseStage, setPurchaseStage] = useState("explored");
  const [buying, setBuying] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const token = localStorage.getItem("token") || localStorage.getItem("userToken");
  const userId = getUserId();
  const userName = localStorage.getItem("userName") || "";
  const userEmail = localStorage.getItem("userEmail") || "";

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 2800);
  };

  useEffect(() => {
    let mounted = true;
    const loadPreview = async () => {
      try {
        setLoading(true);
        const [previewData, myBatches] = await Promise.all([
          lmsApi.getBatchPreview(id),
          token && userId ? lmsApi.getMyBatches(userId).catch(() => []) : Promise.resolve([]),
        ]);

        if (!mounted) return;
        setPreview(previewData);

        const accessGranted = (myBatches || []).some(
          (entry) =>
            String(entry.batch?._id || entry.batch) === String(id) &&
            String(entry.accessStatus || "").toLowerCase() === "active"
        );

        setHasAccess(accessGranted);
        if (accessGranted) {
          setPurchaseStage("access_granted");
        } else if (token) {
          lmsApi
            .recordBatchExplore(id)
            .then((row) => {
              if (row?.purchaseStage) {
                setPurchaseStage(row.purchaseStage);
              }
            })
            .catch(() => {});
        }
      } catch (error) {
        if (mounted) {
          showToast("Batch details load nahi ho paaye.", "error");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadPreview();
    return () => {
      mounted = false;
    };
  }, [id, token, userId]);

  const finalAmount = useMemo(() => {
    if (!preview?.batch) return 0;
    return Number(preview.batch.discountPrice || 0) > 0
      ? Number(preview.batch.discountPrice)
      : Number(preview.batch.price || 0);
  }, [preview]);

  const savings = useMemo(() => {
    if (!preview?.batch) return 0;
    return Math.max(Number(preview.batch.price || 0) - finalAmount, 0);
  }, [preview, finalAmount]);

  const handleBuyNow = async () => {
    if (!token) {
      showToast("Please login first to continue payment.", "error");
      setTimeout(() => navigate("/login", { state: { from: `/batch-preview/${id}` } }), 700);
      return;
    }

    if (!window.Razorpay) {
      showToast("Payment gateway unavailable. Refresh and retry.", "error");
      return;
    }

    try {
      setBuying(true);
      const orderRes = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: finalAmount, batchId: id }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData?.order?.id) {
        throw new Error(orderData?.message || "Payment order create nahi ho paaya.");
      }

      setPurchaseStage("order_created");

      const handleFailureState = async (reason) => {
        setPurchaseStage("payment_failed");
        try {
          await lmsApi.markPaymentFailed({
            batchId: id,
            gatewayOrderId: orderData.order.id,
            reason,
          });
        } catch {
          // Swallow failure logging errors so UI remains usable.
        }
      };

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: "INR",
        name: "Computer Excellence Academy",
        description: `${preview?.batch?.batchName || "CEA Batch"} Enrollment`,
        order_id: orderData.order.id,
        handler: async (response) => {
          try {
            const verifyRes = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId,
                batchId: id,
                amount: finalAmount,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData?.message || "Payment verify nahi hua.");
            }
            setPurchaseStage("access_granted");
            setHasAccess(true);
            showToast("Payment successful. Batch unlocked.", "success");
            setTimeout(() => navigate(`/userdash/batch/${id}`), 1200);
          } catch (error) {
            await handleFailureState(error.message || "Verification failed.");
            showToast(error.message || "Payment failed.", "error");
          } finally {
            setBuying(false);
          }
        },
        prefill: {
          name: userName,
          email: userEmail,
        },
        theme: { color: "#6f3cf2" },
        modal: {
          ondismiss: async () => {
            await handleFailureState("Payment popup closed by user.");
            setBuying(false);
            showToast("Payment closed before completion.", "error");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      setBuying(false);
      setPurchaseStage("payment_failed");
      showToast(error.message || "Payment failed.", "error");
    }
  };

  const activeStageIndex = stageOrder.indexOf(purchaseStage);

  return (
    <div className="legacy-page">
      <MainNavbar />
      <style>{`
        .bp-shell {
          max-width: 1320px;
          margin: 0 auto;
          padding: 34px 18px 72px;
        }
        .bp-hero {
          position: relative;
          overflow: hidden;
          border-radius: 34px;
          padding: 34px;
          color: #fff;
          background:
            radial-gradient(circle at right top, rgba(82,191,255,0.18), transparent 22%),
            radial-gradient(circle at 12% 82%, rgba(242,31,133,0.16), transparent 24%),
            linear-gradient(135deg, #0f062d 0%, #240861 45%, #35107d 100%);
          box-shadow: 0 24px 56px rgba(31, 12, 81, 0.24);
        }
        .bp-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px);
          background-size: 22px 22px;
          opacity: 0.2;
          pointer-events: none;
        }
        .bp-hero > * { position: relative; z-index: 1; }
        .bp-stat {
          min-height: 120px;
          padding: 18px;
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.12);
          background: linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06));
          backdrop-filter: blur(14px);
        }
        .bp-section-card {
          border-radius: 28px;
          padding: 26px;
          background: linear-gradient(180deg, #ffffff 0%, #fcf8ff 100%);
          border: 1px solid #e7dbff;
          box-shadow: 0 18px 38px rgba(31, 12, 81, 0.08);
        }
        .bp-section-title {
          font-family: "Playfair Display", serif;
          font-weight: 800;
          font-size: clamp(1.45rem, 2vw, 2rem);
          letter-spacing: -0.02em;
        }
        .bp-feature-pill, .bp-step-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 999px;
          background: #f2ebff;
          color: #7143d4;
          border: 1px solid #e2d4ff;
          font-size: 0.86rem;
          font-weight: 700;
        }
        .bp-step-card {
          position: relative;
          height: 100%;
          padding: 20px;
          border-radius: 22px;
          border: 1px solid #e8dcff;
          background: linear-gradient(180deg, #ffffff 0%, #fcfaff 100%);
          overflow: hidden;
        }
        .bp-step-card.active {
          border-color: rgba(111,60,242,0.32);
          box-shadow: 0 18px 34px rgba(111,60,242,0.12);
        }
        .bp-step-card.active::before {
          content: "";
          position: absolute;
          inset: 0 0 auto 0;
          height: 4px;
          background: linear-gradient(90deg, #6f3cf2, #f21f85, #1c9df2);
        }
        .bp-content-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 18px;
          background: #f8f5ff;
          border: 1px solid #eadfff;
        }
        .bp-content-item + .bp-content-item {
          margin-top: 10px;
        }
        .bp-locked-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 10px;
          border-radius: 999px;
          background: #fff6db;
          color: #a56500;
          border: 1px solid #ffe2a6;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
        }
        .bp-toast {
          position: fixed;
          top: 18px;
          right: 18px;
          z-index: 4000;
          min-width: 250px;
          max-width: 360px;
          border-radius: 16px;
          padding: 12px 14px;
          color: #fff;
          box-shadow: 0 18px 34px rgba(20, 10, 48, 0.28);
        }
        .bp-toast.success { background: linear-gradient(135deg, #6f3cf2, #f21f85); }
        .bp-toast.error { background: linear-gradient(135deg, #d92d5f, #ef4444); }
      `}</style>

      <AnimatePresence>
        {toast.show ? (
          <motion.div
            className={`bp-toast ${toast.type}`}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
          >
            {toast.message}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="bp-shell">
        {loading ? (
          <div className="bp-section-card text-center py-5">
            <div className="spinner-border" role="status" />
            <p className="mt-3 mb-0 fw-semibold text-muted">Loading batch preview...</p>
          </div>
        ) : !preview?.batch ? (
          <div className="bp-section-card text-center py-5">
            <h3 className="bp-section-title mb-2">Batch not found</h3>
            <p className="text-muted mb-4">This batch detail page is unavailable right now.</p>
            <button className="legacy-btn primary" onClick={() => navigate("/courses")}>
              Back to Courses
            </button>
          </div>
        ) : (
          <>
            <section className="bp-hero mb-4">
              <div className="d-flex flex-wrap justify-content-between align-items-start gap-4">
                <div style={{ maxWidth: 760 }}>
                  <button
                    className="legacy-btn ghost mb-3"
                    style={{ width: "auto" }}
                    onClick={() => navigate(-1)}
                  >
                    <FiArrowLeft className="me-2" />
                    Back
                  </button>
                  <div className="legacy-pill dark mb-3">Batch Detail Preview</div>
                  <h1 className="legacy-hero-title mb-2">
                    {preview.batch.batchName} <span className="accent">Batch</span>
                  </h1>
                  <p className="legacy-hero-subtitle">
                    {preview.batch.description ||
                      preview.batch.course?.fullDescription ||
                      preview.batch.course?.shortDescription ||
                      "Structured course details, feature list, and locked content preview before purchase."}
                  </p>
                  <div className="d-flex flex-wrap gap-2 mt-4">
                    {(preview.batch.features || []).map((feature) => (
                      <span className="bp-feature-pill" key={feature}>
                        <FiStar />
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="d-grid gap-3" style={{ width: "min(320px,100%)" }}>
                  <div className="bp-stat">
                    <div className="small text-uppercase opacity-75 fw-bold">Price</div>
                    <div className="display-6 fw-bold mb-1">₹{finalAmount.toLocaleString()}</div>
                    {savings > 0 ? (
                      <div className="small opacity-75">Save ₹{savings.toLocaleString()} on this batch</div>
                    ) : (
                      <div className="small opacity-75">Direct access pricing active</div>
                    )}
                  </div>
                  <div className="bp-stat">
                    <div className="small text-uppercase opacity-75 fw-bold">Duration & Mode</div>
                    <div className="fw-bold fs-5">{preview.batch.duration || preview.batch.course?.duration || "Flexible"}</div>
                    <div className="small opacity-75 text-capitalize">{preview.batch.mode || "online"} learning flow</div>
                  </div>
                </div>
              </div>
            </section>

            <div className="row g-4 mb-4">
              <div className="col-lg-8">
                <div className="bp-section-card h-100">
                  <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
                    <div>
                      <h2 className="bp-section-title mb-2">Batch Overview</h2>
                      <p className="text-muted mb-0">
                        Admin-added details, feature list, content counts, and purchase journey are visible here before payment.
                      </p>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      <span className="bp-feature-pill"><FiBookOpen /> {preview.batch.course?.title || "Course"}</span>
                      <span className="bp-feature-pill"><FiClock /> {preview.summary?.videos || 0} videos</span>
                      <span className="bp-feature-pill"><FiFileText /> {preview.summary?.notes || 0} notes</span>
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-4"><div className="bp-content-item"><span className="fw-bold">Videos</span><strong>{preview.summary?.videos || 0}</strong></div></div>
                    <div className="col-md-4"><div className="bp-content-item"><span className="fw-bold">DPPs</span><strong>{preview.summary?.dpps || 0}</strong></div></div>
                    <div className="col-md-4"><div className="bp-content-item"><span className="fw-bold">Solutions</span><strong>{preview.summary?.solutions || 0}</strong></div></div>
                    <div className="col-md-4"><div className="bp-content-item"><span className="fw-bold">Subjects</span><strong>{preview.subjects?.length || 0}</strong></div></div>
                    <div className="col-md-4"><div className="bp-content-item"><span className="fw-bold">Start Date</span><strong>{preview.batch.startDate ? new Date(preview.batch.startDate).toLocaleDateString() : "Flexible"}</strong></div></div>
                    <div className="col-md-4"><div className="bp-content-item"><span className="fw-bold">Seats</span><strong>{preview.batch.maxStudents || "Open"}</strong></div></div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="bp-section-card h-100">
                  <h2 className="bp-section-title mb-3">Buy Steps</h2>
                  <div className="d-grid gap-3">
                    {stageOrder.map((stage, index) => (
                      <div
                        key={stage}
                        className={`bp-step-card ${activeStageIndex >= index ? "active" : ""}`}
                      >
                        <div className="small fw-bold text-uppercase text-muted mb-2">Step {index + 1}</div>
                        <div className="fw-bold mb-1">{stageCopy[stage].label}</div>
                        <div className="small text-muted">{stageCopy[stage].note}</div>
                      </div>
                    ))}
                  </div>

                  <div className="d-grid gap-2 mt-4">
                    {hasAccess ? (
                      <button className="legacy-btn primary" onClick={() => navigate(`/userdash/batch/${id}`)}>
                        <FiUnlock className="me-2" />
                        Open Learning
                      </button>
                    ) : (
                      <button className="legacy-btn primary" onClick={handleBuyNow} disabled={buying}>
                        <FiShoppingCart className="me-2" />
                        {buying ? "Processing..." : "Buy This Batch"}
                      </button>
                    )}
                    {!token ? (
                      <button className="legacy-btn ghost" onClick={() => navigate("/login")}>
                        <FiShield className="me-2" />
                        Login to Continue
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <section className="bp-section-card mb-4">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                  <h2 className="bp-section-title mb-2">Locked Learning Preview</h2>
                  <p className="text-muted mb-0">
                    Students with successful payment get full access. Before purchase, videos, PDFs, DPPs, and solutions stay locked with lock symbols.
                  </p>
                </div>
                <div className="bp-locked-badge" style={hasAccess ? { background: "#e8fff3", color: "#14834b", borderColor: "#b8f0ce" } : undefined}>
                  {hasAccess ? <FiUnlock /> : <FiLock />}
                  {hasAccess ? "Unlocked" : "Locked Until Payment"}
                </div>
              </div>

              <div className="d-grid gap-3">
                {(preview.subjects || []).map((subject) => (
                  <details key={subject._id} open className="bp-content-item" style={{ display: "block" }}>
                    <summary className="d-flex justify-content-between align-items-center" style={{ cursor: "pointer", listStyle: "none" }}>
                      <div>
                        <div className="fw-bold">{subject.title}</div>
                        <div className="small text-muted">{subject.chapters?.length || 0} chapters inside</div>
                      </div>
                      <span className="bp-step-pill"><FiLayers /> Subject</span>
                    </summary>
                    <div className="mt-3 d-grid gap-3">
                      {(subject.chapters || []).map((chapter) => (
                        <div key={chapter._id} className="bp-content-item" style={{ background: "#fff", marginTop: 0 }}>
                          <div className="w-100">
                            <div className="d-flex justify-content-between align-items-center gap-3 mb-2">
                              <div>
                                <div className="fw-bold">{chapter.title}</div>
                                <div className="small text-muted">{chapter.items?.length || 0} content items</div>
                              </div>
                              <span className="bp-locked-badge" style={hasAccess ? { background: "#e8fff3", color: "#14834b", borderColor: "#b8f0ce" } : undefined}>
                                {hasAccess ? <FiUnlock /> : <FiLock />}
                                {hasAccess ? "Unlocked" : "Locked"}
                              </span>
                            </div>
                            <div className="d-grid gap-2">
                              {(chapter.items || []).map((item) => (
                                <div key={item._id} className="bp-content-item" style={{ background: "#f9f7ff" }}>
                                  <div className="d-flex align-items-center gap-3">
                                    <div className="legacy-icon-box" style={{ width: 44, height: 44, borderRadius: 14 }}>
                                      {iconByType[item.type] || <FiBookOpen />}
                                    </div>
                                    <div>
                                      <div className="fw-bold">{item.title}</div>
                                      <div className="small text-muted text-capitalize">
                                        {item.type} • {item.resourceFormat}
                                      </div>
                                    </div>
                                  </div>
                                  <span className="bp-locked-badge" style={hasAccess ? { background: "#e8fff3", color: "#14834b", borderColor: "#b8f0ce" } : undefined}>
                                    {hasAccess ? <FiUnlock /> : <FiLock />}
                                    {hasAccess ? "Unlocked" : "Locked"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      <LegacyFooter />
    </div>
  );
};

export default BatchPreview;
