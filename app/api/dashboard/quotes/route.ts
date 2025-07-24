import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { budgets, clientsTable } from "@/lib/db/schema";
import { desc, eq, and, sql } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    // Se não houver data, usar hoje
    const selectedDate = dateParam ? new Date(dateParam) : new Date();
    const startOfDay = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate()
    );
    const endOfDay = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate() + 1
    );

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

    const userId = session.user.id;

    // Buscar os orçamentos do dia selecionado
    const budgetsOfDay = await db
      .select({
        id: budgets.id,
        name: budgets.name,
        client_name: clientsTable.name,
        total: budgets.total,
        created_at: budgets.created_at,
      })
      .from(budgets)
      .leftJoin(clientsTable, eq(clientsTable.id, budgets.client_id))
      .where(
        and(
          eq(budgets.user_id, userId),
          sql`${budgets.created_at} >= ${startOfDay}`,
          sql`${budgets.created_at} < ${endOfDay}`
        )
      )
      .orderBy(desc(budgets.created_at))
      .limit(5);

    // Formatar os dados para o formato esperado pelo frontend
    const formattedBudgets = budgetsOfDay.map((budget) => ({
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
