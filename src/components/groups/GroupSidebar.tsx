"use client";

import { cn } from "@/lib/utils";
import { Camera, Package, CheckCircle, Clock, Wrench, Users, Settings, PieChart, Calendar } from "lucide-react";

interface GroupSidebarProps {
  groupName: string;
  isPremium?: boolean;
  activeView: string;
  onViewChange: (view: string) => void;
  isAdmin: boolean;
}

export function GroupSidebar({ groupName, isPremium = false, activeView, onViewChange, isAdmin }: GroupSidebarProps) {
  
  const navItems = [
    { id: 'inventory', label: 'All Items', icon: Package },
    { id: 'calendar', label: 'Booking Calendar', icon: Calendar },
    { id: 'available', label: 'Available', icon: CheckCircle },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'members', label: 'Members', icon: Users },
  ];

  if (isAdmin) {
    navItems.push({ id: 'analytics', label: 'analytics', icon: PieChart });
  }

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:block">
        <div className="glass-card rounded-xl p-4 sticky top-24 flex flex-col gap-6">
            <div className="flex items-center gap-3 px-2">
                <div className="size-12 rounded-xl bg-gradient-to-br from-[#4F9DFF] to-blue-600 flex items-center justify-center text-white shrink-0">
                    <Camera size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-sm text-white line-clamp-1" title={groupName}>{groupName}</h3>
                    {isPremium && <p className="text-xs text-[#4F9DFF]">Premium Group</p>}
                </div>
            </div>
            
            <div className="space-y-1">
                {navItems.map((item) => (
                    <button 
                        key={item.id}
                        onClick={() => onViewChange(item.id)}
                        className={cn(
                            "flex items-center gap-3 px-4 py-2.5 rounded-xl w-full text-left transition-all", 
                            activeView === item.id 
                                ? "bg-[#4F9DFF]/10 text-[#4F9DFF]" 
                                : "text-white/60 hover:bg-white/5 hover:text-white"
                        )}
                    >
                        <item.icon size={20} />
                        <span className="text-sm font-medium capitalize">{item.label}</span>
                    </button>
                ))}
            </div>

            {isAdmin && (
                <div className="mt-4 pt-4 border-t border-white/10">
                    <button 
                        onClick={() => onViewChange('manage')}
                        className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                    >
                        <Settings size={18} />
                        Manage Group
                    </button>
                </div>
            )}
        </div>
    </aside>
  );
}
