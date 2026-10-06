import React from 'react';
import Link from 'next/link';
import { PageContainer } from '../../../components/layout/PageContainer';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';

export default function AboutPage() {
  return (
    <PageContainer>
      {/* Hero Header */}
      <section className="bg-slate-900 text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="indigo" className="mb-4">
            About OnBoardIQ
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Verifiable AI for Enterprise Employee Onboarding
          </h1>
          <p className="mt-4 text-slate-300 max-w-2xl mx-auto text-lg">
            OnBoardIQ solves the enterprise GenAI trust problem by pairing generative plan creation with a non-LLM, ground-truth Python validation engine.
          </p>
        </div>
      </section>

      {/* Core Philosophy Section */}
      <section className="py-16 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-100">
                Why Dual-Pipeline Architecture?
              </h2>
              <p className="mt-4 text-slate-400 leading-relaxed">
                Traditional GenAI solutions struggle with hallucinated compliance requirements, unverified citations, and arbitrary module structuring. OnBoardIQ enforces strict architectural separation between <strong>Generation (Pipeline 1)</strong> and <strong>Deterministic Audit (Pipeline 2)</strong>.
              </p>
              <p className="mt-4 text-slate-400 leading-relaxed">
                Every onboarding plan created by our AI models undergoes instantaneous mathematical and structural auditing against the original document chunks and the Role Requirement Matrix before any employee receives it.
              </p>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100">Zero Trust in Raw LLM Outputs</h3>
                  <p className="text-sm text-slate-400 mt-1">Generative models output initial candidate plans, never final active plans.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100">Independent Ground-Truth Auditing</h3>
                  <p className="text-sm text-slate-400 mt-1">Pipeline 2 evaluates coverage and citation validity using 100% pure Python rules.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 font-bold flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100">Human-in-the-Loop Oversight</h3>
                  <p className="text-sm text-slate-400 mt-1">Compliance officers retain final approval authority with complete audit logging.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* System Architecture Modules */}
      <section className="py-16 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-100 text-center mb-10">
            System Modules & Platform Specifications
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card title="Document Management" subtitle="Module 1">
              <p className="text-sm text-slate-400 mt-2">
                Ingests PDF, DOCX, Markdown documents. Generates chunk-level citations with exact page and section numbers.
              </p>
            </Card>

            <Card title="Role Requirement Matrix" subtitle="Module 2">
              <p className="text-sm text-slate-400 mt-2">
                Maps company roles to mandatory learning topics, minimum pass rates, and prerequisite progression ordering.
              </p>
            </Card>

            <Card title="Human Review Queue" subtitle="Module 5">
              <p className="text-sm text-slate-400 mt-2">
                Interactive review interface allowing compliance managers to approve, edit, reject, or manually override generated plans.
              </p>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Link href="/auth/signup">
              <Button size="lg" className="px-8">
                Explore Dashboard & Try OnBoardIQ →
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
