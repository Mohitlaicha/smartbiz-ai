import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

export default function RevenueChart({ invoices }) {
  const chartData = months.map((month, idx) => {
    const monthInvoices = invoices.filter(inv => {
      const d = new Date(inv.created_date);
      return d.getMonth() === idx && inv.status === 'paid';
    });
    const revenue = monthInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    return { month, revenue };
  });

  // If no real data, show sample data
  const hasData = chartData.some(d => d.revenue > 0);
  const displayData = hasData ? chartData : [
    { month: 'Jan', revenue: 4200 },
    { month: 'Feb', revenue: 5800 },
    { month: 'Mar', revenue: 4900 },
    { month: 'Apr', revenue: 7200 },
    { month: 'May', revenue: 6400 },
    { month: 'Jun', revenue: 8100 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass rounded-2xl p-6"
    >
      <h3 className="text-lg font-heading font-semibold mb-1">Revenue Overview</h3>
      <p className="text-sm text-muted-foreground mb-6">Monthly revenue trend</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(220, 9%, 46%)' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(220, 9%, 46%)' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{
                background: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(220, 13%, 91%)',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                fontSize: '13px'
              }}
              formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
            />
            <Area type="monotone" dataKey="revenue" stroke="hsl(221, 83%, 53%)" strokeWidth={2.5} fill="url(#revenueGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}