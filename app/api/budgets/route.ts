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
    console.log("Iniciando busca de orçamentos...");

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

    // Buscar todos os orçamentos do usuário logado
    const result = await db
      .select({
        id: budgets.id,
        name: budgets.name,
        client_name: clientsTable.name,
        total: budgets.total,
        created_at: budgets.created_at,
      })
      .from(budgets)
      .where(eq(budgets.user_id, userId))
      .leftJoin(clientsTable, eq(clientsTable.id, budgets.client_id));

    console.log("Orçamentos encontrados:", result.length);
    return NextResponse.json(result);
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
