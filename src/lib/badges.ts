
import { Award, ShieldCheck, Zap, TrendingUp, Heart, Crown, Clock, Users, CheckCircle, Flame, Star, LucideIcon } from "lucide-react";

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: 'TRUST' | 'ACTIVITY' | 'REPUTATION' | 'COMMUNITY';
  icon: LucideIcon;
  color: string; // Tailwind text color class
  bg: string; // Tailwind bg color class
  border: string; // Tailwind border color class
  unlocked: boolean;
  progress?: number; // 0-100 for progress bar (optional), currently mock or partial implementation
}

interface UserStats {
  karmaScore: number;
  itemsLent: number;
  itemsBorrowed?: number; // Future use
  createdAt: Date;
}

export function calculateBadges(stats: UserStats): Badge[] {
  const { karmaScore, itemsLent, createdAt } = stats;
  
  // Calculate days since joining
  const daysActive = Math.floor((new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 3600 * 24));

  return [
    // --- TRUST & RELIABILITY ---
    {
      id: 'verified_student',
      name: 'Verified Student',
      description: 'Campus identity confirmed',
      category: 'TRUST',
      icon: ShieldCheck,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      border: 'border-emerald-400/20',
      unlocked: true, // Assuming all users are verified for now
    },
    {
      id: 'early_adopter',
      name: 'Early Adopter',
      description: 'Joined during launch phase',
      category: 'TRUST',
      icon: Clock,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
      border: 'border-blue-400/20',
      unlocked: true, // You might want to condition this on date in real app
    },
    {
        id: 'reliable_lender',
        name: 'Reliable Lender',
        description: 'Lent 5+ items successfully',
        category: 'TRUST',
        icon: CheckCircle,
        color: 'text-teal-400',
        bg: 'bg-teal-400/10',
        border: 'border-teal-400/20',
        unlocked: itemsLent >= 5,
    },

    // --- ACTIVITY & CONTRIBUTION ---
    {
      id: 'first_lend',
      name: 'First Lend',
      description: 'Shared an item for the first time',
      category: 'ACTIVITY',
      icon: TrendingUp,
      color: 'text-[#4F9DFF]',
      bg: 'bg-[#4F9DFF]/10',
      border: 'border-[#4F9DFF]/20',
      unlocked: itemsLent > 0,
    },
    {
        id: 'super_lender',
        name: 'Super Lender',
        description: 'Lent 20+ items to the community',
        category: 'ACTIVITY',
        icon: Users,
        color: 'text-indigo-400',
        bg: 'bg-indigo-400/10',
        border: 'border-indigo-400/20',
        unlocked: itemsLent >= 20,
    },

    // --- REPUTATION & KARMA ---
    {
      id: 'karma_initiate',
      name: 'Karma Initiate',
      description: 'Reached 50 Karma points',
      category: 'REPUTATION',
      icon: Star,
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
      border: 'border-yellow-400/20',
      unlocked: karmaScore >= 50,
    },
    {
        id: 'karma_rising',
        name: 'Rising Star',
        description: 'Reached 200 Karma points',
        category: 'REPUTATION',
        icon: Zap,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        unlocked: karmaScore >= 200,
    },
    {
        id: 'karma_elite',
        name: 'Campus Elite',
        description: 'Achieved 500+ Karma score',
        category: 'REPUTATION',
        icon: Flame,
        color: 'text-orange-500',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/20',
        unlocked: karmaScore >= 500,
    },
    {
        id: 'legendary_status',
        name: 'Legendary',
        description: '1000+ Karma. Absolute unit.',
        category: 'REPUTATION',
        icon: Crown,
        color: 'text-purple-500',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        unlocked: karmaScore >= 1000,
    },

    // --- COMMUNITY IMPACT ---
    {
        id: 'community_pillar',
        name: 'Community Pillar',
        description: 'Active for 30+ days & 100+ Karma',
        category: 'COMMUNITY',
        icon: Award,
        color: 'text-pink-400',
        bg: 'bg-pink-400/10',
        border: 'border-pink-400/20',
        unlocked: daysActive >= 30 && karmaScore >= 100,
    },
    {
        id: 'heart_of_gold',
        name: 'Heart of Gold',
        description: 'Consistently highly rated (Mock)',
        category: 'COMMUNITY',
        icon: Heart,
        color: 'text-rose-500',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/20',
        unlocked: false, // Placeholder for ratings system
    }
  ];
}
