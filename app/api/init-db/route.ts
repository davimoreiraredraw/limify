import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CategoriesTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Categorias padrão
const defaultCategories = [
  { name: "Software", color: "#6366f1" },
  { name: "Contabil", color: "#0ea5e9" },
  { name: "Escritório", color: "#10b981" },
  { name: "Veículo", color: "#f59e0b" },
  { name: "Marketing", color: "#ef4444" },
  { name: "Outros", color: "#6b7280" },
];

export async function GET() {
  try {
    // Inserir categorias padrão se elas não existirem
    for (const category of defaultCategories) {
      // Verificar se a categoria já existe
      const existingCategory = await db.query.CategoriesTable.findFirst({
        where: eq(CategoriesTable.name, category.name),
      });

      if (!existingCategory) {
        // Inserir categoria se não existir
        await db.insert(CategoriesTable).values({
          name: category.name,
          color: category.color,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Banco de dados inicializado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao inicializar banco de dados:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao inicializar banco de dados",
      },
      { status: 500 }
    );
  }
}
