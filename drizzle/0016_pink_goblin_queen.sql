ALTER TABLE "categories" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "value" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "frequency" SET DEFAULT 'Mensal';