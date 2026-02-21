"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, RefreshCw, History, CheckSquare, CheckCircle, Loader2, List, Trash2, PackageOpen, Archive } from "lucide-react";
import { ItemCard, ItemCardProps } from "@/components/home/ItemCard";
import { ArchiveCard } from "@/components/profile/ArchiveCard"; // New Import
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

type Request = {
  id: string;
  status: string;
  item: ItemCardProps;
  requester: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  startDate?: string;
  endDate?: string;
  createdAt: string;
};

export default function MyItemsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("listings");
  const [pending, setPending] = useState<Request[]>([]);
  const [borrowed, setBorrowed] = useState<Request[]>([]);
  const [lent, setLent] = useState<Request[]>([]);
  const [approvals, setApprovals] = useState<Request[]>([]);
  const [returned, setReturned] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Split listings into Active and Archived
  const [activeListings, setActiveListings] = useState<ItemCardProps[]>([]);
  const [archivedListings, setArchivedListings] = useState<ItemCardProps[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      
      const userRes = await fetch('/api/me');
      if (!userRes.ok) throw new Error("Not authenticated");
      const userData = await userRes.json();
      const currentId = userData.data.id;
      setUserId(currentId);

      // Fetch All My Items
      const listingsRes = await fetch(`/api/users/${currentId}/items?all=true`); // Ensure API returns all
      if (listingsRes.ok) {
          const data = await listingsRes.json();
          const allItems: ItemCardProps[] = data.data || [];
          
          // Filter: Active = AVAILABLE (Fresh/re-listed)
          const active = allItems.filter(i => i.status === 'AVAILABLE' || i.status === 'REQUESTED');
          setActiveListings(active);

          // Filter: Archive = History Ledger (ALL items except deleted)
          // User Requirement: "The moment a user creates an item, it must appear in Archive"
          setArchivedListings(allItems);
      }

      // Fetch other requests as before...
      const pendingRes = await fetch(`/api/requests?requesterId=${currentId}&status=PENDING`);
      if (pendingRes.ok) setPending((await pendingRes.json()).data || []);

      const borrowedRes = await fetch(`/api/requests?requesterId=${currentId}&status=BORROWED`);
      if (borrowedRes.ok) setBorrowed((await borrowedRes.json()).data || []);

      const lentRes = await fetch(`/api/requests?ownerId=${currentId}&status=BORROWED`);
      if (lentRes.ok) setLent((await lentRes.json()).data || []);

      const approvalRes = await fetch(`/api/requests?ownerId=${currentId}&status=PENDING`);
      if (approvalRes.ok) setApprovals((await approvalRes.json()).data || []);
      
      const returnedRes = await fetch(`/api/requests?status=RETURNED`);
      if (returnedRes.ok) setReturned((await returnedRes.json()).data || []);

    } catch (e) {
      console.error("Failed to fetch my items", e);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this listing? This action cannot be undone and will remove it from history.")) return;

    try {
        const res = await fetch(`/api/items/${itemId}`, { method: 'DELETE' });
        if (res.ok) {
            // Optimistic update
            setActiveListings(prev => prev.filter(item => item.id !== itemId));
            setArchivedListings(prev => prev.filter(item => item.id !== itemId));
            toast({
                title: "Deleted",
                description: "Item deleted successfully",
                variant: "success"
            });
        } else {
            const data = await res.json();
            toast({
                title: "Delete Failed",
                description: data.message || data.error || "Unknown error",
                variant: "destructive"
            });
        }
    } catch (e) {
        console.error("Delete failed", e);
        console.error("Delete failed", e);
        toast({
            title: "Error",
            description: "An error occurred while deleting the item",
            variant: "destructive"
        });
    }
  };

  const handleApproval = async (requestId: string, action: 'APPROVE' | 'REJECT') => {
      try {
          // Using dedicated endpoints
          const endpoint = action === 'APPROVE' 
            ? `/api/requests/${requestId}/approve`
            : `/api/requests/${requestId}/reject`;

          const res = await fetch(endpoint, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' }
          });
          
          if (res.ok) {
              toast({
                  title: action === 'APPROVE' ? "Approved" : "Rejected",
                  description: action === 'APPROVE' ? "Request approved successfully" : "Request rejected",
                  variant: action === 'APPROVE' ? "success" : "default"
              });
              fetchData(); 
          } else {
              toast({
                  title: "Action Failed",
                  description: "Could not update request status",
                  variant: "destructive"
              });
          }
      } catch (e) {
          console.error("Failed to update request", e);
      }
  };



  const handleMarkReturned = async (requestId: string) => {
      try {
           const res = await fetch(`/api/requests/${requestId}/return`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' }
          });
          if (res.ok) {
              toast({
                  title: "Returned",
                  description: "Item marked as returned",
                  variant: "success"
              });
              fetchData();
          }
      } catch (e) {
          console.error("Failed to mark returned", e);
      }
  };

  if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-[#4F9DFF]" />
        </div>
      );
  }

  return (
    <div className="bg-[#0B0F1A] px-4 sm:px-6 pb-20">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">My Items & Activity</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-[#1A2030] border border-white/5 p-1 rounded-xl mb-8 flex flex-wrap h-auto gap-1">
                <TabsTrigger value="listings" className="flex-1 min-w-[100px] data-[state=active]:bg-[#4F9DFF] data-[state=active]:text-white rounded-lg py-2.5 transition-all">
                    <List className="w-4 h-4 mr-2" />
                    Listings
                </TabsTrigger>
                <TabsTrigger value="archive" className="flex-1 min-w-[100px] data-[state=active]:bg-[#4F9DFF] data-[state=active]:text-white rounded-lg py-2.5 transition-all">
                    <Archive className="w-4 h-4 mr-2" />
                    Archive
                </TabsTrigger>
                <TabsTrigger value="pending" className="flex-1 min-w-[100px] data-[state=active]:bg-[#4F9DFF] data-[state=active]:text-white rounded-lg py-2.5 transition-all">
                    <Clock className="w-4 h-4 mr-2" />
                    Pending
                </TabsTrigger>
                <TabsTrigger value="borrowed" className="flex-1 min-w-[100px] data-[state=active]:bg-[#4F9DFF] data-[state=active]:text-white rounded-lg py-2.5 transition-all">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Borrowed
                </TabsTrigger>
                <TabsTrigger value="lent" className="flex-1 min-w-[100px] data-[state=active]:bg-[#4F9DFF] data-[state=active]:text-white rounded-lg py-2.5 transition-all">
                    <History className="w-4 h-4 mr-2" />
                    Lent
                </TabsTrigger>
                <TabsTrigger value="approvals" className="flex-1 min-w-[100px] data-[state=active]:bg-[#4F9DFF] data-[state=active]:text-white rounded-lg py-2.5 transition-all relative">
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Approvals 
                    {approvals.length > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{approvals.length}</span>
                    )}
                </TabsTrigger>
                <TabsTrigger value="returned" className="flex-1 min-w-[100px] data-[state=active]:bg-[#4F9DFF] data-[state=active]:text-white rounded-lg py-2.5 transition-all">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Returned
                </TabsTrigger>
            </TabsList>

            <TabsContent value="listings" className="space-y-6">
                 {activeListings.length === 0 ? (
                     <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                         <PackageOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                         <h3 className="text-white font-bold text-lg">You haven't listed any items</h3>
                         <p className="text-gray-400 mb-6">Start lending to the community today.</p>
                         <Link href="/items/new">
                            <Button className="bg-[#4F9DFF] hover:bg-blue-600 rounded-full">List an Item</Button>
                         </Link>
                     </div>
                 ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {activeListings.map(item => (
                             <Card key={item.id} className="p-4 bg-[#1A2030] border-white/10 text-white overflow-hidden group">
                                 <div className="flex gap-4">
                                     <div className="w-20 h-20 bg-black/40 rounded-lg overflow-hidden shrink-0">
                                         {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />}
                                     </div>
                                     <div className="flex-1 min-w-0 flex flex-col justify-between">
                                         <div>
                                            <h4 className="font-bold truncate">{item.name}</h4>
                                            <p className="text-sm text-gray-400">Status: <span className={item.status === 'AVAILABLE' ? 'text-green-400' : 'text-yellow-400'}>{item.status}</span></p>
                                            {item.createdAt && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Listed {new Date(item.createdAt).toLocaleDateString()}
                                                </p>
                                            )}
                                         </div>
                                         <div className="flex gap-2 mt-2">
                                            <Link href={`/items/${item.id}`} className="flex-1">
                                                <Button size="sm" variant="secondary" className="w-full h-8 text-xs">View</Button>
                                            </Link>
                                            <Button 
                                                size="sm" 
                                                variant="destructive" 
                                                className="h-8 w-8 p-0"
                                                onClick={() => handleDelete(item.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span className="sr-only">Delete</span>
                                            </Button>
                                         </div>
                                     </div>
                                 </div>
                             </Card>
                         ))}
                     </div>
                 )}
            </TabsContent>

            <TabsContent value="archive" className="space-y-6">
                {archivedListings.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                        <Archive className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        <h3 className="text-white font-bold text-lg">No archived items</h3>
                        <p className="text-gray-400">Items that are borrowed or returned appear here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {archivedListings.map(item => (
                            <ArchiveCard 
                                key={item.id} 
                                {...item} 
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </TabsContent>

            <TabsContent value="pending" className="space-y-6">
                 {pending.length === 0 ? (
                     <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                         <Clock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                         <h3 className="text-white font-bold text-lg">No pending requests</h3>
                         <p className="text-gray-400">You haven't requested any items recently.</p>
                     </div>
                 ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {pending.map(req => (
                             <Card key={req.id} className="p-4 bg-[#1A2030] border-white/10 text-white overflow-hidden">
                                 <div className="flex gap-4">
                                     <div className="w-20 h-20 bg-black/40 rounded-lg overflow-hidden shrink-0">
                                         {req.item.imageUrl && <img src={req.item.imageUrl} alt={req.item.name} className="w-full h-full object-cover" />}
                                     </div>
                                     <div className="flex-1 min-w-0">
                                         <h4 className="font-bold truncate">{req.item.name}</h4>
                                         <p className="text-sm text-yellow-400 font-semibold mb-2">Wait for Approval</p>
                                         <Link href={`/chat?id=${req.id}`}>
                                            <Button size="sm" variant="secondary" className="w-full h-8 text-xs">Chat</Button>
                                         </Link>
                                     </div>
                                 </div>
                             </Card>
                         ))}
                     </div>
                 )}
            </TabsContent>

            <TabsContent value="borrowed" className="space-y-6">
                {borrowed.length === 0 ? (
                     <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                         <RefreshCw className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                         <h3 className="text-white font-bold text-lg">No active borrowings</h3>
                         <p className="text-gray-400 mb-6">Explore the catalog to find what you need.</p>
                         <Link href="/home">
                            <Button className="bg-[#4F9DFF] hover:bg-blue-600 rounded-full">Browse items</Button>
                         </Link>
                     </div>
                 ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {borrowed.map(req => (
                             <Card key={req.id} className="p-4 bg-[#1A2030] border-white/10 text-white overflow-hidden">
                                 <div className="flex gap-4">
                                     <div className="w-20 h-20 bg-black/40 rounded-lg overflow-hidden shrink-0">
                                         {req.item.imageUrl && <img src={req.item.imageUrl} alt={req.item.name} className="w-full h-full object-cover" />}
                                     </div>
                                     <div className="flex-1 min-w-0">
                                         <h4 className="font-bold truncate">{req.item.name}</h4>
                                         <p className="text-sm text-gray-400 mb-1">Status: <span className="text-blue-400 font-semibold">{req.status}</span></p>
                                         {req.status === 'APPROVED' && <p className="text-xs text-yellow-500 mb-2">Ready for pickup</p>}
                                         
                                         <Link href={`/chat?id=${req.id}`}>
                                            <Button size="sm" variant="secondary" className="w-full h-8 text-xs">Chat</Button>
                                         </Link>
                                     </div>
                                 </div>
                             </Card>
                         ))}
                     </div>
                 )}
            </TabsContent>
            
            <TabsContent value="lent" className="space-y-6">
                 {lent.length === 0 ? (
                     <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                         <History className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                         <h3 className="text-white font-bold text-lg">No items lent out currently</h3>
                     </div>
                 ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {lent.map(req => (
                             <Card key={req.id} className="p-4 bg-[#1A2030] border-white/10 text-white overflow-hidden">
                                <div className="flex gap-4">
                                     <div className="w-20 h-20 bg-black/40 rounded-lg overflow-hidden shrink-0">
                                         {req.item.imageUrl && <img src={req.item.imageUrl} alt={req.item.name} className="w-full h-full object-cover" />}
                                     </div>
                                     <div className="flex-1 min-w-0">
                                         <h4 className="font-bold truncate">{req.item.name}</h4>
                                         <p className="text-xs text-gray-400 mb-1">To: {req.requester.name}</p>
                                         <p className="text-sm text-blue-400 font-semibold mb-2">{req.status}</p>
                                         
                                         {req.status === 'BORROWED' && (
                                             <Button 
                                                size="sm" 
                                                className="w-full h-8 text-xs bg-orange-600 hover:bg-orange-500 mb-2"
                                                onClick={() => handleMarkReturned(req.id)}
                                             >
                                                 Mark as Returned
                                             </Button>
                                         )}
                                         <Link href={`/chat?id=${req.id}`}>
                                            <Button size="sm" variant="secondary" className="w-full h-8 text-xs">Chat</Button>
                                         </Link>
                                     </div>
                                 </div>
                             </Card>
                         ))}
                     </div>
                 )}
            </TabsContent>

            <TabsContent value="approvals" className="space-y-6">
                 {approvals.length === 0 ? (
                     <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                         <CheckSquare className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                         <h3 className="text-white font-bold text-lg">No pending requests</h3>
                         <p className="text-gray-400">All caught up!</p>
                     </div>
                 ) : (
                     <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto">
                         {approvals.map(req => (
                             <Card key={req.id} className="p-4 bg-[#1A2030] border-white/10 text-white flex flex-col sm:flex-row gap-6 items-center">
                                 <div className="w-16 h-16 bg-black/40 rounded-lg overflow-hidden shrink-0">
                                     {req.item.imageUrl && <img src={req.item.imageUrl} alt={req.item.name} className="w-full h-full object-cover" />}
                                 </div>
                                 <div className="flex-1 text-center sm:text-left">
                                     <h4 className="font-bold">{req.item.name}</h4>
                                     <p className="text-sm text-gray-400">Requested by <span className="text-white font-semibold">{req.requester.name}</span></p>
                                      <p className="text-xs text-gray-500 mt-1">{new Date(req.createdAt).toLocaleDateString()}</p>
                                 </div>
                                 <div className="flex gap-2 w-full sm:w-auto">
                                     <Button 
                                        variant="destructive" 
                                        className="flex-1 sm:flex-none"
                                        onClick={() => handleApproval(req.id, 'REJECT')}
                                     >
                                         Reject
                                     </Button>
                                     <Button 
                                        className="bg-green-600 hover:bg-green-500 flex-1 sm:flex-none"
                                        onClick={() => handleApproval(req.id, 'APPROVE')}
                                     >
                                         Approve
                                     </Button>
                                 </div>
                             </Card>
                         ))}
                     </div>
                 )}
            </TabsContent>

            <TabsContent value="returned" className="space-y-6">
                 {returned.length === 0 ? (
                     <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                         <CheckCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                         <h3 className="text-white font-bold text-lg">No returned items history</h3>
                     </div>
                 ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {returned.map(req => (
                             <Card key={req.id} className="p-4 bg-[#1A2030] border-white/10 text-white opacity-70 hover:opacity-100 transition-opacity">
                                 <div className="flex gap-4">
                                     <div className="w-20 h-20 bg-black/40 rounded-lg overflow-hidden shrink-0 grayscale">
                                         {req.item.imageUrl && <img src={req.item.imageUrl} alt={req.item.name} className="w-full h-full object-cover" />}
                                     </div>
                                     <div className="flex-1 min-w-0">
                                         <h4 className="font-bold truncate text-gray-300">{req.item.name}</h4>
                                          <p className="text-xs text-gray-500">
                                            {req.requester.id === userId ? `Borrowed from Owner` : `Lent to ${req.requester.name}`}
                                          </p>
                                         <p className="text-sm text-green-400 font-semibold mt-1">Returned</p>
                                     </div>
                                 </div>
                             </Card>
                         ))}
                     </div>
                 )}
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
