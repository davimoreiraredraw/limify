"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatCurrency } from "@/app/lib/expenses";
import SquareMeterBudgetForm from "@/components/orcamentos/SquareMeterBudgetForm";

interface SearchParams {
  [key: string]: string | string[] | undefined;
}

interface Props {
  searchParams: SearchParams;
}

interface Budget {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  price?: number;
  total?: number;
  status: "draft" | "sent" | "approved" | "rejected";
}

interface BudgetFormData {
  name: string;
  description?: string;
  total: number;
  items: Array<{
    id: string;
    name: string;
    description?: string;
    price: number;
    quantity: number;
    total: number;
  }>;
}

export default function OrcamentosPage({ searchParams }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBudgetType, setSelectedBudgetType] = useState<string | null>(
    null
  );
  const [budgetStep, setBudgetStep] = useState(1);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  // Função para buscar orçamentos
  const fetchBudgets = async () => {
    try {
      const response = await fetch("/api/budgets");
      const data = await response.json();
      setBudgets(data.budgets);
    } catch (error) {
      toast.error("Erro ao carregar orçamentos");
    } finally {
      setIsLoading(false);
    }
  };

  // Função para formatar o status do orçamento
  const formatStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      draft: "Rascunho",
      sent: "Enviado",
      approved: "Aprovado",
      rejected: "Rejeitado",
    };
    return statusMap[status] || status;
  };

  // Função para formatar a data
  const formatDate = (date: string) => {
    return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: pt });
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  useEffect(() => {
    if (selectedBudgetType) {
      setBudgetStep(1);
    }
  }, [selectedBudgetType]);

  useEffect(() => {
    if (budgetStep === 0) {
      setSelectedBudgetType(null);
      setBudgetStep(1);
    }
  }, [budgetStep]);

  const renderBudgetForm = () => {
    if (!selectedBudgetType) return null;

    if (selectedBudgetType === "m2") {
      return (
        <SquareMeterBudgetForm
          budgetStep={budgetStep}
          setBudgetStep={setBudgetStep}
        />
      );
    }

    if (selectedBudgetType === "fixed") {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">
            O formulário de orçamento com valor fixo ainda está em
            desenvolvimento.
          </p>
          <Button
            onClick={() => setSelectedBudgetType(null)}
            className="mt-4"
            variant="outline"
          >
            Voltar
          </Button>
        </div>
      );
    }

    return null;
  };

  if (selectedBudgetType) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => setSelectedBudgetType(null)}
            className="mr-4"
          >
            ←
          </Button>
          <h1 className="text-2xl font-bold">Novo Orçamento</h1>
        </div>
        {renderBudgetForm()}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orçamentos</h1>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Criar orçamento
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Carregando orçamentos...</p>
        </div>
      ) : budgets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Nenhum orçamento encontrado
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Comece criando um novo orçamento.
          </p>
          <div className="mt-6">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Criar orçamento
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Nome
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Data
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Valor
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {budgets.map((budget) => (
                  <tr key={budget.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {budget.name}
                      </div>
                      {budget.description && (
                        <div className="text-sm text-gray-500">
                          {budget.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(budget.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(budget.price || budget.total || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          budget.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : budget.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : budget.status === "sent"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {formatStatus(budget.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={() => setSelectedBudget(budget)}
                      >
                        Visualizar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de seleção de tipo de orçamento */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">
              Selecione o tipo de orçamento
            </h2>
            <div className="space-y-4">
              <button
                className="w-full p-4 border rounded-lg hover:bg-gray-50 text-left"
                onClick={() => {
                  setSelectedBudgetType("m2");
                  setIsModalOpen(false);
                  setBudgetStep(1);
                }}
              >
                <div className="font-medium">Por metro quadrado</div>
                <div className="text-sm text-gray-500">
                  Orçamento baseado na área do projeto
                </div>
              </button>
              <button
                className="w-full p-4 border rounded-lg hover:bg-gray-50 text-left"
                onClick={() => {
                  setSelectedBudgetType("fixed");
                  setIsModalOpen(false);
                  setBudgetStep(1);
                }}
              >
                <div className="font-medium">Valor fixo</div>
                <div className="text-sm text-gray-500">
                  Orçamento com valor predefinido
                </div>
              </button>
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="mr-2"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
