import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ExpensesTable, CategoriesTable } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// Rota para obter uma despesa específica
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
      .where(eq(ExpensesTable.id, id))
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
  } catch (error) {
    console.error("Erro ao buscar despesa:", error);
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
    const id = params.id;
    const body = await req.json();

    // Extrair os dados do corpo da requisição
    const {
      name,
      description,
      value,
      frequency,
      compensation_day,
      category_id,
      is_fixed,
      is_archived,
    } = body;

    // Preparar objeto de atualização
    const updates: any = {
      updatedAt: new Date(),
    };

    // Adicionar apenas os campos que foram enviados
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (value !== undefined) {
      updates.value =
        typeof value === "string"
          ? parseFloat(value.replace(/[^\d.,]/g, "").replace(",", "."))
          : value;
    }
    if (frequency !== undefined) updates.frequency = frequency;
    if (compensation_day !== undefined)
      updates.compensationDay = compensation_day;
    if (category_id !== undefined) updates.categoryId = category_id;
    if (is_fixed !== undefined) updates.isFixed = is_fixed;
    if (is_archived !== undefined) updates.isArchived = is_archived;

    // Atualizar a despesa
    const updatedExpenses = await db
      .update(ExpensesTable)
      .set(updates)
      .where(eq(ExpensesTable.id, id))
      .returning();

    if (updatedExpenses.length === 0) {
      return NextResponse.json(
        { error: "Despesa não encontrada" },
        { status: 404 }
      );
    }

    // Buscar a categoria para incluir na resposta
    const category = category_id
      ? await db.query.CategoriesTable.findFirst({
          where: eq(CategoriesTable.id, category_id),
        })
      : await db.query.CategoriesTable.findFirst({
          where: eq(
            CategoriesTable.id,
            updatedExpenses[0].categoryId as string
          ),
        });

    // Formatar a resposta no formato esperado pelo frontend
    const expense = {
      ...updatedExpenses[0],
      category_id: updatedExpenses[0].categoryId,
      compensation_day: updatedExpenses[0].compensationDay,
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
        : undefined,
    };

    return NextResponse.json({ expense });
  } catch (error) {
    console.error("Erro ao atualizar despesa:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Rota para "excluir" uma despesa (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Em vez de deletar, desativamos a despesa (soft delete)
    const updatedExpenses = await db
      .update(ExpensesTable)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(ExpensesTable.id, id))
      .returning();

    if (updatedExpenses.length === 0) {
      return NextResponse.json(
        { error: "Despesa não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Despesa excluída com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao excluir despesa:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
