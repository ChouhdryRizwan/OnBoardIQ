'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white pt-16 pb-20 lg:pt-24 lg:pb-32 border-b border-slate-800">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-indigo-900/20 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge Tagline */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm max-w-full">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse flex-shrink-0" />
            <span className="truncate sm:whitespace-normal">AI-Powered Employee Onboarding & Training</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight sm:leading-none break-words">
            Turn Company Knowledge Into{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 block sm:inline">
              Smarter Employee Onboarding
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="mt-6 text-base sm:text-xl text-slate-300 font-normal max-w-3xl mx-auto leading-relaxed">
            OnBoardIQ transforms company policies, SOP manuals, and role requirement matrices into traceable, personalized onboarding plans — independently verified by a 100% deterministic Python audit engine before human review.
          </p>

          {/* Primary Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="#dual-pipeline">
              <Button size="lg" className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base shadow-lg shadow-indigo-600/30 transition-all">
                Explore Platform →
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-3.5 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white font-medium text-base">
                See How It Works
              </Button>
            </Link>
          </div>
        </div>

        {/* Dashboard / Product Interactive UI Preview Mockup */}
        <div className="mt-14 max-w-5xl mx-auto">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden backdrop-blur-sm">
            {/* Top Mac-style Window Header */}
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 text-xs font-mono text-slate-400">onboardiq.app/onboarding/active-plan</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                  Pipeline 2 Verified ✓
                </span>
              </div>
            </div>

            {/* Dashboard Content Mockup */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Header Bar inside preview */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Onboarding Plan</span>
                    <Badge variant="indigo" className="text-[10px]">Senior DevOps Engineer</Badge>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">Alex Chen — Onboarding Plan v2.1</h3>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Overall Progress</span>
                    <span className="text-lg font-extrabold text-emerald-400">78% Complete</span>
                  </div>
                  <div className="w-12 h-12 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 flex items-center justify-center font-bold text-xs text-emerald-400">
                    78%
                  </div>
                </div>
              </div>

              {/* Progress Indicator Bar */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
                  <span>Mandatory Rule Coverage Score (Pipeline 2 Audit)</span>
                  <span className="text-emerald-400 font-bold">100% Ground Truth</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 w-full rounded-full" />
                </div>
              </div>

              {/* Grid Cards showing Module & Traceability */}
              <div className="grid md:grid-cols-2 gap-4 text-left">
                {/* AI-Generated Module Card */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-indigo-400 uppercase">Module 2 • Active Stage</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">GenAI Generated</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">Data Privacy & Security SOP Compliance</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    Covers data handling protocols, encryption standard compliance, and incident reporting triggers.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-emerald-400">Quiz Completed (95% Score)</span>
                  </div>
                </div>

                {/* Source Traceability Card */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-sky-400 uppercase">Ground Truth Citation</span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">Verified 100%</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-200">Security_Policy_v2.1.pdf</h4>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    Section 3.2 — Mandatory Encryption Guidelines (Page 14, Chunk #04)
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Pipeline 2 Rule ID: SEC-MAND-01</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
