CREATE TABLE "shops" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "city" text NOT NULL,
  "country" text NOT NULL,
  "address" text,
  "description" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "reviews" (
  "id" text PRIMARY KEY NOT NULL,
  "shop_id" text NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "rating" integer NOT NULL CHECK ("rating" BETWEEN 1 AND 5),
  "body" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX "reviews_shop_id_idx" ON "reviews" ("shop_id");
CREATE INDEX "reviews_user_id_idx" ON "reviews" ("user_id");

CREATE TABLE "verification_events" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "source" text NOT NULL CHECK ("source" IN ('mock', 'stripe_sandbox', 'onchain')),
  "provider_reference" text UNIQUE,
  "transaction_hash" text UNIQUE,
  "status" text NOT NULL CHECK ("status" IN ('pending', 'confirmed', 'failed')),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "confirmed_at" timestamptz
);
CREATE INDEX "verification_events_user_id_idx" ON "verification_events" ("user_id");
