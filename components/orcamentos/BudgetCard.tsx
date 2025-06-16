"use client";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/app/lib/expenses";
import { Draggable } from "@hello-pangea/dnd";
import { EyeIcon, MoreHorizontalIcon, UserIcon } from "lucide-react";
import { Budget } from "@/app/(dashboard)/dashboard/orcamentos/types";

interface BudgetCardProps {
  budget: Budget;
  index: number;
}

export default function BudgetCard({ budget, index }: BudgetCardProps) {
  // Função para determinar a classe de cor com base no status
  const getStatusClass = (status: Budget["status"]) => {
    switch (status) {
      case "Visualizado":
        return "text-blue-600";
      case "Completo":
        return "text-green-600";
      case "Pendente":
        return "text-amber-600";
      case "Fechado":
        return "text-gray-600";
      case "Vencido":
        return "text-red-600";
      case "Não gerado":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  // Função para determinar o ícone de status
  const getStatusIcon = (status: Budget["status"]) => {
    switch (status) {
      case "Visualizado":
        return "✓";
      case "Não gerado":
        return "✗";
      case "Pendente":
        return "◌";
      default:
        return "";
    }
  };

  return (
    <Draggable draggableId={budget.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="mb-3 rounded-lg border bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                {/* Avatar do cliente - simulando com iniciais em um círculo */}
                <div className="relative">
                  {budget.id === "1" || budget.id === "5" ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-indigo-100">
                      <img
                        src={`https://i.pravatar.cc/150?u=${budget.client}`}
                        alt={budget.client}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                      {budget.client.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium">{budget.project}</h3>
                  <p className="text-xs text-gray-500">{budget.company}</p>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-1">
              <MoreHorizontalIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Labels/etiquetas */}
          <div className="mt-3 flex flex-wrap gap-1">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
              Label 1
            </span>
            {(budget.id === "1" || budget.id === "2") && (
              <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                Label 2
              </span>
            )}
            {budget.id === "5" && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                Label 3
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center text-xs text-gray-600">
            <span className="flex items-center">
              <UserIcon className="mr-1 h-3 w-3" />
              {budget.client}
            </span>
            <span className="mx-1">•</span>
            <span>{budget.date}</span>
          </div>

          <div className="mt-3 flex justify-between text-xs">
            <div>
              <p className="text-gray-500">Valor</p>
              <p className="font-medium">{formatCurrency(budget.price)}</p>
            </div>
            <div>
              <p className="text-gray-500">Status</p>
              <p className={`font-medium ${getStatusClass(budget.status)}`}>
                <span>{getStatusIcon(budget.status)}</span>
                <span> {budget.status}</span>
              </p>
            </div>
          </div>

          {budget.status === "Visualizado" && (
            <div className="mt-3 flex items-center text-xs text-blue-600">
              <EyeIcon className="mr-1 h-3 w-3" /> Visualizado recentemente
            </div>
          )}

          {/* Adicionar informação do tempo atrás */}
          <div className="mt-3 text-xs text-gray-500">
            <span>
              {index % 2 === 0 ? "2h" : index === 1 ? "1d" : "3h"} atrás
            </span>
          </div>
        </div>
      )}
    </Draggable>
  );
}
