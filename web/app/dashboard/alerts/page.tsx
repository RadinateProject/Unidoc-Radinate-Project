'use client';

import { JSX, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Bell, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const data = await apiFetch('/alerts');
        setAlerts(data.alerts || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadAlerts();
  }, []);

  if (error)
    return (
      <div className="text-red-500 text-center mt-10 dark:text-red-400">
        Error: {error}
      </div>
    );

  return (
    <ProtectedRoute allowedRoles={['CMIO', 'Chief Risk Officer', 'Radiology Lead']}>
      {loading && (
        <div className="flex items-center justify-center min-h-screen text-gray-500 dark:text-gray-400">
          Loading alerts...
        </div>
      )}

      {!loading && (
        <div className="p-6 transition-colors duration-300 bg-gray-50 dark:bg-gray-900 min-h-screen">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Bell className="text-blue-500 dark:text-blue-400" /> System Alerts
            </h1>

            <button
              onClick={async () => {
                try {
                  await apiFetch('/alerts/test', { method: 'POST' });
                  alert('✅ Test alert triggered!');
                  location.reload();
                } catch {
                  alert('❌ Failed to send test alert');
                }
              }}
              className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition"
            >
              Send Test Alert
            </button>
          </div>

          {/* Empty State */}
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-gray-600 dark:text-gray-300 mt-20">
              <Info size={40} className="mb-3 text-gray-400 dark:text-gray-500" />
              <p className="text-lg">No alerts at the moment 🎉</p>
              <p className="text-sm">All systems are healthy.</p>
            </div>
          ) : (
            // Alert Table
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-lg overflow-hidden transition-colors">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm uppercase">
                  <tr>
                    <th className="py-3 px-4 text-left">Type</th>
                    <th className="py-3 px-4 text-left">Message</th>
                    <th className="py-3 px-4 text-left">Severity</th>
                    <th className="py-3 px-4 text-left">Created At</th>
                  </tr>
                </thead>

                <tbody>
                  {alerts.map((alert, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200">
                        {alert.type}
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                        {alert.message}
                      </td>
                      <td className="py-3 px-4">
                        <SeverityBadge severity={alert.severity} />
                      </td>
                      <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                        {new Date(alert.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </ProtectedRoute>
  );
}

// 🧩 SeverityBadge Component (Dark Mode Themed)
function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    info: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700',
    warning: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
    critical: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
    success: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
  };

  const icons: Record<string, JSX.Element> = {
    info: <Info size={14} />,
    warning: <AlertTriangle size={14} />,
    critical: <AlertTriangle size={14} />,
    success: <CheckCircle size={14} />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${styles[severity] || styles.info}`}
    >
      {icons[severity] || icons.info}
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </span>
  );
}
