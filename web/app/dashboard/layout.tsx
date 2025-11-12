// app/dashboard/layout.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import ToggleDarkMode from '@/components/ui/ToggleDarkMode';

const roleRoutes: Record<string, { label: string; href: string }[]> = {
  'CMIO': [
    { label: 'Metrics Dashboard', href: '/dashboard/metrics' },
    { label: 'Models Explorer', href: '/dashboard/models' },
    { label: 'Drift Monitor', href: '/dashboard/drift' },
    { label: 'Fairness Monitor', href: '/dashboard/fairness' },
    { label: 'Alerts Center', href: '/dashboard/alerts' },
    { label: 'RBAC Users', href: '/dashboard/users' },
  ],
  'Chief Risk Officer': [
    { label: 'Metrics Dashboard', href: '/dashboard/metrics' },
    { label: 'Drift Monitor', href: '/dashboard/drift' },
    { label: 'Fairness Monitor', href: '/dashboard/fairness' },
    { label: 'Alerts Center', href: '/dashboard/alerts' },
    { label: 'Exports', href: '/dashboard/exports' },
  ],
  'Radiology Lead': [
    { label: 'Models Explorer', href: '/dashboard/models' },
    { label: 'Alerts Center', href: '/dashboard/alerts' },
  ],
  'CFO': [{ label: 'Exports', href: '/dashboard/exports' }],
  'Analyst': [
    { label: 'Metrics Dashboard', href: '/dashboard/metrics' },
    { label: 'Drift Monitor', href: '/dashboard/drift' },
    { label: 'Fairness Monitor', href: '/dashboard/fairness' },
  ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 animate-pulse">Loading user session...</p>
      </div>
    );

  if (!user) return null;

  const links = roleRoutes[user.role] || [];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`bg-white border-r transition-all duration-300 flex flex-col justify-between
          ${collapsed ? 'w-20' : 'w-64'}`}
      >
        <div className="p-4 flex items-center justify-between border-b">
          {!collapsed && <h2 className="text-xl font-bold">Radinate</h2>}
          
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-600 hover:text-blue-600 focus:outline-none"
          >
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        <ul className="flex-1 overflow-y-auto space-y-1 mt-4 px-2">
          {links.map((link) => (
            <>
            <li key={link.href} >
              <Link
                href={link.href}
                className={`block px-3 py-2 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors flex divide-x divide-gray-300 ${
                  collapsed ? 'text-center text-sm' : 'text-base'
                }`}
              >
                {link.label}
              </Link>
            </li>
            <hr />
            </>
          ))}
        </ul>

        {/* Footer Info */}
        <div className="p-4 border-t text-sm text-gray-500 flex justify-between items-center space-x-2">
          <div>{!collapsed && (
            <>
              <p>{user.email}</p>
              <p className="text-xs text-gray-400 mb-2">{user.role}</p>
            </>
          )}
          <button
            onClick={logout}
            className={`text-red-500 hover:underline ${
              collapsed ? 'text-xs' : 'text-sm'
            }`}
          >
            Logout
          </button></div>
          <ToggleDarkMode />
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
