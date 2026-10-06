'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { LoadingState } from './LoadingState';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else if (allowedRoles && !allowedRoles.includes(role)) {
        router.push('/unauthorized');
      }
    }
  }, [isAuthenticated, isLoading, role, allowedRoles, router]);

  if (isLoading) {
    return <LoadingState message="Verifying authentication session..." />;
  }

  if (!isAuthenticated) {
    return <LoadingState message="Redirecting to sign in..." />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <LoadingState message="Checking role permissions..." />;
  }

  return <>{children}</>;
};
