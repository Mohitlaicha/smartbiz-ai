import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  CheckSquare,
  DollarSign,
  Bot,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogOut,
  Package,
  UserCheck,
  BarChart2,
  ShoppingCart,
  UserCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  {
    path: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "manager", "employee"],
  },
  {
    path: "/profile",
    label: "Profile",
    icon: UserCircle,
    roles: ["admin", "manager", "employee"],
  },
  {
    path: "/customers",
    label: "Customers",
    icon: Users,
    roles: ["admin", "manager", "employee"],
  },
  {
    path: "/invoices",
    label: "Invoices",
    icon: FileText,
    roles: ["admin", "manager", "employee"],
  },
  {
    path: "/inventory",
    label: "Inventory",
    icon: Package,
    roles: ["admin", "manager", "employee"],
  },
  {
    path: "/sales",
    label: "Sales",
    icon: ShoppingCart,
    roles: ["admin", "manager", "employee"],
  },
  {
    path: "/tasks",
    label: "Tasks",
    icon: CheckSquare,
    roles: ["admin", "manager", "employee"],
  },
  {
    path: "/expenses",
    label: "Expenses",
    icon: DollarSign,
    roles: ["admin", "manager"],
  },
  {
    path: "/team",
    label: "Team",
    icon: UserCheck,
    roles: ["admin"],
  },
  {
    path: "/reports",
    label: "Reports",
    icon: BarChart2,
    roles: ["admin", "manager"],
  },
  {
    path: "/ai-advisor",
    label: "AI Advisor",
    icon: Bot,
    roles: ["admin", "manager"],
  },
];

export default function Sidebar({
  collapsed,
  onToggle,
  user,
  onLogout,
}) {
  const location = useLocation();

  const role = user?.role?.toLowerCase();

  const visibleNavItems = navItems.filter(
    (item) => item.roles.includes(role)
  );

  return (
    <motion.aside
      animate={{
        width: collapsed ? 72 : 260,
      }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      }}
      className="fixed left-0 top-0 h-screen bg-sidebar z-50 flex flex-col border-r border-sidebar-border"
    >
      {/* Logo */}
      <div className="h-16 flex items-center border-b border-sidebar-border px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{
                  opacity: 0,
                  x: -10,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: -10,
                }}
                className="font-display font-bold text-lg text-sidebar-foreground whitespace-nowrap"
              >
                SmartBiz AI
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {visibleNavItems.map((item) => {
          const isActive =
            location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-primary/20"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive &&
                    "drop-shadow-sm"
                )}
              />

              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom controls */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all w-full"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />

          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                className="text-sm font-medium"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <button
          onClick={onToggle}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all w-full"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}

          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                className="text-sm font-medium"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}