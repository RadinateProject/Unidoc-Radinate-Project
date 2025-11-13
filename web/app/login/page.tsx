'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = res;

      const token =
        data.access_token || data.token || data.accessToken || null;

      if (!token) {
        setError('Invalid credentials');
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError('User info missing from server response.');
        setLoading(false);
        return;
      }

      login(token, data.user);

      window.location.href = '/dashboard'; // SUCCESS redirect
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        min-h-screen flex items-center justify-center 
        bg-gray-100 dark:bg-gray-900 
        px-6
      "
    >
      <div
        className="
          bg-white dark:bg-gray-800 
          shadow-xl border border-gray-200 dark:border-gray-700 
          rounded-2xl p-8 w-full max-w-md
          animate-fadeIn
        "
      >
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <ShieldCheck className="w-14 h-14 text-blue-600 dark:text-blue-400" />
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-2">
          Radinate Login
        </h1>

        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
          Sign in using your authorized role
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email Field */}
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="
                w-full px-4 py-3 rounded-lg
                bg-gray-50 dark:bg-gray-700
                border border-gray-300 dark:border-gray-600
                text-gray-900 dark:text-gray-100
                focus:ring-2 focus:ring-blue-500 focus:outline-none
              "
            />
            <span
              className="
                absolute left-4 top-0 -translate-y-1/2 px-1
                bg-white dark:bg-gray-800 
                text-sm text-gray-500 dark:text-gray-400
              "
            >
              Email
            </span>
          </div>

          {/* Password Field */}
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="
                w-full px-4 py-3 rounded-lg
                bg-gray-50 dark:bg-gray-700
                border border-gray-300 dark:border-gray-600
                text-gray-900 dark:text-gray-100
                focus:ring-2 focus:ring-blue-500 focus:outline-none
              "
            />
            <span
              className="
                absolute left-4 top-0 -translate-y-1/2 px-1
                bg-white dark:bg-gray-800 
                text-sm text-gray-500 dark:text-gray-400
              "
            >
              Password
            </span>
          </div>

          {/* Error message */}
          {error && (
            <p className="text-red-600 dark:text-red-400 text-sm text-center">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`
              w-full flex items-center justify-center gap-2 
              py-3 rounded-lg text-white font-semibold
              transition-all
              ${loading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
              }
            `}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>

      {/* Animations */}
      <style>
        {`
          .animate-fadeIn {
            animation: fadeIn 0.45s ease-out;
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
