"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, Globe } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 pt-20 pb-20">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] -z-10 opacity-40 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] -z-10 opacity-20 pointer-events-none" />

      {/* Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-6"
      >
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-wider uppercase">
          Campus Exclusive
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
        className="text-5xl md:text-7xl lg:text-8xl font-black text-center tracking-tight mb-8 max-w-5xl leading-[1.1]"
      >
        <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-500">
          Everything you need.
        </span>
        <br />
        <span className="text-gray-500">Nothing you don't.</span>
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="text-lg md:text-2xl text-gray-400 text-center max-w-2xl mb-12 leading-relaxed"
      >
        The premium marketplace for students. Borrow, lend, and exchange high-quality gear instantly. Secure. Verified. Exclusive.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        className="flex flex-col sm:flex-row items-center gap-4 mb-16"
      >
        <Link href="/auth/signup">
          <Button className="h-14 px-8 text-lg rounded-full bg-white text-black hover:bg-gray-200 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
            Start Free
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
        <Link href="/auth/login">
          <Button variant="ghost" className="h-14 px-8 text-lg rounded-full text-gray-400 hover:text-white hover:bg-white/5">
            Log In
          </Button>
        </Link>
      </motion.div>

      {/* Trust Signals */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="flex flex-wrap justify-center gap-8 md:gap-16 text-gray-500"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-500" />
          <span className="text-sm font-medium">Verified Students</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          <span className="text-sm font-medium">Instant Exchange</span>
        </div>
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-purple-500" />
          <span className="text-sm font-medium">Zero Fees</span>
        </div>
      </motion.div>
      
      {/* Scroll Indicator */}
       <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-gray-500 to-transparent opacity-30" />
      </motion.div>
    </section>
  );
}
