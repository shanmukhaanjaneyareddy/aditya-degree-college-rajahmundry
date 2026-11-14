import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

export default function AdminPortal() {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-aditya-navy flex items-center justify-center text-white font-semibold">
        Loading Admin Control Portal...
      </div>
    );
  }

  return isAdmin ? <AdminDashboard /> : <AdminLogin />;
}