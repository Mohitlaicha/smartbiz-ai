import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const statusConfig = {
  todo: { label: 'To Do', color: 'bg-muted text-muted-foreground' },
  in_progress: { label: 'In Progress', color: 'bg-primary/10 text-primary' },
  review: { label: 'Review', color: 'bg-warning/10 text-warning' },
  done: { label: 'Done', color: 'bg-success/10 text-success' },
};

const priorityConfig = {
  urgent: 'bg-destructive/10 text-destructive border-destructive/20',
  high: 'bg-warning/10 text-warning border-warning/20',
  medium: 'bg-primary/10 text-primary border-primary/20',
  low: 'bg-muted text-muted-foreground border-border',
};

export default function TaskSummary({ tasks }) {
  const activeTasks = tasks.filter(t => t.status !== 'done').slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass rounded-2xl p-6"
    >
      <h3 className="text-lg font-heading font-semibold mb-1">Active Tasks</h3>
      <p className="text-sm text-muted-foreground mb-6">{activeTasks.length} tasks pending</p>
      <div className="space-y-3">
        {activeTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No active tasks</p>
        ) : (
          activeTasks.map(task => {
            const status = statusConfig[task.status] || statusConfig.todo;
            return (
              <div key={task.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn("w-2 h-2 rounded-full flex-shrink-0", 
                    task.priority === 'urgent' ? 'bg-destructive' :
                    task.priority === 'high' ? 'bg-warning' :
                    task.priority === 'medium' ? 'bg-primary' : 'bg-muted-foreground'
                  )} />
                  <span className="text-sm font-medium truncate">{task.title}</span>
                </div>
                <Badge variant="secondary" className={cn("text-xs font-medium", status.color)}>
                  {status.label}
                </Badge>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}