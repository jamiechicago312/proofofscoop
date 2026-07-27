CREATE TABLE "users" (
  "id" text PRIMARY KEY NOT NULL,
  "privy_user_id" text NOT NULL UNIQUE,
  "wallet_address" text,
  "display_name" text,
  "verification_status" text NOT NULL DEFAULT 'unverified',
  "verified_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
