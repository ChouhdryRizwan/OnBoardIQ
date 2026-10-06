'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ErrorMessage } from './ErrorMessage';

export interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children, fallback }) => {
  const { role } = useAuth();

  if (!allowedRoles.includes(role)) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="p-8 max-w-lg mx-auto">
        <ErrorMessage
          title="Access Restricted"
          message={`Your current role (${role}) does not have permission to access this component.`}
        />
      </div>
    );
  }

  return <>{children}</>;
};
