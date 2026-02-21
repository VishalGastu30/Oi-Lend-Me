"use client";

import Link from "next/link";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { FadeIn, FadeUp, ScaleIn, StaggerContainer } from "@/components/ui/motion";
import { Logo } from "@/components/ui/Logo";

interface HeroSectionProps {
  userCount?: number;
  sampleUsers?: { avatarUrl: string | null }[];
}

export function HeroSection({ userCount = 500, sampleUsers = [] }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 10]);
  const rotate2 = useTransform(scrollYProgress, [0, 1], [0, -10]);

  const handleAuthNavigation = async (path: string) => {
    // Clear any existing auth token to ensure fresh login/signup
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      // Ignore errors, just proceed to auth page
    }
    router.push(path);
  };

  return (
    <div ref={containerRef} className="relative flex flex-col w-full bg-[#f6f7f8] dark:bg-[#0B0F1A] overflow-hidden font-sans text-slate-900 dark:text-white">
      
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
            animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3], 
                rotate: [0, 45, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-blue-500/10 blur-[120px]" 
        />
        <motion.div 
            animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2],
                x: [0, 100, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[10%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-indigo-500/10 blur-[100px]" 
        />
      </div>

      {/* Navigation (Sticky Glass) */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-white/5 px-6 py-4 md:px-12 sticky top-0 z-50 bg-[#0B0F1A]/70 backdrop-blur-xl transition-all duration-300">
        <div className="flex items-center gap-3 group cursor-pointer">
          <Logo width={56} height={56} className="transition-transform group-hover:scale-110 duration-300" />
          <h2 className="text-xl font-bold tracking-tight text-white/90 group-hover:text-white transition-colors">Oi! Lend Me</h2>
        </div>
        <div className="hidden md:flex flex-1 justify-end gap-8 items-center">
          <div className="flex items-center gap-6">
            {[
              { name: "Start Saving", href: "#why-borrow" },
              { name: "The Problem", href: "#the-problem" },
              { name: "What You Get", href: "#what-you-get" },
              { name: "Students Love Us", href: "#students-love-us" },
              { name: "How It Works", href: "#how-it-works" },
              { name: "Get Started", href: "#get-started" },
              { name: "About", href: "#about" },
            ].map((item) => (
                <Link key={item.name} className="text-sm font-medium text-slate-400 hover:text-[#4F9DFF] transition-colors relative group" href={item.href}>
                    {item.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#4F9DFF] group-hover:w-full transition-all duration-300"></span>
                </Link>
            ))}
            <button onClick={() => handleAuthNavigation('/auth/login')} className="px-5 py-2 rounded-full border border-slate-700/50 text-slate-400 text-sm font-medium hover:text-white hover:border-white/50 hover:bg-white/5 transition-all duration-300">Log In</button>
          </div>
          <button onClick={() => handleAuthNavigation('/auth/signup')} className="relative group overflow-hidden rounded-full h-10 px-6 bg-[#4F9DFF] text-white text-sm font-bold shadow-[0_0_20px_rgba(79,157,255,0.3)] hover:shadow-[0_0_30px_rgba(79,157,255,0.5)] transition-all duration-300 transform hover:scale-105">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="relative">Borrow Smarter</span>
          </button>
        </div>
      </header>

      {/* Hero Content */}
      <main className="flex h-full grow flex-col justify-center relative z-10 py-10 md:py-20">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-10 lg:px-20">
              <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
                
                {/* Left Content */}
                <div className="flex flex-col gap-8 lg:w-1/2 text-center lg:text-left z-20">
                    <FadeUp delay={0.1}>
                         <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#4F9DFF] text-xs font-bold tracking-widest uppercase mb-4 shadow-[0_0_10px_rgba(79,157,255,0.2)]">
                            Campus Sharing Reimagined
                        </span>
                        <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tighter text-white">
                        Stop Buying.<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4F9DFF] to-indigo-400 animate-gradient">Start Borrowing.</span>
                        </h1>
                    </FadeUp>
                    
                    <FadeUp delay={0.2} className="max-w-xl mx-auto lg:mx-0">
                        <p className="text-slate-400 text-lg md:text-xl leading-relaxed">
                        The premium item-lending platform for your campus community. 
                        Secure, playful, and built on <span className="text-white font-medium">trust</span>.
                        </p>
                    </FadeUp>

                    <FadeUp delay={0.3} className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start pt-4">
                        <button onClick={() => handleAuthNavigation('/auth/signup')} className="relative group overflow-hidden rounded-full h-14 px-8 bg-[#4F9DFF] text-white text-lg font-bold shadow-[0_0_25px_rgba(79,157,255,0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(79,157,255,0.6)]">
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                            <span className="relative flex items-center gap-2">
                                Borrow Smarter <span className="text-xl">→</span>
                            </span>
                        </button>
                         <div className="flex -space-x-3">
                             {sampleUsers.length > 0 ? sampleUsers.map((u, i) => (
                                 <div key={i} className={`size-10 rounded-full border-2 border-[#0B0F1A] bg-gray-700 bg-cover bg-center`} style={{backgroundImage: `url(${u.avatarUrl})`}} />
                             )) : [1,2,3].map((i) => (
                                 <div key={i} className={`size-10 rounded-full border-2 border-[#0B0F1A] bg-gray-700 bg-cover bg-center`} style={{backgroundImage: `url(https://i.pravatar.cc/100?img=${i + 10})`}} />
                             ))}
                             <div className="flex size-10 items-center justify-center rounded-full border-2 border-[#0B0F1A] bg-[#1E2330] text-xs font-bold text-white">
                                 {userCount}+
                             </div>
                         </div>
                    </FadeUp>
                </div>

                {/* Right Visual (Parallax) */}
                <div className="lg:w-1/2 relative w-full aspect-square max-w-[600px] lg:max-w-none">
                     <div className="relative w-full h-full">
                         {/* Main Image */}
                         <FadeIn delay={0.4} className="relative z-10 w-[90%] mx-auto lg:w-full h-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 group">
                             <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A] via-transparent to-transparent opacity-60 z-10" />
                             <div className="w-full h-full bg-cover bg-center transform transition-transform duration-[2s] group-hover:scale-105" 
                                  style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDEzElHMHCqBZkPNarBYzUgkDzRv27QWEHW2TM67NnNIwV61MYjLbakLO2ULvy3LE5mIm9Wb5CTLzBJ4IuBc2jFCMlEkwazJD63fYe6RnAYtxF-F_-LifZyJDAiZ-COPLbm8dAzaSLAcQDL-X7PTtUbhGeHjqDHXastncmkDmKiXok9Ge_eyUiz-7zekczReJB42mwoHnvtmIj1v0W0Qf97A3AmtO1TULMsFBmgAkxeoRiwn8bE3UkiXeiJs3VvI7VYKL-Frmdd6ZUD")'}} 
                             />
                         </FadeIn>

                         {/* Parallax Floating Cards */}
                         <motion.div style={{ y: y1, rotate: rotate1 }} className="absolute -left-4 top-[20%] z-20 hidden md:block">
                             <div className="glass-card p-4 rounded-xl flex items-center gap-3 backdrop-blur-xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                                 <div className="bg-[#4F9DFF]/20 p-2 rounded-lg text-[#4F9DFF]">
                                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                                 </div>
                                 <div>
                                     <p className="text-white text-sm font-bold">Sony A7III</p>
                                     <p className="text-green-400 text-xs font-medium">Available now</p>
                                 </div>
                             </div>
                         </motion.div>

                         <motion.div style={{ y: y2, rotate: rotate2 }} className="absolute -right-8 bottom-[15%] z-20 hidden md:block">
                             <div className="glass-card p-4 rounded-xl flex items-center gap-3 backdrop-blur-xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                                 <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400">
                                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
                                 </div>
                                 <div className="flex flex-col">
                                     <p className="text-white text-sm font-bold">QC 45 Headphones</p>
                                     <div className="flex items-center gap-2">
                                         <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                                         <p className="text-slate-400 text-xs font-medium">Lent by Sarah</p>
                                     </div>
                                 </div>
                             </div>
                         </motion.div>
                     </div>
                </div>
              </div>
        </div>
      </main>
    </div>
  );
}
