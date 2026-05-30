import React, { useEffect, useRef, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../api/apiConfig';
import DashboardSkeleton from './DashboardSkeleton';

// Cache the auth result for the lifetime of the browser session —
// avoids re-hitting the backend (and re-showing the skeleton) on every navigation.
let sessionAuth = null; // { role, verified } | null

const ProtectedRoute = ({ children, requiredRole }) => {
  const location  = useLocation();
  const verifying = useRef(false);

  // Read localStorage immediately — no async needed for local data
  const token      = localStorage.getItem('token');
  const storedUser = (() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } })();
  const storedRole = localStorage.getItem('role') || storedUser?.role || '';

  // If sessionAuth is already set, skip loading entirely
  const [auth, setAuth] = useState(sessionAuth);

  useEffect(() => {
    // Already verified this session — nothing to do
    if (sessionAuth) { setAuth(sessionAuth); return; }
    // No local credentials — mark as unauthenticated immediately
    if (!token || !storedUser) { setAuth({ role: null }); return; }
    // Already verifying in flight — skip duplicate
    if (verifying.current) return;

    // We have local credentials: show the dashboard immediately using localStorage data
    // then silently verify with backend in background
    const localRole = String(storedRole).toLowerCase().trim();
    sessionAuth = { role: localRole };
    setAuth(sessionAuth);

    // Background verification (doesn't block rendering)
    verifying.current = true;
    axios.get(`${API_BASE_URL}/auth/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000,
    }).then(res => {
      const backendRole = String(res.data?.role || localRole).toLowerCase().trim();
      sessionAuth = { role: backendRole };
      localStorage.setItem('role', backendRole);
      if (res.data) localStorage.setItem('user', JSON.stringify(res.data));
    }).catch(() => {
      // Backend unreachable — keep using localStorage role, that's fine
    }).finally(() => { verifying.current = false; });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Only show skeleton on the very first load when nothing is cached yet
  if (auth === null) return <DashboardSkeleton />;

  // Not authenticated
  if (!auth.role) return <Navigate to="/login" state={{ from: location }} replace />;

  const roleLower = auth.role;

  if (!requiredRole) return children;

  const req = String(requiredRole).toLowerCase().trim();

  // Admin / staff can access everything
  if (roleLower === 'admin' || roleLower === 'reviewer' || roleLower === 'support') return children;

  if (req === 'photographer') {
    if (roleLower === 'photographer') return children;
    return <Navigate to="/buyer/dashboard" replace />;
  }

  if (req === 'buyer') {
    if (roleLower === 'buyer' || roleLower === 'user') return children;
    if (roleLower === 'photographer') return <Navigate to="/photographer/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  if (req === 'admin') {
    if (roleLower === 'photographer') return <Navigate to="/photographer/dashboard" replace />;
    if (roleLower === 'buyer' || roleLower === 'user') return <Navigate to="/buyer/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
