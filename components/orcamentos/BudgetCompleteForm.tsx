"use client";

import { Button } from "@/components/ui/button";
import { UserIcon, MoreVertical } from "lucide-react";
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
  const [selectedClientOption, setSelectedClientOption] = useState<
    "existing" | "later" | null
  >("existing");

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

  const handleClientSelect = (option: "existing" | "later") => {
    setSelectedClientOption(option);
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

              <div className="grid grid-cols-1 gap-6">
                <div
                  className={`border rounded-lg p-5 ${
                    selectedClientOption === "existing"
                      ? "border-indigo-600 bg-indigo-50"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer ${
                        selectedClientOption === "existing"
                          ? "border-indigo-600"
                          : ""
                      }`}
                      onClick={() => handleClientSelect("existing")}
                    >
                      {selectedClientOption === "existing" && (
                        <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                      )}
                    </div>
                    <h4 className="font-medium">Nome do cliente</h4>
                  </div>

                  {selectedClientOption === "existing" && (
                    <div className="pl-8">
                      <p className="text-sm text-gray-500 mb-2">
                        Busque seu cliente ou crie um novo
                      </p>
                      <div className="flex gap-2 relative">
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <UserIcon className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            ref={inputRef}
                            type="text"
                            className="pl-10 pr-4 py-2 w-full border rounded-md text-sm"
                            placeholder="Nome do cliente"
                            value={clientSearch}
                            onChange={(e) => {
                              setClientSearch(e.target.value);
                              setClientId(null);
                            }}
                            autoComplete="off"
                          />
                          {clientSearch && filteredClients.length > 0 && (
                            <ul className="absolute z-10 left-0 right-0 bg-white border rounded shadow mt-1 max-h-48 overflow-y-auto">
                              {filteredClients.map((client) => (
                                <li
                                  key={client.id}
                                  className="px-4 py-2 cursor-pointer hover:bg-indigo-50 flex items-center gap-2"
                                  onClick={() => handleSelectClient(client)}
                                >
                                  {client.photoUrl ? (
                                    <img
                                      src={client.photoUrl}
                                      alt={client.name}
                                      className="w-6 h-6 rounded-full object-cover"
                                    />
                                  ) : (
                                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                                      {client.name.charAt(0)}
                                    </span>
                                  )}
                                  <span>{client.name}</span>
                                  {client.email && (
                                    <span className="ml-2 text-xs text-gray-400">
                                      {client.email}
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <Button
                          className="bg-indigo-600 text-white"
                          onClick={() => setShowClientsModal(true)}
                        >
                          Criar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div
                  className={`border rounded-lg p-5 ${
                    selectedClientOption === "later"
                      ? "border-indigo-600 bg-indigo-50"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer ${
                        selectedClientOption === "later"
                          ? "border-indigo-600"
                          : ""
                      }`}
                      onClick={() => handleClientSelect("later")}
                    >
                      {selectedClientOption === "later" && (
                        <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">Adicionar depois</h4>
                      <p className="text-sm text-gray-500">
                        Quero deixar para depois
                      </p>
                    </div>
                  </div>
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
                <div className="bg-indigo-50 rounded-xl p-6">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="adjustmentType"
                      className="w-5 h-5 text-indigo-600 border-indigo-600"
                      checked={adjustmentType === "increase"}
                      onChange={() => setAdjustmentType("increase")}
                    />
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
                      disabled={adjustmentType !== "increase"}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                      $
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-indigo-100">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="adjustmentType"
                      className="w-5 h-5 text-indigo-600 border-indigo-600"
                      checked={adjustmentType === "discount"}
                      onChange={() => setAdjustmentType("discount")}
                    />
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
                        onClick={() => setDiscountType("value")}
                      >
                        $
                      </button>
                      <button
                        className={`px-3 py-1 rounded-lg ${
                          discountType === "percentage"
                            ? "bg-indigo-600 text-white"
                            : "border"
                        }`}
                        onClick={() => setDiscountType("percentage")}
                      >
                        %
                      </button>
                    </div>
                    <input
                      type="text"
                      className="flex-1 border rounded-lg px-3 py-2"
                      placeholder="10%"
                      disabled={adjustmentType !== "discount"}
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
        client_id:
          selectedClientOption === "existing" && clientId ? clientId : null,
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
          type: adjustmentType,
          value: adjustmentType === "increase" ? 0 : 0,
          valueType: adjustmentType === "discount" ? "percentage" : null,
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
    if (adjustmentType === "increase") {
      if (adjustmentValueType === "percentage") {
        total += total * (adjustmentValue / 100);
      } else {
        total += adjustmentValue;
      }
    } else {
      if (adjustmentValueType === "percentage") {
        total -= total * (adjustmentValue / 100);
      } else {
        total -= adjustmentValue;
      }
    }

    return total;
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
    </>
  );
}
