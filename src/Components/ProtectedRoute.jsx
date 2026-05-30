import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const location = useLocation();

  // Read localStorage synchronously — no useState, no useEffect, no skeleton flash
  const token = localStorage.getItem('token');
  const storedRole = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || 'null');
      return (localStorage.getItem('role') || u?.role || '').toLowerCase().trim();
    } catch { return ''; }
  })();

  // No credentials → login
  if (!token || !storedRole) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin / staff can access everything
  if (storedRole === 'admin' || storedRole === 'reviewer' || storedRole === 'support') {
    return children;
  }

  if (!requiredRole) return children;

  const req = requiredRole.toLowerCase().trim();

  if (req === 'buyer') {
    if (storedRole === 'buyer' || storedRole === 'user') return children;
    if (storedRole === 'photographer') return <Navigate to="/photographer/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  if (req === 'photographer') {
    if (storedRole === 'photographer') return children;
    if (storedRole === 'buyer' || storedRole === 'user') return <Navigate to="/buyer/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  if (req === 'admin') {
    if (storedRole === 'photographer') return <Navigate to="/photographer/dashboard" replace />;
    if (storedRole === 'buyer' || storedRole === 'user') return <Navigate to="/buyer/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
