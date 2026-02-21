"use client";

import { useState, useEffect } from "react";
import { GraduationCap, MapPin, Share2 } from "lucide-react";
import { ProfileEditModal } from "./ProfileEditModal";
import { UserAvatar } from "@/components/ui/UserAvatar";

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  karmaScore: number;
  createdAt: string;
}

interface ProfileHeaderProps {
  user: User;
  isOwnProfile: boolean;
}

export function ProfileHeader({ user, isOwnProfile }: ProfileHeaderProps) {
  const joinYear = new Date(user.createdAt).getFullYear();
  const karmaLevel = Math.floor(user.karmaScore / 100);

  return (
    <div className="glass-card rounded-xl p-8 flex flex-col justify-center h-full">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
                <div className="relative">
                    <UserAvatar 
                        user={user} 
                        className="min-h-32 w-32 border-4 border-[#4F9DFF]/30 shadow-lg shadow-[#4F9DFF]/20" 
                    />
                    <div className="absolute bottom-1 right-1 bg-green-500 size-6 rounded-full border-4 border-[#0f1823] shadow-sm"></div>
                </div>
                <div className="flex flex-col justify-center">
                    <h1 className="text-white text-3xl font-bold leading-tight tracking-[-0.015em] mb-1">{user.name}</h1>
                    <p className="text-[#9aa9bc] text-base font-medium leading-normal flex items-center gap-2">
                        <GraduationCap size={16} className="text-[#4F9DFF]" /> {user.role} <span className="text-gray-600">•</span> Joined {joinYear}
                    </p>
                    <p className="text-[#9aa9bc] text-sm font-normal leading-normal flex items-center gap-2 mt-1">
                        <MapPin size={14} className="text-gray-500" /> North Campus
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                        <div className="px-3 py-1 bg-[#4F9DFF]/10 border border-[#4F9DFF]/20 text-[#4F9DFF] text-xs font-bold rounded-full uppercase tracking-wider shadow-sm">
                          Level {karmaLevel} Lender
                        </div>
                        {user.karmaScore > 500 && (
                          <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-bold rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span> Top Contributor
                          </div>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="flex w-full md:w-auto flex-col gap-3">
                {isOwnProfile && <ProfileEditModal user={user} />}
                <button className="flex items-center justify-center gap-2 w-full md:w-auto overflow-hidden rounded-xl h-10 px-6 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white text-sm font-bold transition-all">
                    <Share2 size={16} /> Share Profile
                </button>
            </div>
        </div>
    </div>
  );
}
