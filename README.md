# Proof of Scoop

Proof of Scoop is a small consumer ice-cream directory. Anyone can browse and
read reviews; verified contributors can submit one. The POC deliberately keeps
the Web3 details behind a normal consumer experience.

## Current status

This repository currently contains the Issue #1 foundation: a responsive
landing page, the Rainbow Cone design system, local tooling, CI, and setup
documentation. Authentication, database, shops, reviews, and verification are
tracked in the linked GitHub issues and are not implemented yet.

For the Issue #2 Privy account shell, set `NEXT_PUBLIC_PRIVY_APP_ID` in `.env.local`, enable email login and Ethereum embedded wallets in Privy, and add your local/deployed origins before testing sign-in.

## Local development

1. Use Node.js 22 or later.
2. Copy `.env.example` to `.env.local` and fill only the values needed by the
   issue you are working on. Do not commit `.env.local`.
3. Install dependencies with `npm install`.
4. Start the app with `npm run dev`.

Useful checks:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Architecture direction

The intended POC flow is:

```text
Browser → Next.js app → server-side Privy token verification → Postgres
                 ↘ Privy embedded wallet → Base USDC balance/transaction check
```

Privy authenticates users. The database owns application permissions, keyed by
the Privy DID; a wallet address is an attribute, never the primary user ID.

## Scope

The POC proves sign-in, embedded-wallet creation, internal user records,
balance display, verification status, and verified-only reviews. It does not
include rewards, treasury payouts, reputation, voting, referrals, staking,
smart contracts, or production tax logic.

See [plan.md](./plan.md) for the implementation order and [UserToDo.md](./UserToDo.md)
for the external account setup required when deploying a fork.
