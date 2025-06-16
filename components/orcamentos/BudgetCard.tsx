"use client";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/app/lib/expenses";
import { Draggable } from "@hello-pangea/dnd";
import { EyeIcon, MoreHorizontalIcon, UserIcon } from "lucide-react";
import { Budget } from "@/app/(dashboard)/dashboard/orcamentos/types";
import { format, isValid, parseISO } from "date-fns";
import { pt } from "date-fns/locale";

// Interface estendida para suportar tanto price quanto total
interface BudgetWithTotal extends Budget {
  total?: number;
  name?: string;
  client_name?: string;
  created_at?: string;
}

interface BudgetCardProps {
  budget: BudgetWithTotal;
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

  // Determinar qual valor exibir (price ou total)
  const displayValue =
    typeof budget.total === "number" ? budget.total : budget.price;

  // Determinar o nome do projeto e do cliente
  const projectName = budget.name || budget.project || "Sem nome";
  const clientName = budget.client_name || budget.client || "Sem cliente";

  // Determinar a empresa
  const companyName = budget.company || "Empresa";

  // Log para debug
  console.log("Renderizando BudgetCard:", {
    id: budget.id,
    projectName,
    clientName,
    budget,
  });

  return (
    <Draggable draggableId={budget.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="mb-4 rounded-lg border bg-white p-5 shadow-sm"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-3">
                {/* Avatar do cliente - simulando com iniciais em um círculo */}
                <div className="relative">
                  {budget.id === "1" || budget.id === "5" ? (
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-indigo-100">
                      <img
                        src={`https://i.pravatar.cc/150?u=${clientName}`}
                        alt={clientName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                      {clientName.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium">{projectName}</h3>
                  <p className="text-xs text-gray-500 mt-1">{companyName}</p>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 -mt-1 -mr-1 bg-muted shadow-sm hover:bg-accent"
            >
              <MoreHorizontalIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Labels/etiquetas */}
          <div className="mt-4 flex flex-wrap gap-2 mb-3">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
              Label 1
            </span>
            {(budget.id === "1" || budget.id === "2") && (
              <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                Label 2
              </span>
            )}
            {budget.id === "5" && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                Label 3
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center text-xs text-gray-600">
            <span className="flex items-center">
              <UserIcon className="mr-1.5 h-3.5 w-3.5" />
              {clientName}
            </span>
            <span className="mx-2">•</span>
            <span>
              {(() => {
                try {
                  // Determinar qual data usar
                  const dateString =
                    budget.date ||
                    (budget.created_at
                      ? new Date(budget.created_at).toISOString()
                      : "");

                  // Tentar analisar a data
                  if (dateString) {
                    const date = parseISO(dateString);

                    // Verificar se a data é válida
                    if (isValid(date)) {
                      return format(date, "dd/MM/yyyy", { locale: pt });
                    }
                  }
                  return "Data indisponível";
                } catch (error) {
                  console.error(`Erro ao processar data no BudgetCard`, error);
                  return "Data indisponível";
                }
              })()}
            </span>
          </div>

          <div className="mt-4 flex justify-between text-xs">
            <div>
              <p className="text-gray-500 mb-1">Valor</p>
              <p className="font-medium">{formatCurrency(displayValue)}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Status</p>
              <p className={`font-medium ${getStatusClass(budget.status)}`}>
                <span>{getStatusIcon(budget.status)}</span>
                <span> {budget.status}</span>
              </p>
            </div>
          </div>

          {budget.status === "Visualizado" && (
            <div className="mt-4 flex items-center text-xs text-blue-600">
              <EyeIcon className="mr-1.5 h-3.5 w-3.5" /> Visualizado
              recentemente
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
