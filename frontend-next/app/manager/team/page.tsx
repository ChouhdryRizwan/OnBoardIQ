'use client';

import React from 'react';
import { ModulePlaceholderPage } from '../../../components/dashboard/ModulePlaceholderPage';

export default function ManagerTeamPage() {
  return (
    <ModulePlaceholderPage
      title="My Team Onboarding Progress"
      moduleName="Manager Workspace"
      description="Track direct report employee onboarding milestone completion rates and quiz pass scores."
      allowedRoles={['admin', 'manager']}
      backLink="/manager/dashboard"
    />
  );
}
