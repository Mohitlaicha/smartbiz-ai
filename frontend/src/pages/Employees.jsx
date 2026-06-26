import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Users, MoreHorizontal, Briefcase, Building2, FolderOpen, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const statusConfig = {
  active:    { label: 'Active',    color: 'bg-success/10 text-success border-success/20' },
  on_leave:  { label: 'On Leave',  color: 'bg-warning/10 text-warning border-warning/20' },
  remote:    { label: 'Remote',    color: 'bg-primary/10 text-primary border-primary/20' },
  inactive:  { label: 'Inactive',  color: 'bg-muted text-muted-foreground border-border' },
};

const departmentColors = {
  engineering: 'bg-primary/10 text-primary',
  marketing:   'bg-warning/10 text-warning',
  sales:       'bg-success/10 text-success',
  finance:     'bg-accent/10 text-accent',
  operations:  'bg-chart-4/10 text-chart-4',
  design:      'bg-chart-2/10 text-chart-2',
  hr:          'bg-destructive/10 text-destructive',
  support:     'bg-muted text-muted-foreground',
  management:  'bg-foreground/10 text-foreground',
};

const DEPARTMENTS = ['engineering', 'marketing', 'sales', 'finance', 'operations', 'design', 'hr', 'support', 'management'];

const initialForm = {
  name: '', email: '', phone: '', role: '', department: 'operations',
  status: 'active', active_projects: [], start_date: '', salary: '', attendance_rate: '',
};

export default function Employees() {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [projectInput, setProjectInput] = useState('');
  const queryClient = useQueryClient();

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Employee.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['employees'] }); closeDialog(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Employee.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['employees'] }); closeDialog(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Employee.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingEmployee(null);
    setForm(initialForm);
    setProjectInput('');
  };

  const openEdit = (emp) => {
    setEditingEmployee(emp);
    setForm({
      name: emp.name, email: emp.email || '', phone: emp.phone || '',
      role: emp.role, department: emp.department || 'operations',
      status: emp.status || 'active',
      active_projects: emp.active_projects || [],
      start_date: emp.start_date || '',
      salary: String(emp.salary ?? ''),
      attendance_rate: String(emp.attendance_rate ?? ''),
    });
    setDialogOpen(true);
  };

  const addProject = () => {
    const trimmed = projectInput.trim();
    if (trimmed && !form.active_projects.includes(trimmed)) {
      setForm(f => ({ ...f, active_projects: [...f.active_projects, trimmed] }));
    }
    setProjectInput('');
  };

  const removeProject = (proj) => {
    setForm(f => ({ ...f, active_projects: f.active_projects.filter(p => p !== proj) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingEmployee) {
      updateMutation.mutate({ id: editingEmployee.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const filtered = employees
    .filter(e => deptFilter === 'all' || e.department === deptFilter)
    .filter(e =>
      e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.role?.toLowerCase().includes(search.toLowerCase()) ||
      e.email?.toLowerCase().includes(search.toLowerCase())
    );

  const activeCount = employees.filter(e => e.status === 'active' || e.status === 'remote').length;

  return (
    <div>
      <PageHeader
        title="Team"
        subtitle={`${employees.length} employees · ${activeCount} active`}
        actions={
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Employee
          </Button>
        }
      />

      {/* Summary stat pills */}
      <div className="flex flex-wrap gap-3 mb-6">
        {DEPARTMENTS.filter(d => employees.some(e => e.department === d)).map(dept => (
          <button
            key={dept}
            onClick={() => setDeptFilter(deptFilter === dept ? 'all' : dept)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
              deptFilter === dept
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border/50 text-muted-foreground hover:border-primary/40"
            )}
          >
            {dept.charAt(0).toUpperCase() + dept.slice(1)} ({employees.filter(e => e.department === dept).length})
          </button>
        ))}
      </div>

      <div className="glass rounded-2xl p-6">
        {/* Search + filter bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by name, role…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Tabs value={deptFilter} onValueChange={setDeptFilter}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>


        {filtered.length === 0 && !isLoading ? (
          <EmptyState
            icon={Users}
            title="No employees found"
            description="Add your first employee to start managing your team"
            action={<Button onClick={() => setDialogOpen(true)} size="sm"><Plus className="w-4 h-4 mr-2" /> Add Employee</Button>}
          />
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filtered.map((emp) => {
                const status = statusConfig[emp.status] || statusConfig.active;
                const deptColor = departmentColors[emp.department] || departmentColors.operations;
                const initials = emp.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <motion.div
                    key={emp.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-all"
                  >
                    {/* Top row: avatar + name + actions */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">{initials}</span>
                      </div>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <p className="font-medium break-words">{emp.name}</p>
                        <p className="text-xs text-muted-foreground break-words">{emp.email}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(emp)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(emp.id)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Details row */}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>{emp.role}</span>
                      </div>
                      <Badge variant="secondary" className={cn("text-xs capitalize", deptColor)}>{emp.department}</Badge>
                      <Badge variant="outline" className={cn("text-xs", status.color)}>{status.label}</Badge>
                    </div>

                    {/* Projects */}
                    {emp.active_projects?.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap mt-2">
                        {emp.active_projects.slice(0, 3).map((proj, i) => (
                          <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">
                            <FolderOpen className="w-3 h-3" /> {proj}
                          </span>
                        ))}
                        {emp.active_projects.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{emp.active_projects.length - 3}</span>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Full Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <Label>Role / Job Title *</Label>
                <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required />
              </div>
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <div>
                <Label>Monthly Salary ($)</Label>
                <Input type="number" step="0.01" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="e.g. 4500" />
              </div>
              <div>
                <Label>Attendance Rate (%)</Label>
                <Input type="number" min="0" max="100" value={form.attendance_rate} onChange={(e) => setForm({ ...form, attendance_rate: e.target.value })} placeholder="e.g. 95" />
              </div>
              <div>
                <Label>Department</Label>
                <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map(d => (
                      <SelectItem key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Projects */}
            <div>
              <Label>Active Projects</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  placeholder="Add a project…"
                  value={projectInput}
                  onChange={(e) => setProjectInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addProject(); } }}
                />
                <Button type="button" variant="outline" onClick={addProject}>Add</Button>
              </div>
              {form.active_projects.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.active_projects.map((proj, i) => (
                    <span key={i} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-sm">
                      {proj}
                      <button type="button" onClick={() => removeProject(proj)} className="ml-1 text-muted-foreground hover:text-foreground">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingEmployee ? 'Update' : 'Add Employee'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}