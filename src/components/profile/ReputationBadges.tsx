"use client";

import { Award, Lock, CheckCircle2 } from "lucide-react";
import { calculateBadges } from "@/lib/badges";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ReputationBadgesProps {
  karmaScore: number;
  itemsLent: number;
  createdAt: string; // Passed as ISO string
}

export function ReputationBadges({ karmaScore, itemsLent, createdAt }: ReputationBadgesProps) {
  const allBadges = calculateBadges({
    karmaScore,
    itemsLent,
    createdAt: new Date(createdAt),
  });

  const unlockedBadges = allBadges.filter(b => b.unlocked);
  const lockedBadges = allBadges.filter(b => !b.unlocked);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    show: { opacity: 1, scale: 1, y: 0 }
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20 shadow-lg shadow-blue-500/5">
                <Award className="text-[#4F9DFF]" size={28} />
            </div>
            <h2 className="text-white text-3xl font-extrabold tracking-tight">Achievements</h2>
          </div>
          <p className="text-slate-400 font-medium">Earned by contributing to the growth of the community.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-3 backdrop-blur-md shadow-inner shadow-white/5">
            <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#4F9DFF]">Collection Status</span>
                <span className="text-white font-mono text-xl font-bold">
                    {unlockedBadges.length}<span className="text-slate-500 mx-1">/</span>{allBadges.length}
                </span>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-white/5 flex items-center justify-center relative">
                <svg className="w-full h-full -rotate-90">
                    <circle 
                        cx="24" cy="24" r="18" 
                        fill="none" stroke="currentColor" strokeWidth="4" 
                        className="text-white/5"
                    />
                    <circle 
                        cx="24" cy="24" r="18" 
                        fill="none" stroke="currentColor" strokeWidth="4" 
                        strokeDasharray={113}
                        strokeDashoffset={113 - (113 * (unlockedBadges.length / allBadges.length))}
                        className="text-[#4F9DFF] transition-all duration-1000 transition-delay-500"
                    />
                </svg>
            </div>
        </div>
      </div>

      <TooltipProvider delayDuration={100}>
        <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {/* UNLOCKED BADGES (Featured) */}
            {unlockedBadges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} animationVariants={item} />
            ))}
            
            {/* LOCKED BADGES (Faded) */}
            {lockedBadges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} animationVariants={item} />
            ))}
          </AnimatePresence>
        </motion.div>
      </TooltipProvider>
    </div>
  );
}

function BadgeCard({ badge, animationVariants }: { badge: any, animationVariants: any }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          variants={animationVariants}
          whileHover={{ 
            scale: badge.unlocked ? 1.05 : 1.02, 
            y: badge.unlocked ? -5 : 0,
            transition: { duration: 0.2 } 
          }}
          className={cn(
            "relative group flex flex-col items-center justify-center p-8 rounded-[2rem] border transition-all duration-500 h-[280px]",
            badge.unlocked 
              ? `${badge.bg} ${badge.border} shadow-2xl shadow-${badge.color.split('-')[1]}-500/10 cursor-default overflow-hidden`
              : "bg-white/[0.01] border-white/5 opacity-50 grayscale contrast-75 cursor-not-allowed"
          )}
        >
          {/* Decorative elements for unlocked badges */}
          {badge.unlocked && (
            <>
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-current opacity-[0.03] blur-3xl rounded-full" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-black/20 pointer-events-none" />
                <div className="absolute top-4 right-6 opacity-40">
                  <CheckCircle2 size={16} className={badge.color} />
                </div>
            </>
          )}

          {/* Icon Container */}
          <div className={cn(
            "relative w-24 h-24 rounded-3xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:rotate-6",
            badge.unlocked 
                ? "bg-black/40 ring-1 ring-white/10 shadow-2xl" 
                : "bg-white/5 ring-1 ring-white/5"
          )}>
            {badge.unlocked && (
                <div className={cn(
                    "absolute inset-0 rounded-3xl blur-xl opacity-20 scale-125 transition-all duration-500 group-hover:opacity-40",
                    badge.color.replace('text-', 'bg-')
                )} />
            )}
            <badge.icon 
              size={48} 
              strokeWidth={1.5}
              className={cn(
                "relative z-10 transition-all duration-500 group-hover:scale-110",
                badge.unlocked ? badge.color : "text-slate-600"
              )} 
            />
            {!badge.unlocked && (
                <div className="absolute bottom-2 right-2 bg-black/40 p-1.5 rounded-full border border-white/10">
                    <Lock size={12} className="text-slate-500" />
                </div>
            )}
          </div>

          {/* Text Content */}
          <div className="text-center space-y-2 relative z-10">
            <h3 className={cn(
              "text-lg font-black uppercase tracking-wider",
              badge.unlocked ? "text-white" : "text-slate-500"
            )}>
              {badge.name}
            </h3>
            <p className={cn(
              "text-xs font-medium max-w-[160px] line-clamp-2 leading-relaxed px-2",
              badge.unlocked ? "text-slate-400 group-hover:text-slate-300" : "text-slate-600"
            )}>
              {badge.description}
            </p>
          </div>

          {/* Premium Glow effect on hover */}
          {badge.unlocked && (
            <div className={cn(
                "absolute -inset-0.5 rounded-[2rem] opacity-0 group-hover:opacity-10 blur-md transition-all duration-500 pointer-events-none",
                badge.color.replace('text-', 'bg-')
            )} />
          )}

          {/* Shimmer effect for unlocked badges */}
          {badge.unlocked && (
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1500 ease-in-out pointer-events-none" />
          )}
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={10} className="bg-[#0f1823]/95 border border-white/10 text-white p-4 rounded-2xl shadow-2xl backdrop-blur-xl max-w-[240px]">
          <div className="space-y-2 text-center">
              <div className="flex items-center justify-center gap-2">
                <badge.icon size={18} className={badge.unlocked ? badge.color : "text-slate-500"} />
                <p className="font-black text-sm uppercase tracking-widest">{badge.name}</p>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">{badge.description}</p>
              {!badge.unlocked && (
                  <div className="mt-2 pt-2 border-t border-white/5">
                      <p className="text-[10px] text-[#4F9DFF] font-black uppercase tracking-widest">To Unlock</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Keep participating in the community to earn this medal.</p>
                  </div>
              )}
          </div>
      </TooltipContent>
    </Tooltip>
  );
}

