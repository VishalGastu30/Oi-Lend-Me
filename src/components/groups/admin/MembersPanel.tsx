"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MoreVertical, ShieldAlert, ShieldCheck, 
  UserMinus, AlertTriangle, Ban, Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Member {
  userId: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

interface MembersPanelProps {
  members: Member[];
  isAdmin: boolean;
  groupId: string;
  onAction?: () => void;
}

export function MembersPanel({ members, isAdmin, groupId, onAction }: MembersPanelProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleModerationAction = async (userId: string, actionType: 'warn' | 'suspend' | 'ban') => {
    const reason = prompt(`Please enter a reason to ${actionType} this user:`);
    if (!reason) return;

    setLoadingAction(`${userId}-${actionType}`);
    try {
      const res = await fetch(`/api/admin/users/${userId}/${actionType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Failed to ${actionType} user`);
      }
      
      toast.success(`User ${actionType}ed successfully.`);
      if (onAction) onAction();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || `Could not ${actionType} user.`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'ADMIN' | 'MEMBER') => {
    setLoadingAction(`${userId}-role`);
    try {
      const res = await fetch(`/api/groups/${groupId}/members/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update role");
      }

      toast.success(`Member role updated to ${newRole}`);
      if (onAction) onAction();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Could not update member role");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this member from the group?")) return;

    setLoadingAction(`${userId}-remove`);
    try {
      const res = await fetch(`/api/groups/${groupId}/members/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to remove member");
      }

      toast.success("Member removed from group");
      if (onAction) onAction();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Could not remove member");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="glass-card rounded-xl p-6 border border-white/5">
      <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Members 
            <Badge variant="secondary" className="bg-white/10 hover:bg-white/10 text-white font-normal px-2 rounded-full">
                {members.length}
            </Badge>
          </h2>
      </div>

      <div className="space-y-3">
        {members.map((member) => (
          <div key={member.userId} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10 border border-white/10">
                <AvatarImage src={member.user.avatarUrl} />
                <AvatarFallback className="bg-blue-500/20 text-blue-400 font-bold">
                  {member.user.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <p className="text-white font-medium text-sm flex items-center gap-2">
                  {member.user.name}
                  {member.role === 'ADMIN' && (
                    <span className="inline-flex" title="Admin">
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                          <polyline points="20 6 9 17 4 12"></polyline>
                       </svg>
                    </span>
                  )}
                  {member.role === 'OWNER' && (
                    <span className="inline-flex" title="Owner">
                       <ShieldCheck size={14} className="text-purple-400" />
                    </span>
                  )}
                </p>
                <p className="text-xs text-white/50">{member.user.email}</p>
              </div>
            </div>

            {isAdmin && member.role !== 'OWNER' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="group-hover:opacity-100 opacity-0 transition-opacity h-8 w-8 text-white/60 hover:text-white hover:bg-white/10">
                     {loadingAction?.startsWith(member.userId) ? (
                         <span className="animate-spin w-4 h-4 rounded-full border-2 border-white/20 border-t-white"></span>
                     ) : (
                         <MoreVertical size={16} />
                     )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-[#1A1F2E] border-white/10 text-white">
                  
                  {member.role === 'MEMBER' ? (
                      <DropdownMenuItem onClick={() => handleRoleChange(member.userId, 'ADMIN')} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                        <ShieldCheck className="mr-2 h-4 w-4 text-emerald-400" />
                        <span>Promote to Admin</span>
                      </DropdownMenuItem>
                  ) : (
                      <DropdownMenuItem onClick={() => handleRoleChange(member.userId, 'MEMBER')} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                        <UserMinus className="mr-2 h-4 w-4 text-orange-400" />
                        <span>Demote to Member</span>
                      </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator className="bg-white/10" />
                  
                  <DropdownMenuItem onClick={() => handleModerationAction(member.userId, 'warn')} className="hover:bg-yellow-500/20 focus:bg-yellow-500/20 text-yellow-500 cursor-pointer">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    <span>Warn User</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => handleModerationAction(member.userId, 'suspend')} className="hover:bg-orange-500/20 focus:bg-orange-500/20 text-orange-400 cursor-pointer">
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    <span>Suspend (7 Days)</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => handleModerationAction(member.userId, 'ban')} className="hover:bg-red-500/20 focus:bg-red-500/20 text-red-500 font-medium cursor-pointer">
                    <Ban className="mr-2 h-4 w-4" />
                    <span>Permanent Ban</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="bg-white/10" />
                  
                  <DropdownMenuItem onClick={() => handleRemoveMember(member.userId)} className="hover:bg-red-500/20 focus:bg-red-500/20 text-red-400 cursor-pointer">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Remove from Group</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        ))}

        {members.length === 0 && (
            <div className="text-center py-8 text-white/40">
                No members found.
            </div>
        )}
      </div>
    </div>
  );
}
