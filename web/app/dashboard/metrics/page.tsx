'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function MetricsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadJobs() {
      try {
        const data = await apiFetch('/jobs/history');
        setJobs(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

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

        {/* Page Title */}
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <span>📊</span> Model Performance Metrics
        </h1>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center min-h-[40vh] text-gray-500 dark:text-gray-300">
            Loading metrics...
          </div>
        )}

        {/* Empty State */}
        {!loading && jobs.length === 0 && (
          <p className="text-gray-600 dark:text-gray-400 mt-10 text-center">
            No metrics found yet. Run <code className="text-blue-600 dark:text-blue-400">/jobs/compare</code> to generate results.
          </p>
        )}

        {/* Table */}
        {!loading && jobs.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm uppercase">
                <tr>
                  <th className="py-3 px-4 text-left">Study UID</th>
                  <th className="py-3 px-4 text-left">Model</th>
                  <th className="py-3 px-4 text-left">Version</th>
                  <th className="py-3 px-4 text-left">Precision</th>
                  <th className="py-3 px-4 text-left">Recall</th>
                  <th className="py-3 px-4 text-left">F1 Score</th>
                  <th className="py-3 px-4 text-left">Created</th>
                </tr>
              </thead>

              <tbody>
                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <td className="py-2 px-4 text-gray-800 dark:text-gray-200">
                      {job.study_uid}
                    </td>
                    <td className="py-2 px-4 text-gray-700 dark:text-gray-300">
                      {job.model_name}
                    </td>
                    <td className="py-2 px-4 text-gray-700 dark:text-gray-300">
                      {job.model_version}
                    </td>

                    <td className="py-2 px-4 text-blue-700 dark:text-blue-300 font-semibold">
                      {job.precision?.toFixed(3)}
                    </td>

                    <td className="py-2 px-4 text-purple-700 dark:text-purple-300 font-semibold">
                      {job.recall?.toFixed(3)}
                    </td>

                    <td className="py-2 px-4 text-green-700 dark:text-green-300 font-semibold">
                      {job.f1_score?.toFixed(3)}
                    </td>

                    <td className="py-2 px-4 text-gray-600 dark:text-gray-400">
                      {new Date(job.created_at).toLocaleString()}
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
