import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DollarSign,
  Users,
  FileText,
  CheckSquare,
  Package,
  UserCheck,
  AlertTriangle,
} from "lucide-react";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import RecentActivity from "@/components/dashboard/RecentActivity";
import TaskSummary from "@/components/dashboard/TaskSummary";

import { businessAPI } from "@/api/client";

export default function Dashboard() {
  const { data: invoicesRes } = useQuery({
    queryKey: ["invoices"],
    queryFn: businessAPI.getInvoices,
  });

  const { data: customersRes } = useQuery({
    queryKey: ["customers"],
    queryFn: businessAPI.getCustomers,
  });

  const { data: productsRes } = useQuery({
    queryKey: ["products"],
    queryFn: businessAPI.getProducts,
  });

  const invoices = invoicesRes?.data || [];
  const customers = customersRes?.data || [];
  const products = productsRes?.data || [];

  // until backend is ready
  const tasks = [];
  const employees = [];

  const totalRevenue = invoices
    .filter((i) => (i.status || "").toLowerCase() === "paid")
    .reduce((sum, i) => sum + Number(i.amount || i.total || 0), 0);

  const activeTasks = tasks.filter((t) => t.status !== "done").length;

  const activeEmployees = employees.filter(
    (e) => e.status === "active" || e.status === "remote"
  ).length;

  const lowStockProducts = products.filter(
    (p) =>
      Number(p.quantity || p.stock || 0) <=
      Number(p.low_stock_threshold || 10)
  );

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's your business overview."
      />

      {lowStockProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-3 p-4 mb-6 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />

            <span className="text-sm font-medium">
              {lowStockProducts.length} product
              {lowStockProducts.length > 1 ? "s are" : " is"} low on stock.
            </span>
          </div>

          <Link
            to="/inventory"
            className="text-xs font-semibold underline"
          >
            View Inventory
          </Link>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8"
      >
        <StatCard
          title="Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="emerald"
          trend={12}
        />

        <StatCard
          title="Customers"
          value={customers.length}
          icon={Users}
          color="blue"
        />

        <StatCard
          title="Invoices"
          value={invoices.length}
          icon={FileText}
          color="violet"
        />

        <StatCard
          title="Employees"
          value={activeEmployees}
          icon={UserCheck}
          color="amber"
        />

        <StatCard
          title="Products"
          value={products.length}
          icon={Package}
          color="rose"
        />

        <StatCard
          title="Tasks"
          value={activeTasks}
          icon={CheckSquare}
          color="blue"
        />
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RevenueChart invoices={invoices} />
        </div>

        <RecentActivity
          invoices={invoices}
          customers={customers}
          tasks={tasks}
        />
      </div>

      <div className="mt-6">
        <TaskSummary tasks={tasks} />
      </div>
    </div>
  );
}