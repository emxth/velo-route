import React from "react";
import { motion } from "framer-motion";

export default function FaqSection({ reduceMotion }) {
  const faqs = [
    { q: "Is this secure for different departments?", a: "Yes — role-based access keeps citizen, operator, and admin features separated." },
    { q: "How do complaints work?", a: "Users can submit complaints/feedback and attach location details for faster action." },
    { q: "Can I reset my password?", a: "Yes — OTP password reset is supported in the authentication flow." },
    { q: "Does it support payments?", a: "Your landing already highlights secure payments; this section builds user confidence." },
  ];

  return (
    <section className="landing-section" id="faq">
      <div className="container">
        <div className="section-head">
          <h2>FAQ</h2>
          <p>Answers to the most common questions.</p>
        </div>

        <div className="faq-grid">
          {faqs.map((item, idx) => (
            <motion.details
              key={item.q}
              className="faq-item card"
              initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: reduceMotion ? 0 : 0.4, delay: reduceMotion ? 0 : idx * 0.03 }}
            >
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </motion.details>
          ))}
        </div>
      </div>
    </section>
  );
}