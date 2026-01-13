CREATE TABLE "email_collection" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"collected_at" timestamp DEFAULT now(),
	CONSTRAINT "email_collection_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
