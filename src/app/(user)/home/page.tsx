"use client";

import { Suspense } from "react";

import { BrowseItems } from "@/components/home/BrowseItems";
import Link from "next/link";
import { HeartHandshake } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0B0F1A]"> 
       {/* pt-20 to account for fixed navbar height */}
       <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
         <BrowseItems />
       </Suspense>
       
       {/* Footer CTA */}
       <footer className="mt-12 bg-[#0B0F1A]/80 backdrop-blur-[16px] border-t border-white/[0.05] py-12 px-6 lg:px-20 text-center">
            <div className="max-w-2xl mx-auto flex flex-col items-center gap-4">
                <div className="size-12 bg-[#4F9DFF]/20 rounded-2xl flex items-center justify-center text-[#4F9DFF] mb-2">
                    <HeartHandshake size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white">Have items lying around?</h3>
                <p className="text-gray-400">Join 5,000+ students sharing tools, tech, and gear. Build your trust score and help your community.</p>
                <Link href="/items/new">
                    <button className="mt-4 px-8 py-3 bg-[#4F9DFF] hover:bg-[#4F9DFF]/80 text-white font-bold rounded-xl transition-all shadow-xl shadow-[#4F9DFF]/20">
                        List an Item Now
                    </button>
                </Link>
            </div>
        </footer>
    </div>
  );
}
