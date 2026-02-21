'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, MessageSquareWarning, Inbox, ShieldAlert, LogOut, Command, Building2 } from 'lucide-react';
// import { Logo } from '@/components/ui/Logo'; // Use standard Logo if available
import { motion } from 'framer-motion';

const navItems = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Reports', href: '/admin/reports', icon: MessageSquareWarning },
  { name: 'Feedback', href: '/admin/feedback', icon: Inbox },
  { name: 'Group Requests', href: '/admin/group-requests', icon: Building2 },
  { name: 'Moderation', href: '/admin/moderation', icon: ShieldAlert },
];

export function AdminNavbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0B0F1A]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0B0F1A]/60">
      <div className="container flex h-16 items-center px-6 max-w-7xl mx-auto">
        
        {/* Logo Area */}
        <div className="mr-8 hidden md:flex">
          <Link href="/admin" className="flex items-center gap-2 group">
            <div className="bg-blue-600/20 p-2 rounded-lg border border-blue-500/30 group-hover:border-blue-500/60 transition-colors">
                 <Command className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-white leading-none tracking-tight">Admin<span className="text-blue-500">.</span></span>
                <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">Control Center</span>
            </div>
          </Link>
        </div>
        
        {/* Navigation Items */}
        <div className="flex items-center gap-1">
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
        <div className="flex flex-1 items-center justify-end gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded-full">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
             <span className="text-xs font-medium text-emerald-500/90">System Online</span>
          </div>
          
          <div className="w-px h-6 bg-white/10 mx-2"></div>

          <Button
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
            onClick={async () => {
               await fetch('/api/auth/logout', { method: 'POST' });
               window.location.href = '/';
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
