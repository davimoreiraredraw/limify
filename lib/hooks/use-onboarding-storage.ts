"use client";

import { useEffect, useState } from "react";

export function useOnboardingStorage() {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Carregar estado do localStorage
    const completed = localStorage.getItem("limify-onboarding-completed");
    setIsOnboardingCompleted(completed === "true");
    setIsLoaded(true);
  }, []);

  const markOnboardingCompleted = () => {
    localStorage.setItem("limify-onboarding-completed", "true");
    setIsOnboardingCompleted(true);
  };

  const resetOnboarding = () => {
    localStorage.removeItem("limify-onboarding-completed");
    localStorage.removeItem("limify-onboarding-steps");
    setIsOnboardingCompleted(false);
  };

  return {
    isOnboardingCompleted,
    markOnboardingCompleted,
    resetOnboarding,
    isLoaded,
  };
}
