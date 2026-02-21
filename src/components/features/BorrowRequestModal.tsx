"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch"; 
import { useState } from "react";
import { Calendar as CalendarIcon, Zap, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface BorrowRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
}

export function BorrowRequestModal({ isOpen, onClose, itemName }: BorrowRequestModalProps) {
  const [isUrgent, setIsUrgent] = useState(false);
  const [duration, setDuration] = useState(3); // Default 3 days

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#161b22] border-white/10 text-white p-0 overflow-hidden gap-0">
        
        <div className="p-6 pb-2 text-center relative">
           <div className="w-12 h-12 mx-auto bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 text-blue-400">
              <CalendarIcon className="w-6 h-6" />
           </div>
           <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-gray-500 hover:text-white" onClick={onClose}>
             <span className="sr-only">Close</span>
             ✕
           </Button>
           <DialogTitle className="text-xl font-bold mb-1">Oi! When are you bringing it back? 🤝</DialogTitle>
           <DialogDescription className="text-gray-400">Select your return date and keep things smooth.</DialogDescription>
        </div>

        <div className="px-6 py-2">
           {/* Custom Calendar Placeholder styled like the reference */}
           <div className="bg-[#0d1117] rounded-xl border border-white/5 p-4 mb-4">
              <div className="flex justify-between items-center mb-4 text-sm font-semibold text-gray-200">
                 <button className="p-1 hover:text-blue-400"><ChevronLeft className="w-4 h-4" /></button>
                 <span>October 2023</span>
                 <button className="p-1 hover:text-blue-400"><ChevronRight className="w-4 h-4" /></button>
              </div>
              
              {/* Fake Calendar Grid for Visual Mockup */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
                 <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-400">
                 <span className="opacity-30">28</span><span className="opacity-30">29</span><span className="opacity-30">30</span><span>1</span><span>2</span><span>3</span><span>4</span>
                 <span className="bg-blue-500 text-white rounded-l-full py-1.5">5</span>
                 <span className="bg-blue-500/20 py-1.5">6</span>
                 <span className="bg-blue-500/20 py-1.5">7</span>
                 <span className="bg-blue-500/20 py-1.5">8</span>
                 <span className="bg-blue-500/20 border-r-2 border-blue-500 text-blue-200 rounded-r-full py-1.5">9</span>
                 <span>10</span><span>11</span>
              </div>
           </div>

           {/* Quick Duration */}
           <div className="bg-[#0d1117] rounded-xl border border-white/5 p-4 mb-4">
              <div className="flex justify-between items-center mb-4">
                 <span className="text-sm font-medium">Quick Duration</span>
                 <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-bold">{duration} DAYS</span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                 <div className="h-full w-[25%] bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
              </div>
              <div className="flex justify-between text-[10px] text-gray-500 mt-2 font-medium tracking-wide">
                 <span>1 DAY</span>
                 <span>14 DAYS</span>
              </div>
           </div>

           {/* Mark As Urgent */}
           <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-blue-400" />
                 </div>
                 <div>
                    <p className="text-sm font-semibold text-white">Mark as Urgent</p>
                    <p className="text-xs text-blue-200/60">Owner gets a priority alert</p>
                 </div>
              </div>
              <Switch checked={isUrgent} onCheckedChange={setIsUrgent} />
           </div>
        </div>

        <DialogFooter className="p-6 pt-2">
           <Button className="w-full h-12 text-base bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/20 rounded-xl" onClick={onClose}>
              Send Borrow Request <Send className="w-4 h-4 ml-2" />
           </Button>
           <p className="w-full text-center text-[10px] text-gray-500 uppercase tracking-wider font-bold mt-4">Respect the gear • Return on time</p>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
