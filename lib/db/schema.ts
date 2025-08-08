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
  serial,
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
  userId: text("user_id").notNull(),
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

// Enum específico para status de orçamentos
export const budgetStatusEnum = pgEnum("budget_status", [
  "gerado",
  "publicado",
  "aceito",
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
  name: text("name").notNull(),
  color: text("color").notNull(),
  userId: text("user_id"),
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
  userId: text("user_id").notNull(),
  isFixed: boolean("is_fixed").notNull().default(true),
  isActive: boolean("is_active").notNull().default(true),
  isArchived: boolean("is_archived").notNull().default(false),
  isDeleted: boolean("is_deleted").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tabela de orçamentos
export const budgets = pgTable("budgets", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  client_id: uuid("client_id").references(() => clientsTable.id),
  model: text("model"), // interior ou exterior
  budget_type: text("budget_type").notNull(), // complete, render, etc
  value_type: text("value_type"), // individual ou unico
  total: decimal("total", { precision: 10, scale: 2 }).default("0"),
  user_id: text("user_id").notNull(),
  status: budgetStatusEnum("status").default("gerado"),
  is_deleted: boolean("is_deleted").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  average_price_per_m2: decimal("average_price_per_m2", {
    precision: 10,
    scale: 2,
  }),
  discount: decimal("discount", { precision: 10, scale: 2 }),
  discount_type: text("discount_type"),
  // Campos específicos para orçamentos de render
  base_value: decimal("base_value", { precision: 10, scale: 2 }),
  complexity_percentage: decimal("complexity_percentage", {
    precision: 5,
    scale: 2,
  }),
  delivery_time_percentage: decimal("delivery_time_percentage", {
    precision: 5,
    scale: 2,
  }),
  delivery_time_days: integer("delivery_time_days"),
});

// Tabela de itens do orçamento (ambientes)
export const budgetItems = pgTable("budget_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  budget_id: uuid("budget_id")
    .references(() => budgets.id)
    .notNull(),
  name: text("name").notNull(),
  description: text("description"),
  // Campos para orçamentos por m²
  price_per_m2: decimal("price_per_m2", { precision: 12, scale: 2 }),
  square_meters: decimal("square_meters", { precision: 12, scale: 2 }),
  // Campos específicos para orçamentos de render
  development_time: integer("development_time"),
  images_quantity: integer("images_quantity"),
  complexity_level: text("complexity_level"), // sem, baixa, media, alta
  total: decimal("total", { precision: 10, scale: 2 }).default("0"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
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
  ownerId: text("owner_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tabela de membros da equipe
export const teamMembersTable = pgTable("team_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id")
    .references(() => teamsTable.id)
    .notNull(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  role: teamRoleEnum("role").default("member").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tabela de convites pendentes
export const teamInvitesTable = pgTable("team_invites", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id")
    .references(() => teamsTable.id)
    .notNull(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  role: teamRoleEnum("role").default("member").notNull(),
  invitedBy: text("invited_by").notNull(),
  status: text("status").default("pending").notNull(),
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

// Relações para convites
export const teamInvitesRelations = drizzleRelations(
  teamInvitesTable,
  ({ one }) => ({
    team: one(teamsTable, {
      fields: [teamInvitesTable.teamId],
      references: [teamsTable.id],
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

// Schema para projetos do portfólio
export const portfolioProjects = pgTable("portfolio_projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const portfolioImages = pgTable("portfolio_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  project_id: uuid("project_id").references(() => portfolioProjects.id, {
    onDelete: "cascade",
  }),
  url: text("url").notNull(),
  is_cover: boolean("is_cover").default(false),
  created_at: timestamp("created_at").defaultNow(),
});

// Schema para depoimentos do portfólio
export const portfolioTestimonials = pgTable("portfolio_testimonials", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: text("user_id").notNull(),
  client_name: text("client_name").notNull(),
  company: text("company"),
  profession: text("profession"),
  testimonial: text("testimonial").notNull(),
  rating: integer("rating").notNull(),
  photo_url: text("photo_url"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Schema para scripts de apresentação do portfólio
export const portfolioScripts = pgTable("portfolio_scripts", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: text("user_id").notNull(),
  header_script: text("header_script"),
  footer_script: text("footer_script"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const portfolioBrand = pgTable("portfolio_brand", {
  id: serial("id").primaryKey(),
  user_id: text("user_id").notNull().unique(),
  about: text("about"),
  logo_url: text("logo_url"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Tabela para valores da Sinduscon por estado
export const sindusconValues = pgTable("sinduscon_values", {
  id: uuid("id").defaultRandom().primaryKey(),
  estado: text("estado").notNull(),
  r1: decimal("r1", { precision: 10, scale: 2 }),
  pp4: decimal("pp4", { precision: 10, scale: 2 }),
  r8: decimal("r8", { precision: 10, scale: 2 }),
  r16: decimal("r16", { precision: 10, scale: 2 }),
  mes: integer("mes").notNull(), // 1-12
  ano: integer("ano").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Tipos para a tabela de valores da Sinduscon
export type SindusconValue = InferSelectModel<typeof sindusconValues>;
export type NewSindusconValue = InferInsertModel<typeof sindusconValues>;
