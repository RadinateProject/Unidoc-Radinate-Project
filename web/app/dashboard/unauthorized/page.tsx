'use client';

import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="
      min-h-screen flex items-center justify-center 
      bg-gray-100 dark:bg-gray-900 
      px-6
    ">
      <div className="
        bg-white dark:bg-gray-800 
        shadow-xl rounded-2xl 
        p-10 max-w-md w-full text-center
        border border-gray-200 dark:border-gray-700
        animate-fadeIn
      ">
        
        {/* Animated Icon */}
        <div className="flex justify-center mb-4">
          <ShieldAlert 
            className="text-red-500 dark:text-red-400 w-14 h-14 animate-bounce-slow" 
          />
        </div>

        <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-3">
          Access Denied
        </h1>

        <p className="text-gray-600 dark:text-gray-300 mb-8">
          You do not have the required permissions to view this page.
        </p>

        {/* Back Button */}
        <Link
          href="/dashboard"
          className="
            inline-flex items-center gap-2
            px-5 py-2 rounded-lg 
            bg-blue-600 hover:bg-blue-700 
            text-white font-medium 
            transition-colors
            dark:bg-blue-700 dark:hover:bg-blue-800
          "
        >
          <ArrowLeft size={18} /> Go Back
        </Link>
      </div>

      {/* Tailwind animations */}
      <style>
        {`
          .animate-bounce-slow {
            animation: bounce 2s infinite;
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }

          .animate-fadeIn {
            animation: fadeIn 0.5s ease-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}
