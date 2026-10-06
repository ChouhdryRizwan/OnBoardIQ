import { UserRole } from '../types';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const APP_NAME = 'OnBoardIQ';
export const APP_TAGLINE = 'Dual-Pipeline Onboarding & Verification Engine';

export const USER_ROLES = [
  { id: 'admin', label: 'Administrator', description: 'Full system configuration, document management & reporting access' },
  { id: 'training_manager', label: 'Training Manager', description: 'Manage training programs, RRM matrices, and plan generation' },
  { id: 'reviewer', label: 'Human Reviewer', description: 'Review, edit, and approve onboarding plans in manual review queue' },
  { id: 'manager', label: 'People Manager', description: 'Read-only progress tracking for direct report employees' },
  { id: 'employee', label: 'Employee', description: 'Personal learning dashboard, quizzes, and progress completion' },
] as const;

export const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Features', href: '/features' },
];

export const ROLE_DASHBOARD_ROUTES: Record<UserRole, string> = {
  admin: '/admin/dashboard',
  training_manager: '/training/dashboard',
  reviewer: '/reviewer/dashboard',
  manager: '/manager/dashboard',
  employee: '/employee/dashboard',
  compliance_manager: '/reviewer/dashboard',
  hr_manager: '/training/dashboard',
};

export const getDashboardRouteForRole = (role?: UserRole): string => {
  if (!role) return '/employee/dashboard';
  return ROLE_DASHBOARD_ROUTES[role] || '/employee/dashboard';
};
