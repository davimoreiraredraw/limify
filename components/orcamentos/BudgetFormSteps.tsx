"use client";

import { useState } from "react";
import CompleteBudgetForm from "./CompleteBudgetForm";
import SquareMeterBudgetForm from "./SquareMeterBudgetForm";

interface BudgetFormStepsProps {
  budgetStep: number;
  setBudgetStep: (step: number) => void;
  selectedBudgetType: string | null;
}

export default function BudgetFormSteps({
  budgetStep,
  setBudgetStep,
  selectedBudgetType,
}: BudgetFormStepsProps) {
  // Renderiza o formulário específico para o tipo de orçamento selecionado
  const renderBudgetForm = () => {
    switch (selectedBudgetType) {
      case "complete":
        return (
          <CompleteBudgetForm
            budgetStep={budgetStep}
            setBudgetStep={setBudgetStep}
          />
        );
      case "m2":
        return (
          <SquareMeterBudgetForm
            budgetStep={budgetStep}
            setBudgetStep={setBudgetStep}
          />
        );
      case "render":
      case "modeling":
      case "price":
        // Outros tipos de orçamento serão implementados posteriormente
        return (
          <div className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">
              Tipo de orçamento em desenvolvimento
            </h2>
            <p className="text-gray-500">
              Este tipo de orçamento será implementado em breve.
            </p>
          </div>
        );
      default:
        return (
          <div className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">
              Selecione um tipo de orçamento
            </h2>
            <p className="text-gray-500">
              Escolha um tipo de orçamento para continuar.
            </p>
          </div>
        );
    }
  };

  return <div className="w-full">{renderBudgetForm()}</div>;
}
