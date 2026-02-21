"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, User, Award, AlertCircle, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { RespondToRequirementModal } from "@/components/requirements/RespondToRequirementModal";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export default function RequirementDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();

  const [requirement, setRequirement] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [respondModal, setRespondModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/me");
        if (res.ok) {
          const data = await res.json();
          setCurrentUserId(data.data?.id || null);
        }
      } catch (err) {
        console.error("Failed to fetch user", err);
      }
    }
    fetchUser();
    fetchRequirement();
  }, [params.id]);

  const fetchRequirement = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/requirements/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setRequirement(data.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load requirement",
          variant: "destructive",
        });
        router.push("/home");
      }
    } catch (error) {
      console.error("Failed to fetch requirement:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/requirements/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        toast({
          title: "Updated",
          description: `Requirement marked as ${status.toLowerCase()}`,
        });
        fetchRequirement();
      } else {
        const errData = await res.json();
        toast({
          title: "Failed to Update",
          description: errData.error || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to update:", error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <Loader2 className="size-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!requirement) return null;

  const isOwner = currentUserId === requirement.requester.id;
  const durationDays = Math.ceil(
    (new Date(requirement.durationEnd).getTime() - new Date(requirement.durationStart).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <>
      <div className="bg-[#0B0F1A] text-gray-200 pb-20 px-6 font-sans">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="group text-gray-400 hover:text-white hover:bg-white/5 rounded-2xl px-6 h-12 font-bold transition-all mb-6"
            >
              <ArrowLeft className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
              Back
            </Button>

            {/* Urgency Badge */}
            {requirement.urgency === "URGENT" && (
              <Badge className="bg-orange-600 text-white border-none px-4 py-1.5 rounded-full font-black uppercase text-xs tracking-widest flex items-center gap-2 w-fit mb-4">
                <AlertCircle size={14} />
                Urgent Request
              </Badge>
            )}

            <h1 className="text-4xl font-black text-white mb-4 leading-tight">{requirement.title}</h1>

            <div className="flex items-center gap-4 flex-wrap">
              <Badge className="bg-white/10 text-gray-300 border-none px-3 py-1 rounded-full font-bold">
                {requirement.category}
              </Badge>
              <Badge
                className={cn(
                  "px-3 py-1 rounded-full font-bold border-none",
                  requirement.status === "OPEN"
                    ? "bg-green-600/20 text-green-400"
                    : requirement.status === "FULFILLED"
                    ? "bg-blue-600/20 text-blue-400"
                    : "bg-gray-600/20 text-gray-400"
                )}
              >
                {requirement.status}
              </Badge>
              <span className="text-sm text-gray-500 font-medium">
                Posted {formatDistanceToNow(new Date(requirement.createdAt), { addSuffix: true })}
              </span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              {requirement.description && (
                <Card className="bg-[#121726]/60 backdrop-blur-xl border-white/10 rounded-[2rem] p-8">
                  <h3 className="text-lg font-black text-white mb-4">Details</h3>
                  <p className="text-gray-300 leading-relaxed">{requirement.description}</p>
                </Card>
              )}

              {/* Duration Info */}
              <Card className="bg-[#121726]/60 backdrop-blur-xl border-white/10 rounded-[2rem] p-8">
                <h3 className="text-lg font-black text-white mb-4">Timeline</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar size={20} className="text-blue-400" />
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Start Date</p>
                      <p className="text-white font-bold">
                        {new Date(requirement.durationStart).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar size={20} className="text-blue-400" />
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">End Date</p>
                      <p className="text-white font-bold">
                        {new Date(requirement.durationEnd).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock size={20} className="text-blue-400" />
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Duration</p>
                      <p className="text-white font-bold">
                        {durationDays} {durationDays === 1 ? "day" : "days"}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Responses */}
              {requirement.responses && requirement.responses.length > 0 && (
                <Card className="bg-[#121726]/60 backdrop-blur-xl border-white/10 rounded-[2rem] p-8">
                  <h3 className="text-lg font-black text-white mb-4">
                    Offers ({requirement.responses.length})
                  </h3>
                  <div className="space-y-3">
                    {requirement.responses.map((response: any) => (
                      <div
                        key={response.id}
                        className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-4"
                      >
                        <Avatar className="size-10 border border-white/10">
                          <AvatarImage src={response.lender.avatarUrl || undefined} />
                          <AvatarFallback className="bg-blue-600/20 text-blue-400 font-bold">
                            {response.lender.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                          <p className="font-bold text-white">{response.lender.name}</p>
                          <p className="text-sm text-gray-400">offered {response.item.name}</p>
                        </div>
                        <Badge className="bg-white/10 text-gray-300 border-none px-2 py-1 rounded-full font-bold text-xs">
                          {response.item.category}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Requester Card */}
              <Card className="bg-[#121726]/60 backdrop-blur-xl border-white/10 rounded-[2rem] p-6">
                <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4">Requested By</h3>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="size-14 border-2 border-white/10">
                    <AvatarImage src={requirement.requester.avatarUrl || undefined} />
                    <AvatarFallback className="bg-blue-600/20 text-blue-400 font-bold text-lg">
                      {requirement.requester.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-white">{requirement.requester.name}</p>
                    <div className="flex items-center gap-1 text-yellow-500 text-sm">
                      <Award size={14} />
                      <span className="font-black">{requirement.requester.karmaScore}</span>
                    </div>
                  </div>
                </div>
                {requirement.requester.about && (
                  <p className="text-sm text-gray-400 leading-relaxed">{requirement.requester.about}</p>
                )}
              </Card>

              {/* Actions */}
              {!isOwner && requirement.status === "OPEN" && (
                <Button
                  onClick={() => setRespondModal(true)}
                  className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all"
                >
                  I Can Lend This
                </Button>
              )}

              {isOwner && requirement.status === "OPEN" && (
                <div className="space-y-3">
                  <Button
                    onClick={() => handleStatusUpdate("FULFILLED")}
                    disabled={updating}
                    className="w-full h-12 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    {updating ? <Loader2 className="size-5 animate-spin" /> : <><CheckCircle size={18} /> Mark as Fulfilled</>}
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate("CLOSED")}
                    disabled={updating}
                    variant="outline"
                    className="w-full h-12 border-white/10 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    {updating ? <Loader2 className="size-5 animate-spin" /> : <><XCircle size={18} /> Close Request</>}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Respond Modal */}
      {respondModal && (
        <RespondToRequirementModal
          isOpen={respondModal}
          onClose={() => setRespondModal(false)}
          requirement={requirement}
          onSuccess={() => {
            fetchRequirement();
            setRespondModal(false);
          }}
        />
      )}
    </>
  );
}
