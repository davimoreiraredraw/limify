import { db } from "@/lib/db";
import { ExpensesTable } from "@/lib/db/schema";
import { createClient } from "@supabase/supabase-js";

// Função para migrar as despesas existentes
export async function migrateExpenses() {
  try {
    console.log("Iniciando migração de despesas...");

    // Criar cliente do Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Buscar todos os usuários
    const { data: users, error: usersError } =
      await supabase.auth.admin.listUsers();
    if (usersError) {
      throw usersError;
    }

    // Se não houver usuários, não há o que migrar
    if (!users.users || users.users.length === 0) {
      console.log("Nenhum usuário encontrado para migração");
      return;
    }

    // Pegar o primeiro usuário como proprietário das despesas existentes
    const firstUser = users.users[0];

    // Atualizar todas as despesas existentes para pertencerem ao primeiro usuário
    const result = await db.execute(
      `UPDATE expenses SET user_id = $1 WHERE user_id IS NULL`,
      [firstUser.id]
    );

    console.log("Migração concluída com sucesso!");
    console.log("Resultado:", result);
  } catch (error) {
    console.error("Erro durante a migração:", error);
    throw error;
  }
}
