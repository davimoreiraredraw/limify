CREATE TABLE IF NOT EXISTS "portfolio_testimonials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"client_name" text NOT NULL,
	"company" text,
	"profession" text,
	"testimonial" text NOT NULL,
	"rating" integer NOT NULL,
	"photo_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
