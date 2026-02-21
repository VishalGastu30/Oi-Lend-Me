"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NotificationCenter } from "@/components/ui/NotificationCenter";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Logo } from "@/components/ui/Logo";
import { FeedbackModal } from "@/components/modals/FeedbackModal";
import { motion, AnimatePresence } from "framer-motion";

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
  karmaScore: number;
  viewMode?: string;
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.data);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [pathname]);

  // Role-based nav items
  const userNavItems = [
    { name: "Browse", href: "/home" },
    { name: "My Items", href: "/my-items" },
    { name: "Lend Item", href: "/items/new" },
    { name: "Ask the Campus", href: "/requirements/new" },
    { name: "My Chats", href: "/chat" },
    { name: "Activity", href: "/activity" },
    { name: "Groups", href: "/groups" },
  ];

  const adminNavItems = [
    { name: "Overview", href: "/admin" },
    { name: "Reports", href: "/admin/reports" },
    { name: "Feedback", href: "/admin/feedback" },
    { name: "Moderation", href: "/admin/moderation" },
  ];

  // Determine which nav items to show based on role AND viewMode
  // If Super Admin is in 'user' viewMode, they see normal user UI
  const effectiveMode = user?.role === 'ADMIN' ? (user.viewMode || 'admin') : 'user';
  
  const navItems = effectiveMode === 'admin' ? adminNavItems : userNavItems;
  const isAdminView = effectiveMode === 'admin';
  const isAdmin = user?.role === 'ADMIN';

  const isActive = (path: string) => pathname === path;

  // The Landing Page redesign (Stitch) has its own header.
  if (isLandingPage) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-[#0B0F1A]/70 backdrop-blur-[32px] border-b border-white/[0.05] shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-20">
        <div className="flex items-center justify-between h-20">
          
          <div className="flex items-center gap-10">
            <Link href="/home" className="flex items-center gap-3 group">
               <motion.div 
                 whileHover={{ scale: 1.05, rotate: -5 }}
                 whileTap={{ scale: 0.95 }}
               >
                 <Logo width={48} height={48} className="rounded-xl shadow-lg shadow-blue-500/10" />
               </motion.div>
               <h2 className="text-white text-xl font-bold tracking-tight hidden sm:block group-hover:text-blue-400 transition-colors">Oi! Lend Me</h2>
            </Link>
          </div>
          
          {/* Right: Nav Links & Actions */}
          <div className="flex items-center gap-8">
            <div className="hidden lg:flex items-center gap-6">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "relative px-1 py-2 text-sm font-semibold transition-all duration-300",
                      isActive(item.href)
                        ? "text-blue-400"
                        : "text-gray-400 hover:text-white"
                    )}
                  >
                    {item.name}
                    {isActive(item.href) && (
                      <motion.div 
                        layoutId="nav-underline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                      />
                    )}
                  </Link>
                ))}
            </div>

            <div className="flex items-center gap-4">
                {/* Feedback Button */}
                {!isLoading && !isAdminView && user && (
                  <Button
                    onClick={() => setFeedbackOpen(true)}
                    variant="ghost"
                    size="sm"
                    className="hidden lg:flex items-center gap-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10 transition-all"
                  >
                    <MessageCircle size={18} className="text-blue-500" />
                    <span>Feedback</span>
                  </Button>
                )}
                
                <NotificationCenter />
                
                {/* User Menu */}
                <div className="flex items-center gap-2">
                    {!isLoading && user ? (
                      <>
                        <Link href={`/profile/${user.id}`}>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <UserAvatar 
                                  user={user} 
                                  className="hidden sm:block h-10 w-10 border-2 border-blue-500/20 cursor-pointer hover:border-blue-500 transition-all" 
                                />
                            </motion.div>
                        </Link>
                        <div className="lg:hidden">
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setIsOpen(!isOpen)}
                              className="inline-flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none transition-all"
                            >
                              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </motion.button>
                        </div>
                        <Button 
                          className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 font-bold h-10 px-6 rounded-xl transition-all hidden md:flex"
                          onClick={async () => {
                            try {
                              setIsLoading(true);
                              await fetch('/api/auth/logout', { 
                                method: 'POST',
                                keepalive: true 
                              });
                            } catch (error) {
                              console.error("Logout failed", error);
                            } finally {
                              setUser(null);
                              window.location.href = "/";
                            }
                          }}
                        >
                          Log Out
                        </Button>
                      </>
                    ) : !isLoading ? (
                      <div className="flex items-center gap-4">
                        <Link href="/auth/login" className="text-gray-400 hover:text-white font-bold transition-colors">
                            Log In
                        </Link>
                        <Link href="/auth/signup">
                          <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl h-10 px-6 font-bold shadow-lg shadow-blue-500/25 transition-all hover:scale-105 active:scale-95">
                            Sign Up
                          </Button>
                        </Link>
                      </div>
                    ) : (
                        <div className="size-10 bg-white/5 rounded-full animate-pulse" />
                    )}
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu Sidebar & Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="fixed top-0 right-0 h-[100dvh] w-[85vw] max-w-[320px] bg-[#0B0F1A] border-l border-white/10 z-[100] p-6 lg:hidden shadow-2xl flex flex-col overflow-y-auto no-scrollbar"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-white tracking-tight">Menu</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 space-y-2">
              {navItems.map((item, idx) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                    <Link
                      href={item.href}
                      className={cn(
                        "block px-4 py-3.5 rounded-2xl text-base font-semibold transition-all mb-1",
                         isActive(item.href)
                            ? "text-blue-400 bg-blue-500/10 border border-blue-500/20"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                </motion.div>
              ))}
            </div>
              
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="pt-6 border-t border-white/10 flex flex-col gap-3 mt-6"
            >
              {!isAdminView && user && (
                <button
                  onClick={() => {
                    setFeedbackOpen(true);
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-center gap-3 w-full px-4 py-3.5 rounded-2xl text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 font-bold transition-all"
                >
                  <MessageCircle size={18} className="text-blue-400" />
                  <span>Send Feedback</span>
                </button>
              )}
              
              {user ? (
                <button onClick={async () => {
                   try {
                      await fetch('/api/auth/logout', { 
                        method: 'POST',
                        keepalive: true 
                      });
                   } catch (error) {
                      console.error("Logout failed", error);
                   } finally {
                      setUser(null);
                      window.location.href = "/";
                   }
                }} className="flex items-center justify-center w-full bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3.5 rounded-2xl font-bold hover:bg-red-500 hover:text-white transition-all">
                  Log Out
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full h-12 rounded-2xl border-white/10 font-bold">Log In</Button>
                  </Link>
                  <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                    <Button className="w-full h-12 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold shadow-lg shadow-blue-500/25">Sign Up</Button>
                  </Link>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Feedback Modal */}
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </nav>
  );
}
