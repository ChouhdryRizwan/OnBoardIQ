'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AppLayout } from '@/components/dashboard/AppLayout';
import { DashboardPageContainer } from '@/components/dashboard/DashboardPageContainer';
import {
  fetchUserStats,
  fetchUsers,
  createUser,
  updateUser,
  toggleUserStatus,
  UserManagementItem,
  UserKPIStats,
  UserFilterParams,
  CreateUserPayload,
  UpdateUserPayload,
} from '@/lib/services/userManagement';
import { UserStatsCards } from '@/components/userManagement/UserStatsCards';
import { UserToolbar } from '@/components/userManagement/UserToolbar';
import { UserTable } from '@/components/userManagement/UserTable';
import { UserModal } from '@/components/userManagement/UserModal';
import { UserDetailModal } from '@/components/userManagement/UserDetailModal';
import { Users, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdminUserManagementPage() {
  const [stats, setStats] = useState<UserKPIStats | null>(null);
  const [users, setUsers] = useState<UserManagementItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filters
  const [filters, setFilters] = useState<UserFilterParams>({
    role: 'all',
    search: '',
  });

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [userToEdit, setUserToEdit] = useState<UserManagementItem | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserManagementItem | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      setStatsLoading(true);
      const [statsData, usersData] = await Promise.all([
        fetchUserStats(),
        fetchUsers(filters),
      ]);
      setStats(statsData);
      setUsers(usersData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch users';
      setError(msg);
      showToast('error', msg);
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [statsData, usersData] = await Promise.all([
          fetchUserStats(),
          fetchUsers(filters),
        ]);
        if (isMounted) {
          setStats(statsData);
          setUsers(usersData);
          setError(null);
          setLoading(false);
          setStatsLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Failed to fetch users';
          setError(msg);
          setLoading(false);
          setStatsLoading(false);
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [filters]);

  const handleSearchChange = (query: string) => {
    setFilters((prev) => ({ ...prev, search: query }));
  };

  const handleRoleChange = (role: string) => {
    setFilters((prev) => ({ ...prev, role }));
  };

  const handleStatusChange = (status: string) => {
    let isActiveValue: boolean | undefined = undefined;
    if (status === 'active') isActiveValue = true;
    if (status === 'inactive') isActiveValue = false;
    setFilters((prev) => ({ ...prev, is_active: isActiveValue }));
  };

  const handleRefresh = () => {
    refreshData();
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setUserToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: UserManagementItem) => {
    setModalMode('edit');
    setUserToEdit(user);
    setIsModalOpen(true);
  };

  const handleOpenDetails = (user: UserManagementItem) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
  };

  const handleToggleStatus = async (user: UserManagementItem) => {
    try {
      const updated = await toggleUserStatus(user.user_id, !user.is_active);
      setUsers((prev) =>
        prev.map((u) => (u.user_id === user.user_id ? { ...u, is_active: updated.is_active } : u))
      );
      refreshData();
      showToast(
        'success',
        `User ${user.full_name} is now ${updated.is_active ? 'active' : 'suspended'}.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to toggle status';
      showToast('error', msg);
    }
  };

  const handleFormSubmit = async (payload: CreateUserPayload | UpdateUserPayload) => {
    if (modalMode === 'create') {
      await createUser(payload as CreateUserPayload);
      showToast('success', `User ${(payload as CreateUserPayload).full_name} created successfully.`);
    } else if (userToEdit) {
      await updateUser(userToEdit.user_id, payload as UpdateUserPayload);
      showToast('success', `User updated successfully.`);
    }
    refreshData();
  };

  return (
    <AppLayout allowedRoles={['admin']}>
      <DashboardPageContainer>
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-950/80 text-purple-300 border border-purple-800/60 uppercase tracking-wide">
                  Admin System Control
                </span>
                <span className="text-xs text-slate-500">Security & RBAC</span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2.5">
                <Users className="w-6 h-6 text-teal-400" />
                User Management & Access Control
              </h1>
              <p className="text-xs md:text-sm text-slate-400 mt-1">
                Manage system users, dynamic role permissions, and linked employee profiles across the organization.
              </p>
            </div>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div
              className={`flex items-center gap-2 p-3 rounded-xl border text-xs transition-all ${
                toastMessage.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                  : 'bg-red-950/60 border-red-800 text-red-200'
              }`}
            >
              {toastMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{toastMessage.text}</span>
            </div>
          )}

          {/* KPI Statistics */}
          <UserStatsCards stats={stats} loading={statsLoading} />

          {/* Search, Filter Toolbar & Action Controls */}
          <UserToolbar
            search={filters.search || ''}
            onSearchChange={handleSearchChange}
            selectedRole={filters.role || 'all'}
            onRoleChange={handleRoleChange}
            selectedStatus={
              filters.is_active === undefined ? 'all' : filters.is_active ? 'active' : 'inactive'
            }
            onStatusChange={handleStatusChange}
            onOpenCreateModal={handleOpenCreateModal}
            onRefresh={handleRefresh}
            loading={loading}
          />

          {/* Error Banner */}
          {error && (
            <div className="p-4 bg-red-950/40 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>Failed to load users: {error}</span>
            </div>
          )}

          {/* User Table */}
          <UserTable
            users={users}
            loading={loading}
            onViewDetails={handleOpenDetails}
            onEditUser={handleOpenEditModal}
            onToggleStatus={handleToggleStatus}
          />

          {/* Modals */}
          <UserModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleFormSubmit}
            userToEdit={userToEdit}
            mode={modalMode}
          />

          <UserDetailModal
            isOpen={isDetailOpen}
            onClose={() => setIsDetailOpen(false)}
            user={selectedUser}
          />
        </div>
      </DashboardPageContainer>
    </AppLayout>
  );
}
