"use client";

import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction } from "react";
import {
  BudgetType,
  budgetTypes,
} from "@/app/(dashboard)/dashboard/orcamentos/types";
import { ArrowLeftIcon } from "lucide-react";

interface BudgetTypesProps {
  selectedType: string | null;
  setSelectedType: Dispatch<SetStateAction<string | null>>;
  setBudgetStep: Dispatch<SetStateAction<number>>;
}

export default function BudgetTypes({
  selectedType,
  setSelectedType,
  setBudgetStep,
}: BudgetTypesProps) {
  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    setBudgetStep(1);
  };

  const handleBackToSelection = () => {
    setSelectedType(null);
    setBudgetStep(0);
  };

  const selectedBudgetType = budgetTypes.find(
    (type) => type.id === selectedType
  );

  return (
    <div className="mb-8">
      {selectedType ? (
        // Mostrar apenas o tipo selecionado
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToSelection}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Escolher outro tipo
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-indigo-600 bg-indigo-600 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-white"></div>
              </div>
              <div>
                <h3 className="font-medium">{selectedBudgetType?.title}</h3>
                <p className="text-xs text-gray-500">
                  {selectedBudgetType?.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Mostrar todos os tipos
        <div className="grid grid-cols-5 gap-4">
          {budgetTypes.map((type) => (
            <div
              key={type.id}
              className="border rounded-lg p-4 cursor-pointer transition-colors hover:border-gray-300"
              onClick={() => handleTypeSelect(type.id)}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-5 h-5 rounded-full border mb-2 flex items-center justify-center"></div>
                <h3 className="font-medium">{type.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{type.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
