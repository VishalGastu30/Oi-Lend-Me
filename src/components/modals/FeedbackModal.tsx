"use client";

import { useState } from "react";
import { Loader2, MessageSquare, Bug, Lightbulb, AlertTriangle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FeedbackType = "BUG" | "SUGGESTION" | "COMPLAINT" | "OTHER";

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { toast } = useToast();
  const [type, setType] = useState<FeedbackType>("SUGGESTION");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim().length < 10) {
      toast({
        title: "Message too short",
        description: "Please provide at least 10 characters so we can help you better.",
        variant: "warning"
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: type,
          message: message.trim(),
          pageContext: window.location.pathname,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Feedback Sent",
          description: "Thank you for helping us improve Oi! Lend Me.",
          variant: "success"
        });
        setMessage("");
        setType("SUGGESTION");
        onClose();
      } else {
        toast({
          title: "Error",
          description: data.error || "Please try again later.",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Network Error",
        description: "Please check your connection and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#0B0F1A] border-white/10 text-white p-0 overflow-hidden gap-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            Send Feedback
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Found a bug or have a suggestion? We'd love to hear from you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="type" className="text-gray-300">Feedback Type</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as FeedbackType)}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-blue-500/50">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1F2E] border-white/10 text-white">
                <SelectItem value="BUG">
                  <div className="flex items-center gap-2">
                    <Bug className="w-4 h-4 text-red-400" />
                    <span>Bug Report</span>
                  </div>
                </SelectItem>
                <SelectItem value="SUGGESTION">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-400" />
                    <span>Suggestion</span>
                  </div>
                </SelectItem>
                <SelectItem value="COMPLAINT">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    <span>Complaint</span>
                  </div>
                </SelectItem>
                <SelectItem value="OTHER">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-400" />
                    <span>Other</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-gray-300">
              Message <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what's on your mind... (min 10 characters)"
              className="resize-none min-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:ring-blue-500/50"
              required
            />
            <div className="flex justify-end">
                <span className={`text-xs ${message.length < 10 && message.length > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                    {message.length} / 10 characters
                </span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-white/10 text-gray-300 hover:bg-white/5 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || message.trim().length < 10}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Submit Feedback"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
