"use client";

import Image from "next/image";
import { useOnboarding } from "@/contexts/onboarding-context";
import { useRouter } from "next/navigation";

interface OnboardingStep {
  number: number;
  title: string;
  path: string;
}

export function OnboardingSteps() {
  const { currentStep, setCurrentStep } = useOnboarding();
  const router = useRouter();

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

  const handleStepClick = (step: OnboardingStep) => {
    setCurrentStep(step.number);
    if (step.number === 1) {
      router.push(`${step.path}?highlight=add-expense`);
    } else {
      router.push(step.path);
    }
  };

  return (
    <div className="bg-white rounded-lg p-8 shadow-sm">
      <div className="flex justify-between items-start gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`w-12 h-1 rounded-full ${
                  step.number <= currentStep ? "bg-indigo-600" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <h2 className="text-2xl font-bold mb-6">
            Como vou chegar no meu primeiro orçamento?
          </h2>

          <div className="space-y-4">
            {steps.map((step) => (
              <div
                key={step.number}
                onClick={() => handleStepClick(step)}
                className={`p-4 rounded-lg border transition-all cursor-pointer hover:border-indigo-400 ${
                  step.number === currentStep
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-sm ${
                      step.number === currentStep
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {step.number}
                  </span>
                  <span
                    className={`font-medium ${
                      step.number === currentStep
                        ? "text-indigo-600"
                        : "text-gray-700"
                    }`}
                  >
                    {step.title}
                  </span>
                  {step.number === currentStep && (
                    <span className="ml-auto">
                      <svg
                        className="w-6 h-6 text-indigo-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <p className="text-gray-600">
              <span className="font-semibold">Feito!</span> Fácil e rápido você
              cria e gerencia orçamentos... quer aprender mais sobre o Limify?
            </p>
            <button
              onClick={() => router.push("/academy")}
              className="mt-4 flex items-center gap-2 text-indigo-600 font-medium"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              Conheça o academy!
            </button>
          </div>
        </div>

        <div className="flex-1 flex justify-center items-end h-[calc(100vh-16rem)]">
          <div className="w-80 h-[500px] relative">
            <Image
              src="/onboarding-mascot.png"
              alt="Mascote do Limify"
              layout="fill"
              objectFit="contain"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
