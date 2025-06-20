import { X } from "lucide-react";
import { useState, useEffect } from "react";

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (activity: {
    name: string;
    description: string;
    time: number;
    squareMeters: number;
    complexity: number;
    baseValue: number;
  }) => void;
  segments?: { id: number; name: string }[];
  preSelectedSegment?: number | null;
}

export default function ActivityModal({
  isOpen,
  onClose,
  onSubmit,
  segments,
  preSelectedSegment,
}: ActivityModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    time: 1,
    squareMeters: 0,
    complexity: 0,
    selectedSegment:
      preSelectedSegment?.toString() || segments?.[0]?.id.toString() || "",
    baseValue: 85,
  });
  const [showSegmentTooltip, setShowSegmentTooltip] = useState(false);

  // Atualiza o segmento selecionado quando o preSelectedSegment muda
  useEffect(() => {
    if (preSelectedSegment !== undefined) {
      setFormData((prev) => ({
        ...prev,
        selectedSegment: preSelectedSegment?.toString() || "",
      }));
    }
  }, [preSelectedSegment]);

  const formatHours = (value: string) => {
    // Remove qualquer caractere não numérico
    const numericValue = value.replace(/[^\d]/g, "");
    if (!numericValue) return "";
    return `${numericValue}h`;
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "");
    setFormData({
      ...formData,
      time: parseInt(value) || 0,
    });
  };

  const calculateTotalCost = () => {
    return formData.time * formData.baseValue;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      onSubmit({
        name: formData.name,
        description: formData.description,
        time: formData.time,
        squareMeters: formData.squareMeters,
        complexity: formData.complexity,
        baseValue: formData.baseValue,
      });
      onClose();
    } catch (error) {
      console.error("Erro ao criar atividade:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay escuro */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40"
        onClick={onClose}
      />

      {/* Painel lateral */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white shadow-lg z-50 transform">
        <style jsx global>{`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
            }
            to {
              transform: translateX(0);
            }
          }

          .modal-panel {
            animation: slideIn 0.25s ease-out forwards;
          }
        `}</style>

        <div className="modal-panel flex flex-col h-full">
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">Itens orçamento</h2>
              <button className="text-red-500 text-sm border border-red-500 rounded-md px-3 py-1">
                Excluir
              </button>
            </div>
            <button
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              onClick={onClose}
              disabled={isLoading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 flex-grow overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Nome do item"
                  className="w-full border rounded-lg px-3 py-2"
                  disabled={isLoading}
                  required
                />
              </div>

              {segments && segments.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    Segmento
                    <div className="relative">
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-600"
                        onMouseEnter={() => setShowSegmentTooltip(true)}
                        onMouseLeave={() => setShowSegmentTooltip(false)}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M12 16V12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M12 8H12.01"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      {showSegmentTooltip && (
                        <div className="absolute z-50 w-[300px] p-4 bg-indigo-600 text-white rounded-lg shadow-lg left-full top-0 ml-2">
                          <div className="absolute top-3 -left-2 w-4 h-4 bg-indigo-600 transform rotate-45"></div>
                          <p className="text-sm">
                            Segmento é uma categoria dentro da sua planilha, por
                            exemplo, dentro do projeto de estudo premilinar,
                            temos diferentes comodos, e podemos quantificar eles
                            de formas diferentes e em categorias diferentes, o
                            segmento é opcional.
                          </p>
                        </div>
                      )}
                    </div>
                  </label>
                  <select
                    value={formData.selectedSegment}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        selectedSegment: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2 appearance-none"
                    disabled={isLoading}
                  >
                    <option value="">Selecione um segmento</option>
                    {segments.map((segment) => (
                      <option key={segment.id} value={segment.id}>
                        {segment.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Descrição do orçamento"
                  className="w-full border rounded-lg px-3 py-2"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Tempo para desenvolver
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.time ? `${formData.time}h` : ""}
                    onChange={handleTimeChange}
                    className="w-full border rounded-lg px-3 py-2 pl-8"
                    placeholder="1h"
                    disabled={isLoading}
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">
                    ⏰
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Valor base por hora
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.baseValue}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d]/g, "");
                      setFormData({
                        ...formData,
                        baseValue: parseInt(value) || 0,
                      });
                    }}
                    className="w-full border rounded-lg px-3 py-2 pl-8"
                    placeholder="85"
                    disabled={isLoading}
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">
                    R$
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Quantos m²?</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.squareMeters}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        squareMeters: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2 pl-8"
                    placeholder="2"
                    disabled={isLoading}
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">
                    📏
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  Grau de complexidade (0 a 4)
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600"
                    title="Informação sobre complexidade"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 16V12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 8H12.01"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </label>
                <select
                  value={formData.complexity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      complexity: parseInt(e.target.value),
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2 appearance-none"
                  disabled={isLoading}
                >
                  <option value="">Selecione uma opção</option>
                  <option value="0">Sem complexidade</option>
                  <option value="1">Um pouco complexo</option>
                  <option value="2">Complexo</option>
                  <option value="3">Alta complexidade</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Custo total</label>
                <div className="relative">
                  <input
                    type="text"
                    value={`${calculateTotalCost()} Reais`}
                    className="w-full border rounded-lg px-3 py-2 pl-8"
                    disabled
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">
                    $
                  </span>
                </div>
              </div>
            </form>
          </div>

          <div className="border-t p-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className={`px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Processando..." : "Adicionar"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
