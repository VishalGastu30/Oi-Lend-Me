"use client";

import { useEffect, useState } from 'react';
import { Check, Clock, Package, ArrowRight, User as UserIcon, AlertCircle, Box, Send, Coins } from "lucide-react";
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type Activity = {
  id: string;
  type: 'BORROW' | 'LEND' | 'RETURN' | 'GROUP_REQUEST';
  status: string; 
  isMyItem: boolean;
  item: { id: string; name: string; imageUrl: string | null; ownerId: string | null };
  user: { id: string; name: string; avatarUrl: string | null };
  createdAt: string;
};

// Karma points mapping based on status and role
function getKarmaPoints(status: string, isMyItem: boolean): number {
  if (status === 'RETURNED') {
    return isMyItem ? 5 : 5; // Owner gets +5, Borrower gets +5
  }
  if (status === 'BORROWED') {
    return isMyItem ? 3 : 0; // Owner gets +3 when item is picked up
  }
  return 0;
}

function getStatusConfig(status: string, isMyItem: boolean, type: Activity['type']) {
    const karmaPoints = getKarmaPoints(status, isMyItem);
    
    if (type === 'GROUP_REQUEST') {
        switch (status) {
            case 'PENDING':
                return {
                    icon: Clock,
                    color: 'text-blue-400',
                    bg: 'bg-blue-400/20',
                    border: 'border-blue-400',
                    label: 'Application Pending',
                    oiText: "Your group request is under review.",
                    karmaPoints: 0
                };
            case 'APPROVED':
                return {
                    icon: Check,
                    color: 'text-emerald-500',
                    bg: 'bg-emerald-500/20',
                    border: 'border-emerald-500',
                    label: 'Group Approved!',
                    oiText: "Your institutional group has been verified and created.",
                    karmaPoints: 50
                };
            case 'REJECTED':
                return {
                    icon: AlertCircle,
                    color: 'text-red-500',
                    bg: 'bg-red-500/20',
                    border: 'border-red-500',
                    label: 'Application Rejected',
                    oiText: "Your group request was not approved.",
                    karmaPoints: 0
                };
            case 'NEEDS_EDIT':
                return {
                    icon: Send,
                    color: 'text-orange-500',
                    bg: 'bg-orange-500/20',
                    border: 'border-orange-500',
                    label: 'Changes Requested',
                    oiText: "Admin requested changes to your application. Please update.",
                    karmaPoints: 0
                };
            default:
                 return {
                    icon: Package,
                    color: 'text-gray-400',
                    bg: 'bg-gray-400/20',
                    border: 'border-gray-400',
                    label: 'Group Activity',
                    oiText: "Group status updated.",
                    karmaPoints: 0
                };
        }
    }

    switch (status) {
        case 'RETURNED':
            return {
                icon: Check,
                color: 'text-green-500',
                bg: 'bg-green-500/20',
                border: 'border-green-500',
                label: 'Returned',
                oiText: isMyItem 
                    ? `Item returned to you. Transaction complete. 🤝` 
                    : `You returned this item. Thanks for sharing! 🤝`,
                karmaPoints
            };
        case 'BORROWED':
            return {
                icon: Box,
                color: 'text-blue-500',
                bg: 'bg-blue-500/20',
                border: 'border-blue-500',
                label: isMyItem ? 'Lent Out' : 'Borrowed',
                oiText: isMyItem 
                    ? `You lent this item. It's now with the borrower.` 
                    : `You borrowed this item. Take care of it!`,
                karmaPoints
            };
        case 'APPROVED':
             return {
                icon: Check,
                color: 'text-yellow-500',
                bg: 'bg-yellow-500/20',
                border: 'border-yellow-500',
                label: 'Approved',
                oiText: isMyItem 
                    ? `You approved the request. Awaiting pickup.` 
                    : `Request approved! Go pick it up.`,
                karmaPoints: 0
            };
        case 'REQUESTED':
        case 'PENDING':
             return {
                icon: Send,
                color: 'text-blue-400',
                bg: 'bg-blue-400/20',
                border: 'border-blue-400',
                label: 'Requested',
                oiText: isMyItem 
                    ? `New request for your item.` 
                    : `You requested this item.`,
                karmaPoints: 0
            };
        case 'REJECTED':
             return {
                icon: AlertCircle,
                color: 'text-red-500',
                bg: 'bg-red-500/20',
                border: 'border-red-500',
                label: 'Rejected',
                oiText: isMyItem 
                    ? `You rejected this request.` 
                    : `Request was rejected.`,
                karmaPoints: 0
            };
        default:
            return {
                icon: Package,
                color: 'text-gray-400',
                bg: 'bg-gray-400/20',
                border: 'border-gray-400',
                label: status,
                oiText: "Activity updated.",
                karmaPoints: 0
            };
    }
}

export function ActivityTimeline() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivity() {
      try {
        const res = await fetch('/api/activity');
        if (res.ok) {
          const data = await res.json();
          setActivities(data.data || []);
        }
      } catch (e) {
        console.error("Failed to fetch activity", e);
      } finally {
        setLoading(false);
      }
    }
    fetchActivity();
  }, []);

  if (loading) {
      return (
        <div className="flex justify-center p-10">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      );
  }

  // Helper loader for missing import
  function Loader2({ className }: { className?: string }) {
      return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      );
  }

  if (activities.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center p-12 bg-[#1A2030] rounded-2xl border border-white/5">
              <Clock className="w-12 h-12 text-gray-600 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No activity yet</h3>
              <p className="text-gray-400 text-center text-sm">Your history will appear here.</p>
          </div>
      );
  }

  return (
    <div className="bg-[#1A2030] rounded-3xl p-6 md:p-8 border border-white/5 shadow-xl max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white">Your Timeline</h2>
        </div>

        <ScrollArea className="h-[600px] pr-4">
            <div className="relative pl-4">
                {/* Vertical Timeline Line */}
                <div className="absolute left-[29px] top-4 bottom-4 w-[2px] bg-[#2A3040]" />

                <div className="space-y-8">
                    {activities.map((activity) => {
                        const config = getStatusConfig(activity.status, activity.isMyItem, activity.type);
                        const Icon = config.icon;
                        
                        return (
                            <div key={activity.id} className="relative flex gap-6 group">
                                {/* Icon Node */}
                                <div className={cn(
                                    "relative z-10 w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                                    "bg-[#232936] border-2",
                                    config.border
                                )}>
                                    <div className={cn("p-2 rounded-lg", config.bg)}>
                                         <Icon className={cn("w-6 h-6", config.color)} />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 pt-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
                                        <h3 className="text-lg font-bold text-white truncate">
                                            {config.label} – {activity.item.name}
                                        </h3>
                                        
                                        {/* Karma Points Badge */}
                                        {config.karmaPoints > 0 && (
                                            <div className="flex items-center gap-1 bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                                                <Coins className="w-3 h-3" />
                                                +{config.karmaPoints} Karma
                                            </div>
                                        )}
                                        
                                        {/* Status Tags */}
                                        {activity.status === 'RETURNED' && (
                                            <span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                                                On Time
                                            </span>
                                        )}
                                        {activity.status === 'REJECTED' && (
                                             <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                                                Failed
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-gray-400 text-base mb-2 font-medium">
                                        {config.oiText}
                                    </p>
                                    
                                     {/* User Context */}
                                    <div className="text-sm text-gray-500 mb-2">
                                        {activity.isMyItem ? `To ${activity.user.name}` : `From ${activity.user.name}`}
                                    </div>

                                    <p className="text-xs text-gray-600 font-medium">
                                        {format(new Date(activity.createdAt), "MMM d, yyyy • h:mm a")}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </ScrollArea>
    </div>
  );
}
