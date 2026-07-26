# User setup checklist

This file contains the accounts, access, and one-time actions that the person
deploying an instance of Proof of Scoop must complete. If you fork this
repository, use your own provider projects and credentials—access to the
original project's services does not transfer with the code.

You can build locally with mock verification while the optional payment and
on-chain items are pending.

## Required before the hosted integration demo

- [ ] **GitHub:** enable Issues in your fork and authenticate your development
  environment with repository issue-write access if you want to create or
  maintain the project backlog. A classic token needs `repo`; a fine-grained
  token needs `Issues: Read and write` for this repository.
- [ ] **Privy:** create a development app at [Privy](https://www.privy.io/),
  enable email and/or Google login, enable embedded wallets, and add local and
  Vercel deployment URLs to the allowed-origin configuration. Share the app ID
  and server-side app secret through the deployment secret manager—never commit
  them to the repository.
- [ ] **Database:** create a Postgres database (recommended: Neon or
  Supabase), then add its pooled `DATABASE_URL` and direct connection URL (if
  the selected ORM/migration workflow needs one) as local and Vercel secrets.
- [ ] **Vercel:** create or connect a Vercel project, import your repository,
  and grant deployer access. Add the same database and Privy environment
  variables there.

## Needed only for the real USDC demonstration

- [ ] **Base wallet/funds:** use a wallet you control to obtain a small amount
  of Base ETH for gas and USDC on Base. This wallet funds the test user's
  Privy embedded wallet; use only an amount you are comfortable treating as a
  demo expense.
- [ ] **Block explorer:** no account is required. The final demo can link the
  verified transaction to BaseScan.

## Optional / do not block development

- [ ] **Stripe Crypto Onramp:** apply for access only after the Privy and mock
  verification flows work. Approval and available sandbox behavior can vary.
  Do not represent sandbox funds as real or spendable USDC.
- [ ] **Google OAuth:** if Google sign-in is desired rather than email-only,
  create OAuth credentials in Google Cloud and add the redirect URI specified
  by Privy. Email login alone is sufficient for the POC.

## Safety notes

- Keep all keys in `.env.local` locally and in Vercel environment variables
  for deployments. `.env*` is already ignored by Git.
- Use distinct Privy, database, and Stripe projects for development versus any
  later production release. Do not reuse another fork's provider projects.
- Share access through the relevant provider's team/project controls rather
  than pasting long-lived secrets into GitHub issues or pull requests.
