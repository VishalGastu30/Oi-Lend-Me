"use client";

import { FadeUp, StaggerContainer } from "@/components/ui/motion";
import { useState, useEffect } from "react";

interface Testimonial {
  id: string;
  content: string;
  author: string;
  role: string;
  avatar: string;
}

export function SocialProofSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const res = await fetch('/api/testimonials');
        if (res.ok) {
          const data = await res.json();
          setTestimonials(data.data || []);
        }
      } catch (e) {
        console.error("Failed to fetch testimonials", e);
      } finally {
        setLoading(false);
      }
    }
    fetchTestimonials();
  }, []);

  if (loading) return (
    <div className="py-32 bg-[#f5f7f8] dark:bg-[#0f1823] flex justify-center">
      <div className="w-20 h-20 border-4 border-[#4F9DFF] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <section id="students-love-us" className="relative bg-[#f5f7f8] dark:bg-[#0f1823] font-sans min-h-[600px] flex flex-col items-center justify-center py-32 overflow-hidden">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]" 
           style={{ backgroundImage: 'linear-gradient(#4F9DFF 1px, transparent 1px), linear-gradient(to right, #4F9DFF 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>
      
      <div className="flex flex-col max-w-[1200px] w-full flex-1 relative z-10 px-4">
        {/* Section Header */}
        <FadeUp className="flex flex-col items-center text-center pb-12 pt-5">
            <span className="text-[#4F9DFF] text-sm font-bold uppercase tracking-widest mb-3">Community Trust</span>
            <h2 className="text-[#111418] dark:text-white text-3xl md:text-5xl font-black leading-tight tracking-[-0.015em] px-4">
                What the Crew Says
            </h2>
            <p className="text-[#637588] dark:text-[#9ba9bb] text-lg mt-4 max-w-2xl font-medium">
                Real stories from students making the most of campus sharing.
            </p>
        </FadeUp>

        {/* Testimonial Grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
            {testimonials.length > 0 ? (
              testimonials.map((testimonial) => (
                <FadeUp key={testimonial.id} className="flex flex-1 flex-col justify-between gap-6 rounded-2xl p-8 shadow-sm bg-white dark:bg-[#1b2127]/60 backdrop-blur-md border border-slate-200 dark:border-white/5 hover:border-[#4F9DFF]/40 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all duration-300 group">
                    <div className="flex flex-col gap-4">
                        <span className="text-[#4F9DFF] text-5xl font-serif leading-none opacity-50 group-hover:opacity-100 transition-opacity">❝</span>
                        <p className="text-[#111418] dark:text-[#e0e0e0] text-lg font-medium leading-relaxed relative z-10">
                            "{testimonial.content}"
                        </p>
                    </div>
                    <div className="flex items-center gap-4 mt-auto pt-6 border-t border-gray-100 dark:border-gray-800/50">
                        <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-12 shrink-0 border-2 border-[#4F9DFF]/20 group-hover:border-[#4F9DFF] transition-colors" style={{backgroundImage: `url("${testimonial.avatar}")`}} />
                        <div className="flex flex-col">
                            <h3 className="text-[#111418] dark:text-white text-base font-bold leading-tight">{testimonial.author}</h3>
                            <p className="text-[#637588] dark:text-[#9ba9bb] text-sm font-normal">{testimonial.role}</p>
                        </div>
                    </div>
                </FadeUp>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-gray-400 text-lg">Be the first to share your experience!</p>
                  <p className="text-gray-500 text-sm mt-2">Help our community grow by lending or borrowing items.</p>
              </div>
            )}
        </StaggerContainer>
      </div>
    </section>
  );
}
