"use client";

import { useState } from "react";
import BudgetFormFirstStep from "./BudgetFormFirstStep";
import CompleteBudgetSecondStep from "./CompleteBudgetSecondStep";
import { Button } from "@/components/ui/button";

interface CompleteBudgetFormProps {
  budgetStep: number;
  setBudgetStep: (step: number) => void;
}

export default function CompleteBudgetForm({
  budgetStep,
  setBudgetStep,
}: CompleteBudgetFormProps) {
  // Estados para a primeira etapa (comum a todos os tipos de orçamento)
  const [clientName, setClientName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [selectedClientOption, setSelectedClientOption] = useState<
    "existing" | "later" | null
  >("existing");
  const [clientId, setClientId] = useState<string | null>(null);

  // Estados para a segunda etapa
  const [selectedBudgetModel, setSelectedBudgetModel] = useState<
    "previous" | "standard"
  >("previous");
  const [previousBudgetName, setPreviousBudgetName] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  // Função para renderizar o conteúdo da etapa atual
  const renderStepContent = () => {
    switch (budgetStep) {
      case 1:
        return (
          <BudgetFormFirstStep
            clientName={clientName}
            setClientName={setClientName}
            projectName={projectName}
            setProjectName={setProjectName}
            projectDescription={projectDescription}
            setProjectDescription={setProjectDescription}
            selectedClientOption={selectedClientOption}
            setSelectedClientOption={setSelectedClientOption}
            clientId={clientId}
            setClientId={setClientId}
          />
        );
      case 2:
        return (
          <CompleteBudgetSecondStep
            selectedBudgetModel={selectedBudgetModel}
            setSelectedBudgetModel={setSelectedBudgetModel}
            previousBudgetName={previousBudgetName}
            setPreviousBudgetName={setPreviousBudgetName}
            selectedCurrency={selectedCurrency}
            setSelectedCurrency={setSelectedCurrency}
          />
        );
      default:
        return <div>Etapa não encontrada</div>;
    }
  };

  // Função para avançar para a próxima etapa
  const handleNextStep = () => {
    setBudgetStep(budgetStep + 1);
  };

  // Função para voltar para a etapa anterior
  const handlePreviousStep = () => {
    setBudgetStep(budgetStep - 1);
  };

  // Verificar se o botão "Próximo" deve estar desabilitado
  const isNextButtonDisabled = () => {
    if (budgetStep === 1) {
      // Verificações da primeira etapa
      if (selectedClientOption === "existing" && !clientId) {
        return true;
      }
      if (!projectName.trim()) {
        return true;
      }
    } else if (budgetStep === 2) {
      // Verificações da segunda etapa
      if (selectedBudgetModel === "previous" && !previousBudgetName.trim()) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Conteúdo da etapa atual */}
      {renderStepContent()}

      {/* Botões de navegação */}
      <div className="flex justify-between mt-12">
        <Button
          variant="outline"
          onClick={handlePreviousStep}
          disabled={budgetStep === 1}
        >
          Voltar
        </Button>
        <Button onClick={handleNextStep} disabled={isNextButtonDisabled()}>
          {budgetStep < 4 ? "Próximo" : "Finalizar"}
        </Button>
      </div>
    </div>
  );
}
