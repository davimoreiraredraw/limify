"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { formatCurrency } from "@/app/lib/expenses";

interface OrcamentoItemSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: OrcamentoItem) => void;
  initialItem?: OrcamentoItem;
}

export interface OrcamentoItem {
  id?: string;
  nome: string;
  descricao: string;
  valorM2: number;
  quantidadeM2: number;
  total: number;
}

export default function OrcamentoItemSidebar({
  isOpen,
  onClose,
  onSave,
  initialItem,
}: OrcamentoItemSidebarProps) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valorM2, setValorM2] = useState<number>(0);
  const [quantidadeM2, setQuantidadeM2] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  // Inicializar formulário se estiver editando um item existente
  useEffect(() => {
    if (initialItem) {
      setNome(initialItem.nome);
      setDescricao(initialItem.descricao);
      setValorM2(initialItem.valorM2);
      setQuantidadeM2(initialItem.quantidadeM2);
      setTotal(initialItem.total);
    } else {
      // Valores default para novo item
      setNome("");
      setDescricao("");
      setValorM2(0);
      setQuantidadeM2(0);
      setTotal(0);
    }
  }, [initialItem]);

  // Calcular o total automaticamente quando o valor ou quantidade mudar
  useEffect(() => {
    setTotal(valorM2 * quantidadeM2);
  }, [valorM2, quantidadeM2]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item: OrcamentoItem = {
      id: initialItem?.id,
      nome,
      descricao,
      valorM2,
      quantidadeM2,
      total,
    };
    onSave(item);
    onClose();
  };

  const handleValorM2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value.replace(/[^\d.]/g, ""));
    setValorM2(isNaN(value) ? 0 : value);
  };

  const handleQuantidadeM2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value.replace(/[^\d.]/g, ""));
    setQuantidadeM2(isNaN(value) ? 0 : value);
  };

  return (
    <>
      {/* Overlay escuro */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[60]"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-[70] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">
              {initialItem ? "Editar item" : "Itens orçamento"}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-auto p-6 space-y-6"
          >
            {/* Nome */}
            <div className="space-y-2">
              <label htmlFor="nome" className="block text-sm font-medium">
                Nome
              </label>
              <input
                type="text"
                id="nome"
                placeholder="Nome do item"
                className="w-full p-3 text-sm border rounded-md bg-background"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <label htmlFor="descricao" className="block text-sm font-medium">
                Descrição
              </label>
              <textarea
                id="descricao"
                placeholder="Descrição do orçamento"
                className="w-full p-3 text-sm border rounded-md bg-background min-h-[80px]"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>

            {/* Valor m² */}
            <div className="space-y-2">
              <label htmlFor="valorM2" className="block text-sm font-medium">
                Valor m²
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  $
                </span>
                <input
                  type="text"
                  id="valorM2"
                  placeholder="150"
                  className="w-full p-3 pl-8 text-sm border rounded-md bg-background"
                  value={valorM2 === 0 ? "" : valorM2}
                  onChange={handleValorM2Change}
                  required
                />
              </div>
            </div>

            {/* Quantidade de m² */}
            <div className="space-y-2">
              <label
                htmlFor="quantidadeM2"
                className="block text-sm font-medium"
              >
                Quantidade de m²
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  📏
                </span>
                <input
                  type="text"
                  id="quantidadeM2"
                  placeholder="10 m²"
                  className="w-full p-3 pl-8 text-sm border rounded-md bg-background"
                  value={quantidadeM2 === 0 ? "" : `${quantidadeM2}`}
                  onChange={handleQuantidadeM2Change}
                  required
                />
              </div>
            </div>

            {/* Total */}
            <div className="space-y-2">
              <label htmlFor="total" className="block text-sm font-medium">
                Total
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  $
                </span>
                <input
                  type="text"
                  id="total"
                  placeholder="1500 Reais"
                  className="w-full p-3 pl-8 text-sm border rounded-md bg-background"
                  value={`${formatCurrency(total)} Reais`}
                  readOnly
                />
              </div>
            </div>
          </form>

          <div className="p-6 border-t flex justify-between">
            {initialItem && (
              <Button
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
                onClick={onClose}
              >
                Excluir
              </Button>
            )}
            <div className="flex gap-3 ml-auto">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={handleSubmit}
              >
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
