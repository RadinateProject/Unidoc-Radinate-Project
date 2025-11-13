'use client';

import { JSX, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCcw,
  Loader2,
  Info,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function ModelsPage() {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadModels() {
      try {
        const data = await apiFetch('/models');
        setModels(data.models || data || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadModels();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600 dark:text-gray-300">
        <Loader2 className="animate-spin w-5 h-5 mr-2" /> Loading models...
      </div>
    );

  if (error)
    return (
      <div className="text-red-600 dark:text-red-400 text-center mt-10">
        Error: {error}
      </div>
    );

  return (
    <ProtectedRoute
      allowedRoles={['CMIO', 'Chief Risk Officer', 'Radiology Lead']}
    >
      <div className="p-6 transition-colors bg-gray-50 dark:bg-gray-900 min-h-screen">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Brain className="text-blue-500 dark:text-blue-400" /> AI Models Explorer
          </h1>

          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-blue-600 dark:bg-blue-700 
                       text-white px-4 py-2 rounded-md hover:bg-blue-700 
                       dark:hover:bg-blue-600 transition"
          >
            <RefreshCcw size={16} /> Refresh
          </button>
        </div>

        {/* Empty State */}
        {models.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-gray-600 dark:text-gray-300 mt-20">
            <Info size={40} className="mb-3 text-gray-400 dark:text-gray-500" />
            <p className="text-lg">No models found</p>
            <p className="text-sm">Ingest data or run comparison jobs first.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-lg 
                          border border-gray-200 dark:border-gray-700 overflow-hidden">

            <table className="w-full border-collapse">
              <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm uppercase">
                <tr>
                  <th className="py-3 px-4 text-left">Model</th>
                  <th className="py-3 px-4 text-left">Version</th>
                  <th className="py-3 px-4 text-left">Precision</th>
                  <th className="py-3 px-4 text-left">Recall</th>
                  <th className="py-3 px-4 text-left">F1 Score</th>
                  <th className="py-3 px-4 text-left">Last Run</th>
                  <th className="py-3 px-4 text-left">Health</th>
                </tr>
              </thead>

              <tbody>
                {models.map((m, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-200 dark:border-gray-700
                               hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200">
                      {m.model_name}
                    </td>

                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {m.model_version}
                    </td>

                    <td className="py-3 px-4 text-blue-700 dark:text-blue-300 font-semibold">
                      {m.precision?.toFixed(3) ?? '—'}
                    </td>

                    <td className="py-3 px-4 text-purple-700 dark:text-purple-300 font-semibold">
                      {m.recall?.toFixed(3) ?? '—'}
                    </td>

                    <td className="py-3 px-4 text-green-700 dark:text-green-300 font-semibold">
                      {m.f1_score?.toFixed(3) ?? '—'}
                    </td>

                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {m.last_run ? new Date(m.last_run).toLocaleString() : '—'}
                    </td>

                    <td className="py-3 px-4">
                      <HealthBadge health={m.health || 'stable'} />
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

/* --------------------------------------
   🧩 DARK-MODE HEALTH BADGE COMPONENT
--------------------------------------- */

function HealthBadge({ health }: { health: string }) {
  const styles: Record<string, string> = {
    stable:
      'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700',
    degraded:
      'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700',
    drifted:
      'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
  };

  const icons: Record<string, JSX.Element> = {
    stable: <CheckCircle size={14} />,
    degraded: <AlertTriangle size={14} />,
    drifted: <TrendingUp size={14} />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full 
        ${styles[health] || styles.stable}`}
    >
      {icons[health] || icons.stable}
      {health.charAt(0).toUpperCase() + health.slice(1)}
    </span>
  );
}
