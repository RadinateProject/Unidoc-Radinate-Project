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
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        <Loader2 className="animate-spin w-5 h-5 mr-2" /> Loading models...
      </div>
    );

  if (error)
    return <div className="text-red-500 text-center mt-10">Error: {error}</div>;

  return (
         <ProtectedRoute allowedRoles={['CMIO', 'Chief Risk Officer', 'Radiology Lead']}>
            
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Brain className="text-blue-500" /> AI Models Explorer
        </h1>

        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          <RefreshCcw size={16} /> Refresh
        </button>
      </div>

      {/* Empty State */}
      {models.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-gray-500 mt-20">
          <Info size={40} className="mb-3 text-gray-400" />
          <p className="text-lg">No models found</p>
          <p className="text-sm">Ingest data or run comparison jobs first.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
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
                <tr key={idx} className="border-b hover:bg-gray-50 transition">
                  <td className="py-3 px-4 font-medium text-gray-800">
                    {m.model_name}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{m.model_version}</td>
                  <td className="py-3 px-4">{m.precision?.toFixed(3) ?? '—'}</td>
                  <td className="py-3 px-4">{m.recall?.toFixed(3) ?? '—'}</td>
                  <td className="py-3 px-4">{m.f1_score?.toFixed(3) ?? '—'}</td>
                  <td className="py-3 px-4 text-gray-500">
                    {m.last_run
                      ? new Date(m.last_run).toLocaleString()
                      : '—'}
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

// 🧩 HealthBadge component
function HealthBadge({ health }: { health: string }) {
  const styles: Record<string, string> = {
    stable: 'bg-green-100 text-green-700 border border-green-300',
    degraded: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
    drifted: 'bg-red-100 text-red-700 border border-red-300',
  };

  const icons: Record<string, JSX.Element> = {
    stable: <CheckCircle size={14} />,
    degraded: <AlertTriangle size={14} />,
    drifted: <TrendingUp size={14} />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
        styles[health] || styles.stable
      }`}
    >
      {icons[health] || icons.stable}
      {health.charAt(0).toUpperCase() + health.slice(1)}
    </span>
  );
}
