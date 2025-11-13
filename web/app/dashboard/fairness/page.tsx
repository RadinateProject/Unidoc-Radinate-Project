'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Scale, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { FairnessTable } from '@/components/FairnessTable';
import { ProtectedRoute } from '@/components/ProtectedRoute';

type FairnessData = {
  model_name: string;
  avg_bias: number;
  subgroups: any[];
};

export default function FairnessPage() {
  const [metrics, setMetrics] = useState<FairnessData | null>(null);
  const [loading, setLoading] = useState(true);

  const biasColor = (bias: number) => {
    if (bias > 0.05) return 'text-green-600 dark:text-green-400';
    if (bias < -0.05) return 'text-red-600 dark:text-red-400';
    return 'text-gray-700 dark:text-gray-300';
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch('/fairness/AIModel-X');
        setMetrics(data);
      } catch (e) {
        console.error('Failed to fetch fairness metrics', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <ProtectedRoute allowedRoles={['CFO', 'Chief Risk Officer', 'CMIO', 'Radiology Lead']}>
      <div className="p-6 space-y-6 transition-colors bg-gray-50 dark:bg-gray-900 min-h-screen">

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <Scale className="text-blue-500 dark:text-blue-400" />
          Fairness Monitor
        </h1>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center text-gray-500 dark:text-gray-300 min-h-[50vh]">
            Loading fairness metrics...
          </div>
        ) : metrics ? (
          <>
            {/* Summary Card */}
            <Card className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                
                {/* Model Info */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Model: <span className="text-blue-600 dark:text-blue-400">{metrics.model_name}</span>
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Subgroup fairness metrics (Precision, Recall, F1 Score, and Δ vs overall).
                  </p>
                </div>

                {/* Average Bias */}
                <div className="mt-3 sm:mt-0 text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Average Bias
                  </p>
                  <p className={`text-xl font-bold ${biasColor(metrics.avg_bias)}`}>
                    {metrics.avg_bias > 0 ? '+' : ''}
                    {metrics.avg_bias.toFixed(3)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-lg border border-gray-200 dark:border-gray-700">
              <FairnessTable data={metrics.subgroups} />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-600 dark:text-gray-300 mt-20">
            <Info size={40} className="mb-3 text-gray-400 dark:text-gray-500" />
            <p className="text-lg">No fairness data found</p>
            <p className="text-sm">Fairness metrics are not available right now.</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

/* -------------------------
   Δ Bias Badge (Dark Mode)
-------------------------- */

export function StatusBadge({ delta }: { delta: number }) {
  if (delta > 0.05)
    return (
      <span className="flex items-center gap-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700 px-2 py-1 rounded-full text-xs font-medium">
        <TrendingUp size={14} /> Improved
      </span>
    );

  if (delta < -0.05)
    return (
      <span className="flex items-center gap-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700 px-2 py-1 rounded-full text-xs font-medium">
        <TrendingDown size={14} /> Biased
      </span>
    );

  return (
    <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 px-2 py-1 rounded-full text-xs font-medium">
      Stable
    </span>
  );
}
