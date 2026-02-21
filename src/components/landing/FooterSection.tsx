"use client";

import Link from "next/link";
import { FadeIn, FadeUp, StaggerContainer } from "@/components/ui/motion";
import { Logo } from "@/components/ui/Logo";

export function FooterSection() {
  return (
    <footer id="about" className="bg-white dark:bg-[#111a26] border-t border-[#e5e7eb] dark:border-[#293038] py-20 font-sans">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-12 px-5 md:px-20 lg:px-40">
            
            {/* Top Section: Logo & Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
                {/* Brand / Logo Column */}
                <FadeUp className="lg:col-span-4 flex flex-col gap-4">
                    <div className="flex items-center gap-3 text-[#111418] dark:text-white">
                        <Logo width={40} height={40} className="rounded-lg" />
                        <h2 className="text-xl font-bold leading-tight tracking-[-0.015em]">Oi! Lend Me</h2>
                    </div>
                    <p className="text-[#637588] dark:text-[#9ba9bb] text-sm leading-relaxed max-w-xs">
                        The premier marketplace for college students to share, rent, and earn from their everyday items securely.
                    </p>
                </FadeUp>

                {/* Navigation Columns */}
                <StaggerContainer className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
                    {/* Column 1: Product */}
                    <FadeUp className="flex flex-col gap-4">
                        <h3 className="text-[#111418] dark:text-white text-sm font-bold uppercase tracking-wide">Product</h3>
                        <div className="flex flex-col gap-3">
                            {['How it Works', 'Features', 'Safety & Insurance', 'Pricing'].map((item) => (
                                <Link key={item} className="text-[#637588] dark:text-[#9ba9bb] hover:text-[#4F9DFF] dark:hover:text-[#4F9DFF] text-sm transition-colors" href="#">{item}</Link>
                            ))}
                        </div>
                    </FadeUp>

                    {/* Column 2: Community */}
                    <FadeUp className="flex flex-col gap-4">
                        <h3 className="text-[#111418] dark:text-white text-sm font-bold uppercase tracking-wide">Community</h3>
                        <div className="flex flex-col gap-3">
                             {['Our Story', 'Campus Ambassadors', 'Blog', 'Events'].map((item) => (
                                <Link key={item} className="text-[#637588] dark:text-[#9ba9bb] hover:text-[#4F9DFF] dark:hover:text-[#4F9DFF] text-sm transition-colors" href="#">{item}</Link>
                            ))}
                        </div>
                    </FadeUp>

                    {/* Column 3: Legal */}
                    <FadeUp className="flex flex-col gap-4">
                        <h3 className="text-[#111418] dark:text-white text-sm font-bold uppercase tracking-wide">Legal</h3>
                        <div className="flex flex-col gap-3">
                             {['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Dispute Resolution'].map((item) => (
                                <Link key={item} className="text-[#637588] dark:text-[#9ba9bb] hover:text-[#4F9DFF] dark:hover:text-[#4F9DFF] text-sm transition-colors" href="#">{item}</Link>
                            ))}
                        </div>
                    </FadeUp>
                </StaggerContainer>
            </div>

             {/* Divider */}
             <div className="h-px w-full bg-[#e5e7eb] dark:bg-[#293038]"></div>

             {/* Bottom Section: Copyright & Social */}
             <FadeIn delay={0.2} className="flex flex-col md:flex-row items-center justify-between gap-6">
                <p className="text-[#637588] dark:text-[#9ba9bb] text-sm font-normal">
                    © 2026 Oi! Lend Me. All rights reserved.
                </p>
                <div className="flex gap-4">
                    <a className="w-10 h-10 flex items-center justify-center rounded-full bg-[#f0f2f4] dark:bg-[#202936] text-[#637588] dark:text-[#9ba9bb] hover:bg-[#4F9DFF] hover:text-white dark:hover:bg-[#4F9DFF] dark:hover:text-white transition-all group" href="#">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                    </a>
                    <a className="w-10 h-10 flex items-center justify-center rounded-full bg-[#f0f2f4] dark:bg-[#202936] text-[#637588] dark:text-[#9ba9bb] hover:bg-[#4F9DFF] hover:text-white dark:hover:bg-[#4F9DFF] dark:hover:text-white transition-all group" href="#">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                    </a>
                     <a className="w-10 h-10 flex items-center justify-center rounded-full bg-[#f0f2f4] dark:bg-[#202936] text-[#637588] dark:text-[#9ba9bb] hover:bg-[#4F9DFF] hover:text-white dark:hover:bg-[#4F9DFF] dark:hover:text-white transition-all group" href="#">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                    </a>
                </div>
             </FadeIn>
        </div>
    </footer>
  );
}
