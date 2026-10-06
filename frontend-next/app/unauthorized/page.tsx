'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { PageContainer } from '../../components/layout/PageContainer';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { role } = useAuth();

  return (
    <PageContainer>
      <div className="min-h-[calc(100vh-12rem)] bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <Card className="bg-slate-900 border-slate-800 shadow-2xl p-8">
            <div className="w-14 h-14 bg-rose-950 border border-rose-800 text-rose-400 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold mb-4">
              🚫
            </div>

            <Badge variant="error" className="mb-3 uppercase text-[11px] bg-rose-950 text-rose-300 border-rose-800">
              403 — Access Denied
            </Badge>

            <h1 className="text-2xl font-extrabold text-white tracking-tight">Insufficient Privileges</h1>

            <p className="mt-3 text-xs text-slate-300 leading-relaxed">
              Your active account role (<span className="font-semibold text-rose-400 font-mono">{role}</span>) does not have authorization to view this protected resource.
            </p>

            <div className="my-6 p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400 text-left">
              <p className="font-semibold text-slate-300 mb-1">RBAC Security Notice:</p>
              <p>
                Resource modifications and administrative workspaces require elevated role authorization (Admin, Training Manager, or Reviewer).
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="w-full border-slate-700 text-slate-200 hover:bg-slate-800"
              >
                ← Go Back
              </Button>
              <Link href="/dashboard" className="w-full">
                <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
                  Dashboard →
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
