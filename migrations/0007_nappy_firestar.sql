CREATE TABLE "unlocked_badge" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"badge_slug" varchar(255) NOT NULL,
	"unlocked_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unlocked_badge_user_id_badge_slug_unique" UNIQUE("user_id","badge_slug")
);
--> statement-breakpoint
CREATE INDEX "unlocked_badge_user_id_index" ON "unlocked_badge" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "unlocked_badge_badge_slug_index" ON "unlocked_badge" USING btree ("badge_slug");