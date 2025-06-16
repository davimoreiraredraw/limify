"use client";

import { X, Pencil, Eye, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Budget } from "@/app/(dashboard)/dashboard/orcamentos/types";
import { useState } from "react";
import { formatCurrency } from "@/app/lib/expenses";

interface ClientBudgetDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget | null;
}

export default function ClientBudgetDetailModal({
  isOpen,
  onClose,
  budget,
}: ClientBudgetDetailModalProps) {
  const [hiddenValues, setHiddenValues] = useState({
    cost: false,
    price: false,
    profit: false,
  });

  if (!isOpen || !budget) return null;

  const toggleValueVisibility = (field: keyof typeof hiddenValues) => {
    setHiddenValues((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Detalhes do Orçamento</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Informações Básicas
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Projeto</p>
                  <p className="font-medium">{budget.project}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cliente</p>
                  <p className="font-medium">{budget.client}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Empresa</p>
                  <p className="font-medium">{budget.company}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Data</p>
                  <p className="font-medium">{budget.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="flex items-center mt-1">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium ${
                        budget.status === "Visualizado"
                          ? "bg-blue-100 text-blue-800"
                          : budget.status === "Não gerado"
                          ? "bg-gray-100 text-gray-800"
                          : budget.status === "Pendente"
                          ? "bg-yellow-100 text-yellow-800"
                          : budget.status === "Completo"
                          ? "bg-green-100 text-green-800"
                          : budget.status === "Fechado"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {budget.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Valores</h3>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">Custo</p>
                    <button
                      onClick={() => toggleValueVisibility("cost")}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {hiddenValues.cost ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-lg font-bold">
                    {hiddenValues.cost ? "••••••" : formatCurrency(budget.cost)}
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">Preço</p>
                    <button
                      onClick={() => toggleValueVisibility("price")}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {hiddenValues.price ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-lg font-bold">
                    {hiddenValues.price
                      ? "••••••"
                      : formatCurrency(budget.price)}
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">Lucro</p>
                    <button
                      onClick={() => toggleValueVisibility("profit")}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {hiddenValues.profit ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-lg font-bold">
                    {hiddenValues.profit
                      ? "••••••"
                      : formatCurrency(budget.profit)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">Status de Produção</h3>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full"
                style={{
                  width:
                    budget.status === "Fechado"
                      ? "100%"
                      : budget.status === "Completo"
                      ? "75%"
                      : budget.status === "Pendente"
                      ? "50%"
                      : budget.status === "Visualizado"
                      ? "25%"
                      : "10%",
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Início</span>
              <span>Em andamento</span>
              <span>Finalizado</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
            <Button className="bg-indigo-600 text-white hover:bg-indigo-700">
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
