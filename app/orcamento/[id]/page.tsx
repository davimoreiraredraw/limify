import { notFound } from "next/navigation";
import BudgetLandingPage from "@/components/landing/BudgetLandingPage";

interface BudgetData {
  id: string;
  name: string;
  description: string;
  client_name: string;
  total: number;
  phases?: Array<{
    id: string;
    name: string;
    description: string;
    segments: Array<{
      id: string;
      name: string;
      description: string;
      activities: Array<{
        id: string;
        name: string;
        description: string;
        price_per_m2: number;
        square_meters: number;
        total: number;
        exibir: boolean;
      }>;
    }>;
    activities: Array<{
      id: string;
      name: string;
      description: string;
      price_per_m2: number;
      square_meters: number;
      total: number;
      exibir: boolean;
    }>;
  }>;
  additionals?: {
    additional_value?: number;
    discount?: number;
    discount_type?: "percentual" | "valor";
  };
  references?: string[];
}

async function getBudgetData(id: string): Promise<BudgetData | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/budgets/public/${id}`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.error("Erro ao buscar orçamento:", res.status, res.statusText);
      return null;
    }

    const data = await res.json();
    return data.success ? data.budget : null;
  } catch (error) {
    console.error("Erro ao buscar orçamento:", error);
    return null;
  }
}

function transformBudgetData(budget: BudgetData) {
  // Transformar os dados do banco para o formato esperado pelo componente
  const items: Array<{
    id: string;
    name: string;
    description: string;
    pricePerSquareMeter: number;
    squareMeters: number;
    total: number;
    exibir: boolean;
  }> = [];

  // Extrair itens das fases e segmentos
  if (budget.phases) {
    budget.phases.forEach((phase) => {
      // Adicionar atividades diretas da fase
      phase.activities?.forEach((activity) => {
        items.push({
          id: activity.id,
          name: activity.name,
          description: activity.description,
          pricePerSquareMeter: activity.price_per_m2,
          squareMeters: activity.square_meters,
          total: activity.total,
          exibir: activity.exibir,
        });
      });

      // Adicionar atividades dos segmentos
      phase.segments?.forEach((segment) => {
        segment.activities?.forEach((activity) => {
          items.push({
            id: activity.id,
            name: activity.name,
            description: activity.description,
            pricePerSquareMeter: activity.price_per_m2,
            squareMeters: activity.square_meters,
            total: activity.total,
            exibir: activity.exibir,
          });
        });
      });
    });
  }

  return {
    projectName: budget.name,
    clientName: budget.client_name,
    projectDescription: budget.description,
    totalValue: budget.total,
    items,
    tipoAmbiente: "interior" as const,
    valorComodos: "individuais" as const,
    adicionalValor: budget.additionals?.additional_value,
    desconto: budget.additionals?.discount,
    tipoDesconto: budget.additionals?.discount_type,
    references: budget.references || [],
  };
}

export default async function OrcamentoPreviewPage({
  params,
}: {
  params: { id: string };
}) {
  const budget = await getBudgetData(params.id);

  if (!budget) {
    notFound();
  }

  const budgetData = transformBudgetData(budget);

  return <BudgetLandingPage budgetData={budgetData} />;
}
