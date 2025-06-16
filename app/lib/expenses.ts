// Tipos para despesas e categorias
export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Expense {
  id: string;
  name: string;
  description?: string;
  value: number;
  frequency: string;
  compensation_day?: number;
  category_id: string;
  is_fixed: boolean;
  is_active: boolean;
  is_archived: boolean;
  created_at: string | Date;
  updated_at: string | Date;
  category?: Category;
}

// Função para buscar todas as despesas
export async function fetchExpenses(
  type: "fixed" | "punctual" | "all" = "all"
): Promise<Expense[]> {
  try {
    const response = await fetch(`/api/expenses?type=${type}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar despesas");
    }

    const data = await response.json();
    return data.expenses || [];
  } catch (error) {
    console.error("Erro ao buscar despesas:", error);
    return [];
  }
}

// Função para buscar uma despesa específica
export async function fetchExpense(id: string): Promise<Expense | null> {
  try {
    const response = await fetch(`/api/expenses/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar despesa");
    }

    const data = await response.json();
    return data.expense || null;
  } catch (error) {
    console.error("Erro ao buscar despesa:", error);
    return null;
  }
}

// Tipos para criação de despesa
export interface CreateExpenseData {
  name: string;
  description?: string;
  value: number;
  frequency: string;
  compensation_day?: number;
  category_id: string;
  is_fixed: boolean;
  is_active?: boolean;
  is_archived?: boolean;
}

// Função para criar uma nova despesa
export async function createExpense(
  expenseData: CreateExpenseData
): Promise<Expense | null> {
  try {
    const response = await fetch("/api/expenses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(expenseData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao criar despesa");
    }

    const data = await response.json();
    return data.expense || null;
  } catch (error) {
    console.error("Erro ao criar despesa:", error);
    return null;
  }
}

// Função para atualizar uma despesa existente
export async function updateExpense(
  id: string,
  expenseData: Partial<CreateExpenseData>
): Promise<Expense | null> {
  try {
    const response = await fetch(`/api/expenses/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(expenseData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao atualizar despesa");
    }

    const data = await response.json();
    return data.expense || null;
  } catch (error) {
    console.error("Erro ao atualizar despesa:", error);
    return null;
  }
}

// Função para excluir uma despesa
export async function deleteExpense(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/expenses/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao excluir despesa");
    }

    return true;
  } catch (error) {
    console.error("Erro ao excluir despesa:", error);
    return false;
  }
}

// Função para arquivar uma despesa
export async function archiveExpense(id: string): Promise<Expense | null> {
  return updateExpense(id, { is_archived: true });
}

// Função para desarquivar uma despesa
export async function unarchiveExpense(id: string): Promise<Expense | null> {
  return updateExpense(id, { is_archived: false });
}

// Função para calcular o valor mensal da despesa
export function calculateMonthlyValue(
  value: number,
  frequency: string
): number {
  switch (frequency) {
    case "Diário":
      return value * 30;
    case "Semanal":
      return value * 4.33;
    case "Mensal":
      return value;
    case "Anual":
      return value / 12;
    case "Único":
      return value / 12;
    default:
      return value;
  }
}

// Função para calcular o valor anual da despesa
export function calculateAnnualValue(value: number, frequency: string): number {
  switch (frequency) {
    case "Diário":
      return value * 365;
    case "Semanal":
      return value * 52;
    case "Mensal":
      return value * 12;
    case "Anual":
      return value;
    case "Único":
      return value;
    default:
      return value * 12;
  }
}

// Função para formatar valor em moeda brasileira
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
