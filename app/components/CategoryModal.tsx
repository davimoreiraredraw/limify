import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/app/lib/categories";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (success: boolean) => void;
  initialData?: {
    id?: string;
    name?: string;
  };
  isEdit?: boolean;
}

export default function CategoryModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
  isEdit = false,
}: CategoryModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome) {
      toast.error("Preencha o nome da categoria");
      return;
    }

    setIsLoading(true);

    try {
      if (isEdit && initialData.id) {
        // Atualizar categoria existente
        const result = await updateCategory(initialData.id, {
          name: formData.nome,
        });
        if (result) {
          toast.success("Categoria atualizada com sucesso");
          onSubmit(true);
          onClose();
        } else {
          toast.error("Erro ao atualizar categoria");
        }
      } else {
        // Criar nova categoria
        const result = await createCategory({
          name: formData.nome,
        });

        if (result) {
          toast.success("Categoria criada com sucesso");
          onSubmit(true);
          onClose();
        } else {
          toast.error("Erro ao criar categoria");
        }
      }
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      toast.error("Ocorreu um erro ao processar sua solicitação");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData.id) return;

    if (!confirm("Tem certeza que deseja excluir esta categoria?")) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await deleteCategory(initialData.id);
      if (result) {
        toast.success("Categoria excluída com sucesso");
        onSubmit(true);
        onClose();
      } else {
        toast.error("Erro ao excluir categoria");
      }
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      toast.error("Ocorreu um erro ao excluir a categoria");
    } finally {
      setIsLoading(false);
    }
  };

  // Inicializar o formulário quando os dados iniciais mudarem
  useEffect(() => {
    if (isOpen) {
      setFormData({
        nome: initialData.name || "",
      });
    }
  }, [isOpen, initialData.name]);

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
            <h2 className="text-xl font-semibold">
              {isEdit ? "Editar categoria" : "Criar nova categoria"}
            </h2>
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
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Nome da categoria"
                  className="w-full border rounded-lg px-3 py-2"
                  disabled={isLoading}
                  required
                />
              </div>

              {isEdit && (
                <div className="pt-4">
                  <button
                    type="button"
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
                    onClick={handleDelete}
                    disabled={isLoading}
                  >
                    Excluir
                  </button>
                </div>
              )}
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
              {isLoading
                ? "Processando..."
                : isEdit
                ? "Atualizar"
                : "Adicionar"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
