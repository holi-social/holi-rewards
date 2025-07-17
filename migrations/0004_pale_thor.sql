ALTER TABLE "transaction" ALTER COLUMN "reward_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."reward_type";--> statement-breakpoint
CREATE TYPE "public"."reward_type" AS ENUM('ChallengeSubmitted', 'GoodDeedPostCreated');--> statement-breakpoint
ALTER TABLE "transaction" ALTER COLUMN "reward_type" SET DATA TYPE "public"."reward_type" USING "reward_type"::"public"."reward_type";