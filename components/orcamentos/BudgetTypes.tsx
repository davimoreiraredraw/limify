"use client";

import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction } from "react";
import {
  BudgetType,
  budgetTypes,
} from "@/app/(dashboard)/dashboard/orcamentos/types";

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
  return (
    <div className="grid grid-cols-5 gap-4 mb-8">
      {budgetTypes.map((type) => (
        <div
          key={type.id}
          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
            selectedType === type.id
              ? "border-indigo-600 bg-indigo-50"
              : "hover:border-gray-300"
          }`}
          onClick={() => {
            setSelectedType(type.id);
            setBudgetStep(1); // Avança automaticamente ao selecionar
          }}
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-5 h-5 rounded-full border mb-2 flex items-center justify-center">
              {selectedType === type.id && (
                <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
              )}
            </div>
            <h3 className="font-medium">{type.title}</h3>
            <p className="text-xs text-gray-500 mt-1">{type.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
