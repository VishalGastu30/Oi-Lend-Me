"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { VARIANTS } from "@/lib/motion";
import { cn } from "@/lib/utils";

type MotionProps = HTMLMotionProps<"div"> & {
  className?: string;
  delay?: number;
};

export function FadeIn({ children, className, delay = 0, ...props }: MotionProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={VARIANTS.fadeIn}
      transition={{ delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function FadeUp({ children, className, delay = 0, ...props }: MotionProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={VARIANTS.fadeUp}
      transition={{ delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({ children, className, ...props }: MotionProps) {
    return (
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={VARIANTS.staggerContainer}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
}

export function ScaleIn({ children, className, delay = 0, ...props }: MotionProps) {
    return (
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={VARIANTS.scaleIn}
        transition={{ delay }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
