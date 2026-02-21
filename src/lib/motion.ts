import { Easing } from "framer-motion";

export const EASE: Easing = [0.22, 1, 0.36, 1]; // Custom easing curve (Apple-like)

export const DURATION = {
  FAST: 0.3,
  MEDIUM: 0.5,
  SLOW: 0.8,
};

export const VARIANTS = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: DURATION.MEDIUM, ease: EASE } },
  },
  fadeUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: DURATION.MEDIUM, ease: EASE } },
  },
  fadeDown: {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: DURATION.MEDIUM, ease: EASE } },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: DURATION.FAST, ease: EASE } },
  },
  staggerContainer: {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
};
