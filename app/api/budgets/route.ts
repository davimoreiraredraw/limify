import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import {
  budgets,
  budgetItems,
  budgetReferences,
  clientsTable,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { desc } from "drizzle-orm";

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

export async function GET(request: NextRequest) {
  try {
    console.log("Iniciando busca de orçamentos...");

    // Obter parâmetros da query
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");
    const showDeleted = searchParams.get("deleted") === "true";

    // Obter o ID do usuário logado
    const userId = await getUserId();

    // Verificar conexão com o banco de dados
    try {
      // Verificar se podemos acessar a tabela budgets (consulta simples)
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

    // Construir a query base
    let query = db
      .select({
        budget: budgets,
        client_name: clientsTable.name,
      })
      .from(budgets)
      .leftJoin(clientsTable, eq(budgets.client_id, clientsTable.id))
      .where(eq(budgets.user_id, userId));

    // Aplicar filtro de lixeira
    if (showDeleted) {
      query = query.where(eq(budgets.is_deleted, true));
    } else {
      query = query.where(eq(budgets.is_deleted, false));
    }

    // Aplicar filtro de status se fornecido
    if (statusFilter && statusFilter !== "todos") {
      query = query.where(eq(budgets.status, statusFilter as any));
    }

    // Executar a query com ordenação
    const result = await query.orderBy(desc(budgets.created_at));

    // Formatar a resposta
    const formattedBudgets = result.map((item) => ({
      id: item.budget.id,
      name: item.budget.name,
      description: item.budget.description,
      client_id: item.budget.client_id,
      model: item.budget.model,
      budget_type: item.budget.budget_type,
      value_type: item.budget.value_type,
      total: item.budget.total,
      status: item.budget.status,
      is_deleted: item.budget.is_deleted,
      user_id: item.budget.user_id,
      created_at: item.budget.created_at,
      updated_at: item.budget.updated_at,
      average_price_per_m2: item.budget.average_price_per_m2,
      discount: item.budget.discount,
      discount_type: item.budget.discount_type,
      base_value: item.budget.base_value,
      complexity_percentage: item.budget.complexity_percentage,
      delivery_time_percentage: item.budget.delivery_time_percentage,
      delivery_time_days: item.budget.delivery_time_days,
      client_name: item.client_name,
    }));

    console.log("Orçamentos encontrados:", formattedBudgets.length);
    return NextResponse.json(formattedBudgets);
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
      average_price_per_m2,
      discount,
      discount_type,
      items,
      references,
    } = body;

    // Cria o orçamento
    const [budget] = await db
      .insert(budgets)
      .values({
        name,
        description,
        client_id,
        model,
        budget_type,
        value_type,
        total,
        average_price_per_m2,
        discount,
        discount_type,
        user_id: userId,
      })
      .returning();

    // Cria os itens do orçamento
    if (items && Array.isArray(items)) {
      await db.insert(budgetItems).values(
        items.map((item: any) => ({
          budget_id: budget.id,
          name: item.name,
          description: item.description,
          price_per_m2: item.pricePerSquareMeter,
          square_meters: item.squareMeters,
          total: item.total,
        }))
      );
    }

    // Cria os projetos de referência
    if (references && Array.isArray(references)) {
      await db.insert(budgetReferences).values(
        references.map((ref: any) => ({
          budget_id: budget.id,
          project_name: ref,
        }))
      );
    }

    return NextResponse.json({ success: true, budgetId: budget.id });
  } catch (error) {
    console.error("Erro ao salvar orçamento:", error);
    return NextResponse.json(
      { error: "Erro ao salvar orçamento" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // Obter o ID do usuário logado
    const userId = await getUserId();

    const body = await req.json();
    const { budgetId, status, action } = body;

    if (!budgetId) {
      return NextResponse.json(
        { error: "budgetId é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se o orçamento pertence ao usuário
    const existingBudget = await db
      .select()
      .from(budgets)
      .where(and(eq(budgets.id, budgetId), eq(budgets.user_id, userId)))
      .limit(1);

    if (existingBudget.length === 0) {
      return NextResponse.json(
        { error: "Orçamento não encontrado" },
        { status: 404 }
      );
    }

    let updateData: any = { updated_at: new Date() };

    // Determinar a ação a ser executada
    if (action === "move_to_trash") {
      updateData.is_deleted = true;
    } else if (action === "restore") {
      updateData.is_deleted = false;
    } else if (action === "delete_permanently") {
      // Excluir permanentemente
      await db.delete(budgets).where(eq(budgets.id, budgetId));
      return NextResponse.json({ success: true });
    } else if (status) {
      // Atualizar status
      updateData.status = status;
    } else {
      return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
    }

    // Atualizar o orçamento
    await db.update(budgets).set(updateData).where(eq(budgets.id, budgetId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar orçamento:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar orçamento" },
      { status: 500 }
    );
  }
}
