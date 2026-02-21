"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const deliverables = [
  "Verified campus identity",
  "Instant messaging",
  "Secure item tracking",
  "Community trust score",
];

export function SuccessSection() {
  return (
    <section className="py-24 px-4 border-t border-white/5 bg-black/20">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
           initial={{ scale: 0.8, opacity: 0 }}
           whileInView={{ scale: 1, opacity: 1 }}
           viewport={{ once: true }}
           transition={{ duration: 0.5 }}
           className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-8"
        >
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl md:text-4xl font-bold mb-12"
        >
          Everything is handled.
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {deliverables.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
              className="flex items-center p-4 rounded-xl bg-white/5 border border-white/5"
            >
              <div className="w-2 h-2 rounded-full bg-green-500 mr-4" />
              <span className="text-gray-300 font-medium">{item}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
