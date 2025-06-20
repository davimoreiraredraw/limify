import { X } from "lucide-react";
import { useState } from "react";

interface SegmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export default function SegmentModal({
  isOpen,
  onClose,
  onSubmit,
}: SegmentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      onSubmit(name);
      onClose();
    } catch (error) {
      console.error("Erro ao criar segmento:", error);
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
            <h2 className="text-xl font-semibold">Criar novo segmento</h2>
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome do segmento"
                  className="w-full border rounded-lg px-3 py-2"
                  disabled={isLoading}
                  required
                />
              </div>
            </form>
          </div>

          <div className="border-t p-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              disabled={isLoading}
            >
              Cancelar
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
