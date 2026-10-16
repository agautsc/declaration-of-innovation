# Signing endpoint

A Cloudflare Worker that lets people sign without a GitHub account. The form on the site
posts here, and the Worker files the signature as a GitHub issue labeled `signature` (or
`community`). Nothing appears on the site until a maintainer adds the `approved` label.

## Deploy

From this folder:

```sh
npx wrangler login
npx wrangler deploy
npx wrangler secret put GITHUB_TOKEN
```

`GITHUB_TOKEN` is a fine-grained personal access token limited to this one repository,
with **Issues: Read and write** and nothing else. Note its expiry date: when it lapses,
the form returns "That did not go through" until a new token is set.

`wrangler deploy` prints the Worker's address. The form's `action` in `index.html` must
point at `<that address>/sign`.

## Spam

A hidden honeypot field catches simple bots, and nothing is published without review. If
spam starts filling the issue list, add Cloudflare Turnstile next.

## Test locally

```sh
npx wrangler dev
curl -s -X POST localhost:8787/sign -H 'Accept: application/json' \
  -F kind=person -F name='Test Person' -F location='Atlanta, GA' -F statement='Testing.'
```

Without a token in `.dev.vars`, the last step returns the "did not go through" error, which
still exercises everything up to the GitHub call.
