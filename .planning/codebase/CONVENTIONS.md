# Coding Conventions

**Analysis Date:** 2026-10-21

## Naming Patterns

**Files:**
- Source files are kebab-case: `src/components/landing/hero-section.tsx`, `src/lib/booking-policy.ts`, `src/components/contact/contact-form/contact-form-schema.ts`.
- Exceptions to know about: `src/components/layout/Download.tsx` is PascalCase, and shadcn primitives in `src/components/ui/` are lowercase kebab-case (`button.tsx`, `id-card.tsx`).
- Next.js route files keep the framework names: `page.tsx`, `layout.tsx`, `route.ts`, `not-found.tsx`, `opengraph-image.tsx`, `sitemap.ts`, `robots.ts`.
- Dynamic route segments use brackets and route groups use parentheses: `src/app/(landing)/case-study/[slug]/page.tsx`.
- Blog and case study content is kebab-case MDX named after its slug: `src/content/blog/n8n-zapier-or-make.mdx`. The filename must match the `slug` in frontmatter.

**Functions:**
- camelCase for functions and hooks: `callN8n` in `src/lib/n8n.ts`, `consumeRateLimit` in `src/lib/rate-limit.ts`, `validateBookingSlot` in `src/lib/booking-policy.ts`, `usePrefersReducedMotion` in `src/components/landing/motion.tsx`.
- Data loaders are prefixed by intent: `getPosts`, `getPostBySlug`, `getPostMetadata` (`src/lib/posts.ts`), and `getCaseStudies`, `getCaseStudyBySlug` (`src/lib/case-studies.ts`).
- Components are PascalCase and are declared either as `function` declarations or as `const` arrow functions. Both appear. The `function` form dominates (about 120 declarations against about 35 arrow components):
  - `function Button(...)` in `src/components/ui/button.tsx`
  - `const ContactForm = ({ className }: ContactFormProps) => {` in `src/components/contact/contact-form/contact-form.tsx`
  - Use `function` for new components unless the file already uses arrows.

**Variables:**
- camelCase for locals: `rateLimit`, `clientKey`, `sortedCaseStudies`.
- SCREAMING_SNAKE_CASE for module constants and tuned numbers: `BOOKING_TIMEZONE`, `BOOKABLE_TIMES`, `CHAT_TIMEOUT_MS`, `DEFAULT_TIMEOUT_MS`, `MAX_BOOKING_DAYS` (`src/lib/booking-policy.ts`, `src/lib/n8n.ts`).
- Shared data objects and arrays are PascalCase or SCREAMING_SNAKE depending on role: `PROFILE`, `SERVICES`, `PLATFORMS`, `PROCESS`, `TESTIMONIALS` in `src/lib/portfolio.ts`. Props-like constants such as `FIELD` and `LABEL` (contact-form.tsx) are SCREAMING_SNAKE for Tailwind class strings.
- Environment variables are read at module scope: `process.env.N8N_BASE_URL` and `process.env.N8N_WEBHOOK_KEY` in `src/lib/n8n.ts`. Never use the `NEXT_PUBLIC_` prefix for these (see Environment below).

**Types:**
- PascalCase for types. Prefer `type` aliases: about 37 `type` declarations against 1 `interface` across `src/`.
  - Examples: `Post`, `PostMetadata` (`src/lib/posts.ts`), `CaseStudyMetadata` (`src/lib/case-studies.ts`), `N8nResult` (`src/lib/n8n.ts`), `ContactFormValues` (`src/components/contact/contact-form/contact-form-schema.ts`).
- Component props use a `XxxProps` name when they are non-trivial (`type ContactFormProps = { className?: string }`). Single-use inline props are fine: `export function HeroSection({ ready }: { ready?: boolean })`.
- Derive form types from schemas instead of duplicating them: `export type ContactFormValues = z.infer<typeof contactFormSchema>`.
- Use `as const` for fixed tuples, such as `BOOKABLE_TIMES` in `src/lib/booking-policy.ts`.
- Use `import type` for type-only imports. The lint rule `@typescript-eslint/consistent-type-imports` is an error. Inline `type` modifiers are also used: `import { useEffect, type CSSProperties } from 'react'`.
- No `enum` declarations exist. Use string-literal unions or `as const` objects instead.

## Code Style

**Formatting (Prettier, `.prettierrc.json`):**
- No semicolons (`"semi": false`). Only about 4 line-terminal semicolons were found across `src/`, so write none.
- Single quotes in TS and JS strings (`"singleQuote": true`) and in JSX attributes (`"jsxSingleQuote": true`). Use double quotes only when the value itself contains a single quote, as in `aria-label="Chat with Ramon's assistant"` in `src/components/landing/chat-widget.tsx`.
- `printWidth` 120. `tabWidth` 2, spaces only. LF line endings and a final newline (`.editorconfig`).
- `trailingComma` is `none`. Write no trailing commas in arrays, objects, or parameters.
- `arrowParens` is `avoid`: `sortedCaseStudies.slice(0, limit)`, `services.map(service => service.title)`. Keep parentheses for multiple parameters: `(a, b) => ...`.
- `bracketSpacing` is on: `{ ok: false }`.
- `prettier-plugin-tailwindcss` sorts Tailwind classes. It runs on `clsx(...)` and `cva(...)` calls as configured in `tailwindFunctions`. Plain `className` strings are sorted too on save.
- `npm run format` (`prettier --write "src/**/*.{js,jsx,ts,tsx}"`) covers TS and JS only.
- **Do not run Prettier on `.mdx` files.** Prettier rewrites MDX content and breaks it. The repo-wide `format` script does not cover `.mdx`, so keep it that way.

**Linting (ESLint flat config, `eslint.config.mjs`):**
- Extends `eslint-config-next/core-web-vitals`, `eslint-config-next/typescript`, and `eslint-config-prettier/flat` (Prettier owns formatting; ESLint owns logic).
- Run `pnpm lint` (`eslint`) or `pnpm lint:fix`. `pnpm check-types` runs `tsc --noEmit`.
- Rules that matter in day-to-day editing:
  - `@typescript-eslint/no-unused-vars`: error.
  - `@typescript-eslint/consistent-type-imports`: error.
  - `@typescript-eslint/no-explicit-any` and `no-non-null-assertion`: off, but `any` is rare in practice (one occurrence in `src/`). Prefer narrow types and the `unknown` boundary used in `src/lib/n8n.ts`.
  - `react/display-name`, `react/no-children-prop`, `@next/next/no-img-element`: off.
- Stylistic rules enforced through `@stylistic/eslint-plugin`:
  - Blank line after every `const`/`let`/`var` block before a non-declaration statement.
  - Blank line before every `return` statement that follows other statements.
  - Blank line before and after function, multiline-const, and multiline-block declarations.
  - Comments require a blank line before them unless they open a block, object, or array.
- `import/order` groups, in order, with a blank line between groups:
  1. Built-ins (`fs`, `path`) and then `react`, `next/**` (pathGroup "before")
  2. Third-party packages
  3. `@/**` internal imports and relative imports
- `import/newline-after-import`: exactly one blank line after the last import.
- Avoid `eslint-disable` comments. Three exist (`contact-section.tsx` twice for `react-hooks/set-state-in-effect`, `contact-form.tsx` once for `react-hooks/exhaustive-deps`). Fix the cause before adding a new one.
- **React Compiler lint:** this project enforces the React Compiler rules, which treat certain hand-written memoization as errors. Do not add new `useCallback` or `useMemo` unless the file already relies on them and the change is tested. Existing uses are in `src/components/landing/principles-section.tsx`, `src/components/landing/contact-section.tsx`, `src/components/landing/projects-section.tsx`, `src/components/ui/id-card.tsx`, and `src/components/landing/portfolio-sections.tsx`.

**Lint status:** `eslint src` completed without reported errors during this analysis. `prettier --check "src/**/*.{ts,tsx,js,jsx}"` reported 8 files with style differences (for example `src/app/api/chat/route.ts`, `src/components/landing/site-footer.tsx`, `src/components/landing/principles-section.tsx`). Run `prettier --write` on those files individually before committing, and only on source files, not MDX.

**Strictness:** `tsconfig.json` sets `"strict": true`. No `@ts-ignore` or `@ts-expect-error` comments appear in `src/`.

## Import Organization

**Order (observed in `src/app/api/booking/route.ts`, `src/components/contact/contact-form/contact-form.tsx`, `src/app/(landing)/case-study/[slug]/page.tsx`):**
1. Framework and third-party packages: `next/server`, `react`, `react-hook-form`, `zod`, `motion/react`, `lucide-react`.
2. A blank line, then internal `@/` imports, grouped by purpose.
3. Type-only imports last in their group when they come from a sibling module: `import type { ContactFormValues } from './contact-form-schema'`.

**Comment banners (optional, but used in some files):** a few larger files mark groups with comments such as `// Third-party Imports`, `// Type Imports`, `// Component Imports`, `// Util Imports`, and `// Data Imports`. Found in `src/components/contact/contact-form/contact-form.tsx`, `src/components/ui/id-card.tsx`, `src/components/ui/timeline.tsx`, and `src/app/(landing)/case-study/[slug]/page.tsx`. Keep the banner style when editing one of these files. Do not add banners to files that do not have them.

**Path Aliases:**
- `@/*` maps to `src/*` (`tsconfig.json` `paths`). Use `@/lib/...` and `@/components/...` for every cross-directory import.
- Sibling imports inside a feature folder stay relative: `./contact-form-schema`.

## Client and Server Boundaries

- Mark client components with `'use client'` as the first statement in the file, before imports. 49 files in `src/` do this.
- Route handlers under `src/app/api/` always declare:
  ```typescript
  export const runtime = 'nodejs'
  export const dynamic = 'force-dynamic'
  ```
- Server-only modules that read secrets stay out of client bundles. `src/lib/n8n.ts` is server-only, and its comments explain why it does not use `NEXT_PUBLIC_`. Never import `src/lib/n8n.ts` from a `'use client'` file.
- Client components that need a URL parameter read `window.location.search` in `useEffect` rather than `useSearchParams`, so the page stays static (see `src/components/contact/contact-form/contact-form.tsx`).

## Error Handling

**Route handlers (`src/app/api/*/route.ts`):** all responses are JSON with a stable `ok` flag and a snake_case error code.
```typescript
try {
  payload = await req.json()
} catch {
  return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 })
}

// ...

try {
  const { status, body: out } = await callN8n('portfolio-contact', { method: 'POST', body })

  return NextResponse.json(out, { status })
} catch {
  return NextResponse.json({ ok: false, error: 'upstream_unavailable' }, { status: 503 })
}
```
- Error codes in use: `bad_request` (400), `invalid` with `errors` (400), `invalid_date` (400), `rate_limited` (429 with a `Retry-After` header), `upstream_unavailable` (503), `bad_upstream_response` (502, produced by `callN8n`).
- Pass upstream status codes through when they are a real answer, not a failure. `src/app/api/booking/route.ts` forwards the 409 "slot taken" response untouched so the form can branch on it.
- Use the `catch {}` form without a binding when the error is not inspected (14 occurrences).
- Validate and bound inputs locally before forwarding. Helper pattern from `src/app/api/contact/route.ts`:
  ```typescript
  const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
  ```
  n8n validates again on its side. The app-level check bounds payload size; it is not the authority on validity.

**Library modules (`src/lib/*.ts`):**
- Content loaders catch filesystem and parse errors, log them with `console.error`, and return a safe fallback (`null` or `[]`) rather than throwing. See `getPostBySlug` in `src/lib/posts.ts` (returns `null` silently) and `getCaseStudies` in `src/lib/case-studies.ts` (logs and returns `[]`).
- Pure validators return a discriminated result object instead of throwing. `validateBookingDate` and `validateBookingSlot` in `src/lib/booking-policy.ts` return `{ valid: true, ... }` or `{ valid: false, error: ... }`.

**Client components:**
- Failures surface as `sonner` toasts. The contact form always adds an "Email me" action to failure toasts (`EMAIL_FALLBACK` in `src/components/contact/contact-form/contact-form.tsx`), so a visitor is never stuck on a broken form.
- Parse fetch bodies defensively: `const data = (await res.json().catch(() => null)) as {...} | null`.
- Throw `Error` only for programmer errors or failed invariants: `useFormField` must be used inside `<FormField>` (`src/components/ui/form.tsx`), and failed fetches for assets (`src/components/landing/work-canvas.tsx`, `src/components/landing/chat-widget.tsx`).

**Timeouts:** every outbound call to n8n goes through `callN8n`, which applies an `AbortController` timeout (`DEFAULT_TIMEOUT_MS` 15s, `CHAT_TIMEOUT_MS` 45s). Don't call `fetch` to n8n directly.

## Logging

**Framework:** `console` only. No logging library is installed.

**Patterns:**
- `console.error` with a short prefix and the value: `console.error(\`Error fetching metadata for ${filepath}:\`, error)` in `src/lib/posts.ts` and `src/lib/case-studies.ts`.
- Log in the library layer for content problems. Route handlers do not log; they return the error code.
- Don't log request bodies, emails, or any values from `process.env`.

## Comments

**When to comment:**
- Explain *why*, not *what*. The codebase uses long comments to record a decision and its reason. Example from `src/lib/n8n.ts`: "Deliberately not `NEXT_PUBLIC_` — that prefix is what would ship the URL to the browser and undo both properties."
- Describe a non-obvious constraint or a bug it prevents. Example from `src/components/landing/hero-section.tsx`: the rotating word is absolutely positioned, so a sizer element reserves the line box.
- Don't restate what the code plainly says.
- Keep comments in the same paragraph style. Put a blank line before a comment, as ESLint requires.

**JSDoc/TSDoc:**
- Use `/** ... */` on exported functions, types, and constants that carry a rule. Examples: `callN8n` and the timeout constants in `src/lib/n8n.ts`, `slotInstant` in `src/lib/booking-policy.ts`, `requestClientKey` in `src/lib/rate-limit.ts`.
- Use `@param` and `@returns` only when the name is not self-explanatory. The codebase rarely uses them.

**JSX comments:**
- Use `{/* ... */}` between JSX elements (`src/components/landing/hero-section.tsx`).
- **Do not put comments between JSX attributes.** Prettier and ESLint disagree about where they may go, so one of them breaks. Move the comment above the element.

## Function Design

**Size:** Most helpers are short. Large components exist (the landing sections under `src/components/landing/`), but logic is pulled into `src/lib/*` helpers. Put new pure logic in `src/lib/` rather than inside a component.

**Parameters:**
- Use object parameters for options with several optional fields: `callN8n(path, { method, body, query, timeoutMs })`.
- Injectable clocks: time-dependent functions take a trailing `now = Date.now()` parameter (`consumeRateLimit`, `validateBookingDate`, `manilaDateKey`). Keep this pattern for any new time logic.
- Destructure props in the signature. Use inline type for one-off props.

**Return Values:**
- Return objects for multi-part results: `{ status, body }` from `callN8n`, `{ allowed, remaining, retryAfterSeconds }` from `consumeRateLimit`.
- Return `null` for not-found on lookups, and empty arrays for lists.

## Module Design

**Exports:**
- Named exports for almost everything: lib modules, UI primitives, landing sections, and types.
- Default exports are required by Next.js for route files (`page.tsx`, `layout.tsx`, `route.ts` uses named `GET`/`POST`, `not-found.tsx`, `robots.ts`, `sitemap.ts`), and are used for a few components: `src/components/mdx-content.tsx`, `src/components/contact/contact-form/contact-form.tsx`, `src/components/ui/id-card.tsx`, `src/components/layout/custom-cursor.tsx`, and the SVG icons in `src/assets/svg/`.
- For a new component, use a named export. Add a default export only if the file is a Next.js route file or the neighbouring files in the same folder already default-export.

**Barrel Files:** Not used. Import from the specific file: `import { SERVICES } from '@/lib/portfolio'`, not from an index.

## Styling Conventions

- Tailwind CSS v4 through `@tailwindcss/postcss` (`postcss.config.mjs`). Global styles live in `src/app/globals.css`.
- Two token systems exist. Do not mix them in one component:
  - **shadcn tokens** (`bg-primary`, `text-muted-foreground`, `border-input`, `ring-ring/50`) drive the template pages and everything in `src/components/ui/`. They come from CSS variables in `globals.css`.
  - **Landing palette literals** (`text-ink`, `text-ink-3`, `bg-ground`, `border-rule`, `bg-surface`) drive `src/components/landing/*` and `src/components/contact/*`. Shared landing constants live in `src/components/landing/motion.tsx` (`DISPLAY_FONT`, `CONTAINER`, `ICON_STROKE`, `GUTTER`).
- Use `cn()` from `src/lib/utils.ts` (`twMerge(clsx(inputs))`) to combine a base class string with a `className` prop. The shadcn pattern is shown in `src/components/ui/button.tsx`, which passes `className` into `cva` as well.
- Arbitrary values are common (`text-[12px]`, `tracking-[0.25em]`, `max-w-[18ch]`). Prefer an existing token or spacing step first.
- shadcn UI primitives set `data-slot='button'` style attributes for targeting (16 files). Keep the attribute on new primitives that copy the same pattern.
- Color mixing: use `color-mix(in oklab, ...)`, not `oklch`, when blending with transparent or ground tokens (the landing palette renders pink in oklch). See `src/app/globals.css`.

## Content Files (MDX Frontmatter)

**Blog posts (`src/content/blog/*.mdx`) and case studies (`src/content/case-studies/*.mdx`):**
- YAML frontmatter with single-quoted strings: `title: 'n8n, Zapier or Make: how I actually choose'`.
- **Escape apostrophes by doubling them inside single quotes** (`'Ramon''s process'`). A single unescaped apostrophe breaks the YAML and the case study page renders blank without an error.
- Arrays are inline: `tags: ['n8n', 'Zapier', 'Make']`.
- `slug` must match the filename. `publishedAt` and `updatedAt` are `YYYY-MM-DD`.
- Use `needsReview: true` on seed or draft copy. Remove it only after the author has rewritten the voice.
- Comments in frontmatter use `#` and are allowed (see `src/content/blog/n8n-zapier-or-make.mdx`).
- Reading time is measured by `readingTimeFor` in `src/lib/posts.ts`. Do not hand-write `readingTime`.

## Where Conventions Are Not Enforced

- No pre-commit hook or CI lint job is configured. `.github/workflows/booking-uptime.yml` only checks the booking endpoint; it does not run lint, types, or tests.
- The `format` script and Prettier check do not cover `.mdx` or `.css`. Format CSS by hand, matching surrounding code.

---

*Convention analysis: 2026-10-21*
