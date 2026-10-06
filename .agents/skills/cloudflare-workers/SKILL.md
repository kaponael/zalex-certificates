---
name: cloudflare-workers
description: Configure, review, or release the Zalex Certificates Next.js app on Cloudflare Workers through OpenNext, Wrangler, or GitHub Workers Builds. Use when deployment or Cloudflare runtime configuration is in scope.
---

# Cloudflare Workers release workflow

Use this skill only when the user asks about Cloudflare configuration, GitHub-triggered builds, previewing on Workers, or deployment.

## Configuration map

- `open-next.config.ts` selects the `@opennextjs/cloudflare` adapter.
- `wrangler.jsonc` names the Worker, points at `.open-next/worker.js`, enables `nodejs_compat`, and maps `.open-next/assets` to `ASSETS`.
- `package.json` provides `dev`, `build`, `preview`, `deploy`, and type-generation scripts.
- `.open-next/` and `.wrangler/` are generated output/state. Never add these build directories to a commit.
- OpenNext on Windows has known filesystem limitations. If a local build hits Windows-specific permission errors in `.open-next`, prefer WSL or the Cloudflare GitHub build environment instead of deleting unrelated project files.

## API key handling

- API route handlers read the server-side `process.env.API_KEY` value and attach it to requests sent to the upstream certificate API.
- In local development, the developer may set `API_KEY` in the ignored `.env` file.
- In production, keep `API_KEY` as a Cloudflare Worker Secret under the Worker's **Settings → Variables and Secrets** section.
- Never put a real key in `wrangler.jsonc`, `vars`, a `NEXT_PUBLIC_` variable, a checked-in environment file, a build log, or a review response.
- Current request/list handlers use the key at request time. Add it as a build secret only if future static-generation/build code actually needs it.
- Preview Workers use separate settings from production. If preview builds must call the upstream API, configure a separate appropriate preview secret.

## GitHub Workers Builds

For the existing Worker, connect the GitHub repository under **Workers & Pages → Worker → Settings → Builds**. Confirm the production Worker name matches `wrangler.jsonc` and the production branch is the intended branch.

Use the OpenNext Workers Builds commands:

```text
Build command:  npx @opennextjs/cloudflare build
Deploy command: npx @opennextjs/cloudflare deploy
```

GitHub builds require the relevant config files to be committed: `wrangler.jsonc`, `open-next.config.ts`, and the package manifest/lockfile for the adapter and Wrangler versions. Keep `.env` out of Git; the production secret belongs to the Cloudflare Worker.

## Publishing policy

- `npm run preview` is for local Workers-runtime preview.
- `npm run deploy` publishes an active Worker version and is not a test command.
- Do not execute a deployment, change Cloudflare account settings, or rotate secrets unless that action is explicitly part of the user's request.
- After a requested release, report which mechanism was used and whether the deploy completed. Never include secret values.
