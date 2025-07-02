ALTER TABLE "budget_items" ALTER COLUMN "budget_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "budget_items" ALTER COLUMN "total" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "budget_items" ALTER COLUMN "total" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "budgets" ALTER COLUMN "budget_type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "budgets" ALTER COLUMN "total" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "budgets" ALTER COLUMN "total" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "budgets" ALTER COLUMN "average_price_per_m2" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "budgets" ALTER COLUMN "discount" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "budget_items" ADD COLUMN "development_time" integer;--> statement-breakpoint
ALTER TABLE "budget_items" ADD COLUMN "images_quantity" integer;--> statement-breakpoint
ALTER TABLE "budget_items" ADD COLUMN "complexity_level" text;--> statement-breakpoint
ALTER TABLE "budget_items" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "budget_items" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "budgets" ADD COLUMN "base_value" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "budgets" ADD COLUMN "complexity_percentage" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "budgets" ADD COLUMN "delivery_time_percentage" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "budgets" ADD COLUMN "delivery_time_days" integer;