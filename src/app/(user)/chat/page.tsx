"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Search, Send, Paperclip, MoreVertical, ArrowLeft, Loader2, Check, CheckCheck, MessageSquare, Flag, Ban } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ReportModal } from "@/components/modals/ReportModal";
import { useToast } from "@/components/ui/use-toast";
import { ChatLockBanner } from "@/components/chat/ChatLockBanner";

type Message = {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    avatarUrl: string | null;
    lastSeen?: string;
    isOnline?: boolean;
  };
  status?: 'sent' | 'delivered' | 'read'; // UI-only field for now
};

type Conversation = {
  id: string;
  userAId: string;
  userBId: string;
  status: 'ACTIVE' | 'LOCKED';
  isLocked?: boolean;
  lockReason?: string;
  lastMessageAt: string;
  userA: {
    id: string;
    name: string;
    avatarUrl: string | null;
    lastSeen?: string;
    isOnline?: boolean;
  };
  userB: {
    id: string;
    name: string;
    avatarUrl: string | null;
    lastSeen?: string;
    isOnline?: boolean;
  };
  request: {
    id: string;
    status: string;
    item: {
      id: string;
      name: string;
      imageUrl: string | null;
      ownerId: string | null;
    };
  } | null;
  messages: Message[];
};

// --- Helper Components ---



function DateSeparator({ date }: { date: string }) {
    return (
        <div className="flex justify-center my-6">
            <span className="bg-white/5 text-gray-500 text-xs px-3 py-1 rounded-full border border-white/5">
                {date}
            </span>
        </div>
    );
}

function TypingIndicator() {
    return (
        <div className="flex items-center gap-1 px-4 py-2 bg-[#1E2330] rounded-full w-fit ml-10 mb-2">
            <motion.div 
                animate={{ scale: [1, 1.2, 1] }} 
                transition={{ repeat: Infinity, duration: 0.8 }} 
                className="w-1.5 h-1.5 bg-gray-500 rounded-full" 
            />
             <motion.div 
                animate={{ scale: [1, 1.2, 1] }} 
                transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} 
                className="w-1.5 h-1.5 bg-gray-500 rounded-full" 
            />
             <motion.div 
                animate={{ scale: [1, 1.2, 1] }} 
                transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} 
                className="w-1.5 h-1.5 bg-gray-500 rounded-full" 
            />
        </div>
    )
}

import { Suspense } from "react";

// --- Main Components ---

function ChatContent() {
  const searchParams = useSearchParams();
  const initialChatId = searchParams.get("id");
  const { toast } = useToast();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(initialChatId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // UI States
  const [isTyping, setIsTyping] = useState(false); // Simulates other user typing
  const [reportOpen, setReportOpen] = useState(false);
  const [reportChatOpen, setReportChatOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [blockedIds, setBlockedIds] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Fetch Data ---
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch current user
        const userRes = await fetch('/api/me');
        if (userRes.ok) {
           const userData = await userRes.json();
           setCurrentUserId(userData.data.id);
        }

        // Fetch conversations
        const convRes = await fetch('/api/conversations');
        if (convRes.ok) {
          const convData = await convRes.json();
          setConversations(convData.data || []);
          
          if (!initialChatId && !selectedChat && convData.data && convData.data.length > 0) {
            setSelectedChat(convData.data[0].id);
          }
        }

        // Fetch blocked users list
        const blockRes = await fetch('/api/users/block');
        if (blockRes.ok) {
          const blockData = await blockRes.json();
          setBlockedIds(blockData.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [initialChatId]);


  // --- Poll Messages ---
  const fetchMessages = useCallback(async () => {
    if (!selectedChat) return;
    try {
      const res = await fetch(`/api/conversations/${selectedChat}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.data.messages || []);
        
        // Update lock status if changed
        if (data.data.isLocked !== undefined) {
            setConversations(prev => prev.map(c => 
                c.id === selectedChat 
                ? { ...c, isLocked: data.data.isLocked, lockReason: data.data.lockReason } 
                : c
            ));
        }
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  }, [selectedChat]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  // --- Handle Typing (Real-time) ---
  const [lastTypingTime, setLastTypingTime] = useState(0);
  
  const notifyTyping = useCallback(async (isTyping: boolean) => {
    if (!selectedChat) return;
    try {
      await fetch('/api/chat/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: selectedChat, isTyping })
      });
    } catch (err) {
      console.error('Failed to notify typing:', err);
    }
  }, [selectedChat]);

  const handleTyping = () => {
    const now = Date.now();
    if (now - lastTypingTime > 2000) {
      setLastTypingTime(now);
      notifyTyping(true);
    }
    
    // Clear typing indicator after 3 seconds of inactivity
    const timeout = setTimeout(() => {
      notifyTyping(false);
    }, 3000);
    
    return () => clearTimeout(timeout);
  };

  // Poll for other user's typing status
  useEffect(() => {
    if (!selectedChat) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/chat/typing?conversationId=${selectedChat}`);
        if (res.ok) {
          const data = await res.json();
          setIsTyping(data.data.isTyping);
        }
      } catch (err) {
        console.error('Failed to fetch typing status:', err);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [selectedChat]);

  // --- Scroll to Bottom ---
  const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);


  // --- Handle Send (Optimistic) ---
  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat || !currentUserId) return;

    const tempId = `temp-${Date.now()}`;
    const content = message.trim();
    
    // Create Optimistic Message
    const optimisticMsg: Message = {
        id: tempId,
        content,
        senderId: currentUserId,
        createdAt: new Date().toISOString(),
        sender: {
            id: currentUserId,
            name: "Me", // Placeholder
            avatarUrl: null
        },
        status: 'sent'
    };

    // Update UI immediately
    setMessages(prev => [...prev, optimisticMsg]);
    setMessage("");
    
    // Notify typing stopped
    notifyTyping(false);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedChat,
          content,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const serverMsg = data.data;
        // Replace optimistic message with real one
        setMessages(prev => prev.map(m => m.id === tempId ? { ...serverMsg, status: 'delivered' } : m));
      } else {
          // Error handling: maybe mark as failed?
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // --- Group Messages by Date ---
  const groupedMessages = messages.reduce((acc, msg) => {
      const date = new Date(msg.createdAt).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
      if (!acc[date]) acc[date] = [];
      acc[date].push(msg);
      return acc;
  }, {} as Record<string, Message[]>);


  // --- Render Helpers ---
  const getOtherUser = (conv: Conversation) => {
    if (!currentUserId) return conv.userA;
    return conv.userAId === currentUserId ? conv.userB : conv.userA;
  };

  const currentConv = conversations.find(c => c.id === selectedChat);
  const displayOtherUser = currentConv ? getOtherUser(currentConv) : null;
  const isBlocked = displayOtherUser ? blockedIds.includes(displayOtherUser.id) : false;
  const isChatLocked = currentConv?.isLocked || isBlocked;

  const [otherUserPresence, setOtherUserPresence] = useState<'online' | 'offline'>('offline');

  // Update presence status — trust server-computed isOnline (staleness-checked)
  useEffect(() => {
    if (!displayOtherUser) {
      setOtherUserPresence('offline');
      return;
    }
    setOtherUserPresence(displayOtherUser.isOnline ? 'online' : 'offline');
  }, [displayOtherUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] pt-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 h-[calc(100vh-6rem)] overflow-hidden">
        <div className="flex h-full bg-[#0B0F1A] border border-white/5 rounded-2xl overflow-hidden glass-card">
            {/* Sidebar */}
            <div className={`${selectedChat && "hidden md:flex"} w-full md:w-80 flex-shrink-0 border-r border-white/10 flex flex-col bg-white/5`}>
                <div className="p-4 border-b border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white">Messages</h2>
                        <Button variant="ghost" size="icon" className="text-gray-400">
                            <MoreVertical className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {conversations.map((conv) => {
                      const user = getOtherUser(conv);
                      const lastMsg = conv.messages[conv.messages.length - 1];
                      // Trust server-computed isOnline (staleness-checked server-side)
                      const isOnline = !!user.isOnline;

                        return (
                            <div
                                key={conv.id}
                                onClick={() => setSelectedChat(conv.id)}
                                className={cn(
                                    "p-4 flex items-center gap-3 cursor-pointer transition-colors border-b border-white/5",
                                    selectedChat === conv.id ? "bg-[#4F9DFF]/10 border-l-4 border-l-[#4F9DFF]" : "hover:bg-white/5"
                                )}
                            >
                                <div className="relative">
                                    <UserAvatar user={user} className="w-12 h-12 border border-white/10" />
                                    {isOnline && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0B0F1A] rounded-full shadow-lg"></div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-semibold text-gray-100 truncate">{user.name}</h3>
                                        <span className="text-[10px] text-gray-500">
                                            {lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-1 truncate">{conv.request?.item.name || 'General Inquiry'}</p>
                                    {lastMsg && (
                                        <p className="text-sm text-gray-400 truncate flex items-center gap-1">
                                            {lastMsg.senderId === currentUserId && <CheckCheck className="w-3 h-3" />}
                                            {lastMsg.content}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`${!selectedChat && "hidden md:flex"} flex-1 flex flex-col bg-[#0B0F1A]/50`}>
                {currentConv ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="md:hidden text-gray-400 mr-2"
                                    onClick={() => setSelectedChat(null)}
                                >
                                    <ArrowLeft size={20} />
                                </Button>
                                <div className="relative">
                                    <UserAvatar user={displayOtherUser} />
                                    {otherUserPresence === 'online' && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0B0F1A] rounded-full shadow-lg"></div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-100">{displayOtherUser?.name}</h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-400 text-muted-foreground">
                                        <div className={cn("w-1.5 h-1.5 rounded-full", otherUserPresence === 'online' ? "bg-green-500 animate-pulse" : "bg-gray-500")} />
                                        {otherUserPresence === 'online' ? "Online Now" : "Offline"}
                                        {currentConv.request?.status === 'LOCKED' && (
                                            <Badge variant="outline" className="ml-2 text-[10px] border-yellow-500/50 text-yellow-500 py-0 h-4 uppercase tracking-tighter">Locked</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-[#4F9DFF]">
                                    <Search size={20} />
                                </Button>
                                
                                {/* Menu with Report and Block */}
                                <div className="relative">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-gray-400 hover:text-[#4F9DFF]"
                                    onClick={() => setMenuOpen(!menuOpen)}
                                  >
                                    <MoreVertical size={20} />
                                  </Button>
                                  
                                  {menuOpen && displayOtherUser && (
                                    <div className="absolute right-0 top-12 z-20 bg-[#1E2330] border border-white/10 rounded-lg shadow-xl min-w-[180px]">
                                      <button
                                        onClick={() => {
                                          setReportOpen(true);
                                          setMenuOpen(false);
                                        }}
                                        className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2 border-b border-white/5"
                                      >
                                        <Flag size={16} />
                                        Report User
                                      </button>
                                      <button
                                        onClick={() => {
                                          setReportChatOpen(true);
                                          setMenuOpen(false);
                                        }}
                                        className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2 border-b border-white/5"
                                      >
                                        <MessageSquare size={16} />
                                        Report Chat
                                      </button>
                                      <button
                                        onClick={async () => {
                                          setMenuOpen(false);
                                          if (isBlocked) {
                                            // Unblock
                                            const res = await fetch('/api/users/block', {
                                              method: 'DELETE',
                                              headers: { 'Content-Type': 'application/json' },
                                              body: JSON.stringify({ blockedId: displayOtherUser.id }),
                                            });
                                            if (res.ok) {
                                              setBlockedIds(prev => prev.filter(id => id !== displayOtherUser.id));
                                              // Refetch messages to get server-side lock state
                                              // (if business-logic lock exists, isLocked will remain true)
                                              fetchMessages();
                                              toast({
                                                  title: "User Unblocked",
                                                  description: "You have unblocked this user.",
                                                  variant: "success",
                                              });
                                            }
                                          } else {
                                            // Block
                                            if (confirm(`Are you sure you want to block ${displayOtherUser.name}?`)) {
                                              const res = await fetch('/api/users/block', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ blockedId: displayOtherUser.id }),
                                              });
                                              if (res.ok) {
                                                setBlockedIds(prev => [...prev, displayOtherUser.id]);
                                                toast({
                                                    title: "User Blocked",
                                                    description: "You have blocked this user. Messages are now disabled.",
                                                    variant: "destructive",
                                                });
                                              }
                                            }
                                          }
                                        }}
                                        className={cn(
                                          "w-full px-4 py-3 text-left text-sm hover:bg-white/5 flex items-center gap-2",
                                          isBlocked ? "text-green-400" : "text-red-400"
                                        )}
                                      >
                                        <Ban size={16} />
                                        {isBlocked ? 'Unblock User' : 'Block User'}
                                      </button>
                                    </div>
                                  )}
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <ScrollArea className="flex-1 p-4 sm:p-6" ref={scrollRef}>
                            <div className="space-y-6">
                                {Object.entries(groupedMessages).map(([date, msgs]) => (
                                    <div key={date}>
                                        <DateSeparator date={date} />
                                        {msgs.map((msg, index) => {
                                            const isMe = msg.senderId === currentUserId;
                                            const showAvatar = !isMe && (index === msgs.length - 1 || msgs[index + 1]?.senderId !== msg.senderId);

                                            return (
                                                <MessageBubble
                                                    key={msg.id}
                                                    message={msg}
                                                    isMe={isMe}
                                                    showAvatar={showAvatar}
                                                />
                                            );
                                        })}
                                    </div>
                                ))}

                                {isTyping && (
                                    <div className="flex items-end gap-2">
                                        <UserAvatar user={displayOtherUser} className="w-8 h-8" />
                                        <div className="bg-white/10 rounded-2xl rounded-bl-none px-4 py-2 border border-white/5">
                                            <div className="flex gap-1">
                                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/10 bg-white/2">
                            {isChatLocked ? (
                                <ChatLockBanner reason={
                                  isBlocked 
                                    ? 'You have blocked this user. Unblock to resume messaging.' 
                                    : currentConv.lockReason
                                } />
                            ) : (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }}
                                    className="flex items-end gap-2 max-w-4xl mx-auto"
                                >
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-gray-400 hover:text-[#4F9DFF]"
                                    >
                                        <Paperclip size={20} />
                                    </Button>
                                    <div className="flex-1">
                                        <Input
                                            value={message}
                                            onChange={(e) => {
                                                setMessage(e.target.value);
                                                handleTyping();
                                            }}
                                            placeholder="Type a message..."
                                            className="bg-white/5 border-white/10 text-white rounded-xl focus-visible:ring-[#4F9DFF]"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        size="icon"
                                        disabled={!message.trim()}
                                        className="bg-[#4F9DFF] hover:bg-[#4F9DFF]/90 text-white rounded-xl h-10 w-10 flex-shrink-0 shadow-lg shadow-[#4F9DFF]/20"
                                    >
                                        <Send size={18} />
                                    </Button>
                                </form>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center p-8">
                        <div className="w-20 h-20 bg-[#4F9DFF]/10 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare className="w-10 h-10 text-[#4F9DFF]" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Select a conversation</h3>
                        <p className="text-gray-400 max-w-sm">Choose a chat from the sidebar to start messaging your college mates.</p>
                    </div>
                )}
            </div>
        </div>

        {displayOtherUser && (
            <ReportModal
                isOpen={reportOpen}
                onClose={() => setReportOpen(false)}
                entityType="USER"
                entityId={displayOtherUser.id}
                entityName={displayOtherUser.name}
            />
        )}
        {selectedChat && (
            <ReportModal
                isOpen={reportChatOpen}
                onClose={() => setReportChatOpen(false)}
                entityType="CHAT"
                entityId={selectedChat}
                entityName={`Chat with ${displayOtherUser?.name || 'Member'}`}
            />
        )}
    </div>
  );
}

function MessageBubble({
    message,
    isMe,
    showAvatar,
}: {
    message: Message;
    isMe: boolean;
    showAvatar: boolean;
}) {
    return (
        <div
            className={cn(
                "flex w-full mb-2",
                isMe ? "justify-end" : "justify-start"
            )}
        >
            <div className={`flex max-w-[75%] ${isMe ? "flex-row-reverse" : "flex-row"} items-end gap-2`}>
                <div className="w-8 h-8 flex-shrink-0">
                    {showAvatar ? (
                        <UserAvatar user={message.sender} className="w-8 h-8" />
                    ) : <div className="w-8" />}
                </div>

                <div
                    className={cn(
                        "relative group p-3 rounded-2xl shadow-sm border",
                        isMe
                            ? "bg-[#4F9DFF] text-white border-[#4F9DFF]/20 rounded-br-none"
                            : "bg-white/10 text-gray-100 border-white/5 rounded-bl-none"
                    )}
                >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    <div className={cn(
                        "flex items-center gap-1 mt-1 text-[10px]",
                        isMe ? "text-blue-100/70 justify-end" : "text-gray-500"
                    )}>
                        <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isMe && (
                             message.status === 'delivered' ? <CheckCheck size={12} className="text-white" /> : <Check size={12} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh] pt-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
