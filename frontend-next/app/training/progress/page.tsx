'use client';

import React from 'react';
import { ModulePlaceholderPage } from '../../../components/dashboard/ModulePlaceholderPage';

export default function TrainingProgressPage() {
  return (
    <ModulePlaceholderPage
      title="Learning Progress Tracking"
      moduleName="Training Workspace"
      description="Monitor trainee milestone completion rates, assessment pass scores, and weak-area alerts."
      allowedRoles={['admin', 'training_manager', 'hr_manager']}
      backLink="/training/dashboard"
    />
  );
}
