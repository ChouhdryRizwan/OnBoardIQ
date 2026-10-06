import React from 'react';
import Link from 'next/link';
import { Button } from '../ui/Button';

export const FinalCTA: React.FC = () => {
  return (
    <section className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white py-20 border-t border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight max-w-3xl mx-auto leading-tight">
          Build onboarding around the knowledge your company already has.
        </h2>
        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
          Eliminate manual training preparation and unverified AI hallucinations with OnBoardIQ&apos;s dual-pipeline generation and deterministic validation architecture.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/auth/signup">
            <Button size="lg" className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base shadow-lg shadow-indigo-600/30">
              Get Started →
            </Button>
          </Link>
          <Link href="#features">
            <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-3.5 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white text-base">
              Explore Platform
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
