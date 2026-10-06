'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { getDashboardRouteForRole } from '../../../lib/constants';
import { EmployeeSelectModal, EmployeeDirectoryItem } from '../../../components/auth/EmployeeSelectModal';
import { Shield, Briefcase, Scale, User, Users } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsEmployee } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);

  const isFormValid = email.trim().length > 0 && password.length >= 4;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || loading) return;

    setLoading(true);
    setError(null);

    try {
      const user = await login(email, password);
      const targetRoute = getDashboardRouteForRole(user.role);
      router.push(targetRoute);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Invalid credentials or authentication server error.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEmployee = async (employee: EmployeeDirectoryItem) => {
    setLoading(true);
    setError(null);
    try {
      await loginAsEmployee(employee);
      setIsEmployeeModalOpen(false);
      router.push('/employee/dashboard');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to switch employee session.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col lg:flex-row">
      {/* Left Column: Branding & Value Proposition */}
      <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-900/60 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-indigo-900/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-600/30 group-hover:bg-indigo-500 transition-colors">
              ⚡
            </div>
            <div>
              <span className="text-xl font-extrabold text-white tracking-tight">OnBoardIQ</span>
            </div>
          </Link>
        </div>

        <div className="my-12 lg:my-0 relative z-10 max-w-lg">
          <Badge variant="indigo" className="mb-4 bg-indigo-950 text-indigo-300 border-indigo-700">
            Enterprise Onboarding Intelligence
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Turn Company Knowledge Into Verifiable Training
          </h1>
          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            GenAI plan creation paired with an independent 100% deterministic Python audit engine. Log in to manage documents, role requirement matrices, human review queues, user administration, and employee progress.
          </p>

          <div className="mt-8 p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <span>✓</span>
              <span>100% Source Document Traceability</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
              <span>✓</span>
              <span>Independent Python Audit Shield</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
              <span>✓</span>
              <span>Dynamic RBAC & Isolated Learner Profiles</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-400">
          © 2026 OnBoardIQ. All rights reserved.
        </div>
      </div>

      {/* Right Column: Login Form Card */}
      <div className="lg:w-1/2 p-6 sm:p-12 lg:p-16 flex items-center justify-center bg-slate-950">
        <div className="w-full max-w-md">
          <Card className="bg-slate-900 border-slate-800 shadow-2xl p-6 sm:p-8">
            {/* Quick Test Login Buttons */}
            <div className="mb-6 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                <span>Quick Test Login (Demo Accounts)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@onboardiq.ai');
                    setPassword('admin123');
                  }}
                  className="px-2.5 py-2 bg-purple-950/50 hover:bg-purple-900/70 text-purple-200 text-xs font-semibold rounded-lg border border-purple-800/60 text-left transition-colors flex items-center justify-between group"
                >
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-purple-400" />
                    Admin
                  </span>
                  <span className="text-[10px] text-purple-400 opacity-60 group-hover:opacity-100">Select</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('training_manager@onboardiq.ai');
                    setPassword('password123');
                  }}
                  className="px-2.5 py-2 bg-teal-950/50 hover:bg-teal-900/70 text-teal-200 text-xs font-semibold rounded-lg border border-teal-800/60 text-left transition-colors flex items-center justify-between group"
                >
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-teal-400" />
                    Training Mgr
                  </span>
                  <span className="text-[10px] text-teal-400 opacity-60 group-hover:opacity-100">Select</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('reviewer@onboardiq.ai');
                    setPassword('password123');
                  }}
                  className="px-2.5 py-2 bg-amber-950/50 hover:bg-amber-900/70 text-amber-200 text-xs font-semibold rounded-lg border border-amber-800/60 text-left transition-colors flex items-center justify-between group"
                >
                  <span className="flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-amber-400" />
                    Reviewer
                  </span>
                  <span className="text-[10px] text-amber-400 opacity-60 group-hover:opacity-100">Select</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('manager@onboardiq.ai');
                    setPassword('password123');
                  }}
                  className="px-2.5 py-2 bg-indigo-950/50 hover:bg-indigo-900/70 text-indigo-200 text-xs font-semibold rounded-lg border border-indigo-800/60 text-left transition-colors flex items-center justify-between group"
                >
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    Dept Manager
                  </span>
                  <span className="text-[10px] text-indigo-400 opacity-60 group-hover:opacity-100">Select</span>
                </button>
              </div>

              {/* Dynamic Employee Selector Button */}
              <button
                type="button"
                onClick={() => setIsEmployeeModalOpen(true)}
                className="w-full px-3 py-2 bg-emerald-950/50 hover:bg-emerald-900/70 text-emerald-200 text-xs font-semibold rounded-lg border border-emerald-800/70 text-left transition-colors flex items-center justify-between group"
              >
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Employee / Learner (Select from 29 Seeded)</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 group-hover:bg-emerald-800 transition-colors">
                  Choose Profile →
                </span>
              </button>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-lg flex items-start gap-2">
                <span className="font-bold">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Work Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@company.com"
                  required
                  className="bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-indigo-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold disabled:opacity-50"
                disabled={!isFormValid || loading}
                isLoading={loading}
              >
                Sign In →
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-800 pt-4">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                Create an account
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Dynamic Employee Selection Modal */}
      <EmployeeSelectModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        onSelectEmployee={handleSelectEmployee}
      />
    </div>
  );
}
