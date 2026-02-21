"use client";

import { cn } from "@/lib/utils";
import { Grid, Cpu, Wrench, Trophy, BookOpen, FlaskConical, GraduationCap } from "lucide-react"; 

interface SidebarProps {
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
}

import { motion } from "framer-motion";

export function Sidebar({ activeCategory = "All Items", onCategoryChange }: SidebarProps) {
  const categories = [
    { name: "All Items", icon: Grid, id: "All Items" },
    { name: "Electronics", icon: Cpu, id: "Electronics" },
    { name: "Lab", icon: FlaskConical, id: "Lab" },
    { name: "Class", icon: GraduationCap, id: "Class" },
    { name: "Books", icon: BookOpen, id: "Books" },
    { name: "Chargers", icon: Cpu, id: "Chargers" },
    { name: "Misc", icon: Wrench, id: "Misc" },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 gap-8">
      <div className="flex flex-col gap-6 sticky top-28">
        <div>
          <h3 className="text-white text-lg font-bold mb-1 tracking-tight">Browse Categories</h3>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">Explore the inventory</p>
        </div>
        <div className="flex flex-col gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange?.(cat.id)}
              className="relative group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 overflow-hidden"
            >
              {/* Active Background Indicator */}
              {activeCategory === cat.id && (
                <motion.div 
                  layoutId="active-category"
                  className="absolute inset-0 bg-blue-600 shadow-lg shadow-blue-500/20"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              
              {/* Hover Background Indicator */}
              <div className={cn(
                "absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                activeCategory === cat.id && "hidden"
              )} />

              <span className={cn(
                "relative z-10 transition-colors duration-300 flex items-center gap-3",
                activeCategory === cat.id ? "text-white" : "text-gray-400 group-hover:text-gray-100"
              )}>
                <cat.icon size={18} className={cn(
                    "transition-transform group-hover:scale-110",
                    activeCategory === cat.id ? "text-white" : "text-blue-500/60"
                )} />
                <span className="text-sm font-semibold">{cat.name}</span>
              </span>
              
              {activeCategory === cat.id && (
                <motion.div 
                  layoutId="active-dot"
                  className="absolute right-4 size-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" 
                />
              )}
            </button>
          ))}
        </div>
        
        {/* Help / Tip Card */}
        <div className="mt-8 p-6 rounded-3xl bg-gradient-to-br from-blue-500/10 to-transparent border border-white/5 relative overflow-hidden group/tip">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10" />
            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="size-1.5 bg-blue-500 rounded-full animate-pulse" />
                Quick Tip
            </h4>
            <p className="text-gray-400 text-[11px] leading-relaxed">
                Build your trust score by returning items on time. Higher scores unlock more gear!
            </p>
        </div>
      </div>
    </aside>
  );
}

