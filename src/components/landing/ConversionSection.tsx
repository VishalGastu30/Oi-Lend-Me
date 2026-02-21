"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FadeUp } from "@/components/ui/motion";

export function ConversionSection() {
  const router = useRouter();

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
    <section id="get-started" className="relative overflow-hidden bg-[#0f1823] py-32 font-sans">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-[#4F9DFF]/20 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="flex flex-col justify-center items-center gap-10 px-4 relative z-10 max-w-[960px] mx-auto text-center">
             <FadeUp>
                <h2 className="text-white text-4xl md:text-6xl font-black leading-tight tracking-[-0.02em]">
                    Ready to join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4F9DFF] to-indigo-400">movement?</span>
                </h2>
            </FadeUp>
            
            <FadeUp delay={0.1}>
                <p className="text-slate-400 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                    Stop letting your items gather dust. Start building your reputation and saving money today.
                </p>
            </FadeUp>

            <FadeUp delay={0.2} className="flex flex-col sm:flex-row gap-4 w-full px-6 sm:px-0 justify-center">
                 <button onClick={() => handleAuthNavigation('/auth/signup')} className="relative group overflow-hidden rounded-full h-14 px-10 bg-[#4F9DFF] text-white text-lg font-bold shadow-[0_0_40px_rgba(79,157,255,0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_rgba(79,157,255,0.6)] w-full sm:w-auto">
                     <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                     <span className="relative text-center block">Start Borrowing Now</span>
                 </button>
                 <button onClick={() => handleAuthNavigation('/auth/login')} className="h-14 px-10 rounded-full border border-slate-700 text-white text-lg font-bold hover:bg-white/5 transition-colors w-full sm:w-auto">
                     Log In
                 </button>
            </FadeUp>
            
            <FadeUp delay={0.3}>
                 <p className="text-slate-500 text-sm">
                    No credit card required for sign up.
                 </p>
            </FadeUp>
        </div>
    </section>
  );
}
