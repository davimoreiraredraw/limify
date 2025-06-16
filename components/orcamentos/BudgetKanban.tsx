"use client";

import { PlusCircle, EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/app/lib/expenses";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { useState } from "react";
import { Budget, Column } from "@/app/(dashboard)/dashboard/orcamentos/types";
import BudgetCard from "./BudgetCard";

// Interface para o orçamento que pode ter price ou total
interface BudgetWithTotal extends Budget {
  total?: number;
  name?: string;
  client_name?: string;
}

interface BudgetKanbanProps {
  columns: Record<string, Column>;
  setColumns: React.Dispatch<React.SetStateAction<Record<string, Column>>>;
  columnOrder: string[];
  budgets: BudgetWithTotal[];
  setBudgets: React.Dispatch<React.SetStateAction<BudgetWithTotal[]>>;
  isLoading: boolean;
}

export default function BudgetKanban({
  columns,
  setColumns,
  columnOrder,
  budgets,
  setBudgets,
  isLoading,
}: BudgetKanbanProps) {
  // Estado para controlar a visibilidade dos valores
  const [hiddenValues, setHiddenValues] = useState<Record<string, boolean>>({
    "NÃO FINALIZADO": false,
    GERADO: false,
    FECHADOS: false,
  });

  // Função para alternar a visibilidade do valor de uma coluna
  const toggleValueVisibility = (columnId: string) => {
    setHiddenValues((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  // Manipular o drag and drop
  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    // Se não houver destino, não fazer nada
    if (!destination) {
      return;
    }

    // Se o destino for o mesmo que a origem, não fazer nada
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Verificar se as colunas existem
    if (!columns[source.droppableId] || !columns[destination.droppableId]) {
      console.error("Coluna de origem ou destino não encontrada");
      return;
    }

    // Obter coluna de origem e destino
    const startColumn = columns[source.droppableId];
    const finishColumn = columns[destination.droppableId];

    // Obter o orçamento que está sendo arrastado
    const draggedBudget = budgets.find((b) => b.id === draggableId);
    if (!draggedBudget) {
      console.error(`Orçamento com ID ${draggableId} não encontrado`);
      return;
    }

    // Verificar se o orçamento tem a propriedade price ou total
    let budgetValue = 0;
    if (typeof draggedBudget.price === "number") {
      budgetValue = draggedBudget.price;
    } else if (typeof draggedBudget.total === "number") {
      budgetValue = draggedBudget.total;
    } else {
      console.error(
        `Orçamento com ID ${draggableId} não tem um valor válido`,
        draggedBudget
      );
    }

    // Se for na mesma coluna
    if (startColumn === finishColumn) {
      const newBudgetIds = Array.from(startColumn.budgetIds);
      newBudgetIds.splice(source.index, 1);
      newBudgetIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...startColumn,
        budgetIds: newBudgetIds,
      };

      setColumns({
        ...columns,
        [newColumn.id]: newColumn,
      });

      return;
    }

    // Movendo de uma coluna para outra
    const startBudgetIds = Array.from(startColumn.budgetIds);
    startBudgetIds.splice(source.index, 1);

    // Atualizar valor total da coluna de origem (subtrair o valor do orçamento movido)
    const newStartColumn = {
      ...startColumn,
      budgetIds: startBudgetIds,
      count: startColumn.count - 1,
      totalValue: (startColumn.totalValue || 0) - budgetValue,
    };

    const finishBudgetIds = Array.from(finishColumn.budgetIds);
    finishBudgetIds.splice(destination.index, 0, draggableId);

    // Atualizar valor total da coluna de destino (adicionar o valor do orçamento movido)
    const newFinishColumn = {
      ...finishColumn,
      budgetIds: finishBudgetIds,
      count: finishColumn.count + 1,
      totalValue: (finishColumn.totalValue || 0) + budgetValue,
    };

    try {
      // Atualizar o budget com a nova coluna
      const updatedBudgets = budgets.map((budget) => {
        if (budget.id === draggableId) {
          // Manter todas as propriedades originais e apenas atualizar a coluna
          return {
            ...budget,
            column: destination.droppableId as Budget["column"],
            // Garantir que as propriedades importantes são mantidas
            project: budget.project || budget.name || "",
            client: budget.client || budget.client_name || "",
            name: budget.name, // Manter o nome original
            client_name: budget.client_name, // Manter o nome do cliente original
          };
        }
        return budget;
      });

      // Log para debug
      console.log(
        "Orçamento atualizado:",
        updatedBudgets.find((b) => b.id === draggableId)
      );

      setBudgets(updatedBudgets);

      setColumns({
        ...columns,
        [newStartColumn.id]: newStartColumn,
        [newFinishColumn.id]: newFinishColumn,
      });
    } catch (error) {
      console.error("Erro ao atualizar orçamentos após drag and drop:", error);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-row gap-6 w-full overflow-x-auto pb-6">
        {columnOrder.map((columnId) => {
          const column = columns[columnId];
          const columnBudgets = column.budgetIds
            .map((budgetId) => budgets.find((b) => b.id === budgetId)!)
            .filter(Boolean);

          // Definir cores de fundo para cada coluna
          let bgColorClass = "bg-red-50";
          let textColorClass = "text-red-500";

          if (columnId === "GERADO") {
            bgColorClass = "bg-indigo-50";
            textColorClass = "text-indigo-500";
          } else if (columnId === "FECHADOS") {
            bgColorClass = "bg-green-50";
            textColorClass = "text-green-500";
          }

          return (
            <div key={column.id} className="flex flex-col min-w-[350px]">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="font-semibold">{column.title}</h2>
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium">
                    {column.count}
                  </span>
                </div>
              </div>

              {/* Card de Resumo */}
              <div className={`rounded-lg ${bgColorClass} p-4 mb-5 shadow-sm`}>
                <div className="flex justify-between items-center">
                  <div className={`${textColorClass} text-lg font-medium`}>
                    {hiddenValues[column.id]
                      ? "••••••"
                      : formatCurrency(column.totalValue || 0)}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 bg-white border border-gray-200 shadow-sm hover:bg-gray-100"
                    onClick={() => toggleValueVisibility(column.id)}
                  >
                    {hiddenValues[column.id] ? (
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5"
                      >
                        <path
                          d="M13.3536 1.35355C13.5488 1.15829 13.5488 0.841709 13.3536 0.646447C13.1583 0.451184 12.8417 0.451184 12.6464 0.646447L10.6828 2.61012C9.70652 1.77961 8.41613 1.25 7 1.25C4.37665 1.25 2.17202 2.98816 1.29934 5.43922C1.21578 5.67273 1.21578 5.8272 1.29934 6.06071C1.54126 6.69239 1.88145 7.28133 2.29571 7.80361L1.64645 8.45286C1.45118 8.64813 1.45118 8.9647 1.64645 9.15997C1.84171 9.35523 2.15829 9.35523 2.35355 9.15997L13.3536 1.35355ZM9.67117 3.62177L8.4443 4.54325C8.1356 4.32291 7.76875 4.2 7.375 4.2C6.34302 4.2 5.5 5.04302 5.5 6.075C5.5 6.46875 5.62291 6.8356 5.84325 7.1443L4.62868 8.0591C4.12761 7.56117 3.77868 6.85839 3.65424 6.06549C3.62165 5.89885 3.62165 5.60109 3.65424 5.43446C4.28881 3.75301 5.54968 2.55 7 2.55C7.91217 2.55 8.85544 2.95048 9.67117 3.62177Z"
                          fill="currentColor"
                        ></path>
                        <path
                          d="M7.42659 8.95773C7.27941 8.98384 7.14124 9 7 9C5.89543 9 5 8.10457 5 7C5 6.85876 5.01616 6.72059 5.04227 6.57341L7.42659 8.95773Z"
                          fill="currentColor"
                        ></path>
                        <path
                          d="M10.5635 5.03946C10.8215 5.61498 10.9681 6.2611 10.9957 6.06071C10.9683 5.89885 10.9683 5.60109 10.9957 5.43446C10.8261 4.82689 10.5562 4.27702 10.2143 3.78456L11.6408 2.71251C12.2768 3.40196 12.7705 4.31205 13.0721 5.43922C13.1556 5.67273 13.1556 5.8272 13.0721 6.06071C12.1994 8.51176 9.99481 10.25 7.37146 10.25C6.54382 10.25 5.75654 10.0895 5.04221 9.79293L6.54252 8.62767C6.81219 8.7219 7.10312 8.775 7.37146 8.775C8.8218 8.775 10.0826 7.57197 10.7172 5.89052L10.5635 5.03946Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                    ) : (
                      <EyeIcon className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>

              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex-1 rounded-lg border bg-gray-50 p-4 min-h-[350px]"
                  >
                    {isLoading ? (
                      <div className="py-10 text-center text-sm text-gray-500">
                        Carregando orçamentos...
                      </div>
                    ) : columnBudgets.length === 0 ? (
                      <div className="py-10 text-center text-sm text-gray-500">
                        Nenhum orçamento nesta coluna
                      </div>
                    ) : (
                      columnBudgets.map((budget, index) => {
                        // Garantir que o budget tem todas as propriedades necessárias
                        const normalizedBudget: BudgetWithTotal = {
                          ...budget,
                          // Garantir que temos project e client
                          project: budget.project || budget.name || "",
                          client: budget.client || budget.client_name || "",
                          // Garantir que temos um valor para price
                          price:
                            typeof budget.price === "number"
                              ? budget.price
                              : budget.total || 0,
                          // Garantir que temos um status
                          status: budget.status || "Pendente",
                        };

                        return (
                          <BudgetCard
                            key={budget.id}
                            budget={normalizedBudget}
                            index={index}
                          />
                        );
                      })
                    )}
                    {provided.placeholder}

                    <Button
                      variant="ghost"
                      className="mt-3 w-full justify-start text-gray-500 text-sm bg-white border border-gray-200 shadow-sm hover:bg-gray-100"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Adicionar orçamento
                    </Button>
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}

        {/* Botão de adicionar mais colunas */}
        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-full border-dashed border-2 bg-white shadow-sm hover:bg-gray-100"
          >
            <PlusCircle className="h-5 w-5" />
          </Button>
          <span className="ml-3 text-sm font-medium text-muted-foreground">
            Adicionar outra
          </span>
        </div>
      </div>
    </DragDropContext>
  );
}
