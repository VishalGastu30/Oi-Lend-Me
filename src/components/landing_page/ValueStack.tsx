"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const features = [
  { name: "Unlimited Listings", value: "$15/mo" },
  { name: "Verified ID Badge", value: "$5/mo" },
  { name: "Priority Support", value: "$9/mo" },
  { name: "Zero Transaction Fees", value: "Priceless" },
];

export function ValueStack() {
  return (
    <section className="py-32 px-4 bg-black">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 bg-white/5 p-8 md:p-12 rounded-3xl border border-white/10 relative overflow-hidden">
          {/* Decorative Gradient */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="w-full md:w-1/2 space-y-6">
            <h2 className="text-3xl font-bold mb-8">What you get</h2>
            <div className="space-y-4">
              {features.map((feat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1 rounded bg-blue-500/20 text-blue-400">
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-gray-200">{feat.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{feat.value}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="w-full md:w-5/12 text-center md:text-right">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <p className="text-gray-400 text-lg mb-2">Total Value</p>
              <p className="text-4xl font-bold text-gray-500 line-through decoration-red-500/50 decoration-2 mb-6">
                $29/mo
              </p>
              
              <div className="inline-block p-1 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600">
                 <div className="bg-black rounded-xl px-8 py-6">
                    <p className="text-gray-400 text-sm mb-1 uppercase tracking-wider">Student Price</p>
                    <p className="text-5xl font-black text-white tracking-tight">$0</p>
                    <p className="text-gray-500 text-xs mt-2">Forever free.</p>
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
