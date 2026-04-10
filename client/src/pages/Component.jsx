import React from "react";
import { useNavigate } from "react-router-dom";
import MainNavbar from "../components/navigation/MainNavbar";
import LegacyFooter from "../components/layout/LegacyFooter";
import { FiHome, FiBookOpen } from "react-icons/fi";

const Component = () => {
  const navigate = useNavigate();

  return (
    <div className="legacy-page">
      <MainNavbar />
      
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "calc(100vh - 70px)", padding: "40px 18px" }}>
        <div className="legacy-card text-center" style={{ width: "100%", maxWidth: "560px", padding: "48px 32px" }}>
          <div style={{ fontSize: "74px", fontWeight: "900", color: "#e8e4f5", lineHeight: 1, marginBottom: 8, fontFamily: "'Playfair Display', serif" }}>
            404
          </div>

          <h2 className="fw-bold" style={{ color: "var(--legacy-text)", marginBottom: 12 }}>
            Page not found
          </h2>

          <p className="legacy-mini mb-4" style={{ fontSize: "1.05rem" }}>
            Jo page aap open karna chah rahe hain wo available nahi hai.<br />
            Kripya home page ya courses page par wapas jaayen.
          </p>

          <div className="d-flex gap-3 justify-content-center flex-wrap mt-4">
            <button
              className="legacy-btn primary d-flex align-items-center gap-2"
              onClick={() => navigate("/")}
            >
              <FiHome /> Go to Home
            </button>

            <button
              className="legacy-btn d-flex align-items-center gap-2"
              onClick={() => navigate("/courses")}
              style={{ border: "1px solid var(--legacy-border)", background: "#fff", color: "var(--legacy-text)" }}
            >
              <FiBookOpen /> Explore Courses
            </button>
          </div>
        </div>
      </div>
      
      <LegacyFooter />
    </div>
  );
};

export default Component;
