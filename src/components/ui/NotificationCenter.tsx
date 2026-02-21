"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bell, Check, Info, MessageSquare, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type NotificationType = "REQUEST" | "MESSAGE" | "SYSTEM" | "KARMA";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  resourcePath?: string;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchNotifications = useCallback(async () => {
    // Abort previous fetch if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch('/api/notifications', {
        signal: abortControllerRef.current.signal
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data || []);
      } else {
        // Log API-level errors
        console.warn(`API error fetching notifications: ${res.status} ${res.statusText}`);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      
      // Distinguished network errors (like the one reported by the user)
      console.error('Network error fetching notifications:', error.message || error);
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  // Fetch real notifications from API
  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 10 seconds
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Refetch when popover opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    // Optimistically update UI
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    // Call API to persist
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Revert on error
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    // Optimistically update UI
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    // Call API to persist
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      // Revert on error
      fetchNotifications();
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "REQUEST":
        return <Package className="w-4 h-4 text-blue-400" />;
      case "MESSAGE":
        return <MessageSquare className="w-4 h-4 text-green-400" />;
      case "KARMA":
        return <Check className="w-4 h-4 text-yellow-400" />;
      default:
        return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const filterByType = (type?: NotificationType) => {
    if (!type) return notifications;
    return notifications.filter((n) => n.type === type);
  };

  const NotificationList = ({ items }: { items: Notification[] }) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Bell className="w-12 h-12 text-gray-600 mb-2" />
          <p className="text-sm text-gray-400">No notifications yet</p>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {items.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "flex gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer",
              !notification.read && "bg-blue-500/10"
            )}
            onClick={() => markAsRead(notification.id)}
          >
            <div className="flex-shrink-0 mt-1">{getIcon(notification.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-white truncate">
                  {notification.title}
                </p>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {notification.time}
                </span>
              </div>
              <p className="text-sm text-gray-400 line-clamp-2">
                {notification.message}
              </p>
            </div>
            {!notification.read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-gray-300 hover:text-white"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-[#0B0F1A]" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[380px] p-0 bg-[#1A2030] border-white/10"
        align="end"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="font-semibold text-white">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-blue-400 hover:text-blue-300"
              onClick={markAllAsRead}
            >
              Mark all read
            </Button>
          )}
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b border-white/10 bg-transparent p-0">
            <TabsTrigger
              value="all"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="requests"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent"
            >
              Requests
            </TabsTrigger>
            <TabsTrigger
              value="chats"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent"
            >
              Chats
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px]">
            <TabsContent value="all" className="p-2 mt-0">
              <NotificationList items={notifications} />
            </TabsContent>
            <TabsContent value="requests" className="p-2 mt-0">
              <NotificationList items={filterByType("REQUEST")} />
            </TabsContent>
            <TabsContent value="chats" className="p-2 mt-0">
              <NotificationList items={filterByType("MESSAGE")} />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
