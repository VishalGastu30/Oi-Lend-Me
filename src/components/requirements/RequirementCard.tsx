"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, AlertCircle, User, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

type RequirementCardProps = {
  requirement: {
    id: string;
    title: string;
    description?: string | null;
    category: string;
    durationStart: string | Date;
    durationEnd: string | Date;
    urgency: "NORMAL" | "URGENT";
    createdAt: string | Date;
    requester: {
      id: string;
      name: string;
      avatarUrl?: string | null;
      karmaScore: number;
    };
    _count?: {
      responses: number;
    };
  };
  onRespond: (id: string) => void;
  currentUserId?: string;
};

export function RequirementCard({ requirement, onRespond, currentUserId }: RequirementCardProps) {
  const isOwn = currentUserId === requirement.requester.id;
  const responseCount = requirement._count?.responses || 0;

  const durationDays = Math.ceil(
    (new Date(requirement.durationEnd).getTime() - new Date(requirement.durationStart).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={cn(
        "group relative bg-[#121726]/40 backdrop-blur-xl border rounded-[2rem] p-6 transition-all duration-300 hover:shadow-2xl",
        requirement.urgency === "URGENT"
          ? "border-orange-500/30 hover:border-orange-500/50 shadow-orange-500/10"
          : "border-white/5 hover:border-white/10"
      )}
    >
      {/* Urgency Badge */}
      {requirement.urgency === "URGENT" && (
        <div className="absolute -top-3 -right-3">
          <Badge className="bg-orange-600 text-white border-none px-3 py-1 rounded-full font-black uppercase text-[10px] tracking-widest flex items-center gap-1.5 shadow-lg">
            <AlertCircle size={12} />
            Urgent
          </Badge>
        </div>
      )}

      <div className="flex items-start gap-4 mb-4">
        {/* Requester Avatar */}
        <Avatar className="size-12 border-2 border-white/10 shadow-lg">
          <AvatarImage src={requirement.requester.avatarUrl || undefined} />
          <AvatarFallback className="bg-blue-600/20 text-blue-400 font-bold">
            {requirement.requester.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Requester Info */}
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-white">{requirement.requester.name}</h4>
            <div className="flex items-center gap-1 text-yellow-500 text-xs">
              <Award size={14} />
              <span className="font-black">{requirement.requester.karmaScore}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 font-medium">
            {formatDistanceToNow(new Date(requirement.createdAt), { addSuffix: true })}
          </p>
        </div>

        {/* Category Badge */}
        <Badge className="bg-white/5 text-gray-300 border-white/10 px-3 py-1 rounded-full font-bold text-xs">
          {requirement.category}
        </Badge>
      </div>

      {/* Title */}
      <h3 className="text-xl font-black text-white mb-3 leading-tight group-hover:text-blue-400 transition-colors">
        {requirement.title}
      </h3>

      {/* Description Preview */}
      {requirement.description && (
        <p className="text-sm text-gray-400 mb-4 line-clamp-2 leading-relaxed">
          {requirement.description}
        </p>
      )}

      {/* Duration Info */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2 text-gray-400">
          <Calendar size={16} className="text-blue-400" />
          <span className="font-medium">
            {new Date(requirement.durationStart).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <Clock size={16} className="text-blue-400" />
          <span className="font-medium">
            {durationDays} {durationDays === 1 ? "day" : "days"}
          </span>
        </div>
      </div>

      {/* Response Count */}
      {responseCount > 0 && (
        <div className="mb-4 px-3 py-2 rounded-xl bg-blue-600/10 border border-blue-500/20">
          <p className="text-xs font-bold text-blue-400">
            {responseCount} {responseCount === 1 ? "offer" : "offers"} received
          </p>
        </div>
      )}

      {/* CTA Button */}
      {!isOwn && (
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => onRespond(requirement.id)}
            className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all"
          >
            I Can Lend This
          </Button>
        </motion.div>
      )}

      {isOwn && (
        <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Your Request</p>
        </div>
      )}
    </motion.div>
  );
}
