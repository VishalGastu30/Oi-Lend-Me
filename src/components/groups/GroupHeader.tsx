"use client";

import { useState } from "react";
import { Users, Tag, User as UserIcon, Settings } from "lucide-react";
import { GroupSettingsModal } from "./GroupSettingsModal";

interface GroupHeaderProps {
  group: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    memberCount: number;
    itemCount: number;
    isVerified: boolean;
  };
  isMember: boolean;
  isAdmin?: boolean;
  onJoin: () => void;
  onLeave?: () => void;
}

export function GroupHeader({ group, isMember, isAdmin, onJoin, onLeave }: GroupHeaderProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <section className="glass-card rounded-xl p-6 @container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex gap-6">
            <div className="relative">
              <div
                className="size-32 rounded-xl bg-center bg-cover border-2 border-white/10 shrink-0"
                style={{
                  backgroundImage: `url("${
                    group.imageUrl ||
                    'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1000&auto=format&fit=crop'
                  }")`,
                }}
              />
              {group.isVerified && (
                  <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-1 ring-4 ring-[#0B0F1A]" aria-label="Verified">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                  </div>
              )}
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-black tracking-tight text-white">
                  {group.name}
                </h1>
              </div>
              
              <p className="text-white/60 text-sm mb-3 line-clamp-2 max-w-xl">{group.description}</p>
              
              <div className="flex flex-wrap gap-4 text-white/60 text-sm">
                <span className="flex items-center gap-1.5">
                  <Users size={16} /> {group.memberCount} Members
                </span>
                <span className="flex items-center gap-1.5">
                  <Tag size={16} /> {group.itemCount} Items
                </span>
                <span className="flex items-center gap-1.5">
                  <UserIcon size={16} /> Activity: High
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
            {isMember ? (
              <>
                  {isAdmin && (
                    <button 
                        onClick={() => setSettingsOpen(true)}
                        className="flex-1 md:flex-none bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                    >
                        <Settings size={16} />
                        Settings
                    </button>
                  )}
              </>
            ) : (
              <button 
                  onClick={onJoin}
                  className="flex-1 md:flex-none bg-[#4F9DFF] hover:bg-[#4F9DFF]/90 text-[#0f1823] px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
              >
                  Join Group
              </button>
            )}
          </div>
        </div>
      </section>

      <GroupSettingsModal 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
        group={group} 
      />
    </>
  );
}
