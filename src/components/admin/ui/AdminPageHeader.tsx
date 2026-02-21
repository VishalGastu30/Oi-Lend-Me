'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode; 
}

export function AdminPageHeader({ title, subtitle, className, children }: AdminPageHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8", className)}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg text-gray-400 max-w-2xl font-light">
            {subtitle}
          </p>
        )}
      </motion.div>
      
      {children && (
        <motion.div
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
           className="flex items-center gap-3"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}
