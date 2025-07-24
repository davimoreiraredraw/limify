"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { UserIcon } from "lucide-react";
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
  const [opcaoAjusteValor, setOpcaoAjusteValor] = useState<
    "adicionar" | "desconto" | null
  >("adicionar");

  // Estado para os itens do orçamento
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
    {
      id: "1",
      name: "Sala",
      description: "Projeto da sala completo conforme solicitado",
      tempoDesenvolvimento: 2,
      quantidadeImagens: 2,
      grauComplexidade: "baixa",
      total: 720,
    },
    {
      id: "2",
      name: "Fachada",
      description: "Fazer letreiro",
      tempoDesenvolvimento: 1,
      quantidadeImagens: 1,
      grauComplexidade: "sem",
      total: 150,
    },
    {
      id: "3",
      name: "Cozinha",
      description: "Refazer a pia",
      tempoDesenvolvimento: 3,
      quantidadeImagens: 2,
      grauComplexidade: "media",
      total: 1350,
    },
  ]);

  // Estados para a sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);

  // Estados adicionais
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    const itemsTotal = budgetItems.reduce((sum, item) => sum + item.total, 0);
    let finalTotal = itemsTotal;

    // Aplicar adicional de valor se essa opção estiver selecionada
    if (opcaoAjusteValor === "adicionar") {
      finalTotal += adicionalValor;
    }
    // Aplicar desconto se essa opção estiver selecionada
    else if (opcaoAjusteValor === "desconto") {
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
    const totalHoras = budgetItems.reduce(
      (sum, item) => sum + item.tempoDesenvolvimento,
      0
    );
    const totalPrice = budgetItems.reduce((sum, item) => sum + item.total, 0);

    if (totalHoras === 0) return 0;
    return totalPrice / totalHoras;
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

    const complexidadePercent = selectedComplexidade || 0;
    const prazoPercent = selectedPrazo || 0;

    const complexidadeValue = (baseValue * complexidadePercent) / 100;
    const prazoValue = (baseValue * prazoPercent) / 100;

    return baseValue + complexidadeValue + prazoValue;
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
                <div className="border rounded-lg p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Nome do cliente</h4>
                    <span className="text-xs text-gray-500">Opcional</span>
                  </div>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        ref={inputRef}
                        type="text"
                        className="pl-10 pr-4 py-2 w-full border rounded-md text-sm"
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
                    <Button
                      className="bg-indigo-600 text-white"
                      onClick={() => setShowClientsModal(true)}
                    >
                      Selecionar
                    </Button>
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

            <div>
              <h3 className="text-xl font-semibold mb-6">
                Qual é o nome do projeto?
              </h3>

              <div className="border rounded-lg p-5 bg-indigo-50 border-indigo-600">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-5 h-5 rounded-full border border-indigo-600 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                  </div>
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

            <div className="flex items-end justify-end mt-6">
              <div className="flex items-center gap-2">
                <div className="border border-dashed border-[#c084fc] rounded-full px-5 py-1.5 flex items-center gap-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-[#c084fc]"
                  >
                    <path
                      d="M12.279 1.22a.75.75 0 0 0-1.118 0l-3.469 4.235-5.103.755a.75.75 0 0 0-.415 1.28l3.687 3.594-.87 5.073a.75.75 0 0 0 1.088.79L12 14.468l4.922 2.59a.75.75 0 0 0 1.087-.791l-.87-5.074 3.688-3.594a.75.75 0 0 0-.415-1.28l-5.103-.754L12.28 1.22z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="font-medium text-[#c084fc]">LimIA</span>
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

            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-6">
                Adicione os itens do seu orçamento
              </h2>

              <button
                className="bg-indigo-900 text-white flex items-center gap-2 px-4 py-3 rounded-lg mb-6"
                onClick={addNewItem}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.5 1C7.77614 1 8 1.22386 8 1.5V13.5C8 13.7761 7.77614 14 7.5 14C7.22386 14 7 13.7761 7 13.5V1.5C7 1.22386 7.22386 1 7.5 1Z"
                    fill="currentColor"
                  />
                  <path
                    d="M1.5 7C1.22386 7 1 7.22386 1 7.5C1 7.77614 1.22386 8 1.5 8H13.5C13.7761 8 14 7.77614 14 7.5C14 7.22386 13.7761 7 13.5 7H1.5Z"
                    fill="currentColor"
                  />
                </svg>
                Adicionar ambiente
              </button>

              <div className="bg-white rounded-lg border border-gray-200">
                {/* Cabeçalho da tabela */}
                <div className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,0.5fr] gap-4 p-4 text-sm font-medium text-gray-600 border-b">
                  <div>Nome</div>
                  <div>Tempo para desenvolver</div>
                  <div>Quantidade de imagens</div>
                  <div>Custo imagem</div>
                  <div>Custo Total</div>
                  <div>Ações</div>
                </div>

                {/* Itens da tabela */}
                {budgetItems.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,0.5fr] gap-4 p-4 border-b items-center text-sm"
                  >
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-gray-500 text-sm mt-1">
                        {item.description}
                      </div>
                    </div>
                    <div>{item.tempoDesenvolvimento}h</div>
                    <div>{item.quantidadeImagens}</div>
                    <div>
                      {formatCurrency(item.total / item.quantidadeImagens)}
                    </div>
                    <div className="font-medium">
                      {formatCurrency(item.total)}
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => removeItem(item.id)}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 15 15"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H3.5C3.22386 4 3 3.77614 3 3.5ZM4.5 5C4.77614 5 5 5.22386 5 5.5V10.5C5 10.7761 4.77614 11 4.5 11C4.22386 11 4 10.7761 4 10.5V5.5C4 5.22386 4.22386 5 4.5 5ZM7.5 5C7.77614 5 8 5.22386 8 5.5V10.5C8 10.7761 7.77614 11 7.5 11C7.22386 11 7 10.7761 7 10.5V5.5C7 5.22386 7.22386 5 7.5 5ZM10.5 5C10.7761 5 11 5.22386 11 5.5V10.5C11 10.7761 10.7761 11 10.5 11C10.2239 11 10 10.7761 10 10.5V5.5C10 5.22386 10.2239 5 10.5 5Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <button
                        className="text-indigo-600 hover:text-indigo-800"
                        onClick={() => editItem(item)}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 15 15"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1465 1.14645L3.71455 8.57836C3.62459 8.66832 3.55263 8.77461 3.50251 8.89155L2.04044 12.303C1.9599 12.491 2.00189 12.709 2.14646 12.8536C2.29103 12.9981 2.50905 13.0401 2.69697 12.9596L6.10847 11.4975C6.2254 11.4474 6.3317 11.3754 6.42166 11.2855L13.8536 3.85355C14.0488 3.65829 14.0488 3.34171 13.8536 3.14645L11.8536 1.14645ZM4.42166 9.28547L11.5 2.20711L12.7929 3.5L5.71455 10.5784L4.21924 11.2192L3.78081 10.7808L4.42166 9.28547Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
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
            </div>

            {/* Tabelas de Complexidade e Prazo */}
            <div className="mb-12">
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
                            type="text"
                            value="0"
                            className="w-12 pr-4 py-1 text-right bg-transparent"
                            readOnly
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
                            type="text"
                            value="10"
                            className="w-12 pr-4 py-1 text-right bg-transparent"
                            readOnly
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
                            type="text"
                            value="20"
                            className="w-12 pr-4 py-1 text-right bg-transparent"
                            readOnly
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
                            type="text"
                            value="30"
                            className="w-12 pr-4 py-1 text-right bg-transparent"
                            readOnly
                          />
                          <span className="absolute right-0 top-1/2 -translate-y-1/2">
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button className="inline-flex items-center gap-2 text-sm text-[#6366F1] bg-[#EEF2FF] rounded-lg px-4 py-2">
                      <span className="text-[#6366F1]">$</span>
                      400 Reais
                    </button>
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
                            type="text"
                            value="0"
                            className="w-12 pr-4 py-1 text-right bg-transparent"
                            readOnly
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
                            type="text"
                            value="10"
                            className="w-12 pr-4 py-1 text-right bg-transparent"
                            readOnly
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
                            type="text"
                            value="20"
                            className="w-12 pr-4 py-1 text-right bg-transparent"
                            readOnly
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
                            type="text"
                            value="30"
                            className="w-12 pr-4 py-1 text-right bg-transparent"
                            readOnly
                          />
                          <span className="absolute right-0 top-1/2 -translate-y-1/2">
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button className="inline-flex items-center gap-2 text-sm text-[#6366F1] bg-[#EEF2FF] rounded-lg px-4 py-2">
                      <span className="text-[#6366F1]">$</span>
                      400 Reais
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Valores finais após as tabelas */}
            <div className="mt-8">
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
                className="border rounded-lg p-5 relative bg-white cursor-pointer"
                onClick={() => setOpcaoAjusteValor("adicionar")}
              >
                <div className="flex gap-3">
                  <div className="mt-1">
                    <div
                      className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center"
                      style={{
                        backgroundColor:
                          opcaoAjusteValor === "adicionar"
                            ? "#4338ca"
                            : "transparent",
                      }}
                    >
                      {opcaoAjusteValor === "adicionar" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                      )}
                    </div>
                  </div>
                  <div className="w-full">
                    <h4 className="font-medium">Acrescentar valor</h4>
                    <p className="text-sm text-gray-500 mb-5">
                      Acrescente um valor de fechamento
                    </p>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">R$</span>
                      </div>
                      <input
                        type="text"
                        className="pl-8 pr-4 py-3 w-full border border-gray-200 rounded-md bg-white"
                        placeholder="100 Reais"
                        value={adicionalValor || ""}
                        onChange={(e) => {
                          setOpcaoAjusteValor("adicionar");
                          setAdicionalValor(Number(e.target.value) || 0);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dar desconto */}
              <div
                className="border rounded-lg p-5 relative bg-white cursor-pointer"
                onClick={() => setOpcaoAjusteValor("desconto")}
              >
                <div className="flex gap-3">
                  <div className="mt-1">
                    <div
                      className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center"
                      style={{
                        backgroundColor:
                          opcaoAjusteValor === "desconto"
                            ? "#4338ca"
                            : "transparent",
                      }}
                    >
                      {opcaoAjusteValor === "desconto" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                      )}
                    </div>
                  </div>
                  <div className="w-full">
                    <h4 className="font-medium">Dar desconto</h4>
                    <p className="text-sm text-gray-500 mb-5">
                      Valor ou porcentagem
                    </p>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                        <span className="text-gray-500">
                          {tipoDesconto === "valor" ? "R$" : "%"}
                        </span>
                      </div>
                      <input
                        type="text"
                        className="pl-8 pr-20 py-3 w-full border border-gray-200 rounded-md bg-white"
                        placeholder={
                          tipoDesconto === "percentual" ? "10" : "100"
                        }
                        value={desconto || ""}
                        onChange={(e) => {
                          setOpcaoAjusteValor("desconto");
                          setDesconto(Number(e.target.value) || 0);
                        }}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                          type="button"
                          className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm font-medium transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpcaoAjusteValor("desconto");
                            setTipoDesconto(
                              tipoDesconto === "percentual"
                                ? "valor"
                                : "percentual"
                            );
                          }}
                        >
                          {tipoDesconto === "percentual" ? "R$" : "%"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
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
                {opcaoAjusteValor === "desconto" && desconto > 0 && (
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
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="22"
                            height="22"
                            fill="none"
                            viewBox="0 0 24 24"
                            className="mx-auto text-indigo-700"
                          >
                            <path
                              fill="currentColor"
                              d="M12 5c-3.86 0-7.16 2.54-8.47 6.09a1.75 1.75 0 0 0 0 1.32C4.84 15.46 8.14 18 12 18s7.16-2.54 8.47-6.09a1.75 1.75 0 0 0 0-1.32C19.16 7.54 15.86 5 12 5Zm0 11c-3.07 0-6-2-7.11-5C6 8 8.93 6 12 6s6 2 7.11 5c-1.11 3-4.04 5-7.11 5Zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm0 5a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"
                            />
                          </svg>
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

  return (
    <>
      <div className="max-w-3xl mx-auto w-full py-6">
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
    </>
  );
}
