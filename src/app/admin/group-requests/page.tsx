'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Search, 
  MoreVertical,
  ChevronRight,
  FileText,
  ShieldCheck,
  RotateCcw,
  Loader2,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GroupRequest {
  id: string;
  requesterId: string;
  groupName: string;
  category: string;
  facultyEmail?: string;
  officialEmail?: string;
  shortDescription?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_EDIT';
  reviewNotes?: string;
  createdAt: string;
  requester: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    karmaScore: number;
  };
  proofs: {
    id: string;
    fileUrl: string;
    fileType: string;
  }[];
}

import { RequestCard } from '@/components/admin/RequestCard';

// ... other imports

export default function GroupRequestsPage() {
  const [requests, setRequests] = useState<GroupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('PENDING');
  
  // Action States
  const [selectedRequest, setSelectedRequest] = useState<GroupRequest | null>(null);
  const [viewRequest, setViewRequest] = useState<GroupRequest | null>(null); // For View Details
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'SEND_BACK' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/groups/requests');
      if (!res.ok) throw new Error('Failed to fetch requests');
      const data = await res.json();
      setRequests(data.requests);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load group requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedRequest || !actionType) return;
    
    setProcessing(true);
    try {
      let endpoint = '';
      let body = {};

      switch (actionType) {
        case 'APPROVE':
          endpoint = `/api/groups/requests/${selectedRequest.id}/approve`;
          break;
        case 'REJECT':
          endpoint = `/api/groups/requests/${selectedRequest.id}/reject`;
          body = { reason: actionReason };
          break;
        case 'SEND_BACK':
          endpoint = `/api/groups/requests/${selectedRequest.id}/send-back`;
          body = { reason: actionReason };
          break;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Action failed');
      }

      toast.success(`Request ${actionType === 'APPROVE' ? 'approved' : actionType === 'REJECT' ? 'rejected' : 'sent back'} successfully`);
      
      // Refresh list
      fetchRequests();
      
      // Close dialog
      setActionType(null);
      setSelectedRequest(null);
      setActionReason('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const onCardAction = (req: GroupRequest, type: 'APPROVE' | 'REJECT' | 'SEND_BACK') => {
      setSelectedRequest(req);
      setActionType(type);
  };

  const filteredRequests = requests.filter(req => 
    req.status === activeTab &&
    (req.groupName.toLowerCase().includes(searchQuery.toLowerCase()) || 
     req.requester.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-[#0B0F1A]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Group Requests</h1>
          <p className="text-white/60 mt-1">Manage and approve institutional group applications</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/40" />
            <Input
              placeholder="Search requests..."
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="PENDING" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 max-w-2xl bg-white/5 border border-white/10">
          <TabsTrigger value="PENDING" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white/60">Pending</TabsTrigger>
          <TabsTrigger value="APPROVED" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-white/60">Approved</TabsTrigger>
          <TabsTrigger value="NEEDS_EDIT" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-white/60">Sent Back</TabsTrigger>
          <TabsTrigger value="REJECTED" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-white/60">Rejected</TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {loading ? (
              <div className="col-span-full flex justify-center py-12">
                <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="col-span-full text-center py-12 text-white/40 bg-white/[0.02] rounded-xl border border-dashed border-white/10">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No {activeTab.toLowerCase().replace('_', ' ')} requests found</p>
              </div>
            ) : (
              filteredRequests.map((req) => (
                <RequestCard 
                    key={req.id} 
                    req={req} 
                    onViewDetails={setViewRequest}
                    onAction={onCardAction}
                />
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={!!actionType} onOpenChange={(open) => !open && setActionType(null)}>
        <DialogContent className="bg-[#1A1A1A] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'APPROVE' && 'Approve Group Request'}
              {actionType === 'REJECT' && 'Reject Group Request'}
              {actionType === 'SEND_BACK' && 'Request Changes'}
            </DialogTitle>
            <DialogDescription className="text-white/60">
              {actionType === 'APPROVE' && `Are you sure you want to approve "${selectedRequest?.groupName}"? This will create a new group and make the requester an admin.`}
              {actionType === 'REJECT' && `This will permanently reject the request for "${selectedRequest?.groupName}".`}
              {actionType === 'SEND_BACK' && `Asking the requester to make changes to "${selectedRequest?.groupName}".`}
            </DialogDescription>
          </DialogHeader>

          {actionType !== 'APPROVE' && (
            <div className="py-4">
              <label className="text-sm font-medium mb-2 block text-white/80">
                {actionType === 'REJECT' ? 'Rejection Reason' : 'Changes Required'}
              </label>
              <Textarea 
                placeholder="Please explain why..." 
                className="bg-white/5 border-white/10 text-white resize-none h-32"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setActionType(null)} disabled={processing} className="text-white/60 hover:text-white hover:bg-white/5">
              Cancel
            </Button>
            <Button 
              variant={actionType === 'REJECT' ? 'destructive' : 'default'}
              onClick={handleAction}
              disabled={processing || (actionType !== 'APPROVE' && !actionReason.trim())}
              className={`${actionType === 'SEND_BACK' ? 'bg-orange-600 hover:bg-orange-700' : actionType === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-500' : ''} text-white`}
            >
              {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
              ) : (
                <>
                  {actionType === 'APPROVE' && 'Confirm Approval'}
                  {actionType === 'REJECT' && 'Reject Request'}
                  {actionType === 'SEND_BACK' && 'Send Back'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={!!viewRequest} onOpenChange={(open) => !open && setViewRequest(null)}>
        <DialogContent className="bg-[#1A1A1A] border-white/10 text-white max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline" className="text-blue-400 bg-blue-500/10 border-blue-500/20">
                        {viewRequest?.category}
                    </Badge>
                    <span className="text-white/40 text-sm">
                        Requested on {viewRequest && format(new Date(viewRequest.createdAt), 'PPP')}
                    </span>
                </div>
                <DialogTitle className="text-2xl font-bold">{viewRequest?.groupName}</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Description</h3>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-white/80 leading-relaxed">
                        {viewRequest?.shortDescription || "No description provided."}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Contact Info</h3>
                        <div className="space-y-2">
                            <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                                <p className="text-xs text-white/40 mb-0.5">Faculty Email</p>
                                <p className="text-sm font-medium">{viewRequest?.facultyEmail || "N/A"}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                                <p className="text-xs text-white/40 mb-0.5">Official Email</p>
                                <p className="text-sm font-medium">{viewRequest?.officialEmail || "N/A"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Requester</h3>
                        <div className="p-4 rounded-lg bg-white/5 border border-white/5 flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={viewRequest?.requester.avatarUrl} />
                                <AvatarFallback>{viewRequest?.requester.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium">{viewRequest?.requester.name}</p>
                                <p className="text-xs text-white/50">{viewRequest?.requester.email}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                                    <span className="text-[10px] text-white/40">Karma: {viewRequest?.requester.karmaScore}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Proof Documents</h3>
                    {viewRequest?.proofs && viewRequest.proofs.length > 0 ? (
                        <div className="grid gap-2">
                            {viewRequest.proofs.map((proof) => (
                                <a 
                                    key={proof.id} 
                                    href={proof.fileUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <FileText className="text-blue-400 w-5 h-5" />
                                        <span className="text-sm font-medium text-blue-100">Document Proof</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60" />
                                </a>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 rounded-lg bg-white/5 border border-dashed border-white/10 text-white/40 text-center text-sm">
                            No documents attached
                        </div>
                    )}
                </div>
            </div>

            <DialogFooter className="gap-2">
                <Button variant="ghost" onClick={() => setViewRequest(null)}>Close</Button>
                {viewRequest?.status === 'PENDING' && (
                    <Button onClick={() => {
                        setViewRequest(null);
                        onCardAction(viewRequest, 'APPROVE');
                    }} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                        Approve This Request
                    </Button>
                )}
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
