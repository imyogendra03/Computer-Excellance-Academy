import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const UserCourses = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const userEmail = localStorage.getItem("userEmail");
  const userName = localStorage.getItem("userName");

  const [courses, setCourses] = useState([]);
  const [fetchingCourses, setFetchingCourses] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [buyingBatchId, setBuyingBatchId] = useState("");
  const [visible, setVisible] = useState({});
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const cardRefs = useRef([]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 2500);
  };

  // Courses fetch karo
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setFetchingCourses(true);
        const res = await fetch("https://computer-excellance-academy.onrender.com/api/course");
        const data = await res.json();
        setCourses(Array.isArray(data?.data) ? data.data : []);
      } catch (error) {
        showToast("Courses load nahi ho paaye.", "error");
      } finally {
        setFetchingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  // Card animation
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) setVisible((v) => ({ ...v, [e.target.dataset.idx]: true }));
      }),
      { threshold: 0.12 }
    );
    cardRefs.current.forEach((r) => r && obs.observe(r));
    return () => obs.disconnect();
  }, [courses]);

  // Batches fetch karo
  const fetchBatches = async (course) => {
    try {
      setSelectedCourse(course);
      setBatchModalOpen(true);
      setLoadingBatches(true);
      setBatches([]);
     const res = await fetch(`https://computer-excellance-academy.onrender.com/api/batch/course/${course._id}`);
      const data = await res.json();
      setBatches(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      showToast("Batches load nahi ho paaye.", "error");
    } finally {
      setLoadingBatches(false);
    }
  };

  // Razorpay payment
  const handleBuyNow = async (batch) => {
    try {
      setBuyingBatchId(batch._id);

      const finalAmount =
        Number(batch.discountPrice || 0) > 0
          ? Number(batch.discountPrice)
          : Number(batch.price || 0);

      // Step 1 — Order create karo
      const orderRes = await fetch("https://computer-excellance-academy.onrender.com/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalAmount, batchId: batch._id }),
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData?.order?.id) {
        throw new Error(orderData?.message || "Order create nahi hua");
      }

      // Step 2 — Razorpay popup
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: "INR",
        name: "Computer Excellence Academy",
        description: `${batch.batchName} - Batch Purchase`,
        order_id: orderData.order.id,
        handler: async function (response) {
          try {
            // Step 3 — Verify karo
            const verifyRes = await fetch("https://computer-excellance-academy.onrender.com/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId,
                batchId: batch._id,
                amount: finalAmount,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData?.message || "Verification failed");

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
          name: userName || "",
          email: userEmail || "",
        },
        theme: { color: "#2563eb" },
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

  const filtered = useMemo(() => {
    return courses.filter((c) =>
      String(c.title || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [courses, search]);

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    return isNaN(date.getTime()) ? value : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <>
      <style>{`
        .uc-page { min-height: 100vh; background: linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%); }
        .uc-hero { padding: 32px; border-radius: 28px; color: #fff; background: linear-gradient(135deg, #0f172a, #1d4ed8, #4f46e5); box-shadow: 0 20px 45px rgba(37,99,235,0.22); }
        .uc-search-wrap { position: relative; }
        .uc-search-inp { width: 100%; padding: 13px 46px 13px 18px; border-radius: 14px; border: 2px solid rgba(37,99,235,0.15); background: #f8fbff; font-size: 0.95rem; outline: none; }
        .uc-search-inp:focus { border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37,99,235,0.08); }
        .uc-search-ic { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); color: #64748b; }
        .uc-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
        .uc-card { background: #fff; border-radius: 22px; border: 1px solid #eeeef8; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); opacity: 0; transform: translateY(24px); transition: all 0.4s cubic-bezier(0.23,1,0.32,1); cursor: pointer; }
        .uc-card.show { opacity: 1; transform: translateY(0); }
        .uc-card:hover { transform: translateY(-8px); box-shadow: 0 20px 50px rgba(37,99,235,0.15); border-color: rgba(37,99,235,0.2); }
        .uc-card-head { height: 130px; display: flex; align-items: center; justify-content: center; font-size: 3.2rem; background: linear-gradient(135deg,#dbeafe,#ede9fe); }
        .uc-card-body { padding: 20px; }
        .uc-tag { display: inline-block; padding: 4px 12px; border-radius: 999px; background: #dbeafe; color: #1d4ed8; font-size: 12px; font-weight: 700; margin-bottom: 10px; }
        .uc-title { font-weight: 800; font-size: 1rem; color: #0f172a; margin-bottom: 8px; }
        .uc-desc { font-size: 0.84rem; color: #64748b; line-height: 1.65; margin-bottom: 14px; }
        .uc-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 12px; border-top: 1px solid #f0f0f8; }
        .uc-btn { border: none; color: #fff; font-weight: 700; border-radius: 10px; padding: 9px 18px; font-size: 0.82rem; background: linear-gradient(135deg,#2563eb,#4f46e5); cursor: pointer; }
        .uc-panel { background: #fff; border-radius: 24px; box-shadow: 0 16px 40px rgba(15,23,42,0.08); }
        .uc-modal-overlay { position: fixed; inset: 0; background: rgba(3,7,18,0.72); z-index: 1200; display: flex; align-items: center; justify-content: center; padding: 18px; }
        .uc-modal { width: 100%; max-width: 820px; max-height: 88vh; overflow: auto; background: white; border-radius: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.28); padding: 24px; }
        .uc-modal-head { display: flex; justify-content: space-between; gap: 14px; margin-bottom: 18px; }
        .uc-modal-close { border: none; background: #eef2ff; color: #3730a3; width: 40px; height: 40px; border-radius: 12px; cursor: pointer; font-size: 18px; }
        .uc-course-info { padding: 18px; border-radius: 18px; background: #f8fbff; margin-bottom: 18px; }
        .uc-batch { border: 1px solid #e2e8f0; border-radius: 18px; padding: 18px; margin-bottom: 14px; }
        .uc-batch-row { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .uc-price { font-size: 1.1rem; font-weight: 800; color: #111827; }
        .uc-old-price { color: #94a3b8; text-decoration: line-through; font-size: 0.88rem; margin-left: 8px; }
        .uc-buy-btn { border: none; color: #fff; font-weight: 700; border-radius: 12px; padding: 11px 20px; background: linear-gradient(135deg,#2563eb,#4f46e5); cursor: pointer; }
        .uc-buy-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .uc-badge { display: inline-block; padding: 6px 12px; border-radius: 999px; background: #dbeafe; color: #1d4ed8; font-size: 12px; font-weight: 700; }
        .uc-toast { position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 280px; color: #fff; padding: 14px 16px; border-radius: 16px; box-shadow: 0 12px 30px rgba(0,0,0,0.18); }
        .uc-toast.success { background: linear-gradient(135deg,#2563eb,#4f46e5); }
        .uc-toast.error { background: linear-gradient(135deg,#dc2626,#ef4444); }
        @media(max-width:991px){ .uc-grid{grid-template-columns:repeat(2,1fr);} }
        @media(max-width:600px){ .uc-grid{grid-template-columns:1fr;} }
      `}</style>

      {toast.show && (
        <div className={`uc-toast ${toast.type === "error" ? "error" : "success"}`}>
          {toast.message}
        </div>
      )}

      <div className="uc-page">
        <div className="container py-4">

          {/* Hero */}
          <div className="uc-hero mb-4">
            <div className="row align-items-center g-4">
              <div className="col-lg-8">
                <h2 className="fw-bold mb-2">Explore Courses</h2>
                <p className="mb-0" style={{ opacity: 0.88 }}>
                  Apna pasand ka course chuniye aur batch purchase karke learning shuru kijiye.
                </p>
              </div>
              <div className="col-lg-4">
                <div className="uc-search-wrap">
                  <input
                    type="text"
                    className="uc-search-inp"
                    placeholder="Search courses..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <span className="uc-search-ic">🔍</span>
                </div>
              </div>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="uc-panel p-4">
            {fetchingCourses ? (
              <div className="text-center py-5 text-muted">Courses load ho rahe hain...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-5 text-muted">Koi course nahi mila.</div>
            ) : (
              <div className="uc-grid">
                {filtered.map((c, i) => (
                  <div
                    key={c._id}
                    className={`uc-card ${visible[i] ? "show" : ""}`}
                    ref={(el) => (cardRefs.current[i] = el)}
                    data-idx={i}
                    style={{ transitionDelay: `${(i % 3) * 80}ms` }}
                    onClick={() => fetchBatches(c)}
                  >
                    <div className="uc-card-head">
                      {c.icon || "📘"}
                    </div>
                    <div className="uc-card-body">
                      <div className="uc-tag">{c.category || "General"}</div>
                      <div className="uc-title">{c.title}</div>
                      <div className="uc-desc">
                        {c.shortDescription || c.fullDescription || "No description available."}
                      </div>
                      <div className="uc-footer">
                        <span style={{ fontSize: "13px", color: "#64748b" }}>
                          ⏱️ {c.duration || "-"}
                        </span>
                        <button
                          className="uc-btn"
                          onClick={(e) => { e.stopPropagation(); fetchBatches(c); }}
                        >
                          Batches Dekho →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Batch Modal */}
      {batchModalOpen && (
        <div className="uc-modal-overlay" onClick={() => setBatchModalOpen(false)}>
          <div className="uc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="uc-modal-head">
              <div>
                <h3 style={{ marginBottom: "6px" }}>{selectedCourse?.title}</h3>
                <p style={{ color: "#64748b", margin: 0 }}>Available batches select karo aur purchase karo.</p>
              </div>
              <button className="uc-modal-close" onClick={() => setBatchModalOpen(false)}>✕</button>
            </div>

            <div className="uc-course-info">
              <div style={{ fontWeight: "700", marginBottom: "6px" }}>{selectedCourse?.title}</div>
              <div style={{ color: "#64748b", fontSize: "14px" }}>
                {selectedCourse?.shortDescription || "No description available."}
              </div>
            </div>

            {loadingBatches ? (
              <div style={{ padding: "28px", textAlign: "center", color: "#64748b" }}>Batches load ho rahe hain...</div>
            ) : batches.length === 0 ? (
              <div style={{ padding: "28px", textAlign: "center", color: "#64748b" }}>Is course ke liye abhi koi batch available nahi hai.</div>
            ) : (
              batches.map((batch) => {
                const finalAmount =
                  Number(batch.discountPrice || 0) > 0
                    ? Number(batch.discountPrice)
                    : Number(batch.price || 0);

                return (
                  <div className="uc-batch" key={batch._id}>
                    <div className="uc-batch-row" style={{ marginBottom: "10px" }}>
                      <div>
                        <div style={{ fontWeight: "800", fontSize: "1rem" }}>{batch.batchName}</div>
                        <div style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
                          {batch.description || "Batch description not available."}
                        </div>
                      </div>
                      <span className="uc-badge">{batch.mode || "online"}</span>
                    </div>

                    <div className="uc-batch-row" style={{ marginBottom: "10px" }}>
                      <div style={{ color: "#64748b", fontSize: "14px" }}>Start: {formatDate(batch.startDate)}</div>
                      <div style={{ color: "#64748b", fontSize: "14px" }}>Duration: {batch.duration || "-"}</div>
                    </div>

                    {Array.isArray(batch.features) && batch.features.length > 0 && (
                      <div style={{ color: "#475569", fontSize: "14px", marginBottom: "12px" }}>
                        {batch.features.slice(0, 3).map((f, i) => <div key={i}>• {f}</div>)}
                      </div>
                    )}

                    <div className="uc-batch-row">
                      <div className="uc-price">
                        ₹{finalAmount}
                        {Number(batch.discountPrice || 0) > 0 && (
                          <span className="uc-old-price">₹{batch.price}</span>
                        )}
                      </div>
                      <button
                        className="uc-buy-btn"
                        disabled={buyingBatchId === batch._id}
                        onClick={() => handleBuyNow(batch)}
                      >
                        {buyingBatchId === batch._id ? "Processing..." : "Buy Now 💳"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default UserCourses;
