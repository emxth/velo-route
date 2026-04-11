import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function RolesSection({ reduceMotion, hoverLift }) {
  const roles = [
    { title: "Citizen", tag: "Book & report", desc: "Search schedules, reserve seats, submit feedback." },
    { title: "Admin", tag: "Control & security", desc: "User roles, departments, payments, governance." },
    { title: "Driver", tag: "On-route clarity", desc: "Simplified view for day-to-day route execution." },
  ];

  return (
    <section className="landing-section landing-section-alt" id="roles">
      <div className="container">
        <div className="section-head">
          <h2>Built for every role</h2>
          <p>One platform, different dashboards, clear responsibilities.</p>
        </div>

        <div className="roles-grid">
          {roles.map((r, idx) => (
            <motion.div
              key={r.title}
              className="role-card card"
              initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : idx * 0.04 }}
              whileHover={hoverLift}
            >
              <div className="role-top">
                <h3>{r.title}</h3>
                <span className="badge badge-success">{r.tag}</span>
              </div>
              <p>{r.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="cta-strip card">
          <div>
            <h3>Start using VeloRoute today</h3>
            <p>Create an account and explore the dashboard for your role.</p>
          </div>
          <div className="cta-actions">
            <Link className="btn btn-primary" to="/register">Create Account</Link>
            <Link className="btn btn-outline" to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </section>
  );
}