ALTER TABLE "email_collection" ALTER COLUMN "collected_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "email_collection" ALTER COLUMN "collected_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "matches" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "matches" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "matches" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT now();