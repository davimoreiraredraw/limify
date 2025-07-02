"use client";

import { OnboardingProvider } from "@/contexts/onboarding-context";
import { OnboardingSteps } from "@/components/dashboard/onboarding-steps";

export default function BemVindoPage() {
  return (
    <OnboardingProvider>
      <div className="p-8">
        <OnboardingSteps />
      </div>
    </OnboardingProvider>
  );
}
