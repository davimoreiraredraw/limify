import { migrateExpenses } from "../drizzle/0004_migrate_expenses_user_id";

async function main() {
  try {
    await migrateExpenses();
    process.exit(0);
  } catch (error) {
    console.error("Erro ao executar migração:", error);
    process.exit(1);
  }
}

main();
