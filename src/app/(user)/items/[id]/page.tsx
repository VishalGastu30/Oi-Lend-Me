"use client";

import { useState, useEffect, use } from "react";
import { ItemDetail } from "@/components/items/types";
import { ItemImageGallery } from "@/components/items/ItemImageGallery";
import { ItemActionCard } from "@/components/items/ItemActionCard";
import { ItemOwnerCard } from "@/components/items/ItemOwnerCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, MapPin } from "lucide-react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

interface PageProps {
  params: Promise<{ id: string }>;
}

import { motion, AnimatePresence } from "framer-motion";

export default function ItemDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { toast } = useToast();
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [existingConversationId, setExistingConversationId] = useState<string | null>(null);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // 1. Fetch Item
        const res = await fetch(`/api/items/${id}`);
        if (!res.ok) {
          if (res.status === 404) setError("Item not found");
          else setError("Failed to load item"); 
          return;
        }
        const itemData = await res.json();
        const fetchedItem = itemData.data;
        setItem(fetchedItem);

        // 2. Fetch User
        const userRes = await fetch('/api/me');
        let userId = null;
        if (userRes.ok) {
           const userData = await userRes.json();
           setCurrentUser(userData.data);
           userId = userData.data.id;
        }

        // 3. Logic dependent on User and Item
        if (userId && fetchedItem) {
          // Check for existing conversation (if not owner)
          if (fetchedItem.ownerId !== userId) {
             const convRes = await fetch('/api/conversations');
             if (convRes.ok) {
               const convData = await convRes.json();
               const existing = convData.data.find((c: any) => 
                 c.request && 
                 c.request.item.id === fetchedItem.id && 
                 c.request.requesterId === userId
               );
               if (existing) {
                 setExistingConversationId(existing.id);
               }
             }
          }

          // If Owner and item is BORROWED or REQUESTED, fetch active request to manage it
          if (fetchedItem.ownerId === userId && ['BORROWED', 'REQUESTED'].includes(fetchedItem.status)) {
             const reqRes = await fetch(`/api/requests?itemId=${fetchedItem.id}`);
             if (reqRes.ok) {
               const reqData = await reqRes.json();
               const active = reqData.data.find((r: any) => 
                 (fetchedItem.status === 'BORROWED' && r.status === 'BORROWED') ||
                 (fetchedItem.status === 'REQUESTED' && r.status === 'PENDING')
               );
               if (active) {
                 setActiveRequestId(active.id);
               }
             }
          }
        }

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const handleRequest = async () => {
    if (!item) return;

    try {
      setRequesting(true);
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item.id,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), 
          message: `Hi, I'd like to borrow your ${item.name}!`,
        }),
      });

      if (res.ok) {
        setItem({ ...item, status: "REQUESTED" });
        toast({
            title: "Request Sent!",
            description: "Owner will review your request shortly.",
            variant: "success"
        });
        window.location.reload();
      } else {
        const errorData = await res.json();
        toast({
            title: "Request Failed",
            description: errorData.error || "Could not send request",
            variant: "destructive"
        });
      }
    } catch (err) {
      console.error("Request failed:", err);
      toast({
          title: "Error",
          description: "An unexpected error occurred.",
          variant: "destructive"
      });
    } finally {
      setRequesting(false);
    }
  };

  const handleMessage = () => {
    if (existingConversationId) {
      window.location.href = `/chat?id=${existingConversationId}`;
    } else {
      toast({
          title: "Request Required",
          description: "Send a request first to start a conversation.",
          variant: "warning"
      });
    }
  };

  const handleReturn = async () => {
    if (!activeRequestId) return;
    try {
      setLoading(true); 
      const res = await fetch(`/api/requests/${activeRequestId}/return`, {
        method: 'PATCH'
      });
      if (res.ok) {
         toast({
            title: "Item Returned",
            description: "Thank you for sharing!",
            variant: "success"
         });
         window.location.reload();
      } else {
        toast({
            title: "Update Failed",
            description: "Failed to mark item as returned.",
            variant: "destructive"
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="size-12 border-4 border-blue-500/10 border-t-blue-500 rounded-full"
        />
        <p className="text-gray-500 font-medium animate-pulse">Fetching gear details...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-32 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-500/5 border border-red-500/10 p-12 rounded-[2.5rem] backdrop-blur-xl"
        >
          <h1 className="text-3xl font-bold mb-4 text-white">{error || "Item not found"}</h1>
          <p className="text-gray-400 mb-8 max-w-sm mx-auto">This item may have been de-listed or moved to a different vault.</p>
          <Link href="/home">
            <Button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 h-12 rounded-2xl shadow-xl transition-all">
               Return to Browse
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const isOwner = currentUser?.id === item.ownerId;

  return (
    <div className="bg-[#0B0F1A] pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Navigation / Header */}
        <motion.nav 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-12"
        >
          <Link href="/home" className="group inline-flex items-center text-gray-400 hover:text-white transition-all font-bold tracking-tight">
            <div className="size-8 rounded-full bg-white/5 flex items-center justify-center mr-3 group-hover:bg-blue-600/10 transition-colors">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
            </div>
            Back to Explore
          </Link>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="ghost" size="icon" className="size-11 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-white/10">
              <Share2 className="w-5 h-5" />
            </Button>
          </motion.div>
        </motion.nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT COLUMN: Visuals & Core Content */}
          <div className="lg:col-span-8 space-y-12">
            
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <ItemImageGallery item={item} />
            </motion.div>
            
            {/* Mobile Action Card */}
            <div className="lg:hidden">
              <ItemActionCard 
                item={item} 
                isOwner={isOwner} 
                requesting={requesting} 
                onRequest={handleRequest}
                onReturn={handleReturn}
              />
            </div>

            <div className="space-y-12">
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2 }}
               >
                 <div className="flex items-center gap-3 mb-6">
                    <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-blue-600/10 text-blue-400 border border-blue-500/20">
                      {item.category}
                    </span>
                    {item.status === 'AVAILABLE' && (
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-widest animate-pulse">
                            <div className="size-2 bg-green-500 rounded-full" />
                            Live Now
                        </div>
                    )}
                 </div>
                 
                 <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-8 tracking-tighter">
                   {item.name}
                 </h1>

                 {item.description && (
                   <div className="relative p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-sm overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors" />
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-400">subject</span>
                        About this gear
                      </h3>
                      <p className="text-gray-400 leading-relaxed text-lg">
                        {item.description}
                      </p>
                   </div>
                 )}
                 
                 {item.condition && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="mt-8 flex items-center gap-4 bg-white/[0.03] w-fit px-6 py-3 rounded-2xl border border-white/5"
                    >
                        <div className="size-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-400">
                            <span className="material-symbols-outlined">verified</span>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-0.5">Item Condition</p>
                            <p className="text-white font-bold capitalize">{item.condition.replace(/_/g, ' ').toLowerCase()}</p>
                        </div>
                    </motion.div>
                 )}
               </motion.div>

               {/* Owner Card */}
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.5 }}
               >
                 <ItemOwnerCard 
                   item={item} 
                   isOwner={isOwner} 
                   onMessage={handleMessage} 
                   existingConversationId={existingConversationId} 
                 />
               </motion.div>
            </div>
          </div>

          {/* RIGHT COLUMN: Action & Management */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="hidden lg:block lg:col-span-4"
          >
             <div className="sticky top-32">
                 <ItemActionCard 
                   item={item} 
                   isOwner={isOwner} 
                   requesting={requesting} 
                   onRequest={handleRequest}
                   onReturn={handleReturn}
                 />
             </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}


