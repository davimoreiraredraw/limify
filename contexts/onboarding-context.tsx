"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useOnboardingStorage } from "@/lib/hooks/use-onboarding-storage";

interface OnboardingContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  isOnboardingCompleted: boolean;
  setIsOnboardingCompleted: (completed: boolean) => void;
  completedSteps: number[];
  markStepAsCompleted: (step: number) => void;
  getProgressPercentage: () => number;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const { isOnboardingCompleted, markOnboardingCompleted, isLoaded } =
    useOnboardingStorage();

  // Carregar passos completados do localStorage
  useEffect(() => {
    if (isLoaded) {
      const savedSteps = localStorage.getItem("limify-onboarding-steps");
      if (savedSteps) {
        setCompletedSteps(JSON.parse(savedSteps));
      }
    }
  }, [isLoaded]);

  // Verificar se todos os passos foram completados
  useEffect(() => {
    if (completedSteps.length === 4) {
      markOnboardingCompleted();
    }
  }, [completedSteps, markOnboardingCompleted]);

  const markStepAsCompleted = (step: number) => {
    setCompletedSteps((prev) => {
      const newSteps = [...prev];
      if (!newSteps.includes(step)) {
        newSteps.push(step);
        localStorage.setItem(
          "limify-onboarding-steps",
          JSON.stringify(newSteps)
        );
      }
      return newSteps;
    });
  };

  const getProgressPercentage = () => {
    return (completedSteps.length / 4) * 100;
  };

  const handleSetIsOnboardingCompleted = (completed: boolean) => {
    if (completed) {
      markOnboardingCompleted();
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        isOnboardingOpen,
        setIsOnboardingOpen,
        isOnboardingCompleted,
        setIsOnboardingCompleted: handleSetIsOnboardingCompleted,
        completedSteps,
        markStepAsCompleted,
        getProgressPercentage,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
