import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ExpensesTable, CategoriesTable } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Rota para listar todas as despesas
export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "all"; // "fixed", "punctual", "all"

    let query = db
      .select({
        expense: ExpensesTable,
        category: {
          id: CategoriesTable.id,
          name: CategoriesTable.name,
          color: CategoriesTable.color,
        },
      })
      .from(ExpensesTable)
      .leftJoin(
        CategoriesTable,
        eq(ExpensesTable.categoryId, CategoriesTable.id)
      )
      .where(eq(ExpensesTable.userId, session.user.id))
      .orderBy(desc(ExpensesTable.createdAt));

    // Aplicar filtro pelo tipo se não for "all"
    if (type !== "all") {
      const isFixed = type === "fixed";
      query = query.where(
        and(
          eq(ExpensesTable.userId, session.user.id),
          eq(ExpensesTable.isFixed, isFixed)
        )
      );
    }

    const result = await query;

    // Formatar os resultados para o formato esperado pelo frontend
    const expenses = result.map((item) => ({
      id: item.expense.id,
      name: item.expense.name,
      description: item.expense.description,
      value: item.expense.value,
      frequency: item.expense.frequency,
      compensation_day: item.expense.compensationDay,
      category_id: item.expense.categoryId,
      is_fixed: item.expense.isFixed,
      is_active: item.expense.isActive,
      is_archived: item.expense.isArchived,
      created_at: item.expense.createdAt,
      updated_at: item.expense.updatedAt,
      category: item.category
        ? {
            id: item.category.id,
            name: item.category.name,
            color: item.category.color,
          }
        : undefined,
    }));

    return NextResponse.json({ expenses });
  } catch (error) {
    console.error("Erro ao buscar despesas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Rota para criar uma nova despesa
export async function POST(req: NextRequest) {
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

    const body = await req.json();

    // Extrai os dados do corpo da requisição
    const {
      name,
      description,
      value,
      frequency,
      compensation_day,
      category_id,
      is_fixed = true,
    } = body;

    // Valida os campos obrigatórios
    if (!name || !value || !frequency || !category_id) {
      return NextResponse.json(
        { error: "Campos obrigatórios não preenchidos" },
        { status: 400 }
      );
    }

    // Converte o valor para número (supondo que será enviado como string formatada)
    const numericValue =
      typeof value === "string"
        ? parseFloat(value.replace(/[^\d.,]/g, "").replace(",", "."))
        : value;

    // Cria a data atual para os campos timestamp
    const now = new Date();
    console.log(session.user.id, "SESSION");
    // Inserir a despesa no banco
    const insertedExpenses = await db
      .insert(ExpensesTable)
      .values({
        name,
        description,
        value: numericValue,
        frequency,
        compensationDay: compensation_day,
        categoryId: category_id,
        userId: session.user.id,
        isFixed: is_fixed,
        isActive: true,
        isArchived: false,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    if (!insertedExpenses || insertedExpenses.length === 0) {
      return NextResponse.json(
        { error: "Erro ao criar despesa" },
        { status: 500 }
      );
    }

    // Buscar a categoria para incluir na resposta
    const category = await db.query.CategoriesTable.findFirst({
      where: eq(CategoriesTable.id, category_id),
    });

    // Formatar a resposta no formato esperado pelo frontend
    const expense = {
      ...insertedExpenses[0],
      category_id: insertedExpenses[0].categoryId,
      compensation_day: insertedExpenses[0].compensationDay,
      is_fixed: insertedExpenses[0].isFixed,
      is_active: insertedExpenses[0].isActive,
      is_archived: insertedExpenses[0].isArchived,
      created_at: insertedExpenses[0].createdAt,
      updated_at: insertedExpenses[0].updatedAt,
      category: category
        ? {
            id: category.id,
            name: category.name,
            color: category.color,
          }
        : undefined,
    };

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar despesa:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
