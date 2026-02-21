
"use client";

import { cn } from "@/lib/utils";
import { RefreshCcw, Trash2 } from "lucide-react";
import Link from "next/link";
import { ItemCardProps } from "@/components/home/ItemCard";

interface ArchiveCardProps extends ItemCardProps {
    onDelete?: (id: string) => void;
}

export function ArchiveCard({ id, name, category, status, imageUrl, owner, onDelete }: ArchiveCardProps) {
  return (
    <div className="group glass-card rounded-2xl p-4 transition-all duration-300 hover:border-gray-500/50 flex flex-col h-full grayscale hover:grayscale-0">
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-gray-800">
        <div className="absolute top-3 left-3 z-10">
            <span className="status-badge bg-gray-500/20 text-gray-400 border border-gray-500/30">Archived</span>
        </div>
        {imageUrl ? (
            <div 
                className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105 opacity-50 group-hover:opacity-100" 
                style={{backgroundImage: `url("${imageUrl}")`}} 
            />
        ) : (
            <div className="w-full h-full flex items-center justify-center bg-white/5 text-gray-500">
                <span className="material-symbols-outlined text-4xl">image_not_supported</span>
            </div>
        )}
      </div>

      <div className="flex justify-between items-start mb-3 grow">
        <div>
          <h3 className="font-bold text-lg text-gray-400 group-hover:text-white transition-colors line-clamp-1">{name}</h3>
          <div className="flex items-center gap-2 mt-1">
             <span className="text-xs text-gray-500 font-medium">{category}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-3 border-t border-white/5 mt-auto">
        <Link 
            href={`/items/new?repost=${id}`}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white transition-all font-medium text-sm"
        >
            <RefreshCcw size={14} /> Repost
        </Link>
        {onDelete && (
            <button 
                onClick={() => onDelete(id)}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white transition-all"
                title="Delete Permanently"
            >
                <Trash2 size={14} />
            </button>
        )}
      </div>
    </div>
  );
}
