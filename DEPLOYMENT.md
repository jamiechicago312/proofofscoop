# Deployment checklist

This guide deploys the current Proof of Scoop POC to Vercel Hobby without
committing credentials. It assumes a Neon Postgres database and a Privy app.

## One-time provider setup

1. Create a Privy app with email login and Ethereum embedded wallets enabled.
2. Add local development, the stable Vercel project domain, and the current
   Preview/Production HTTPS origins to Privy's allowed origins.
3. Create a Neon database and copy its pooled connection string.
4. Create or connect a Vercel project to this repository. No special build
   command is required: Vercel detects Next.js and runs the package scripts.

## Environment variables

Set the following in Vercel under Project Settings → Environment Variables.
Select Preview and Production as appropriate; use separate databases for
development and production when possible.

| Variable | Scope | Value |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Browser-safe | Exact HTTPS origin for the environment |
| `NEXT_PUBLIC_PRIVY_APP_ID` | Browser-safe | Privy app ID |
| `PRIVY_JWT_VERIFICATION_KEY` | Server-only | Privy PEM public key or JSON JWK |
| `DATABASE_URL` | Server-only | Neon pooled Postgres URL |

Never commit `.env.local`, database URLs, Privy keys, or tokens. The
`NEXT_PUBLIC_` prefix is intentional only for values that the browser needs.

## Database release

Run migrations from a trusted local shell with the target `DATABASE_URL`:

```bash
npm ci
npm run db:migrate
npm run db:seed
```

The migration script applies every numeric SQL file in `drizzle/` in order,
using one transaction per file. Run it before the first deployment and when a
new migration is added. Vercel builds do not mutate the database.

## Verification

After redeploying, verify the following over HTTPS:

1. Public shop listing and shop detail pages load.
2. Privy sign-in succeeds and the account page shows the user and wallet.
3. A non-verified user is blocked from submitting a review.
4. Development mock verification is unavailable in Production and is labeled
   as non-payment in non-production environments.
5. After verification in the supported environment, a review can be created
   and appears on the shop page.

Record the deployment URL, migration result, and any step not run due to
Vercel Hobby access limitations in the pull request. Do not claim a hosted
check passed based only on a local build.
