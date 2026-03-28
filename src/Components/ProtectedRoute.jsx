import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../api/apiConfig';

const ProtectedRoute = ({ children, requiredRole }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        // No token or user data
        if (!token || !storedUser) {
          console.warn('[ProtectedRoute] No token/user found');
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Try to verify token with backend
        try {
          const response = await axios.get(
            `${API_BASE_URL}/auth/users/me`,
            {
              headers: { Authorization: `Bearer ${token}` },
              timeout: 5000
            }
          );

          const user = response.data;
          const actualRole = user.role || 'user';

          console.log('[ProtectedRoute] Backend verification:', { userId: user.id, role: actualRole });

          // Update localStorage with fresh data from backend
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('role', actualRole);

          setIsAuthenticated(true);
          setUserRole(actualRole);
        } catch (backendError) {
          // Backend verification failed - fall back to localStorage
          console.warn('[ProtectedRoute] Backend verification failed, using localStorage:', backendError.message);
          
          try {
            const storedUserObj = JSON.parse(storedUser);
            const storedRole = storedUserObj.role || localStorage.getItem('role') || 'user';
            
            setIsAuthenticated(true);
            setUserRole(storedRole);
          } catch {
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('[ProtectedRoute] Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [location.pathname]); // Re-verify when route changes

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