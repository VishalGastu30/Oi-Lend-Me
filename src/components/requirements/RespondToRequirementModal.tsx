"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, Loader2, Check, HandHeart } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

type Item = {
  id: string;
  name: string;
  category: string;
  imageUrl?: string | null;
  status: string;
};

type RespondToRequirementModalProps = {
  isOpen: boolean;
  onClose: () => void;
  requirement: {
    id: string;
    title: string;
    category: string;
    durationStart: string | Date;
    durationEnd: string | Date;
  };
  onSuccess: () => void;
};



export function RespondToRequirementModal({
  isOpen,
  onClose,
  requirement,
  onSuccess,
}: RespondToRequirementModalProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [offerType, setOfferType] = useState<"EXISTING_ITEM" | "NEW_ITEM" | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableItems();
      setOfferType(null); // Reset choice
      setSelectedItemId(null);
    }
  }, [isOpen, requirement.category]);

  const fetchAvailableItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/items?status=AVAILABLE&category=${requirement.category}`);
      if (res.ok) {
        const data = await res.json();
        // Fix: API returns { data: { items: [], pagination: ... } }
        setItems(data.data?.items || []);
      }
    } catch (error) {
      console.error("Failed to fetch items:", error);
      setItems([]); // Safety fallback
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (offerType === "EXISTING_ITEM" && !selectedItemId) {
      toast({
        title: "No Item Selected",
        description: "Please select an item to lend.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {};
      if (offerType === "EXISTING_ITEM" && selectedItemId) {
        payload.itemId = selectedItemId;
      }
      // If NEW_ITEM, we send empty itemId, backend handles creation

      const res = await fetch(`/api/requirements/${requirement.id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast({
          title: "Offer Sent!",
          description: "Your lending offer has been accepted. A chat has been started.",
        });
        onSuccess();
        onClose();
      } else {
        const errData = await res.json();
        toast({
          title: "Failed to Send Offer",
          description: errData.error || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to respond:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#121726]/95 backdrop-blur-2xl border-white/10 text-gray-200 rounded-[2.5rem] p-0 max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="p-8 pb-6 border-b border-white/5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <DialogTitle className="text-2xl font-black text-white mb-2">Offer to Help</DialogTitle>
              <p className="text-sm text-gray-400 font-medium">
                You can offer an existing item or simply offer to help.
              </p>
            </div>
            <button
              onClick={onClose}
              className="size-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Requirement Summary */}
          <div className="p-4 rounded-2xl bg-blue-600/10 border border-blue-500/20">
            <p className="text-sm font-bold text-blue-400 mb-1">Request:</p>
            <p className="text-white font-black">{requirement.title}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
              <Badge className="bg-white/10 text-gray-300 border-none px-2 py-0.5 rounded-full font-bold">
                {requirement.category}
              </Badge>
              <span>
                {new Date(requirement.durationStart).toLocaleDateString()} -{" "}
                {new Date(requirement.durationEnd).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 pt-6 max-h-[500px] overflow-y-auto space-y-6">
          
          {loading ? (
             <div className="flex items-center justify-center py-12">
               <Loader2 className="size-8 animate-spin text-blue-500" />
             </div>
          ) : (
            <>
                {/* Option 1: Offer Existing */}
                {items.length > 0 && (
                  <div className="space-y-4">
                    <button 
                        onClick={() => {
                            setOfferType("EXISTING_ITEM");
                            if (items.length > 0) setSelectedItemId(items[0].id);
                        }}
                        className={cn(
                            "w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all",
                            offerType === "EXISTING_ITEM" 
                                ? "bg-blue-600/10 border-blue-500 ring-1 ring-blue-500" 
                                : "bg-white/5 border-white/5 hover:border-white/10"
                        )}
                    >
                        <div className="size-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                            <Package size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white">Offer an existing item</h4>
                            <p className="text-xs text-gray-400">Select from your "My Items" list</p>
                        </div>
                        {offerType === "EXISTING_ITEM" && <Check className="ml-auto text-blue-500" />}
                    </button>

                    <AnimatePresence>
                        {offerType === "EXISTING_ITEM" && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden pl-4 border-l-2 border-white/10 space-y-2"
                            >
                                {items.map((item) => (
                                    <button
                                    key={item.id}
                                    onClick={() => setSelectedItemId(item.id)}
                                    className={cn(
                                        "w-full p-3 rounded-xl border text-left transition-all flex items-center gap-3",
                                        selectedItemId === item.id
                                        ? "bg-blue-600/20 border-blue-500/50"
                                        : "bg-white/5 border-white/5 hover:bg-white/10"
                                    )}
                                    >
                                        <div className="size-10 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
                                            {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                            <Package size={16} className="m-auto text-gray-500" />
                                            )}
                                        </div>
                                        <span className="text-sm font-medium text-gray-200 truncate">{item.name}</span>
                                        {selectedItemId === item.id && <Check size={16} className="ml-auto text-blue-400" />}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Option 2: Help without Item */}
                <div className="space-y-4">
                     <button 
                        onClick={() => {
                            setOfferType("NEW_ITEM");
                            setSelectedItemId(null);
                        }}
                        className={cn(
                            "w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all",
                            offerType === "NEW_ITEM" 
                                ? "bg-emerald-600/10 border-emerald-500 ring-1 ring-emerald-500" 
                                : "bg-white/5 border-white/5 hover:border-white/10"
                        )}
                    >
                        <div className="size-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <HandHeart size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white">I don't have this listed, but I can help</h4>
                            <p className="text-xs text-gray-400">A temporary item will be created for this transaction</p>
                        </div>
                        {offerType === "NEW_ITEM" && <Check className="ml-auto text-emerald-500" />}
                    </button>
                </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 pt-6 border-t border-white/5 flex gap-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-12 border-white/10 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-bold"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!offerType || submitting || (offerType === "EXISTING_ITEM" && !selectedItemId)}
            className={cn(
                "flex-1 h-12 text-white rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all",
                offerType === "NEW_ITEM" 
                    ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20" 
                    : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20"
            )}
          >
            {submitting ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              offerType === "NEW_ITEM" ? "Offer Help" : "Send Offer"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
