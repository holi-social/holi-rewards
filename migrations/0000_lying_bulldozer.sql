CREATE TYPE "public"."reward_type" AS ENUM('ChallengeSubmitted', 'PostCreated');--> statement-breakpoint
CREATE TABLE "transaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"reward_type" "reward_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
