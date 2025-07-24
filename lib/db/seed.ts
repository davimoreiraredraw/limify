import { db } from "@/lib/db";
import { CategoriesTable } from "@/lib/db/schema";
import { isNull } from "drizzle-orm";

// Categorias padrão
const defaultCategories = [
  {
    name: "Aluguel",
    color: "#ef4444", // red
  },
  {
    name: "Energia",
    color: "#f97316", // orange
  },
  {
    name: "Água",
    color: "#0ea5e9", // sky
  },
  {
    name: "Internet",
    color: "#6366f1", // indigo
  },
  {
    name: "Telefone",
    color: "#8b5cf6", // violet
  },
  {
    name: "Material de Escritório",
    color: "#22c55e", // green
  },
  {
    name: "Software",
    color: "#14b8a6", // teal
  },
  {
    name: "Marketing",
    color: "#f43f5e", // rose
  },
  {
    name: "Impostos",
    color: "#a855f7", // purple
  },
  {
    name: "Outros",
    color: "#64748b", // slate
  },
];

// Função para inserir as categorias padrão
export async function seedDefaultCategories() {
  try {
    // Verificar se já existem categorias padrão
    const existingCategories = await db
      .select()
      .from(CategoriesTable)
      .where(isNull(CategoriesTable.userId));

    if (existingCategories.length === 0) {
      // Inserir categorias padrão
      await db.insert(CategoriesTable).values(
        defaultCategories.map((category) => ({
          name: category.name,
          color: category.color,
          createdAt: new Date(),
        }))
      );

      console.log("✅ Categorias padrão inseridas com sucesso!");
    } else {
      console.log("ℹ️ Categorias padrão já existem, pulando seed...");
    }
  } catch (error) {
    console.error("❌ Erro ao inserir categorias padrão:", error);
  }
}
