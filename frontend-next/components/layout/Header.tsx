'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const Header: React.FC = () => {
  const { isAuthenticated, user, role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Platform', href: '/#dual-pipeline' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Features', href: '/#features' },
    { label: 'Security', href: '/#security' },
    { label: 'About', href: '/about' },
  ];

  const roleBadges: Record<string, 'indigo' | 'emerald' | 'amber' | 'blue'> = {
    admin: 'indigo',
    compliance_manager: 'amber',
    hr_manager: 'blue',
    employee: 'emerald',
    training_manager: 'indigo',
    reviewer: 'amber',
    manager: 'blue',
  };

  const displayName = user?.full_name || user?.name || 'User Account';

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-md'
          : 'bg-slate-950 border-b border-slate-800/80'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: OnBoardIQ Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-md shadow-indigo-500/20 group-hover:bg-indigo-500 transition-colors">
            ⚡
          </div>
          <div>
            <span className="text-base font-extrabold text-white tracking-tight">OnBoardIQ</span>
          </div>
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-xs lg:text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <Link href="/dashboard" className="text-xs lg:text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
              Dashboard
            </Link>
          )}
        </nav>

        {/* Right: Authenticated User Profile & Auth Actions */}
        <div className="hidden sm:flex items-center gap-2 lg:gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2 lg:gap-3">
              {/* Authenticated User Badge & Name */}
              <Link href="/dashboard" className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl px-2.5 py-1.5 transition-colors">
                <div className="w-6 h-6 rounded-full bg-indigo-950 border border-indigo-700 text-indigo-300 flex items-center justify-center font-bold text-[11px]">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-bold text-white line-clamp-1 max-w-[100px]">{displayName}</p>
                  <div className="flex items-center gap-1">
                    <Badge variant={roleBadges[role] || 'indigo'} className="text-[9px] uppercase px-1 py-0">
                      {role.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </Link>

              <Link href="/dashboard">
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3">
                  Dashboard
                </Button>
              </Link>

              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="hidden lg:inline-flex border-slate-700 text-rose-400 hover:bg-rose-950/40 hover:border-rose-800 text-xs px-2.5"
                title="Sign Out"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="outline" size="sm" className="border-slate-700 text-slate-200 hover:bg-slate-800">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-300 hover:bg-slate-800 focus:outline-none"
          aria-label="Toggle mobile menu"
        >
          <span className="text-xl">{mobileMenuOpen ? '✕' : '☰'}</span>
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-300 hover:text-white py-1.5"
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-bold text-indigo-400 py-1.5"
            >
              Dashboard
            </Link>
          )}

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 flex items-center justify-between">
                  <span>Logged in as: <strong className="text-white">{displayName}</strong></span>
                  <Badge variant={roleBadges[role] || 'indigo'} className="text-[9px] uppercase">
                    {role}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-center border-slate-700 text-rose-400"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full justify-center border-slate-700 text-slate-200">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" className="w-full justify-center bg-indigo-600 text-white">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
