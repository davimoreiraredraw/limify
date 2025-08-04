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
  CheckCircle2,
  ArrowLeftIcon,
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
import { useSearchParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  is_deleted?: boolean;
}

// Função para gerar erro de tipagem aleatório

export default function OrcamentosPage() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [budgets, setBudgets] = useState<BudgetListItem[]>([]);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isFiltersDropdownOpen, setIsFiltersDropdownOpen] = useState(false);
  const [showTrash, setShowTrash] = useState(false);

  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
  const [faturamento, setFaturamento] = useState(0);
  const [gastosFixos, setGastosFixos] = useState(0);
  const [lucro, setLucro] = useState(0);
  const [percentuais, setPercentuais] = useState({
    faturamento: 0,
    gastosFixos: 0,
    lucro: 0,
  });

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

  // Lógica de paginação
  const totalItems = budgets.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = budgets.slice(startIndex, endIndex);

  // Opções de itens por página
  const itemsPerPageOptions = [5, 10, 25, 50];

  // Handlers de paginação
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1); // Volta para primeira página ao mudar itens por página
  };

  useEffect(() => {
    const shouldCreateNew = searchParams.get("new") === "true";
    if (shouldCreateNew) {
      setIsCreatingBudget(true);
    }
  }, [searchParams]);

  const fetchBudgets = async () => {
    setIsLoading(true);
    try {
      console.log("Iniciando busca de orçamentos na página...");
      const url = new URL("/api/budgets", window.location.origin);

      if (statusFilter !== "todos") {
        url.searchParams.set("status", statusFilter);
      }

      if (showTrash) {
        url.searchParams.set("deleted", "true");
      }

      const res = await fetch(url.toString());

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
            console.warn("Orçamento sem ID, gerando ID temporário:", budget.id);
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
            status: budget.status || "gerado",
            is_deleted: budget.is_deleted || false,
          };
        })
        .filter(Boolean); // Remover itens nulos

      console.log("Orçamentos processados:", processedBudgets);
      setBudgets(processedBudgets);

      // Distribuir os orçamentos nas colunas apropriadas (apenas se não estiver na lixeira)
      if (processedBudgets.length > 0 && !showTrash) {
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
  useEffect(() => {
    fetchBudgets();
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [statusFilter]);

  useEffect(() => {
    fetchBudgets();
  }, [showTrash]);

  useEffect(() => {
    if (budgets.length > 0) {
      setOrcamentosCount(budgets.length);
    }
  }, [budgets]);

  // Buscar estatísticas do dashboard
  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats");
      const data = await response.json();

      if (data) {
        const lucroCalculado = data.faturamento.value - data.gastosFixos.value;
        const lucroAnterior =
          data.faturamento.value * (1 - data.faturamento.percentage / 100) -
          data.gastosFixos.value * (1 - data.gastosFixos.percentage / 100);
        const variacaoLucro =
          lucroAnterior !== 0
            ? ((lucroCalculado - lucroAnterior) / Math.abs(lucroAnterior)) * 100
            : 0;

        setFaturamento(data.faturamento.value);
        setGastosFixos(data.gastosFixos.value);
        setLucro(lucroCalculado);
        setPercentuais({
          faturamento: data.faturamento.percentage,
          gastosFixos: data.gastosFixos.percentage,
          lucro: variacaoLucro,
        });
      }
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      toast.error("Erro ao carregar estatísticas");
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

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

  // Função para atualizar o status de um orçamento
  const updateBudgetStatus = async (budgetId: string, newStatus: string) => {
    try {
      const response = await fetch("/api/budgets", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          budgetId,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar status do orçamento");
      }

      toast.success("Status do orçamento atualizado com sucesso!");
      fetchBudgets(); // Recarregar os orçamentos
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status do orçamento");
    }
  };

  // Função para mover orçamento para lixeira
  const moveToTrash = async (budgetId: string) => {
    try {
      const response = await fetch("/api/budgets", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          budgetId,
          action: "move_to_trash",
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao mover orçamento para lixeira");
      }

      toast.success("Orçamento movido para lixeira!");
      fetchBudgets(); // Recarregar os orçamentos
    } catch (error) {
      console.error("Erro ao mover para lixeira:", error);
      toast.error("Erro ao mover orçamento para lixeira");
    }
  };

  // Função para restaurar orçamento da lixeira
  const restoreFromTrash = async (budgetId: string) => {
    try {
      const response = await fetch("/api/budgets", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          budgetId,
          action: "restore",
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao restaurar orçamento");
      }

      toast.success("Orçamento restaurado com sucesso!");
      fetchBudgets(); // Recarregar os orçamentos
    } catch (error) {
      console.error("Erro ao restaurar:", error);
      toast.error("Erro ao restaurar orçamento");
    }
  };

  // Função para excluir orçamento permanentemente
  const deletePermanently = async (budgetId: string) => {
    if (
      !confirm(
        "Tem certeza que deseja excluir permanentemente este orçamento? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/budgets", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          budgetId,
          action: "delete_permanently",
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir orçamento permanentemente");
      }

      toast.success("Orçamento excluído permanentemente!");
      fetchBudgets(); // Recarregar os orçamentos
    } catch (error) {
      console.error("Erro ao excluir permanentemente:", error);
      toast.error("Erro ao excluir orçamento permanentemente");
    }
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="h-8 w-8 -mt-1 -mr-1">
                    <MoreHorizontalIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => openBudgetDetailModal(budget)}
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    Ver detalhes
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => updateBudgetStatus(budget.id, "publicado")}
                  >
                    <TagIcon className="h-4 w-4 mr-2" />
                    Publicar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => updateBudgetStatus(budget.id, "aceito")}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Marcar como aceito
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
              <div>
                <p className="text-gray-500">Status</p>
                <p
                  className={`font-medium ${
                    budget.status === "aceito"
                      ? "text-green-600"
                      : budget.status === "publicado"
                      ? "text-amber-600"
                      : "text-blue-600"
                  }`}
                >
                  {budget.status || "gerado"}
                </p>
              </div>
            </div>
          </div>
        )}
      </Draggable>
    );
  }

  // Renderização da tabela para a visualização em lista
  const renderTable = () => {
    // Se não há orçamentos e não está carregando, mostrar apenas a mensagem
    if (!isLoading && (!Array.isArray(budgets) || budgets.length === 0)) {
      return (
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-1 h-1 bg-gray-400 rounded-full"></div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-0.5 h-0.5 bg-gray-400 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {showTrash ? "Lixeira vazia" : "Crie um orçamento"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {showTrash
                    ? "Nenhum orçamento foi movido para a lixeira ainda."
                    : "Nenhum orçamento para exibir, crie um novo agora para avançar no seu projeto"}
                </p>
                {!showTrash && (
                  <div className="flex flex-col gap-3">
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-white gap-2 px-4 py-2"
                      onClick={() => setIsCreatingBudget(true)}
                    >
                      <PlusCircle className="h-4 w-4" />
                      Gerar um orçamento
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Se há orçamentos, mostrar a tabela
    return (
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
                <th className="px-6 py-4 text-center font-medium">Editar</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="text-center py-10">
                    Carregando orçamentos...
                  </td>
                </tr>
              ) : (
                currentItems.map((budget) => {
                  // Convertendo para o tipo Budget para acessar as propriedades de status
                  const budgetData = convertToBudget(budget);

                  return (
                    <tr
                      key={budget.id}
                      className="border-b last:border-0 hover:bg-muted/30 cursor-pointer"
                      onClick={() => openBudgetDetailModal(budget)}
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
                            budgetData.status === "Completo" ||
                            budgetData.status === "aceito"
                              ? "bg-green-100 text-green-800"
                              : budgetData.status === "Pendente" ||
                                budgetData.status === "publicado"
                              ? "bg-amber-100 text-amber-800"
                              : budgetData.status === "Fechado"
                              ? "bg-gray-100 text-gray-800"
                              : budgetData.status === "Vencido" ||
                                budgetData.status === "Não gerado"
                              ? "bg-red-100 text-red-800"
                              : budgetData.status === "Visualizado" ||
                                budgetData.status === "gerado"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {budgetData.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-center">
                        {showTrash ? (
                          <div className="flex gap-2">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                restoreFromTrash(budget.id);
                              }}
                              className="h-10 w-10 rounded-full bg-green-100 text-green-600 hover:bg-green-200 hover:text-green-700 p-0 flex items-center justify-center shadow-sm"
                              title="Restaurar"
                            >
                              <ArrowLeftIcon className="h-5 w-5" />
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                deletePermanently(budget.id);
                              }}
                              className="h-10 w-10 rounded-full bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 p-0 flex items-center justify-center shadow-sm"
                              title="Excluir permanentemente"
                            >
                              <Trash2Icon className="h-5 w-5" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Aqui você pode adicionar a lógica de edição
                            }}
                            className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 hover:text-indigo-700 p-0 flex items-center justify-center shadow-sm"
                          >
                            <Pencil className="h-5 w-5" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {/* Paginação */}
        {currentItems.length > 0 && (
          <div className="flex items-center justify-between p-6 border-t">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>Mostrar</span>
              <select
                className="h-8 rounded-md border border-input bg-transparent px-3"
                value={itemsPerPage}
                onChange={(e) =>
                  handleItemsPerPageChange(Number(e.target.value))
                }
              >
                {itemsPerPageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <span>
                Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de{" "}
                {totalItems} itens
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                )
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Próximo
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const calculateTotalRevenue = () => {
    return budgets.reduce((sum, budget) => sum + budget.total, 0);
  };

  const calculateTotalCosts = () => {
    return budgets.reduce((sum, budget) => {
      // Calcular custo baseado no total se não existir
      const cost = budget.cost || budget.total * 0.7;
      return sum + cost;
    }, 0);
  };

  const calculateTotalProfit = () => {
    return budgets.reduce((sum, budget) => {
      // Calcular lucro baseado no total se não existir
      const cost = budget.cost || budget.total * 0.7;
      const profit = budget.profit || budget.total - cost;
      return sum + profit;
    }, 0);
  };

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
          fetchBudgets={fetchBudgets}
          selectedBudgetType={selectedBudgetType}
          setSelectedBudgetType={setSelectedBudgetType}
          budgetStep={budgetStep}
          setBudgetStep={setBudgetStep}
        />
      ) : (
        <>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold">Orçamentos</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button className="gap-2 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs text-gray-900">
                <CalendarIcon className="h-4 w-4 text-gray-900" />
                {new Date().toLocaleDateString("pt-BR", {
                  month: "long",
                  year: "numeric",
                })}
              </Button>

              <div className="flex items-center gap-3">
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
          </div>

          {view === "list" && (
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
                        {formatCurrency(calculateTotalRevenue()).slice(3)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-500 text-sm mt-1">
                    <span>{percentuais.faturamento >= 0 ? "↑" : "↓"}</span>
                    <span>{Math.abs(percentuais.faturamento).toFixed(2)}%</span>
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
                      <span className="text-lg">R$</span>
                      <span className="text-2xl font-medium">
                        {formatCurrency(calculateTotalCosts()).slice(3)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-500 text-sm mt-1">
                    <span>{percentuais.gastosFixos >= 0 ? "↑" : "↓"}</span>
                    <span>{Math.abs(percentuais.gastosFixos).toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-muted-foreground">Lucro</span>
                  <div className="flex items-baseline gap-2">
                    <div
                      className={`flex items-center gap-1 ${
                        calculateTotalProfit() < 0 ? "text-red-500" : ""
                      }`}
                    >
                      <span className="text-lg">R$</span>
                      <span className="text-2xl font-medium">
                        {calculateTotalProfit() < 0 ? "-" : ""}
                        {formatCurrency(Math.abs(calculateTotalProfit())).slice(
                          3
                        )}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`flex items-center gap-1 ${
                      percentuais.lucro >= 0
                        ? "text-emerald-500"
                        : "text-red-500"
                    } text-sm mt-1`}
                  >
                    <span>{percentuais.lucro >= 0 ? "↑" : "↓"}</span>
                    <span>{Math.abs(percentuais.lucro).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="flex items-center gap-2 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-4 text-xs text-gray-900">
                    <ChevronDownIcon className="h-4 w-4 text-gray-900" />
                    {statusFilter === "todos" ? "Status" : statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setStatusFilter("todos")}>
                    Todos
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("gerado")}>
                    Gerado
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStatusFilter("publicado")}
                  >
                    Publicado
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("aceito")}>
                    Aceito
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="flex items-center gap-2 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-4 text-xs text-gray-900">
                    <ChevronDownIcon className="h-4 w-4 text-gray-900" />
                    Filtros
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Ordenar por data</DropdownMenuItem>
                  <DropdownMenuItem>Ordenar por valor</DropdownMenuItem>
                  <DropdownMenuItem>Ordenar por cliente</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                className="flex items-center gap-2 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-4 text-xs text-gray-900"
                onClick={() => setIsClientModalOpen(true)}
              >
                <UserIcon className="h-4 w-4" />
                Clientes
              </Button>

              <Button
                className={`flex items-center gap-2 border h-9 rounded-md px-4 text-xs ${
                  showTrash
                    ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                    : "border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground text-gray-900"
                }`}
                onClick={() => setShowTrash(!showTrash)}
              >
                <Trash2Icon className="h-4 w-4" />
                Lixeira
              </Button>
            </div>
          </div>

          {view === "list" ? (
            renderTable()
          ) : !Array.isArray(budgets) || budgets.length === 0 ? (
            <div className="rounded-lg border bg-card shadow-sm">
              <div className="flex flex-col items-center justify-center py-16">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-1 h-1 bg-gray-400 rounded-full"></div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-0.5 h-0.5 bg-gray-400 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {showTrash ? "Lixeira vazia" : "Crie um orçamento"}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {showTrash
                        ? "Nenhum orçamento foi movido para a lixeira ainda."
                        : "Nenhum orçamento para exibir, crie um novo agora para avançar no seu projeto"}
                    </p>
                    {!showTrash && (
                      <div className="flex flex-col gap-3">
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-white gap-2 px-4 py-2"
                          onClick={() => setIsCreatingBudget(true)}
                        >
                          <PlusCircle className="h-4 w-4" />
                          Gerar um orçamento
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <BudgetKanban
              columns={columns}
              setColumns={setColumns}
              columnOrder={columnOrder}
              setColumnOrder={setColumnOrder}
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
        onMoveToTrash={moveToTrash}
      />
    </div>
  );
}
