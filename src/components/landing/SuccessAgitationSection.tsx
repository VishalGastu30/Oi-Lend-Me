"use client";

import { FadeIn, FadeUp, StaggerContainer } from "@/components/ui/motion";

export function SuccessAgitationSection() {
  return (
    <>
      {/* Section 2: Success Message */}
      <section id="why-borrow" className="relative flex flex-col justify-center items-center py-32 bg-white dark:bg-[#050a10] border-b border-slate-200 dark:border-slate-800 font-sans">
        <div className="flex flex-col max-w-[960px] w-full gap-10 px-4 sm:px-10">
          <FadeUp className="flex flex-col gap-6 text-center items-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 text-green-500 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-slate-900 dark:text-white tracking-tight text-4xl md:text-5xl font-black leading-tight">
                You’re In!
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg font-normal leading-normal max-w-[600px] mx-auto">
                Welcome to the Oi! Lend Me community. You are now ready to start sharing and saving on campus.
              </p>
            </div>
          </FadeUp>

          {/* Success Cards */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            <FadeUp className="group flex flex-col gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#1b2127]/50 p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:border-[#4F9DFF]/30 hover:bg-white dark:hover:bg-[#1b2127]">
              <div className="w-12 h-12 rounded-xl bg-[#4F9DFF]/10 flex items-center justify-center text-[#4F9DFF] group-hover:scale-110 transition-transform duration-300">
                 <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight group-hover:text-[#4F9DFF] transition-colors">Instant access</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-relaxed">
                  Start borrowing and lending immediately with your new account.
                </p>
              </div>
            </FadeUp>

            <FadeUp className="group flex flex-col gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#1b2127]/50 p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:border-[#4F9DFF]/30 hover:bg-white dark:hover:bg-[#1b2127]">
              <div className="w-12 h-12 rounded-xl bg-[#4F9DFF]/10 flex items-center justify-center text-[#4F9DFF] group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight group-hover:text-[#4F9DFF] transition-colors">Verified profile</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-relaxed">
                  Your student status is confirmed for safety and trust within the network.
                </p>
              </div>
            </FadeUp>

            <FadeUp className="group flex flex-col gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#1b2127]/50 p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:border-[#4F9DFF]/30 hover:bg-white dark:hover:bg-[#1b2127]">
              <div className="w-12 h-12 rounded-xl bg-[#4F9DFF]/10 flex items-center justify-center text-[#4F9DFF] group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight group-hover:text-[#4F9DFF] transition-colors">Community perks</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-relaxed">
                  Unlock exclusive deals, campus event tickets, and local discounts.
                </p>
              </div>
            </FadeUp>
          </StaggerContainer>
        </div>
      </section>

      {/* Section 3: The Problem (Agitate) */}
      <section id="the-problem" className="relative flex flex-col justify-center items-center py-32 px-4 sm:px-10 bg-slate-50 dark:bg-[#0b1016] font-sans">
        <div className="flex flex-col max-w-[960px] w-full gap-12">
          {/* Headline */}
          <FadeUp className="flex flex-col items-center text-center gap-4">
            <div className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-500">
                The Struggle is Real
            </div>
            <h2 className="text-slate-900 dark:text-white tracking-tight text-3xl md:text-4xl font-bold leading-tight max-w-[720px]">
                The Problem with Campus Living
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base max-w-[600px]">
                College life is hard enough without the extra stress of managing stuff you barely use.
            </p>
          </FadeUp>

          {/* Problem Cards Grid */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {/* Card 1 */}
            <FadeUp className="group relative flex flex-col overflow-hidden rounded-xl bg-white dark:bg-[#161c24] border border-slate-200 dark:border-slate-800 transition-all hover:border-red-500/50 hover:shadow-lg dark:hover:shadow-red-900/10">
              <div className="h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                <div className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600")'}}></div>
                <div className="absolute bottom-4 left-4 z-20">
                   <svg xmlns="http://www.w3.org/2000/svg" className="text-white w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-slate-900 dark:text-white text-xl font-bold mb-2">Buying is expensive</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    Textbooks, gear, and appliances drain your wallet. Why spend hundreds on things you'll use for one semester?
                </p>
              </div>
            </FadeUp>
            
             {/* Card 2 */}
            <FadeUp className="group relative flex flex-col overflow-hidden rounded-xl bg-white dark:bg-[#161c24] border border-slate-200 dark:border-slate-800 transition-all hover:border-red-500/50 hover:shadow-lg dark:hover:shadow-red-900/10">
              <div className="h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                <div className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1596265330376-745a33116a44?auto=format&fit=crop&q=80&w=600")'}}></div>
                <div className="absolute bottom-4 left-4 z-20">
                   <svg xmlns="http://www.w3.org/2000/svg" className="text-white w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" x2="16.5" y1="9.4" y2="9.4"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" x2="12" y1="22.08" y2="12"/></svg>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-slate-900 dark:text-white text-xl font-bold mb-2">Storage is a nightmare</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    Dorm rooms are tiny; clutter makes them smaller. Finding space for a vacuum or a projector is nearly impossible.
                </p>
              </div>
            </FadeUp>

             {/* Card 3 */}
            <FadeUp className="group relative flex flex-col overflow-hidden rounded-xl bg-white dark:bg-[#161c24] border border-slate-200 dark:border-slate-800 transition-all hover:border-red-500/50 hover:shadow-lg dark:hover:shadow-red-900/10">
              <div className="h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                <div className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1611288870280-4a39556b3c16?auto=format&fit=crop&q=80&w=600")'}}></div>
                <div className="absolute bottom-4 left-4 z-20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="text-white w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-slate-900 dark:text-white text-xl font-bold mb-2">Wasteful habits</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    Buying things you only use once hurts the planet. Single-use culture creates unnecessary landfill waste.
                </p>
              </div>
            </FadeUp>
          </StaggerContainer>

          {/* Personal Transition */}
          <FadeIn className="mt-8 flex justify-center">
            <p className="text-slate-800 dark:text-slate-200 text-xl md:text-2xl font-medium leading-normal text-center bg-slate-200 dark:bg-slate-800 px-8 py-4 rounded-full">
                But... <span className="text-[#4F9DFF] font-bold">there is a better way to live.</span>
            </p>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
