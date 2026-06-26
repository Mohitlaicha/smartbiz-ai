import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, DollarSign, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const categoryColors = {
  rent: 'bg-primary/10 text-primary',
  utilities: 'bg-accent/10 text-accent',
  salaries: 'bg-success/10 text-success',
  marketing: 'bg-warning/10 text-warning',
  software: 'bg-chart-2/10 text-chart-2',
  supplies: 'bg-muted text-muted-foreground',
  travel: 'bg-chart-4/10 text-chart-4',
  other: 'bg-muted text-muted-foreground',
};

const initialForm = { title: '', amount: '', category: 'other', date: '', vendor: '', notes: '' };

export default function Expenses() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [form, setForm] = useState(initialForm);
  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => base44.entities.Expense.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Expense.create({ ...data, amount: parseFloat(data.amount) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['expenses'] }); closeDialog(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Expense.update(id, { ...data, amount: parseFloat(data.amount) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['expenses'] }); closeDialog(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Expense.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
  });

  const closeDialog = () => { setDialogOpen(false); setEditingExpense(null); setForm(initialForm); };

  const openEdit = (expense) => {
    setEditingExpense(expense);
    setForm({ title: expense.title, amount: String(expense.amount || ''), category: expense.category || 'other', date: expense.date || '', vendor: expense.vendor || '', notes: expense.notes || '' });
    setDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingExpense) {
      updateMutation.mutate({ id: editingExpense.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  const filtered = expenses.filter(e =>
    e.title?.toLowerCase().includes(search.toLowerCase()) ||
    e.vendor?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Expenses"
        subtitle={`Total: $${totalExpenses.toLocaleString()}`}
        actions={
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Expense
          </Button>
        }
      />

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search expenses..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>

        {filtered.length === 0 && !isLoading ? (
          <EmptyState icon={DollarSign} title="No expenses yet" description="Track your business expenses" action={<Button onClick={() => setDialogOpen(true)} size="sm"><Plus className="w-4 h-4 mr-2" /> Add Expense</Button>} />
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map(expense => (
                <motion.div key={expense.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-5 h-5 text-destructive" />
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <p className="font-medium break-words">{expense.title}</p>
                      <p className="text-xs text-muted-foreground">{expense.vendor && `${expense.vendor} · `}{expense.date && format(new Date(expense.date), 'MMM d, yyyy')}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(expense)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(expense.id)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-2 mt-2 pl-[52px]">
                    <span className="font-semibold text-sm text-destructive">-${expense.amount?.toLocaleString()}</span>
                    <Badge variant="secondary" className={categoryColors[expense.category] || categoryColors.other}>
                      {expense.category?.replace('_', ' ')}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingExpense ? 'Edit Expense' : 'Add Expense'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
            <div><Label>Amount *</Label><Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></div>
            <div><Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['rent', 'utilities', 'salaries', 'marketing', 'software', 'supplies', 'travel', 'other'].map(c => (
                    <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            <div><Label>Vendor</Label><Input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} /></div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>{editingExpense ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}