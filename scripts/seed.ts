import { seedDefaultCategories } from "@/lib/db/seed";

async function main() {
  console.log("🌱 Iniciando seed...");

  await seedDefaultCategories();

  console.log("✨ Seed concluído!");
  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Erro durante o seed:", error);
  process.exit(1);
});
