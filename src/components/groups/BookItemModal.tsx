"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import { format, addDays } from "date-fns";
import { toast } from "sonner";

interface BookItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  item: { id: string; name: string } | null;
  onSuccess: () => void;
}

export function BookItemModal({ isOpen, onClose, groupId, item, onSuccess }: BookItemModalProps) {
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/groups/${groupId}/items/${item.id}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            startDate,
            endDate
        }),
      });

      const data = await res.json();

      if (!res.ok) {
          throw new Error(data.error || "Failed to book item");
      }

      toast.success("Item booked successfully!");
      onSuccess();
      onClose();
      setStartDate("");
      setEndDate("");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to book item");
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1A1F2E] border-white/10 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book {item.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <div className="relative">
                    <Input
                    id="startDate"
                    type="date"
                    min={format(new Date(), "yyyy-MM-dd")}
                    className="bg-white/5 border-white/10 text-white pl-10"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    />
                    <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-white/50" />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <div className="relative">
                    <Input
                    id="endDate"
                    type="date"
                    min={startDate || format(new Date(), "yyyy-MM-dd")}
                    className="bg-white/5 border-white/10 text-white pl-10"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    />
                     <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-white/50" />
                </div>
              </div>
          </div>
          
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
               <p className="font-bold mb-1">Booking Policy</p>
               <ul className="list-disc list-inside space-y-1 opacity-80">
                   <li>You are responsible for the item during this period.</li>
                   <li>Late returns may incur karma penalties.</li>
               </ul>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} className="text-white/60 hover:text-white">
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-500" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
