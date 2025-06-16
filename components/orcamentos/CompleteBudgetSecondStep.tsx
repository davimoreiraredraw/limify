"use client";

import { useState, useEffect, useRef } from "react";

interface CompleteBudgetSecondStepProps {
  selectedBudgetModel: "previous" | "standard";
  setSelectedBudgetModel: (model: "previous" | "standard") => void;
  previousBudgetName: string;
  setPreviousBudgetName: (name: string) => void;
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
}

export default function CompleteBudgetSecondStep({
  selectedBudgetModel,
  setSelectedBudgetModel,
  previousBudgetName,
  setPreviousBudgetName,
  selectedCurrency,
  setSelectedCurrency,
}: CompleteBudgetSecondStepProps) {
  // Lista de moedas disponíveis (pode ser expandida conforme necessário)
  const currencies = ["USD", "BRL", "EUR", "GBP"];

  // Estado para controlar a exibição do dropdown de moedas
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  // Referência para o dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handler para fechar o dropdown quando clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowCurrencyDropdown(false);
      }
    }

    // Adiciona o event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Card principal com fundo gradiente e bola decorativa */}
      <div className="relative bg-gradient-to-br from-white to-indigo-50 rounded-3xl shadow-sm border overflow-hidden mb-12">
        {/* Círculo decorativo azul no canto superior direito */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-600 rounded-full translate-x-1/3 -translate-y-1/3 opacity-80 z-0"></div>

        {/* Conteúdo do card */}
        <div className="relative z-10 p-8 flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              Entenda o orçamento de projeto
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Que legal que você decidiu orçar um projeto, antes de começar,
              quero te passar algumas informações. O orçamento de projeto você
              vai quantificar ele pelas etapas do seu projeto,{" "}
              <span className="font-medium text-indigo-700">
                vamos deixar aqui algumas etapas para você preencher
              </span>
              , mas você também{" "}
              <span className="font-medium text-indigo-700">
                pode criar campos personalizados
              </span>
              após preencher os sugeridos, também, caso não faça sentido, pode
              excluir campos. Os campos adicionados e excluídos ficam salvos
              para o próximo orçamento.
            </p>
          </div>

          {/* Imagem do personagem/mascote */}
          <div className="w-48 h-48 flex-shrink-0">
            {/* Placeholder para a imagem que será substituída posteriormente */}
            <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M9 17v-4" />
                <path d="M12 17v-2" />
                <path d="M15 17v-6" />
                <path d="M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de seleção de modelo de orçamento */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold mb-6">
          Qual modelo de orçamento seguir?
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Opção de orçamento anterior */}
          <div
            className={`border rounded-xl p-6 bg-white cursor-pointer ${
              selectedBudgetModel === "previous" ? "border-indigo-600" : ""
            }`}
            onClick={() => setSelectedBudgetModel("previous")}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-5 h-5 rounded-full border-2 ${
                  selectedBudgetModel === "previous"
                    ? "border-indigo-600"
                    : "border-gray-300"
                } flex items-center justify-center`}
              >
                {selectedBudgetModel === "previous" && (
                  <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                )}
              </div>
              <div>
                <h4 className="font-medium text-lg">Orçamento anterior</h4>
                <p className="text-sm text-gray-500">
                  Utilize templates de orçamentos anteriores
                </p>
              </div>
            </div>

            {selectedBudgetModel === "previous" && (
              <div className="flex gap-3 mt-4">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full px-4 py-2 pl-10 border rounded-md"
                      placeholder="Nome do orçamento"
                      value={previousBudgetName}
                      onChange={(e) => setPreviousBudgetName(e.target.value)}
                    />
                    <div className="absolute inset-y-0 left-3 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-400"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                  </div>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                  Usar
                </button>
              </div>
            )}
          </div>

          {/* Opção de orçamento padrão */}
          <div
            className={`border rounded-xl p-6 bg-white cursor-pointer ${
              selectedBudgetModel === "standard" ? "border-indigo-600" : ""
            }`}
            onClick={() => setSelectedBudgetModel("standard")}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 ${
                  selectedBudgetModel === "standard"
                    ? "border-indigo-600"
                    : "border-gray-300"
                } flex items-center justify-center`}
              >
                {selectedBudgetModel === "standard" && (
                  <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                )}
              </div>
              <div>
                <h4 className="font-medium text-lg">Orçamento padrão</h4>
                <p className="text-sm text-gray-500">
                  Orçamento padrão do limify
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de seleção de moeda */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold mb-6">Qual vai ser a moeda?</h3>

        <div className="relative inline-block" ref={dropdownRef}>
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full flex items-center gap-2"
            onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
          >
            {selectedCurrency}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {/* Dropdown para seleção de moeda */}
          {showCurrencyDropdown && (
            <div className="absolute mt-2 w-full bg-white border rounded-md shadow-lg z-10">
              {currencies.map((currency) => (
                <div
                  key={currency}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                    selectedCurrency === currency
                      ? "bg-indigo-50 text-indigo-600"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedCurrency(currency);
                    setShowCurrencyDropdown(false);
                  }}
                >
                  {currency}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
