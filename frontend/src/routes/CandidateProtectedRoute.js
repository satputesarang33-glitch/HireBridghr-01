import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

export function CandidateProtectedRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/candidate/login" state={{ from: location }} replace />;
  }

  // If an organization user tries to access candidate-only pages:
  // Redirect them to their correct employee dashboard.
  if (user.role !== 'CANDIDATE') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
