"use client";

import {
  CalendarIcon,
  ChevronDownIcon,
  Pencil,
  PlusCircle,
  TagIcon,
  Trash2Icon,
  ArrowLeftIcon, // Corrigido de ArrowUturnLeftIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ExpenseModal from "@/app/components/ExpenseModal";
import CategoryModal from "@/app/components/CategoryModal";
import {
  fetchExpenses,
  Expense,
  calculateMonthlyValue,
  calculateAnnualValue,
  formatCurrency,
} from "@/app/lib/expenses";
import { fetchCategories, Category } from "@/app/lib/categories";
import { Toaster, toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Frequências de compensação suportadas
const compensacoes = ["Anual", "Mensal", "Semanal", "Diário", "Único"];

export default function DespesasPage() {
  const searchParams = useSearchParams();
  const shouldHighlight = searchParams.get("highlight") === "add-expense";
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<"fixas" | "pontuais" | "lixeira">(
    "fixas"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [openSelect, setOpenSelect] = useState<{
    tipo: "categoria" | "compensacao" | null;
    index: number | null;
  }>({
    tipo: null,
    index: null,
  });
  const [modalAberto, setModalAberto] = useState(false);
  const [despesas, setDespesas] = useState<Expense[]>([]);
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalFixas, setTotalFixas] = useState(0);
  const [totalPontuais, setTotalPontuais] = useState(0);
  const [custoHora, setCustoHora] = useState(0);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [modalCategoriaAberto, setModalCategoriaAberto] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  // Buscar dados da API
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Buscar categorias
      const categoriasData = await fetchCategories();
      setCategorias(categoriasData);

      // Buscar todas as despesas
      const despesasData = await fetchExpenses("all");
      console.log("Despesas atualizadas:", despesasData); // Log para debug
      setDespesas(despesasData);

      // Calcular totais (movido para o useEffect)
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (shouldHighlight) {
      setIsHighlighted(true);
      // Remove o highlight após 3 segundos
      const timer = setTimeout(() => {
        setIsHighlighted(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [shouldHighlight]);

  const handleSelectClick = (
    tipo: "categoria" | "compensacao",
    index: number
  ) => {
    if (openSelect.tipo === tipo && openSelect.index === index) {
      setOpenSelect({ tipo: null, index: null });
    } else {
      setOpenSelect({ tipo, index });
    }
  };

  const handleOptionSelect = async (
    tipo: "categoria" | "compensacao",
    expenseId: string,
    value: string
  ) => {
    setOpenSelect({ tipo: null, index: null });

    try {
      const expense = despesas.find((d) => d.id === expenseId);
      if (!expense) return;

      // Atualizar a despesa na API
      // Aqui precisaríamos implementar a chamada de atualização no backend

      // Atualizamos localmente por enquanto
      toast.success(
        `${tipo === "categoria" ? "Categoria" : "Frequência"} atualizada`
      );

      // Recarregar os dados
      fetchData();
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      toast.error("Erro ao atualizar despesa");
    }
  };

  // Fecha o select se clicar fora dele
  const handleClickOutside = () => {
    if (openSelect.tipo) {
      setOpenSelect({ tipo: null, index: null });
    }
  };

  // Funções para o modal de adicionar despesa
  const abrirModal = (expense?: Expense) => {
    if (expense) {
      setExpenseToEdit(expense);
    } else {
      setExpenseToEdit(null);
    }
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setExpenseToEdit(null);
  };

  const handleSubmitDespesa = (success: boolean) => {
    if (success) {
      fetchData();
    }
  };

  // Funções para o modal de categoria
  const abrirModalCategoria = (category?: Category) => {
    if (category) {
      setCategoryToEdit(category);
    } else {
      setCategoryToEdit(null);
    }
    setModalCategoriaAberto(true);
  };

  const fecharModalCategoria = () => {
    setModalCategoriaAberto(false);
    setCategoryToEdit(null);
  };

  const handleSubmitCategoria = (success: boolean) => {
    if (success) {
      fetchData();
    }
  };

  // Função para mover para lixeira
  const handleMoveToTrash = async (id: string) => {
    try {
      const response = await fetch("/api/expenses", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, action: "trash" }),
      });

      if (!response.ok) throw new Error("Falha ao mover para lixeira");

      toast.success("Despesa movida para lixeira");
      fetchData(); // Recarrega os dados
    } catch (error) {
      console.error("Erro ao mover para lixeira:", error);
      toast.error("Erro ao mover para lixeira");
    }
  };

  // Função para restaurar da lixeira
  const handleRestoreFromTrash = async (id: string) => {
    try {
      const response = await fetch("/api/expenses", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, action: "restore" }),
      });

      if (!response.ok) throw new Error("Falha ao restaurar da lixeira");

      toast.success("Despesa restaurada com sucesso");
      fetchData(); // Recarrega os dados
    } catch (error) {
      console.error("Erro ao restaurar da lixeira:", error);
      toast.error("Erro ao restaurar despesa");
    }
  };

  // Função para deletar permanentemente
  const handlePermanentDelete = async (id: string) => {
    if (
      !confirm(
        "Tem certeza que deseja deletar permanentemente esta despesa? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/expenses?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Falha ao deletar permanentemente");

      toast.success("Despesa deletada permanentemente");
      fetchData(); // Recarrega os dados
    } catch (error) {
      console.error("Erro ao deletar permanentemente:", error);
      toast.error("Erro ao deletar despesa");
    }
  };

  // Modificar a função handleDelete existente para usar o novo sistema de lixeira
  const handleDelete = async (id: string) => {
    if (!confirm("Mover esta despesa para a lixeira?")) {
      return;
    }
    await handleMoveToTrash(id);
  };

  // Lista de meses
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(i);
    return date;
  });

  // Filtrar despesas com base na aba ativa e mês selecionado
  const despesasFiltradas = despesas.filter((despesa) => {
    const despesaDate = new Date(despesa.created_at);
    const isSameMonth =
      despesaDate.getMonth() === selectedMonth.getMonth() &&
      despesaDate.getFullYear() === selectedMonth.getFullYear();

    if (abaAtiva === "lixeira") {
      return despesa.is_deleted === true && isSameMonth;
    }
    return (
      !despesa.is_deleted &&
      (abaAtiva === "fixas" ? despesa.is_fixed : !despesa.is_fixed) &&
      isSameMonth
    );
  });

  // Calcular totais apenas das despesas não deletadas
  useEffect(() => {
    const despesasFixas = despesas.filter((d) => d.is_fixed && !d.is_deleted);
    const despesasPontuais = despesas.filter(
      (d) => !d.is_fixed && !d.is_deleted
    );

    const totalMensalFixas = despesasFixas.reduce(
      (acc, d) => acc + calculateMonthlyValue(d.value, d.frequency),
      0
    );

    const totalMensalPontuais = despesasPontuais.reduce(
      (acc, d) => acc + calculateMonthlyValue(d.value, d.frequency),
      0
    );

    let parsedTotalMensalFixas = parseFloat(totalMensalFixas.toString());
    let parsedTotalMensalPontuais = parseFloat(totalMensalPontuais.toString());
    setTotalFixas(parsedTotalMensalFixas);
    setTotalPontuais(parsedTotalMensalPontuais);

    // Cálculo do custo hora
    const totalMensal = parsedTotalMensalFixas + parsedTotalMensalPontuais;
    setCustoHora(totalMensal / 160);
  }, [despesas]);

  // Lógica de paginação
  const totalItems = despesasFiltradas.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = despesasFiltradas.slice(startIndex, endIndex);

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

  return (
    <div className="flex flex-col gap-8" onClick={handleClickOutside}>
      <Toaster position="top-center" />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Despesas</h1>
        <Select
          value={selectedMonth.getMonth().toString()}
          onValueChange={(value) => {
            const newDate = new Date();
            newDate.setMonth(parseInt(value));
            setSelectedMonth(newDate);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <CalendarIcon className="h-4 w-4 mr-2" />
            <SelectValue>
              {format(selectedMonth, "MMMM 'de' yyyy", { locale: ptBR })}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem
                key={month.getMonth()}
                value={month.getMonth().toString()}
              >
                {format(month, "MMMM", { locale: ptBR })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">
              Despesas fixas
            </span>
            <div className="flex items-baseline gap-2">
              <div className="flex items-center gap-1 text-red-500">
                <span className="text-lg">R$ -</span>
                <span className="text-2xl font-medium">
                  {formatCurrency(totalFixas).replace("R$", "")}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-red-500 text-sm">
              <span>↑</span>
              <span>2.29%</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">
              Despesas pontuais
            </span>
            <div className="flex items-baseline gap-2">
              <div className="flex items-center gap-1 text-red-500">
                <span className="text-lg">R$ -</span>
                <span className="text-2xl font-medium">
                  {formatCurrency(totalPontuais).replace("R$", "")}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-emerald-500 text-sm">
              <span>↓</span>
              <span>2.29%</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">
              Custo hora do escritório
            </span>
            <div className="flex items-baseline gap-2">
              <div className="flex items-center gap-1 text-red-500">
                <span className="text-lg">R$ -</span>
                <span className="text-2xl font-medium">
                  {formatCurrency(custoHora).replace("R$", "")} h
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-emerald-500 text-sm">
              <span>↑</span>
              <span>2.29%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="w-full flex">
          <style jsx global>{`
            .custom-tabs [data-state="active"] {
              background-color: #4f46e5 !important;
              color: white !important;
            }
          `}</style>
          <Tabs
            value={abaAtiva}
            onValueChange={(value) =>
              setAbaAtiva(value as "fixas" | "pontuais" | "lixeira")
            }
            className="w-full custom-tabs"
          >
            <TabsList className="w-fit bg-transparent h-auto p-0 space-x-2">
              <TabsTrigger
                value="fixas"
                className="px-4 py-2 rounded-lg border data-[state=inactive]:border-gray-200"
              >
                Despesas fixas
              </TabsTrigger>
              <TabsTrigger
                value="pontuais"
                className="px-4 py-2 rounded-lg border data-[state=inactive]:border-gray-200"
              >
                Despesas pontuais
              </TabsTrigger>
              <TabsTrigger
                value="lixeira"
                className="px-4 py-2 rounded-lg border data-[state=inactive]:border-gray-200"
              >
                Lixeira
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Botões de ação */}
        <div className="flex flex-wrap md:flex-nowrap gap-2">
          {abaAtiva !== "lixeira" ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 text-xs px-3 py-1 h-8 gap-1 border-red-200"
                onClick={() => setAbaAtiva("lixeira")}
              >
                <Trash2Icon className="h-4 w-4" />
                Lixeira{" "}
                {despesas.filter((d) => d.is_deleted).length > 0 &&
                  `(${despesas.filter((d) => d.is_deleted).length})`}
              </Button>
              {/* <Button
                variant="outline"
                size="sm"
                className="text-amber-600 text-xs px-3 py-1 h-8 gap-1 border-amber-200"
              >
                <TagIcon className="h-4 w-4" />
                Arquivados
              </Button> */}
              <div className="ml-auto flex gap-2">
                <Button
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1 px-3 py-1 h-8"
                  onClick={() => abrirModalCategoria()}
                >
                  <TagIcon className="h-4 w-4" />
                  Criar categoria
                </Button>
                <Button
                  size="sm"
                  className={`bg-red-500 hover:bg-red-600 text-white gap-1 px-3 py-1 h-8 relative ${
                    isHighlighted
                      ? "ring-4 ring-red-300 ring-opacity-50 animate-pulse"
                      : ""
                  }`}
                  onClick={() => abrirModal()}
                >
                  <PlusCircle className="h-4 w-4" />
                  Adicionar despesa
                </Button>
              </div>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="text-gray-500 text-xs px-3 py-1 h-8 gap-1"
              onClick={() => setAbaAtiva("fixas")}
            >
              Voltar
            </Button>
          )}
        </div>

        {/* Tabela */}
        {currentItems.length === 0 && !isLoading ? (
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="flex flex-col items-center justify-center py-16">
              {abaAtiva === "lixeira" ? (
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Lixeira vazia
                  </h3>
                  <p className="text-gray-600">
                    Nenhuma despesa foi movida para a lixeira ainda.
                  </p>
                </div>
              ) : abaAtiva === "fixas" ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <div className="flex flex-col items-center justify-center w-4 h-4">
                        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mb-0.5"></div>
                        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mb-0.5"></div>
                        <div className="w-2.5 h-1 bg-gray-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Ufa, ou não...
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Você ainda não tem nenhum despesa fixa, cadastre agora
                      para que seus orçamentos sejam gerados com precisão.
                    </p>
                    <Button
                      size="sm"
                      className="bg-red-500 hover:bg-red-600 text-white gap-2 px-4 py-2"
                      onClick={() => abrirModal()}
                    >
                      <PlusCircle className="h-4 w-4" />
                      Adicionar despesa
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nenhuma despesa pontual
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Você ainda não tem nenhuma despesa pontual cadastrada.
                  </p>
                  <Button
                    size="sm"
                    className="bg-red-500 hover:bg-red-600 text-white gap-2 px-4 py-2"
                    onClick={() => abrirModal()}
                  >
                    <PlusCircle className="h-4 w-4" />
                    Adicionar despesa
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium w-[40px]">
                      <input type="checkbox" className="rounded" />
                    </th>
                    <th className="px-4 py-3 text-left font-medium">Despesa</th>
                    <th className="px-4 py-3 text-left font-medium">
                      Categoria
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                      Compensação
                    </th>
                    <th className="px-4 py-3 text-left font-medium">Data</th>
                    <th className="px-4 py-3 text-left font-medium">
                      Valor mensal
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                      Valor ano
                    </th>
                    <th className="px-4 py-3 text-left font-medium">Editar</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8">
                        Carregando despesas...
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((despesa) => {
                      const valorMensal = calculateMonthlyValue(
                        despesa.value,
                        despesa.frequency
                      );
                      const valorAnual = calculateAnnualValue(
                        despesa.value,
                        despesa.frequency
                      );
                      const categoria = categorias.find(
                        (c) => c.id === despesa.category_id
                      );

                      return (
                        <tr key={despesa.id} className="border-b last:border-0">
                          <td className="whitespace-nowrap px-4 py-3">
                            <input type="checkbox" className="rounded" />
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 font-medium">
                            <div>
                              <div>{despesa.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {despesa.description}
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <div
                              className="flex items-center w-[130px] h-9 px-3 rounded-md text-sm"
                              style={{
                                backgroundColor: `${categoria?.color}10`,
                                borderLeft: `4px solid ${
                                  categoria?.color || "#e5e7eb"
                                }`,
                              }}
                            >
                              {categoria?.name || "Sem categoria"}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm">
                            {despesa.frequency}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                            {new Date(despesa.created_at).toLocaleDateString(
                              "pt-BR"
                            )}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-red-500">
                            {formatCurrency(valorMensal)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-red-500">
                            {formatCurrency(valorAnual)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            {abaAtiva === "lixeira" ? (
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-green-600"
                                  onClick={() =>
                                    handleRestoreFromTrash(despesa.id)
                                  }
                                  title="Restaurar"
                                >
                                  <ArrowLeftIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600"
                                  onClick={() =>
                                    handlePermanentDelete(despesa.id)
                                  }
                                  title="Deletar permanentemente"
                                >
                                  <Trash2Icon className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-indigo-600"
                                onClick={() => abrirModal(despesa)}
                              >
                                <Pencil className="h-4 w-4" />
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
          </div>
        )}

        {/* Paginação */}
        {currentItems.length > 0 && (
          <div className="flex items-center justify-between">
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

      {/* Modal de adicionar/editar despesa componentizado */}
      <ExpenseModal
        isOpen={modalAberto}
        onClose={fecharModal}
        onSubmit={handleSubmitDespesa}
        categories={categorias}
        compensacoes={compensacoes}
        initialData={
          expenseToEdit
            ? {
                id: expenseToEdit.id,
                name: expenseToEdit.name,
                description: expenseToEdit.description || "",
                value: formatCurrency(expenseToEdit.value)
                  .replace("R$", "")
                  .trim(),
                frequency: expenseToEdit.frequency,
                compensation_day:
                  expenseToEdit.compensation_day?.toString() || "",
                category_id: expenseToEdit.category_id,
                is_fixed: expenseToEdit.is_fixed,
              }
            : undefined
        }
        isEdit={!!expenseToEdit}
      />

      {/* Modal de adicionar/editar categoria */}
      <CategoryModal
        isOpen={modalCategoriaAberto}
        onClose={fecharModalCategoria}
        onSubmit={handleSubmitCategoria}
        initialData={
          categoryToEdit
            ? {
                id: categoryToEdit.id,
                name: categoryToEdit.name,
              }
            : undefined
        }
        isEdit={!!categoryToEdit}
      />
    </div>
  );
}
