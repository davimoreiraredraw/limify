"use client";

import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction, useState } from "react";
import BudgetTypes from "./BudgetTypes";
import BudgetFormSteps from "./BudgetFormSteps";

interface CreateBudgetScreenProps {
  isCreatingBudget: boolean;
  setIsCreatingBudget: Dispatch<SetStateAction<boolean>>;
  selectedBudgetType: string | null;
  setSelectedBudgetType: Dispatch<SetStateAction<string | null>>;
  budgetStep: number;
  setBudgetStep: Dispatch<SetStateAction<number>>;
}

export default function CreateBudgetScreen({
  isCreatingBudget,
  setIsCreatingBudget,
  selectedBudgetType,
  setSelectedBudgetType,
  budgetStep,
  setBudgetStep,
}: CreateBudgetScreenProps) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Orçamentos</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIsCreatingBudget(false);
            setBudgetStep(0);
            setSelectedBudgetType(null);
          }}
          className="text-red-500 bg-red-50"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2"
          >
            <path
              d="M7.07926 0.222253C7.31275 -0.007434 7.6873 -0.007434 7.92079 0.222253L14.6708 6.86227C14.907 7.09465 14.907 7.46959 14.6708 7.70197C14.4373 7.93166 14.0654 7.93166 13.8319 7.70197L7.50003 1.47149L1.16812 7.70197C0.932062 7.93166 0.562823 7.93166 0.329279 7.70197C0.0957956 7.46959 0.0957956 7.09465 0.329279 6.86227L7.07926 0.222253Z"
              fill="currentColor"
            />
          </svg>
          Voltar aos orçamentos
        </Button>
      </div>

      {/* Botões de tipo de orçamento sempre visíveis */}
      <BudgetTypes
        selectedType={selectedBudgetType}
        setSelectedType={setSelectedBudgetType}
        setBudgetStep={setBudgetStep}
      />

      {/* Conteúdo das etapas */}
      {budgetStep === 0 ? (
        <div className="max-w-3xl mx-auto w-full py-6 text-center">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-2">
              Selecione um modelo de orçamento
            </h2>
            <p className="text-gray-500">
              Inicie agora seu orçamento, basta selecionar uma modalidade acima
            </p>
          </div>

          <div className="flex justify-center">
            <div className="w-40 h-40 mb-8">
              <img
                src="/money-bag.png"
                alt="Money bag illustration"
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src =
                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEwMCAxNzVDMTQxLjQyMSAxNzUgMTc1IDE0MS40MjEgMTc1IDEwMEMxNzUgNTguNTc5IDE0MS40MjEgMjUgMTAwIDI1QzU4LjU3OSAyNSAyNSA1OC41NzkgMjUgMTAwQzI1IDE0MS40MjEgNTguNTc5IDE3NSAxMDAgMTc1WiIgc3Ryb2tlPSIjNmI3MjgwIiBzdHJva2Utd2lkdGg9IjgiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xMDAgNzVWMTI1IiBzdHJva2U9IiM2YjcyODAiIHN0cm9rZS13aWR0aD0iMTYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik03NSAxMDBIMTI1IiBzdHJva2U9IiM2YjcyODAiIHN0cm9rZS13aWR0aD0iMTYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==";
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full">
          {/* Barra de progresso */}
          <div className="mb-8 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-1">Orçamentos</h2>
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="w-full h-1 bg-gray-200 rounded-full">
                  <div
                    className="h-1 bg-indigo-600 rounded-full"
                    style={{
                      width: `${(budgetStep / 4) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="ml-4 text-sm font-medium text-gray-600">
                Etapa {budgetStep} de 4
              </div>
            </div>
          </div>

          {/* Formulário do orçamento */}
          <BudgetFormSteps
            budgetStep={budgetStep}
            setBudgetStep={setBudgetStep}
            selectedBudgetType={selectedBudgetType}
          />
        </div>
      )}
    </div>
  );
}
