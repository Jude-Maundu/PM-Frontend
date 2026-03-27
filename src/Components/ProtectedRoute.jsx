import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const user = localStorage.getItem('user');

        if (!token || !user) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        setIsAuthenticated(true);
        setUserRole(role || 'user');
        setIsLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark">
        <div className="text-center">
          <div className="spinner-border text-warning mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 className="text-white">Checking authentication...</h4>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Normalize role for matching
  const roleLower = String(userRole).toLowerCase().trim();

  // Protect role-specific routes explicitly
  if (requiredRole) {
    const requiredRoleLower = String(requiredRole).toLowerCase().trim();

    // Allow admin access to everything
    if (roleLower.includes('admin')) {
      return children;
    }

    if (requiredRoleLower === 'photographer') {
      if (roleLower.includes('photographer')) {
        return children;
      }
      if (roleLower.includes('user') || roleLower.includes('buyer')) {
        return <Navigate to="/buyer/dashboard" replace />;
      }
      return <Navigate to="/login" replace />;
    }

    if (requiredRoleLower === 'buyer') {
      if (roleLower.includes('user') || roleLower.includes('buyer')) {
        return children;
      }
      if (roleLower.includes('photographer')) {
        return <Navigate to="/photographer/dashboard" replace />;
      }
      return <Navigate to="/login" replace />;
    }

    if (requiredRoleLower === 'admin') {
      if (roleLower.includes('admin')) {
        return children;
      }
      if (roleLower.includes('photographer')) {
        return <Navigate to="/photographer/dashboard" replace />;
      }
      if (roleLower.includes('user') || roleLower.includes('buyer')) {
        return <Navigate to="/buyer/dashboard" replace />;
      }
      return <Navigate to="/login" replace />;
    }
  }

  // If no requiredRole is provided, allow any authenticated user
  return children;
};

export default ProtectedRoute;