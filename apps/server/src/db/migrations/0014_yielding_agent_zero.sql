CREATE TABLE "daily_batches" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"batch_date" date NOT NULL,
	"candidate_user_ids" integer[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "daily_batches_user_date_unique" UNIQUE("user_id","batch_date")
);
--> statement-breakpoint
ALTER TABLE "daily_batches" ADD CONSTRAINT "daily_batches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;