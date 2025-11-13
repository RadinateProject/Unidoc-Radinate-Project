import { FairnessMetric } from '@/api/fairness';
import { Card } from '@/components/ui/Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const FairnessTable: React.FC<{ data: FairnessMetric[] }> = ({ data }) => {
  if (!data.length)
    return <p className="text-gray-500 dark:text-gray-400">No fairness data available.</p>;

const deltaBadge = (delta: number) => {
  const base =
    "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-md border";

  if (delta > 0.05)
    return (
      <span
        className={`${base}
          bg-green-50 text-green-700 border-green-300
          dark:bg-green-900/40 dark:text-green-300 dark:border-green-700`}
      >
        <TrendingUp size={12} /> +{delta.toFixed(2)}
      </span>
    );

  if (delta < -0.05)
    return (
      <span
        className={`${base}
          bg-red-50 text-red-700 border-red-300
          dark:bg-red-900/40 dark:text-red-300 dark:border-red-700`}
      >
        <TrendingDown size={12} /> {delta.toFixed(2)}
      </span>
    );

  return (
    <span
      className={`${base}
        bg-gray-100 text-gray-700 border-gray-300
        dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600`}
    >
      <Minus size={12} /> {delta.toFixed(2)}
    </span>
  );
};
const metricBadge = (value: number) => (
  <span
    className="px-2 py-0.5 rounded-md text-xs font-semibold font-mono
      bg-blue-50 text-blue-700 border border-blue-200
      dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
  >
    {value.toFixed(2)}
  </span>
);

  return (
    <Card className="p-0 overflow-hidden 
      bg-white dark:bg-gray-900 
      border border-gray-200 dark:border-gray-700">

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          
          {/* HEADER */}
          <thead>
            <tr className="text-left text-gray-600 dark:text-gray-300
              bg-gray-100 dark:bg-gray-800 border-b dark:border-gray-700">
              <th className="py-3 px-4">Subgroup</th>
              <th className="py-3 px-4">Precision</th>
              <th className="py-3 px-4">Recall</th>
              <th className="py-3 px-4">F1 Score</th>
              <th className="py-3 px-4">Δ vs Overall</th>
              <th className="py-3 px-4">Window</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {data.map((row) => (
              <tr
                key={row.id}
                className="border-b dark:border-gray-700
                  bg-white dark:bg-gray-900
                  hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-100">
                  {row.subgroup}
                </td>

                <td className="px-4">{metricBadge(row.precision)}</td>
                <td className="px-4">{metricBadge(row.recall)}</td>
                <td className="px-4">{metricBadge(row.f1_score)}</td>

                <td className="px-4">{deltaBadge(row.delta)}</td>

                <td className="px-4 text-gray-700 dark:text-gray-300">
                  {row.window}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </Card>
  );
};

// import { FairnessMetric } from '@/api/fairness';
// import { Card } from '@/components/ui/Card';
// import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// export const FairnessTable: React.FC<{ data: FairnessMetric[] }> = ({ data }) => {
//   if (!data.length)
//     return <p className="text-gray-500 dark:text-gray-400">No fairness data available.</p>;

//   const deltaBadge = (delta: number) => {
//     if (delta > 0.05)
//       return (
//         <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700">
//           <TrendingUp size={12} /> +{delta.toFixed(2)}
//         </span>
//       );

//     if (delta < -0.05)
//       return (
//         <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700">
//           <TrendingDown size={12} /> {delta.toFixed(2)}
//         </span>
//       );

//     return (
//       <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
//         <Minus size={12} /> {delta.toFixed(2)}
//       </span>
//     );
//   };

  // const metricBadge = (value: number) => (
  //   <span className="px-2 py-1 rounded-md font-semibold text-xs 
  //     bg-blue-50 text-blue-700 border border-blue-200
  //     dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800">
  //     {value.toFixed(2)}
  //   </span>
  // );


//   return (
//     <Card className="p-0 overflow-hidden border border-gray-200 dark:border-gray-700">
//       <div className="overflow-x-auto">
//         <table className="w-full text-sm">
//           <thead>
//             <tr className="text-left text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border-b dark:border-gray-700">
//               <th className="py-3 px-4">Subgroup</th>
//               <th className="py-3 px-4">Precision</th>
//               <th className="py-3 px-4">Recall</th>
//               <th className="py-3 px-4">F1 Score</th>
//               <th className="py-3 px-4">Δ vs Overall</th>
//               <th className="py-3 px-4">Window</th>
//             </tr>
//           </thead>

//           <tbody>
//             {data.map((row) => (
//               <tr
//                 key={row.id}
//                 className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
//               >
//                 <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-100">
//                   {row.subgroup}
//                 </td>

//                 <td className="px-4">{metricBadge(row.precision)}</td>
//                 <td className="px-4">{metricBadge(row.recall)}</td>
//                 <td className="px-4">{metricBadge(row.f1_score)}</td>

//                 <td className="px-4">{deltaBadge(row.delta)}</td>

//                 <td className="px-4 text-gray-700 dark:text-gray-300">{row.window}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </Card>
//   );
// };
