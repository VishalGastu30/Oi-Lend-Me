"use client";

import { MoreVertical, Filter, Plus, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addDays, isSameDay, startOfDay } from "date-fns";
import { toast } from "sonner";
import { ReportModal } from "@/components/modals/ReportModal";
import { useState } from "react";

interface Booking {
  startDate: string | Date;
  endDate: string | Date;
  status: string;
}

interface GroupItem {
  id: string;
  name: string;
  description: string | null;
  category: string;
  condition: string | null;
  availabilityStatus: "AVAILABLE" | "ON_LOAN" | "MAINTENANCE" | "LOST";
  imageUrls: string[];
  bookings: Booking[];
}

interface GroupInventoryProps {
  items: GroupItem[];
  isAdmin: boolean;
  onAddItem: () => void;
  onBook?: (item: GroupItem) => void;
  groupId?: string;
  onRefresh?: () => void;
}

export function GroupInventory({ items, isAdmin, onAddItem, onBook, groupId, onRefresh }: GroupInventoryProps) {
  const [reportItem, setReportItem] = useState<GroupItem | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  // Generate next 7 days
  const today = startOfDay(new Date());
  const next7Days = Array.from({ length: 7 }, (_, i) => addDays(today, i));

  const getDayStatus = (date: Date, bookings: Booking[]) => {
    const isBooked = bookings.some((booking) => {
      const start = startOfDay(new Date(booking.startDate));
      const end = startOfDay(new Date(booking.endDate));
      return date >= start && date < end; 
    });
    return isBooked ? "BOOKED" : "FREE";
  };

  return (
    <>

        {/* Page Heading & Controls */}
        <section className="flex flex-wrap justify-between items-end gap-4">
            <div className="max-w-xl">
                <h2 className="text-2xl font-bold mb-1 text-white">Group Equipment Hub</h2>
                <p className="text-white/60 text-sm">Manage and book collective gear. Real-time availability shown below.</p>
            </div>
            <div className="flex gap-3">
                <button className="glass-card p-2.5 rounded-xl text-white/70 hover:text-white transition-all border border-white/5 hover:border-white/10">
                    <Filter size={20} />
                </button>
                {isAdmin && (
                    <button 
                        onClick={onAddItem}
                        className="bg-white/10 hover:bg-white/15 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all border border-white/5"
                    >
                        <Plus size={18} />
                        Add Equipment
                    </button>
                )}
            </div>
        </section>

        {/* Item List */}
        <div className="grid gap-4 mt-6">
            {items.length === 0 ? (
                <div className="text-center py-12 glass-card rounded-xl">
                    <p className="text-white/40">No equipment listed yet.</p>
                </div>
            ) : (
                items.map((item, itemIdx) => (
                    <div key={item.id} className="glass-card rounded-xl p-5 group hover:bg-white/5 transition-all border border-white/5 hover:border-white/10">
                        <div className="flex flex-col xl:flex-row gap-6">
                            <div className="flex gap-4 min-w-[300px]">
                                <div 
                                    className="size-20 rounded-lg bg-center bg-cover bg-white/10 shrink-0" 
                                    style={{backgroundImage: `url("${item.imageUrls[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop'}")`}}
                                />
                                <div className="flex flex-col justify-center">
                                    <h4 className="font-bold text-lg mb-1 text-white">{item.name}</h4>
                                    <div className="flex items-center gap-2">
                                        {item.availabilityStatus === "AVAILABLE" && <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-wider">Available</span>}
                                        {item.availabilityStatus === "ON_LOAN" && <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold uppercase tracking-wider">On Loan</span>}
                                        {item.availabilityStatus === "MAINTENANCE" && <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider">Maintenance</span>}
                                        <span className="text-white/40 text-xs hidden sm:inline">Category: {item.category}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Calendar */}
                            <div className="flex-1 flex flex-col gap-2">
                                <div className="flex justify-between items-center text-[10px] text-white/40 font-bold uppercase tracking-widest px-1">
                                    <span>Availability (Next 7 Days)</span>
                                    {itemIdx === 0 && ( /* Show legend only on first item */
                                         <div className="flex gap-3 hidden sm:flex">
                                            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-[#4F9DFF]"></span> Booked</span>
                                            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-white/10"></span> Free</span>
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-7 gap-1 h-12">
                                    {next7Days.map((date, idx) => {
                                        const status = getDayStatus(date, item.bookings);
                                        const dayName = format(date, "EEE"); 
                                        const dayNum = format(date, "d");
                                        
                                        return (
                                            <div 
                                                key={idx} 
                                                className={cn(
                                                    "rounded-lg flex flex-col items-center justify-center p-1 transition-colors",
                                                    status === "BOOKED" ? "bg-[#4F9DFF] text-[#0f1823]" : "bg-white/5 border border-white/5 text-white/40"
                                                )}
                                                title={`${format(date, "yyyy-MM-dd")}: ${status}`}
                                            >
                                                <span className={cn("text-[8px] sm:text-[9px] uppercase", status === "BOOKED" ? "opacity-70" : "")}>{dayName}</span>
                                                <span className={cn("text-xs font-bold", status === "BOOKED" ? "" : "text-white")}>{dayNum}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 xl:border-l border-white/10 xl:pl-6 mt-4 xl:mt-0">
                                {item.availabilityStatus === "AVAILABLE" ? (
                                    <button 
                                        onClick={() => onBook && onBook(item)}
                                        className="flex-1 xl:flex-none px-6 py-2.5 bg-[#4F9DFF]/10 hover:bg-[#4F9DFF]/20 text-[#4F9DFF] rounded-xl text-sm font-bold transition-all"
                                    >
                                        Reserve
                                    </button>
                                ) : item.availabilityStatus === "MAINTENANCE" ? (
                                    <button className="flex-1 xl:flex-none px-6 py-2.5 bg-red-500/10 text-red-400 cursor-not-allowed rounded-xl text-sm font-bold">
                                        Under Maintenance
                                    </button>
                                ) : (
                                    <button className="flex-1 xl:flex-none px-6 py-2.5 bg-white/5 text-white/40 cursor-not-allowed rounded-xl text-sm font-bold">Waitlist</button>
                                )}
                                {isAdmin && groupId && item.availabilityStatus !== "MAINTENANCE" && (
                                    <button 
                                        onClick={async () => {
                                            try {
                                                const res = await fetch(`/api/groups/${groupId}/items/${item.id}/status`, {
                                                    method: 'PATCH',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ status: 'MAINTENANCE' })
                                                });
                                                if (res.ok) { toast.success('Marked as maintenance'); onRefresh?.(); }
                                                else toast.error('Failed to update status');
                                            } catch { toast.error('Network error'); }
                                        }}
                                        className="p-2.5 rounded-xl hover:bg-red-500/10 text-red-400/60 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"
                                        title="Mark as Maintenance"
                                    >
                                        <Wrench size={18} />
                                    </button>
                                )}
                                {isAdmin && groupId && item.availabilityStatus === "MAINTENANCE" && (
                                    <button 
                                        onClick={async () => {
                                            try {
                                                const res = await fetch(`/api/groups/${groupId}/items/${item.id}/status`, {
                                                    method: 'PATCH',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ status: 'AVAILABLE' })
                                                });
                                                if (res.ok) { toast.success('Returned from maintenance'); onRefresh?.(); }
                                                else toast.error('Failed to update status');
                                            } catch { toast.error('Network error'); }
                                        }}
                                        className="px-4 py-2 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 text-sm font-bold transition-all"
                                    >
                                        Return to Available
                                    </button>
                                )}
                                <div className="relative">
                                    <button 
                                        onClick={() => setMenuOpenId(menuOpenId === item.id ? null : item.id)}
                                        className="p-2.5 rounded-xl hover:bg-white/10 text-white/50 transition-all border border-transparent hover:border-white/10"
                                    >
                                        <MoreVertical size={20} />
                                    </button>
                                    
                                    {menuOpenId === item.id && (
                                        <div className="absolute right-0 top-11 z-[50] bg-[#1E2330] border border-white/10 rounded-xl shadow-2xl min-w-[160px] overflow-hidden backdrop-blur-xl">
                                            <button
                                                onClick={() => {
                                                    setReportItem(item);
                                                    setMenuOpenId(null);
                                                }}
                                                className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                                            >
                                                Report Equipment
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>

        {reportItem && (
            <ReportModal
                isOpen={!!reportItem}
                onClose={() => setReportItem(null)}
                entityType="ITEM"
                entityId={reportItem.id}
                entityName={reportItem.name}
            />
        )}
    </>
  );
}
