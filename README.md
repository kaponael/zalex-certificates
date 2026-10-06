# Zalex Certificates

A Next.js app for submitting certificate requests and viewing certificate records. It uses shadcn-style UI components, with Lucide icons.

## Features

- The welcome page links to **Certificate Lists** and **Request Certificate**. The sidebar starts closed and has the same links plus a dark mode toggle.
- The theme toggle remembers the selected mode and follows the device preference on first visit.
- The request form validates its fields, uses a date picker and character counter, and shows submission feedback with toasts.
- The certificate list loads records from the API, supports filtering, and sorts by **Issued on** and **Status**. Known statuses and unknown values use badges with matching colors.
- Submitted requests are also saved in browser local storage because the API may not save them. Local records get an unused reference number from 0 to 100 and appear alongside API records.

## Main files

| File or folder | Purpose |
| --- | --- |
| `src/app/layout.tsx` | Root HTML layout, Geist fonts, collapsed sidebar, and toast provider. |
| `src/app/globals.css` | App-wide styles, colors, and light/dark theme variables. |
| `src/app/page.tsx` | Welcome page and links to the two main pages. |
| `src/app/request-certificate/page.tsx` | Certificate request form and submission flow. |
| `src/app/certificate-lists/page.tsx` | Loads and combines API and local records. |
| `src/app/certificate-lists/data-table.tsx` | Table, column filter, and sorting controls. |
| `src/app/api/request-certificate/route.ts` | Server-side proxy for submitting requests. |
| `src/app/api/certificate-list/route.ts` | Server-side proxy for retrieving requests. |
| `src/api/certificate-request-api.ts` | Axios functions used by the app to call its API routes. |
| `src/lib/certificate-request-storage.ts` | Reads, adds, and reconciles local browser records and reference numbers. |
| `src/lib/certificate-request-validation.ts` | Form validation rules. |
| `src/types/certificate-request.ts` | Shared request and form types. |
| `src/app/icon.png` | App favicon. |
| `src/components/` | Sidebar, dark mode, page header, reusable form fields, date picker, and status badges. `src/components/ui/` contains the shadcn-style UI components. |
| `wrangler.jsonc` | Cloudflare Worker name and runtime/build settings. |
| `open-next.config.ts` | Configures the OpenNext Cloudflare adapter for Next.js. |
| `.gitignore` | Keeps `.env` secrets and generated build files out of Git. |

## Run and deploy

```bash
npm install
npm run dev       # Local Next.js app at http://localhost:3000
npm run preview   # Local preview in the Cloudflare Workers runtime
npm run deploy    # Build with OpenNext and deploy to Cloudflare Workers
```

## API key handling

The browser calls this app's API routes. Those server-side routes read `process.env.API_KEY` and use it when calling the certificate API, so the key is never sent to the browser or stored in the GitHub repository.

For local development, `API_KEY` is in the ignored `.env` file. In production, it is stored as a Cloudflare Worker **Secret** named `API_KEY`. The Cloudflare Worker provides the secret to the API routes at runtime.
