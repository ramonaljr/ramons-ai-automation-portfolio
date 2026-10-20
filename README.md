# Ramon A. Vallejera, Jr. — AI Automation Portfolio

> **AI Automation Specialist** based in the Philippines. 10 years of finance & accounting domain expertise combined with an MBA, building autonomous n8n workflows, Claude & OpenAI agent integrations, and Python business automations.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![pnpm](https://img.shields.io/badge/pnpm-9.x-orange.svg)](https://pnpm.io/)

---

## ⚡ Highlights & Specializations

- **n8n AI Agents & Workflow Automation**: Production-grade n8n automations (cloud & self-hosted) with error handling, triggers, and webhook integrations.
- **Financial & Accounting Process Automation**: Automated invoice processing, vendor reconciliations, reporting workbooks, and multi-step approval workflows (QuickBooks, SAP, Sage, Excel).
- **Claude, OpenAI & Gemini Integration**: Prompt engineering, structured document extraction, and AI agent architectures.
- **Business Systems & API Integrations**: End-to-end sync across Google Workspace, Airtable, Telegram, Gmail, and custom REST APIs.

---

## 🛠 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
- **Styling & UI**: [Tailwind CSS v4](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/), [Motion](https://motion.dev/)
- **3D Graphics & Physics**: [Three.js](https://threejs.org/), [@react-three/fiber](https://r3f.docs.pmnd.rs/), [@react-three/rapier](https://github.com/pmndrs/react-three-rapier)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Package Manager**: [pnpm](https://pnpm.io/)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [pnpm 9+](https://pnpm.io/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ramonaljr/ramons-ai-automation-portfolio.git
   cd ramons-ai-automation-portfolio
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Start the development server:**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to view the portfolio.

4. **Build for production:**
   ```bash
   pnpm build
   pnpm start
   ```

---

## 📬 Contact & Connect

- **GitHub**: [@ramonaljr](https://github.com/ramonaljr)
- **Location**: Philippines

## Deployment

Hosted on Vercel, deployed from `main`.

- **Git deploys** are enabled for `main` only via `vercel.json`. Feature
  branches do not consume a build. The repo shipped with
  `"deploymentEnabled": false`, which silently ignored every push — if
  deployments stop firing, check that flag first.
- The production domain is **ramonvallejera.com**. Everything that emits an
  absolute URL — canonicals, Open Graph, sitemap, robots, JSON-LD — reads it
  through `src/lib/site.ts`, whose fallback is that domain. Set
  **`NEXT_PUBLIC_APP_URL`** only to override it for a preview or staging
  deploy; it is inlined at build time, so changing it needs a fresh build.
- If the domain ever changes, update the fallback in `src/lib/site.ts` and the
  `SITE_URL` default in `.github/workflows/booking-uptime.yml`.
