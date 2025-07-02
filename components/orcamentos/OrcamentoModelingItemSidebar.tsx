import { Button } from "@/components/ui/button";
import { useState } from "react";

export interface OrcamentoModelingItem {
  id?: string;
  nome: string;
  descricao: string;
  tempoDesenvolvimento: number;
  metrosQuadrados: number;
  grauComplexidade: "sem" | "baixa" | "media" | "alta";
  total: number;
}

interface OrcamentoModelingItemSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: OrcamentoModelingItem) => void;
  initialItem?: OrcamentoModelingItem;
}

export default function OrcamentoModelingItemSidebar({
  isOpen,
  onClose,
  onSave,
  initialItem,
}: OrcamentoModelingItemSidebarProps) {
  const [nome, setNome] = useState(initialItem?.nome || "");
  const [descricao, setDescricao] = useState(initialItem?.descricao || "");
  const [tempoDesenvolvimento, setTempoDesenvolvimento] = useState<number>(
    initialItem?.tempoDesenvolvimento || 0
  );
  const [metrosQuadrados, setMetrosQuadrados] = useState<number>(
    initialItem?.metrosQuadrados || 0
  );
  const [grauComplexidade, setGrauComplexidade] = useState<
    "sem" | "baixa" | "media" | "alta"
  >(initialItem?.grauComplexidade || "sem");
  const [total, setTotal] = useState<number>(initialItem?.total || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialItem?.id,
      nome,
      descricao,
      tempoDesenvolvimento,
      metrosQuadrados,
      grauComplexidade,
      total,
    });
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 overflow-hidden ${isOpen ? "z-50" : "z-[-1]"}`}
    >
      <div
        className={`absolute inset-0 overflow-hidden ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-black bg-opacity-25 transition-opacity" />

        <section className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
          <div
            className={`relative w-screen max-w-md transform transition ease-in-out duration-500 sm:duration-700 ${
              isOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="h-full flex flex-col bg-white shadow-xl overflow-y-auto">
              <div className="px-6 pt-6">
                <div className="flex items-start justify-between">
                  <h2 className="text-2xl font-bold">
                    {initialItem ? "Editar ambiente" : "Adicionar ambiente"}
                  </h2>
                  <button
                    className="ml-3 h-7 flex items-center"
                    onClick={onClose}
                  >
                    <span className="sr-only">Fechar painel</span>
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M17.25 6.75L6.75 17.25"
                      />
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M6.75 6.75L17.25 17.25"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 p-6">
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="nome"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nome do ambiente
                    </label>
                    <input
                      type="text"
                      id="nome"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="descricao"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Descrição
                    </label>
                    <textarea
                      id="descricao"
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="tempoDesenvolvimento"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Tempo para desenvolver (horas)
                    </label>
                    <input
                      type="number"
                      id="tempoDesenvolvimento"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={tempoDesenvolvimento}
                      onChange={(e) =>
                        setTempoDesenvolvimento(Number(e.target.value))
                      }
                      required
                      min="0"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="metrosQuadrados"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Metros quadrados (m²)
                    </label>
                    <input
                      type="number"
                      id="metrosQuadrados"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={metrosQuadrados}
                      onChange={(e) =>
                        setMetrosQuadrados(Number(e.target.value))
                      }
                      required
                      min="0"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="grauComplexidade"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Grau de complexidade
                    </label>
                    <select
                      id="grauComplexidade"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={grauComplexidade}
                      onChange={(e) =>
                        setGrauComplexidade(
                          e.target.value as "sem" | "baixa" | "media" | "alta"
                        )
                      }
                      required
                    >
                      <option value="sem">Sem complexidade</option>
                      <option value="baixa">Baixa complexidade</option>
                      <option value="media">Média complexidade</option>
                      <option value="alta">Alta complexidade</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="total"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Valor total
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">R$</span>
                      </div>
                      <input
                        type="number"
                        id="total"
                        className="pl-8 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={total}
                        onChange={(e) => setTotal(Number(e.target.value))}
                        required
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    onClick={onClose}
                    className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-indigo-600 text-white">
                    {initialItem ? "Salvar alterações" : "Adicionar ambiente"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
