ALTER TABLE "transaction" ADD COLUMN "reward_value" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
CREATE INDEX "transaction_user_id_index" ON "transaction" USING btree ("user_id");