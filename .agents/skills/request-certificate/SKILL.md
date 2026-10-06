---
name: request-certificate
description: Implement or change the Zalex Certificates request form, validation, date picker, API submission, toast feedback, or local-record behavior while preserving existing types and reusable controls.
---

# Request-certificate workflow

Use this skill when changing the request form or any part of its submit-and-save flow.

## Inspect first

Read `AGENTS.md`, then inspect the current versions of:

- `src/app/request-certificate/page.tsx`
- `src/lib/certificate-request-validation.ts`
- `src/lib/certificate-request-storage.ts`
- `src/api/certificate-request-api.ts`
- `src/types/certificate-request.ts`
- `src/components/form-fields.tsx`
- `src/components/date-picker-field.tsx`
- `src/app/api/request-certificate/route.ts`

Read the relevant local Next.js guide in `node_modules/next/dist/docs/` before writing application code. The framework version is pinned in `package.json`, and its local documentation is the authority for version-specific APIs.

## Existing request contract

- Reuse `CertificateRequest`, `CertificateRequestPayload`, `CertificateRequestResponse`, and `FormErrors` from the shared types file.
- The submitted JSON uses `address_to`, `purpose`, `issued_on`, and `employee_id`.
- The form date is represented as `yyyy-MM-dd`; convert it to the API's month/day/year string before submission.
- The current rules require a non-empty address containing letters/numbers/spaces, a purpose of at least 50 characters, a future date, and a numeric employee ID.
- The external service currently responds with the property `responce`. Do not silently rename its contract.

## Existing component and data flow

- Use `FormInput` and `FormTextarea` from `src/components/form-fields.tsx` for consistent labels, errors, descriptions, and counters.
- Use `DatePickerField` from `src/components/date-picker-field.tsx`; preserve its future-date restriction and close-on-selection behavior.
- Submit through `submitCertificateRequest` in `src/api/certificate-request-api.ts`. Do not call the upstream API directly from browser code.
- Keep reusable validation in `src/lib/certificate-request-validation.ts` and local browser persistence in `src/lib/certificate-request-storage.ts`.
- The local row is saved even when the backend does not retain it. Its number is selected from the unused 0–100 range after checking API and local records.
- Keep the success, warning, and error toast outcomes meaningful when either API submission or API-list retrieval fails.

## Change rules

1. Make the smallest change that meets the request. Avoid unrelated form/layout refactors.
2. Preserve strong typing and form accessibility, including field labels, `aria-invalid`, and `aria-describedby` links.
3. Do not expose or log `API_KEY`; the server route owns credentialed requests.
4. Keep character counts tied to the user-visible text and preserve trimming/validation semantics unless requirements change.
5. Do not introduce another copy of existing field controls, validation helpers, API transport, or request types.
6. Summarize changed files and the resulting behavior. Run tests only if the user asked for tests or verification.
