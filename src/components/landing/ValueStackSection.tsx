"use client";

import { FadeIn, FadeUp, ScaleIn, StaggerContainer } from "@/components/ui/motion";

export function ValueStackSection() {
  return (
    <section id="what-you-get" className="relative flex flex-col w-full bg-white dark:bg-[#050a10] font-sans text-slate-900 dark:text-white overflow-hidden py-32">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#4F9DFF]/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 flex flex-1 justify-center">
        <div className="flex flex-col max-w-[1200px] flex-1 gap-12 px-4 md:px-10 lg:px-40">
          
          <FadeUp className="flex flex-col items-center text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-[#4F9DFF] backdrop-blur-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span>Premium Membership Value</span>
            </div>
            <h2 className="text-white text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
                Built for Campuses. Free for Students.
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl">
                No subscriptions. No hidden costs. Just trust, accountability, and community.
            </p>
          </FadeUp>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tier 1 */}
            <FadeUp className="flex flex-col gap-6 rounded-2xl p-6 transition-all duration-300 group bg-white dark:bg-[#1b2431]/40 border border-slate-200 dark:border-white/5 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:border-[#4F9DFF]/30 backdrop-blur-sm">
                <div className="flex flex-col gap-2">
                    <h3 className="text-slate-900 dark:text-slate-200 text-lg font-bold leading-tight group-hover:text-[#4F9DFF] transition-colors">Tier 1: Campus Access</h3>
                </div>
                <div className="w-full h-px bg-slate-200 dark:bg-white/10 group-hover:bg-[#4F9DFF]/20 transition-colors"></div>
                <div className="flex flex-col gap-3">
                    {['Verified student-only network', 'Borrow & lend within college', 'No outsiders'].map((item) => (
                        <div key={item} className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-start gap-3">
                            <span className="text-[#4F9DFF]">✓</span>
                            <span>{item}</span>
                        </div>
                    ))}
                </div>
            </FadeUp>

            {/* Tier 2 */}
            <FadeUp className="flex flex-col gap-6 rounded-2xl p-6 transition-all duration-300 group bg-white dark:bg-[#1b2431]/40 border border-slate-200 dark:border-white/5 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:border-[#4F9DFF]/30 backdrop-blur-sm">
                <div className="flex flex-col gap-2">
                    <h3 className="text-slate-900 dark:text-slate-200 text-lg font-bold leading-tight group-hover:text-[#4F9DFF] transition-colors">Tier 2: Trust Engine</h3>
                </div>
                <div className="w-full h-px bg-slate-200 dark:bg-white/10 group-hover:bg-[#4F9DFF]/20 transition-colors"></div>
                <div className="flex flex-col gap-3">
                    {['Karma-based reputation', 'Late returns affect credibility', 'Built-in accountability'].map((item) => (
                        <div key={item} className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-start gap-3">
                            <span className="text-[#4F9DFF]">✓</span>
                            <span>{item}</span>
                        </div>
                    ))}
                </div>
            </FadeUp>

            {/* Tier 3 */}
            <FadeUp className="flex flex-col gap-6 rounded-2xl p-6 transition-all duration-300 group bg-white dark:bg-[#1b2431]/40 border border-slate-200 dark:border-white/5 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:border-[#4F9DFF]/30 backdrop-blur-sm">
                <div className="flex flex-col gap-2">
                    <h3 className="text-slate-900 dark:text-slate-200 text-lg font-bold leading-tight group-hover:text-[#4F9DFF] transition-colors">Tier 3: Community Lending</h3>
                </div>
                <div className="w-full h-px bg-slate-200 dark:bg-white/10 group-hover:bg-[#4F9DFF]/20 transition-colors"></div>
                <div className="flex flex-col gap-3">
                     {['Clubs & group gear', 'Shared calendars', 'Admin controls'].map((item) => (
                        <div key={item} className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-start gap-3">
                            <span className="text-[#4F9DFF]">✓</span>
                            <span>{item}</span>
                        </div>
                    ))}
                </div>
            </FadeUp>

            {/* Tier 4 */}
            <FadeUp className="flex flex-col gap-6 rounded-2xl p-6 relative overflow-hidden ring-1 ring-[#4F9DFF]/50 shadow-[0_0_40px_rgba(79,157,255,0.15)] group bg-[#1b2431] backdrop-blur-xl hover:-translate-y-2 transition-transform">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#4F9DFF] to-transparent opacity-80"></div>
                 <div className="flex flex-col gap-2 relative z-10">
                    <div className="flex items-center justify-between">
                        <h3 className="text-white text-lg font-bold leading-tight">Tier 4: Smart Coordination</h3>
                        <span className="text-[#0f1823] text-[10px] uppercase font-bold tracking-wider rounded-full bg-[#4F9DFF] px-2 py-1">Featured</span>
                    </div>
                 </div>
                 <div className="w-full h-px bg-white/10 relative z-10"></div>
                 <div className="flex flex-col gap-3 relative z-10">
                     {['Context-based chat', 'Item-linked conversations', 'Clear approvals'].map((item) => (
                        <div key={item} className="text-sm font-medium text-white flex items-start gap-3">
                            <span className="text-[#4F9DFF]">✓</span>
                            <span>{item}</span>
                        </div>
                    ))}
                 </div>
                 <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#4F9DFF]/20 blur-[50px] rounded-full pointer-events-none group-hover:bg-[#4F9DFF]/30 transition-colors duration-500"></div>
            </FadeUp>
          </StaggerContainer>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FadeUp className="glass-card flex items-center justify-between p-8 rounded-2xl bg-[#1b2431]/40 backdrop-blur-xl border border-white/5">
                <div className="flex flex-col gap-1">
                    <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider">All features. Zero cost.</span>
                    <span className="text-white text-lg font-medium leading-relaxed">Because sharing works best when money isn’t the incentive.</span>
                </div>
                <div className="h-12 w-12 shrink-0 rounded-full bg-white/5 flex items-center justify-center text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </div>
             </FadeUp>
             
             <FadeUp className="glass-card flex items-center justify-between p-8 rounded-2xl border-[#4F9DFF]/30 relative overflow-hidden bg-[#1b2431]/40 backdrop-blur-xl">
                 <div className="absolute inset-0 bg-[#4F9DFF]/5 pointer-events-none"></div>
                 <div className="flex flex-col gap-1 relative z-10">
                    <span className="text-[#4F9DFF] text-sm font-semibold uppercase tracking-wider mb-1">Requires student sign-up</span>
                    <span className="text-[#4F9DFF] text-3xl md:text-4xl font-extrabold tracking-tight drop-shadow-[0_0_15px_rgba(79,157,255,0.5)]">Free — Campus Exclusive</span>
                 </div>
                 <div className="h-12 w-12 shrink-0 rounded-full bg-[#4F9DFF]/20 flex items-center justify-center text-[#4F9DFF] relative z-10">
                     <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10v6"/><path d="M20 2v10M4 2v10"/><path d="M12 2v20"/><path d="M2 10h20"/></svg>
                 </div>
             </FadeUp>
          </StaggerContainer>

          <div className="flex flex-col items-center justify-center pt-8 pb-10 text-center space-y-8">
            <FadeUp className="space-y-4 max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                    Start Sharing Today
                </h2>
                <p className="text-slate-400 text-lg">
                    Join the largest student sharing economy simply by verifying your student email.
                </p>
            </FadeUp>
            <ScaleIn className="w-full flex justify-center">
                <button className="relative group cursor-pointer overflow-hidden rounded-xl bg-[#4F9DFF] px-8 py-4 transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(79,157,255,0.4)]">
                    <div className="absolute inset-0 bg-white/20 translate-y-full transition-transform duration-300 group-hover:translate-y-0"></div>
                    <span className="relative flex items-center gap-2 text-[#0f1823] text-lg font-bold">
                        <span>Get Started for Free</span>
                        <span className="material-symbols-outlined">→</span>
                    </span>
                </button>
            </ScaleIn>
            <FadeIn delay={0.2}>
                <p className="text-xs text-slate-500">
                    *Requires valid .edu email address for verification.
                </p>
            </FadeIn>
          </div>

        </div>
      </div>
    </section>
  );
}
