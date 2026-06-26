import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, Users, FileText, CheckSquare, Package, UserCheck, AlertTriangle } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import RecentActivity from '@/components/dashboard/RecentActivity';
import TaskSummary from '@/components/dashboard/TaskSummary';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { data: invoices = [] } = useQuery({ queryKey: ['invoices'], queryFn: () => base44.entities.Invoice.list('-created_date', 50) });
  const { data: customers = [] } = useQuery({ queryKey: ['customers'], queryFn: () => base44.entities.Customer.list('-created_date', 50) });
  const { data: tasks = [] } = useQuery({ queryKey: ['tasks'], queryFn: () => base44.entities.Task.list('-created_date', 50) });
  const { data: expenses = [] } = useQuery({ queryKey: ['expenses'], queryFn: () => base44.entities.Expense.list('-created_date', 50) });
  const { data: employees = [] } = useQuery({ queryKey: ['employees'], queryFn: () => base44.entities.Employee.list('-created_date', 50) });
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: () => base44.entities.Product.list('-created_date', 50) });

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.amount || 0), 0);
  const activeTasks = tasks.filter(t => t.status !== 'done').length;
  const activeEmployees = employees.filter(e => e.status === 'active' || e.status === 'remote').length;
  const lowStockProducts = products.filter(p => p.quantity <= (p.low_stock_threshold ?? 10));

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Welcome back! Here's your business overview." />

      {/* Low stock alert banner */}
      {lowStockProducts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-3 p-4 mb-6 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">
              {lowStockProducts.length} item{lowStockProducts.length > 1 ? 's are' : ' is'} low on stock:{' '}
              {lowStockProducts.slice(0, 3).map(p => p.name).join(', ')}{lowStockProducts.length > 3 ? ` +${lowStockProducts.length - 3} more` : ''}
            </span>
          </div>
          <Link to="/inventory" className="text-xs font-semibold underline underline-offset-2 whitespace-nowrap">View Inventory</Link>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        <StatCard title="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={DollarSign} trend={12.5} trendLabel="vs last month" iconColor="bg-primary/10" />
        <StatCard title="Customers" value={customers.length} icon={Users} trend={8.2} trendLabel="vs last month" iconColor="bg-accent/10" />
        <StatCard title="Invoices" value={invoices.length} icon={FileText} trend={-3.1} trendLabel="vs last month" iconColor="bg-success/10" />
        <StatCard title="Active Employees" value={`${activeEmployees} / ${employees.length}`} icon={UserCheck} trend={0} trendLabel="" iconColor="bg-chart-2/10" />
        <StatCard title="Products in Stock" value={products.length} icon={Package} iconColor="bg-warning/10" />
        <StatCard title="Active Tasks" value={activeTasks} icon={CheckSquare} trend={15.0} trendLabel="new this week" iconColor="bg-destructive/10" />
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RevenueChart invoices={invoices} />
        </div>
        <RecentActivity invoices={invoices} customers={customers} tasks={tasks} />
      </div>

      <div className="mt-6">
        <TaskSummary tasks={tasks} />
      </div>
    </div>
  );
}