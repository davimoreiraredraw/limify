"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Sparkles, UserIcon } from "lucide-react";
import { Dispatch, SetStateAction, useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { formatCurrency } from "@/app/lib/expenses";
import OrcamentoItemSidebar, { OrcamentoItem } from "./OrcamentoItemSidebar";
import { useClients } from "@/lib/hooks/useClients";
import ClientsModal from "./ClientsModal";
import type { Client } from "@/app/(dashboard)/dashboard/orcamentos/types";
import { useRouter } from "next/navigation";
import OrcamentoRenderItemSidebar, {
  OrcamentoRenderItem,
} from "./OrcamentoRenderItemSidebar";

interface BudgetFormStepsProps {
  budgetStep: number;
  setBudgetStep: Dispatch<SetStateAction<number>>;
  selectedBudgetType: string | null;
  finishBudget: () => void;
}

// Adicionando interfaces para os itens do orçamento
interface BudgetItem {
  id: string;
  name: string;
  description: string;
  tempoDesenvolvimento: number;
  quantidadeImagens: number;
  grauComplexidade: "sem" | "baixa" | "media" | "alta";
  total: number;
  exibir: boolean;
  isEditingField?: "tempoDesenvolvimento" | "quantidadeImagens" | null;
}

export default function BudgetRenderForm({
  budgetStep,
  setBudgetStep,
  selectedBudgetType,
  finishBudget,
}: BudgetFormStepsProps) {
  const [clientName, setClientName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  // Campos específicos para orçamento por m²
  const [squareMeters, setSquareMeters] = useState<number>(0);
  const [pricePerSquareMeter, setPricePerSquareMeter] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  // Campos para perguntas adicionais do orçamento por m²
  const [tipoAmbiente, setTipoAmbiente] = useState<
    "interior" | "exterior" | null
  >(null);
  const [valorComodos, setValorComodos] = useState<
    "unico" | "individuais" | null
  >(null);

  // Estados para o ajuste de valor
  const [adicionalValor, setAdicionalValor] = useState<number>(0);
  const [desconto, setDesconto] = useState<number>(0);
  const [tipoDesconto, setTipoDesconto] = useState<"percentual" | "valor">(
    "percentual"
  );
  const [opcoesAjusteValor, setOpcoesAjusteValor] = useState<string[]>([]);

  // Estados para porcentagens editáveis
  const [complexidadePercentages, setComplexidadePercentages] = useState({
    0: 0,
    10: 10,
    20: 20,
    30: 30,
  });
  const [prazoPercentages, setPrazoPercentages] = useState({
    0: 0,
    10: 10,
    20: 20,
    30: 30,
  });

  // Estado para os itens do orçamento
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);

  // Estados para a sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);

  // Estados adicionais
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLimIADialog, setShowLimIADialog] = useState(false);
  const [showLimIASuggestion, setShowLimIASuggestion] = useState(false);
  const [limIASuggestion, setLimIASuggestion] = useState("");
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);

  // Mock dos projetos de referência selecionados
  const [selectedReferences, setSelectedReferences] = useState([
    "Casa azul",
    "Render joão",
    "Item 03",
  ]);

  const { clients, fetchClients, createClient } = useClients();
  const [clientId, setClientId] = useState<string | null>(null);
  const [showClientsModal, setShowClientsModal] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  // Adicione estes estados no início do componente, junto com os outros
  const [selectedComplexidade, setSelectedComplexidade] = useState<
    number | null
  >(null);
  const [selectedPrazo, setSelectedPrazo] = useState<number | null>(null);
  const [showAcrescimos, setShowAcrescimos] = useState(true);
  const [deliveryTimeDays, setDeliveryTimeDays] = useState("");

  // Estados para o chat LimIA
  const [showLimIAChat, setShowLimIAChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    Array<{
      id: string;
      type: "ai" | "user";
      content: string;
      timestamp: Date;
    }>
  >([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatStep, setChatStep] = useState(0);
  const [collectedData, setCollectedData] = useState<{
    projectName: string;
    projectDescription: string;
    renderType: string;
    numberOfImages: number;
    imageQuality: string;
    complexity: string;
    deliveryTime: number;
    additionalServices: string[];
    [key: string]: string | string[] | number;
  }>({
    projectName: "",
    projectDescription: "",
    renderType: "",
    numberOfImages: 0,
    imageQuality: "",
    complexity: "",
    deliveryTime: 0,
    additionalServices: [],
  });

  // Estados para o modal de comparação
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [aiGeneratedData, setAiGeneratedData] = useState<any>(null);

  // Ref para o container de mensagens
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (clientSearch.length === 0) {
      setFilteredClients(clients);
    } else {
      setFilteredClients(
        clients.filter((c) =>
          c.name.toLowerCase().includes(clientSearch.toLowerCase())
        )
      );
    }
  }, [clientSearch, clients]);

  const handleSelectClient = (client: Client) => {
    setClientId(client.id);
    setClientName(client.name);
    setClientSearch(client.name);
    setShowClientsModal(false);
  };

  const handleCreateClient = async (formData: any) => {
    const newClient = await createClient(formData);
    if (newClient) {
      setClientId(newClient.id);
      setClientName(newClient.name);
      setClientSearch(newClient.name);
      setShowClientsModal(false);
    }
  };

  // Calcular o total do orçamento
  const calculateTotalBudget = () => {
    const itemsTotal = budgetItems
      .filter((item) => item.exibir)
      .reduce((sum, item) => sum + item.total, 0);
    let finalTotal = itemsTotal;

    // Aplicar adicional de valor se essa opção estiver selecionada
    if (opcoesAjusteValor.includes("adicionar")) {
      finalTotal += adicionalValor;
    }
    // Aplicar desconto se essa opção estiver selecionada
    if (opcoesAjusteValor.includes("desconto")) {
      if (tipoDesconto === "percentual") {
        finalTotal -= finalTotal * (desconto / 100);
      } else {
        finalTotal -= desconto;
      }
    }

    return finalTotal;
  };

  // Calcular o preço médio por m²
  const calculateAveragePricePerSqm = () => {
    const visibleItems = budgetItems.filter((item) => item.exibir);
    if (visibleItems.length === 0) return 0;

    const totalImages = visibleItems.reduce(
      (sum, item) => sum + item.quantidadeImagens,
      0
    );
    const totalValue = visibleItems.reduce((sum, item) => sum + item.total, 0);

    return totalImages > 0 ? totalValue / totalImages : 0;
  };

  // Calcular o preço total quando a metragem ou o preço por m² mudar
  useEffect(() => {
    if (selectedBudgetType === "m2") {
      setTotalPrice(squareMeters * pricePerSquareMeter);
    }
  }, [squareMeters, pricePerSquareMeter, selectedBudgetType]);

  // Função para adicionar um novo item
  const addNewItem = () => {
    setEditingItem(null);
    setIsSidebarOpen(true);
  };

  // Função para editar um item existente
  const editItem = (item: BudgetItem) => {
    setEditingItem(item);
    setIsSidebarOpen(true);
  };

  // Função para remover um item
  const removeItem = (id: string) => {
    setBudgetItems(budgetItems.filter((item) => item.id !== id));
  };

  // Função para salvar um item novo ou editado
  const handleSaveItem = (item: OrcamentoRenderItem) => {
    const newItem: BudgetItem = {
      id: item.id || Date.now().toString(),
      name: item.nome,
      description: item.descricao,
      tempoDesenvolvimento: item.tempoDesenvolvimento,
      quantidadeImagens: item.quantidadeImagens,
      grauComplexidade: item.grauComplexidade,
      total: item.total,
      exibir: true,
    };

    if (editingItem) {
      // Atualizar item existente
      setBudgetItems(
        budgetItems.map((i) => (i.id === newItem.id ? newItem : i))
      );
      toast.success("Item atualizado com sucesso!");
    } else {
      // Adicionar novo item
      setBudgetItems([...budgetItems, newItem]);
      toast.success("Item adicionado com sucesso!");
    }
  };

  // Função para fechar a sidebar
  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setEditingItem(null);
  };

  // Função para atualizar valores inline
  const updateItemValue = (
    itemId: string,
    field: "tempoDesenvolvimento" | "quantidadeImagens",
    value: number
  ) => {
    setBudgetItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          // Recalcular total baseado na complexidade e tempo
          let total = 0;
          if (updatedItem.grauComplexidade === "sem") {
            total = updatedItem.tempoDesenvolvimento * 150;
          } else if (updatedItem.grauComplexidade === "baixa") {
            total = updatedItem.tempoDesenvolvimento * 200;
          } else if (updatedItem.grauComplexidade === "media") {
            total = updatedItem.tempoDesenvolvimento * 300;
          } else {
            total = updatedItem.tempoDesenvolvimento * 200;
          }
          updatedItem.total = total;
          return updatedItem;
        }
        return item;
      })
    );
  };

  // Função para finalizar edição inline
  const finishInlineEdit = (itemId: string) => {
    setBudgetItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, isEditingField: null } : item
      )
    );
  };

  // Função para iniciar edição de um campo específico
  const startInlineEdit = (
    itemId: string,
    field: "tempoDesenvolvimento" | "quantidadeImagens"
  ) => {
    setBudgetItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, isEditingField: field } : item
      )
    );
  };

  // Função para gerar sugestão da IA
  const generateLimIASuggestion = async () => {
    setIsLoadingSuggestion(true);
    setShowLimIADialog(false);

    try {
      // Preparar dados para o endpoint
      const payload = {
        tipoProjeto: tipoAmbiente === "interior" ? "interiores" : "exteriores",
        tipoOrcamento: "render",
        estado: "SP", // TODO: Permitir seleção do estado
        metragem: 0, // Para render, não usamos metragem
        valorInformado: 0, // Para render, calculamos baseado em complexidade
        margem: 20, // TODO: Permitir configuração da margem
        cubAtual: 2300, // TODO: Buscar CUB real do estado
        tipoRender: "interno", // TODO: Permitir seleção
        complexidade: "alta", // TODO: Calcular baseado nos itens
        quantidadeImagens: budgetItems.reduce(
          (sum, item) => sum + item.quantidadeImagens,
          0
        ),
        userId: "user123", // TODO: Usar ID real do usuário
      };

      const response = await fetch(
        "http://localhost:3003/api/openai/sugestao-orcamento",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLimIASuggestion(
          data.sugestao || data.message || "Sugestão gerada com sucesso!"
        );
        setShowLimIASuggestion(true);
      } else {
        throw new Error("Erro ao gerar sugestão");
      }
    } catch (error) {
      console.error("Erro ao gerar sugestão da IA:", error);
      toast.error("Erro ao gerar sugestão da IA");
    } finally {
      setIsLoadingSuggestion(false);
    }
  };

  // Função para aplicar sugestão da IA
  const applyLimIASuggestion = () => {
    // TODO: Implementar lógica para aplicar as sugestões da IA
    // Por exemplo, ajustar valores, adicionar itens, etc.
    toast.success("Sugestões da IA aplicadas!");
    setShowLimIASuggestion(false);
    setBudgetStep(4); // Ir para a etapa de revisão
  };

  // Função para enviar orçamento para a API
  const handleSubmitBudget = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: projectName,
        description: projectDescription,
        client_id: clientId ? clientId : null,
        model: tipoAmbiente, // interior ou exterior
        value_type: valorComodos, // individual ou unico
        total: calculateTotalBudget(),
        base_value: calculateTotalBudget(), // valor base sem acréscimos
        complexity_percentage: selectedComplexidade || 0,
        delivery_time_percentage: selectedPrazo || 0,
        delivery_time_days: parseInt(deliveryTimeDays) || 0,
        final_value: calculateFinalValue(), // valor final com acréscimos
        items: budgetItems.map((item) => ({
          name: item.name,
          description: item.description,
          development_time: item.tempoDesenvolvimento,
          images_quantity: item.quantidadeImagens,
          complexity_level: item.grauComplexidade,
          total: item.total,
        })),
        references: selectedReferences,
      };

      const res = await fetch("/api/budgets/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Orçamento criado com sucesso!");
        finishBudget();
      } else {
        toast.error(data.error || "Erro ao criar orçamento");
      }
    } catch (err) {
      toast.error("Erro ao criar orçamento. Tente novamente.");
      console.error("Erro ao salvar orçamento:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para calcular o valor final com acréscimos
  const calculateFinalValue = () => {
    const baseValue = calculateTotalBudget();
    if (!showAcrescimos) return baseValue;

    const complexidadePercent =
      complexidadePercentages[
        selectedComplexidade as keyof typeof complexidadePercentages
      ] || 0;
    const prazoPercent =
      prazoPercentages[selectedPrazo as keyof typeof prazoPercentages] || 0;

    const complexidadeValue = (baseValue * complexidadePercent) / 100;
    const prazoValue = (baseValue * prazoPercent) / 100;

    return baseValue + complexidadeValue + prazoValue;
  };

  // Funções para atualizar porcentagens
  const updateComplexidadePercentage = (key: number, value: number) => {
    setComplexidadePercentages((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updatePrazoPercentage = (key: number, value: number) => {
    setPrazoPercentages((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const renderStepContent = () => {
    switch (budgetStep) {
      case 1:
        return (
          <div className="mb-12">
            <div className="mb-12">
              <h3 className="text-xl font-semibold mb-6">
                Quem é seu cliente?
              </h3>

              <div className="space-y-4">
                <div className="border rounded-lg p-5 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <h4 className="font-medium">Informações do cliente</h4>
                  </div>

                  <div className="pl-8">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm">R$</span>
                      </div>
                      <input
                        type="text"
                        className="pl-8 pr-4 py-2 w-full border border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                        placeholder="Selecione um cliente ou crie um novo"
                        value={clientSearch}
                        onChange={(e) => {
                          setClientSearch(e.target.value);
                          setClientId(null);
                        }}
                        autoComplete="off"
                        onClick={() => setShowClientsModal(true)}
                        readOnly
                      />
                    </div>
                  </div>

                  {clientId &&
                    (() => {
                      const selectedClient = clients.find(
                        (c) => c.id === clientId
                      );
                      if (!selectedClient) return null;

                      return (
                        <div className="mt-3 p-3 bg-indigo-50 rounded-md">
                          <div className="flex items-center gap-3">
                            {selectedClient.photoUrl ? (
                              <img
                                src={selectedClient.photoUrl}
                                alt={selectedClient.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                                {selectedClient.name.charAt(0)}
                              </span>
                            )}
                            <div>
                              <div className="font-medium text-sm">
                                {selectedClient.name}
                              </div>
                              {selectedClient.email && (
                                <div className="text-xs text-gray-500">
                                  {selectedClient.email}
                                </div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-auto text-red-600 hover:text-red-700"
                              onClick={() => {
                                setClientId(null);
                                setClientSearch("");
                              }}
                            >
                              Remover
                            </Button>
                          </div>
                        </div>
                      );
                    })()}
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h3 className="text-xl font-semibold mb-6">
                Qual é o nome do projeto?
              </h3>

              <div className="bg-white border rounded-lg p-5 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <h4 className="font-medium">Nome do projeto</h4>
                </div>

                <div className="pl-8">
                  <p className="text-sm text-gray-500 mb-2">
                    Nomeie para você achar depois
                  </p>
                  <div className="mb-4">
                    <input
                      type="text"
                      className="px-4 py-2 w-full border rounded-md text-sm"
                      placeholder="Casa do João"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-2">Descrição</p>
                    <textarea
                      className="px-4 py-2 w-full border rounded-md text-sm"
                      placeholder="Descrição"
                      rows={3}
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Caso seja necessário, descreva melhor
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        // Na etapa 2, mostramos as duas primeiras perguntas do Figma
        return (
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-8">
              Bora lá, o que vamos orçar?
            </h2>

            <div className="mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  className={`border rounded-lg p-5 ${
                    tipoAmbiente === "exterior"
                      ? "border-indigo-600 bg-indigo-50"
                      : ""
                  }`}
                  onClick={() => setTipoAmbiente("exterior")}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer ${
                        tipoAmbiente === "exterior" ? "border-indigo-600" : ""
                      }`}
                    >
                      {tipoAmbiente === "exterior" && (
                        <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">Projeto exterior</h4>
                      <p className="text-sm text-gray-500">
                        Orce um projeto de uma casa por exemplo
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`border rounded-lg p-5 ${
                    tipoAmbiente === "interior"
                      ? "border-indigo-600 bg-indigo-50"
                      : ""
                  }`}
                  onClick={() => setTipoAmbiente("interior")}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer ${
                        tipoAmbiente === "interior" ? "border-indigo-600" : ""
                      }`}
                    >
                      {tipoAmbiente === "interior" && (
                        <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">Interior</h4>
                      <p className="text-sm text-gray-500">
                        Orce cômodos, secos ou molhados
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-8 mt-8">
              <h2 className="text-3xl font-bold mb-8">
                Os cômodos tem valores diferentes?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  className={`border rounded-lg p-5 ${
                    valorComodos === "unico"
                      ? "border-indigo-600 bg-indigo-50"
                      : ""
                  }`}
                  onClick={() => setValorComodos("unico")}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer ${
                        valorComodos === "unico" ? "border-indigo-600" : ""
                      }`}
                    >
                      {valorComodos === "unico" && (
                        <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">Valor único</h4>
                      <p className="text-sm text-gray-500">
                        Orce o projeto por um valor fixo e simples
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`border rounded-lg p-5 ${
                    valorComodos === "individuais"
                      ? "border-indigo-600 bg-indigo-50"
                      : ""
                  }`}
                  onClick={() => setValorComodos("individuais")}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer ${
                        valorComodos === "individuais"
                          ? "border-indigo-600"
                          : ""
                      }`}
                    >
                      {valorComodos === "individuais" && (
                        <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">Valores individuais</h4>
                      <p className="text-sm text-gray-500">
                        Você terá orçamentos diferentes por local
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        // Na etapa 3, mostramos a tela de itens do orçamento conforme Figma
        return (
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6">
              Adicione os itens do seu orçamento
            </h2>

            {/* Botões de ambientes padrão */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Ambientes</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => addDefaultEnvironment("sala")}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Sala
                </button>
                <button
                  onClick={() => addDefaultEnvironment("fachada")}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Fachada
                </button>
                <button
                  onClick={() => addDefaultEnvironment("cozinha")}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cozinha
                </button>
                <button
                  onClick={() => addDefaultEnvironment("banheiro")}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Banheiro
                </button>
                <button
                  onClick={() => addDefaultEnvironment("lavanderia")}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Lavanderia
                </button>
                <button
                  onClick={addNewItem}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  + Adicionar
                </button>
              </div>
            </div>

            {/* Tabela de itens - estilo Figma */}
            <div className="mb-12">
              {/* Cabeçalho da tabela */}
              <div className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,0.5fr] gap-4 pb-3 text-sm font-medium text-gray-600 border-b">
                <div>Nome</div>
                <div>Tempo para desenvolver</div>
                <div>Quantidade de imagens</div>
                <div>Custo imagem</div>
                <div>Custo Total</div>
                <div>Ações</div>
              </div>

              {/* Itens da tabela */}
              {budgetItems.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Nenhum item adicionado. Clique em Adicionar ambiente para
                  começar.
                </div>
              ) : (
                budgetItems.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,0.5fr] gap-4 py-6 border-b items-center hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => editItem(item)}
                  >
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">
                        {item.description}
                      </div>
                    </div>
                    <div className="text-right">
                      {item.isEditingField === "tempoDesenvolvimento" ? (
                        <div className="relative">
                          <input
                            type="number"
                            className="pr-8 pl-4 py-2 w-full border border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-right"
                            placeholder="0"
                            value={item.tempoDesenvolvimento || ""}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              updateItemValue(
                                item.id,
                                "tempoDesenvolvimento",
                                value
                              );
                            }}
                            onBlur={() => finishInlineEdit(item.id)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                finishInlineEdit(item.id);
                              }
                            }}
                            autoFocus
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 text-sm">dias</span>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded text-right"
                          onClick={(e) => {
                            e.stopPropagation();
                            startInlineEdit(item.id, "tempoDesenvolvimento");
                          }}
                        >
                          {item.tempoDesenvolvimento} dias
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      {item.isEditingField === "quantidadeImagens" ? (
                        <div className="relative">
                          <input
                            type="number"
                            className="pr-8 pl-4 py-2 w-full border border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-right"
                            placeholder="0"
                            value={item.quantidadeImagens || ""}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              updateItemValue(
                                item.id,
                                "quantidadeImagens",
                                value
                              );
                            }}
                            onBlur={() => finishInlineEdit(item.id)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                finishInlineEdit(item.id);
                              }
                            }}
                            autoFocus
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 text-sm">
                              imagens
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded text-right"
                          onClick={(e) => {
                            e.stopPropagation();
                            startInlineEdit(item.id, "quantidadeImagens");
                          }}
                        >
                          {item.quantidadeImagens} imagens
                        </div>
                      )}
                    </div>
                    <div className="text-right font-bold">R$ {item.total}</div>
                    <div className="flex justify-end">
                      <button
                        className="text-red-500 hover:text-red-700 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(item.id);
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 15 15"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H3.5C3.22386 4 3 3.77614 3 3.5ZM4.5 5C4.77614 5 5 5.22386 5 5.5V10.5C5 10.7761 4.77614 11 4.5 11C4.22386 11 4 10.7761 4 10.5V5.5C4 5.22386 4.22386 5 4.5 5ZM7.5 5C7.77614 5 8 5.22386 8 5.5V10.5C8 10.7761 7.77614 11 7.5 11C7.22386 11 7 10.7761 7 10.5V5.5C7 5.22386 7.22386 5 7.5 5ZM10.5 5C10.7761 5 11 5.22386 11 5.5V10.5C11 10.7761 10.7761 11 10.5 11C10.2239 11 10 10.7761 10 10.5V5.5C10 5.22386 10.2239 5 10.5 5Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Campo de prazo de entrega */}
            <div className="mt-6">
              <div className="flex items-center justify-between bg-[#F8F7FF] border border-[#C084FC] rounded-lg p-4">
                <div className="text-sm font-medium">Prazo de entrega</div>
                <div className="relative flex items-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute left-3 text-gray-400"
                  >
                    <path
                      d="M7.5 1C3.91015 1 1 3.91015 1 7.5C1 11.0899 3.91015 14 7.5 14C11.0899 14 14 11.0899 14 7.5C14 3.91015 11.0899 1 7.5 1ZM7.5 2C10.5376 2 13 4.46243 13 7.5C13 10.5376 10.5376 13 7.5 13C4.46243 13 2 10.5376 2 7.5C2 4.46243 4.46243 2 7.5 2ZM7 4V7.5C7 7.7455 7.17001 7.9496 7.40279 7.99239L10.4028 8.74239C10.7026 8.80657 11 8.5842 11 8.27735V7.72265C11 7.47161 10.8273 7.25169 10.5972 7.18761L8 6.54V4C8 3.72386 7.77614 3.5 7.5 3.5C7.22386 3.5 7 3.72386 7 4Z"
                      fill="currentColor"
                      fillRule="evenodd"
                      clipRule="evenodd"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Dias para entregar"
                    className="pl-10 pr-4 py-1.5 text-sm text-gray-500 bg-white border border-gray-200 rounded-lg w-[180px] focus:outline-none focus:border-[#C084FC] focus:ring-1 focus:ring-[#C084FC]"
                    value={deliveryTimeDays}
                    onChange={(e) => setDeliveryTimeDays(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Tabelas de Complexidade e Prazo */}
            <div className=" mt-12 mb-8">
              <p className="text-gray-700 mb-8 text-base">
                Prazo e complexidade são definem os acréscimos, no Limify
                definimos um valor padrão, mas você deve ajustar conforme as
                suas exigências
              </p>

              <div className="grid grid-cols-2 gap-12">
                {/* Tabela de Complexidade */}
                <div>
                  <h3 className="font-medium mb-4 text-base">Complexidade</h3>
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-[1fr,1.2fr,1fr] py-4 px-6 text-sm text-gray-600 bg-gray-50">
                      <div>Nível</div>
                      <div>Complexidade</div>
                      <div>Porcentagem</div>
                    </div>
                    <div className="divide-y divide-gray-100">
                      <div
                        className={`grid grid-cols-[1fr,1.2fr,1fr] py-4 px-6 text-sm items-center cursor-pointer hover:bg-gray-50 ${
                          selectedComplexidade === 0 ? "bg-indigo-50" : ""
                        }`}
                        onClick={() => setSelectedComplexidade(0)}
                      >
                        <div>1</div>
                        <div>Sem complexidade</div>
                        <div className="relative">
                          <input
                            value={complexidadePercentages[0]}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateComplexidadePercentage(
                                0,
                                Number(e.target.value) || 0
                              );
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-12 pr-4 py-1 text-right bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-indigo-400 rounded"
                            min="0"
                            max="100"
                          />
                          <span className="absolute right-0 top-1/2 -translate-y-1/2">
                            %
                          </span>
                        </div>
                      </div>
                      <div
                        className={`grid grid-cols-[1fr,1.2fr,1fr] py-4 px-6 text-sm items-center cursor-pointer hover:bg-gray-50 ${
                          selectedComplexidade === 10 ? "bg-indigo-50" : ""
                        }`}
                        onClick={() => setSelectedComplexidade(10)}
                      >
                        <div>2</div>
                        <div>Um pouco complexo</div>
                        <div className="relative">
                          <input
                            value={complexidadePercentages[10]}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateComplexidadePercentage(
                                10,
                                Number(e.target.value) || 0
                              );
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-12 pr-4 py-1 text-right bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-indigo-400 rounded"
                            min="0"
                            max="100"
                          />
                          <span className="absolute right-0 top-1/2 -translate-y-1/2">
                            %
                          </span>
                        </div>
                      </div>
                      <div
                        className={`grid grid-cols-[1fr,1.2fr,1fr] py-4 px-6 text-sm items-center cursor-pointer hover:bg-gray-50 ${
                          selectedComplexidade === 20 ? "bg-indigo-50" : ""
                        }`}
                        onClick={() => setSelectedComplexidade(20)}
                      >
                        <div>3</div>
                        <div>Complexo</div>
                        <div className="relative">
                          <input
                            value={complexidadePercentages[20]}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateComplexidadePercentage(
                                20,
                                Number(e.target.value) || 0
                              );
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-12 pr-4 py-1 text-right bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-indigo-400 rounded"
                            min="0"
                            max="100"
                          />
                          <span className="absolute right-0 top-1/2 -translate-y-1/2">
                            %
                          </span>
                        </div>
                      </div>
                      <div
                        className={`grid grid-cols-[1fr,1.2fr,1fr] py-4 px-6 text-sm items-center cursor-pointer hover:bg-gray-50 ${
                          selectedComplexidade === 30 ? "bg-indigo-50" : ""
                        }`}
                        onClick={() => setSelectedComplexidade(30)}
                      >
                        <div>4</div>
                        <div>Alta complexidade</div>
                        <div className="relative">
                          <input
                            value={complexidadePercentages[30]}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateComplexidadePercentage(
                                30,
                                Number(e.target.value) || 0
                              );
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-12 pr-4 py-1 text-right bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-indigo-400 rounded"
                            min="0"
                            max="100"
                          />
                          <span className="absolute right-0 top-1/2 -translate-y-1/2">
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabela de Prazo de entrega */}
                <div>
                  <h3 className="font-medium mb-4 text-base">
                    Prazo de entrega
                  </h3>
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-[1fr,1.2fr,1fr] py-4 px-6 text-sm text-gray-600 bg-gray-50">
                      <div>Dias</div>
                      <div>Urgência</div>
                      <div>Porcentagem</div>
                    </div>
                    <div className="divide-y divide-gray-100">
                      <div
                        className={`grid grid-cols-[1fr,1.2fr,1fr] py-4 px-6 text-sm items-center cursor-pointer hover:bg-gray-50 ${
                          selectedPrazo === 0 ? "bg-indigo-50" : ""
                        }`}
                        onClick={() => setSelectedPrazo(0)}
                      >
                        <div>+de 9</div>
                        <div>Sem urgência</div>
                        <div className="relative">
                          <input
                            value={prazoPercentages[0]}
                            onChange={(e) => {
                              e.stopPropagation();
                              updatePrazoPercentage(
                                0,
                                Number(e.target.value) || 0
                              );
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-12 pr-4 py-1 text-right bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-indigo-400 rounded"
                            min="0"
                            max="100"
                          />
                          <span className="absolute right-0 top-1/2 -translate-y-1/2">
                            %
                          </span>
                        </div>
                      </div>
                      <div
                        className={`grid grid-cols-[1fr,1.2fr,1fr] py-4 px-6 text-sm items-center cursor-pointer hover:bg-gray-50 ${
                          selectedPrazo === 10 ? "bg-indigo-50" : ""
                        }`}
                        onClick={() => setSelectedPrazo(10)}
                      >
                        <div>6 a 8</div>
                        <div>Normal</div>
                        <div className="relative">
                          <input
                            value={prazoPercentages[10]}
                            onChange={(e) => {
                              e.stopPropagation();
                              updatePrazoPercentage(
                                10,
                                Number(e.target.value) || 0
                              );
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-12 pr-4 py-1 text-right bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-indigo-400 rounded"
                            min="0"
                            max="100"
                          />
                          <span className="absolute right-0 top-1/2 -translate-y-1/2">
                            %
                          </span>
                        </div>
                      </div>
                      <div
                        className={`grid grid-cols-[1fr,1.2fr,1fr] py-4 px-6 text-sm items-center cursor-pointer hover:bg-gray-50 ${
                          selectedPrazo === 20 ? "bg-indigo-50" : ""
                        }`}
                        onClick={() => setSelectedPrazo(20)}
                      >
                        <div>4 a 5</div>
                        <div>Urgente</div>
                        <div className="relative">
                          <input
                            value={prazoPercentages[20]}
                            onChange={(e) => {
                              e.stopPropagation();
                              updatePrazoPercentage(
                                20,
                                Number(e.target.value) || 0
                              );
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-12 pr-4 py-1 text-right bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-indigo-400 rounded"
                            min="0"
                            max="100"
                          />
                          <span className="absolute right-0 top-1/2 -translate-y-1/2">
                            %
                          </span>
                        </div>
                      </div>
                      <div
                        className={`grid grid-cols-[1fr,1.2fr,1fr] py-4 px-6 text-sm items-center cursor-pointer hover:bg-gray-50 ${
                          selectedPrazo === 30 ? "bg-indigo-50" : ""
                        }`}
                        onClick={() => setSelectedPrazo(30)}
                      >
                        <div>0 a 3</div>
                        <div>Extremamente urgente</div>
                        <div className="relative">
                          <input
                            value={prazoPercentages[30]}
                            onChange={(e) => {
                              e.stopPropagation();
                              updatePrazoPercentage(
                                30,
                                Number(e.target.value) || 0
                              );
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-12 pr-4 py-1 text-right bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-indigo-400 rounded"
                            min="0"
                            max="100"
                          />
                          <span className="absolute right-0 top-1/2 -translate-y-1/2">
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Valores finais após as tabelas */}
            <div className="mt-8 mb-12">
              <h3 className="text-lg font-medium mb-4">Valores finais</h3>
              <div className="flex gap-6">
                <div
                  className={`p-6 border rounded-xl cursor-pointer transition-all ${
                    !showAcrescimos
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200"
                  }`}
                  onClick={() => setShowAcrescimos(false)}
                >
                  <div className="text-sm text-gray-600 mb-2">
                    Custo final sem acréscimo
                  </div>
                  <div className="text-2xl font-bold">
                    R$ {calculateTotalBudget().toLocaleString("pt-BR")}
                  </div>
                </div>

                <div
                  className={`p-6 border rounded-xl cursor-pointer transition-all ${
                    showAcrescimos
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200"
                  }`}
                  onClick={() => setShowAcrescimos(true)}
                >
                  <div className="text-sm text-gray-600 mb-2">
                    Valor final com prazo e complexidade
                  </div>
                  <div className="text-2xl font-bold">
                    R$ {calculateFinalValue().toLocaleString("pt-BR")}
                  </div>
                </div>
              </div>
            </div>

            {/* Ajuste de valores */}
            <h3 className="text-2xl font-bold mb-6">
              Ajuste de valores (Opcional)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
              {/* Acrescentar valor */}
              <div
                className={`border rounded-lg p-5 relative bg-white cursor-pointer transition-colors ${
                  opcoesAjusteValor.includes("adicionar")
                    ? "border-indigo-600 bg-indigo-50"
                    : "hover:border-gray-300"
                }`}
                onClick={() => {
                  const newOpcoes = opcoesAjusteValor.includes("adicionar")
                    ? opcoesAjusteValor.filter((op) => op !== "adicionar")
                    : [...opcoesAjusteValor, "adicionar"];
                  setOpcoesAjusteValor(newOpcoes);
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer ${
                      opcoesAjusteValor.includes("adicionar")
                        ? "border-indigo-600"
                        : ""
                    }`}
                  >
                    {opcoesAjusteValor.includes("adicionar") && (
                      <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium">Acrescentar valor</h4>
                    <p className="text-sm text-gray-500">
                      Acrescente um valor de fechamento
                    </p>
                  </div>
                </div>

                {opcoesAjusteValor.includes("adicionar") && (
                  <div className="pl-8">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm">R$</span>
                      </div>
                      <input
                        type="text"
                        className="pl-8 pr-4 py-2 w-full border border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                        placeholder="100 Reais"
                        value={adicionalValor || ""}
                        onChange={(e) => {
                          setAdicionalValor(Number(e.target.value) || 0);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Dar desconto */}
              <div
                className={`border rounded-lg p-5 relative bg-white cursor-pointer transition-colors ${
                  opcoesAjusteValor.includes("desconto")
                    ? "border-indigo-600 bg-indigo-50"
                    : "hover:border-gray-300"
                }`}
                onClick={() => {
                  const newOpcoes = opcoesAjusteValor.includes("desconto")
                    ? opcoesAjusteValor.filter((op) => op !== "desconto")
                    : [...opcoesAjusteValor, "desconto"];
                  setOpcoesAjusteValor(newOpcoes);
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer ${
                      opcoesAjusteValor.includes("desconto")
                        ? "border-indigo-600"
                        : ""
                    }`}
                  >
                    {opcoesAjusteValor.includes("desconto") && (
                      <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium">Dar desconto</h4>
                    <p className="text-sm text-gray-500">
                      Valor ou porcentagem
                    </p>
                  </div>
                </div>

                {opcoesAjusteValor.includes("desconto") && (
                  <div className="pl-8">
                    <div className="flex items-center gap-3">
                      {/* Toggle para alternar entre valor e porcentagem */}
                      <div className="flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          type="button"
                          className={`px-3 py-1 text-xs font-medium transition-colors ${
                            tipoDesconto === "valor"
                              ? "bg-indigo-600 text-white border-b border-gray-200"
                              : "bg-gray-100 text-gray-500"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setTipoDesconto("valor");
                          }}
                        >
                          R$
                        </button>
                        <button
                          type="button"
                          className={`px-3 py-1 text-xs font-medium transition-colors ${
                            tipoDesconto === "percentual"
                              ? "bg-indigo-600 text-white"
                              : "bg-gray-100 text-gray-500"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setTipoDesconto("percentual");
                          }}
                        >
                          %
                        </button>
                      </div>

                      {/* Campo de input estilizado */}
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 text-sm">
                            {tipoDesconto === "valor" ? "R$" : "%"}
                          </span>
                        </div>
                        <input
                          type="text"
                          className="pl-8 pr-4 py-2 w-full border border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                          placeholder={
                            tipoDesconto === "percentual" ? "10" : "100"
                          }
                          value={desconto || ""}
                          onChange={(e) => {
                            setDesconto(Number(e.target.value) || 0);
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Valores finais */}
            <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch">
              <div className="flex-1 bg-white rounded-2xl p-8 flex flex-col items-center justify-center shadow-sm">
                <span className="text-gray-500 text-lg mb-2">
                  Valor médio por hora
                </span>
                <span className="text-4xl font-bold">
                  R$ {Math.round(calculateAveragePricePerSqm())}
                </span>
              </div>
              <div className="flex-1 bg-indigo-50 rounded-2xl p-8 flex flex-col items-center justify-center border-2 border-indigo-200">
                <span className="text-gray-500 text-lg mb-2">
                  Valor final do orçamento
                </span>
                <span className="text-4xl font-bold text-indigo-700">
                  R$ {Math.round(calculateFinalValue())}
                </span>
                {opcoesAjusteValor.includes("desconto") && desconto > 0 && (
                  <span className="text-gray-500 text-base mt-2">
                    Desconto:{" "}
                    {tipoDesconto === "percentual"
                      ? `${desconto}%`
                      : `R$ ${desconto}`}
                  </span>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="mb-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
              <div>
                <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-4 py-1 rounded-full mb-3">
                  Orçamento Render
                </span>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {projectName || "Nome do projeto"}
                </h1>
                <p className="text-gray-500 max-w-2xl">
                  {projectDescription || "Descrição do projeto não informada."}
                </p>
              </div>
              <Button className="bg-indigo-700 hover:bg-indigo-800 text-white px-6 py-3 text-base font-medium shadow-md">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="inline-block mr-2"
                >
                  <path
                    d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1465 1.14645L3.71455 8.57836C3.62459 8.66832 3.55263 8.77461 3.50251 8.89155L2.04044 12.303C1.9599 12.491 2.00189 12.709 2.14646 12.8536C2.29103 12.9981 2.50905 13.0401 2.69697 12.9596L6.10847 11.4975C6.2254 11.4474 6.3317 11.3754 6.42166 11.2855L13.8536 3.85355C14.0488 3.65829 14.0488 3.34171 13.8536 3.14645L11.8536 1.14645ZM4.42166 9.28547L11.5 2.20711L12.7929 3.5L5.71455 10.5784L4.21924 11.2192L3.78081 10.7808L4.42166 9.28547Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  ></path>
                </svg>
                Editar orçamento
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {/* Card Cliente */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border flex gap-4 items-center">
                <div className="bg-indigo-100 rounded-full p-3 flex items-center justify-center">
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="12" fill="#EEF2FF" />
                    <path
                      d="M12 13.5c2.485 0 4.5 2.015 4.5 4.5v.25a.75.75 0 0 1-.75.75H8.25a.75.75 0 0 1-.75-.75v-.25c0-2.485 2.015-4.5 4.5-4.5Z"
                      fill="#6366F1"
                    />
                    <circle cx="12" cy="9" r="3" fill="#6366F1" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium mb-1">
                    Cliente
                  </div>
                  <div className="text-xl font-bold mb-1">
                    {clientName || "Cliente não selecionado"}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {clientId
                      ? "Cliente selecionado para o orçamento"
                      : "Cliente não selecionado"}
                  </div>
                </div>
              </div>

              {/* Card Modelo */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border flex gap-4 items-center">
                <div className="bg-indigo-100 rounded-full p-3 flex items-center justify-center">
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                    <rect
                      x="4"
                      y="7"
                      width="16"
                      height="10"
                      rx="2"
                      fill="#6366F1"
                    />
                    <rect
                      x="8"
                      y="11"
                      width="8"
                      height="2"
                      rx="1"
                      fill="#EEF2FF"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium mb-1">
                    Modelo
                  </div>
                  <div className="text-xl font-bold mb-1">
                    {tipoAmbiente === "interior"
                      ? "Interiores"
                      : tipoAmbiente === "exterior"
                      ? "Exteriores"
                      : "Modelo não selecionado"}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {tipoAmbiente === "interior"
                      ? "Projeto de interiores com renders"
                      : tipoAmbiente === "exterior"
                      ? "Projeto de exteriores com renders"
                      : "Selecione um modelo de projeto"}
                  </div>
                </div>
              </div>

              {/* Card Modelo de orçamento */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border flex gap-4 items-center">
                <div className="bg-indigo-100 rounded-full p-3 flex items-center justify-center">
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                    <rect
                      x="4"
                      y="10"
                      width="16"
                      height="4"
                      rx="2"
                      fill="#6366F1"
                    />
                    <rect
                      x="8"
                      y="14"
                      width="8"
                      height="2"
                      rx="1"
                      fill="#EEF2FF"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium mb-1">
                    Tipo de Orçamento
                  </div>
                  <div className="text-xl font-bold mb-1">
                    Orçamento por Render
                  </div>
                  <div className="text-gray-400 text-sm">
                    Orçamento baseado em tempo e complexidade
                  </div>
                </div>
              </div>

              {/* Card Valores */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border flex gap-4 items-center">
                <div className="bg-indigo-100 rounded-full p-3 flex items-center justify-center">
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                    <rect
                      x="4"
                      y="7"
                      width="16"
                      height="10"
                      rx="2"
                      fill="#6366F1"
                    />
                    <rect
                      x="8"
                      y="11"
                      width="8"
                      height="2"
                      rx="1"
                      fill="#EEF2FF"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium mb-1">
                    Valores
                  </div>
                  <div className="text-xl font-bold mb-1">
                    {valorComodos === "individuais"
                      ? "Orçados individualmente"
                      : valorComodos === "unico"
                      ? "Valor único"
                      : "Tipo de valor não selecionado"}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {valorComodos === "individuais"
                      ? "Cada ambiente tem seu próprio valor"
                      : valorComodos === "unico"
                      ? "Um valor único para todo o projeto"
                      : "Selecione como os valores serão calculados"}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabela de ambientes/itens do orçamento */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-6">
                Dados contemplados no orçamento
              </h2>
              <div className="bg-white rounded-2xl shadow-sm border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 text-left">
                      <th className="px-6 py-4 font-semibold">Nome</th>
                      <th className="px-6 py-4 font-semibold">Tempo</th>
                      <th className="px-6 py-4 font-semibold">Imagens</th>
                      <th className="px-6 py-4 font-semibold">Complexidade</th>
                      <th className="px-6 py-4 font-semibold">Total</th>
                      <th className="px-6 py-4 font-semibold text-center">
                        Exibir?
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgetItems.map((item) => (
                      <tr key={item.id} className="border-t last:border-b-0">
                        <td className="px-6 py-4 font-bold align-top">
                          <div>{item.name}</div>
                          <div className="text-xs text-gray-500 font-normal mt-1">
                            {item.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 align-top">
                          {item.tempoDesenvolvimento}h
                        </td>
                        <td className="px-6 py-4 align-top">
                          {item.quantidadeImagens}
                        </td>
                        <td className="px-6 py-4 align-top">
                          {item.grauComplexidade === "sem" &&
                            "Sem complexidade"}
                          {item.grauComplexidade === "baixa" && "Baixa"}
                          {item.grauComplexidade === "media" && "Média"}
                          {item.grauComplexidade === "alta" && "Alta"}
                        </td>
                        <td className="px-6 py-4 align-top">
                          {formatCurrency(item.total)}
                        </td>
                        <td className="px-6 py-4 align-top text-center">
                          <button
                            onClick={() => toggleItemVisibility(item.id)}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            title={
                              item.exibir
                                ? "Ocultar do orçamento"
                                : "Exibir no orçamento"
                            }
                          >
                            {item.exibir ? (
                              // Olho aberto
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="22"
                                height="22"
                                fill="none"
                                viewBox="0 0 24 24"
                                className="text-indigo-700"
                              >
                                <path
                                  fill="currentColor"
                                  d="M12 5c-3.86 0-7.16 2.54-8.47 6.09a1.75 1.75 0 0 0 0 1.32C4.84 15.46 8.14 18 12 18s7.16-2.54 8.47-6.09a1.75 1.75 0 0 0 0-1.32C19.16 7.54 15.86 5 12 5Zm0 11c-3.07 0-6-2-7.11-5C6 8 8.93 6 12 6s6 2 7.11 5c-1.11 3-4.04 5-7.11 5Zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm0 5a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"
                                />
                              </svg>
                            ) : (
                              // Olho fechado
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="22"
                                height="22"
                                fill="none"
                                viewBox="0 0 24 24"
                                className="text-gray-400"
                              >
                                <path
                                  fill="currentColor"
                                  d="M12 5c-3.86 0-7.16 2.54-8.47 6.09a1.75 1.75 0 0 0 0 1.32C4.84 15.46 8.14 18 12 18s7.16-2.54 8.47-6.09a1.75 1.75 0 0 0 0-1.32C19.16 7.54 15.86 5 12 5Zm0 11c-3.07 0-6-2-7.11-5C6 8 8.93 6 12 6s6 2 7.11 5c-1.11 3-4.04 5-7.11 5Zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm0 5a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"
                                />
                                <path
                                  fill="currentColor"
                                  d="M2 2L22 22"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Informações de Prazo e Complexidade */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-6">Prazo e Complexidade</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border">
                  <h3 className="text-lg font-semibold mb-4">
                    Prazo de Entrega
                  </h3>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="text-gray-500">Dias para entrega:</div>
                    <div className="font-medium">{deliveryTimeDays} dias</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-gray-500">Acréscimo por prazo:</div>
                    <div className="font-medium">{selectedPrazo}%</div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border">
                  <h3 className="text-lg font-semibold mb-4">Complexidade</h3>
                  <div className="flex items-center gap-4">
                    <div className="text-gray-500">
                      Acréscimo por complexidade:
                    </div>
                    <div className="font-medium">{selectedComplexidade}%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Valores Finais */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-6">Valores do Orçamento</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border">
                  <h3 className="text-lg font-semibold mb-4">Valor Base</h3>
                  <div className="text-2xl font-bold text-indigo-600">
                    {formatCurrency(calculateTotalBudget())}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Valor sem acréscimos
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border">
                  <h3 className="text-lg font-semibold mb-4">Acréscimos</h3>
                  <div className="text-2xl font-bold text-indigo-600">
                    {formatCurrency(
                      calculateFinalValue() - calculateTotalBudget()
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Total de acréscimos aplicados
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-indigo-200 bg-indigo-50">
                  <h3 className="text-lg font-semibold mb-4">Valor Final</h3>
                  <div className="text-2xl font-bold text-indigo-600">
                    {formatCurrency(calculateFinalValue())}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Valor final com todos os acréscimos
                  </div>
                </div>
              </div>
            </div>

            {/* Projetos de Referência */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-6">
                Projetos de Referência
              </h2>
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <div className="flex flex-wrap gap-2">
                  {selectedReferences.map((ref, index) => (
                    <span
                      key={index}
                      className="bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-1.5 text-sm text-indigo-700"
                    >
                      {ref}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Função para adicionar ambiente padrão
  const addDefaultEnvironment = (environmentType: string) => {
    const defaultEnvironments: Record<string, any> = {
      sala: {
        name: "Sala",
        description: "Projeto da sala completo conforme solicitado",
        tempoDesenvolvimento: 0,
        quantidadeImagens: 0,
        grauComplexidade: "baixa",
      },
      fachada: {
        name: "Fachada",
        description: "Fazer letreiro",
        tempoDesenvolvimento: 0,
        quantidadeImagens: 0,
        grauComplexidade: "sem",
      },
      cozinha: {
        name: "Cozinha",
        description: "Refazer a pia",
        tempoDesenvolvimento: 0,
        quantidadeImagens: 0,
        grauComplexidade: "media",
      },
      banheiro: {
        name: "Banheiro",
        description: "Reforma completa do banheiro",
        tempoDesenvolvimento: 0,
        quantidadeImagens: 0,
        grauComplexidade: "baixa",
      },
      lavanderia: {
        name: "Lavanderia",
        description: "Projeto da lavanderia",
        tempoDesenvolvimento: 0,
        quantidadeImagens: 0,
        grauComplexidade: "sem",
      },
    };

    const env = defaultEnvironments[environmentType];
    if (env) {
      const newItem: BudgetItem = {
        id: Date.now().toString(),
        name: env.name,
        description: env.description,
        tempoDesenvolvimento: env.tempoDesenvolvimento,
        quantidadeImagens: env.quantidadeImagens,
        grauComplexidade: env.grauComplexidade,
        total: 0,
        exibir: true,
        isEditingField: "tempoDesenvolvimento", // Começa editando o tempo de desenvolvimento
      };
      setBudgetItems([...budgetItems, newItem]);
      toast.success(`${env.name} adicionado! Preencha os valores.`);
    }
  };

  // Função para alternar a exibição de um item
  const toggleItemVisibility = (itemId: string) => {
    setBudgetItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, exibir: !item.exibir } : item
      )
    );
  };

  // Função para inicializar o chat LimIA
  const startLimIAChat = () => {
    setShowLimIAChat(true);
    setChatMessages([
      {
        id: "1",
        type: "ai",
        content:
          "Olá! Sou o LimIA, seu assistente para orçamentos de renderização. Vou te ajudar a criar um orçamento personalizado. Primeiro, me diga qual é o nome do seu projeto?",
        timestamp: new Date(),
      },
    ]);
    setChatStep(0);
    setCollectedData({
      projectName: "",
      projectDescription: "",
      renderType: "",
      numberOfImages: 0,
      imageQuality: "",
      complexity: "",
      deliveryTime: 0,
      additionalServices: [],
    });
  };

  // Função para enviar mensagem no chat
  const sendChatMessage = async () => {
    if (!currentInput.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: "user" as const,
      content: currentInput,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setCurrentInput("");
    setIsTyping(true);

    // Scroll para baixo após enviar mensagem
    setTimeout(scrollToBottom, 100);

    // Processar a resposta do usuário
    const currentQuestion = chatQuestions[chatStep];
    if (currentQuestion) {
      let processedValue: any = currentInput;

      // Processar arrays (como additionalServices)
      if (currentQuestion.isArray) {
        processedValue = currentInput.split(",").map((item) => item.trim());
      }

      // Processar números
      if (currentQuestion.isNumber) {
        processedValue = parseFloat(currentInput) || 0;
      }

      // Atualizar dados coletados
      setCollectedData((prev) => ({
        ...prev,
        [currentQuestion.field]: processedValue,
      }));
    }

    // Simular delay de digitação da IA
    setTimeout(async () => {
      const nextStep = chatStep + 1;

      if (nextStep < chatQuestions.length) {
        // Próxima pergunta
        const nextQuestion = chatQuestions[nextStep];
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          type: "ai" as const,
          content: nextQuestion.question,
          timestamp: new Date(),
        };

        setChatMessages((prev) => [...prev, aiMessage]);
        setChatStep(nextStep);

        // Scroll para baixo após nova mensagem da IA
        setTimeout(scrollToBottom, 100);
      } else {
        // Finalizar chat e gerar orçamento
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          content:
            "Perfeito! Agora vou gerar um orçamento de renderização personalizado baseado nas suas informações. Isso pode levar alguns segundos...",
          type: "ai" as const,
          timestamp: new Date(),
        };

        setChatMessages((prev) => [...prev, aiMessage]);

        // Scroll para baixo após mensagem de processamento
        setTimeout(scrollToBottom, 100);

        // Gerar orçamento com os dados coletados
        await generateBudgetFromChat();
      }

      setIsTyping(false);
    }, 1000);
  };

  // Função para extrair valores da resposta da IA
  const extractAIValues = (sugestao: string) => {
    const values = {
      suggestedPricePerImage: 0,
      suggestedTotalPrice: 0,
      recommendedMargin: 20,
      analysis: sugestao,
    };

    // Extrair valor por imagem sugerido
    const pricePerImageMatch = sugestao.match(/R\$ (\d+(?:\.\d+)?)/g);
    if (pricePerImageMatch && pricePerImageMatch.length > 0) {
      const lastValue = pricePerImageMatch[pricePerImageMatch.length - 1];
      values.suggestedPricePerImage = parseInt(
        lastValue.replace("R$ ", "").replace(".", "")
      );
    }

    // Extrair valor total sugerido
    const totalPriceMatch = sugestao.match(/total.*R\$ (\d+(?:\.\d+)?)/i);
    if (totalPriceMatch) {
      values.suggestedTotalPrice = parseInt(
        totalPriceMatch[1].replace(".", "")
      );
    }

    // Extrair margem recomendada
    const marginMatch = sugestao.match(/margem de (\d+)%/);
    if (marginMatch) {
      values.recommendedMargin = parseInt(marginMatch[1]);
    }

    return values;
  };

  // Função para gerar orçamento a partir do chat
  const generateBudgetFromChat = async () => {
    try {
      // Preparar dados para o endpoint
      const payload = {
        tipoProjeto: "renderizacao",
        tipoOrcamento: "render",
        tipoRender: collectedData.renderType,
        quantidadeImagens: collectedData.numberOfImages,
        qualidadeImagem: collectedData.imageQuality,
        complexidade: collectedData.complexity,
        prazoEntrega: collectedData.deliveryTime,
        servicosAdicionais: collectedData.additionalServices,
        userId: "user123", // TODO: Usar ID real do usuário
      };

      const response = await fetch(
        "http://localhost:3003/api/openai/sugestao-orcamento",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Extrair valores da resposta da IA
        const aiValues = extractAIValues(data.sugestao || data.message || "");

        // Adicionar mensagem de sucesso
        const successMessage = {
          id: (Date.now() + 2).toString(),
          type: "ai" as const,
          content:
            "Orçamento de renderização gerado com sucesso! Vou mostrar uma comparação entre suas informações e as sugestões da IA.",
          timestamp: new Date(),
        };

        setChatMessages((prev) => [...prev, successMessage]);

        // Scroll para baixo após resultado
        setTimeout(scrollToBottom, 100);

        // Armazenar dados da IA e mostrar modal de comparação
        setAiGeneratedData({
          ...data,
          ...aiValues,
        });
        setShowComparisonModal(true);
      } else {
        throw new Error("Erro ao gerar orçamento");
      }
    } catch (error) {
      console.error("Erro ao gerar orçamento:", error);

      const errorMessage = {
        id: (Date.now() + 2).toString(),
        type: "ai" as const,
        content:
          "Desculpe, ocorreu um erro ao gerar o orçamento. Tente novamente.",
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, errorMessage]);

      // Scroll para baixo após erro
      setTimeout(scrollToBottom, 100);
    }
  };

  // Função para aplicar dados da IA
  const applyAIData = () => {
    if (aiGeneratedData) {
      // Aplicar os dados da IA ao formulário
      setProjectName(collectedData.projectName);
      setProjectDescription(collectedData.projectDescription);

      // Criar itens de renderização com valores da IA
      if (
        aiGeneratedData.suggestedPricePerImage &&
        collectedData.numberOfImages > 0
      ) {
        const newItems = Array.from(
          { length: collectedData.numberOfImages },
          (_, index) => ({
            id: Date.now().toString() + index,
            name: `Render ${index + 1}`,
            description: `Renderização ${collectedData.renderType} - ${collectedData.imageQuality}`,
            tempoDesenvolvimento: 8, // Valor padrão
            quantidadeImagens: 1,
            grauComplexidade: collectedData.complexity as
              | "sem"
              | "baixa"
              | "media"
              | "alta",
            total: aiGeneratedData.suggestedPricePerImage,
            exibir: true,
          })
        );

        setBudgetItems(newItems);
      }

      setShowComparisonModal(false);
      setShowLimIAChat(false);
      toast.success("Valores da IA aplicados ao formulário!");
    }
  };

  // Função para manter dados originais
  const keepOriginalData = () => {
    // Aplicar os dados coletados originalmente
    setProjectName(collectedData.projectName);
    setProjectDescription(collectedData.projectDescription);
    setShowComparisonModal(false);
    setShowLimIAChat(false);
    toast.success("Dados do chat aplicados ao formulário!");
  };

  // Função para lidar com Enter no chat
  const handleChatKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  // Função para fazer scroll automático
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Configuração das perguntas do chat para renderização
  const chatQuestions = [
    {
      id: "projectName",
      question: "Qual é o nome do seu projeto de renderização?",
      field: "projectName" as keyof typeof collectedData,
    },
    {
      id: "projectDescription",
      question: "Descreva brevemente o projeto:",
      field: "projectDescription" as keyof typeof collectedData,
    },
    {
      id: "renderType",
      question:
        "Que tipo de renderização você precisa? (ex: externa, interna, produto, arquitetônica)",
      field: "renderType" as keyof typeof collectedData,
    },
    {
      id: "numberOfImages",
      question: "Quantas imagens você precisa?",
      field: "numberOfImages" as keyof typeof collectedData,
      isNumber: true,
    },
    {
      id: "imageQuality",
      question: "Qual a qualidade desejada? (baixa, média, alta, ultra)",
      field: "imageQuality" as keyof typeof collectedData,
      options: ["baixa", "média", "alta", "ultra"],
    },
    {
      id: "complexity",
      question: "Qual é o nível de complexidade da cena? (baixa, média, alta)",
      field: "complexity" as keyof typeof collectedData,
      options: ["baixa", "média", "alta"],
    },
    {
      id: "deliveryTime",
      question: "Qual é o prazo de entrega desejado em dias?",
      field: "deliveryTime" as keyof typeof collectedData,
      isNumber: true,
    },
    {
      id: "additionalServices",
      question:
        "Quais serviços adicionais você precisa? (ex: pós-produção, animação, 360°)",
      field: "additionalServices" as keyof typeof collectedData,
      isArray: true,
    },
  ];

  return (
    <>
      <div className="max-w-6xl mx-auto w-full py-6 px-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-1">Orçamentos</h2>
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <div className="w-full h-1 bg-gray-200 rounded-full">
                <div
                  className="h-1 bg-indigo-600 rounded-full"
                  style={{
                    width:
                      budgetStep === 1
                        ? "25%"
                        : budgetStep === 2
                        ? "50%"
                        : budgetStep === 3
                        ? "75%"
                        : "100%",
                  }}
                ></div>
              </div>
            </div>
            <div className="ml-4 text-sm font-medium text-gray-600">
              Etapa {budgetStep} de 4
            </div>
          </div>
        </div>

        {renderStepContent()}

        <div className="flex justify-between">
          {budgetStep > 1 && (
            <Button
              className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
              onClick={() => setBudgetStep(budgetStep - 1)}
            >
              Voltar
            </Button>
          )}

          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 ml-auto"
            onClick={
              budgetStep === 4
                ? handleSubmitBudget
                : () => {
                    if (budgetStep === 1) {
                      setBudgetStep(2);
                      toast.success("Informações básicas salvas");
                    } else if (budgetStep === 2) {
                      setBudgetStep(3);
                      toast.success("Preferências salvas");
                    } else if (budgetStep === 3) {
                      setBudgetStep(4);
                      toast.success("Itens adicionados com sucesso");
                    }
                  }
            }
            disabled={
              isSubmitting ||
              (budgetStep === 2 && (!tipoAmbiente || !valorComodos))
            }
          >
            {isSubmitting
              ? "Salvando..."
              : budgetStep === 4
              ? "Finalizar"
              : "Continuar"}
          </Button>
        </div>
      </div>

      {/* Sidebar de adição/edição de item */}
      <OrcamentoRenderItemSidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        onSave={handleSaveItem}
        initialItem={
          editingItem
            ? {
                id: editingItem.id,
                nome: editingItem.name,
                descricao: editingItem.description,
                tempoDesenvolvimento: editingItem.tempoDesenvolvimento,
                quantidadeImagens: editingItem.quantidadeImagens,
                grauComplexidade: editingItem.grauComplexidade,
                total: editingItem.total,
              }
            : undefined
        }
      />

      {/* Modal de criação de cliente */}
      {showClientsModal && (
        <ClientsModal
          isClientModalOpen={showClientsModal}
          setIsClientModalOpen={setShowClientsModal}
          onClientSelect={handleSelectClient}
        />
      )}

      {/* FAB do LimIA */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          {/* Botão principal do FAB */}
          <button
            onClick={startLimIAChat}
            className="w-14 h-14 bg-white border-2 border-[#c084fc] rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
          >
            <Sparkles className="w-4 h-4 text-[#c084fc]" />
          </button>
        </div>
      </div>

      {/* Chat LimIA */}
      {showLimIAChat && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[600px] flex flex-col">
            {/* Header do chat */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">LimIA</h3>
                  <p className="text-xs text-gray-500">
                    Assistente de Orçamentos de Renderização
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLimIAChat(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Área de mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.type === "user"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Indicador de digitação */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Elemento para scroll automático */}
              <div ref={messagesEndRef} />
            </div>

            {/* Área de input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyPress={handleChatKeyPress}
                  placeholder="Digite sua resposta..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  disabled={isTyping}
                />
                <button
                  onClick={sendChatMessage}
                  disabled={!currentInput.trim() || isTyping}
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Comparação */}
      {showComparisonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setShowComparisonModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Comparação de Valores
                  </h2>
                  <p className="text-sm text-gray-500">
                    Compare suas informações com as sugestões da IA
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowComparisonModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-6">
                {/* Comparação de valores */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Suas informações */}
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                          fill="currentColor"
                        />
                      </svg>
                      Suas Informações
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-blue-600">
                          Tipo de render:
                        </span>
                        <div className="text-lg font-semibold text-blue-700">
                          {collectedData.renderType}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-blue-600">
                          Quantidade:
                        </span>
                        <div className="text-lg font-semibold text-blue-700">
                          {collectedData.numberOfImages} imagens
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-blue-600">
                          Qualidade:
                        </span>
                        <div className="text-lg font-semibold text-blue-700">
                          {collectedData.imageQuality}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sugestões da IA */}
                  <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                    <h3 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Sugestões da IA
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-purple-600">
                          Valor por imagem:
                        </span>
                        <div className="text-2xl font-bold text-purple-700">
                          R$ {aiGeneratedData?.suggestedPricePerImage || "N/A"}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-purple-600">
                          Valor total:
                        </span>
                        <div className="text-lg font-semibold text-purple-700">
                          R$ {aiGeneratedData?.suggestedTotalPrice || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Análise da IA */}
                {aiGeneratedData?.analysis && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Análise da IA
                        </h3>
                        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {aiGeneratedData.analysis}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={applyAIData}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium py-3 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Aplicar valores da IA
              </button>
              <button
                onClick={keepOriginalData}
                className="flex-1 bg-white border border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                Manter minhas informações
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
