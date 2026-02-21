
"use client";

import { motion } from "framer-motion";
import { Lock, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatLockBannerProps {
  reason?: string;
  className?: string;
}

export function ChatLockBanner({ reason, className }: ChatLockBannerProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/10 bg-[#0B0F1A]/80 backdrop-blur-md p-6 text-center shadow-2xl",
        className
      )}
    >
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
      
      <div className="flex flex-col items-center gap-3 relative z-10">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
          <Lock className="w-5 h-5 text-red-400" />
        </div>
        
        <div className="space-y-1">
          <h3 className="text-white font-medium">Conversation Locked</h3>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">
            {reason || "Messages are disabled for this conversation."}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
