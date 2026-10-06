'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, User } from '../types';
import {
  getStoredRole,
  setStoredRole,
  getStoredUser,
  setStoredUser,
  getStoredToken,
  setStoredToken,
  clearStoredAuth,
} from '../lib/auth';
import { api, ApiError } from '../lib/api';

export interface SignupRequestData {
  name: string;
  email: string;
  password?: string;
  department?: string;
  roleIdentifier?: string;
  location?: string;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  login: (email: string, password?: string) => Promise<User>;
  loginAsEmployee: (employee: {
    employee_id: string;
    employee_code?: string;
    user_id?: string | null;
    name: string;
    email: string;
    department?: string;
    role_title?: string;
    role_code?: string;
  }) => Promise<User>;
  signup: (data: SignupRequestData) => Promise<User>;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [role, setRoleState] = useState<UserRole>('employee');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const fetchCurrentUser = async () => {
    const storedUser = getStoredUser();
    if (storedUser) {
      try {
        const employees = await api.get<Array<{ employee_id: string; name: string; email: string; department: string }>>(
          '/api/employees'
        );
        const match = employees.find((e) => e.email.toLowerCase() === storedUser.email.toLowerCase());
        if (match) {
          const updatedUser: User = {
            ...storedUser,
            full_name: match.name,
            name: match.name,
            department: match.department,
          };
          setUserState(updatedUser);
          setStoredUser(updatedUser);
        }
      } catch {
        // Retain session offline fallback
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function initAuth() {
      const storedUser = getStoredUser();
      const storedToken = getStoredToken();
      const storedRole = getStoredRole();

      if (storedUser || storedToken) {
        if (isMounted) {
          setUserState(storedUser);
          setRoleState(storedRole);
          setIsAuthenticated(!!storedUser || !!storedToken);
        }

        try {
          const employees = await api.get<Array<{ employee_id: string; name: string; email: string; department: string }>>(
            '/api/employees'
          );
          if (storedUser) {
            const match = employees.find((e) => e.email.toLowerCase() === storedUser.email.toLowerCase());
            if (match && isMounted) {
              const updatedUser: User = {
                ...storedUser,
                full_name: match.name,
                name: match.name,
                department: match.department,
              };
              setUserState(updatedUser);
              setStoredUser(updatedUser);
            }
          }
        } catch {
          // Retain session
        }
      }

      if (isMounted) {
        setIsLoading(false);
      }
    }

    initAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const loginAsEmployee = async (employee: {
    employee_id: string;
    employee_code?: string;
    user_id?: string | null;
    name: string;
    email: string;
    department?: string;
    role_title?: string;
    role_code?: string;
  }): Promise<User> => {
    setIsLoading(true);
    setAuthError(null);

    const actualUserId = employee.user_id || employee.employee_id;
    const employeeUser: User = {
      user_id: actualUserId,
      id: actualUserId,
      email: employee.email,
      full_name: employee.name,
      name: employee.name,
      role: 'employee',
      department: employee.department || 'General',
    };

    const token = `token_${actualUserId}_${Date.now()}`;
    setStoredToken(token);
    setStoredUser(employeeUser);
    setStoredRole('employee');

    setUserState(employeeUser);
    setRoleState('employee');
    setIsAuthenticated(true);
    setIsLoading(false);

    return employeeUser;
  };

  const login = async (email: string, password?: string): Promise<User> => {
    setIsLoading(true);
    setAuthError(null);

    try {
      if (!email) {
        throw new Error('Please enter a valid email address.');
      }
      if (password && password.length < 4) {
        throw new Error('Password must be at least 4 characters.');
      }

      const cleanEmail = email.trim().toLowerCase();
      let matchedUser: User | null = null;
      let matchedRole: UserRole = 'employee';

      // Known demo staff accounts (support OnBoardIQ and backward-compatible legacy)
      if (cleanEmail === 'admin@onboardiq.ai' || cleanEmail === 'admin@skillsprint.ai') {
        matchedUser = {
          user_id: 'usr-admin-system',
          id: 'usr-admin-system',
          email: cleanEmail,
          full_name: 'System Administrator',
          name: 'System Administrator',
          role: 'admin',
          department: 'Executive',
        };
        matchedRole = 'admin';
      } else if (cleanEmail === 'training_manager@onboardiq.ai' || cleanEmail === 'training_manager@skillsprint.ai') {
        matchedUser = {
          user_id: 'usr-training-mgr',
          id: 'usr-training-mgr',
          email: cleanEmail,
          full_name: 'Training Manager',
          name: 'Training Manager',
          role: 'training_manager',
          department: 'People Operations',
        };
        matchedRole = 'training_manager';
      } else if (cleanEmail === 'reviewer@onboardiq.ai' || cleanEmail === 'reviewer@skillsprint.ai') {
        matchedUser = {
          user_id: 'usr-lead-reviewer',
          id: 'usr-lead-reviewer',
          email: cleanEmail,
          full_name: 'Lead Reviewer',
          name: 'Lead Reviewer',
          role: 'reviewer',
          department: 'Compliance & Governance',
        };
        matchedRole = 'reviewer';
      } else if (cleanEmail === 'manager@onboardiq.ai' || cleanEmail === 'manager@skillsprint.ai') {
        matchedUser = {
          user_id: 'usr-dept-manager',
          id: 'usr-dept-manager',
          email: cleanEmail,
          full_name: 'Department Manager',
          name: 'Department Manager',
          role: 'manager',
          department: 'Engineering',
        };
        matchedRole = 'manager';
      }

      if (!matchedUser) {
        try {
          const employees = await api.get<
            Array<{
              employee_id: string;
              employee_code?: string;
              user_id?: string;
              name: string;
              email: string;
              department: string;
              role_code?: string;
              role_title?: string;
            }>
          >('/api/employees');

          const found = employees.find((e) => e.email.toLowerCase() === cleanEmail);
          if (found) {
            const actualId = found.user_id || found.employee_id;
            matchedUser = {
              user_id: actualId,
              id: actualId,
              email: found.email,
              full_name: found.name,
              name: found.name,
              role: 'employee',
              department: found.department,
            };
            matchedRole = 'employee';
          }
        } catch {
          // Fallback if directory query fails
        }
      }

      if (!matchedUser) {
        const derivedRole: UserRole = cleanEmail.includes('admin')
          ? 'admin'
          : cleanEmail.includes('training')
          ? 'training_manager'
          : cleanEmail.includes('review')
          ? 'reviewer'
          : cleanEmail.includes('manager')
          ? 'manager'
          : cleanEmail.includes('compliance')
          ? 'compliance_manager'
          : cleanEmail.includes('hr')
          ? 'hr_manager'
          : 'employee';

        const namePart = cleanEmail.split('@')[0];
        const displayName = namePart.split(/[_.]/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

        matchedUser = {
          user_id: `usr_${Date.now()}`,
          id: `usr_${Date.now()}`,
          email: cleanEmail,
          full_name: displayName || 'Authenticated User',
          name: displayName || 'Authenticated User',
          role: derivedRole,
          department: 'Corporate',
        };
        matchedRole = derivedRole;
      }

      const token = `token_${matchedUser.user_id}_${Date.now()}`;
      setStoredToken(token);
      setStoredUser(matchedUser);
      setStoredRole(matchedRole);

      setUserState(matchedUser);
      setRoleState(matchedRole);
      setIsAuthenticated(true);
      setIsLoading(false);

      return matchedUser;
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof ApiError ? err.message : (err as Error).message || 'Authentication failed.';
      setAuthError(msg);
      throw err;
    }
  };

  const signup = async (data: SignupRequestData): Promise<User> => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const payload = {
        name: data.name,
        email: data.email,
        department: data.department || 'General',
        experience_level: 'beginner',
        location: data.location || 'Headquarters',
        role_identifier: data.roleIdentifier || 'ENG-01',
      };

      const response = await api.post<{
        employee_id: string;
        name: string;
        email: string;
        department: string;
        job_role_id: string;
      }>('/api/employees', payload);

      const newUser: User = {
        user_id: response.employee_id,
        id: response.employee_id,
        email: response.email,
        full_name: response.name,
        name: response.name,
        role: 'employee',
        department: response.department,
      };

      const token = `token_${newUser.user_id}_${Date.now()}`;
      setStoredToken(token);
      setStoredUser(newUser);
      setStoredRole('employee');

      setUserState(newUser);
      setRoleState('employee');
      setIsAuthenticated(true);
      setIsLoading(false);

      return newUser;
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof ApiError ? err.message : (err as Error).message || 'Registration failed.';
      setAuthError(msg);
      throw err;
    }
  };

  const logout = () => {
    clearStoredAuth();
    setUserState(null);
    setRoleState('employee');
    setIsAuthenticated(false);
    setAuthError(null);
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    setStoredRole(newRole);
    if (user) {
      const updatedUser = { ...user, role: newRole };
      setUserState(updatedUser);
      setStoredUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isLoading,
        authError,
        login,
        loginAsEmployee,
        signup,
        logout,
        fetchCurrentUser,
        setRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
