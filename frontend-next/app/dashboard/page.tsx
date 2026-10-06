'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '../../components/common/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';
import { LoadingState } from '../../components/common/LoadingState';
import { getDashboardRouteForRole } from '../../lib/constants';

export default function CentralDashboardRedirectPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, role } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const targetRoute = getDashboardRouteForRole(role);
      router.replace(targetRoute);
    }
  }, [isAuthenticated, isLoading, role, router]);

  return (
    <ProtectedRoute>
      <LoadingState message="Redirecting to your role dashboard..." />
    </ProtectedRoute>
  );
}
