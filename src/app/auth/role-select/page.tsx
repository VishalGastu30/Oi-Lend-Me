"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Home, ArrowRight, ShieldAlert, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function RoleSelectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simple verification that they are admin
    fetch('/api/auth/session').then(res => res.json()).then(data => {
      if (data.user?.role !== 'ADMIN') {
        router.push('/home'); // Send regular users away
      } else {
        setLoading(false);
      }
    }).catch(() => {
        router.push('/auth/login');
    });
  }, [router]);

  const handleSelect = async (mode: 'admin' | 'user', path: string) => {
    try {
      await fetch('/api/auth/view-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });
      router.push(path);
    } catch (error) {
      console.error('Failed to set view mode:', error);
      router.push(path); // Fallback
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#0B0F1A] flex flex-col items-center justify-center relative overflow-hidden text-white font-sans selection:bg-blue-500/30">
      
      {/* Premium Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] sm:w-[50vw] sm:h-[50vw] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-[30%] -right-[10%] w-[40vw] h-[40vw] bg-purple-500/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[20%] left-[10%] w-[50vw] h-[50vw] bg-indigo-500/10 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-4xl px-6 flex flex-col items-center"
      >
        <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center p-4 bg-white/[0.03] border border-white/10 rounded-full mb-6 shadow-[0_0_40px_rgba(255,255,255,0.05)] text-blue-400">
                <ShieldAlert className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
               Welcome back, Admin
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
                You have elevated privileges. Please select which environment you would like to enter for this session.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          
          {/* Admin Path */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="group">
            <button 
                onClick={() => handleSelect('admin', '/admin')}
                className="w-full text-left bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-blue-500/30 p-8 rounded-3xl transition-all duration-300 relative overflow-hidden backdrop-blur-sm"
            >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors duration-500" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-400/30 transition-all duration-500" />
                
                <div className="relative z-10">
                    <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(59,130,246,0.1)] group-hover:scale-110 group-hover:bg-blue-500/20 group-hover:text-blue-300 transition-all duration-300">
                         <Shield className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Admin Dashboard</h2>
                    <p className="text-gray-400 leading-relaxed mb-6">Access moderation tools, manage user reports, control platform settings, and view system analytics.</p>
                    
                    <div className="flex items-center text-blue-400 font-semibold group-hover:text-blue-300 transition-colors">
                        Enter Workspace <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </button>
          </motion.div>

          {/* User Path */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="group">
            <button 
                onClick={() => handleSelect('user', '/home')}
                className="w-full text-left bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-emerald-500/30 p-8 rounded-3xl transition-all duration-300 relative overflow-hidden backdrop-blur-sm"
            >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors duration-500" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-400/30 transition-all duration-500" />
                
                <div className="relative z-10">
                    <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(16,185,129,0.1)] group-hover:scale-110 group-hover:bg-emerald-500/20 group-hover:text-emerald-300 transition-all duration-300">
                         <Home className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">User Application</h2>
                    <p className="text-gray-400 leading-relaxed mb-6">Browse the marketplace, request items, join campus groups, and communicate as a standard user.</p>
                    
                    <div className="flex items-center text-emerald-400 font-semibold group-hover:text-emerald-300 transition-colors">
                        Enter App <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </button>
          </motion.div>

        </div>

        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-12"
        >
            <Button 
                variant="ghost" 
                className="text-gray-500 hover:text-white hover:bg-white/5"
                onClick={async () => {
                   await fetch('/api/auth/logout', { method: 'POST' });
                   router.push('/auth/login');
                }}
            >
                <LogOut className="w-4 h-4 mr-2" /> Log Out Confines
            </Button>
        </motion.div>

      </motion.div>
    </div>
  );
}
