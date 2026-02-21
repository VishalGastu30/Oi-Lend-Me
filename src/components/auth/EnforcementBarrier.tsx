'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ShieldAlert, Clock, LogOut } from 'lucide-react';

type EnforcementStatus = 'CLEAR' | 'WARN' | 'SUSPENDED' | 'PERMA_BANNED';

interface EnforcementData {
  status: EnforcementStatus;
  reason: string | null;
  suspensionEndsAt: string | null;
}

export function EnforcementBarrier({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<EnforcementData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/enforcement-status');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else if (res.status === 401) {
        // Not authenticated, let the layout/middleware handle it
        setData({ status: 'CLEAR', reason: null, suspensionEndsAt: null });
      }
    } catch (err) {
      console.error('Failed to fetch enforcement status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    // Poll every 30 seconds for status changes
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  if (loading) return <>{children}</>;

  if (!data || data.status === 'CLEAR') {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500" />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-lg px-4 animate-in zoom-in-95 duration-300">
        {data.status === 'WARN' && (
          <WarnOverlay reason={data.reason || 'No reason provided'} onAcknowledged={fetchStatus} />
        )}
        {data.status === 'SUSPENDED' && (
          <SuspensionOverlay reason={data.reason || 'No reason provided'} endsAt={data.suspensionEndsAt!} />
        )}
        {data.status === 'PERMA_BANNED' && (
          <PermanentBanOverlay reason={data.reason || 'No reason provided'} />
        )}
      </div>

      {/* Block all pointer events on underlying layers */}
      <style jsx global>{`
        body {
          overflow: hidden !important;
          pointer-events: none !important;
        }
        .relative.z-10 {
          pointer-events: auto !important;
        }
      `}</style>
    </div>
  );
}

function WarnOverlay({ reason, onAcknowledged }: { reason: string; onAcknowledged: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleAcknowledge = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/acknowledge-warning', { method: 'POST' });
      if (res.ok) {
        onAcknowledged();
      }
    } catch (err) {
      console.error('Failed to acknowledge warning:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1A1A1A] border border-amber-500/30 rounded-2xl p-8 shadow-2xl shadow-amber-500/10">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">Official Warning Issued</h2>
          <p className="text-zinc-400 text-sm">Please read the following message from administration.</p>
        </div>

        <div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-left">
          <p className="text-zinc-200 font-medium text-sm leading-relaxed italic">
            "{reason}"
          </p>
        </div>

        <p className="text-zinc-500 text-xs">
          Repeated violations of terms of service may lead to temporary or permanent suspension.
        </p>

        <button
          onClick={handleAcknowledge}
          disabled={loading}
          className="w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-amber-500/20"
        >
          {loading ? 'Processing...' : 'I won\'t repeat this again'}
        </button>
      </div>
    </div>
  );
}

function SuspensionOverlay({ reason, endsAt }: { reason: string; endsAt: string }) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    const calculateTime = () => {
      const diff = new Date(endsAt).getTime() - new Date().getTime();
      if (diff <= 0) return null;

      return {
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / 1000 / 60) % 60),
        s: Math.floor((diff / 1000) % 60),
      };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);

    setTimeLeft(calculateTime());
    return () => clearInterval(timer);
  }, [endsAt]);

  const router = useRouter();

  return (
    <div className="bg-[#0D0D0D] border border-red-500/30 rounded-2xl p-8 shadow-2xl shadow-red-500/10">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center animate-pulse">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight uppercase">Account Temporarily Suspended</h2>
          <p className="text-zinc-400 text-sm">Access to your account has been restricted.</p>
        </div>

        <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-left">
          <p className="text-zinc-300/80 text-xs mb-2 uppercase font-semibold">Reason:</p>
          <p className="text-zinc-100 font-medium text-sm leading-relaxed">
            {reason}
          </p>
        </div>

        {timeLeft && (
          <div className="grid grid-cols-4 gap-4 w-full">
            {[
              { label: 'Days', val: timeLeft.d },
              { label: 'Hours', val: timeLeft.h },
              { label: 'Mins', val: timeLeft.m },
              { label: 'Secs', val: timeLeft.s },
            ].map((t) => (
              <div key={t.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-2">
                <div className="text-xl font-mono font-bold text-red-500">
                  {String(t.val).padStart(2, '0')}
                </div>
                <div className="text-[10px] uppercase text-zinc-500 font-bold">{t.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center space-x-2 text-zinc-500 text-xs">
          <Clock className="w-3 h-3 animate-[spin_4s_linear_infinite]" />
          <span>Restoration scheduled for {new Date(endsAt).toLocaleString()}</span>
        </div>

        <button
          onClick={() => (window.location.href = '/')}
          className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Go Back</span>
        </button>
      </div>
    </div>
  );
}

function PermanentBanOverlay({ reason }: { reason: string }) {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = '/';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="bg-[#100000] border-2 border-red-600 rounded-2xl p-10 shadow-2xl shadow-red-900/40 relative overflow-hidden">
      {/* Red Pulse */}
      <div className="absolute top-0 left-0 w-full h-1 bg-red-600 animate-pulse" />
      
      <div className="flex flex-col items-center text-center space-y-8">
        <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center border-2 border-red-600/50">
          <ShieldAlert className="w-10 h-10 text-red-600" />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
            ACCOUNT PERMANENTLY BANNED
          </h2>
          <div className="h-0.5 w-24 bg-red-600 mx-auto" />
        </div>

        <div className="w-full bg-red-950/20 border border-red-900/50 rounded-xl p-6 text-center">
          <p className="text-zinc-100 font-bold text-lg leading-relaxed">
            {reason}
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-red-500/80 font-black text-sm tracking-widest uppercase">
            This decision is final and non-reversible.
          </p>
          <div className="text-zinc-600 text-[10px] font-mono uppercase tracking-[0.2em]">
            Redirecting in {mins}:{String(secs).padStart(2, '0')}
          </div>
        </div>
      </div>
    </div>
  );
}
