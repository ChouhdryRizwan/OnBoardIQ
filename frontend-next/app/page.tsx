import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Hero } from '../components/landing/Hero';
import { TrustStrip } from '../components/landing/TrustStrip';
import { ProblemSection } from '../components/landing/ProblemSection';
import { SolutionFlow } from '../components/landing/SolutionFlow';
import { DualPipeline } from '../components/landing/DualPipeline';
import { HumanReview } from '../components/landing/HumanReview';
import { PolicyUpdates } from '../components/landing/PolicyUpdates';
import { EmployeeExperience } from '../components/landing/EmployeeExperience';
import { AnalyticsPreview } from '../components/landing/AnalyticsPreview';
import { SecuritySection } from '../components/landing/SecuritySection';
import { FeatureGrid } from '../components/landing/FeatureGrid';
import { HowItWorks } from '../components/landing/HowItWorks';
import { FinalCTA } from '../components/landing/FinalCTA';

export default function HomePage() {
  return (
    <PageContainer>
      {/* 1. SaaS Hero Section */}
      <Hero />

      {/* 2. Compact Capability Trust Strip */}
      <TrustStrip />

      {/* 3. Problem Section */}
      <ProblemSection />

      {/* 4. Solution Lifecycle Flow */}
      <SolutionFlow />

      {/* 5. Dual Pipeline Showcase (Core Differentiator) */}
      <DualPipeline />

      {/* 6. Human Review & Approval Governance */}
      <HumanReview />

      {/* 7. Policy Update & Selective Regeneration */}
      <PolicyUpdates />

      {/* 8. Employee Learning Experience */}
      <EmployeeExperience />

      {/* 9. Deterministic Reports & Analytics */}
      <AnalyticsPreview />

      {/* 10. Security & Enterprise Governance */}
      <SecuritySection />

      {/* 11. Complete Feature Grid */}
      <FeatureGrid />

      {/* 12. How It Works Timeline */}
      <HowItWorks />

      {/* 13. Final CTA Banner */}
      <FinalCTA />
    </PageContainer>
  );
}
