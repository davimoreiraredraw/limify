"use client";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/app/lib/expenses";
import {
  Check,
  ChevronRight,
  Settings,
  Eye,
  Download,
  Share2,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
  onBack?: () => void;
  onPublish?: () => void;
}

export default function BudgetLandingPage({
  budgetData,
  onBack,
  onPublish,
}: BudgetLandingPageProps) {
  const [activeSection, setActiveSection] = useState("overview");
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const router = useRouter();

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

  const navigationItems = [
    { id: "overview", label: "Visão Geral", icon: Eye },
    { id: "deliverables", label: "Entregáveis", icon: Download },
    { id: "phases", label: "Fases do Projeto", icon: Settings },
    { id: "investment", label: "Investimento", icon: Settings },
    { id: "about", label: "Sobre nós", icon: Settings },
    { id: "team", label: "Equipe", icon: Settings },
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

  const renderHeader = () => (
    <div
      className={`relative bg-cover bg-center bg-no-repeat overflow-hidden transition-all duration-1000 ease-in-out ${
        isHeaderCompact ? "h-32" : "h-screen"
      }`}
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80')",
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
                    ? "text-2xl lg:text-3xl"
                    : "text-4xl lg:text-6xl"
                }`}
              >
                Proposta Comercial: {budgetData.clientName}
              </h1>
              <p
                className={`text-gray-200 transition-all duration-1000 ${
                  isHeaderCompact
                    ? "text-sm lg:text-base"
                    : "text-xl lg:text-2xl"
                }`}
              >
                Preparado por: Estúdio Meza
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
        isHeaderCompact ? "ml-64" : "ml-0"
      }`}
    >
      <div className="max-w-4xl mx-auto p-8 lg:p-12">
        {/* Overview Section */}
        <section id="overview" className="space-y-12 mb-20">
          {/* Section Title - Opaque */}
          <div className="mb-8">
            <div className="text-gray-300 text-sm font-medium tracking-wider uppercase mb-2">
              Visão Geral
            </div>
            <div className="w-full h-px bg-gray-200"></div>
          </div>

          {/* Welcome Section */}
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Bem-vindo à sua nova casa, {budgetData.clientName}!
            </h2>
            <div className="text-gray-600 space-y-4 text-lg leading-relaxed">
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
        <section id="deliverables" className="space-y-12 mb-20">
          {/* Section Title - Opaque */}
          <div className="mb-8">
            <div className="text-gray-300 text-sm font-medium tracking-wider uppercase mb-2">
              Entregáveis
            </div>
            <div className="w-full h-px bg-gray-200"></div>
          </div>

          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              O que está incluso no seu projeto
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Aqui está um panorama completo do que será desenvolvido para sua
              residência:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <Check className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700 text-lg">
                    Planta de layout funcional
                  </span>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <Check className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700 text-lg">
                    Moodboard com materiais, acabamentos e paleta de cores
                  </span>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <Check className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700 text-lg">
                    Projeto luminotécnico, elétrica e hidráulico
                  </span>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <Check className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700 text-lg">
                    Acompanhamento técnico sob demanda
                  </span>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <Check className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700 text-lg">
                    Modelagem 3D com imagens renderizadas
                  </span>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <Check className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700 text-lg">
                    Book técnico com cortes, elevações e pranchas executivas
                  </span>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <Check className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700 text-lg">
                    Caderno de marcenaria e mobiliário
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Phases Section */}
        <section id="phases" className="space-y-12 mb-20">
          {/* Section Title - Opaque */}
          <div className="mb-8">
            <div className="text-gray-300 text-sm font-medium tracking-wider uppercase mb-2">
              Fases do Projeto
            </div>
            <div className="w-full h-px bg-gray-200"></div>
          </div>

          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Fases do Projeto
            </h2>
            <p className="text-gray-600 mb-12 text-lg">
              Para garantir um projeto fluido e bem estruturado, dividimos o
              trabalho em 4 etapas principais:
            </p>
            <div className="relative">
              <div className="space-y-16">
                <div className="flex items-start gap-8 relative">
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0 z-10 relative"></div>
                    <div className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-sm font-medium">
                      Fase 1
                    </div>
                  </div>
                  <div className="flex-1 pt-0">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      Briefing
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      Coleta aprofundada de informações, preferências, estilo de
                      vida, materiais desejados e referências visuais.
                    </p>
                  </div>
                  {/* Linha conectando para próxima fase - conecta até a próxima bolinha */}
                  <div
                    className="absolute left-2 top-2 w-px bg-gray-300 z-0"
                    style={{ height: "calc(4rem + 8px)" }}
                  ></div>
                </div>

                <div className="flex items-start gap-8 relative">
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0 z-10 relative"></div>
                    <div className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-sm font-medium">
                      Fase 2
                    </div>
                  </div>
                  <div className="flex-1 pt-0">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      Estudo Preliminar
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      Proposta inicial de layout e moodboard com texturas,
                      cores, referências e elementos visuais do projeto.
                    </p>
                  </div>
                  {/* Linha conectando para próxima fase - conecta até a próxima bolinha */}
                  <div
                    className="absolute left-2 top-2 w-px bg-gray-300 z-0"
                    style={{ height: "calc(4rem + 8px)" }}
                  ></div>
                </div>

                <div className="flex items-start gap-8 relative">
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0 z-10 relative"></div>
                    <div className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-sm font-medium">
                      Fase 3
                    </div>
                  </div>
                  <div className="flex-1 pt-0">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      Anteprojeto
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      Modelagem 3D, vistas renderizadas dos ambientes e ajustes
                      finos com base no seu feedback.
                    </p>
                  </div>
                  {/* Linha conectando para próxima fase - conecta até a próxima bolinha */}
                  <div
                    className="absolute left-2 top-2 w-px bg-gray-300 z-0"
                    style={{ height: "calc(4rem + 8px)" }}
                  ></div>
                </div>

                <div className="flex items-start gap-8">
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0 z-10 relative"></div>
                    <div className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-sm font-medium">
                      Fase 4
                    </div>
                  </div>
                  <div className="flex-1 pt-0">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      Projeto Executivo
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      Documentação completa para obra: plantas técnicas,
                      detalhamentos, memorial descritivo e compatibilizações.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Investment Section */}
        <section id="investment" className="space-y-12 mb-20">
          {/* Section Title - Opaque */}
          <div className="mb-8">
            <div className="text-gray-300 text-sm font-medium tracking-wider uppercase mb-2">
              Investimento
            </div>
            <div className="w-full h-px bg-gray-200"></div>
          </div>

          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Investimento do projeto
            </h2>
            <p className="text-gray-600 mb-12 text-lg">
              Você encontrará abaixo o valor total do projeto, com possibilidade
              de parcelamento. Este investimento contempla todas as etapas,
              entregáveis e suporte descritos.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-bold text-lg">
                      R$
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Valor total do contrato
                    </h3>
                    <p className="text-2xl font-bold text-gray-900 mb-1">
                      {formatCurrency(calculateTotalBudget())}
                    </p>
                    <p className="text-gray-500 text-sm">(valor estimado)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-purple-600"
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
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Assinatura do contrato
                    </h3>
                    <p className="text-gray-600">
                      Assinatura do contrato (50% do valor) – dá início ao
                      projeto.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-purple-600"
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
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Entrega do projeto executivo
                    </h3>
                    <p className="text-gray-600">
                      Entrega final (50%) – na entrega do executivo.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Projeto Completo
                </h3>
                <div className="text-4xl font-bold text-gray-900 mb-8 text-center">
                  {formatCurrency(calculateTotalBudget())}
                </div>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700">Todos os entregáveis</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700">
                      Todas as fases do projeto
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700">Renderizações 3D</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700">
                      Suporte durante desenvolvimento
                    </span>
                  </div>
                </div>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 text-lg rounded-xl"
                  onClick={handlePublish}
                >
                  Aprovar Proposta
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="space-y-12 mb-20">
          {/* Section Title - Opaque */}
          <div className="mb-8">
            <div className="text-gray-300 text-sm font-medium tracking-wider uppercase mb-2">
              Sobre nós
            </div>
            <div className="w-full h-px bg-gray-200"></div>
          </div>

          <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Um escritório apaixonado por arquitetura afetiva, funcional e
                  atemporal.
                </h2>
                <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
                  <p>
                    Acreditamos que cada casa deve refletir a essência de quem a
                    habita. Nossa abordagem vai além da estética, focando na
                    funcionalidade, no bem-estar e na experiência de viver em
                    cada espaço que projetamos.
                  </p>
                  <p>
                    Com processos bem definidos, tecnologia de ponta e toque
                    humano, criamos ambientes que não apenas impressionam
                    visualmente, mas que também proporcionam conforto e
                    praticidade para o dia a dia.
                  </p>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      500+
                    </div>
                    <p className="text-gray-600">Projetos realizados</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      15+
                    </div>
                    <p className="text-gray-600">Anos de experiência</p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2001&q=80"
                  alt="Modern living room"
                  className="w-full h-96 object-cover rounded-xl shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section id="team" className="space-y-12 mb-20">
          {/* Section Title - Opaque */}
          <div className="mb-8">
            <div className="text-gray-300 text-sm font-medium tracking-wider uppercase mb-2">
              Equipe
            </div>
            <div className="w-full h-px bg-gray-200"></div>
          </div>

          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Nossa equipe
            </h2>
            <p className="text-gray-600 mb-12 text-lg">
              Conheça os profissionais que estarão envolvidos no seu projeto:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center bg-gray-50 rounded-xl p-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">LM</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Laura Menezes
                </h3>
                <p className="text-blue-600 font-medium mb-4">
                  Arquiteta Responsável
                </p>
                <p className="text-gray-600 text-sm">
                  Formada pela USP, especialista em projetos residenciais de
                  alto padrão com mais de 10 anos de experiência.
                </p>
              </div>
              <div className="text-center bg-gray-50 rounded-xl p-8">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">CV</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Carlos Vieira
                </h3>
                <p className="text-green-600 font-medium mb-4">
                  Especialista em 3D
                </p>
                <p className="text-gray-600 text-sm">
                  Expert em modelagem 3D e renderização, responsável por criar
                  as visualizações fotorrealísticas dos projetos.
                </p>
              </div>
              <div className="text-center bg-gray-50 rounded-xl p-8">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">RF</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Renata Franco
                </h3>
                <p className="text-purple-600 font-medium mb-4">
                  Documentação Técnica
                </p>
                <p className="text-gray-600 text-sm">
                  Responsável por toda a documentação técnica e detalhamento
                  executivo dos projetos.
                </p>
              </div>
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
      }`}
    >
      <div className="pt-8 px-6">
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeSection === item.id
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
                {activeSection === item.id && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Botão de fechar */}
      <button
        onClick={handleBack}
        className="fixed top-4 right-4 z-50 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all duration-300"
      >
        <X className="w-5 h-5 text-gray-600" />
      </button>

      {renderHeader()}
      {renderNavigation()}
      {renderMainContent()}
    </div>
  );
}
