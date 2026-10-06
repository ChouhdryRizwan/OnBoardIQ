'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [roleIdentifier, setRoleIdentifier] = useState('ENG-01');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPasswordValid = password.length >= 8;
  const isConfirmValid = password === confirmPassword && confirmPassword.length > 0;
  const isFormValid = name.trim().length > 0 && email.trim().length > 0 && isPasswordValid && isConfirmValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || loading) return;

    setLoading(true);
    setError(null);

    try {
      await signup({
        name: name.trim(),
        email: email.trim(),
        password,
        department: department.trim() || 'Engineering',
        roleIdentifier: roleIdentifier.trim() || 'ENG-01',
      });

      router.push('/dashboard');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Registration failed. Please verify user details.';
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
            Employee Onboarding Registration
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Create Your Account & Start Learning
          </h1>
          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            Register your profile to access personalized onboarding plans, interactive quizzes, and verified company SOP manuals.
          </p>

          <div className="mt-8 p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs text-slate-400">
            <p className="font-bold text-slate-200">🔒 Security Notice on Role Assignment:</p>
            <p>
              Public registrations assign standard Employee learning privileges. Privileged roles (Administrator, Training Manager, Reviewer) are assigned by System Administrators via RBAC controls.
            </p>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-400">
          © 2026 OnBoardIQ. All rights reserved.
        </div>
      </div>

      {/* Right Column: Signup Form Card */}
      <div className="lg:w-1/2 p-6 sm:p-12 lg:p-16 flex items-center justify-center bg-slate-950">
        <div className="w-full max-w-md">
          <Card className="bg-slate-900 border-slate-800 shadow-2xl p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Create an account</h2>
              <p className="text-xs text-slate-400 mt-1">Register your profile with the onboarding backend</p>
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
                  Full Name
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                  className="bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Work Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@company.com"
                  required
                  className="bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Department
                  </label>
                  <Input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Engineering"
                    className="bg-slate-950 border-slate-800 text-white placeholder-slate-600 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Role Identifier
                  </label>
                  <Input
                    type="text"
                    value={roleIdentifier}
                    onChange={(e) => setRoleIdentifier(e.target.value)}
                    placeholder="ENG-01"
                    className="bg-slate-950 border-slate-800 text-white placeholder-slate-600 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password (min 8 characters)
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-indigo-500"
                />
                {password.length > 0 && !isPasswordValid && (
                  <p className="text-[11px] text-amber-400 mt-1">Password must be at least 8 characters.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-indigo-500"
                />
                {confirmPassword.length > 0 && !isConfirmValid && (
                  <p className="text-[11px] text-rose-400 mt-1">Passwords do not match.</p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold disabled:opacity-50"
                disabled={!isFormValid || loading}
                isLoading={loading}
              >
                Create Account →
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-800 pt-4">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                Sign in
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
