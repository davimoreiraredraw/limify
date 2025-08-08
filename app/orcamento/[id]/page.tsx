import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import {
  budgets,
  clientsTable,
  budgetItems,
  budgetReferences,
  budgetPublications,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import BudgetLandingPage from "@/components/landing/BudgetLandingPage";

interface PublicBudgetPageProps {
  params: {
    id: string;
  };
}

async function getBudgetData(id: string) {
  try {
    // Buscar orçamento com informações do cliente e dados de publicação
    const budgetData = await db
      .select({
        budget: budgets,
        client: clientsTable,
        publication: budgetPublications,
      })
      .from(budgets)
      .leftJoin(clientsTable, eq(budgets.client_id, clientsTable.id))
      .leftJoin(
        budgetPublications,
        eq(budgets.id, budgetPublications.budget_id)
      )
      .where(eq(budgets.id, id))
      .limit(1);

    if (budgetData.length === 0) {
      return null;
    }

    const budget = budgetData[0].budget;
    const client = budgetData[0].client;
    const publication = budgetData[0].publication;

    // Transformar dados para o formato esperado pelo componente
    return {
      projectName: budget.name,
      clientName: client?.name || "",
      projectDescription: budget.description || "",
      totalValue: Number(budget.total) || 0,
      items: [], // TODO: Buscar itens do orçamento
      tipoAmbiente: budget.model as "interior" | "exterior",
      valorComodos: budget.value_type as "unico" | "individuais",
      adicionalValor: 0,
      desconto: Number(budget.discount) || 0,
      tipoDesconto: budget.discount_type as "percentual" | "valor" | undefined,
      references: [], // TODO: Buscar referências
      configData: {
        title:
          publication?.header_title || `Proposta Comercial: ${budget.name}`,
        subtitle: publication?.header_subtitle || "Preparado por: Estúdio Meza",
        headerImage: publication?.header_image,
      },
      sectionConfigurations: publication
        ? {
            deliverables: JSON.parse(publication.deliverables || "{}"),
            phases: JSON.parse(publication.phases || "{}"),
            investment: JSON.parse(publication.investment || "{}"),
            about: JSON.parse(publication.about || "{}"),
            team: JSON.parse(publication.team || "{}"),
          }
        : null,
    };
  } catch (error) {
    console.error("Erro ao buscar dados do orçamento:", error);
    return null;
  }
}

function transformBudgetData(data: any) {
  if (!data) return null;

  return {
    ...data.budgetData,
    configData: data.configData,
    sectionConfigurations: data.sectionConfigurations,
  };
}

export default async function PublicBudgetPage({
  params,
}: PublicBudgetPageProps) {
  const budgetData = await getBudgetData(params.id);

  if (!budgetData) {
    notFound();
  }

  const transformedData = transformBudgetData(budgetData);

  if (!transformedData) {
    notFound();
  }

  return (
    <BudgetLandingPage
      budgetData={transformedData}
      configData={transformedData.configData}
      showCloseButton={false} // Não mostrar botão fechar em página pública
    />
  );
}
