import React, { useState } from "react";
import axios from "axios";
import { FiMail, FiMessageCircle, FiPhone, FiSend, FiX } from "react-icons/fi";
import MainNavbar from "../components/navigation/MainNavbar";
import LegacyFooter from "../components/layout/LegacyFooter";
import { useSEO } from "../components/SEOHelmet";
import { seoConfig } from "../config/seoConfig";

const contactCards = [
  {
    icon: FiPhone,
    label: "Call Support",
    value: "+91 9369050651",
    sub: "Mon-Sat 09:00 AM - 08:00 PM",
  },
  {
    icon: FiMessageCircle,
    label: "WhatsApp",
    value: "+91 9369050651",
    sub: "Fast response during support window",
  },
  {
    icon: FiMail,
    label: "Email",
    value: "computerexcellenceacademy@gmail.com",
    sub: "Reply within 24 hours",
  },
];

const Support = () => {
  useSEO(seoConfig.pages.support);
  const [form, setForm] = useState({ email: "", phone: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 2600);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.email.trim() || !form.phone.trim() || !form.description.trim()) {
      showToast("Please fill all required fields.", "error");
      return;
    }
    try {
      setSubmitting(true);
      await axios.post(`${import.meta.env.VITE_API_URL}/api/message/public`, {
        email: form.email.trim(),
        phone: form.phone.trim(),
        description: form.description.trim(),
      });
      setForm({ email: "", phone: "", description: "" });
      showToast("Support request sent successfully.");
    } catch (error) {
      showToast(error?.response?.data?.message || "Failed to send request.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="legacy-page">
      <MainNavbar />

      {toast.show && (
        <div
          style={{
            position: "fixed",
            top: 18,
            right: 18,
            zIndex: 9999,
            minWidth: 260,
            borderRadius: 14,
            color: "#fff",
            padding: "12px 14px",
            background:
              toast.type === "error"
                ? "linear-gradient(135deg,#f0527a,#ea2f5f)"
                : "linear-gradient(135deg,#7b3ff2,#f21f85)",
            boxShadow: "0 14px 28px rgba(22,14,50,.35)",
          }}
        >
          <div className="d-flex justify-content-between align-items-center gap-2">
            <span className="small fw-semibold">{toast.message}</span>
            <button
              onClick={() => setToast({ show: false, message: "", type: "success" })}
              style={{ border: 0, background: "transparent", color: "#fff" }}
            >
              <FiX />
            </button>
          </div>
        </div>
      )}

      <section className="legacy-hero">
        <div className="container legacy-hero-inner">
          <span className="legacy-pill dark">Support Open Now</span>
          <h1 className="legacy-hero-title">
            We&apos;re Here to <span className="accent">Help You</span>
          </h1>
          <p className="legacy-hero-subtitle">
            For admission help, technical issue, payment query, or batch support, reach out from any
            channel below.
          </p>
        </div>
      </section>

      <section className="legacy-section" style={{ paddingTop: 34 }}>
        <div className="container">
          <div className="row g-4 mb-4">
            {contactCards.map((card) => (
              <div key={card.label} className="col-lg-4">
                <div className="legacy-card h-100">
                  <div className="legacy-card-body">
                    <div className="legacy-icon-box mb-3">
                      <card.icon />
                    </div>
                    <h6 className="fw-semibold mb-1">{card.label}</h6>
                    <div className="fw-bold mb-1">{card.value}</div>
                    <p className="legacy-mini mb-0">{card.sub}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-4">
            <div className="col-lg-7">
              <div className="legacy-card h-100">
                <div className="legacy-card-body">
                  <h4 className="fw-bold mb-1">Send us a message</h4>
                  <p className="legacy-mini mb-4">Our team will contact you as soon as possible.</p>
                  <form onSubmit={handleSubmit} className="d-grid gap-3">
                    <input
                      type="email"
                      name="email"
                      placeholder="Email address"
                      className="legacy-input"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Mobile number"
                      className="legacy-input"
                      value={form.phone}
                      onChange={handleChange}
                      required
                    />
                    <textarea
                      name="description"
                      placeholder="How can we help?"
                      rows="5"
                      className="legacy-textarea"
                      value={form.description}
                      onChange={handleChange}
                      required
                    />
                    <button className="legacy-btn primary" disabled={submitting}>
                      {submitting ? "Sending..." : (
                        <>
                          <FiSend className="me-1" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="legacy-card h-100">
                <div className="legacy-card-body">
                  <h5 className="fw-bold mb-3">Frequently Asked Questions</h5>
                  <div className="d-grid gap-3">
                    <div>
                      <div className="fw-semibold mb-1">Are all courses free?</div>
                      <div className="legacy-mini">Yes, core learning resources are free for all students.</div>
                    </div>
                    <div>
                      <div className="fw-semibold mb-1">How to access paid batch content?</div>
                      <div className="legacy-mini">
                        Purchase the batch and content unlocks automatically in your dashboard.
                      </div>
                    </div>
                    <div>
                      <div className="fw-semibold mb-1">Can I learn from mobile?</div>
                      <div className="legacy-mini">Yes, platform works on both desktop and mobile devices.</div>
                    </div>
                  </div>
                  <div className="legacy-card mt-4" style={{ background: "#faf7ff" }}>
                    <div className="legacy-card-body">
                      <div className="fw-semibold mb-1">Institute Address</div>
                      <p className="legacy-mini mb-0">
                        Vedpur, Shukulpur Bazar, Ramjanki Marg, Basti (U.P.), India.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LegacyFooter />
    </div>
  );
};

export default Support;
