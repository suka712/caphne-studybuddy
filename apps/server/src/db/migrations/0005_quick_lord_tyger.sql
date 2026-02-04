ALTER TABLE "email_collection" ALTER COLUMN "collected_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "bio" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "bio" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET NOT NULL;