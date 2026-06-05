import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../api/apiConfig';

const ProtectedRoute = ({ children, requiredRole }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const storedRole = localStorage.getItem('role');

        // No token or user data
        if (!token || !storedUser) {
          console.warn('[ProtectedRoute] No token/user found');
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Parse stored user
        let parsedUser;
        try {
          parsedUser = JSON.parse(storedUser);
        } catch (e) {
          console.error('[ProtectedRoute] Failed to parse stored user');
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Try to verify with backend (optional - falls back to localStorage on error)
        let backendVerified = false;
        let userData = null;
        
        try {
          const response = await axios.get(
            `${API_BASE_URL}/auth/users/me`,
            {
              headers: { Authorization: `Bearer ${token}` },
              timeout: 5000
            }
          );
          
          if (response.data && response.data.id) {
            userData = response.data;
            backendVerified = true;
            console.log('[ProtectedRoute] ✅ Backend verification successful:', { 
              userId: userData.id, 
              role: userData.role 
            });
          }
        } catch (backendError) {
          // Handle different backend errors silently - use localStorage fallback
          if (backendError.response?.status === 500) {
            console.warn('[ProtectedRoute] ⚠️ Backend 500 error - using localStorage fallback');
            setAuthError('Backend server issue, using cached authentication');
          } else if (backendError.code === 'ECONNABORTED') {
            console.warn('[ProtectedRoute] ⚠️ Backend timeout - using localStorage fallback');
          } else {
            console.warn('[ProtectedRoute] ⚠️ Backend verification failed - using localStorage fallback');
          }
          
          // Use localStorage data as fallback
          userData = parsedUser;
        }

        // Determine role from either backend or localStorage
        const actualRole = userData?.role || storedRole || 'user';
        
        // Normalize role
        const normalizedRole = String(actualRole).toLowerCase().trim();
        
        console.log('[ProtectedRoute] User authenticated, role:', normalizedRole);
        
        // Update localStorage with fresh data if backend verification succeeded
        if (backendVerified && userData) {
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('role', normalizedRole);
        }
        
        setIsAuthenticated(true);
        setUserRole(normalizedRole);
        
      } catch (error) {
        console.error('[ProtectedRoute] Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [location.pathname]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark">
        <div className="text-center">
          <div className="spinner-border text-warning mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 className="text-white">Checking authentication...</h4>
          {authError && (
            <p className="text-white-50 small mt-2">{authError}</p>
          )}
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('[ProtectedRoute] Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Normalize role for matching
  const roleLower = String(userRole).toLowerCase().trim();

  // Helper to get the home route for a given role
  const homeRouteForRole = (role) => {
    if (role === 'admin' || role.includes('admin')) return '/admin/dashboard';
    if (role === 'reviewer' || role === 'support') return '/admin/dashboard';
    if (role === 'secretary') return '/secretary/dashboard';
    if (role === 'engineer') return '/engineer/dashboard';
    if (role === 'marketing') return '/marketing/dashboard';
    if (role === 'photographer' || role.includes('photographer')) return '/photographer/dashboard';
    if (role === 'buyer' || role === 'user') return '/buyer/dashboard';
    return '/login';
  };

  // Protect role-specific routes explicitly
  if (requiredRole) {
    const requiredRoleLower = String(requiredRole).toLowerCase().trim();

    // Exact role match — grant access
    if (roleLower === requiredRoleLower) {
      return children;
    }

    // Admin / superuser can access everything
    if (roleLower === 'admin' || roleLower.includes('admin')) {
      return children;
    }

    // Role aliases
    if (requiredRoleLower === 'photographer' && roleLower.includes('photographer')) return children;
    if (requiredRoleLower === 'admin' && (roleLower === 'reviewer' || roleLower === 'support')) return children;

    // Wrong role — redirect to their own dashboard
    console.log(`[ProtectedRoute] Role mismatch: has "${roleLower}", needs "${requiredRoleLower}" — redirecting`);
    return <Navigate to={homeRouteForRole(roleLower)} replace />;
  }

  // If no requiredRole is provided, allow any authenticated user
  console.log('[ProtectedRoute] General access granted for role:', roleLower);
  return children;
};

export default ProtectedRoute;