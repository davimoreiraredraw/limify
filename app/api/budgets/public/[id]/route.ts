import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import {
  budgets,
  budgetPhases,
  budgetSegments,
  budgetActivities,
  budgetAdditionals,
  budgetReferences,
  clientsTable,
} from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const budgetId = params.id;

    // Buscar o orçamento base (sem verificação de usuário para acesso público)
    const [budget] = await db
      .select({
        id: budgets.id,
        name: budgets.name,
        description: budgets.description,
        client_name: clientsTable.name,
        total: budgets.total,
        created_at: budgets.created_at,
        budget_type: budgets.budget_type,
        value_type: budgets.value_type,
        discount: budgets.discount,
        discount_type: budgets.discount_type,
      })
      .from(budgets)
      .where(eq(budgets.id, budgetId))
      .leftJoin(clientsTable, eq(clientsTable.id, budgets.client_id));

    if (!budget) {
      return NextResponse.json(
        { error: "Orçamento não encontrado" },
        { status: 404 }
      );
    }

    // Buscar todas as fases do orçamento
    const phases = await db
      .select()
      .from(budgetPhases)
      .where(eq(budgetPhases.budget_id, budgetId));

    // Para cada fase, buscar seus segmentos e atividades
    const phasesWithDetails = await Promise.all(
      phases.map(async (phase) => {
        // Buscar segmentos da fase
        const segments = await db
          .select()
          .from(budgetSegments)
          .where(eq(budgetSegments.phase_id, phase.id));

        // Buscar atividades da fase (sem segmento)
        const phaseActivities = await db
          .select()
          .from(budgetActivities)
          .where(
            and(
              eq(budgetActivities.phase_id, phase.id),
              isNull(budgetActivities.segment_id)
            )
          );

        // Para cada segmento, buscar suas atividades
        const segmentsWithActivities = await Promise.all(
          segments.map(async (segment) => {
            const segmentActivities = await db
              .select()
              .from(budgetActivities)
              .where(eq(budgetActivities.segment_id, segment.id));

            return {
              ...segment,
              activities: segmentActivities,
            };
          })
        );

        return {
          ...phase,
          segments: segmentsWithActivities,
          activities: phaseActivities,
        };
      })
    );

    // Buscar valores adicionais do orçamento
    const [additionals] = await db
      .select()
      .from(budgetAdditionals)
      .where(eq(budgetAdditionals.budget_id, budgetId));

    // Buscar referências do orçamento
    const references = await db
      .select()
      .from(budgetReferences)
      .where(eq(budgetReferences.budget_id, budgetId));

    // Montar o objeto completo do orçamento
    const completeBudget = {
      ...budget,
      phases: phasesWithDetails,
      additionals,
      references: references.map((ref) => ref.project_name),
    };

    return NextResponse.json({ success: true, budget: completeBudget });
  } catch (error) {
    console.error("Erro ao buscar orçamento:", error);
    return NextResponse.json(
      {
        error: "Erro ao buscar orçamento",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
