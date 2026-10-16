# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

"Рыбацкая барахолка" (crimea-fishing): a Russian-language marketplace for fishing tackle. Next.js 16 App Router, React 19, TypeScript, PostgreSQL via Drizzle ORM, SCSS modules. All user-facing strings and error messages are in Russian.

## Commands

- `npm run dev`: dev server on http://localhost:3000. Windows-only (`start` opens the browser). Preloads `scripts/dev-proxy.mjs`, which routes all server-side `fetch` through an HTTP proxy at `127.0.0.1:12334` (needed to reach Telegram JWKS and imgbb). If that proxy isn't running, outbound requests from the server fail.
- `npm run devs`: HTTPS dev on `https://fishing-market-riba.com` port 443 (local hosts entry plus certs in `certificates/`). Needed for Telegram login, which requires the real domain.
- `npm run build` / `npm run start`
- `npm run lint`: ESLint flat config (next core-web-vitals + typescript)
- Migrations: `npx drizzle-kit generate` / `npx drizzle-kit migrate` (reads `DATABASE_URL` from `.env`; schema in `src/db/schema.ts`, output in `drizzle/`).

There is no test framework.

## Environment (`.env`)

`DATABASE_URL`, `TELEGRAM_JWKS_URL`, `NEXT_PUBLIC_CLIENT_ID_TELEGRAM`, `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` (each ≥32 bytes, must differ), `IMGBB_API_KEY`, `LOGIN_SECRET_KEY`.

## Architecture

Path alias `@/*` → `src/*`. Server-only modules (`src/db`, `src/lib/*`) import `"server-only"`.

### Auth (Telegram OIDC + own JWT sessions)
- Login page is hidden at `/login/[secretKey]`; it 404s unless the segment equals `LOGIN_SECRET_KEY`.
- `TelegramAuthButton` → server action `handleTelegramAuth` (`src/actions/auth.ts`): verifies the Telegram `id_token` against the remote JWKS, upserts `users` by `telegram_id`, creates a `sessions` row, and sets httpOnly cookies.
- `src/lib/auth.ts` holds everything token-related: HS256 access (15 min) and refresh (30 days) JWTs with `sub`=userId and a `sessionId` claim. Only the SHA-256 hash of the refresh token is stored in `sessions.refresh_token_hash`. Rotation compare-and-swaps on the old hash, so a reused refresh token fails.
- `src/proxy.ts` is the Next 16 replacement for `middleware.ts`. On every request with an invalid or expired access token, it rotates the refresh token and writes the new cookies to both the forwarded request and the response, so server components see a valid session in the same request. `/api/auth/refresh` is the explicit rotation endpoint.
- Server code reads the user with `getAccessSession()` (cookie JWT check only, no DB hit). Mutations that need a live session, such as `setFavorite`, also check the `sessions` row.

### Product catalog
- `src/lib/products.ts` does keyset pagination (20 per page) ordered by `(coalesce(created_at, epoch), id) DESC`, backed by the expression index `products_created_at_id_idx`. The cursor is base64url JSON `{createdAt (microsecond ISO), id}` and is strictly validated. Categories: `free` (price = 0), `new`, `used` (the `condition` enum). `isFavorite` is computed per user with an `exists` subquery.
- Server pages (`/`, `/products/[type]`) render the first page via `getInitialProductPage` → `ProductCatalog`. The client component `InfiniteProductGrid` then fetches `GET /api/products?cursor=&category=`, with timeout and retry/backoff.
- `ProductTile` props (`src/components/ProductTile`) are the shared item shape (`ProductPage` in `src/types/product-catalog.ts`). `src/app/data.ts` is old mock data.

### Other
- `POST /api/image-upload` proxies images (field `images`, max 10, 32 MB each) to imgbb. It currently has no auth check.
- `next/image` only allows remote images from `ir.ozone.ru` (`next.config.ts`).
- SVGs import as React components via `@svgr/webpack`, configured for both Turbopack and webpack.
- Components live one per folder: `Name/Name.tsx` + `Name/Name.module.scss`, using `clsx` (imported as `cn`). Generic primitives are in `src/components/ui/`. Accessible UI primitives come from `@ariakit/react`, and sliders use `swiper`.
- DB pool (`src/db/index.ts`) is cached on `globalThis` for HMR, with max 5 connections and 3 s query/statement timeouts.
