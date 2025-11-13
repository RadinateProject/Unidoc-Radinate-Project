"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  BarChart,
  Brain,
  Activity,
  Scale,
  Bell,
  Users,
  FileDown,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import ToggleDarkMode from "@/components/ui/ToggleDarkMode";

const roleRoutes: Record<string, { label: string; href: string; icon: any }[]> = {
  CMIO: [
    { label: "Metrics Dashboard", href: "/dashboard/metrics", icon: BarChart },
    { label: "Models Explorer", href: "/dashboard/models", icon: Brain },
    { label: "Drift Monitor", href: "/dashboard/drift", icon: Activity },
    { label: "Fairness Monitor", href: "/dashboard/fairness", icon: Scale },
    { label: "Alerts Center", href: "/dashboard/alerts", icon: Bell },
    { label: "RBAC Users", href: "/dashboard/users", icon: Users },
  ],

  "Chief Risk Officer": [
    { label: "Metrics Dashboard", href: "/dashboard/metrics", icon: BarChart },
    { label: "Drift Monitor", href: "/dashboard/drift", icon: Activity },
    { label: "Fairness Monitor", href: "/dashboard/fairness", icon: Scale },
    { label: "Alerts Center", href: "/dashboard/alerts", icon: Bell },
    { label: "Exports", href: "/dashboard/exports", icon: FileDown },
  ],

  "Radiology Lead": [
    { label: "Models Explorer", href: "/dashboard/models", icon: Brain },
    { label: "Alerts Center", href: "/dashboard/alerts", icon: Bell },
  ],

  CFO: [
    { label: "Exports", href: "/dashboard/exports", icon: FileDown },
  ],

  Analyst: [
    { label: "Metrics Dashboard", href: "/dashboard/metrics", icon: BarChart },
    { label: "Drift Monitor", href: "/dashboard/drift", icon: Activity },
    { label: "Fairness Monitor", href: "/dashboard/fairness", icon: Scale },
  ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Loading session...
      </div>
    );
  }

  if (!user) return null;

  const links = roleRoutes[user.role] || [];

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      
      {/* ================= Sidebar ================= */}
      <aside
        className={`border-r bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-sm
          transition-all duration-300 flex flex-col justify-between
          ${collapsed ? "w-20" : "w-64"}`}
      >
        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between border-b dark:border-gray-700">
          {!collapsed && (
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              Radinate
            </h2>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-600 dark:text-gray-300 hover:text-blue-500"
          >
            {collapsed ? <Menu size={22} /> : <X size={22} />}
          </button>
        </div>

        {/* ===== Navigation Links ===== */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {links.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);

            return (<>
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all 
                  ${
                    active
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700"
                  }
                  ${collapsed ? "justify-center" : ""}
                `}
              >
                <Icon size={18} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
              <hr />
              </>
            );
          })}
        </nav>

        {/* ===== Bottom Section ===== */}
        <div className="p-4 border-t dark:border-gray-700 flex items-center justify-between">
          {!collapsed && (
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-200">{user.email}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user.role}</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <ToggleDarkMode />

            <button
              onClick={logout}
              className="text-red-500 hover:text-red-600 dark:hover:text-red-400"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      {/* ================= Main Content ================= */}
      <main className="flex-1 p-6 overflow-auto text-gray-900 dark:text-gray-100">
        {children}
      </main>
    </div>
  );
}

// 'use client';

// import React, { useState } from 'react';
// import Link from 'next/link';
// import { useAuth } from '@/context/AuthContext';
// import {
//   Home,
//   BarChart3,
//   Activity,
//   ShieldCheck,
//   Brain,
//   AlertTriangle,
//   Users,
//   FileDown,
//   Menu,
//   X,
// } from 'lucide-react';

// export default function DashboardLayout({ children }: { children: React.ReactNode }) {
//   const { user } = useAuth();
//   const [collapsed, setCollapsed] = useState(false);

//   const role = user?.role || '';

//   const menuItems = [
//     { label: 'Dashboard', href: '/dashboard', icon: <Home />, roles: ['ALL'] },
//     { label: 'Metrics', href: '/metrics', icon: <BarChart3 />, roles: ['CMIO', 'Chief Risk Officer', 'Radiology Lead'] },
//     { label: 'Models', href: '/models', icon: <Brain />, roles: ['CMIO', 'Chief Risk Officer', 'Radiology Lead'] },
//     { label: 'Drift Monitor', href: '/drift', icon: <Activity />, roles: ['CMIO', 'Chief Risk Officer'] },
//     { label: 'Fairness', href: '/fairness', icon: <ShieldCheck />, roles: ['CMIO', 'Chief Risk Officer', 'CFO', 'Radiology Lead'] },
//     { label: 'Alerts', href: '/alerts', icon: <AlertTriangle />, roles: ['CMIO', 'Chief Risk Officer', 'Radiology Lead'] },
//     { label: 'Users', href: '/users', icon: <Users />, roles: ['CMIO'] },
//     { label: 'Exports', href: '/exports', icon: <FileDown />, roles: ['CMIO', 'Chief Risk Officer', 'CFO'] },
//   ];

//   const filteredMenu = menuItems.filter(
//     (item) => item.roles.includes('ALL') || item.roles.includes(role)
//   );

//   return (
//     <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors">

//       {/* SIDEBAR */}
//       <aside
//         className={`
//           h-screen border-r border-gray-200 dark:border-gray-700 
//           bg-white dark:bg-gray-800 shadow-md 
//           transition-all duration-300 
//           ${collapsed ? 'w-16' : 'w-64'}
//         `}
//       >
//         <div className="p-4 flex items-center justify-between">
//           {!collapsed && (
//             <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">
//               Radinate
//             </h1>
//           )}
//           <button
//             className="text-gray-700 dark:text-gray-300"
//             onClick={() => setCollapsed(!collapsed)}
//           >
//             {collapsed ? <Menu /> : <X />}
//           </button>
//         </div>

//         <nav className="mt-4">
//           {filteredMenu.map((item) => (
//             <Link
//               key={item.href}
//               href={item.href}
//               className="
//                 flex items-center gap-3 px-4 py-3 
//                 text-gray-700 dark:text-gray-300 
//                 hover:bg-gray-100 dark:hover:bg-gray-700 
//                 transition-colors
//               "
//             >
//               <span className="w-5 h-5">{item.icon}</span>
//               {!collapsed && <span>{item.label}</span>}
//             </Link>
//           ))}
//         </nav>
//       </aside>

//       {/* MAIN CONTENT */}
//       <main className="flex-1 p-6 text-gray-900 dark:text-gray-100 transition-colors">
//         {children}
//       </main>
//     </div>
//   );
// }
