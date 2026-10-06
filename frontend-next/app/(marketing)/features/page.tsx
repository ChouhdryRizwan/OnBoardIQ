import React from 'react';
import Link from 'next/link';
import { PageContainer } from '../../../components/layout/PageContainer';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';

export default function FeaturesPage() {
  const features = [
    {
      id: 'document-management',
      module: 'Module 1',
      title: 'Document Management & Structural Ingestion',
      description: 'Upload PDF, DOCX, and Markdown policies. Automatically extract headers, sub-sections, and page-level metadata. Ensures 100% document traceability without data corruption.',
      badge: 'Core Feature'
    },
    {
      id: 'rrm',
      module: 'Module 2',
      title: 'Role Requirement Matrix (RRM)',
      description: 'Define mandatory competency standards per organizational role. Enforce prerequisite chains, minimum pass criteria, and circular dependency detection for role rules.',
      badge: 'Compliance Standard'
    },
    {
      id: 'pipeline-1',
      module: 'Module 3',
      title: 'Pipeline 1 — GenAI Generation Engine',
      description: 'Contextually constructs multi-day onboarding plans, structured learning objectives, reading materials, and interactive quizzes tailored to employee experience.',
      badge: 'AI Engine'
    },
    {
      id: 'pipeline-2',
      module: 'Module 4',
      title: 'Pipeline 2 — Deterministic Python Audit',
      description: 'Independent, non-LLM ground-truth validation engine. Computes mandatory rule coverage %, citation accuracy, and hallucination alerts without calling external LLMs.',
      badge: 'Deterministic Shield'
    },
    {
      id: 'human-review',
      module: 'Module 5',
      title: 'Human Review & Approval Workflow',
      description: 'Comprehensive review queue for Compliance & HR Officers. Enables single-click approval, rejection with feedback, manual content editing, and immutable audit logging.',
      badge: 'Governance'
    },
    {
      id: 'employee-learning',
      module: 'Module 6',
      title: 'Employee Learning & Progress Portal',
      description: 'Read-only view for assigned employees. Interactive quiz taking, real-time progress calculations, weak area identification, and certificate eligibility tracking.',
      badge: 'Student Portal'
    },
    {
      id: 'selective-regeneration',
      module: 'Module 7',
      title: 'Policy Update & Selective Regeneration',
      description: 'Diff analysis on updated company policies. Identifies impacted onboarding plan modules and regenerates ONLY affected sections while preserving historical progress.',
      badge: 'Impact Analysis'
    },
    {
      id: 'reports-analytics',
      module: 'Module 8',
      title: 'Deterministic Reports & Analytics',
      description: 'Aggregated organization-wide analytics on completion rates, rule coverage averages, and review queues. Supports CSV, Excel, and PDF report downloads.',
      badge: 'Analytics'
    }
  ];

  return (
    <PageContainer>
      <section className="bg-slate-900 text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="indigo" className="mb-4">
            Platform Capabilities
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Complete Feature Breakdown
          </h1>
          <p className="mt-4 text-slate-300 max-w-2xl mx-auto text-lg">
            Explore all 8 integrated modules designed for end-to-end enterprise compliance, generation, validation, and analytics.
          </p>
        </div>
      </section>

      <section className="py-16 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    {item.module}
                  </span>
                  <Badge variant="indigo">{item.badge}</Badge>
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
              </Card>
            ))}
          </div>

          <div className="mt-16 bg-slate-950 border border-slate-800 rounded-2xl p-8 text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-100">Experience OnBoardIQ in Action</h2>
            <p className="text-slate-400 text-sm mt-2">
              Sign in as Admin, Compliance Manager, HR Manager, or Employee to test role-based capabilities.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Link href="/auth/login">
                <Button size="lg" className="px-8">
                  Sign In to Platform
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
