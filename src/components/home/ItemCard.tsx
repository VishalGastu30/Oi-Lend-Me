"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Heart, MoreVertical } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ReportModal } from "@/components/modals/ReportModal";
import { AnimatePresence, motion } from "framer-motion";

export interface ItemCardProps {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  category: string;
  status: string;
  owner: {
    id: string;
    name: string;
    avatarUrl?: string;
  } | null;
  createdAt: string; // or Date
}

export function ItemCard({ id, name, category, status, imageUrl, owner, createdAt }: ItemCardProps) {
    const isAvailable = status === "AVAILABLE";
    const isBorrowed = status === "BORROWED";
    const [reportOpen, setReportOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    // We can map other statuses if needed

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="group relative bg-[#121726]/40 backdrop-blur-md border border-white/5 rounded-3xl p-4 transition-all duration-300 hover:border-blue-500/30 hover:bg-[#121726]/60 cursor-pointer flex flex-col h-full shadow-lg hover:shadow-blue-500/10"
    >
      <Link href={`/items/${id}`} className="absolute inset-0 z-0" aria-label={`View ${name}`} />
      
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-gray-900 shadow-inner">
        <div className="absolute top-3 left-3 z-10 flex gap-1.5">
            {isAvailable && (
                 <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight bg-green-500/10 text-green-400 border border-green-500/20 backdrop-blur-md">Available</span>
            )}
            {isBorrowed && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 backdrop-blur-md">Borrowed</span>
            )}
            {!isAvailable && !isBorrowed && (
                 <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight bg-gray-500/10 text-gray-400 border border-white/10 backdrop-blur-md">{status}</span>
            )}
        </div>
        
        {imageUrl ? (
            <motion.div 
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="w-full h-full bg-cover bg-center" 
                style={{backgroundImage: `url("${imageUrl}")`}} 
            />
        ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 text-gray-600 gap-2">
                <span className="material-symbols-outlined text-3xl opacity-20">image</span>
            </div>
        )}
      </div>

      <div className="flex justify-between items-start mb-4 grow relative z-10">
        <div className="space-y-1.5 min-w-0">
          <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors line-clamp-1 pr-2">{name}</h3>
          <div className="flex items-center gap-2">
             <div 
                className="size-6 rounded-full bg-cover bg-center border border-white/10 bg-gray-800" 
                style={{backgroundImage: owner?.avatarUrl ? `url("${owner.avatarUrl}")` : undefined}}
             />
             <span className="text-xs text-gray-500 font-medium truncate">by <span className="text-gray-300">{owner?.name || "Member"}</span></span>
          </div>
        </div>
        
        <div className="flex gap-1 shrink-0">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            className="size-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 border border-white/5 transition-all"
          >
             <Heart size={16} />
          </motion.button>
          
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.preventDefault();
                setMenuOpen(!menuOpen);
              }}
              className="size-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-gray-400 hover:text-white"
            >
              <MoreVertical size={16} />
            </motion.button>
            
            <AnimatePresence>
              {menuOpen && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute right-0 top-11 z-[50] bg-[#1E2330] border border-white/10 rounded-xl shadow-2xl min-w-[160px] overflow-hidden backdrop-blur-xl"
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setReportOpen(true);
                      setMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-colors flex items-center gap-2"
                  >
                    Report Item
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto relative z-10">
        <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold opacity-70 mb-0.5">{category}</span>
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
                {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </div>
        </div>
        
        {isAvailable ? (
             <Link 
               href={`/items/${id}`} 
               className="bg-blue-600/10 text-blue-400 px-4 py-1.5 rounded-full font-bold text-xs border border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all transform group-hover:scale-105"
             >
                Request Loan
             </Link>
        ) : (
             <span className="text-gray-600 font-bold text-xs flex items-center gap-1 uppercase tracking-tighter">
                Unavailable
             </span>
        )}
      </div>
      
      {/* Report Modal */}
      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        entityType="ITEM"
        entityId={id}
        entityName={name}
      />
    </motion.div>
  );
}
