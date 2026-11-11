# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Framework guidance

This is a Next.js **16.3.5** App Router application with React **19.2.8** and strict TypeScript. Follow `AGENTS.md`: before changing framework-related code, read the relevant guide under `node_modules/next/dist/docs/` rather than assuming older Next.js APIs. In particular, this app uses async route `params`, async `cookies()`/`headers()`, and `src/proxy.ts` rather than the deprecated middleware convention.

## Commands and local setup

Use npm (`package-lock.json` is committed). Next.js requires Node.js >=20.9.0.

| Command | Purpose |
| --- | --- |
| `npm ci` | Install the locked dependencies. |
| `npm run dev` | Open http://localhost:3000 and start development with the outbound HTTP proxy described below. |
| `npm run devs` | Open https://fishing-market-riba.com and start development on that hostname, port 443, with experimental HTTPS and the outbound proxy. The hostname must resolve locally. |
| `npm run build` | Create a production build. |
| `npm start` | Serve the production build. |
| `npm run lint` | Run ESLint (Next core-web-vitals and TypeScript rules). |
| `npx eslint src/path/to/file.tsx` | Lint one file. |
| `npx next typegen && npx tsc --noEmit` | Generate Next route/layout types, then type-check without building. The layout uses generated `LayoutProps`. |
| `npx drizzle-kit generate` | Generate migrations from `src/db/schema.ts` using `drizzle.config.ts`. |
| `npx drizzle-kit migrate` | Apply migrations to the configured PostgreSQL database. |
| `npx drizzle-kit studio` | Open the database browser. |

There is **no configured test runner, test script, or automated test suite**, so there is no single-test command. `src/actions/testRequest.ts` is a Telegram JWKS diagnostic server action, not a test.

The two npm development scripts use Windows `start`. To avoid the browser-launch command in another shell while retaining the same proxy setup, run:

```sh
node --import ./scripts/dev-proxy.mjs ./node_modules/next/dist/bin/next dev
```

`scripts/dev-proxy.mjs` installs an Undici global dispatcher routing outbound HTTP/HTTPS through **http://127.0.0.1:12334**, excluding localhost/loopback. That local proxy must be running for proxied requests to work. `npx next dev` bypasses both the browser launch and this proxy preload. Build/start scripts do not preload it either. This outbound-network proxy is unrelated to the Next.js authentication proxy in `src/proxy.ts`.

Environment variables used by the application (local `.env` files are ignored; no example is committed):

- `DATABASE_URL`: PostgreSQL connection string; required when the DB module loads and by Drizzle Kit.
- `NEXT_PUBLIC_CLIENT_ID_TELEGRAM`: Telegram OAuth client ID, used by both the login widget and server-side audience validation.
- `TELEGRAM_JWKS_URL`: endpoint for verifying Telegram ID-token signatures.
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`: distinct signing secrets, each at least 32 UTF-8 bytes.
- `LOGIN_SECRET_KEY`: selects the login URL, `/login/<LOGIN_SECRET_KEY>`.
- `IMGBB_API_KEY`: required for image uploads.

The README is mostly create-next-app boilerplate: its basic npm development command applies, but actual pages live under `src/app`, and fonts are local Roboto files rather than the README's claimed Geist/`next/font` setup.

## Architecture and data flow

The product is a Russian-language fishing-gear marketplace. `src/app` contains server-rendered pages and JSON route handlers; there is no separate backend service. `@/*` resolves to `src/*`.

### Database and server boundaries

- `src/db/schema.ts` defines PostgreSQL users, sessions, products, favorites, and enums. `src/db/index.ts` exposes Drizzle over a globally reused `pg.Pool` for hot reload (five connections, short query/connection timeouts). DB access and the query/auth libraries are marked `server-only`.
- `src/lib/products.ts` and `src/lib/users.ts` provide shared reads and profile updates. `src/actions/*` contains server actions for Telegram login/logout, product mutations, and favorites. Browser components call server actions for product/favorite changes; profile edits instead use `PATCH /api/profile`.
- Drizzle Kit reads `src/db/schema.ts`, targets the `public` schema, and writes timestamped migration directories under `drizzle/`. Earlier directories include snapshots; later changes include hand-written SQL-only migrations, so inspect migration history as well as the current schema when changing it.
- Users and products use UUIDs. Telegram IDs are native `bigint`; product prices map PostgreSQL `bigint` to JavaScript numbers and mutations require nonnegative safe integers. Display names (`username`) are not unique; Telegram IDs are. Favorites have a composite `(userId, productId)` primary key, and foreign keys cascade on deletion.

### Catalog and pagination

Home, category, own-products, favorites, and public-user pages load their initial product page directly through `getInitialProductPage()` in `src/lib/products.ts`. They pass it into the client `InfiniteProductGrid`, which uses an intersection observer to request subsequent JSON pages from the appropriate `/api/products`, `/api/profile/products`, `/api/profile/favorites`, or `/api/user/[id]/products` endpoint. All those routes reuse `getProductPage()` and the `ProductPage` shape in `src/types/product-catalog.ts`: `{ items, nextCursor, hasMore }`.

Pagination is **keyset-based**, 20 products per page, ordered by normalized `created_at DESC, id DESC`. The opaque base64url cursor contains the UUID and a UTC timestamp with **six fractional digits**, produced by PostgreSQL `to_char`; preserve that microsecond precision rather than round-tripping through a JavaScript `Date`. Null creation dates normalize to the Unix epoch. The cursor expression/order is tied to the product index and its migration.

Categories are `new`, `used`, and `free`; **free means `price === 0`**, not a separate condition enum. Shared query filters distinguish `viewerId` (favorite decoration), `sellerId`, and `favoritedBy`. Keep initial server loads and subsequent API loads aligned when adding filters. The current search input/dropdown is presentation-only; there is no implemented search query/API contract.

Initial catalog query failures render `ProductCatalogError`; product-detail failures reach the product error boundary. The infinite grid has its own abort/timeout/retry handling for later-page failures.

### Authentication and authorization

`TelegramAuthButton` loads Telegram's OAuth script and submits only the ID token to `handleTelegramAuth`. The server verifies Telegram issuer/audience/signature through `jose`/remote JWKS, upserts the user by Telegram ID, creates a DB session, and sets HTTP-only `access_token` and `refresh_token` cookies. Access tokens last 15 minutes; refresh tokens last 30 days. The DB stores a SHA-256 refresh-token hash, not the token itself.

`src/proxy.ts` checks the access token before rendering; if needed, it rotates the refresh token and forwards the new cookies to both the current request and response. `/api/auth/refresh` exposes the same rotation explicitly and is skipped by the proxy. Rotation uses a conditional DB update to prevent concurrent reuse of the stored hash.

The proxy **does not block unauthenticated requests**. Pages, route handlers, and actions enforce their own access rules. `getAccessSession()` verifies access-token claims without checking DB session existence; product/favorite mutations and image upload additionally require an unexpired DB session. Preserve that distinction when working on authorization.

Only `/login/[secretKey]` is implemented, guarded by `LOGIN_SECRET_KEY`; there is no plain `/login` page even though the add-product page currently redirects there. Product editing is owner-only; deletion also permits moderator/admin/superadmin roles. `getProductById()` returns separate `isOwner` and `canManage` flags, not interchangeable permissions.

### Forms, images, and UI

`ProductForm` is the shared client create/edit form, using React Hook Form and shared types from `src/types/product-form.ts`. Server pages supply server-action callbacks that save and redirect. Form specifications are `{ name, value }[]`, while persisted specifications are a JSONB string-value object; product actions perform the conversion and authoritative validation. Product writes use `revalidatePath`.

`ImgLoader` uploads files to the authenticated `/api/image-upload` route, which forwards them to ImgBB. Product records store only returned image URLs. The upload route accepts JPEG/PNG/WebP, up to 20 files per request and 32 MiB each; the form also caps products at 20 images. Removing images from a form only removes URLs/previews, not the remote ImgBB files.

UI styling uses co-located Sass modules with global styles/fonts imported by the root layout. Shared form controls and Ariakit-based popups live under `src/components/ui`. SVGs are imported as React components through SVGR, configured for both Turbopack and Webpack in `next.config.ts`. That config also restricts optimized remote images to `ir.ozone.ru` and `i.ibb.co`; account for this when changing image hosts.
