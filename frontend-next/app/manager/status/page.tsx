'use client';

import React from 'react';
import { ModulePlaceholderPage } from '../../../components/dashboard/ModulePlaceholderPage';

export default function ManagerStatusPage() {
  return (
    <ModulePlaceholderPage
      title="Team Training Status & Compliance"
      moduleName="Manager Workspace"
      description="Monitor mandatory training status, upcoming deadlines, and assessment retake alerts for team members."
      allowedRoles={['admin', 'manager']}
      backLink="/manager/dashboard"
    />
  );
}
