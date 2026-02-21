"use client";

import { useState, useCallback, useEffect } from "react";
import { ItemDetail } from "./types";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Maximize2, X, ChevronLeft, ChevronRight } from "lucide-react";

interface ItemImageGalleryProps {
  item: ItemDetail;
  className?: string;
}

export function ItemImageGallery({ item, className }: ItemImageGalleryProps) {
  const images = item.images && item.images.length > 0 
    ? [...item.images].sort((a, b) => a.orderIndex - b.orderIndex)
    : item.imageUrl 
      ? [{ id: 'main', url: item.imageUrl, isPrimary: true, orderIndex: 0 }] 
      : [];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    if (isLightboxOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, selectedIndex]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  if (images.length === 0) {
    return (
      <div className={cn("aspect-[4/3] w-full bg-[#121726]/40 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center border border-white/10", className)}>
        <div className="flex flex-col items-center text-gray-600">
           <Zap className="w-16 h-16 opacity-20 mb-3" />
           <span className="text-sm uppercase tracking-[0.2em] font-black opacity-40">No Visuals Available</span>
        </div>
      </div>
    );
  }

  const selectedImage = images[selectedIndex];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Image Container */}
      <motion.div 
        layoutId="main-image"
        className="relative group w-full aspect-[4/3] bg-[#0B0F1A] rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl cursor-none"
        onClick={() => setIsLightboxOpen(true)}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedImage.url}
            src={selectedImage.url}
            alt={item.name}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
          />
        </AnimatePresence>
        
        {/* Glass Overlay Hover Effect */}
        <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        {/* Dynamic Badge */}
        <div className="absolute top-6 left-6 p-1 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center gap-3">
             <div className="size-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Maximize2 size={18} className="text-white" />
             </div>
             <span className="pr-4 text-xs font-black text-white uppercase tracking-widest hidden group-hover:block transition-all animate-in slide-in-from-left-2">Expand View</span>
        </div>

        {/* Custom Cursor (Demo specific indicator) */}
        <div className="absolute inset-0 z-10 hidden group-hover:flex items-center justify-center pointer-events-none">
            <motion.div 
               initial={{ scale: 0, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="size-20 rounded-full bg-blue-600/20 backdrop-blur-md border border-white/20 flex items-center justify-center"
            >
                <div className="size-2 bg-blue-500 rounded-full animate-ping" />
            </motion.div>
        </div>
      </motion.div>

      {/* Thumbnails Grid */}
      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {images.map((img, idx) => (
            <motion.button
              key={img.id || idx}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedIndex(idx)}
              className={cn(
                "relative flex-shrink-0 w-24 h-24 rounded-3xl overflow-hidden border-2 transition-all duration-500 group/thumb",
                selectedIndex === idx 
                  ? "border-blue-500 shadow-xl shadow-blue-500/20 scale-105 z-10" 
                  : "border-white/5 opacity-40 hover:opacity-100 hover:border-white/20"
              )}
            >
              <img src={img.url} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover transition-transform duration-700 group-hover/thumb:scale-110" />
              {selectedIndex === idx && (
                <div className="absolute inset-0 bg-blue-600/10 pointer-events-none" />
              )}
            </motion.button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#0B0F1A]/98 backdrop-blur-2xl flex items-center justify-center p-6 md:p-12"
          >
            <motion.button 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setIsLightboxOpen(false)}
                className="absolute top-8 right-8 size-14 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all border border-white/10 z-[210] group"
            >
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
            </motion.button>

            {images.length > 1 && (
              <>
                <button 
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                    className="absolute left-8 top-1/2 -translate-y-1/2 size-16 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all border border-white/10 z-[210]"
                >
                    <ChevronLeft className="w-8 h-8" />
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    className="absolute right-8 top-1/2 -translate-y-1/2 size-16 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all border border-white/10 z-[210]"
                >
                    <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            <div className="relative w-full h-full flex items-center justify-center" onClick={() => setIsLightboxOpen(false)}>
                <motion.img
                    layoutId="main-image"
                    key={selectedImage.url}
                    src={selectedImage.url}
                    alt={item.name}
                    className="max-w-full max-h-full object-contain shadow-[0_0_100px_rgba(59,130,246,0.1)] rounded-[2rem] border border-white/5"
                    onClick={(e) => e.stopPropagation()}
                />
                
                {images.length > 1 && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl backdrop-blur-xl border border-white/10">
                        {images.map((_, i) => (
                            <motion.div 
                                key={i} 
                                animate={{ 
                                    width: i === selectedIndex ? 24 : 8,
                                    backgroundColor: i === selectedIndex ? "rgb(59, 130, 246)" : "rgba(255, 255, 255, 0.2)"
                                }}
                                className="h-2 rounded-full transition-all duration-300"
                            />
                        ))}
                    </div>
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
