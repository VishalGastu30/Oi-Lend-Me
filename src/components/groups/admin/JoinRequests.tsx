"use client";

import { useState, useEffect } from "react";
import { Loader2, Check, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface JoinRequest {
  id: string;
  userId: string;
  message: string | null;
  createdAt: string;
  applicant: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    karmaScore: number;
  };
}

interface JoinRequestsProps {
  groupId: string;
}

export function JoinRequests({ groupId }: JoinRequestsProps) {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await fetch(`/api/groups/${groupId}/join-requests`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data.joinRequests || []);
      }
    } catch (error) {
      console.error("Failed to fetch join requests", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [groupId]);

  const handleAction = async (requestId: string, action: 'approve' | 'reject') => {
    setProcessingId(requestId);
    try {
      const res = await fetch(`/api/groups/${groupId}/join-requests/${requestId}/${action}`, {
        method: "POST",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Action failed");
      }

      setRequests(requests.filter(r => r.id !== requestId));
      toast.success(`Request ${action}d successfully`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || `Failed to ${action} request`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" /></div>;
  }

  if (requests.length === 0) {
    return (
      <div className="glass-card rounded-xl p-8 text-center border border-white/10">
        <p className="text-white/40">No pending join requests.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white mb-4">Pending Requests ({requests.length})</h2>
      <div className="grid gap-4">
        {requests.map((req) => (
          <div key={req.id} className="bg-white/5 rounded-xl p-4 flex items-center justify-between border border-white/10">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-lg">
                {req.applicant.name[0]}
              </div>
              <div>
                <h3 className="font-bold text-white">{req.applicant.name}</h3>
                <div className="flex items-center gap-2 text-xs text-white/40">
                    <span>Karma: {req.applicant.karmaScore}</span>
                    <span>•</span>
                    <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                </div>
                {req.message && (
                    <p className="text-sm text-white/70 mt-1 italic">"{req.message}"</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => handleAction(req.id, 'approve')}
                disabled={!!processingId}
                variant="ghost"
                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 p-2 h-auto rounded-lg"
              >
                {processingId === req.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check size={20} />}
              </Button>
              <Button 
                onClick={() => handleAction(req.id, 'reject')}
                disabled={!!processingId}
                variant="ghost"
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 p-2 h-auto rounded-lg"
              >
                <X size={20} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
