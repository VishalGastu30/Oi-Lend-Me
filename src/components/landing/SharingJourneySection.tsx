"use client";

import { FadeIn, FadeUp, ScaleIn, StaggerContainer } from "@/components/ui/motion";

export function SharingJourneySection() {
  return (
    <section id="how-it-works" className="bg-white dark:bg-[#050a10] font-sans antialiased overflow-x-hidden py-32">
      <div className="container mx-auto mb-12 text-center px-4 sm:px-6 lg:px-8">
        <FadeUp>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
                Your Journey to <span className="text-[#4F9DFF]">Clutter-Free Living</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Transform your campus life from overloaded to optimized in four simple stages.
            </p>
        </FadeUp>
      </div>

      <div className="flex justify-center w-full">
        <StaggerContainer className="flex flex-col max-w-[800px] w-full px-4 sm:px-6 lg:px-8 relative">
            
            {/* Connecting Line (Vertical) */}
            <div className="absolute left-[34px] sm:left-[42px] top-8 bottom-24 w-0.5 bg-gradient-to-b from-[#4F9DFF] via-gray-200 dark:via-gray-800 to-transparent hidden sm:block"></div>

            {/* Stage 1 */}
            <FadeUp className="grid grid-cols-[60px_1fr] gap-x-6 group hover:bg-slate-50 dark:hover:bg-white/5 p-6 rounded-2xl transition-all duration-300 relative z-10">
                <div className="flex flex-col items-center gap-2 pt-1 relative">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#4F9DFF] text-white shadow-[0_0_20px_rgba(77,157,255,0.4)] z-10 scale-110">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
                    </div>
                </div>
                <div className="flex flex-1 flex-col justify-center">
                    <div className="flex items-center gap-3 mb-1">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#4F9DFF]/10 text-[#4F9DFF] uppercase tracking-wider">Stage 1</span>
                    </div>
                    <h3 className="text-gray-900 dark:text-white text-xl font-bold leading-tight mb-2 group-hover:text-[#4F9DFF] transition-colors">Quick Win</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-base font-medium leading-relaxed">
                        Sign up and find your first item instantly. No waiting, no hassle—just borrow what you need right now.
                    </p>
                </div>
            </FadeUp>

            {/* Stage 2 */}
            <FadeUp className="grid grid-cols-[60px_1fr] gap-x-6 group hover:bg-slate-50 dark:hover:bg-white/5 p-6 rounded-2xl transition-all duration-300 relative z-10">
                <div className="flex flex-col items-center gap-2 pt-1 relative">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-[#0f1823] border-2 border-slate-200 dark:border-slate-700 z-10 group-hover:border-[#4F9DFF] group-hover:text-[#4F9DFF] transition-all duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                    </div>
                </div>
                <div className="flex flex-1 flex-col justify-center">
                    <div className="flex items-center gap-3 mb-1">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:bg-[#4F9DFF]/10 group-hover:text-[#4F9DFF] transition-colors">Stage 2</span>
                    </div>
                    <h3 className="text-gray-900 dark:text-white text-xl font-bold leading-tight mb-2 group-hover:text-[#4F9DFF] transition-colors">Compound</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-base font-medium leading-relaxed">
                        Build your borrow score with every successful transaction. Higher trust means more access.
                    </p>
                </div>
            </FadeUp>

            {/* Stage 3 */}
            <FadeUp className="grid grid-cols-[60px_1fr] gap-x-6 group hover:bg-slate-50 dark:hover:bg-white/5 p-6 rounded-2xl transition-all duration-300 relative z-10">
                <div className="flex flex-col items-center gap-2 pt-1 relative">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-[#0f1823] border-2 border-slate-200 dark:border-slate-700 z-10 group-hover:border-[#4F9DFF] group-hover:text-[#4F9DFF] transition-all duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                </div>
                <div className="flex flex-1 flex-col justify-center">
                    <div className="flex items-center gap-3 mb-1">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:bg-[#4F9DFF]/10 group-hover:text-[#4F9DFF] transition-colors">Stage 3</span>
                    </div>
                    <h3 className="text-gray-900 dark:text-white text-xl font-bold leading-tight mb-2 group-hover:text-[#4F9DFF] transition-colors">Advantage</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-base font-medium leading-relaxed">
                        Unlock high-value group gear. Access premium items usually reserved for trusted community members.
                    </p>
                </div>
            </FadeUp>

            {/* Stage 4 */}
            <FadeUp className="grid grid-cols-[60px_1fr] gap-x-6 group hover:bg-slate-50 dark:hover:bg-white/5 p-6 rounded-2xl transition-all duration-300 relative z-10">
                <div className="flex flex-col items-center gap-2 pt-1 relative">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-[#0f1823] border-2 border-slate-200 dark:border-slate-700 z-10 group-hover:border-[#4F9DFF] group-hover:text-[#4F9DFF] transition-all duration-300">
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 6-10 13L2 9z"/></svg>
                    </div>
                </div>
                <div className="flex flex-1 flex-col justify-center">
                    <div className="flex items-center gap-3 mb-1">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:bg-[#4F9DFF]/10 group-hover:text-[#4F9DFF] transition-colors">Stage 4</span>
                    </div>
                    <h3 className="text-gray-900 dark:text-white text-xl font-bold leading-tight mb-2 group-hover:text-[#4F9DFF] transition-colors">10x</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-base font-medium leading-relaxed">
                        Live a lifestyle without the clutter. Experience true freedom and abundance through sharing.
                    </p>
                </div>
            </FadeUp>

        </StaggerContainer>
      </div>

       {/* CTA Section */}
      <ScaleIn className="mt-12 flex justify-center">
        <button className="bg-[#4F9DFF] hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105 flex items-center gap-2">
            Start Your Journey
            <span className="text-[20px]">→</span>
        </button>
      </ScaleIn>
    </section>
  );
}
