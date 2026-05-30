import React from 'react';
import { Navigate } from 'react-router-dom';

const AuthCallback = () => {
  // Read directly from window.location — bypasses any React Router parsing quirks
  const params    = new URLSearchParams(window.location.search);
  const token     = params.get('token');
  const userParam = params.get('user');
  const error     = params.get('error');

  if (error || !token || !userParam) {
    return <Navigate to="/login?error=auth_failed" replace />;
  }

  try {
    const user     = JSON.parse(userParam);
    const roleLower = String(user.role || 'user').toLowerCase().trim();

    localStorage.setItem('token', token);
    localStorage.setItem('user',  JSON.stringify(user));
    localStorage.setItem('role',  user.role || 'user');

    if (roleLower === 'admin' || roleLower === 'reviewer' || roleLower === 'support') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (roleLower.includes('photographer')) {
      return <Navigate to="/photographer/dashboard" replace />;
    }
    return <Navigate to="/buyer/dashboard" replace />;

  } catch (e) {
    console.error('AuthCallback parse error:', e);
    return <Navigate to="/login?error=auth_failed" replace />;
  }
};

export default AuthCallback;
