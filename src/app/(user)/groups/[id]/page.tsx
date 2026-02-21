"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { GroupSidebar } from "@/components/groups/GroupSidebar";
import { GroupHeader } from "@/components/groups/GroupHeader";
import { GroupInventory } from "@/components/groups/GroupInventory";
import { BookingCalendar } from "@/components/groups/BookingCalendar";
import { JoinRequests } from "@/components/groups/admin/JoinRequests";
import { AddItemModal } from "@/components/groups/admin/AddItemModal";
import { MembersPanel } from "@/components/groups/admin/MembersPanel";
import { BookItemModal } from "@/components/groups/BookItemModal";
import { AnalyticsDashboard } from "@/components/groups/AnalyticsDashboard";
import { Loader2, Lock, Shield, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { ReportModal } from "@/components/modals/ReportModal";

interface GroupData {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  memberCount: number;
  itemCount: number;
  isVerified: boolean;
  category: string;
  visibility: string;
  status?: string;
  bannedUntil?: string | null;
  members: any[];
  owner: { email: string };
}

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;
  
  const [group, setGroup] = useState<GroupData | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeView, setActiveView] = useState("inventory"); // inventory, available, borrowed, maintenance, members, analytics, calendar, manage
  const [showAddItem, setShowAddItem] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  
  // Booking state
  const [bookingItem, setBookingItem] = useState<{ id: string; name: string } | null>(null);

  async function fetchGroupData() {
      if (!groupId) return;
      
      try {
        setLoading(true);

        // Fetch session
        const sessionRes = await fetch('/api/auth/session');
        const sessionData = await sessionRes.json();
        const user = sessionData.user;
        
        if (user?.role === 'ADMIN') {
          setIsSuperAdmin(true);
        }

        // Fetch group details
        const groupRes = await fetch(`/api/groups/${groupId}`);
        
        if (groupRes.status === 404) {
          router.push('/groups');
          return;
        }
        
        const groupData = await groupRes.json();
        setGroup(groupData.data.group);

        // Check membership
        if (user?.email) {
            const currentUserMember = groupData.data.group.members.find(
                (m: any) => m.user.email === user.email
            );
            
            if (currentUserMember) {
                setIsMember(true);
                if (currentUserMember.role === 'ADMIN') {
                     setIsAdmin(true);
                 }
            } else if (groupData.data.group.owner?.email === user.email) {
                // Owner is implicitly admin
                setIsMember(true);
                setIsAdmin(true);
            }
        }

        // Fetch items
        const itemsRes = await fetch(`/api/groups/${groupId}/items`);
        if (itemsRes.ok) {
            const itemsData = await itemsRes.json();
            setItems(itemsData.items || []);
        }

      } catch (error) {
        console.error('Failed to fetch group data:', error);
      } finally {
        setLoading(false);
      }
  }

  useEffect(() => {
    fetchGroupData();
  }, [groupId, router]);

  const refreshItems = async () => {
       const itemsRes = await fetch(`/api/groups/${groupId}/items`);
        if (itemsRes.ok) {
            const itemsData = await itemsRes.json();
            setItems(itemsData.items || []);
        }
  };

  const handleJoinGroup = async () => {
      const message = prompt("Optional message for group admins:");
      if (message !== null) {
          try {
              const res = await fetch(`/api/groups/${groupId}/join-requests`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ message })
              });
              const data = await res.json();
              
              if (!res.ok) {
                  throw new Error(data.error || "Failed to submit request");
              }
              
              toast.success("Join request submitted!");
          } catch (error: any) {
              console.error(error);
              toast.error(error.message || "Failed to submit request");
          }
      }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!group) return null;

  // Filter items based on active view
  let displayedItems = items;
  if (activeView === 'available') {
      displayedItems = items.filter(i => i.availabilityStatus === 'AVAILABLE');
  } else if (activeView === 'maintenance') {
      displayedItems = items.filter(i => i.availabilityStatus === 'MAINTENANCE');
  }

  // --- BANNED GROUP ENFORCEMENT ---
  const isBanned = (group.status as string) === 'TEMP_BANNED' || (group.status as string) === 'PERMA_BANNED';
  if (isBanned && !isSuperAdmin) {
    const isPermanent = (group.status as string) === 'PERMA_BANNED';
    return (
      <div className="min-h-screen bg-[#0B0F1A] pt-20 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full glass-card p-10 rounded-2xl border border-red-500/20 shadow-[0_20px_40px_rgba(239,68,68,0.1)] flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Group Restricted</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            {isPermanent 
              ? "This group has been permanently banned for violating community guidelines." 
              : `This group is temporarily restricted ${group.bannedUntil ? `until ${new Date(group.bannedUntil).toLocaleDateString()}` : 'by administrators'}.`}
          </p>
          <Link href="/groups" className="text-sm text-slate-500 hover:text-white transition-colors">
            ← Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  // --- PRIVATE GROUP LOCK UI ---
  // Super Admin can bypass the lock for oversight
  if (group.visibility === 'PRIVATE' && !isMember && !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] pt-20 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full glass-card p-10 rounded-2xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
            <Lock className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Private Group</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            This is a private campus group. Request access to view details, inventory, and participate.
          </p>
          <Button 
             onClick={handleJoinGroup} 
             className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-[0_0_20px_rgba(37,99,235,0.3)]"
          >
             Request to Join
          </Button>
          <Link href="/groups" className="mt-6 text-sm text-slate-500 hover:text-white transition-colors">
            ← Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  // --- OVERSIGHT BANNER FOR ADMINS ---
  const isOversightMode = isSuperAdmin && !isMember;

  return (
    <div className="min-h-screen bg-[#0B0F1A] pt-20">
      {isOversightMode && (
        <div className="bg-blue-500/10 border-b border-blue-500/20 py-2 px-6 flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-xs font-bold uppercase tracking-widest">Super Admin Oversight Mode (Read-Only)</span>
        </div>
      )}
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row gap-6 p-6">
        <GroupSidebar 
            groupName={group.name} 
            activeView={activeView}
            onViewChange={setActiveView}
            isAdmin={isAdmin}
            isPremium={group.isVerified}
        />
        
        <div className="flex-1 space-y-6">
          {activeView !== 'manage' && (
              <div className="relative group/header">
                <GroupHeader 
                  group={group} 
                  isMember={isMember} 
                  isAdmin={isAdmin}
                  onJoin={handleJoinGroup}
                />
                {!isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReportModal(true)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover/header:opacity-100"
                  >
                    Report Group
                  </Button>
                )}
              </div>
          )}

          {activeView === 'manage' && isAdmin && (
              <div className="space-y-6">
                  <div className="flex items-center justify-between">
                      <h1 className="text-2xl font-bold text-white">Group Management</h1>
                      <Button onClick={() => setShowAddItem(true)} className="bg-blue-600 hover:bg-blue-500">
                          Add Equipment
                      </Button>
                  </div>
                  
                  {/* Admin Dashboard Cards */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="glass-card p-4 rounded-xl border border-white/10">
                          <p className="text-white/40 text-sm font-bold uppercase">Total Members</p>
                          <p className="text-3xl font-bold text-white mt-1">{group.memberCount}</p>
                      </div>
                      <div className="glass-card p-4 rounded-xl border border-white/10">
                          <p className="text-white/40 text-sm font-bold uppercase">Total Inventory</p>
                          <p className="text-3xl font-bold text-white mt-1">{group.itemCount}</p>
                      </div>
                      <div className="glass-card p-4 rounded-xl border border-white/10">
                          <p className="text-white/40 text-sm font-bold uppercase">Pending Requests</p>
                          <p className="text-3xl font-bold text-white mt-1">-</p> 
                      </div>
                   </div>

                  <JoinRequests groupId={groupId} />
              </div>
          )}
          
          {/* Render content based on view */}
          {['inventory', 'available', 'maintenance'].includes(activeView) && (
              <GroupInventory 
                items={displayedItems} 
                isAdmin={isAdmin}
                onAddItem={() => setShowAddItem(true)}
                onBook={(item) => setBookingItem(item)}
              />
          )}

          {activeView === 'calendar' && (
              <BookingCalendar items={items} />
          )}

          {activeView === 'members' && (
              <MembersPanel 
                  members={group.members} 
                  isAdmin={isAdmin} 
                  groupId={groupId} 
                  onAction={() => fetchGroupData()} 
              />
          )}
          
          {activeView === 'analytics' && (
               <div className="glass-card rounded-xl p-6">
                   <h2 className="text-xl font-bold text-white mb-4">Analytics</h2>
                   <AnalyticsDashboard groupId={groupId} />
               </div>
          )}

        </div>
      </div>
      
      <AddItemModal 
        isOpen={showAddItem} 
        onClose={() => setShowAddItem(false)} 
        groupId={groupId}
        onSuccess={refreshItems}
      />

       <BookItemModal
        isOpen={!!bookingItem}
        onClose={() => setBookingItem(null)}
        groupId={groupId}
        item={bookingItem}
        onSuccess={refreshItems}
      />

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        entityType="GROUP"
        entityId={group.id}
        entityName={group.name}
      />
    </div>
  );
}
