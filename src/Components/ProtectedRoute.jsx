import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const location = useLocation();

  const token = localStorage.getItem('token');
  const role  = (() => {
    try {
      const r = localStorage.getItem('role');
      if (r) return r.toLowerCase().trim();
      const u = JSON.parse(localStorage.getItem('user') || 'null');
      return (u?.role || '').toLowerCase().trim();
    } catch { return ''; }
  })();

  if (!token || !role) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin / staff can access everything
  if (role === 'admin' || role === 'reviewer' || role === 'support') {
    return children;
  }

  if (!requiredRole) return children;

  const req = requiredRole.toLowerCase();

  if (req === 'buyer') {
    if (role === 'buyer' || role === 'user') return children;
    if (role === 'photographer') return <Navigate to="/photographer/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  if (req === 'photographer') {
    if (role === 'photographer') return children;
    return <Navigate to="/buyer/dashboard" replace />;
  }

  if (req === 'admin') {
    if (role === 'photographer') return <Navigate to="/photographer/dashboard" replace />;
    return <Navigate to="/buyer/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
