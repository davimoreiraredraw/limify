import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  integer,
  foreignKey,
  numeric,
  boolean,
  varchar,
  index,
  unique,
  serial,
} from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";
export const aalLevel = pgEnum("aal_level", ["aal1", "aal2", "aal3"]);
export const codeChallengeMethod = pgEnum("code_challenge_method", [
  "s256",
  "plain",
]);
export const factorStatus = pgEnum("factor_status", ["unverified", "verified"]);
export const factorType = pgEnum("factor_type", ["totp", "webauthn", "phone"]);
export const oneTimeTokenType = pgEnum("one_time_token_type", [
  "confirmation_token",
  "reauthentication_token",
  "recovery_token",
  "email_change_token_new",
  "email_change_token_current",
  "phone_change_token",
]);
export const planType = pgEnum("plan_type", [
  "free",
  "basic",
  "expert",
  "business",
]);
export const status = pgEnum("status", ["pending", "in_progress", "completed"]);
export const teamRole = pgEnum("team_role", ["owner", "admin", "member"]);
export const action = pgEnum("action", [
  "INSERT",
  "UPDATE",
  "DELETE",
  "TRUNCATE",
  "ERROR",
]);
export const equalityOp = pgEnum("equality_op", [
  "eq",
  "neq",
  "lt",
  "lte",
  "gt",
  "gte",
  "in",
]);

export const portfolioProjects = pgTable("portfolio_projects", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  userId: uuid("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
});

export const portfolioTestimonials = pgTable("portfolio_testimonials", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  userId: text("user_id").notNull(),
  clientName: text("client_name").notNull(),
  company: text("company"),
  profession: text("profession"),
  testimonial: text("testimonial").notNull(),
  rating: integer("rating").notNull(),
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
});

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  userId: text("user_id"),
});

export const expenses = pgTable("expenses", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: text("name").notNull(),
  description: text("description"),
  value: numeric("value", { precision: 12, scale: 2 }).notNull(),
  frequency: text("frequency").default("Mensal").notNull(),
  compensationDay: integer("compensation_day"),
  categoryId: uuid("category_id").references(() => categories.id),
  isFixed: boolean("is_fixed").default(true).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
  userId: text("user_id").notNull(),
});

export const clients = pgTable("clients", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: text("name").notNull(),
  company: text("company"),
  email: text("email"),
  phone: varchar("phone", { length: 20 }),
  document: varchar("document", { length: 20 }),
  additionalInfo: text("additional_info"),
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

export const portfolioScripts = pgTable("portfolio_scripts", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  userId: text("user_id").notNull(),
  headerScript: text("header_script"),
  footerScript: text("footer_script"),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
});

export const quotes = pgTable("quotes", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  projectId: uuid("project_id").references(() => projects.id),
  name: text("name").notNull(),
  description: text("description"),
  value: numeric("value", { precision: 10, scale: 2 }).default("0"),
  status: status("status").default("pending"),
  analyticsGenerated: boolean("analytics_generated").default(false),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
});

export const userPlans = pgTable("user_plans", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => profiles.id),
  planType: planType("plan_type").default("free").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripePriceId: text("stripe_price_id"),
  status: varchar("status", { length: 20 }).default("active"),
  quotaOrcamentos: integer("quota_orcamentos"),
  quotaAlteracoes: integer("quota_alteracoes"),
  quotaUsuarios: integer("quota_usuarios"),
  quotaClientes: integer("quota_clientes"),
  startDate: timestamp("start_date", { mode: "string" }).defaultNow(),
  endDate: timestamp("end_date", { mode: "string" }),
  trialEndsAt: timestamp("trial_ends_at", { mode: "string" }),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

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

export const profiles = pgTable("profiles", {
  id: text("id").primaryKey().notNull(),
  name: text("name"),
  email: text("email"),
  image: text("image"),
  userType: text("user_type"),
  whatsapp: varchar("whatsapp", { length: 20 }),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
});

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: text("name").notNull(),
  description: text("description"),
  clientId: text("client_id").references(() => profiles.id),
  professionalId: text("professional_id").references(() => profiles.id),
  status: status("status").default("pending"),
  totalValue: numeric("total_value", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
});

export const teamMembers = pgTable("team_members", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teams.id),
  userId: text("user_id").notNull(),
  role: teamRole("role").default("member").notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

export const teams = pgTable("teams", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: text("name").notNull(),
  ownerId: text("owner_id").notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

export const portfolioBrand = pgTable(
  "portfolio_brand",
  {
    id: serial("id").primaryKey().notNull(),
    userId: text("user_id").notNull(),
    about: text("about"),
    logoUrl: text("logo_url"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  (table) => {
    return {
      portfolioBrandUserIdUnique: unique("portfolio_brand_user_id_unique").on(
        table.userId
      ),
    };
  }
);

export const budgetPhases = pgTable("budget_phases", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  budgetId: uuid("budget_id").references(() => budgets.id, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(),
  description: text("description"),
  baseValue: numeric("base_value", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

export const budgets = pgTable("budgets", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: text("name").notNull(),
  description: text("description"),
  clientId: uuid("client_id").references(() => clients.id),
  model: text("model"),
  budgetType: text("budget_type").notNull(),
  valueType: text("value_type"),
  total: numeric("total", { precision: 10, scale: 2 }).default("0"),
  averagePricePerM2: numeric("average_price_per_m2", {
    precision: 10,
    scale: 2,
  }),
  discount: numeric("discount", { precision: 10, scale: 2 }),
  discountType: text("discount_type"),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  userId: text("user_id").notNull(),
  baseValue: numeric("base_value", { precision: 10, scale: 2 }),
  complexityPercentage: numeric("complexity_percentage", {
    precision: 5,
    scale: 2,
  }),
  deliveryTimePercentage: numeric("delivery_time_percentage", {
    precision: 5,
    scale: 2,
  }),
  deliveryTimeDays: integer("delivery_time_days"),
});

export const portfolioImages = pgTable("portfolio_images", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  projectId: uuid("project_id").references(() => portfolioProjects.id, {
    onDelete: "cascade",
  }),
  url: text("url").notNull(),
  isCover: boolean("is_cover").default(false),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
});

export const budgetAdditionals = pgTable("budget_additionals", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  budgetId: uuid("budget_id").references(() => budgets.id, {
    onDelete: "cascade",
  }),
  wetAreaQuantity: integer("wet_area_quantity"),
  dryAreaQuantity: integer("dry_area_quantity"),
  wetAreaPercentage: numeric("wet_area_percentage", { precision: 5, scale: 2 }),
  deliveryTime: integer("delivery_time"),
  disableDeliveryCharge: boolean("disable_delivery_charge").default(false),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

export const budgetItems = pgTable("budget_items", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  budgetId: uuid("budget_id")
    .notNull()
    .references(() => budgets.id),
  name: text("name").notNull(),
  description: text("description"),
  pricePerM2: numeric("price_per_m2", { precision: 12, scale: 2 }),
  squareMeters: numeric("square_meters", { precision: 12, scale: 2 }),
  total: numeric("total", { precision: 10, scale: 2 }).default("0"),
  developmentTime: integer("development_time"),
  imagesQuantity: integer("images_quantity"),
  complexityLevel: text("complexity_level"),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
});

export const budgetReferences = pgTable("budget_references", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  budgetId: uuid("budget_id").references(() => budgets.id),
  projectName: text("project_name").notNull(),
});

export const budgetActivities = pgTable("budget_activities", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  phaseId: uuid("phase_id").references(() => budgetPhases.id, {
    onDelete: "cascade",
  }),
  segmentId: uuid("segment_id").references(() => budgetSegments.id, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(),
  description: text("description"),
  time: numeric("time", { precision: 12, scale: 2 }),
  costPerHour: numeric("cost_per_hour", { precision: 12, scale: 2 }),
  totalCost: numeric("total_cost", { precision: 12, scale: 2 }),
  complexity: integer("complexity"),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

export const budgetSegments = pgTable("budget_segments", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  phaseId: uuid("phase_id").references(() => budgetPhases.id, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});
