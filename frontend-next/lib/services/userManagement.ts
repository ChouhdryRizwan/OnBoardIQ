import { api } from '../api';

export interface UserManagementItem {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  employee_id?: string | null;
  employee_code?: string | null;
  job_role_id?: string | null;
  role_code?: string | null;
  role_title?: string | null;
  department?: string | null;
  location?: string | null;
  experience_level?: string | null;
  joining_date?: string | null;
}

export interface UserKPIStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  total_employees: number;
  admin_count: number;
  training_manager_count: number;
  reviewer_count: number;
  manager_count: number;
  employee_count: number;
}

export interface CreateUserPayload {
  email: string;
  full_name: string;
  role: string;
  is_active?: boolean;
  password?: string;
  department?: string;
  role_identifier?: string;
  location?: string;
}

export interface UpdateUserPayload {
  full_name?: string;
  email?: string;
  role?: string;
  is_active?: boolean;
  department?: string;
  role_identifier?: string;
  location?: string;
}

export interface UserFilterParams {
  role?: string;
  is_active?: boolean;
  search?: string;
}

export async function fetchUserStats(): Promise<UserKPIStats> {
  return await api.get<UserKPIStats>('/api/users/stats');
}

export async function fetchUsers(filters?: UserFilterParams): Promise<UserManagementItem[]> {
  const params = new URLSearchParams();
  if (filters?.role && filters.role !== 'all') {
    params.set('role', filters.role);
  }
  if (filters?.is_active !== undefined) {
    params.set('is_active', String(filters.is_active));
  }
  if (filters?.search && filters.search.trim()) {
    params.set('search', filters.search.trim());
  }

  const query = params.toString();
  const endpoint = query ? `/api/users?${query}` : '/api/users';
  return await api.get<UserManagementItem[]>(endpoint);
}

export async function fetchUserDetails(userId: string): Promise<UserManagementItem> {
  return await api.get<UserManagementItem>(`/api/users/${encodeURIComponent(userId)}`);
}

export async function createUser(payload: CreateUserPayload): Promise<UserManagementItem> {
  return await api.post<UserManagementItem>('/api/users', payload);
}

export async function updateUser(userId: string, payload: UpdateUserPayload): Promise<UserManagementItem> {
  return await api.put<UserManagementItem>(`/api/users/${encodeURIComponent(userId)}`, payload);
}

export async function toggleUserStatus(userId: string, is_active: boolean): Promise<UserManagementItem> {
  return await api.patch<UserManagementItem>(`/api/users/${encodeURIComponent(userId)}/status`, { is_active });
}

export async function updateUserRole(userId: string, role: string): Promise<UserManagementItem> {
  return await api.patch<UserManagementItem>(`/api/users/${encodeURIComponent(userId)}/role`, { role });
}
