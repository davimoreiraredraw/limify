"use client";

import { Button } from "@/components/ui/button";
import { UserIcon, MoreVertical, Sparkles } from "lucide-react";
import { Dispatch, SetStateAction, useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useClients } from "@/lib/hooks/useClients";
import ClientsModal from "./ClientsModal";
import type { Client } from "@/app/(dashboard)/dashboard/orcamentos/types";
import { useRouter } from "next/navigation";
import LimifyPuppet from "@/public/limify_completeform_puppet.png";
import LimifyAdditionalPuppet from "@/public/limify_additional_puppet.png";
import LimifyLucroPuppet from "@/public/limify_lucro_puppet.png";
import SegmentModal from "./SegmentModal";
import ActivityModal from "./ActivityModal";
import PhaseModal from "./PhaseModal";
import { fi } from "date-fns/locale";

interface BudgetCompleteFormProps {
  budgetStep: number;
  setBudgetStep: Dispatch<SetStateAction<number>>;
  selectedBudgetType: string | null;
  finishBudget: () => void;
}

interface Activity {
  id: number;
  name: string;
  description: string;
  time: number;
  costPerHour: number;
  totalCost: number;
  complexity: number;
}

interface Segment {
  id: number;
  name: string;
  description: string;
  activities: Activity[];
}

interface Phase {
  id: number;
  name: string;
  description: string;
  baseValue: number;
  segments?: Segment[];
  activities: Activity[];
}

export default function BudgetCompleteForm({
  budgetStep,
  setBudgetStep,
  selectedBudgetType,
  finishBudget,
}: BudgetCompleteFormProps) {
  const [clientName, setClientName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  // Estados para a etapa 2
  const [budgetModel, setBudgetModel] = useState<"previous" | "standard">(
    "previous"
  );
  const [previousBudgetName, setPreviousBudgetName] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("BRL");
  const [profitConfig, setProfitConfig] = useState<"final" | "category">(
    "category"
  );

  // Novos estados para gerenciar orçamentos anteriores
  const [previousBudgets, setPreviousBudgets] = useState<any[]>([]);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [searchBudget, setSearchBudget] = useState("");
  const [showBudgetList, setShowBudgetList] = useState(false);

  const { clients, fetchClients, createClient } = useClients();
  const [clientId, setClientId] = useState<string | null>(null);
  const [showClientsModal, setShowClientsModal] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  // Adicionar estado para gerenciar as fases
  const [budgetPhases, setBudgetPhases] = useState<Phase[]>([
    {
      id: 1,
      name: "Proposta",
      description: "Categoria sugerida",
      baseValue: 85,
      activities: [
        {
          id: 1,
          name: "Reunião inicial",
          description: "Reunião realizada com o cliente",
          time: 2,
          costPerHour: 34,
          totalCost: 170,
          complexity: 1,
        },
        {
          id: 2,
          name: "Elaboração da proposta",
          description: "Proposta a ser apresentada",
          time: 1,
          costPerHour: 28.33,
          totalCost: 85,
          complexity: 2,
        },
      ],
    },
    {
      id: 2,
      name: "Estudo preliminar",
      description: "Categoria sugerida",
      baseValue: 85,
      activities: [],
      segments: [
        {
          id: 1,
          name: "Ambiente 01",
          description: "Segmento",
          activities: [
            {
              id: 1,
              name: "Referências - Conceito",
              description: "Estudo realizado",
              time: 2,
              costPerHour: 34,
              totalCost: 170,
              complexity: 1,
            },
          ],
        },
        {
          id: 2,
          name: "Ambiente 02",
          description: "Segmento",
          activities: [
            {
              id: 2,
              name: "Pesquisa de referências",
              description: "Pesquisa no pinterest e usando IA no Redraw",
              time: 2,
              costPerHour: 27,
              totalCost: 38,
              complexity: 3,
            },
          ],
        },
      ],
    },
    {
      id: 3,
      name: "Revisão estudo preliminar",
      description: "Categoria sugerida",
      baseValue: 85,
      activities: [
        {
          id: 1,
          name: "Croquis",
          description: "Desenhos de estudo realizados",
          time: 2,
          costPerHour: 34,
          totalCost: 170,
          complexity: 1,
        },
        {
          id: 2,
          name: "Revisão da planta layout",
          description: "Detalhes que precisam ser feitos",
          time: 1,
          costPerHour: 28.33,
          totalCost: 85,
          complexity: 2,
        },
        {
          id: 3,
          name: "Pós edição",
          description: "Trabalho terceirizado",
          time: 2,
          costPerHour: 27,
          totalCost: 38,
          complexity: 3,
        },
        {
          id: 4,
          name: "Montagem da apresentação",
          description: "Trabalho realizado com designer",
          time: 5,
          costPerHour: 212.5,
          totalCost: 425,
          complexity: 4,
        },
        {
          id: 5,
          name: "Reunião de apresentação",
          description: "Apresentação para o cliente",
          time: 5,
          costPerHour: 212.5,
          totalCost: 425,
          complexity: 4,
        },
      ],
    },
    {
      id: 4,
      name: "Projeto executivo",
      description: "Categoria sugerida",
      baseValue: 85,
      activities: [],
      segments: [
        {
          id: 1,
          name: "Ambiente 01",
          description: "Segmento",
          activities: [
            {
              id: 1,
              name: "Detalhamento de móveis",
              description: "Detalhamento interiores",
              time: 2,
              costPerHour: 34,
              totalCost: 170,
              complexity: 1,
            },
            {
              id: 2,
              name: "Detalhamento de móveis soltos",
              description: "Detalhamento interiores",
              time: 2,
              costPerHour: 34,
              totalCost: 170,
              complexity: 1,
            },
            {
              id: 3,
              name: "Detalhamento de pedra",
              description: "Detalhamento interiores",
              time: 2,
              costPerHour: 34,
              totalCost: 170,
              complexity: 1,
            },
          ],
        },
        {
          id: 2,
          name: "Planta de layout",
          description: "Segmento",
          activities: [
            {
              id: 1,
              name: "Localização móveis fixos",
              description: "Detalhamento interiores",
              time: 2,
              costPerHour: 27,
              totalCost: 38,
              complexity: 3,
            },
            {
              id: 2,
              name: "Localização móveis soltos",
              description: "Detalhamento interiores",
              time: 2,
              costPerHour: 27,
              totalCost: 38,
              complexity: 3,
            },
          ],
        },
        {
          id: 3,
          name: "Planilhas",
          description: "Segmento",
          activities: [
            {
              id: 1,
              name: "Móveis",
              description: "Detalhamento interiores",
              time: 2,
              costPerHour: 27,
              totalCost: 38,
              complexity: 3,
            },
            {
              id: 2,
              name: "Eletrodomésticos",
              description: "Detalhamento interiores",
              time: 2,
              costPerHour: 27,
              totalCost: 38,
              complexity: 3,
            },
            {
              id: 3,
              name: "Louças e metais",
              description: "Detalhamento interiores",
              time: 2,
              costPerHour: 27,
              totalCost: 38,
              complexity: 3,
            },
            {
              id: 4,
              name: "Luminárias e lâmpadas",
              description: "Detalhamento interiores",
              time: 2,
              costPerHour: 27,
              totalCost: 38,
              complexity: 3,
            },
            {
              id: 5,
              name: "Cortinas",
              description: "Detalhamento interiores",
              time: 2,
              costPerHour: 27,
              totalCost: 38,
              complexity: 3,
            },
          ],
        },
        {
          id: 4,
          name: "Iluminação",
          description: "Segmento",
          activities: [
            {
              id: 1,
              name: "Planta iluminação",
              description: "Detalhamento interiores",
              time: 2,
              costPerHour: 27,
              totalCost: 38,
              complexity: 3,
            },
            {
              id: 2,
              name: "Planta de gesso",
              description: "Detalhamento interiores",
              time: 2,
              costPerHour: 27,
              totalCost: 38,
              complexity: 3,
            },
          ],
        },
      ],
    },
    {
      id: 5,
      name: "Acompanhamento de obra",
      description: "Categoria sugerida",
      baseValue: 85,
      activities: [
        {
          id: 1,
          name: "Visita ao local",
          description: "Ir até lá",
          time: 2,
          costPerHour: 34,
          totalCost: 170,
          complexity: 1,
        },
        {
          id: 2,
          name: "Acompanhamento",
          description: "Detalhes que precisam ser feitos",
          time: 1,
          costPerHour: 28.33,
          totalCost: 85,
          complexity: 2,
        },
      ],
    },
    {
      id: 6,
      name: "Avaliação final",
      description: "Categoria sugerida",
      baseValue: 85,
      activities: [
        {
          id: 1,
          name: "Visita ao local",
          description: "Ir até lá",
          time: 2,
          costPerHour: 34,
          totalCost: 170,
          complexity: 1,
        },
        {
          id: 2,
          name: "Contratação de fotógrafo",
          description: "Para fazer aquele portfolio lindo",
          time: 1,
          costPerHour: 28.33,
          totalCost: 85,
          complexity: 2,
        },
        {
          id: 3,
          name: "Relatório final",
          description: "Relatório da obra e do projeto",
          time: 1,
          costPerHour: 28.33,
          totalCost: 85,
          complexity: 2,
        },
      ],
    },
    {
      id: 7,
      name: "Custos extras",
      description: "Categoria fixa",
      baseValue: 85,
      activities: [
        {
          id: 1,
          name: "Impressão",
          description: "Papelaria com projetos",
          time: 0,
          costPerHour: 34,
          totalCost: 34,
          complexity: 1,
        },
        {
          id: 2,
          name: "Serviços terceirizados",
          description: "Aquele freelancer",
          time: 0,
          costPerHour: 28.33,
          totalCost: 28.33,
          complexity: 2,
        },
        {
          id: 3,
          name: "Presentes",
          description: "Papelarias no geral",
          time: 0,
          costPerHour: 28.33,
          totalCost: 28.33,
          complexity: 2,
        },
      ],
    },
  ]);

  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const currentPhase = budgetPhases[currentPhaseIndex];

  const [showSegmentModal, setShowSegmentModal] = useState(false);
  const [currentPhaseForSegment, setCurrentPhaseForSegment] = useState<
    number | null
  >(null);

  const [showOptionsMenu, setShowOptionsMenu] = useState<number | null>(null);

  const [currentPhaseForActivity, setCurrentPhaseForActivity] = useState<
    number | null
  >(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [preSelectedSegment, setPreSelectedSegment] = useState<number | null>(
    null
  );

  const [showPhaseModal, setShowPhaseModal] = useState(false);

  const [categorySearch, setCategorySearch] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const filteredPhases = budgetPhases.filter((phase) =>
    phase.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const [disableWetArea, setDisableWetArea] = useState(false);
  const [disableDeliveryTime, setDisableDeliveryTime] = useState(false);
  const [dryRooms, setDryRooms] = useState("");
  const [wetRooms, setWetRooms] = useState("");
  const [wetAreaPercentage, setWetAreaPercentage] = useState("");
  const [selectedValue, setSelectedValue] = useState<"base" | "withAdditions">(
    "base"
  );
  const [adjustmentType, setAdjustmentType] = useState<"increase" | "discount">(
    "increase"
  );
  const [discountType, setDiscountType] = useState<"value" | "percentage">(
    "percentage"
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profitMargin, setProfitMargin] = useState(0);
  const [deliveryTime, setDeliveryTime] = useState(0);
  const [adjustmentValue, setAdjustmentValue] = useState(0);
  const [adjustmentValueType, setAdjustmentValueType] = useState<
    "percentage" | "value"
  >("percentage");
  const [opcoesAjusteValor, setOpcoesAjusteValor] = useState<string[]>([]);

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
    projectType: string;
    totalArea: number;
    complexity: string;
    deliveryTime: number;
    budgetRange: string;
    additionalServices: string[];
    [key: string]: string | string[] | number;
  }>({
    projectName: "",
    projectDescription: "",
    projectType: "",
    totalArea: 0,
    complexity: "",
    deliveryTime: 0,
    budgetRange: "",
    additionalServices: [],
  });

  // Estados para o modal de comparação
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [aiGeneratedData, setAiGeneratedData] = useState<any>(null);

  // Ref para o container de mensagens
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Função para fazer scroll automático
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Configuração das perguntas do chat para orçamento completo
  const chatQuestions = [
    {
      id: "projectName",
      question: "Qual é o nome do seu projeto?",
      field: "projectName" as keyof typeof collectedData,
    },
    {
      id: "projectDescription",
      question: "Descreva brevemente o projeto:",
      field: "projectDescription" as keyof typeof collectedData,
    },
    {
      id: "projectType",
      question:
        "Que tipo de projeto é? (ex: residencial, comercial, institucional)",
      field: "projectType" as keyof typeof collectedData,
    },
    {
      id: "totalArea",
      question: "Qual é a área total aproximada em m²?",
      field: "totalArea" as keyof typeof collectedData,
      isNumber: true,
    },
    {
      id: "complexity",
      question: "Qual é o nível de complexidade? (baixa, média, alta)",
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
      id: "budgetRange",
      question: "Qual é a faixa de orçamento esperada? (baixa, média, alta)",
      field: "budgetRange" as keyof typeof collectedData,
      options: ["baixa", "média", "alta"],
    },
    {
      id: "additionalServices",
      question:
        "Quais serviços adicionais você precisa? (ex: acompanhamento de obra, renderização, maquete)",
      field: "additionalServices" as keyof typeof collectedData,
      isArray: true,
    },
  ];

  const calculateWetAreaAdditional = () => {
    if (disableWetArea || !wetRooms || !dryRooms || !wetAreaPercentage)
      return 0;

    // Base de cálculo: R$ 85/hora (valor base) * quantidade de ambientes molhados * porcentagem
    const baseValue = 85;
    const wetRoomsCount = Number(wetRooms);
    const percentage = Number(wetAreaPercentage) / 100;

    return Math.round(baseValue * wetRoomsCount * percentage);
  };

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showOptionsMenu !== null) {
        const target = event.target as HTMLElement;
        if (!target.closest(".options-menu")) {
          setShowOptionsMenu(null);
        }
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showOptionsMenu]);

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

  const handleAddSegment = (name: string) => {
    if (currentPhaseForSegment === null) return;

    setBudgetPhases((prevPhases) => {
      return prevPhases.map((phase) => {
        if (phase.id === currentPhaseForSegment) {
          const newSegment: Segment = {
            id: Math.random(),
            name,
            description: "Segmento",
            activities: [],
          };

          const newSegments = [...(phase.segments || []), newSegment];
          newSegments.sort((a, b) => a.name.localeCompare(b.name));

          return {
            ...phase,
            segments: newSegments,
          };
        }
        return phase;
      });
    });
  };

  const handleOptionsClick = (phaseId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setShowOptionsMenu(showOptionsMenu === phaseId ? null : phaseId);
  };

  const handleOpenActivityModal = (phaseId: number, segmentId?: number) => {
    setCurrentPhaseForActivity(phaseId);
    setPreSelectedSegment(segmentId || null);
    setShowActivityModal(true);
  };

  const handleAddActivity = (activity: {
    name: string;
    description: string;
    time: number;
    squareMeters: number;
    complexity: number;
    baseValue: number;
  }) => {
    if (currentPhaseForActivity === null) return;

    setBudgetPhases((prevPhases) => {
      return prevPhases.map((phase) => {
        if (phase.id === currentPhaseForActivity) {
          const newActivity = {
            id: Math.random(),
            name: activity.name,
            description: activity.description,
            time: activity.time,
            costPerHour: activity.baseValue,
            totalCost: activity.baseValue * activity.time,
            complexity: activity.complexity,
          };

          return {
            ...phase,
            activities: [...phase.activities, newActivity],
          };
        }
        return phase;
      });
    });
  };

  const handleAddPhase = (name: string) => {
    setBudgetPhases((prevPhases) => {
      const newPhase: Phase = {
        id: Math.random(),
        name,
        description: "",
        baseValue: 85,
        activities: [],
      };

      return [...prevPhases, newPhase];
    });
  };

  // Função para buscar orçamentos anteriores
  const fetchPreviousBudgets = async () => {
    try {
      const response = await fetch("/api/budgets/complete");
      const data = await response.json();
      if (data.success) {
        setPreviousBudgets(data.budgets);
      }
    } catch (error) {
      console.error("Erro ao buscar orçamentos:", error);
      toast.error("Erro ao carregar orçamentos anteriores");
    }
  };

  // Função para selecionar um orçamento anterior
  const handleSelectPreviousBudget = async (budget: any) => {
    try {
      const budgetId = budget.id;
      setSearchBudget(budget.name);
      setShowBudgetList(false);
      const response = await fetch(`/api/budgets/complete/${budgetId}`);
      const data = await response.json();
      if (data.success) {
        setBudgetPhases(data.budget.phases);
        setPreviousBudgetName(data.budget.name);
        setSelectedBudgetId(budgetId);
        setShowBudgetList(false);
        console.log(data.budget);
      }
    } catch (error) {
      console.error("Erro ao carregar orçamento:", error);
      toast.error("Erro ao carregar orçamento selecionado");
    }
  };

  // Efeito para carregar orçamentos quando o componente montar
  useEffect(() => {
    if (budgetModel === "previous") {
      fetchPreviousBudgets();
    }
  }, [budgetModel]);

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
        return (
          <div className="mb-12">
            {/* Banner explicativo */}
            <div className="bg-white rounded-3xl p-8 mb-12 relative overflow-hidden shadow-sm border h-[250px] w-full">
              {/* Círculo decorativo menor */}
              <div className="absolute left-[45%] top-[-80%] w-[150px] h-[150px] bg-[#4338CA] rounded-full opacity-20" />
              {/* Círculo principal */}
              <div className="absolute right-[-5%] top-[-80%] w-[300px] h-[300px] bg-[#4338CA] rounded-full" />

              <div className="relative z-10 flex justify-between items-start">
                <div className="max-w-[65%]">
                  <h2 className="text-2xl font-bold mb-2">
                    Entenda o orçamento
                    <br />
                    de projeto
                  </h2>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Que legal que você decidiu orçar um projeto, antes de
                    começar, quero te passar algumas informações. O orçamento de
                    projeto você vai quantificar ele pelas etapas do seu
                    projeto,{" "}
                    <span className="font-medium">
                      vamos deixar aqui algumas etapas para você preencher
                    </span>
                    , mas você também{" "}
                    <span className="font-medium">
                      pode criar campos personalizados
                    </span>{" "}
                    após preencher os sugeridos, também, caso não faça sentido,
                    pode excluir campos. Os campos adicionados e excluídos ficam
                    salvos para o próximo orçamento.
                  </p>
                </div>
                <div className="relative mt-2">
                  <img
                    src={LimifyPuppet.src}
                    alt="Document illustration"
                    className="w-[200px] h-[200px] object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Modelo de orçamento */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6">
                Qual modelo de orçamento seguir?
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div
                  className={`border rounded-xl p-5 flex items-center gap-4 cursor-pointer ${
                    budgetModel === "previous"
                      ? "border-indigo-600 bg-indigo-50"
                      : ""
                  }`}
                  onClick={() => setBudgetModel("previous")}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          budgetModel === "previous" ? "border-indigo-600" : ""
                        }`}
                      >
                        {budgetModel === "previous" && (
                          <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">Orçamento anterior</h4>
                        <p className="text-sm text-gray-500">
                          Utilize templates de orçamentos anteriores
                        </p>
                      </div>
                    </div>
                  </div>
                  {budgetModel === "previous" && (
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="text"
                          className="w-full border rounded-lg px-4 py-2"
                          placeholder="Buscar orçamento anterior..."
                          value={searchBudget}
                          onChange={(e) => {
                            setSearchBudget(e.target.value);
                            setShowBudgetList(true);
                          }}
                          onFocus={() => setShowBudgetList(true)}
                        />

                        {showBudgetList && (
                          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {previousBudgets
                              .filter((budget) =>
                                budget.name
                                  .toLowerCase()
                                  .includes(searchBudget.toLowerCase())
                              )
                              .map((budget) => (
                                <div
                                  key={budget.id}
                                  className={`p-3 hover:bg-gray-50 cursor-pointer ${
                                    selectedBudgetId === budget.id
                                      ? "bg-indigo-50"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    handleSelectPreviousBudget(budget)
                                  }
                                >
                                  <div className="font-medium">
                                    {budget.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Criado em:{" "}
                                    {new Date(
                                      budget.created_at
                                    ).toLocaleDateString()}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Valor: R$ {budget.total}
                                  </div>
                                </div>
                              ))}
                            {previousBudgets.length === 0 && (
                              <div className="p-3 text-gray-500">
                                Nenhum orçamento encontrado
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div
                  className={`border rounded-xl p-5 ${
                    budgetModel === "standard"
                      ? "border-indigo-600 bg-indigo-50"
                      : ""
                  }`}
                  onClick={() => setBudgetModel("standard")}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        budgetModel === "standard" ? "border-indigo-600" : ""
                      }`}
                    >
                      {budgetModel === "standard" && (
                        <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">Orçamento padrão</h4>
                      <p className="text-sm text-gray-500">
                        Orçamento padrão do limify
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seleção de moeda */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6">Qual vai ser a moeda?</h3>
              <div className="relative inline-block">
                <Button
                  variant="outline"
                  className="border-2 rounded-full px-6 py-2 font-medium flex items-center"
                  onClick={() =>
                    setSelectedCurrency(
                      selectedCurrency === "USD" ? "BRL" : "USD"
                    )
                  }
                >
                  {selectedCurrency === "USD" ? "USD" : "R$"}
                  <svg
                    className="ml-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </Button>
              </div>
            </div>

            {/* Configuração de lucro */}
            <div>
              <h3 className="text-2xl font-bold mb-6">
                Como deseja configurar o lucro?
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`border rounded-xl p-5 cursor-pointer ${
                    profitConfig === "final"
                      ? "border-indigo-600 bg-indigo-50"
                      : ""
                  }`}
                  onClick={() => setProfitConfig("final")}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        profitConfig === "final" ? "border-indigo-600" : ""
                      }`}
                    >
                      {profitConfig === "final" && (
                        <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">Lucro final</h4>
                      <p className="text-sm text-gray-500">
                        No final de tudo, defina uma porcentagem
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`border rounded-xl p-5 cursor-pointer ${
                    profitConfig === "category"
                      ? "border-indigo-600 bg-indigo-50"
                      : ""
                  }`}
                  onClick={() => setProfitConfig("category")}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        profitConfig === "category" ? "border-indigo-600" : ""
                      }`}
                    >
                      {profitConfig === "category" && (
                        <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">Lucro por categoria</h4>
                      <p className="text-sm text-gray-500">
                        A cada categoria, escolha o lucro
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="mb-12">
            {budgetPhases.map((phase, index) => (
              <div
                key={phase.id}
                className="mb-8 bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                {/* Cabeçalho da fase */}
                <div className="border-b bg-gray-50 p-6 rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-100 rounded-lg p-2 w-10 h-10 flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <h2
                          className="text-lg font-bold truncate max-w-[200px]"
                          title={`Fase: ${phase.name}`}
                        >
                          {phase.name}
                        </h2>
                        <p className="text-gray-500 text-sm">
                          {phase.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border">
                        <span className="text-gray-600">Valor base</span>
                        <span className="text-red-500 font-medium">
                          R$ {phase.baseValue}/h
                        </span>
                      </div>
                      <button
                        className="text-gray-500 hover:text-gray-700 relative options-menu p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={(e) => handleOptionsClick(phase.id, e)}
                      >
                        <MoreVertical className="h-5 w-5" />
                        {showOptionsMenu === phase.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                            <button
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                              onClick={() => {
                                setCurrentPhaseForSegment(phase.id);
                                setShowSegmentModal(true);
                                setShowOptionsMenu(null);
                              }}
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <path
                                  d="M12 5V19"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M5 12H19"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              Criar segmento
                            </button>
                            <button
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                              onClick={() => handleOpenActivityModal(phase.id)}
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <path
                                  d="M12 5V19"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M5 12H19"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              Adicionar atividade
                            </button>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Conteúdo da fase */}
                  {phase.segments ? (
                    // Renderiza os segmentos se existirem (Estudo preliminar)
                    <>
                      {phase.segments.map((segment) => (
                        <div key={segment.id} className="mb-8">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-bold">
                                {segment.name}
                              </h3>
                              <p className="text-gray-500 text-sm">
                                {segment.description}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {/* <button className="border border-emerald-500 text-emerald-500 px-4 py-2 rounded-lg flex items-center gap-2">
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <path
                                    d="M16 16L12 12M12 12L8 8M12 12L16 8M12 12L8 16"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                Duplicar
                              </button> */}
                              <button
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                onClick={() =>
                                  handleOpenActivityModal(phase.id, segment.id)
                                }
                              >
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <path
                                    d="M12 5V19"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M5 12H19"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                Adicionar no segmento
                              </button>
                            </div>
                          </div>

                          <div className="bg-white rounded-lg border">
                            <div className="grid grid-cols-7 gap-4 p-4 border-b bg-gray-50">
                              <div className="col-span-2">Nome</div>
                              <div className="text-center">
                                Tempo para desenvolver
                              </div>
                              <div className="text-center">Custo hora</div>
                              <div className="text-center">Custo Total</div>
                              <div className="text-center">Complexidade</div>
                              <div className="text-center">Editar</div>
                            </div>

                            {segment.activities.map((activity) => (
                              <div
                                key={activity.id}
                                className="grid grid-cols-7 gap-4 p-4 border-b items-center"
                              >
                                <div className="col-span-2">
                                  <p className="font-medium">{activity.name}</p>
                                  <p className="text-sm text-gray-500">
                                    {activity.description}
                                  </p>
                                </div>
                                <div className="text-center">
                                  {activity.time}h
                                </div>
                                <div className="text-center">
                                  R$ {activity.costPerHour}
                                </div>
                                <div className="text-center">
                                  R$ {activity.totalCost}
                                </div>
                                <div className="text-center">
                                  {activity.complexity}
                                </div>
                                <div className="flex justify-center gap-2">
                                  <button className="text-red-500">
                                    <svg
                                      width="20"
                                      height="20"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                    >
                                      <path
                                        d="M3 6H5H21"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                      <path
                                        d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  </button>
                                  <button className="text-indigo-600">
                                    <svg
                                      width="20"
                                      height="20"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                    >
                                      <path
                                        d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                      <path
                                        d="M18.5 2.49998C18.8978 2.10216 19.4374 1.87866 20 1.87866C20.5626 1.87866 21.1022 2.10216 21.5 2.49998C21.8978 2.89781 22.1213 3.43737 22.1213 3.99998C22.1213 4.56259 21.8978 5.10216 21.5 5.49998L12 15L8 16L9 12L18.5 2.49998Z"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    // Renderiza a lista normal de atividades (Proposta)
                    <div className="bg-white rounded-lg border">
                      <div className="grid grid-cols-7 gap-4 p-4 border-b bg-gray-50">
                        <div className="col-span-2">Nome</div>
                        <div className="text-center">
                          Tempo para desenvolver
                        </div>
                        <div className="text-center">Custo hora</div>
                        <div className="text-center">Custo Total</div>
                        <div className="text-center">Complexidade</div>
                        <div className="text-center">Editar</div>
                      </div>

                      {phase.activities.map((activity) => (
                        <div
                          key={activity.id}
                          className="grid grid-cols-7 gap-4 p-4 border-b items-center"
                        >
                          <div className="col-span-2">
                            <p className="font-medium">{activity.name}</p>
                            <p className="text-sm text-gray-500">
                              {activity.description}
                            </p>
                          </div>
                          <div className="text-center">{activity.time}h</div>
                          <div className="text-center">
                            R$ {activity.costPerHour}
                          </div>
                          <div className="text-center">
                            R$ {activity.totalCost}
                          </div>
                          <div className="text-center">
                            {activity.complexity}
                          </div>
                          <div className="flex justify-center gap-2">
                            <button className="text-red-500">
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <path
                                  d="M3 6H5H21"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                            <button className="text-indigo-600">
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <path
                                  d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M18.5 2.49998C18.8978 2.10216 19.4374 1.87866 20 1.87866C20.5626 1.87866 21.1022 2.10216 21.5 2.49998C21.8978 2.89781 22.1213 3.43737 22.1213 3.99998C22.1213 4.56259 21.8978 5.10216 21.5 5.49998L12 15L8 16L9 12L18.5 2.49998Z"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Margem de lucro e totais */}
                  <div className="mt-8 pt-8 border-t">
                    <div className="flex items-center gap-4 mb-4">
                      <h3 className="text-xl font-bold">Margem de lucro</h3>
                      <div className="relative">
                        <input
                          type="text"
                          className="border rounded-lg px-4 py-2 w-[200px] pl-8"
                          placeholder="Porcentagem"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2">
                          %
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-8">
                      <div>
                        <p className="text-gray-600 mb-2">Custo total</p>
                        <div className="bg-gray-50 border rounded-lg px-4 py-2 flex items-center gap-2">
                          <span className="text-gray-400">$</span>
                          <span className="text-indigo-600 font-medium">
                            400 Reais
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-2">Total lucrando</p>
                        <div className="bg-gray-50 border rounded-lg px-4 py-2 flex items-center gap-2">
                          <span className="text-gray-400">$</span>
                          <span className="text-indigo-600 font-medium">
                            400 Reais
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Seção de categorias personalizadas */}
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">
                Categorias personalizadas
              </h2>
              <p className="text-gray-600 mb-4">
                Categorias vão definir as áreas do seu projeto. Use as
                categorias já existentes ou crie novas.
              </p>
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Categorias de orçamento"
                    value={categorySearch}
                    onChange={(e) => {
                      setCategorySearch(e.target.value);
                      setShowCategoryDropdown(true);
                    }}
                    onFocus={() => setShowCategoryDropdown(true)}
                  />
                  {showCategoryDropdown && categorySearch && (
                    <div className="absolute z-10 left-0 right-0 bg-white border rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                      {filteredPhases.length > 0 ? (
                        filteredPhases.map((phase) => (
                          <div
                            key={phase.id}
                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              setCategorySearch(phase.name);
                              setShowCategoryDropdown(false);
                            }}
                          >
                            <div className="font-medium">{phase.name}</div>
                            {phase.description && (
                              <div className="text-sm text-gray-500">
                                {phase.description}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-500">
                          Nenhuma categoria encontrada
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowPhaseModal(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 5V19"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5 12H19"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Criar categoria
                </button>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="mb-12">
            {/* Banner explicativo dos adicionais */}
            <div className="bg-white rounded-3xl p-8 mb-12 relative overflow-hidden shadow-sm border h-[250px] w-full">
              {/* Círculo decorativo menor */}
              <div className="absolute left-[45%] top-[-80%] w-[150px] h-[150px] bg-[#4338CA] rounded-full opacity-20" />
              {/* Círculo principal */}
              <div className="absolute right-[-5%] top-[-80%] w-[300px] h-[300px] bg-[#4338CA] rounded-full" />

              <div className="relative z-10 flex justify-between items-start">
                <div className="max-w-[65%]">
                  <h2 className="text-2xl font-bold mb-2">
                    Agora vamos para os adicionais
                  </h2>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Os adicionais vão os adicionais de valores... o que são os
                    adicionais? Eles são fatores que complementam o orçamento,
                    com o que você já adicionou, o grau de complexidade, aqui
                    também vamos abordar outros fatores que podem agregar mais
                    valor ao projeto, afinal, ninguém quer sair no prejuízo, né?
                  </p>
                </div>
                <div className="relative mt-2">
                  <img
                    src={LimifyAdditionalPuppet.src}
                    alt="Additional illustration"
                    className="w-[200px] h-[200px] object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Adicional por área molhada */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-2">
                Adicional por área molhada
              </h2>
              <p className="text-gray-600 mb-4">
                Categorias vão definir as áreas do seu projeto. Use as
                categorias já existentes ou crie novas.
              </p>

              <div className="flex flex-col gap-4">
                <div className="bg-gray-50 border border-indigo-100 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="wetAreaOption"
                      className="w-5 h-5 text-indigo-600 border-indigo-600"
                      checked={!disableWetArea}
                      onChange={() => setDisableWetArea(false)}
                    />
                    <div className="flex-1">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Quantidade de ambientes secos
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              className="w-full border rounded-lg px-3 py-2 pl-8"
                              placeholder="Quantos ambientes secos?"
                              disabled={disableWetArea}
                              value={dryRooms}
                              onChange={(e) => setDryRooms(e.target.value)}
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2">
                              ⌂
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">
                              Quantidade de ambientes molhados
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                className="w-full border rounded-lg px-3 py-2 pl-8"
                                placeholder="Quantos molhados?"
                                disabled={disableWetArea}
                                value={wetRooms}
                                onChange={(e) => setWetRooms(e.target.value)}
                              />
                              <span className="absolute left-3 top-1/2 -translate-y-1/2">
                                ⌂
                              </span>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Acréscimo por área molhada
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                className="w-[100px] border rounded-lg px-3 py-2 pl-6"
                                placeholder="10%"
                                disabled={disableWetArea}
                                value={wetAreaPercentage}
                                onChange={(e) =>
                                  setWetAreaPercentage(e.target.value)
                                }
                              />
                              <span className="absolute left-3 top-1/2 -translate-y-1/2">
                                %
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-indigo-100 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="wetAreaOption"
                      className="w-5 h-5 text-indigo-600 border-indigo-600"
                      checked={disableWetArea}
                      onChange={() => setDisableWetArea(true)}
                    />
                    <span>Não por adicional por area molhada</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Total adicional</span>
                  <div className="bg-gray-50 border rounded-lg px-4 py-2 flex items-center gap-2">
                    <span className="text-gray-400">R$</span>
                    <span className="text-indigo-600 font-medium">
                      {calculateWetAreaAdditional()} Reais
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Prazo de entrega */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-2">
                Prazo de entrega do projeto
              </h2>
              <p className="text-gray-600 mb-4">
                Defina o prazo de entrega do seu projeto e se haverá adicional
                por prazo.
              </p>

              <div className="flex flex-col gap-4">
                <div className="bg-gray-50 border border-indigo-100 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="deliveryOption"
                      className="w-5 h-5 text-indigo-600 border-indigo-600"
                      checked={!disableDeliveryTime}
                      onChange={() => setDisableDeliveryTime(false)}
                    />
                    <div className="flex-1">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Prazo de entrega
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              className="w-full border rounded-lg px-3 py-2 pl-8"
                              placeholder="Dias para entregar"
                              disabled={disableDeliveryTime}
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2">
                              ⏰
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-indigo-100 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="deliveryOption"
                      className="w-5 h-5 text-indigo-600 border-indigo-600"
                      checked={disableDeliveryTime}
                      onChange={() => setDisableDeliveryTime(true)}
                    />
                    <span>Sem adicional por entrega</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Total adicional</span>
                  <div className="bg-gray-50 border rounded-lg px-4 py-2 flex items-center gap-2">
                    <span className="text-gray-400">$</span>
                    <span className="text-indigo-600 font-medium">
                      400 Reais
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Valores finais */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-2">Valores finais</h2>
              <p className="text-gray-600 mb-4">
                Prazo e complexidade são definem os acrescimos, no Limify
                definimos um valor padrão, mas você deve ajustar conforme as
                suas exigências
              </p>

              <div className="grid grid-cols-2 gap-8">
                <div
                  className={`rounded-xl p-6 cursor-pointer ${
                    selectedValue === "base"
                      ? "bg-indigo-50 border-2 border-indigo-600"
                      : "bg-white border border-indigo-100"
                  }`}
                  onClick={() => setSelectedValue("base")}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="radio"
                      name="finalValue"
                      className="w-5 h-5 text-indigo-600 border-indigo-600"
                      checked={selectedValue === "base"}
                      onChange={() => setSelectedValue("base")}
                    />
                    <h3 className="text-lg font-medium">
                      Custo final sem acréscimo
                    </h3>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    R$ 2.600
                  </div>
                </div>

                <div
                  className={`rounded-xl p-6 cursor-pointer ${
                    selectedValue === "withAdditions"
                      ? "bg-indigo-50 border-2 border-indigo-600"
                      : "bg-white border border-indigo-100"
                  }`}
                  onClick={() => setSelectedValue("withAdditions")}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="radio"
                      name="finalValue"
                      className="w-5 h-5 text-indigo-600 border-indigo-600"
                      checked={selectedValue === "withAdditions"}
                      onChange={() => setSelectedValue("withAdditions")}
                    />
                    <h3 className="text-lg font-medium">
                      Valor final com prazo e complexidade
                    </h3>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    R$ 4.000
                  </div>
                </div>
              </div>
            </div>

            {/* Margem de lucro */}
            <div className="mb-8">
              <div className="flex items-center gap-8">
                <div>
                  <h2 className="text-xl font-bold mb-2">Margem de lucro</h2>
                  <div className="relative">
                    <input
                      type="text"
                      className="border rounded-lg px-3 py-2 pl-8 w-[200px]"
                      placeholder="Porcentagem"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                      %
                    </span>
                  </div>
                </div>

                <img
                  src={LimifyLucroPuppet.src}
                  alt="Limify Lucro"
                  className="w-[200px] h-[200px] object-contain"
                />
              </div>
            </div>

            {/* Ajuste de valores (Opcional) */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-2">
                Ajuste de valores (Opcional)
              </h2>

              <div className="grid grid-cols-2 gap-8">
                <div
                  className={`rounded-xl p-6 cursor-pointer ${
                    opcoesAjusteValor.includes("increase")
                      ? "bg-indigo-50 border-2 border-indigo-600"
                      : "bg-white border border-indigo-100"
                  }`}
                  onClick={() => {
                    const newOpcoes = opcoesAjusteValor.includes("increase")
                      ? opcoesAjusteValor.filter((op) => op !== "increase")
                      : [...opcoesAjusteValor, "increase"];
                    setOpcoesAjusteValor(newOpcoes);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        opcoesAjusteValor.includes("increase")
                          ? "border-indigo-600"
                          : ""
                      }`}
                    >
                      {opcoesAjusteValor.includes("increase") && (
                        <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">Acrescentar valor</h3>
                      <p className="text-sm text-gray-500">
                        Acrescente um valor de fechamento
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 relative">
                    <input
                      type="text"
                      className="w-full border rounded-lg px-3 py-2 pl-8"
                      placeholder="100 Reais"
                      disabled={!opcoesAjusteValor.includes("increase")}
                      value={adjustmentValue || ""}
                      onChange={(e) => {
                        if (!opcoesAjusteValor.includes("increase")) {
                          setOpcoesAjusteValor([
                            ...opcoesAjusteValor,
                            "increase",
                          ]);
                        }
                        setAdjustmentValue(Number(e.target.value) || 0);
                      }}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                      $
                    </span>
                  </div>
                </div>

                <div
                  className={`rounded-xl p-6 cursor-pointer ${
                    opcoesAjusteValor.includes("discount")
                      ? "bg-indigo-50 border-2 border-indigo-600"
                      : "bg-white border border-indigo-100"
                  }`}
                  onClick={() => {
                    const newOpcoes = opcoesAjusteValor.includes("discount")
                      ? opcoesAjusteValor.filter((op) => op !== "discount")
                      : [...opcoesAjusteValor, "discount"];
                    setOpcoesAjusteValor(newOpcoes);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        opcoesAjusteValor.includes("discount")
                          ? "border-indigo-600"
                          : ""
                      }`}
                    >
                      {opcoesAjusteValor.includes("discount") && (
                        <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">Dar desconto</h3>
                      <p className="text-sm text-gray-500">
                        Valor ou porcentagem
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <div className="flex gap-2">
                      <button
                        className={`px-3 py-1 rounded-lg ${
                          discountType === "value"
                            ? "bg-indigo-600 text-white"
                            : "border"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!opcoesAjusteValor.includes("discount")) {
                            setOpcoesAjusteValor([
                              ...opcoesAjusteValor,
                              "discount",
                            ]);
                          }
                          setDiscountType("value");
                        }}
                      >
                        $
                      </button>
                      <button
                        className={`px-3 py-1 rounded-lg ${
                          discountType === "percentage"
                            ? "bg-indigo-600 text-white"
                            : "border"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!opcoesAjusteValor.includes("discount")) {
                            setOpcoesAjusteValor([
                              ...opcoesAjusteValor,
                              "discount",
                            ]);
                          }
                          setDiscountType("percentage");
                        }}
                      >
                        %
                      </button>
                    </div>
                    <input
                      type="text"
                      className="flex-1 border rounded-lg px-3 py-2"
                      placeholder="10%"
                      disabled={!opcoesAjusteValor.includes("discount")}
                      value={adjustmentValue || ""}
                      onChange={(e) => {
                        if (!opcoesAjusteValor.includes("discount")) {
                          setOpcoesAjusteValor([
                            ...opcoesAjusteValor,
                            "discount",
                          ]);
                        }
                        setAdjustmentValue(Number(e.target.value) || 0);
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mt-8">
                <div>
                  <h3 className="text-lg font-medium mb-2">Preço médio m²</h3>
                  <div className="text-3xl font-bold text-gray-900">R$ 166</div>
                </div>

                <div className="bg-indigo-50 rounded-xl p-6">
                  <h3 className="text-lg font-medium mb-2">
                    Valor final do orçamento
                  </h3>
                  <div className="text-3xl font-bold text-gray-900">
                    R$ 2.600
                  </div>
                  <p className="text-sm text-gray-500">Desconto: xxxxx R$</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleSubmitBudget = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: projectName,
        description: projectDescription,
        client_id: clientId ? clientId : null,
        model: budgetModel,
        budget_type: "complete",
        value_type: selectedValue,
        total: calculateTotalBudget(),
        phases: budgetPhases.map((phase) => ({
          name: phase.name,
          description: phase.description,
          baseValue: phase.baseValue,
          segments: phase.segments?.map((segment) => ({
            name: segment.name,
            description: segment.description,
            activities: segment.activities.map((activity) => ({
              name: activity.name,
              description: activity.description,
              time: activity.time,
              costPerHour: activity.costPerHour,
              totalCost: activity.totalCost,
              complexity: activity.complexity,
            })),
          })),
          activities: phase.activities.map((activity) => ({
            name: activity.name,
            description: activity.description,
            time: activity.time,
            costPerHour: activity.costPerHour,
            totalCost: activity.totalCost,
            complexity: activity.complexity,
          })),
        })),
        additionals: {
          wetAreaQuantity: dryRooms,
          dryAreaQuantity: wetRooms,
          wetAreaPercentage: wetAreaPercentage,
          deliveryTime: disableDeliveryTime ? null : 0,
          disableDeliveryCharge: disableDeliveryTime,
        },
        references: [],
        profit_margin: profitConfig === "final" ? 0 : 0,
        final_adjustments: {
          type: opcoesAjusteValor.includes("increase")
            ? "increase"
            : opcoesAjusteValor.includes("discount")
            ? "discount"
            : null,
          value: adjustmentValue,
          valueType: opcoesAjusteValor.includes("discount")
            ? discountType
            : null,
        },
      };

      const res = await fetch("/api/budgets/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Orçamento criado com sucesso!");
        finishBudget();
      } else {
        throw new Error(data.error || "Erro ao criar orçamento");
      }
    } catch (err) {
      console.error("Erro ao salvar orçamento:", err);
      toast.error(
        err instanceof Error ? err.message : "Erro ao criar orçamento"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para calcular o valor total do orçamento
  const calculateTotalBudget = () => {
    let total = budgetPhases.reduce((sum, phase) => {
      const phaseTotal = phase.activities.reduce((actSum, activity) => {
        return actSum + activity.totalCost;
      }, 0);

      const segmentsTotal =
        phase.segments?.reduce((segSum, segment) => {
          return (
            segSum +
            segment.activities.reduce((actSum, activity) => {
              return actSum + activity.totalCost;
            }, 0)
          );
        }, 0) || 0;

      return sum + phaseTotal + segmentsTotal;
    }, 0);

    // Aplicar margem de lucro
    if (profitMargin > 0) {
      total += total * (profitMargin / 100);
    }

    // Aplicar ajustes finais
    if (opcoesAjusteValor.includes("increase")) {
      if (adjustmentValueType === "percentage") {
        total += total * (adjustmentValue / 100);
      } else {
        total += adjustmentValue;
      }
    }
    if (opcoesAjusteValor.includes("discount")) {
      if (adjustmentValueType === "percentage") {
        total -= total * (adjustmentValue / 100);
      } else {
        total -= adjustmentValue;
      }
    }

    return total;
  };

  // Função para inicializar o chat LimIA
  const startLimIAChat = () => {
    setShowLimIAChat(true);
    setChatMessages([
      {
        id: "1",
        type: "ai",
        content:
          "Olá! Sou o LimIA, seu assistente para orçamentos completos. Vou te ajudar a criar um orçamento detalhado por fases. Primeiro, me diga qual é o nome do seu projeto?",
        timestamp: new Date(),
      },
    ]);
    setChatStep(0);
    setCollectedData({
      projectName: "",
      projectDescription: "",
      projectType: "",
      totalArea: 0,
      complexity: "",
      deliveryTime: 0,
      budgetRange: "",
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
            "Perfeito! Agora vou gerar um orçamento completo com fases detalhadas baseado nas suas informações. Isso pode levar alguns segundos...",
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
      suggestedBaseValue: 85,
      suggestedPhases: [],
      recommendedMargin: 20,
      analysis: sugestao,
    };

    // Extrair valor base sugerido
    const baseValueMatch = sugestao.match(/R\$ (\d+(?:\.\d+)?)/g);
    if (baseValueMatch && baseValueMatch.length > 0) {
      const lastValue = baseValueMatch[baseValueMatch.length - 1];
      values.suggestedBaseValue = parseInt(
        lastValue.replace("R$ ", "").replace(".", "")
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
        tipoProjeto: "completo",
        tipoOrcamento: "complete",
        area: collectedData.totalArea,
        complexidade: collectedData.complexity,
        prazoEntrega: collectedData.deliveryTime,
        faixaOrcamento: collectedData.budgetRange,
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
            "Orçamento completo gerado com sucesso! Vou mostrar uma comparação entre suas informações e as sugestões da IA.",
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

      // Aplicar valor base sugerido
      if (aiGeneratedData.suggestedBaseValue) {
        setBudgetPhases((prev) =>
          prev.map((phase) => ({
            ...phase,
            baseValue: aiGeneratedData.suggestedBaseValue,
          }))
        );
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
                : () => setBudgetStep(budgetStep + 1)
            }
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Salvando..."
              : budgetStep === 4
              ? "Finalizar"
              : "Continuar"}
          </Button>
        </div>
      </div>

      {/* Modal de criação de cliente */}
      {showClientsModal && (
        <ClientsModal
          isClientModalOpen={showClientsModal}
          setIsClientModalOpen={setShowClientsModal}
          onClientSelect={handleSelectClient}
        />
      )}

      {/* Modal de criação de segmento */}
      {showSegmentModal && (
        <SegmentModal
          isOpen={showSegmentModal}
          onClose={() => {
            setShowSegmentModal(false);
            setCurrentPhaseForSegment(null);
          }}
          onSubmit={handleAddSegment}
        />
      )}

      {/* Modal de criação de atividade */}
      {showActivityModal && (
        <ActivityModal
          isOpen={showActivityModal}
          onClose={() => {
            setShowActivityModal(false);
            setCurrentPhaseForActivity(null);
            setPreSelectedSegment(null);
          }}
          onSubmit={handleAddActivity}
          segments={
            currentPhaseForActivity !== null
              ? budgetPhases.find((p) => p.id === currentPhaseForActivity)
                  ?.segments
              : []
          }
          preSelectedSegment={preSelectedSegment}
        />
      )}

      {/* Modal de criação de fase */}
      {showPhaseModal && (
        <PhaseModal
          isOpen={showPhaseModal}
          onClose={() => setShowPhaseModal(false)}
          onSubmit={handleAddPhase}
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
                    Assistente de Orçamentos Completos
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
                          Área total:
                        </span>
                        <div className="text-lg font-semibold text-blue-700">
                          {collectedData.totalArea} m²
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-blue-600">
                          Complexidade:
                        </span>
                        <div className="text-lg font-semibold text-blue-700">
                          {collectedData.complexity}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-blue-600">Prazo:</span>
                        <div className="text-lg font-semibold text-blue-700">
                          {collectedData.deliveryTime} dias
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
                          Valor base sugerido:
                        </span>
                        <div className="text-2xl font-bold text-purple-700">
                          R$ {aiGeneratedData?.suggestedBaseValue || "N/A"}/h
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-purple-600">
                          Margem recomendada:
                        </span>
                        <div className="text-lg font-semibold text-purple-700">
                          {aiGeneratedData?.recommendedMargin || "N/A"}%
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
