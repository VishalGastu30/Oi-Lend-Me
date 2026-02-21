"use client";

import { ActivityTimeline } from "@/components/activity/ActivityTimeline";
import { ShieldCheck } from "lucide-react";

export default function ActivityPage() {
  return (
    <div className="bg-[#0f1823] pb-12 px-4 sm:px-6 lg:px-20 flex justify-center">
        <div className="flex flex-col w-full max-w-[800px] gap-10">
            
            {/* Header Section */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">Your Timeline</h2>
                        <div className="flex items-center gap-4">
                            <p className="text-[#9aa9bc] text-base font-normal leading-normal">Track your past history and respect points.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <ActivityTimeline />
        </div>
    </div>
  );
}
