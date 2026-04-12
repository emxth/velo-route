import React from "react";
import { Link } from "react-router-dom";

export default function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="container footer-inner">
        <div>
          <div className="footer-brand">
            <span className="brand-dot" aria-hidden="true" />
            <strong>VeloRoute</strong>
          </div>
          <p className="footer-text">
            Smart rural transportation for bookings, operations, and service feedback.
          </p>
        </div>

        <div className="footer-links" aria-label="Footer">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#roles">Roles</a>
          <a href="#faq">FAQ</a>
        </div>

        <div className="footer-cta">
          <Link className="btn btn-primary" to="/register">Get started</Link>
          <span className="footer-mini">Built by Rangers</span>
        </div>
      </div>
    </footer>
  );
}