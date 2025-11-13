'use client';

import { JSX, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Activity, TrendingUp, TrendingDown, AlertTriangle, Info } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function DriftPage() {
  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDrift() {
      try {
        const data = await apiFetch('/drift/AIModel-X:v1.0');
        setSignals(data.signals || data || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadDrift();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 dark:text-gray-400">
        Loading drift metrics...
      </div>
    );

  if (error)
    return (
      <div className="text-red-600 dark:text-red-400 text-center mt-10">
        Error: {error}
      </div>
    );

  return (
    <ProtectedRoute allowedRoles={['CMIO', 'Chief Risk Officer']}>
      <div className="p-6 transition-colors duration-300 bg-gray-50 dark:bg-gray-900 min-h-screen">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Activity className="text-blue-500 dark:text-blue-400" /> Drift Monitor
          </h1>

          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-md
                       hover:bg-blue-700 dark:hover:bg-blue-600 transition"
          >
            Refresh
          </button>
        </div>

        {/* Empty State */}
        {signals.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-gray-600 dark:text-gray-300 mt-20">
            <Info size={40} className="mb-3 text-gray-400 dark:text-gray-500" />
            <p className="text-lg">No drift detected 🎯</p>
            <p className="text-sm">Your model inputs look stable.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-lg overflow-hidden transition-colors">

            <table className="w-full border-collapse">
              <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm uppercase">
                <tr>
                  <th className="py-3 px-4 text-left">Model</th>
                  <th className="py-3 px-4 text-left">Feature</th>
                  <th className="py-3 px-4 text-left">Method</th>
                  <th className="py-3 px-4 text-left">p-Value</th>
                  <th className="py-3 px-4 text-left">Δ Difference</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Window</th>
                </tr>
              </thead>

              <tbody>
                {signals.map((d, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-200 dark:border-gray-700
                               hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200">
                      {d.model_name}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{d.feature}</td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{d.method}</td>

                    <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                      {d.p_value?.toFixed(3)}
                    </td>

                    <td
                      className={`py-3 px-4 font-semibold ${
                        d.diff > 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {d.diff > 0 ? '+' : ''}
                      {d.diff?.toFixed(3)}
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={d.status} />
                    </td>

                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                      {d.window}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

/* ---------------------- */
/* 🧩 Status Badge Themed */
/* ---------------------- */

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    drifted:
      'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
    stable:
      'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
    warning:
      'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
  };

  const icons: Record<string, JSX.Element> = {
    drifted: <TrendingUp size={14} />,
    stable: <CheckIcon />,
    warning: <AlertTriangle size={14} />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border 
        ${styles[status] || styles.stable}`}
    >
      {icons[status] || icons.stable}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

/* ---------------------- */
/* Check Icon */
/* ---------------------- */

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-3 h-3"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
