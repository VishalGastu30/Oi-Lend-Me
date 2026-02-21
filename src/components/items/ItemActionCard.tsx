"use client";

import { ItemDetail } from "./types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Clock, Star, ChevronRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface ItemActionCardProps {
  item: ItemDetail;
  isOwner: boolean;
  requesting: boolean;
  onRequest: () => void;
  onReturn?: () => void;
  className?: string;
}

export function ItemActionCard({ 
  item, 
  isOwner, 
  requesting, 
  onRequest, 
  onReturn,
  className 
}: ItemActionCardProps) {
  
  // Helper to determine status color/text
  const getStatusInfo = () => {
    switch(item.status) {
      case 'AVAILABLE': return { color: 'text-green-400', badgeInfo: 'bg-green-500/10 text-green-400 border-green-500/20' };
      case 'BORROWED': return { color: 'text-gray-400', badgeInfo: 'bg-white/5 text-gray-400 border-white/10' };
      case 'REQUESTED': return { color: 'text-yellow-400', badgeInfo: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' };
      default: return { color: 'text-red-400', badgeInfo: 'bg-red-500/10 text-red-400 border-red-500/20' };
    }
  };

  const { badgeInfo } = getStatusInfo();

  const karma = item.owner?.karmaScore;
  const rating = karma !== undefined ? Math.min(5.0, Math.max(1.0, 1.0 + (karma / 50))).toFixed(1) : null;
  
  const depositText = item.deposit 
     ? (Number(item.deposit) === 0 ? "No Deposit Required" : `$${item.deposit}`)
     : null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "bg-[#121726]/60 backdrop-blur-[32px] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group/card",
        className
      )}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700" />
      
      <div className="flex justify-between items-start mb-10">
        <div className="space-y-2">
           <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Status</p>
           <Badge variant="outline" className={cn("px-4 py-1.5 rounded-full text-xs font-bold uppercase transition-all", badgeInfo)}>
             {item.status === 'AVAILABLE' ? (
                <span className="flex items-center gap-2">
                    <span className="size-1.5 bg-green-500 rounded-full animate-ping" />
                    Available Now
                </span>
             ) : item.status}
           </Badge>
        </div>
        
        {rating && (
           <div className="text-right bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
              <div className="flex items-center justify-end gap-1.5 text-yellow-400 text-base font-black">
                 <Star size={16} fill="currentColor" />
                 <span>{rating}</span>
              </div>
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">Owner Trust</p>
           </div>
        )}
      </div>

      <div className="space-y-6 mb-10 pb-8 border-b border-white/5">
        <div className="flex justify-between items-center group/info">
            <div className="flex items-center gap-3">
                <div className="size-8 rounded-xl bg-blue-500/5 flex items-center justify-center text-blue-400 group-hover/info:bg-blue-600 group-hover/info:text-white transition-all">
                    <Clock size={16} />
                </div>
                <span className="text-gray-400 text-sm font-medium">Lending Period</span>
            </div>
            <span className="font-bold text-white transition-colors group-hover/info:text-blue-400">
                {item.maxLendingDays ? `Up to ${item.maxLendingDays} Days` : "Flexible"}
            </span>
        </div>
        
        <div className="flex justify-between items-center group/info">
            <div className="flex items-center gap-3">
                <div className="size-8 rounded-xl bg-green-500/5 flex items-center justify-center text-green-400 group-hover/info:bg-green-600 group-hover/info:text-white transition-all">
                    <ShieldCheck size={16} />
                </div>
                <span className="text-gray-400 text-sm font-medium">Deposit</span>
            </div>
            <span className="font-bold text-green-400">
                {depositText || "Standard"}
            </span>
        </div>
      </div>

      {/* Main Action Button */}
      {isOwner ? (
        item.status === 'BORROWED' ? (
          <Button 
            onClick={onReturn}
            className="w-full h-14 text-base font-black bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-all rounded-[1.25rem] active:scale-95"
          >
            Mark as Returned
          </Button>
        ) : (
          <Button disabled className="w-full h-14 text-base font-bold bg-white/5 text-gray-500 cursor-not-allowed border border-white/5 rounded-[1.25rem]">
             {item.status === 'REQUESTED' ? 'Request is Pending' : 'Your Listing'}
          </Button>
        )
      ) : item.status === 'AVAILABLE' ? (
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            onClick={onRequest} 
            disabled={requesting}
            className="w-full h-16 text-lg font-black bg-blue-600 hover:bg-blue-500 text-white shadow-2xl shadow-blue-500/30 transition-all rounded-[1.25rem] group"
          >
            {requesting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <span className="flex items-center justify-center gap-3">
                Request to Borrow
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </motion.div>
      ) : (
        <Button disabled className="w-full h-14 text-base font-bold bg-white/5 text-gray-400 cursor-not-allowed border border-white/5 rounded-[1.25rem]">
          {item.status === 'BORROWED' ? 'Already Borrowed' : 'Request Pending'}
        </Button>
      )}

      <p className="mt-6 text-center text-[10px] text-gray-500 font-medium px-4 leading-relaxed">
        By requesting, you agree to handle this item with care and follow the community guidelines.
      </p>
    </motion.div>
  );
}
