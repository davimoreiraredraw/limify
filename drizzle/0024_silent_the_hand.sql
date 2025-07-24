ALTER TABLE "expenses" ALTER COLUMN "value" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "frequency" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "category_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;