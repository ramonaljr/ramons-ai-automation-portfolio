# Technology Stack

**Analysis Date:** 2026-10-21

## Languages

**Primary:**
- TypeScript 5.9.3 - All application code: `src/app/`, `src/components/`, `src/lib/`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`
- TSX - React components throughout `src/components/` and `src/app/`

**Secondary:**
- JavaScript (ESM) - `eslint.config.mjs`, `postcss.config.mjs` (`allowJs: true` in `tsconfig.json`)
- MDX - Blog posts in `src/content/blog/*.mdx` and case studies in `src/content/case-studies/*.mdx`, compiled through `next-mdx-remote-client` (`src/components/mdx-content.tsx`) and parsed with `gray-matter` (`src/lib/posts.ts`, `src/lib/case-studies.ts`)
- CSS - Tailwind v4 entry point `src/app/globals.css`
- Static HTML - `documentation.html` and `hire-us.html` at the repo root (not part of the Next build's routes)

## Runtime

**Environment:**
- Node.js 20+ (README requirement, `README.md`). Local workstation runs v20.19.6.
- Route handlers declare `export const runtime = 'nodejs'` (`src/app/api/*/route.ts`); no edge runtime is used.
- No `.nvmrc`, `.node-version`, or `engines` field present. Not detected.

**Package Manager:**
- pnpm (README requires 9.x; local workstation runs 9.15.9)
- Lockfile: present (`pnpm-lock.yaml`)
- `.npmrc` sets `auto-install-peers=true` and `shamefully-hoist=true`
- `pnpm-workspace.yaml` declares a single workspace package (`.`) and `ignoredBuiltDependencies` for `sharp` and `unrs-resolver`

## Frameworks

**Core:**
- Next.js 16.1.1 (App Router) - Full-stack framework, pages, route handlers, metadata, sitemap, OG image generation (`next/og`). Config in `next.config.ts`.
- React 19.2.3 / react-dom 19.2.3 - UI. `reactStrictMode: true` in `next.config.ts`.
- Motion 12.43.0 (`motion` package, imported as `motion/react`) - Landing page animation (14 import sites).
- Three.js 0.185.1 with `@react-three/fiber` 9.7.0, `@react-three/drei` 10.7.8, `@react-three/rapier` 2.2.0, `meshline` 3.3.1 - 3D card and physics, used in `src/components/ui/id-card.tsx`. Asset: `public/models/lanyard/card.glb`.
- shadcn/ui components (style config in `components.json`) built on `@base-ui/react` 1.6.0 - Primitives in `src/components/ui/`.
- next-themes 0.4.6 - Light/dark mode (`src/components/theme-provider.tsx`).

**Forms and validation:**
- react-hook-form 7.83.0 with `@hookform/resolvers` 5.5.7 and zod 4.4.3 - Contact and booking form (`src/components/contact/contact-form/`, schema in `contact-form-schema.ts`)
- sonner 2.0.7 - Toasts (`src/components/ui/sonner.tsx`)
- react-day-picker 9.14.0 and date-fns 4.4.0 - Booking calendar (`src/components/ui/calendar.tsx`, `src/lib/booking-policy.ts`)

**State:**
- zustand 5.0.14 - Client state (declared in `package.json`; import sites not located during this analysis)

**Content:**
- next-mdx-remote-client 2.1.12 - MDX rendering (RSC entry `next-mdx-remote-client/rsc`)
- gray-matter 4.0.3 - Frontmatter parsing for posts and case studies
- Content is read from the filesystem at build/request time via `fs` in `src/lib/posts.ts` and `src/lib/case-studies.ts`. No CMS.

**Testing:**
- Not detected. No test runner (Jest, Vitest, Playwright, Cypress) appears in `package.json`. No test files found under `src/`.

**Build/Dev:**
- TypeScript 5.9.3 - Type checking via `pnpm check-types` (`tsc --noEmit`), config `tsconfig.json` (strict, `moduleResolution: bundler`, path alias `@/*` to `./src/*`)
- ESLint 9.39.2 with `eslint-config-next` 16.1.1 (core-web-vitals and TypeScript presets), `@stylistic/eslint-plugin` 5.6.1, `eslint-config-prettier` 10.1.8 - Config `eslint.config.mjs`. React Compiler rules are enforced through the Next lint preset.
- Prettier 3.7.4 with `prettier-plugin-tailwindcss` 0.7.2 - Config `.prettierrc.json`
- Tailwind CSS 4.1.18 with `@tailwindcss/postcss` 4.1.18 - Config `postcss.config.mjs`; `tw-animate-css` 1.4.0 and `shadcn` 4.16.1 imported from `src/app/globals.css`
- `.editorconfig`: LF line endings, 2-space indent, UTF-8, final newline

## Key Dependencies

**Critical:**
- `next` 16.1.1 - Framework; routing, redirects (`next.config.ts`), metadata, sitemap (`src/app/sitemap.ts`), robots (`src/app/robots.ts`), OG images (`src/app/(landing)/blog/[slug]/opengraph-image.tsx`)
- `react` / `react-dom` 19.2.3 - UI runtime
- `@vercel/analytics` ^2.0.1 and `@vercel/speed-insights` ^2.0.0 - Mounted in `src/app/layout.tsx`
- `zod` 4.4.3 - Form validation
- `gray-matter` 4.0.3 - Content loading
- `next-mdx-remote-client` 2.1.12 - Blog and case-study rendering

**Infrastructure:**
- `class-variance-authority` 0.7.1, `clsx` 2.1.1, `tailwind-merge` 3.4.0 - Class composition (`src/lib/utils.ts`)
- `lucide-react` 0.562.0 - Icons
- `@types/node` 22.19.3 - Typings (local Node is 20.x)

## Fonts and Static Assets

- Geist Mono via `next/font/google` (`src/app/layout.tsx`), subset `latin`, `preload: false`. Fetched and self-hosted by Next at build time.
- Satoshi (weights 400, 500, 700, 900) via `next/font/local` from `src/assets/fonts/satoshi/*.woff2`.
- `public/` is about 74 MB, dominated by `public/films/` (7 case-study MP4s and JPG posters). Also `public/video/hero-compute.mp4`, `public/images/`, `public/models/lanyard/card.glb`, `public/ramon-vallejera-cv.pdf`, and `public/favicon/`.

## Configuration

**Environment:**
- Variables are read from `process.env` in exactly these places:
  - `N8N_BASE_URL` - `src/lib/n8n.ts` (defaults to `http://localhost:5678`). Server-only.
  - `N8N_WEBHOOK_KEY` - `src/lib/n8n.ts`. Server-only shared secret sent as `X-Portfolio-Key`.
  - `NEXT_PUBLIC_APP_URL` - `src/lib/site.ts` (optional override of the canonical origin; defaults to `https://ramonvallejera.com`).
  - `BASEPATH` - `next.config.ts` (optional `basePath`; defaults to empty).
- Template files: `.env.example` (documents `N8N_BASE_URL` and `N8N_WEBHOOK_KEY`).
- Local env file present: `.env.local` (names are `VERCEL_OIDC_TOKEN`, `N8N_BASE_URL`, `N8N_WEBHOOK_KEY`). Contents intentionally not read. Gitignored via `.env*.local` and `.env` in `.gitignore`.
- A repository variable `SITE_URL` (GitHub Actions) is used only by the uptime workflow, not by the app. See `.github/workflows/booking-uptime.yml`.

**Build:**
- `next.config.ts` - Basepath, strict mode, `pageExtensions` (js/jsx/ts/tsx), 10 permanent redirects for retired `/case-study/*` slugs
- `tsconfig.json` - Strict TypeScript, `incremental: true` (produces the untracked `tsconfig.tsbuildinfo`)
- `eslint.config.mjs` - Flat config
- `postcss.config.mjs` - Tailwind v4 PostCSS plugin
- `components.json` - shadcn/ui generator config
- `.prettierrc.json`, `.editorconfig` - Formatting
- `vercel.json` - Git deploys enabled for `main` only; permanent host redirect from `ramons-ai-automation-portfolio.vercel.app` to `https://ramonvallejera.com/$1`
- `.vercel/project.json` - Linked Vercel project metadata (project name `ramons-ai-automation-portfolio`)

**Commands (from `package.json`):**
- `pnpm dev` - `next dev`
- `pnpm build` - `next build`
- `pnpm start` - `next start`
- `pnpm lint` / `pnpm lint:fix` - ESLint
- `pnpm format` - Prettier over `src/**`
- `pnpm check-types` - `tsc --noEmit`

## Platform Requirements

**Development:**
- Node.js 20+, pnpm 9.x
- Optional local n8n instance reachable at `N8N_BASE_URL` (default `http://localhost:5678`) for the contact form, booking, availability, and chat routes to work locally. The README documents a Docker instance.

**Production:**
- Vercel (Next.js App Router, Node.js runtime for route handlers). Production domain `https://ramonvallejera.com`. Deploys from `main`.
- A publicly reachable HTTPS n8n origin set in `N8N_BASE_URL` (per `.env.example` comments).

---

*Stack analysis: 2026-10-21*
