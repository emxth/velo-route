import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMapPin, FiMessageSquare, FiSend } from "react-icons/fi";

export default function ComplaintsSection({ reduceMotion, hoverLift }) {
  const items = [
    {
      Icon: FiMapPin,
      title: "Auto location tagging",
      desc: "Attach your current location to help teams respond faster.",
    },
    {
      Icon: FiMessageSquare,
      title: "Feedback that matters",
      desc: "Submit service feedback, report delays, or suggest improvements.",
    },
    {
      Icon: FiSend,
      title: "Trackable workflow",
      desc: "Your complaint can be reviewed and actioned by the right department.",
    },
  ];

  return (
    <section className="landing-section" id="complaints">
      <div className="container">
        <div className="complaints-head">
          <div className="section-head" style={{ marginBottom: 0 }}>
            <h2>Complaints & Feedback</h2>
            <p>
              Report issues instantly with your current location, so the right team can
              take action quickly.
            </p>
          </div>

          <div className="complaints-actions">
            <Link className="btn btn-primary btn-glow" to="/complaints">
              Go to Complaints
            </Link>
            <Link className="btn btn-outline" to="/complaints">
              Add Feedback
            </Link>
          </div>
        </div>

        <div className="complaints-grid">
          {items.map(({ Icon, title, desc }, idx) => (
            <motion.div
              key={title}
              className="complaint-card card"
              initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                duration: reduceMotion ? 0 : 0.45,
                delay: reduceMotion ? 0 : idx * 0.05,
              }}
              whileHover={hoverLift}
            >
              <div className="complaint-icon" aria-hidden="true">
                <Icon />
              </div>
              <div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="complaints-note">
          Tip: turn on device location when submitting a complaint for accurate geo-tagging.
        </div>
      </div>
    </section>
  );
}