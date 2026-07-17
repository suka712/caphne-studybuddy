CREATE TYPE "public"."swipe_decision" AS ENUM('like', 'pass');--> statement-breakpoint
CREATE TABLE "swipes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"target_user_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"decision" "swipe_decision" NOT NULL,
	CONSTRAINT "swipes_unique" UNIQUE("user_id","target_user_id")
);
--> statement-breakpoint
ALTER TABLE "swipes" ADD CONSTRAINT "swipes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swipes" ADD CONSTRAINT "swipes_target_user_id_users_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;