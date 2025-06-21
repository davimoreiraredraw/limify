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
import { eq, and } from "drizzle-orm";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function getUserId() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.user?.id) {
    throw new Error("Usuário não autenticado");
  }

  return session.user.id;
}

export async function GET() {
  try {
    console.log("Iniciando busca de orçamentos completos...");

    // Obter o ID do usuário logado
    const userId = await getUserId();

    // Verificar conexão com o banco de dados
    try {
      const testQuery = await db
        .select({ count: budgets.id })
        .from(budgets)
        .limit(1);
      console.log(
        "Conexão com banco de dados OK, resultado de teste:",
        testQuery
      );
    } catch (dbError) {
      console.error("Erro na conexão com o banco de dados:", dbError);
      return NextResponse.json(
        {
          error: "Erro na conexão com o banco de dados",
          details: dbError instanceof Error ? dbError.message : String(dbError),
        },
        { status: 500 }
      );
    }

    // Buscar todos os orçamentos completos do usuário logado
    const result = await db
      .select({
        id: budgets.id,
        name: budgets.name,
        client_name: clientsTable.name,
        total: budgets.total,
        created_at: budgets.created_at,
      })
      .from(budgets)
      .where(
        and(eq(budgets.budget_type, "complete"), eq(budgets.user_id, userId))
      )
      .leftJoin(clientsTable, eq(clientsTable.id, budgets.client_id));

    console.log("Orçamentos completos encontrados:", result.length);
    return NextResponse.json({ success: true, budgets: result });
  } catch (error) {
    console.error("Erro ao buscar orçamentos:", error);
    return NextResponse.json(
      {
        error: "Erro ao buscar orçamentos",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Obter o ID do usuário logado
    const userId = await getUserId();

    const body = await req.json();
    const {
      name,
      description,
      client_id,
      model,
      budget_type,
      value_type,
      total,
      phases,
      additionals,
      references,
      profit_margin,
      final_adjustments,
    } = body;

    // Validar campos obrigatórios
    if (!name) {
      return NextResponse.json(
        {
          error: "Campos obrigatórios faltando",
          details: "Nome do orçamento é obrigatório",
        },
        { status: 400 }
      );
    }

    // 1. Criar o orçamento base com valores padrão para campos opcionais
    const [budget] = await db
      .insert(budgets)
      .values({
        name,
        description: description || "",
        client_id,
        model: model || "default",
        budget_type: "complete",
        value_type: value_type || "fixed",
        total: total || 0,
        user_id: userId,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning();

    // 2. Salvar as fases e suas atividades
    if (phases && Array.isArray(phases)) {
      for (const phase of phases) {
        if (!phase.name) continue; // Pula fases sem nome

        // Criar a fase
        const [savedPhase] = await db
          .insert(budgetPhases)
          .values({
            budget_id: budget.id,
            name: phase.name,
            description: phase.description || "",
            base_value: phase.baseValue || 0,
            created_at: new Date(),
            updated_at: new Date(),
          })
          .returning();

        // Criar os segmentos da fase (se houver)
        if (phase.segments && Array.isArray(phase.segments)) {
          for (const segment of phase.segments) {
            if (!segment.name) continue; // Pula segmentos sem nome

            const [savedSegment] = await db
              .insert(budgetSegments)
              .values({
                phase_id: savedPhase.id,
                name: segment.name,
                description: segment.description || "",
                created_at: new Date(),
                updated_at: new Date(),
              })
              .returning();

            // Criar as atividades do segmento
            if (segment.activities && Array.isArray(segment.activities)) {
              const validActivities = segment.activities
                .filter((activity: any) => activity.name)
                .map((activity: any) => ({
                  phase_id: savedPhase.id,
                  segment_id: savedSegment.id,
                  name: activity.name,
                  description: activity.description || "",
                  time: activity.time || 0,
                  cost_per_hour: activity.costPerHour || 0,
                  total_cost: activity.totalCost || 0,
                  complexity: activity.complexity || "medium",
                  created_at: new Date(),
                  updated_at: new Date(),
                }));

              if (validActivities.length > 0) {
                await db.insert(budgetActivities).values(validActivities);
              }
            }
          }
        }

        // Criar as atividades da fase (sem segmento)
        if (phase.activities && Array.isArray(phase.activities)) {
          const validActivities = phase.activities
            .filter((activity: any) => activity.name)
            .map((activity: any) => ({
              phase_id: savedPhase.id,
              name: activity.name,
              description: activity.description || "",
              time: activity.time || 0,
              cost_per_hour: activity.costPerHour || 0,
              total_cost: activity.totalCost || 0,
              complexity: activity.complexity || "medium",
              created_at: new Date(),
              updated_at: new Date(),
            }));

          if (validActivities.length > 0) {
            await db.insert(budgetActivities).values(validActivities);
          }
        }
      }
    }

    // 3. Salvar os valores adicionais
    if (additionals) {
      await db.insert(budgetAdditionals).values({
        budget_id: budget.id,
        wet_area_quantity: additionals.wetAreaQuantity || 0,
        dry_area_quantity: additionals.dryAreaQuantity || 0,
        wet_area_percentage: additionals.wetAreaPercentage || 0,
        delivery_time: additionals.deliveryTime || 0,
        disable_delivery_charge: additionals.disableDeliveryCharge || false,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    // 4. Salvar as referências
    if (references && Array.isArray(references) && references.length > 0) {
      await db.insert(budgetReferences).values(
        references.map((ref: string) => ({
          budget_id: budget.id,
          project_name: ref,
          created_at: new Date(),
          updated_at: new Date(),
        }))
      );
    }

    return NextResponse.json({ success: true, budgetId: budget.id });
  } catch (error) {
    console.error("Erro ao salvar orçamento completo:", error);
    return NextResponse.json(
      {
        error: "Erro ao salvar orçamento",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
