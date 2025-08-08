"use client";

import { useEffect, useState } from "react";
import BudgetLandingPage from "@/components/landing/PreviewBudgetLandingPage";
import { Button } from "@/components/ui/button";
import {
  Play,
  Upload,
  Settings,
  Edit3,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface BudgetPreviewData {
  budgetId: string;
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
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Logo e título */}
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 flex items-center justify-center">
              <Image
                src="/short_logo.png"
                alt="Limify Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">
                {configData.title}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Edit3 className="w-3 h-3" />
                <span>Editar proposta</span>
              </div>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Play className="w-4 h-4 mr-2" />
              Prévia
            </Button>

            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handlePublish}
              disabled={isPublishing}
            >
              {isPublishing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Publicando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Publicar
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
              onClick={handleOpenConfig}
            >
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal com margem para o header */}
      <div className="pt-16">
        <BudgetLandingPage
          budgetData={budgetData}
          configData={configData}
          showCloseButton={false}
        />
      </div>

      {/* Modal de Configurações */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={handleCancelConfig}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full">
            {/* Header do modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Configurações</h2>
              <button
                onClick={handleCancelConfig}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo do modal */}
            <div className="p-6 space-y-6">
              {/* Editar proposta */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Editar proposta
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={tempConfigData.title}
                      onChange={(e) =>
                        setTempConfigData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Proposta Comercial: Sérgio Pereira"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parágrafo
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={tempConfigData.subtitle}
                      onChange={(e) =>
                        setTempConfigData((prev) => ({
                          ...prev,
                          subtitle: e.target.value,
                        }))
                      }
                      placeholder="Preparado por: Estúdio Meza"
                    />
                  </div>

                  {/* Upload de imagem */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload imagem
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium text-blue-600">
                            Clique para fazer upload
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG até 10MB
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer do modal */}
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCancelConfig}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSaveConfig}
              >
                Salvar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
