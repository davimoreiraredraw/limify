"use client";

import {
  CalendarIcon,
  ChevronDownIcon,
  Pencil,
  PlusCircle,
  TagIcon,
  Trash2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import ExpenseModal from "@/app/components/ExpenseModal";
import {
  fetchExpenses,
  Expense,
  calculateMonthlyValue,
  calculateAnnualValue,
  formatCurrency,
} from "@/app/lib/expenses";
import { fetchCategories, Category } from "@/app/lib/categories";
import { Toaster, toast } from "sonner";

// Frequências de compensação suportadas
const compensacoes = ["Anual", "Mensal", "Semanal", "Diário", "Único"];

export default function DespesasPage() {
  const [abaAtiva, setAbaAtiva] = useState<"fixas" | "pontuais">("fixas");
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

  // Buscar dados da API
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Buscar categorias
      const categoriasData = await fetchCategories();
      setCategorias(categoriasData);

      // Buscar todas as despesas
      const despesasData = await fetchExpenses("all");
      setDespesas(despesasData);

      // Calcular totais
      const despesasFixas = despesasData.filter((d) => d.is_fixed);
      const despesasPontuais = despesasData.filter((d) => !d.is_fixed);

      const totalMensalFixas = despesasFixas.reduce(
        (acc, d) => acc + calculateMonthlyValue(d.value, d.frequency),
        0
      );

      const totalMensalPontuais = despesasPontuais.reduce(
        (acc, d) => acc + calculateMonthlyValue(d.value, d.frequency),
        0
      );

      setTotalFixas(totalMensalFixas);
      setTotalPontuais(totalMensalPontuais);

      // Cálculo simples do custo hora (total mensal / 160 horas no mês)
      const totalMensal = totalMensalFixas + totalMensalPontuais;
      setCustoHora(totalMensal / 160);
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

  const handleSelectClick = (
    tipo: "categoria" | "compensacao",
    index: number
  ) => {
    if (openSelect.tipo === tipo && openSelect.index === index) {
      // Se o mesmo select está aberto, fecha ele
      setOpenSelect({ tipo: null, index: null });
    } else {
      // Caso contrário, abre o select clicado
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

  // Filtrar despesas com base na aba ativa
  const despesasFiltradas = despesas.filter((despesa) =>
    abaAtiva === "fixas" ? despesa.is_fixed : !despesa.is_fixed
  );

  return (
    <div className="flex flex-col gap-8 p-8" onClick={handleClickOutside}>
      <Toaster position="top-center" />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Despesas</h1>
        <Button variant="outline" size="sm" className="gap-2">
          <CalendarIcon className="h-4 w-4" />
          {new Date().toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          })}
        </Button>
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
              setAbaAtiva(value as "fixas" | "pontuais")
            }
            className="w-full custom-tabs"
          >
            <TabsList className="w-fit bg-transparent h-auto p-0">
              <TabsTrigger
                value="fixas"
                className="px-4 py-2 rounded-l-md border data-[state=inactive]:border-gray-200 data-[state=inactive]:border-r-0"
              >
                Despesas fixas
              </TabsTrigger>
              <TabsTrigger
                value="pontuais"
                className="px-4 py-2 rounded-r-md border data-[state=inactive]:border-gray-200"
              >
                Despesas pontuais
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex flex-wrap md:flex-nowrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-red-500 text-xs px-3 py-1 h-8 gap-1 border-red-200"
          >
            <Trash2Icon className="h-4 w-4" />
            Lixeira
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-amber-600 text-xs px-3 py-1 h-8 gap-1 border-amber-200"
          >
            <TagIcon className="h-4 w-4" />
            Arquivados
          </Button>
          <div className="ml-auto flex gap-2">
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1 px-3 py-1 h-8"
            >
              <TagIcon className="h-4 w-4" />
              Criar categoria
            </Button>
            <Button
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white gap-1 px-3 py-1 h-8"
              onClick={() => abrirModal()}
            >
              <PlusCircle className="h-4 w-4" />
              Adicionar despesa
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card shadow-sm">
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left font-medium w-[40px]">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Despesa</th>
                  <th className="px-4 py-3 text-left font-medium">Categoria</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Compensação
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Data</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Valor mensal
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Valor ano</th>
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
                ) : despesasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8">
                      Nenhuma despesa{" "}
                      {abaAtiva === "fixas" ? "fixa" : "pontual"} encontrada
                    </td>
                  </tr>
                ) : (
                  despesasFiltradas.map((despesa) => {
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
                            className="relative"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <div
                              className="relative flex items-center w-[130px] h-9 border rounded-md cursor-pointer hover:border-gray-400"
                              onClick={() =>
                                handleSelectClick(
                                  "categoria",
                                  Number(despesa.id)
                                )
                              }
                              style={{
                                borderColor: categoria?.color,
                                backgroundColor: `${categoria?.color}10`,
                              }}
                            >
                              <span className="px-3 text-sm">
                                {categoria?.name || "Categoria"}
                              </span>
                              <div className="absolute right-0 top-0 h-full flex items-center justify-center pr-2">
                                <ChevronDownIcon className="h-4 w-4" />
                              </div>
                            </div>

                            {openSelect.tipo === "categoria" &&
                              openSelect.index === Number(despesa.id) && (
                                <div className="absolute z-10 mt-1 w-[130px] bg-white border rounded-md shadow-lg">
                                  {categorias.map((categoria) => (
                                    <div
                                      key={categoria.id}
                                      className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                                      onClick={() =>
                                        handleOptionSelect(
                                          "categoria",
                                          despesa.id,
                                          categoria.id
                                        )
                                      }
                                      style={{
                                        borderLeft: `4px solid ${categoria.color}`,
                                      }}
                                    >
                                      {categoria.name}
                                    </div>
                                  ))}
                                </div>
                              )}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <div
                            className="relative"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <div
                              className="relative flex items-center w-[130px] h-9 border rounded-md cursor-pointer hover:border-gray-400"
                              onClick={() =>
                                handleSelectClick(
                                  "compensacao",
                                  Number(despesa.id)
                                )
                              }
                            >
                              <span className="px-3 text-sm">
                                {despesa.frequency}
                              </span>
                              <div className="absolute right-0 top-0 h-full flex items-center justify-center pr-2">
                                <ChevronDownIcon className="h-4 w-4" />
                              </div>
                            </div>

                            {openSelect.tipo === "compensacao" &&
                              openSelect.index === Number(despesa.id) && (
                                <div className="absolute z-10 mt-1 w-[130px] bg-white border rounded-md shadow-lg">
                                  {compensacoes.map(
                                    (compensacao, compIndex) => (
                                      <div
                                        key={compIndex}
                                        className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                                        onClick={() =>
                                          handleOptionSelect(
                                            "compensacao",
                                            despesa.id,
                                            compensacao
                                          )
                                        }
                                      >
                                        {compensacao}
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                          </div>
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-indigo-600"
                            onClick={() => abrirModal(despesa)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {despesasFiltradas.length} de {despesasFiltradas.length}{" "}
            itens
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Anterior
            </Button>
            <Button variant="outline" size="sm" disabled>
              Próximo
            </Button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 right-4 flex items-center gap-2 text-sm bg-white p-2 rounded-lg shadow-md">
        <button className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
          -
        </button>
        <span>10</span>
        <button className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
          +
        </button>
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
    </div>
  );
}
