CREATE TABLE IF NOT EXISTS "budget_phases" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "budget_id" uuid REFERENCES "budgets"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "description" text,
  "base_value" numeric(12, 2),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "budget_segments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "phase_id" uuid REFERENCES "budget_phases"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "description" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "budget_activities" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "phase_id" uuid REFERENCES "budget_phases"("id") ON DELETE CASCADE,
  "segment_id" uuid REFERENCES "budget_segments"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "description" text,
  "time" numeric(12, 2),
  "cost_per_hour" numeric(12, 2),
  "total_cost" numeric(12, 2),
  "complexity" integer,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "budget_additionals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "budget_id" uuid REFERENCES "budgets"("id") ON DELETE CASCADE,
  "wet_area_quantity" integer,
  "dry_area_quantity" integer,
  "wet_area_percentage" numeric(5, 2),
  "delivery_time" integer,
  "disable_delivery_charge" boolean DEFAULT false,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
); 