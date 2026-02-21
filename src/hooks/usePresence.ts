"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function usePresence() {
  const pathname = usePathname();

  useEffect(() => {
    // Function to send heartbeat
    const sendHeartbeat = async (status: 'online' | 'offline' = 'online') => {
      try {
        // Use sendBeacon for offline signal during unload if possible, or fetch
        if (status === 'offline') {
           const blob = new Blob([JSON.stringify({ status: 'offline' })], { type: 'application/json' });
           navigator.sendBeacon("/api/user/heartbeat", blob);
        } else {
           await fetch("/api/user/heartbeat", { 
             method: "POST",
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ status: 'online' }) 
           });
        }
      } catch (error) {
        // Silent fail
      }
    };

    // Send immediately on mount/navigation
    sendHeartbeat('online');

    // Set up interval (Every 30 seconds for better accuracy)
    const interval = setInterval(() => sendHeartbeat('online'), 30 * 1000);

    // Handle tab close / navigation away
    const handleUnload = () => {
        sendHeartbeat('offline');
    };

    // Handle tab visibility change (minimize, switch tabs)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendHeartbeat('offline');
      } else if (document.visibilityState === 'visible') {
        sendHeartbeat('online');
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Clean up
    return () => {
        clearInterval(interval);
        window.removeEventListener('beforeunload', handleUnload);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pathname]); // Re-trigger on path change to ensure active
}
