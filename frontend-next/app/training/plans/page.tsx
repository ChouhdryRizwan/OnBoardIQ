'use client';

import React from 'react';
import { ModulePlaceholderPage } from '../../../components/dashboard/ModulePlaceholderPage';

export default function TrainingPlansPage() {
  return (
    <ModulePlaceholderPage
      title="Training Plans Management"
      moduleName="Training Workspace"
      description="View and structure role-specific onboarding plans across company departments."
      allowedRoles={['admin', 'training_manager', 'hr_manager']}
      backLink="/training/dashboard"
    />
  );
}
