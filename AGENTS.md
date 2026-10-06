# Zalex Certificates — Repository Guide for Coding Agents

This file is the shared source of project instructions for Codex and other coding agents. Read it before making repository changes. It records the application's structure, data flow, conventions, security boundaries, and the intended AI-assisted review workflow.

## Project overview

Zalex Certificates is a Next.js App Router application for submitting certificate requests and browsing submitted requests. It uses TypeScript, React, Tailwind CSS, shadcn-style Base UI components, Lucide icons, Axios, and Cloudflare Workers through the OpenNext adapter.

The project has been developed iteratively with AI coding assistance. The repo-local Codex reviewer role and skills formalize repeatable implementation, review, and release workflows. The implementation agent makes scoped changes; the reviewer is read-only; the human developer decides whether findings are accepted and when a deployment is published.

## Source tree and responsibilities

```text
.
├── AGENTS.md                         # Shared repository rules and architecture guide
├── .codex/
│   ├── config.toml                   # Registers the project-local code-reviewer role
│   └── agents/
│       └── code-reviewer.toml        # Read-only code review role instructions
├── .agents/
│   └── skills/
│       ├── code-review/              # Repeatable review workflow and checklist
│       ├── request-certificate/      # Form, validation, and request-flow workflow
│       └── cloudflare-workers/       # Cloudflare secret and release workflow
├── src/
│   ├── api/
│   │   └── certificate-request-api.ts # Axios client for the app's own API routes
│   ├── app/
│   │   ├── api/
│   │   │   ├── certificate-list/route.ts      # Server proxy for API list requests
│   │   │   └── request-certificate/route.ts   # Server proxy for API submissions
│   │   ├── certificate-lists/
│   │   │   ├── page.tsx              # Loads, reconciles, and displays requests
│   │   │   └── data-table.tsx        # Page-specific filterable, sortable table
│   │   ├── request-certificate/page.tsx # Request form and submit orchestration
│   │   ├── page.tsx                  # Welcome page and primary navigation links
│   │   ├── layout.tsx                # Root HTML, fonts, sidebar, and toaster
│   │   ├── globals.css               # Global styles and theme tokens
│   │   └── icon.png                  # App favicon
│   ├── components/
│   │   ├── ui/                       # shadcn-style reusable UI primitives
│   │   ├── app-sidebar.tsx           # Main navigation and sidebar footer
│   │   ├── dark-mode-toggle.tsx      # Theme switching and persistence
│   │   ├── date-picker-field.tsx     # Reusable date-picker form field
│   │   ├── form-fields.tsx           # Shared input, textarea, label, error, counter
│   │   ├── page-header.tsx           # Consistent page title/header
│   │   └── certificate-status-badge.tsx # Status enum and badge-color mapping
│   ├── hooks/use-mobile.ts           # Responsive UI hook used by components
│   ├── lib/
│   │   ├── certificate-request-storage.ts # Browser persistence and local reference IDs
│   │   ├── certificate-request-validation.ts # Form validation rules
│   │   └── utils.ts                   # Shared UI utility functions
│   └── types/certificate-request.ts  # Shared request, API DTO, and form types
├── open-next.config.ts               # OpenNext Cloudflare adapter configuration
├── wrangler.jsonc                    # Worker name, entry point, compatibility, assets
├── package.json                      # Scripts and dependency definitions
├── package-lock.json                 # Locked npm dependency versions
└── env.example                       # Safe environment-variable template; no real secret
```

Keep page-only pieces next to the route that owns them. Put components in `src/components/` when they are reused or represent shared layout; put shadcn-style primitives in `src/components/ui/`. Put API request functions in `src/api/`, server route handlers in `src/app/api/`, shared application types in `src/types/`, and non-UI logic in `src/lib/`. Use the `@/` alias for imports from `src/`.

## Pages and user flows

- `/` is the welcome page. It links to **Certificate Lists** and **Request Certificate**. The sidebar is closed by default and contains the same destinations.
- The sidebar footer contains a dark/light theme toggle. It follows the OS preference on first visit and saves a later choice in browser local storage.
- `/request-certificate` renders the request form. It uses shared form controls, a reusable date picker, a purpose character counter, validation messages, and toast feedback.
- `/certificate-lists` retrieves API records, adds the browser's locally saved requests, and renders `CertificateDataTable`.
- The list filter can target Reference No., Address to, or Status. Only Issued on and Status are sortable. Issued-on sort compares parsed dates; status sort is alphabetical.
- `CertificateStatus` currently covers Done, New, Pending, Under Review, and rejected. Unknown API values display with the neutral Unknown style without hiding their original label.

## Data contracts and rules

`src/types/certificate-request.ts` is the source of truth. Reuse its types rather than defining equivalent types in pages or components.

| Type | Shape and purpose |
| --- | --- |
| `CertificateRequest` | UI row: `referenceNo`, `addressTo`, `purpose`, `issuedOn`, and `status`, all strings. |
| `CertificateRequestDto` | API response shape using the backend's snake_case property names. |
| `CertificateRequestPayload` | Submission shape: `address_to`, `purpose`, `issued_on`, and `employee_id`. |
| `CertificateRequestResponse` | Submission response contract. The backend currently spells its success field `responce`; preserve that integration spelling unless the API contract changes. |
| `FormErrors` | Optional per-field validation messages shown by the request form. |

The form currently requires an address containing Unicode letters/numbers and spaces, a purpose of at least 50 characters, an issued-on date in the future, and an employee ID containing digits only. The date picker stores an ISO date for the form and the API client submits the date in the backend's expected month/day/year format. Preserve the payload property names and formats when editing this flow.

## API and local storage flow

1. Browser code calls the same-origin endpoints through `src/api/certificate-request-api.ts` using Axios.
2. `GET /api/certificate-list` and `POST /api/request-certificate` run as server route handlers and proxy to the certificate service.
3. The route handlers read `process.env.API_KEY` and attach it to the outbound server request as the subscription key. The browser must never receive or construct the upstream credential.
4. After form submission, `certificate-request-storage.ts` also saves a local row because the backend may accept a submission without retaining it. This local copy is merged into the list with API data.
5. Local reference numbers are strings representing unused integers from 0 through 100. Allocation checks API IDs and other saved local IDs, and reconciliation updates a local ID if it later conflicts with an API response.
6. Local rows are browser-specific. They are not a replacement for server persistence and do not automatically appear in another user's browser.

Do not move validation, local-storage logic, or Axios transport into unrelated page markup. Keep those responsibilities in their existing modules. Do not read, print, or commit `.env` values.

## UI, TypeScript, and accessibility conventions

- Keep TypeScript strict and use the existing shared types. Avoid `any`, duplicate interfaces, unsafe casts, and broad changes unrelated to the request.
- Use React Server Components by default. Add `"use client"` only where browser state, events, or interactive UI require it.
- Follow the existing shadcn-style component patterns and Tailwind tokens. Reuse `FormInput`, `FormTextarea`, `DatePickerField`, `PageHeader`, `CertificateStatusBadge`, and the components under `src/components/ui/` before creating another abstraction.
- Use Lucide React for icons and the Geist font variables defined by the root layout.
- Retain labels, useful accessible names, `aria-invalid`, described-by relationships, and native form semantics when changing controls.
- `src/components/ui/button.tsx` is customized. Do not replace or restyle its implementation as part of unrelated work. When a Button renders a Link through Base UI's `render` prop, retain the correct non-native-button configuration already used by the application.
- Keep table row keys unique even when upstream reference numbers repeat. Do not add sorting to columns outside Issued on and Status unless the user requests it.
- Avoid synchronously setting React state in an effect. Use effects to synchronize with browser APIs or subscribe to external events.

## Secrets and Cloudflare Workers

- Local development reads `API_KEY` from the ignored `.env` file. `env.example` is a placeholder template only.
- Production stores `API_KEY` as an encrypted Cloudflare Worker Secret under **Worker → Settings → Variables and Secrets**. It is not a public `NEXT_PUBLIC_` value, is not stored in `wrangler.jsonc`, and must not be committed to GitHub.
- The worker runs the Next.js app through `@opennextjs/cloudflare`. `open-next.config.ts` defines the adapter; `wrangler.jsonc` sets the worker entry point, static asset binding, `nodejs_compat`, and worker name.
- The Cloudflare Worker name in `wrangler.jsonc` must match the existing Worker in the dashboard.
- For Cloudflare Workers Builds connected to GitHub, use `npx @opennextjs/cloudflare build` as the build command and `npx @opennextjs/cloudflare deploy` as the deploy command. A push to the selected production branch triggers these steps.
- `.open-next/` and `.wrangler/` are generated working data and must stay ignored. `.env*` files must stay out of source control.
- `npm run deploy` publishes a Worker deployment. Do not run it as a test or preview; run it only when deployment is explicitly part of the request. Use `npm run preview` for local Workers-runtime preview.

## Agentic development and review workflow

This repository stores policy in this file, repeatable procedures in `.agents/skills/`, and a Codex role in `.codex/`:

1. The implementation agent reads this guide, inspects the relevant existing files, and makes only the requested, minimal changes.
2. The `code-reviewer` role reviews a concrete diff in read-only mode. It checks behavior, API contracts, security boundaries, accessibility, and consistency with this guide.
3. The reviewer reports only actionable findings, with severity, file, line, impact, and evidence. It never edits files or silently fixes issues.
4. The implementation agent or developer decides which findings to address. The reviewer can then review the updated diff.
5. The human developer owns final acceptance, GitHub merge decisions, Cloudflare secrets, and production deployment.

Use the matching skill when its description applies. Keep skill descriptions specific so Codex can route tasks correctly. Keep reusable judgment/process in `SKILL.md`; add scripts only for deterministic commands that genuinely need to be repeated. Skills supplement this guide and do not override the user's request or security boundaries.

## Commands and change verification

| Command | Use |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm run lint` | Run ESLint. |
| `npm run build` | Build with Next.js. |
| `npm run preview` | Build and run a local OpenNext/Workers preview. |
| `npm run deploy` | Build and publish to the configured Cloudflare Worker. |

Choose checks based on the user's request and the scope of a change. Do not add or run tests unless the user asks for tests or verification. Never treat `npm run deploy` as a verification command because it publishes externally.

## Next.js generated instructions

The following block is managed and re-added by `next dev`. Preserve it when editing this file.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
