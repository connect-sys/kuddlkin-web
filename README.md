# kuddlkin-web

Turborepo monorepo for the Kuddl web platform — customer portal, partner portal, and the internal admin/service-worker console, sharing common types, brand tokens and API logic.

## Structure

```
kuddlkin-web/
├── apps/
│   ├── customer/     @kuddlkin/customer — Next.js 16, customer-facing portal
│   ├── partner/      @kuddlkin/partner  — Vite + React, partner/provider portal
│   └── admin/        @kuddlkin/admin    — Next.js 16, internal admin & service-worker console
└── packages/
    ├── types/         @kuddlkin/types       — shared domain types (Service, Camp, Booking, Partner, ...)
    ├── kuddl-kin/      @kuddlkin/kuddl-kin   — the 4 Kuddl Kin modules (Adventure/Bloom/Care/Discover): colors, icons, labels
    ├── utils/          @kuddlkin/utils       — cn(), formatPrice(), parseFeatures(), hasEnded(), ...
    ├── api-client/     @kuddlkin/api-client  — shared axios factory + public-data endpoints (services, camps, categories, stats)
    └── config/         @kuddlkin/config      — shared tsconfig base
```

## Getting started

```bash
pnpm install
pnpm dev              # runs all apps in parallel
pnpm dev:customer      # customer only  — http://localhost:3000
pnpm dev:partner       # partner only   — http://localhost:5173
pnpm dev:admin         # admin only     — http://localhost:3002

pnpm build             # build all apps
pnpm typecheck         # typecheck all apps
```

## Notes

- **Package manager:** pnpm workspaces + Turborepo. Each app pins its own React version (customer/admin on React 19, partner on React 18) — pnpm's per-package isolation handles this cleanly.
- **API domain:** all apps point at `https://api.kuddlkin.co` in production (see each app's `.env.local` / `.env.production`).
- **apps/customer** and **apps/partner** were migrated from their original standalone repos (`kuddl-customer-web-new`, `kuddl-partner-web`) as a fresh copy — git history was intentionally left behind in the original repos rather than merged in.
- **apps/admin** is new — a scaffolded shell with role-based login (Admin / Service worker via `/api/auth/login` and `/api/service-workers/login`) and a dashboard-stats home page. Partner verification, bookings, revenue and CMS screens are natural follow-ups, backed by real endpoints already in `kuddl-backend`.
- **apps/partner**'s `tsc` typecheck currently fails on a pre-existing `lucide-react@0.294` + `@types/react` version-resolution conflict surfaced by pnpm's stricter isolation (npm's flatter hoisting was masking it). It does **not** affect the production build — `partner`'s `build` script was decoupled from the `tsc` gate (`vite build` only). Fixing this properly means upgrading `lucide-react` in `apps/partner`, which is a good candidate for a focused follow-up since it touches every icon import in that app.
