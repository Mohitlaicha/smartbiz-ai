import React, { useState } from 'react';
import { api } from "@/api/client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, CheckSquare, MoreHorizontal, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const statusConfig = {
  todo: { label: 'To Do', color: 'bg-muted text-muted-foreground' },
  in_progress: { label: 'In Progress', color: 'bg-primary/10 text-primary' },
  review: { label: 'Review', color: 'bg-warning/10 text-warning' },
  done: { label: 'Done', color: 'bg-success/10 text-success' },
};

const priorityConfig = {
  urgent: { label: 'Urgent', dotColor: 'bg-destructive' },
  high: { label: 'High', dotColor: 'bg-warning' },
  medium: { label: 'Medium', dotColor: 'bg-primary' },
  low: { label: 'Low', dotColor: 'bg-muted-foreground' },
};

const initialForm = { title: '', description: '', status: 'todo', priority: 'medium', due_date: '', category: 'other' };

export default function Tasks() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState(initialForm);
  const queryClient = useQueryClient();

 const { data: tasks = [], isLoading } = useQuery({
  queryKey: ["tasks"],
  queryFn: async () => {
    const res = await api.get("/tasks");
    return res.data;
  },
});

  const createMutation = useMutation({
    mutationFn: async (data) => {
  const res = await api.post("/tasks", data);
  return res.data;
},
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); closeDialog(); },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
  const res = await api.put(`/tasks/${id}`, data);
  return res.data;
},
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); closeDialog(); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
  const res = await api.delete(`/tasks/${id}`);
  return res.data;
},
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const closeDialog = () => { setDialogOpen(false); setEditingTask(null); setForm(initialForm); };

  const openEdit = (task) => {
    setEditingTask(task);
    setForm({ title: task.title, description: task.description || '', status: task.status || 'todo', priority: task.priority || 'medium', due_date: task.due_date || '', category: task.category || 'other' });
    setDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTask) {
      updateMutation.mutate({ id: editingTask.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const filtered = tasks
    .filter(t => filter === 'all' || t.status === filter)
    .filter(t => t.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader
        title="Tasks"
        subtitle={`${tasks.filter(t => t.status !== 'done').length} active tasks`}
        actions={
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> New Task
          </Button>
        }
      />

      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="todo">To Do</TabsTrigger>
              <TabsTrigger value="in_progress">Active</TabsTrigger>
              <TabsTrigger value="done">Done</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {filtered.length === 0 && !isLoading ? (
          <EmptyState icon={CheckSquare} title="No tasks found" description="Create a new task to get started" action={<Button onClick={() => setDialogOpen(true)} size="sm"><Plus className="w-4 h-4 mr-2" /> New Task</Button>} />
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map(task => {
                const status = statusConfig[task.status] || statusConfig.todo;
                const priority = priorityConfig[task.priority] || priorityConfig.medium;
                return (
                  <motion.div key={task._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("w-3 h-3 rounded-full flex-shrink-0 mt-1", priority.dotColor)} />
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <p className={cn("font-medium break-words", task.status === 'done' && "line-through text-muted-foreground")}>{task.title}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5">
                          {task.due_date && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3" /> {format(new Date(task.due_date), 'MMM d')}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground capitalize">{task.category?.replace('_', ' ')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="secondary" className={cn("text-xs hidden sm:inline-flex", status.color)}>{status.label}</Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(task)}>Edit</DropdownMenuItem>
                            {task.status !== 'done' && <DropdownMenuItem onClick={() => updateMutation.mutate({ id: task._id, data: { status: 'done' } })}>Mark Done</DropdownMenuItem>}
                            <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(task._id)}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="mt-1 pl-6 sm:hidden">
                      <Badge variant="secondary" className={cn("text-xs", status.color)}>{status.label}</Badge>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingTask ? 'Edit Task' : 'New Task'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Due Date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>{editingTask ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}