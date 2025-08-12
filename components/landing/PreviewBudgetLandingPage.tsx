"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Settings, X, Edit3, Download, Image as ImageIcon } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formatCurrency } from "@/app/lib/expenses";
import { Check, ChevronRight, Eye } from "lucide-react";
import Image from "next/image";

// Componente para itens arrastáveis dos entregáveis
function SortableDeliverable({
  id,
  title,
  description,
  onRemove,
  onEdit,
}: {
  id: string;
  title: string;
  description: string;
  onRemove: (id: string) => void;
  onEdit: (id: string, field: "title" | "description", value: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-100 rounded-lg p-3 mb-2"
    >
      <div className="flex items-start gap-3">
        {/* Drag handle com 3 pontinhos */}
        <div
          {...attributes}
          {...listeners}
          className="flex flex-col gap-0.5 mt-1 cursor-move hover:opacity-70 transition-opacity"
        >
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
        </div>

        {/* Conteúdo do item */}
        <div className="flex-1 space-y-2">
          <div>
            <span className="text-xs text-gray-500">Item</span>
            <input
              type="text"
              value={title}
              onChange={(e) => onEdit(id, "title", e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            />
          </div>
          <div>
            <span className="text-xs text-gray-500">Descrição</span>
            <input
              type="text"
              value={description}
              onChange={(e) => onEdit(id, "description", e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Botão remover */}
        <button
          onClick={() => onRemove(id)}
          className="text-gray-400 hover:text-red-500 transition-colors mt-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Componente para itens arrastáveis das fases
function SortablePhase({
  id,
  title,
  content,
  phaseNumber,
  onRemove,
  onEdit,
}: {
  id: string;
  title: string;
  content: string;
  phaseNumber: number;
  onRemove: (id: string) => void;
  onEdit: (id: string, field: "title" | "content", value: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-100 rounded-lg p-3 mb-2"
    >
      <div className="flex items-start gap-3">
        {/* Drag handle com 3 pontinhos */}
        <div
          {...attributes}
          {...listeners}
          className="flex flex-col gap-0.5 mt-1 cursor-move hover:opacity-70 transition-opacity"
        >
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
        </div>

        {/* Conteúdo do item */}
        <div className="flex-1 space-y-2">
          <div className="text-xs text-gray-500 font-medium">
            Fase {phaseNumber}
          </div>
          <div>
            <span className="text-xs text-gray-500">Título</span>
            <input
              type="text"
              value={title}
              onChange={(e) => onEdit(id, "title", e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            />
          </div>
          <div>
            <span className="text-xs text-gray-500">Conteúdo</span>
            <textarea
              value={content}
              onChange={(e) => onEdit(id, "content", e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              rows={2}
            />
          </div>
        </div>

        {/* Botão remover */}
        <button
          onClick={() => onRemove(id)}
          className="text-gray-400 hover:text-red-500 transition-colors mt-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Componente para itens arrastáveis do investimento
function SortableInvestmentItem({
  id,
  text,
  itemNumber,
  onRemove,
  onEdit,
}: {
  id: string;
  text: string;
  itemNumber: number;
  onRemove: (id: string) => void;
  onEdit: (id: string, value: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-100 rounded-lg p-3 mb-2"
    >
      <div className="flex items-start gap-3">
        {/* Drag handle com 3 pontinhos */}
        <div
          {...attributes}
          {...listeners}
          className="flex flex-col gap-0.5 mt-1 cursor-move hover:opacity-70 transition-opacity"
        >
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
        </div>

        {/* Conteúdo do item */}
        <div className="flex-1 space-y-2">
          <div className="text-xs text-gray-500 font-medium">
            Item {itemNumber}
          </div>
          <div>
            <span className="text-xs text-gray-500">Texto</span>
            <input
              type="text"
              value={text}
              onChange={(e) => onEdit(id, e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Botão remover */}
        <button
          onClick={() => onRemove(id)}
          className="text-gray-400 hover:text-red-500 transition-colors mt-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Componente para membros arrastáveis da equipe
function SortableTeamMember({
  id,
  name,
  role,
  description,
  image,
  memberNumber,
  onRemove,
  onEdit,
  onImageUpload,
}: {
  id: string;
  name: string;
  role: string;
  description: string;
  image?: string;
  memberNumber: number;
  onRemove: (id: string) => void;
  onEdit: (
    id: string,
    field: "name" | "role" | "description",
    value: string
  ) => void;
  onImageUpload: (id: string, file: File) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(id, file);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-100 rounded-lg p-3 mb-2"
    >
      <div className="flex items-start gap-3">
        {/* Drag handle com 3 pontinhos */}
        <div
          {...attributes}
          {...listeners}
          className="flex flex-col gap-0.5 mt-1 cursor-move hover:opacity-70 transition-opacity"
        >
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
        </div>

        {/* Conteúdo do item */}
        <div className="flex-1 space-y-2">
          <div className="text-xs text-gray-500 font-medium">
            Colaborador {memberNumber}
          </div>
          <div>
            <span className="text-xs text-gray-500">Nome</span>
            <input
              type="text"
              value={name}
              onChange={(e) => onEdit(id, "name", e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            />
          </div>
          <div>
            <span className="text-xs text-gray-500">Texto</span>
            <input
              type="text"
              value={role}
              onChange={(e) => onEdit(id, "role", e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Upload de imagem */}
          <div>
            <span className="text-xs text-gray-500">Upload imagem</span>
            <div className="border border-gray-300 rounded p-2 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id={`team-image-${id}`}
              />
              <label
                htmlFor={`team-image-${id}`}
                className="cursor-pointer flex items-center justify-center gap-1 text-gray-600 hover:text-gray-800 transition-colors text-xs"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                Upload imagem
              </label>
              {image && (
                <div className="mt-1">
                  <img
                    src={image}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded mx-auto"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botão remover */}
        <button
          onClick={() => onRemove(id)}
          className="text-gray-400 hover:text-red-500 transition-colors mt-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface BudgetLandingPageProps {
  budgetData: {
    projectName: string;
    clientName: string;
    projectDescription: string;
    totalValue: number;
    items: Array<{
      id: string;
      name: string;
      description: string;
      pricePerSquareMeter: number;
      squareMeters: number;
      total: number;
      exibir: boolean;
    }>;
    tipoAmbiente: "interior" | "exterior";
    valorComodos: "unico" | "individuais";
    adicionalValor?: number;
    desconto?: number;
    tipoDesconto?: "percentual" | "valor";
    references?: string[];
  };
  configData?: {
    title?: string;
    subtitle?: string;
    headerImage?: string;
  };
  onBack?: () => void;
  onPublish?: () => void;
  showCloseButton?: boolean;
}

export default function BudgetLandingPage({
  budgetData,
  configData,
  onBack,
  onPublish,
  showCloseButton = true,
}: BudgetLandingPageProps) {
  const [activeSection, setActiveSection] = useState("overview");
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const [showSectionConfig, setShowSectionConfig] = useState<string | null>(
    null
  );
  const [sectionNames, setSectionNames] = useState({
    overview: "Visão Geral",
    deliverables: "Entregáveis",
    phases: "Fases do Projeto",
    investment: "Investimento",
    about: "Sobre nós",
    team: "Equipe",
  });
  const [tempSectionName, setTempSectionName] = useState("");
  const [deliverables, setDeliverables] = useState([
    {
      id: "1",
      title: "Planta de layout funcional",
      description: "Layout otimizado dos ambientes",
    },
    {
      id: "2",
      title: "Moodboard com materiais, acabamentos e paleta de cores",
      description: "Seleção de materiais e cores",
    },
    {
      id: "3",
      title: "Projeto luminotécnico, elétrico e hidráulico",
      description: "Projetos técnicos complementares",
    },
    {
      id: "4",
      title: "Acompanhamento técnico sob demanda",
      description: "Suporte durante a execução",
    },
    {
      id: "5",
      title: "Modelos 3D com imagens renderizadas",
      description: "Visualizações realistas do projeto",
    },
    {
      id: "6",
      title: "Book técnico com cortes, elevações e pranchas executivas",
      description: "Documentação técnica completa",
    },
  ]);
  const [tempDeliverables, setTempDeliverables] = useState(deliverables);
  const [deliverablesConfig, setDeliverablesConfig] = useState({
    title: "O que está incluso no seu projeto",
    description:
      "Aqui está um panorama completo do que será desenvolvido para sua residência:",
  });
  const [tempDeliverablesConfig, setTempDeliverablesConfig] =
    useState(deliverablesConfig);
  const [phases, setPhases] = useState([
    {
      id: "1",
      title: "Briefing",
      content:
        "Coleta aprofundada de informações, preferências, estilo de vida, materiais desejados e referências visuais.",
    },
    {
      id: "2",
      title: "Anteprojeto",
      content:
        "Modelagem 3D, vistas renderizadas dos ambientes e ajustes finos com base no seu feedback.",
    },
    {
      id: "3",
      title: "Projeto Executivo",
      content:
        "Detalhamento técnico completo com plantas, cortes, elevações e especificações para execução.",
    },
    {
      id: "4",
      title: "Acompanhamento",
      content:
        "Suporte durante a execução da obra com visitas técnicas e esclarecimento de dúvidas.",
    },
  ]);
  const [tempPhases, setTempPhases] = useState(phases);
  const [phasesConfig, setPhasesConfig] = useState({
    title: "Fases do Projeto",
    description:
      "Para garantir um projeto fluido e bem estruturado, dividimos o trabalho em 4 etapas principais:",
  });
  const [tempPhasesConfig, setTempPhasesConfig] = useState(phasesConfig);
  const [investment, setInvestment] = useState({
    title: "Projeto Completo",
    value: "R$ 0,00", // Será atualizado dinamicamente
    items: [
      {
        id: "1",
        text: "Todos os entregáveis",
      },
      {
        id: "2",
        text: "Todas as fases do projeto",
      },
    ],
  });
  const [tempInvestment, setTempInvestment] = useState(investment);
  const [investmentConfig, setInvestmentConfig] = useState({
    title: "Investimento do projeto",
    description:
      "Você encontrará abaixo o valor total do projeto, com possibilidade de parcelamento. Este investimento contempla todas as etapas, entregáveis e suporte descritos.",
  });
  const [tempInvestmentConfig, setTempInvestmentConfig] =
    useState(investmentConfig);
  const [aboutConfig, setAboutConfig] = useState({
    title:
      "Um escritório apaixonado por arquitetura afetiva, funcional e atemporal.",
    paragraphs: [
      "Acreditamos que cada casa deve refletir a essência de quem a habita. Nossa abordagem vai além da estética, focando na funcionalidade, no bem-estar e na experiência de viver em cada espaço que projetamos.",
      "Com processos bem definidos, tecnologia de ponta e toque humano, criamos ambientes que não apenas impressionam visualmente, mas que também proporcionam conforto e praticidade para o dia a dia.",
    ],
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2001&q=80",
    yearsOfExperience: 15,
    completedProjects: 500,
  });
  const [tempAboutConfig, setTempAboutConfig] = useState(aboutConfig);
  const [teamMembers, setTeamMembers] = useState([
    {
      id: "1",
      name: "Laura Menezes",
      role: "Arquiteta Responsável",
      description:
        "Formada pela USP, especialista em projetos residenciais de alto padrão com mais de 10 anos de experiência.",
      initials: "LM",
      bgColor: "from-blue-400 to-purple-500",
      image: undefined as string | undefined,
    },
    {
      id: "2",
      name: "Carlos Vieira",
      role: "Especialista em 3D",
      description:
        "Expert em modelagem 3D e renderização, responsável por criar as visualizações fotorrealísticas dos projetos.",
      initials: "CV",
      bgColor: "from-green-400 to-blue-500",
      image: undefined as string | undefined,
    },
    {
      id: "3",
      name: "Renata Franco",
      role: "Documentação Técnica",
      description:
        "Responsável por toda a documentação técnica e detalhamento executivo dos projetos.",
      initials: "RF",
      bgColor: "from-purple-400 to-pink-500",
      image: undefined as string | undefined,
    },
  ]);
  const [tempTeamMembers, setTempTeamMembers] = useState(teamMembers);
  const [teamConfig, setTeamConfig] = useState({
    title: "Nossa equipe",
    description:
      "Conheça os profissionais que estarão envolvidos no seu projeto:",
  });
  const [tempTeamConfig, setTempTeamConfig] = useState(teamConfig);
  const router = useRouter();

  // Sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Função para lidar com o fim do arrastar
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTempDeliverables((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Função para editar um entregável
  const handleEditDeliverable = (
    id: string,
    field: "title" | "description",
    value: string
  ) => {
    setTempDeliverables((items) =>
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Função para remover um entregável
  const handleRemoveDeliverable = (id: string) => {
    setTempDeliverables((items) => items.filter((item) => item.id !== id));
  };

  // Função para adicionar um novo entregável
  const handleAddDeliverable = () => {
    const newId = Date.now().toString();
    const newDeliverable = {
      id: newId,
      title: "Novo item",
      description: "Descrição do novo item",
    };
    setTempDeliverables((items) => [...items, newDeliverable]);
  };

  // Função para editar uma fase
  const handleEditPhase = (
    id: string,
    field: "title" | "content",
    value: string
  ) => {
    setTempPhases((items) =>
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Função para remover uma fase
  const handleRemovePhase = (id: string) => {
    setTempPhases((items) => items.filter((item) => item.id !== id));
  };

  // Função para adicionar uma nova fase
  const handleAddPhase = () => {
    const newId = Date.now().toString();
    const newPhase = {
      id: newId,
      title: "Nova fase",
      content: "Descrição da nova fase",
    };
    setTempPhases((items) => [...items, newPhase]);
  };

  // Função para lidar com o fim do arrastar das fases
  const handlePhasesDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTempPhases((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Função para editar um item do investimento
  const handleEditInvestmentItem = (id: string, value: string) => {
    setTempInvestment((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, text: value } : item
      ),
    }));
  };

  // Função para remover um item do investimento
  const handleRemoveInvestmentItem = (id: string) => {
    setTempInvestment((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  // Função para adicionar um novo item do investimento
  const handleAddInvestmentItem = () => {
    const newId = Date.now().toString();
    const newItem = {
      id: newId,
      text: "Novo item",
    };
    setTempInvestment((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  // Função para lidar com o fim do arrastar dos itens do investimento
  const handleInvestmentDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTempInvestment((prev) => {
        const oldIndex = prev.items.findIndex((item) => item.id === active.id);
        const newIndex = prev.items.findIndex((item) => item.id === over.id);

        return {
          ...prev,
          items: arrayMove(prev.items, oldIndex, newIndex),
        };
      });
    }
  };

  // Função para upload de imagem da seção "Sobre nós"
  const handleAboutImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setTempAboutConfig((prev) => ({
          ...prev,
          image: result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Função para atualizar parágrafos da seção "Sobre nós"
  const handleAboutParagraphChange = (index: number, value: string) => {
    setTempAboutConfig((prev) => ({
      ...prev,
      paragraphs: prev.paragraphs.map((p, i) => (i === index ? value : p)),
    }));
  };

  // Função para editar um membro da equipe
  const handleEditTeamMember = (
    id: string,
    field: "name" | "role" | "description",
    value: string
  ) => {
    setTempTeamMembers((items) =>
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Função para remover um membro da equipe
  const handleRemoveTeamMember = (id: string) => {
    setTempTeamMembers((items) => items.filter((item) => item.id !== id));
  };

  // Função para adicionar um novo membro da equipe
  const handleAddTeamMember = () => {
    const newId = Date.now().toString();
    const colors = [
      "from-blue-400 to-purple-500",
      "from-green-400 to-blue-500",
      "from-purple-400 to-pink-500",
      "from-red-400 to-orange-500",
      "from-indigo-400 to-blue-500",
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newMember = {
      id: newId,
      name: "Novo membro",
      role: "Função",
      description: "Descrição do novo membro",
      initials: "NM",
      bgColor: randomColor,
      image: undefined as string | undefined,
    };
    setTempTeamMembers((items) => [...items, newMember]);
  };

  // Função para upload de imagem de membro da equipe
  const handleTeamMemberImageUpload = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setTempTeamMembers((items) =>
        items.map((item) =>
          item.id === id ? { ...item, image: result } : item
        )
      );
    };
    reader.readAsDataURL(file);
  };

  // Função para lidar com o fim do arrastar dos membros da equipe
  const handleTeamDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTempTeamMembers((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  useEffect(() => {
    // Função para controlar o scroll
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const threshold = window.innerHeight * 0.3; // 30% da altura da tela

      if (scrollPosition > threshold) {
        setIsHeaderCompact(true);
      } else {
        setIsHeaderCompact(false);
      }
    };

    // Adicionar listener de scroll
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Trigger inicial para verificar posição
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // useEffect para atualizar o valor do investment quando budgetData mudar
  useEffect(() => {
    if (budgetData) {
      const totalValue = formatCurrency(calculateTotalBudget());
      setInvestment((prev) => ({
        ...prev,
        value: totalValue,
      }));
      setTempInvestment((prev) => ({
        ...prev,
        value: totalValue,
      }));
    }
  }, [budgetData]);

  const navigationItems = [
    {
      id: "overview",
      label: sectionNames.overview,
      icon: Eye,
      configurable: true,
    },
    {
      id: "deliverables",
      label: sectionNames.deliverables,
      icon: Download,
      configurable: true,
    },
    {
      id: "phases",
      label: sectionNames.phases,
      icon: Settings,
      configurable: true,
    },
    {
      id: "investment",
      label: sectionNames.investment,
      icon: Settings,
      configurable: true,
    },
    {
      id: "about",
      label: sectionNames.about,
      icon: Settings,
      configurable: true,
    },
    {
      id: "team",
      label: sectionNames.team,
      icon: Settings,
      configurable: true,
    },
  ];

  const calculateTotalBudget = () => {
    const itemsTotal = budgetData.items
      .filter((item) => item.exibir)
      .reduce((sum, item) => sum + item.total, 0);
    let finalTotal = itemsTotal;

    if (budgetData.adicionalValor) {
      finalTotal += budgetData.adicionalValor;
    }
    if (budgetData.desconto) {
      if (budgetData.tipoDesconto === "percentual") {
        finalTotal -= finalTotal * (budgetData.desconto / 100);
      } else {
        finalTotal -= budgetData.desconto;
      }
    }

    return finalTotal;
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setActiveSection(sectionId);
    }
  };

  useEffect(() => {
    const handleScrollSpy = () => {
      const sections = navigationItems.map((item) => item.id);

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 200) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScrollSpy);
    return () => window.removeEventListener("scroll", handleScrollSpy);
  }, []);

  // Fechar menus quando clicar fora
  useEffect(() => {
    // Remover o handleClickOutside - modal só fecha com botões
    return () => {}; // Cleanup vazio
  }, [showSectionConfig]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handlePublish = () => {
    if (onPublish) {
      onPublish();
    } else {
      // Implementar lógica de publicação padrão se necessário
      console.log("Orçamento aprovado!");
    }
  };

  const handleOpenSectionConfig = (sectionId: string) => {
    const currentName = sectionNames[sectionId as keyof typeof sectionNames];
    setTempSectionName(currentName);

    // Se for entregáveis, inicializar dados temporários
    if (sectionId === "deliverables") {
      setTempDeliverables([...deliverables]);
      setTempDeliverablesConfig({ ...deliverablesConfig });
    }

    // Se for fases, inicializar dados temporários
    if (sectionId === "phases") {
      setTempPhases([...phases]);
      setTempPhasesConfig({ ...phasesConfig });
    }

    // Se for investimento, inicializar dados temporários
    if (sectionId === "investment") {
      setTempInvestment({
        ...investment,
        items: [...investment.items],
      });
      setTempInvestmentConfig({ ...investmentConfig });
    }

    // Se for sobre nós, inicializar dados temporários
    if (sectionId === "about") {
      setTempAboutConfig({
        ...aboutConfig,
        paragraphs: [...aboutConfig.paragraphs],
      });
    }

    // Se for equipe, inicializar dados temporários
    if (sectionId === "team") {
      setTempTeamMembers([...teamMembers]);
      setTempTeamConfig({ ...teamConfig });
    }

    setShowSectionConfig(sectionId);
  };

  const handleSaveSectionConfig = () => {
    if (showSectionConfig && tempSectionName.trim()) {
      setSectionNames((prev) => ({
        ...prev,
        [showSectionConfig]: tempSectionName.trim(),
      }));

      // Se for entregáveis, também salvar os dados específicos
      if (showSectionConfig === "deliverables") {
        setDeliverables(tempDeliverables);
        setDeliverablesConfig(tempDeliverablesConfig);
      }

      // Se for fases, também salvar os dados específicos
      if (showSectionConfig === "phases") {
        setPhases(tempPhases);
        setPhasesConfig(tempPhasesConfig);
      }

      // Se for investimento, também salvar os dados específicos
      if (showSectionConfig === "investment") {
        setInvestment(tempInvestment);
        setInvestmentConfig(tempInvestmentConfig);
      }

      // Se for sobre nós, também salvar os dados específicos
      if (showSectionConfig === "about") {
        setAboutConfig(tempAboutConfig);
      }

      // Se for equipe, também salvar os dados específicos
      if (showSectionConfig === "team") {
        setTeamMembers(tempTeamMembers);
        setTeamConfig(tempTeamConfig);
      }

      setShowSectionConfig(null);
      setTempSectionName("");
    }
  };

  const handleCancelSectionConfig = () => {
    // Resetar mudanças temporárias dos entregáveis
    if (showSectionConfig === "deliverables") {
      setTempDeliverables(deliverables);
      setTempDeliverablesConfig(deliverablesConfig);
    }

    // Resetar mudanças temporárias das fases
    if (showSectionConfig === "phases") {
      setTempPhases(phases);
      setTempPhasesConfig(phasesConfig);
    }

    // Resetar mudanças temporárias do investimento
    if (showSectionConfig === "investment") {
      setTempInvestment({
        ...investment,
        items: [...investment.items],
      });
      setTempInvestmentConfig(investmentConfig);
    }

    // Resetar mudanças temporárias do sobre nós
    if (showSectionConfig === "about") {
      setTempAboutConfig({
        ...aboutConfig,
        paragraphs: [...aboutConfig.paragraphs],
      });
    }

    // Resetar mudanças temporárias da equipe
    if (showSectionConfig === "team") {
      setTempTeamMembers(teamMembers);
      setTempTeamConfig(teamConfig);
    }

    setShowSectionConfig(null);
    setTempSectionName("");
  };

  // Adicionar função para atualizar anos de experiência
  const handleYearsOfExperienceChange = (value: string) => {
    const years = parseInt(value) || 0;
    setTempAboutConfig((prev) => ({
      ...prev,
      yearsOfExperience: years,
    }));
  };

  // Adicionar função para atualizar quantidade de projetos
  const handleCompletedProjectsChange = (value: string) => {
    const projects = parseInt(value) || 0;
    setTempAboutConfig((prev) => ({
      ...prev,
      completedProjects: projects,
    }));
  };

  const renderHeader = () => (
    <div
      className={`relative bg-cover bg-center bg-no-repeat overflow-hidden transition-all duration-1000 ease-in-out ${
        isHeaderCompact ? "h-24 sm:h-32" : "h-screen"
      }`}
      style={{
        backgroundImage: configData?.headerImage
          ? `url('${configData.headerImage}')`
          : "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80')",
      }}
    >
      {/* Overlay escuro para melhorar legibilidade do texto */}
      <div className="absolute inset-0 bg-black bg-opacity-30" />

      {/* Overlay Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-4 lg:px-8">
        <div className="max-w-6xl mx-auto w-full">
          <div
            className={`flex flex-col lg:flex-row lg:items-center lg:justify-between transition-all duration-1000 ${
              isHeaderCompact ? "scale-95 transform" : ""
            }`}
          >
            <div className="text-white">
              <h1
                className={`font-bold mb-2 transition-all duration-1000 ${
                  isHeaderCompact
                    ? "text-xl sm:text-2xl lg:text-3xl"
                    : "text-2xl sm:text-4xl lg:text-6xl"
                }`}
              >
                {configData?.title ||
                  `Proposta Comercial: ${budgetData.clientName}`}
              </h1>
              <p
                className={`text-gray-200 transition-all duration-1000 ${
                  isHeaderCompact
                    ? "text-xs sm:text-sm lg:text-base"
                    : "text-lg sm:text-xl lg:text-2xl"
                }`}
              >
                {configData?.subtitle || "Preparado por: Estúdio Meza"}
              </p>
            </div>
            <div
              className={`mt-4 lg:mt-0 text-white text-right transition-all duration-1000 ${
                isHeaderCompact ? "scale-95 transform" : ""
              }`}
            >
              <div
                className={`transition-all duration-1000 ${
                  isHeaderCompact ? "space-y-1" : "space-y-2"
                }`}
              >
                <div>
                  <p
                    className={`text-gray-300 transition-all duration-1000 ${
                      isHeaderCompact ? "text-xs" : "text-sm"
                    }`}
                  >
                    Cliente
                  </p>
                  <p
                    className={`font-semibold transition-all duration-1000 ${
                      isHeaderCompact ? "text-sm" : "text-lg"
                    }`}
                  >
                    {budgetData.clientName}
                  </p>
                </div>
                <div>
                  <p
                    className={`text-gray-300 transition-all duration-1000 ${
                      isHeaderCompact ? "text-xs" : "text-sm"
                    }`}
                  >
                    Data
                  </p>
                  <p
                    className={`font-semibold transition-all duration-1000 ${
                      isHeaderCompact ? "text-sm" : "text-lg"
                    }`}
                  >
                    Maio 2025
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMainContent = () => (
    <div
      className={`bg-white transition-all duration-1000 ${
        isHeaderCompact ? "ml-0 lg:ml-64" : "ml-0"
      }`}
    >
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-12">
        {/* Overview Section */}
        <section
          id="overview"
          className="space-y-8 sm:space-y-12 mb-16 sm:mb-20"
        >
          {/* Section Title - Opaque */}
          <div className="mb-6 sm:mb-8">
            <div className="text-gray-300 text-xs sm:text-sm font-medium tracking-wider uppercase mb-2">
              {sectionNames.overview}
            </div>
            <div className="w-full h-px bg-gray-200"></div>
          </div>

          {/* Welcome Section */}
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              Bem-vindo à sua nova casa, {budgetData.clientName}!
            </h2>
            <div className="text-gray-600 space-y-3 sm:space-y-4 text-base sm:text-lg leading-relaxed">
              <p>
                Esta proposta foi desenvolvida especialmente para você, baseada
                no briefing detalhado que compartilhou conosco. Nosso objetivo é
                criar uma residência que combine funcionalidade, estética e
                conforto, refletindo sua personalidade e necessidades.
              </p>
              <p>
                Apresentamos esta proposta de forma clara e interativa, para que
                você possa visualizar cada detalhe do projeto e entender como
                cada elemento contribui para o resultado final.
              </p>
            </div>
          </div>
        </section>

        {/* Deliverables Section */}
        <section
          id="deliverables"
          className="space-y-8 sm:space-y-12 mb-16 sm:mb-20"
        >
          {/* Section Title - Opaque */}
          <div className="mb-6 sm:mb-8">
            <div className="text-gray-300 text-xs sm:text-sm font-medium tracking-wider uppercase mb-2">
              {sectionNames.deliverables}
            </div>
            <div className="w-full h-px bg-gray-200"></div>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              {deliverablesConfig.title}
            </h2>
            <p className="text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg">
              {deliverablesConfig.description}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-4 sm:space-y-6">
                {deliverables
                  .slice(0, Math.ceil(deliverables.length / 2))
                  .map((deliverable) => (
                    <div
                      key={deliverable.id}
                      className="flex items-start gap-3 sm:gap-4"
                    >
                      <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                      </div>
                      <span className="text-gray-700 text-base sm:text-lg">
                        {deliverable.title}
                      </span>
                    </div>
                  ))}
              </div>
              <div className="space-y-4 sm:space-y-6">
                {deliverables
                  .slice(Math.ceil(deliverables.length / 2))
                  .map((deliverable) => (
                    <div
                      key={deliverable.id}
                      className="flex items-start gap-3 sm:gap-4"
                    >
                      <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                      </div>
                      <span className="text-gray-700 text-base sm:text-lg">
                        {deliverable.title}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </section>

        {/* Phases Section */}
        <section id="phases" className="space-y-8 sm:space-y-12 mb-16 sm:mb-20">
          {/* Section Title - Opaque */}
          <div className="mb-6 sm:mb-8">
            <div className="text-gray-300 text-xs sm:text-sm font-medium tracking-wider uppercase mb-2">
              {sectionNames.phases}
            </div>
            <div className="w-full h-px bg-gray-200"></div>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              {phasesConfig.title}
            </h2>
            <p className="text-gray-600 mb-8 sm:mb-12 text-base sm:text-lg">
              {phasesConfig.description}
            </p>
            <div className="relative">
              <div className="space-y-12 sm:space-y-16">
                {phases.map((phase, index) => (
                  <div
                    key={phase.id}
                    className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8 relative"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0 z-10 relative"></div>
                      <div className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-sm font-medium">
                        Fase {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 pt-0 sm:pt-0">
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                        {phase.title}
                      </h3>
                      <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                        {phase.content}
                      </p>
                    </div>
                    {/* Linha conectando para próxima fase - só mostra se não for a última */}
                    {index < phases.length - 1 && (
                      <div
                        className="absolute left-2 top-2 w-px bg-gray-300 z-0 hidden sm:block"
                        style={{ height: "calc(4rem + 8px)" }}
                      ></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Investment Section */}
        <section
          id="investment"
          className="space-y-8 sm:space-y-12 mb-16 sm:mb-20"
        >
          {/* Section Title - Opaque */}
          <div className="mb-6 sm:mb-8">
            <div className="text-gray-300 text-xs sm:text-sm font-medium tracking-wider uppercase mb-2">
              {sectionNames.investment}
            </div>
            <div className="w-full h-px bg-gray-200"></div>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              {investmentConfig.title}
            </h2>
            <p className="text-gray-600 mb-8 sm:mb-12 text-base sm:text-lg">
              {investmentConfig.description}
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
              <div className="space-y-6 sm:space-y-8">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-bold text-base sm:text-lg">
                      R$
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                      Valor total do contrato
                    </h3>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                      {investment.value}
                    </p>
                    <p className="text-gray-500 text-sm">(valor estimado)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                      Assinatura do contrato
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base">
                      Assinatura do contrato (50% do valor) – dá início ao
                      projeto.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                      Entrega do projeto executivo
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base">
                      Entrega final (50%) – na entrega do executivo.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">
                  {investment.title}
                </h3>
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
                  {investment.value}
                </div>
                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  {investment.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                      <span className="text-gray-700 text-sm sm:text-base">
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 sm:py-4 text-base sm:text-lg rounded-xl"
                  onClick={handlePublish}
                >
                  Aprovar Proposta
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="space-y-8 sm:space-y-12 mb-16 sm:mb-20">
          {/* Section Title - Opaque */}
          <div className="mb-6 sm:mb-8">
            <div className="text-gray-300 text-xs sm:text-sm font-medium tracking-wider uppercase mb-2">
              {aboutConfig.title}
            </div>
            <div className="w-full h-px bg-gray-200"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-4 sm:space-y-6">
              {aboutConfig.paragraphs.map((paragraph, index) => (
                <p key={index} className="text-gray-600 text-sm sm:text-base">
                  {paragraph}
                </p>
              ))}

              <div className="grid grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
                <div className="bg-gray-50 p-4 sm:p-6 rounded-xl">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
                    {aboutConfig.yearsOfExperience}+
                  </div>
                  <div className="text-gray-600 text-sm sm:text-base">
                    Anos de experiência
                  </div>
                </div>
                <div className="bg-gray-50 p-4 sm:p-6 rounded-xl">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
                    {aboutConfig.completedProjects}+
                  </div>
                  <div className="text-gray-600 text-sm sm:text-base">
                    Projetos realizados
                  </div>
                </div>
              </div>
            </div>

            <div className="relative h-[300px] sm:h-[400px] rounded-2xl overflow-hidden">
              {aboutConfig.image ? (
                <img
                  src={aboutConfig.image}
                  alt="Sobre nós"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <ImageIcon size={48} className="text-gray-400" />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section id="team" className="space-y-8 sm:space-y-12 mb-16 sm:mb-20">
          {/* Section Title - Opaque */}
          <div className="mb-6 sm:mb-8">
            <div className="text-gray-300 text-xs sm:text-sm font-medium tracking-wider uppercase mb-2">
              {sectionNames.team}
            </div>
            <div className="w-full h-px bg-gray-200"></div>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              {teamConfig.title}
            </h2>
            <p className="text-gray-600 mb-8 sm:mb-12 text-base sm:text-lg">
              {teamConfig.description}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="text-center bg-gray-50 rounded-xl p-6 sm:p-8"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 flex items-center justify-center rounded-full overflow-hidden">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-full h-full bg-gradient-to-br ${member.bgColor} flex items-center justify-center`}
                      >
                        <span className="text-2xl sm:text-3xl font-bold text-white">
                          {member.initials}
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-blue-600 font-medium mb-3 sm:mb-4 text-sm sm:text-base">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    {member.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );

  const renderNavigation = () => (
    <div
      className={`fixed left-0 top-0 h-full w-64 bg-gray-50 border-r border-gray-200 z-30 transition-all duration-1000 transform ${
        isHeaderCompact ? "translate-x-0" : "-translate-x-full"
      } hidden lg:block`}
    >
      <div className="pt-20 px-6">
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <div key={item.id} className="relative">
                <button
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    isActive
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4" />}
                </button>

                {/* Botão de configuração - só aparece quando a seção está ativa */}
                {isActive && item.configurable && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenSectionConfig(item.id);
                      }}
                      className="w-6 h-6 bg-white rounded-full shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
                      title="Configurações"
                    >
                      <Settings className="w-3 h-3 text-gray-500" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Botão de fechar - só mostra se showCloseButton for true */}
      {showCloseButton && (
        <button
          onClick={handleBack}
          className="fixed top-4 right-4 z-50 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all duration-300"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
        </button>
      )}

      {renderHeader()}
      {renderNavigation()}
      {renderMainContent()}

      {/* Modais de Configuração das Seções */}
      {showSectionConfig && (
        <>
          {/* Backdrop com opacidade para desfocar o fundo */}
          <div className="fixed inset-0 bg-black bg-opacity-20 z-30"></div>

          {/* Modal dropdown no canto superior direito */}
          <div
            className={`fixed top-16 right-2 sm:right-6 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 ${
              showSectionConfig === "deliverables" ||
              showSectionConfig === "phases" ||
              showSectionConfig === "investment" ||
              showSectionConfig === "about" ||
              showSectionConfig === "team"
                ? "w-[calc(100vw-1rem)] sm:w-96 max-h-[80vh]"
                : "w-[calc(100vw-1rem)] sm:w-80 max-h-[70vh]"
            } overflow-hidden flex flex-col`}
            data-modal="section-config"
          >
            {/* Header com seta */}
            <div className="relative">
              {/* Seta apontando para cima - só mostra em desktop */}
              <div className="absolute -top-2 right-6 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45 hidden sm:block"></div>

              {/* Header do modal */}
              <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-gray-500" />
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                    Editar sessão
                  </h3>
                </div>
                <button
                  onClick={handleCancelSectionConfig}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Conteúdo do modal */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
              {/* Editar nome da sessão */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Editar sessão
                </h4>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">
                    Nome da sessão
                  </label>
                  <input
                    type="text"
                    value={tempSectionName}
                    onChange={(e) => setTempSectionName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nome da sessão"
                  />
                </div>
              </div>

              {/* Conteúdo específico por seção */}
              {showSectionConfig === "deliverables" ? (
                /* Modal específico para entregáveis */
                <>
                  {/* Editar conteúdo do título e descrição */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Editar conteúdo
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                          Título
                        </label>
                        <input
                          type="text"
                          value={tempDeliverablesConfig.title}
                          onChange={(e) =>
                            setTempDeliverablesConfig((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Título da seção"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                          Descrição
                        </label>
                        <textarea
                          value={tempDeliverablesConfig.description}
                          onChange={(e) =>
                            setTempDeliverablesConfig((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Descrição da seção"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Lista dos entregáveis com drag and drop */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900">
                        {sectionNames.deliverables}
                      </h4>
                      <button
                        onClick={handleAddDeliverable}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                      >
                        + Adicionar
                      </button>
                    </div>

                    <div className="space-y-2">
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={tempDeliverables.map((d) => d.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {tempDeliverables.map((deliverable) => (
                            <SortableDeliverable
                              key={deliverable.id}
                              id={deliverable.id}
                              title={deliverable.title}
                              description={deliverable.description}
                              onEdit={handleEditDeliverable}
                              onRemove={handleRemoveDeliverable}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>
                    </div>
                  </div>
                </>
              ) : showSectionConfig === "phases" ? (
                /* Modal específico para fases */
                <>
                  {/* Editar conteúdo do título e descrição */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Editar conteúdo
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                          Título
                        </label>
                        <input
                          type="text"
                          value={tempPhasesConfig.title}
                          onChange={(e) =>
                            setTempPhasesConfig((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Título da seção"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                          Descrição
                        </label>
                        <textarea
                          value={tempPhasesConfig.description}
                          onChange={(e) =>
                            setTempPhasesConfig((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Descrição da seção"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Lista das fases com drag and drop */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900">
                        Fases/Etapas
                      </h4>
                      <button
                        onClick={handleAddPhase}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                      >
                        + Adicionar
                      </button>
                    </div>

                    <div className="space-y-2">
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handlePhasesDragEnd}
                      >
                        <SortableContext
                          items={tempPhases.map((p) => p.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {tempPhases.map((phase, index) => (
                            <SortablePhase
                              key={phase.id}
                              id={phase.id}
                              title={phase.title}
                              content={phase.content}
                              phaseNumber={index + 1}
                              onEdit={handleEditPhase}
                              onRemove={handleRemovePhase}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>
                    </div>
                  </div>
                </>
              ) : showSectionConfig === "investment" ? (
                /* Modal específico para investimento */
                <>
                  {/* Editar conteúdo do título e descrição */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Editar conteúdo
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                          Título
                        </label>
                        <input
                          type="text"
                          value={tempInvestmentConfig.title}
                          onChange={(e) =>
                            setTempInvestmentConfig((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Título da seção"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                          Parágrafo
                        </label>
                        <textarea
                          value={tempInvestmentConfig.description}
                          onChange={(e) =>
                            setTempInvestmentConfig((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Descrição da seção"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Editar proposta */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Editar proposta
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                          Título
                        </label>
                        <input
                          type="text"
                          value={tempInvestment.title}
                          onChange={(e) =>
                            setTempInvestment((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Título da proposta"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                          Texto
                        </label>
                        <input
                          type="text"
                          value={tempInvestment.value}
                          onChange={(e) =>
                            setTempInvestment((prev) => ({
                              ...prev,
                              value: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Valor do investimento"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Lista dos itens do investimento com drag and drop */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900">
                        Itens da proposta
                      </h4>
                      <button
                        onClick={handleAddInvestmentItem}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                      >
                        + Adicionar
                      </button>
                    </div>

                    <div className="space-y-2">
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleInvestmentDragEnd}
                      >
                        <SortableContext
                          items={tempInvestment.items.map((item) => item.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {tempInvestment.items.map((item, index) => (
                            <SortableInvestmentItem
                              key={item.id}
                              id={item.id}
                              text={item.text}
                              itemNumber={index + 1}
                              onEdit={handleEditInvestmentItem}
                              onRemove={handleRemoveInvestmentItem}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>
                    </div>
                  </div>
                </>
              ) : showSectionConfig === "about" ? (
                /* Modal específico para sobre nós */
                <>
                  {/* Editar conteúdo */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Editar conteúdo
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                          Título
                        </label>
                        <textarea
                          value={tempAboutConfig.title}
                          onChange={(e) =>
                            setTempAboutConfig((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Título da seção"
                          rows={2}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                          Anos de experiência
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={tempAboutConfig.yearsOfExperience}
                          onChange={(e) =>
                            handleYearsOfExperienceChange(e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Ex: 10"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                          Projetos realizados
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={tempAboutConfig.completedProjects}
                          onChange={(e) =>
                            handleCompletedProjectsChange(e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Ex: 150"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                          Parágrafo
                        </label>
                        <textarea
                          value={tempAboutConfig.paragraphs[0]}
                          onChange={(e) =>
                            handleAboutParagraphChange(0, e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Primeiro parágrafo"
                          rows={3}
                        />
                      </div>
                      <div>
                        <textarea
                          value={tempAboutConfig.paragraphs[1]}
                          onChange={(e) =>
                            handleAboutParagraphChange(1, e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Segundo parágrafo"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Upload de imagem */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">
                      Upload imagem
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAboutImageUpload}
                        className="hidden"
                        id="about-image-upload"
                      />
                      <label
                        htmlFor="about-image-upload"
                        className="cursor-pointer flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        Upload imagem
                      </label>
                      {tempAboutConfig.image && (
                        <div className="mt-3">
                          <img
                            src={tempAboutConfig.image}
                            alt="Preview"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Arquivar sessão */}
                  <div className="pt-2 border-t border-gray-100">
                    <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
                      <Download className="w-4 h-4" />
                      Arquivar sessão
                    </button>
                  </div>
                </>
              ) : showSectionConfig === "team" ? (
                /* Modal específico para equipe */
                <>
                  {/* Editar conteúdo */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Editar conteúdo
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                          Título
                        </label>
                        <input
                          type="text"
                          value={tempTeamConfig.title}
                          onChange={(e) =>
                            setTempTeamConfig((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Título da seção"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                          Parágrafo
                        </label>
                        <textarea
                          value={tempTeamConfig.description}
                          onChange={(e) =>
                            setTempTeamConfig((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Descrição da seção"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Lista dos membros da equipe com drag and drop */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900">
                        Membros da equipe
                      </h4>
                      <button
                        onClick={handleAddTeamMember}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                      >
                        + Adicionar
                      </button>
                    </div>

                    <div className="space-y-2">
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleTeamDragEnd}
                      >
                        <SortableContext
                          items={tempTeamMembers.map((member) => member.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {tempTeamMembers.map((member, index) => (
                            <SortableTeamMember
                              key={member.id}
                              id={member.id}
                              name={member.name}
                              role={member.role}
                              description={member.description}
                              image={member.image}
                              memberNumber={index + 1}
                              onEdit={handleEditTeamMember}
                              onRemove={handleRemoveTeamMember}
                              onImageUpload={handleTeamMemberImageUpload}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>
                    </div>
                  </div>
                </>
              ) : (
                /* Modal genérico para outras seções */
                <>
                  {/* Editar conteúdo */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Editar conteúdo
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                          Título
                        </label>
                        <input
                          type="text"
                          defaultValue="Proposta Comercial: Sérgio Pereira"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Título"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                          Parágrafo
                        </label>
                        <input
                          type="text"
                          defaultValue="Preparado por: Estúdio Meza"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Parágrafo"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Arquivar sessão */}
                  <div className="pt-2 border-t border-gray-100">
                    <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
                      <Download className="w-4 h-4" />
                      Arquivar sessão
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Footer do modal - fixo na parte inferior */}
            <div className="flex gap-2 p-3 sm:p-4 border-t border-gray-200 bg-white rounded-b-2xl">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleCancelSectionConfig}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSaveSectionConfig}
              >
                Salvar
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
