'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface AdminCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}

export function AdminCard({ children, className, delay = 0, title, subtitle, action }: AdminCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={cn(
        "group relative rounded-xl border border-white/5 bg-white/[0.03] backdrop-blur-sm",
        "shadow-2xl shadow-black/20 hover:shadow-black/40 transition-shadow duration-500",
        className
      )}
    >
      {/* Subtle Gradient Glow on Hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      {(title || subtitle || action) && (
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between relative z-10">
          <div>
            {title && <h3 className="text-lg font-semibold text-white tracking-tight">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      
      <div className="p-6 relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
