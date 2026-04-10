import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiAward, FiBookOpen, FiCheckCircle, FiUsers, FiStar, FiSend } from "react-icons/fi";
import MainNavbar from "../components/navigation/MainNavbar";
import LegacyFooter from "../components/layout/LegacyFooter";
import { useSEO } from "../components/SEOHelmet";
import { seoConfig } from "../config/seoConfig";
import AppToast from "../components/ui/AppToast";

const stats = [
  { icon: FiUsers, value: "15,000+", label: "Students Trained" },
  { icon: FiBookOpen, value: "24+", label: "Free Courses" },
  { icon: FiAward, value: "1000+", label: "Certificates Issued" },
];

const mentors = [
  {
    name: "Yogendra Kumar",
    role: "Full Stack Mentor",
    image: "/Yogendra Kumar.jpeg",
    quote: "Project-based learning and practical confidence.",
  },
  {
    name: "Ramesh Gupta",
    role: "Operations Head",
    image: "/Ramesh Chandra.jpeg",
    quote: "Every learner deserves quality guidance.",
  },
  {
    name: "Mukesh Shahu",
    role: "Founder and Director",
    image: "/MukeshShahu.jpeg",
    quote: "Digital skills should be accessible to all.",
  },
  {
    name: "Pankaj Kumar",
    role: "Design Specialist",
    image: "/Pankaj Kumar.jpeg",
    quote: "Creative computer education for future careers.",
  },
];

const chiefGuests = [
  {
    name: "Dr. Arvind Khanna",
    role: "IAS Officer",
    description: "Public policy expert and youth motivation speaker who guided our students on leadership, discipline, and career direction.",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Vikram Singh",
    role: "TechBridge CEO",
    description: "Industry leader sharing startup, digital product, and employability insights for students entering the tech ecosystem.",
    image:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Sunita Rao",
    role: "Principal",
    description: "Education mentor focused on structured learning habits, digital confidence, and classroom-to-career progression.",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Rahul Mehta",
    role: "Startup Mentor",
    description: "Career growth coach helping learners understand freelancing, entrepreneurship, and project-based computer learning.",
    image:
      "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=500&q=80",
  },
];

const students = [
  {
    name: "Neha Singh",
    role: "Web Dev Learner",
    description: "Built responsive practice projects and improved confidence in HTML, CSS, and JavaScript fundamentals.",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Aman Verma",
    role: "ADCA Student",
    description: "Consistent batch performer with practical lab work, office productivity skills, and strong attendance progress.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Lavanya T.",
    role: "Typing Batch",
    description: "Improved speed and accuracy with guided typing drills, weekly practice support, and mentor feedback.",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Kalyan Lohar",
    role: "Programming Learner",
    description: "Sharpened logical thinking through code exercises, assignments, and beginner-friendly project mentoring.",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80",
  },
];

const events = [
  {
    title: "Digital Skill Workshop",
    role: "Hands-on classroom lab",
    description: "Interactive sessions where students practice office tools, internet basics, and live task-based computer learning.",
    image:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Career Guidance Seminar",
    role: "Expert speaker session",
    description: "Mentor-led seminar covering career roadmap planning, course selection, and skill-building strategies for learners.",
    image:
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Certificate Ceremony",
    role: "Celebration and recognition",
    description: "A proud moment where our students receive certificates and celebrate their dedication, consistency, and progress.",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Coding Practice Camp",
    role: "Project and exam practice",
    description: "Focused activity sessions designed to improve problem-solving, coding confidence, and exam readiness.",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Annual Learning Showcase",
    role: "Student presentation day",
    description: "Students present their learning outcomes, batch work, and practical achievements in front of peers and mentors.",
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Computer Awareness Camp",
    role: "Community outreach",
    description: "Awareness program focused on digital literacy, smart device usage, and computer education for new learners.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  },
];

const stripRows = (items, rowClass, reverse = false) => (
  <div className={`about-scroll ${reverse ? "reverse" : ""}`}>
    <div className="about-scroll-track">
      {[...items, ...items].map((item, index) => (
        <div
          key={`${rowClass}-${item.name || item.title}-${index}`}
          className={`about-chip ${rowClass} ${rowClass === "mentor-row" && index % items.length === 2 ? "spotlight" : ""}`}
        >
          <div className="about-chip-media">
            <img src={item.image} alt={item.name || item.title} />
          </div>
          <div className="about-chip-copy">
            <span className="about-chip-kicker">
              {rowClass === "mentor-row" && "CEA Mentor"}
              {rowClass === "guest-row" && "Chief Guest"}
              {rowClass === "student-row" && "Learner Story"}
              {rowClass === "event-row" && "Campus Event"}
            </span>
            <h6>{item.name || item.title}</h6>
            <p>{item.role || "CEA Event"}</p>
            {(item.description || item.quote) && <small>{item.description || item.quote}</small>}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AboutUs = () => {
  const navigate = useNavigate();
  useSEO(seoConfig.pages.about);

  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const isLoggedIn = Boolean(localStorage.getItem("token") || localStorage.getItem("userData"));

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 2500);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      showToast("Please login first", "error");
      return;
    }
    if (!reviewText.trim()) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token") || localStorage.getItem("userToken");
      await axios.post(`${import.meta.env.VITE_API_URL}/api/review`, {
        rating,
        reviewText: reviewText.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast("Review submitted! Waiting for admin approval.");
      setReviewText("");
      setRating(5);
    } catch (err) {
      showToast("Submission failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="legacy-page">
      <AppToast toast={toast} onClose={() => setToast({ show: false, message: "", type: "success" })} />
      <style>{`
        .about-scroll {
          width: 100%;
          overflow: hidden;
          padding: 4px 0;
          mask-image: linear-gradient(to right, transparent, black 6%, black 94%, transparent);
        }
        .about-scroll-track {
          display: flex;
          width: max-content;
          gap: 22px;
          padding: 10px 0;
          animation: aboutMarquee 32s linear infinite;
        }
        .about-scroll.reverse .about-scroll-track {
          animation-direction: reverse;
        }
        .about-chip {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          gap: 16px;
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          padding: 18px;
          min-width: 290px;
          background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(251,247,255,0.98));
          box-shadow: 0 14px 34px rgba(27, 14, 61, 0.1);
          isolation: isolate;
        }
        .about-chip::before {
          content: "";
          position: absolute;
          inset: 0;
          padding: 1px;
          border-radius: inherit;
          background: linear-gradient(135deg, rgba(111,60,242,0.9), rgba(242,31,133,0.7), rgba(82,191,255,0.85));
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: aboutBorderFlow 6s linear infinite;
          z-index: 0;
        }
        .about-chip::after {
          content: "";
          position: absolute;
          inset: auto -25% -62% auto;
          width: 180px;
          height: 180px;
          background: radial-gradient(circle, rgba(111, 60, 242, 0.16), transparent 70%);
          z-index: 0;
        }
        .about-chip > * {
          position: relative;
          z-index: 1;
        }
        .about-chip:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 50px rgba(27, 14, 61, 0.16);
        }
        .about-chip-media {
          position: relative;
          flex: 0 0 auto;
          border-radius: 22px;
        }
        .about-chip-media::before {
          content: "";
          position: absolute;
          inset: -6px;
          border-radius: 26px;
          background: conic-gradient(from 0deg, rgba(111,60,242,0.9), rgba(242,31,133,0.85), rgba(82,191,255,0.85), rgba(111,60,242,0.9));
          filter: blur(8px);
          opacity: 0.85;
          animation: aboutSpin 5.5s linear infinite;
          z-index: -1;
        }
        .about-chip img {
          width: 84px;
          height: 84px;
          display: block;
          border-radius: 20px;
          object-fit: cover;
          border: 3px solid rgba(255, 255, 255, 0.82);
          box-shadow: 0 12px 22px rgba(39, 17, 97, 0.18);
        }
        .about-chip-copy {
          max-width: 320px;
        }
        .about-chip-kicker {
          display: inline-flex;
          margin-bottom: 8px;
          padding: 6px 10px;
          border-radius: 999px;
          background: #f3eaff;
          color: #7a49dd;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .about-chip h6 {
          margin: 0;
          font-family: "Outfit", sans-serif !important;
          font-size: 1.1rem;
          font-weight: 800;
          color: #201447;
          line-height: 1.2;
        }
        .about-chip p {
          margin: 5px 0 0;
          font-size: 0.88rem;
          color: #6f6495;
          font-weight: 700;
        }
        .about-chip small {
          display: block;
          margin-top: 8px;
          color: #57497e;
          font-size: 0.84rem;
          line-height: 1.6;
          font-weight: 600;
        }
        .mentor-row {
          min-width: 430px;
          padding: 22px 24px;
        }
        .mentor-row img {
          width: 98px;
          height: 98px;
        }
        .mentor-row.spotlight {
          transform: translateY(-3px) scale(1.03);
          background: linear-gradient(180deg, #ffffff, #f9f1ff);
          box-shadow: 0 24px 46px rgba(73, 24, 165, 0.18);
        }
        .mentor-row.spotlight img {
          width: 132px;
          height: 132px;
          border-radius: 28px;
        }
        .guest-row {
          min-width: 540px;
          padding: 22px 24px;
        }
        .guest-row img {
          width: 158px;
          height: 158px;
          border-radius: 30px;
        }
        .guest-row .about-chip-copy {
          max-width: 320px;
        }
        .student-row {
          min-width: 420px;
          padding: 20px 22px;
        }
        .student-row img {
          width: 108px;
          height: 108px;
          border-radius: 24px;
        }
        .student-row .about-chip-copy {
          max-width: 250px;
        }
        .event-row {
          min-width: 560px;
          align-items: stretch;
          padding: 14px;
        }
        .event-row .about-chip-media {
          align-self: stretch;
        }
        .event-row img {
          width: 230px;
          height: 168px;
          border-radius: 22px;
        }
        .event-row .about-chip-copy {
          display: flex;
          flex-direction: column;
          justify-content: center;
          max-width: 280px;
        }
        .about-highlight-box {
          padding: 22px;
          border-radius: 24px;
          background: linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06));
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(10px);
        }
        .about-bullet {
          padding: 14px 16px;
          border-radius: 18px;
          background: linear-gradient(180deg, #ffffff, #faf6ff);
          border: 1px solid #eadfff;
          box-shadow: 0 10px 24px rgba(29, 16, 67, 0.06);
          font-weight: 700;
        }
        @keyframes aboutBorderFlow {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        @keyframes aboutSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes aboutMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (max-width: 991px) {
          .mentor-row,
          .guest-row,
          .event-row {
            min-width: 360px;
          }
          .student-row {
            min-width: 340px;
          }
        }
        @media (max-width: 767px) {
          .about-scroll-track {
            gap: 16px;
            animation-duration: 24s;
          }
          .about-chip,
          .mentor-row,
          .guest-row,
          .student-row,
          .event-row {
            min-width: 300px;
            padding: 16px;
          }
          .mentor-row img,
          .student-row img {
            width: 82px;
            height: 82px;
          }
          .mentor-row.spotlight img,
          .guest-row img {
            width: 102px;
            height: 102px;
          }
          .student-row img {
            width: 88px;
            height: 88px;
          }
          .event-row img {
            width: 138px;
            height: 112px;
          }
          .about-chip h6 {
            font-size: 1rem;
          }
          .about-chip p,
          .about-chip small {
            font-size: 0.8rem;
          }
        }
      `}</style>

      <MainNavbar />

      <section className="legacy-hero">
        <div className="container legacy-hero-inner">
          <span className="legacy-pill dark">About Computer Excellence Academy</span>
          <h1 className="legacy-hero-title">
            Meet the <span className="accent">Mentors, Guests</span> and Learners Driving CEA Forward
          </h1>
          <p className="legacy-hero-subtitle">
            Computer Excellence Academy blends practical computer education, mentorship, community events,
            and student success stories into one professional digital learning ecosystem.
          </p>
          <div className="legacy-actions">
            <button className="legacy-btn primary" onClick={() => navigate("/courses")}>
              Explore Courses
            </button>
            <button className="legacy-btn ghost" onClick={() => navigate("/support")}>
              Contact Support
            </button>
          </div>
        </div>
      </section>

      <section className="legacy-section">
        <div className="container">
          <div className="row g-4">
            {stats.map((item) => (
              <div className="col-md-4" key={item.label}>
                <div className="legacy-card h-100">
                  <div className="legacy-card-body text-center">
                    <div className="legacy-icon-box mx-auto">
                      <item.icon />
                    </div>
                    <div className="legacy-counter">{item.value}</div>
                    <div className="legacy-mini fw-semibold">{item.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="legacy-section soft">
        <div className="container">
          <div className="row g-4 align-items-center">
            <div className="col-lg-6">
              <div className="legacy-head text-start mb-3">
                <span className="legacy-pill light">Our Mission</span>
                <h2 className="text-start">Practical Skills, Real Mentorship, Visible Student Growth</h2>
              </div>
              <p className="legacy-mini fs-6 mb-4">
                We focus on guided learning paths, chapter-wise material, mentor support, and
                confidence-building practice so every learner can move from basics to employable digital skills.
              </p>
              <div className="d-grid gap-3">
                {[
                  "Live and recorded concept classes",
                  "Chapter-wise notes and assignments",
                  "Support for exam and certification",
                ].map((point) => (
                  <div key={point} className="d-flex align-items-center gap-2 about-bullet">
                    <FiCheckCircle className="text-success" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-6">
              <div className="legacy-card about-highlight-box">
                <div className="legacy-card-body p-0">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1300&q=80"
                    alt="Students"
                    className="w-100"
                    style={{ borderRadius: 20, minHeight: 360, objectFit: "cover" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Review Section */}
      <section className="legacy-section">
        <div className="container" style={{ maxWidth: 900 }}>
          <div className="legacy-card shadow-lg p-5 text-center" style={{ borderRadius: 40, background: 'linear-gradient(135deg, #ffffff 0%, #f9f7ff 100%)', border: '1px solid #e9d5ff' }}>
             <h2 className="fw-bold mb-3">What&apos;s Your CEA Story?</h2>
             <p className="text-muted mb-5">Your feedback helps thousands of students across India start their digital journey.</p>
             
             <form onSubmit={handleReviewSubmit} className="mx-auto" style={{ maxWidth: 600 }}>
                <div className="mb-4 d-flex justify-content-center gap-3">
                   {[1,2,3,4,5].map(star => (
                     <FiStar 
                        key={star} 
                        size={32} 
                        style={{ cursor: 'pointer', color: star <= rating ? '#f59e0b' : '#cbd5e1', fill: star <= rating ? '#f59e0b' : 'none' }}
                        onClick={() => setRating(star)}
                     />
                   ))}
                </div>
                <textarea 
                  className="form-control mb-4 border-0 bg-white shadow-sm p-3" 
                  rows="3" 
                  style={{ borderRadius: 20, fontSize: '1.1rem' }}
                  placeholder="Tell us about your learning experience..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  required
                />
                <button type="submit" className="legacy-btn primary px-5 py-3" disabled={submitting}>
                   {submitting ? "Sharing..." : "Post My Review"}
                </button>
             </form>
          </div>
        </div>
      </section>

      <section className="legacy-section">
        <div className="container">
          <div className="legacy-head">
            <span className="legacy-pill light">Our Team</span>
            <h2>Our Mentors</h2>
            <p>Auto-scrolling mentor showcase with highlighted lead profiles, animated borders, and stronger visual focus.</p>
          </div>
          {stripRows(mentors, "mentor-row")}
        </div>
      </section>

      <section className="legacy-section soft">
        <div className="container">
          <div className="legacy-head">
            <span className="legacy-pill light">Chief Guests</span>
            <h2>Esteemed Guests and Academic Leaders</h2>
            <p>Larger guest cards with clearer roles and description lines so visitors can immediately understand each profile and position.</p>
          </div>
          {stripRows(chiefGuests, "guest-row")}
        </div>
      </section>

      <section className="legacy-section">
        <div className="container">
          <div className="legacy-head">
            <span className="legacy-pill light">Student Spotlight</span>
            <h2>Our Learners and Their Growth Journey</h2>
            <p>Student cards now keep images, names, batch identity, and progress notes clearly visible while maintaining smooth motion.</p>
          </div>
          {stripRows(students, "student-row", true)}
        </div>
      </section>

      <section className="legacy-section about-events">
        <div className="container">
          <div className="legacy-head">
            <span className="legacy-pill light">Our Events</span>
            <h2>Workshops, Seminars and Campus Activities</h2>
            <p>Event memories move automatically to keep the page lively, visual, and engaging without feeling cluttered.</p>
          </div>
          {stripRows(events, "event-row")}
        </div>
      </section>

      <section
        style={{
          background: "linear-gradient(135deg,#7b3ff2 0%,#f21f85 100%)",
          color: "#fff",
          textAlign: "center",
          padding: "60px 0",
        }}
      >
        <div className="container">
          <h2 style={{ fontFamily: "Playfair Display, serif" }} className="mb-3">
            Ready to Learn with Us?
          </h2>
          <p className="mb-4">Create your account and start learning with free resources.</p>
          <button className="legacy-btn ghost" onClick={() => navigate("/register")}>
            Register Now
          </button>
        </div>
      </section>

      <LegacyFooter />
    </div>
  );
};

export default AboutUs;
