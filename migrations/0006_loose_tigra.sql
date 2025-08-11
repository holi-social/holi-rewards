CREATE TABLE "external_counter_value" (
	"created_at" timestamp with time zone PRIMARY KEY DEFAULT now() NOT NULL,
	"external_count" integer NOT NULL
);
