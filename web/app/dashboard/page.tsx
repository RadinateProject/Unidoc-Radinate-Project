// // app/dashboard/page.tsx
// export default function DashboardPage() {
//   return (
//     <div>
//       <h1 className="text-2xl font-bold">Welcome to Radinate Dashboard</h1>
//       <p className="text-gray-600 mt-2">Select a section from the sidebar.</p>
//     </div>
//   );
// }

'use client';

import { useAuth } from '@/context/AuthContext';
import { BarChart3, Brain, ShieldCheck, Activity } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          Welcome, {user?.email || 'User'} 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Select a section from the sidebar to continue.
        </p>
      </div>

      {/* QUICK ACTION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

        <DashboardCard
          title="Model Metrics"
          subtitle="Performance trends & evaluations"
          icon={<BarChart3 className="text-blue-500" />}
        />

        <DashboardCard
          title="Fairness"
          subtitle="Bias & subgroup performance"
          icon={<ShieldCheck className="text-green-500" />}
        />

        <DashboardCard
          title="Model Drift"
          subtitle="Input/output stability insights"
          icon={<Activity className="text-red-500" />}
        />
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="
        bg-white dark:bg-gray-800 
        rounded-xl shadow-md dark:shadow-lg 
        p-6 cursor-pointer 
        hover:shadow-xl hover:dark:shadow-xl 
        transition-all
        border border-gray-200 dark:border-gray-700
      "
    >
      <div className="flex items-center gap-4">
        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
