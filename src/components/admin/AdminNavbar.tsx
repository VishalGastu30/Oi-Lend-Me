'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, MessageSquareWarning, Inbox, ShieldAlert, LogOut, Command, Building2, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const navItems = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Reports', href: '/admin/reports', icon: MessageSquareWarning },
  { name: 'Feedback', href: '/admin/feedback', icon: Inbox },
  { name: 'Group Requests', href: '/admin/group-requests', icon: Building2 },
  { name: 'Moderation', href: '/admin/moderation', icon: ShieldAlert },
];

export function AdminNavbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0B0F1A]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0B0F1A]/60">
      <div className="container flex h-16 items-center justify-between px-6 max-w-7xl mx-auto">
        
        {/* Logo Area & Mobile Menu Trigger */}
        <div className="flex items-center gap-4">
          <button 
            className="lg:hidden p-2 text-gray-400 hover:text-white bg-white/5 rounded-xl transition-all"
            onClick={() => setIsOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <Link href="/admin" className="flex items-center gap-2 group">
            <div className="bg-blue-600/20 p-2 rounded-lg border border-blue-500/30 group-hover:border-blue-500/60 transition-colors">
                 <Command className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-white leading-none tracking-tight">Admin<span className="text-blue-500">.</span></span>
                <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase hidden sm:block">Control Center</span>
            </div>
          </Link>
        </div>
        
        {/* Navigation Items */}
        <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              
              return (
                <Link
                    key={item.href}
                    href={item.href}
                    className="relative px-4 py-2 group"
                >
                    {isActive && (
                        <motion.div
                            layoutId="admin-nav-pill"
                            className="absolute inset-0 bg-white/[0.08] rounded-full"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    <span className={cn(
                        "relative z-10 text-sm font-medium flex items-center gap-2 transition-colors duration-200",
                        isActive ? "text-white" : "text-gray-400 group-hover:text-gray-200"
                    )}>
                        <item.icon className={cn("w-4 h-4", isActive ? "text-blue-400" : "text-gray-500 group-hover:text-gray-400")} />
                        {item.name}
                    </span>
                    
                    {/* Hover Glow */}
                    {!isActive && (
                       <span className="absolute inset-0 rounded-full bg-white/[0.02] scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300" />
                    )}
                </Link>
              );
            })}
        </div>
        
        {/* Right Side Actions */}
        <div className="flex items-center justify-end gap-2 lg:gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded-full">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
             <span className="text-xs font-medium text-emerald-500/90">System Online</span>
          </div>
          
          <div className="hidden sm:block w-px h-6 bg-white/10 mx-2"></div>

          <Button
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
            onClick={async () => {
               await fetch('/api/auth/logout', { method: 'POST' });
               window.location.href = '/';
            }}
          >
            <LogOut className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
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
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="fixed top-0 left-0 h-[100dvh] w-[85vw] max-w-[320px] bg-[#0B0F1A] border-r border-white/10 z-[100] p-6 lg:hidden shadow-2xl flex flex-col overflow-y-auto no-scrollbar"
          >
            <div className="flex items-center justify-between mb-8">
              <Link href="/admin" onClick={() => setIsOpen(false)} className="flex items-center gap-2 group">
                <div className="bg-blue-600/20 p-2 rounded-lg border border-blue-500/30">
                     <Command className="w-5 h-5 text-blue-400" />
                </div>
                <span className="font-bold text-white text-lg">Admin<span className="text-blue-500">.</span></span>
              </Link>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 space-y-2">
              <div className="mb-4 text-xs font-semibold text-gray-500 uppercase tracking-widest pl-4">Menu</div>
              {navItems.map((item, idx) => {
                const isActive = pathname === item.href;
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-base font-semibold transition-all mb-1",
                           isActive
                              ? "text-white bg-white/10 border border-white/20"
                              : "text-gray-400 hover:text-white hover:bg-white/5"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        <item.icon className={cn("w-5 h-5", isActive ? "text-blue-400" : "text-gray-500")} />
                        {item.name}
                      </Link>
                  </motion.div>
                );
              })}
            </div>
              
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="pt-6 border-t border-white/10 flex flex-col gap-3 mt-6"
            >
              <div className="flex items-center justify-center gap-2 px-3 py-3 bg-white/[0.03] border border-white/5 rounded-xl mb-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                 <span className="text-sm font-medium text-emerald-500/90">System Online</span>
              </div>
              <button onClick={async () => {
                 try {
                    await fetch('/api/auth/logout', { method: 'POST' });
                 } finally {
                    window.location.href = "/";
                 }
              }} className="flex items-center justify-center w-full bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3.5 rounded-2xl font-bold hover:bg-red-500 hover:text-white transition-all">
                <LogOut className="w-5 h-5 mr-2" />
                Log Out
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
