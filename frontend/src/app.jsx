import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClientInstance } from "@/lib/query-client";

import AppLayout from "@/components/layout/AppLayout";

import Login from "@/pages/login.jsx";
import Register from "@/pages/register.jsx";
import Dashboard from "@/pages/dashboard.jsx";
import Customers from "@/pages/customers.jsx";
import Invoices from "@/pages/Invoices.jsx";
import Inventory from "@/pages/inventory.jsx";
import Tasks from "@/pages/Tasks.jsx";
import Expenses from "@/pages/Expenses.jsx";
import Reports from "@/pages/Reports.jsx";
import Employees from "@/pages/Employees.jsx";
import Sales from "@/pages/sales.jsx";

export default function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/team" element={<Employees />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/sales" element={<Sales />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}