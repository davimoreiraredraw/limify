import {
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
  decimal,
  integer,
  uuid,
} from "drizzle-orm/pg-core";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

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
  types: {
    // Desabilita parsers personalizados que podem usar módulos nativos
    bigint: {
      to: 0,
      from: [],
      serialize: (x: any) => x.toString(),
      parse: (x: any) => Number(x),
    },
  },
});

export const UsersTable = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    image: text("image").notNull(),
    userType: varchar("user_type", { length: 20 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (users) => {
    return {
      uniqueIdx: uniqueIndex("unique_idx").on(users.email),
    };
  }
);

export const QuoteTypesTable = pgTable("quote_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const QuotesTable = pgTable("quotes", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => UsersTable.id),
  professionalId: integer("professional_id").references(() => UsersTable.id),
  quoteTypeId: integer("quote_type_id").references(() => QuoteTypesTable.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).notNull().default("draft"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type User = InferSelectModel<typeof UsersTable>;
export type NewUser = InferInsertModel<typeof UsersTable>;

export type QuoteType = InferSelectModel<typeof QuoteTypesTable>;
export type NewQuoteType = InferInsertModel<typeof QuoteTypesTable>;

export type Quote = InferSelectModel<typeof QuotesTable>;
export type NewQuote = InferInsertModel<typeof QuotesTable>;

// Connect to Postgres
export const db = drizzle(queryClient);
