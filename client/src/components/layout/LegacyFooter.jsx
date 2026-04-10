import React from "react";
import { Link } from "react-router-dom";

const LegacyFooter = () => {
  return (
    <footer className="legacy-footer">
      <div className="container">
        <div className="row g-3">
          <div className="col-lg-4 col-md-6">
            <div className="brand">
              <img src="/cea-logo.png" alt="CEA" />
              <div>
                <div className="fw-bold">Computer Excellence Academy</div>
                <div className="small opacity-75">Digital Learning Platform</div>
              </div>
            </div>
            <p className="small mb-0">
              Join thousands of learners growing with free computer education, notes,
              and guided support.
            </p>
          </div>
          <div className="col-lg-2 col-md-6" style={{ marginRight: "-1rem", marginLeft: "1rem" }}>
            <div className="fw-bold mb-2 text-nowrap">Quick Links</div>
            <div className="d-grid gap-1 small">
              <Link to="/">Home</Link>
              <Link to="/courses">Courses</Link>
              <Link to="/notes">PDF Notes</Link>
              <Link to="/aboutus">About Us</Link>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="fw-bold mb-2 text-nowrap">Support</div>
            <div className="d-grid gap-1 small">
              <Link to="/support">Help Center</Link>
              <a href="mailto:computerexcellenceacademy@gmail.com" style={{ wordBreak: 'break-word' }}>computerexcellenceacademy@gmail.com</a>
              <a href="tel:+919369050651">+91 9369050651</a>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="fw-bold mb-2 text-nowrap">Address</div>
            <p className="small mb-0" style={{ lineHeight: 1.5 }}>
              Vedpur, Shukulpur Bazar, Ramjanki Marg,<br/>
              Basti, Uttar Pradesh, India - 272131
            </p>
          </div>
        </div>
        <div className="legacy-footer-bottom">
          (c) {new Date().getFullYear()} Computer Excellence Academy. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default LegacyFooter;
