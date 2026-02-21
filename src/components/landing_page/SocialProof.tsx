"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import Image from "next/image";

// Placeholder avatars - using colored divs if actual images not available, or standard avatars
const testimonials = [
  {
    quote: "I saved $300 on textbooks this semester just by exchanging with seniors.",
    author: "Sarah J.",
    role: "Computer Science, Year 2",
    color: "bg-pink-500",
  },
  {
    quote: "Finally a safe way to lend my camera gear. The trust score system is genius.",
    author: "Marcus T.",
    role: "Photography Club President",
    color: "bg-blue-500",
  },
  {
    quote: "Needed a graphing calculator for one exam. Got it in 15 mins. Lifesaver.",
    author: "Emily R.",
    role: "Engineering, Year 1",
    color: "bg-purple-500",
  },
];

export function SocialProof() {
  return (
    <section className="py-32 px-4 bg-zinc-950">
      <div className="max-w-6xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold text-center mb-20"
        >
          Don't just take our word for it.
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="p-8 rounded-2xl bg-white/5 border border-white/5 relative group hover:bg-white/10 transition-colors"
            >
              <Quote className="absolute top-8 right-8 w-8 h-8 text-white/10 group-hover:text-blue-500/20 transition-colors" />
              
              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                "{t.quote}"
              </p>
              
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white font-bold text-sm`}>
                  {t.author[0]}
                </div>
                <div>
                  <p className="font-bold text-white">{t.author}</p>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
