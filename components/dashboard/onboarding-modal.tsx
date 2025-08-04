"use client";

import { useOnboarding } from "@/contexts/onboarding-context";
import { useRouter } from "next/navigation";
import { X, ChevronRight, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";

interface OnboardingStep {
  number: number;
  title: string;
  path: string;
}

export function OnboardingModal() {
  const {
    currentStep,
    setCurrentStep,
    isOnboardingOpen,
    setIsOnboardingOpen,
    isOnboardingCompleted,
    setIsOnboardingCompleted,
    completedSteps,
    markStepAsCompleted,
    getProgressPercentage,
  } = useOnboarding();
  const router = useRouter();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const steps: OnboardingStep[] = [
    {
      number: 1,
      title: "Cadastre suas despesas",
      path: "/dashboard/despesas",
    },
    {
      number: 2,
      title: "Preencha seu portfólio",
      path: "/dashboard/portfolio",
    },
    {
      number: 3,
      title: "Crie seu primeiro orçamento",
      path: "/dashboard/orcamentos",
    },
    {
      number: 4,
      title: "Gerencie seus orçamentos",
      path: "/dashboard/orcamentos",
    },
  ];

  // Fechar popover quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsPopoverOpen(false);
      }
    };

    if (isPopoverOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPopoverOpen]);

  const handleStepClick = (step: OnboardingStep) => {
    setCurrentStep(step.number);
    markStepAsCompleted(step.number);
    if (step.number === 1) {
      router.push(`${step.path}?highlight=add-expense`);
    } else {
      router.push(step.path);
    }
    setIsPopoverOpen(false);
  };

  const handleClose = () => {
    setIsOnboardingOpen(false);
    setIsOnboardingCompleted(true);
    setIsPopoverOpen(false);
  };

  // Se o onboarding foi completado, não mostrar nada
  if (isOnboardingCompleted) {
    return null;
  }

  const progressPercentage = getProgressPercentage();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* FAB Button - "Comece por aqui" */}
      <Button
        ref={buttonRef}
        onClick={() => setIsPopoverOpen(!isPopoverOpen)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg font-medium shadow-lg flex items-center gap-2"
      >
        Comece por aqui
        <motion.div
          animate={{ rotate: isPopoverOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronUp className="h-4 w-4" />
        </motion.div>
      </Button>

      {/* Popover */}
      <AnimatePresence>
        {isPopoverOpen && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Aprenda como funciona o Limify
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="space-y-2">
                {steps.map((step) => {
                  const isCompleted = completedSteps.includes(step.number);
                  const isCurrent = step.number === currentStep;

                  return (
                    <div
                      key={step.number}
                      onClick={() => handleStepClick(step)}
                      className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all hover:border-indigo-400 ${
                        isCompleted
                          ? "border-green-600 bg-green-50"
                          : isCurrent
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-medium ${
                            isCompleted
                              ? "bg-green-600 text-white"
                              : isCurrent
                              ? "bg-indigo-600 text-white"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {isCompleted ? "✓" : step.number}
                        </div>
                        <span
                          className={`text-xs font-medium ${
                            isCompleted
                              ? "text-green-600"
                              : isCurrent
                              ? "text-indigo-600"
                              : "text-gray-700"
                          }`}
                        >
                          {step.title}
                        </span>
                      </div>
                      <ChevronRight className="h-3 w-3 text-gray-400" />
                    </div>
                  );
                })}
              </div>

              {/* Progress indicator */}
              <div className="flex items-center gap-1 mt-4 mb-3">
                {steps.map((step) => (
                  <div
                    key={step.number}
                    className={`w-6 h-1 rounded-full transition-colors ${
                      completedSteps.includes(step.number)
                        ? "bg-green-600"
                        : step.number <= currentStep
                        ? "bg-indigo-600"
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>

              {/* Progress text */}
              <div className="text-xs text-gray-500 text-center">
                {completedSteps.length} de 4 passos concluídos (
                {Math.round(progressPercentage)}%)
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
