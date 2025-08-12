"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

// Importar os previews específicos
import BudgetCompletePreview from "@/components/orcamentos/previews/BudgetCompletePreview";
import BudgetM2Preview from "@/components/orcamentos/previews/BudgetM2Preview";
import BudgetRenderPreview from "@/components/orcamentos/previews/BudgetRenderPreview";
import BudgetModelingPreview from "@/components/orcamentos/previews/BudgetModelingPreview";

// Importar componentes compartilhados
import PreviewHeader from "@/components/orcamentos/previews/shared/PreviewHeader";
import ConfigModal from "@/components/orcamentos/previews/shared/ConfigModal";

interface BudgetPreviewData {
  budgetId: string;
  projectName: string;
  clientName: string;
  projectDescription: string;
  totalValue: number;
  tipoOrcamento?: "complete" | "m2" | "render" | "modeling";
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
}

interface ConfigData {
  title: string;
  subtitle: string;
  headerImage?: string;
}

export default function OrcamentoPreviewPage() {
  const [budgetData, setBudgetData] = useState<BudgetPreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [configData, setConfigData] = useState<ConfigData>({
    title: "",
    subtitle: "",
    headerImage: undefined,
  });
  const [tempConfigData, setTempConfigData] = useState<ConfigData>({
    title: "",
    subtitle: "",
    headerImage: undefined,
  });
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Configurações das seções (mantidas para compatibilidade)
  const [deliverablesConfig, setDeliverablesConfig] = useState({
    title: "O que está incluso",
    description: "Confira abaixo tudo o que está incluso neste projeto:",
  });

  const [deliverables, setDeliverables] = useState([
    {
      id: "1",
      title: "Plantas técnicas detalhadas",
      description:
        "Plantas baixas, cortes e elevações com todas as medidas e especificações.",
    },
    {
      id: "2",
      title: "Projeto elétrico",
      description: "Distribuição de pontos de luz, tomadas e interruptores.",
    },
    {
      id: "3",
      title: "Projeto hidráulico",
      description:
        "Distribuição de pontos de água, esgoto e posicionamento de louças.",
    },
  ]);

  const [phasesConfig, setPhasesConfig] = useState({
    title: "Fases do Projeto",
    description:
      "Para garantir um projeto fluido e bem estruturado, dividimos o trabalho em 4 etapas principais:",
  });

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

  const [investmentConfig, setInvestmentConfig] = useState({
    title: "Investimento do projeto",
    description:
      "Você encontrará abaixo o valor total do projeto, com possibilidade de parcelamento. Este investimento contempla todas as etapas, entregáveis e suporte descritos.",
  });

  const [investment, setInvestment] = useState({
    title: "Projeto Completo",
    value: "R$ 0,00",
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

  const [aboutConfig, setAboutConfig] = useState({
    title: "Sobre nós",
    paragraphs: [
      "Somos um estúdio de arquitetura e design comprometido em transformar sonhos em realidade através de projetos únicos e personalizados.",
      "Nossa abordagem combina criatividade, funcionalidade e sustentabilidade para criar espaços que verdadeiramente refletem a personalidade e necessidades de nossos clientes.",
    ],
    image: null as string | null,
    yearsOfExperience: 10,
    completedProjects: 150,
  });

  const [teamConfig, setTeamConfig] = useState({
    title: "Nossa equipe",
    description:
      "Conheça os profissionais que estarão envolvidos no seu projeto:",
  });

  const [teamMembers, setTeamMembers] = useState([
    {
      id: "1",
      name: "Ana Silva",
      role: "Arquiteta Chefe",
      description:
        "Especialista em design de interiores com mais de 10 anos de experiência.",
      image: null as string | null,
      initials: "AS",
      bgColor: "from-blue-500 to-blue-600",
    },
  ]);

  useEffect(() => {
    // Buscar dados do localStorage
    try {
      const savedData = localStorage.getItem("budgetPreviewData");
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setBudgetData(parsedData);

        // Configurar título e subtítulo padrão baseado nos dados
        setConfigData({
          title: `Proposta Comercial: ${parsedData.projectName}`,
          subtitle: "Preparado por: Estúdio Meza",
          headerImage: undefined,
        });
        setTempConfigData({
          title: `Proposta Comercial: ${parsedData.projectName}`,
          subtitle: "Preparado por: Estúdio Meza",
          headerImage: undefined,
        });
      } else {
        // Dados mock como fallback
        const mockData = {
          budgetId: "mock-id",
          projectName: "Projeto Residencial",
          clientName: "Cliente Exemplo",
          projectDescription: "Descrição do projeto exemplo",
          totalValue: 0,
          tipoOrcamento: "complete" as const,
          items: [],
          tipoAmbiente: "interior" as const,
          valorComodos: "unico" as const,
        };
        setBudgetData(mockData);
        setConfigData({
          title: `Proposta Comercial: ${mockData.projectName}`,
          subtitle: "Preparado por: Estúdio Meza",
          headerImage: undefined,
        });
      }
    } catch (error) {
      console.error("Erro ao carregar dados do localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Função para renderizar o preview correto baseado no tipo de orçamento
  const renderPreview = () => {
    if (!budgetData) return null;

    const previewProps = {
      budgetData,
      configData,
    };

    switch (budgetData.tipoOrcamento) {
      case "m2":
        return <BudgetM2Preview {...previewProps} />;
      case "render":
        return <BudgetRenderPreview {...previewProps} />;
      case "modeling":
        return <BudgetModelingPreview {...previewProps} />;
      case "complete":
      default:
        return <BudgetCompletePreview {...previewProps} />;
    }
  };

  const handlePublish = async () => {
    if (!budgetData) {
      toast.error("Dados do orçamento não encontrados");
      return;
    }

    setIsPublishing(true);

    try {
      // Preparar dados completos para publicação incluindo todas as configurações
      const publishData = {
        previewData: budgetData,
        configData: configData,
        sectionConfigurations: {
          deliverables: {
            title: deliverablesConfig.title,
            description: deliverablesConfig.description,
            items: deliverables,
          },
          phases: {
            title: phasesConfig.title,
            description: phasesConfig.description,
            items: phases,
          },
          investment: {
            title: investmentConfig.title,
            description: investmentConfig.description,
            value: investment.value,
            items: investment.items,
          },
          about: {
            title: aboutConfig.title,
            paragraphs: aboutConfig.paragraphs,
            image: aboutConfig.image,
          },
          team: {
            title: teamConfig.title,
            description: teamConfig.description,
            members: teamMembers,
          },
        },
      };

      console.log("Dados de publicação:", publishData);

      const response = await fetch("/api/budgets/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(publishData),
      });

      const result = await response.json();
      console.log("Resposta da API:", result);

      if (response.ok && result.success) {
        toast.success("Orçamento publicado com sucesso!");

        // Limpar dados do localStorage
        localStorage.removeItem("budgetPreviewData");

        // Redirecionar para a versão publicada
        window.open(result.publicUrl, "_blank");
      } else {
        toast.error(result.error || "Erro ao publicar orçamento");
      }
    } catch (error) {
      console.error("Erro ao publicar:", error);
      toast.error("Erro ao publicar orçamento");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleOpenConfig = () => {
    setTempConfigData(configData); // Sincronizar dados temporários
    setShowConfigModal(true);
  };

  const handleSaveConfig = () => {
    setConfigData(tempConfigData); // Aplicar mudanças
    toast.success("Configurações salvas!");
    setShowConfigModal(false);
  };

  const handleCancelConfig = () => {
    setTempConfigData(configData); // Reverter mudanças
    setShowConfigModal(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // TODO: Implementar upload de imagem
      const imageUrl = URL.createObjectURL(file);
      setTempConfigData((prev) => ({
        ...prev,
        headerImage: imageUrl,
      }));
      toast.success("Imagem carregada!");
    }
  };

  const handleTitleChange = (value: string) => {
    setTempConfigData((prev) => ({
      ...prev,
      title: value,
    }));
  };

  const handleSubtitleChange = (value: string) => {
    setTempConfigData((prev) => ({
      ...prev,
      subtitle: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando preview...</p>
        </div>
      </div>
    );
  }

  if (!budgetData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Erro no Preview
          </h1>
          <p className="text-gray-600">
            Não foi possível carregar os dados do orçamento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header fixo no topo */}
      <PreviewHeader
        configData={configData}
        isPublishing={isPublishing}
        onPublish={handlePublish}
        onOpenConfig={handleOpenConfig}
      />

      {/* Conteúdo principal com margem para o header */}
      <div className="pt-16 sm:pt-20">{renderPreview()}</div>

      {/* Modal de Configurações */}
      <ConfigModal
        isOpen={showConfigModal}
        configData={configData}
        tempConfigData={tempConfigData}
        onSave={handleSaveConfig}
        onCancel={handleCancelConfig}
        onImageUpload={handleImageUpload}
        onTitleChange={handleTitleChange}
        onSubtitleChange={handleSubtitleChange}
      />
    </>
  );
}
