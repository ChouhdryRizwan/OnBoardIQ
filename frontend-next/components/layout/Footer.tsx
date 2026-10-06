import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                ⚡
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">OnBoardIQ</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              AI-Powered Employee Onboarding & Training. GenAI generation paired with independent deterministic Python audit rules for 100% verifiable policy compliance.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li><Link href="/#features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="/#security" className="hover:text-white transition-colors">Security</Link></li>
              <li><Link href="/#analytics" className="hover:text-white transition-colors">Reports & Analytics</Link></li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">About OnBoardIQ</Link></li>
              <li><Link href="/#dual-pipeline" className="hover:text-white transition-colors">Documentation & Architecture</Link></li>
              <li><Link href="/#employee-experience" className="hover:text-white transition-colors">Student Demo Preview</Link></li>
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Account</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li><Link href="/auth/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link href="/auth/signup" className="hover:text-white transition-colors">Get Started</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">System Dashboard</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Rights */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 OnBoardIQ. All rights reserved.</p>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <span>FastAPI Backend Active</span>
            <span>•</span>
            <span>Dual-Pipeline Verification Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
