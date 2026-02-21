"use client";

import { motion } from "framer-motion";

const problems = [
  {
    title: "Expensive Textbooks",
    desc: "Why pay $200 for a book you'll use once?",
  },
  {
    title: "Wasted Gear",
    desc: "Your calculator collects dust while others need it.",
  },
  {
    title: "Stranger Danger",
    desc: "Facebook Marketplace is sketchy. Campus should differ.",
  },
];

export function ProblemSection() {
  return (
    <section className="py-32 px-4 bg-gradient-to-b from-black to-red-950/10">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-sm font-bold text-red-500 uppercase tracking-widest mb-16 text-center"
        >
          The Problem
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {problems.map((prob, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-red-500/30 transition-colors group"
            >
              <h3 className="text-xl font-bold mb-4 text-gray-200 group-hover:text-red-400 transition-colors">
                {prob.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {prob.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-20 text-center"
        >
          <p className="text-2xl md:text-3xl font-medium text-gray-400">
            There has to be a <span className="text-white">smarter way</span> to share.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
