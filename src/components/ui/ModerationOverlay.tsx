"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, Skull, Hourglass, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface ModerationState {
  type: 'NONE' | 'WARN' | 'SUSPEND' | 'BAN';
  reason?: string;
  endAt?: string;
}

export function ModerationOverlay() {
  const [state, setState] = useState<ModerationState>({ type: 'NONE' });
  const [loading, setLoading] = useState(true);
  const [acknowledging, setAcknowledging] = useState(false);
  const [countdown, setCountdown] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [banTimer, setBanTimer] = useState(300); // 5 minutes in seconds
  const router = useRouter();

  useEffect(() => {
    checkModerationStatus();
  }, []);

  // Suspension countdown timer
  useEffect(() => {
    if (state.type !== 'SUSPEND' || !state.endAt) return;
    const tick = () => {
      const diff = new Date(state.endAt!).getTime() - Date.now();
      if (diff <= 0) { setState({ type: 'NONE' }); return; }
      setCountdown({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [state.type, state.endAt]);

  // Ban auto-redirect after 5 minutes
  useEffect(() => {
    if (state.type !== 'BAN') return;
    const id = setInterval(() => {
      setBanTimer(prev => {
        if (prev <= 1) { router.push('/'); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [state.type, router]);

  const checkModerationStatus = async () => {
    try {
      const res = await fetch('/api/me/moderation/status');
      if (res.ok) {
        const data = await res.json();
        setState(data.status);
      }
    } catch (error) {
      console.error("Failed to check moderation status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async () => {
    setAcknowledging(true);
    try {
      const res = await fetch('/api/me/moderation/acknowledge', { method: 'POST' });
      if (res.ok) setState({ type: 'NONE' });
    } catch (error) {
      console.error(error);
    } finally {
      setAcknowledging(false);
    }
  };

  if (loading || state.type === 'NONE') return null;

  const banMinutes = Math.floor(banTimer / 60);
  const banSeconds = banTimer % 60;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl ${
          state.type === 'BAN' ? 'bg-red-950/80' : 
          state.type === 'SUSPEND' ? 'bg-[#0B0F1A]/90' : 'bg-[#0B0F1A]/60'
        }`}
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className={`max-w-lg w-full rounded-2xl p-8 shadow-2xl border ${
            state.type === 'BAN' ? 'bg-red-900/20 border-red-500/50 shadow-red-500/20' : 
            state.type === 'SUSPEND' ? 'glass-card border-orange-500/30' : 'glass-card border-yellow-500/30'
          }`}
        >
          {/* ===== WARN ===== */}
          {state.type === 'WARN' && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center mx-auto mb-4 border border-yellow-500/30">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white">Official Warning</h2>
              <p className="text-white/70">You have received a warning from the moderation team for violating community guidelines.</p>
              
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-left space-y-2">
                <p className="text-xs font-bold text-white/40 uppercase">Reason</p>
                <p className="text-white/90">{state.reason}</p>
              </div>

              <Button 
                onClick={handleAcknowledge}
                disabled={acknowledging}
                className="w-full bg-yellow-600 hover:bg-yellow-500 text-white h-12 text-base font-bold shadow-lg shadow-yellow-500/20"
              >
                {acknowledging ? "Processing..." : "I understand and won't repeat this"}
                {!acknowledging && <ArrowRight className="ml-2 w-5 h-5" />}
              </Button>
            </div>
          )}

          {/* ===== SUSPEND with countdown ===== */}
          {state.type === 'SUSPEND' && (
            <div className="space-y-6 text-center">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full bg-orange-500/20 animate-ping opacity-50"></div>
                <div className="relative w-full h-full rounded-full bg-[#0B0F1A] text-orange-400 flex items-center justify-center border-2 border-orange-500/50">
                  <Hourglass size={36} className="animate-pulse" />
                </div>
              </div>
              
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Account Suspended</h2>
                <p className="text-orange-300 font-medium">Temporary access restriction</p>
              </div>

              {/* Animated countdown */}
              <div className="flex justify-center gap-3">
                {[
                  { label: 'Days', value: countdown.d },
                  { label: 'Hours', value: countdown.h },
                  { label: 'Mins', value: countdown.m },
                  { label: 'Secs', value: countdown.s },
                ].map((unit) => (
                  <div key={unit.label} className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-xl bg-black/60 border border-orange-500/30 flex items-center justify-center">
                      <span className="text-2xl font-mono font-bold text-orange-400">
                        {String(unit.value).padStart(2, '0')}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/40 uppercase mt-1 font-bold tracking-wider">{unit.label}</span>
                  </div>
                ))}
              </div>

              <div className="p-5 rounded-xl bg-black/40 border border-orange-500/20 text-left">
                <p className="text-xs font-bold text-white/40 uppercase mb-1">Reason for Suspension</p>
                <p className="text-white/90">{state.reason}</p>
              </div>

              <Button 
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full border-white/10 text-white hover:bg-white/5 h-12"
              >
                Return to Landing Page
              </Button>
            </div>
          )}

          {/* ===== BAN with 5-minute redirect ===== */}
          {state.type === 'BAN' && (
            <div className="space-y-6 text-center px-4">
              <div className="w-24 h-24 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-2 border border-red-500 animate-pulse">
                <Skull size={48} />
              </div>
              
              <div className="space-y-1">
                <h2 className="text-4xl font-black text-red-100 tracking-widest uppercase">Banned</h2>
                <p className="text-red-400 font-medium">Permanent Account Termination</p>
              </div>

              <div className="p-6 rounded-xl bg-black/60 border border-red-500/30 text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
                <p className="text-xs font-bold text-red-400/60 uppercase mb-2 relative z-10">Infraction Details</p>
                <p className="text-white relative z-10 text-lg">{state.reason}</p>
              </div>

              <div className="text-sm text-red-200/50">
                <p>Your access to Oi! Lend Me has been permanently revoked.</p>
                <p className="mt-1">
                  Redirecting in{' '}
                  <span className="text-red-400 font-mono font-bold">
                    {banMinutes}:{String(banSeconds).padStart(2, '0')}
                  </span>
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
