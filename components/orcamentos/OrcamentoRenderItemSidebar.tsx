"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { formatCurrency } from "@/app/lib/expenses";

interface OrcamentoRenderItemSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: OrcamentoRenderItem) => void;
  initialItem?: OrcamentoRenderItem;
}

export interface OrcamentoRenderItem {
  id?: string;
  nome: string;
  descricao: string;
  tempoDesenvolvimento: number; // em horas
  quantidadeImagens: number;
  grauComplexidade: "sem" | "baixa" | "media" | "alta";
  total: number;
}

export default function OrcamentoRenderItemSidebar({
  isOpen,
  onClose,
  onSave,
  initialItem,
}: OrcamentoRenderItemSidebarProps) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tempoDesenvolvimento, setTempoDesenvolvimento] = useState<number>(1);
  const [quantidadeImagens, setQuantidadeImagens] = useState<number>(1);
  const [grauComplexidade, setGrauComplexidade] = useState<
    "sem" | "baixa" | "media" | "alta"
  >("sem");
  const [total, setTotal] = useState<number>(0);

  // Inicializar formulário se estiver editando um item existente
  useEffect(() => {
    if (initialItem) {
      setNome(initialItem.nome);
      setDescricao(initialItem.descricao);
      setTempoDesenvolvimento(initialItem.tempoDesenvolvimento);
      setQuantidadeImagens(initialItem.quantidadeImagens);
      setGrauComplexidade(initialItem.grauComplexidade);
      setTotal(initialItem.total);
    } else {
      // Valores default para novo item
      setNome("");
      setDescricao("");
      setTempoDesenvolvimento(1);
      setQuantidadeImagens(1);
      setGrauComplexidade("sem");
      setTotal(0);
    }
  }, [initialItem]);

  // Calcular o total automaticamente quando os valores mudarem
  useEffect(() => {
    // Valores base por hora de trabalho
    const valorHora = 150;

    // Multiplicadores de complexidade
    const multiplicadores = {
      sem: 1,
      baixa: 1.2,
      media: 1.5,
      alta: 2,
    };

    // Cálculo do total
    const totalBase = tempoDesenvolvimento * valorHora;
    const totalComComplexidade = totalBase * multiplicadores[grauComplexidade];
    const totalFinal = totalComComplexidade * quantidadeImagens;

    setTotal(totalFinal);
  }, [tempoDesenvolvimento, quantidadeImagens, grauComplexidade]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item: OrcamentoRenderItem = {
      id: initialItem?.id,
      nome,
      descricao,
      tempoDesenvolvimento,
      quantidadeImagens,
      grauComplexidade,
      total,
    };
    onSave(item);
    onClose();
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {initialItem ? "Editar item" : "Novo item do orçamento"}
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

          {/* Tempo para desenvolver */}
          <div className="space-y-2">
            <label
              htmlFor="tempoDesenvolvimento"
              className="block text-sm font-medium"
            >
              Tempo para desenvolver
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                ⏱️
              </span>
              <input
                type="number"
                id="tempoDesenvolvimento"
                min="1"
                placeholder="1 hora"
                className="w-full p-3 pl-8 text-sm border rounded-md bg-background"
                value={tempoDesenvolvimento}
                onChange={(e) =>
                  setTempoDesenvolvimento(Number(e.target.value))
                }
                required
              />
            </div>
          </div>

          {/* Quantidade de imagens */}
          <div className="space-y-2">
            <label
              htmlFor="quantidadeImagens"
              className="block text-sm font-medium"
            >
              Quantidade de imagens
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                🖼️
              </span>
              <input
                type="number"
                id="quantidadeImagens"
                min="1"
                placeholder="1 imagem"
                className="w-full p-3 pl-8 text-sm border rounded-md bg-background"
                value={quantidadeImagens}
                onChange={(e) => setQuantidadeImagens(Number(e.target.value))}
                required
              />
            </div>
          </div>

          {/* Grau de complexidade */}
          <div className="space-y-2">
            <label
              htmlFor="grauComplexidade"
              className="block text-sm font-medium"
            >
              Grau de complexidade (0 a 4)
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="complexidade"
                  checked={grauComplexidade === "sem"}
                  onChange={() => setGrauComplexidade("sem")}
                  className="form-radio text-indigo-600"
                />
                <span>Sem complexidade</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="complexidade"
                  checked={grauComplexidade === "baixa"}
                  onChange={() => setGrauComplexidade("baixa")}
                  className="form-radio text-indigo-600"
                />
                <span>Um pouco complexo</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="complexidade"
                  checked={grauComplexidade === "media"}
                  onChange={() => setGrauComplexidade("media")}
                  className="form-radio text-indigo-600"
                />
                <span>Complexo</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="complexidade"
                  checked={grauComplexidade === "alta"}
                  onChange={() => setGrauComplexidade("alta")}
                  className="form-radio text-indigo-600"
                />
                <span>Alta complexidade</span>
              </label>
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
              {initialItem ? "Salvar" : "Adicionar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
