import { useReducedMotion } from "framer-motion";

import LandingNav from "../components/landing/LandingNav";
import HeroSection from "../components/landing/HeroSection";
import HowItWorksSection from "../components/landing/HowItWorksSection";
import RolesSection from "../components/landing/RolesSection";
import FaqSection from "../components/landing/FaqSection";
import LandingFooter from "../components/landing/LandingFooter";
import ComplaintsSection from "../components/landing/ComplaintsSection";

function Landing() {
  const reduceMotion = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 16 },
    show: { opacity: 1, y: 0, transition: { duration: reduceMotion ? 0 : 0.6 } },
  };

  const stagger = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduceMotion ? 0 : 0.08, delayChildren: 0.08 },
    },
  };

  const hoverLift = reduceMotion
    ? {}
    : { y: -4, boxShadow: "0 14px 30px rgba(44,62,80,0.16)" };

  return (
    <div className="landing">
      <LandingNav />

      <HeroSection
        reduceMotion={reduceMotion}
        fadeUp={fadeUp}
        stagger={stagger}
        hoverLift={hoverLift}
      />

      <HowItWorksSection reduceMotion={reduceMotion} hoverLift={hoverLift} />
      <RolesSection reduceMotion={reduceMotion} hoverLift={hoverLift} />
      <ComplaintsSection reduceMotion={reduceMotion} hoverLift={hoverLift} />
      <FaqSection reduceMotion={reduceMotion} />
      <LandingFooter />
    </div>
  );
}

export default Landing;