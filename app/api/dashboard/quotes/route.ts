import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { budgets, clientsTable } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    // Criar cliente do Supabase
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

    // Obter usuário autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    // Buscar os últimos 5 orçamentos
    const latestBudgets = await db
      .select({
        id: budgets.id,
        name: budgets.name,
        client_name: clientsTable.name,
        total: budgets.total,
        created_at: budgets.created_at,
      })
      .from(budgets)
      .leftJoin(clientsTable, eq(clientsTable.id, budgets.client_id))
      .orderBy(desc(budgets.created_at))
      .limit(5);

    // Formatar os dados para o formato esperado pelo frontend
    const formattedBudgets = latestBudgets.map((budget) => ({
      projeto: budget.name,
      data: new Date(budget.created_at!).toLocaleDateString("pt-BR"),
      preco: Number(budget.total || 0),
      analytics: "Visualizado", // Por enquanto fixo, pois não temos essa info
      status: "Completo", // Por enquanto fixo, pois não temos essa info
    }));

    return NextResponse.json(formattedBudgets);
  } catch (error) {
    console.error("Erro ao buscar orçamentos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar orçamentos" },
      { status: 500 }
    );
  }
}
