import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ExpensesTable, budgets, projects } from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";

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

    // Buscar orçamentos do dia selecionado
    const budgetsThisDay = await db
      .select({ count: sql<number>`count(*)` })
      .from(budgets)
      .where(
        and(
          sql`${budgets.created_at} >= ${startOfDay}`,
          sql`${budgets.created_at} < ${endOfDay}`,
          eq(budgets.user_id, userId)
        )
      );

    // Buscar projetos fechados (status = completed) do dia selecionado
    const completedProjectsThisDay = await db
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .where(
        and(
          sql`${projects.created_at} >= ${startOfDay}`,
          sql`${projects.created_at} < ${endOfDay}`,
          eq(projects.professional_id, userId),
          eq(projects.status, "completed")
        )
      );

    // Calcular faturamento (soma do total dos orçamentos) do dia selecionado
    const revenueThisDay = await db
      .select({ total: sql<number>`sum(${budgets.total})` })
      .from(budgets)
      .where(
        and(
          sql`${budgets.created_at} >= ${startOfDay}`,
          sql`${budgets.created_at} < ${endOfDay}`,
          eq(budgets.user_id, userId)
        )
      );

    // Buscar gastos fixos ativos (são recorrentes, então não filtramos por data)
    const fixedExpensesThisMonth = await db
      .select({ total: sql<number>`sum(${ExpensesTable.value})` })
      .from(ExpensesTable)
      .where(
        and(
          eq(ExpensesTable.userId, userId),
          eq(ExpensesTable.isFixed, true),
          eq(ExpensesTable.isActive, true),
          eq(ExpensesTable.isDeleted, false)
        )
      );

    // Calcular percentuais de variação (mock por enquanto)
    const stats = {
      orcamentosRealizados: {
        value: Number(budgetsThisDay[0]?.count || 0),
        percentage: 5.39,
        trend: "up" as const,
      },
      faturamento: {
        value: Number(revenueThisDay[0]?.total || 0),
        percentage: 2.29,
        trend: "up" as const,
      },
      projetosFechados: {
        value: Number(completedProjectsThisDay[0]?.count || 0),
        percentage: 0.65,
        trend: "down" as const,
      },
      gastosFixos: {
        value: Number(fixedExpensesThisMonth[0]?.total || 0),
        percentage: 2.29,
        trend: "up" as const,
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar estatísticas" },
      { status: 500 }
    );
  }
}
