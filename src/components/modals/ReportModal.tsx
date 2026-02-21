"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: "ITEM" | "USER" | "MESSAGE" | "GROUP" | "CHAT";
  entityId: string;
  entityName?: string;
}

type ReportReason = "SPAM" | "HARASSMENT" | "NSFW" | "SCAM" | "OTHER";

export function ReportModal({
  isOpen,
  onClose,
  entityType,
  entityId,
  entityName,
}: ReportModalProps) {
  const { toast } = useToast();
  const [reason, setReason] = useState<ReportReason>("SPAM");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getTitle = () => {
    switch (entityType) {
      case "ITEM":
        return "Report Item";
      case "USER":
        return "Report User";
      case "MESSAGE":
        return "Report Message";
      case "GROUP":
        return "Report Group";
      case "CHAT":
        return "Report Conversation";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType,
          entityId,
          reason,
          comment: comment.trim() || null,
        }),
      });

      if (response.ok) {
        setReason("SPAM");
        setComment("");
        onClose();
        onClose();
        toast({
          title: "Report Submitted",
          description: "Our team will review your report shortly.",
          variant: "success",
        });
      } else {
        const data = await response.json();
        setError(data.error || "Failed to submit report");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-[#0B0F1A] border border-white/10 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">{getTitle()}</h2>
            {entityName && (
              <p className="text-sm text-gray-400 mt-1">{entityName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Reason <span className="text-red-400">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as ReportReason)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4F9DFF]"
            >
              <option value="SPAM">Spam</option>
              <option value="HARASSMENT">Harassment</option>
              <option value="NSFW">NSFW / Inappropriate</option>
              <option value="SCAM">Scam</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Optional Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Additional Details (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Provide any additional context..."
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4F9DFF] resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 border-white/10 text-gray-300 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white"
            >
              {loading ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
