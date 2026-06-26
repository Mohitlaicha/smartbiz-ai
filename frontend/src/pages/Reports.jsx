import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, DollarSign, Users, Package, FileText } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const COLORS = ['hsl(221,83%,53%)', 'hsl(262,83%,58%)', 'hsl(160,84%,39%)', 'hsl(38,92%,50%)', 'hsl(0,84%,60%)'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-heading font-semibold">{title}</h3>
      {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export default function Reports() {
  const { data: invoices = [] } = useQuery({ queryKey: ['invoices'], queryFn: () => base44.entities.Invoice.list('-created_date', 200) });
  const { data: customers = [] } = useQuery({ queryKey: ['customers'], queryFn: () => base44.entities.Customer.list('-created_date', 200) });
  const { data: expenses = [] } = useQuery({ queryKey: ['expenses'], queryFn: () => base44.entities.Expense.list('-created_date', 200) });
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: () => base44.entities.Product.list('-created_date', 200) });

  // Monthly revenue vs expenses
  const monthlyData = MONTHS.map((month, idx) => {
    const revenue = invoices.filter(i => i.status === 'paid' && new Date(i.created_date).getMonth() === idx)
      .reduce((s, i) => s + (i.amount || 0), 0);
    const expense = expenses.filter(e => new Date(e.created_date).getMonth() === idx)
      .reduce((s, e) => s + (e.amount || 0), 0);
    return { month, revenue, expense, profit: revenue - expense };
  });

  // Customer growth by month
  const customerGrowth = MONTHS.map((month, idx) => ({
    month,
    customers: customers.filter(c => new Date(c.created_date).getMonth() <= idx).length,
  }));

  // Expense by category
  const expenseByCategory = Object.entries(
    expenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + (e.amount || 0); return acc; }, {})
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  // Invoice status breakdown
  const invoiceStatus = ['paid', 'sent', 'overdue', 'draft'].map(s => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    value: invoices.filter(i => i.status === s).length,
  })).filter(d => d.value > 0);

  // Inventory value by category
  const inventoryByCategory = Object.entries(
    products.reduce((acc, p) => { acc[p.category || 'other'] = (acc[p.category || 'other'] || 0) + ((p.quantity || 0) * (p.price || 0)); return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.amount || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const totalInventoryValue = products.reduce((s, p) => s + ((p.quantity || 0) * (p.price || 0)), 0);

  const summaryCards = [
    { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-primary/10 text-primary' },
    { label: 'Total Expenses', value: `$${totalExpenses.toLocaleString()}`, icon: TrendingUp, color: 'bg-destructive/10 text-destructive' },
    { label: 'Net Profit', value: `$${(totalRevenue - totalExpenses).toLocaleString()}`, icon: TrendingUp, color: 'bg-success/10 text-success' },
    { label: 'Inventory Value', value: `$${totalInventoryValue.toLocaleString()}`, icon: Package, color: 'bg-warning/10 text-warning' },
    { label: 'Total Customers', value: customers.length, icon: Users, color: 'bg-accent/10 text-accent' },
    { label: 'Total Invoices', value: invoices.length, icon: FileText, color: 'bg-chart-2/10 text-chart-2' },
  ];

  const tooltipStyle = {
    background: 'hsl(0,0%,100%)', border: '1px solid hsl(220,13%,91%)',
    borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: '13px'
  };

  return (
    <div>
      <PageHeader title="Reports & Analytics" subtitle="Business performance overview" />

      {/* KPI summary */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {summaryCards.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl p-4 flex flex-col gap-3">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", card.color)}>
              <card.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p className="text-xl font-bold font-heading mt-0.5">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Revenue vs Expenses */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6">
          <SectionTitle title="Revenue vs Expenses" subtitle="Monthly comparison" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(220,13%,91%)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(220,9%,46%)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(220,9%,46%)' }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [`$${v.toLocaleString()}`, n.charAt(0).toUpperCase() + n.slice(1)]} />
                <Legend />
                <Bar dataKey="revenue" fill="hsl(221,83%,53%)" radius={[6,6,0,0]} name="Revenue" />
                <Bar dataKey="expense" fill="hsl(0,84%,60%)" radius={[6,6,0,0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass rounded-2xl p-6">
          <SectionTitle title="Customer Growth" subtitle="Cumulative customers over time" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={customerGrowth}>
                <defs>
                  <linearGradient id="custGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(262,83%,58%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(262,83%,58%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(220,13%,91%)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(220,9%,46%)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(220,9%,46%)' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="customers" stroke="hsl(262,83%,58%)" strokeWidth={2.5} fill="url(#custGrad)" name="Customers" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Profit Trend + Pie charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-6 xl:col-span-1">
          <SectionTitle title="Expenses by Category" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expenseByCategory.length ? expenseByCategory : [{ name: 'No data', value: 1 }]}
                  cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {(expenseByCategory.length ? expenseByCategory : [{ name: 'No data', value: 1 }]).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => `$${v.toLocaleString()}`} />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass rounded-2xl p-6 xl:col-span-1">
          <SectionTitle title="Invoice Status" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={invoiceStatus.length ? invoiceStatus : [{ name: 'No data', value: 1 }]}
                  cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {(invoiceStatus.length ? invoiceStatus : [{ name: 'No data', value: 1 }]).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-2xl p-6 xl:col-span-1">
          <SectionTitle title="Inventory Value" subtitle="By category" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryByCategory.length ? inventoryByCategory : [{ name: 'No data', value: 0 }]} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(220,13%,91%)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(220,9%,46%)' }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(220,9%,46%)' }} width={70} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => `$${v.toLocaleString()}`} />
                <Bar dataKey="value" fill="hsl(160,84%,39%)" radius={[0,6,6,0]} name="Value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}