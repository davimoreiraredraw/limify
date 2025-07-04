CREATE TABLE IF NOT EXISTS "portfolio_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid,
	"url" text NOT NULL,
	"is_cover" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DROP TABLE "portfolio_project_images";--> statement-breakpoint
ALTER TABLE "portfolio_projects" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "portfolio_projects" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "portfolio_testimonials" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "portfolio_testimonials" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "portfolio_testimonials" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "portfolio_images" ADD CONSTRAINT "portfolio_images_project_id_portfolio_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "portfolio_projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
