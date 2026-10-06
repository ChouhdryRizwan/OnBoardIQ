'use client';

import React from 'react';
import { ModulePlaceholderPage } from '../../../components/dashboard/ModulePlaceholderPage';

export default function EmployeeProfilePage() {
  return (
    <ModulePlaceholderPage
      title="My Profile & Role Account Details"
      moduleName="Employee Workspace"
      description="View your active user account, assigned job role code, department, and completion certificates."
      allowedRoles={['admin', 'employee']}
      backLink="/employee/dashboard"
    />
  );
}
