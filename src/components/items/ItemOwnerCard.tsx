"use client";

import { ItemDetail } from "./types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, Award, Star } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ItemOwnerCardProps {
  item: ItemDetail;
  isOwner: boolean;
  className?: string;
  onMessage: () => void;
  existingConversationId?: string | null;
}

import { motion } from "framer-motion";

export function ItemOwnerCard({ 
  item, 
  isOwner, 
  className, 
  onMessage,
  existingConversationId 
}: ItemOwnerCardProps) {
  
  const displayOwner = item.owner || (item.group ? { ...item.group, karmaScore: 0, avatarUrl: item.group.imageUrl } : null);
  const isGroupItem = !!item.group;

  if (!displayOwner) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-[#121726]/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 group/owner",
        className
      )}
    >
      {item.lenderNote && (
        <div className="mb-8">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 pl-1">Lender's Note</h3>
          <div className="relative p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10 italic text-gray-300 text-sm leading-relaxed overflow-hidden">
            <div className="absolute top-0 right-0 p-2 text-blue-500/20">
                <span className="material-symbols-outlined text-4xl">format_quote</span>
            </div>
            <span className="relative z-10">"{item.lenderNote}"</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-5">
            <Link href={isGroupItem ? `/groups/${displayOwner.id}` : `/profile/${displayOwner.id}`}>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Avatar className="size-16 border-4 border-white/5 shadow-2xl transition-all group-hover/owner:border-blue-500/30">
                  <AvatarImage src={displayOwner.avatarUrl || undefined} />
                  <AvatarFallback className="bg-blue-600 text-white font-black text-xl">
                    {displayOwner.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {/* Online indicator - always show as online for demo or if real logic exists */}
                <div className="absolute bottom-0 right-0 size-4 bg-green-500 border-2 border-[#121726] rounded-full shadow-lg" />
              </motion.div>
            </Link>
            <div>
               <Link href={isGroupItem ? `/groups/${displayOwner.id}` : `/profile/${displayOwner.id}`} className="block group/link">
                 <h4 className="font-bold text-white text-xl tracking-tight group-hover/link:text-blue-400 transition-colors">
                    {displayOwner.name}
                 </h4>
               </Link>
               {!isGroupItem && (
                 <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-black uppercase tracking-wider">
                        <Star size={10} fill="currentColor" />
                        {displayOwner.karmaScore} Karma
                    </div>
                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                        <div className="size-1 bg-gray-600 rounded-full" />
                        Verified Member
                    </span>
                 </div>
               )}
            </div>
        </div>
      </div>

      {!isGroupItem && !isOwner && (
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button 
              variant="secondary" 
              onClick={onMessage}
              className={cn(
                "w-full h-14 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 group/btn",
                existingConversationId 
                    ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20" 
                    : "bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10"
              )}
            >
              <MessageCircle className={cn(
                  "size-5 transition-transform group-hover/btn:scale-110",
                  existingConversationId ? "text-white" : "text-blue-400"
              )} />
              {existingConversationId ? "Continue Conversation" : "Start a Chat"}
            </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

