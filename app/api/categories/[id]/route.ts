import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CategoriesTable, ExpensesTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Rota para obter uma categoria específica
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const category = await db.query.CategoriesTable.findFirst({
      where: eq(CategoriesTable.id, id),
    });

    if (!category) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Erro ao buscar categoria:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Rota para atualizar uma categoria
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const { name, color } = await req.json();

    // Preparar objeto de atualização
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (color !== undefined) updates.color = color;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "Nenhum dado para atualizar" },
        { status: 400 }
      );
    }

    // Atualizar a categoria
    const updatedCategories = await db
      .update(CategoriesTable)
      .set(updates)
      .where(eq(CategoriesTable.id, id))
      .returning();

    if (updatedCategories.length === 0) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ category: updatedCategories[0] });
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Rota para excluir uma categoria
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Verificar se existem despesas usando esta categoria
    const expensesWithCategory = await db
      .select({ id: ExpensesTable.id })
      .from(ExpensesTable)
      .where(eq(ExpensesTable.categoryId, id))
      .limit(1);

    // Se houver despesas usando esta categoria, não permite a exclusão
    if (expensesWithCategory.length > 0) {
      return NextResponse.json(
        {
          error:
            "Não é possível excluir esta categoria pois existem despesas relacionadas a ela",
          hasRelations: true,
        },
        { status: 400 }
      );
    }

    // Excluir a categoria se não houver relações
    const deletedCategories = await db
      .delete(CategoriesTable)
      .where(eq(CategoriesTable.id, id))
      .returning();

    if (deletedCategories.length === 0) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Categoria excluída com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao excluir categoria:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
