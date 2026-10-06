import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const SecuritySection: React.FC = () => {
  const securityFeatures = [
    {
      title: 'Role-Based Access Control (RBAC)',
      desc: 'Enforces strict separation between Admin, Compliance Manager, HR Manager, and Employee roles across all endpoints.',
    },
    {
      title: 'API Authorization & Header Propagation',
      desc: 'Validates X-User-Role and X-User-Id parameters on every request via FastAPI middleware before processing.',
    },
    {
      title: 'Employee Data Isolation',
      desc: 'Ensures employees can only view their own assigned onboarding plans and quizzes without modifying underlying plan structures.',
    },
    {
      title: 'Immutable Audit Trail',
      desc: 'Logs every human review action, manual override, edit, and policy regeneration attempt with timestamped records.',
    },
    {
      title: 'Document Checksum Verification',
      desc: 'Computes cryptographic checksums for ingested PDF, DOCX, and Markdown manuals to prevent unauthorized modifications.',
    },
    {
      title: 'Prompt Injection Defenses',
      desc: 'Sanitizes document chunk text and enforces Pydantic schema validation on all GenAI generation pipelines.',
    },
    {
      title: 'Independent Validation Shield',
      desc: 'Pipeline 2 uses pure Python ground-truth rules without calling third-party LLMs to prevent unverified compliance outputs.',
    },
    {
      title: 'Version-Aware Persistence',
      desc: 'Maintains historical onboarding plan versions and historical quiz completion scores when policies change.',
    },
  ];

  return (
    <section id="security" className="py-20 bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="indigo" className="mb-4">
            Security & Governance
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
            Built for enterprise governance & security
          </h2>
          <p className="mt-4 text-slate-400 text-base sm:text-lg">
            OnBoardIQ enforces strict zero-trust principles across document ingestion, prompt processing, role boundaries, and audit logging.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {securityFeatures.map((sec) => (
            <Card key={sec.title} className="border-slate-800 bg-slate-950/50 hover:bg-slate-900 transition-all shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs mb-3">
                🛡️
              </div>
              <h3 className="text-base font-bold text-slate-100 mb-2">{sec.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{sec.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
