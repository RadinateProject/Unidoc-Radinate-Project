'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  email: string;
  role: { name: string };
  created_at: string;
}

export default function UsersPage() {
  const { token, user } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    try {
      const [rolesRes, usersRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/rbac/roles`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/rbac/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const rolesData = await rolesRes.json();
      const usersData = await usersRes.json();

      setRoles(rolesData.roles || []);
      setUsers(usersData.users || []);
    } catch (err) {
      console.error('Error fetching RBAC data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchData();
  }, [token]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !roleId) {
      setMessage('Email and role are required.');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rbac/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, role_id: roleId }),
      });

      const data = await res.json();

      if (data.success) {
        setEmail('');
        setRoleId(null);
        setMessage('✅ User created successfully!');
        fetchData();
      } else {
        setMessage(data.message || 'Error creating user');
      }
    } catch (err) {
      console.error(err);
      setMessage('Error creating user.');
    }
  };

  if (loading)
    return (
      <p className="p-6 text-gray-500 dark:text-gray-300">Loading...</p>
    );

  if (user?.role?.toLowerCase() !== 'cmio') {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 dark:text-red-400 font-semibold">
        Access denied. Only CMIO can manage users.
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['CMIO']}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors py-10 px-6">

        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors">

          {/* Header */}
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            👥 User Management
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Add, view, and manage system users and their roles.
          </p>

          {/* CREATE USER FORM */}
          <form
            onSubmit={handleCreateUser}
            className="flex flex-col md:flex-row gap-4 items-center mb-8"
          >
            <input
              type="email"
              placeholder="User Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
                border border-gray-300 dark:border-gray-600 
                bg-white dark:bg-gray-700 
                text-gray-800 dark:text-gray-200 
                rounded-lg px-4 py-2 w-full md:w-1/2 
                focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                transition-colors
              "
            />

            <select
              value={roleId || ''}
              onChange={(e) => setRoleId(Number(e.target.value))}
              className="
                border border-gray-300 dark:border-gray-600 
                bg-white dark:bg-gray-700 
                text-gray-800 dark:text-gray-200 
                rounded-lg px-3 py-2 w-full md:w-1/3 
                focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                transition-colors
              "
            >
              <option value="">Select Role</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="
                bg-blue-600 dark:bg-blue-700 
                text-white px-5 py-2 rounded-lg 
                hover:bg-blue-700 dark:hover:bg-blue-600 
                transition-all shadow-sm
              "
            >
              Add User
            </button>
          </form>

          {message && (
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{message}</p>
          )}

          {/* USERS TABLE */}
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700 text-left text-gray-700 dark:text-gray-200 uppercase text-sm">
                  <th className="p-3">UserID</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Created</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="
                      border-t border-gray-200 dark:border-gray-700 
                      hover:bg-gray-50 dark:hover:bg-gray-800 
                      transition-all
                    "
                  >
                    <td className="p-3 text-gray-800 dark:text-gray-200">{u.id}</td>
                    <td className="p-3 capitalize text-gray-700 dark:text-gray-300">{u.role?.name}</td>
                    <td className="p-3 text-gray-500 dark:text-gray-400 text-sm">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
