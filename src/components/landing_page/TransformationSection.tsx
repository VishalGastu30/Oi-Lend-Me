"use client";

import { motion } from "framer-motion";

const steps = [
  {
    step: "01",
    title: "Request",
    desc: "Post what you need or find items listed nearby.",
  },
  {
    step: "02",
    title: "Connect",
    desc: "Chat securely and agree on a meeting spot.",
  },
  {
    step: "03",
    title: "Exchange",
    desc: "Scan the QR code to verify the handoff.",
  },
  {
    step: "04",
    title: "Return",
    desc: "Hand it back and build your reputation score.",
  },
];

export function TransformationSection() {
  return (
    <section className="py-32 px-4 relative overflow-hidden">
      {/* Background Line */}
      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -translate-y-1/2 hidden md:block" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="relative bg-background md:bg-transparent pt-8 md:pt-0"
            >
               {/* Dot on line */}
               <div className="hidden md:block absolute top-[50%] left-0 w-3 h-3 -translate-y-[50%] -translate-x-1/2 bg-blue-500 rounded-full border-4 border-black box-content" />
               
              <p className="text-6xl font-black text-white/5 mb-4 select-none">{s.step}</p>
              <h3 className="text-xl font-bold mb-2 text-white">{s.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
