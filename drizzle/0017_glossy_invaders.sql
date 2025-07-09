CREATE TABLE IF NOT EXISTS "portfolio_brand" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"about" text,
	"logo_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
