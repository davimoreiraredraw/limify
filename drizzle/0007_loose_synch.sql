ALTER TABLE "budgets" ALTER COLUMN "total" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "budgets" ALTER COLUMN "average_price_per_m2" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "budgets" ALTER COLUMN "discount" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "budgets" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "budgets" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "budgets" ADD COLUMN "user_id" text NOT NULL;