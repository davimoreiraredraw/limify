DO $$ BEGIN
 CREATE TYPE "budget_status" AS ENUM('gerado', 'publicado', 'aceito');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "budgets" ADD COLUMN "status" "budget_status" DEFAULT 'gerado';