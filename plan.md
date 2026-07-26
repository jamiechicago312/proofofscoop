# Proof of Scoop POC plan

## Goal

Build a bare-bones ice-cream directory that proves Privy sign-in and embedded
wallets, server-verified internal users, a wallet balance, a simple
verification action, and verified-only review creation.

The experience should feel like a consumer app: anyone can read reviews; a
user verifies once before contributing. The stable identity relationship is:

```text
Privy DID → internal user record → verification status
```

Wallet addresses are user attributes, not user IDs.

## Delivery order

1. Foundation: Next.js, documentation, theme, environment template, and CI.
2. Privy sign-in and embedded wallet display.
3. Postgres schema and server-side user synchronization by Privy DID.
4. Shops, reviews, and repeatable seed data.
5. Public shop directory and shop detail pages.
6. Server-enforced verified-only review creation.
7. Wallet address and Base USDC balance.
8. Idempotent mock verification for development.
9. Server-confirmed real Base USDC transaction for the final demo.
10. Optional Stripe Crypto Onramp sandbox only if access is approved.
11. Tests, accessibility, responsive polish, deployment, and demo materials.

## Minimal data model

- `users`: internal ID, Privy user ID, wallet address, display name,
  verification status, verified timestamp, timestamps.
- `shops`: name, slug, city, country, address, description, timestamps.
- `reviews`: shop ID, user ID, rating, body, timestamps.
- `verification_events`: user ID, source, provider reference, transaction
  hash, pending/confirmed/failed status, timestamps.

## Security rules

- Verify every Privy access token on the server.
- Do not trust browser-provided wallet addresses, payment status, or
  transaction hashes.
- Make user synchronization and verification event handling idempotent.
- Only verified users may create reviews; users may change only their own.
- Store provider event IDs and transaction hashes.

## Deliberate non-goals

Do not add reward distribution, community treasury payouts, competitions,
weighted voting, reputation, anti-Sybil systems, staking, smart contracts,
complex referrals, or multi-category expansion before the core POC works.

## Demo definition of done

The demo reliably shows public browsing, Privy sign-in, an embedded wallet,
the wallet balance, a blocked unverified review attempt, verification status
changing, and a successful review. A real Base USDC transaction is tested;
Stripe sandbox is shown only if approved and always labeled honestly.
