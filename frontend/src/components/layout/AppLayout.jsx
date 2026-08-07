import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { motion } from "framer-motion";

export default function AppLayout() {
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("user") || "{}"
      );
    } catch {
      return {};
    }
  });

  // Update user immediately when login/logout changes
  useEffect(() => {
    const updateUser = () => {
      try {
        const storedUser = JSON.parse(
          localStorage.getItem("user") || "{}"
        );

        setUser(storedUser);
      } catch {
        setUser({});
      }
    };

    window.addEventListener(
      "auth-change",
      updateUser
    );

    window.addEventListener(
      "storage",
      updateUser
    );

    return () => {
      window.removeEventListener(
        "auth-change",
        updateUser
      );

      window.removeEventListener(
        "storage",
        updateUser
      );
    };
  }, []);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser({});

    window.dispatchEvent(
      new Event("auth-change")
    );

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        collapsed={collapsed}
        onToggle={() =>
          setCollapsed((prev) => !prev)
        }
        user={user}
        onLogout={handleLogout}
      />

      <motion.main
        animate={{
          marginLeft: collapsed ? 72 : 260,
        }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        }}
        className="min-h-screen"
      >
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
}