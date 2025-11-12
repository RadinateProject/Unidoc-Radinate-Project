'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Role-based route map
const roleRoutes: Record<string, { label: string; href: string }[]> = {
  'CMIO': [
    { label:  'Performance Metrics', href: '/metrics' },
    { label: 'Models Explorer', href: '/models' },
    { label: 'Drift Monitor', href: '/drift' },
    { label: 'Fairness Monitor', href: '/fairness' },
    { label: 'Alerts Center', href: '/alerts' },
    { label: 'RBAC Users', href: '/users' },
  ],
  'Chief Risk Officer': [
    { label:  'Performance Metrics', href: '/metrics' },
    { label: 'Drift Monitor', href: '/drift' },
    { label: 'Fairness Monitor', href: '/fairness' },
    { label: 'Alerts Center', href: '/alerts' },
    { label: 'Exports', href: '/exports' },
  ],
  'Radiology Lead': [
    { label: 'Models Explorer', href: '/models' },
    { label: 'Alerts Center', href: '/alerts' },
  ],
  'CFO': [
    { label: 'Exports', href: '/exports' },
  ],
  'Analyst': [
    { label:  'Performance Metrics', href: '/metrics' },
    { label: 'Drift Monitor', href: '/drift' },
    { label: 'Fairness Monitor', href: '/fairness' },
  ],
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // ✅ Only redirect after loading is complete
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  // ✅ While loading user from context, show spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 animate-pulse">Loading user session...</p>
      </div>
    );
  }

  // ✅ If still no user after load → redirect
  if (!user) return null;

  const links = roleRoutes[user.role] || [];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 border-r p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-6">Radinate</h2>
          <ul className="space-y-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block text-blue-600 hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-2">Logged in as:</p>
          <p className="font-medium">{user.email}</p>
          <p className="text-xs text-gray-400 mb-4">{user.role}</p>
          <button
            onClick={logout}
            className="text-red-500 text-sm hover:underline"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-white overflow-auto">{children}</main>
    </div>
  );
}
