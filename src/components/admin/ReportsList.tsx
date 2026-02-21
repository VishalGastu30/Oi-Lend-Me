'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Report, User, EntityType, ActionType } from '@prisma/client';
import { performModerationAction, updateReportStatus } from '@/app/admin/actions';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ReportWithReporter = Report & {
  reporter: Partial<User> | null;
};

interface ReportsListProps {
  reports: ReportWithReporter[];
  currentFilter: string;
}

export function ReportsList({ reports, currentFilter }: ReportsListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedReport, setSelectedReport] = useState<ReportWithReporter | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFilterChange = (value: string) => {
    router.push(`/admin/reports?filter=${value}`);
  };

  const handleAction = async (actionType: ActionType) => {
    if (!selectedReport) return;
    setIsSubmitting(true);
    
    try {
      const result = await performModerationAction({
        actionType,
        targetType: selectedReport.entityType,
        targetId: selectedReport.entityId,
        notes: actionNotes
      });

      if (result.success) {
        toast({
          title: "Action Taken",
          description: `Successfully performed ${actionType} on ${selectedReport.entityType}.`,
        });
        setSelectedReport(null);
        setActionNotes('');
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: "Failed to perform action.",
          variant: "destructive"
        });
      }
    } catch (error) {
       console.error(error);
       toast({
          title: "Error",
          description: "An unexpected error occurred.",
          variant: "destructive"
        });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue={currentFilter} onValueChange={handleFilterChange} className="w-full">
        <TabsList className="bg-[#0B0F1A] border border-white/5 p-1 mb-6">
          <TabsTrigger value="ALL" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">All Reports</TabsTrigger>
          <TabsTrigger value="PENDING" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400">Pending</TabsTrigger>
          <TabsTrigger value="REVIEWED" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">Reviewed</TabsTrigger>
          <TabsTrigger value="ACTION_TAKEN" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">Resolved</TabsTrigger>
          <TabsTrigger value="DISMISSED" className="data-[state=active]:bg-gray-500/20 data-[state=active]:text-gray-400">Dismissed</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="rounded-xl border border-white/5 bg-white/[0.03] backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-gray-400">Date</TableHead>
              <TableHead className="text-gray-400">Reporter</TableHead>
              <TableHead className="text-gray-400">Entity</TableHead>
              <TableHead className="text-gray-400">Reason</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-right text-gray-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.length === 0 ? (
                 <TableRow className="border-white/5 hover:bg-transparent">
                    <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                       No reports found in this category.
                    </TableCell>
                  </TableRow>
            ) : reports.map((report) => (
              <TableRow key={report.id} className="border-white/5 hover:bg-white/[0.04] transition-colors group">
                <TableCell className="text-gray-400 font-mono text-xs">{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-200">{report.reporter?.name || 'Anonymous'}</span>
                    <span className="text-xs text-gray-500">{report.reporter?.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                   <Badge variant="outline" className="bg-white/5 border-white/10 text-gray-300">{report.entityType}</Badge>
                   <div className="text-xs text-gray-600 mt-1 font-mono truncate max-w-[100px] opacity-50 group-hover:opacity-100 transition-opacity">
                     {report.entityId.substring(0,8)}...
                   </div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-gray-300" title={report.reason}>{report.reason}</TableCell>
                <TableCell>
                  <Badge variant={report.status === 'PENDING' ? 'destructive' : (report.status as string) === 'DISMISSED' ? 'outline' : 'secondary'} 
                         className={
                           report.status === 'PENDING' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                           (report.status as string) === 'DISMISSED' ? 'bg-gray-500/5 text-gray-500 border-white/5' :
                           'bg-gray-500/10 text-gray-400 border-gray-500/10'
                         }>
                    {report.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedReport(report)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="max-w-xl bg-[#0B0F1A] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription className="text-gray-400">
              Review the report and take necessary moderation actions.
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm p-4 rounded-lg bg-white/5 border border-white/5">
                <div>
                  <span className="font-semibold text-gray-400 block mb-1">Reporter</span> 
                  <span className="text-white">{selectedReport.reporter?.name || 'Anonymous'}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-400 block mb-1">Entity Type</span> 
                  <span className="text-white">{selectedReport.entityType}</span>
                </div>
                <div className="col-span-2">
                  <span className="font-semibold text-gray-400 block mb-1">Reason</span> 
                  <span className="text-white bg-black/20 p-2 rounded block">{selectedReport.reason}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-400 block mb-1">Status</span> 
                  <span className={selectedReport.status === 'PENDING' ? 'text-red-400' : 'text-green-400'}>{selectedReport.status}</span>
                </div>
                 <div>
                  <span className="font-semibold text-gray-400 block mb-1">Target ID</span> 
                  <span className="font-mono text-gray-500">{selectedReport.entityId}</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <label className="text-sm font-medium mb-2 block text-gray-400">Admin Notes (Optional)</label>
                <Textarea 
                  placeholder="Add context for this action..." 
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  className="bg-black/20 border-white/10 text-white min-h-[100px]"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-2 justify-end">
                  <Button variant="ghost" onClick={() => setSelectedReport(null)} className="text-gray-400 hover:text-white hover:bg-white/10 mr-auto">Cancel</Button>

                  {selectedReport.entityType === 'USER' && (
                    <>
                       <Button 
                           variant="outline" 
                           onClick={() => handleAction('WARN')} 
                           disabled={isSubmitting}
                           className="border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/10"
                       >
                           Warn User
                       </Button>
                       <Button 
                           variant="secondary" 
                           onClick={() => handleAction('BLOCK')} 
                           disabled={isSubmitting}
                           className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border border-orange-500/20"
                       >
                           Block (7d)
                       </Button>
                       <Button 
                           variant="destructive" 
                           onClick={() => handleAction('BAN')} 
                           disabled={isSubmitting}
                           className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                       >
                           Perm Ban
                       </Button>
                    </>
                  )}
                  {selectedReport.entityType === 'ITEM' && (
                     <Button 
                        variant="destructive" 
                        onClick={() => handleAction('REMOVE_ITEM')} 
                        disabled={isSubmitting}
                        className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                     >
                        Remove Item
                     </Button>
                  )}
                  {((selectedReport.entityType as string) === 'MESSAGE' || (selectedReport.entityType as string) === 'CHAT') && (
                     <Button 
                        variant="destructive" 
                        onClick={() => handleAction('LOCK_CHAT')} 
                        disabled={isSubmitting}
                        className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                     >
                        Lock Chat
                     </Button>
                  )}
                  {(selectedReport.entityType as string) === 'GROUP' && (
                    <>
                       <Button 
                           variant="outline" 
                           onClick={() => handleAction('WARN')} 
                           disabled={isSubmitting}
                           className="border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/10"
                       >
                           Warn Group
                       </Button>
                       <Button 
                           variant="secondary" 
                           onClick={() => handleAction('BLOCK')} 
                           disabled={isSubmitting}
                           className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border border-orange-500/20"
                       >
                           Temp Ban
                       </Button>
                       <Button 
                           variant="destructive" 
                           onClick={() => handleAction('BAN')} 
                           disabled={isSubmitting}
                           className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                       >
                           Perm Ban Group
                       </Button>
                    </>
                  )}
                  {selectedReport.status === 'PENDING' && (
                    <Button
                      variant="ghost"
                      onClick={async () => {
                        setIsSubmitting(true);
                        await updateReportStatus(selectedReport.id, 'DISMISSED' as any);
                        setIsSubmitting(false);
                        setSelectedReport(null);
                        router.refresh();
                        toast({ title: "Report Dismissed" });
                      }}
                      disabled={isSubmitting}
                      className="text-gray-500 hover:text-white"
                    >
                      Dismiss
                    </Button>
                  )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
