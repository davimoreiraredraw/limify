"use client";

import {
  CalendarIcon,
  ChevronDownIcon,
  EyeIcon,
  MoreHorizontalIcon,
  Pencil,
  PlusCircle,
  TagIcon,
  Trash2Icon,
  UserIcon,
  UserPlusIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { formatCurrency } from "@/app/lib/expenses";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { mockBudgets, Budget, Column } from "./types";
import CreateBudgetScreen from "@/components/orcamentos/CreateBudgetScreen";
import ClientsModal from "@/components/orcamentos/ClientsModal";
import ClientBudgetDetailModal from "@/components/orcamentos/ClientBudgetDetailModal";
import BudgetKanban from "@/components/orcamentos/BudgetKanban";
import { format, isValid, parseISO } from "date-fns";
import { useUserPlan } from "@/lib/hooks/useUserPlan";
import { PlanLimitWarning } from "@/components/PlanLimitWarning";
import Link from "next/link";
import { pt } from "date-fns/locale";

// Interface para o orçamento que pode ter price ou total
interface BudgetWithTotal extends Budget {
  total?: number;
  name?: string;
  client_name?: string;
  created_at?: string;
}

// Interface para orçamentos
interface BudgetListItem {
  id: string;
  name: string;
  client_name: string;
  total: number;
  created_at: string;
  // Adicionar propriedades para compatibilidade com Budget
  project?: string;
  client?: string;
  company?: string;
  date?: string;
  status?: Budget["status"];
  column?: Budget["column"];
  cost?: number;
  price?: number;
  profit?: number;
}

export default function OrcamentosPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [budgets, setBudgets] = useState<BudgetListItem[]>([]);
  const [view, setView] = useState<"grid" | "list">("grid");

  // Estados para as colunas
  const [columns, setColumns] = useState<Record<string, Column>>({
    "NÃO FINALIZADO": {
      id: "NÃO FINALIZADO",
      title: "NÃO FINALIZADO",
      count: 0,
      totalValue: 0,
      budgetIds: [],
    },
    GERADO: {
      id: "GERADO",
      title: "GERADO",
      count: 0,
      totalValue: 0,
      budgetIds: [],
    },
    FECHADOS: {
      id: "FECHADOS",
      title: "FECHADOS",
      count: 0,
      totalValue: 0,
      budgetIds: [],
    },
  });

  // Ordem das colunas
  const [columnOrder, setColumnOrder] = useState([
    "NÃO FINALIZADO",
    "GERADO",
    "FECHADOS",
  ]);

  // Valores para os cards de resumo
  const [faturamento, setFaturamento] = useState(10000);
  const [gastosFixos, setGastosFixos] = useState(2000);
  const [lucro, setLucro] = useState(8000);

  // Adicionar estado para controlar a visibilidade dos valores
  const [hiddenValues, setHiddenValues] = useState<Record<string, boolean>>({
    "NÃO FINALIZADO": false,
    GERADO: false,
    FECHADOS: false,
  });

  // Adicionar estado para controlar o modal de clientes
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  // Adicionar estado para controlar a visualização de adicionar orçamento
  const [isCreatingBudget, setIsCreatingBudget] = useState(false);

  // Adicionar estado para controlar a etapa atual do orçamento
  const [budgetStep, setBudgetStep] = useState(0);
  const [selectedBudgetType, setSelectedBudgetType] = useState<string | null>(
    null
  );

  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [isBudgetDetailModalOpen, setIsBudgetDetailModalOpen] = useState(false);

  const [orcamentosCount, setOrcamentosCount] = useState(0);
  const { checkResourceLimit, isLoading: planLoading } = useUserPlan();

  useEffect(() => {
    const fetchBudgets = async () => {
      setIsLoading(true);
      try {
        console.log("Iniciando busca de orçamentos na página...");
        const res = await fetch("/api/budgets");

        if (!res.ok) {
          // Se a resposta não for OK (200-299), extrair o erro
          const errorData = await res.json();
          console.error("Erro na resposta da API:", errorData);
          throw new Error(
            `Erro ${res.status}: ${errorData.error || "Desconhecido"}`
          );
        }

        const data = await res.json();
        console.log("Dados recebidos da API:", data);

        // Garantir que data é um array
        const budgetsArray = Array.isArray(data) ? data : [];

        // Mapear e garantir que todos os valores numéricos estão corretos
        const processedBudgets = budgetsArray
          .map((budget) => {
            // Verificar se o orçamento tem todas as propriedades necessárias
            if (!budget || typeof budget !== "object") {
              console.error("Orçamento inválido recebido da API:", budget);
              return null;
            }

            // Garantir que o ID existe
            if (!budget.id) {
              budget.id = `temp-${Math.random().toString(36).substring(2, 11)}`;
              console.warn(
                "Orçamento sem ID, gerando ID temporário:",
                budget.id
              );
            }

            // Garantir que o total é um número
            let total = 0;
            if (budget.total !== undefined) {
              if (typeof budget.total === "string") {
                total = parseFloat(budget.total) || 0;
              } else if (typeof budget.total === "number") {
                total = budget.total;
              }
            }

            // Garantir que created_at é uma string de data válida
            let created_at = budget.created_at;
            if (
              !created_at ||
              new Date(created_at).toString() === "Invalid Date"
            ) {
              created_at = new Date().toISOString();
              console.warn(
                `Data inválida para orçamento ${budget.id}, usando data atual.`
              );
            }

            return {
              ...budget,
              total: total,
              created_at: created_at,
              name: budget.name || "Sem nome",
              client_name: budget.client_name || "Sem cliente",
            };
          })
          .filter(Boolean); // Remover itens nulos

        console.log("Orçamentos processados:", processedBudgets);
        setBudgets(processedBudgets);

        // Distribuir os orçamentos nas colunas apropriadas
        if (processedBudgets.length > 0) {
          const updatedColumns = { ...columns };

          // Limpar os budgetIds existentes
          Object.keys(updatedColumns).forEach((columnId) => {
            updatedColumns[columnId].budgetIds = [];
            updatedColumns[columnId].count = 0;
            updatedColumns[columnId].totalValue = 0;
          });

          // Distribuir os orçamentos nas colunas
          processedBudgets.forEach((budget) => {
            try {
              // Por padrão, colocar na coluna GERADO se não especificado
              const targetColumn = "GERADO";

              // Verificar se a coluna existe
              if (!updatedColumns[targetColumn]) {
                console.error(
                  `Coluna ${targetColumn} não encontrada para o orçamento ${budget.id}`
                );
                return;
              }

              updatedColumns[targetColumn].budgetIds.push(budget.id);
              updatedColumns[targetColumn].count += 1;
              updatedColumns[targetColumn].totalValue =
                (updatedColumns[targetColumn].totalValue || 0) + budget.total;
            } catch (error) {
              console.error(
                `Erro ao distribuir orçamento ${budget.id} nas colunas:`,
                error
              );
            }
          });

          console.log("Colunas atualizadas:", updatedColumns);
          setColumns(updatedColumns);
        }
      } catch (err) {
        console.error("Erro ao buscar orçamentos:", err);
        toast.error(
          `Erro ao carregar orçamentos: ${
            err instanceof Error ? err.message : "Erro desconhecido"
          }`
        );
        setBudgets([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBudgets();
  }, []);

  useEffect(() => {
    if (budgets.length > 0) {
      setOrcamentosCount(budgets.length);
    }
  }, [budgets]);

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

    // Obter coluna de origem e destino
    const startColumn = columns[source.droppableId];
    const finishColumn = columns[destination.droppableId];

    // Obter o orçamento que está sendo arrastado
    const draggedBudget = budgets.find((b) => b.id === draggableId);
    if (!draggedBudget) {
      console.error(`Orçamento com ID ${draggableId} não encontrado`);
      return;
    }

    // Verificar se o orçamento tem a propriedade total
    const budgetValue =
      typeof draggedBudget.total === "number" ? draggedBudget.total : 0;

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
      // Manter todas as propriedades originais e apenas atualizar a coluna
      const updatedBudget = {
        ...draggedBudget,
        column: destination.droppableId as Budget["column"],
        // Garantir que as propriedades project e client estão presentes
        project: draggedBudget.project || draggedBudget.name,
        client: draggedBudget.client || draggedBudget.client_name,
        // Garantir que temos um valor para price
        price:
          typeof draggedBudget.price === "number"
            ? draggedBudget.price
            : draggedBudget.total,
      };

      // Atualizar o estado do budgets
      const updatedBudgets = budgets.map((budget) =>
        budget.id === draggableId ? updatedBudget : budget
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

  // Função para alternar a visibilidade do valor de uma coluna
  const toggleValueVisibility = (columnId: string) => {
    setHiddenValues((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  // Função para converter BudgetListItem para Budget
  const convertToBudget = (budgetListItem: BudgetListItem): Budget => {
    // Calcular valores fictícios de custo e lucro baseados no total
    const cost = Math.round(budgetListItem.total * 0.7);
    const profit = budgetListItem.total - cost;

    // Determinar status aleatório para demonstração
    const statusOptions: Budget["status"][] = [
      "Visualizado",
      "Não gerado",
      "Pendente",
      "Completo",
      "Fechado",
      "Vencido",
    ];
    const randomStatus =
      statusOptions[Math.floor(Math.random() * statusOptions.length)];

    // Criar empresas fictícias para demonstração
    const companies = [
      "SoftShift",
      "FlowVolt",
      "BrightKeeper",
      "Alpha Automation",
      "Solar Streams",
    ];
    const randomCompany =
      companies[Math.floor(Math.random() * companies.length)];

    // Verificar se created_at é uma data válida antes de chamar toISOString()
    let dateString = "";
    try {
      const date = new Date(budgetListItem.created_at);
      // Verificar se a data é válida
      if (!isNaN(date.getTime())) {
        // Garantir que a data está no formato ISO
        dateString = date.toISOString();
      } else {
        // Se a data for inválida, usar a data atual
        dateString = new Date().toISOString();
        console.warn(
          `Data inválida encontrada: ${budgetListItem.created_at}, usando data atual.`
        );
      }
    } catch (error) {
      // Em caso de erro, usar a data atual
      dateString = new Date().toISOString();
      console.error(
        `Erro ao processar data: ${budgetListItem.created_at}`,
        error
      );
    }

    // Garantir que o valor é um número válido
    const validValue =
      typeof budgetListItem.total === "number" ? budgetListItem.total : 0;

    // Preservar as propriedades originais
    const result = {
      id: budgetListItem.id,
      project: budgetListItem.name, // Usar o nome original como project
      name: budgetListItem.name, // Manter o nome original
      client: budgetListItem.client_name, // Usar o nome do cliente original como client
      client_name: budgetListItem.client_name, // Manter o nome do cliente original
      date: dateString,
      status: budgetListItem.status || randomStatus,
      column: budgetListItem.column || "GERADO", // Valor padrão
      company: budgetListItem.company || randomCompany,
      cost: cost,
      price: validValue, // Usar o mesmo valor para price
      profit: profit,
      total: validValue, // Adicionar a propriedade total para compatibilidade
      created_at: budgetListItem.created_at, // Manter a data original
    } as Budget;

    // Log para debug
    console.log("Convertendo para Budget:", {
      original: budgetListItem,
      result,
    });

    return result;
  };

  const openBudgetDetailModal = (budget: BudgetListItem) => {
    // Converter BudgetListItem para Budget para compatibilidade com o modal existente
    const budgetForModal = convertToBudget(budget);
    setSelectedBudget(budgetForModal);
    setIsBudgetDetailModalOpen(true);
  };

  // Componente de card de orçamento
  function BudgetCard({
    budget,
    index,
  }: {
    budget: BudgetListItem;
    index: number;
  }) {
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
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                      {budget.client_name?.charAt(0) || "C"}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">{budget.name}</h3>
                    <p className="text-xs text-gray-500">
                      {budget.client_name ? budget.client_name : "Sem Cliente"}
                    </p>
                  </div>
                </div>
              </div>
              <Button className="h-8 w-8 -mt-1 -mr-1">
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-3 flex items-center text-xs text-gray-600">
              <span className="flex items-center">
                <UserIcon className="mr-1 h-3 w-3" />
                {budget.client_name}
              </span>
              <span className="mx-1">•</span>
              <span>{format(new Date(budget.created_at), "dd/MM/yyyy")}</span>
            </div>

            <div className="mt-3 flex justify-between text-xs">
              <div>
                <p className="text-gray-500">Valor</p>
                <p className="font-medium">{formatCurrency(budget.total)}</p>
              </div>
            </div>
          </div>
        )}
      </Draggable>
    );
  }

  // Renderização da tabela para a visualização em lista
  const renderTable = () => (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b text-xs uppercase">
            <tr>
              <th className="px-6 py-4 text-left font-medium w-[40px]">
                <input type="checkbox" className="rounded" />
              </th>
              <th className="px-6 py-4 text-left font-medium">Projeto</th>
              <th className="px-6 py-4 text-left font-medium">Cliente</th>
              <th className="px-6 py-4 text-left font-medium">Data</th>
              <th className="px-6 py-4 text-left font-medium">Custo</th>
              <th className="px-6 py-4 text-left font-medium">Preço</th>
              <th className="px-6 py-4 text-left font-medium">Lucro</th>
              <th className="px-6 py-4 text-left font-medium">Analytics</th>
              <th className="px-6 py-4 text-left font-medium">Status</th>
              <th className="px-6 py-4 text-center font-medium">Ver</th>
              <th className="px-6 py-4 text-center font-medium">Editar</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={11} className="text-center py-10">
                  Carregando orçamentos...
                </td>
              </tr>
            ) : !Array.isArray(budgets) || budgets.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center py-10">
                  Nenhum orçamento encontrado
                </td>
              </tr>
            ) : (
              budgets.map((budget) => {
                // Convertendo para o tipo Budget para acessar as propriedades de status
                const budgetData = convertToBudget(budget);

                return (
                  <tr
                    key={budget.id}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-medium">
                      <div>
                        <div>{budget.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {budgetData.company}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {budget.client_name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {format(new Date(budget.created_at), "dd/MM/yyyy")}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-amber-500">
                      {formatCurrency(budgetData.cost)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {formatCurrency(budgetData.price)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-green-500">
                      {formatCurrency(budgetData.profit)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {budgetData.status === "Visualizado" ||
                      budgetData.status === "Completo" ? (
                        <span className="flex items-center text-blue-600">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-1"
                          >
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                          Visualizado
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-1"
                          >
                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                            <line x1="2" x2="22" y1="2" y2="22"></line>
                          </svg>
                          Não gerado
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                          {
                            Completo: "bg-green-100 text-green-800",
                            Pendente: "bg-amber-100 text-amber-800",
                            Fechado: "bg-gray-100 text-gray-800",
                            Vencido: "bg-red-100 text-red-800",
                            "Não gerado": "bg-red-100 text-red-800",
                            Visualizado: "bg-blue-100 text-blue-800",
                          }[budgetData.status] || "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {budgetData.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      <Button
                        onClick={() => openBudgetDetailModal(budget)}
                        className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700 p-0 flex items-center justify-center shadow-sm"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Button>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      <Button className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 hover:text-indigo-700 p-0 flex items-center justify-center shadow-sm">
                        <Pencil className="h-5 w-5" />
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between p-6 border-t">
        <div className="text-sm text-muted-foreground">
          Mostrando{" "}
          <span className="font-medium">
            {Array.isArray(budgets) ? budgets.length : 0}
          </span>{" "}
          orçamentos
        </div>
        <div className="flex items-center space-x-8">
          <Button className="h-12 w-12 rounded-full border border-gray-200 bg-background shadow-sm hover:bg-accent hover:text-accent-foreground p-0 flex items-center justify-center text-lg text-gray-900">
            −
          </Button>
          <span className="text-lg font-medium">10</span>
          <Button className="h-12 w-12 rounded-full border border-gray-200 bg-background shadow-sm hover:bg-accent hover:text-accent-foreground p-0 flex items-center justify-center text-lg text-gray-900">
            +
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orçamentos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus orçamentos de projetos
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* <Button asChild variant="outline">
            <Link href="/dashboard">Voltar</Link>
          </Button>
          <Button
            asChild
            disabled={checkResourceLimit("orçamentos", orcamentosCount).isLimit}
          >
            <Link href="/dashboard/orcamentos/novo">
              {checkResourceLimit("orçamentos", orcamentosCount).isLimit
                ? "Limite atingido"
                : "Novo Orçamento"}
            </Link>
          </Button> */}
        </div>
      </div>

      {!planLoading && (
        <PlanLimitWarning
          resourceType="orçamentos"
          currentUsage={orcamentosCount}
          maxQuota={checkResourceLimit("orçamentos", orcamentosCount).maxQuota}
          planType="free"
          isLimit={checkResourceLimit("orçamentos", orcamentosCount).isLimit}
        />
      )}

      {isCreatingBudget ? (
        <CreateBudgetScreen
          isCreatingBudget={isCreatingBudget}
          setIsCreatingBudget={setIsCreatingBudget}
          selectedBudgetType={selectedBudgetType}
          setSelectedBudgetType={setSelectedBudgetType}
          budgetStep={budgetStep}
          setBudgetStep={setBudgetStep}
        />
      ) : (
        <>
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-semibold">Orçamentos</h1>
            <Button className="gap-2 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs text-gray-900">
              <CalendarIcon className="h-4 w-4 text-gray-900" />
              {new Date().toLocaleDateString("pt-BR", {
                month: "long",
                year: "numeric",
              })}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex flex-col gap-2">
                <span className="text-sm text-muted-foreground">
                  Faturamento
                </span>
                <div className="flex items-baseline gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-lg">R$</span>
                    <span className="text-2xl font-medium">
                      {formatCurrency(faturamento).replace("R$", "")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-emerald-500 text-sm mt-1">
                  <span>↑</span>
                  <span>2.29%</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex flex-col gap-2">
                <span className="text-sm text-muted-foreground">
                  Gastos fixos
                </span>
                <div className="flex items-baseline gap-2">
                  <div className="flex items-center gap-1 text-red-500">
                    <span className="text-lg">R$ -</span>
                    <span className="text-2xl font-medium">
                      {formatCurrency(gastosFixos).replace("R$", "")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-emerald-500 text-sm mt-1">
                  <span>↑</span>
                  <span>2.29%</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex flex-col gap-2">
                <span className="text-sm text-muted-foreground">Lucro</span>
                <div className="flex items-baseline gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-lg">R$</span>
                    <span className="text-2xl font-medium">
                      {formatCurrency(lucro).replace("R$", "")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-emerald-500 text-sm mt-1">
                  <span>↑</span>
                  <span>2.29%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex-1 relative max-w-md">
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                  </svg>
                </div>
                <input
                  type="search"
                  className="block w-full p-3 pl-10 text-sm border rounded-md bg-background"
                  placeholder="Buscar..."
                />
              </div>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <Button className="flex items-center gap-2 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-4 text-xs text-gray-900">
                <ChevronDownIcon className="h-4 w-4 text-gray-900" />
                Status
              </Button>

              <Button className="flex items-center gap-2 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-4 text-xs text-gray-900">
                <ChevronDownIcon className="h-4 w-4 text-gray-900" />
                Filtros
              </Button>
            </div>

            <div className="flex items-center gap-3 ml-6">
              <span className="text-sm text-gray-900 font-medium">View</span>
              <Tabs
                value={view}
                onValueChange={(value) => setView(value as "grid" | "list")}
              >
                <TabsList className="h-9 bg-transparent border border-gray-300 p-1 rounded-md">
                  <TabsTrigger
                    value="grid"
                    className="h-7 w-7 p-0 data-[state=active]:bg-background data-[state=active]:shadow-sm text-gray-900"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-gray-900"
                    >
                      <rect
                        x="1"
                        y="1"
                        width="5"
                        height="5"
                        rx="1"
                        fill="currentColor"
                      />
                      <rect
                        x="9"
                        y="1"
                        width="5"
                        height="5"
                        rx="1"
                        fill="currentColor"
                      />
                      <rect
                        x="1"
                        y="9"
                        width="5"
                        height="5"
                        rx="1"
                        fill="currentColor"
                      />
                      <rect
                        x="9"
                        y="9"
                        width="5"
                        height="5"
                        rx="1"
                        fill="currentColor"
                      />
                    </svg>
                  </TabsTrigger>
                  <TabsTrigger
                    value="list"
                    className="h-7 w-7 p-0 data-[state=active]:bg-background data-[state=active]:shadow-sm text-gray-900"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-gray-900"
                    >
                      <rect
                        x="1"
                        y="1"
                        width="13"
                        height="2"
                        rx="1"
                        fill="currentColor"
                      />
                      <rect
                        x="1"
                        y="6"
                        width="13"
                        height="2"
                        rx="1"
                        fill="currentColor"
                      />
                      <rect
                        x="1"
                        y="11"
                        width="13"
                        height="2"
                        rx="1"
                        fill="currentColor"
                      />
                    </svg>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-3">
              <Button
                className="text-xs px-4 py-2 h-9 gap-2 mr-2 text-white bg-primary"
                onClick={() => setIsClientModalOpen(true)}
              >
                <UserIcon className="h-4 w-4 text-white" />
                Clientes
              </Button>

              <Button className="text-xs px-4 py-2 h-9 gap-2 mr-2 text-white bg-primary">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white"
                >
                  <path
                    d="M4 7H11M4 11H11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                Lixeira
              </Button>

              <Button className="text-xs px-4 py-2 h-9 gap-2 text-white bg-primary">
                <TagIcon className="h-4 w-4 text-white" />
                Arquivados
              </Button>
            </div>

            <div className="flex mt-0 justify-center">
              <Button
                onClick={() => setIsCreatingBudget(true)}
                disabled={
                  checkResourceLimit("orçamentos", orcamentosCount).isLimit
                }
                className="gap-2 py-2 px-6 bg-primary text-white hover:bg-primary/90"
              >
                {checkResourceLimit("orçamentos", orcamentosCount).isLimit
                  ? "Limite de orçamentos atingido"
                  : "Criar Orçamento"}
              </Button>
            </div>
          </div>

          {view === "list" ? (
            renderTable()
          ) : (
            <BudgetKanban
              columns={columns}
              setColumns={setColumns}
              columnOrder={columnOrder}
              budgets={budgets.map((b) => {
                // Converter para Budget mantendo as propriedades originais
                const budgetForKanban: BudgetWithTotal = {
                  ...convertToBudget(b),
                  column: "GERADO" as Budget["column"], // Garantir que todos tenham uma coluna
                  // Manter as propriedades originais para garantir compatibilidade
                  name: b.name,
                  client_name: b.client_name,
                  total: b.total,
                  created_at: b.created_at,
                };
                console.log("Budget para Kanban:", budgetForKanban);
                return budgetForKanban;
              })}
              setBudgets={(
                newBudgets:
                  | BudgetWithTotal[]
                  | ((prev: BudgetWithTotal[]) => BudgetWithTotal[])
              ) => {
                // Quando o BudgetKanban atualiza os orçamentos, precisamos converter de volta para BudgetListItem
                if (typeof newBudgets === "function") {
                  // Se for uma função, não podemos processá-la diretamente
                  setBudgets((prev) => {
                    const updatedBudgets = (
                      newBudgets as (
                        prev: BudgetWithTotal[]
                      ) => BudgetWithTotal[]
                    )(prev.map((b) => convertToBudget(b) as BudgetWithTotal));
                    return updatedBudgets.map((b) => ({
                      id: b.id,
                      name: b.name || b.project || "Sem nome",
                      client_name: b.client_name || b.client || "Sem cliente",
                      total: typeof b.total === "number" ? b.total : b.price,
                      created_at:
                        b.created_at || b.date || new Date().toISOString(),
                    })) as BudgetListItem[];
                  });
                } else {
                  // Se for um array, podemos processá-lo diretamente
                  const updatedBudgets = newBudgets.map((b) => {
                    // Encontrar o orçamento original para manter suas propriedades
                    const originalBudget = budgets.find(
                      (original) => original.id === b.id
                    );
                    if (originalBudget) {
                      return {
                        ...originalBudget,
                        // Atualizar apenas a coluna
                        column: b.column,
                      };
                    }
                    // Se não encontrar o orçamento original, retornar um novo
                    return {
                      id: b.id,
                      name: b.name || b.project || "Sem nome",
                      client_name: b.client_name || b.client || "Sem cliente",
                      total: typeof b.total === "number" ? b.total : b.price,
                      created_at:
                        b.created_at || b.date || new Date().toISOString(),
                    };
                  });
                  setBudgets(updatedBudgets as BudgetListItem[]);
                }
              }}
              isLoading={isLoading}
            />
          )}
        </>
      )}

      {isClientModalOpen && (
        <ClientsModal
          isClientModalOpen={isClientModalOpen}
          setIsClientModalOpen={setIsClientModalOpen}
        />
      )}

      {/* Modal de detalhes do orçamento */}
      <ClientBudgetDetailModal
        isOpen={isBudgetDetailModalOpen}
        onClose={() => setIsBudgetDetailModalOpen(false)}
        budget={selectedBudget}
      />
    </div>
  );
}
