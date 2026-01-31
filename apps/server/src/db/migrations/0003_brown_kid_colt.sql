CREATE TABLE "profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"display_name" text NOT NULL,
	"gender" text NOT NULL,
	"birthday" date,
	"year" text NOT NULL,
	"major" text NOT NULL,
	"bio" text,
	"photo_url" text,
	"is_public" boolean DEFAULT false,
	"goals" text[],
	"vibes" text[],
	"interests" text[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "username";