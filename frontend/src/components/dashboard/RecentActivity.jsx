import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Users, CheckSquare, DollarSign, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const iconMap = {
  invoice: { icon: FileText, color: 'bg-primary/10 text-primary' },
  customer: { icon: Users, color: 'bg-accent/10 text-accent' },
  task: { icon: CheckSquare, color: 'bg-success/10 text-success' },
  expense: { icon: DollarSign, color: 'bg-warning/10 text-warning' },
};

export default function RecentActivity({ invoices, customers, tasks }) {
  const activities = [
    ...invoices.slice(0, 3).map(i => ({
      type: 'invoice',
      title: `Invoice ${i.invoice_number}`,
      subtitle: `${i.customer_name} — $${i.amount?.toLocaleString()}`,
      date: i.created_date
    })),
    ...customers.slice(0, 3).map(c => ({
      type: 'customer',
      title: `New customer: ${c.name}`,
      subtitle: c.company || c.email,
      date: c.created_date
    })),
    ...tasks.slice(0, 3).map(t => ({
      type: 'task',
      title: t.title,
      subtitle: `Priority: ${t.priority}`,
      date: t.created_date
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass rounded-2xl p-6"
    >
      <h3 className="text-lg font-heading font-semibold mb-1">Recent Activity</h3>
      <p className="text-sm text-muted-foreground mb-6">Latest updates across your business</p>
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No activity yet. Start adding data!
          </div>
        ) : (
          activities.map((activity, idx) => {
            const config = iconMap[activity.type];
            const Icon = config.icon;
            return (
              <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", config.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{activity.subtitle}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {activity.date ? format(new Date(activity.date), 'MMM d') : ''}
                </span>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}