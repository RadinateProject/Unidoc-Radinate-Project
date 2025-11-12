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
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Loading drift metrics...
      </div>
    );

  if (error)
    return <div className="text-red-500 text-center mt-10">Error: {error}</div>;

  return (
    <ProtectedRoute allowedRoles={['CMIO', 'Chief Risk Officer']}>
      
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Activity className="text-blue-500" /> Drift Monitor
        </h1>

        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Refresh
        </button>
      </div>

      {/* Empty State */}
      {signals.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-gray-500 mt-20">
          <Info size={40} className="mb-3 text-gray-400" />
          <p className="text-lg">No drift detected 🎯</p>
          <p className="text-sm">Your model inputs look stable.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
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
                <tr key={idx} className="border-b hover:bg-gray-50 transition">
                  <td className="py-3 px-4 font-medium text-gray-800">
                    {d.model_name}
                  </td>
                  <td className="py-3 px-4 text-gray-700">{d.feature}</td>
                  <td className="py-3 px-4 text-gray-500">{d.method}</td>
                  <td className="py-3 px-4">{d.p_value?.toFixed(3)}</td>
                  <td
                    className={`py-3 px-4 font-semibold ${
                      d.diff > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {d.diff > 0 ? '+' : ''}
                    {d.diff?.toFixed(3)}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="py-3 px-4 text-gray-500">{d.window}</td>
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

// 🧩 Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    drifted: 'bg-red-100 text-red-700 border border-red-300',
    stable: 'bg-green-100 text-green-700 border border-green-300',
    warning: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
  };

  const icons: Record<string, JSX.Element> = {
    drifted: <TrendingUp size={14} />,
    stable: <CheckIcon />,
    warning: <AlertTriangle size={14} />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
        styles[status] || styles.stable
      }`}
    >
      {icons[status] || icons.stable}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ✅ Check icon
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
