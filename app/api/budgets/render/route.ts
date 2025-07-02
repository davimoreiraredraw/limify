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
    console.log("Iniciando busca de orçamentos de render...");

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

    // Buscar todos os orçamentos de render do usuário logado
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
        and(eq(budgets.budget_type, "render"), eq(budgets.user_id, userId))
      )
      .leftJoin(clientsTable, eq(clientsTable.id, budgets.client_id));

    console.log("Orçamentos de render encontrados:", result.length);
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
      value_type,
      total,
      items,
      references,
      complexity_percentage,
      delivery_time_percentage,
      delivery_time_days,
      base_value,
      final_value,
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

    // 1. Criar o orçamento base
    const [budget] = await db
      .insert(budgets)
      .values({
        name,
        description: description || "",
        client_id,
        model: model || "interior", // interior ou exterior
        budget_type: "render",
        value_type: value_type || "individual", // individual ou unico
        total: final_value || 0,
        base_value: base_value || 0,
        complexity_percentage: complexity_percentage || 0,
        delivery_time_percentage: delivery_time_percentage || 0,
        delivery_time_days: delivery_time_days || 0,
        user_id: userId,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning();

    // 2. Salvar os itens do orçamento
    if (items && Array.isArray(items)) {
      const validItems = items.map((item) => ({
        budget_id: budget.id,
        name: item.name,
        description: item.description || "",
        development_time: item.tempoDesenvolvimento || 0,
        images_quantity: item.quantidadeImagens || 0,
        complexity_level: item.grauComplexidade || "sem",
        price_per_m2: item.pricePerSquareMeter || null,
        square_meters: item.squareMeters || null,
        total: item.total || 0,
        created_at: new Date(),
        updated_at: new Date(),
      }));

      if (validItems.length > 0) {
        await db.insert(budgetItems).values(validItems);
      }
    }

    // 3. Salvar as referências
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
    console.error("Erro ao salvar orçamento de render:", error);
    return NextResponse.json(
      {
        error: "Erro ao salvar orçamento",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
