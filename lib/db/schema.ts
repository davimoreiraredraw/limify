import { relations as drizzleRelations } from "drizzle-orm";
import {
  timestamp,
  text,
  pgTable,
  uuid,
  varchar,
  decimal,
  boolean,
  pgEnum,
  integer,
  numeric,
  index,
} from "drizzle-orm/pg-core";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

// Tabela de clientes
export const clientsTable = pgTable("clients", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  company: text("company"),
  email: text("email"),
  phone: varchar("phone", { length: 20 }),
  document: varchar("document", { length: 20 }),
  additionalInfo: text("additional_info"),
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const profiles = pgTable("profiles", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email"),
  image: text("image"),
  user_type: text("user_type").$type<"client" | "professional">(),
  whatsapp: varchar("whatsapp", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const statusEnum = pgEnum("status", [
  "pending",
  "in_progress",
  "completed",
]);

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  client_id: text("client_id").references(() => profiles.id),
  professional_id: text("professional_id").references(() => profiles.id),
  status: statusEnum("status").default("pending"),
  total_value: decimal("total_value", { precision: 10, scale: 2 }).default("0"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const quotes = pgTable("quotes", {
  id: uuid("id").primaryKey().defaultRandom(),
  project_id: uuid("project_id").references(() => projects.id),
  name: text("name").notNull(),
  description: text("description"),
  value: decimal("value", { precision: 10, scale: 2 }).default("0"),
  status: statusEnum("status").default("pending"),
  analytics_generated: boolean("analytics_generated").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Tabela de categorias
export const CategoriesTable = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color").notNull().default("#6366f1"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabela de despesas
export const ExpensesTable = pgTable("expenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  value: decimal("value", { precision: 12, scale: 2 }).notNull(),
  frequency: text("frequency").notNull().default("Mensal"),
  compensationDay: integer("compensation_day"),
  categoryId: uuid("category_id").references(() => CategoriesTable.id),
  userId: text("user_id")
    .references(() => profiles.id)
    .notNull(),
  isFixed: boolean("is_fixed").notNull().default(true),
  isActive: boolean("is_active").notNull().default(true),
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tabela de orçamentos
export const budgets = pgTable("budgets", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  client_id: uuid("client_id").references(() => clientsTable.id),
  model: text("model"), // Ex: "interior", "exterior"
  budget_type: text("budget_type"), // Ex: "m2", "completo"
  value_type: text("value_type"), // Ex: "individuais", "unico"
  total: numeric("total"),
  average_price_per_m2: numeric("average_price_per_m2"),
  discount: numeric("discount"),
  discount_type: text("discount_type"), // "percentual" ou "valor"
  user_id: text("user_id").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Tabela de itens do orçamento (ambientes)
export const budgetItems = pgTable("budget_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  budget_id: uuid("budget_id").references(() => budgets.id),
  name: text("name").notNull(),
  description: text("description"),
  price_per_m2: decimal("price_per_m2", { precision: 12, scale: 2 }),
  square_meters: decimal("square_meters", { precision: 12, scale: 2 }),
  total: decimal("total", { precision: 12, scale: 2 }),
});

// Tabela de projetos de referência do orçamento
export const budgetReferences = pgTable("budget_references", {
  id: uuid("id").defaultRandom().primaryKey(),
  budget_id: uuid("budget_id").references(() => budgets.id),
  project_name: text("project_name").notNull(),
});

// Enumeração para os tipos de planos
export const planTypeEnum = pgEnum("plan_type", [
  "free",
  "basic",
  "expert",
  "business",
]);

// Tabela de planos dos usuários
export const userPlansTable = pgTable("user_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .references(() => profiles.id)
    .notNull(),
  planType: planTypeEnum("plan_type").default("free").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripePriceId: text("stripe_price_id"),
  status: varchar("status", { length: 20 }).default("active"),
  quotaOrçamentos: integer("quota_orcamentos"),
  quotaAlterações: integer("quota_alteracoes"),
  quotaUsuários: integer("quota_usuarios"),
  quotaClientes: integer("quota_clientes"),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  trialEndsAt: timestamp("trial_ends_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Enumeração para os tipos de roles de equipe
export const teamRoleEnum = pgEnum("team_role", ["owner", "admin", "member"]);

// Tabela de equipes
export const teamsTable = pgTable("teams", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  ownerId: text("owner_id")
    .references(() => profiles.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tabela de membros da equipe
export const teamMembersTable = pgTable("team_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id")
    .references(() => teamsTable.id)
    .notNull(),
  userId: text("user_id")
    .references(() => profiles.id)
    .notNull(),
  role: teamRoleEnum("role").default("member").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tipos para as tabelas
export type Category = InferSelectModel<typeof CategoriesTable>;
export type NewCategory = InferInsertModel<typeof CategoriesTable>;

export type Expense = InferSelectModel<typeof ExpensesTable>;
export type NewExpense = InferInsertModel<typeof ExpensesTable>;

export type Client = InferSelectModel<typeof clientsTable>;
export type NewClient = InferInsertModel<typeof clientsTable>;

// Tipos para planos
export type UserPlan = InferSelectModel<typeof userPlansTable>;
export type NewUserPlan = InferInsertModel<typeof userPlansTable>;

// Tipos para as tabelas de equipe
export type Team = InferSelectModel<typeof teamsTable>;
export type NewTeam = InferInsertModel<typeof teamsTable>;

export type TeamMember = InferSelectModel<typeof teamMembersTable>;
export type NewTeamMember = InferInsertModel<typeof teamMembersTable>;

// Relações
export const projectsRelations = drizzleRelations(
  projects,
  ({ many, one }) => ({
    quotes: many(quotes),
    client: one(profiles, {
      fields: [projects.client_id],
      references: [profiles.id],
    }),
    professional: one(profiles, {
      fields: [projects.professional_id],
      references: [profiles.id],
    }),
  })
);

export const quotesRelations = drizzleRelations(quotes, ({ one }) => ({
  project: one(projects, {
    fields: [quotes.project_id],
    references: [projects.id],
  }),
}));

// Relações para despesas e categorias
export const expensesRelations = drizzleRelations(ExpensesTable, ({ one }) => ({
  category: one(CategoriesTable, {
    fields: [ExpensesTable.categoryId],
    references: [CategoriesTable.id],
  }),
  user: one(profiles, {
    fields: [ExpensesTable.userId],
    references: [profiles.id],
  }),
}));

// Relações para planos
export const userPlansRelations = drizzleRelations(
  userPlansTable,
  ({ one }) => ({
    user: one(profiles, {
      fields: [userPlansTable.userId],
      references: [profiles.id],
    }),
  })
);

// Relações para equipes
export const teamsRelations = drizzleRelations(teamsTable, ({ one, many }) => ({
  owner: one(profiles, {
    fields: [teamsTable.ownerId],
    references: [profiles.id],
  }),
  members: many(teamMembersTable),
}));

export const teamMembersRelations = drizzleRelations(
  teamMembersTable,
  ({ one }) => ({
    team: one(teamsTable, {
      fields: [teamMembersTable.teamId],
      references: [teamsTable.id],
    }),
    user: one(profiles, {
      fields: [teamMembersTable.userId],
      references: [profiles.id],
    }),
  })
);

export const aiMessagesHistory = pgTable(
  "ai_messages_history",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    userId: text("user_id").notNull(),
    tipoProjeto: text("tipo_projeto").notNull(),
    estado: text("estado").notNull(),
    metragem: numeric("metragem").notNull(),
    valorInformado: numeric("valor_informado").notNull(),
    margem: numeric("margem").notNull(),
    cubAtual: numeric("cub_atual").notNull(),
    sugestao: text("sugestao").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => {
    return {
      idxAiMessagesHistoryUserId: index("idx_ai_messages_history_user_id").on(
        table.userId
      ),
    };
  }
);

// Tabela de fases do orçamento
export const budgetPhases = pgTable("budget_phases", {
  id: uuid("id").defaultRandom().primaryKey(),
  budget_id: uuid("budget_id").references(() => budgets.id, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(),
  description: text("description"),
  base_value: decimal("base_value", { precision: 12, scale: 2 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Tabela de segmentos das fases
export const budgetSegments = pgTable("budget_segments", {
  id: uuid("id").defaultRandom().primaryKey(),
  phase_id: uuid("phase_id").references(() => budgetPhases.id, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(),
  description: text("description"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Tabela de atividades
export const budgetActivities = pgTable("budget_activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  phase_id: uuid("phase_id").references(() => budgetPhases.id, {
    onDelete: "cascade",
  }),
  segment_id: uuid("segment_id").references(() => budgetSegments.id, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(),
  description: text("description"),
  time: decimal("time", { precision: 12, scale: 2 }), // Tempo em horas
  cost_per_hour: decimal("cost_per_hour", { precision: 12, scale: 2 }),
  total_cost: decimal("total_cost", { precision: 12, scale: 2 }),
  complexity: integer("complexity"), // 1-5
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Tabela de valores adicionais do orçamento
export const budgetAdditionals = pgTable("budget_additionals", {
  id: uuid("id").defaultRandom().primaryKey(),
  budget_id: uuid("budget_id").references(() => budgets.id, {
    onDelete: "cascade",
  }),
  wet_area_quantity: integer("wet_area_quantity"),
  dry_area_quantity: integer("dry_area_quantity"),
  wet_area_percentage: decimal("wet_area_percentage", {
    precision: 5,
    scale: 2,
  }),
  delivery_time: integer("delivery_time"), // Em dias
  disable_delivery_charge: boolean("disable_delivery_charge").default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});
