# Repository guidance

## Proof of Scoop

- Keep the POC honest: mock verification and sandbox balances must be labeled
  clearly and must not be presented as real payments.
- Never commit `.env.local`, provider credentials, database URLs, or tokens.
- Keep auth and verification decisions server-side; browser state is not an
  authorization boundary.
- For Vercel Hobby deployments, treat deployment and preview availability as
  operator-dependent. Verify the app with `npm run lint`, `npm run typecheck`,
  `npm test`, and `npm run build` locally when hosted deployment access or
  team/project features are unavailable. Record any unverified hosted step in
  the issue or pull request instead of claiming it passed.

## Checks

Run all four commands above before opening or merging a change that affects
application behavior.
