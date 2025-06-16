import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CategoriesTable } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

// Rota para listar todas as categorias
export async function GET() {
  try {
    const categories = await db
      .select()
      .from(CategoriesTable)
      .orderBy(asc(CategoriesTable.name));

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Rota para criar uma nova categoria
export async function POST(req: NextRequest) {
  try {
    const { name, color = "#6366f1" } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Nome da categoria é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se a categoria já existe
    const existingCategory = await db.query.CategoriesTable.findFirst({
      where: eq(CategoriesTable.name, name),
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Categoria já existe" },
        { status: 409 }
      );
    }

    // Inserir a nova categoria
    const insertedCategories = await db
      .insert(CategoriesTable)
      .values({
        name,
        color,
        createdAt: new Date(),
      })
      .returning();

    if (!insertedCategories || insertedCategories.length === 0) {
      return NextResponse.json(
        { error: "Erro ao criar categoria" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { category: insertedCategories[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
