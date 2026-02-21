"use client";

import { useEffect, useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line 
} from "recharts";
import { Loader2 } from "lucide-react";

interface AnalyticsData {
  membershipTrend: { name: string; members: number }[];
  activeBookings: number;
  totalBookings: number;
  topItems: { name: string; bookings: number }[];
  totalItems: number;
}

interface AnalyticsDashboardProps {
  groupId: string;
}

export function AnalyticsDashboard({ groupId }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch(`/api/groups/${groupId}/analytics`);
        if (res.ok) {
          setData(await res.json());
        }
      } catch (error) {
        console.error("Failed to load analytics", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [groupId]);

  if (loading) {
    return <div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  if (!data) return <div className="text-white/40 text-center py-10">Failed to load data</div>;

  return (
    <div className="space-y-6">
       {/* Summary Cards */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-5 rounded-xl border border-white/10">
              <p className="text-white/40 text-xs font-bold uppercase tracking-wider">Active Bookings</p>
              <p className="text-3xl font-bold text-white mt-1">{data.activeBookings}</p>
          </div>
          <div className="glass-card p-5 rounded-xl border border-white/10">
              <p className="text-white/40 text-xs font-bold uppercase tracking-wider">Total Bookings</p>
              <p className="text-3xl font-bold text-white mt-1">{data.totalBookings}</p>
          </div>
          <div className="glass-card p-5 rounded-xl border border-white/10">
              <p className="text-white/40 text-xs font-bold uppercase tracking-wider">Inventory Size</p>
              <p className="text-3xl font-bold text-white mt-1">{data.totalItems}</p>
          </div>
       </div>

       <div className="grid md:grid-cols-2 gap-6">
           {/* Growth Chart */}
           <div className="glass-card p-6 rounded-xl border border-white/10">
               <h3 className="text-white font-bold mb-6">Membership Growth</h3>
               <div className="h-64 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={data.membershipTrend}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                           <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                           <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                           <Tooltip 
                                contentStyle={{ backgroundColor: '#1A1F2E', border: '1px solid #ffffff10', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                           />
                           <Line type="monotone" dataKey="members" stroke="#4F9DFF" strokeWidth={2} dot={{ fill: '#4F9DFF' }} />
                       </LineChart>
                   </ResponsiveContainer>
               </div>
           </div>

           {/* Popular Items Chart */}
           <div className="glass-card p-6 rounded-xl border border-white/10">
               <h3 className="text-white font-bold mb-6">Most Popular Items</h3>
               <div className="h-64 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={data.topItems} layout="vertical">
                           <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                           <XAxis type="number" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                           <YAxis dataKey="name" type="category" width={100} stroke="#ffffff80" fontSize={11} tickLine={false} axisLine={false} />
                           <Tooltip 
                                cursor={{fill: 'transparent'}}
                                contentStyle={{ backgroundColor: '#1A1F2E', border: '1px solid #ffffff10', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                           />
                           <Bar dataKey="bookings" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} />
                       </BarChart>
                   </ResponsiveContainer>
               </div>
           </div>
       </div>
    </div>
  );
}
