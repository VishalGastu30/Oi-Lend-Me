"use client";

import { useState } from "react";
import { Feedback, FeedbackStatus } from "@prisma/client";
import { updateFeedbackStatus } from "@/app/admin/actions";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Inbox,
  CheckCircle2,
  Archive,
  MoreVertical,
  MessageSquare,
  Bug,
  Lightbulb,
  AlertTriangle,
  HelpCircle,
  Loader2,
  Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface FeedbackListProps {
  initialFeedback: (Feedback & {
    user: {
      id: string;
      name: string;
      email: string;
      avatarUrl: string | null;
    } | null;
  })[];
}

export function FeedbackList({ initialFeedback }: FeedbackListProps) {
  const { toast } = useToast();
  const [feedback, setFeedback] = useState(initialFeedback);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  const handleStatusUpdate = async (id: string, newStatus: FeedbackStatus) => {
    setUpdatingIds((prev) => new Set(prev).add(id));
    
    // Optimistic update
    const previousFeedback = [...feedback];
    setFeedback((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );

    try {
      const result = await updateFeedbackStatus(id, newStatus);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast({
        title: "Status Updated",
        description: `Feedback marked as ${newStatus.toLowerCase()}`,
        variant: "success"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
      // Revert optimistic update
      setFeedback(previousFeedback);
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "BUG": return <Bug className="w-4 h-4 text-red-400" />;
      case "SUGGESTION": return <Lightbulb className="w-4 h-4 text-yellow-400" />;
      case "COMPLAINT": return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      default: return <HelpCircle className="w-4 h-4 text-blue-400" />;
    }
  };

  const getStatusColor = (status: FeedbackStatus) => {
    switch (status) {
      case "NEW": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "REVIEWED": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "RESOLVED": return "bg-green-500/10 text-green-400 border-green-500/20";
    }
  };

  const filteredFeedback = (status: string) => {
    if (status === "ALL") return feedback;
    return feedback.filter((item) => item.status === status);
  };

  const FeedbackItem = ({ item }: { item: typeof feedback[0] }) => (
    <div
      className={`
        group flex flex-col sm:flex-row gap-4 p-4 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all
        ${updatingIds.has(item.id) ? "opacity-50 pointer-events-none" : ""}
      `}
    >
      {/* User Avatar */}
      <div className="flex-shrink-0">
        <Avatar className="h-10 w-10 border border-white/10">
          <AvatarImage src={item.user?.avatarUrl || ""} />
          <AvatarFallback className="bg-blue-600/20 text-blue-400">
            {item.user?.name?.[0] || "?"}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-semibold text-white">
                {item.user?.name || "Anonymous User"}
              </h4>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-500">{item.user?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-white/10 bg-white/5 text-gray-400 gap-1.5">
                {getCategoryIcon(item.category)}
                {item.category}
              </Badge>
              <span className="flex items-center text-xs text-gray-500 gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                {updatingIds.has(item.id) ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MoreVertical className="w-4 h-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1A1F2E] border-white/10 text-white">
              <DropdownMenuItem 
                onClick={() => handleStatusUpdate(item.id, "REVIEWED")}
                disabled={item.status === "REVIEWED"}
                className="hover:bg-white/5 focus:bg-white/5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 mr-2 text-yellow-400" />
                Mark as Reviewed
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleStatusUpdate(item.id, "RESOLVED")}
                disabled={item.status === "RESOLVED"}
                className="hover:bg-white/5 focus:bg-white/5 cursor-pointer"
              >
                <Archive className="w-4 h-4 mr-2 text-green-400" />
                Mark as Resolved
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleStatusUpdate(item.id, "NEW")}
                disabled={item.status === "NEW"}
                className="hover:bg-white/5 focus:bg-white/5 cursor-pointer"
              >
                <Inbox className="w-4 h-4 mr-2 text-blue-400" />
                Mark as New
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="bg-black/20 rounded-md p-3 border border-white/5">
          <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
            {item.message}
          </p>
        </div>
        
        {item.pageContext && (
           <p className="text-xs text-gray-600 font-mono">
             Context: {item.pageContext}
           </p>
        )}
      </div>
    </div>
  );

  return (
    <Card className="bg-[#0B0F1A] border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                    <Inbox className="w-5 h-5 text-blue-500" />
                    Feedback Inbox
                </CardTitle>
                <CardDescription className="text-gray-400">
                    Manage user feedback, bug reports, and suggestions.
                </CardDescription>
            </div>
            <div className="flex gap-2">
                <Badge variant="outline" className={`${getStatusColor("NEW")}`}>
                    {feedback.filter(i => i.status === "NEW").length} New
                </Badge>
                <Badge variant="outline" className={`${getStatusColor("RESOLVED")}`}>
                    {feedback.filter(i => i.status === "RESOLVED").length} Resolved
                </Badge>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="NEW" className="w-full">
          <TabsList className="bg-white/5 border border-white/10 w-full justify-start h-auto p-1 mb-6">
            <TabsTrigger 
                value="NEW"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400 gap-2"
            >
                <Inbox className="w-4 h-4" />
                Inbox
                <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
                    {feedback.filter(i => i.status === "NEW").length}
                </span>
            </TabsTrigger>
            <TabsTrigger 
                value="REVIEWED"
                className="data-[state=active]:bg-yellow-600/20 data-[state=active]:text-yellow-400 text-gray-400 gap-2"
            >
                <CheckCircle2 className="w-4 h-4" />
                Reviewed
                <span className="ml-1 bg-white/10 px-1.5 py-0.5 rounded-full text-xs">
                    {feedback.filter(i => i.status === "REVIEWED").length}
                </span>
            </TabsTrigger>
             <TabsTrigger 
                value="RESOLVED"
                className="data-[state=active]:bg-green-600/20 data-[state=active]:text-green-400 text-gray-400 gap-2"
            >
                <Archive className="w-4 h-4" />
                Resolved
                <span className="ml-1 bg-white/10 px-1.5 py-0.5 rounded-full text-xs">
                    {feedback.filter(i => i.status === "RESOLVED").length}
                </span>
            </TabsTrigger>
            <TabsTrigger 
                value="ALL"
                className="data-[state=active]:bg-white/10 text-gray-400 gap-2 ml-auto"
            >
                All Feedback
            </TabsTrigger>
          </TabsList>

          {["NEW", "REVIEWED", "RESOLVED", "ALL"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4 mt-0">
              {filteredFeedback(tab).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-white/10 rounded-lg">
                  <div className="bg-white/5 p-4 rounded-full mb-4">
                    <MessageSquare className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-300">No feedback found</h3>
                  <p className="text-gray-500 max-w-sm mt-1">
                    {tab === "NEW" 
                        ? "You're all caught up! No new feedback." 
                        : `No feedback marked as ${tab.toLowerCase()}.`}
                  </p>
                </div>
              ) : (
                filteredFeedback(tab).map((item) => (
                  <FeedbackItem key={item.id} item={item} />
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
