"use client";

import { useState } from "react";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { Testimonials } from "@/components/landing/Testimonials";
import { Footer } from "@/components/landing/Footer";
import { EligibilityChecker } from "@/components/landing/EligibilityChecker";
import { ResultsView } from "@/components/landing/ResultsView";
import { OrganicLeadForm } from "@/components/landing/OrganicLeadForm";
import { SuccessView } from "@/components/landing/SuccessView";
import { Step } from "@/lib/landing-types";
import { IRAScoreBreakdown } from "@/components/landing/IRAScoreBreakdown";
import { StatsBar } from "@/components/landing/StatsBar";

export default function LandingPage() {
  const [currentStep, setCurrentStep] = useState<Step>(Step.LANDING);
  const [assessmentResult, setAssessmentResult] = useState<{
    isEligible: boolean;
    missingCriteria: string[];
    failureReasons: string[];
    advice?: string;
  } | null>(null);

  const startAssessment = () => {
    setCurrentStep(Step.ASSESSMENT);
    // Prevent scrolling when modal is open
    document.body.style.overflow = "hidden";
  };

  const handleAssessmentComplete = (
    isEligible: boolean,
    missingCriteria: string[],
    failureReasons: string[],
    advice?: string,
  ) => {
    setAssessmentResult({
      isEligible,
      missingCriteria,
      failureReasons,
      advice,
    });
    setCurrentStep(Step.RESULTS);
  };

  const resetProcess = () => {
    setCurrentStep(Step.LANDING);
    setAssessmentResult(null);
    document.body.style.overflow = "auto";
  };

  const showLeadForm = () => {
    setCurrentStep(Step.LEAD_FORM);
  };

  const handleSubmissionSuccess = () => {
    setCurrentStep(Step.SUCCESS);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-brand-100 selection:text-brand-900">
      <Header />

      <main>
        <Hero onStartAssessment={startAssessment} />
        <HowItWorks />
        <Features />
        <StatsBar />
        <IRAScoreBreakdown />
      </main>

      <Footer />

      {/* Modals for Interactive Flow */}
      {currentStep === Step.ASSESSMENT && (
        <EligibilityChecker
          onComplete={handleAssessmentComplete}
          onCancel={resetProcess}
        />
      )}

      {currentStep === Step.RESULTS && assessmentResult && (
        <ResultsView
          isEligible={assessmentResult.isEligible}
          missingCriteria={assessmentResult.missingCriteria}
          failureReasons={assessmentResult.failureReasons}
          advice={assessmentResult.advice}
          onReset={resetProcess}
          onProceed={assessmentResult.isEligible ? showLeadForm : undefined}
        />
      )}

      {currentStep === Step.LEAD_FORM && (
        <OrganicLeadForm
          onSuccess={handleSubmissionSuccess}
          onCancel={resetProcess}
        />
      )}

      {currentStep === Step.SUCCESS && <SuccessView onClose={resetProcess} />}
    </div>
  );
}
