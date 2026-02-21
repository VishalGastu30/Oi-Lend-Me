
"use client";

import { useState, useEffect } from "react";
import { ItemCard, ItemCardProps } from "@/components/home/ItemCard";
import { ArchiveCard } from "@/components/profile/ArchiveCard";
import { Loader2, Package, Archive, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function ListedItems({ ownerId }: { ownerId: string }) {
  const { toast } = useToast();
  const [items, setItems] = useState<ItemCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

  const fetchItems = async () => {
    try {
        const res = await fetch(`/api/users/${ownerId}/items`);
        if (res.ok) {
          const data = await res.json();
          setItems(data.data || []);
        }
    } catch (e) {
        console.error("Failed to fetch user items", e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [ownerId]);

  const handleDelete = async (itemId: string) => {
      if (!confirm("Are you sure you want to delete this item? This action cannot be undone.")) return;

      try {
          const res = await fetch(`/api/items/${itemId}`, { method: 'DELETE' });
          if (res.ok) {
              setItems(prev => prev.filter(i => i.id !== itemId));
          } else {
              const err = await res.json();
              toast({
                  title: "Delete Failed",
                  description: err.message || "Failed to delete item",
                  variant: "destructive"
              });
          }
      } catch (e) {
          console.error("Delete failed", e);
          toast({
              title: "Error",
              description: "An error occurred while deleting",
              variant: "destructive"
          });
      }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  // Filter items
  const activeItems = items.filter(i => i.status !== 'ARCHIVED'); // Or other logic? 
  // "Archived items... Do NOT appear as active listings"
  // "Returned items... Move it to Archive"
  // So Archived = status 'ARCHIVED' OR 'RETURNED'? 
  // The Prompt says "When item is Borrowed OR Removed from Browse -> Move to Archive"
  // Keep it simple: 
  // Active = AVAILABLE
  // Archive = EVERYTHING ELSE (Borrowed, Returned, Archived) - Wait.
  // "Item disappears from lender’s page" -> this was the bug.
  // Expected: "My Items" should show everything but categorized?
  // "New Feature: Archive Section (My Items Page)"
  // So:
  // Active Tab: Status = AVAILABLE or REQUESTED (if owner wants to see what's visible/pending)
  // Archive Tab: Status = BORROWED, RETURNED, ARCHIVED
  
  // Let's refine based on "Move it to Archive" rule:
  // "When an item is: Borrowed OR Removed from Browse -> Move it to Archive"
  // So Active = AVAILABLE
  // Archive = BORROWED, RETURNED, ARCHIVED, REQUESTED?
  // Wait, if it's REQUESTED, it's still "Active" in the sense that owner needs to act. 
  // But prompt says "As soon as A borrow request is created -> Remove item from Browse page".
  // And "Removed from Browse -> Move it to Archive".
  // So strictly speaking, only AVAILABLE (and no requests) is in "Active" tab?
  // That might be too aggressive for the owner. The owner needs to see "Pending Requests".
  // Let's assume:
  // Active Tab: Items that are actively being advertised (AVAILABLE).
  // AND Items that have pending requests (so owner can Act).
  // Archive Tab: Borrowed, Returned, Archived.

  // Let's stick to status.
  const activeList = items.filter(i => i.status === 'AVAILABLE' || i.status === 'REQUESTED');
  const archivedList = items.filter(i => i.status !== 'AVAILABLE' && i.status !== 'REQUESTED');

  return (
    <div className="space-y-6">
        <div className="flex items-center gap-4 border-b border-white/5 pb-2">
            <button 
                onClick={() => setActiveTab('active')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'active' 
                    ? 'bg-blue-600/10 text-blue-400' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
                <Package size={16} /> Active Listings ({activeList.length})
            </button>
            <button 
                onClick={() => setActiveTab('archived')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'archived' 
                    ? 'bg-blue-600/10 text-blue-400' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
                <Archive size={16} /> Archive ({archivedList.length})
            </button>
        </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === 'active' ? (
            activeList.length > 0 ? (
                activeList.map((item) => (
                    <div key={item.id} className="relative group">
                         {/* We can wrap ItemCard or just use it. ItemCard doesn't have Delete button usually. 
                             We should probably add a Delete button overlay for the owner here too?
                             "Users must always retain control over their own listings."
                         */}
                        <ItemCard {...item} />
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete(item.id);
                            }}
                            className="absolute top-3 right-3 p-2 bg-black/60 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 hover:text-white pointer-events-auto"
                            title="Delete Item"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))
            ) : (
                <div className="col-span-full text-center py-12 bg-white/5 rounded-xl border border-white/10 border-dashed">
                    <p className="text-gray-400">No active listings.</p>
                </div>
            )
        ) : (
            archivedList.length > 0 ? (
                archivedList.map((item) => (
                    <ArchiveCard key={item.id} {...item} onDelete={handleDelete} />
                ))
            ) : (
                <div className="col-span-full text-center py-12 bg-white/5 rounded-xl border border-white/10 border-dashed">
                    <p className="text-gray-400">Archive is empty.</p>
                </div>
            )
        )}
      </div>
    </div>
  );
}
