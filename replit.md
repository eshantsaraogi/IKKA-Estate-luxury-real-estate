# IKKA Estate

IKKA Estate is a quiet-luxury property advisory experience for exceptional homes across Dubai and Delhi.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/ikka-estate/src/App.tsx` — public website routes, shared shell, property discovery, detail views, journal, and enquiry forms.
- `artifacts/ikka-estate/src/index.css` — editorial visual system and responsive layout tokens.
- `artifacts/ikka-estate/public/ikka-logo-cropped.png` — cropped transparent version of the supplied IKKA Estate mark.
- `lib/api-spec/openapi.yaml` — source of truth for property and enquiry API contracts.
- `artifacts/api-server/src/routes/properties.ts` — published property listing/detail API and clearly marked demo seed content.
- `artifacts/api-server/src/routes/enquiries.ts` — persisted enquiry submission API.
- `lib/db/src/schema/` — Drizzle schema for properties and enquiries.

## Architecture decisions

- The frontend is a Vite React artifact at `/` and the existing Express service owns `/api`, with generated clients keeping contracts aligned.
- Demo properties are seeded lazily on first property read so a fresh development database is immediately usable without presenting unverified facts as live inventory.
- Image bytes are not stored in PostgreSQL; properties keep image URLs and the media layer can later be swapped to object storage.
- The supplied square logo is cropped and made transparent for header use rather than displaying the original white canvas.

## Product

- Visitors can browse a curated collection, filter by city/type/availability, search by neighbourhood or name, and open property detail pages.
- Visitors can submit general or property-specific enquiries; submissions are persisted in PostgreSQL.
- Public routes cover home, properties, Dubai, Delhi, about, contact, journal articles, legal pages, and a considered not-found experience.
- Demo content is explicitly labelled for replacement before launch.

## User preferences

- Preserve the quiet-luxury direction: ivory/parchment surfaces, deep green, editorial serif typography, minimal UI, and no generic real-estate portal patterns.

## Gotchas

- The frontend build expects the artifact workflow's `PORT` and `BASE_PATH`; for a manual build use `PORT=22190 BASE_PATH=/`.
- API changes require regenerating the typed client with `pnpm --filter @workspace/api-spec run codegen`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
