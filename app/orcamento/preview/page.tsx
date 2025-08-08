"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import BudgetLandingPage from "@/components/landing/BudgetLandingPage";

interface BudgetPreviewData {
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

export default function OrcamentoPreviewPage() {
  const searchParams = useSearchParams();
  const [budgetData, setBudgetData] = useState<BudgetPreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Tentar pegar os dados dos searchParams
      const dataParam = searchParams.get("data");

      if (dataParam) {
        const decodedData = decodeURIComponent(dataParam);
        const parsedData = JSON.parse(decodedData);
        setBudgetData(parsedData);
      } else {
        // Se não houver dados nos params, pode usar dados mock para teste
        const mockData: BudgetPreviewData = {
          projectName: "Projeto Residencial",
          clientName: "Cliente Preview",
          projectDescription: "Descrição do projeto em preview",
          totalValue: 8700,
          items: [
            {
              id: "1",
              name: "Sala de Estar",
              description: "Design e decoração da sala de estar",
              pricePerSquareMeter: 150,
              squareMeters: 25,
              total: 3750,
              exibir: true,
            },
            {
              id: "2",
              name: "Cozinha",
              description: "Design e decoração da cozinha",
              pricePerSquareMeter: 200,
              squareMeters: 15,
              total: 3000,
              exibir: true,
            },
            {
              id: "3",
              name: "Quarto Principal",
              description: "Design e decoração do quarto principal",
              pricePerSquareMeter: 130,
              squareMeters: 15,
              total: 1950,
              exibir: true,
            },
          ],
          tipoAmbiente: "interior",
          valorComodos: "individuais",
          adicionalValor: 0,
          desconto: 0,
          tipoDesconto: "valor",
          references: [],
        };
        setBudgetData(mockData);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do preview:", error);
      // Em caso de erro, usar dados básicos
      setBudgetData({
        projectName: "Projeto Preview",
        clientName: "Cliente",
        projectDescription: "Projeto em preview",
        totalValue: 0,
        items: [],
        tipoAmbiente: "interior",
        valorComodos: "individuais",
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

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

  return <BudgetLandingPage budgetData={budgetData} />;
}
