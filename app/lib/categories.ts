import { Category } from "@/lib/db/schema";
export type { Category };
// Função para buscar todas as categorias
export async function fetchCategories(): Promise<Category[]> {
  try {
    const response = await fetch("/api/categories");
    if (!response.ok) {
      throw new Error("Erro ao buscar categorias");
    }
    const data = await response.json();
    return data.categories;
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return [];
  }
}

// Função para buscar uma categoria específica
export async function fetchCategory(id: string): Promise<Category | null> {
  try {
    const response = await fetch(`/api/categories/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar categoria");
    }

    const data = await response.json();
    return data.category || null;
  } catch (error) {
    console.error("Erro ao buscar categoria:", error);
    return null;
  }
}

// Função para criar uma nova categoria
export async function createCategory(categoryData: {
  name: string;
}): Promise<Category | null> {
  try {
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      throw new Error("Erro ao criar categoria");
    }

    const data = await response.json();
    return data.category;
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    return null;
  }
}

// Função para atualizar uma categoria existente
export async function updateCategory(
  id: string,
  categoryData: {
    name: string;
  }
): Promise<Category | null> {
  try {
    const response = await fetch(`/api/categories`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, ...categoryData }),
    });

    if (!response.ok) {
      throw new Error("Erro ao atualizar categoria");
    }

    const data = await response.json();
    return data.category;
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    return null;
  }
}

// Função para excluir uma categoria
export async function deleteCategory(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/categories?id=${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Erro ao excluir categoria");
    }

    return true;
  } catch (error) {
    console.error("Erro ao excluir categoria:", error);
    return false;
  }
}

// Paleta de cores para categorias
export const categoryColors = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#0ea5e9", // sky
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
  "#f43f5e", // rose
];
