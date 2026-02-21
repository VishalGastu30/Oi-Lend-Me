import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MoreVertical,
  RotateCcw,
  Eye,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

interface RequestCardProps {
  req: GroupRequest;
  onViewDetails: (req: GroupRequest) => void;
  onAction: (req: GroupRequest, action: 'APPROVE' | 'REJECT' | 'SEND_BACK') => void;
}

export function RequestCard({ req, onViewDetails, onAction }: RequestCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'APPROVED': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'REJECTED': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'NEEDS_EDIT': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <Card className="group relative overflow-hidden border-white/5 bg-[#141414] hover:bg-[#1A1A1A] hover:border-white/10 transition-all duration-300 shadow-xl">
       {/* Status Status Indicator Line */}
       <div className={`absolute top-0 left-0 w-1 h-full opacity-60 group-hover:opacity-100 transition-opacity ${
        req.status === 'APPROVED' ? 'bg-emerald-500' : 
        req.status === 'REJECTED' ? 'bg-red-500' : 
        req.status === 'NEEDS_EDIT' ? 'bg-orange-500' : 
        'bg-yellow-500'
      }`} />

      <CardHeader className="pb-3 pl-6">
        <div className="flex justify-between items-start mb-3">
           <Badge variant="outline" className={`${getStatusColor(req.status)} px-2.5 py-1 text-xs font-semibold backdrop-blur-sm`}>
            {req.status === 'NEEDS_EDIT' ? 'CHANGES REQUESTED' : req.status}
           </Badge>
           <span className="text-xs text-white/40 flex items-center gap-1.5 font-mono">
             <Clock className="w-3 h-3" />
             {format(new Date(req.createdAt), 'MMM d')}
           </span>
        </div>
        
        <div className="flex justify-between items-start gap-2">
            <div>
                <CardTitle className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors leading-tight mb-1">
                  {req.groupName}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-white/60 text-[10px] uppercase tracking-wider font-semibold">
                    {req.category}
                  </span>
                </CardDescription>
            </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pb-3 pl-6">
        <p className="text-sm text-white/50 line-clamp-2 min-h-[2.5rem] leading-relaxed">
          {req.shortDescription || <span className="italic opacity-50">No description provided.</span>}
        </p>
        
        <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl group-hover:bg-white/[0.04] transition-colors">
          <Avatar className="h-9 w-9 border border-white/10">
            <AvatarImage src={req.requester.avatarUrl} />
            <AvatarFallback className="bg-blue-600/20 text-blue-400 text-xs">{req.requester.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-white/90 truncate">{req.requester.name}</p>
            <p className="text-xs text-white/40 truncate">{req.requester.email}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 pb-4 pl-6 flex justify-between gap-3 border-t border-white/5 bg-white/[0.01]">
        <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 text-white/60 hover:text-white hover:bg-white/5 text-xs font-medium h-9" 
            onClick={() => onViewDetails(req)}
        >
           <Eye className="w-3.5 h-3.5 mr-2" />
           View Details
        </Button>
        
        {req.status === 'PENDING' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-white/40 hover:text-white hover:bg-white/5">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-[#1A1A1A] border-white/10 text-white">
              <DropdownMenuLabel className="text-xs text-white/40 uppercase tracking-wider">Decision</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem 
                className="text-emerald-400 focus:text-emerald-400 focus:bg-emerald-500/10 cursor-pointer py-2.5"
                onClick={() => onAction(req, 'APPROVE')}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve Request
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-orange-400 focus:text-orange-400 focus:bg-orange-500/10 cursor-pointer py-2.5"
                onClick={() => onAction(req, 'SEND_BACK')}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Request Changes
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem 
                className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer py-2.5"
                onClick={() => onAction(req, 'REJECT')}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject Permanently
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardFooter>
    </Card>
  );
}
