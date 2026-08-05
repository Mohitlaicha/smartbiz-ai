
import { api, businessAPI } from "@/api/client";
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, DollarSign, Users, Package, FileText } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useEffect, useState } from "react";
import {
  
  CalendarDays,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const [period, setPeriod] = useState("last7days");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");

  const {
    data: invoices = [],
    isLoading: invoicesLoading,
    error: invoicesError,
  } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const response = await api.get("/invoices");
      return response.data;
    },
  });

  const {
    data: customers = [],
    isLoading: customersLoading,
    error: customersError,
  } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await api.get("/customers");
      return response.data;
    },
  });

  const {
    data: expenses = [],
    isLoading: expensesLoading,
    error: expensesError,
  } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const response = await api.get("/expenses");
      return response.data;
    },
  });

  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await api.get("/products");
      return response.data;
    },
  });

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getPresetDates = (selectedPeriod) => {
    const today = new Date();

    let start = new Date(today);
    let end = new Date(today);

    switch (selectedPeriod) {
      case "yesterday":
        start.setDate(today.getDate() - 1);
        end = new Date(start);
        break;

      case "last7days":
        start.setDate(today.getDate() - 6);
        break;

      case "last30days":
        start.setDate(today.getDate() - 29);
        break;

      case "thisMonth":
        start = new Date(
          today.getFullYear(),
          today.getMonth(),
          1
        );

        end = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0
        );
        break;

      case "previousMonth":
        start = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1
        );

        end = new Date(
          today.getFullYear(),
          today.getMonth(),
          0
        );
        break;

      default:
        return {
          startDate,
          endDate,
        };
    }

    return {
      startDate: formatDate(start),
      endDate: formatDate(end),
    };
  };

  const loadReport = async () => {
    setReportLoading(true);
    setReportError("");

    try {
      const dates =
        period === "custom"
          ? { startDate, endDate }
          : getPresetDates(period);

      if (!dates.startDate || !dates.endDate) {
        setReportError(
          "Please select both start and end dates"
        );
        return;
      }

      if (
        new Date(dates.startDate) >
        new Date(dates.endDate)
      ) {
        setReportError(
          "Start date cannot be after end date"
        );
        return;
      }

      const response = await businessAPI.getReports(dates);

      setReportData(response.data);
      setStartDate(dates.startDate);
      setEndDate(dates.endDate);
    } catch (error) {
      setReportError(
        error.response?.data?.message ||
          "Unable to load report"
      );
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  if (
    invoicesLoading ||
    customersLoading ||
    expensesLoading ||
    productsLoading
  ) {
    return (
      <div className="p-6">
        Loading reports...
      </div>
    );
  }

  if (
    invoicesError ||
    customersError ||
    expensesError ||
    productsError
  ) {
    return (
      <div className="p-6 text-red-500">
        Failed to load reports.
      </div>
    );
  }

const displayedInvoices =
  reportData?.invoices ?? invoices;

const displayedCustomers =
  reportData?.customers ?? customers;

const displayedExpenses =
  reportData?.expenses ?? expenses;

const displayedSales =
  reportData?.sales ?? [];

  // Monthly revenue vs expenses
  const monthlyData = MONTHS.map((month, idx) => {
    const revenue = displayedInvoices.filter(i => i.status === 'paid' && new Date(i.createdAt).getMonth() === idx)
      .reduce((s, i) => s + (i.amount || 0), 0);
    const expense = displayedExpenses.filter(e => new Date(e.createdAt).getMonth() === idx)
      .reduce((s, e) => s + (e.amount || 0), 0);
    return { month, revenue, expense, profit: revenue - expense };
  });

  // Customer growth by month
  const customerGrowth = MONTHS.map((month, idx) => ({
  month,
  customers: displayedCustomers.filter(
    (customer) =>
      new Date(customer.createdAt).getMonth() <= idx
  ).length,
}));

  // Expense by category
  const expenseByCategory = Object.entries(
    displayedExpenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + (e.amount || 0); return acc; }, {})
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  // Invoice status breakdown
  const invoiceStatus = [
  "paid",
  "sent",
  "overdue",
  "draft",
]
  .map((status) => ({
    name:
      status.charAt(0).toUpperCase() +
      status.slice(1),

    value: displayedInvoices.filter(
      (invoice) => invoice.status === status
    ).length,
  }))
  .filter((item) => item.value > 0);

  // Inventory value by category
  const inventoryByCategory = Object.entries(
    products.reduce((acc, p) => { acc[p.category || 'other'] = (acc[p.category || 'other'] || 0) + ((p.quantity || 0) * (p.price || 0)); return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

const summary = reportData?.summary;

const totalRevenue =
  summary?.totalRevenue ??
  displayedInvoices
    .filter(
      (invoice) =>
        String(invoice.status).toLowerCase() === "paid"
    )
    .reduce(
      (sum, invoice) =>
        sum + Number(invoice.amount || invoice.total || 0),
      0
    );

const totalExpenses =
  summary?.totalExpenses ??
  displayedExpenses.reduce(
    (sum, expense) =>
      sum + Number(expense.amount || 0),
    0
  );

const totalInventoryValue =
  summary?.inventoryValue ??
  products.reduce(
    (sum, product) =>
      sum +
      Number(product.quantity || 0) *
        Number(product.price || product.cost || 0),
    0
  );
  
  const summaryCards = [
    { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-primary/10 text-primary' },
    { label: 'Total Expenses', value: `$${totalExpenses.toLocaleString()}`, icon: TrendingUp, color: 'bg-destructive/10 text-destructive' },
    { label: 'Net Profit', value: `$${(totalRevenue - totalExpenses).toLocaleString()}`, icon: TrendingUp, color: 'bg-success/10 text-success' },
    { label: 'Inventory Value', value: `$${totalInventoryValue.toLocaleString()}`, icon: Package, color: 'bg-warning/10 text-warning' },
    {
  label: "Total Customers",
  value:
    summary?.totalCustomers ??
    displayedCustomers.length,
  icon: Users,
  color: "bg-accent/10 text-accent",
},
{
  label: "Total Invoices",
  value:
    summary?.totalInvoices ??
    displayedInvoices.length,
  icon: FileText,
  color: "bg-chart-2/10 text-chart-2",
}
, ];

  const tooltipStyle = {
    background: 'hsl(0,0%,100%)', border: '1px solid hsl(220,13%,91%)',
    borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: '13px'
  };

  return (
    <div>
      <PageHeader title="Reports & Analytics" subtitle="Business performance overview" />
      <div className="mb-6 rounded-2xl border bg-card p-5 shadow-sm">
  <div className="mb-4 flex items-center gap-2">
    <CalendarDays className="h-5 w-5 text-primary" />

    <h2 className="font-semibold">
      Report period
    </h2>
  </div>

  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
    <div>
      <label className="mb-2 block text-sm font-medium">
        Period
      </label>

      <select
        value={period}
        onChange={(event) =>
          setPeriod(event.target.value)
        }
        className="h-10 w-full rounded-md border bg-background px-3"
      >
        <option value="yesterday">Yesterday</option>
        <option value="last7days">Last 7 days</option>
        <option value="last30days">Last 30 days</option>
        <option value="thisMonth">This month</option>
        <option value="previousMonth">
          Previous month
        </option>
        <option value="custom">Custom period</option>
      </select>
    </div>

    {period === "custom" && (
      <>
        <div>
          <label className="mb-2 block text-sm font-medium">
            Start date
          </label>

          <Input
            type="date"
            value={startDate}
            onChange={(event) =>
              setStartDate(event.target.value)
            }
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            End date
          </label>

          <Input
            type="date"
            value={endDate}
            onChange={(event) =>
              setEndDate(event.target.value)
            }
          />
        </div>
      </>
    )}

    <div className="flex items-end">
      <Button
        onClick={loadReport}
        disabled={reportLoading}
        className="w-full"
      >
       {reportLoading ?  (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          "Generate report"
        )}
      </Button>
    </div>
  </div>

 {reportError && (
  <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
    {reportError}
  </div>
)}

  {reportData?.period?.startDate && (
    <p className="mt-4 text-sm text-muted-foreground">
      Showing results from{" "}
     <strong>{reportData.period.startDate}</strong> to{" "}
      <strong>{reportData.period.endDate}</strong>
    </p>
  )}
</div>

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