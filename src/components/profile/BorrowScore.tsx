"use client";

import { useState, useEffect } from "react";

interface BorrowScoreProps {
  karmaScore: number;
}

export function BorrowScore({ karmaScore }: BorrowScoreProps) {
  const percentage = Math.min((karmaScore / 1000) * 100, 100);
  const rating = karmaScore > 800 ? "Excellent" : karmaScore > 500 ? "Good" : karmaScore > 200 ? "Fair" : "Building";


  return (
    <div className="glass-card rounded-xl p-8 flex flex-col items-center justify-center text-center h-full">
        <h3 className="text-white text-lg font-bold mb-4">Karma Score</h3>
        <div className="relative size-32 mb-4">
            <svg className="size-full" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                <circle className="stroke-current text-white/10" cx="18" cy="18" fill="none" r="16" strokeWidth="3"></circle>
                <circle 
                  className="stroke-current text-[#4F9DFF]" 
                  cx="18" 
                  cy="18" 
                  fill="none" 
                  r="16" 
                  strokeDasharray={`${percentage} 100`}
                  strokeLinecap="round" 
                  strokeWidth="3" 
                  transform="rotate(-90 18 18)"
                ></circle>
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="text-3xl font-extrabold text-white">{karmaScore}</span>
            </div>
        </div>
        <p className="text-[#4F9DFF] font-bold text-lg">{rating}</p>
        <p className="text-[#9aa9bc] text-xs mt-1 leading-relaxed">
          {karmaScore > 500 ? "Top contributor in your community!" : "Keep lending to increase your score!"}
        </p>
    </div>
  );
}
