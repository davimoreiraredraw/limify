import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ExpensesTable, budgets, projects } from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";

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

    const userId = session.user.id;
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Buscar orçamentos do mês atual
    const budgetsThisMonth = await db
      .select({ count: sql<number>`count(*)` })
      .from(budgets)
      .where(sql`${budgets.created_at} >= ${firstDayOfMonth}`);

    // Buscar projetos fechados (status = completed) do mês atual
    const completedProjectsThisMonth = await db
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .where(
        and(
          sql`${projects.created_at} >= ${firstDayOfMonth}`,
          eq(projects.professional_id, userId),
          eq(projects.status, "completed")
        )
      );

    // Calcular faturamento (soma do total dos orçamentos) do mês atual
    const revenueThisMonth = await db
      .select({ total: sql<number>`sum(${budgets.total})` })
      .from(budgets)
      .where(sql`${budgets.created_at} >= ${firstDayOfMonth}`);

    // Buscar gastos fixos do mês atual
    const fixedExpensesThisMonth = await db
      .select({ total: sql<number>`sum(${ExpensesTable.value})` })
      .from(ExpensesTable)
      .where(
        and(
          eq(ExpensesTable.userId, userId),
          eq(ExpensesTable.isFixed, true),
          eq(ExpensesTable.isActive, true)
        )
      );

    // Calcular percentuais de variação (mock por enquanto)
    const stats = {
      orcamentosRealizados: {
        value: Number(budgetsThisMonth[0]?.count || 0),
        percentage: 5.39,
        trend: "up" as const,
      },
      faturamento: {
        value: Number(revenueThisMonth[0]?.total || 0),
        percentage: 2.29,
        trend: "up" as const,
      },
      projetosFechados: {
        value: Number(completedProjectsThisMonth[0]?.count || 0),
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
