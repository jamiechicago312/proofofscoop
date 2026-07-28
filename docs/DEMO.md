# Proof of Scoop demonstration

This is the repeatable POC walkthrough. It uses the current implementation's
development mock verification; it does not claim that a mock event is a real
payment or that Stripe sandbox funds are spendable USDC.

## Prepare

1. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_PRIVY_APP_ID`,
   `PRIVY_JWT_VERIFICATION_KEY`, and `DATABASE_URL`.
2. Configure email login and Ethereum embedded wallets in Privy. Add
   `http://localhost:3000` to Privy's allowed origins and enable “Return user
   data in an identity token” under User management → Authentication →
   Advanced. Set `NEXT_PUBLIC_VERIFICATION_RECIPIENT_ADDRESS` to an address
   you control.
3. Run the database setup from the repository root:

   ```bash
   npm ci
   npm run db:migrate
   npm run db:seed
   npm run dev
   ```

## Walkthrough

1. **Public browse** — open `http://localhost:3000/shops`, choose a seeded
   shop, and confirm its description and existing reviews are visible without
   signing in.
2. **Sign in** — open `/account`, choose “Sign in”, and complete the Privy
   email flow. Confirm the page shows the Privy DID and embedded wallet.
3. **Balance** — confirm Base USDC and Base ETH are displayed when the public
   Base RPC is available. These are read-only informational balances.
4. **Blocked review** — open a shop while signed in and try to submit a review.
   The server must return “Verification is required…” because the new user is
   not verified.
5. **Real verification** — open `/verify`, review the recipient address, and
   select “Send $1 USDC to verify”. Approve the transaction on Base mainnet.
   The UI should show pending while the receipt is unavailable, then confirmed
   only after the server validates the sender, contract, recipient, amount,
   Transfer log, and successful receipt.
6. **Blocked or development verification** — an unverified user remains blocked
   until the real payment confirms. Outside production, the mock button remains
   available for local testing and explicitly says it is not payment proof.
7. **Successful review** — return to the shop, submit a rating and at least
   10 characters of text, then refresh. The new review should appear.

## Honest status matrix

| Flow | Current status | What it proves |
| --- | --- | --- |
| Public browse | Implemented | Catalog and review reads work without auth |
| Privy sign-in | Implemented when configured | A user can authenticate and receive an embedded wallet |
| Base balance | Implemented | The UI can read current Base USDC/ETH balances |
| Mock verification | Development-only | Local review gating and server-side state transition |
| Real Base payment verification | Implemented | Server confirms an exact 1 USDC Base mainnet transfer |
| Stripe Crypto Onramp | Optional/deferred | No Stripe session or webhook integration exists |

## Troubleshooting

- If the sign-in control is missing, check `NEXT_PUBLIC_PRIVY_APP_ID` and the
  allowed origin.
- If API requests return authentication errors, check the server-side Privy
  verification key and restart the dev server after changing `.env.local`.
- If shops do not load, run `npm run db:migrate` and `npm run db:seed`, then
  confirm `DATABASE_URL` points to the same database used by the app.
- Mock verification is intentionally disabled when `NODE_ENV=production`.
- If identity-token verification fails, enable Privy's “Return user data in an
  identity token” setting and refresh the page before retrying.
