import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');
    const error = searchParams.get('error');

    if (error) {
      window.location.href = '/login?error=auth_failed';
      return;
    }

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('role', user.role);

        const roleLower = String(user.role).toLowerCase().trim();
        if (roleLower === 'admin' || roleLower.includes('admin') || roleLower === 'reviewer' || roleLower === 'support') {
          window.location.href = '/admin/dashboard';
        } else if (roleLower === 'secretary') {
          window.location.href = '/secretary/dashboard';
        } else if (roleLower === 'engineer') {
          window.location.href = '/engineer/dashboard';
        } else if (roleLower === 'marketing') {
          window.location.href = '/marketing/dashboard';
        } else if (roleLower === 'photographer' || roleLower.includes('photographer')) {
          window.location.href = '/photographer/dashboard';
        } else {
          window.location.href = '/buyer/dashboard';
        }
      } catch (e) {
        console.error('AuthCallback: failed to parse user data', e);
        window.location.href = '/login?error=auth_failed';
      }
    } else {
      window.location.href = '/login?error=auth_failed';
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
    >
      <div className="text-center">
        <div className="spinner-border text-light mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <h4 className="text-white mb-2">Completing Sign In</h4>
        <p className="text-white-50">Please wait while we set up your account...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
