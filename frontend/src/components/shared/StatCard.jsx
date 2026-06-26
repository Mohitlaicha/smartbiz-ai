import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, trend, trendLabel, className, iconColor }) {
  const isPositive = trend > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "glass rounded-2xl p-6 hover:shadow-lg transition-all duration-300",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold font-heading tracking-tight">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center gap-1.5">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-success" />
              ) : (
                <TrendingDown className="w-4 h-4 text-destructive" />
              )}
              <span className={cn("text-sm font-medium", isPositive ? "text-success" : "text-destructive")}>
                {isPositive ? '+' : ''}{trend}%
              </span>
              {trendLabel && (
                <span className="text-xs text-muted-foreground">{trendLabel}</span>
              )}
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", iconColor || "bg-primary/10")}>
          <Icon className={cn("w-6 h-6", iconColor ? "text-white" : "text-primary")} />
        </div>
      </div>
    </motion.div>
  );
}