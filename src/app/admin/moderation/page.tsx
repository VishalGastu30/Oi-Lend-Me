'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  UserX, 
  Trash2, 
  Lock, 
  Gavel, 
  History,
  AlertTriangle,
  User,
  Package,
  Ban,
  Skull,
  CheckCircle,
  XCircle,
  RotateCcw,
  Users,
  Calendar,
  Eye,
  EyeOff,
  Globe,
  ShieldOff
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminCard } from '@/components/admin/ui/AdminCard';
import { Input } from '@/components/ui/input';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  getModerationLogs, 
  performModerationAction 
} from '../actions';
import { ActionType, EntityType } from '@prisma/client';
import { AnimatePresence, motion } from 'framer-motion';

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="bg-blue-500/30 text-blue-300 px-0.5 rounded-sm">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default function AdminModerationPage() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'USER' | 'ITEM' | 'GROUP'>('USER');
  const [results, setResults] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);
  const [actionType, setActionType] = useState<ActionType>('WARN');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    handleSearch();
  }, [searchType]); // Run on mount and when type switches

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const endpoint = searchType === 'USER' 
        ? `/api/admin/users/search?q=${encodeURIComponent(query.trim())}`
        : searchType === 'ITEM'
          ? `/api/admin/items/search?q=${encodeURIComponent(query.trim())}`
          : `/api/admin/groups/search?q=${encodeURIComponent(query.trim())}`;
      
      const res = await fetch(endpoint);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Search failed');
      }
      const data = await res.json();
      setResults(
        (searchType === 'USER' ? data.users : 
        searchType === 'ITEM' ? data.items : 
        data.groups) || []
      );
    } catch (error: any) {
      toast.error(error.message || 'Search failed');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAction = async () => {
    if (!selectedEntity) return;
    setIsSubmitting(true);
    
    try {
      const result = await performModerationAction({
        actionType,
        targetType: searchType as EntityType,
        targetId: selectedEntity.id,
        notes: notes
      });

      if (!result.success) throw new Error(result.error || 'Action failed');

      toast.success('Action taken successfully');
      setSelectedEntity(null);
      setNotes('');
      loadLogs();
      handleSearch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to take action');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (user: any) => {
    setIsSubmitting(true);
    try {
      // Determine if it's a ban or suspension (simplified check: > 1 year from now is usually permaban)
      const untilDate = new Date(user.bannedUntil);
      const isPermaban = untilDate.getFullYear() > 2090;
      const endpoint = isPermaban 
        ? `/api/admin/users/${user.id}/unban` 
        : `/api/admin/users/${user.id}/revoke-suspension`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) throw new Error('Revoke failed');
      
      toast.success('Penalty revoked successfully');
      handleSearch();
      loadLogs();
    } catch (error) {
      toast.error('Failed to revoke penalty');
    } finally {
        setIsSubmitting(false);
    }
  };

  const loadLogs = async () => {
    const data = await getModerationLogs();
    setLogs(data);
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader 
        title="Moderation Center" 
        subtitle="Enforce community guidelines and manage user access."
      >
        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-red-400">High Authority Zone</span>
        </div>
      </AdminPageHeader>

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="bg-[#0B0F1A] border border-white/5 p-1 mb-6">
          <TabsTrigger value="search" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400">
             <Search className="w-4 h-4 mr-2" /> Entity Search
          </TabsTrigger>
          <TabsTrigger value="logs" onClick={loadLogs} className="data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-400">
             <History className="w-4 h-4 mr-2" /> Action Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          <AdminCard title="Find Entity" subtitle="Search for users or items to take action on.">
             <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 flex gap-2">
                   <div className="w-[140px] shrink-0">
                       <Select value={searchType} onValueChange={(v: string) => { setSearchType(v as 'USER' | 'ITEM' | 'GROUP'); setResults([]); }}>
                            <SelectTrigger className="w-full bg-white/5 border-white/10 text-white focus:ring-blue-500/50">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1A1F2E] border-white/10 text-white min-w-[var(--radix-select-trigger-width)]">
                                <SelectItem value="USER" className="focus:bg-white/10 focus:text-white cursor-pointer">Users</SelectItem>
                                <SelectItem value="ITEM" className="focus:bg-white/10 focus:text-white cursor-pointer">Items</SelectItem>
                                <SelectItem value="GROUP" className="focus:bg-white/10 focus:text-white cursor-pointer">Groups</SelectItem>
                            </SelectContent>
                       </Select>
                   </div>
                   <div className="relative flex-1">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                       <Input 
                          placeholder={`Search ${searchType.toLowerCase()}s by name, email, or ID...`} 
                          value={query} 
                          onChange={(e) => setQuery(e.target.value)} 
                          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                          className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-blue-500/50 transition-all duration-200 focus:bg-white/10"
                       />
                   </div>
                </div>
                <Button 
                   onClick={handleSearch} 
                   disabled={isSearching}
                   className="bg-blue-600 hover:bg-blue-500 text-white font-medium"
                >
                   {isSearching ? 'Searching...' : 'Search Database'}
                </Button>
             </div>

             {/* Results */}
             <div className="space-y-4">
                {Array.isArray(results) && results.length > 0 && !isSearching && (
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        <Search className="w-3 h-3" />
                        Found {results.length} results for "{query}"
                    </div>
                )}

                {Array.isArray(results) && results.length === 0 && !isSearching && query && (
                    <div className="text-center py-12 bg-white/[0.02] border border-dashed border-white/5 rounded-xl">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                            <Search className="w-6 h-6 text-gray-600" />
                        </div>
                        <p className="text-gray-500 font-medium">No results found for "{query}"</p>
                        <p className="text-sm text-gray-600 mt-1">Try searching by full name or specific email.</p>
                    </div>
                )}

                <AnimatePresence mode='popLayout'>
                    {(Array.isArray(results) ? results : []).map((item, index) => {
                        // GROUP-SPECIFIC CARD
                        if (searchType === 'GROUP') {
                            const isBanned = item.status === 'PERMA_BANNED';
                            return (
                                <motion.div 
                                   key={item.id}
                                   initial={{ opacity: 0, y: 10 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   exit={{ opacity: 0, scale: 0.95 }}
                                   transition={{ delay: index * 0.03 }}
                                   className={`flex items-center justify-between p-5 rounded-xl border transition-all duration-200 ${
                                     isBanned 
                                       ? 'bg-red-950/20 border-red-500/20' 
                                       : 'bg-white/5 border-white/5 hover:bg-white/[0.08] hover:border-white/10'
                                   }`}
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        {/* Group Image */}
                                        <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                                            ) : (
                                                <Users className="w-5 h-5 text-gray-500" />
                                            )}
                                        </div>
                                        {/* Group Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-semibold text-white truncate">
                                                    <Highlight text={item.name} query={query} />
                                                </h4>
                                                {isBanned && (
                                                    <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px] px-1.5 py-0">BANNED</Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <span className="inline-flex items-center gap-1">
                                                    <Badge variant="outline" className="bg-white/5 border-white/10 text-gray-400 text-[10px] font-normal px-1.5 py-0">
                                                        {item.category?.replace('_', ' ')}
                                                    </Badge>
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    {item.visibility === 'PUBLIC' ? <Globe className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                                    {item.visibility === 'PUBLIC' ? 'Public' : 'Private'}
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {item.memberCount ?? item._count?.members ?? 0}
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(item.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {item.owner && (
                                                <p className="text-xs text-gray-600 mt-0.5">
                                                    Owner: <Highlight text={item.owner.name || item.owner.email} query={query} />
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        {isBanned ? (
                                            <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-xs">Permanently Banned</Badge>
                                        ) : (
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/30"
                                                onClick={() => { setSelectedEntity(item); setActionType('BAN'); }}
                                            >
                                                <Skull className="w-4 h-4 mr-2" /> Permanently Ban
                                            </Button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        }

                        // DEFAULT CARD (USER / ITEM)
                        return (
                            <motion.div 
                               key={item.id}
                               initial={{ opacity: 0, y: 10 }}
                               animate={{ opacity: 1, y: 0 }}
                               exit={{ opacity: 0, scale: 0.95 }}
                               transition={{ delay: index * 0.03 }}
                               className="group flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all duration-200"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${
                                        searchType === 'USER' ? 'bg-blue-500/20 text-blue-400' : 
                                        'bg-purple-500/20 text-purple-400'
                                    }`}>
                                        {searchType === 'USER' ? <User className="w-5 h-5" /> : 
                                         <Package className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white">
                                            <Highlight text={item.name} query={query} />
                                        </h4>
                                        <p className="text-sm text-gray-400">
                                            {item.email ? (
                                                <Highlight text={item.email} query={query} />
                                            ) : (item.owner?.email ? (
                                                <>Owner: <Highlight text={item.owner.email} query={query} /></>
                                            ) : (
                                                <span className="font-mono text-xs opacity-50">{item.id}</span>
                                            ))}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    {item.bannedUntil && new Date(item.bannedUntil) > new Date() ? (
                                        <>
                                            <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20">BANNED</Badge>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                className="border-white/10 text-white hover:bg-emerald-500/20 hover:text-emerald-400"
                                                onClick={() => handleRevoke(item)}
                                                disabled={isSubmitting}
                                            >
                                                <RotateCcw className="w-4 h-4 mr-2" /> Revoke
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            {item.status === 'ARCHIVED' && (
                                                <Badge variant="secondary" className="bg-gray-500/10 text-gray-400 border-gray-500/20">ARCHIVED</Badge>
                                            )}
                                            
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                className="border-white/10 text-white hover:bg-white/10 hover:text-white"
                                                onClick={() => setSelectedEntity(item)}
                                            >
                                                <Gavel className="w-4 h-4 mr-2" /> Take Action
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
             </div>
          </AdminCard>
        </TabsContent>

        <TabsContent value="logs">
           <AdminCard title="Audit Log" subtitle="Immutable record of all moderation actions.">
              <div className="overflow-hidden rounded-lg border border-white/5">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white/5 text-gray-400 uppercase font-medium">
                    <tr>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Target</th>
                      <th className="px-4 py-3">Admin</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3">
                           <Badge variant="outline" className="bg-white/5 border-white/10 text-white">
                              {log.actionType.replace('_', ' ')}
                           </Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-300 font-mono text-xs">{log.targetId.substring(0, 8)}...</td>
                        <td className="px-4 py-3 text-blue-400">
                           {log.admin?.name || 'Unknown'}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{new Date(log.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-gray-400 max-w-xs truncate">{log.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {logs.length === 0 && (
                   <div className="p-8 text-center text-gray-500">No logs found.</div>
                )}
              </div>
           </AdminCard>
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={!!selectedEntity} onOpenChange={(o) => !o && setSelectedEntity(null)}>
        <DialogContent className="bg-[#0B0F1A] border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                Administrative Action
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Applying penalty to <span className="text-white font-medium">{selectedEntity?.name}</span>.
              <br/>This action will be logged permanently.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
             <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Action Severity</label>
                <div className="grid grid-cols-2 gap-2">
                     {searchType === 'USER' ? (
                         <>
                            <button 
                              onClick={() => setActionType('WARN')}
                              className={`flex flex-col items-center justify-center p-4 gap-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                                actionType === 'WARN' 
                                  ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400 ring-1 ring-yellow-500/20' 
                                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
                              }`}
                            >
                               <AlertTriangle className="w-6 h-6 mb-1" />
                               <span>Warn User</span>
                            </button>
                            <button 
                              onClick={() => setActionType('BLOCK')}
                              className={`flex flex-col items-center justify-center p-4 gap-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                                actionType === 'BLOCK' 
                                  ? 'bg-orange-500/10 border-orange-500/50 text-orange-400 ring-1 ring-orange-500/20' 
                                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
                              }`}
                            >
                               <Ban className="w-6 h-6 mb-1" />
                               <span>Suspend (7d)</span>
                            </button>
                            <button 
                              onClick={() => setActionType('BAN')}
                              className={`flex flex-col items-center justify-center p-4 gap-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                                actionType === 'BAN' 
                                  ? 'bg-red-500/10 border-red-500/50 text-red-500 ring-1 ring-red-500/20' 
                                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
                              }`}
                            >
                               <Skull className="w-6 h-6 mb-1" />
                               <span>Permaban</span>
                            </button>
                         </>
                      ) : searchType === 'ITEM' ? (
                           <button 
                               onClick={() => setActionType('REMOVE_ITEM')}
                               className={`flex flex-col items-center justify-center p-4 gap-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                                 actionType === 'REMOVE_ITEM' 
                                   ? 'bg-red-500/10 border-red-500/50 text-red-500 ring-1 ring-red-500/20' 
                                   : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
                               }`}
                             >
                                <Trash2 className="w-6 h-6 mb-1" />
                                <span>Remove Item</span>
                             </button>
                      ) : (
                           /* GROUP: SINGLE ACTION — PERMANENTLY BAN */
                           <div className="col-span-2">
                             <div className="p-5 rounded-lg border border-red-500/30 bg-red-950/20 text-center">
                                <Skull className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                <p className="text-red-400 font-bold text-sm">Permanently Ban Group</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    All members will receive a 7-day suspension.
                                    <br/>Group and its inventory will be erased from the platform.
                                </p>
                             </div>
                           </div>
                      )}
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reason / Notes</label>
                 <Textarea 
                    placeholder="Violation of community guidelines..." 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    className="bg-white/5 border-white/10 min-h-[100px] text-white focus:bg-white/10 focus-visible:ring-blue-500/50"
                 />
              </div>
           </div>

           <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="ghost" onClick={() => setSelectedEntity(null)} className="text-gray-400 hover:text-white hover:bg-white/10">Cancel</Button>
              <Button 
                 onClick={handleAction} 
                 className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20"
                 disabled={isSubmitting || !notes}
              >
                 {isSubmitting ? 'Processing...' : (
                    <span className="flex items-center gap-2">
                        <Gavel className="w-4 h-4" /> Execute Action
                    </span>
                 )}
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
