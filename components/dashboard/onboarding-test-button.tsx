"use client";

import { useOnboarding } from "@/contexts/onboarding-context";
import { useOnboardingStorage } from "@/lib/hooks/use-onboarding-storage";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function OnboardingTestButton() {
  const { setIsOnboardingOpen } = useOnboarding();
  const { resetOnboarding } = useOnboardingStorage();

  const handleResetOnboarding = () => {
    resetOnboarding();
    setIsOnboardingOpen(true);
  };

  // Apenas mostrar em desenvolvimento
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleResetOnboarding}
      className="fixed bottom-4 left-4 z-50 w-12 h-12 rounded-full bg-white hover:bg-gray-50 shadow-lg border-gray-200"
    >
      <RefreshCw className="h-4 w-4" />
    </Button>
  );
}
