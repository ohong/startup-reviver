# Repository Guidelines

## Project Structure & Module Organization
- `app/` — Next.js App Router pages, layouts, API routes (`app/api/*`). Global styles in `app/globals.css`.
- `components/` — Reusable React components; UI primitives in `components/ui/*`.
- `lib/` — Hooks and utilities (e.g., `lib/utils.ts`).
- `public/` — Static assets.
- Path aliases: import via `@/*`, `@/components`, `@/lib`, `@/components/ui`.

## Build, Test, and Development Commands
- `pnpm install` — Install dependencies.
- `pnpm dev` — Run the dev server (Turbopack) at http://localhost:3000.
- `pnpm build` — Production build.
- `pnpm start` — Start built app.
- `pnpm lint` — Run Next.js ESLint checks.
- `pnpm format` / `pnpm format:check` — Apply/check Prettier formatting.

## Coding Style & Naming Conventions
- Language: TypeScript (strict). Framework: Next.js 15, React 19, Tailwind CSS 4.
- Prettier (configured in `package.json`): no semicolons, single quotes, trailing commas.
- Indentation: Prettier defaults (2 spaces). Run `pnpm format` before pushing.
- Filenames: kebab-case for files (e.g., `deploy-banner.tsx`), directories lower-case. Components in PascalCase inside code.
- Imports: prefer path aliases; group external before internal.

## Testing Guidelines
- Tests are not yet configured. When adding:
  - Place unit tests as `*.test.ts(x)` next to sources or under `__tests__/`.
  - Recommend Vitest + Testing Library for components; Playwright for e2e.
  - Add `"test"` and `"test:watch"` scripts to `package.json` and document usage.

## Commit & Pull Request Guidelines
- Commits: short, imperative mood. Optional scope, e.g., `api: validate key`, `ui: skeleton loading`.
- PRs: include description, screenshots/GIFs for UI changes, steps to verify, and any env var or migration notes.
- Keep diffs focused; note any follow-ups. Link issues when applicable.

## Security & Configuration Tips
- Env: require `V0_API_KEY`. Optional rate limiting via `KV_REST_API_URL` and `KV_REST_API_TOKEN`.
- Use `.env.local` for local dev; do not commit secrets. Example:
  - `V0_API_KEY=...`
- Avoid editing `.next/` artifacts in commits.

## Agent-Specific Instructions
- Prefer minimal, focused changes; avoid broad refactors or renames.
- Match existing patterns in `app/` and `components/ui/`.
- Use aliases and formatting rules; run `pnpm format && pnpm lint` before proposing changes.
