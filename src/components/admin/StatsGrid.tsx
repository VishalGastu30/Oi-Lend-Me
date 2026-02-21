'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  Package, 
  MessageSquareWarning, 
  TrendingUp, 
  ArrowUpRight,
  AlertTriangle 
} from 'lucide-react';
import { AdminCard } from '@/components/admin/ui/AdminCard';

// CountUp Component for animated numbers
function CountUp({ end, duration = 2 }: { end: number, duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / (duration * 1000), 1);
      
      setCount(Math.floor(end * percentage));

      if (progress < duration * 1000) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <>{count.toLocaleString()}</>;
}

export function StatsGrid({ 
  statsData 
}: { 
  statsData: { 
    totalUsers: number; 
    totalItems: number; 
    activeRequests: number; 
    pendingReports: number; 
  } 
}) {
  const stats = [
    { 
      label: 'Active Users', 
      value: statsData.totalUsers, 
      icon: Users, 
      color: 'text-blue-400', 
      gradient: 'from-blue-500/20 to-blue-600/5',
      trend: 'Total Registered'
    },
    { 
      label: 'Items Listed', 
      value: statsData.totalItems, 
      icon: Package, 
      color: 'text-purple-400', 
      gradient: 'from-purple-500/20 to-purple-600/5',
      trend: 'Total Inventory'
    },
    { 
      label: 'Pending Reports', 
      value: statsData.pendingReports, 
      icon: MessageSquareWarning, 
      color: 'text-red-400', 
      gradient: 'from-red-500/20 to-red-600/5',
      trend: 'Requires Action',
      isAlert: statsData.pendingReports > 0
    },
    { 
      label: 'Active Requests', 
      value: statsData.activeRequests, 
      icon: TrendingUp,
      color: 'text-emerald-400', 
      gradient: 'from-emerald-500/20 to-emerald-600/5',
      trend: 'Live Loans'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <AdminCard 
          key={stat.label} 
          delay={index * 0.1}
          className="relative overflow-hidden group"
        >
          {/* Background Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
          
          <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-lg bg-black/20 backdrop-blur-md border border-white/5 ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                  </div>
                  {stat.isAlert && (
                      <div className="flex items-center gap-1 text-red-400 text-xs font-bold bg-red-400/10 px-2 py-1 rounded-full border border-red-400/20 animate-pulse">
                          <AlertTriangle className="w-3 h-3" /> Action Needed
                      </div>
                  )}
              </div>
              
              <div className="mt-auto">
                  <h4 className="text-gray-400 text-sm font-medium mb-1">{stat.label}</h4>
                  <div className="flex items-end gap-3">
                      <span className="text-3xl font-bold text-white tracking-tight">
                          <CountUp end={stat.value} />
                      </span>
                      <span className="text-xs font-medium text-white/50 mb-1.5 flex items-center gap-1">
                           {stat.trend.includes('+') ? <ArrowUpRight className="w-3 h-3 text-emerald-400" /> : null}
                           {stat.trend}
                      </span>
                  </div>
              </div>
          </div>
        </AdminCard>
      ))}
    </div>
  );
}
