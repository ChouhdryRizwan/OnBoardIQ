'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col lg:flex-row">
      {/* Left Column: Branding */}
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
            Account Access Security
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Reset Password Request
          </h1>
          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            OnBoardIQ enforces enterprise RBAC credential policies. Password resets are managed by your System Administrator.
          </p>
        </div>

        <div className="relative z-10 text-xs text-slate-400">
          © 2026 OnBoardIQ. All rights reserved.
        </div>
      </div>

      {/* Right Column: Form / Info Card */}
      <div className="lg:w-1/2 p-6 sm:p-12 lg:p-16 flex items-center justify-center bg-slate-950">
        <div className="w-full max-w-md">
          <Card className="bg-slate-900 border-slate-800 shadow-2xl p-6 sm:p-8">
            {submitted ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 bg-amber-950 border border-amber-800 text-amber-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  ℹ️
                </div>
                <h2 className="text-xl font-extrabold text-white">Password Reset Request Logged</h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The current FastAPI backend version does not support self-service email password resets.
                </p>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400 text-left">
                  <p className="font-semibold text-slate-200 mb-1">Administrative Password Recovery:</p>
                  <p>Please contact your System Administrator to update your user credential hash for <span className="text-indigo-400 font-mono">{email}</span>.</p>
                </div>
                <div className="pt-2">
                  <Link href="/auth/login">
                    <Button variant="outline" className="w-full border-slate-700 text-slate-200 hover:bg-slate-800">
                      ← Return to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">Forgot password?</h2>
                  <p className="text-xs text-slate-400 mt-1">Enter your work email address to request password assistance</p>
                </div>

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

                  <Button type="submit" size="lg" className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
                    Submit Request →
                  </Button>
                </form>
              </div>
            )}

            <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-800 pt-4">
              Remembered your password?{' '}
              <Link href="/auth/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                Back to sign in
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
