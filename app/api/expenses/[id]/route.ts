import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ExpensesTable, CategoriesTable } from "@/lib/db/schema";
import { eq, and, or, isNull } from "drizzle-orm";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Função auxiliar para obter o usuário autenticado
async function getAuthenticatedUser() {
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
  } = await supabase.auth.getSession();

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  return session.user;
}

// Rota para obter uma despesa específica
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    const id = params.id;

    // Buscar a despesa com categoria
    const result = await db
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
      .where(and(eq(ExpensesTable.id, id), eq(ExpensesTable.userId, user.id)))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Despesa não encontrada" },
        { status: 404 }
      );
    }

    // Formatar a resposta no formato esperado pelo frontend
    const expense = {
      id: result[0].expense.id,
      name: result[0].expense.name,
      description: result[0].expense.description,
      value: result[0].expense.value,
      frequency: result[0].expense.frequency,
      compensation_day: result[0].expense.compensationDay,
      category_id: result[0].expense.categoryId,
      is_fixed: result[0].expense.isFixed,
      is_active: result[0].expense.isActive,
      is_archived: result[0].expense.isArchived,
      created_at: result[0].expense.createdAt,
      updated_at: result[0].expense.updatedAt,
      category: result[0].category
        ? {
            id: result[0].category.id,
            name: result[0].category.name,
            color: result[0].category.color,
          }
        : undefined,
    };

    return NextResponse.json({ expense });
  } catch (error: any) {
    console.error("Erro ao buscar despesa:", error);
    if (error.message === "Usuário não autenticado") {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Rota para atualizar uma despesa
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    const id = params.id;
    const body = await req.json();

    // Verificar se a despesa existe e pertence ao usuário
    const existingExpense = await db
      .select()
      .from(ExpensesTable)
      .where(and(eq(ExpensesTable.id, id), eq(ExpensesTable.userId, user.id)))
      .limit(1);

    if (existingExpense.length === 0) {
      return NextResponse.json(
        { error: "Despesa não encontrada" },
        { status: 404 }
      );
    }

    // Preparar os dados para atualização
    const updateData = {
      name: body.name,
      description: body.description,
      value: body.value,
      frequency: body.frequency,
      compensationDay: body.compensation_day,
      categoryId: body.category_id,
      isFixed: body.is_fixed,
      updatedAt: new Date(),
    };

    // Atualizar a despesa
    const updatedExpenses = await db
      .update(ExpensesTable)
      .set(updateData)
      .where(and(eq(ExpensesTable.id, id), eq(ExpensesTable.userId, user.id)))
      .returning();

    if (!updatedExpenses || updatedExpenses.length === 0) {
      return NextResponse.json(
        { error: "Erro ao atualizar despesa" },
        { status: 500 }
      );
    }

    // Buscar a categoria atualizada
    let category = null;
    if (body.category_id) {
      const categories = await db
        .select()
        .from(CategoriesTable)
        .where(
          or(
            eq(CategoriesTable.id, body.category_id),
            isNull(CategoriesTable.userId)
          )
        );
      category = categories[0];
    }

    // Formatar a resposta
    const expense = {
      id: updatedExpenses[0].id,
      name: updatedExpenses[0].name,
      description: updatedExpenses[0].description,
      value: updatedExpenses[0].value,
      frequency: updatedExpenses[0].frequency,
      compensation_day: updatedExpenses[0].compensationDay,
      category_id: updatedExpenses[0].categoryId,
      is_fixed: updatedExpenses[0].isFixed,
      is_active: updatedExpenses[0].isActive,
      is_archived: updatedExpenses[0].isArchived,
      created_at: updatedExpenses[0].createdAt,
      updated_at: updatedExpenses[0].updatedAt,
      category: category
        ? {
            id: category.id,
            name: category.name,
            color: category.color,
          }
        : null,
    };

    return NextResponse.json({ expense });
  } catch (error: any) {
    console.error("Erro ao atualizar despesa:", error);
    if (error.message === "Usuário não autenticado") {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Rota para excluir uma despesa
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    const id = params.id;

    // Verificar se a despesa existe e pertence ao usuário
    const existingExpense = await db
      .select()
      .from(ExpensesTable)
      .where(and(eq(ExpensesTable.id, id), eq(ExpensesTable.userId, user.id)))
      .limit(1);

    if (existingExpense.length === 0) {
      return NextResponse.json(
        { error: "Despesa não encontrada" },
        { status: 404 }
      );
    }

    // Excluir a despesa
    await db
      .delete(ExpensesTable)
      .where(and(eq(ExpensesTable.id, id), eq(ExpensesTable.userId, user.id)));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao excluir despesa:", error);
    if (error.message === "Usuário não autenticado") {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
