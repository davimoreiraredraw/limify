import { X, Trash2Icon, TagIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { Category } from "@/lib/db/schema";
import {
  createExpense,
  updateExpense,
  archiveExpense,
  deleteExpense,
  CreateExpenseData,
} from "@/app/lib/expenses";
import { toast } from "sonner";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (success: boolean) => void;
  categories: Category[];
  compensacoes: string[];
  initialData?: {
    id?: string;
    name?: string;
    description?: string;
    value?: string;
    frequency?: string;
    compensation_day?: string;
    category_id?: string;
    is_fixed?: boolean;
  };
  isEdit?: boolean;
}

export default function ExpenseModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  compensacoes,
  initialData = {},
  isEdit = false,
}: ExpenseModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    valor: "",
    frequencia: "",
    diaCompensacao: "",
    categoria: "",
    isFixa: true,
  });

  // Função para lidar com a máscara de valor monetário
  const formatarValor = (valor: string) => {
    // Remove tudo que não é número
    const apenasNumeros = valor.replace(/\D/g, "");

    if (!apenasNumeros) return "";

    // Converte para número e divide por 100 para obter o valor em reais (com centavos)
    const valorNumerico = parseFloat(apenasNumeros) / 100;

    // Formata o valor como moeda brasileira
    return valorNumerico.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    // Remove R$, espaços e outros caracteres não numéricos, exceto vírgula e ponto
    const valorLimpo = valor.replace(/[R$\s.]/g, "").replace(",", ".");

    // Atualiza o estado com o valor formatado
    setFormData({
      ...formData,
      valor: formatarValor(valorLimpo),
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome || !formData.valor || !formData.categoria) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsLoading(true);

    try {
      // Converte valor de string para número
      const numericValue = parseFloat(
        formData.valor.replace(/[^\d,]/g, "").replace(",", ".")
      );

      const expenseData: CreateExpenseData = {
        name: formData.nome,
        description: formData.descricao,
        value: numericValue,
        frequency: formData.frequencia,
        compensation_day: formData.diaCompensacao
          ? parseInt(formData.diaCompensacao)
          : undefined,
        category_id: formData.categoria,
        is_fixed: formData.isFixa,
      };

      if (isEdit && initialData.id) {
        // Atualizar despesa existente
        const result = await updateExpense(initialData.id, expenseData);
        if (result) {
          toast.success("Despesa atualizada com sucesso");
          onSubmit(true);
          onClose();
        } else {
          toast.error("Erro ao atualizar despesa");
        }
      } else {
        // Criar nova despesa
        const result = await createExpense({
          ...expenseData,
          is_active: true,
          is_archived: false,
        });

        if (result) {
          toast.success("Despesa criada com sucesso");
          onSubmit(true);
          onClose();
        } else {
          toast.error("Erro ao criar despesa");
        }
      }
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      toast.error("Ocorreu um erro ao processar sua solicitação");
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!initialData.id) return;

    setIsLoading(true);
    try {
      const result = await archiveExpense(initialData.id);
      if (result) {
        toast.success("Despesa arquivada com sucesso");
        onSubmit(true);
        onClose();
      } else {
        toast.error("Erro ao arquivar despesa");
      }
    } catch (error) {
      console.error("Erro ao arquivar despesa:", error);
      toast.error("Ocorreu um erro ao arquivar a despesa");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData.id) return;

    if (!confirm("Tem certeza que deseja mover esta despesa para a lixeira?")) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/expenses", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: initialData.id,
          action: "trash",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Falha ao mover para lixeira");
      }

      toast.success("Despesa movida para lixeira");
      onSubmit(true); // Isso vai forçar a atualização da lista
      onClose();
    } catch (error: any) {
      console.error("Erro ao mover para lixeira:", error);
      toast.error(error.message || "Erro ao mover despesa para lixeira");
    } finally {
      setIsLoading(false);
    }
  };

  // Inicializar o formulário quando os dados iniciais mudarem
  // Efeito roda apenas quando as dependências relevantes mudam
  useEffect(() => {
    if (isOpen) {
      // Definindo valores padrão ou valores do initialData
      setFormData({
        nome: initialData.name || "",
        descricao: initialData.description || "",
        valor: initialData.value || "",
        frequencia:
          initialData.frequency ||
          (compensacoes.length > 0 ? compensacoes[0] : "Mensal"),
        diaCompensacao: initialData.compensation_day || "",
        categoria:
          initialData.category_id ||
          (categories.length > 0 ? categories[0].id : ""),
        isFixa:
          initialData.is_fixed !== undefined ? initialData.is_fixed : true,
      });
    }
  }, [
    isOpen,
    initialData.name,
    initialData.description,
    initialData.value,
    initialData.frequency,
    initialData.compensation_day,
    initialData.category_id,
    initialData.is_fixed,
    categories,
    compensacoes,
  ]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay escuro */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-[60]"
        onClick={onClose}
      />

      {/* Painel lateral */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white shadow-lg z-[61] transform">
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
              {isEdit ? "Editar despesa" : "Criar nova despesa"}
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
                  placeholder="Nome da despesa"
                  className="w-full border rounded-lg px-3 py-2"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição</label>
                <input
                  type="text"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  placeholder="Descrição da despesa"
                  className="w-full border rounded-lg px-3 py-2"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Valor <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2">R$</span>
                  <input
                    type="text"
                    name="valor"
                    value={formData.valor}
                    onChange={handleValorChange}
                    placeholder="0,00"
                    className="w-full border rounded-lg px-3 py-2 pl-8"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Frequência <span className="text-red-500">*</span>
                </label>
                <select
                  name="frequencia"
                  value={formData.frequencia}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 appearance-none bg-white"
                  disabled={isLoading}
                  required
                >
                  {compensacoes.length > 0 ? (
                    compensacoes.map((comp, index) => (
                      <option key={index} value={comp}>
                        {comp}
                      </option>
                    ))
                  ) : (
                    <option value="Mensal">Mensal</option>
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Dia de compensação
                </label>
                <input
                  type="text"
                  name="diaCompensacao"
                  value={formData.diaCompensacao}
                  onChange={handleChange}
                  placeholder="25"
                  className="w-full border rounded-lg px-3 py-2"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Categoria <span className="text-red-500">*</span>
                </label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 appearance-none bg-white"
                  disabled={isLoading || categories.length === 0}
                  required
                >
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))
                  ) : (
                    <option value="">Carregando categorias...</option>
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de despesa</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="isFixa"
                      value="true"
                      checked={formData.isFixa === true}
                      onChange={() =>
                        setFormData({ ...formData, isFixa: true })
                      }
                      disabled={isLoading}
                    />
                    <span>Fixa</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="isFixa"
                      value="false"
                      checked={formData.isFixa === false}
                      onChange={() =>
                        setFormData({ ...formData, isFixa: false })
                      }
                      disabled={isLoading}
                    />
                    <span>Pontual</span>
                  </label>
                </div>
              </div>

              {isEdit && (
                <div className="pt-4 flex space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
                    onClick={handleDelete}
                    disabled={isLoading}
                  >
                    <Trash2Icon className="h-4 w-4 inline mr-2" />
                    Excluir
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 border border-amber-300 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors duration-200"
                    onClick={handleArchive}
                    disabled={isLoading}
                  >
                    <TagIcon className="h-4 w-4 inline mr-2" />
                    Arquivar
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
