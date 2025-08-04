"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useOnboarding } from "@/contexts/onboarding-context";

export function useOnboardingDetection() {
  const pathname = usePathname();
  const { markStepAsCompleted, completedSteps } = useOnboarding();

  useEffect(() => {
    // Mapear rotas para passos do onboarding
    const routeToStep: Record<string, number> = {
      "/dashboard/despesas": 1,
      "/dashboard/portfolio": 2,
      "/dashboard/orcamentos": 3,
    };

    const currentStep = routeToStep[pathname];

    if (currentStep && !completedSteps.includes(currentStep)) {
      // Pequeno delay para garantir que a página carregou
      const timer = setTimeout(() => {
        markStepAsCompleted(currentStep);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [pathname, markStepAsCompleted, completedSteps]);
}
