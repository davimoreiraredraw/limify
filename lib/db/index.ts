import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Configuração específica para o Next.js
const queryClient = postgres(process.env.POSTGRES_URL_NON_POOLING!, {
  ssl: "require",
  // Desabilita o pooling pois o edge runtime não suporta
  prepare: false,
  // Configurações recomendadas para Next.js
  max: 1,
  // Desabilita recursos nativos do Node
  connection: {
    keepAlive: false,
    keepAliveInitialDelayMillis: 0,
  },
});

// Connect to Postgres
export const db = drizzle(queryClient, { schema });
