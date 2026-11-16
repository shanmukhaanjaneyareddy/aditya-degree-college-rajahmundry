import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

export default function AdminPortal() {
  const { isAdmin, loading, sessionExpiredRedirect, clearRedirectFlag } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin && sessionExpiredRedirect) {
      clearRedirectFlag();
      navigate('/', { replace: true });
    }
  }, [loading, isAdmin, sessionExpiredRedirect, clearRedirectFlag, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-aditya-navy flex items-center justify-center text-white font-semibold">
        Loading Admin Control Portal...
      </div>
    );
  }

  return isAdmin ? <AdminDashboard /> : <AdminLogin />;
}