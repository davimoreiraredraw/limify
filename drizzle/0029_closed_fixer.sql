CREATE TABLE IF NOT EXISTS "sinduscon_values" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"estado" text NOT NULL,
	"r1" numeric(10, 2),
	"pp4" numeric(10, 2),
	"r8" numeric(10, 2),
	"r16" numeric(10, 2),
	"mes" integer NOT NULL,
	"ano" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
