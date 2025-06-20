"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Send,
  Sparkles,
  Calendar,
  Clock,
  Home,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import { Charts } from "./components/Charts";

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  isStreaming?: boolean;
}

interface ProjectTypes {
  name: string;
  percentage: number;
  color: string;
}

export default function InsightsPage() {
  const [activeView, setActiveView] = useState<"insights" | "reports">(
    "insights"
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tokens, setTokens] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const suggestedQuestions = [
    "Quais materiais estao em alta?",
    "Quanto custa um projeto de 150m2?",
    "Qual tipo de orçamento é mais barato na arquitetura ?",
  ];

  const projectTypes: ProjectTypes[] = [
    { name: "Interiores", percentage: 20, color: "#6E2DFA" },
    { name: "Render", percentage: 40, color: "#7DD8B5" },
    { name: "Exterior", percentage: 37, color: "#7EB7E8" },
    { name: "Obras", percentage: 3, color: "#98E362" },
  ];

  const monthlyRevenue = [
    { month: "Fev", value: 12000 },
    { month: "Mar", value: 14000 },
    { month: "Abr", value: 11000 },
    { month: "Mai", value: 17000 },
    { month: "Jun", value: 15000 },
    { month: "Jul", value: 13500 },
    { month: "Ago", value: 19000 },
    { month: "Set", value: 16000 },
    { month: "Out", value: 18000 },
    { month: "Nov", value: 19500 },
    { month: "Dez", value: 26000 },
  ];

  const handleSubmit = async () => {
    if (!inputRef.current || !inputRef.current.value.trim() || isLoading)
      return;

    const trimmedContent = inputRef.current.value.trim();
    setIsLoading(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      content: trimmedContent,
      sender: "user",
      timestamp: new Date(),
    };

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: "",
      sender: "assistant",
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    if (inputRef.current) {
      inputRef.current.value = "";
    }

    try {
      const messageHistory = [...messages, userMessage].map((msg) => ({
        role: msg.sender,
        content: msg.content,
      }));

      const response = await fetch("http://localhost:3003/api/openai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedContent,
          history: messageHistory,
        }),
      });

      if (!response.ok) {
        throw new Error("Falha ao obter resposta do chatbot");
      }

      const data = await response.json();

      // Atualiza a mensagem do assistente com a resposta
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? { ...msg, content: data.content, isStreaming: false }
            : msg
        )
      );

      if (data.tokens) {
        setTokens(data.tokens);
      }
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.",
        sender: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) =>
        prev
          .filter((msg) => msg.id !== assistantMessage.id)
          .concat(errorMessage)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    if (inputRef.current) {
      inputRef.current.value = question;
      handleSubmit();
    }
  };

  const ReportsView = () => (
    <div className="bg-[#F8F9FC] min-h-full">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 bg-white rounded-lg border px-4 py-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>09 Feb 2024</span>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-4 gap-4">
          {/* Orçamentos em aberto */}
          <div className="bg-white rounded-lg p-4 space-y-2 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="p-2 bg-[#FFF5F5] rounded-lg">
                <Clock className="w-5 h-5 text-[#FF4747]" />
              </div>
              <span className="text-[#FF4747] text-sm">↓ 0.65%</span>
            </div>
            <h3 className="text-gray-500">Orçamentos em aberto</h3>
            <p className="text-3xl font-semibold">14</p>
          </div>

          {/* Taxa de aprovação */}
          <div className="bg-white rounded-lg p-4 space-y-2 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="p-2 bg-[#F0FFF4] rounded-lg">
                <Home className="w-5 h-5 text-[#31D07C]" />
              </div>
              <span className="text-[#31D07C] text-sm">↑ 2.29%</span>
            </div>
            <h3 className="text-gray-500">Taxa de aprovação</h3>
            <p className="text-3xl font-semibold">78%</p>
          </div>

          {/* Média e faturamento */}
          <div className="bg-white rounded-lg p-4 space-y-2 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="p-2 bg-[#F0FFF4] rounded-lg">
                <Clock className="w-5 h-5 text-[#31D07C]" />
              </div>
              <span className="text-[#31D07C] text-sm">↑ 2.29%</span>
            </div>
            <h3 className="text-gray-500">Média e faturamento</h3>
            <p className="text-3xl font-semibold">R$ 42.500</p>
          </div>

          {/* Sua aprovação de projeto */}
          <div className="bg-white rounded-lg p-4 space-y-2 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="p-2 bg-[#F0FFF4] rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-[#31D07C]" />
              </div>
              <span className="text-[#31D07C] text-sm">↑ 2.29%</span>
            </div>
            <h3 className="text-gray-500">Sua aprovação de projeto</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-semibold">25%</p>
              <span className="text-sm text-gray-500">este mês</span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="mt-6">
          <Charts projectTypes={projectTypes} monthlyRevenue={monthlyRevenue} />
        </div>

        {/* Bottom Cards */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-lg p-4 space-y-2 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="p-2 bg-[#FFF5F5] rounded-lg">
                <Clock className="w-5 h-5 text-[#FF4747]" />
              </div>
              <span className="text-[#FF4747] text-sm">↓ 0.65%</span>
            </div>
            <h3 className="text-gray-500">Tempo por m²</h3>
            <p className="text-3xl font-semibold">3 h/m²</p>
          </div>

          <div className="bg-white rounded-lg p-4 space-y-2 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="p-2 bg-[#F0FFF4] rounded-lg">
                <Home className="w-5 h-5 text-[#31D07C]" />
              </div>
              <span className="text-[#31D07C] text-sm">↑ 2.29%</span>
            </div>
            <h3 className="text-gray-500">Taxa de aprovação</h3>
            <p className="text-3xl font-semibold">78%</p>
          </div>

          <div className="bg-white rounded-lg p-4 space-y-2 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="p-2 bg-[#F0FFF4] rounded-lg">
                <Clock className="w-5 h-5 text-[#31D07C]" />
              </div>
              <span className="text-[#31D07C] text-sm">↑ 2.29%</span>
            </div>
            <h3 className="text-gray-500">Média e faturamento</h3>
            <p className="text-3xl font-semibold">R$ 42.500</p>
          </div>

          <div className="bg-white rounded-lg p-4 space-y-2 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="p-2 bg-[#F0FFF4] rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-[#31D07C]" />
              </div>
              <span className="text-[#31D07C] text-sm">↑ 2.29%</span>
            </div>
            <h3 className="text-gray-500">Sua aprovação de projeto</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-semibold">25%</p>
              <span className="text-sm text-gray-500">este mês</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ChatView = () => (
    <>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user"
                  ? "justify-end"
                  : "justify-start items-start gap-3"
              }`}
            >
              {message.sender === "assistant" && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-[#6E2DFA] flex items-center justify-center">
                    <Sparkles
                      className={`w-4 h-4 text-white ${
                        message.isStreaming ? "animate-pulse" : ""
                      }`}
                    />
                  </div>
                </div>
              )}
              <div
                className={`rounded-lg p-4 max-w-xl ${
                  message.sender === "user"
                    ? "bg-[#6E2DFA] text-white"
                    : "bg-[#F3F0FF]"
                }`}
              >
                {message.content ||
                  (message.isStreaming && (
                    <div className="flex gap-1">
                      <span className="animate-bounce">.</span>
                      <span className="animate-bounce delay-100">.</span>
                      <span className="animate-bounce delay-200">.</span>
                    </div>
                  ))}
                <div className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
              {message.sender === "user" && (
                <div className="flex-shrink-0 ml-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <Image
                      src="https://ui-avatars.com/api/?name=User&background=6E2DFA&color=fff"
                      alt="User"
                      width={32}
                      height={32}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-6 bg-[#F3F0FF]">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              placeholder={
                isLoading
                  ? "Aguarde a resposta..."
                  : "Pergunte algo sobre seus projetos e orçamentos..."
              }
              className="w-full p-4 pr-12 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6E2DFA] focus:border-transparent"
              disabled={isLoading}
            />
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6E2DFA] disabled:opacity-50"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              <Send className={`w-5 h-5 ${isLoading ? "animate-pulse" : ""}`} />
            </button>
          </div>

          <div className="flex justify-end mt-2">
            <div
              className={`bg-[#6E2DFA] text-white px-4 py-1 rounded-full text-sm flex items-center gap-2 ${
                isLoading ? "animate-pulse" : ""
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Tokens {tokens} / 100
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Sparkles className="w-4 h-4" />
              Perguntas sugeridas
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  className="px-4 py-2 rounded-full border border-[#6E2DFA] text-[#6E2DFA] text-sm hover:bg-[#6E2DFA] hover:text-white transition-colors"
                  onClick={() => handleSuggestedQuestion(question)}
                  disabled={isLoading}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b bg-white">
        <h1 className="text-2xl font-medium text-gray-900">
          {activeView === "insights" ? "Insights" : "Relatórios"}
        </h1>
        <div className="flex gap-4">
          <Button
            variant={activeView === "insights" ? "default" : "ghost"}
            className={
              activeView === "insights"
                ? "bg-[#6E2DFA] hover:bg-[#6E2DFA]/90"
                : ""
            }
            onClick={() => setActiveView("insights")}
          >
            Insights
          </Button>
          <Button
            variant={activeView === "reports" ? "default" : "ghost"}
            className={
              activeView === "reports"
                ? "bg-[#6E2DFA] hover:bg-[#6E2DFA]/90"
                : ""
            }
            onClick={() => setActiveView("reports")}
          >
            Relatórios
          </Button>
        </div>
      </div>

      {activeView === "insights" ? <ChatView /> : <ReportsView />}
    </div>
  );
}
