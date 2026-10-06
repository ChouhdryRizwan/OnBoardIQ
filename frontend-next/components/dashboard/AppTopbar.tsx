'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Breadcrumbs } from './Breadcrumbs';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { getDashboardRouteForRole } from '../../lib/constants';

export interface AppTopbarProps {
  onToggleMobileSidebar: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const AppTopbar: React.FC<AppTopbarProps> = ({
  onToggleMobileSidebar,
}) => {
  const router = useRouter();
  const { user, role, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleBadges: Record<string, 'indigo' | 'emerald' | 'amber' | 'blue'> = {
    admin: 'indigo',
    compliance_manager: 'amber',
    hr_manager: 'blue',
    employee: 'emerald',
    training_manager: 'indigo',
    reviewer: 'amber',
    manager: 'blue',
  };

  const displayName = user?.full_name || user?.name || 'Authenticated User';
  const roleDashboardRoute = getDashboardRouteForRole(role);

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-sm">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          aria-label="Open navigation menu"
        >
          <span className="text-xl">☰</span>
        </button>

        <div className="hidden sm:block">
          <Breadcrumbs />
        </div>
      </div>

      {/* Center: Search Trigger Placeholder */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
        <div className="w-full relative">
          <input
            type="text"
            readOnly
            placeholder="Search SOPs, requirements, employees... (⌘K)"
            onClick={() => alert('Search index feature placeholder — full global search coming in next module.')}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-1.5 text-xs text-slate-300 placeholder-slate-500 cursor-pointer focus:outline-none focus:border-indigo-500"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
            ⌘K
          </span>
        </div>
      </div>

      {/* Right: Notifications & User Avatar Dropdown */}
      <div className="flex items-center gap-3">
        {/* Notification Bell Placeholder */}
        <button
          onClick={() => alert('Notifications feature placeholder — backend notification system coming soon.')}
          className="relative p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          aria-label="View notifications"
          title="Notifications"
        >
          <span className="text-base">🔔</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
        </button>

        {/* User Profile Dropdown Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800 transition-colors focus:outline-none"
            aria-label="User account menu"
            aria-expanded={userMenuOpen}
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-600 border border-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <span className="text-xs font-bold text-white block max-w-[120px] truncate">{displayName}</span>
              <Badge variant={roleBadges[role] || 'indigo'} className="text-[9px] uppercase px-1 py-0">
                {role.replace('_', ' ')}
              </Badge>
            </div>
            <span className="text-xs text-slate-400 hidden md:block">▾</span>
          </button>

          {/* User Dropdown Menu Card */}
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-xs">
              <div className="p-3 border-b border-slate-800 mb-1">
                <p className="font-bold text-white text-sm truncate">{displayName}</p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email || 'authenticated@onboardiq.internal'}</p>
                <Badge variant={roleBadges[role] || 'indigo'} className="text-[9px] uppercase mt-2">
                  Role: {role.replace('_', ' ')}
                </Badge>
              </div>

              <div className="space-y-1">
                <Link
                  href={roleDashboardRoute}
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white font-medium transition-colors"
                >
                  <span>📊</span>
                  <span>Role Dashboard</span>
                </Link>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    alert('Profile page coming soon in next release phase.');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white font-medium transition-colors text-left"
                >
                  <span>👤</span>
                  <span>Profile (Coming Soon)</span>
                </button>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    alert('Settings page coming soon in next release phase.');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white font-medium transition-colors text-left"
                >
                  <span>⚙️</span>
                  <span>Settings (Coming Soon)</span>
                </button>
              </div>

              <div className="border-t border-slate-800 pt-1 mt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                    router.push('/auth/login');
                  }}
                  className="w-full justify-center text-rose-400 border-slate-800 hover:bg-rose-950/40 hover:border-rose-800 text-xs"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
