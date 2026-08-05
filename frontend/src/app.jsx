import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Customers from "@/pages/customers";
import Invoices from "@/pages/Invoices";
import Inventory from "@/pages/inventory";
import Sales from "@/pages/sales";
import Tasks from "@/pages/Tasks";
import Expenses from "@/pages/Expenses";
import Employees from "@/pages/Employees";
import Reports from "@/pages/Reports";
import AIAdvisor from "@/pages/AIAdvisor";

import AppLayout from "@/components/layout/AppLayout";
import RoleRoute from "@/components/RoleRoute";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Profile from "@/pages/Profile";

export default function App() {
  return (
   
      <Routes>
 <Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />

<Route
  path="/forgot-password"
  element={<ForgotPassword />}
/>

<Route
  path="/reset-password"
  element={<ResetPassword />}
/>

  <Route element={<AppLayout />}>
    <Route
      element={
        <RoleRoute
          allowedRoles={["admin", "manager", "employee"]}
        />
      }
    >
      <Route path="/" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/invoices" element={<Invoices />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/sales" element={<Sales />} />
      <Route path="/tasks" element={<Tasks />} />
    </Route>

    <Route element={<RoleRoute allowedRoles={["admin", "manager"]} />}>
      <Route path="/expenses" element={<Expenses />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/ai-advisor" element={<AIAdvisor />} />
    </Route>

    <Route element={<RoleRoute allowedRoles={["admin"]} />}>
      <Route path="/team" element={<Employees />} />
    </Route>
  </Route>

  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>

   
  );
  
}

