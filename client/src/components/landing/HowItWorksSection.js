import React from "react";
import { motion } from "framer-motion";

export default function HowItWorksSection({ reduceMotion, hoverLift }) {
  const steps = [
    { step: "01", title: "Find a route", desc: "Browse routes and schedules with updated timings." },
    { step: "02", title: "Book instantly", desc: "Reserve seats quickly with a smooth checkout flow." },
    { step: "03", title: "Track & manage", desc: "Operators monitor schedules and service operations." },
    { step: "04", title: "Report issues", desc: "Send geo-tagged complaints to speed up resolution." },
  ];

  return (
    <section className="landing-section" id="how">
      <div className="container">
        <div className="section-head">
          <h2>How it works</h2>
          <p>Simple steps for citizens and clear tools for operators.</p>
        </div>

        <div className="steps-grid">
          {steps.map((s, idx) => (
            <motion.div
              key={s.step}
              className="step-card card"
              initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : idx * 0.05 }}
              whileHover={hoverLift}
            >
              <div className="step-top">
                <span className="step-pill">{s.step}</span>
                <h3>{s.title}</h3>
              </div>
              <p>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}