import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function HeroSection({ reduceMotion, fadeUp, stagger, hoverLift }) {
  return (
    <section className="landing-hero" id="features">
      <div className="landing-bg" aria-hidden="true" />
      <div className="container landing-grid">
        <motion.div
          className="landing-content"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.span className="badge badge-success landing-pill" variants={fadeUp}>
            Industry, Innovation & Infrastructure
          </motion.span>

          <motion.h1 variants={fadeUp}>
            VeloRoute — Smart Rural Transportation System
          </motion.h1>

          <motion.p className="landing-subtitle" variants={fadeUp}>
            A platform that makes rural transport smarter and more efficient. Book buses
            and trains, submit complaints with geolocation, track routes and schedules,
            and streamline operations across departments.
          </motion.p>

          <motion.div className="landing-actions" variants={fadeUp}>
            <Link className="btn btn-primary" to="/login">Get Started</Link>
            <Link className="btn btn-outline" to="/register">Create Account</Link>
          </motion.div>

          <motion.div className="landing-meta" variants={fadeUp}>
            <div className="landing-metric">
              <span className="metric-value">Secure</span>
              <span className="metric-label">Role-based access</span>
            </div>
            <div className="landing-metric">
              <span className="metric-value">Live</span>
              <span className="metric-label">Routes & schedules</span>
            </div>
            <div className="landing-metric">
              <span className="metric-value">Smart</span>
              <span className="metric-label">Geo-tagged feedback</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="landing-panel card"
          initial={{ opacity: 0, y: reduceMotion ? 0 : 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.7, ease: "easeOut" }}
        >
          <div className="panel-header">
            <div>
              <h3>What you can do</h3>
              <p>Citizens, operators & admins in one unified system.</p>
            </div>
          </div>

          <div className="panel-grid">
            {[
              { icon: "🚌", title: "Bookings", desc: "Reserve bus or train seats in seconds." },
              { icon: "📍", title: "Complaints & Feedback", desc: "Geo-tag issues and improve services faster." },
              { icon: "🛠️", title: "Admin Control", desc: "Manage vehicles, departments, users and payments." },
              { icon: "📈", title: "Operational Insights", desc: "Monitor routes, schedules, and service quality." },
            ].map((f) => (
              <motion.div
                key={f.title}
                className="panel-item"
                whileHover={hoverLift}
                transition={{ duration: 0.18 }}
              >
                <span className="panel-icon" aria-hidden="true">{f.icon}</span>
                <div>
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="panel-footer">
            <span className="badge badge-warning">Secure Payments</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}